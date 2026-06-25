import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const readJson = (path) => JSON.parse(read(path))
const exists = (path) => existsSync(resolve(root, path))
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const apiCatalog = readJson('public/data/api-catalog.json')
const discovery = readJson('public/data/discovery-metadata.json')
const packageJson = readJson('package.json')
const appSource = read('src/App.tsx')
const healthSource = read('functions/api/health.js')
const sitemap = read('public/sitemap.xml')
const releaseVerifier = read('scripts/verify-release.mjs')
const productionVerifier = read('scripts/verify-production.mjs')
const launchVerifier = read('scripts/verify-launch-config.mjs')
const productionContractVerifier = read('scripts/verify-production-contract.mjs')

const functionFilesByEndpoint = {
  health: 'functions/api/health.js',
  books: 'functions/api/books.js',
  'herbal-knowledge': 'functions/api/herbal-knowledge.js',
  'herbal-chat': 'functions/api/herbal-chat.js',
  'citation-notes': 'functions/api/citation-notes.js',
  remedies: 'functions/api/remedies.js',
  graph: 'functions/api/graph.js',
  search: 'functions/api/search.js',
  sources: 'functions/api/sources.js',
  'source-health': 'functions/api/source-health.js',
  'signal-intelligence': 'functions/api/signal-intelligence.js',
  'feed-status': 'functions/api/feed-status.js',
  news: 'functions/api/news.js',
  'signals-rss': 'functions/api/signals.xml.js',
  'seedance-create': 'functions/api/media/seedance.js',
  'seedance-status': 'functions/api/media/seedance-status.js',
}

const requiredPublicEndpoints = [
  'health',
  'books',
  'herbal-knowledge',
  'herbal-chat',
  'citation-notes',
  'remedies',
  'graph',
  'search',
  'sources',
  'source-health',
  'signal-intelligence',
  'feed-status',
  'news',
  'signals-rss',
]

const requiredProtectedEndpoints = ['seedance-create', 'seedance-status']
const secretNamePattern = /\b(CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID|FEED_ADMIN_TOKEN|KIE_API_KEY|MEDIA_ADMIN_TOKEN|OPENAI_API_KEY)\b/

assert(exists('public/data/api-catalog.json'), 'API catalog public export is missing')
assert(apiCatalog.name === 'Herbalisti public API catalog', 'API catalog name is incorrect')
assert(apiCatalog.source === 'static-export-api-catalog', 'API catalog source is incorrect')
assert(apiCatalog.version === '2026-06-16', 'API catalog version should match launch data version')
assert(apiCatalog.canonicalUrl === 'https://herbalisti.com/data/api-catalog.json', 'API catalog canonical URL is incorrect')
assert(apiCatalog.apiBaseUrl === 'https://herbalisti.com', 'API catalog API base URL is incorrect')
assert(apiCatalog.policy?.includes('Machine-readable endpoint catalog'), 'API catalog policy should describe its purpose')
assert(Array.isArray(apiCatalog.endpoints), 'API catalog should expose endpoints')
assert(apiCatalog.endpointCount === apiCatalog.endpoints.length, 'API catalog endpoint count should match endpoints length')
assert(apiCatalog.endpointCount === requiredPublicEndpoints.length + requiredProtectedEndpoints.length, 'API catalog endpoint count is incomplete')
assert(apiCatalog.publicEndpointCount === requiredPublicEndpoints.length, 'API catalog public endpoint count is incorrect')
assert(apiCatalog.protectedEndpointCount === requiredProtectedEndpoints.length, 'API catalog protected endpoint count is incorrect')
assert(apiCatalog.boundaries?.medicalAdvice === 'disabled', 'API catalog should preserve medical advice boundary')
assert(apiCatalog.boundaries?.publicAccounts === 'disabled', 'API catalog should preserve public account boundary')
assert(apiCatalog.boundaries?.sourceMode === 'allowlist_first', 'API catalog should preserve allowlist-first source mode')
assert(apiCatalog.boundaries?.secretValues === 'never_returned', 'API catalog should preserve no-secret-values boundary')
assert(!secretNamePattern.test(JSON.stringify(apiCatalog)), 'API catalog must not expose secret names')

const endpointById = new Map(apiCatalog.endpoints.map((endpoint) => [endpoint.id, endpoint]))

for (const id of requiredPublicEndpoints) {
  const endpoint = endpointById.get(id)
  assert(endpoint, `API catalog is missing ${id}`)
  assert(endpoint.access === 'public', `${id} should be marked public`)
  assert(endpoint.method === 'GET', `${id} should be a GET endpoint`)
  assert(endpoint.path?.startsWith('/api/'), `${id} should expose an API path`)
  assert(endpoint.purpose && !/\bdiagnose|prescribe|treatment protocol|personalized prescription\b/i.test(endpoint.purpose), `${id} purpose should be non-prescriptive`)
  assert(Array.isArray(endpoint.parameters), `${id} should expose parameters`)
  assert(Array.isArray(endpoint.responseShape) && endpoint.responseShape.length > 0, `${id} should expose response shape`)
}

for (const id of requiredProtectedEndpoints) {
  const endpoint = endpointById.get(id)
  assert(endpoint, `API catalog is missing ${id}`)
  assert(endpoint.access === 'protected-admin', `${id} should be marked protected-admin`)
  assert(endpoint.parameters.includes('Authorization'), `${id} should document admin authorization`)
}

for (const [id, file] of Object.entries(functionFilesByEndpoint)) {
  assert(exists(file), `API catalog endpoint ${id} points to missing function ${file}`)
}

assert(discovery.apiCatalogUrl === 'https://herbalisti.com/data/api-catalog.json', 'Discovery metadata should link API catalog')
assert(
  discovery.publicSurfaces?.some((surface) => surface.url === 'https://herbalisti.com/data/api-catalog.json'),
  'Discovery public surfaces should include API catalog',
)
assert(sitemap.includes('<loc>https://herbalisti.com/data/api-catalog.json</loc>'), 'Sitemap should include API catalog')
assert(appSource.includes('/data/api-catalog.json'), 'UI should expose API catalog export link')
assert(healthSource.includes('apiCatalog: true'), 'Health endpoint should expose apiCatalog surface')
assert(packageJson.scripts?.['verify:api-catalog'], 'package.json should expose verify:api-catalog')
assert(releaseVerifier.includes("verify:api-catalog"), 'Release verifier should include API catalog gate')
assert(productionVerifier.includes('/data/api-catalog.json'), 'Production verifier should check API catalog')
assert(launchVerifier.includes('public/data/api-catalog.json'), 'Launch verifier should require API catalog file')
assert(productionContractVerifier.includes('public/data/api-catalog.json'), 'Production contract verifier should require API catalog file')

console.log(
  JSON.stringify(
    {
      status: 'pass',
      endpointCount: apiCatalog.endpointCount,
      publicEndpointCount: apiCatalog.publicEndpointCount,
      protectedEndpointCount: apiCatalog.protectedEndpointCount,
      publicEndpoints: requiredPublicEndpoints,
      protectedEndpoints: requiredProtectedEndpoints,
      safeToRun: 'This verifier reads local files only. It does not call external APIs or expose secrets.',
    },
    null,
    2,
  ),
)
