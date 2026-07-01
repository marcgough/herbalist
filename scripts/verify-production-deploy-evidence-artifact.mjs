import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const args = process.argv.slice(2)
const argSet = new Set(args)

const getArg = (name, fallback = '') => {
  const index = args.indexOf(name)
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback
}

const repository = getArg('--repo', 'marcgough/herbalist')
const branch = getArg('--branch', 'main')
const workflowName = getArg('--workflow', 'Herbalisti Production Deploy')
const artifactName = getArg('--artifact', 'herbalisti-production-deploy-evidence')
const runId = getArg('--run-id', '')
const strict = argSet.has('--strict')
const maxAgeHours = Number(getArg('--max-age-hours', '720'))
const safeDirectory = root.replace(/\\/g, '/')
const commit =
  getArg('--commit', '') ||
  execFileSync('git', ['-c', `safe.directory=${safeDirectory}`, 'rev-parse', 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
  }).trim()

const token = (() => {
  if (process.env.GITHUB_TOKEN?.trim()) return process.env.GITHUB_TOKEN.trim()
  if (process.env.GH_TOKEN?.trim()) return process.env.GH_TOKEN.trim()
  try {
    return execFileSync('gh', ['auth', 'token'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
})()

const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'Herbalisti-production-deploy-evidence-artifact-verifier',
}
if (token) {
  headers.Authorization = `Bearer ${token}`
}

const fetchJson = async (path) => {
  const response = await fetch(`https://api.github.com/repos/${repository}${path}`, { headers })
  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status} ${response.statusText} for ${path}`)
  }
  return response.json()
}

const runAgeHours = (run) => (Date.now() - new Date(run.updated_at).getTime()) / 36e5
const isFresh = (run) => Number.isFinite(maxAgeHours) && runAgeHours(run) <= maxAgeHours
const isSuccessfulDeployRun = (run) =>
  run.name === workflowName &&
  run.head_sha === commit &&
  run.event === 'workflow_dispatch' &&
  run.status === 'completed' &&
  run.conclusion === 'success' &&
  isFresh(run)

const finish = (payload, exitCode = 0) => {
  console.log(JSON.stringify(payload, null, 2))
  if (exitCode) {
    process.exitCode = exitCode
  }
}

const basePayload = {
  repository,
  branch,
  commit,
  workflowName,
  artifactName,
  strict,
  maxAgeHours,
  safeToRun:
    'Reads GitHub Actions production deploy run and artifact metadata only. It does not dispatch workflows, deploy, mutate DNS, create Cloudflare resources, set secrets, download artifacts, call paid APIs, or print credential values.',
}

const run = runId
  ? await fetchJson(`/actions/runs/${encodeURIComponent(runId)}`)
  : (() => null)()

const runs = run
  ? [run]
  : (
      await fetchJson(
        `/actions/runs?branch=${encodeURIComponent(branch)}&per_page=100`,
      )
    ).workflow_runs ?? []

const observedRuns = runs
  .filter((candidate) => candidate.name === workflowName)
  .slice(0, 8)
  .map((candidate) => ({
    id: candidate.id,
    headSha: candidate.head_sha,
    status: candidate.status,
    conclusion: candidate.conclusion,
    event: candidate.event,
    updatedAt: candidate.updated_at,
    url: candidate.html_url,
  }))

const deployRun = runs.find(isSuccessfulDeployRun)
const latestMatchingRun = observedRuns[0] ?? null

if (!deployRun) {
  finish(
    {
      status: 'pending-production-deploy-evidence-artifact',
      ...basePayload,
      run: latestMatchingRun,
      observedRuns,
      detail: runId
        ? `Production deploy run ${runId} is not a fresh successful workflow_dispatch run for ${commit}.`
        : `No fresh successful ${workflowName} workflow_dispatch run exists for ${commit}.`,
      strictCompletionCommand:
        'npm run verify:production-deploy-evidence-artifact -- --strict --run-id <production_deploy_run_id>',
    },
    strict ? 1 : 0,
  )
} else {
  const artifactPayload = await fetchJson(`/actions/runs/${deployRun.id}/artifacts`)
  const artifacts = artifactPayload.artifacts ?? []
  const artifact = artifacts.find((candidate) => candidate.name === artifactName)

  const artifactOk =
    artifact &&
    artifact.expired === false &&
    Number(artifact.size_in_bytes) > 500 &&
    String(artifact.digest ?? '').startsWith('sha256:')

  finish(
    {
      status: artifactOk ? 'pass' : 'missing-production-deploy-evidence-artifact',
      ...basePayload,
      run: {
        id: deployRun.id,
        workflow: deployRun.name,
        event: deployRun.event,
        conclusion: deployRun.conclusion,
        updatedAt: deployRun.updated_at,
        url: deployRun.html_url,
      },
      artifact: artifact
        ? {
            id: artifact.id,
            name: artifact.name,
            sizeInBytes: artifact.size_in_bytes,
            digest: artifact.digest,
            expiresAt: artifact.expires_at,
          }
        : null,
      observedRuns,
      detail: artifactOk
        ? 'The guarded production deployment uploaded the non-secret deployment evidence artifact for this commit.'
        : `Production deploy run ${deployRun.id} is missing a valid ${artifactName} artifact.`,
    },
    artifactOk ? 0 : 1,
  )
}
