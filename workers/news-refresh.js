import {
  fetchHerbalistiNews,
  persistFeedRefreshRunToD1,
  persistNewsItemsToD1,
  sourcePolicyText,
} from '../functions/_lib/feed.js'

const refresh = async (env, triggerType = 'manual') => {
  if (!env.HERBALISTI_DB) {
    throw new Error('HERBALISTI_DB binding is required for scheduled news refresh.')
  }

  const startedAt = new Date().toISOString()

  try {
    const feed = await fetchHerbalistiNews({ limit: 24 })
    const result = await persistNewsItemsToD1(env.HERBALISTI_DB, feed.items)
    const refreshRun = await persistFeedRefreshRunToD1(env.HERBALISTI_DB, {
      triggerType,
      startedAt,
      finishedAt: new Date().toISOString(),
      itemCount: feed.items.length,
      persistedCount: result.inserted,
      warnings: feed.warnings,
      sourcePolicy: feed.sourcePolicy,
    })

    return {
      generatedAt: feed.generatedAt,
      warnings: feed.warnings,
      itemCount: feed.items.length,
      persisted: result.inserted,
      refreshRun,
    }
  } catch (error) {
    await persistFeedRefreshRunToD1(env.HERBALISTI_DB, {
      triggerType,
      status: 'failed',
      startedAt,
      finishedAt: new Date().toISOString(),
      warnings: [error.message],
      sourcePolicy: sourcePolicyText,
    })
    throw error
  }
}

const authorized = (request, env) => {
  if (!env.FEED_ADMIN_TOKEN) return false
  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const headerToken = request.headers.get('x-herbalisti-feed-token')
  return bearer === env.FEED_ADMIN_TOKEN || headerToken === env.FEED_ADMIN_TOKEN
}

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(refresh(env, 'scheduled'))
  },

  async fetch(request, env) {
    if (!authorized(request, env)) {
      return Response.json({ error: 'unauthorized' }, { status: 401 })
    }

    const result = await refresh(env, 'manual')
    return Response.json(result, {
      headers: {
        'cache-control': 'no-store',
      },
    })
  },
}
