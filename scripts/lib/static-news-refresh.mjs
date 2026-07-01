import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export const preservedSnapshotWarning =
  'Preserved existing public news snapshot because the latest refresh returned zero usable items.'

const sourcePreservationWarning = (count, sources) =>
  `Preserved ${count} last-known public item${count === 1 ? '' : 's'} from temporarily unavailable source${
    sources.length === 1 ? '' : 's'
  }: ${sources.join(', ')}.`

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

const itemTimestamp = (item) => {
  const timestamp = new Date(item?.publishedAt ?? '').valueOf()
  return Number.isFinite(timestamp) ? timestamp : 0
}

const itemKey = (item) => `${item?.id ?? ''}|${String(item?.url ?? '').toLowerCase()}`

const warningSourceNames = (feed) =>
  Array.isArray(feed.sourceHealth)
    ? feed.sourceHealth
        .filter((source) => source?.status === 'warning' && source?.name)
        .map((source) => source.name)
    : []

const mergeLastKnownWarningSourceItems = (feedItems, existingItems, sourceNames, limit = 24) => {
  if (!sourceNames.length || feedItems.length >= limit) {
    return { items: feedItems, preservedSourceItems: [] }
  }

  const sourceNameSet = new Set(sourceNames)
  const seen = new Set(feedItems.map(itemKey))
  const preservedSourceItems = existingItems
    .filter((item) => sourceNameSet.has(item.sourceName))
    .filter((item) => !seen.has(itemKey(item)))
    .sort((left, right) => itemTimestamp(right) - itemTimestamp(left))
    .slice(0, Math.max(0, limit - feedItems.length))

  return {
    items: [...feedItems, ...preservedSourceItems],
    preservedSourceItems,
  }
}

export const buildStaticNewsRefreshState = (feed, existingFeed = null) => {
  const feedItems = Array.isArray(feed.items) ? feed.items : []
  const existingItems = Array.isArray(existingFeed?.items) ? existingFeed.items : []
  const preserveExistingSnapshot = feedItems.length === 0 && existingItems.length > 0
  const generatedAt = feed.generatedAt ?? new Date().toISOString()
  const warnings = Array.isArray(feed.warnings) ? [...feed.warnings] : []
  const failedSourceNames = warningSourceNames(feed)
  const { items: publicItems, preservedSourceItems } = preserveExistingSnapshot
    ? { items: existingItems, preservedSourceItems: [] }
    : mergeLastKnownWarningSourceItems(feedItems, existingItems, failedSourceNames)
  const preservedSourceNames = [...new Set(preservedSourceItems.map((item) => item.sourceName).filter(Boolean))]

  if (preserveExistingSnapshot && !warnings.includes(preservedSnapshotWarning)) {
    warnings.push(preservedSnapshotWarning)
  }

  if (preservedSourceItems.length) {
    const warning = sourcePreservationWarning(preservedSourceItems.length, preservedSourceNames)
    if (!warnings.includes(warning)) {
      warnings.push(warning)
    }
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
    publicItemCount: publicItems.length,
    preservedSourceItemCount: preservedSourceItems.length,
    preservedSourceNames,
    warningCount: warnings.length,
    warnings,
    sourcePolicy: feed.sourcePolicy,
  }

  const newsPayload = preserveExistingSnapshot
    ? existingFeed
    : {
        ...feed,
        warnings,
        items: publicItems,
        ...(preservedSourceItems.length
          ? {
              preservation: {
                preservedSourceItemCount: preservedSourceItems.length,
                preservedSourceNames,
                policy:
                  'When an allowlisted source is temporarily unavailable, Herbalisti can retain last-known public metadata from the previous static snapshot while keeping the source warning visible.',
              },
            }
          : {}),
      }

  return {
    preserveExistingSnapshot,
    preservedSourceItems,
    newsPayload,
    statusPayload: {
      generatedAt,
      source: 'static-refresh',
      sourcePolicy: feed.sourcePolicy,
      latestRefresh: refreshRun,
      publicSnapshot: {
        status: preserveExistingSnapshot
          ? 'preserved_existing'
          : preservedSourceItems.length
            ? 'updated_with_source_preservation'
            : 'updated',
        itemCount: publicItems.length,
        preservedSourceItemCount: preservedSourceItems.length,
        preservedSourceNames,
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
