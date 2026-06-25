import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  buildChunkRecords,
  buildWorkMarkdown,
  chunksDir,
  loadWorksRegistry,
  normalizeTextRecord,
  normalizedDir,
  rawDir,
  sha256,
  worksDir,
  writeJson,
  writeJsonLines,
} from './lib.mjs'

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, rawValue = 'true'] = argument.replace(/^--/, '').split('=')
    return [key, rawValue]
  }),
)

const collectionFilter = args.get('collection') ?? ''
const limit = Number(args.get('limit') ?? Number.POSITIVE_INFINITY)

const works = await loadWorksRegistry()
const targetWorks = works
  .filter((work) => !collectionFilter || work.collection_id === collectionFilter)
  .filter((work) => ['chunked', 'download_failed', 'discovered'].includes(work.ingest_status))
  .slice(0, Number.isFinite(limit) ? limit : works.length)

const rebuilt = []
const skipped = []

for (const work of targetWorks) {
  const rawFile = resolve(rawDir, work.work_id, 'source.txt')
  let rawText
  try {
    rawText = await readFile(rawFile, 'utf8')
  } catch {
    skipped.push({
      work_id: work.work_id,
      reason: 'missing_raw_text',
    })
    continue
  }

  const workNormalizedDir = resolve(normalizedDir, work.work_id)
  const workManifestDir = resolve(worksDir, work.work_id)
  await mkdir(workNormalizedDir, { recursive: true })
  await mkdir(workManifestDir, { recursive: true })

  const normalizedText = normalizeTextRecord(rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n{3,}/g, '\n\n').trim())
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
    rawSha256: sha256(rawText),
    normalizedSha256: sha256(normalizedMarkdown),
    processedAt: new Date().toISOString(),
    rebuildSource: 'rebuild-text-derivatives',
  }

  await writeJson(resolve(workManifestDir, 'manifest.json'), manifest)
  await writeFile(resolve(workManifestDir, 'work.md'), `${buildWorkMarkdown(work, manifest)}\n`, 'utf8')

  rebuilt.push({
    work_id: work.work_id,
    collection_id: work.collection_id,
    paragraphCount: normalizedText.paragraphs.length,
    chunkCount: chunkRecords.length,
  })
}

console.log(
  JSON.stringify(
    {
      rebuiltCount: rebuilt.length,
      skippedCount: skipped.length,
      rebuilt: rebuilt.slice(0, 20),
      skipped: skipped.slice(0, 20),
    },
    null,
    2,
  ),
)
