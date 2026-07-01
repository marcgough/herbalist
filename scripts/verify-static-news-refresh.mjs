import { readFileSync } from 'node:fs'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  preservedSnapshotWarning,
  writeStaticNewsRefresh,
} from './lib/static-news-refresh.mjs'

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'))
const read = (path) => readFileSync(resolve(root, path), 'utf8')

const sourcePolicy =
  'Herbalisti allowlist: public research APIs and independent longevity sources; Big Pharma names and off-topic metadata drift filtered before publication.'

const goodFeed = {
  generatedAt: '2026-06-24T00:00:00.000Z',
  sourcePolicy,
  sourceHealthPolicy:
    'Source health checks report allowlisted public or independent sources only; warnings do not add fallback pharma channels.',
  warnings: [],
  sourceHealth: [],
  items: [
    {
      id: 'last-good-longevity',
      title: 'Last good longevity signal',
      sourceName: 'Lifespan.io',
      sourceType: 'independent-longevity',
      url: 'https://www.lifespan.io/news/last-good-longevity/',
      publishedAt: '2026-06-23T00:00:00.000Z',
      summary: 'Independent longevity coverage from the previous successful refresh.',
      topics: ['Longevity'],
    },
    {
      id: 'last-good-crispr',
      title: 'Last good CRISPR signal',
      sourceName: 'Crossref',
      sourceType: 'public-research-index',
      url: 'https://doi.org/10.5555/last-good-crispr',
      publishedAt: '2026-06-22T00:00:00.000Z',
      summary: 'Public metadata from the previous successful refresh.',
      topics: ['CRISPR', 'Gene editing'],
    },
  ],
}

const emptyFailureFeed = {
  generatedAt: '2026-06-24T01:00:00.000Z',
  sourcePolicy,
  sourceHealthPolicy: goodFeed.sourceHealthPolicy,
  warnings: [
    'Skipped PubMed / NCBI: fetch failed',
    'Skipped arXiv: fetch failed',
    'Skipped bioRxiv: fetch failed',
    'Skipped Crossref: fetch failed',
    'Skipped Lifespan.io: fetch failed',
    'Skipped Fight Aging!: fetch failed',
  ],
  sourceHealth: [],
  items: [],
}

const freshGoodFeed = {
  ...goodFeed,
  generatedAt: '2026-06-24T02:00:00.000Z',
  items: [
    {
      id: 'fresh-health-service',
      title: 'Fresh personalized health as a service signal',
      sourceName: 'Crossref',
      sourceType: 'public-research-index',
      url: 'https://doi.org/10.5555/fresh-health-service',
      publishedAt: '2026-06-24T00:00:00.000Z',
      summary: 'Public metadata for personalized health and digital health services.',
      topics: ['Health as a service'],
    },
  ],
}

const partialFailureFeed = {
  ...goodFeed,
  generatedAt: '2026-06-24T03:00:00.000Z',
  warnings: ['Skipped Crossref: 500 Server Error'],
  sourceHealth: [
    {
      id: 'crossref',
      name: 'Crossref',
      status: 'warning',
    },
  ],
  items: [
    {
      id: 'fresh-longevity',
      title: 'Fresh independent longevity signal',
      sourceName: 'Lifespan.io',
      sourceType: 'independent-longevity',
      url: 'https://www.lifespan.io/news/fresh-longevity/',
      publishedAt: '2026-06-24T00:00:00.000Z',
      summary: 'Independent longevity coverage from the latest refresh.',
      topics: ['Longevity'],
    },
  ],
}

const tempDir = await mkdtemp(join(tmpdir(), 'herbalisti-static-refresh-'))

try {
  await writeFile(join(tempDir, 'news.json'), `${JSON.stringify(goodFeed, null, 2)}\n`, 'utf8')

  const preserved = await writeStaticNewsRefresh(emptyFailureFeed, { dataDir: tempDir })
  const preservedNews = await readJson(join(tempDir, 'news.json'))
  const preservedStatus = await readJson(join(tempDir, 'feed-status.json'))

  assert(preserved.newsWritten === false, 'Empty failed refresh should not rewrite news.json')
  assert(preserved.preserveExistingSnapshot === true, 'Empty failed refresh should preserve the previous snapshot')
  assert(preservedNews.generatedAt === goodFeed.generatedAt, 'Preserved news.json should keep the previous generatedAt')
  assert(preservedNews.items.length === goodFeed.items.length, 'Preserved news.json should keep previous feed items')
  assert(
    preservedStatus.latestRefresh.status === 'completed_with_preserved_snapshot',
    'Feed status should mark the refresh as completed with a preserved snapshot',
  )
  assert(preservedStatus.latestRefresh.itemCount === 0, 'Feed status should record the failed refresh item count')
  assert(
    preservedStatus.latestRefresh.publicItemCount === goodFeed.items.length,
    'Feed status should record the preserved public item count',
  )
  assert(
    preservedStatus.latestRefresh.warningCount === emptyFailureFeed.warnings.length + 1,
    'Feed status should include source warnings plus the preservation warning',
  )
  assert(
    preservedStatus.latestRefresh.warnings.includes(preservedSnapshotWarning),
    'Feed status should include the preservation warning',
  )
  assert(
    preservedStatus.publicSnapshot.status === 'preserved_existing' &&
      preservedStatus.publicSnapshot.itemCount === goodFeed.items.length,
    'Feed status should expose preserved public snapshot metadata',
  )

  const updated = await writeStaticNewsRefresh(freshGoodFeed, { dataDir: tempDir })
  const updatedNews = await readJson(join(tempDir, 'news.json'))
  const updatedStatus = await readJson(join(tempDir, 'feed-status.json'))

  assert(updated.newsWritten === true, 'Successful refresh should rewrite news.json')
  assert(updatedNews.generatedAt === freshGoodFeed.generatedAt, 'Successful refresh should write the new feed')
  assert(updatedNews.items.length === freshGoodFeed.items.length, 'Successful refresh should write fresh feed items')
  assert(updatedStatus.latestRefresh.status === 'completed', 'Successful refresh should record completed status')
  assert(updatedStatus.publicSnapshot.status === 'updated', 'Successful refresh should mark public snapshot as updated')

  await writeFile(join(tempDir, 'news.json'), `${JSON.stringify(goodFeed, null, 2)}\n`, 'utf8')

  const partiallyPreserved = await writeStaticNewsRefresh(partialFailureFeed, { dataDir: tempDir })
  const partiallyPreservedNews = await readJson(join(tempDir, 'news.json'))
  const partiallyPreservedStatus = await readJson(join(tempDir, 'feed-status.json'))

  assert(partiallyPreserved.newsWritten === true, 'Partial source failure should still write the refreshed public feed')
  assert(
    partiallyPreserved.preserveExistingSnapshot === false,
    'Partial source failure should not preserve the whole previous snapshot',
  )
  assert(
    partiallyPreserved.preservedSourceItems.length === 1,
    'Partial source failure should preserve last-known items from the failed source',
  )
  assert(
    partiallyPreservedNews.items.some((item) => item.id === 'fresh-longevity') &&
      partiallyPreservedNews.items.some((item) => item.id === 'last-good-crispr'),
    'Partial source failure should publish fresh items plus last-known failed-source items',
  )
  assert(
    partiallyPreservedNews.preservation?.preservedSourceNames.includes('Crossref'),
    'Public news payload should expose preserved source names',
  )
  assert(
    partiallyPreservedStatus.latestRefresh.status === 'completed_with_warnings',
    'Partial source failure should keep completed_with_warnings status',
  )
  assert(
    partiallyPreservedStatus.latestRefresh.preservedSourceItemCount === 1 &&
      partiallyPreservedStatus.latestRefresh.preservedSourceNames.includes('Crossref'),
    'Feed status should count and name preserved source items',
  )
  assert(
    partiallyPreservedStatus.publicSnapshot.status === 'updated_with_source_preservation',
    'Feed status should mark partial source preservation distinctly',
  )
  assert(
    partiallyPreservedStatus.latestRefresh.warnings.some((warning) =>
      warning.includes('Preserved 1 last-known public item from temporarily unavailable source: Crossref.'),
    ),
    'Feed status should include a specific partial source preservation warning',
  )

  const appSource = read('src/App.tsx')
  assert(appSource.includes('publicItemCount'), 'Frontend heartbeat should understand the public item count')
  assert(
    appSource.includes('preserved public snapshot'),
    'Frontend heartbeat should expose preserved snapshot status text',
  )
  assert(
    appSource.includes('preserved source signals'),
    'Frontend heartbeat should expose partial source preservation status text',
  )

  console.log(
    JSON.stringify(
      {
        status: 'pass',
        preserved: {
          newsWritten: preserved.newsWritten,
          refreshStatus: preservedStatus.latestRefresh.status,
          attemptedItems: preservedStatus.latestRefresh.itemCount,
          publicItemCount: preservedStatus.latestRefresh.publicItemCount,
          warningCount: preservedStatus.latestRefresh.warningCount,
        },
        updated: {
          newsWritten: updated.newsWritten,
          refreshStatus: updatedStatus.latestRefresh.status,
          publicItemCount: updatedStatus.latestRefresh.publicItemCount,
        },
        partiallyPreserved: {
          newsWritten: partiallyPreserved.newsWritten,
          refreshStatus: partiallyPreservedStatus.latestRefresh.status,
          publicSnapshotStatus: partiallyPreservedStatus.publicSnapshot.status,
          publicItemCount: partiallyPreservedStatus.latestRefresh.publicItemCount,
          preservedSourceItemCount: partiallyPreservedStatus.latestRefresh.preservedSourceItemCount,
        },
        safeToRun:
          'This verifier writes only to a temporary local directory. It does not fetch live sources, mutate production data, or call paid APIs.',
      },
      null,
      2,
    ),
  )
} finally {
  await rm(tempDir, { recursive: true, force: true })
}
