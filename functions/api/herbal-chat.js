import { buildCorpusHerbalChatResponse } from '../_lib/corpus-memory.js'
import { buildHerbalChatResponse } from '../_lib/herbal-knowledge.js'
import { maybeBuildOpenAiHerbalChatResponse } from '../_lib/openai-herbal-chat.js'

const jsonResponse = (payload) =>
  Response.json(payload, {
    headers: {
      'cache-control': 'public, max-age=120, s-maxage=600',
    },
  })

export async function onRequestGet({ request, env = {} }) {
  const url = new URL(request.url)
  const query = url.searchParams.get('query') ?? ''
  const retrievalPayload = (await buildCorpusHerbalChatResponse(env, query)) ?? buildHerbalChatResponse(query)
  const payload = (await maybeBuildOpenAiHerbalChatResponse(env, retrievalPayload)) ?? retrievalPayload
  return jsonResponse(payload)
}

export async function onRequestPost({ request, env = {} }) {
  let query = ''
  try {
    const body = await request.json()
    query = body?.query ?? ''
  } catch {
    query = ''
  }

  const retrievalPayload = (await buildCorpusHerbalChatResponse(env, query)) ?? buildHerbalChatResponse(query)
  const payload = (await maybeBuildOpenAiHerbalChatResponse(env, retrievalPayload)) ?? retrievalPayload
  return jsonResponse(payload)
}
