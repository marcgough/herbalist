import { existsSync, rmSync, mkdirSync, writeFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const persistDir = resolve(root, '.wrangler-herbalisti-verify')
const relativePersist = relative(root, persistDir)

if (relativePersist.startsWith('..') || relativePersist === '') {
  throw new Error(`Refusing to reset unexpected D1 verification path: ${persistDir}`)
}

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
  throw new Error('Could not find a local or global Wrangler CLI entrypoint for D1 verification.')
}

const quoteShellArg = (value) => {
  if (/^[A-Za-z0-9_@%+=:,./\\-]+$/.test(value)) {
    return value
  }

  return `"${value.replace(/"/g, '\\"')}"`
}
const run = (args, options = {}) => {
  const command =
    process.platform === 'win32'
      ? [wranglerCmd || 'wrangler.cmd', ...args].map(quoteShellArg).join(' ')
      : [process.execPath, wranglerCli, ...args].map(quoteShellArg).join(' ')
  const result =
    process.platform === 'win32'
      ? spawnSync(
          process.env.ComSpec || 'cmd.exe',
          [
            '/d',
            '/s',
            '/c',
            `${wranglerCmd || 'wrangler.cmd'} ${args.map(quoteShellArg).join(' ')}`,
          ],
          {
            cwd: root,
            input: options.input,
            encoding: 'utf8',
          },
        )
      : spawnSync(process.execPath, [wranglerCli, ...args], {
          cwd: root,
          input: options.input,
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

const wrangler = (...args) => run([...args, '--config', 'wrangler.local.toml'])

const readJson = (sql) => {
  queryFileIndex += 1
  const queryPath = resolve(persistDir, `query-${queryFileIndex}.sql`)
  const relativeQueryPath = relative(root, queryPath)
  writeFileSync(queryPath, `${sql.trim()}\n`, 'utf8')

  const output = wrangler(
    'd1',
    'execute',
    'herbalisti',
    '--local',
    '--persist-to',
    relativePersist,
    '--json',
    '--file',
    relativeQueryPath,
  )
  return JSON.parse(output)
}

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

rmSync(persistDir, { recursive: true, force: true })
mkdirSync(persistDir, { recursive: true })

let queryFileIndex = 0

wrangler(
  'd1',
  'migrations',
  'apply',
  'herbalisti',
  '--local',
  '--persist-to',
  relativePersist,
)

const columns = readJson('PRAGMA table_info(reference_books);')[0]?.results ?? []
const columnNames = new Set(columns.map((column) => column.name))

for (const column of [
  'subtitle',
  'publisher',
  'published_date',
  'isbn_13',
  'pages',
  'external_url',
  'verification_source',
  'citation_note',
]) {
  assert(columnNames.has(column), `reference_books is missing ${column}`)
}

const feedSourceColumns = readJson('PRAGMA table_info(feed_sources);')[0]?.results ?? []
const feedSourceColumnNames = new Set(feedSourceColumns.map((column) => column.name))
for (const column of [
  'feed_name',
  'independence_status',
  'ownership_review',
  'review_evidence_url',
  'review_cadence',
  'last_reviewed',
  'review_note',
]) {
  assert(feedSourceColumnNames.has(column), `feed_sources is missing ${column}`)
}

const referenceCount = readJson('SELECT COUNT(*) AS count FROM reference_books;')[0]?.results?.[0]?.count
assert(referenceCount === 4, `Expected 4 reference_books records, found ${referenceCount}`)

const holistic = readJson(
  "SELECT authors_json, source_status, isbn_13, publisher, pages FROM reference_books WHERE id = 'complete-illustrated-holistic-herbal';",
)[0]?.results?.[0]
assert(holistic, 'Missing corrected holistic herbal record')
assert(holistic.authors_json === '["David Hoffmann"]', 'Holistic herbal author correction was not applied')
assert(
  holistic.source_status === 'bibliography_author_mismatch_corrected',
  'Holistic herbal source status should preserve the author mismatch audit',
)
assert(holistic.isbn_13 === '9781852308476', 'Holistic herbal ISBN metadata was not applied')
assert(holistic.publisher === 'Element Books', 'Holistic herbal publisher metadata was not applied')
assert(holistic.pages === 256, 'Holistic herbal page count was not applied')

const maker = readJson(
  "SELECT publisher, isbn_13 FROM reference_books WHERE id = 'herbal-medicine-makers-handbook-green';",
)[0]?.results?.[0]
assert(maker.publisher === 'Crossing Press', 'Medicine-maker handbook publisher metadata was not applied')
assert(maker.isbn_13 === '9780895949905', 'Medicine-maker handbook ISBN metadata was not applied')

const feedSourceCount = readJson('SELECT COUNT(*) AS count FROM feed_sources;')[0]?.results?.[0]?.count
assert(feedSourceCount >= 6, `Expected at least 6 feed sources, found ${feedSourceCount}`)
const blockedFeedSourceCount = readJson(
  'SELECT COUNT(*) AS count FROM feed_sources WHERE is_allowlisted != 1 OR is_big_pharma_related != 0;',
)[0]?.results?.[0]?.count
assert(blockedFeedSourceCount === 0, 'Feed sources should be allowlisted and non-Big-Pharma by default')
const missingFeedNameCount = readJson(
  "SELECT COUNT(*) AS count FROM feed_sources WHERE feed_name = '';",
)[0]?.results?.[0]?.count
assert(missingFeedNameCount === 0, 'Feed sources should define the public feed source name')
const pubmedFeedName = readJson("SELECT feed_name FROM feed_sources WHERE id = 'pubmed';")[0]?.results?.[0]?.feed_name
assert(pubmedFeedName === 'PubMed / NCBI', 'PubMed registry source should map to the feed source name')
const missingSourceReviewCount = readJson(
  "SELECT COUNT(*) AS count FROM feed_sources WHERE independence_status = '' OR ownership_review = '' OR review_evidence_url = '' OR last_reviewed = '' OR review_note = '';",
)[0]?.results?.[0]?.count
assert(missingSourceReviewCount === 0, 'Feed sources should include independence review metadata')
const fightAgingReview = readJson(
  "SELECT independence_status, review_note FROM feed_sources WHERE id = 'fightaging';",
)[0]?.results?.[0]
assert(
  fightAgingReview?.independence_status === 'independent-longevity-commentary-disclosed-conflict',
  'Fight Aging should carry the disclosed-conflict source status',
)
assert(
  fightAgingReview.review_note.includes('commentary with disclosed conflict context'),
  'Fight Aging review note should describe its commentary/disclosed-conflict role',
)

readJson(
  `INSERT OR REPLACE INTO news_items
   (id, title, source_name, source_type, url, published_at, summary, topics_json, source_hash)
   VALUES
   ('verify-news', 'Longevity signal verification', 'Herbalisti verifier', 'local-test', 'https://herbalisti.com/verify', '2026-06-16T00:00:00.000Z', 'Local D1 verification item.', '["Longevity"]', 'verify-news-hash');`,
)

const insertedNews = readJson("SELECT topics_json FROM news_items WHERE id = 'verify-news';")[0]?.results?.[0]
assert(insertedNews?.topics_json === '["Longevity"]', 'news_items insert/query verification failed')

const mediaColumns = readJson('PRAGMA table_info(media_jobs);')[0]?.results ?? []
const mediaColumnNames = new Set(mediaColumns.map((column) => column.name))
assert(mediaColumnNames.has('provider_task_id'), 'media_jobs is missing provider_task_id')
assert(mediaColumnNames.has('result_url'), 'media_jobs is missing result_url')

const refreshColumns = readJson('PRAGMA table_info(feed_refresh_runs);')[0]?.results ?? []
const refreshColumnNames = new Set(refreshColumns.map((column) => column.name))
for (const column of [
  'trigger_type',
  'status',
  'started_at',
  'finished_at',
  'item_count',
  'persisted_count',
  'warning_count',
  'warnings_json',
  'source_policy',
]) {
  assert(refreshColumnNames.has(column), `feed_refresh_runs is missing ${column}`)
}

readJson(
  `INSERT OR REPLACE INTO feed_refresh_runs
   (id, trigger_type, status, started_at, finished_at, item_count, persisted_count, warning_count, warnings_json, source_policy)
   VALUES
   ('verify-refresh', 'local-verifier', 'completed', '2026-06-16T00:00:00.000Z', '2026-06-16T00:00:01.000Z', 3, 3, 0, '[]', 'Verifier source policy');`,
)

const refreshRun = readJson(
  "SELECT trigger_type, status, item_count, persisted_count, warning_count FROM feed_refresh_runs WHERE id = 'verify-refresh';",
)[0]?.results?.[0]
assert(refreshRun?.trigger_type === 'local-verifier', 'feed_refresh_runs insert/query verification failed')
assert(refreshRun.item_count === 3 && refreshRun.persisted_count === 3, 'feed_refresh_runs counts were not stored correctly')

const remedyColumns = readJson('PRAGMA table_info(remedies);')[0]?.results ?? []
const remedyColumnNames = new Set(remedyColumns.map((column) => column.name))
for (const column of [
  'botanical_name',
  'common_names_json',
  'plant_parts_json',
  'traditional_uses_json',
  'preparations_json',
  'safety_summary',
  'interaction_flags_json',
  'related_json',
  'tags_json',
  'source_url',
  'source_status',
]) {
  assert(remedyColumnNames.has(column), `remedies is missing ${column}`)
}

const remedyCount = readJson('SELECT COUNT(*) AS count FROM remedies;')[0]?.results?.[0]?.count
assert(remedyCount >= 20, `Expected at least 20 core remedy records, found ${remedyCount}`)
const unsafeRemedySourceCount = readJson(
  "SELECT COUNT(*) AS count FROM remedies WHERE source_url NOT LIKE 'https://www.nccih.nih.gov/health/%' OR safety_summary = '';",
)[0]?.results?.[0]?.count
assert(unsafeRemedySourceCount === 0, 'Remedies should have NCCIH source URLs and safety summaries')
const gingerRecord = readJson(
  "SELECT botanical_name, plant_parts_json, preparations_json FROM remedies WHERE id = 'ginger';",
)[0]?.results?.[0]
assert(gingerRecord?.botanical_name === 'Zingiber officinale', 'Ginger remedy botanical metadata is missing')
assert(gingerRecord?.plant_parts_json?.includes('Rhizome'), 'Ginger remedy should include rhizome plant-part context')
assert(gingerRecord?.preparations_json?.includes('Tea'), 'Ginger remedy should include tea preparation context')

const citationColumns = readJson('PRAGMA table_info(citation_notes);')[0]?.results ?? []
const citationColumnNames = new Set(citationColumns.map((column) => column.name))
for (const column of [
  'source_type',
  'linked_record_id',
  'linked_record_label',
  'source_name',
  'source_url',
  'tags_json',
  'review_status',
  'last_reviewed',
]) {
  assert(citationColumnNames.has(column), `citation_notes is missing ${column}`)
}

const citationCount = readJson('SELECT COUNT(*) AS count FROM citation_notes;')[0]?.results?.[0]?.count
assert(citationCount >= 10, `Expected at least 10 citation notes, found ${citationCount}`)
const citationSourceTypeCount = readJson(
  'SELECT COUNT(DISTINCT source_type) AS count FROM citation_notes;',
)[0]?.results?.[0]?.count
assert(citationSourceTypeCount >= 4, 'citation_notes should cover reference, remedy, signal, and governance types')
const unsafeCitationSourceCount = readJson(
  "SELECT COUNT(*) AS count FROM citation_notes WHERE source_url NOT LIKE 'https://%' OR note = '' OR tags_json = '[]';",
)[0]?.results?.[0]?.count
assert(unsafeCitationSourceCount === 0, 'Citation notes should have HTTPS source URLs, notes, and tags')
const gingerCitation = readJson(
  "SELECT source_type, linked_record_id, source_url FROM citation_notes WHERE id = 'ginger-nccih-source';",
)[0]?.results?.[0]
assert(gingerCitation?.source_type === 'remedy', 'Ginger citation note should be a remedy note')
assert(gingerCitation?.linked_record_id === 'ginger', 'Ginger citation note should link to the ginger remedy')
assert(
  gingerCitation?.source_url === 'https://www.nccih.nih.gov/health/ginger',
  'Ginger citation note should preserve the NCCIH source URL',
)

console.log(
  JSON.stringify(
    {
      persistDir: relativePersist,
      referenceBooks: referenceCount,
      feedSources: feedSourceCount,
      correctedBibliography: {
        id: 'complete-illustrated-holistic-herbal',
        authors: JSON.parse(holistic.authors_json),
        sourceStatus: holistic.source_status,
        isbn13: holistic.isbn_13,
        publisher: holistic.publisher,
        pages: holistic.pages,
      },
      remedies: remedyCount,
      citationNotes: citationCount,
      verifiedTables: [
        'reference_books',
        'feed_sources',
        'news_items',
        'media_jobs',
        'feed_refresh_runs',
        'remedies',
        'citation_notes',
      ],
      sourceGovernance: {
        reviewedSources: feedSourceCount,
        fightAgingStatus: fightAgingReview.independence_status,
      },
    },
    null,
    2,
  ),
)
