import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  buildChunkRecords,
  buildWorkMarkdown,
  chunksDir,
  classifyGutenbergRecord,
  ensureCorpusDirectories,
  exportsDir,
  fetchWithRetry,
  gutenbergCatalogCachePath,
  importsDir,
  mergeIntoWorksRegistry,
  normalizeTextRecord,
  parseCsvLine,
  rawDir,
  sha256,
  sleep,
  stripProjectGutenbergBoilerplate,
  worksDir,
  writeJson,
  writeJsonLines,
  normalizedDir,
} from './lib.mjs'

const catalogUrl = 'https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv'
const sourceCollectionId = 'project-gutenberg'
const defaultUserAgent = 'Herbalisti Corpus Builder/1.0 (local rights-cleared corpus workflow)'

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, rawValue = 'true'] = argument.replace(/^--/, '').split('=')
    return [key, rawValue]
  }),
)

const limit = Number(args.get('limit') ?? Number.POSITIVE_INFINITY)
const refreshCatalog = args.get('refresh-catalog') === 'true'
const downloadDelayMs = Number(args.get('delay-ms') ?? 150)

const toWorkId = (ebookNumber) => `pg-${ebookNumber}`

const buildRegistryRow = (record, classification) => {
  const ebookNumber = record['Text#']
  const issuedDate = record.Issued ?? ''
  const title = record.Title ?? ''
  const creator = record.Authors ?? ''
  const reasons = classification.reasons.length > 0 ? classification.reasons.join(', ') : 'keyword match'

  return {
    work_id: toWorkId(ebookNumber),
    title,
    creator,
    publication_year: '',
    collection_id: sourceCollectionId,
    jurisdiction_lane: 'US',
    source_url: `https://www.gutenberg.org/ebooks/${ebookNumber}`,
    download_url: `https://www.gutenberg.org/cache/epub/${ebookNumber}/pg${ebookNumber}.txt`,
    metadata_url: `https://www.gutenberg.org/ebooks/${ebookNumber}.rdf`,
    rights_status: 'public_domain_us',
    reuse_license: 'Project Gutenberg public domain in the USA',
    rights_basis:
      'Project Gutenberg catalog and permission guidance indicate most ebooks are public domain in the United States; jurisdiction review still applies outside the US.',
    file_format: 'txt',
    acquisition_mode: 'direct_download',
    ocr_mode: 'hosted_text',
    topic_family: classification.topicFamily,
    ingest_status: 'discovered',
    review_status: 'auto_selected',
    notes: `Auto-selected from Project Gutenberg catalog with score ${classification.score}; matched ${reasons}; Gutenberg issued ${issuedDate || 'unknown date'}; original publication year pending bibliographic review.`,
  }
}

const ensureCatalogCache = async () => {
  if (!refreshCatalog) {
    try {
      await readFile(gutenbergCatalogCachePath, 'utf8')
      return
    } catch {
      // Fetch a fresh catalog below.
    }
  }

  const response = await fetchWithRetry(catalogUrl, {
    headers: {
      'user-agent': defaultUserAgent,
    },
  })
  const csvText = await response.text()
  await mkdir(importsDir, { recursive: true })
  await writeFile(gutenbergCatalogCachePath, csvText, 'utf8')
}

const discoverCatalogMatches = async () => {
  const catalogText = await readFile(gutenbergCatalogCachePath, 'utf8')
  const lines = catalogText.split(/\r?\n/)
  const headers = lines.length > 0 ? parseCsvLine(lines[0]) : []
  const matches = []
  const sampleTitles = []

  for (const line of lines.slice(1)) {
    if (!line.trim()) {
      continue
    }

    const values = parseCsvLine(line)
    const record = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
    if (record.Type !== 'Text') {
      continue
    }

    const language = record.Language ?? ''
    if (language && !/\ben\b/i.test(language)) {
      continue
    }

    const classification = classifyGutenbergRecord(record)
    if (!classification) {
      continue
    }

    const row = buildRegistryRow(record, classification)
    matches.push(row)

    if (sampleTitles.length < 12) {
      sampleTitles.push({
        work_id: row.work_id,
        title: row.title,
        topic_family: row.topic_family,
        notes: row.notes,
      })
    }
  }

  return {
    matches,
    sampleTitles,
    scannedRows: Math.max(lines.length - 1, 0),
  }
}

const downloadText = async (work) => {
  const workRawDir = resolve(rawDir, work.work_id)
  await mkdir(workRawDir, { recursive: true })
  const rawFile = resolve(workRawDir, 'source.txt')
  const response = await fetchWithRetry(work.download_url, {
    headers: {
      'user-agent': defaultUserAgent,
    },
  })
  const rawText = await response.text()
  await writeFile(rawFile, rawText, 'utf8')
  return {
    rawFile,
    rawText,
  }
}

const processWork = async (work) => {
  const workRawDir = resolve(rawDir, work.work_id)
  const workNormalizedDir = resolve(normalizedDir, work.work_id)
  const workManifestDir = resolve(worksDir, work.work_id)
  await mkdir(workRawDir, { recursive: true })
  await mkdir(workNormalizedDir, { recursive: true })
  await mkdir(workManifestDir, { recursive: true })

  const rawFile = resolve(workRawDir, 'source.txt')
  let rawText
  try {
    rawText = await readFile(rawFile, 'utf8')
  } catch {
    const download = await downloadText(work)
    rawText = download.rawText
    await sleep(downloadDelayMs)
  }

  const cleanedText = stripProjectGutenbergBoilerplate(rawText)
  const normalizedText = normalizeTextRecord(cleanedText)
  const normalizedFile = resolve(workNormalizedDir, 'text.md')
  const sectionsFile = resolve(workNormalizedDir, 'sections.jsonl')
  const pagesFile = resolve(workNormalizedDir, 'pages.jsonl')
  const chunkFile = resolve(chunksDir, `${work.work_id}.jsonl`)

  const normalizedMarkdown = [
    `# ${work.title}`,
    '',
    normalizedText.sections
      .map((section) => [`## ${section.heading}`, '', ...section.paragraphs].join('\n\n'))
      .join('\n\n'),
  ]
    .filter(Boolean)
    .join('\n\n')

  await writeFile(normalizedFile, `${normalizedMarkdown}\n`, 'utf8')
  await writeJsonLines(
    sectionsFile,
    normalizedText.sections.map((section, index) => ({
      work_id: work.work_id,
      section_index: index,
      heading: section.heading,
      paragraph_count: section.paragraphs.length,
      text: section.paragraphs.join('\n\n'),
    })),
  )
  await writeJsonLines(
    pagesFile,
    normalizedText.paragraphs.map((paragraph, index) => ({
      work_id: work.work_id,
      page_number: null,
      paragraph_index: index,
      text: paragraph,
    })),
  )

  const chunkRecords = buildChunkRecords(work, normalizedText)
  await writeJsonLines(chunkFile, chunkRecords)

  const rawSha256 = sha256(rawText)
  const normalizedSha256 = sha256(normalizedMarkdown)
  const manifest = {
    workId: work.work_id,
    title: work.title,
    creator: work.creator,
    collectionId: work.collection_id,
    sourceUrl: work.source_url,
    downloadUrl: work.download_url,
    metadataUrl: work.metadata_url,
    rightsStatus: work.rights_status,
    topicFamily: work.topic_family,
    chunkCount: chunkRecords.length,
    paragraphCount: normalizedText.paragraphs.length,
    sectionCount: normalizedText.sections.length,
    rawFile,
    normalizedFile,
    chunkFile,
    rawSha256,
    normalizedSha256,
    processedAt: new Date().toISOString(),
  }

  await writeJson(resolve(workManifestDir, 'manifest.json'), manifest)
  await writeFile(resolve(workManifestDir, 'work.md'), `${buildWorkMarkdown(work, manifest)}\n`, 'utf8')

  return {
    ...manifest,
  }
}

await ensureCorpusDirectories()
await ensureCatalogCache()

const discovery = await discoverCatalogMatches()
const summaryPath = resolve(exportsDir, 'project-gutenberg-corpus-summary.json')

let mergedRows = await mergeIntoWorksRegistry(`corpus:${sourceCollectionId}:discovery`, discovery.matches)

const result = await (async () => {
  const targetRows = mergedRows
    .filter((row) => row.collection_id === sourceCollectionId && row.ingest_status !== 'chunked')
    .slice(0, Number.isFinite(limit) ? limit : mergedRows.length)

  const processed = []
  const failures = []

  for (const row of targetRows) {
    try {
      const manifest = await processWork(row)
      row.ingest_status = 'chunked'
      row.review_status = row.review_status === 'auto_selected' ? 'downloaded_and_normalized' : row.review_status
      processed.push({
        work_id: row.work_id,
        title: row.title,
        chunkCount: manifest.chunkCount,
        paragraphCount: manifest.paragraphCount,
        topicFamily: row.topic_family,
      })
      mergedRows = await mergeIntoWorksRegistry(`corpus:${sourceCollectionId}:status`, [row])
    } catch (error) {
      row.ingest_status = 'download_failed'
      row.notes = `${row.notes} | Download or processing failed: ${error.message}`
      failures.push({
        work_id: row.work_id,
        title: row.title,
        error: error.message,
      })
      mergedRows = await mergeIntoWorksRegistry(`corpus:${sourceCollectionId}:status`, [row])
    }
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    sourceCollectionId,
    catalogUrl,
    scannedRows: discovery.scannedRows,
    discoveredCount: discovery.matches.length,
    processedCount: processed.length,
    failureCount: failures.length,
    processed,
    failures,
    sampleTitles: discovery.sampleTitles,
  }

  await writeJson(summaryPath, summary)

  return {
    scannedRows: discovery.scannedRows,
    discoveredCount: discovery.matches.length,
    processedCount: processed.length,
    failureCount: failures.length,
    summaryPath,
  }
})()

console.log(JSON.stringify(result, null, 2))
