import { readdir, readFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import { loadWorksRegistry, saveWorksRegistry, withWorksRegistryLock, worksDir } from './lib.mjs'

const manifestFiles = []
for (const entry of await readdir(worksDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) {
    continue
  }

  manifestFiles.push(resolve(worksDir, entry.name, 'manifest.json'))
}

const manifests = []
for (const manifestPath of manifestFiles) {
  try {
    manifests.push(JSON.parse(await readFile(manifestPath, 'utf8')))
  } catch {
    // Ignore unreadable manifests and continue.
  }
}

const result = await withWorksRegistryLock('corpus:reconcile-registry', async () => {
  const registry = await loadWorksRegistry()
  const rowsById = new Map(registry.map((row) => [row.work_id, row]))
  const updated = []
  const missingRows = []

  for (const manifest of manifests) {
    if (!manifest?.workId || !manifest?.chunkCount || Number(manifest.chunkCount) <= 0) {
      continue
    }

    const row = rowsById.get(manifest.workId)
    if (!row) {
      missingRows.push(manifest.workId)
      continue
    }

    const previousStatus = row.ingest_status
    const previousReview = row.review_status
    let changed = false

    if (row.ingest_status !== 'chunked') {
      row.ingest_status = 'chunked'
      changed = true
    }

    if (row.review_status !== 'downloaded_and_normalized') {
      row.review_status = 'downloaded_and_normalized'
      changed = true
    }

    if (!row.collection_id && manifest.collectionId) {
      row.collection_id = manifest.collectionId
      changed = true
    }

    if (!row.file_format && manifest.rawFile) {
      row.file_format = extname(manifest.rawFile).replace(/^\./, '') || row.file_format
      changed = true
    }

    if (manifest.sourceMode && !row.ocr_mode) {
      row.ocr_mode = manifest.sourceMode
      changed = true
    }

    if (manifest.sourceMode && !row.acquisition_mode) {
      row.acquisition_mode =
        manifest.sourceMode === 'wellcome_pdf_local_ocr' ? 'api_plus_iiif_pdf_ocr' : row.acquisition_mode || 'api_plus_iiif'
      changed = true
    }

    if (changed) {
      updated.push({
        work_id: row.work_id,
        previous_ingest_status: previousStatus || null,
        ingest_status: row.ingest_status,
        previous_review_status: previousReview || null,
        review_status: row.review_status,
      })
    }
  }

  await saveWorksRegistry(registry)

  return {
    scannedManifestCount: manifests.length,
    updatedCount: updated.length,
    missingRegistryRowCount: missingRows.length,
    updated: updated.slice(0, 25),
    missingRegistryRows: missingRows.slice(0, 25),
  }
})

console.log(JSON.stringify(result, null, 2))
