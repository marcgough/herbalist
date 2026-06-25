import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { homedir } from 'node:os'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import AdmZip from 'adm-zip'
import { XMLParser } from 'fast-xml-parser'
import {
  buildChunkRecords,
  buildWorkMarkdown,
  chunksDir,
  classifyGutenbergRecord,
  ensureCorpusDirectories,
  exportsDir,
  fetchWithRetry,
  importsDir,
  loadWorksRegistry,
  mergeIntoWorksRegistry,
  mergeWorks,
  normalizeTextRecord,
  normalizedDir,
  rawDir,
  saveWorksRegistry,
  sha256,
  sleep,
  worksDir,
  writeJson,
  writeJsonLines,
} from './lib.mjs'

const sourceCollectionId = 'wellcome-collection'
const baseApiUrl = 'https://api.wellcomecollection.org/catalogue/v2/works'
const wellcomeTextBaseUrl = 'https://api.wellcomecollection.org/text/v1'
const defaultUserAgent = 'Herbalisti Corpus Builder/1.0 (local rights-cleared corpus workflow)'
const allowlistedLicenses = new Set(['pdm', 'cc-0', 'cc-by', 'cc-by-sa'])
const queryTerms = [
  'herbal',
  'materia medica',
  'medicinal plants',
  'medical botany',
  'domestic medicine',
  'pharmacopoeia',
]

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, rawValue = 'true'] = argument.replace(/^--/, '').split('=')
    return [key, rawValue]
  }),
)

const limit = Number(args.get('limit') ?? Number.POSITIVE_INFINITY)
const downloadDelayMs = Number(args.get('delay-ms') ?? 150)
const discoveryOnly = args.get('discovery-only') === 'true'
const retryFailed = args.get('retry-failed') === 'true'
const allowPdfOcr = args.get('allow-pdf-ocr') !== 'false'
const pageSize = 100
const maxPagesPerQuery = Number(args.get('max-pages-per-query') ?? 5)
const pdfTextMinLength = Number(args.get('pdf-text-min-length') ?? 2000)
const pdfOcrScale = Number(args.get('pdf-ocr-scale') ?? 0.7)
const pdfOcrMaxPages = Number(args.get('pdf-ocr-max-pages') ?? Number.POSITIVE_INFINITY)
const pdfTextExtractTimeoutMs = Number(args.get('pdf-text-extract-timeout-ms') ?? 10 * 60 * 1000)
const pdfOcrTimeoutMs = Number(args.get('pdf-ocr-timeout-ms') ?? 45 * 60 * 1000)
const scriptDir = resolve(fileURLToPath(new URL('.', import.meta.url)))
const projectRootDir = resolve(scriptDir, '..', '..')
const localPdfOcrHelper = resolve(scriptDir, 'extract-pdf-ocr.py')
const localOcrSiteDir = resolve(projectRootDir, '.tools', 'ocr-site')
const bundledPythonPath = resolve(
  homedir(),
  '.cache',
  'codex-runtimes',
  'codex-primary-runtime',
  'dependencies',
  'python',
  'python.exe',
)
const altoParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
})

const normalizeWhitespace = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

const readJsonIfExists = async (filePath) => {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'))
  } catch {
    return null
  }
}

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
  if (topic.includes('herbal')) score += 100
  if (topic.includes('medicinal-plants')) score += 90
  if (topic.includes('domestic-medicine')) score += 80
  if (topic.includes('medical-botany')) score += 70
  if (topic.includes('materia-medica')) score += 55
  if (topic.includes('cultivation')) score += 30
  if (topic.includes('botany')) score += 20
  if (topic.includes('pharmacopoeia')) score += 10
  if (/[A-Za-z]{4,}/.test(work.title ?? '')) score += 5
  if (/culpeper|herbal|health|medicinal|botany|domestic|family/i.test(work.title ?? '')) score += 10
  return score
}

const extractProductionYear = (productions) => {
  const label = productions?.flatMap((production) => production.dates ?? []).map((date) => date.label).find(Boolean) ?? ''
  const yearMatch = label.match(/\b(1[5-9]\d{2}|20\d{2})\b/)
  return yearMatch ? yearMatch[1] : ''
}

const joinLabels = (records) =>
  (records ?? [])
    .map((record) => record.label)
    .filter(Boolean)
    .join('; ')

const findDigitalLocation = (items) => {
  for (const item of items ?? []) {
    for (const location of item.locations ?? []) {
      if (
        location.type === 'DigitalLocation' &&
        location.locationType?.id === 'iiif-presentation' &&
        allowlistedLicenses.has(location.license?.id ?? '') &&
        (location.accessConditions ?? []).some((condition) => condition.status?.id === 'open')
      ) {
        return location
      }
    }
  }
  return null
}

const toWorkId = (workId) => `wellcome-${workId}`

const buildRegistryRow = (work, classification, matchedQueries, digitalLocation) => {
  const contributors = joinLabels(work.contributors)
  const publicationYear = extractProductionYear(work.production)
  const manifestId = digitalLocation.url.split('/').at(-1)
  const rawTextUrl = `https://api.wellcomecollection.org/text/v1/${manifestId}`
  const sourceWorkUrl = `https://wellcomecollection.org/works/${work.id}`

  return {
    work_id: toWorkId(work.id),
    title: work.title ?? '',
    creator: contributors,
    publication_year: publicationYear,
    collection_id: sourceCollectionId,
    jurisdiction_lane: 'UK',
    source_url: sourceWorkUrl,
    download_url: rawTextUrl,
    metadata_url: `${baseApiUrl}/${work.id}`,
    rights_status: digitalLocation.license?.id ?? 'review_required',
    reuse_license: digitalLocation.license?.label ?? 'Item-level rights review required',
    rights_basis:
      'Wellcome Collection item has an open digital location with an allowlisted license and is being acquired through the official catalogue and text endpoints.',
    file_format: 'txt',
    acquisition_mode: 'api_plus_iiif',
    ocr_mode: 'wellcome_text_api',
    topic_family: classification.topicFamily,
    ingest_status: 'discovered',
    review_status: 'item_license_verified',
    notes: `Wellcome query terms: ${matchedQueries.join(', ')}; matched ${classification.reasons.join(', ') || 'keyword signals'}; manifest ${digitalLocation.url}; license ${digitalLocation.license?.id ?? 'unknown'}.`,
  }
}

const manifestUrlFromNotes = (notes) => {
  const manifestMatch = notes.match(/manifest\s(https:\/\/\S+); license/i)
  return manifestMatch ? manifestMatch[1] : null
}

const stripProcessingFailureNotes = (notes) =>
  String(notes ?? '')
    .replace(/\s*\|\s*Download or processing failed:[^|]+/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

const manifestIdFromUrl = (manifestUrl) => {
  if (!manifestUrl) {
    return ''
  }
  return manifestUrl.split('/').at(-1)?.replace(/\?.*$/, '') ?? ''
}

const fetchManifest = async (manifestUrl) => {
  const manifestResponse = await fetchWithRetry(manifestUrl, {
    headers: {
      'user-agent': defaultUserAgent,
    },
  })
  return manifestResponse.json()
}

const fetchPresentationV3 = async (manifestId) => {
  const response = await fetchWithRetry(`https://iiif.wellcomecollection.org/presentation/${manifestId}`, {
    headers: {
      'user-agent': defaultUserAgent,
    },
  })
  return response.json()
}

const runCommand = (command, commandArgs, options = {}) =>
  new Promise((resolvePromise, rejectPromise) => {
    const { timeoutMs, ...spawnOptions } = options
    const child = spawn(command, commandArgs, {
      cwd: projectRootDir,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
      ...spawnOptions,
    })

    let stdout = ''
    let stderr = ''
    let timedOut = false
    const timeoutHandle =
      Number.isFinite(timeoutMs) && timeoutMs > 0
        ? setTimeout(() => {
            timedOut = true
            child.kill()
          }, timeoutMs)
        : null

    child.stdout?.on('data', (chunk) => {
      stdout += chunk
    })
    child.stderr?.on('data', (chunk) => {
      stderr += chunk
    })
    child.on('error', rejectPromise)
    child.on('close', (code) => {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle)
      }

      if (timedOut) {
        rejectPromise(new Error(`${command} timed out after ${timeoutMs}ms`))
        return
      }

      if (code === 0) {
        resolvePromise({
          stdout,
          stderr,
          code,
        })
        return
      }

      const error = new Error(`${command} exited with code ${code}${stderr ? `: ${stderr.trim()}` : ''}`)
      error.stdout = stdout
      error.stderr = stderr
      error.code = code
      rejectPromise(error)
    })
  })

const renderLabelText = (value) => {
  if (!value) {
    return ''
  }
  if (typeof value === 'string') {
    return value
  }
  if (Array.isArray(value)) {
    return value.map((entry) => renderLabelText(entry)).filter(Boolean).join(' ')
  }
  if (typeof value === 'object') {
    return Object.values(value)
      .flatMap((entry) => (Array.isArray(entry) ? entry : [entry]))
      .map((entry) => renderLabelText(entry))
      .filter(Boolean)
      .join(' ')
  }
  return ''
}

const toSafeFileToken = (value) =>
  normalizeWhitespace(value)
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'source'

const manifestUrlFor = (manifest) => manifest?.['@id'] ?? manifest?.id ?? null

const manifestIdFromZipFileName = (fileName) => {
  const match = String(fileName ?? '').match(/^source-text-([^.]+)\.zip$/i)
  return match?.[1] ?? ''
}

const manifestCanvasCount = (manifest) => manifest?.sequences?.[0]?.canvases?.length ?? manifest?.items?.length ?? 0

const normalizeManifestLabel = (manifest) => normalizeWhitespace(renderLabelText(manifest?.label))

const asArray = (value) => (Array.isArray(value) ? value : value ? [value] : [])

const buildManifestCandidates = async (manifestUrl, manifest) => {
  const candidates = []
  const seenManifestUrls = new Set()

  const registerCandidate = (candidateUrl, candidateManifest, labelOverride = '') => {
    if (!candidateUrl || !candidateManifest || seenManifestUrls.has(candidateUrl)) {
      return
    }

    seenManifestUrls.add(candidateUrl)
    candidates.push({
      manifestUrl: candidateUrl,
      manifest: candidateManifest,
      manifestId: manifestIdFromUrl(candidateUrl),
      label: normalizeWhitespace(labelOverride || normalizeManifestLabel(candidateManifest)),
      canvasCount: manifestCanvasCount(candidateManifest),
    })
  }

  const collectNestedCandidates = async (node) => {
    if (!node || typeof node !== 'object') {
      return
    }

    for (const entry of asArray(node.manifests)) {
      const childUrl = entry?.['@id']
      if (!childUrl) {
        continue
      }

      let childManifest = entry
      if (childManifest?.['@type'] !== 'sc:Manifest' || manifestCanvasCount(childManifest) === 0) {
        try {
          childManifest = await fetchManifest(childUrl)
        } catch {
          continue
        }
      }

      registerCandidate(childUrl, childManifest, renderLabelText(entry.label) || renderLabelText(childManifest.label))
    }

    for (const collectionEntry of asArray(node.collections)) {
      if (collectionEntry?.manifests || collectionEntry?.collections) {
        await collectNestedCandidates(collectionEntry)
        continue
      }

      const collectionUrl = collectionEntry?.['@id']
      if (!collectionUrl) {
        continue
      }

      try {
        const childCollection = await fetchManifest(collectionUrl)
        await collectNestedCandidates(childCollection)
      } catch {
        // Skip broken nested collections and keep trying the rest.
      }
    }
  }

  // Keep the root collection candidate available as a final official fallback.
  registerCandidate(manifestUrl, manifest)

  if (manifest?.['@type'] === 'sc:Collection') {
    await collectNestedCandidates(manifest)
  }

  return candidates.sort(
    (left, right) =>
      right.canvasCount - left.canvasCount ||
      left.label.localeCompare(right.label) ||
      left.manifestUrl.localeCompare(right.manifestUrl),
  )
}

const isWellcomeWrapperOnlyText = (text) => {
  const normalized = normalizeWhitespace(text)
  if (!normalized) {
    return true
  }

  const wordCount = normalized.split(' ').length
  return (
    /License and attribution/i.test(normalized) &&
    /Wellcome Collection 183 Euston Road/i.test(normalized) &&
    wordCount < 300
  )
}

const isLikelyVolumeHeadingOnlyText = (text) => {
  const normalized = normalizeWhitespace(text)
  if (normalized.length > 400 || normalized.split(' ').length > 80) {
    return false
  }

  const lines = String(text ?? '')
    .split(/\r?\n/)
    .map((line) => normalizeWhitespace(line))
    .filter(Boolean)

  return (
    lines.length > 0 &&
    lines.length <= 8 &&
    lines.every(
      (line) => line.length <= 140 && /\b(?:volume|vol(?:ume)?|part|copy|book|tome)\s+[ivxlcdm0-9]+\b/i.test(line),
    )
  )
}

const hasSufficientWellcomeTextForManifest = (text, manifest) => {
  const normalized = normalizeWhitespace(text)
  if (!normalized || isWellcomeWrapperOnlyText(text) || isLikelyVolumeHeadingOnlyText(text)) {
    return false
  }

  const wordCount = normalized.split(' ').length
  const canvasCount = manifestCanvasCount(manifest)

  if (canvasCount >= 80) {
    return normalized.length >= 2200 && wordCount >= 320
  }

  if (canvasCount >= 40) {
    return normalized.length >= 1200 && wordCount >= 180
  }

  if (canvasCount >= 20) {
    return normalized.length >= 600 && wordCount >= 90
  }

  return normalized.length >= 220 && wordCount >= 35
}

const hasSubstantialRecoveredText = (text) => {
  const normalized = normalizeWhitespace(text)
  return normalized.length >= pdfTextMinLength && !isWellcomeWrapperOnlyText(text)
}

const extractTextFromPdfWithPdftotext = async (pdfFile, workRawDir, fileToken) => {
  const outputFile = resolve(workRawDir, `source-${fileToken}-pdftotext.txt`)

  try {
    await runCommand('pdftotext', [pdfFile, outputFile], {
      timeoutMs: pdfTextExtractTimeoutMs,
    })
  } catch {
    return null
  }

  let rawText = ''
  try {
    rawText = await readFile(outputFile, 'utf8')
  } catch {
    rawText = ''
  }

  return {
    mode: 'wellcome_pdf_text_extract',
    rawText,
    outputFile,
    summary: null,
  }
}

const extractTextFromPdfWithLocalOcr = async (pdfFile, workRawDir, fileToken) => {
  const outputFile = resolve(workRawDir, `source-${fileToken}-ocr.txt`)
  const pythonCandidates = [
    process.env.HERBALISTI_PDF_OCR_PYTHON,
    process.env.CODEX_PYTHON,
    bundledPythonPath,
    'python',
    'python3',
  ].filter(Boolean)

  for (const pythonCommand of [...new Set(pythonCandidates)]) {
    try {
      const commandArgs = [
        localPdfOcrHelper,
        '--pdf',
        pdfFile,
        '--out',
        outputFile,
        '--scale',
        String(pdfOcrScale),
        '--ocr-site',
        localOcrSiteDir,
      ]

      if (Number.isFinite(pdfOcrMaxPages)) {
        commandArgs.push('--max-pages', String(pdfOcrMaxPages))
      }

      const { stdout } = await runCommand(pythonCommand, commandArgs, {
        env: {
          ...process.env,
          PYTHONIOENCODING: 'utf-8',
          PYTHONUTF8: '1',
        },
        timeoutMs: pdfOcrTimeoutMs,
      })
      const rawText = await readFile(outputFile, 'utf8')
      const summary = stdout.trim() ? JSON.parse(stdout.trim().split(/\r?\n/).at(-1)) : null
      const completeCoverage = summary
        ? Number(summary.processedPages ?? 0) >= Number(summary.pageCount ?? 0)
        : !Number.isFinite(pdfOcrMaxPages) || pdfOcrMaxPages <= 0

      return {
        mode: 'wellcome_pdf_local_ocr',
        rawText,
        outputFile,
        summary,
        completeCoverage,
      }
    } catch {
      // Try the next Python command.
    }
  }

  return null
}

const recoverTextFromPdfFallback = async (pdfFile, workRawDir, fileToken) => {
  const pdftotextResult = await extractTextFromPdfWithPdftotext(pdfFile, workRawDir, fileToken)
  if (hasSubstantialRecoveredText(pdftotextResult?.rawText ?? '')) {
    return pdftotextResult
  }

  if (!allowPdfOcr) {
    return pdftotextResult
  }

  const ocrResult = await extractTextFromPdfWithLocalOcr(pdfFile, workRawDir, fileToken)
  if (hasSubstantialRecoveredText(ocrResult?.rawText ?? '')) {
    return ocrResult
  }

  return ocrResult ?? pdftotextResult
}

const recoverTextFromLocalArtifacts = async (workRawDir, { manifestFile, selectedManifestFile, presentationFile }) => {
  let fileNames = []

  try {
    fileNames = await readdir(workRawDir)
  } catch {
    return null
  }

  const selectedManifest = await readJsonIfExists(selectedManifestFile)
  const presentation = await readJsonIfExists(presentationFile)
  const rootManifest = await readJsonIfExists(manifestFile)
  const candidateManifest = selectedManifest ?? presentation ?? rootManifest
  const candidateManifestUrl = manifestUrlFor(selectedManifest) ?? manifestUrlFor(rootManifest) ?? manifestUrlFor(presentation)

  const zipFileNames = fileNames
    .filter((name) => /^source-text.*\.zip$/i.test(name))
    .sort((left, right) => left.localeCompare(right))

  for (const fileName of zipFileNames) {
    const zipFile = resolve(workRawDir, fileName)

    try {
      const rawText = extractTextFromZipBuffer(await readFile(zipFile), presentation)
      const enoughText = candidateManifest
        ? hasSufficientWellcomeTextForManifest(rawText, candidateManifest)
        : hasSubstantialRecoveredText(rawText)

      if (!enoughText) {
        continue
      }

      return {
        rawText,
        sourceMode: 'wellcome_text_zip_fallback',
        usedManifestUrl: candidateManifestUrl,
        usedManifestId: manifestIdFromZipFileName(fileName) || manifestIdFromUrl(candidateManifestUrl),
        pdfFile: null,
        pdfTextFile: null,
        extractorSummary: {
          reusedLocalArtifact: true,
          artifact: fileName,
        },
      }
    } catch {
      // Keep trying other local artifact candidates.
    }
  }

  const textFileNames = fileNames
    .filter((name) => /^source-.*(?:ocr|pdftotext)\.txt$/i.test(name))
    .sort((left, right) => left.localeCompare(right))

  for (const fileName of textFileNames) {
    const textFile = resolve(workRawDir, fileName)

    try {
      const rawText = await readFile(textFile, 'utf8')
      const enoughText = candidateManifest
        ? hasSufficientWellcomeTextForManifest(rawText, candidateManifest)
        : hasSubstantialRecoveredText(rawText)

      if (!enoughText) {
        continue
      }

      return {
        rawText,
        sourceMode: /ocr\.txt$/i.test(fileName) ? 'wellcome_pdf_local_ocr' : 'wellcome_pdf_text_extract',
        usedManifestUrl: candidateManifestUrl,
        usedManifestId: manifestIdFromUrl(candidateManifestUrl),
        pdfFile: null,
        pdfTextFile: textFile,
        extractorSummary: {
          reusedLocalArtifact: true,
          artifact: fileName,
        },
      }
    } catch {
      // Keep trying other local artifact candidates.
    }
  }

  return null
}

const sortVolumeParts = (left, right) => {
  const leftVolume = left.label.match(/\bvolume\s+(\d+)\b/i)?.[1]
  const rightVolume = right.label.match(/\bvolume\s+(\d+)\b/i)?.[1]
  if (leftVolume && rightVolume && leftVolume !== rightVolume) {
    return Number(leftVolume) - Number(rightVolume)
  }
  return left.entry.entryName.localeCompare(right.entry.entryName)
}

const chooseZipEntries = (zipEntries, presentation) => {
  const items = presentation?.items ?? []
  const labelByStem = new Map(
    items.map((item) => [
      item.id?.split('/').at(-1)?.replace(/\.txt$/i, '') ?? '',
      normalizeWhitespace(renderLabelText(item.label)),
    ]),
  )

  const annotated = zipEntries.map((entry) => {
    const stem = entry.entryName.replace(/\.[^.]+$/i, '')
    return {
      entry,
      label: labelByStem.get(stem) ?? '',
    }
  })

  if (annotated.length <= 1) {
    return annotated
  }

  const volumeLike = annotated.filter(({ label }) => /\bvolume\s+\d+\b/i.test(label))
  if (volumeLike.length === annotated.length) {
    return [...annotated].sort(sortVolumeParts)
  }

  const copyLike = annotated.filter(({ label }) => /\bcopy\b/i.test(label))
  if (copyLike.length === annotated.length) {
    return [
      [...annotated].sort(
        (left, right) => right.entry.header.size - left.entry.header.size || left.entry.entryName.localeCompare(right.entry.entryName),
      )[0],
    ]
  }

  return [...annotated].sort((left, right) => left.entry.entryName.localeCompare(right.entry.entryName))
}

const extractTextFromZipBuffer = (buffer, presentation) => {
  const zip = new AdmZip(buffer)
  const entries = zip
    .getEntries()
    .filter((entry) => !entry.isDirectory && /\.(txt|text)$/i.test(entry.entryName))

  if (entries.length === 0) {
    return ''
  }

  const selectedEntries = chooseZipEntries(entries, presentation)
  const parts = selectedEntries.map(({ entry, label }, index) => {
    const text = entry.getData().toString('utf8')
    const normalizedLabel = normalizeWhitespace(label)
    const heading =
      selectedEntries.length > 1
        ? [`PART ${index + 1}`, normalizedLabel].filter(Boolean).join(' - ')
        : normalizedLabel
    return heading ? `${heading}\n\n${text.trim()}` : text.trim()
  })

  return parts.filter(Boolean).join('\n\n')
}

const buildZipCandidates = (manifestId) => {
  const ids = [manifestId]
  if (/_\d{4}$/i.test(manifestId)) {
    ids.push(manifestId.replace(/_\d{4}$/i, ''))
  }
  return [...new Set(ids)].filter(Boolean)
}

const fetchTextZipFallback = async (manifestId, workRawDir) => {
  let lastError = null

  for (const candidateId of buildZipCandidates(manifestId)) {
    const zipUrl = `${wellcomeTextBaseUrl}/${candidateId}.zip`

    try {
      const response = await fetchWithRetry(zipUrl, {
        headers: {
          'user-agent': defaultUserAgent,
        },
      })
      const buffer = Buffer.from(await response.arrayBuffer())
      const zipFile = resolve(workRawDir, candidateId === manifestId ? 'source-text.zip' : `source-text-${candidateId}.zip`)
      await writeFile(zipFile, buffer)

      let presentation = null
      try {
        presentation = await fetchPresentationV3(candidateId)
      } catch {
        presentation = null
      }

      const rawText = extractTextFromZipBuffer(buffer, presentation)
      if (rawText.trim()) {
        return {
          rawText,
          zipFile,
          zipUrl,
          presentation,
        }
      }
    } catch (error) {
      lastError = error
    }
  }

  if (lastError) {
    throw lastError
  }

  return null
}

const collectAltoLines = (node, lines) => {
  if (!node) {
    return
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      collectAltoLines(item, lines)
    }
    return
  }

  if (typeof node !== 'object') {
    return
  }

  if (node.TextLine) {
    const textLines = Array.isArray(node.TextLine) ? node.TextLine : [node.TextLine]
    for (const line of textLines) {
      const strings = []
      const collectStrings = (lineNode) => {
        if (!lineNode) {
          return
        }
        if (Array.isArray(lineNode)) {
          for (const item of lineNode) {
            collectStrings(item)
          }
          return
        }
        if (typeof lineNode !== 'object') {
          return
        }
        if (lineNode.String) {
          const values = Array.isArray(lineNode.String) ? lineNode.String : [lineNode.String]
          for (const value of values) {
            if (value?.['@_CONTENT']) {
              strings.push(value['@_CONTENT'])
            }
          }
        }
        for (const value of Object.values(lineNode)) {
          collectStrings(value)
        }
      }

      collectStrings(line)
      const lineText = strings.join(' ').replace(/\s+/g, ' ').trim()
      if (lineText) {
        lines.push(lineText)
      }
    }
  }

  for (const value of Object.values(node)) {
    collectAltoLines(value, lines)
  }
}

const buildRawTextFromAlto = async (manifest) => {
  const altoUrls = (manifest.sequences?.[0]?.canvases ?? [])
    .map((canvas) => canvas.seeAlso?.['@id'])
    .filter(Boolean)

  const lines = []
  for (const altoUrl of altoUrls) {
    const response = await fetchWithRetry(altoUrl, {
      headers: {
        'user-agent': defaultUserAgent,
      },
    })
    const xml = await response.text()
    const parsed = altoParser.parse(xml)
    collectAltoLines(parsed, lines)
  }

  return lines.join('\n')
}

const maybeDownloadPdfFallback = async (manifest, workRawDir, fileToken = 'source') => {
  const pdfUrl = asArray(manifest.sequences?.[0]?.rendering).find((item) => item.format === 'application/pdf')?.['@id']
  if (!pdfUrl) {
    return null
  }

  const response = await fetchWithRetry(pdfUrl, {
    headers: {
      'user-agent': defaultUserAgent,
    },
  })
  const pdfBuffer = Buffer.from(await response.arrayBuffer())
  const pdfFile = resolve(workRawDir, `${fileToken}.pdf`)
  await writeFile(pdfFile, pdfBuffer)
  return {
    pdfFile,
    pdfUrl,
  }
}

const fetchSearchPage = async (query, page, workType) => {
  const url = new URL(baseApiUrl)
  url.searchParams.set('query', query)
  url.searchParams.set('page', String(page))
  url.searchParams.set('pageSize', String(pageSize))
  url.searchParams.set('workType', workType)
  url.searchParams.set('items.locations.accessConditions.status', 'open')
  url.searchParams.set('items.locations.license', 'pdm')
  url.searchParams.set('include', 'items,production,subjects,contributors')

  const response = await fetchWithRetry(url, {
    headers: {
      'user-agent': defaultUserAgent,
    },
  })
  return response.json()
}

const discoverWorks = async () => {
  const discovered = new Map()
  let scannedResults = 0

  for (const query of queryTerms) {
    for (const workType of ['a']) {
      for (let page = 1; page <= maxPagesPerQuery; page += 1) {
        const payload = await fetchSearchPage(query, page, workType)
        const results = payload.results ?? []
        if (results.length === 0) {
          break
        }

        scannedResults += results.length

        for (const work of results) {
          const digitalLocation = findDigitalLocation(work.items)
          if (!digitalLocation) {
            continue
          }

          const subjects = joinLabels(work.subjects)
          const contributors = joinLabels(work.contributors)
          const classification = classifyGutenbergRecord({
            Title: work.title ?? '',
            Subjects: subjects,
            Bookshelves: work.workType?.label ?? '',
            Authors: contributors,
          })
          if (!classification) {
            continue
          }

          const existing = discovered.get(work.id)
          if (!existing) {
            discovered.set(work.id, {
              work,
              digitalLocation,
              classification,
              matchedQueries: new Set([query]),
            })
          } else {
            existing.matchedQueries.add(query)
          }
        }

        const totalPages = Math.ceil((payload.totalResults ?? 0) / pageSize)
        if (page >= totalPages) {
          break
        }
      }
    }
  }

  const rows = [...discovered.values()].map(({ work, digitalLocation, classification, matchedQueries }) =>
    buildRegistryRow(work, classification, [...matchedQueries].sort(), digitalLocation),
  )

  return {
    scannedResults,
    rows,
    sampleTitles: rows.slice(0, 15).map((row) => ({
      work_id: row.work_id,
      title: row.title,
      topic_family: row.topic_family,
      notes: row.notes,
    })),
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
  const manifestFile = resolve(workRawDir, 'source-manifest.json')
  const selectedManifestFile = resolve(workRawDir, 'source-selected-manifest.json')
  const presentationFile = resolve(workRawDir, 'source-presentation.json')
  const manifestUrl = manifestUrlFromNotes(work.notes)
  let rawText
  let rootManifest = await readJsonIfExists(manifestFile)
  let acquisitionDetails = {
    sourceMode: 'wellcome_text_api',
    usedManifestUrl: null,
    usedManifestId: null,
    pdfFile: null,
    pdfTextFile: null,
    extractorSummary: null,
  }

  try {
    rawText = await readFile(rawFile, 'utf8')
  } catch {
    const localArtifactRecovery = await recoverTextFromLocalArtifacts(workRawDir, {
      manifestFile,
      selectedManifestFile,
      presentationFile,
    })

    if (localArtifactRecovery) {
      rawText = localArtifactRecovery.rawText
      acquisitionDetails = {
        ...acquisitionDetails,
        sourceMode: localArtifactRecovery.sourceMode,
        usedManifestUrl: localArtifactRecovery.usedManifestUrl,
        usedManifestId: localArtifactRecovery.usedManifestId,
        pdfFile: localArtifactRecovery.pdfFile,
        pdfTextFile: localArtifactRecovery.pdfTextFile,
        extractorSummary: localArtifactRecovery.extractorSummary,
      }
      await writeFile(rawFile, rawText, 'utf8')
    } else {
      try {
        const textResponse = await fetchWithRetry(work.download_url, {
          headers: {
            'user-agent': defaultUserAgent,
          },
        })
        rawText = await textResponse.text()
      } catch (error) {
        if (!manifestUrl) {
          throw error
        }

        rootManifest ??= await fetchManifest(manifestUrl)
        await writeJson(manifestFile, rootManifest)

        const manifestCandidates = await buildManifestCandidates(manifestUrl, rootManifest)

        for (const candidate of manifestCandidates) {
          const candidateToken = toSafeFileToken(candidate.manifestId || candidate.label || candidate.manifestUrl)
          let candidateText = ''

          try {
            const zipFallback = await fetchTextZipFallback(candidate.manifestId, workRawDir)
            if (zipFallback?.presentation) {
              await writeJson(presentationFile, zipFallback.presentation)
            }
            if (hasSufficientWellcomeTextForManifest(zipFallback?.rawText ?? '', candidate.manifest)) {
              candidateText = zipFallback.rawText
              acquisitionDetails = {
                ...acquisitionDetails,
                sourceMode: 'wellcome_text_zip_fallback',
                usedManifestUrl: candidate.manifestUrl,
                usedManifestId: candidate.manifestId,
              }
            }
          } catch {
            candidateText = ''
          }

          if (!candidateText?.trim()) {
            try {
              const altoText = await buildRawTextFromAlto(candidate.manifest)
              if (hasSufficientWellcomeTextForManifest(altoText, candidate.manifest)) {
                candidateText = altoText
                acquisitionDetails = {
                  ...acquisitionDetails,
                  sourceMode: 'wellcome_alto_fallback',
                  usedManifestUrl: candidate.manifestUrl,
                  usedManifestId: candidate.manifestId,
                }
              }
            } catch {
              candidateText = ''
            }
          }

          if (!candidateText.trim()) {
            const pdfFallback = await maybeDownloadPdfFallback(candidate.manifest, workRawDir, `source-${candidateToken}`)
            if (pdfFallback) {
              const recovered = await recoverTextFromPdfFallback(pdfFallback.pdfFile, workRawDir, candidateToken)
              if (
                recovered?.completeCoverage !== false &&
                hasSufficientWellcomeTextForManifest(recovered?.rawText ?? '', candidate.manifest)
              ) {
                candidateText = recovered.rawText
                acquisitionDetails = {
                  ...acquisitionDetails,
                  sourceMode: recovered.mode,
                  usedManifestUrl: candidate.manifestUrl,
                  usedManifestId: candidate.manifestId,
                  pdfFile: pdfFallback.pdfFile,
                  pdfTextFile: recovered.outputFile,
                  extractorSummary: recovered.summary,
                }
              }
            }
          }

          if (candidateText.trim()) {
            rawText = candidateText
            if (candidate.manifestUrl !== manifestUrl) {
              await writeJson(selectedManifestFile, candidate.manifest)
            }
            break
          }
        }

        if (!rawText?.trim()) {
          if (acquisitionDetails.pdfFile) {
            throw new Error(`text endpoint unavailable; pdf fallback saved to ${acquisitionDetails.pdfFile}`)
          }
          throw error
        }
      }

      await writeFile(rawFile, rawText, 'utf8')

      if (manifestUrl && !rootManifest) {
        rootManifest = await fetchManifest(manifestUrl)
        await writeJson(manifestFile, rootManifest)
      }

      await sleep(downloadDelayMs)
    }
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
    manifestFile,
    selectedManifestFile: acquisitionDetails.usedManifestUrl && acquisitionDetails.usedManifestUrl !== manifestUrlFromNotes(work.notes) ? selectedManifestFile : null,
    normalizedFile,
    chunkFile,
    rawSha256,
    normalizedSha256,
    sourceMode: acquisitionDetails.sourceMode,
    selectedManifestUrl: acquisitionDetails.usedManifestUrl,
    selectedManifestId: acquisitionDetails.usedManifestId,
    pdfFile: acquisitionDetails.pdfFile,
    pdfTextFile: acquisitionDetails.pdfTextFile,
    extractorSummary: acquisitionDetails.extractorSummary,
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
      sampleTitles: requestedWorkIds
        .map((workId) => existingRegistryById.get(workId))
        .filter(Boolean)
        .slice(0, 15)
        .map((row) => ({
          work_id: row.work_id,
          title: row.title,
          topic_family: row.topic_family,
          notes: 'Loaded from the local Wellcome registry because explicit work IDs were supplied.',
        })),
    }

const summaryPath = resolve(exportsDir, 'wellcome-corpus-summary.json')

let mergedRows = await mergeIntoWorksRegistry(`corpus:${sourceCollectionId}:discovery`, discovery.rows)

if (discoveryOnly) {
  await writeJson(summaryPath, {
    generatedAt: new Date().toISOString(),
    sourceCollectionId,
    scannedResults: discovery.scannedResults,
    discoveredCount: discovery.rows.length,
    processedCount: 0,
    failureCount: 0,
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

  for (const row of targetRows) {
    try {
      const manifest = await processWork(row)
      row.ingest_status = 'chunked'
      row.review_status = 'downloaded_and_normalized'
      row.notes = stripProcessingFailureNotes(row.notes)
      if (manifest.sourceMode && manifest.sourceMode !== 'wellcome_text_api') {
        row.ocr_mode = manifest.sourceMode
        row.acquisition_mode =
          manifest.sourceMode === 'wellcome_pdf_local_ocr'
            ? 'api_plus_iiif_pdf_ocr'
            : 'api_plus_iiif'
        const recoveryNote = `Recovered via ${manifest.sourceMode}${manifest.selectedManifestId ? ` using ${manifest.selectedManifestId}` : ''}`
        if (!row.notes.includes(recoveryNote)) {
          row.notes = `${row.notes} | ${recoveryNote}`
        }
      }

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
      row.notes = `${row.notes} | Download or processing failed: ${error.message}`
      failures.push({
        work_id: row.work_id,
        title: row.title,
        error: error.message,
      })
      mergedRows = await mergeIntoWorksRegistry(`corpus:${sourceCollectionId}:status`, [row])
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
    retryFailed,
    processed,
    failures,
    sampleTitles: discovery.sampleTitles,
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
