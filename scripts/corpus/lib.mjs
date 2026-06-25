import { createHash } from 'node:crypto'
import { once } from 'node:events'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { createReadStream, createWriteStream } from 'node:fs'
import { resolve } from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(fileURLToPath(new URL('../..', import.meta.url)))
export const corpusDir = resolve(rootDir, 'corpus')
export const registryDir = resolve(corpusDir, 'registry')
export const rawDir = resolve(corpusDir, 'raw')
export const normalizedDir = resolve(corpusDir, 'normalized')
export const chunksDir = resolve(corpusDir, 'chunks')
export const worksDir = resolve(corpusDir, 'works')
export const derivedDir = resolve(corpusDir, 'derived')
export const exportsDir = resolve(corpusDir, 'exports')
export const importsDir = resolve(registryDir, 'imports')
export const rightsDir = resolve(registryDir, 'rights-decisions')
export const registryLocksDir = resolve(registryDir, '.locks')
export const worksRegistryLockDir = resolve(registryLocksDir, 'works-registry.lock')
export const worksRegistryLockMetaPath = resolve(worksRegistryLockDir, 'owner.json')

export const worksRegistryPath = resolve(registryDir, 'works.csv')
export const collectionsRegistryPath = resolve(registryDir, 'collections.csv')
export const gutenbergCatalogCachePath = resolve(importsDir, 'project-gutenberg-catalog.csv')

const registryHeaders = [
  'work_id',
  'title',
  'creator',
  'publication_year',
  'collection_id',
  'jurisdiction_lane',
  'source_url',
  'download_url',
  'metadata_url',
  'rights_status',
  'reuse_license',
  'rights_basis',
  'file_format',
  'acquisition_mode',
  'ocr_mode',
  'topic_family',
  'ingest_status',
  'review_status',
  'notes',
]

const workIdPattern = /^[a-z0-9]+-[a-z0-9]+$/i

const strongPatterns = [
  { pattern: /\bherbal\b/i, score: 20, tag: 'herbal' },
  { pattern: /\bherbs?\b/i, score: 10, tag: 'herbal' },
  { pattern: /\bsimples?\b/i, score: 10, tag: 'herbal' },
  { pattern: /\bmateria medica\b/i, score: 18, tag: 'materia-medica' },
  { pattern: /\bmedicinal plants?\b/i, score: 16, tag: 'medicinal-plants' },
  { pattern: /\bmedical botany\b/i, score: 16, tag: 'medical-botany' },
  { pattern: /\bbotanic medicine\b/i, score: 16, tag: 'botanic-medicine' },
  { pattern: /\bdomestic medicine\b/i, score: 16, tag: 'domestic-medicine' },
  { pattern: /\bfamily physician\b/i, score: 14, tag: 'domestic-medicine' },
  { pattern: /\bguide to health\b/i, score: 14, tag: 'domestic-medicine' },
  { pattern: /\bpharmacopoeia\b|\bpharmacopeia\b/i, score: 16, tag: 'pharmacopoeia' },
  { pattern: /\bculinary herbs?\b/i, score: 16, tag: 'culinary-herbs' },
  { pattern: /\bhygiene\b/i, score: 10, tag: 'hygiene' },
  { pattern: /\bsanitation\b/i, score: 10, tag: 'public-health' },
  { pattern: /\bnursing\b/i, score: 8, tag: 'nursing' },
  { pattern: /\binvalid cookery\b/i, score: 12, tag: 'convalescence' },
  { pattern: /\bdietetics\b/i, score: 10, tag: 'dietetics' },
  { pattern: /\bconvalescen/i, score: 8, tag: 'convalescence' },
  { pattern: /\bcultivation\b/i, score: 6, tag: 'cultivation' },
  { pattern: /\bbotany\b/i, score: 8, tag: 'botany' },
  { pattern: /\bbotanical\b/i, score: 8, tag: 'botany' },
  { pattern: /\bflora\b/i, score: 8, tag: 'botany' },
]

const healthPatterns = [
  /\bmedicine\b/i,
  /\bmedical\b/i,
  /\bhealth\b/i,
  /\bhygiene\b/i,
  /\bnursing\b/i,
  /\bdietetics\b/i,
  /\bconvalescen/i,
  /\bphysician\b/i,
  /\bpharmacopoeia\b|\bpharmacopeia\b/i,
]

const plantPatterns = [
  /\bherbal\b/i,
  /\bherbs?\b/i,
  /\bbotany\b/i,
  /\bbotanical\b/i,
  /\bflora\b/i,
  /\bplants?\b/i,
  /\bcultivation\b/i,
  /\bmedicinal plants?\b/i,
]

const excludePatterns = [
  /\bnovel\b/i,
  /\bfiction\b/i,
  /\bpoems?\b/i,
  /\bpoetry\b/i,
  /\bdrama\b/i,
  /\bplays?\b/i,
  /\bsermons?\b/i,
  /\bletters\b/i,
  /\bautobiograph/i,
  /\bbiograph/i,
  /\btravel\b/i,
  /\bromance\b/i,
]

export const ensureCorpusDirectories = async () => {
  for (const path of [
    registryDir,
    rawDir,
    normalizedDir,
    chunksDir,
    worksDir,
    derivedDir,
    exportsDir,
    importsDir,
    rightsDir,
    registryLocksDir,
  ]) {
    await mkdir(path, { recursive: true })
  }
}

export const csvEscape = (value) => {
  const stringValue = value == null ? '' : String(value)
  if (/[",\r\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

export const parseCsvLine = (line) => {
  const fields = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    if (character === '"') {
      const next = line[index + 1]
      if (inQuotes && next === '"') {
        current += '"'
        index += 1
        continue
      }
      inQuotes = !inQuotes
      continue
    }

    if (character === ',' && !inQuotes) {
      fields.push(current)
      current = ''
      continue
    }

    current += character
  }

  fields.push(current)
  return fields
}

export const isLikelyWorkId = (value) => workIdPattern.test(String(value ?? '').trim())

const normalizeNoteFragment = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

export const mergeNotes = (...noteValues) => {
  const fragments = []
  const seen = new Set()

  for (const noteValue of noteValues) {
    if (!noteValue) {
      continue
    }

    for (const fragment of String(noteValue).split(' | ')) {
      const normalized = normalizeNoteFragment(fragment)
      if (!normalized || seen.has(normalized)) {
        continue
      }

      seen.add(normalized)
      fragments.push(normalized)
    }
  }

  return fragments.join(' | ')
}

export const sanitizeWorkRow = (row) => {
  const workId = String(row?.work_id ?? '').trim()
  if (!isLikelyWorkId(workId)) {
    return null
  }

  return {
    ...row,
    work_id: workId,
    notes: mergeNotes(row?.notes),
  }
}

export const sanitizeWorkRows = (rows) => rows.map((row) => sanitizeWorkRow(row)).filter(Boolean)

export const readCsvFile = async (path) => {
  const text = await readFile(path, 'utf8')
  const trimmed = text.trim()
  if (!trimmed) {
    return []
  }

  const lines = trimmed.split(/\r?\n/)
  const headers = parseCsvLine(lines[0])
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    return headers.reduce((record, header, index) => {
      record[header] = values[index] ?? ''
      return record
    }, {})
  })
}

export const writeCsvFile = async (path, rows, headers = registryHeaders) => {
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header] ?? '')).join(',')),
  ]
  await writeFile(path, `${lines.join('\n')}\n`, 'utf8')
}

export const sha256 = (value) => createHash('sha256').update(value).digest('hex')

export const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

export const stripProjectGutenbergBoilerplate = (text) => {
  const startPattern = /\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[\s\S]*?\*\*\*/i
  const endPattern = /\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[\s\S]*?\*\*\*/i

  let cleaned = text.replace(/\uFEFF/g, '')
  const startMatch = cleaned.match(startPattern)
  if (startMatch) {
    cleaned = cleaned.slice(startMatch.index + startMatch[0].length)
  }

  const endMatch = cleaned.match(endPattern)
  if (endMatch) {
    cleaned = cleaned.slice(0, endMatch.index)
  }

  return cleaned
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const splitParagraphs = (text) =>
  text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

const splitOversizedParagraph = (paragraph, maxChars = 900) => {
  if (paragraph.length <= maxChars) {
    return [paragraph]
  }

  const sentenceMatches = paragraph.match(/[^.!?]+(?:[.!?]+|$)/g) ?? [paragraph]
  const segments = []
  let buffer = ''

  const pushBuffer = () => {
    if (buffer.trim()) {
      segments.push(buffer.trim())
      buffer = ''
    }
  }

  for (const sentence of sentenceMatches) {
    const trimmedSentence = sentence.replace(/\s+/g, ' ').trim()
    if (!trimmedSentence) {
      continue
    }

    if (trimmedSentence.length > maxChars) {
      pushBuffer()
      const words = trimmedSentence.split(/\s+/)
      let wordBuffer = ''
      for (const word of words) {
        const nextWordBuffer = wordBuffer ? `${wordBuffer} ${word}` : word
        if (nextWordBuffer.length > maxChars && wordBuffer) {
          segments.push(wordBuffer.trim())
          wordBuffer = word
        } else {
          wordBuffer = nextWordBuffer
        }
      }
      if (wordBuffer.trim()) {
        segments.push(wordBuffer.trim())
      }
      continue
    }

    const nextBuffer = buffer ? `${buffer} ${trimmedSentence}` : trimmedSentence
    if (nextBuffer.length > maxChars && buffer) {
      pushBuffer()
      buffer = trimmedSentence
    } else {
      buffer = nextBuffer
    }
  }

  pushBuffer()
  return segments.length > 0 ? segments : [paragraph]
}

export const splitLongTextUnits = (text, maxChars = 900) => splitOversizedParagraph(text, maxChars)

export const normalizeTextRecord = (text) => {
  const paragraphs = splitParagraphs(text).flatMap((paragraph) => splitOversizedParagraph(paragraph, 900))
  const sections = []
  let current = {
    heading: 'Opening',
    paragraphs: [],
  }

  for (const paragraph of paragraphs) {
    const isHeading =
      paragraph.length < 120 &&
      paragraph === paragraph.toUpperCase() &&
      /[A-Z]/.test(paragraph) &&
      !/[.?!]$/.test(paragraph)

    if (isHeading && current.paragraphs.length > 0) {
      sections.push(current)
      current = {
        heading: paragraph,
        paragraphs: [],
      }
      continue
    }

    current.paragraphs.push(paragraph)
  }

  if (current.heading || current.paragraphs.length > 0) {
    sections.push(current)
  }

  return {
    paragraphs,
    sections: sections.filter((section) => section.paragraphs.length > 0),
  }
}

export const buildChunkRecords = (work, normalizedText, maxChars = 1200) => {
  const chunks = []
  let chunkIndex = 0

  for (const section of normalizedText.sections) {
    let buffer = ''
    let paragraphStart = 0
    let paragraphCount = 0

    const sectionUnits = section.paragraphs.flatMap((paragraph) => splitOversizedParagraph(paragraph, maxChars - 120))

    for (let index = 0; index < sectionUnits.length; index += 1) {
      const paragraph = sectionUnits[index]
      const nextBuffer = buffer ? `${buffer}\n\n${paragraph}` : paragraph
      if (nextBuffer.length > maxChars && buffer) {
        chunks.push({
          chunk_id: `${work.work_id}-chunk-${String(chunkIndex).padStart(4, '0')}`,
          work_id: work.work_id,
          title: work.title,
          creator: work.creator,
          section_heading: section.heading,
          chunk_index: chunkIndex,
          paragraph_start: paragraphStart,
          paragraph_count: paragraphCount,
          text: buffer,
          source_url: work.source_url,
          rights_status: work.rights_status,
          topic_family: work.topic_family,
        })
        chunkIndex += 1
        buffer = paragraph
        paragraphStart = index
        paragraphCount = 1
      } else {
        buffer = nextBuffer
        paragraphCount += 1
      }
    }

    if (buffer) {
      chunks.push({
        chunk_id: `${work.work_id}-chunk-${String(chunkIndex).padStart(4, '0')}`,
        work_id: work.work_id,
        title: work.title,
        creator: work.creator,
        section_heading: section.heading,
        chunk_index: chunkIndex,
        paragraph_start: paragraphStart,
        paragraph_count: paragraphCount,
        text: buffer,
        source_url: work.source_url,
        rights_status: work.rights_status,
        topic_family: work.topic_family,
      })
      chunkIndex += 1
    }
  }

  return chunks
}

export const classifyGutenbergRecord = (record) => {
  const title = record.Title ?? ''
  const subjects = record.Subjects ?? ''
  const bookshelves = record.Bookshelves ?? ''
  const authors = record.Authors ?? ''
  const searchText = [title, subjects, bookshelves, authors].join(' | ')

  if (excludePatterns.some((pattern) => pattern.test(searchText))) {
    return null
  }

  const matchedTags = []
  let score = 0

  for (const matcher of strongPatterns) {
    if (matcher.pattern.test(searchText)) {
      score += matcher.score
      matchedTags.push(matcher.tag)
    }
  }

  const hasHealthSignal = healthPatterns.some((pattern) => pattern.test(searchText))
  const hasPlantSignal = plantPatterns.some((pattern) => pattern.test(searchText))

  if (hasHealthSignal && hasPlantSignal) {
    score += 8
  }

  if (/\bhousehold\b/i.test(searchText) && hasHealthSignal) {
    score += 6
    matchedTags.push('household-health')
  }

  if (!hasHealthSignal && !hasPlantSignal) {
    return null
  }

  if (score < 14 && !(score >= 10 && hasHealthSignal && hasPlantSignal)) {
    return null
  }

  const uniqueTags = [...new Set(matchedTags)]
  const topicFamily = uniqueTags.length > 0 ? uniqueTags.join(';') : hasPlantSignal ? 'botany' : 'domestic-medicine'

  return {
    score,
    topicFamily,
    reasons: uniqueTags,
  }
}

export const fetchWithRetry = async (url, options = {}, retries = 3) => {
  let lastError
  const { timeoutMs = 2 * 60 * 1000, ...fetchOptions } = options

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const controller =
      Number.isFinite(timeoutMs) && timeoutMs > 0 && !fetchOptions.signal ? new AbortController() : null
    const timeoutHandle =
      controller && Number.isFinite(timeoutMs) && timeoutMs > 0
        ? setTimeout(() => controller.abort(), timeoutMs)
        : null

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller?.signal ?? fetchOptions.signal,
      })
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`)
      }
      return response
    } catch (error) {
      lastError =
        controller?.signal?.aborted && error?.name === 'AbortError'
          ? new Error(`Fetch timed out after ${timeoutMs}ms for ${url}`)
          : error
      if (attempt < retries) {
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 300 * attempt))
      }
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle)
      }
    }
  }

  throw lastError
}

export const loadWorksRegistry = async () => {
  try {
    return sanitizeWorkRows(await readCsvFile(worksRegistryPath))
  } catch {
    return []
  }
}

export const summarizeManifestArchive = async () => {
  const summary = {
    totalWorks: 0,
    totalChunkRecords: 0,
    totalParagraphRecords: 0,
    byCollection: {},
  }

  let entries = []
  try {
    entries = await readdir(worksDir, { withFileTypes: true })
  } catch {
    return summary
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue
    }

    let manifest
    try {
      manifest = JSON.parse(await readFile(resolve(worksDir, entry.name, 'manifest.json'), 'utf8'))
    } catch {
      continue
    }

    const collectionId = manifest.collectionId ?? manifest.sourceCollectionId ?? 'unknown'
    const chunkCount = Number.isFinite(Number(manifest.chunkCount)) ? Number(manifest.chunkCount) : 0
    const paragraphCount = Number.isFinite(Number(manifest.paragraphCount)) ? Number(manifest.paragraphCount) : 0

    summary.totalWorks += 1
    summary.totalChunkRecords += chunkCount
    summary.totalParagraphRecords += paragraphCount
    summary.byCollection[collectionId] ??= {
      workCount: 0,
      chunkRecords: 0,
      paragraphRecords: 0,
    }
    summary.byCollection[collectionId].workCount += 1
    summary.byCollection[collectionId].chunkRecords += chunkCount
    summary.byCollection[collectionId].paragraphRecords += paragraphCount
  }

  return summary
}

export const saveWorksRegistry = async (rows) => {
  const ordered = [...sanitizeWorkRows(rows)].sort((left, right) => left.work_id.localeCompare(right.work_id))
  await writeCsvFile(worksRegistryPath, ordered)
}

export const withWorksRegistryLock = async (label, task, options = {}) => {
  await mkdir(registryLocksDir, { recursive: true })

  const timeoutMs = Number(options.timeoutMs ?? 10 * 60 * 1000)
  const pollMs = Number(options.pollMs ?? 500)
  const staleMs = Number(options.staleMs ?? 12 * 60 * 60 * 1000)
  const startedAt = Date.now()

  while (true) {
    try {
      await mkdir(worksRegistryLockDir)
      break
    } catch (error) {
      if (error?.code !== 'EEXIST') {
        throw error
      }

      let owner = null
      try {
        owner = JSON.parse(await readFile(worksRegistryLockMetaPath, 'utf8'))
      } catch {
        owner = null
      }

      const acquiredAtMs = owner?.acquiredAt ? new Date(owner.acquiredAt).getTime() : Number.NaN
      if (Number.isFinite(acquiredAtMs) && Date.now() - acquiredAtMs > staleMs) {
        await rm(worksRegistryLockDir, { recursive: true, force: true })
        continue
      }

      if (Date.now() - startedAt >= timeoutMs) {
        const ownerDetails = owner
          ? ` held by ${owner.label ?? 'unknown'} (pid ${owner.pid ?? 'unknown'}) since ${owner.acquiredAt ?? 'unknown'}`
          : ''
        throw new Error(`Timed out waiting for works registry lock after ${timeoutMs}ms.${ownerDetails}`)
      }

      await new Promise((resolveDelay) => setTimeout(resolveDelay, pollMs))
    }
  }

  await writeFile(
    worksRegistryLockMetaPath,
    `${JSON.stringify(
      {
        label,
        pid: process.pid,
        cwd: process.cwd(),
        acquiredAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
    'utf8',
  )

  try {
    return await task()
  } finally {
    await rm(worksRegistryLockDir, { recursive: true, force: true })
  }
}

export const mergeWorks = (existingRows, incomingRows) => {
  const ingestPriority = new Map([
    ['discovered', 0],
    ['download_failed', 1],
    ['chunked', 2],
  ])
  const reviewPriority = new Map([
    ['auto_selected', 0],
    ['catalog_rights_verified', 1],
    ['item_license_verified', 1],
    ['manual_retry_required', 2],
    ['downloaded_and_normalized', 3],
  ])
  const pickStatus = (currentValue, incomingValue, priorityMap) => {
    const currentPriority = priorityMap.get(currentValue) ?? 0
    const incomingPriority = priorityMap.get(incomingValue) ?? 0
    return incomingPriority >= currentPriority ? incomingValue : currentValue
  }

  const byId = new Map(sanitizeWorkRows(existingRows).map((row) => [row.work_id, row]))

  for (const incoming of sanitizeWorkRows(incomingRows)) {
    const current = byId.get(incoming.work_id)
    if (!current) {
      byId.set(incoming.work_id, incoming)
      continue
    }

    byId.set(incoming.work_id, {
      ...current,
      ...incoming,
      ingest_status: pickStatus(current.ingest_status, incoming.ingest_status, ingestPriority),
      acquisition_mode:
        (ingestPriority.get(incoming.ingest_status) ?? 0) >= (ingestPriority.get(current.ingest_status) ?? 0)
          ? incoming.acquisition_mode || current.acquisition_mode
          : current.acquisition_mode || incoming.acquisition_mode,
      ocr_mode:
        (ingestPriority.get(incoming.ingest_status) ?? 0) >= (ingestPriority.get(current.ingest_status) ?? 0)
          ? incoming.ocr_mode || current.ocr_mode
          : current.ocr_mode || incoming.ocr_mode,
      review_status: pickStatus(current.review_status, incoming.review_status, reviewPriority),
      notes: mergeNotes(current.notes, incoming.notes),
    })
  }

  return [...byId.values()]
}

export const mergeIntoWorksRegistry = async (label, incomingRows, lockOptions = {}) =>
  withWorksRegistryLock(
    label,
    async () => {
      const currentRegistry = await loadWorksRegistry()
      const mergedRows = mergeWorks(currentRegistry, incomingRows)
      await saveWorksRegistry(mergedRows)
      return mergedRows
    },
    lockOptions,
  )

export const writeJson = async (path, value) => {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

export const writeJsonLines = async (path, records) => {
  const stream = createWriteStream(path, { encoding: 'utf8' })
  stream.on('error', () => {
    // Error is handled by the awaited finish/error race below.
  })

  for (const record of records) {
    const line = `${JSON.stringify(record)}\n`
    if (!stream.write(line)) {
      await once(stream, 'drain')
    }
  }

  stream.end()
  await once(stream, 'finish')
}

export const buildWorkMarkdown = (work, manifest) => `# ${work.title}

- Work ID: \`${work.work_id}\`
- Creator: ${work.creator || 'Unknown'}
- Publication year: ${work.publication_year || 'Unknown'}
- Collection: ${work.collection_id}
- Topic family: ${work.topic_family}
- Rights status: ${work.rights_status}
- Reuse license: ${work.reuse_license}
- Source URL: ${work.source_url}
- Download URL: ${work.download_url}
- Metadata URL: ${work.metadata_url}
- Ingest status: ${work.ingest_status}
- Review status: ${work.review_status}

## Notes

${work.notes || 'No notes recorded.'}

## Local Files

- Raw source: \`${manifest.rawFile}\`
- Normalized text: \`${manifest.normalizedFile}\`
- Chunk file: \`${manifest.chunkFile}\`

## Checksums

- Raw SHA-256: \`${manifest.rawSha256}\`
- Normalized SHA-256: \`${manifest.normalizedSha256}\`
`

export const readCatalogMatches = async (path) => {
  const records = []
  const stream = createReadStream(path, 'utf8')
  const lineReader = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  })

  let headers = null
  for await (const line of lineReader) {
    if (!headers) {
      headers = parseCsvLine(line)
      continue
    }

    if (!line.trim()) {
      continue
    }

    const values = parseCsvLine(line)
    const record = headers.reduce((row, header, index) => {
      row[header] = values[index] ?? ''
      return row
    }, {})
    records.push(record)
  }

  return records
}

export const sleep = (milliseconds) => new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds))

export const registryHeadersList = registryHeaders
