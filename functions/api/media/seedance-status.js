import { extractKieResultUrl } from '../../_lib/media.js'
import { authorizedByAdminToken } from '../../_lib/admin-auth.js'

const KIE_TASK_INFO_URL = 'https://api.kie.ai/api/v1/jobs/recordInfo'

const json = (payload, status = 200) =>
  Response.json(payload, {
    status,
    headers: {
      'cache-control': 'no-store',
    },
  })

export async function onRequestGet({ request, env }) {
  if (!env.KIE_API_KEY || !env.MEDIA_ADMIN_TOKEN) {
    return json(
      {
        error: 'media_generation_not_configured',
        message: 'Set KIE_API_KEY and MEDIA_ADMIN_TOKEN before checking Seedance jobs.',
      },
      503,
    )
  }

  if (!(await authorizedByAdminToken(request, env.MEDIA_ADMIN_TOKEN))) {
    return json({ error: 'unauthorized' }, 401)
  }

  const url = new URL(request.url)
  const taskId = url.searchParams.get('taskId')?.trim()
  if (!taskId) {
    return json({ error: 'missing_task_id' }, 400)
  }

  const requestUrl = new URL(KIE_TASK_INFO_URL)
  requestUrl.searchParams.set('taskId', taskId)

  const response = await fetch(requestUrl, {
    headers: {
      authorization: `Bearer ${env.KIE_API_KEY}`,
    },
  })

  const result = await response.json().catch(() => null)
  if (!response.ok) {
    return json(
      {
        error: 'kie_task_lookup_failed',
        status: response.status,
        result,
      },
      502,
    )
  }

  const status = result?.data?.state || result?.data?.status || 'unknown'
  const resultUrl = extractKieResultUrl(result)

  if (env.HERBALISTI_DB) {
    await env.HERBALISTI_DB.prepare(
      `UPDATE media_jobs
       SET status = ?, result_url = COALESCE(?, result_url), updated_at = CURRENT_TIMESTAMP
       WHERE provider_task_id = ?`,
    )
      .bind(status, resultUrl ?? null, taskId)
      .run()
  }

  return json({
    provider: 'kie.ai',
    taskId,
    status,
    result,
  })
}
