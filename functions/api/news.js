import {
  filterNewsItems,
  fetchHerbalistiNews,
  normalizeNewsSource,
  normalizeNewsTopic,
  persistFeedRefreshRunToD1,
  persistNewsItemsToD1,
  readNewsItemsFromD1,
  sourcePolicyText,
} from '../_lib/feed.js'

const jsonResponse = (payload, cacheControl = 'public, max-age=3600, s-maxage=21600') =>
  new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cacheControl,
    },
  })

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const forceLive = url.searchParams.get('live') === '1'
  const filters = {
    topic: normalizeNewsTopic(url.searchParams.get('topic') ?? 'All'),
    source: normalizeNewsSource(url.searchParams.get('source') ?? 'All sources'),
    query: String(url.searchParams.get('query') ?? '').trim().slice(0, 120),
  }
  const cache = caches.default
  const cacheKey = new Request(
    `${url.origin}/api/news-cache-v4${forceLive ? '-live' : ''}?topic=${encodeURIComponent(filters.topic)}&source=${encodeURIComponent(filters.source)}&query=${encodeURIComponent(filters.query)}`,
  )

  if (!forceLive) {
    const cached = await cache.match(cacheKey)
    if (cached) {
      return cached
    }
  }

  if (env.HERBALISTI_DB && !forceLive) {
    const storedItems = await readNewsItemsFromD1(env.HERBALISTI_DB, 24, filters)
    if (storedItems.length) {
      const response = jsonResponse({
        generatedAt: new Date().toISOString(),
        source: 'd1',
        sourcePolicy: sourcePolicyText,
        filters,
        total: storedItems.length,
        items: storedItems,
      })
      await cache.put(cacheKey, response.clone())
      return response
    }
  }

  const liveFetchStartedAt = new Date().toISOString()
  const feed = await fetchHerbalistiNews({ limit: 24 })
  let persistResult = { inserted: 0 }

  if (env.HERBALISTI_DB && feed.items.length) {
    persistResult = await persistNewsItemsToD1(env.HERBALISTI_DB, feed.items)
  }

  if (env.HERBALISTI_DB) {
    await persistFeedRefreshRunToD1(env.HERBALISTI_DB, {
      triggerType: forceLive ? 'live-api-forced' : 'live-api',
      startedAt: liveFetchStartedAt,
      finishedAt: new Date().toISOString(),
      itemCount: feed.items.length,
      persistedCount: persistResult.inserted,
      warnings: feed.warnings,
      sourcePolicy: feed.sourcePolicy,
    })
  }

  const filteredItems = filterNewsItems(feed.items, filters)

  const response = jsonResponse({
    ...feed,
    filters,
    total: filteredItems.length,
    items: filteredItems,
    source: env.HERBALISTI_DB ? 'live-fetch-and-d1-persist' : 'live-fetch',
  })
  await cache.put(cacheKey, response.clone())
  return response
}
