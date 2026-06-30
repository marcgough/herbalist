import { authorizedByAdminToken } from '../functions/_lib/admin-auth.js'
import { refreshHerbalistiNews } from '../functions/_lib/news-refresh.js'

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(refreshHerbalistiNews(env, 'scheduled'))
  },

  async fetch(request, env) {
    if (
      !(await authorizedByAdminToken(request, env.FEED_ADMIN_TOKEN, {
        headerName: 'x-herbalisti-feed-token',
      }))
    ) {
      return Response.json({ error: 'unauthorized' }, { status: 401 })
    }

    const result = await refreshHerbalistiNews(env, 'manual')
    return Response.json(result, {
      headers: {
        'cache-control': 'no-store',
      },
    })
  },
}
