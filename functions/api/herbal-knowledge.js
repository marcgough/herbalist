import { getHerbalKnowledgePayload } from '../_lib/herbal-knowledge.js'

export async function onRequestGet({ request }) {
  const url = new URL(request.url)

  return Response.json(getHerbalKnowledgePayload({ query: url.searchParams.get('query') ?? '' }), {
    headers: {
      'cache-control': 'public, max-age=300, s-maxage=1800',
    },
  })
}
