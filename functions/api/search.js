import { getSearchPayload } from '../_lib/search.js'

const jsonResponse = (payload, cacheControl = 'public, max-age=300, s-maxage=1800') =>
  new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cacheControl,
    },
  })

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const payload = await getSearchPayload(env, {
    query: url.searchParams.get('query') ?? '',
    region: url.searchParams.get('region') ?? 'All lanes',
  })

  return jsonResponse(payload)
}
