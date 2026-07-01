import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const args = process.argv.slice(2)

const getArg = (name, fallback) => {
  const index = args.indexOf(name)
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback
}

const outputDir = resolve(root, getArg('--out', 'output/release-evidence'))
const generatedAt = new Date().toISOString()
const secretValuePattern =
  /(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]+|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const readJson = (path) => JSON.parse(read(path))
const exists = (path) => existsSync(resolve(root, path))
const list = (value) => (Array.isArray(value) ? value : [])

const git = (gitArgs, fallback = '') => {
  try {
    return execFileSync('git', gitArgs, { cwd: root, encoding: 'utf8' }).trim()
  } catch {
    return fallback
  }
}

const artifactUrl = () => {
  const serverUrl = process.env.GITHUB_SERVER_URL
  const repository = process.env.GITHUB_REPOSITORY
  const runId = process.env.GITHUB_RUN_ID

  if (!serverUrl || !repository || !runId) {
    return null
  }

  return `${serverUrl}/${repository}/actions/runs/${runId}`
}

const packageJson = readJson('package.json')
const completionAudit = exists('docs/objective-completion-audit.json')
  ? readJson('docs/objective-completion-audit.json')
  : null
const productionState = exists('docs/production-state-snapshot.json')
  ? readJson('docs/production-state-snapshot.json')
  : null
const productionContract = exists('docs/production-environment-contract.json')
  ? readJson('docs/production-environment-contract.json')
  : null
const referenceBooks = exists('public/data/reference-books.json') ? readJson('public/data/reference-books.json') : null
const referenceLanes = exists('public/data/reference-lanes.json') ? readJson('public/data/reference-lanes.json') : null
const herbalKnowledge = exists('public/data/herbal-knowledge.json') ? readJson('public/data/herbal-knowledge.json') : null
const news = exists('public/data/news.json') ? readJson('public/data/news.json') : null
const feedStatus = exists('public/data/feed-status.json') ? readJson('public/data/feed-status.json') : null
const sources = exists('public/data/sources.json') ? readJson('public/data/sources.json') : null

const releaseStatus = getArg('--release-status', 'repository-release-verifier-passed')
const commit = process.env.GITHUB_SHA || git(['rev-parse', 'HEAD'], null)
const branch = process.env.GITHUB_REF_NAME || git(['branch', '--show-current'], null)

const packet = {
  version: 1,
  generatedAt,
  status: releaseStatus,
  productionComplete: false,
  safeToRun:
    'Writes a local no-secret release evidence artifact from repository files and GitHub Actions environment metadata only. It does not deploy, mutate DNS, create Cloudflare resources, set secrets, call paid APIs, download artifacts, or print secret values.',
  repository: process.env.GITHUB_REPOSITORY || 'marcgough/herbalist',
  git: {
    branch,
    commit,
    ref: process.env.GITHUB_REF || null,
    eventName: process.env.GITHUB_EVENT_NAME || null,
  },
  githubRun: {
    workflow: process.env.GITHUB_WORKFLOW || null,
    runId: process.env.GITHUB_RUN_ID || null,
    runNumber: process.env.GITHUB_RUN_NUMBER || null,
    runAttempt: process.env.GITHUB_RUN_ATTEMPT || null,
    actor: process.env.GITHUB_ACTOR || null,
    url: artifactUrl(),
    note:
      'This artifact is prepared after the repository-safe release verifier step. The final run conclusion is still determined by GitHub Actions metadata.',
  },
  releaseGate: {
    mode: 'public-corpus-export',
    repositoryReleaseVerifier: releaseStatus,
    visualSmokeArtifactName: 'herbalisti-visual-smoke',
    releaseEvidenceArtifactName: 'herbalisti-release-evidence',
    noDeployment: true,
  },
  goalState: {
    auditStatus: completionAudit?.status ?? 'missing',
    goalComplete: Boolean(completionAudit?.goalComplete),
    localImplementationReady: Boolean(completionAudit?.localImplementationReady),
    requirementCounts: completionAudit?.requirementCounts ?? completionAudit?.counts ?? null,
    launchStatus: completionAudit?.launchStatus ?? completionAudit?.launchReadiness?.status ?? null,
  },
  productionState: {
    storedSnapshotStatus: productionState?.status ?? 'missing',
    blockerCount: productionState?.summary?.blockerCount ?? null,
    cloudflareProductionStateStatus: productionState?.summary?.cloudflareProductionStateStatus ?? null,
    dnsCutoverStatus: productionState?.summary?.dnsCutoverStatus ?? null,
    liveReadinessStatus: productionState?.summary?.liveReadinessStatus ?? null,
    productionSmokeStatus: productionState?.summary?.productionSmokeStatus ?? null,
    productionDeployEvidenceArtifactStatus:
      productionState?.summary?.productionDeployEvidenceArtifactStatus ?? null,
    note:
      'The committed production snapshot can trail the checked-out commit. Use npm run verify:production-state-current after this workflow completes for exact current-commit evidence.',
  },
  publicData: {
    referenceLaneCount: referenceLanes?.total ?? null,
    referenceBookCount: referenceBooks?.total ?? null,
    herbalKnowledgeRecordCount: herbalKnowledge?.total ?? null,
    newsItemCount: news?.items?.length ?? news?.total ?? null,
    sourceCount: sources?.total ?? null,
    feedStatus: feedStatus?.latestRefresh?.status ?? feedStatus?.status ?? null,
    feedSnapshotStatus: feedStatus?.publicSnapshot?.status ?? feedStatus?.publicSnapshotStatus ?? null,
  },
  productionContract: {
    domain: productionContract?.project?.domain ?? 'herbalisti.com',
    pagesProject: productionContract?.project?.pagesProject ?? 'herbalisti',
    d1Database: productionContract?.project?.d1Database ?? 'herbalisti',
    newsWorker: productionContract?.project?.newsWorker ?? 'herbalisti-news-refresh',
    finalCompletionGates: list(productionContract?.commands?.finalCompletionGates),
  },
  packageScripts: {
    verifyRelease: packageJson.scripts?.['verify:release'] ?? null,
    verifyGithubReleaseEvidence: packageJson.scripts?.['verify:github-release-evidence'] ?? null,
    verifyProductionStateCurrent: packageJson.scripts?.['verify:production-state-current'] ?? null,
    verifyProductionDispatchPreflight: packageJson.scripts?.['verify:production-dispatch-preflight'] ?? null,
  },
  remainingProductionBoundary: [
    'Production deployment evidence artifact readback from the guarded production workflow.',
    'Strict live readiness at https://herbalisti.com.',
    'Live production smoke verification at https://herbalisti.com.',
    'Strict goal-readiness verification after live deployment and feed seed.',
  ],
}

const renderMarkdown = (data) => {
  const lines = [
    '# Herbalisti Release Evidence',
    '',
    `Generated: ${data.generatedAt}`,
    '',
    `Status: ${data.status}`,
    '',
    data.safeToRun,
    '',
    '## Commit',
    '',
    `- Repository: ${data.repository}`,
    `- Branch: ${data.git.branch ?? 'unknown'}`,
    `- Commit: ${data.git.commit ?? 'unknown'}`,
    `- GitHub run: ${data.githubRun.url ?? 'local'}`,
    '',
    '## Release Gate',
    '',
    `- Mode: ${data.releaseGate.mode}`,
    `- Repository release verifier: ${data.releaseGate.repositoryReleaseVerifier}`,
    `- Visual smoke artifact: ${data.releaseGate.visualSmokeArtifactName}`,
    `- Release evidence artifact: ${data.releaseGate.releaseEvidenceArtifactName}`,
    `- Deployment performed: ${data.releaseGate.noDeployment ? 'false' : 'unknown'}`,
    '',
    '## Goal State',
    '',
    `- Audit status: ${data.goalState.auditStatus}`,
    `- Goal complete: ${data.goalState.goalComplete}`,
    `- Local implementation ready: ${data.goalState.localImplementationReady}`,
    `- Requirement counts: ${JSON.stringify(data.goalState.requirementCounts)}`,
    `- Launch status: ${data.goalState.launchStatus ?? 'unknown'}`,
    '',
    '## Public Data',
    '',
    `- Reference lanes: ${data.publicData.referenceLaneCount ?? 'unknown'}`,
    `- Reference books: ${data.publicData.referenceBookCount ?? 'unknown'}`,
    `- Herbal knowledge records: ${data.publicData.herbalKnowledgeRecordCount ?? 'unknown'}`,
    `- News items: ${data.publicData.newsItemCount ?? 'unknown'}`,
    `- Source count: ${data.publicData.sourceCount ?? 'unknown'}`,
    `- Feed status: ${data.publicData.feedStatus ?? 'unknown'}`,
    '',
    '## Remaining Production Boundary',
    '',
    ...data.remainingProductionBoundary.map((item) => `- ${item}`),
    '',
  ]

  return lines.join('\n')
}

const jsonOutput = `${JSON.stringify(packet, null, 2)}\n`
const markdownOutput = renderMarkdown(packet)

assert.equal(secretValuePattern.test(`${jsonOutput}\n${markdownOutput}`), false, 'Release evidence must not contain secret-looking values.')
assert(packet.git.commit, 'Release evidence should include a git commit.')
assert(packet.productionContract.finalCompletionGates.includes('npm run verify:goal-readiness -- --strict'), 'Release evidence should include final goal-readiness gate.')

mkdirSync(outputDir, { recursive: true })
writeFileSync(resolve(outputDir, 'herbalisti-release-evidence.json'), jsonOutput)
writeFileSync(resolve(outputDir, 'README.md'), markdownOutput)

console.log(
  JSON.stringify(
    {
      status: 'pass',
      outputDir,
      commit: packet.git.commit,
      goalComplete: packet.goalState.goalComplete,
      localImplementationReady: packet.goalState.localImplementationReady,
      safeToRun: packet.safeToRun,
    },
    null,
    2,
  ),
)
