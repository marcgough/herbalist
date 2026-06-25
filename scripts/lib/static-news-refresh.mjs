import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export const preservedSnapshotWarning =
  'Preserved existing public news snapshot because the latest refresh returned zero usable items.'

const readJsonIfExists = async (path) => {
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null
    }

    throw error
  }
}

const refreshId = (generatedAt) =>
  `static-refresh-${String(generatedAt ?? new Date().toISOString()).replace(/[^0-9A-Za-z]/g, '')}`

export const buildStaticNewsRefreshState = (feed, existingFeed = null) => {
  const feedItems = Array.isArray(feed.items) ? feed.items : []
  const existingItems = Array.isArray(existingFeed?.items) ? existingFeed.items : []
  const preserveExistingSnapshot = feedItems.length === 0 && existingItems.length > 0
  const generatedAt = feed.generatedAt ?? new Date().toISOString()
  const warnings = Array.isArray(feed.warnings) ? [...feed.warnings] : []

  if (preserveExistingSnapshot && !warnings.includes(preservedSnapshotWarning)) {
    warnings.push(preservedSnapshotWarning)
  }

  const refreshRun = {
    id: refreshId(generatedAt),
    triggerType: 'static-refresh',
    status: preserveExistingSnapshot
      ? 'completed_with_preserved_snapshot'
      : warnings.length > 0
        ? 'completed_with_warnings'
        : 'completed',
    startedAt: generatedAt,
    finishedAt: generatedAt,
    itemCount: feedItems.length,
    persistedCount: 0,
    publicItemCount: preserveExistingSnapshot ? existingItems.length : feedItems.length,
    warningCount: warnings.length,
    warnings,
    sourcePolicy: feed.sourcePolicy,
  }

  return {
    preserveExistingSnapshot,
    newsPayload: preserveExistingSnapshot ? existingFeed : feed,
    statusPayload: {
      generatedAt,
      source: 'static-refresh',
      sourcePolicy: feed.sourcePolicy,
      latestRefresh: refreshRun,
      publicSnapshot: {
        status: preserveExistingSnapshot ? 'preserved_existing' : 'updated',
        itemCount: preserveExistingSnapshot ? existingItems.length : feedItems.length,
        generatedAt: preserveExistingSnapshot ? existingFeed?.generatedAt ?? '' : generatedAt,
      },
    },
  }
}

export const writeStaticNewsRefresh = async (feed, { dataDir = 'public/data' } = {}) => {
  const newsPath = resolve(dataDir, 'news.json')
  const feedStatusPath = resolve(dataDir, 'feed-status.json')
  const existingFeed = await readJsonIfExists(newsPath)
  const state = buildStaticNewsRefreshState(feed, existingFeed)

  await mkdir(dataDir, { recursive: true })
  if (!state.preserveExistingSnapshot) {
    await writeFile(newsPath, `${JSON.stringify(state.newsPayload, null, 2)}\n`, 'utf8')
  }
  await writeFile(feedStatusPath, `${JSON.stringify(state.statusPayload, null, 2)}\n`, 'utf8')

  return {
    ...state,
    newsPath,
    feedStatusPath,
    newsWritten: !state.preserveExistingSnapshot,
  }
}
