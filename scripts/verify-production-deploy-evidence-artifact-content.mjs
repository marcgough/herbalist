import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import AdmZip from 'adm-zip'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const tempDir = resolve(root, '.tmp', 'verify-production-deploy-evidence-artifact-content')
const runId = '123456789'
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
const artifactName = 'herbalisti-production-deploy-evidence'

const finalCompletionGates = [
  'npm run verify:production-deploy-evidence-artifact -- --strict --run-id <production_deploy_run_id>',
  'npm run verify:live-readiness -- --strict',
  'npm run verify:production -- https://herbalisti.com',
  'npm run verify:goal-readiness -- --strict',
]

const feedSeedEvidence = {
  schemaVersion: 1,
  generatedAt: '2026-07-02T00:00:00.000Z',
  status: 'pass',
  baseUrl: 'https://herbalisti.com',
  endpoint: 'https://herbalisti.com/api/feed-refresh',
  itemCount: 8,
  persisted: 2,
  refreshRun: {
    status: 'completed',
    triggerType: 'manual',
    itemCount: 8,
    startedAt: '2026-07-02T00:00:00.000Z',
    finishedAt: '2026-07-02T00:00:01.000Z',
  },
}

const baseEvidence = ({ liveVerificationSkipped = false, feedSeedCaptured = true } = {}) => ({
  schemaVersion: 1,
  generatedAt: '2026-07-02T00:00:02.000Z',
  status: 'production-deploy-evidence-ready',
  artifact: {
    name: artifactName,
    outputDirectory: 'output/production-deploy',
    jsonPath: 'output/production-deploy/production-deploy-evidence.json',
    markdownPath: 'output/production-deploy/production-deploy-evidence.md',
    retentionDays: 90,
  },
  site: {
    name: 'Herbalisti',
    url: 'https://herbalisti.com',
    customDomain: 'herbalisti.com',
  },
  github: {
    repository: 'marcgough/herbalist',
    workflow: 'Herbalisti Production Deploy',
    job: 'deploy',
    runId,
    runAttempt: '1',
    runUrl: `https://github.com/marcgough/herbalist/actions/runs/${runId}`,
    sha: commit,
    ref: 'refs/heads/main',
    refName: 'main',
    actor: 'codex-local-fixture',
  },
  deployment: {
    environment: 'production',
    pagesProject: 'herbalisti',
    newsWorker: 'herbalisti-news-refresh',
    d1Database: 'herbalisti',
    jobStatusAtEvidenceStep: 'success',
    liveVerificationSkipped,
    liveVerificationSkipAcknowledged: liveVerificationSkipped,
    liveVerificationMode: liveVerificationSkipped ? 'dns-transition-skip' : 'strict-live-verification',
    feedSeedEvidence: liveVerificationSkipped
      ? {
          status: 'skipped-dns-transition',
          path: 'output/production-deploy/feed-seed-evidence.json',
          summary: null,
        }
      : {
          status: feedSeedCaptured ? 'captured' : 'pending-live-workflow-seed-result',
          path: 'output/production-deploy/feed-seed-evidence.json',
          summary: feedSeedCaptured ? feedSeedEvidence : null,
        },
    completionEvidence: liveVerificationSkipped
      ? 'Not complete: production deploy evidence artifact readback and strict live verification against https://herbalisti.com remain required after DNS is connected.'
      : 'Not complete until this workflow run succeeds, this evidence artifact is uploaded and read back, and strict live verification passes.',
    postDeployEvidenceCommands: [finalCompletionGates[0]],
    requiredLiveVerificationCommands: finalCompletionGates.slice(1),
    finalCompletionGates,
  },
  safety: {
    includesSecretValues: false,
    notes: [
      'This packet records workflow, domain, and verification metadata only.',
      'It does not read or write admin tokens, provider keys, Cloudflare API tokens, or GitHub tokens.',
    ],
  },
})

const writeArtifact = (name, { evidence = baseEvidence(), includeFeedSeedEvidence = true } = {}) => {
  const zip = new AdmZip()
  zip.addFile('production-deploy-evidence.json', Buffer.from(`${JSON.stringify(evidence, null, 2)}\n`, 'utf8'))
  zip.addFile('production-deploy-evidence.md', Buffer.from('# Herbalisti Production Deploy Evidence\n', 'utf8'))
  if (includeFeedSeedEvidence) {
    zip.addFile('feed-seed-evidence.json', Buffer.from(`${JSON.stringify(feedSeedEvidence, null, 2)}\n`, 'utf8'))
  }
  const outputPath = resolve(tempDir, name)
  zip.writeZip(outputPath)
  return outputPath
}

const runVerifier = (archivePath) =>
  spawnSync(
    process.execPath,
    [
      'scripts/verify-production-deploy-evidence-artifact.mjs',
      '--strict',
      '--local-artifact-archive',
      archivePath,
      '--run-id',
      runId,
      '--commit',
      commit,
    ],
    {
      cwd: root,
      encoding: 'utf8',
    },
  )

rmSync(tempDir, { recursive: true, force: true })
mkdirSync(tempDir, { recursive: true })

try {
  const goodArtifact = writeArtifact('good-production-deploy-evidence.zip')
  const goodResult = runVerifier(goodArtifact)
  assert.equal(goodResult.status, 0, `Good artifact should pass strict content inspection\n${goodResult.stderr}`)
  const goodPayload = JSON.parse(goodResult.stdout)
  assert.equal(goodPayload.status, 'pass', 'Good artifact should report pass')
  assert.equal(
    goodPayload.artifactContent?.status,
    'verified-feed-seed-evidence',
    'Good artifact should verify captured feed seed evidence',
  )
  assert.equal(goodPayload.artifactContent?.feedSeedEvidenceStatus, 'captured')
  assert.equal(goodPayload.artifactContent?.feedSeedItemCount, 8)

  const dnsTransitionArtifact = writeArtifact('dns-transition-production-deploy-evidence.zip', {
    evidence: baseEvidence({ liveVerificationSkipped: true }),
    includeFeedSeedEvidence: false,
  })
  const dnsTransitionResult = runVerifier(dnsTransitionArtifact)
  assert.equal(
    dnsTransitionResult.status,
    0,
    `DNS-transition artifact should pass as non-final deployment evidence\n${dnsTransitionResult.stderr}`,
  )
  const dnsTransitionPayload = JSON.parse(dnsTransitionResult.stdout)
  assert.equal(dnsTransitionPayload.artifactContent?.status, 'verified-dns-transition-skip')
  assert.equal(dnsTransitionPayload.artifactContent?.feedSeedEvidenceStatus, 'skipped-dns-transition')

  const missingFeedArtifact = writeArtifact('missing-feed-production-deploy-evidence.zip', {
    includeFeedSeedEvidence: false,
  })
  const missingFeedResult = runVerifier(missingFeedArtifact)
  assert.notEqual(missingFeedResult.status, 0, 'Artifact missing feed seed evidence should fail strict content inspection')
  const missingFeedPayload = JSON.parse(missingFeedResult.stdout)
  assert.equal(missingFeedPayload.status, 'invalid-production-deploy-evidence-artifact-content')
  assert(
    missingFeedPayload.detail.includes('Missing feed seed evidence JSON'),
    'Failure detail should explain that feed seed evidence JSON is missing',
  )

  const weakFeedArtifact = writeArtifact('weak-feed-production-deploy-evidence.zip', {
    evidence: baseEvidence({ feedSeedCaptured: false }),
  })
  const weakFeedResult = runVerifier(weakFeedArtifact)
  assert.notEqual(weakFeedResult.status, 0, 'Artifact with uncaptured feed seed evidence should fail strict inspection')
  const weakFeedPayload = JSON.parse(weakFeedResult.stdout)
  assert.equal(weakFeedPayload.status, 'invalid-production-deploy-evidence-artifact-content')
  assert(
    weakFeedPayload.detail.includes('Strict production evidence should capture feed seed evidence'),
    'Failure detail should explain that strict production evidence must capture feed seed evidence',
  )

  console.log(
    JSON.stringify(
      {
        status: 'pass',
        fixtures: [
          'good-production-deploy-evidence.zip',
          'dns-transition-production-deploy-evidence.zip',
          'missing-feed-production-deploy-evidence.zip',
          'weak-feed-production-deploy-evidence.zip',
        ],
        verified: [
          'strict captured feed-seed artifact content',
          'strict DNS-transition artifact boundary',
          'failure on missing feed seed evidence JSON',
          'failure on uncaptured strict feed seed evidence',
        ],
        safeToRun:
          'Builds local synthetic artifact ZIPs and runs the artifact verifier against them. It does not call GitHub, deploy, mutate DNS, create resources, set secrets, call paid APIs, or print credential values.',
      },
      null,
      2,
    ),
  )
} finally {
  rmSync(tempDir, { recursive: true, force: true })
}
