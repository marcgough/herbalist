import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { closeCorpusMemoryDatabase, getCorpusMemoryStats, openCorpusMemoryDatabase } from './lib.mjs'

const scriptDir = resolve(fileURLToPath(new URL('.', import.meta.url)))

const parseJsonFromStdout = (stdout) => {
  const startIndex = String(stdout ?? '').indexOf('{')
  if (startIndex < 0) {
    return null
  }

  return JSON.parse(String(stdout).slice(startIndex))
}

const runNodeScript = async (scriptName) =>
  new Promise((resolveRun, rejectRun) => {
    const child = spawn(process.execPath, [resolve(scriptDir, scriptName)], {
      cwd: resolve(scriptDir, '..', '..'),
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    child.on('error', rejectRun)
    child.on('close', (code) => {
      if (code !== 0) {
        rejectRun(new Error(stderr.trim() || stdout.trim() || `${scriptName} failed with exit code ${code}`))
        return
      }

      resolveRun({
        stdout,
        stderr,
        payload: parseJsonFromStdout(stdout),
      })
    })
  })

const ingestResult = await runNodeScript('ingest-herbalisti-corpus.mjs')
const stateResult = await runNodeScript('write-state.mjs')
const { db } = await openCorpusMemoryDatabase()

try {
  const stats = await getCorpusMemoryStats(db, {
    host: stateResult.payload?.baseUrl ? new URL(stateResult.payload.baseUrl).hostname : '127.0.0.1',
    port: stateResult.payload?.baseUrl ? Number(new URL(stateResult.payload.baseUrl).port || 8766) : 8766,
    name: stateResult.payload?.serviceName ?? 'Corpus Memory',
    databasePath: stateResult.payload?.outputPath
      ? resolve(scriptDir, '..', '..', 'corpus-memory', 'store', 'corpus-memory.sqlite3')
      : resolve(scriptDir, '..', '..', 'corpus-memory', 'store', 'corpus-memory.sqlite3'),
  })

  console.log(
    JSON.stringify(
      {
        ok: true,
        steps: {
          ingest: ingestResult.payload,
          state: stateResult.payload,
        },
        totals: {
          totalDocuments: stats.totalDocuments,
          byKind: stats.byKind,
          databaseBytes: stats.databaseBytes,
        },
      },
      null,
      2,
    ),
  )
} finally {
  closeCorpusMemoryDatabase(db)
}
