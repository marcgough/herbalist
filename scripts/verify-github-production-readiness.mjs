import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const args = process.argv.slice(2)
const argSet = new Set(args)

const getArg = (name, fallback) => {
  const index = args.indexOf(name)
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback
}

const repository = getArg('--repo', 'marcgough/herbalist')
const environmentName = getArg('--environment', 'production')
const strict = argSet.has('--strict')
const skipReleaseEvidence = argSet.has('--skip-release-evidence')
const workflowPath = '.github/workflows/production-deploy.yml'
const requiredSecretNames = [
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_D1_DATABASE_ID',
  'FEED_ADMIN_TOKEN',
  'KIE_API_KEY',
  'MEDIA_ADMIN_TOKEN',
]

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const exists = (path) => existsSync(resolve(root, path))

const getToken = () => {
  if (process.env.GITHUB_TOKEN?.trim()) {
    return process.env.GITHUB_TOKEN.trim()
  }
  if (process.env.GH_TOKEN?.trim()) {
    return process.env.GH_TOKEN.trim()
  }

  try {
    return execFileSync('gh', ['auth', 'token'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

const token = getToken()
const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'Herbalisti-production-readiness-verifier',
}
if (token) {
  headers.Authorization = `Bearer ${token}`
}

const fetchJson = async (path, { allow404 = false } = {}) => {
  const response = await fetch(`https://api.github.com/repos/${repository}${path}`, { headers })
  if (allow404 && response.status === 404) {
    return null
  }
  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status} ${response.statusText} for ${path}`)
  }
  return response.json()
}

const runReleaseEvidence = () => {
  if (skipReleaseEvidence) {
    return {
      status: 'skipped',
      detail: 'Skipped by --skip-release-evidence.',
    }
  }

  try {
    const output = execFileSync(process.execPath, ['scripts/verify-github-release-evidence.mjs', '--repo', repository], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    const parsed = JSON.parse(output)
    return {
      status: 'pass',
      commit: parsed.commit,
      ciRunId: parsed.ciRun?.id,
      manualReleaseRunId: parsed.manualReleaseRun?.id,
      artifactId: parsed.artifact?.id,
    }
  } catch (error) {
    return {
      status: 'fail',
      detail: String(error.message ?? error).slice(0, 500),
    }
  }
}

const check = (id, status, detail) => ({ id, status, detail })
const secretNamesFrom = (payload) => new Set((payload?.secrets ?? []).map((secret) => secret.name))

const checks = []
let workflows = []
let environments = []
let productionEnvironment = null
let repositorySecretNames = new Set()
let environmentSecretNames = new Set()
let apiError = ''

checks.push(
  check(
    'local-workflow-file',
    exists(workflowPath) ? 'pass' : 'fail',
    exists(workflowPath) ? `${workflowPath} exists.` : `${workflowPath} is missing.`,
  ),
)

if (!token) {
  apiError = 'No GitHub token is available. Set GITHUB_TOKEN/GH_TOKEN or authenticate gh for read-only readiness checks.'
  checks.push(check('github-authentication', 'fail', apiError))
} else {
  checks.push(check('github-authentication', 'pass', 'GitHub API token is available for metadata reads.'))

  try {
    const workflowPayload = await fetchJson('/actions/workflows')
    workflows = workflowPayload.workflows ?? []
    const environmentPayload = await fetchJson('/environments')
    environments = environmentPayload.environments ?? []
    const repositorySecretPayload = await fetchJson('/actions/secrets')
    repositorySecretNames = secretNamesFrom(repositorySecretPayload)
    productionEnvironment = environments.find((environment) => environment.name === environmentName) ?? null

    if (productionEnvironment) {
      const environmentSecretPayload = await fetchJson(`/environments/${encodeURIComponent(environmentName)}/secrets`, {
        allow404: true,
      })
      environmentSecretNames = secretNamesFrom(environmentSecretPayload)
    }
  } catch (error) {
    apiError = String(error.message ?? error)
    checks.push(check('github-api-read', 'fail', apiError))
  }
}

const productionWorkflow = workflows.find((workflow) => workflow.path === workflowPath)
checks.push(
  check(
    'production-workflow-active',
    productionWorkflow?.state === 'active' ? 'pass' : 'fail',
    productionWorkflow?.state === 'active'
      ? 'Herbalisti Production Deploy workflow is active.'
      : 'Herbalisti Production Deploy workflow is missing or not active.',
  ),
)

checks.push(
  check(
    'production-environment',
    productionEnvironment ? 'pass' : 'fail',
    productionEnvironment
      ? 'GitHub production environment exists.'
      : 'GitHub production environment is missing.',
  ),
)

const protectionRules = productionEnvironment?.protection_rules ?? []
checks.push(
  check(
    'production-environment-protection',
    protectionRules.length > 0 ? 'pass' : 'warning',
    protectionRules.length > 0
      ? `Production environment has ${protectionRules.length} protection rule(s).`
      : 'Production environment has no visible protection rules; add reviewer protection before final dispatch if available on this repository plan.',
  ),
)

const secretScopes = Object.fromEntries(
  requiredSecretNames.map((name) => [
    name,
    {
      repository: repositorySecretNames.has(name),
      environment: environmentSecretNames.has(name),
      present: repositorySecretNames.has(name) || environmentSecretNames.has(name),
    },
  ]),
)
const missingSecretNames = requiredSecretNames.filter((name) => !secretScopes[name].present)
checks.push(
  check(
    'required-secret-names',
    missingSecretNames.length === 0 ? 'pass' : 'fail',
    missingSecretNames.length === 0
      ? 'All required production workflow secret names are present in repository or production environment secrets.'
      : `Missing required production workflow secret names: ${missingSecretNames.join(', ')}.`,
  ),
)

const releaseEvidence = runReleaseEvidence()
checks.push(
  check(
    'exact-release-evidence',
    releaseEvidence.status === 'pass' || releaseEvidence.status === 'skipped' ? releaseEvidence.status : 'fail',
    releaseEvidence.status === 'pass'
      ? `Fresh CI/manual-release evidence exists for ${releaseEvidence.commit}.`
      : releaseEvidence.detail,
  ),
)

const blockers = checks.filter((item) => item.status === 'fail')
const warnings = checks.filter((item) => item.status === 'warning')
const status = blockers.length
  ? 'needs-github-production-setup'
  : warnings.length
  ? 'ready-with-warnings'
  : 'ready-for-guarded-production-dispatch'

const result = {
  status,
  strict,
  repository,
  environment: environmentName,
  workflow: {
    name: productionWorkflow?.name ?? null,
    path: workflowPath,
    state: productionWorkflow?.state ?? null,
  },
  productionEnvironment: productionEnvironment
    ? {
        name: productionEnvironment.name,
        htmlUrl: productionEnvironment.html_url,
        protectionRuleCount: protectionRules.length,
      }
    : null,
  requiredSecretNames,
  secretScopes,
  missingSecretNames,
  checks,
  releaseEvidence,
  nextActions:
    status === 'ready-for-guarded-production-dispatch'
      ? ['Dispatch Herbalisti Production Deploy only after Cloudflare DNS/domain approval is ready.']
      : [
          'Create or configure the GitHub production environment for marcgough/herbalist.',
          'Add the required GitHub secret names without exposing values in chat, docs, or logs.',
          'Run npm run verify:github-production-readiness again.',
        ],
  safeToRun:
    'Reads GitHub workflow, environment, secret-name, and release-run metadata only. It does not create environments, set secrets, deploy, mutate DNS, create Cloudflare resources, download artifacts, call paid APIs, or print secret values.',
}

console.log(JSON.stringify(result, null, 2))

assert(!JSON.stringify(result).match(/sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]+/i))

if (strict && blockers.length > 0) {
  process.exitCode = 1
}
