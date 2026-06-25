import { extractKieTaskId } from '../../_lib/media.js'

const KIE_CREATE_TASK_URL = 'https://api.kie.ai/api/v1/jobs/createTask'
const ALLOWED_MODELS = new Set(['bytedance/seedance-2', 'bytedance/seedance-2-fast'])
const ALLOWED_RESOLUTIONS = new Set(['480p', '720p', '1080p'])
const ALLOWED_ASPECT_RATIOS = new Set(['21:9', '16:9', '4:3', '1:1', '3:4', '9:16'])

const json = (payload, status = 200) =>
  Response.json(payload, {
    status,
    headers: {
      'cache-control': 'no-store',
    },
  })

const authorized = (request, env) => {
  const configuredToken = env.MEDIA_ADMIN_TOKEN
  if (!configuredToken) return false
  const headerToken = request.headers.get('x-herbalisti-admin-token')
  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  return headerToken === configuredToken || bearer === configuredToken
}

const numberInRange = (value, min, max) => {
  const number = Number(value)
  return Number.isInteger(number) && number >= min && number <= max
}

const optionalUrl = (value) => (typeof value === 'string' && value.startsWith('https://') ? value : undefined)
const optionalUrlList = (value) => (Array.isArray(value) ? value.filter(optionalUrl).slice(0, 9) : undefined)

export async function onRequestPost({ request, env }) {
  if (!env.KIE_API_KEY || !env.MEDIA_ADMIN_TOKEN) {
    return json(
      {
        error: 'media_generation_not_configured',
        message: 'Set KIE_API_KEY and MEDIA_ADMIN_TOKEN before creating Seedance jobs.',
      },
      503,
    )
  }

  if (!authorized(request, env)) {
    return json({ error: 'unauthorized' }, 401)
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body.prompt !== 'string' || body.prompt.trim().length < 20) {
    return json({ error: 'invalid_prompt', message: 'Provide a prompt of at least 20 characters.' }, 400)
  }

  const model = ALLOWED_MODELS.has(body.model) ? body.model : 'bytedance/seedance-2-fast'
  const input = {
    prompt: body.prompt.trim(),
    resolution: ALLOWED_RESOLUTIONS.has(body.resolution) ? body.resolution : '720p',
    duration: numberInRange(body.duration, 4, 15) ? Number(body.duration) : 8,
    generate_audio: Boolean(body.generateAudio),
    return_last_frame: Boolean(body.returnLastFrame),
    web_search: false,
  }

  if (ALLOWED_ASPECT_RATIOS.has(body.aspectRatio)) {
    input.aspect_ratio = body.aspectRatio
  } else {
    input.aspect_ratio = '16:9'
  }

  const firstFrameUrl = optionalUrl(body.firstFrameUrl)
  const lastFrameUrl = optionalUrl(body.lastFrameUrl)
  const referenceImageUrls = optionalUrlList(body.referenceImageUrls)
  const referenceVideoUrls = optionalUrlList(body.referenceVideoUrls)
  const referenceAudioUrls = optionalUrlList(body.referenceAudioUrls)

  if (firstFrameUrl) input.first_frame_url = firstFrameUrl
  if (lastFrameUrl) input.last_frame_url = lastFrameUrl
  if (referenceImageUrls?.length) input.reference_image_urls = referenceImageUrls
  if (referenceVideoUrls?.length) input.reference_video_urls = referenceVideoUrls
  if (referenceAudioUrls?.length) input.reference_audio_urls = referenceAudioUrls

  const payload = {
    model,
    input,
  }

  if (typeof body.callBackUrl === 'string' && body.callBackUrl.startsWith('https://')) {
    payload.callBackUrl = body.callBackUrl
  }

  const response = await fetch(KIE_CREATE_TASK_URL, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.KIE_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const result = await response.json().catch(() => null)
  if (!response.ok) {
    return json(
      {
        error: 'kie_create_task_failed',
        status: response.status,
        result,
      },
      502,
    )
  }

  const taskId = extractKieTaskId(result)

  if (env.HERBALISTI_DB && taskId) {
    await env.HERBALISTI_DB.prepare(
      `INSERT OR REPLACE INTO media_jobs
       (id, provider, model, status, prompt, input_json, provider_task_id, updated_at)
       VALUES (?, 'kie.ai', ?, 'submitted', ?, ?, ?, CURRENT_TIMESTAMP)`,
    )
      .bind(taskId, model, input.prompt, JSON.stringify(input), taskId)
      .run()
  }

  return json({
    provider: 'kie.ai',
    model,
    taskId,
    result,
  })
}
