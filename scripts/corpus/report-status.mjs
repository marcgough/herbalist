import { readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { chunksDir, exportsDir, loadWorksRegistry, summarizeManifestArchive } from './lib.mjs'

const works = await loadWorksRegistry()
const chunked = works.filter((work) => work.ingest_status === 'chunked')
const failed = works.filter((work) => work.ingest_status === 'download_failed')
const discovered = works.filter((work) => work.ingest_status === 'discovered')
const byCollection = works.reduce((collections, work) => {
  const key = work.collection_id || 'unknown'
  collections[key] ??= { total: 0, chunked: 0, discovered: 0, failed: 0, chunkRecords: 0, paragraphRecords: 0 }
  collections[key].total += 1
  if (work.ingest_status === 'chunked') collections[key].chunked += 1
  if (work.ingest_status === 'discovered') collections[key].discovered += 1
  if (work.ingest_status === 'download_failed') collections[key].failed += 1
  return collections
}, {})
const manifestSummary = await summarizeManifestArchive()

for (const [collectionId, counts] of Object.entries(manifestSummary.byCollection)) {
  byCollection[collectionId] ??= { total: 0, chunked: 0, discovered: 0, failed: 0, chunkRecords: 0, paragraphRecords: 0 }
  byCollection[collectionId].chunkRecords = counts.chunkRecords
  byCollection[collectionId].paragraphRecords = counts.paragraphRecords
}

const corpusSummaries = []
try {
  const files = await readdir(exportsDir)
  for (const file of files.filter((name) => name.endsWith('-corpus-summary.json'))) {
    try {
      corpusSummaries.push(JSON.parse(await readFile(resolve(exportsDir, file), 'utf8')))
    } catch {
      // Ignore unreadable summary files and continue.
    }
  }
} catch {
  // Ignore export directory issues and continue with the core registry report.
}

const latestSummary =
  corpusSummaries.length > 0
    ? [...corpusSummaries].sort(
        (left, right) => new Date(right.generatedAt ?? 0).getTime() - new Date(left.generatedAt ?? 0).getTime(),
      )[0]
    : null

const summariesByCollection = Object.fromEntries(
  corpusSummaries.map((summary) => [summary.sourceCollectionId ?? 'unknown', summary]),
)

let editionFamilySummary = null
try {
  editionFamilySummary = JSON.parse(await readFile(resolve(exportsDir, 'edition-family-summary.json'), 'utf8'))
} catch {
  // Ignore missing edition-family summary until that layer has been generated.
}

let corpusEvidenceSummary = null
try {
  corpusEvidenceSummary = JSON.parse(await readFile(resolve(exportsDir, 'corpus-evidence-summary.json'), 'utf8'))
} catch {
  // Ignore missing corpus-evidence summary until that layer has been generated.
}

let termFamilySummary = null
try {
  termFamilySummary = JSON.parse(await readFile(resolve(exportsDir, 'term-family-summary.json'), 'utf8'))
} catch {
  // Ignore missing term-family summary until that layer has been generated.
}

let seedCatalogSummary = null
try {
  seedCatalogSummary = JSON.parse(await readFile(resolve(exportsDir, 'seed-catalog-summary.json'), 'utf8'))
} catch {
  // Ignore missing seed-catalog summary until that layer has been generated.
}

let herbProfileSummary = null
try {
  herbProfileSummary = JSON.parse(await readFile(resolve(exportsDir, 'herb-profile-summary.json'), 'utf8'))
} catch {
  // Ignore missing herb-profile summary until that layer has been generated.
}

let seedReviewPrioritySummary = null
try {
  seedReviewPrioritySummary = JSON.parse(await readFile(resolve(exportsDir, 'seed-review-priority-summary.json'), 'utf8'))
} catch {
  // Ignore missing seed-review-priority summary until that layer has been generated.
}

let acquisitionFrontierSummary = null
try {
  acquisitionFrontierSummary = JSON.parse(await readFile(resolve(exportsDir, 'acquisition-frontier-summary.json'), 'utf8'))
} catch {
  // Ignore missing acquisition-frontier summary until that layer has been generated.
}

let thinWorkReviewSummary = null
try {
  thinWorkReviewSummary = JSON.parse(await readFile(resolve(exportsDir, 'thin-work-review-summary.json'), 'utf8'))
} catch {
  // Ignore missing thin-work review summary until that layer has been generated.
}

const topicCounts = chunked.reduce((counts, work) => {
  for (const topic of (work.topic_family ?? '').split(';').filter(Boolean)) {
    counts[topic] = (counts[topic] ?? 0) + 1
  }
  return counts
}, {})

console.log(
  JSON.stringify(
    {
      totalWorks: works.length,
      chunkedCount: chunked.length,
      discoveredCount: discovered.length,
      failedCount: failed.length,
      totalChunkRecords: manifestSummary.totalChunkRecords,
      totalParagraphRecords: manifestSummary.totalParagraphRecords,
      manifestWorkCount: manifestSummary.totalWorks,
      byCollection,
      topTopics: Object.entries(topicCounts)
        .sort((left, right) => right[1] - left[1])
        .slice(0, 12),
      latestSummary,
      editionFamilySummary,
      acquisitionFrontierSummary,
      thinWorkReviewSummary,
      corpusEvidenceSummary,
      termFamilySummary,
      seedCatalogSummary,
      herbProfileSummary,
      seedReviewPrioritySummary,
      summariesByCollection,
      chunksDirectory: chunksDir,
    },
    null,
    2,
  ),
)
