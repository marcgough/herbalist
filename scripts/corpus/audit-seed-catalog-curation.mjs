import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { corpusDir, derivedDir, exportsDir, readCsvFile, writeJson } from './lib.mjs'

const reviewDir = resolve(corpusDir, 'review')
const decisionsCsvPath = resolve(reviewDir, 'seed-catalog-decisions.csv')
const seedCatalogDir = resolve(derivedDir, 'seed-catalog')
const seedReadyCsvPath = resolve(seedCatalogDir, 'seed-ready-families.csv')
const supportingCsvPath = resolve(seedCatalogDir, 'catalog.csv')
const acceptedPlantFamiliesPath = resolve(derivedDir, 'term-families', 'accepted-plant-families.csv')
const seedCatalogBuilderPath = resolve(resolve(exportsDir, '..', '..'), 'scripts', 'corpus', 'build-seed-catalog.mjs')
const summaryPath = resolve(exportsDir, 'seed-catalog-curation-audit.json')

const normalizeKey = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const decisions = await readCsvFile(decisionsCsvPath)
const seedReadyRows = await readCsvFile(seedReadyCsvPath)
const catalogRows = await readCsvFile(supportingCsvPath)
const acceptedPlantFamilyRows = await readCsvFile(acceptedPlantFamiliesPath)

const rowsByStatus = catalogRows.reduce((statuses, row) => {
  const status = row.catalog_status || 'unknown'
  statuses[status] ??= []
  statuses[status].push(row)
  return statuses
}, {})

const seedReadyRowsByKey = new Map(
  seedReadyRows.flatMap((row) => {
    const keys = [normalizeKey(row.canonical_key), normalizeKey(row.canonical_name)].filter(Boolean)
    return keys.map((key) => [key, row])
  }),
)

const supportingRowsByKey = new Map(
  (rowsByStatus.supporting ?? []).flatMap((row) => {
    const keys = [normalizeKey(row.canonical_key), normalizeKey(row.canonical_name)].filter(Boolean)
    return keys.map((key) => [key, row])
  }),
)

const acceptedRowsByKey = new Map(
  acceptedPlantFamilyRows.flatMap((row) => {
    const keys = [normalizeKey(row.canonical_key), normalizeKey(row.canonical_name)].filter(Boolean)
    return keys.map((key) => [key, row])
  }),
)

const builderSource = await readFile(seedCatalogBuilderPath, 'utf8')
const highConfidenceStart = builderSource.indexOf('const highConfidenceSeedTerms = new Set([')
const highConfidenceEnd = builderSource.indexOf('])', highConfidenceStart)
const highConfidenceBlock =
  highConfidenceStart >= 0 && highConfidenceEnd > highConfidenceStart
    ? builderSource.slice(highConfidenceStart, highConfidenceEnd)
    : ''
const highConfidenceSeedTerms = [...highConfidenceBlock.matchAll(/'([^']+)'/g)].map((match) => match[1])

const summarizeDecisionTarget = (row) => ({
  matchKey: row.match_key,
  expectedKey: normalizeKey(row.canonical_key_override || row.canonical_name_override || row.match_key),
  expectedName: row.canonical_name_override || row.canonical_key_override || row.match_key,
  decisionNote: row.decision_note,
})

const manualSeedReadyDecisions = decisions
  .filter((row) => row.catalog_status_override === 'seed-ready')
  .map(summarizeDecisionTarget)

const manualSupportingDecisions = decisions
  .filter((row) => row.catalog_status_override === 'supporting')
  .map(summarizeDecisionTarget)

const aliasMergeDecisions = decisions
  .filter((row) => !row.catalog_status_override && (row.canonical_key_override || row.canonical_name_override))
  .map(summarizeDecisionTarget)

const missingManualSeedReadyDecisions = manualSeedReadyDecisions
  .filter((row) => !seedReadyRowsByKey.has(row.expectedKey))
  .map((row) => ({
    ...row,
    status: 'missing-from-seed-ready',
  }))

const missingManualSupportingDecisions = manualSupportingDecisions
  .filter((row) => !supportingRowsByKey.has(row.expectedKey))
  .map((row) => ({
    ...row,
    status: 'missing-from-supporting',
  }))

const unresolvedAliasTargets = aliasMergeDecisions
  .filter((row) => !seedReadyRowsByKey.has(row.expectedKey) && !supportingRowsByKey.has(row.expectedKey))
  .map((row) => ({
    ...row,
    status: 'target-not-found-in-seed-or-supporting',
  }))

const seedReadyReasonCounts = seedReadyRows.reduce((counts, row) => {
  const reason = row.catalog_reason || 'unknown'
  counts[reason] = (counts[reason] ?? 0) + 1
  return counts
}, {})

const highConfidenceSeedReadyRows = seedReadyRows.filter((row) => row.catalog_reason === 'curated-high-confidence-seed-term')
const highConfidenceSeedReadyKeys = new Set(highConfidenceSeedReadyRows.map((row) => normalizeKey(row.canonical_key)))
const missingHighConfidenceSeedTerms = highConfidenceSeedTerms
  .filter((term) => !highConfidenceSeedReadyKeys.has(normalizeKey(term)))
  .map((term) => {
    const normalized = normalizeKey(term)
    const catalogRow = catalogRows.find((row) => normalizeKey(row.canonical_key) === normalized) ?? null
    const acceptedRow = acceptedRowsByKey.get(normalized) ?? null
    return {
      expectedTerm: term,
      catalogRow: catalogRow
        ? {
            canonicalName: catalogRow.canonical_name,
            canonicalKey: catalogRow.canonical_key,
            catalogStatus: catalogRow.catalog_status,
            catalogClass: catalogRow.catalog_class,
            catalogReason: catalogRow.catalog_reason,
            totalChunks: Number(catalogRow.total_chunks ?? 0),
            totalWorks: Number(catalogRow.total_works ?? 0),
          }
        : null,
      acceptedPlantFamily: acceptedRow
        ? {
            familyId: acceptedRow.family_id,
            canonicalName: acceptedRow.canonical_name,
            canonicalKey: acceptedRow.canonical_key,
            totalChunks: Number(acceptedRow.total_chunks ?? 0),
            totalWorks: Number(acceptedRow.total_works ?? 0),
            status: acceptedRow.status,
          }
        : null,
    }
  })

const result = {
  generatedAt: new Date().toISOString(),
  decisionRowCount: decisions.length,
  seedReadyFamilyCount: seedReadyRows.length,
  supportingFamilyCount: (rowsByStatus.supporting ?? []).length,
  manualSeedReadyDecisionCount: manualSeedReadyDecisions.length,
  manualSupportingDecisionCount: manualSupportingDecisions.length,
  aliasMergeDecisionCount: aliasMergeDecisions.length,
  seedReadyReasonCounts,
  highConfidenceSeedTermCount: highConfidenceSeedTerms.length,
  automaticSeedReadyCount: highConfidenceSeedReadyRows.length,
  missingHighConfidenceSeedTerms,
  manualSeedReadyDecisionsPresent: manualSeedReadyDecisions.length - missingManualSeedReadyDecisions.length,
  manualSupportingDecisionsPresent: manualSupportingDecisions.length - missingManualSupportingDecisions.length,
  missingManualSeedReadyDecisions,
  missingManualSupportingDecisions,
  unresolvedAliasTargets,
  summaryPath,
}

await writeJson(summaryPath, result)

console.log(JSON.stringify(result, null, 2))
