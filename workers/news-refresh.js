import {
  fetchHerbalistiNews,
  persistFeedRefreshRunToD1,
  persistNewsItemsToD1,
  sourcePolicyText,
} from '../functions/_lib/feed.js'
import { authorizedByAdminToken } from '../functions/_lib/admin-auth.js'

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

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(refresh(env, 'scheduled'))
  },

  async fetch(request, env) {
    if (
      !(await authorizedByAdminToken(request, env.FEED_ADMIN_TOKEN, {
        headerName: 'x-herbalisti-feed-token',
      }))
    ) {
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
