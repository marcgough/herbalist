import { authorizedByAdminToken } from '../_lib/admin-auth.js'
import { refreshHerbalistiNews } from '../_lib/news-refresh.js'

const json = (payload, status = 200) =>
  Response.json(payload, {
    status,
    headers: {
      'cache-control': 'no-store',
    },
  })

export const onRequestGet = async () =>
  json(
    {
      error: 'method_not_allowed',
      message: 'Use POST with admin authorization to refresh the Herbalisti Signals feed.',
    },
    405,
  )

export const onRequestPost = async ({ request, env = {} }) => {
  if (!env.HERBALISTI_DB) {
    return json(
      {
        error: 'feed_refresh_not_configured',
        message: 'HERBALISTI_DB must be bound before refreshing the Signals feed.',
      },
      503,
    )
  }

  if (
    !(await authorizedByAdminToken(request, env.FEED_ADMIN_TOKEN, {
      headerName: 'x-herbalisti-feed-token',
    }))
  ) {
    return json({ error: 'unauthorized' }, 401)
  }

  try {
    return json(await refreshHerbalistiNews(env, 'pages-manual'))
  } catch (error) {
    return json(
      {
        error: 'feed_refresh_failed',
        message: error.message,
      },
      502,
    )
  }
}
