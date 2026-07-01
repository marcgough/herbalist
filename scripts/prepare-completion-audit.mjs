import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const args = new Set(process.argv.slice(2))
const write = args.has('--write')
const check = args.has('--check')

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const readJson = (path) => JSON.parse(read(path))
const exists = (path) => existsSync(resolve(root, path))

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const runJson = (label, script, scriptArgs = []) => {
  const result = spawnSync(process.execPath, [resolve(root, script), ...scriptArgs], {
    cwd: root,
    encoding: 'utf8',
  })

  if (result.error) {
    throw new Error(`${label} failed: ${result.error.message}`)
  }

  const output = result.stdout.trim()
  if (!output) {
    throw new Error(`${label} did not return JSON output`)
  }

  try {
    return JSON.parse(output)
  } catch (error) {
    throw new Error(`${label} returned non-JSON output: ${error.message}`)
  }
}

const stable = (value) => {
  if (Array.isArray(value)) {
    return value.map(stable)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]))
  }

  return value
}

const signatureFor = (payload) =>
  createHash('sha256')
    .update(JSON.stringify(stable(payload)))
    .digest('hex')

const countBy = (items, keyFn) => {
  const counts = {}
  for (const item of items) {
    for (const key of keyFn(item)) {
      counts[key] = (counts[key] ?? 0) + 1
    }
  }
  return counts
}

const proofStateFor = (status) => {
  switch (status) {
    case 'pass':
      return 'locally_proven'
    case 'pending-production':
      return 'pending_live_production_evidence'
    case 'missing':
      return 'missing_required_evidence'
    default:
      return 'unknown'
  }
}

const markdownStatus = (status) => status.replace(/_/g, ' ')

const tableCell = (value) =>
  String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, '<br>')

const list = (items) => (items.length ? items.map((item) => `- ${item}`).join('\n') : '- None')

const goalReadiness = runJson('Goal readiness audit', 'scripts/verify-goal-readiness.mjs')
const launchPreflight = runJson('Launch preflight', 'scripts/verify-launch-config.mjs', ['--soft'])
const launchPacket = runJson('Launch packet', 'scripts/prepare-launch-packet.mjs')
const contract = readJson('docs/production-environment-contract.json')
const mediaProvenance = readJson('public/data/media-provenance.json')
const referenceBooks = readJson('public/data/reference-books.json')
const herbalKnowledge = readJson('public/data/herbal-knowledge.json')
const remedies = readJson('public/data/remedies.json')
const citationNotes = readJson('public/data/citation-notes.json')
const sources = readJson('public/data/sources.json')
const apiCatalog = readJson('public/data/api-catalog.json')
const news = readJson('public/data/news.json')
const feedStatus = readJson('public/data/feed-status.json')
const corpusRightsAudit = readJson('corpus/exports/corpus-rights-audit-summary.json')
const herbProfileSummary = readJson('corpus/exports/herb-profile-summary.json')

const openAiAssets = (mediaProvenance.assets ?? []).filter((asset) => asset.provider === 'OpenAI image generation')
const corpusProfiles = (herbalKnowledge.records ?? []).filter((record) => record.entryKind === 'corpus-profile')
const requirementMatrix = goalReadiness.requirements.map((item) => ({
  id: item.id,
  requirement: item.requirement,
  status: item.status,
  proofState: proofStateFor(item.status),
  evidence: item.evidence ?? [],
  remaining: item.remaining ?? [],
  caveats: item.caveats ?? [],
}))

const auditBody = {
  version: 1,
  objective: goalReadiness.objective,
  status: goalReadiness.status,
  goalComplete: goalReadiness.goalComplete,
  localImplementationReady: goalReadiness.localImplementationReady,
  counts: goalReadiness.counts,
  evidenceStandard:
    'Completion is only proven when every requirement is either locally proven or live-production proven, and no pending-production or missing requirement remains.',
  productionSignals: goalReadiness.productionSignals,
  requirementMatrix,
  dataSnapshot: {
    referenceBooks: {
      total: referenceBooks.total,
      source: referenceBooks.source,
    },
    herbalKnowledge: {
      total: herbalKnowledge.total,
      sourceWorks: herbalKnowledge.sources?.length ?? 0,
      corpusProfiles: corpusProfiles.length,
      profileCount: herbProfileSummary.profileCount,
      totalMatchedChunks: herbProfileSummary.totalMatchedChunks,
    },
    remedies: {
      total: remedies.total,
    },
    citationNotes: {
      total: citationNotes.total,
    },
    sources: {
      total: sources.total,
      allowlisted: (sources.records ?? []).filter((source) => source.isAllowlisted && !source.isBigPharmaRelated).length,
    },
    apiCatalog: {
      endpointCount: apiCatalog.endpointCount,
      publicEndpointCount: apiCatalog.publicEndpointCount,
      protectedEndpointCount: apiCatalog.protectedEndpointCount,
    },
    news: {
      generatedAt: news.generatedAt,
      total: news.items?.length ?? 0,
      topicCounts: countBy(news.items ?? [], (item) => item.topics ?? []),
      sourceCounts: countBy(news.items ?? [], (item) => [item.sourceName].filter(Boolean)),
      latestRefreshStatus: feedStatus.latestRefresh?.status ?? null,
      publicSnapshot: feedStatus.publicSnapshot ?? null,
    },
    media: {
      openAiImageAssets: openAiAssets.length,
      openAiImageGen2Assets: openAiAssets.filter((asset) => asset.generationWorkflow?.includes('Image Gen 2')).length,
    },
    corpusRights: {
      status: corpusRightsAudit.status,
      totalWorks: corpusRightsAudit.counts?.totalWorks,
      chunkedWorks: corpusRightsAudit.counts?.chunkedWorks,
      chunkRecords: corpusRightsAudit.counts?.chunkRecords,
      paragraphRecords: corpusRightsAudit.counts?.paragraphRecords,
    },
  },
  launchReadiness: {
    status: launchPreflight.status,
    productionReady: launchPreflight.productionReady,
    blockers: launchPreflight.blockers ?? [],
    warnings: launchPreflight.warnings ?? [],
    checked: launchPreflight.checked,
    nextActions: launchPreflight.nextActions ?? [],
  },
  productionContract: {
    domain: contract.project.domain,
    pagesProject: contract.project.pagesProject,
    newsWorker: contract.project.newsWorker,
    d1Database: contract.project.d1Database,
    requiredResources: contract.resources.filter((resource) => resource.required).map((resource) => resource.id),
    requiredLaunchSecrets: contract.secrets.filter((secret) => secret.requiredForLaunch).map((secret) => secret.name),
    safePreflight: contract.commands.safePreflight,
    finalCompletionGates: contract.commands.finalCompletionGates ?? [
      ...(contract.commands.postDeployEvidence ?? []),
      ...(contract.commands.liveCompletionGates ?? []),
    ],
    liveCompletionGates: contract.commands.liveCompletionGates,
    guardrails: contract.guardrails,
  },
  launchPacket: {
    status: launchPacket.status,
    blockerCount: launchPacket.blockers?.length ?? 0,
    nextCommand: launchPacket.nextCommand,
  },
  outputFiles: {
    json: 'docs/objective-completion-audit.json',
    markdown: 'docs/objective-completion-audit.md',
  },
}

const auditSignature = signatureFor(auditBody)
const payload = {
  generatedAt: new Date().toISOString(),
  auditSignature,
  ...auditBody,
}

const statusRows = requirementMatrix
  .map((item) =>
    [
      item.id,
      item.status,
      item.proofState,
      item.evidence.slice(0, 4).join('<br>'),
      item.remaining.slice(0, 3).join('<br>') || 'None',
    ],
  )
  .map((row) => `| ${row.map(tableCell).join(' |')} |`)
  .join('\n')

const markdownOutput = `# Herbalisti Objective Completion Audit

Generated: ${payload.generatedAt}

## Objective

${payload.objective}

## Current Status

- Status: \`${payload.status}\`
- Goal complete: \`${payload.goalComplete}\`
- Local implementation ready: \`${payload.localImplementationReady}\`
- Audit signature: \`${payload.auditSignature}\`

## Completion Rule

${payload.evidenceStandard}

## Requirement Matrix

| Requirement | Status | Proof state | Evidence sample | Remaining |
| --- | --- | --- | --- | --- |
${statusRows}

## Launch Readiness

- Launch preflight status: \`${payload.launchReadiness.status}\`
- Production ready: \`${payload.launchReadiness.productionReady}\`
- Checked files/scripts/passes: \`${payload.launchReadiness.checked?.files ?? 0}/${payload.launchReadiness.checked?.scripts ?? 0}/${payload.launchReadiness.checked?.passes ?? 0}\`

### Current Blockers

${list(payload.launchReadiness.blockers)}

### Next Actions

${list(payload.launchReadiness.nextActions)}

## Production Contract

- Domain: \`${payload.productionContract.domain}\`
- Pages project: \`${payload.productionContract.pagesProject}\`
- D1 database: \`${payload.productionContract.d1Database}\`
- News Worker: \`${payload.productionContract.newsWorker}\`
- Required resources: ${payload.productionContract.requiredResources.join(', ')}
- Required launch secrets: ${payload.productionContract.requiredLaunchSecrets.join(', ')}

Final completion gates:

${list(payload.productionContract.finalCompletionGates)}

Live-domain completion gates:

${list(payload.productionContract.liveCompletionGates)}

## Data Snapshot

- Reference books: \`${payload.dataSnapshot.referenceBooks.total}\`
- Herbal commons records: \`${payload.dataSnapshot.herbalKnowledge.total}\`
- Herbal source works: \`${payload.dataSnapshot.herbalKnowledge.sourceWorks}\`
- Corpus profiles: \`${payload.dataSnapshot.herbalKnowledge.corpusProfiles}\`
- Remedies: \`${payload.dataSnapshot.remedies.total}\`
- Citation notes: \`${payload.dataSnapshot.citationNotes.total}\`
- Allowlisted source records: \`${payload.dataSnapshot.sources.allowlisted}\`
- API endpoints catalogued: \`${payload.dataSnapshot.apiCatalog.endpointCount}\`
- Public API endpoints: \`${payload.dataSnapshot.apiCatalog.publicEndpointCount}\`
- Protected API endpoints: \`${payload.dataSnapshot.apiCatalog.protectedEndpointCount}\`
- Current news signals: \`${payload.dataSnapshot.news.total}\`
- Current news refresh status: \`${payload.dataSnapshot.news.latestRefreshStatus}\`
- OpenAI Image Gen 2 assets: \`${payload.dataSnapshot.media.openAiImageGen2Assets}\`
- Corpus rights status: \`${payload.dataSnapshot.corpusRights.status}\`

## Verification

Use:

\`\`\`bash
npm run verify:completion-audit
\`\`\`

This verifier recomputes the audit signature from current local evidence and fails if the JSON or Markdown artifact has drifted.
`

const jsonPath = resolve(root, payload.outputFiles.json)
const markdownPath = resolve(root, payload.outputFiles.markdown)

if (write) {
  await mkdir(resolve(root, 'docs'), { recursive: true })
  await writeFile(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  await writeFile(markdownPath, markdownOutput, 'utf8')
}

if (check) {
  assert(exists(payload.outputFiles.json), `${payload.outputFiles.json} is missing`)
  assert(exists(payload.outputFiles.markdown), `${payload.outputFiles.markdown} is missing`)
  const existingJson = readJson(payload.outputFiles.json)
  const existingMarkdown = read(payload.outputFiles.markdown)
  assert(existingJson.auditSignature === auditSignature, 'Objective completion audit JSON is stale')
  assert(existingMarkdown.includes(`Audit signature: \`${auditSignature}\``), 'Objective completion audit Markdown is stale')
  assert(existingMarkdown.includes('## Requirement Matrix'), 'Objective completion audit Markdown is missing the requirement matrix')
  assert(existingMarkdown.includes('## Launch Readiness'), 'Objective completion audit Markdown is missing launch readiness')
}

console.log(
  JSON.stringify(
    {
      status: check ? 'pass' : write ? 'written' : payload.status,
      auditSignature,
      goalComplete: payload.goalComplete,
      localImplementationReady: payload.localImplementationReady,
      requirementCounts: payload.counts,
      launchStatus: payload.launchReadiness.status,
      outputFiles: payload.outputFiles,
      safeToRun:
        'This script reads local project evidence and optionally writes docs/objective-completion-audit files. It does not deploy, mutate DNS, call paid APIs, or print secret values.',
    },
    null,
    2,
  ),
)
