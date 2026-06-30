const args = process.argv.slice(2)

const valueAfter = (name) => {
  const index = args.indexOf(name)
  if (index === -1) {
    return ''
  }
  return args[index + 1] ?? ''
}

const hasFlag = (name) => args.includes(name)
const confirm = valueAfter('--confirm')
const baseUrlInput = valueAfter('--base-url') || 'https://herbalisti.com'
const tokenEnvName = valueAfter('--token-env') || 'FEED_ADMIN_TOKEN'
const dryRun = hasFlag('--dry-run')
const expectedConfirmation = 'seed-herbalisti-feed'

const allowedLocalHosts = new Set(['localhost', '127.0.0.1', '::1'])

const fail = (message) => {
  console.error(message)
  process.exit(1)
}

if (confirm !== expectedConfirmation) {
  fail(`Confirmation required. Re-run with --confirm ${expectedConfirmation}.`)
}

let baseUrl
try {
  baseUrl = new URL(baseUrlInput)
} catch {
  fail('--base-url must be a valid URL.')
}

if (baseUrl.protocol !== 'https:' && !allowedLocalHosts.has(baseUrl.hostname)) {
  fail('--base-url must use https unless it targets localhost for local verification.')
}

const endpoint = new URL('/api/feed-refresh', baseUrl)
const token = process.env[tokenEnvName]?.trim() ?? ''

if (!dryRun && !token) {
  fail(`${tokenEnvName} is required in the environment. The value must not be printed or committed.`)
}

const summarizePayload = (payload) => ({
  generatedAt: payload.generatedAt ?? null,
  itemCount: Number(payload.itemCount ?? 0),
  persisted: Number(payload.persisted ?? 0),
  refreshRun: payload.refreshRun
    ? {
        status: payload.refreshRun.status ?? null,
        triggerType: payload.refreshRun.triggerType ?? null,
        itemCount: Number(payload.refreshRun.itemCount ?? payload.itemCount ?? 0),
        startedAt: payload.refreshRun.startedAt ?? null,
        finishedAt: payload.refreshRun.finishedAt ?? null,
      }
    : null,
})

if (dryRun) {
  console.log(
    JSON.stringify(
      {
        status: 'dry-run',
        baseUrl: baseUrl.origin,
        endpoint: endpoint.href,
        confirmation: confirm,
        tokenEnvName,
        wouldSendAuthorizationHeader: true,
        externalEffect:
          'Would POST to the protected production feed-refresh endpoint and write a feed refresh run into the bound production D1 database.',
        safeToRun:
          'Dry run validates arguments only. It does not call the network, deploy, mutate DNS, create resources, set secrets, call paid APIs, or print secret values.',
      },
      null,
      2,
    ),
  )
  process.exit(0)
}

const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    accept: 'application/json',
    authorization: `Bearer ${token}`,
  },
})

let payload
try {
  payload = await response.json()
} catch {
  fail(`Feed refresh returned non-JSON response with status ${response.status}.`)
}

if (!response.ok) {
  fail(`Feed refresh request failed with status ${response.status} and code ${payload.error ?? 'unknown'}.`)
}

const summary = summarizePayload(payload)
const completed = ['completed', 'completed_with_warnings'].includes(summary.refreshRun?.status)
if (!completed || summary.itemCount < 1) {
  fail('Feed refresh did not complete with at least one item.')
}

console.log(
  JSON.stringify(
    {
      status: 'pass',
      baseUrl: baseUrl.origin,
      endpoint: endpoint.href,
      ...summary,
      safeToRun:
        'This command posts to the protected feed-refresh endpoint and prints only sanitized response metadata. It does not deploy, mutate DNS, create resources, set secrets, call paid media APIs, or print secret values.',
    },
    null,
    2,
  ),
)
