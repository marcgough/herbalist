import assert from 'node:assert/strict'
import { createServer } from 'node:net'
import { readFileSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  closeCorpusMemoryDatabase,
  createCorpusMemoryHttpServer,
  getCorpusMemoryConfig,
  getCorpusMemoryStats,
  getDocument,
  openCorpusMemoryDatabase,
  searchDocuments,
} from './corpus-memory/lib.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const args = new Set(process.argv.slice(2))
const requireLive = args.has('--require-live')

const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))

const normalizePath = (value) => resolve(String(value ?? '')).toLowerCase()

const kindCount = (stats, kind) => Number(stats.byKind.find((item) => item.kind === kind)?.count ?? 0)

const getOpenPort = async () =>
  new Promise((resolvePort, rejectPort) => {
    const server = createServer()
    server.on('error', rejectPort)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      server.close(() => {
        if (address && typeof address === 'object') {
          resolvePort(address.port)
        } else {
          rejectPort(new Error('Could not reserve an open local port.'))
        }
      })
    })
  })

const fetchJson = async (url, timeoutMs = 3000) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: controller.signal,
    })
    const text = await response.text()
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 300)}`)
    }
    return JSON.parse(text)
  } finally {
    clearTimeout(timeout)
  }
}

const stopServer = async (server) =>
  new Promise((resolveStop, rejectStop) => {
    server.close((error) => {
      if (error) {
        rejectStop(error)
      } else {
        resolveStop()
      }
    })
  })

const config = getCorpusMemoryConfig()
const state = readJson('corpus-memory/state.json')
const { db } = await openCorpusMemoryDatabase()

let stats
let gingerSearch
let gingerDocument

try {
  stats = await getCorpusMemoryStats(db, config)
  gingerSearch = searchDocuments(db, { query: 'ginger', kind: 'herb-profile', limit: 3 })
  gingerDocument = getDocument(db, 'herb-profile-ginger')
} finally {
  closeCorpusMemoryDatabase(db)
}

const databaseStat = await stat(config.databasePath)
const stateKindCounts = Object.fromEntries((state.totals?.byKind ?? []).map((item) => [item.kind, Number(item.count)]))

assert.equal(config.name, 'Corpus Memory', 'Corpus Memory service name should stay separate from Agent Memory.')
assert.equal(config.host, '127.0.0.1', 'Corpus Memory should bind to loopback by default.')
assert.equal(config.port, 8766, 'Corpus Memory should keep the dedicated default port.')
assert(
  normalizePath(config.databasePath).includes(normalizePath('corpus-memory/store/corpus-memory.sqlite3')),
  'Corpus Memory database should live under corpus-memory/store.',
)
assert.equal(stats.databaseBytes, databaseStat.size, 'Corpus Memory stats should match the SQLite file size.')
assert(stats.databaseBytes > 60_000_000, 'Corpus Memory database should contain the populated semantic store.')
assert(stats.totalDocuments >= 3300, 'Corpus Memory should contain the corpus-scale semantic document set.')
assert(kindCount(stats, 'edition-family') >= 1800, 'Corpus Memory should include edition-family records.')
assert(kindCount(stats, 'work-summary') >= 1300, 'Corpus Memory should include work-summary records.')
assert(kindCount(stats, 'herb-profile') >= 120, 'Corpus Memory should include herb-profile records.')

assert.equal(state.serviceName, 'Corpus Memory', 'Corpus Memory state should preserve the service boundary name.')
assert.equal(state.baseUrl, 'http://127.0.0.1:8766', 'Corpus Memory state should preserve the dedicated local base URL.')
assert.equal(
  normalizePath(state.databasePath),
  normalizePath(config.databasePath),
  'Corpus Memory state should point to the active local SQLite store.',
)
assert.equal(state.databaseBytes, stats.databaseBytes, 'Corpus Memory state should match the active SQLite size.')
assert.equal(state.totals?.totalDocuments, stats.totalDocuments, 'Corpus Memory state should match document totals.')
assert.equal(stateKindCounts['edition-family'], kindCount(stats, 'edition-family'), 'Edition-family state count is stale.')
assert.equal(stateKindCounts['work-summary'], kindCount(stats, 'work-summary'), 'Work-summary state count is stale.')
assert.equal(stateKindCounts['herb-profile'], kindCount(stats, 'herb-profile'), 'Herb-profile state count is stale.')
assert(
  state.boundary?.excludes?.includes('shared working-memory notes'),
  'Corpus Memory state should explicitly exclude shared working-memory notes.',
)

assert(gingerSearch.items.some((item) => item.id === 'herb-profile-ginger'), 'Corpus Memory should retrieve ginger.')
assert(gingerDocument?.title === 'Ginger', 'Corpus Memory should expose the ginger herb profile document.')
assert(
  Array.isArray(gingerDocument.metadata?.supporting_work_ids) && gingerDocument.metadata.supporting_work_ids.length >= 4,
  'Corpus Memory ginger profile should link supporting work summaries.',
)
assert(
  String(gingerDocument.text ?? '').includes('source-linked chunks'),
  'Corpus Memory herb profile text should preserve source-linked corpus scale metadata.',
)

let configuredService = {
  status: 'offline',
  baseUrl: `http://${config.host}:${config.port}`,
}

try {
  const health = await fetchJson(`${configuredService.baseUrl}/health`, 1200)
  configuredService = {
    status: 'online',
    baseUrl: configuredService.baseUrl,
    totalDocuments: health.totalDocuments,
    databaseBytes: health.databaseBytes,
  }
  assert.equal(health.service, 'Corpus Memory', 'Live Corpus Memory health should return the service name.')
  assert.equal(health.totalDocuments, stats.totalDocuments, 'Live Corpus Memory health should match local document totals.')
} catch (error) {
  configuredService = {
    ...configuredService,
    error: error instanceof Error ? error.message : String(error),
  }
  if (requireLive) {
    throw new Error(`Corpus Memory service is not live at ${configuredService.baseUrl}: ${configuredService.error}`)
  }
}

const temporaryPort = await getOpenPort()
const temporaryBaseUrl = `http://${config.host}:${temporaryPort}`
const { server: temporaryServer } = await createCorpusMemoryHttpServer({
  host: config.host,
  port: temporaryPort,
  storeDir: config.storeDir,
})

await new Promise((resolveListen) => temporaryServer.listen(temporaryPort, config.host, resolveListen))

let temporaryProbe

try {
  const [health, search, document] = await Promise.all([
    fetchJson(`${temporaryBaseUrl}/health`),
    fetchJson(`${temporaryBaseUrl}/search?q=ginger&kind=herb-profile&limit=2`),
    fetchJson(`${temporaryBaseUrl}/documents/herb-profile-ginger`),
  ])

  assert.equal(health.service, 'Corpus Memory', 'Temporary Corpus Memory server should report the service name.')
  assert.equal(health.totalDocuments, stats.totalDocuments, 'Temporary Corpus Memory server should use the active store.')
  assert(
    search.items?.some((item) => item.id === 'herb-profile-ginger'),
    'Temporary Corpus Memory server should retrieve ginger over HTTP.',
  )
  assert.equal(document.document?.title, 'Ginger', 'Temporary Corpus Memory server should return the ginger document.')

  temporaryProbe = {
    status: 'pass',
    baseUrl: temporaryBaseUrl,
    healthDocuments: health.totalDocuments,
    searchMatches: search.total,
    documentTitle: document.document.title,
  }
} finally {
  await stopServer(temporaryServer)
}

console.log(
  JSON.stringify(
    {
      status: 'pass',
      service: config.name,
      databasePath: config.databasePath,
      databaseBytes: stats.databaseBytes,
      totalDocuments: stats.totalDocuments,
      byKind: stats.byKind,
      queryProbe: {
        query: 'ginger',
        kind: 'herb-profile',
        matches: gingerSearch.total,
        leadDocument: gingerSearch.items[0]?.id ?? null,
        supportingWorks: gingerDocument.metadata.supporting_work_ids.length,
      },
      configuredService,
      temporaryServiceProbe: temporaryProbe,
      requireLive,
      safeToRun:
        'Reads the local Corpus Memory SQLite store, starts a temporary loopback HTTP server for lifecycle probing, and optionally checks the configured local service. It does not call external APIs, deploy, mutate DNS, create resources, call paid APIs, or print secret values.',
    },
    null,
    2,
  ),
)
