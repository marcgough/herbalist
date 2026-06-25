import { getKnowledgeGraphPayload } from '../_lib/knowledge-graph.js'

const jsonResponse = (payload, cacheControl = 'public, max-age=3600, s-maxage=21600') =>
  new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cacheControl,
    },
  })

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const payload = await getKnowledgeGraphPayload(env, {
    query: url.searchParams.get('query') ?? '',
    focus: url.searchParams.get('focus') ?? '',
    relation: url.searchParams.get('relation') ?? 'All relations',
  })

  return jsonResponse(payload)
}
