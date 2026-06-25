import { getSourceHealthPayload } from '../_lib/feed.js'

const jsonResponse = (payload, cacheControl = 'public, max-age=900, s-maxage=1800') =>
  new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cacheControl,
    },
  })

export async function onRequestGet({ request }) {
  const url = new URL(request.url)
  const cache = caches.default
  const cacheKey = new Request(`${url.origin}/api/source-health-cache-v1`)
  const cached = await cache.match(cacheKey)

  if (cached) {
    return cached
  }

  const payload = await getSourceHealthPayload()
  const response = jsonResponse(payload)
  await cache.put(cacheKey, response.clone())
  return response
}
