import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { createServer } from 'node:http'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const readJson = (path) => JSON.parse(read(path))
const exists = (path) => existsSync(resolve(root, path))
const secretValuePattern =
  /(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]+|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i

const packageJson = readJson('package.json')
const contract = readJson('docs/production-environment-contract.json')
const externalActions = readJson('docs/external-launch-actions.json')
const workflow = read('.github/workflows/production-deploy.yml')
const scriptSource = read('scripts/seed-production-feed.mjs')
const dryRunEvidencePath = '.tmp/verify-production-feed-seed/feed-seed-evidence.json'
const loopbackEvidencePath = '.tmp/verify-production-feed-seed/loopback-feed-seed-evidence.json'
const loopbackTokenEnvName = 'VERIFY_FEED_ADMIN_TOKEN'
const loopbackToken = 'local-feed-seed-verifier-token'

assert(exists('scripts/seed-production-feed.mjs'), 'Production feed seed command should exist')
assert(packageJson.scripts?.['seed:production-feed'], 'package.json should expose seed:production-feed')
assert(packageJson.scripts?.['verify:production-feed-seed'], 'package.json should expose verify:production-feed-seed')
assert(
  contract.commands.safePreflight.includes('npm run verify:production-feed-seed'),
  'Safe preflight should include production feed seed verification',
)
assert(
  contract.commands.seedProductionFeed?.includes(
    'npm run seed:production-feed -- --base-url https://herbalisti.com --confirm seed-herbalisti-feed',
  ),
  'Production contract should expose the canonical feed seed command',
)
assert(
  externalActions.localAllowedActions?.some((action) => action.id === 'verify-production-feed-seed'),
  'External action checklist should include the local feed seed verifier',
)
const seedAction = externalActions.approvalRequiredActions?.find((action) => action.id === 'seed-production-feed')
assert(seedAction?.approvalRequired === true, 'Production feed seed action should require approval')
assert(seedAction?.requiredForLaunch === true, 'Production feed seed action should be launch-required for manual launch freshness proof')
assert(seedAction?.secretNames?.includes('FEED_ADMIN_TOKEN'), 'Production feed seed action should name FEED_ADMIN_TOKEN')
assert(
  seedAction?.command === contract.commands.seedProductionFeed[0],
  'Production feed seed action should use the contract command',
)
assert(
  workflow.includes('npm run seed:production-feed -- --base-url https://herbalisti.com --confirm seed-herbalisti-feed'),
  'Production deploy workflow should use the shared feed seed command',
)
assert(scriptSource.includes('seed-herbalisti-feed'), 'Feed seed command should require an exact confirmation phrase')
assert(scriptSource.includes('--dry-run'), 'Feed seed command should provide a dry-run mode')
assert(scriptSource.includes('--evidence-path'), 'Feed seed command should provide a sanitized evidence output mode')
assert(scriptSource.includes('authorization'), 'Feed seed command should send authorization only at request time')
assert(!secretValuePattern.test(scriptSource), 'Feed seed command must not contain literal secret values')
assert(
  workflow.includes(
    '--evidence-path output/production-deploy/feed-seed-evidence.json',
  ),
  'Production deploy workflow should preserve sanitized feed seed evidence in the deployment artifact directory',
)

rmSync(resolve(root, '.tmp/verify-production-feed-seed'), { recursive: true, force: true })

const missingConfirm = spawnSync(process.execPath, ['scripts/seed-production-feed.mjs', '--dry-run'], {
  cwd: root,
  encoding: 'utf8',
})
assert.notEqual(missingConfirm.status, 0, 'Feed seed dry-run should fail without exact confirmation')
assert(missingConfirm.stderr.includes('Confirmation required'), 'Missing confirmation error should be explicit')

const dryRun = spawnSync(
  process.execPath,
  [
    'scripts/seed-production-feed.mjs',
    '--dry-run',
    '--base-url',
    'https://herbalisti.com',
    '--confirm',
    'seed-herbalisti-feed',
    '--evidence-path',
    dryRunEvidencePath,
  ],
  {
    cwd: root,
    encoding: 'utf8',
  },
)
assert.equal(dryRun.status, 0, `Feed seed dry-run should pass\n${dryRun.stderr}`)
const dryRunPayload = JSON.parse(dryRun.stdout)
assert.equal(dryRunPayload.status, 'dry-run', 'Feed seed dry-run should report dry-run status')
assert.equal(dryRunPayload.endpoint, 'https://herbalisti.com/api/feed-refresh', 'Feed seed dry-run should target the protected feed-refresh endpoint')
assert.equal(dryRunPayload.wouldSendAuthorizationHeader, true, 'Feed seed dry-run should document authorization behavior')
assert.equal(dryRunPayload.evidencePath, dryRunEvidencePath, 'Feed seed dry-run should report the evidence path')
assert(!secretValuePattern.test(dryRun.stdout), 'Feed seed dry-run output must not contain secret-looking values')
assert(exists(dryRunEvidencePath), 'Feed seed dry-run should write sanitized evidence when requested')
const dryRunEvidence = readJson(dryRunEvidencePath)
assert.equal(dryRunEvidence.status, 'dry-run', 'Feed seed evidence should preserve dry-run status')
assert.equal(
  dryRunEvidence.endpoint,
  'https://herbalisti.com/api/feed-refresh',
  'Feed seed evidence should preserve the endpoint',
)
assert(!secretValuePattern.test(read(dryRunEvidencePath)), 'Feed seed evidence must not contain secret-looking values')
assert(!read(dryRunEvidencePath).includes(loopbackToken), 'Dry-run evidence should not contain the loopback token')

const spawnAsync = (command, commandArgs, options = {}) =>
  new Promise((resolveCommand) => {
    const child = spawn(command, commandArgs, {
      ...options,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    const timeout = setTimeout(() => {
      child.kill('SIGKILL')
    }, 20000)

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })
    child.on('error', (error) => {
      clearTimeout(timeout)
      resolveCommand({
        status: null,
        signal: null,
        error,
        stdout,
        stderr,
      })
    })
    child.on('close', (status, signal) => {
      clearTimeout(timeout)
      resolveCommand({
        status,
        signal,
        error: null,
        stdout,
        stderr,
      })
    })
  })

const runLoopbackServer = async () => {
  const requests = []
  const server = createServer((request, response) => {
    const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1')
    requests.push({
      method: request.method,
      path: requestUrl.pathname,
      authorization: request.headers.authorization ?? '',
      accept: request.headers.accept ?? '',
    })

    if (request.method !== 'POST' || requestUrl.pathname !== '/api/feed-refresh') {
      response.writeHead(404, { 'content-type': 'application/json' })
      response.end(JSON.stringify({ error: 'not_found' }))
      return
    }

    if (request.headers.authorization !== `Bearer ${loopbackToken}`) {
      response.writeHead(401, { 'content-type': 'application/json' })
      response.end(JSON.stringify({ error: 'unauthorized' }))
      return
    }

    response.writeHead(200, { 'content-type': 'application/json' })
    response.end(
      JSON.stringify({
        generatedAt: '2026-07-02T00:00:00.000Z',
        itemCount: 24,
        persisted: 24,
        refreshRun: {
          status: 'completed',
          triggerType: 'pages-manual',
          itemCount: 24,
          startedAt: '2026-07-02T00:00:00.000Z',
          finishedAt: '2026-07-02T00:00:01.000Z',
        },
      }),
    )
  })

  await new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen)
    server.listen(0, '127.0.0.1', resolveListen)
  })

  const address = server.address()
  assert(address && typeof address === 'object', 'Loopback server should expose a port')

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    requests,
    close: () =>
      new Promise((resolveClose, rejectClose) => {
        server.closeAllConnections?.()
        server.close((error) => {
          if (error) {
            rejectClose(error)
          } else {
            resolveClose()
          }
        })
      }),
  }
}

const loopbackServer = await runLoopbackServer()
let loopbackPayload

try {
  const loopbackRun = await spawnAsync(
    process.execPath,
    [
      'scripts/seed-production-feed.mjs',
      '--base-url',
      loopbackServer.baseUrl,
      '--confirm',
      'seed-herbalisti-feed',
      '--token-env',
      loopbackTokenEnvName,
      '--evidence-path',
      loopbackEvidencePath,
    ],
    {
      cwd: root,
      env: {
        ...process.env,
        [loopbackTokenEnvName]: loopbackToken,
      },
    },
  )

  assert.equal(
    loopbackRun.status,
    0,
    `Feed seed loopback request should pass\n${loopbackRun.error?.message ?? ''}\n${loopbackRun.stderr}`,
  )
  loopbackPayload = JSON.parse(loopbackRun.stdout)
  assert.equal(loopbackPayload.status, 'pass', 'Feed seed loopback run should report pass status')
  assert.equal(loopbackPayload.baseUrl, loopbackServer.baseUrl, 'Feed seed loopback run should preserve base URL')
  assert.equal(loopbackPayload.endpoint, `${loopbackServer.baseUrl}/api/feed-refresh`, 'Feed seed loopback run should target feed-refresh')
  assert.equal(loopbackPayload.itemCount, 24, 'Feed seed loopback run should preserve item count')
  assert.equal(loopbackPayload.persisted, 24, 'Feed seed loopback run should preserve persisted count')
  assert.equal(loopbackPayload.refreshRun.status, 'completed', 'Feed seed loopback run should preserve refresh status')
  assert.equal(loopbackPayload.refreshRun.triggerType, 'pages-manual', 'Feed seed loopback run should preserve trigger type')
  assert.equal(loopbackPayload.evidencePath, loopbackEvidencePath, 'Feed seed loopback run should report evidence path')
  assert(!loopbackRun.stdout.includes(loopbackToken), 'Feed seed loopback output must not print the token value')
  assert(!secretValuePattern.test(loopbackRun.stdout), 'Feed seed loopback output must not contain secret-looking values')

  assert.equal(loopbackServer.requests.length, 1, 'Feed seed loopback should make exactly one protected request')
  assert.equal(loopbackServer.requests[0].method, 'POST', 'Feed seed loopback should use POST')
  assert.equal(loopbackServer.requests[0].path, '/api/feed-refresh', 'Feed seed loopback should hit /api/feed-refresh')
  assert.equal(
    loopbackServer.requests[0].authorization,
    `Bearer ${loopbackToken}`,
    'Feed seed loopback should send the configured bearer token only to the request',
  )
  assert.equal(loopbackServer.requests[0].accept, 'application/json', 'Feed seed loopback should request JSON')

  assert(exists(loopbackEvidencePath), 'Feed seed loopback should write sanitized pass evidence when requested')
  const loopbackEvidenceText = read(loopbackEvidencePath)
  const loopbackEvidence = JSON.parse(loopbackEvidenceText)
  assert.equal(loopbackEvidence.status, 'pass', 'Feed seed loopback evidence should preserve pass status')
  assert.equal(loopbackEvidence.refreshRun.status, 'completed', 'Feed seed loopback evidence should preserve refresh status')
  assert.equal(loopbackEvidence.refreshRun.triggerType, 'pages-manual', 'Feed seed loopback evidence should preserve trigger type')
  assert(!loopbackEvidenceText.includes(loopbackToken), 'Feed seed loopback evidence must not contain the token value')
  assert(!secretValuePattern.test(loopbackEvidenceText), 'Feed seed loopback evidence must not contain secret-looking values')
} finally {
  await loopbackServer.close()
}

rmSync(resolve(root, '.tmp/verify-production-feed-seed'), { recursive: true, force: true })

console.log(
  JSON.stringify(
    {
      status: 'pass',
      command: packageJson.scripts['seed:production-feed'],
      dryRunEndpoint: dryRunPayload.endpoint,
      dryRunEvidencePath,
      loopbackEndpoint: loopbackPayload.endpoint,
      loopbackEvidencePath,
      approvalAction: seedAction.id,
      safeToRun:
        'This verifier reads local files, runs the feed seed command in dry-run mode, and exercises one loopback-only POST against a temporary local server. It does not call external networks, deploy, mutate DNS, create resources, set secrets, call paid APIs, or print secret values.',
    },
    null,
    2,
  ),
)
