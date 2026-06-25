import {
  getSignalIntelligencePayload,
} from '../_lib/signal-intelligence.js'
import { normalizeNewsSource, normalizeNewsTopic } from '../_lib/feed.js'

const jsonResponse = (payload, cacheControl = 'public, max-age=900, s-maxage=3600') =>
  new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cacheControl,
    },
  })

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const payload = await getSignalIntelligencePayload(env, {
    topic: normalizeNewsTopic(url.searchParams.get('topic') ?? 'All'),
    source: normalizeNewsSource(url.searchParams.get('source') ?? 'All sources'),
    query: String(url.searchParams.get('query') ?? '').trim().slice(0, 120),
  })

  return jsonResponse(payload)
}
