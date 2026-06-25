import {
  fetchHerbalistiNews,
  filterNewsItems,
  newsTopics,
  readNewsItemsFromD1,
  sourcePolicyText,
} from './feed.js'

export const signalIntelligencePolicy =
  'Metadata-only signal intelligence from allowlisted public sources; topic counts are discovery context, not medical guidance.'

const percent = (count, total) => (total > 0 ? Math.round((count / total) * 100) : 0)

const sortCountRecords = (left, right) => {
  if (right.count !== left.count) {
    return right.count - left.count
  }

  return left.label.localeCompare(right.label)
}

const newestDate = (items) => {
  const newest = items
    .map((item) => new Date(item.publishedAt).valueOf())
    .filter((timestamp) => Number.isFinite(timestamp))
    .sort((left, right) => right - left)[0]

  return newest ? new Date(newest).toISOString() : ''
}

const recentCount = (items, generatedAt) => {
  const generatedAtMs = new Date(generatedAt).valueOf()
  const cutoff = Number.isFinite(generatedAtMs) ? generatedAtMs - 14 * 24 * 60 * 60 * 1000 : Date.now() - 14 * 24 * 60 * 60 * 1000

  return items.filter((item) => {
    const timestamp = new Date(item.publishedAt).valueOf()
    return Number.isFinite(timestamp) && timestamp >= cutoff
  }).length
}

export const signalIntelligenceFromItems = (items, options = {}) => {
  const generatedAt = options.generatedAt ?? new Date().toISOString()
  const sourceHealth = Array.isArray(options.sourceHealth) ? options.sourceHealth : []
  const totalSignals = items.length
  const topicCounts = newsTopics
    .map((topic) => ({
      topic,
      label: topic,
      count: items.filter((item) => item.topics?.includes(topic)).length,
      share: 0,
    }))
    .map((item) => ({
      ...item,
      share: percent(item.count, totalSignals),
    }))
  const activeTopics = topicCounts.filter((topic) => topic.count > 0).sort(sortCountRecords)
  const sourceCounts = [...new Set(items.map((item) => item.sourceName).filter(Boolean))]
    .map((sourceName) => ({
      sourceName,
      label: sourceName,
      count: items.filter((item) => item.sourceName === sourceName).length,
      share: percent(items.filter((item) => item.sourceName === sourceName).length, totalSignals),
    }))
    .sort(sortCountRecords)
  const newestSignalAt = newestDate(items)
  const recentSignals = recentCount(items, generatedAt)
  const topTopic = activeTopics[0] ?? null
  const warningCount = sourceHealth.filter((source) => source.status === 'warning').length
  const healthySourceCount = sourceHealth.filter((source) => source.status === 'ok').length

  return {
    generatedAt,
    source: options.source ?? 'computed',
    filters: options.filters ?? {},
    policy: signalIntelligencePolicy,
    totalSignals,
    representedTopics: activeTopics.length,
    representedSources: sourceCounts.length,
    coveragePercent: percent(activeTopics.length, newsTopics.length),
    recentSignals,
    newestSignalAt,
    leadingTopic: topTopic
      ? {
          topic: topTopic.topic,
          count: topTopic.count,
          share: topTopic.share,
          summary: `${topTopic.topic} is the strongest current metadata cluster across the selected public-source signals.`,
        }
      : null,
    topicCoverage: topicCounts,
    topicClusters: topicCounts.map((topic) => ({
      ...topic,
      status: topic.count > 0 ? 'active' : 'watch',
      summary:
        topic.count > 0
          ? `${topic.topic} is represented in the selected public-source signals.`
          : `${topic.topic} is monitored by the source adapters and will appear when matching public metadata arrives.`,
    })),
    topTopics: activeTopics.slice(0, 6),
    sourceMix: sourceCounts.slice(0, 6),
    sourceHealth: {
      checkedSources: sourceHealth.length,
      healthySourceCount,
      warningCount,
    },
  }
}

export const getSignalIntelligencePayload = async (env, filters = {}) => {
  let source = 'live-fetch'
  let generatedAt = new Date().toISOString()
  let sourceHealth = []
  let items = []

  if (env.HERBALISTI_DB) {
    const storedItems = await readNewsItemsFromD1(env.HERBALISTI_DB, 96, filters)
    if (storedItems.length) {
      source = 'd1'
      items = storedItems
    }
  }

  if (!items.length) {
    const feed = await fetchHerbalistiNews({ limit: 96 })
    source = env.HERBALISTI_DB ? 'live-fetch-and-d1-ready' : 'live-fetch'
    generatedAt = feed.generatedAt
    sourceHealth = feed.sourceHealth ?? []
    items = filterNewsItems(feed.items, filters)
  }

  return {
    ...signalIntelligenceFromItems(items, {
      generatedAt,
      source,
      filters,
      sourceHealth,
    }),
    sourcePolicy: sourcePolicyText,
  }
}
