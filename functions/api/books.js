import { getBooksPayload } from '../_lib/books.js'

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const payload = await getBooksPayload(env, {
    query: url.searchParams.get('query') ?? '',
    mode: url.searchParams.get('mode') ?? 'All',
    region: url.searchParams.get('region') ?? 'All lanes',
  })

  return Response.json(payload, {
    headers: {
      'cache-control': 'public, max-age=300, s-maxage=3600',
    },
  })
}
