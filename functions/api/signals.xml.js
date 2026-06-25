import {
  getSignalsRssPayload,
  normalizeSignalsRssFilters,
  signalsRssContentType,
  signalsRssXmlFromItems,
} from '../_lib/signals-rss.js'

const rssResponse = (xml, cacheControl = 'public, max-age=900, s-maxage=3600') =>
  new Response(xml, {
    headers: {
      'content-type': signalsRssContentType,
      'cache-control': cacheControl,
    },
  })

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const forceLive = url.searchParams.get('live') === '1'
  const filters = normalizeSignalsRssFilters({
    topic: url.searchParams.get('topic') ?? 'All',
    source: url.searchParams.get('source') ?? 'All sources',
    query: url.searchParams.get('query') ?? '',
  })
  const cache = caches.default
  const cacheKey = new Request(
    `${url.origin}/api/signals-rss-cache-v1${forceLive ? '-live' : ''}?topic=${encodeURIComponent(filters.topic)}&source=${encodeURIComponent(filters.source)}&query=${encodeURIComponent(filters.query)}`,
  )

  if (!forceLive) {
    const cached = await cache.match(cacheKey)
    if (cached) {
      return cached
    }
  }

  const feed = await getSignalsRssPayload({ env, filters, forceLive, limit: 24 })
  const response = rssResponse(
    signalsRssXmlFromItems(feed.items, {
      generatedAt: feed.generatedAt,
      filters: feed.filters,
      source: feed.source,
    }),
  )

  await cache.put(cacheKey, response.clone())
  return response
}
