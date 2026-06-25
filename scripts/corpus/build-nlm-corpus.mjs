import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { XMLParser } from 'fast-xml-parser'
import { chromium } from 'playwright-core'
import {
  buildChunkRecords,
  buildWorkMarkdown,
  chunksDir,
  classifyGutenbergRecord,
  ensureCorpusDirectories,
  exportsDir,
  fetchWithRetry,
  loadWorksRegistry,
  mergeIntoWorksRegistry,
  mergeNotes,
  mergeWorks,
  normalizeTextRecord,
  normalizedDir,
  rawDir,
  sha256,
  sleep,
  worksDir,
  writeJson,
  writeJsonLines,
} from './lib.mjs'

const sourceCollectionId = 'nlm-digital-collections'
const searchApiUrl = 'https://wsearch.nlm.nih.gov/ws/query'
const catalogBaseUrl = 'https://collections.nlm.nih.gov/catalog/'
const ocrBaseUrl = 'https://collections.nlm.nih.gov/ocr/'
const pdfBaseUrl = 'https://collections.nlm.nih.gov/pdf/'
const defaultUserAgent = 'Herbalisti Corpus Builder/1.0 (local rights-cleared corpus workflow)'
const defaultBrowserCandidates = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
]
const queryTerms = [
  'herbal',
  '"materia medica"',
  '"medicinal plants"',
  '"medical botany"',
  '"domestic medicine"',
  'pharmacopoeia',
  '"guide to health"',
  '"family physician"',
  'hygiene',
]

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, rawValue = 'true'] = argument.replace(/^--/, '').split('=')
    return [key, rawValue]
  }),
)

const limit = Number(args.get('limit') ?? Number.POSITIVE_INFINITY)
const discoveryOnly = args.get('discovery-only') === 'true'
const downloadDelayMs = Number(args.get('delay-ms') ?? 150)
const pageSize = Number(args.get('page-size') ?? 100)
const maxPagesPerQuery = Number(args.get('max-pages-per-query') ?? 15)
const headless = args.get('headed') !== 'true'
const retryFailed = args.get('retry-failed') === 'true'
const minTextChars = Number(args.get('min-text-chars') ?? 200)
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
})

const asArray = (value) => {
  if (value == null) {
    return []
  }
  return Array.isArray(value) ? value : [value]
}

const normalizeWhitespace = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

const stripHighlightMarkup = (value) => normalizeWhitespace(String(value ?? '').replace(/<[^>]+>/g, ' '))

const stripProcessingFailureNotes = (notes) =>
  String(notes ?? '')
    .replace(/\s*\|\s*NLM OCR acquisition error:[^|]+/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

const loadRequestedWorkIds = async () => {
  const ids = []
  const seen = new Set()

  const push = (value) => {
    const trimmed = String(value ?? '').trim()
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed)
      ids.push(trimmed)
    }
  }

  for (const value of String(args.get('work-ids') ?? '').split(/[,\r\n]+/)) {
    push(value)
  }

  const filePath = args.get('work-ids-file')
  if (filePath) {
    const fileText = await readFile(resolve(filePath), 'utf8')
    for (const value of fileText.split(/[,\r\n]+/)) {
      push(value)
    }
  }

  return ids
}

const scorePriority = (work) => {
  const topic = work.topic_family ?? ''
  let score = 0
  if (work.ingest_status === 'download_failed') score += 500
  if (topic.includes('herbal')) score += 120
  if (topic.includes('medicinal-plants')) score += 95
  if (topic.includes('medical-botany')) score += 80
  if (topic.includes('domestic-medicine')) score += 70
  if (topic.includes('materia-medica')) score += 60
  if (topic.includes('pharmacopoeia')) score += 50
  if (topic.includes('botany')) score += 25
  if (/herbal|materia medica|medicinal|health|physician|botany/i.test(work.title ?? '')) score += 15
  return score
}

const buildPid = (resourceId) => `nlm:nlmuid-${resourceId}-bk`
const buildCatalogUrl = (resourceId) => `${catalogBaseUrl}${encodeURIComponent(buildPid(resourceId))}`
const buildOcrUrl = (resourceId) => `${ocrBaseUrl}${buildPid(resourceId)}`
const buildPdfUrl = (resourceId) => `${pdfBaseUrl}${buildPid(resourceId)}`
const buildMvPartOcrUrl = (resourceId) => `${ocrBaseUrl}${buildPid(resourceId).replace(/-bk$/i, '-mvpart')}`
const buildMvSetCatalogUrl = (resourceId) => `${catalogBaseUrl}${encodeURIComponent(buildPid(resourceId).replace(/-bk$/i, '-mvset'))}`
const buildResourcePageUrl = (resourceId) => `http://resource.nlm.nih.gov/${resourceId}`

const extractResourceId = (value) => {
  const text = decodeURIComponent(String(value ?? ''))
  const resourceMatch = text.match(/resource\.nlm\.nih\.gov\/([A-Za-z0-9]+)/i)
  if (resourceMatch) {
    return resourceMatch[1]
  }

  const pidMatch = text.match(/nlmuid-([A-Za-z0-9]+)(?:-[a-z]+)?$/i)
  if (pidMatch) {
    return pidMatch[1]
  }

  const trailingMatch = text.match(/([A-Za-z0-9]+)$/)
  return trailingMatch ? trailingMatch[1] : ''
}

const isAllowedRights = (rightsText) =>
  /public domain/i.test(rightsText) ||
  /creativecommons\.org\/publicdomain\/mark\/1\.0/i.test(rightsText) ||
  /creativecommons\.org\/publicdomain\/zero\/1\.0/i.test(rightsText)

const detectBrowserExecutable = () => {
  const requested = args.get('browser-path') || process.env.PLAYWRIGHT_BROWSER_PATH
  if (requested && existsSync(requested)) {
    return requested
  }

  const candidate = defaultBrowserCandidates.find((path) => existsSync(path))
  if (!candidate) {
    throw new Error(
      'No compatible local browser executable was found. Set PLAYWRIGHT_BROWSER_PATH or pass --browser-path.',
    )
  }

  return candidate
}

const parseSearchResponse = (xmlText) => {
  const payload = xmlParser.parse(xmlText).nlmSearchResult ?? {}
  const listNode = payload.list ?? {}
  const documents = asArray(listNode.document)
  return {
    term: payload.term ?? '',
    file: payload.file ?? '',
    server: payload.server ?? '',
    count: Number(payload.count ?? listNode['@_num'] ?? 0),
    retstart: Number(payload.retstart ?? listNode['@_start'] ?? 0),
    retmax: Number(payload.retmax ?? listNode['@_per'] ?? documents.length ?? 0),
    documents,
  }
}

const uniqueValues = (values) => [...new Set(values.filter(Boolean))]

const extractDocumentRecord = (documentNode) => {
  const contentByName = new Map()

  for (const content of asArray(documentNode.content)) {
    const name = content?.['@_name'] ?? ''
    const rawValue = content?.['#text'] ?? ''
    if (!name || !rawValue) {
      continue
    }
    const cleanedValue = stripHighlightMarkup(rawValue)
    if (!cleanedValue) {
      continue
    }
    const current = contentByName.get(name) ?? []
    current.push(cleanedValue)
    contentByName.set(name, current)
  }

  const getFirst = (...names) => {
    for (const name of names) {
      const values = contentByName.get(name)
      if (values?.[0]) {
        return values[0]
      }
    }
    return ''
  }

  const getAll = (...names) => names.flatMap((name) => contentByName.get(name) ?? [])
  const identifier = getFirst('dc:identifier') || documentNode['@_url'] || ''
  const resourceId = extractResourceId(identifier || documentNode['@_url'])

  return {
    resourceId,
    identifier,
    title: getFirst('dc:title', 'title'),
    creator: getFirst('dc:creator'),
    publication: getFirst('Publication'),
    publicationYear: getFirst('dc:date').match(/\b(1[5-9]\d{2}|20\d{2})\b/)?.[1] ?? '',
    formats: getAll('dc:format'),
    subjects: getAll('dc:subject'),
    types: getAll('dc:type'),
    languages: getAll('dc:language', 'language'),
    rights: getFirst('dc:rights'),
    snippet: getFirst('snippet'),
    contentByName,
    documentUrl: documentNode['@_url'] ?? '',
  }
}

const buildRegistryRow = (record, classification, matchedQueries) => {
  const catalogUrl = buildCatalogUrl(record.resourceId)
  const ocrUrl = buildOcrUrl(record.resourceId)
  const pdfUrl = buildPdfUrl(record.resourceId)
  const rightsLabel = /zero\/1\.0/i.test(record.rights) ? 'CC0 / Public Domain' : 'Public Domain Mark 1.0'

  return {
    work_id: `nlm-${record.resourceId}`,
    title: record.title,
    creator: record.creator,
    publication_year: record.publicationYear,
    collection_id: sourceCollectionId,
    jurisdiction_lane: 'US',
    source_url: catalogUrl,
    download_url: ocrUrl,
    metadata_url: record.identifier || catalogUrl,
    rights_status: 'public_domain_mark',
    reuse_license: rightsLabel,
    rights_basis:
      'NLM Digital Collections catalog record states the item is believed to be in the public domain, and the collection exposes official OCR and PDF routes for the record.',
    file_format: 'txt',
    acquisition_mode: 'official_search_plus_browser_ocr',
    ocr_mode: 'nlm_ocr_page',
    topic_family: classification.topicFamily,
    ingest_status: 'discovered',
    review_status: 'catalog_rights_verified',
    notes: `NLM query terms: ${matchedQueries.join(', ')}; matched ${classification.reasons.join(', ') || 'keyword signals'}; resource ${record.resourceId}; pdf ${pdfUrl}; rights ${record.rights}.`,
  }
}

const fetchSearchPage = async (query, session = null, retstart = 0) => {
  const url = new URL(searchApiUrl)
  if (session) {
    url.searchParams.set('file', session.file)
    url.searchParams.set('server', session.server)
    url.searchParams.set('retstart', String(retstart))
    url.searchParams.set('retmax', String(pageSize))
  } else {
    url.searchParams.set('db', 'digitalCollections')
    url.searchParams.set('term', query)
    url.searchParams.set('retmax', String(pageSize))
  }

  const response = await fetchWithRetry(url, {
    headers: {
      'user-agent': defaultUserAgent,
    },
  })

  return parseSearchResponse(await response.text())
}

const discoverWorks = async () => {
  const discovered = new Map()
  let scannedResults = 0

  for (const query of queryTerms) {
    let pageIndex = 0
    let session = null
    let nextRetstart = 0

    while (pageIndex < maxPagesPerQuery) {
      const page = await fetchSearchPage(query, session, nextRetstart)
      if (!session) {
        session = {
          file: page.file,
          server: page.server,
          count: page.count,
        }
      }

      if (page.documents.length === 0) {
        break
      }

      scannedResults += page.documents.length

      for (const documentNode of page.documents) {
        const record = extractDocumentRecord(documentNode)
        if (!record.resourceId || !record.title) {
          continue
        }

        if (record.languages.length > 0 && !record.languages.some((value) => /english/i.test(value))) {
          continue
        }

        if (!record.formats.some((value) => /text/i.test(value))) {
          continue
        }

        if (!isAllowedRights(record.rights)) {
          continue
        }

        const classification = classifyGutenbergRecord({
          Title: record.title,
          Subjects: record.subjects.join('; '),
          Bookshelves: record.types.join('; '),
          Authors: record.creator,
        })
        if (!classification) {
          continue
        }

        const existing = discovered.get(record.resourceId)
        if (!existing) {
          discovered.set(record.resourceId, {
            record,
            classification,
            matchedQueries: new Set([query]),
          })
        } else {
          existing.matchedQueries.add(query)
        }
      }

      pageIndex += 1
      nextRetstart += page.retmax || page.documents.length
      if (!session.count || nextRetstart >= session.count) {
        break
      }
    }
  }

  const rows = [...discovered.values()].map(({ record, classification, matchedQueries }) =>
    buildRegistryRow(record, classification, [...matchedQueries].sort()),
  )

  return {
    scannedResults,
    rows,
    sourceRecords: new Map(
      [...discovered.values()].map(({ record, classification, matchedQueries }) => [
        `nlm-${record.resourceId}`,
        {
          ...record,
          classification,
          matchedQueries: [...matchedQueries].sort(),
          catalogUrl: buildCatalogUrl(record.resourceId),
          ocrUrl: buildOcrUrl(record.resourceId),
          pdfUrl: buildPdfUrl(record.resourceId),
        },
      ]),
    ),
    sampleTitles: rows.slice(0, 15).map((row) => ({
      work_id: row.work_id,
      title: row.title,
      topic_family: row.topic_family,
      notes: row.notes,
    })),
  }
}

const launchBrowser = async () => {
  const executablePath = detectBrowserExecutable()
  const browser = await chromium.launch({
    headless,
    executablePath,
    args: ['--disable-blink-features=AutomationControlled'],
  })
  const context = await browser.newContext()
  const page = await context.newPage()
  return {
    browser,
    context,
    page,
    executablePath,
  }
}

const extractOcrTextFromPage = async (page, urlLabel) => {
  const bodyText = normalizeWhitespace(await page.locator('body').textContent().catch(() => ''))
  if (/verify that you'?re not a robot/i.test(bodyText)) {
    throw new Error(`NLM browser verification challenge is still blocking OCR retrieval for this item: ${urlLabel}`)
  }

  const pre = page.locator('pre')
  const preCount = await pre.count()
  if (preCount < 1) {
    throw new Error(`NLM OCR page did not expose a <pre> block: ${urlLabel}`)
  }

  const text = (await pre.first().textContent()) ?? ''
  const normalizedPreText = normalizeWhitespace(text)
  if (!normalizedPreText) {
    throw new Error(`NLM OCR page returned empty text: ${urlLabel}`)
  }

  if (/^Error:\s+Resource\b/i.test(normalizedPreText)) {
    throw new Error(`NLM OCR route reported a missing OCR resource: ${normalizedPreText}`)
  }

  if (normalizedPreText.length < minTextChars) {
    throw new Error(`NLM OCR text was too short to trust (${normalizedPreText.length} chars): ${urlLabel}`)
  }

  return text
}

const fetchOcrTextFromUrl = async (page, url) => {
  await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 45000,
  })
  await page.waitForTimeout(1500)
  return extractOcrTextFromPage(page, url)
}

const collectAlternativeOcrUrls = async (page, work, sourceRecord) => {
  const resourceId = sourceRecord?.resourceId || work.work_id.replace(/^nlm-/, '')
  const directPartCandidates = []

  if (/(?:RX|X)\d+$/i.test(resourceId)) {
    directPartCandidates.push(buildMvPartOcrUrl(resourceId))
  }

  const landingUrls = uniqueValues([
    buildResourcePageUrl(resourceId),
    buildMvSetCatalogUrl(resourceId),
    work.metadata_url,
    sourceRecord?.identifier,
    sourceRecord?.catalogUrl,
  ])

  const discoveredLinks = []
  for (const url of landingUrls) {
    try {
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 45000,
      })
      await page.waitForTimeout(1500)
      const hrefs = await page
        .locator('a')
        .evaluateAll((elements) => elements.map((element) => element.href).filter(Boolean))

      discoveredLinks.push(
        ...hrefs.filter((href) => /\/ocr\/nlm:nlmuid-[A-Za-z0-9]+(?:X\d+|RX\d+)?-(?:mvpart|mvset)$/i.test(href)),
      )
    } catch {
      // Ignore alternative landing pages that fail and keep probing the other official routes.
    }
  }

  const preferredExactPartUrl = directPartCandidates[0] ?? ''
  return uniqueValues([...directPartCandidates, ...discoveredLinks]).sort((left, right) => {
    const leftExact = preferredExactPartUrl && left === preferredExactPartUrl ? -1 : 0
    const rightExact = preferredExactPartUrl && right === preferredExactPartUrl ? -1 : 0
    if (leftExact !== rightExact) {
      return leftExact - rightExact
    }

    const leftIsPart = /-mvpart$/i.test(left) ? 0 : 1
    const rightIsPart = /-mvpart$/i.test(right) ? 0 : 1
    if (leftIsPart !== rightIsPart) {
      return leftIsPart - rightIsPart
    }

    return left.localeCompare(right)
  })
}

const fetchAlternativeOcrText = async (page, work, sourceRecord) => {
  const alternativeUrls = await collectAlternativeOcrUrls(page, work, sourceRecord)
  if (alternativeUrls.length === 0) {
    throw new Error('No alternate official OCR routes were discovered from the NLM resource page.')
  }

  const resolvedTexts = []
  const attemptedUrls = []
  const failedUrls = []

  for (const url of alternativeUrls) {
    attemptedUrls.push(url)
    if (!/-mvpart$/i.test(url)) {
      continue
    }

    try {
      const text = await fetchOcrTextFromUrl(page, url)
      resolvedTexts.push({
        url,
        text,
      })
    } catch (error) {
      failedUrls.push({
        url,
        error: error.message,
      })
    }
  }

  if (resolvedTexts.length === 0) {
    const failureSummary =
      failedUrls.length > 0
        ? failedUrls.map((entry) => `${entry.url} -> ${entry.error}`).join(' | ')
        : attemptedUrls.join(', ')
    throw new Error(`Alternate official OCR routes were found but none yielded trusted text: ${failureSummary}`)
  }

  const combinedText =
    resolvedTexts.length === 1
      ? resolvedTexts[0].text
      : resolvedTexts
          .map(({ url, text }) => {
            const partId = url.match(/nlmuid-([A-Za-z0-9]+)-mvpart/i)?.[1] ?? url
            return `[[NLM Source Part: ${partId}]]\n\n${text.trim()}`
          })
          .join('\n\n')

  return {
    text: combinedText,
    sourceUrlsUsed: resolvedTexts.map((entry) => entry.url),
    attemptedUrls,
  }
}

const fetchOcrText = async (page, work, sourceRecord) => {
  try {
    return {
      text: await fetchOcrTextFromUrl(page, work.download_url),
      sourceUrlsUsed: [work.download_url],
      attemptedUrls: [work.download_url],
    }
  } catch (error) {
    if (!/missing OCR resource/i.test(error.message)) {
      throw error
    }

    const fallback = await fetchAlternativeOcrText(page, work, sourceRecord)
    return {
      ...fallback,
      attemptedUrls: [work.download_url, ...fallback.attemptedUrls],
    }
  }
}

const processWork = async (work, sourceRecord, browserSession) => {
  const workRawDir = resolve(rawDir, work.work_id)
  const workNormalizedDir = resolve(normalizedDir, work.work_id)
  const workManifestDir = resolve(worksDir, work.work_id)
  await mkdir(workRawDir, { recursive: true })
  await mkdir(workNormalizedDir, { recursive: true })
  await mkdir(workManifestDir, { recursive: true })

  const rawFile = resolve(workRawDir, 'source.txt')
  const sourceRecordFile = resolve(workRawDir, 'source-record.json')
  let rawText
  let sourceUrlsUsed = [work.download_url]
  let attemptedOcrUrls = [work.download_url]

  try {
    rawText = await readFile(rawFile, 'utf8')
  } catch {
    const fetched = await fetchOcrText(browserSession.page, work, sourceRecord)
    rawText = fetched.text
    sourceUrlsUsed = fetched.sourceUrlsUsed
    attemptedOcrUrls = fetched.attemptedUrls
    await writeFile(rawFile, rawText, 'utf8')

    const fallbackSourceRecord = sourceRecord ?? {
      resourceId: work.work_id.replace(/^nlm-/, ''),
      catalogUrl: work.source_url,
      ocrUrl: work.download_url,
      pdfUrl: buildPdfUrl(work.work_id.replace(/^nlm-/, '')),
      matchedQueries: [],
      rights: work.reuse_license,
      title: work.title,
      creator: work.creator,
      publicationYear: work.publication_year,
      subjects: (work.topic_family ?? '').split(';').filter(Boolean),
      types: [],
      formats: ['Text'],
    }
    await writeJson(sourceRecordFile, {
      ...fallbackSourceRecord,
      ocrUrlUsed: sourceUrlsUsed.at(-1) ?? work.download_url,
      attemptedOcrUrls,
      alternativeOcrUrlsUsed: sourceUrlsUsed.filter((url) => url !== work.download_url),
    })
    await sleep(downloadDelayMs)
  }

  const cleanedText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
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
    sourceRecordFile,
    normalizedFile,
    chunkFile,
    rawSha256,
    normalizedSha256,
    processedAt: new Date().toISOString(),
  }

  await writeJson(resolve(workManifestDir, 'manifest.json'), manifest)
  await writeFile(resolve(workManifestDir, 'work.md'), `${buildWorkMarkdown(work, manifest)}\n`, 'utf8')

  return manifest
}

await ensureCorpusDirectories()

const requestedWorkIds = await loadRequestedWorkIds()
const requestedWorkIdOrder = new Map(requestedWorkIds.map((workId, index) => [workId, index]))
const existingRegistry = await loadWorksRegistry()
const existingRegistryById = new Map(
  existingRegistry
    .filter((row) => row.collection_id === sourceCollectionId)
    .map((row) => [row.work_id, row]),
)
const missingRequestedWorkIds =
  requestedWorkIds.length > 0
    ? requestedWorkIds.filter((workId) => !existingRegistryById.has(workId))
    : []
const shouldDiscover = requestedWorkIds.length === 0 || missingRequestedWorkIds.length > 0
const discovery = shouldDiscover
  ? await discoverWorks()
  : {
      scannedResults: 0,
      rows: [],
      sourceRecords: new Map(
        requestedWorkIds
          .map((workId) => existingRegistryById.get(workId))
          .filter(Boolean)
          .map((row) => [
            row.work_id,
            {
              resourceId: row.work_id.replace(/^nlm-/, ''),
              identifier: row.metadata_url,
              title: row.title,
              creator: row.creator,
              publicationYear: row.publication_year,
              subjects: (row.topic_family ?? '').split(';').map((value) => value.trim()).filter(Boolean),
              types: [],
              formats: ['Text'],
              languages: ['English'],
              rights: row.reuse_license || row.rights_status,
              catalogUrl: row.source_url,
              ocrUrl: row.download_url,
              pdfUrl: buildPdfUrl(row.work_id.replace(/^nlm-/, '')),
              matchedQueries: [],
            },
          ]),
      ),
      sampleTitles: requestedWorkIds
        .map((workId) => existingRegistryById.get(workId))
        .filter(Boolean)
        .slice(0, 15)
        .map((row) => ({
          work_id: row.work_id,
          title: row.title,
          topic_family: row.topic_family,
          notes: 'Loaded from the local NLM registry because explicit work IDs were supplied.',
        })),
    }

const summaryPath = resolve(exportsDir, 'nlm-corpus-summary.json')

let mergedRows = await mergeIntoWorksRegistry(`corpus:${sourceCollectionId}:discovery`, discovery.rows)

if (discoveryOnly) {
  await writeJson(summaryPath, {
    generatedAt: new Date().toISOString(),
    sourceCollectionId,
    scannedResults: discovery.scannedResults,
    discoveredCount: discovery.rows.length,
    processedCount: 0,
    failureCount: 0,
    browserAssisted: true,
    retryFailed,
    sampleTitles: discovery.sampleTitles,
  })

  console.log(
    JSON.stringify(
      {
        scannedResults: discovery.scannedResults,
        discoveredCount: discovery.rows.length,
        processedCount: 0,
        failureCount: 0,
        summaryPath,
      },
      null,
      2,
    ),
  )
  process.exit(0)
}

const result = await (async () => {
  const targetRows = mergedRows
    .filter(
      (row) =>
        row.collection_id === sourceCollectionId &&
        row.ingest_status !== 'chunked' &&
        (requestedWorkIds.length === 0 || requestedWorkIdOrder.has(row.work_id)) &&
        (retryFailed || row.ingest_status !== 'download_failed'),
    )
    .sort((left, right) => {
      if (requestedWorkIds.length > 0) {
        return (
          (requestedWorkIdOrder.get(left.work_id) ?? Number.MAX_SAFE_INTEGER) -
            (requestedWorkIdOrder.get(right.work_id) ?? Number.MAX_SAFE_INTEGER) ||
          left.title.localeCompare(right.title)
        )
      }

      return scorePriority(right) - scorePriority(left) || left.title.localeCompare(right.title)
    })
    .slice(
      0,
      Number.isFinite(limit)
        ? limit
        : mergedRows.filter(
            (row) =>
              row.collection_id === sourceCollectionId &&
              row.ingest_status !== 'chunked' &&
              (requestedWorkIds.length === 0 || requestedWorkIdOrder.has(row.work_id)) &&
              (retryFailed || row.ingest_status !== 'download_failed'),
          ).length,
    )

  const processed = []
  const failures = []
  let browserSession = null

  if (targetRows.length > 0) {
    browserSession = await launchBrowser()
  }

  try {
    for (const row of targetRows) {
      try {
        const manifest = await processWork(row, discovery.sourceRecords.get(row.work_id), browserSession)
        row.ingest_status = 'chunked'
        row.review_status = 'downloaded_and_normalized'
        row.notes = stripProcessingFailureNotes(row.notes)
        await writeFile(resolve(worksDir, row.work_id, 'work.md'), `${buildWorkMarkdown(row, manifest)}\n`, 'utf8')
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
        row.review_status = 'manual_retry_required'
        row.notes = mergeNotes(stripProcessingFailureNotes(row.notes), `NLM OCR acquisition error: ${error.message}`)
        failures.push({
          work_id: row.work_id,
          title: row.title,
          error: error.message,
        })
        mergedRows = await mergeIntoWorksRegistry(`corpus:${sourceCollectionId}:status`, [row])
      }
    }
  } finally {
    if (browserSession) {
      await browserSession.context.close()
      await browserSession.browser.close()
    }
  }

  await writeJson(summaryPath, {
    generatedAt: new Date().toISOString(),
    sourceCollectionId,
    scannedResults: discovery.scannedResults,
    discoveredCount: discovery.rows.length,
    requestedWorkIdsCount: requestedWorkIds.length,
    processedCount: processed.length,
    failureCount: failures.length,
    browserAssisted: true,
    browserExecutablePath: browserSession?.executablePath ?? null,
    retryFailed,
    sampleTitles: discovery.sampleTitles,
    processed,
    failures,
  })

  return {
    scannedResults: discovery.scannedResults,
    discoveredCount: discovery.rows.length,
    processedCount: processed.length,
    failureCount: failures.length,
    summaryPath,
  }
})()

console.log(JSON.stringify(result, null, 2))
