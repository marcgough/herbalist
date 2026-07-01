import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import AdmZip from 'adm-zip'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const contract = readJson('docs/production-environment-contract.json')
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
const inspectContent = strict || argSet.has('--inspect-content')
const localArtifactArchivePath = getArg('--local-artifact-archive', '')
const maxAgeHours = Number(getArg('--max-age-hours', '720'))
const finalCompletionGates = contract.commands?.finalCompletionGates ?? [
  'npm run verify:production-deploy-evidence-artifact -- --strict --run-id <production_deploy_run_id>',
  'npm run verify:live-readiness -- --strict',
  'npm run verify:production -- https://herbalisti.com',
  'npm run verify:goal-readiness -- --strict',
]
const strictCompletionCommand =
  finalCompletionGates.find((command) => command.includes('verify:production-deploy-evidence-artifact')) ??
  'npm run verify:production-deploy-evidence-artifact -- --strict --run-id <production_deploy_run_id>'
const remainingFinalCompletionGatesAfterArtifactReadback = finalCompletionGates.filter(
  (command) => !command.includes('verify:production-deploy-evidence-artifact'),
)
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
const secretValuePattern =
  /(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]+|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i

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

const fetchArtifactArchive = async (artifact) => {
  if (!artifact.archive_download_url) {
    throw new Error('Artifact archive download URL is unavailable.')
  }

  const response = await fetch(artifact.archive_download_url, {
    headers,
    redirect: 'manual',
  })
  const redirectUrl = response.headers.get('location')
  const archiveResponse =
    response.status >= 300 && response.status < 400 && redirectUrl
      ? await fetch(redirectUrl, {
          headers: {
            Accept: 'application/octet-stream',
            'User-Agent': headers['User-Agent'],
          },
          redirect: 'follow',
        })
      : response

  if (!archiveResponse.ok) {
    throw new Error(`Artifact archive download failed: ${archiveResponse.status} ${archiveResponse.statusText}`)
  }

  return Buffer.from(await archiveResponse.arrayBuffer())
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

const normalizeZipPath = (path) => String(path ?? '').replace(/\\/g, '/').replace(/^\/+/, '')
const zipEntryCandidates = (zip, names) => {
  const normalizedNames = names.map(normalizeZipPath).filter(Boolean)
  const entries = zip.getEntries().filter((entry) => !entry.isDirectory)
  for (const name of normalizedNames) {
    const exact = entries.find((entry) => normalizeZipPath(entry.entryName) === name)
    if (exact) return exact
  }
  for (const name of normalizedNames) {
    const suffix = `/${name.split('/').pop()}`
    const suffixMatch = entries.find((entry) => normalizeZipPath(entry.entryName).endsWith(suffix))
    if (suffixMatch) return suffixMatch
  }
  return null
}

const readZipJson = (zip, names, label) => {
  const entry = zipEntryCandidates(zip, names)
  if (!entry) {
    throw new Error(`Missing ${label} in production deployment evidence artifact.`)
  }

  const text = entry.getData().toString('utf8')
  if (secretValuePattern.test(text)) {
    throw new Error(`${label} contains a secret-looking value.`)
  }

  return {
    path: normalizeZipPath(entry.entryName),
    json: JSON.parse(text),
  }
}

const assertSecretSafeArchiveText = (zip) => {
  for (const entry of zip.getEntries().filter((candidate) => !candidate.isDirectory)) {
    const path = normalizeZipPath(entry.entryName)
    if (!/\.(json|md|txt)$/i.test(path)) {
      continue
    }
    const text = entry.getData().toString('utf8')
    if (secretValuePattern.test(text)) {
      throw new Error(`Artifact file ${path} contains a secret-looking value.`)
    }
  }
}

const assertFeedSeedSummary = (summary, label) => {
  if (!summary || typeof summary !== 'object') {
    throw new Error(`${label} is missing.`)
  }
  if (summary.status !== 'pass') {
    throw new Error(`${label} should report pass status.`)
  }
  if (summary.baseUrl !== 'https://herbalisti.com') {
    throw new Error(`${label} should target https://herbalisti.com.`)
  }
  if (summary.endpoint !== 'https://herbalisti.com/api/feed-refresh') {
    throw new Error(`${label} should target the protected feed-refresh endpoint.`)
  }
  if (Number(summary.itemCount ?? 0) < 1) {
    throw new Error(`${label} should include at least one refreshed feed item.`)
  }
  const refreshStatus = summary.refreshRun?.status
  if (!['completed', 'completed_with_warnings'].includes(refreshStatus)) {
    throw new Error(`${label} should include a completed feed refresh run.`)
  }
  if (Number(summary.refreshRun?.itemCount ?? summary.itemCount ?? 0) < 1) {
    throw new Error(`${label} refresh run should include at least one item.`)
  }
}

const inspectProductionDeployEvidenceArchive = (archiveBuffer, { expectedRunId, expectedCommit }) => {
  const zip = new AdmZip(archiveBuffer)
  const files = zip.getEntries().filter((entry) => !entry.isDirectory).map((entry) => normalizeZipPath(entry.entryName))
  if (!files.length) {
    throw new Error('Production deployment evidence artifact archive is empty.')
  }
  assertSecretSafeArchiveText(zip)

  const evidenceEntry = readZipJson(
    zip,
    ['production-deploy-evidence.json', 'output/production-deploy/production-deploy-evidence.json'],
    'production deployment evidence JSON',
  )
  const evidence = evidenceEntry.json

  if (evidence.schemaVersion !== 1) {
    throw new Error('Production deployment evidence JSON has an unsupported schema version.')
  }
  if (evidence.status !== 'production-deploy-evidence-ready') {
    throw new Error('Production deployment evidence JSON does not report ready status.')
  }
  if (evidence.artifact?.name !== artifactName) {
    throw new Error(`Production deployment evidence JSON should name ${artifactName}.`)
  }
  if (evidence.site?.url !== 'https://herbalisti.com') {
    throw new Error('Production deployment evidence JSON should target https://herbalisti.com.')
  }
  if (evidence.github?.workflow !== workflowName) {
    throw new Error(`Production deployment evidence JSON should record workflow ${workflowName}.`)
  }
  if (String(evidence.github?.runId ?? '') !== String(expectedRunId ?? '')) {
    throw new Error('Production deployment evidence JSON should match the selected production run ID.')
  }
  if (expectedCommit && evidence.github?.sha !== expectedCommit) {
    throw new Error('Production deployment evidence JSON should match the selected commit.')
  }
  if (evidence.deployment?.environment !== 'production') {
    throw new Error('Production deployment evidence JSON should record the production environment.')
  }
  if (evidence.deployment?.pagesProject !== 'herbalisti') {
    throw new Error('Production deployment evidence JSON should record the Herbalisti Pages project.')
  }
  if (evidence.deployment?.newsWorker !== 'herbalisti-news-refresh') {
    throw new Error('Production deployment evidence JSON should record the scheduled news Worker.')
  }
  if (evidence.deployment?.d1Database !== 'herbalisti') {
    throw new Error('Production deployment evidence JSON should record the production D1 database.')
  }
  if (!Array.isArray(evidence.deployment?.finalCompletionGates)) {
    throw new Error('Production deployment evidence JSON should include final completion gates.')
  }
  for (const command of remainingFinalCompletionGatesAfterArtifactReadback) {
    if (!evidence.deployment.finalCompletionGates.includes(command)) {
      throw new Error(`Production deployment evidence JSON is missing final completion gate: ${command}`)
    }
  }

  const feedSeed = evidence.deployment?.feedSeedEvidence
  if (!feedSeed || typeof feedSeed !== 'object') {
    throw new Error('Production deployment evidence JSON should include feed seed evidence state.')
  }

  if (evidence.deployment.liveVerificationSkipped) {
    if (!evidence.deployment.liveVerificationSkipAcknowledged) {
      throw new Error('DNS-transition production evidence should include the live-verification skip acknowledgement.')
    }
    if (evidence.deployment.liveVerificationMode !== 'dns-transition-skip') {
      throw new Error('DNS-transition production evidence should record dns-transition-skip mode.')
    }
    if (feedSeed.status !== 'skipped-dns-transition') {
      throw new Error('DNS-transition production evidence should mark feed seed evidence as skipped-dns-transition.')
    }
    return {
      status: 'verified-dns-transition-skip',
      evidenceJsonPath: evidenceEntry.path,
      files,
      liveVerificationMode: evidence.deployment.liveVerificationMode,
      feedSeedEvidenceStatus: feedSeed.status,
    }
  }

  if (evidence.deployment.liveVerificationMode !== 'strict-live-verification') {
    throw new Error('Successful production evidence should record strict-live-verification mode.')
  }
  if (feedSeed.status !== 'captured') {
    throw new Error('Strict production evidence should capture feed seed evidence.')
  }
  assertFeedSeedSummary(feedSeed.summary, 'Production deployment feed seed summary')

  const feedSeedEvidencePath = normalizeZipPath(feedSeed.path || 'feed-seed-evidence.json')
  const feedEntry = readZipJson(
    zip,
    [
      feedSeedEvidencePath,
      feedSeedEvidencePath.replace(/^output\/production-deploy\//, ''),
      'feed-seed-evidence.json',
      'output/production-deploy/feed-seed-evidence.json',
    ],
    'feed seed evidence JSON',
  )
  assertFeedSeedSummary(feedEntry.json, 'Feed seed evidence JSON')
  if (feedEntry.json.generatedAt !== feedSeed.summary.generatedAt) {
    throw new Error('Feed seed evidence JSON should match the captured feed seed summary timestamp.')
  }
  if (Number(feedEntry.json.itemCount ?? 0) !== Number(feedSeed.summary.itemCount ?? 0)) {
    throw new Error('Feed seed evidence JSON should match the captured feed seed item count.')
  }

  return {
    status: 'verified-feed-seed-evidence',
    evidenceJsonPath: evidenceEntry.path,
    feedSeedEvidenceJsonPath: feedEntry.path,
    files,
    liveVerificationMode: evidence.deployment.liveVerificationMode,
    feedSeedEvidenceStatus: feedSeed.status,
    feedSeedItemCount: Number(feedSeed.summary.itemCount ?? 0),
    feedSeedRefreshStatus: feedSeed.summary.refreshRun?.status ?? null,
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
  artifactReadbackScope: 'single-final-completion-gate',
  completionBoundary:
    'This verifier proves only the non-secret production deployment evidence artifact for the selected run and commit. Herbalisti is complete only when every final completion gate also passes against the live production site.',
  strictCompletionCommand,
  finalCompletionGates,
  remainingFinalCompletionGatesAfterArtifactReadback,
  safeToRun:
    'Reads GitHub Actions production deploy run and artifact metadata. In strict or artifact-inspection mode, it downloads only the selected non-secret evidence artifact into memory to verify its contents. It does not dispatch workflows, deploy, mutate DNS, create Cloudflare resources, set secrets, call paid APIs, or print credential values.',
}

let localArtifactArchive = null
if (localArtifactArchivePath) {
  const absolutePath = resolve(root, localArtifactArchivePath)
  const buffer = readFileSync(absolutePath)
  localArtifactArchive = {
    buffer,
    run: {
      id: runId || 'local-production-deploy-run',
      name: workflowName,
      head_sha: commit,
      event: 'workflow_dispatch',
      status: 'completed',
      conclusion: 'success',
      updated_at: new Date().toISOString(),
      html_url: `file://${absolutePath.replace(/\\/g, '/')}`,
    },
    artifact: {
      id: 'local-production-deploy-evidence-artifact',
      name: artifactName,
      expired: false,
      size_in_bytes: statSync(absolutePath).size,
      digest: `sha256:${createHash('sha256').update(buffer).digest('hex')}`,
      expires_at: null,
      archive_download_url: null,
    },
  }
}

const run = localArtifactArchive
  ? localArtifactArchive.run
  : runId
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
    },
    strict ? 1 : 0,
  )
} else {
  const artifactPayload = localArtifactArchive
    ? { artifacts: [localArtifactArchive.artifact] }
    : await fetchJson(`/actions/runs/${deployRun.id}/artifacts`)
  const artifacts = artifactPayload.artifacts ?? []
  const artifact = artifacts.find((candidate) => candidate.name === artifactName)

  const artifactOk =
    artifact &&
    artifact.expired === false &&
    Number(artifact.size_in_bytes) > 500 &&
    String(artifact.digest ?? '').startsWith('sha256:')
  let artifactContent = null
  let artifactContentError = null

  if (artifactOk && (inspectContent || localArtifactArchive)) {
    try {
      const archiveBuffer = localArtifactArchive?.buffer ?? (await fetchArtifactArchive(artifact))
      artifactContent = inspectProductionDeployEvidenceArchive(archiveBuffer, {
        expectedRunId: deployRun.id,
        expectedCommit: commit,
      })
    } catch (error) {
      artifactContentError = error instanceof Error ? error.message : String(error)
    }
  }

  const artifactContentOk = !artifactContentError && (!inspectContent || Boolean(artifactContent))
  const status = !artifactOk
    ? 'missing-production-deploy-evidence-artifact'
    : artifactContentOk
      ? 'pass'
      : 'invalid-production-deploy-evidence-artifact-content'

  finish(
    {
      status,
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
      artifactContent,
      observedRuns,
      detail: !artifactOk
        ? `Production deploy run ${deployRun.id} is missing a valid ${artifactName} artifact.`
        : artifactContentError
          ? `Production deploy run ${deployRun.id} uploaded ${artifactName}, but artifact content inspection failed: ${artifactContentError}`
          : artifactContent
            ? 'The guarded production deployment uploaded the non-secret deployment evidence artifact and strict content inspection verified its feed-seed evidence boundary. This is one final completion gate; strict live readiness, live production smoke, and goal-readiness gates must still pass before the site is complete.'
            : 'The guarded production deployment uploaded the non-secret deployment evidence artifact for this commit. This is one final completion gate; strict live readiness, live production smoke, and goal-readiness gates must still pass before the site is complete.',
    },
    status === 'pass' ? 0 : 1,
  )
}
