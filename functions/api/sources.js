import { getSourcesPayload } from '../_lib/sources.js'

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const payload = await getSourcesPayload(env, {
    query: url.searchParams.get('query') ?? '',
  })

  return Response.json(payload, {
    headers: {
      'cache-control': 'public, max-age=300, s-maxage=3600',
    },
  })
}
