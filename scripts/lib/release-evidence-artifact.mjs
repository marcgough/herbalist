import assert from 'node:assert/strict'
import AdmZip from 'adm-zip'

export const requiredSignalTopics = [
  'CRISPR',
  'DNA modification',
  'Gene editing',
  'Gene therapy',
  'Health as a service',
  'Longevity',
  'Peptides',
  'Self-sovereign wellbeing',
]

export const requiredSignalSources = ['Crossref', 'Fight Aging!', 'Lifespan.io', 'PubMed / NCBI', 'arXiv', 'bioRxiv']

export const feedPolicyText =
  'Herbalisti allowlist: public research APIs and independent longevity sources; Big Pharma names and off-topic metadata drift filtered before publication.'

export const secretValuePattern =
  /(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]+|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i

export const normalizeZipPath = (path) => String(path ?? '').replace(/\\/g, '/').replace(/^\/+/, '')

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

export const inspectReleaseEvidenceArchive = (archiveBuffer, expectedCommit) => {
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
