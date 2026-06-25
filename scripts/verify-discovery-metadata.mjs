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

const treatmentClaimPattern = /\bTREATS\b|\bcures?\b|treatment protocol|personalized protocol|personalized prescription/i
const requiredRoutes = ['/', '/search', '/library', '/notes', '/remedies', '/map', '/signals', '/source-policy', '/governance']
const requiredSitemapDataSurfaces = [
  '/opensearch.xml',
  '/api/signals.xml',
  '/data/news.json',
  '/data/feed-status.json',
  '/data/reference-books.json',
  '/data/herbal-knowledge.json',
  '/data/remedies.json',
  '/data/citation-notes.json',
  '/data/sources.json',
  '/data/discovery-metadata.json',
  '/data/api-catalog.json',
  '/data/governance.json',
  '/data/media-provenance.json',
  '/data/media-manifest.json',
]
const requiredGraphIds = [
  'https://herbalisti.com/#organization',
  'https://herbalisti.com/#website',
  'https://herbalisti.com/#webpage',
  'https://herbalisti.com/data/#catalog',
  'https://herbalisti.com/data/reference-books.json#dataset',
  'https://herbalisti.com/data/herbal-knowledge.json#dataset',
  'https://herbalisti.com/api/signals.xml#feed',
]

for (const path of [
  'index.html',
  'public/robots.txt',
  'public/sitemap.xml',
  'public/opensearch.xml',
  'public/data/reference-books.json',
  'public/data/herbal-knowledge.json',
  'public/data/remedies.json',
  'public/data/citation-notes.json',
  'public/data/sources.json',
  'public/data/discovery-metadata.json',
  'public/data/api-catalog.json',
]) {
  assert(exists(path), `${path} is missing`)
}

const index = read('index.html')
const robots = read('public/robots.txt')
const sitemap = read('public/sitemap.xml')
const openSearch = read('public/opensearch.xml')
const discovery = readJson('public/data/discovery-metadata.json')
const referenceBooks = readJson('public/data/reference-books.json')
const herbalKnowledge = readJson('public/data/herbal-knowledge.json')
const remedies = readJson('public/data/remedies.json')
const citationNotes = readJson('public/data/citation-notes.json')
const sources = readJson('public/data/sources.json')
const packageJson = readJson('package.json')
const appSource = read('src/App.tsx')
const productionVerifier = read('scripts/verify-production.mjs')

const jsonLdMatch = index.match(
  /<script\s+id="herbalisti-structured-data"\s+type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/,
)
assert(jsonLdMatch, 'index.html should include herbalisti-structured-data JSON-LD')

let jsonLd
try {
  jsonLd = JSON.parse(jsonLdMatch[1])
} catch (error) {
  throw new Error(`Inline JSON-LD is not valid JSON: ${error.message}`)
}

assert(jsonLd['@context'] === 'https://schema.org', 'JSON-LD should use schema.org context')
assert(Array.isArray(jsonLd['@graph']), 'JSON-LD should expose an @graph array')
const graphIds = new Set(jsonLd['@graph'].map((node) => node['@id']).filter(Boolean))
for (const id of requiredGraphIds) {
  assert(graphIds.has(id), `JSON-LD graph is missing ${id}`)
}

const graphTypes = new Set(jsonLd['@graph'].map((node) => node['@type']))
for (const type of ['Organization', 'WebSite', 'WebPage', 'DataCatalog', 'Dataset', 'DataFeed']) {
  assert(graphTypes.has(type), `JSON-LD graph should include ${type}`)
}

const website = jsonLd['@graph'].find((node) => node['@id'] === 'https://herbalisti.com/#website')
assert(website?.potentialAction?.['@type'] === 'SearchAction', 'Website JSON-LD should expose SearchAction')
assert(
  website.potentialAction.target === 'https://herbalisti.com/search?q={search_term_string}',
  'SearchAction should target the Herbalisti search route',
)
assert(
  website.potentialAction['query-input'] === 'required name=search_term_string',
  'SearchAction should define query-input',
)

const catalog = jsonLd['@graph'].find((node) => node['@id'] === 'https://herbalisti.com/data/#catalog')
assert(catalog?.dataset?.length >= 5, 'DataCatalog should link the public data exports')
for (const datasetRef of [
  'https://herbalisti.com/data/reference-books.json#dataset',
  'https://herbalisti.com/data/herbal-knowledge.json#dataset',
]) {
  assert(
    catalog.dataset.some((dataset) => dataset['@id'] === datasetRef),
    `DataCatalog should reference ${datasetRef}`,
  )
}

assert(discovery.name === 'Herbalisti discovery metadata', 'Discovery metadata name is incorrect')
assert(discovery.source === 'static-export-discovery-metadata', 'Discovery metadata source is incorrect')
assert(discovery.canonicalUrl === 'https://herbalisti.com/', 'Discovery metadata should expose the canonical URL')
assert(discovery.sitemapUrl === 'https://herbalisti.com/sitemap.xml', 'Discovery metadata should expose the sitemap URL')
assert(discovery.openSearchUrl === 'https://herbalisti.com/opensearch.xml', 'Discovery metadata should expose the OpenSearch URL')
assert(discovery.apiCatalogUrl === 'https://herbalisti.com/data/api-catalog.json', 'Discovery metadata should expose the API catalog URL')
assert(discovery.structuredDataId === 'herbalisti-structured-data', 'Discovery metadata should link the inline JSON-LD id')
assert(discovery.searchAction === website.potentialAction.target, 'Discovery metadata search action should match JSON-LD')
assert(discovery.rss === 'https://herbalisti.com/api/signals.xml', 'Discovery metadata should expose the Signals RSS URL')
assert(!treatmentClaimPattern.test(discovery.policy), 'Discovery metadata policy should avoid medical-treatment claims')
assert(Array.isArray(discovery.publicSurfaces), 'Discovery metadata should expose public surfaces')
assert(Array.isArray(discovery.datasets) && discovery.datasets.length === 5, 'Discovery metadata should describe five datasets')
assert(
  openSearch.includes('https://herbalisti.com/search?q={searchTerms}') &&
    openSearch.includes('https://herbalisti.com/api/search?query={searchTerms}'),
  'OpenSearch should target the public search page and API search endpoint',
)

const datasetById = new Map(discovery.datasets.map((dataset) => [dataset.id, dataset]))
assert(datasetById.get('reference-books')?.recordCount === referenceBooks.total, 'Reference dataset count should match export total')
assert(datasetById.get('herbal-commons')?.recordCount === herbalKnowledge.total, 'Herbal commons count should match export total')
assert(datasetById.get('herbal-commons')?.sourceCount === herbalKnowledge.sources.length, 'Herbal commons source count should match export sources')
assert(datasetById.get('remedies')?.recordCount === remedies.total, 'Remedy dataset count should match export total')
assert(datasetById.get('citation-notes')?.recordCount === citationNotes.total, 'Citation notes dataset count should match export total')
assert(datasetById.get('source-registry')?.recordCount === sources.total, 'Source registry dataset count should match export total')
assert(
  discovery.datasets.every((dataset) => dataset.url?.startsWith('https://herbalisti.com/data/')),
  'Discovery datasets should use canonical Herbalisti data URLs',
)
assert(
  discovery.datasets.every((dataset) => dataset.rightsBoundary && !treatmentClaimPattern.test(dataset.rightsBoundary)),
  'Discovery dataset boundaries should be present and non-prescriptive',
)
for (const id of requiredGraphIds) {
  assert(discovery.jsonLdGraph.includes(id), `Discovery metadata should list JSON-LD graph id ${id}`)
}

const publicSurfaceUrls = new Set(discovery.publicSurfaces.map((surface) => surface.url).filter(Boolean))
for (const route of [...requiredRoutes, ...requiredSitemapDataSurfaces]) {
  const url = `https://herbalisti.com${route === '/' ? '/' : route}`
  assert(publicSurfaceUrls.has(url), `Discovery metadata should expose public surface ${url}`)
}

assert(robots.includes('Sitemap: https://herbalisti.com/sitemap.xml'), 'robots.txt should point to production sitemap')
for (const route of requiredRoutes) {
  const suffix = route === '/' ? '/' : route
  assert(
    sitemap.includes(`<loc>https://herbalisti.com${suffix}</loc>`),
    `sitemap should include ${route}`,
  )
}
for (const path of requiredSitemapDataSurfaces) {
  assert(sitemap.includes(`<loc>https://herbalisti.com${path}</loc>`), `sitemap should include ${path}`)
}
assert(sitemap.includes(`<lastmod>${discovery.generatedAt.slice(0, 10)}</lastmod>`), 'sitemap should use the current export date as lastmod')

assert(packageJson.scripts?.['verify:discovery-metadata'], 'package.json should include verify:discovery-metadata')
assert(
  String(packageJson.scripts?.build ?? '').includes('export-public-data.mjs'),
  'build should regenerate public data before metadata verification',
)
assert(appSource.includes('/data/discovery-metadata.json'), 'UI should expose the discovery metadata export link')
assert(
  productionVerifier.includes('/data/discovery-metadata.json') &&
    productionVerifier.includes('herbalisti-structured-data'),
  'Production verifier should check public discovery metadata and inline JSON-LD',
)

console.log(
  JSON.stringify(
    {
      status: 'pass',
      graphNodes: jsonLd['@graph'].length,
      publicSurfaces: discovery.publicSurfaces.length,
      datasets: discovery.datasets.map((dataset) => ({
        id: dataset.id,
        recordCount: dataset.recordCount,
        sourceCount: dataset.sourceCount ?? null,
      })),
      safeToRun: 'This verifier reads local files only. It does not call external APIs or expose secrets.',
    },
    null,
    2,
  ),
)
