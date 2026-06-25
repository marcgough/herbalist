import assert from 'node:assert/strict'
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

import {
  chunksDir,
  normalizedDir,
  readCsvFile,
  worksDir,
  worksRegistryPath,
} from './corpus/lib.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

const allowedCollections = new Set(['project-gutenberg', 'nlm-digital-collections', 'wellcome-collection'])
const allowedRightsStatuses = new Set([
  'public_domain_mark',
  'public_domain_us',
  'public_domain_usa',
  'pdm',
  'cc-by',
  'cc0',
  'cc-by-sa',
])
const allowedJurisdictionLanes = new Set(['US', 'UK', 'Australia'])
const allowedAcquisitionModes = new Set([
  'direct_download',
  'official_search_plus_browser_ocr',
  'api_plus_iiif',
  'api_plus_iiif_pdf_ocr',
])
const allowedOcrModes = new Set([
  'hosted_text',
  'nlm_ocr_page',
  'wellcome_text_api',
  'wellcome_text_zip_fallback',
  'wellcome_alto_fallback',
  'wellcome_pdf_local_ocr',
])
const allowedReferenceStatuses = new Set(['public_domain_us', 'public_domain_mark', 'pdm', 'cc-by'])
const allowedHerbalLicenses = new Set(['public_domain_usa', 'public_domain_mark', 'pdm', 'cc-by'])
const sourceUrlPattern =
  /^https:\/\/(www\.gutenberg\.org\/ebooks\/|collections\.nlm\.nih\.gov\/catalog\/|wellcomecollection\.org\/works\/)/i
const metadataUrlPattern =
  /^(https?:\/\/resource\.nlm\.nih\.gov\/|https:\/\/www\.gutenberg\.org\/ebooks\/|https:\/\/wellcomecollection\.org\/works\/|https:\/\/api\.wellcomecollection\.org\/catalogue\/v2\/works\/)/i
const blockedAcquisitionPattern = /scrape|blog|newspaper|news|serial|rss|feed|social/i
const weakRightsPattern = /unknown|copyright|restricted|permission pending|not reviewed/i

const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const fileSize = (path) => (existsSync(path) ? statSync(path).size : 0)
const countBy = (items, selector) =>
  items.reduce((counts, item) => {
    const key = selector(item) || 'blank'
    counts[key] = (counts[key] ?? 0) + 1
    return counts
  }, {})

const addFailure = (failures, work, message) => {
  failures.push({
    workId: work.work_id,
    collectionId: work.collection_id,
    rightsStatus: work.rights_status,
    ingestStatus: work.ingest_status,
    message,
  })
}

export const buildCorpusRightsAudit = async () => {
  const works = await readCsvFile(worksRegistryPath)
  const chunked = works.filter((work) => work.ingest_status === 'chunked')
  const discovered = works.filter((work) => work.ingest_status === 'discovered')
  const failed = works.filter((work) => work.ingest_status === 'download_failed')
  const failures = []

  for (const work of works) {
    if (!allowedCollections.has(work.collection_id)) {
      addFailure(failures, work, 'Collection is not in the approved no-key corpus lanes.')
    }
    if (!allowedRightsStatuses.has(work.rights_status)) {
      addFailure(failures, work, 'Rights status is not approved for corpus inclusion.')
    }
    if (!allowedJurisdictionLanes.has(work.jurisdiction_lane)) {
      addFailure(failures, work, 'Jurisdiction lane is not one of US, UK, or Australia.')
    }
    if (!sourceUrlPattern.test(work.source_url ?? '')) {
      addFailure(failures, work, 'Source URL is missing or not from an approved public archive.')
    }
    if (!metadataUrlPattern.test(work.metadata_url ?? '')) {
      addFailure(failures, work, 'Metadata URL is missing or not from an approved public archive.')
    }
    if (!allowedAcquisitionModes.has(work.acquisition_mode)) {
      addFailure(failures, work, 'Acquisition mode is outside approved official/direct lanes.')
    }
    if (!allowedOcrModes.has(work.ocr_mode)) {
      addFailure(failures, work, 'OCR/text mode is outside approved hosted or local official lanes.')
    }
    if (blockedAcquisitionPattern.test(`${work.collection_id} ${work.source_url} ${work.download_url} ${work.acquisition_mode} ${work.ocr_mode}`)) {
      addFailure(failures, work, 'Work looks like web scraping, feeds, serial content, or non-book acquisition.')
    }
    if (weakRightsPattern.test(`${work.rights_status} ${work.reuse_license} ${work.rights_basis}`)) {
      addFailure(failures, work, 'Rights metadata contains weak or restricted language.')
    }
  }

  const chunkArtifactFailures = []
  let totalManifestChunks = 0
  let totalManifestParagraphs = 0

  for (const work of chunked) {
    for (const [field, value] of [
      ['download_url', work.download_url],
      ['reuse_license', work.reuse_license],
      ['rights_basis', work.rights_basis],
      ['topic_family', work.topic_family],
      ['review_status', work.review_status],
    ]) {
      if (!String(value ?? '').trim()) {
        addFailure(failures, work, `Chunked work is missing ${field}.`)
      }
    }

    const manifestPath = resolve(worksDir, work.work_id, 'manifest.json')
    const chunkPath = resolve(chunksDir, `${work.work_id}.jsonl`)
    const normalizedPath = resolve(normalizedDir, work.work_id, 'text.md')

    if (!existsSync(manifestPath)) {
      chunkArtifactFailures.push({ workId: work.work_id, message: 'Missing manifest.json' })
      continue
    }

    let manifest
    try {
      manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    } catch {
      chunkArtifactFailures.push({ workId: work.work_id, message: 'Unreadable manifest.json' })
      continue
    }

    const chunkCount = Number(manifest.chunkCount ?? 0)
    const paragraphCount = Number(manifest.paragraphCount ?? 0)
    totalManifestChunks += chunkCount
    totalManifestParagraphs += paragraphCount

    if (manifest.rightsStatus !== work.rights_status) {
      chunkArtifactFailures.push({ workId: work.work_id, message: 'Manifest rights status does not match registry.' })
    }
    if (manifest.collectionId !== work.collection_id) {
      chunkArtifactFailures.push({ workId: work.work_id, message: 'Manifest collection does not match registry.' })
    }
    if (chunkCount <= 0 || paragraphCount <= 0) {
      chunkArtifactFailures.push({ workId: work.work_id, message: 'Manifest has no chunk or paragraph records.' })
    }
    if (fileSize(chunkPath) <= 0) {
      chunkArtifactFailures.push({ workId: work.work_id, message: 'Chunk JSONL is missing or empty.' })
    }
    if (fileSize(normalizedPath) <= 0) {
      chunkArtifactFailures.push({ workId: work.work_id, message: 'Normalized text is missing or empty.' })
    }
  }

  const referenceExport = readJson('public/data/reference-books.json')
  const herbalExport = readJson('public/data/herbal-knowledge.json')
  const referenceExportFailures = (referenceExport.records ?? []).filter(
    (record) =>
      !sourceUrlPattern.test(record.externalUrl ?? '') ||
      !allowedReferenceStatuses.has(String(record.sourceStatus ?? '')) ||
      !allowedJurisdictionLanes.has(String(record.rightsLane ?? '')) ||
      !Array.isArray(record.searchRegions) ||
      record.searchRegions.some((region) => !allowedJurisdictionLanes.has(String(region ?? ''))),
  )
  const herbalSourceFailures = (herbalExport.sources ?? []).filter(
    (source) => !sourceUrlPattern.test(source.sourceUrl ?? '') || !allowedHerbalLicenses.has(String(source.licenseStatus ?? '')),
  )

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    status:
      failures.length === 0 && chunkArtifactFailures.length === 0 && referenceExportFailures.length === 0 && herbalSourceFailures.length === 0
        ? 'pass'
        : 'fail',
    safeToRun:
      'Reads local corpus registry, manifests, chunk files, normalized text, and public data exports only. It does not fetch, scrape, deploy, mutate DNS, call paid APIs, or print secrets.',
    inclusionStandard: {
      fullText:
        'Only rights-cleared public-domain or permissively licensed book-like works from approved no-key public archive lanes can be chunked into the corpus.',
      approvedCollections: [...allowedCollections].sort(),
      approvedRightsStatuses: [...allowedRightsStatuses].sort(),
      approvedJurisdictionLanes: [...allowedJurisdictionLanes].sort(),
      approvedAcquisitionModes: [...allowedAcquisitionModes].sort(),
    },
    counts: {
      totalWorks: works.length,
      chunkedWorks: chunked.length,
      discoveredWorks: discovered.length,
      downloadFailedWorks: failed.length,
      totalManifestChunks,
      totalManifestParagraphs,
      publicReferenceRecords: referenceExport.records?.length ?? 0,
      herbalCommonsRecords: herbalExport.records?.length ?? 0,
      herbalCommonsSources: herbalExport.sources?.length ?? 0,
    },
    byCollection: countBy(works, (work) => work.collection_id),
    byRightsStatus: countBy(works, (work) => work.rights_status),
    byJurisdictionLane: countBy(works, (work) => work.jurisdiction_lane),
    failures: failures.slice(0, 50),
    chunkArtifactFailures: chunkArtifactFailures.slice(0, 50),
    referenceExportFailures: referenceExportFailures.slice(0, 20).map((record) => record.id),
    herbalSourceFailures: herbalSourceFailures.slice(0, 20).map((source) => source.id),
  }
}

export const renderCorpusRightsMarkdown = (audit) => {
  const lines = [
    '# Herbalisti Corpus Rights Audit',
    '',
    `Generated: ${audit.generatedAt}`,
    '',
    `Status: ${audit.status}`,
    '',
    audit.safeToRun,
    '',
    '## Inclusion Standard',
    '',
    audit.inclusionStandard.fullText,
    '',
    '## Counts',
    '',
    `- Total works tracked: ${audit.counts.totalWorks}`,
    `- Chunked works: ${audit.counts.chunkedWorks}`,
    `- Discovered works pending ingestion: ${audit.counts.discoveredWorks}`,
    `- Download failed works: ${audit.counts.downloadFailedWorks}`,
    `- Chunk records: ${audit.counts.totalManifestChunks}`,
    `- Paragraph records: ${audit.counts.totalManifestParagraphs}`,
    `- Public reference records: ${audit.counts.publicReferenceRecords}`,
    `- Herbal commons records: ${audit.counts.herbalCommonsRecords}`,
    `- Herbal commons source works: ${audit.counts.herbalCommonsSources}`,
    '',
    '## Rights Statuses',
    '',
    ...Object.entries(audit.byRightsStatus).map(([status, count]) => `- ${status}: ${count}`),
    '',
    '## Jurisdiction Lanes',
    '',
    ...Object.entries(audit.byJurisdictionLane).map(([lane, count]) => `- ${lane}: ${count}`),
    '',
    '## Result',
    '',
    audit.status === 'pass'
      ? 'No rights, archive-lane, artifact, or public-export failures were found.'
      : 'Failures were found. See the JSON audit output for sampled failure details.',
    '',
  ]

  return lines.join('\n')
}

const main = async () => {
  const args = new Set(process.argv.slice(2))
  const write = args.has('--write')
  const audit = await buildCorpusRightsAudit()

  if (write) {
    writeFileSync(resolve(root, 'corpus/exports/corpus-rights-audit-summary.json'), `${JSON.stringify(audit, null, 2)}\n`)
    writeFileSync(resolve(root, 'docs/corpus-rights-audit.md'), renderCorpusRightsMarkdown(audit))
  }

  console.log(JSON.stringify(audit, null, 2))
  assert.equal(audit.status, 'pass', 'Corpus rights audit should pass')
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
