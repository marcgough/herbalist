import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { buildWorkMarkdown, loadWorksRegistry, saveWorksRegistry, worksDir } from './lib.mjs'

const sourceCollectionId = 'nlm-digital-collections'

const stripProcessingFailureNotes = (notes) =>
  String(notes ?? '')
    .replace(/\s*\|\s*NLM OCR acquisition error:[^|]+/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

const rows = await loadWorksRegistry()
const repairedWorkIds = []
const rewrittenWorkIds = []

for (const row of rows) {
  if (row.collection_id !== sourceCollectionId || row.ingest_status !== 'chunked') {
    continue
  }

  const cleanedNotes = stripProcessingFailureNotes(row.notes)
  if (cleanedNotes !== row.notes) {
    row.notes = cleanedNotes
    repairedWorkIds.push(row.work_id)
  }

  try {
    const manifestPath = resolve(worksDir, row.work_id, 'manifest.json')
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
    await writeFile(resolve(worksDir, row.work_id, 'work.md'), `${buildWorkMarkdown(row, manifest)}\n`, 'utf8')
    rewrittenWorkIds.push(row.work_id)
  } catch {
    // Skip work.md repair when the manifest is unavailable.
  }
}

if (repairedWorkIds.length > 0) {
  await saveWorksRegistry(rows)
}

console.log(
  JSON.stringify(
    {
      sourceCollectionId,
      repairedCount: repairedWorkIds.length,
      rewrittenCount: rewrittenWorkIds.length,
      chunkedWorkCount: rows.filter(
        (row) => row.collection_id === sourceCollectionId && row.ingest_status === 'chunked',
      ).length,
      repairedWorkIds,
    },
    null,
    2,
  ),
)
