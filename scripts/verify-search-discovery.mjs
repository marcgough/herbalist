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

const index = read('index.html')
const openSearch = read('public/opensearch.xml')
const sitemap = read('public/sitemap.xml')
const discovery = readJson('public/data/discovery-metadata.json')
const packageJson = readJson('package.json')
const healthSource = read('functions/api/health.js')
const apiCatalog = readJson('public/data/api-catalog.json')
const releaseVerifier = read('scripts/verify-release.mjs')
const productionVerifier = read('scripts/verify-production.mjs')
const launchVerifier = read('scripts/verify-launch-config.mjs')
const contractVerifier = read('scripts/verify-production-contract.mjs')

assert(exists('public/opensearch.xml'), 'OpenSearch description file is missing')
assert(
  index.includes('rel="search"') &&
    index.includes('type="application/opensearchdescription+xml"') &&
    index.includes('https://herbalisti.com/opensearch.xml'),
  'Homepage head should advertise the OpenSearch description',
)
assert(openSearch.includes('<OpenSearchDescription'), 'OpenSearch XML should define OpenSearchDescription')
assert(openSearch.includes('<ShortName>Herbalisti</ShortName>'), 'OpenSearch XML should name Herbalisti')
assert(
  openSearch.includes('https://herbalisti.com/search?q={searchTerms}'),
  'OpenSearch XML should target the public search route',
)
assert(
  openSearch.includes('https://herbalisti.com/api/search?query={searchTerms}'),
  'OpenSearch XML should target the JSON search API',
)
assert(openSearch.includes('https://herbalisti.com/favicon.svg'), 'OpenSearch XML should reference the favicon')
assert(openSearch.includes('<InputEncoding>UTF-8</InputEncoding>'), 'OpenSearch XML should declare UTF-8 input')
assert(openSearch.includes('<OutputEncoding>UTF-8</OutputEncoding>'), 'OpenSearch XML should declare UTF-8 output')
assert(!/\bdiagnose|prescribe|treatment protocol|personalized prescription\b/i.test(openSearch), 'OpenSearch text should be non-prescriptive')
assert(sitemap.includes('<loc>https://herbalisti.com/opensearch.xml</loc>'), 'Sitemap should include OpenSearch')
assert(discovery.openSearchUrl === 'https://herbalisti.com/opensearch.xml', 'Discovery metadata should expose OpenSearch URL')
assert(
  discovery.publicSurfaces?.some((surface) => surface.type === 'search' && surface.url === 'https://herbalisti.com/opensearch.xml'),
  'Discovery public surfaces should include OpenSearch',
)
assert(
  apiCatalog.endpoints?.some((endpoint) => endpoint.id === 'search' && endpoint.path === '/api/search'),
  'API catalog should document the search API endpoint',
)
assert(healthSource.includes('searchDiscovery: true'), 'Health endpoint should expose searchDiscovery surface')
assert(packageJson.scripts?.['verify:search-discovery'], 'package.json should expose verify:search-discovery')
assert(releaseVerifier.includes('verify:search-discovery'), 'Release verifier should include search discovery gate')
assert(productionVerifier.includes('/opensearch.xml'), 'Production verifier should check OpenSearch')
assert(launchVerifier.includes('public/opensearch.xml'), 'Launch verifier should require OpenSearch file')
assert(contractVerifier.includes('public/opensearch.xml'), 'Production contract verifier should require OpenSearch file')

console.log(
  JSON.stringify(
    {
      status: 'pass',
      htmlSearchRoute: 'https://herbalisti.com/search?q={searchTerms}',
      jsonSearchRoute: 'https://herbalisti.com/api/search?query={searchTerms}',
      safeToRun: 'This verifier reads local files only. It does not call external APIs or expose secrets.',
    },
    null,
    2,
  ),
)
