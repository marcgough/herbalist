import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { publicReferenceBooks } from '../functions/_lib/books.js'
import { fallbackCitationNotes } from '../functions/_lib/citation-notes.js'
import { allHerbalKnowledgeEntries, allHerbalSourceWorks } from '../functions/_lib/herbal-knowledge.js'
import { fallbackRemedies } from '../functions/_lib/remedies.js'
import { fallbackSourceRegistry } from '../functions/_lib/sources.js'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const publicDir = resolve(root, 'public')
const dataDir = resolve(root, 'public/data')
const generatedAt = new Date().toISOString()
const generatedDate = generatedAt.slice(0, 10)
const version = '2026-06-16'
const canonicalBaseUrl = 'https://herbalisti.com'

const sitemapEntries = [
  { path: '/', type: 'page', changefreq: 'daily', priority: '1.0' },
  { path: '/search', type: 'page', changefreq: 'weekly', priority: '0.8' },
  { path: '/library', type: 'page', changefreq: 'weekly', priority: '0.8' },
  { path: '/notes', type: 'page', changefreq: 'weekly', priority: '0.7' },
  { path: '/remedies', type: 'page', changefreq: 'weekly', priority: '0.8' },
  { path: '/map', type: 'page', changefreq: 'weekly', priority: '0.7' },
  { path: '/signals', type: 'page', changefreq: 'daily', priority: '0.9' },
  { path: '/source-policy', type: 'page', changefreq: 'monthly', priority: '0.6' },
  { path: '/governance', type: 'page', changefreq: 'monthly', priority: '0.6' },
  { path: '/opensearch.xml', type: 'search', changefreq: 'monthly', priority: '0.6' },
  { path: '/api/signals.xml', type: 'feed', changefreq: 'daily', priority: '0.7' },
  { path: '/data/news.json', type: 'data', changefreq: 'daily', priority: '0.5' },
  { path: '/data/feed-status.json', type: 'data', changefreq: 'daily', priority: '0.5' },
  { path: '/data/reference-books.json', type: 'data', changefreq: 'weekly', priority: '0.5' },
  { path: '/data/herbal-knowledge.json', type: 'data', changefreq: 'weekly', priority: '0.5' },
  { path: '/data/remedies.json', type: 'data', changefreq: 'weekly', priority: '0.5' },
  { path: '/data/citation-notes.json', type: 'data', changefreq: 'weekly', priority: '0.4' },
  { path: '/data/sources.json', type: 'data', changefreq: 'monthly', priority: '0.4' },
  { path: '/data/discovery-metadata.json', type: 'data', changefreq: 'weekly', priority: '0.5' },
  { path: '/data/api-catalog.json', type: 'data', changefreq: 'weekly', priority: '0.5' },
  { path: '/data/governance.json', type: 'data', changefreq: 'monthly', priority: '0.4' },
  { path: '/data/media-provenance.json', type: 'data', changefreq: 'monthly', priority: '0.3' },
  { path: '/data/media-manifest.json', type: 'data', changefreq: 'monthly', priority: '0.3' },
]

const apiEndpoints = [
  {
    id: 'health',
    method: 'GET',
    path: '/api/health',
    access: 'public',
    purpose: 'Public launch health contract without secret values.',
    parameters: [],
    responseShape: ['status', 'surfaces', 'bindings', 'protectedFeatures', 'feed', 'launchBoundary'],
  },
  {
    id: 'books',
    method: 'GET',
    path: '/api/books',
    access: 'public',
    purpose: 'Search rights-cleared reference-book and source-index records.',
    parameters: ['query', 'mode', 'region'],
    responseShape: ['generatedAt', 'source', 'filters', 'total', 'books'],
  },
  {
    id: 'herbal-knowledge',
    method: 'GET',
    path: '/api/herbal-knowledge',
    access: 'public',
    purpose: 'Search the public-domain herbal commons and source-linked herb profiles.',
    parameters: ['query'],
    responseShape: ['generatedAt', 'source', 'total', 'sources', 'records'],
  },
  {
    id: 'herbal-chat',
    method: 'GET',
    path: '/api/herbal-chat',
    access: 'public',
    purpose: 'Return retrieval-first herbal context with source citations and an educational boundary.',
    parameters: ['query'],
    responseShape: ['model', 'source', 'answer', 'citations', 'policy'],
  },
  {
    id: 'citation-notes',
    method: 'GET',
    path: '/api/citation-notes',
    access: 'public',
    purpose: 'Search source-led citation notes across references, remedies, signals, and governance.',
    parameters: ['query', 'type'],
    responseShape: ['generatedAt', 'source', 'filters', 'total', 'notes'],
  },
  {
    id: 'remedies',
    method: 'GET',
    path: '/api/remedies',
    access: 'public',
    purpose: 'Search safety-led remedy records, plant parts, preparations, and source links.',
    parameters: ['query', 'preparation'],
    responseShape: ['generatedAt', 'source', 'filters', 'total', 'remedies'],
  },
  {
    id: 'graph',
    method: 'GET',
    path: '/api/graph',
    access: 'public',
    purpose: 'Explore source-led remedy, plant-part, preparation, context, and safety relationships.',
    parameters: ['query', 'relation'],
    responseShape: ['generatedAt', 'source', 'filters', 'nodes', 'edges', 'policy'],
  },
  {
    id: 'search',
    method: 'GET',
    path: '/api/search',
    access: 'public',
    purpose: 'Unified public research search across references, herbs, remedies, notes, signals, and sources.',
    parameters: ['query', 'region'],
    responseShape: ['generatedAt', 'source', 'filters', 'total', 'groups'],
  },
  {
    id: 'sources',
    method: 'GET',
    path: '/api/sources',
    access: 'public',
    purpose: 'Search the allowlist-first non-Big-Pharma source registry and review metadata.',
    parameters: ['query'],
    responseShape: ['generatedAt', 'source', 'filters', 'total', 'sources'],
  },
  {
    id: 'source-health',
    method: 'GET',
    path: '/api/source-health',
    access: 'public',
    purpose: 'Expose source-by-source feed health for allowlisted public sources.',
    parameters: [],
    responseShape: ['generatedAt', 'source', 'healthyCount', 'emptyCount', 'warningCount', 'sources'],
  },
  {
    id: 'signal-intelligence',
    method: 'GET',
    path: '/api/signal-intelligence',
    access: 'public',
    purpose: 'Summarize metadata-only topic, recency, and source coverage for public Signals.',
    parameters: [],
    responseShape: ['generatedAt', 'source', 'totalSignals', 'topicCoverage', 'sourceMix', 'policy'],
  },
  {
    id: 'feed-status',
    method: 'GET',
    path: '/api/feed-status',
    access: 'public',
    purpose: 'Expose the latest public feed refresh heartbeat and source policy.',
    parameters: [],
    responseShape: ['generatedAt', 'source', 'sourcePolicy', 'latestRefresh'],
  },
  {
    id: 'news',
    method: 'GET',
    path: '/api/news',
    access: 'public',
    purpose: 'Search and filter independent public-source Signals feed items.',
    parameters: ['query', 'topic', 'source', 'live'],
    responseShape: ['generatedAt', 'source', 'filters', 'total', 'items', 'warnings'],
  },
  {
    id: 'signals-rss',
    method: 'GET',
    path: '/api/signals.xml',
    access: 'public',
    purpose: 'RSS version of the public Signals feed with source-policy and medical-boundary text.',
    parameters: ['query', 'topic', 'source', 'live'],
    responseShape: ['rss'],
  },
  {
    id: 'feed-refresh',
    method: 'POST',
    path: '/api/feed-refresh',
    access: 'protected-admin',
    purpose: 'Trigger a protected live Signals feed refresh after admin authorization.',
    parameters: ['Authorization'],
    responseShape: ['generatedAt', 'itemCount', 'persisted', 'refreshRun'],
  },
  {
    id: 'seedance-create',
    method: 'POST',
    path: '/api/media/seedance',
    access: 'protected-admin',
    purpose: 'Create a Kie.ai Seedance 2.0 media job after admin authorization.',
    parameters: ['Authorization', 'prompt', 'model', 'resolution', 'duration', 'aspectRatio', 'reference urls'],
    responseShape: ['ok', 'taskId', 'status'],
  },
  {
    id: 'seedance-status',
    method: 'GET',
    path: '/api/media/seedance-status',
    access: 'protected-admin',
    purpose: 'Check a protected Seedance media job and persist reviewed provider status.',
    parameters: ['Authorization', 'taskId'],
    responseShape: ['ok', 'taskId', 'status', 'resultUrl'],
  },
]

const publicApiEndpoints = apiEndpoints.filter((endpoint) => endpoint.access === 'public')
const protectedApiEndpoints = apiEndpoints.filter((endpoint) => endpoint.access === 'protected-admin')

const canonicalUrlFor = (path) => `${canonicalBaseUrl}${path === '/' ? '/' : path}`

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const buildSitemapXml = (entries) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(canonicalUrlFor(entry.path))}</loc>
    <lastmod>${generatedDate}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`

const buildOpenSearchXml = () => `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/" xmlns:moz="http://www.mozilla.org/2006/browser/search/">
  <ShortName>Herbalisti</ShortName>
  <Description>Search Herbalisti's rights-cleared reference library, herbal commons, remedies, source notes, and independent Signals.</Description>
  <Tags>Herbalisti herbal medicine longevity public domain research</Tags>
  <Contact>https://herbalisti.com/source-policy</Contact>
  <Url type="text/html" method="get" template="https://herbalisti.com/search?q={searchTerms}" />
  <Url type="application/json" method="get" template="https://herbalisti.com/api/search?query={searchTerms}" />
  <Image height="16" width="16" type="image/svg+xml">https://herbalisti.com/favicon.svg</Image>
  <InputEncoding>UTF-8</InputEncoding>
  <OutputEncoding>UTF-8</OutputEncoding>
  <moz:SearchForm>https://herbalisti.com/search</moz:SearchForm>
</OpenSearchDescription>
`

const exports = [
  {
    fileName: 'reference-books.json',
    payload: {
      name: 'Herbalisti reference book export',
      version,
      generatedAt,
      source: publicReferenceBooks.length ? 'static-export-corpus-registry' : 'static-export',
      policy:
        'Public bibliographic metadata and rights-cleared source-index records only; no copied book text, treatment protocols, or personalized advice.',
      total: publicReferenceBooks.length,
      records: publicReferenceBooks,
    },
  },
  {
    fileName: 'remedies.json',
    payload: {
      name: 'Herbalisti remedy index export',
      version,
      generatedAt,
      source: 'static-export',
      policy: 'Safety-led public source index; traditional-use context is not medical advice, diagnosis, treatment, or prescription.',
      total: fallbackRemedies.length,
      records: fallbackRemedies,
    },
  },
  {
    fileName: 'herbal-knowledge.json',
    payload: {
      name: 'Herbalisti public-domain herbal commons export',
      version,
      generatedAt,
      source: 'static-export',
      policy:
        'Rights-cleared historical herb source index for educational retrieval. Records are paraphrased context only, not medical advice, treatment, diagnosis, prescription, or copied source text.',
      total: allHerbalKnowledgeEntries.length,
      sources: allHerbalSourceWorks,
      records: allHerbalKnowledgeEntries,
    },
  },
  {
    fileName: 'citation-notes.json',
    payload: {
      name: 'Herbalisti citation notes export',
      version,
      generatedAt,
      source: 'static-export',
      policy: 'Concise public-source pointers for auditability; not copied source text or medical guidance.',
      total: fallbackCitationNotes.length,
      records: fallbackCitationNotes,
    },
  },
  {
    fileName: 'sources.json',
    payload: {
      name: 'Herbalisti source registry export',
      version,
      generatedAt,
      source: 'static-export',
      policy:
        'Allowlist-first source registry with Big Pharma-related channels excluded by default and reviewed before expansion.',
      total: fallbackSourceRegistry.length,
      records: fallbackSourceRegistry,
    },
  },
  {
    fileName: 'api-catalog.json',
    payload: {
      name: 'Herbalisti public API catalog',
      version,
      generatedAt,
      source: 'static-export-api-catalog',
      policy:
        'Machine-readable endpoint catalog for public discovery and launch verification. Public endpoints return metadata, source indexes, and educational retrieval context only; protected admin endpoints require authorization and do not expose secret values.',
      canonicalUrl: 'https://herbalisti.com/data/api-catalog.json',
      apiBaseUrl: 'https://herbalisti.com',
      endpointCount: apiEndpoints.length,
      publicEndpointCount: publicApiEndpoints.length,
      protectedEndpointCount: protectedApiEndpoints.length,
      boundaries: {
        medicalAdvice: 'disabled',
        publicAccounts: 'disabled',
        sourceMode: 'allowlist_first',
        secretValues: 'never_returned',
      },
      endpoints: apiEndpoints,
    },
  },
]

exports.push({
  fileName: 'discovery-metadata.json',
  payload: {
    name: 'Herbalisti discovery metadata',
    version,
    generatedAt,
    source: 'static-export-discovery-metadata',
    policy:
      'Structured discovery metadata for search engines, crawlers, and public data users. It describes public Herbalisti surfaces without medical advice, diagnosis, treatment claims, copied source text, or personalized recommendations.',
    canonicalUrl: 'https://herbalisti.com/',
    sitemapUrl: 'https://herbalisti.com/sitemap.xml',
    openSearchUrl: 'https://herbalisti.com/opensearch.xml',
    apiCatalogUrl: 'https://herbalisti.com/data/api-catalog.json',
    structuredDataId: 'herbalisti-structured-data',
    rss: 'https://herbalisti.com/api/signals.xml',
    searchAction: 'https://herbalisti.com/search?q={search_term_string}',
    catalogUrl: 'https://herbalisti.com/source-policy',
    publicSurfaces: sitemapEntries.map((entry) => ({
      type: entry.type,
      url: canonicalUrlFor(entry.path),
      changefreq: entry.changefreq,
    })),
    datasets: [
      {
        id: 'reference-books',
        name: 'Herbalisti reference book index',
        url: 'https://herbalisti.com/data/reference-books.json',
        recordCount: publicReferenceBooks.length,
        rightsBoundary: 'Bibliographic metadata and rights-cleared source-index records only.',
      },
      {
        id: 'herbal-commons',
        name: 'Herbalisti public-domain herbal commons',
        url: 'https://herbalisti.com/data/herbal-knowledge.json',
        recordCount: allHerbalKnowledgeEntries.length,
        sourceCount: allHerbalSourceWorks.length,
        rightsBoundary: 'Rights-cleared historical source index for educational retrieval.',
      },
      {
        id: 'remedies',
        name: 'Herbalisti remedy index',
        url: 'https://herbalisti.com/data/remedies.json',
        recordCount: fallbackRemedies.length,
        rightsBoundary: 'Safety-led public source index; traditional-use context is not medical advice.',
      },
      {
        id: 'citation-notes',
        name: 'Herbalisti citation notes',
        url: 'https://herbalisti.com/data/citation-notes.json',
        recordCount: fallbackCitationNotes.length,
        rightsBoundary: 'Concise source pointers for auditability; not copied source text.',
      },
      {
        id: 'source-registry',
        name: 'Herbalisti source registry',
        url: 'https://herbalisti.com/data/sources.json',
        recordCount: fallbackSourceRegistry.length,
        rightsBoundary: 'Allowlist-first source registry with Big Pharma-related channels excluded by default.',
      },
    ],
    jsonLdGraph: [
      'https://herbalisti.com/#organization',
      'https://herbalisti.com/#website',
      'https://herbalisti.com/#webpage',
      'https://herbalisti.com/data/#catalog',
      'https://herbalisti.com/data/reference-books.json#dataset',
      'https://herbalisti.com/data/herbal-knowledge.json#dataset',
      'https://herbalisti.com/api/signals.xml#feed',
    ],
  },
})

await mkdir(dataDir, { recursive: true })

for (const item of exports) {
  await writeFile(resolve(dataDir, item.fileName), `${JSON.stringify(item.payload, null, 2)}\n`, 'utf8')
}

await writeFile(resolve(publicDir, 'sitemap.xml'), buildSitemapXml(sitemapEntries), 'utf8')
await writeFile(resolve(publicDir, 'opensearch.xml'), buildOpenSearchXml(), 'utf8')

console.log(
  JSON.stringify(
    {
      status: 'pass',
      generatedAt,
      exports: exports.map((item) => ({
        fileName: item.fileName,
        total: item.payload.total ?? item.payload.datasets?.length ?? item.payload.endpointCount ?? null,
      })),
      sitemapEntries: sitemapEntries.length,
      safeToRun: 'This script writes local public/data JSON exports only. It does not call external APIs or expose secrets.',
    },
    null,
    2,
  ),
)
