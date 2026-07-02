import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import AdmZip from 'adm-zip'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

const args = process.argv.slice(2)
const argSet = new Set(args)
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
const inspectContent = !argSet.has('--metadata-only')
const safeDirectory = root.replace(/\\/g, '/')
const commit =
  getArg('--commit', '') ||
  execFileSync('git', ['-c', `safe.directory=${safeDirectory}`, 'rev-parse', 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
  }).trim()

const requiredSignalTopics = [
  'CRISPR',
  'DNA modification',
  'Gene editing',
  'Gene therapy',
  'Health as a service',
  'Longevity',
  'Peptides',
  'Self-sovereign wellbeing',
]
const requiredSignalSources = ['Crossref', 'Fight Aging!', 'Lifespan.io', 'PubMed / NCBI', 'arXiv', 'bioRxiv']
const feedPolicyText =
  'Herbalisti allowlist: public research APIs and independent longevity sources; Big Pharma names and off-topic metadata drift filtered before publication.'
const secretValuePattern =
  /(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]+|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i

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
  'User-Agent': 'Herbalisti-release-evidence-verifier',
}

if (token) {
  headers.Authorization = `Bearer ${token}`
}

const fetchJson = async (url) => {
  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status} ${response.statusText} for ${url}`)
  }
  return response.json()
}

const fetchArtifactArchive = async (artifact) => {
  assert(artifact.archive_download_url, 'Release evidence artifact archive download URL is unavailable.')
  assert(token, 'Release evidence artifact content inspection requires GitHub auth; pass --metadata-only to skip it.')

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
    throw new Error(`Release evidence artifact archive download failed: ${archiveResponse.status} ${archiveResponse.statusText}`)
  }

  return Buffer.from(await archiveResponse.arrayBuffer())
}

const runAgeHours = (run) => (Date.now() - new Date(run.updated_at).getTime()) / 36e5
const isFresh = (run) => Number.isFinite(maxAgeHours) && runAgeHours(run) <= maxAgeHours

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
  assert(entry, `Missing ${label} in release evidence artifact.`)

  const text = entry.getData().toString('utf8')
  assert.equal(secretValuePattern.test(text), false, `${label} contains a secret-looking value.`)

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
    assert.equal(secretValuePattern.test(text), false, `Release evidence artifact file ${path} contains a secret-looking value.`)
  }
}

const inspectReleaseEvidenceArchive = (archiveBuffer, expectedCommit) => {
  const zip = new AdmZip(archiveBuffer)
  const files = zip.getEntries().filter((entry) => !entry.isDirectory).map((entry) => normalizeZipPath(entry.entryName))
  assert(files.length > 0, 'Release evidence artifact archive is empty.')
  assertSecretSafeArchiveText(zip)

  const evidenceEntry = readZipJson(
    zip,
    ['herbalisti-release-evidence.json', 'output/release-evidence/herbalisti-release-evidence.json'],
    'release evidence JSON',
  )
  const evidence = evidenceEntry.json

  assert.equal(evidence.version, 1, 'Release evidence JSON has an unsupported version.')
  assert.equal(evidence.status, 'repository-release-verifier-passed', 'Release evidence JSON should report repository verifier pass.')
  assert.equal(evidence.git?.commit, expectedCommit, 'Release evidence JSON should match the verified commit.')
  assert.equal(evidence.productionComplete, false, 'Release evidence should preserve the production-pending completion boundary.')
  assert.equal(evidence.goalState?.localImplementationReady, true, 'Release evidence should prove local implementation readiness.')
  assert.equal(evidence.goalState?.goalComplete, false, 'Release evidence should preserve incomplete goal state before production launch.')
  assert.equal(
    evidence.goalState?.auditStatus,
    'local-ready-production-pending',
    'Release evidence should record the local-ready production-pending audit state.',
  )
  assert(
    Array.isArray(evidence.productionContract?.finalCompletionGates) &&
      evidence.productionContract.finalCompletionGates.includes('npm run verify:goal-readiness -- --strict'),
    'Release evidence should include strict final goal-readiness gate.',
  )

  const signalsFeed = evidence.publicData?.signalsFeed
  assert(signalsFeed && typeof signalsFeed === 'object', 'Release evidence should include public Signals feed proof.')
  assert(Number(signalsFeed.itemCount ?? 0) >= 12, 'Release evidence should include a substantial public Signals snapshot.')
  assert.equal(Number(signalsFeed.topicCoveragePercent ?? 0), 100, 'Release evidence should prove full launch topic coverage.')
  assert.deepEqual(signalsFeed.missingTopics ?? [], [], 'Release evidence should report no missing Signals topics.')
  assert.deepEqual(signalsFeed.missingSources ?? [], [], 'Release evidence should report no missing Signals source lanes.')
  assert.deepEqual(signalsFeed.blockedSignalTerms ?? [], [], 'Release evidence should report no Big Pharma blocklist terms.')
  assert.equal(signalsFeed.policy, feedPolicyText, 'Release evidence should preserve the Signals source policy.')
  assert(['completed', 'completed_with_warnings'].includes(signalsFeed.feedStatus), 'Release evidence should record a completed Signals feed status.')
  assert(Number.isFinite(Number(signalsFeed.feedWarningCount)), 'Release evidence should record a numeric feed warning count.')
  assert(Number.isFinite(Date.parse(signalsFeed.generatedAt ?? '')), 'Release evidence should include a valid Signals generation timestamp.')
  assert(Number.isFinite(Date.parse(signalsFeed.newestSignalAt ?? '')), 'Release evidence should include a valid newest Signals timestamp.')

  for (const topic of requiredSignalTopics) {
    assert(signalsFeed.topics?.includes(topic), `Release evidence should include Signals topic ${topic}.`)
    assert(Number(signalsFeed.topicCounts?.[topic] ?? 0) > 0, `Release evidence should include item count for Signals topic ${topic}.`)
  }
  for (const source of requiredSignalSources) {
    assert(signalsFeed.sources?.includes(source), `Release evidence should include Signals source ${source}.`)
    assert(Number(signalsFeed.sourceCounts?.[source] ?? 0) > 0, `Release evidence should include item count for Signals source ${source}.`)
  }

  const sourceHealthCounts = signalsFeed.sourceHealthCounts ?? {}
  const sourceHealthTotal =
    Number(sourceHealthCounts.ok ?? 0) + Number(sourceHealthCounts.empty ?? 0) + Number(sourceHealthCounts.warning ?? 0)
  assert(
    sourceHealthTotal >= requiredSignalSources.length,
    'Release evidence should include source-health coverage for every launch source lane.',
  )
  assert(signalsFeed.sourcePreservation && typeof signalsFeed.sourcePreservation === 'object', 'Release evidence should include source-preservation state.')

  return {
    status: 'verified-release-evidence-content',
    evidenceJsonPath: evidenceEntry.path,
    files,
    itemCount: Number(signalsFeed.itemCount ?? 0),
    topicCoveragePercent: Number(signalsFeed.topicCoveragePercent ?? 0),
    topics: signalsFeed.topics,
    sources: signalsFeed.sources,
    feedStatus: signalsFeed.feedStatus,
    feedWarningCount: Number(signalsFeed.feedWarningCount ?? 0),
    sourceHealthCounts,
    newestSignalAt: signalsFeed.newestSignalAt,
  }
}

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

const releaseEvidenceArtifactContent = inspectContent
  ? inspectReleaseEvidenceArchive(await fetchArtifactArchive(releaseEvidenceArtifact), commit)
  : null

console.log(
  JSON.stringify(
    {
      status: 'pass',
      repository,
      branch,
      commit,
      maxAgeHours,
      artifactInspection: inspectContent ? 'release-evidence-content' : 'metadata-only',
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
      releaseEvidenceArtifactContent,
      safeToRun:
        'Reads public GitHub Actions run and artifact metadata. By default it downloads only the selected no-secret release evidence artifact into memory to verify its Signals coverage contents; pass --metadata-only to skip content inspection. It does not deploy, mutate DNS, create Cloudflare resources, set secrets, call paid APIs, or print credential values.',
    },
    null,
    2,
  ),
)
