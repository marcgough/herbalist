import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  authorizedByAdminToken,
  extractBearerToken,
  timingSafeTokenEqual,
} from '../functions/_lib/admin-auth.js'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (path) => readFileSync(resolve(root, path), 'utf8')
const token = 'local-admin-verifier'
const wrongToken = 'local-admin-verifier-wrong'

const makeRequest = (headers = {}) => new Request('https://herbalisti.local/protected', { headers })

assert.equal(
  extractBearerToken(makeRequest({ authorization: `Bearer ${token}` })),
  token,
  'Bearer token should be extracted from Authorization header',
)
assert.equal(
  extractBearerToken(makeRequest({ authorization: `bearer ${token}` })),
  token,
  'Bearer token extraction should be case-insensitive',
)
assert.equal(
  extractBearerToken(makeRequest({ authorization: `Basic ${token}` })),
  undefined,
  'Non-bearer Authorization headers should not be treated as admin tokens',
)

assert.equal(await timingSafeTokenEqual(token, token), true, 'Matching tokens should pass')
assert.equal(await timingSafeTokenEqual(wrongToken, token), false, 'Different tokens should fail')
assert.equal(await timingSafeTokenEqual(`${token}-suffix`, token), false, 'Suffix tokens should fail')
assert.equal(await timingSafeTokenEqual(token.slice(0, -2), token), false, 'Partial tokens should fail')
assert.equal(await timingSafeTokenEqual('', token), false, 'Empty candidate token should fail')
assert.equal(await timingSafeTokenEqual(token, ''), false, 'Empty configured token should fail')

assert.equal(
  await authorizedByAdminToken(makeRequest({ authorization: `Bearer ${token}` }), token),
  true,
  'Bearer admin token should authorize protected endpoints',
)
assert.equal(
  await authorizedByAdminToken(makeRequest({ 'x-herbalisti-admin-token': token }), token),
  true,
  'Default admin header should authorize protected endpoints',
)
assert.equal(
  await authorizedByAdminToken(
    makeRequest({ 'x-herbalisti-feed-token': token }),
    token,
    { headerName: 'x-herbalisti-feed-token' },
  ),
  true,
  'Feed refresh header should authorize the scheduled news Worker',
)
assert.equal(
  await authorizedByAdminToken(makeRequest({ authorization: `Bearer ${wrongToken}` }), token),
  false,
  'Wrong bearer token should not authorize protected endpoints',
)
assert.equal(
  await authorizedByAdminToken(makeRequest({ 'x-herbalisti-admin-token': wrongToken }), token),
  false,
  'Wrong admin header token should not authorize protected endpoints',
)
assert.equal(
  await authorizedByAdminToken(makeRequest({ authorization: `Bearer ${token}` }), undefined),
  false,
  'Missing configured token should fail closed',
)

const helper = read('functions/_lib/admin-auth.js')
const newsWorker = read('workers/news-refresh.js')
const seedanceCreate = read('functions/api/media/seedance.js')
const seedanceStatus = read('functions/api/media/seedance-status.js')

assert(helper.includes("digest('SHA-256'"), 'Admin auth helper should hash tokens to fixed-size digests')
assert(
  helper.includes('crypto.subtle.timingSafeEqual'),
  'Admin auth helper should use Cloudflare native timing-safe comparison when available',
)
assert(
  helper.includes('fixedLengthByteEqual'),
  'Admin auth helper should include a fixed-length local fallback for Node verification',
)
assert(
  newsWorker.includes("from '../functions/_lib/admin-auth.js'"),
  'News Worker should import the shared admin auth helper',
)
assert(
  seedanceCreate.includes("from '../../_lib/admin-auth.js'"),
  'Seedance creation endpoint should import the shared admin auth helper',
)
assert(
  seedanceStatus.includes("from '../../_lib/admin-auth.js'"),
  'Seedance status endpoint should import the shared admin auth helper',
)

const combinedRuntime = [newsWorker, seedanceCreate, seedanceStatus].join('\n')
assert(!combinedRuntime.includes('=== env.FEED_ADMIN_TOKEN'), 'News Worker should not directly compare feed token strings')
assert(!combinedRuntime.includes('=== configuredToken'), 'Media endpoints should not directly compare admin token strings')
assert(!combinedRuntime.includes('replace(/^Bearer\\s+/i'), 'Protected endpoints should not parse bearer tokens ad hoc')

console.log(
  JSON.stringify(
    {
      status: 'pass',
      checked: {
        bearerExtraction: true,
        defaultHeaderAuthorization: true,
        feedHeaderAuthorization: true,
        wrongTokensRejected: true,
        partialTokensRejected: true,
        missingConfiguredTokenFailsClosed: true,
        directRuntimeComparisonsRemoved: true,
        cloudflareTimingSafeEqualReferenced: true,
      },
    },
    null,
    2,
  ),
)
