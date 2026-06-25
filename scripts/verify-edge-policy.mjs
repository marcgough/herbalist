import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

const read = (path) => readFileSync(resolve(root, path), 'utf8')

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const headers = read('public/_headers')
const redirects = read('public/_redirects')
const app = read('src/App.tsx')

const requiredHeaderSnippets = [
  'X-Content-Type-Options: nosniff',
  'Referrer-Policy: strict-origin-when-cross-origin',
  'X-Frame-Options: DENY',
  'Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  "default-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  '/assets/*',
  'Cache-Control: public, max-age=31536000, immutable',
  '/data/*',
  'Cache-Control: public, max-age=300, s-maxage=3600',
  '/opensearch.xml',
]

for (const snippet of requiredHeaderSnippets) {
  assert(headers.includes(snippet), `public/_headers is missing: ${snippet}`)
}

assert(!headers.includes("'unsafe-inline'"), 'Content Security Policy should not allow unsafe inline styles/scripts')
assert(!headers.includes('http:'), 'Edge headers should not allow broad insecure origins')
assert(!/\bstyle=\{\{/.test(app), 'React app should avoid inline style objects under the strict CSP')

const requiredRedirects = [
  'https://www.herbalisti.com/* https://herbalisti.com/:splat 301',
  'http://herbalisti.com/* https://herbalisti.com/:splat 301',
  'http://www.herbalisti.com/* https://herbalisti.com/:splat 301',
]

for (const redirect of requiredRedirects) {
  assert(redirects.includes(redirect), `public/_redirects is missing: ${redirect}`)
}

console.log(
  JSON.stringify(
    {
      status: 'pass',
      headers: {
        csp: 'strict self-hosted policy',
        cacheRules: ['assets immutable', 'data short-lived', 'opensearch hourly'],
        securityHeaders: ['nosniff', 'referrer-policy', 'frame-deny', 'permissions-policy'],
      },
      redirects: requiredRedirects.length,
      inlineStyleObjects: 0,
    },
    null,
    2,
  ),
)
