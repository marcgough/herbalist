import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { closeCorpusMemoryDatabase, getCorpusMemoryStats, openCorpusMemoryDatabase } from './lib.mjs'

const projectRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const outputPath = resolve(projectRoot, 'corpus-memory', 'state.json')

const { db, config } = await openCorpusMemoryDatabase()

try {
  const stats = await getCorpusMemoryStats(db, config)
  const payload = {
    generatedAt: new Date().toISOString(),
    serviceName: stats.name,
    baseUrl: `http://${stats.host}:${stats.port}`,
    databasePath: stats.databasePath,
    databaseBytes: stats.databaseBytes,
    boundary: {
      dedicatedTo: 'Herbalisti corpus retrieval only',
      excludes: ['shared working-memory notes', 'operator checkpoints', 'general Agent Memory documents'],
    },
    totals: {
      totalDocuments: stats.totalDocuments,
      byKind: stats.byKind,
    },
  }

  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')

  console.log(
    JSON.stringify(
      {
        ok: true,
        outputPath,
        serviceName: payload.serviceName,
        baseUrl: payload.baseUrl,
        totalDocuments: payload.totals.totalDocuments,
      },
      null,
      2,
    ),
  )
} finally {
  closeCorpusMemoryDatabase(db)
}
