import { resolve4, resolve6, resolveCname, resolveNs } from 'node:dns/promises'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const contract = JSON.parse(readFileSync(resolve(root, 'docs/production-environment-contract.json'), 'utf8'))

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const timeoutMs = Number(process.env.HERBALISTI_VERIFY_TIMEOUT_MS ?? 10000)
const domain = contract.project.domain

const withTimeout = async (promiseFactory, label) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await promiseFactory(controller.signal)
  } catch (error) {
    return {
      ok: false,
      label,
      error: error.message,
    }
  } finally {
    clearTimeout(timeout)
  }
}

const resolveRecord = async (label, resolver) => {
  try {
    const records = await resolver(domain)
    return { ok: records.length > 0, records }
  } catch (error) {
    return { ok: false, records: [], error: error.code ?? error.message }
  }
}

const fetchProbe = async (label, url, { redirect = 'manual', accept = '*/*' } = {}) =>
  withTimeout(async (signal) => {
    const response = await fetch(url, {
      redirect,
      headers: {
        accept,
        'user-agent': 'Herbalisti live readiness verifier',
      },
      signal,
    })

    return {
      ok: response.ok,
      label,
      url,
      status: response.status,
      redirected: response.redirected,
      location: response.headers.get('location'),
      contentType: response.headers.get('content-type'),
      cacheControl: response.headers.get('cache-control'),
      server: response.headers.get('server'),
      cfRay: response.headers.get('cf-ray'),
    }
  }, label)

const readJsonProbe = async (label, url) =>
  withTimeout(async (signal) => {
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        'user-agent': 'Herbalisti live readiness verifier',
      },
      signal,
    })
    const contentType = response.headers.get('content-type') ?? ''
    let body = null
    let parseError = ''

    if (contentType.includes('json')) {
      try {
        body = await response.json()
      } catch (error) {
        parseError = error.message
      }
    }

    return {
      ok: response.ok && body?.status === 'ok' && body?.domain === domain,
      label,
      url,
      status: response.status,
      contentType,
      cacheControl: response.headers.get('cache-control'),
      cfRay: response.headers.get('cf-ray'),
      healthStatus: body?.status ?? null,
      healthDomain: body?.domain ?? null,
      d1Bound: body?.bindings?.d1 ?? null,
      r2MediaBound: body?.bindings?.r2Media ?? null,
      protectedFeatures: body?.protectedFeatures ?? null,
      latestFeedRefresh: body?.feed?.latestRefresh ?? null,
      parseError: parseError || null,
    }
  }, label)

const [aRecords, aaaaRecords, cnameRecords, nsRecords] = await Promise.all([
  resolveRecord('A', resolve4),
  resolveRecord('AAAA', resolve6),
  resolveRecord('CNAME', resolveCname),
  resolveRecord('NS', resolveNs),
])

const httpsHomepage = await fetchProbe('HTTPS homepage', `https://${domain}/`)
const httpRedirect = await fetchProbe('HTTP canonical redirect', `http://${domain}/`)
const wwwRedirect = await fetchProbe('WWW canonical redirect', `https://www.${domain}/`)
const health = await readJsonProbe('Health API', `https://${domain}/api/health`)
const feedRefreshFreshness = (() => {
  const latest = health.latestFeedRefresh
  const finishedAt = latest?.finishedAt ? Date.parse(latest.finishedAt) : NaN
  const ageHours = Number.isFinite(finishedAt) ? (Date.now() - finishedAt) / 36e5 : Infinity

  return {
    completed: ['completed', 'completed_with_warnings'].includes(latest?.status),
    hasItems: Number(latest?.itemCount ?? 0) > 0,
    ageHours: Number.isFinite(ageHours) ? Number(ageHours.toFixed(2)) : null,
    maxAgeHours: 8,
    fresh: Number.isFinite(ageHours) && ageHours <= 8,
  }
})()
const requiredProductionBindings = {
  d1: health.d1Bound === true,
}
const requiredProtectedFeatures = {
  feedRefresh: health.protectedFeatures?.feedRefresh === 'configured',
}
const optionalProtectedFeatures = {
  seedanceMediaJobs: health.protectedFeatures?.seedanceMediaJobs === 'configured',
}
const requiredFeedState = {
  latestRefreshCompleted: feedRefreshFreshness.completed,
  latestRefreshHasItems: feedRefreshFreshness.hasItems,
  latestRefreshFresh: feedRefreshFreshness.fresh,
}

const redirectTargets = {
  httpToHttps: httpRedirect.status >= 300 && httpRedirect.status < 400 && httpRedirect.location?.startsWith(`https://${domain}`),
  wwwToApex: wwwRedirect.status >= 300 && wwwRedirect.status < 400 && wwwRedirect.location?.startsWith(`https://${domain}`),
}

const ready =
  (aRecords.ok || aaaaRecords.ok || cnameRecords.ok) &&
  httpsHomepage.ok &&
  redirectTargets.httpToHttps &&
  health.ok &&
  requiredProductionBindings.d1 &&
  requiredProtectedFeatures.feedRefresh &&
  requiredFeedState.latestRefreshCompleted &&
  requiredFeedState.latestRefreshHasItems &&
  requiredFeedState.latestRefreshFresh

const result = {
  status: ready ? 'ready-for-production-verification' : 'not-ready',
  strict,
  safeToRun:
    'Read-only live-domain probe. It does not deploy, mutate DNS, create resources, call paid APIs, upload files, or print secret values.',
  generatedAt: new Date().toISOString(),
  domain,
  dns: {
    a: aRecords,
    aaaa: aaaaRecords,
    cname: cnameRecords,
    ns: nsRecords,
  },
  http: {
    httpsHomepage,
    httpRedirect,
    wwwRedirect,
    redirectTargets,
    health,
      requiredProductionBindings,
      requiredProtectedFeatures,
      optionalProtectedFeatures,
      requiredFeedState,
      feedRefreshFreshness,
    },
  nextActions: ready
    ? [
        'Run npm run verify:production -- https://herbalisti.com.',
        'Run npm run verify:goal-readiness -- --strict after production verification passes.',
      ]
    : [
        'Connect herbalisti.com as a Cloudflare Pages custom domain.',
        'Confirm DNS is active for the apex domain.',
        'Confirm the HERBALISTI_DB D1 binding is active in production.',
        'Confirm FEED_ADMIN_TOKEN is set as a Cloudflare Pages secret for the protected feed-refresh endpoint.',
        'Leave KIE_API_KEY and MEDIA_ADMIN_TOKEN disabled until approved Seedance generation is needed.',
        'Run the protected POST /api/feed-refresh path or wait for the scheduled Worker until /api/health reports a fresh completed feed refresh.',
        'Deploy Cloudflare Pages and the scheduled news Worker.',
        'Run npm run verify:live-readiness again.',
      ],
}

console.log(JSON.stringify(result, null, 2))

if (strict && !ready) {
  process.exitCode = 1
}
