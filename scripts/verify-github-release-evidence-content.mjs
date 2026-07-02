import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import AdmZip from 'adm-zip'
import {
  feedPolicyText,
  inspectReleaseEvidenceArchive,
  requiredSignalSources,
  requiredSignalTopics,
} from './lib/release-evidence-artifact.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const tempDir = resolve(root, '.tmp', 'verify-github-release-evidence-content')
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()

const countMap = (values) => Object.fromEntries(values.map((value, index) => [value, index + 1]))
const sourceHealthRecords = () =>
  requiredSignalSources.map((source, index) => ({
    id: source.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name: source,
    url: `https://example.org/${index + 1}`,
    sourceType: index < 4 ? 'public-research-index' : 'independent-longevity',
    status: index < 4 ? 'ok' : 'empty',
    checkedAt: '2026-07-02T00:00:00.000Z',
    itemCount: index < 4 ? 3 : 0,
    usableItemCount: index < 4 ? 2 : 0,
    newestItemAt: index < 4 ? '2026-07-01T18:22:10.000Z' : null,
    warning: '',
    isAllowlisted: true,
    isBigPharmaRelated: false,
  }))

const baseEvidence = () => ({
  version: 1,
  generatedAt: '2026-07-02T00:00:00.000Z',
  status: 'repository-release-verifier-passed',
  git: {
    commit,
    branch: 'main',
  },
  productionComplete: false,
  goalState: {
    localImplementationReady: true,
    goalComplete: false,
    auditStatus: 'local-ready-production-pending',
  },
  productionContract: {
    finalCompletionGates: [
      'npm run verify:github-release-evidence -- --commit <dispatch_commit_sha>',
      'npm run verify:production-deploy-evidence-artifact -- --strict --run-id <production_deploy_run_id>',
      'npm run verify:live-readiness -- --strict',
      'npm run verify:production -- https://herbalisti.com',
      'npm run verify:goal-readiness -- --strict',
    ],
  },
  publicData: {
    signalsFeed: {
      itemCount: 16,
      topicCoveragePercent: 100,
      topics: requiredSignalTopics,
      topicCounts: countMap(requiredSignalTopics),
      missingTopics: [],
      sources: requiredSignalSources,
      sourceCounts: countMap(requiredSignalSources),
      missingSources: [],
      blockedSignalTerms: [],
      policy: feedPolicyText,
      feedStatus: 'completed',
      feedWarningCount: 0,
      generatedAt: '2026-07-02T00:00:00.000Z',
      newestSignalAt: '2026-07-01T18:22:10.000Z',
      sourceHealthCounts: {
        ok: 4,
        empty: 2,
        warning: 0,
      },
      sourceHealthRecords: sourceHealthRecords(),
      sourcePreservation: {
        strategy: 'preserve-empty-lanes-for-source-coverage',
        lanes: requiredSignalSources,
      },
      feedWarnings: [],
    },
  },
})

const copyEvidence = () => JSON.parse(JSON.stringify(baseEvidence()))

const writeArtifact = (name, { evidence = baseEvidence(), readme = '# Herbalisti Release Evidence\n' } = {}) => {
  const zip = new AdmZip()
  zip.addFile('output/release-evidence/herbalisti-release-evidence.json', Buffer.from(`${JSON.stringify(evidence, null, 2)}\n`, 'utf8'))
  zip.addFile('README.md', Buffer.from(readme, 'utf8'))
  const outputPath = resolve(tempDir, name)
  zip.writeZip(outputPath)
  return outputPath
}

const inspectArtifact = (archivePath, expectedCommit = commit) =>
  inspectReleaseEvidenceArchive(readFileSync(archivePath), expectedCommit)

const expectFailure = (label, archivePath, expectedPattern) => {
  let detail = ''
  try {
    inspectArtifact(archivePath)
  } catch (error) {
    detail = String(error.message ?? error)
  }
  assert(detail, `${label} should fail release evidence content inspection.`)
  assert.match(detail, expectedPattern, `${label} should fail with a useful assertion message.`)
  return {
    label,
    detail,
  }
}

rmSync(tempDir, { recursive: true, force: true })
mkdirSync(tempDir, { recursive: true })

try {
  const goodArtifact = writeArtifact('good-release-evidence.zip')
  const goodPayload = inspectArtifact(goodArtifact)
  assert.equal(goodPayload.status, 'verified-release-evidence-content')
  assert.equal(goodPayload.itemCount, 16)
  assert.equal(goodPayload.topicCoveragePercent, 100)
  assert.deepEqual(goodPayload.topics, requiredSignalTopics)
  assert.deepEqual(goodPayload.sources, requiredSignalSources)
  assert.equal(goodPayload.sourceHealthRecords.length, requiredSignalSources.length)
  assert.deepEqual(
    goodPayload.sourceHealthRecords.map((source) => source.name),
    requiredSignalSources,
  )

  const missingTopic = copyEvidence()
  missingTopic.publicData.signalsFeed.topics = missingTopic.publicData.signalsFeed.topics.filter((topic) => topic !== 'Peptides')
  delete missingTopic.publicData.signalsFeed.topicCounts.Peptides
  missingTopic.publicData.signalsFeed.missingTopics = ['Peptides']
  const missingTopicArtifact = writeArtifact('missing-topic-release-evidence.zip', { evidence: missingTopic })

  const blockedTerm = copyEvidence()
  blockedTerm.publicData.signalsFeed.blockedSignalTerms = ['Pfizer']
  const blockedTermArtifact = writeArtifact('blocked-term-release-evidence.zip', { evidence: blockedTerm })

  const wrongCommit = copyEvidence()
  wrongCommit.git.commit = '0000000000000000000000000000000000000000'
  const wrongCommitArtifact = writeArtifact('wrong-commit-release-evidence.zip', { evidence: wrongCommit })

  const secretReadmeArtifact = writeArtifact('secret-readme-release-evidence.zip', {
    readme: 'Bearer abcdefghijklmnopqrstuvwxyz0123456789',
  })

  const productionComplete = copyEvidence()
  productionComplete.productionComplete = true
  productionComplete.goalState.goalComplete = true
  const productionCompleteArtifact = writeArtifact('production-complete-release-evidence.zip', {
    evidence: productionComplete,
  })

  const missingSourceHealthRecord = copyEvidence()
  missingSourceHealthRecord.publicData.signalsFeed.sourceHealthRecords =
    missingSourceHealthRecord.publicData.signalsFeed.sourceHealthRecords.filter((source) => source.name !== 'arXiv')
  const missingSourceHealthRecordArtifact = writeArtifact('missing-source-health-record-release-evidence.zip', {
    evidence: missingSourceHealthRecord,
  })

  const warningWithoutDetail = copyEvidence()
  warningWithoutDetail.publicData.signalsFeed.sourceHealthCounts.warning = 1
  warningWithoutDetail.publicData.signalsFeed.sourceHealthCounts.ok = 3
  warningWithoutDetail.publicData.signalsFeed.sourceHealthRecords[0].status = 'warning'
  warningWithoutDetail.publicData.signalsFeed.feedStatus = 'completed_with_warnings'
  warningWithoutDetail.publicData.signalsFeed.feedWarningCount = 1
  warningWithoutDetail.publicData.signalsFeed.feedWarnings = []
  const warningWithoutDetailArtifact = writeArtifact('warning-without-detail-release-evidence.zip', {
    evidence: warningWithoutDetail,
  })

  const failures = [
    expectFailure('missing topic fixture', missingTopicArtifact, /missing Signals topics|Peptides/),
    expectFailure('blocked term fixture', blockedTermArtifact, /Big Pharma blocklist terms/),
    expectFailure('wrong commit fixture', wrongCommitArtifact, /match the verified commit/),
    expectFailure('secret README fixture', secretReadmeArtifact, /secret-looking value/),
    expectFailure('production-complete fixture', productionCompleteArtifact, /production-pending completion boundary/),
    expectFailure('missing source-health record fixture', missingSourceHealthRecordArtifact, /source-health record for arXiv/),
    expectFailure('warning without detail fixture', warningWithoutDetailArtifact, /warning text/),
  ]

  console.log(
    JSON.stringify(
      {
        status: 'pass',
        commit,
        fixtures: [
          'good-release-evidence.zip',
          'missing-topic-release-evidence.zip',
          'blocked-term-release-evidence.zip',
          'wrong-commit-release-evidence.zip',
          'secret-readme-release-evidence.zip',
          'production-complete-release-evidence.zip',
          'missing-source-health-record-release-evidence.zip',
          'warning-without-detail-release-evidence.zip',
        ],
        verified: [
          'valid release evidence artifact content',
          'failure on missing Signals topic coverage',
          'failure on Big Pharma blocklist evidence',
          'failure on mismatched commit',
          'failure on secret-looking artifact text',
          'failure when production completion boundary is crossed early',
          'failure on missing source-health record',
          'failure when warning counts lack warning details',
        ],
        failureDetails: failures,
        safeToRun:
          'Builds local synthetic release-evidence artifact ZIPs and inspects them in memory. It does not call GitHub, deploy, mutate DNS, create resources, set secrets, call paid APIs, or print credential values.',
      },
      null,
      2,
    ),
  )
} finally {
  rmSync(tempDir, { recursive: true, force: true })
}
