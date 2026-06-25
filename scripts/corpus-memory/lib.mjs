import { createHash } from 'node:crypto'
import { stat } from 'node:fs/promises'
import { mkdir } from 'node:fs/promises'
import { createServer } from 'node:http'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'

const projectRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)))

export const corpusMemoryRootDir = resolve(projectRoot, 'corpus-memory')
export const defaultStoreDir = resolve(corpusMemoryRootDir, 'store')
export const defaultDatabasePath = resolve(defaultStoreDir, 'corpus-memory.sqlite3')

const normalizeWhitespace = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

const parsePort = (value, fallback) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const getCorpusMemoryConfig = (overrides = {}) => {
  const storeDir = resolve(String(overrides.storeDir ?? process.env.CORPUS_MEMORY_STORE_DIR ?? defaultStoreDir))

  return {
    name: String(overrides.name ?? process.env.CORPUS_MEMORY_NAME ?? 'Corpus Memory'),
    host: String(overrides.host ?? process.env.CORPUS_MEMORY_HOST ?? '127.0.0.1'),
    port: parsePort(overrides.port ?? process.env.CORPUS_MEMORY_PORT, 8766),
    storeDir,
    databasePath: String(overrides.databasePath ?? resolve(storeDir, 'corpus-memory.sqlite3')),
  }
}

const jsonString = (value) => JSON.stringify(value ?? {})

const hashText = (value) => createHash('sha256').update(String(value ?? '')).digest('hex')

const tokenizeSearchQuery = (value) =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .match(/[a-z0-9]+/g) ?? []

const buildMatchExpression = (value) => {
  const tokens = [...new Set(tokenizeSearchQuery(value))].filter((token) => token.length > 1)
  if (tokens.length === 0) {
    return ''
  }

  return tokens.map((token) => `"${token.replace(/"/g, '""')}"*`).join(' AND ')
}

const cleanTags = (value) => {
  if (Array.isArray(value)) {
    return [...new Set(value.map((item) => normalizeWhitespace(item)).filter(Boolean))]
  }

  if (typeof value === 'string') {
    return [...new Set(value.split(/[;,]/).map((item) => normalizeWhitespace(item)).filter(Boolean))]
  }

  return []
}

export const normalizeDocument = (input) => {
  const documentId = normalizeWhitespace(input.document_id ?? input.id)
  const title = normalizeWhitespace(input.title ?? input.name ?? documentId)
  const text = normalizeWhitespace(input.text ?? input.retrieval_text ?? input.content)
  const kind = normalizeWhitespace(input.kind ?? input.type ?? 'document') || 'document'
  const metadata = input.metadata ?? input.meta ?? {}
  const tags = cleanTags(input.tags ?? input.topic_families ?? metadata.topic_families ?? [])
  const sourcePath = normalizeWhitespace(input.source_path ?? input.sourcePath ?? '')

  if (!documentId) {
    throw new Error('Document is missing an id/document_id value.')
  }

  if (!text) {
    throw new Error(`Document ${documentId} is missing text content.`)
  }

  return {
    document_id: documentId,
    title,
    text,
    kind,
    metadata,
    metadata_json: jsonString(metadata),
    source_path: sourcePath,
    tags,
    tags_text: tags.join(' '),
    text_sha256: hashText(text),
  }
}

export const openCorpusMemoryDatabase = async (overrides = {}) => {
  const config = getCorpusMemoryConfig(overrides)
  await mkdir(config.storeDir, { recursive: true })

  const db = new DatabaseSync(config.databasePath)
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA temp_store = MEMORY;

    CREATE TABLE IF NOT EXISTS documents (
      document_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      kind TEXT NOT NULL,
      text TEXT NOT NULL,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      source_path TEXT NOT NULL DEFAULT '',
      tags_json TEXT NOT NULL DEFAULT '[]',
      text_sha256 TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
      document_id UNINDEXED,
      title,
      text,
      kind,
      tags,
      tokenize = 'unicode61 remove_diacritics 1'
    );
  `)

  return { db, config }
}

export const closeCorpusMemoryDatabase = (db) => {
  if (db) {
    db.close()
  }
}

export const upsertDocuments = (db, documents) => {
  if (!Array.isArray(documents) || documents.length === 0) {
    return { receivedCount: 0, insertedCount: 0, updatedCount: 0 }
  }

  const existingStatement = db.prepare('SELECT created_at FROM documents WHERE document_id = ?')
  const upsertStatement = db.prepare(`
    INSERT INTO documents (
      document_id,
      title,
      kind,
      text,
      metadata_json,
      source_path,
      tags_json,
      text_sha256,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(document_id) DO UPDATE SET
      title = excluded.title,
      kind = excluded.kind,
      text = excluded.text,
      metadata_json = excluded.metadata_json,
      source_path = excluded.source_path,
      tags_json = excluded.tags_json,
      text_sha256 = excluded.text_sha256,
      updated_at = excluded.updated_at
  `)
  const deleteFtsStatement = db.prepare('DELETE FROM documents_fts WHERE document_id = ?')
  const insertFtsStatement = db.prepare(`
    INSERT INTO documents_fts (document_id, title, text, kind, tags)
    VALUES (?, ?, ?, ?, ?)
  `)

  let insertedCount = 0
  let updatedCount = 0

  db.exec('BEGIN IMMEDIATE')

  try {
    for (const rawDocument of documents) {
      const document = normalizeDocument(rawDocument)
      const now = new Date().toISOString()
      const existing = existingStatement.get(document.document_id)

      upsertStatement.run(
        document.document_id,
        document.title,
        document.kind,
        document.text,
        document.metadata_json,
        document.source_path,
        jsonString(document.tags),
        document.text_sha256,
        existing?.created_at ?? now,
        now,
      )

      deleteFtsStatement.run(document.document_id)
      insertFtsStatement.run(document.document_id, document.title, document.text, document.kind, document.tags_text)

      if (existing) {
        updatedCount += 1
      } else {
        insertedCount += 1
      }
    }

    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }

  return {
    receivedCount: documents.length,
    insertedCount,
    updatedCount,
  }
}

export const pruneDocumentsByKind = (db, kind, keepDocumentIds = []) => {
  const normalizedKind = normalizeWhitespace(kind)
  if (!normalizedKind) {
    throw new Error('pruneDocumentsByKind requires a non-empty kind value.')
  }

  const keepSet = new Set(
    (Array.isArray(keepDocumentIds) ? keepDocumentIds : [])
      .map((documentId) => normalizeWhitespace(documentId))
      .filter(Boolean),
  )
  const listStatement = db.prepare('SELECT document_id FROM documents WHERE kind = ?')
  const deleteDocumentStatement = db.prepare('DELETE FROM documents WHERE document_id = ?')
  const deleteFtsStatement = db.prepare('DELETE FROM documents_fts WHERE document_id = ?')

  let deletedCount = 0

  db.exec('BEGIN IMMEDIATE')

  try {
    for (const row of listStatement.all(normalizedKind)) {
      if (keepSet.has(row.document_id)) {
        continue
      }

      deleteDocumentStatement.run(row.document_id)
      deleteFtsStatement.run(row.document_id)
      deletedCount += 1
    }

    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }

  return {
    kind: normalizedKind,
    deletedCount,
  }
}

export const getDocument = (db, documentId) => {
  const row = db
    .prepare(`
      SELECT
        document_id,
        title,
        kind,
        text,
        metadata_json,
        source_path,
        tags_json,
        text_sha256,
        created_at,
        updated_at
      FROM documents
      WHERE document_id = ?
    `)
    .get(documentId)

  if (!row) {
    return null
  }

  return {
    id: row.document_id,
    title: row.title,
    kind: row.kind,
    text: row.text,
    metadata: JSON.parse(row.metadata_json),
    source_path: row.source_path,
    tags: JSON.parse(row.tags_json),
    text_sha256: row.text_sha256,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export const searchDocuments = (db, filters = {}) => {
  const limit = Math.max(1, Math.min(100, Number(filters.limit ?? 10) || 10))
  const kind = normalizeWhitespace(filters.kind ?? '')
  const query = normalizeWhitespace(filters.q ?? filters.query ?? '')
  const matchExpression = buildMatchExpression(query)

  if (!matchExpression) {
    return {
      query,
      limit,
      total: 0,
      items: [],
    }
  }

  const whereParts = ['documents_fts MATCH ?']
  const parameters = [matchExpression]

  if (kind) {
    whereParts.push('d.kind = ?')
    parameters.push(kind)
  }

  parameters.push(limit)

  const statement = db.prepare(`
    SELECT
      d.document_id,
      d.title,
      d.kind,
      d.metadata_json,
      d.source_path,
      d.updated_at,
      bm25(documents_fts, 8.0, 1.0, 2.0, 0.5, 0.25) AS score,
      snippet(documents_fts, 2, '', '', ' ... ', 18) AS excerpt
    FROM documents_fts
    JOIN documents d ON d.document_id = documents_fts.document_id
    WHERE ${whereParts.join(' AND ')}
    ORDER BY score
    LIMIT ?
  `)

  const rows = statement.all(...parameters)

  return {
    query,
    limit,
    total: rows.length,
    items: rows.map((row) => ({
      id: row.document_id,
      title: row.title,
      kind: row.kind,
      score: row.score,
      excerpt: normalizeWhitespace(row.excerpt),
      metadata: JSON.parse(row.metadata_json),
      source_path: row.source_path,
      updated_at: row.updated_at,
    })),
  }
}

export const getCorpusMemoryStats = async (db, config) => {
  const totalDocuments = db.prepare('SELECT COUNT(*) AS count FROM documents').get().count
  const byKind = db.prepare('SELECT kind, COUNT(*) AS count FROM documents GROUP BY kind ORDER BY count DESC, kind ASC').all()
  let databaseBytes = 0

  try {
    databaseBytes = (await stat(config.databasePath)).size
  } catch {
    databaseBytes = 0
  }

  return {
    name: config.name,
    host: config.host,
    port: config.port,
    databasePath: config.databasePath,
    databaseBytes,
    totalDocuments,
    byKind,
  }
}

const writeJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
  })
  response.end(JSON.stringify(payload, null, 2))
}

const readJsonBody = async (request) => {
  const chunks = []
  for await (const chunk of request) {
    chunks.push(chunk)
  }

  if (chunks.length === 0) {
    return {}
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

export const createCorpusMemoryHttpServer = async (overrides = {}) => {
  const { db, config } = await openCorpusMemoryDatabase(overrides)

  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? '/', `http://${config.host}:${config.port}`)

      if (request.method === 'OPTIONS') {
        writeJson(response, 200, { ok: true })
        return
      }

      if (request.method === 'GET' && url.pathname === '/health') {
        writeJson(response, 200, {
          ok: true,
          service: config.name,
          ...(await getCorpusMemoryStats(db, config)),
        })
        return
      }

      if (request.method === 'GET' && url.pathname === '/stats') {
        writeJson(response, 200, await getCorpusMemoryStats(db, config))
        return
      }

      if (request.method === 'GET' && url.pathname === '/search') {
        writeJson(
          response,
          200,
          searchDocuments(db, {
            q: url.searchParams.get('q') ?? url.searchParams.get('query') ?? '',
            kind: url.searchParams.get('kind') ?? '',
            limit: url.searchParams.get('limit') ?? '',
          }),
        )
        return
      }

      if (request.method === 'GET' && url.pathname.startsWith('/documents/')) {
        const documentId = decodeURIComponent(url.pathname.replace(/^\/documents\//, ''))
        const document = getDocument(db, documentId)
        if (!document) {
          writeJson(response, 404, { ok: false, error: 'Document not found.' })
          return
        }

        writeJson(response, 200, { ok: true, document })
        return
      }

      if (request.method === 'POST' && url.pathname === '/documents') {
        const payload = await readJsonBody(request)
        const rows = Array.isArray(payload.documents)
          ? payload.documents
          : Array.isArray(payload)
            ? payload
            : [payload]
        writeJson(response, 200, {
          ok: true,
          ...upsertDocuments(db, rows),
        })
        return
      }

      writeJson(response, 404, {
        ok: false,
        error: 'Unsupported endpoint.',
        service: config.name,
      })
    } catch (error) {
      writeJson(response, 500, {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  })

  server.on('close', () => closeCorpusMemoryDatabase(db))

  return { server, db, config }
}
