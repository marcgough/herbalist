import assert from 'node:assert/strict'
import { onRequestPost as createSeedanceJob } from '../functions/api/media/seedance.js'
import { onRequestGet as getSeedanceStatus } from '../functions/api/media/seedance-status.js'
import { extractKieResultUrl, extractKieTaskId } from '../functions/_lib/media.js'

const env = {
  KIE_API_KEY: 'local-kie-verifier',
  MEDIA_ADMIN_TOKEN: 'local-media-admin',
}

const responseJson = async (response) => ({
  status: response.status,
  cacheControl: response.headers.get('cache-control'),
  body: await response.json(),
})

const makeRequest = (url, options = {}) => new Request(url, options)

const installFetchMock = (handler) => {
  const originalFetch = globalThis.fetch
  const calls = []

  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options })
    return handler(url, options)
  }

  return {
    calls,
    restore: () => {
      globalThis.fetch = originalFetch
    },
  }
}

const makeFakeDb = () => {
  const statements = []

  return {
    statements,
    prepare(sql) {
      return {
        sql,
        bindings: [],
        bind(...bindings) {
          this.bindings = bindings
          return this
        },
        async run() {
          statements.push({ sql: this.sql, bindings: this.bindings })
          return { success: true }
        },
      }
    },
  }
}

const assertNoStore = (response) => {
  assert.equal(response.cacheControl, 'no-store', 'Media endpoint responses must disable caching')
}

const withoutConfig = await responseJson(
  await createSeedanceJob({
    request: makeRequest('https://herbalisti.com/api/media/seedance', { method: 'POST' }),
    env: {},
  }),
)
assert.equal(withoutConfig.status, 503, 'Seedance creation should fail closed without secrets')
assert.equal(withoutConfig.body.error, 'media_generation_not_configured')
assertNoStore(withoutConfig)

const statusWithoutConfig = await responseJson(
  await getSeedanceStatus({
    request: makeRequest('https://herbalisti.com/api/media/seedance-status?taskId=test'),
    env: {},
  }),
)
assert.equal(statusWithoutConfig.status, 503, 'Seedance status should fail closed without secrets')
assert.equal(statusWithoutConfig.body.error, 'media_generation_not_configured')
assertNoStore(statusWithoutConfig)

const unauthorizedCreateMock = installFetchMock(() => {
  throw new Error('Unauthorized requests must not reach Kie.ai')
})
try {
  const unauthorized = await responseJson(
    await createSeedanceJob({
      request: makeRequest('https://herbalisti.com/api/media/seedance', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt: 'A sufficiently long prompt for testing only.' }),
      }),
      env,
    }),
  )
  assert.equal(unauthorized.status, 401, 'Configured Seedance creation should reject missing admin token')
  assert.equal(unauthorized.body.error, 'unauthorized')
  assert.equal(unauthorizedCreateMock.calls.length, 0, 'Unauthorized creation must not call Kie.ai')
} finally {
  unauthorizedCreateMock.restore()
}

const invalidPromptMock = installFetchMock(() => {
  throw new Error('Invalid prompts must not reach Kie.ai')
})
try {
  const invalidPrompt = await responseJson(
    await createSeedanceJob({
      request: makeRequest('https://herbalisti.com/api/media/seedance', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-herbalisti-admin-token': env.MEDIA_ADMIN_TOKEN,
        },
        body: JSON.stringify({ prompt: 'too short' }),
      }),
      env,
    }),
  )
  assert.equal(invalidPrompt.status, 400, 'Seedance creation should validate prompt length')
  assert.equal(invalidPrompt.body.error, 'invalid_prompt')
  assert.equal(invalidPromptMock.calls.length, 0, 'Invalid prompt requests must not call Kie.ai')
} finally {
  invalidPromptMock.restore()
}

const fakeDb = makeFakeDb()
let submittedKiePayload
const createMock = installFetchMock(async (url, options) => {
  assert.equal(String(url), 'https://api.kie.ai/api/v1/jobs/createTask', 'Creation should use the Kie task endpoint')
  assert.equal(options.method, 'POST', 'Creation should POST to Kie.ai')
  assert.equal(options.headers.authorization, `Bearer ${env.KIE_API_KEY}`, 'Creation should use bearer auth')
  submittedKiePayload = JSON.parse(options.body)

  return Response.json({
    code: 200,
    msg: 'success',
    data: {
      task_id: 'kie-task-001',
    },
  })
})

try {
  const created = await responseJson(
    await createSeedanceJob({
      request: makeRequest('https://herbalisti.com/api/media/seedance', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${env.MEDIA_ADMIN_TOKEN}`,
        },
        body: JSON.stringify({
          model: 'unknown-model',
          prompt:
            'Create an eight second high-tech Zen wellness observatory loop with subtle botanical data interfaces.',
          duration: 99,
          resolution: '4k',
          aspectRatio: '2:1',
          generateAudio: true,
          returnLastFrame: true,
          firstFrameUrl: 'https://herbalisti.com/assets/herbalisti-hero.png',
          lastFrameUrl: 'http://insecure.example/last-frame.png',
          referenceImageUrls: [
            'https://herbalisti.com/assets/herbalisti-research.png',
            'http://insecure.example/reference.png',
          ],
          callBackUrl: 'https://herbalisti.com/api/media/callback',
        }),
      }),
      env: { ...env, HERBALISTI_DB: fakeDb },
    }),
  )

  assert.equal(created.status, 200, 'Authorized Seedance creation should return success')
  assert.equal(created.body.provider, 'kie.ai')
  assert.equal(created.body.taskId, 'kie-task-001', 'Task id should be extracted from Kie task_id')
  assert.equal(createMock.calls.length, 1, 'Authorized creation should call Kie.ai exactly once')

  assert.equal(submittedKiePayload.model, 'bytedance/seedance-2-fast', 'Unknown models should default to fast Seedance')
  assert.equal(submittedKiePayload.input.resolution, '720p', 'Unknown resolution should default to 720p')
  assert.equal(submittedKiePayload.input.duration, 8, 'Out-of-range duration should default to 8 seconds')
  assert.equal(submittedKiePayload.input.aspect_ratio, '16:9', 'Unknown aspect ratio should default to 16:9')
  assert.equal(submittedKiePayload.input.web_search, false, 'Seedance jobs must not enable provider web search')
  assert.equal(submittedKiePayload.input.generate_audio, true, 'generateAudio should map to generate_audio')
  assert.equal(submittedKiePayload.input.return_last_frame, true, 'returnLastFrame should map to return_last_frame')
  assert.equal(
    submittedKiePayload.input.first_frame_url,
    'https://herbalisti.com/assets/herbalisti-hero.png',
    'HTTPS first-frame references should be accepted',
  )
  assert.equal(
    submittedKiePayload.input.last_frame_url,
    undefined,
    'Insecure last-frame references should be discarded',
  )
  assert.deepEqual(
    submittedKiePayload.input.reference_image_urls,
    ['https://herbalisti.com/assets/herbalisti-research.png'],
    'Reference-image URLs should be HTTPS-only',
  )
  assert.equal(
    submittedKiePayload.callBackUrl,
    'https://herbalisti.com/api/media/callback',
    'HTTPS callback URL should pass through',
  )

  assert.equal(fakeDb.statements.length, 1, 'Successful creation should persist one media job row')
  assert.match(fakeDb.statements[0].sql, /INSERT OR REPLACE INTO media_jobs/, 'Creation should insert a media job')
  assert.equal(fakeDb.statements[0].bindings[0], 'kie-task-001', 'Media job id should use the provider task id')
  assert.equal(fakeDb.statements[0].bindings[1], 'bytedance/seedance-2-fast')
  assert.equal(fakeDb.statements[0].bindings[4], 'kie-task-001')
} finally {
  createMock.restore()
}

const statusUnauthorizedMock = installFetchMock(() => {
  throw new Error('Unauthorized status requests must not reach Kie.ai')
})
try {
  const unauthorizedStatus = await responseJson(
    await getSeedanceStatus({
      request: makeRequest('https://herbalisti.com/api/media/seedance-status?taskId=kie-task-001'),
      env,
    }),
  )
  assert.equal(unauthorizedStatus.status, 401, 'Configured Seedance status should reject missing admin token')
  assert.equal(statusUnauthorizedMock.calls.length, 0, 'Unauthorized status must not call Kie.ai')
} finally {
  statusUnauthorizedMock.restore()
}

const missingTask = await responseJson(
  await getSeedanceStatus({
    request: makeRequest('https://herbalisti.com/api/media/seedance-status', {
      headers: { 'x-herbalisti-admin-token': env.MEDIA_ADMIN_TOKEN },
    }),
    env,
  }),
)
assert.equal(missingTask.status, 400, 'Seedance status should require a taskId')
assert.equal(missingTask.body.error, 'missing_task_id')

const statusDb = makeFakeDb()
let statusRequestUrl
const statusMock = installFetchMock(async (url, options) => {
  statusRequestUrl = new URL(String(url))
  assert.equal(options.headers.authorization, `Bearer ${env.KIE_API_KEY}`, 'Status lookup should use bearer auth')

  return Response.json({
    code: 200,
    msg: 'success',
    data: {
      taskId: 'kie-task-001',
      state: 'success',
      resultJson: JSON.stringify({
        resultUrls: ['https://provider.example/herbalisti-hero-loop.mp4'],
      }),
    },
  })
})

try {
  const status = await responseJson(
    await getSeedanceStatus({
      request: makeRequest('https://herbalisti.com/api/media/seedance-status?taskId=kie-task-001', {
        headers: { 'x-herbalisti-admin-token': env.MEDIA_ADMIN_TOKEN },
      }),
      env: { ...env, HERBALISTI_DB: statusDb },
    }),
  )

  assert.equal(status.status, 200, 'Authorized Seedance status lookup should return success')
  assert.equal(status.body.status, 'success')
  assert.equal(statusRequestUrl.searchParams.get('taskId'), 'kie-task-001', 'Status lookup should pass taskId to Kie.ai')
  assert.equal(statusDb.statements.length, 1, 'Successful status lookup should update one media job row')
  assert.match(statusDb.statements[0].sql, /UPDATE media_jobs/, 'Status lookup should update media_jobs')
  assert.deepEqual(
    statusDb.statements[0].bindings,
    ['success', 'https://provider.example/herbalisti-hero-loop.mp4', 'kie-task-001'],
    'Status lookup should persist parsed resultJson URL',
  )
} finally {
  statusMock.restore()
}

assert.equal(
  extractKieTaskId({ data: { taskId: 'camel-case' } }),
  'camel-case',
  'Task id helper should accept taskId',
)
assert.equal(
  extractKieTaskId({ data: { task_id: 'snake-case' } }),
  'snake-case',
  'Task id helper should accept task_id',
)
assert.equal(
  extractKieResultUrl({ data: { resultJson: '{"resultUrls":["https://example.com/video.mp4"]}' } }),
  'https://example.com/video.mp4',
  'Result URL helper should parse Kie resultJson',
)

console.log(
  JSON.stringify(
    {
      status: 'pass',
      checked: {
        failClosedWithoutSecrets: true,
        rejectsUnauthorizedRequests: true,
        validatesPromptsBeforeProviderCall: true,
        sanitizesSeedancePayload: true,
        persistsCreatedMediaJob: true,
        parsesResultJsonUrl: true,
        updatesMediaJobStatus: true,
        mockedProviderCalls: createMock.calls.length + statusMock.calls.length,
        realExternalCallsMade: 0,
      },
    },
    null,
    2,
  ),
)
