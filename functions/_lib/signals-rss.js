import {
  compact,
  fetchHerbalistiNews,
  filterNewsItems,
  normalizeNewsSource,
  normalizeNewsTopic,
  persistFeedRefreshRunToD1,
  persistNewsItemsToD1,
  readNewsItemsFromD1,
  sourcePolicyText,
  textHasBlockedSource,
} from './feed.js'

export const signalsRssContentType = 'application/rss+xml; charset=utf-8'
export const signalsRssPath = '/api/signals.xml'
export const signalsRssUrl = `https://herbalisti.com${signalsRssPath}`

const maxRssItems = 24

export const normalizeSignalsRssFilters = ({ topic = 'All', source = 'All sources', query = '' } = {}) => ({
  topic: normalizeNewsTopic(topic),
  source: normalizeNewsSource(source),
  query: String(query ?? '').trim().slice(0, 120),
})

export const escapeXml = (value) =>
  compact(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const rfc822Date = (value) => {
  const timestamp = new Date(value).valueOf()
  return new Date(Number.isFinite(timestamp) ? timestamp : Date.now()).toUTCString()
}

const uniqueItemsForRss = (items, limit = maxRssItems) => {
  const seen = new Set()

  return items
    .filter((item) => item.title && item.url && Array.isArray(item.topics) && item.topics.length > 0)
    .filter((item) => !textHasBlockedSource(`${item.title} ${item.summary} ${item.sourceName}`))
    .filter((item) => {
      const key = compact(item.id || item.url || item.title).toLowerCase()
      if (!key || seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
    .slice(0, limit)
}

const filtersSummary = (filters) => {
  const active = []
  if (filters.topic && filters.topic !== 'All') {
    active.push(`topic: ${filters.topic}`)
  }
  if (filters.source && filters.source !== 'All sources') {
    active.push(`source: ${filters.source}`)
  }
  if (filters.query) {
    active.push(`query: ${filters.query}`)
  }

  return active.length ? `Filtered by ${active.join(', ')}.` : 'Unfiltered public Signals feed.'
}

const itemDescription = (item) =>
  [
    item.summary,
    `Source: ${item.sourceName}.`,
    `Topics: ${item.topics.join(', ')}.`,
    'Metadata only; not medical advice, diagnosis, treatment, or prescription.',
  ]
    .map(compact)
    .filter(Boolean)
    .join(' ')

const renderItem = (item) => {
  const categories = [item.sourceName, ...item.topics]
    .filter(Boolean)
    .map((category) => `      <category>${escapeXml(category)}</category>`)
    .join('\n')

  return [
    '    <item>',
    `      <title>${escapeXml(item.title)}</title>`,
    `      <link>${escapeXml(item.url)}</link>`,
    `      <guid isPermaLink="false">${escapeXml(item.id || item.url)}</guid>`,
    `      <pubDate>${escapeXml(rfc822Date(item.publishedAt))}</pubDate>`,
    `      <description>${escapeXml(itemDescription(item))}</description>`,
    categories,
    '    </item>',
  ]
    .filter(Boolean)
    .join('\n')
}

export const signalsRssXmlFromItems = (
  items,
  { generatedAt = new Date().toISOString(), filters = {}, source = 'public-source-signals' } = {},
) => {
  const normalizedFilters = normalizeSignalsRssFilters(filters)
  const rssItems = uniqueItemsForRss(items)
  const channelDescription = [
    'Allowlisted public research and independent longevity signals for self-sovereign wellbeing.',
    'Metadata only; not medical advice, diagnosis, treatment, or prescription.',
    sourcePolicyText,
    filtersSummary(normalizedFilters),
  ].join(' ')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>Herbalisti Signals</title>',
    '    <link>https://herbalisti.com/signals</link>',
    `    <atom:link href="${signalsRssUrl}" rel="self" type="application/rss+xml" />`,
    `    <description>${escapeXml(channelDescription)}</description>`,
    '    <language>en</language>',
    `    <lastBuildDate>${escapeXml(rfc822Date(generatedAt))}</lastBuildDate>`,
    '    <generator>Herbalisti public-source signal system</generator>',
    '    <docs>https://www.rssboard.org/rss-specification</docs>',
    '    <category>Longevity</category>',
    '    <category>Peptides</category>',
    '    <category>Gene therapy</category>',
    '    <category>Gene editing</category>',
    '    <category>CRISPR</category>',
    '    <category>DNA modification</category>',
    '    <category>Health as a service</category>',
    '    <category>Self-sovereign wellbeing</category>',
    `    <source>${escapeXml(source)}</source>`,
    rssItems.map(renderItem).join('\n'),
    '  </channel>',
    '</rss>',
    '',
  ]
    .filter(Boolean)
    .join('\n')
}

export const getSignalsRssPayload = async ({
  env = {},
  filters = {},
  forceLive = false,
  limit = maxRssItems,
} = {}) => {
  const normalizedFilters = normalizeSignalsRssFilters(filters)

  if (env.HERBALISTI_DB && !forceLive) {
    const storedItems = await readNewsItemsFromD1(env.HERBALISTI_DB, limit, normalizedFilters)
    if (storedItems.length) {
      return {
        generatedAt: new Date().toISOString(),
        source: 'd1',
        sourcePolicy: sourcePolicyText,
        filters: normalizedFilters,
        items: storedItems,
        warnings: [],
      }
    }
  }

  const liveFetchStartedAt = new Date().toISOString()
  const feed = await fetchHerbalistiNews({ limit })
  let persistResult = { inserted: 0 }

  if (env.HERBALISTI_DB && feed.items.length) {
    persistResult = await persistNewsItemsToD1(env.HERBALISTI_DB, feed.items)
    await persistFeedRefreshRunToD1(env.HERBALISTI_DB, {
      triggerType: forceLive ? 'rss-live-api-forced' : 'rss-live-api',
      startedAt: liveFetchStartedAt,
      finishedAt: new Date().toISOString(),
      itemCount: feed.items.length,
      persistedCount: persistResult.inserted,
      warnings: feed.warnings,
      sourcePolicy: feed.sourcePolicy,
    })
  }

  return {
    ...feed,
    source: env.HERBALISTI_DB ? 'live-rss-fetch-and-d1-persist' : 'live-rss-fetch',
    filters: normalizedFilters,
    items: filterNewsItems(feed.items, normalizedFilters),
  }
}
