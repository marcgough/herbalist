import { readLatestFeedRefreshRunFromD1, sourcePolicyText } from '../_lib/feed.js'

const jsonResponse = (payload) =>
  new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })

export async function onRequestGet({ env }) {
  if (!env.HERBALISTI_DB) {
    return jsonResponse({
      generatedAt: new Date().toISOString(),
      source: 'static-fallback',
      sourcePolicy: sourcePolicyText,
      latestRefresh: null,
    })
  }

  const latestRefresh = await readLatestFeedRefreshRunFromD1(env.HERBALISTI_DB)

  return jsonResponse({
    generatedAt: new Date().toISOString(),
    source: latestRefresh ? 'd1-refresh-ledger' : 'd1-refresh-ledger-empty',
    sourcePolicy: sourcePolicyText,
    latestRefresh,
  })
}
