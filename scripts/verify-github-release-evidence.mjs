import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

const args = process.argv.slice(2)
const getArg = (name, fallback) => {
  const index = args.indexOf(name)
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback
}

const repository = getArg('--repo', 'marcgough/herbalist')
const branch = getArg('--branch', 'main')
const ciWorkflow = getArg('--ci-workflow', 'Herbalisti CI')
const manualWorkflow = getArg('--manual-workflow', 'Herbalisti Manual Release Gate')
const artifactName = getArg('--artifact', 'herbalisti-visual-smoke')
const releaseEvidenceArtifactName = getArg('--release-evidence-artifact', 'herbalisti-release-evidence')
const maxAgeHours = Number(getArg('--max-age-hours', '168'))
const safeDirectory = root.replace(/\\/g, '/')
const commit =
  getArg('--commit', '') ||
  execFileSync('git', ['-c', `safe.directory=${safeDirectory}`, 'rev-parse', 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
  }).trim()

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'Herbalisti-release-evidence-verifier',
}

if (process.env.GITHUB_TOKEN) {
  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
}

const fetchJson = async (url) => {
  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status} ${response.statusText} for ${url}`)
  }
  return response.json()
}

const runAgeHours = (run) => (Date.now() - new Date(run.updated_at).getTime()) / 36e5
const isFresh = (run) => Number.isFinite(maxAgeHours) && runAgeHours(run) <= maxAgeHours

const runsUrl = `https://api.github.com/repos/${repository}/actions/runs?branch=${encodeURIComponent(
  branch,
)}&per_page=100`
const runs = (await fetchJson(runsUrl)).workflow_runs ?? []

const matches = (run, workflowName) =>
  run.name === workflowName &&
  run.head_sha === commit &&
  run.status === 'completed' &&
  run.conclusion === 'success' &&
  isFresh(run)

const ciRun = runs.find((run) => matches(run, ciWorkflow))
const manualRun = runs.find((run) => matches(run, manualWorkflow) && run.event === 'workflow_dispatch')

const latestRuns = runs.slice(0, 8).map((run) => ({
  id: run.id,
  name: run.name,
  headSha: run.head_sha,
  status: run.status,
  conclusion: run.conclusion,
  event: run.event,
  updatedAt: run.updated_at,
  url: run.html_url,
}))

assert(
  ciRun,
  `No fresh successful ${ciWorkflow} run found for ${commit}. Latest observed runs: ${JSON.stringify(latestRuns)}`,
)
assert(
  manualRun,
  `No fresh successful workflow_dispatch ${manualWorkflow} run found for ${commit}. Latest observed runs: ${JSON.stringify(latestRuns)}`,
)

const artifactsUrl = `https://api.github.com/repos/${repository}/actions/runs/${manualRun.id}/artifacts`
const artifacts = (await fetchJson(artifactsUrl)).artifacts ?? []
const artifact = artifacts.find((candidate) => candidate.name === artifactName)
const releaseEvidenceArtifact = artifacts.find((candidate) => candidate.name === releaseEvidenceArtifactName)

assert(artifact, `Manual release run ${manualRun.id} is missing ${artifactName} artifact`)
assert(artifact.expired === false, `${artifactName} artifact has expired`)
assert(Number(artifact.size_in_bytes) > 1_000_000, `${artifactName} artifact is unexpectedly small`)
assert(String(artifact.digest ?? '').startsWith('sha256:'), `${artifactName} artifact is missing a sha256 digest`)
assert(
  releaseEvidenceArtifact,
  `Manual release run ${manualRun.id} is missing ${releaseEvidenceArtifactName} artifact`,
)
assert(releaseEvidenceArtifact.expired === false, `${releaseEvidenceArtifactName} artifact has expired`)
assert(Number(releaseEvidenceArtifact.size_in_bytes) > 1_000, `${releaseEvidenceArtifactName} artifact is unexpectedly small`)
assert(
  String(releaseEvidenceArtifact.digest ?? '').startsWith('sha256:'),
  `${releaseEvidenceArtifactName} artifact is missing a sha256 digest`,
)

console.log(
  JSON.stringify(
    {
      status: 'pass',
      repository,
      branch,
      commit,
      maxAgeHours,
      ciRun: {
        id: ciRun.id,
        workflow: ciRun.name,
        conclusion: ciRun.conclusion,
        updatedAt: ciRun.updated_at,
        url: ciRun.html_url,
      },
      manualReleaseRun: {
        id: manualRun.id,
        workflow: manualRun.name,
        event: manualRun.event,
        conclusion: manualRun.conclusion,
        updatedAt: manualRun.updated_at,
        url: manualRun.html_url,
      },
      artifact: {
        id: artifact.id,
        name: artifact.name,
        sizeInBytes: artifact.size_in_bytes,
        digest: artifact.digest,
        expiresAt: artifact.expires_at,
      },
      releaseEvidenceArtifact: {
        id: releaseEvidenceArtifact.id,
        name: releaseEvidenceArtifact.name,
        sizeInBytes: releaseEvidenceArtifact.size_in_bytes,
        digest: releaseEvidenceArtifact.digest,
        expiresAt: releaseEvidenceArtifact.expires_at,
      },
      safeToRun:
        'Reads public GitHub Actions run and artifact metadata only. It does not deploy, mutate DNS, create Cloudflare resources, set secrets, download artifacts, call paid APIs, or print credential values.',
    },
    null,
    2,
  ),
)
