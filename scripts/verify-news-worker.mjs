import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { readLatestFeedRefreshRunFromD1, readNewsItemsFromD1 } from '../functions/_lib/feed.js'
import worker from '../workers/news-refresh.js'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const persistDir = resolve(root, '.wrangler-herbalisti-news-verify')
const relativePersist = relative(root, persistDir)
const config = 'wrangler.news.local.toml'
const token = 'local-feed-refresh-verifier'
const blockedNames = [
  'abbvie',
  'amgen',
  'astrazeneca',
  'bayer',
  'biogen',
  'boehringer',
  'bristol myers',
  'eli lilly',
  'gilead',
  'glaxosmithkline',
  'gsk',
  'johnson & johnson',
  'merck',
  'moderna',
  'novartis',
  'novo nordisk',
  'pfizer',
  'roche',
  'sanofi',
]
const localWranglerCli = resolve(
  root,
  'node_modules',
  'wrangler',
  'bin',
  'wrangler.js',
)
const wranglerCli = existsSync(localWranglerCli)
  ? localWranglerCli
  : process.env.APPDATA
  ? resolve(process.env.APPDATA, 'npm', 'node_modules', 'wrangler', 'bin', 'wrangler.js')
  : process.env.USERPROFILE
  ? resolve(process.env.USERPROFILE, 'AppData', 'Roaming', 'npm', 'node_modules', 'wrangler', 'bin', 'wrangler.js')
  : ''
const localWranglerCmd = resolve(root, 'node_modules', '.bin', 'wrangler.cmd')
const wranglerCmd = existsSync(localWranglerCmd)
  ? localWranglerCmd
  : process.env.APPDATA
  ? resolve(process.env.APPDATA, 'npm', 'wrangler.cmd')
  : process.env.USERPROFILE
  ? resolve(process.env.USERPROFILE, 'AppData', 'Roaming', 'npm', 'wrangler.cmd')
  : ''
const powerShell = process.platform === 'win32'
  ? process.env.ProgramFiles
    ? resolve(process.env.ProgramFiles, 'PowerShell', '7', 'pwsh.exe')
    : 'powershell.exe'
  : ''

if (!wranglerCli) {
  throw new Error('Could not find a local or global Wrangler CLI entrypoint for Worker verification.')
}

if (relativePersist.startsWith('..') || relativePersist === '') {
  throw new Error(`Refusing to reset unexpected Worker verification path: ${persistDir}`)
}

const quoteShellArg = (value) => {
  if (/^[A-Za-z0-9_@%+=:,./\\-]+$/.test(value)) {
    return value
  }

  return `"${value.replace(/"/g, '\\"')}"`
}
const commandString = (args) =>
  process.platform === 'win32'
    ? [wranglerCmd || 'wrangler.cmd', ...args].map(quoteShellArg).join(' ')
    : [process.execPath, wranglerCli, ...args].map(quoteShellArg).join(' ')

const runWrangler = (args) => {
  const command = commandString([...args, '--config', config])
  const result =
    process.platform === 'win32'
      ? spawnSync(
          process.env.ComSpec || 'cmd.exe',
          [
            '/d',
            '/s',
            '/c',
            `${wranglerCmd || 'wrangler.cmd'} ${[...args, '--config', config].map(quoteShellArg).join(' ')}`,
          ],
          {
            cwd: root,
            encoding: 'utf8',
          },
        )
      : spawnSync(process.execPath, [wranglerCli, ...args, '--config', config], {
          cwd: root,
          encoding: 'utf8',
        })

  if (result.error || result.status !== 0) {
    throw new Error(
      [
        `Command failed: ${command}`,
        result.error?.message,
        result.stdout?.trim(),
        result.stderr?.trim(),
      ]
        .filter(Boolean)
        .join('\n'),
    )
  }

  return result.stdout.trim()
}

let queryFileIndex = 0

const readD1Json = (sql) => {
  queryFileIndex += 1
  const queryPath = resolve(persistDir, `query-${queryFileIndex}.sql`)
  const relativeQueryPath = relative(root, queryPath)
  writeFileSync(queryPath, `${sql.trim()}\n`, 'utf8')

  const output = runWrangler([
    'd1',
    'execute',
    'herbalisti',
    '--local',
    '--persist-to',
    relativePersist,
    '--json',
    '--file',
    relativeQueryPath,
  ])
  return JSON.parse(output)
}

const sqlLiteral = (value) => {
  if (value === null || value === undefined) {
    return 'NULL'
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'NULL'
  }
  if (typeof value === 'boolean') {
    return value ? '1' : '0'
  }
  return `'${String(value).replace(/'/g, "''")}'`
}

class WranglerD1Statement {
  constructor(sql) {
    this.sql = sql
    this.bindings = []
  }

  bind(...bindings) {
    this.bindings = bindings
    return this
  }

  toSql() {
    let index = 0
    return this.sql.replace(/\?/g, () => {
      if (index >= this.bindings.length) {
        throw new Error(`Missing binding for SQL: ${this.sql}`)
      }
      const replacement = sqlLiteral(this.bindings[index])
      index += 1
      return replacement
    })
  }

  async all() {
    return readD1Json(this.toSql())[0]
  }
}

class WranglerD1Database {
  prepare(sql) {
    return new WranglerD1Statement(sql)
  }

  async batch(statements) {
    for (const statement of statements) {
      readD1Json(statement.toSql())
    }
    return []
  }
}

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const jsonResponse = (payload) =>
  new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })

const textResponse = (payload) =>
  new Response(payload, {
    status: 200,
    headers: { 'content-type': 'application/xml' },
  })

const fixtureFetch = async (input) => {
  const url = new URL(String(input))

  if (url.hostname === 'eutils.ncbi.nlm.nih.gov' && url.pathname.endsWith('/esearch.fcgi')) {
    return jsonResponse({ esearchresult: { idlist: ['401001'] } })
  }

  if (url.hostname === 'eutils.ncbi.nlm.nih.gov' && url.pathname.endsWith('/esummary.fcgi')) {
    return jsonResponse({
      result: {
        '401001': {
          uid: '401001',
          title: 'Longevity and healthspan signals in epigenetic aging research',
          fulljournalname: 'Independent Biomedical Research Index',
          sortpubdate: '2026/06/14',
        },
      },
    })
  }

  if (url.hostname === 'export.arxiv.org') {
    return textResponse(`<?xml version="1.0" encoding="UTF-8"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <id>https://arxiv.org/abs/2606.00001</id>
          <title>CRISPR gene editing and gene therapy methods for resilient cellular repair</title>
          <published>2026-06-13T00:00:00Z</published>
        </entry>
      </feed>`)
  }

  if (url.hostname === 'api.biorxiv.org') {
    return jsonResponse({
      collection: [
        {
          doi: '10.1101/2026.06.12.000001',
          version: '1',
          title: 'Peptide signaling and longevity pathways in tissue maintenance',
          abstract: 'A preprint on peptides, longevity, and healthspan biology.',
          category: 'Cell Biology',
          date: '2026-06-12',
        },
      ],
    })
  }

  if (url.hostname === 'api.crossref.org') {
    return jsonResponse({
      message: {
        items: [
          {
            DOI: '10.5555/herbalisti-crossref-verify',
            title: ['Personalized health as a service for longevity and peptide research'],
            'container-title': ['Open Metadata Journal'],
            type: 'journal-article',
            URL: 'https://doi.org/10.5555/herbalisti-crossref-verify',
            published: { 'date-parts': [[2026, 6, 11]] },
            abstract:
              '<jats:p>Public Crossref metadata about health as a service, longevity, and peptide discovery.</jats:p>',
          },
        ],
      },
    })
  }

  if (url.hostname === 'www.lifespan.io') {
    return textResponse(`<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <item>
            <title>Longevity research expands self-sovereign wellbeing tools</title>
            <link>https://www.lifespan.io/news/local-verifier-longevity/</link>
            <pubDate>Thu, 11 Jun 2026 00:00:00 GMT</pubDate>
            <description>Independent longevity coverage for health as a service, healthspan, and self-sovereign wellbeing.</description>
          </item>
        </channel>
      </rss>`)
  }

  if (url.hostname === 'www.fightaging.org') {
    return textResponse(`<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <item>
            <title>DNA modification and epigenetic repair in rejuvenation research</title>
            <link>https://www.fightaging.org/archives/2026/06/local-verifier-dna/</link>
            <pubDate>Wed, 10 Jun 2026 00:00:00 GMT</pubDate>
            <description>Independent commentary on DNA modification, methylation, and aging repair.</description>
          </item>
        </channel>
      </rss>`)
  }

  throw new Error(`Unexpected fixture fetch URL: ${url.href}`)
}

rmSync(persistDir, { recursive: true, force: true })
mkdirSync(persistDir, { recursive: true })

runWrangler([
  'd1',
  'migrations',
  'apply',
  'herbalisti',
  '--local',
  '--persist-to',
  relativePersist,
])

const originalFetch = globalThis.fetch
globalThis.fetch = fixtureFetch

try {
  const env = {
    HERBALISTI_DB: new WranglerD1Database(),
    FEED_ADMIN_TOKEN: token,
  }

  const unauthorized = await worker.fetch(new Request('https://herbalisti.local/'), env)
  assert(unauthorized.status === 401, `Expected unauthorized refresh to return 401, got ${unauthorized.status}`)

  const wrongToken = await worker.fetch(
    new Request('https://herbalisti.local/', {
      headers: { 'x-herbalisti-feed-token': `${token}-wrong` },
    }),
    env,
  )
  assert(wrongToken.status === 401, `Expected wrong-token refresh to return 401, got ${wrongToken.status}`)

  const authorized = await worker.fetch(
    new Request('https://herbalisti.local/', {
      headers: { authorization: `Bearer ${token}` },
    }),
    env,
  )
  const payload = await authorized.json()
  assert(authorized.ok, `Authorized refresh failed: ${JSON.stringify(payload)}`)
  assert(payload.itemCount >= 5, `Expected at least 5 fixture feed items, got ${payload.itemCount}`)
  assert(payload.persisted === payload.itemCount, 'Manual refresh should persist every fixture feed item')
  assert(payload.refreshRun?.triggerType === 'manual', 'Manual refresh should return a manual refresh ledger row')
  assert(
    payload.refreshRun?.itemCount === payload.itemCount && payload.refreshRun?.persistedCount === payload.persisted,
    'Manual refresh ledger counts should match the persisted feed result',
  )

  const headerAuthorized = await worker.fetch(
    new Request('https://herbalisti.local/', {
      headers: { 'x-herbalisti-feed-token': token },
    }),
    env,
  )
  const headerPayload = await headerAuthorized.json()
  assert(headerAuthorized.ok, `Header-token refresh failed: ${JSON.stringify(headerPayload)}`)
  assert(
    headerPayload.itemCount === payload.itemCount && headerPayload.persisted === payload.persisted,
    'Header-token refresh should match bearer-token refresh counts',
  )

  const scheduledPromises = []
  await worker.scheduled({}, env, {
    waitUntil(promise) {
      scheduledPromises.push(promise)
    },
  })
  assert(scheduledPromises.length === 1, 'Scheduled handler should register exactly one background refresh')
  await Promise.all(scheduledPromises)

  const refreshRows =
    readD1Json(
      `SELECT trigger_type, status, item_count, persisted_count, warning_count
       FROM feed_refresh_runs
       ORDER BY created_at ASC;`,
    )[0]?.results ?? []
  const refreshTriggers = refreshRows.map((row) => row.trigger_type)
  assert(refreshTriggers.includes('manual'), 'Refresh ledger should include the protected manual refresh')
  assert(refreshTriggers.includes('scheduled'), 'Refresh ledger should include the scheduled refresh')
  assert(
    refreshRows.every((row) => row.status === 'completed' && row.item_count >= 5 && row.persisted_count === row.item_count),
    'Refresh ledger rows should store successful item and persistence counts',
  )

  const latestRefreshRun = await readLatestFeedRefreshRunFromD1(env.HERBALISTI_DB)
  assert(latestRefreshRun?.itemCount >= 5, 'Latest refresh run should be readable through the shared D1 helper')

  const newsRows =
    readD1Json(
      `SELECT id, title, source_name, source_type, url, topics_json
       FROM news_items
       ORDER BY published_at DESC;`,
    )[0]?.results ?? []

  assert(newsRows.length >= payload.itemCount, 'D1 should contain persisted Worker feed rows')
  assert(newsRows.every((item) => item.title && item.source_name && item.url), 'Persisted news rows are missing required fields')
  assert(
    newsRows.every((item) => JSON.parse(item.topics_json || '[]').length > 0),
    'Persisted news rows should have at least one topic',
  )
  assert(
    newsRows.every((item) => !blockedNames.some((blocked) => `${item.title} ${item.source_name}`.toLowerCase().includes(blocked))),
    'Persisted news rows should not include blocked Big Pharma source names',
  )

  const sourceNames = [...new Set(newsRows.map((item) => item.source_name))]
  assert(sourceNames.includes('Crossref'), 'Persisted fixture sources should include Crossref')
  const topicNames = [
    ...new Set(newsRows.flatMap((item) => JSON.parse(item.topics_json || '[]'))),
  ].sort()
  const expectedTopics = [
    'CRISPR',
    'DNA modification',
    'Gene editing',
    'Gene therapy',
    'Health as a service',
    'Longevity',
    'Peptides',
    'Self-sovereign wellbeing',
  ]
  for (const topic of expectedTopics) {
    assert(topicNames.includes(topic), `Expected persisted fixture topics to include ${topic}`)
  }

  const dnaLimitedRows = await readNewsItemsFromD1(env.HERBALISTI_DB, 1, { topic: 'DNA modification' })
  assert(
    dnaLimitedRows.length === 1 && dnaLimitedRows[0].topics.includes('DNA modification'),
    'D1 topic filtering should happen before LIMIT so older matching rows are still findable',
  )

  const selfSovereignRows = await readNewsItemsFromD1(env.HERBALISTI_DB, 1, {
    query: 'self-sovereign wellbeing',
  })
  assert(
    selfSovereignRows.length === 1 &&
      (selfSovereignRows[0].title.includes('self-sovereign wellbeing') ||
        selfSovereignRows[0].topics.includes('Self-sovereign wellbeing')),
    'D1 query filtering should search persisted titles and topics before LIMIT',
  )

  const crossrefRows = await readNewsItemsFromD1(env.HERBALISTI_DB, 2, { source: 'Crossref' })
  assert(
    crossrefRows.length === 1 && crossrefRows.every((item) => item.sourceName === 'Crossref'),
    'D1 source filtering should return only the selected source before LIMIT',
  )

  const crossrefHealthRows = await readNewsItemsFromD1(env.HERBALISTI_DB, 1, {
    source: 'Crossref',
    topic: 'Health as a service',
  })
  assert(
    crossrefHealthRows.length === 1 &&
      crossrefHealthRows[0].sourceName === 'Crossref' &&
      crossrefHealthRows[0].topics.includes('Health as a service'),
    'D1 combined source and topic filtering should apply both filters before LIMIT',
  )

  console.log(
    JSON.stringify(
      {
        manualRefresh: {
          itemCount: payload.itemCount,
          persisted: payload.persisted,
          warnings: payload.warnings?.length ?? 0,
        },
        scheduledRefresh: {
          waitUntilTasks: scheduledPromises.length,
          ledgerRows: refreshRows.length,
          triggers: refreshTriggers,
          latestTrigger: latestRefreshRun.triggerType,
        },
        d1: {
          persistedRowsChecked: newsRows.length,
          sourceNames,
          topicNames,
          filteredBeforeLimit: {
            dnaTopicRows: dnaLimitedRows.length,
            selfSovereignQueryRows: selfSovereignRows.length,
            crossrefSourceRows: crossrefRows.length,
            crossrefHealthRows: crossrefHealthRows.length,
          },
        },
      },
      null,
      2,
    ),
  )
} finally {
  globalThis.fetch = originalFetch
}
