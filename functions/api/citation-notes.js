import { getCitationNotesPayload } from '../_lib/citation-notes.js'

const jsonResponse = (payload, cacheControl = 'public, max-age=3600, s-maxage=21600') =>
  new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cacheControl,
    },
  })

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const payload = await getCitationNotesPayload(env, {
    query: url.searchParams.get('query') ?? '',
    type: url.searchParams.get('type') ?? 'all',
  })

  return jsonResponse(payload)
}
