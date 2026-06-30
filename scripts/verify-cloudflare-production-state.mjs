import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const contract = JSON.parse(readFileSync(resolve(root, 'docs/production-environment-contract.json'), 'utf8'))

const localWranglerCli = resolve(root, 'node_modules', 'wrangler', 'bin', 'wrangler.js')
const wranglerCommand = existsSync(localWranglerCli) ? process.execPath : process.platform === 'win32' ? 'wrangler.cmd' : 'wrangler'
const wranglerBaseArgs = existsSync(localWranglerCli) ? [localWranglerCli] : []

const secretValuePattern =
  /(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]+|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i

const stripAnsi = (value) => String(value ?? '').replace(/\u001b\[[0-9;]*m/g, '')
const scrub = (value) =>
  stripAnsi(value)
    .replace(/sk-[A-Za-z0-9_-]{20,}/gi, '[redacted-secret]')
    .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/gi, '[redacted-token]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted-token]')
    .replace(/-----BEGIN [A-Z ]+PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+PRIVATE KEY-----/gi, '[redacted-private-key]')
    .trim()

const runWrangler = (label, commandArgs) => {
  const result = spawnSync(wranglerCommand, [...wranglerBaseArgs, ...commandArgs], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      NO_COLOR: '1',
      WRANGLER_SEND_METRICS: 'false',
    },
  })

  return {
    label,
    command: `wrangler ${commandArgs.join(' ')}`,
    ok: result.status === 0 && !result.error,
    status: result.status,
    stdout: scrub(result.stdout),
    stderr: scrub(result.stderr),
    error: result.error?.message ? scrub(result.error.message) : '',
  }
}

const parseJsonOutput = (value) => {
  const text = scrub(value)
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    const starts = ['[', '{']
      .map((char) => text.indexOf(char))
      .filter((index) => index >= 0)
      .sort((a, b) => a - b)
    for (const start of starts) {
      for (const endChar of [']', '}']) {
        const end = text.lastIndexOf(endChar)
        if (end > start) {
          try {
            return JSON.parse(text.slice(start, end + 1))
          } catch {
            // Try the next boundary.
          }
        }
      }
    }
  }

  return null
}

const asArray = (value) => {
  if (Array.isArray(value)) {
    return value
  }

  for (const key of ['result', 'items', 'databases', 'projects', 'deployments', 'secrets']) {
    if (Array.isArray(value?.[key])) {
      return value[key]
    }
  }

  return []
}

const readName = (item) => item?.name ?? item?.project_name ?? item?.database_name ?? item?.id ?? ''
const hasName = (items, name) => items.some((item) => readName(item) === name)
const namesFromJson = (value) =>
  asArray(value)
    .map((item) => item?.name ?? item?.key ?? item?.binding ?? '')
    .filter(Boolean)

const domainNamesFromProject = (project) => {
  const raw = [
    project?.domains,
    project?.custom_domains,
    project?.aliases,
    project?.deployment_configs?.production?.domains,
    project?.subdomain,
  ].flatMap((value) => (Array.isArray(value) ? value : value ? [value] : []))

  return raw
    .map((value) => (typeof value === 'string' ? value : value?.name ?? value?.domain ?? value?.hostname ?? ''))
    .filter(Boolean)
}

const check = (id, status, detail) => ({ id, status, detail })
const checks = []
const commandSummaries = []

const versionProbe = runWrangler('wrangler-version', ['--version'])
const wranglerVersion = versionProbe.ok ? versionProbe.stdout.split(/\s+/).find((part) => /^\d+\.\d+\.\d+$/.test(part)) ?? null : null
commandSummaries.push({ label: versionProbe.label, ok: versionProbe.ok })
checks.push(
  check(
    'wrangler-cli',
    versionProbe.ok ? 'pass' : 'fail',
    versionProbe.ok ? `Wrangler ${wranglerVersion ?? 'CLI'} is available.` : 'Wrangler CLI is not available.',
  ),
)

const whoami = runWrangler('wrangler-whoami', ['whoami'])
commandSummaries.push({ label: whoami.label, ok: whoami.ok })
const authenticated = whoami.ok
checks.push(
  check(
    'cloudflare-authentication',
    authenticated ? 'pass' : 'fail',
    authenticated
      ? 'Wrangler can read Cloudflare account state.'
      : 'Wrangler is not authenticated in this shell; run an interactive login or provide CLOUDFLARE_API_TOKEN before Cloudflare state can be read.',
  ),
)

let d1Databases = []
let pagesProjects = []
let pagesDeployments = []
let workerDeployments = []
let workerSecretNames = []
let pagesSecretNames = []

if (authenticated) {
  const d1List = runWrangler('d1-list', ['d1', 'list', '--json'])
  commandSummaries.push({ label: d1List.label, ok: d1List.ok })
  const d1Payload = parseJsonOutput(d1List.stdout)
  d1Databases = asArray(d1Payload)
  checks.push(
    check(
      'd1-database',
      d1List.ok && hasName(d1Databases, contract.project.d1Database) ? 'pass' : 'fail',
      d1List.ok && hasName(d1Databases, contract.project.d1Database)
        ? `Cloudflare D1 database ${contract.project.d1Database} is visible.`
        : `Cloudflare D1 database ${contract.project.d1Database} is not visible to Wrangler.`,
    ),
  )

  const pagesList = runWrangler('pages-project-list', ['pages', 'project', 'list', '--json'])
  commandSummaries.push({ label: pagesList.label, ok: pagesList.ok })
  const pagesPayload = parseJsonOutput(pagesList.stdout)
  pagesProjects = asArray(pagesPayload)
  const pagesProject = pagesProjects.find((project) => readName(project) === contract.project.pagesProject) ?? null
  checks.push(
    check(
      'pages-project',
      pagesList.ok && pagesProject ? 'pass' : 'fail',
      pagesList.ok && pagesProject
        ? `Cloudflare Pages project ${contract.project.pagesProject} is visible.`
        : `Cloudflare Pages project ${contract.project.pagesProject} is not visible to Wrangler.`,
    ),
  )

  const projectDomains = domainNamesFromProject(pagesProject)
  checks.push(
    check(
      'pages-custom-domain-metadata',
      projectDomains.includes(contract.project.domain) ? 'pass' : 'warning',
      projectDomains.includes(contract.project.domain)
        ? `${contract.project.domain} is visible in Pages project metadata.`
        : `${contract.project.domain} was not visible in Pages project metadata; strict live-domain verification remains authoritative.`,
    ),
  )

  if (pagesProject) {
    const deploymentList = runWrangler('pages-production-deployments', [
      'pages',
      'deployment',
      'list',
      '--project-name',
      contract.project.pagesProject,
      '--environment',
      'production',
      '--json',
    ])
    commandSummaries.push({ label: deploymentList.label, ok: deploymentList.ok })
    const deploymentPayload = parseJsonOutput(deploymentList.stdout)
    pagesDeployments = asArray(deploymentPayload)
    checks.push(
      check(
        'pages-production-deployment',
        deploymentList.ok && pagesDeployments.length > 0 ? 'pass' : 'fail',
        deploymentList.ok && pagesDeployments.length > 0
          ? `Cloudflare Pages has ${pagesDeployments.length} visible production deployment(s).`
          : 'No Cloudflare Pages production deployment is visible.',
      ),
    )

    const pagesSecretList = runWrangler('pages-secret-list', [
      'pages',
      'secret',
      'list',
      '--project-name',
      contract.project.pagesProject,
    ])
    commandSummaries.push({ label: pagesSecretList.label, ok: pagesSecretList.ok })
    pagesSecretNames = ['KIE_API_KEY', 'MEDIA_ADMIN_TOKEN'].filter((name) => pagesSecretList.stdout.includes(name))
    checks.push(
      check(
        'pages-secret-names',
        pagesSecretList.ok && ['KIE_API_KEY', 'MEDIA_ADMIN_TOKEN'].every((name) => pagesSecretNames.includes(name))
          ? 'pass'
          : 'fail',
        pagesSecretList.ok && pagesSecretNames.length
          ? `Visible Pages secret names: ${pagesSecretNames.join(', ')}.`
          : 'Required Pages secret names are not visible.',
      ),
    )
  } else {
    checks.push(check('pages-production-deployment', 'fail', 'Skipped because the Pages project is not visible.'))
    checks.push(check('pages-secret-names', 'fail', 'Skipped because the Pages project is not visible.'))
  }

  const workerDeploymentList = runWrangler('worker-deployments', [
    'deployments',
    'list',
    '--name',
    contract.project.newsWorker,
    '--json',
  ])
  commandSummaries.push({ label: workerDeploymentList.label, ok: workerDeploymentList.ok })
  const workerDeploymentPayload = parseJsonOutput(workerDeploymentList.stdout)
  workerDeployments = asArray(workerDeploymentPayload)
  checks.push(
    check(
      'news-worker-deployment',
      workerDeploymentList.ok && workerDeployments.length > 0 ? 'pass' : 'fail',
      workerDeploymentList.ok && workerDeployments.length > 0
        ? `Scheduled news Worker has ${workerDeployments.length} visible deployment record(s).`
        : 'No scheduled news Worker deployment is visible.',
    ),
  )

  const workerSecretList = runWrangler('worker-secret-list', ['secret', 'list', '--config', 'wrangler.news.toml', '--format', 'json'])
  commandSummaries.push({ label: workerSecretList.label, ok: workerSecretList.ok })
  workerSecretNames = namesFromJson(parseJsonOutput(workerSecretList.stdout))
  checks.push(
    check(
      'news-worker-secret-names',
      workerSecretList.ok && workerSecretNames.includes('FEED_ADMIN_TOKEN') ? 'pass' : 'fail',
      workerSecretList.ok && workerSecretNames.includes('FEED_ADMIN_TOKEN')
        ? 'FEED_ADMIN_TOKEN is visible as a Worker secret name.'
        : 'FEED_ADMIN_TOKEN is not visible as a Worker secret name.',
    ),
  )
} else {
  for (const id of [
    'd1-database',
    'pages-project',
    'pages-custom-domain-metadata',
    'pages-production-deployment',
    'pages-secret-names',
    'news-worker-deployment',
    'news-worker-secret-names',
  ]) {
    checks.push(check(id, 'skipped', 'Skipped because Wrangler is not authenticated.'))
  }
}

const failedChecks = checks.filter((item) => item.status === 'fail')
const warnings = checks.filter((item) => item.status === 'warning')
const status = !authenticated
  ? 'needs-cloudflare-auth'
  : failedChecks.length
  ? 'needs-cloudflare-production-setup'
  : warnings.length
  ? 'ready-with-cloudflare-warnings'
  : 'ready-for-live-verification'

const result = {
  status,
  strict,
  generatedAt: new Date().toISOString(),
  safeToRun:
    'Read-only Cloudflare production-state probe. It checks Wrangler auth and remote resource or secret names only; it does not create resources, deploy, mutate DNS, set secrets, call paid APIs, upload files, download artifacts, or print secret values.',
  project: contract.project,
  wrangler: {
    command: existsSync(localWranglerCli) ? 'local-wrangler-js' : 'wrangler',
    version: wranglerVersion,
    authenticated,
  },
  checks,
  visibleState: {
    d1DatabaseNames: d1Databases.map(readName).filter(Boolean),
    pagesProjectNames: pagesProjects.map(readName).filter(Boolean),
    pagesProductionDeploymentCount: pagesDeployments.length,
    newsWorkerDeploymentCount: workerDeployments.length,
    pagesSecretNames,
    newsWorkerSecretNames: workerSecretNames,
  },
  commandSummaries,
  nextActions:
    status === 'needs-cloudflare-auth'
      ? ['Authenticate Wrangler interactively or provide CLOUDFLARE_API_TOKEN, then rerun npm run verify:cloudflare-production-state.']
      : status === 'ready-for-live-verification' || status === 'ready-with-cloudflare-warnings'
      ? ['Run npm run verify:live-readiness -- --strict.', 'Run npm run verify:production -- https://herbalisti.com.']
      : [
          'Create or confirm the Cloudflare Pages project, D1 database, and scheduled Worker.',
          'Set the required Cloudflare secret names without exposing values.',
          'Deploy Pages and the scheduled news Worker only after the approved production gate.',
          'Rerun npm run verify:cloudflare-production-state.',
        ],
}

const serialized = JSON.stringify(result, null, 2)
assert(!secretValuePattern.test(serialized), 'Cloudflare state verifier result must not contain secret values')
console.log(serialized)

if (strict && (status === 'needs-cloudflare-auth' || failedChecks.length > 0)) {
  process.exitCode = 1
}
