const baseUrl = new URL(process.argv[2] ?? 'https://herbalisti.com')
const timeoutMs = Number(process.env.HERBALISTI_VERIFY_TIMEOUT_MS ?? 30000)
const isLocalBaseUrl = ['localhost', '127.0.0.1', '::1'].includes(baseUrl.hostname)
const isCanonicalProductionUrl = baseUrl.hostname === 'herbalisti.com'

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const expectedHealthSurfaces = [
  'homepage',
  'booksApi',
  'herbalKnowledgeApi',
  'herbalChatApi',
  'citationNotesApi',
  'remediesApi',
  'graphApi',
  'searchApi',
  'searchDiscovery',
  'newsApi',
  'signalsRssApi',
  'signalIntelligenceApi',
  'sourcesApi',
  'sourceHealthApi',
  'feedStatusApi',
  'feedRefreshApi',
  'dataExports',
  'discoveryMetadata',
  'apiCatalog',
  'governancePolicy',
  'mediaManifest',
]

const assertOperationalHealth = (health) => {
  assert(health.name === 'Herbalisti operational health', 'Health API should return the Herbalisti health name')
  assert(health.status === 'ok', 'Health API should report ok')
  assert(health.domain === 'herbalisti.com', 'Health API should report the production domain')
  assert(
    expectedHealthSurfaces.every((surface) => health.surfaces?.[surface] === true),
    'Health API should expose every public launch surface',
  )
  assert(typeof health.bindings?.d1 === 'boolean', 'Health API should expose D1 binding presence as a boolean')
  assert(typeof health.bindings?.r2Media === 'boolean', 'Health API should expose R2 media binding presence as a boolean')
  if (isCanonicalProductionUrl && !isLocalBaseUrl) {
    assert(health.bindings.d1 === true, 'Production Health API should report an active D1 binding')
  }
  assert(
    ['configured', 'disabled'].includes(health.protectedFeatures?.feedRefresh),
    'Health API should expose protected feed refresh feature state without secret values',
  )
  if (isCanonicalProductionUrl && !isLocalBaseUrl) {
    assert(
      health.protectedFeatures.feedRefresh === 'configured',
      'Production Health API should report protected feed refresh configured',
    )
  }
  assert(
    ['configured', 'disabled'].includes(health.protectedFeatures?.seedanceMediaJobs),
    'Health API should expose protected Seedance feature state without secret values',
  )
  assert(
    isLocalBaseUrl || health.protectedFeatures.seedanceMediaJobs !== 'configured' || health.bindings.d1 === true,
    'Configured Seedance endpoints should only be reported with production health bindings available',
  )
  assert(
    ['configured', 'not_required'].includes(health.protectedFeatures?.serverSideOpenAiImages),
    'Health API should expose OpenAI image feature state without secret values',
  )
  assert(
    ['configured', 'fallback_only'].includes(health.protectedFeatures?.serverSideOpenAiHerbalChat),
    'Health API should expose hosted herbal chat feature state without secret values',
  )
  assert(health.feed?.sourcePolicy?.includes('Herbalisti allowlist'), 'Health API should expose source policy')
  assert(Object.hasOwn(health.feed ?? {}, 'latestRefresh'), 'Health API should expose latestRefresh')
  if (isCanonicalProductionUrl && !isLocalBaseUrl) {
    const latest = health.feed.latestRefresh
    const finishedAt = latest?.finishedAt ? Date.parse(latest.finishedAt) : NaN
    const ageHours = Number.isFinite(finishedAt) ? (Date.now() - finishedAt) / 36e5 : Infinity
    assert(
      ['completed', 'completed_with_warnings'].includes(latest?.status),
      'Production Health API should report a completed feed refresh',
    )
    assert(Number(latest?.itemCount ?? 0) > 0, 'Production Health API should report refreshed feed items')
    assert(ageHours <= 8, 'Production Health API should report a feed refresh from the last 8 hours')
  }
  assert(health.launchBoundary?.medicalAdvice === 'disabled', 'Health API should disable medical advice')
  assert(health.launchBoundary?.publicAccounts === 'disabled', 'Health API should disable public accounts')
  assert(health.launchBoundary?.sourceMode === 'allowlist_first', 'Health API should preserve allowlist-first mode')
}

const blockedSourcePattern = /pfizer|moderna|novartis|roche|merck|gsk|astrazeneca|sanofi|bayer|johnson\s*&\s*johnson/i
const treatmentClaimPattern = /\bTREATS\b|diagnose|prescribe|cure\b/i
const herbalSourceUrlPattern = /^https:\/\/(www\.gutenberg\.org\/ebooks\/|wellcomecollection\.org\/works\/|collections\.nlm\.nih\.gov\/catalog\/)/i
const allowedHerbalLicenses = new Set(['public_domain_usa', 'public_domain_mark', 'pdm', 'cc-by'])
const allowedReferenceStatuses = new Set(['public_domain_us', 'public_domain_mark', 'pdm', 'cc-by'])
const sitemapDataSurfaces = [
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
  '/opensearch.xml',
]

const assertStaticExport = (payload, label, minRecords, options = {}) => {
  const { allowBlockedSourceNames = false } = options
  assert(String(payload.source ?? '').startsWith('static-export'), `${label} should be a static export`)
  assert(payload.version === '2026-06-16', `${label} should expose the launch data version`)
  assert(payload.policy && !treatmentClaimPattern.test(payload.policy), `${label} policy should stay non-prescriptive`)
  assert(Array.isArray(payload.records), `${label} should expose records`)
  assert(payload.records.length >= minRecords, `${label} should include at least ${minRecords} records`)
  assert(payload.total === payload.records.length, `${label} total should match records length`)
  if (!allowBlockedSourceNames) {
    assert(!blockedSourcePattern.test(JSON.stringify(payload.records)), `${label} should not include blocked source names`)
  }
}

const withTimeout = async (promiseFactory, label) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await promiseFactory(controller.signal)
  } catch (error) {
    throw new Error(`${label} failed: ${error.message}`)
  } finally {
    clearTimeout(timeout)
  }
}

const urlFor = (path) => new URL(path, baseUrl).toString()

const fetchResponse = async (path, label) =>
  withTimeout(async (signal) => {
    const response = await fetch(urlFor(path), {
      headers: {
        accept: '*/*',
        'user-agent': 'Herbalisti production verification',
      },
      signal,
    })

    assert(response.ok, `${label} returned HTTP ${response.status}`)
    return response
  }, label)

const fetchText = async (path, label) => {
  const response = await fetchResponse(path, label)
  return response.text()
}

const fetchJson = async (path, label) => {
  const response = await fetchResponse(path, label)
  const contentType = response.headers.get('content-type') ?? ''
  assert(contentType.includes('json'), `${label} did not return JSON`)
  return response.json()
}

const headOrGet = async (path, label) =>
  withTimeout(async (signal) => {
    let response = await fetch(urlFor(path), {
      method: 'HEAD',
      headers: { 'user-agent': 'Herbalisti production verification' },
      signal,
    })

    if (response.status === 405 || response.status === 403) {
      response = await fetch(urlFor(path), {
        headers: { 'user-agent': 'Herbalisti production verification' },
        signal,
      })
    }

    assert(response.ok, `${label} returned HTTP ${response.status}`)
    return {
      path,
      status: response.status,
      contentType: response.headers.get('content-type') ?? '',
      cacheControl: response.headers.get('cache-control') ?? '',
    }
  }, label)

const homepageResponse = await fetchResponse('/', 'Homepage')
const html = await homepageResponse.text()
assert(html.includes('<title>Herbalisti | Self-sovereign health intelligence</title>'), 'Homepage title is missing')
assert(html.includes('https://herbalisti.com/'), 'Homepage canonical production URL is missing')
assert(
  html.includes('rel="alternate" type="application/rss+xml" title="Herbalisti Signals" href="https://herbalisti.com/api/signals.xml"'),
  'Homepage RSS alternate link is missing',
)
assert(html.includes('/assets/herbalisti-logo.svg') || html.includes('/assets/herbalisti-hero.png'), 'Homepage launch assets are not referenced')
assert(html.includes('manifest.webmanifest'), 'Web manifest is not linked')
assert(
  html.includes('rel="search"') &&
    html.includes('type="application/opensearchdescription+xml"') &&
    html.includes('https://herbalisti.com/opensearch.xml'),
  'Homepage OpenSearch link is missing',
)
const jsonLdMatch = html.match(
  /<script\s+id="herbalisti-structured-data"\s+type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/,
)
assert(jsonLdMatch, 'Homepage should include Herbalisti structured JSON-LD')
const jsonLd = JSON.parse(jsonLdMatch[1])
assert(jsonLd['@context'] === 'https://schema.org', 'Structured JSON-LD should use schema.org context')
assert(Array.isArray(jsonLd['@graph']), 'Structured JSON-LD should expose an @graph array')
assert(
  jsonLd['@graph'].some((node) => node['@type'] === 'WebSite' && node.potentialAction?.['@type'] === 'SearchAction'),
  'Structured JSON-LD should expose the Herbalisti site SearchAction',
)
assert(
  jsonLd['@graph'].some((node) => node['@id'] === 'https://herbalisti.com/data/#catalog' && Array.isArray(node.dataset)),
  'Structured JSON-LD should expose the public data catalog',
)

const contentSecurityPolicy = homepageResponse.headers.get('content-security-policy') ?? ''
assert(homepageResponse.headers.get('x-content-type-options') === 'nosniff', 'Homepage should send X-Content-Type-Options: nosniff')
assert(
  homepageResponse.headers.get('referrer-policy') === 'strict-origin-when-cross-origin',
  'Homepage should send a strict referrer policy',
)
assert(homepageResponse.headers.get('x-frame-options') === 'DENY', 'Homepage should deny framing')
assert(
  contentSecurityPolicy.includes("default-src 'self'") &&
    contentSecurityPolicy.includes("script-src 'self'") &&
    contentSecurityPolicy.includes("style-src 'self'") &&
    contentSecurityPolicy.includes("frame-ancestors 'none'") &&
    !contentSecurityPolicy.includes("'unsafe-inline'"),
  'Homepage should send the strict self-hosted Content Security Policy',
)

const assets = await Promise.all([
  headOrGet('/assets/herbalisti-logo.svg', 'Logo asset'),
  headOrGet('/assets/herbalisti-mark.svg', 'Mark asset'),
  headOrGet('/assets/herbalisti-hero.png', 'Hero image'),
  headOrGet('/assets/herbalisti-home-background.png', 'Home background image'),
  headOrGet('/assets/herbalisti-research.png', 'Research image'),
  headOrGet('/favicon.svg', 'Favicon'),
])

assert(
  assets.some((asset) => asset.path === '/assets/herbalisti-hero.png' && asset.cacheControl.includes('immutable')),
  'Hero asset should use immutable cache policy',
)

const manifest = await fetchJson('/manifest.webmanifest', 'Web manifest')
assert(manifest.name === 'Herbalisti', 'Manifest name should be Herbalisti')
assert(manifest.start_url === '/', 'Manifest start_url should be /')
assert(
  manifest.icons?.some((icon) => icon.src === '/assets/herbalisti-mark.svg'),
  'Manifest should include the Herbalisti mark icon',
)

const openSearch = await fetchText('/opensearch.xml', 'OpenSearch description')
assert(openSearch.includes('<OpenSearchDescription'), 'OpenSearch description should define OpenSearchDescription')
assert(openSearch.includes('<ShortName>Herbalisti</ShortName>'), 'OpenSearch description should name Herbalisti')
assert(
  openSearch.includes('https://herbalisti.com/search?q={searchTerms}'),
  'OpenSearch description should target the public search route',
)
assert(
  openSearch.includes('https://herbalisti.com/api/search?query={searchTerms}'),
  'OpenSearch description should target the JSON search API',
)
assert(!treatmentClaimPattern.test(openSearch), 'OpenSearch description should remain non-prescriptive')

const robots = await fetchText('/robots.txt', 'Robots file')
assert(robots.includes('Sitemap: https://herbalisti.com/sitemap.xml'), 'Robots file should point to the production sitemap')

const sitemap = await fetchText('/sitemap.xml', 'Sitemap')
assert(sitemap.includes('<loc>https://herbalisti.com/</loc>'), 'Sitemap should include the production homepage')
for (const route of ['/search', '/library', '/notes', '/remedies', '/map', '/signals', '/source-policy', '/governance']) {
  assert(
    sitemap.includes(`<loc>https://herbalisti.com${route}</loc>`),
    `Sitemap should include the ${route} page`,
  )
  const routeHtml = await fetchText(route, `${route} routed page`)
  assert(routeHtml.includes('<title>Herbalisti | Self-sovereign health intelligence</title>'), `${route} should return the app shell`)
  assert(routeHtml.includes('<div id="root"></div>'), `${route} should return the React mount point`)
}
for (const surface of sitemapDataSurfaces) {
  assert(sitemap.includes(`<loc>https://herbalisti.com${surface}</loc>`), `Sitemap should advertise ${surface}`)
}

const governance = await fetchJson('/data/governance.json', 'Governance policy')
assert(governance.name === 'Herbalisti launch governance', 'Governance policy name is incorrect')
assert(
  governance.medicalBoundary?.status === 'educational_research_interface',
  'Governance policy should mark Herbalisti as an educational research interface',
)
assert(
  governance.medicalBoundary?.summary?.includes('does not diagnose, treat, prescribe'),
  'Governance policy should include the medical boundary',
)
assert(
  governance.sourcePolicy?.mode === 'allowlist_first',
  'Governance policy should preserve allowlist-first source policy',
)
assert(
  governance.sourcePolicy?.bigPharmaDefault === 'excluded_unless_explicitly_approved',
  'Governance policy should exclude Big Pharma sources by default',
)
assert(
  governance.sourcePolicy?.reviewCadence === 'quarterly_or_before_source_expansion',
  'Governance policy should expose the source review cadence',
)
assert(
  governance.sourcePolicy?.conflictHandling?.includes('commentary'),
  'Governance policy should expose disclosed-conflict handling',
)
assert(
  governance.privacy?.publicLaunchDefault?.includes('No user accounts'),
  'Governance policy should describe the public-launch privacy restraint',
)
assert(
  governance.editorialReview?.humanReview?.includes('Required'),
  'Governance policy should require human review for medical commentary and claims',
)

const mediaProvenance = await fetchJson('/data/media-provenance.json', 'Media provenance')
assert(mediaProvenance.name === 'Herbalisti media provenance', 'Media provenance name is incorrect')
assert(mediaProvenance.policy?.stockMedia === 'none', 'Media provenance should reject stock media')
assert(mediaProvenance.policy?.externalHotlinks === 'none', 'Media provenance should reject external hotlinks')
assert(Array.isArray(mediaProvenance.assets), 'Media provenance should list assets')
for (const assetPath of [
  '/assets/herbalisti-hero.png',
  '/assets/herbalisti-home-background.png',
  '/assets/herbalisti-research.png',
  '/assets/herbalisti-logo.svg',
  '/assets/herbalisti-mark.svg',
]) {
  assert(
    mediaProvenance.assets.some((asset) => asset.path === assetPath),
    `Media provenance should include ${assetPath}`,
  )
}
assert(
  mediaProvenance.assets.filter((asset) => asset.provider === 'OpenAI image generation').length >= 2,
  'Media provenance should include OpenAI-generated launch images',
)

const mediaManifest = await fetchJson('/data/media-manifest.json', 'Motion media manifest')
assert(mediaManifest.name === 'Herbalisti motion media manifest', 'Motion media manifest name is incorrect')
assert(mediaManifest.policy?.stockMedia === 'none', 'Motion media manifest should reject stock media')
assert(mediaManifest.policy?.externalHotlinks === 'none', 'Motion media manifest should reject external hotlinks')
assert(mediaManifest.video?.hero && mediaManifest.video?.research, 'Motion media manifest should define video slots')
for (const [name, slot] of Object.entries(mediaManifest.video)) {
  assert(slot.src?.startsWith('/assets/'), `${name} video slot should use a local asset path`)
  assert(slot.poster?.startsWith('/assets/'), `${name} video slot should use a local poster path`)
  assert(slot.type === 'video/mp4', `${name} video slot should use MP4`)
  assert(slot.provider === 'Kie.ai Seedance 2.0', `${name} video slot should document Seedance as provider`)
  assert(
    !slot.enabled || slot.reviewStatus === 'approved_for_local_launch_candidate',
    `${name} video slot is enabled without approved provenance status`,
  )
  if (slot.enabled) {
    await headOrGet(slot.src, `${name} video asset`)
  }
}

const referenceBookExport = await fetchJson('/data/reference-books.json', 'Reference book export')
assertStaticExport(referenceBookExport, 'Reference book export', 1000, { allowBlockedSourceNames: true })
assert(
  referenceBookExport.records.every(
    (book) =>
      herbalSourceUrlPattern.test(book.externalUrl ?? '') && allowedReferenceStatuses.has(String(book.sourceStatus ?? '')),
  ),
  'Reference book export should expose only rights-cleared corpus records',
)

const remedyExport = await fetchJson('/data/remedies.json', 'Remedy export')
assertStaticExport(remedyExport, 'Remedy export', 20)
assert(
  remedyExport.records.every(
    (remedy) =>
      remedy.name &&
      remedy.botanicalName &&
      Array.isArray(remedy.plantParts) &&
      remedy.sourceUrl?.startsWith('https://www.nccih.nih.gov/health/'),
  ),
  'Remedy export should expose botanical, plant-part, and public source metadata',
)

const herbalKnowledgeExport = await fetchJson('/data/herbal-knowledge.json', 'Herbal commons export')
assertStaticExport(herbalKnowledgeExport, 'Herbal commons export', 100)
const herbalKnowledgeExportCorpusProfiles = herbalKnowledgeExport.records.filter(
  (record) => record.entryKind === 'corpus-profile',
)
assert(
  herbalKnowledgeExportCorpusProfiles.length >= 100,
  'Herbal commons export should expose corpus-derived herb profiles',
)
assert(
  herbalKnowledgeExportCorpusProfiles.every(
    (record) =>
      Number(record.corpusWorkCount ?? 0) > 0 &&
      Number(record.corpusChunkCount ?? 0) > 0 &&
      String(record.sourceNote ?? '').includes('source-linked'),
  ),
  'Herbal commons export corpus profiles should include source-linked corpus scale metadata',
)
assert(
  Array.isArray(herbalKnowledgeExport.sources) &&
    herbalKnowledgeExport.sources.length >= 150 &&
    herbalKnowledgeExport.sources.every(
      (source) =>
        herbalSourceUrlPattern.test(source.sourceUrl ?? '') &&
        allowedHerbalLicenses.has(String(source.licenseStatus ?? '')),
    ),
  'Herbal commons export should expose rights-cleared historical source works',
)
assert(
  herbalKnowledgeExport.records.every(
    (record) =>
      record.name &&
      (record.botanicalName || record.displayLabel || (Array.isArray(record.categories) && record.categories.length > 0)) &&
      Array.isArray(record.mayHelpWith) &&
      Array.isArray(record.considerations) &&
      Array.isArray(record.sourceIds),
  ),
  'Herbal commons export should expose herb context, considerations, and source ids',
)

const citationNotesExport = await fetchJson('/data/citation-notes.json', 'Citation notes export')
assertStaticExport(citationNotesExport, 'Citation notes export', 10)
assert(
  citationNotesExport.records.every((note) => note.sourceUrl?.startsWith('https://') && Array.isArray(note.tags)),
  'Citation notes export should expose HTTPS source URLs and tags',
)

const sourceRegistryExport = await fetchJson('/data/sources.json', 'Source registry export')
assertStaticExport(sourceRegistryExport, 'Source registry export', 6)
assert(
  sourceRegistryExport.records.every((source) => source.isAllowlisted && !source.isBigPharmaRelated),
  'Source registry export should stay allowlisted and non-Big-Pharma by default',
)

const discoveryMetadata = await fetchJson('/data/discovery-metadata.json', 'Discovery metadata export')
assert(discoveryMetadata.name === 'Herbalisti discovery metadata', 'Discovery metadata export name is incorrect')
assert(discoveryMetadata.source === 'static-export-discovery-metadata', 'Discovery metadata source is incorrect')
assert(discoveryMetadata.canonicalUrl === 'https://herbalisti.com/', 'Discovery metadata should expose the production canonical URL')
assert(
  discoveryMetadata.openSearchUrl === 'https://herbalisti.com/opensearch.xml',
  'Discovery metadata should expose the OpenSearch URL',
)
assert(
  discoveryMetadata.sitemapUrl === 'https://herbalisti.com/sitemap.xml',
  'Discovery metadata should expose the production sitemap URL',
)
assert(
  discoveryMetadata.searchAction === 'https://herbalisti.com/search?q={search_term_string}',
  'Discovery metadata should expose the public search action URL',
)
assert(Array.isArray(discoveryMetadata.publicSurfaces), 'Discovery metadata should expose public surfaces')
assert(Array.isArray(discoveryMetadata.datasets) && discoveryMetadata.datasets.length === 5, 'Discovery metadata should describe five datasets')
assert(
  discoveryMetadata.datasets.some(
    (dataset) => dataset.id === 'reference-books' && dataset.recordCount === referenceBookExport.records.length,
  ),
  'Discovery metadata reference-book count should match the export',
)
assert(
  discoveryMetadata.datasets.some(
    (dataset) =>
      dataset.id === 'herbal-commons' &&
      dataset.recordCount === herbalKnowledgeExport.records.length &&
      dataset.sourceCount === herbalKnowledgeExport.sources.length,
  ),
  'Discovery metadata herbal commons counts should match the export',
)
assert(
  discoveryMetadata.datasets.every((dataset) => dataset.rightsBoundary && !treatmentClaimPattern.test(dataset.rightsBoundary)),
  'Discovery metadata should preserve rights and non-medical boundaries',
)
const discoverySurfaceUrls = new Set(discoveryMetadata.publicSurfaces.map((surface) => surface.url).filter(Boolean))
for (const surface of ['/', '/search', '/library', '/signals', ...sitemapDataSurfaces]) {
  const url = `https://herbalisti.com${surface === '/' ? '/' : surface}`
  assert(discoverySurfaceUrls.has(url), `Discovery metadata should expose public surface ${url}`)
}
assert(discoverySurfaceUrls.has('https://herbalisti.com/opensearch.xml'), 'Discovery metadata should expose OpenSearch as a public surface')

const apiCatalog = await fetchJson('/data/api-catalog.json', 'API catalog export')
assert(apiCatalog.name === 'Herbalisti public API catalog', 'API catalog name is incorrect')
assert(apiCatalog.source === 'static-export-api-catalog', 'API catalog source is incorrect')
assert(apiCatalog.apiBaseUrl === 'https://herbalisti.com', 'API catalog should expose the production API base URL')
assert(Array.isArray(apiCatalog.endpoints), 'API catalog should expose endpoints')
assert(apiCatalog.endpointCount === apiCatalog.endpoints.length, 'API catalog endpoint count should match endpoints length')
assert(apiCatalog.publicEndpointCount >= 14, 'API catalog should expose the public endpoint count')
assert(apiCatalog.protectedEndpointCount === 3, 'API catalog should expose the protected admin endpoint count')
for (const protectedEndpointId of ['feed-refresh', 'seedance-create', 'seedance-status']) {
  assert(
    apiCatalog.endpoints.some((endpoint) => endpoint.id === protectedEndpointId && endpoint.access === 'protected-admin'),
    `API catalog should expose protected admin endpoint ${protectedEndpointId}`,
  )
}
assert(apiCatalog.boundaries?.medicalAdvice === 'disabled', 'API catalog should preserve the medical-advice boundary')
assert(apiCatalog.boundaries?.publicAccounts === 'disabled', 'API catalog should preserve the public-account boundary')
assert(apiCatalog.boundaries?.sourceMode === 'allowlist_first', 'API catalog should preserve the allowlist source boundary')
assert(apiCatalog.boundaries?.secretValues === 'never_returned', 'API catalog should preserve the no-secret-values boundary')
const catalogEndpointIds = new Set(apiCatalog.endpoints.map((endpoint) => endpoint.id))
for (const id of [
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
  'seedance-create',
  'seedance-status',
]) {
  assert(catalogEndpointIds.has(id), `API catalog should include ${id}`)
}
assert(
  apiCatalog.endpoints
    .filter((endpoint) => endpoint.access === 'public')
    .every((endpoint) => endpoint.path.startsWith('/api/')),
  'API catalog public endpoints should use API paths',
)
assert(
  apiCatalog.endpoints
    .filter((endpoint) => endpoint.access === 'protected-admin')
    .every((endpoint) => endpoint.parameters.includes('Authorization')),
  'API catalog protected endpoints should document admin authorization',
)
assert(!/KIE_API_KEY|MEDIA_ADMIN_TOKEN|FEED_ADMIN_TOKEN|OPENAI_API_KEY/.test(JSON.stringify(apiCatalog)), 'API catalog must not expose secret names or values')

const staticFeedStatus = await fetchJson('/data/feed-status.json', 'Static feed status')
assert(staticFeedStatus.source === 'static-refresh', 'Static feed status should come from the refresh script')
assert(
  staticFeedStatus.latestRefresh?.triggerType === 'static-refresh',
  'Static feed status should include a static refresh heartbeat',
)
assert(
  staticFeedStatus.latestRefresh?.itemCount >= 0,
  'Static feed status should include the refreshed signal count',
)
assert(
  staticFeedStatus.latestRefresh?.publicItemCount >= staticFeedStatus.latestRefresh?.itemCount,
  'Static feed status should include the public snapshot signal count',
)
assert(
  ['updated', 'preserved_existing'].includes(staticFeedStatus.publicSnapshot?.status),
  'Static feed status should expose whether the public snapshot was updated or preserved',
)
assert(
  staticFeedStatus.publicSnapshot?.itemCount >= staticFeedStatus.latestRefresh?.itemCount,
  'Static feed status publicSnapshot should expose the visible public feed count',
)

const books = await fetchJson('/api/books', 'Books API')
assert(Array.isArray(books.books), 'Books API should return a books array')
assert(books.books.length >= 1000, 'Books API should return the corpus-scale public archive')
assert(books.total === books.books.length, 'Books API total should match returned records')
assert(
  books.books.every(
    (book) =>
      herbalSourceUrlPattern.test(book.externalUrl ?? '') && allowedReferenceStatuses.has(String(book.sourceStatus ?? '')),
  ),
  'Books API should expose only rights-cleared corpus records',
)

const coffinBooks = await fetchJson('/api/books?query=Coffin', 'Books search API')
assert(
  coffinBooks.books.some((book) => book.id === 'wellcome-ajcphwk7' || book.id === 'wellcome-jksmvzyw'),
  'Books search should find the Coffin botanic guide records',
)

const bulliardBooks = await fetchJson('/api/books?query=Bulliard', 'Books author search API')
assert(
  bulliardBooks.books.some((book) => book.id === 'nlm-2165030R'),
  'Books search should find the botanical dictionary author record',
)

const herbalKnowledge = await fetchJson('/api/herbal-knowledge', 'Herbal knowledge API')
assert(Array.isArray(herbalKnowledge.records), 'Herbal knowledge API should return records')
assert(herbalKnowledge.records.length >= 100, 'Herbal knowledge API should return the corpus-scale herbal commons')
const herbalKnowledgeCorpusProfiles = herbalKnowledge.records.filter((record) => record.entryKind === 'corpus-profile')
assert(
  herbalKnowledgeCorpusProfiles.length >= 100,
  'Herbal knowledge API should expose corpus-derived herb profiles',
)
assert(
  herbalKnowledgeCorpusProfiles.every(
    (record) =>
      Number(record.corpusWorkCount ?? 0) > 0 &&
      Number(record.corpusChunkCount ?? 0) > 0 &&
      String(record.sourceNote ?? '').includes('source-linked'),
  ),
  'Herbal knowledge API corpus profiles should include source-linked corpus scale metadata',
)
assert(
  Array.isArray(herbalKnowledge.sources) &&
    herbalKnowledge.sources.length >= 150 &&
    herbalKnowledge.sources.every(
      (source) =>
        herbalSourceUrlPattern.test(source.sourceUrl ?? '') &&
        allowedHerbalLicenses.has(String(source.licenseStatus ?? '')),
    ),
  'Herbal knowledge API should expose rights-cleared historical source works',
)

const gingerHerbalKnowledge = await fetchJson('/api/herbal-knowledge?query=ginger', 'Ginger herbal knowledge API')
assert(
  gingerHerbalKnowledge.records.some((record) => record.id === 'ginger'),
  'Herbal knowledge search should find ginger',
)

const herbalChat = await fetchJson('/api/herbal-chat?query=ginger', 'Herbal chat API')
assert(
  ['herbalisti-local-rag-small-v1', 'herbalisti-corpus-memory-rag-v1'].includes(herbalChat.model) ||
    /^gpt-5(?:\.\d+)?(?:-[a-z0-9.]+)?$/i.test(String(herbalChat.model ?? '')),
  'Herbal chat should expose a supported retrieval model id',
)
assert(herbalChat.answer?.includes('Ginger'), 'Herbal chat should answer from the ginger index record')
assert(
  Array.isArray(herbalChat.citations) && herbalChat.citations.length > 0,
  'Herbal chat should cite public-domain source works',
)
assert(
  herbalChat.policy?.includes('not medical advice') &&
    ['public-domain-herbal-index', 'corpus-memory-public-domain-herbal-index'].includes(herbalChat.source),
  'Herbal chat should expose the educational boundary and source layer',
)

const citationNotes = await fetchJson('/api/citation-notes', 'Citation notes API')
assert(Array.isArray(citationNotes.notes), 'Citation notes API should return a notes array')
assert(citationNotes.notes.length >= 10, 'Citation notes API should return the launch citation note layer')
assert(
  new Set(citationNotes.notes.map((note) => note.sourceType)).size >= 4,
  'Citation notes should cover reference, remedy, signal, and governance source types',
)
assert(
  citationNotes.notes.every((note) => note.sourceUrl?.startsWith('https://') && Array.isArray(note.tags)),
  'Citation notes should expose HTTPS source URLs and tags',
)

const remedyCitationNotes = await fetchJson('/api/citation-notes?type=remedy', 'Remedy citation notes API')
assert(
  remedyCitationNotes.notes.length > 0 && remedyCitationNotes.notes.every((note) => note.sourceType === 'remedy'),
  'Citation notes type filter should return only remedy notes',
)

const gingerCitationNotes = await fetchJson('/api/citation-notes?query=ginger', 'Ginger citation notes API')
assert(
  gingerCitationNotes.notes.some((note) => note.id === 'ginger-nccih-source'),
  'Citation notes search should find the ginger source note',
)

const remedies = await fetchJson('/api/remedies', 'Remedies API')
assert(Array.isArray(remedies.remedies), 'Remedies API should return a remedies array')
assert(remedies.remedies.length >= 20, 'Remedies API should return the core remedy index')
assert(
  remedies.total === remedies.remedies.length,
  'Remedies API total should match returned records',
)
assert(
  remedies.remedies.every(
    (remedy) =>
      remedy.name &&
      remedy.botanicalName &&
      Array.isArray(remedy.plantParts) &&
      remedy.plantParts.length > 0 &&
      remedy.safetySummary &&
      remedy.sourceUrl,
  ),
  'Remedy records need name, botanical name, plant parts, safety summary, and source URL',
)
assert(
  remedies.remedies.every((remedy) => remedy.sourceUrl.startsWith('https://www.nccih.nih.gov/health/')),
  'Remedy records should use the public NCCIH source index',
)

const gingerRemedies = await fetchJson('/api/remedies?query=ginger', 'Remedy ginger search API')
assert(
  gingerRemedies.remedies.some((remedy) => remedy.id === 'ginger' && remedy.botanicalName === 'Zingiber officinale'),
  'Remedy search should find ginger botanical metadata',
)
const rhizomeRemedies = await fetchJson('/api/remedies?query=rhizome', 'Remedy rhizome search API')
assert(
  rhizomeRemedies.remedies.some(
    (remedy) => remedy.id === 'ginger' && remedy.plantParts.includes('Rhizome'),
  ),
  'Remedy search should include plant-part metadata such as rhizome',
)

const infusionRemedies = await fetchJson('/api/remedies?preparation=Infusion', 'Remedy infusion filter API')
assert(
  infusionRemedies.remedies.length > 0 &&
    infusionRemedies.remedies.every((remedy) =>
      remedy.preparations.some((preparation) => preparation.includes('Infusion')),
    ),
  'Remedy preparation filter should return only infusion records',
)

const graphAll = await fetchJson('/api/graph', 'Relationship graph API')
assert(Array.isArray(graphAll.nodes), 'Relationship graph API should return a nodes array')
assert(Array.isArray(graphAll.edges), 'Relationship graph API should return an edges array')
assert(
  graphAll.nodes.filter((node) => node.type === 'Remedy').length >= 20,
  'Relationship graph should include remedy nodes',
)
assert(graphAll.edges.length >= 200, 'Relationship graph should include plant-part, preparation, context, safety, and relation edges')
const graphRelations = new Set(graphAll.edges.map((edge) => edge.relation))
for (const relation of ['RELATED_TO', 'HAS_PART', 'PREPARED_AS', 'TRADITIONAL_CONTEXT', 'SAFETY_WATCH']) {
  assert(graphRelations.has(relation), `Relationship graph should include ${relation} edges`)
}
assert(!graphRelations.has('TREATS'), 'Relationship graph must not expose treatment-claim relations')
assert(
  graphAll.policy?.includes('not treatment claims'),
  'Relationship graph should expose the non-treatment-claim policy',
)

const gingerGraph = await fetchJson('/api/graph?query=ginger', 'Ginger relationship graph API')
const gingerNodeIds = new Set(gingerGraph.nodes.map((node) => node.id))
for (const id of ['ginger', 'turmeric', 'peppermint-oil', 'garlic']) {
  assert(gingerNodeIds.has(id), `Ginger relationship graph should include ${id}`)
}
assert(
  gingerGraph.nodes.some((node) => node.type === 'Preparation' && node.label === 'Tea'),
  'Ginger relationship graph should include tea preparation context',
)
assert(
  gingerGraph.nodes.some((node) => node.type === 'Plant part' && node.label === 'Rhizome'),
  'Ginger relationship graph should include rhizome plant-part context',
)

const safetyGraph = await fetchJson(
  '/api/graph?query=St.%20John%27s&relation=SAFETY_WATCH',
  "St. John's wort safety relationship graph API",
)
assert(
  safetyGraph.edges.length > 0 && safetyGraph.edges.every((edge) => edge.relation === 'SAFETY_WATCH'),
  'Relationship graph relation filter should return only safety-watch edges',
)
const plantPartGraph = await fetchJson('/api/graph?query=ginger&relation=HAS_PART', 'Ginger plant-part graph API')
assert(
  plantPartGraph.edges.length > 0 && plantPartGraph.edges.every((edge) => edge.relation === 'HAS_PART'),
  'Relationship graph relation filter should return only plant-part edges',
)
assert(
  safetyGraph.nodes.some((node) => node.type === 'Safety' && node.label.includes('Antidepressant')),
  "St. John's wort graph should include antidepressant safety-watch context",
)

const unifiedSearch = await fetchJson('/api/search?query=ginger', 'Unified search API')
assert(Array.isArray(unifiedSearch.groups), 'Unified search API should return grouped results')
assert(unifiedSearch.groups.length >= 5, 'Unified search API should expose the launch search groups')
assert(unifiedSearch.total > 0, 'Unified search API should report matches for ginger')
assert(
  unifiedSearch.groups.some((group) => group.id === 'remedies' && group.items.some((item) => item.title === 'Ginger')),
  'Unified search API should include the ginger remedy result',
)
assert(
  unifiedSearch.groups.some((group) => group.id === 'notes' && group.items.some((item) => item.id === 'note-ginger-nccih-source')),
  'Unified search API should include the ginger citation note result',
)
assert(
  unifiedSearch.groups.every((group) => typeof group.total === 'number' && Array.isArray(group.items)),
  'Unified search API groups should include totals and result arrays',
)

const sources = await fetchJson('/api/sources', 'Sources API')
assert(Array.isArray(sources.sources), 'Sources API should return a sources array')
assert(sources.sources.length >= 6, 'Sources API should return at least the initial source registry')
assert(
  sources.sources.every((source) => source.isAllowlisted && !source.isBigPharmaRelated),
  'Sources API should only return allowlisted non-Big-Pharma sources',
)
assert(
  sources.sources.every(
    (source) =>
      source.independenceStatus &&
      source.ownershipReview &&
      source.reviewEvidenceUrl?.startsWith('https://') &&
      source.reviewCadence === 'quarterly_or_before_source_expansion' &&
      source.lastReviewed &&
      source.reviewNote,
  ),
  'Sources API should expose source independence review metadata',
)
assert(
  sources.sources.some((source) => source.id === 'pubmed') &&
    sources.sources.some((source) => source.id === 'fightaging'),
  'Sources API should include public research and independent longevity sources',
)
assert(
  sources.sources.some((source) => source.id === 'pubmed' && source.feedName === 'PubMed / NCBI') &&
    sources.sources.some((source) => source.id === 'crossref' && source.feedName === 'Crossref'),
  'Sources API should expose feedName values for signal source filters',
)
assert(
  sources.sources.some(
    (source) =>
      source.id === 'fightaging' &&
      source.independenceStatus === 'independent-longevity-commentary-disclosed-conflict',
  ),
  'Fight Aging source should expose its disclosed-conflict commentary status',
)

const longevitySources = await fetchJson('/api/sources?query=longevity', 'Source registry search API')
assert(
  longevitySources.sources.some((source) => source.id === 'lifespan' || source.id === 'fightaging'),
  'Source registry search should find independent longevity sources',
)

const conflictSources = await fetchJson('/api/sources?query=disclosed%20conflict', 'Source review search API')
assert(
  conflictSources.sources.some((source) => source.id === 'fightaging'),
  'Source registry search should include independence review metadata',
)

const sourceHealth = await fetchJson('/api/source-health', 'Source health API')
assert(Array.isArray(sourceHealth.sources), 'Source health API should return a sources array')
assert(sourceHealth.sources.length >= 6, 'Source health API should report the launch source set')
assert(typeof sourceHealth.healthyCount === 'number', 'Source health API should report healthyCount')
assert(typeof sourceHealth.emptyCount === 'number', 'Source health API should report emptyCount')
assert(typeof sourceHealth.warningCount === 'number', 'Source health API should report warningCount')
assert(
  sourceHealth.sources.every((source) => source.isAllowlisted && !source.isBigPharmaRelated),
  'Source health API should only report allowlisted non-Big-Pharma sources',
)
assert(
  sourceHealth.sources.every((source) => ['ok', 'warning', 'empty'].includes(source.status)),
  'Source health API should report a known source status for every source',
)
assert(
  sourceHealth.sources.some((source) => source.id === 'pubmed') &&
    sourceHealth.sources.some((source) => source.id === 'fightaging'),
  'Source health API should cover public research and independent longevity sources',
)
assert(
  sourceHealth.sourceHealthPolicy?.includes('allowlisted'),
  'Source health API should expose source health policy text',
)

const signalIntelligence = await fetchJson('/api/signal-intelligence', 'Signal intelligence API')
assert(
  typeof signalIntelligence.totalSignals === 'number',
  'Signal intelligence API should report totalSignals',
)
assert(
  Array.isArray(signalIntelligence.topicCoverage) && signalIntelligence.topicCoverage.length >= 8,
  'Signal intelligence API should expose topic coverage for all launch topics',
)
assert(Array.isArray(signalIntelligence.topTopics), 'Signal intelligence API should expose topTopics')
assert(Array.isArray(signalIntelligence.sourceMix), 'Signal intelligence API should expose sourceMix')
assert(
  signalIntelligence.policy?.includes('not medical guidance'),
  'Signal intelligence API should preserve the metadata-only policy boundary',
)
assert(
  typeof signalIntelligence.coveragePercent === 'number' &&
    signalIntelligence.coveragePercent >= 0 &&
    signalIntelligence.coveragePercent <= 100,
  'Signal intelligence API should report a bounded coverage percent',
)

const feedStatus = await fetchJson('/api/feed-status', 'Feed status API')
assert(feedStatus.sourcePolicy?.includes('Herbalisti allowlist'), 'Feed status API should return the source policy')
assert(Object.hasOwn(feedStatus, 'latestRefresh'), 'Feed status API should expose latestRefresh')

const healthResponse = await fetchResponse('/api/health', 'Health API')
assert(
  healthResponse.headers.get('content-type')?.includes('json'),
  'Health API should return JSON',
)
assert(
  healthResponse.headers.get('cache-control')?.includes('no-store'),
  'Health API should not be cached',
)
const health = await healthResponse.json()
assertOperationalHealth(health)

const news = await fetchJson('/api/news', 'News API')
assert(Array.isArray(news.items), 'News API should return an items array')
assert(news.items.length > 0, 'News API should return live or cached public-source signals')
assert(news.total === news.items.length, 'News API total should match returned items')
assert(news.items.every((item) => item.title && item.url && item.sourceName), 'News items need title, URL, and source name')
assert(news.items.every((item) => Array.isArray(item.topics) && item.topics.length > 0), 'News items need topic tags')

assert(
  news.items.every((item) => !blockedSourcePattern.test(`${item.sourceName} ${item.url}`)),
  'News feed includes a blocked Big Pharma-related source name',
)

const signalsRssResponse = await fetchResponse('/api/signals.xml?source=Crossref', 'Signals RSS feed')
const signalsRssContentType = signalsRssResponse.headers.get('content-type') ?? ''
const signalsRssCacheControl = signalsRssResponse.headers.get('cache-control') ?? ''
const signalsRss = await signalsRssResponse.text()
const signalsRssItemCount = [...signalsRss.matchAll(/<item>/g)].length
assert(signalsRssContentType.includes('application/rss+xml'), 'Signals RSS feed should return RSS XML')
assert(signalsRssCacheControl.includes('max-age=900'), 'Signals RSS feed should use the short RSS cache policy')
assert(signalsRss.includes('<title>Herbalisti Signals</title>'), 'Signals RSS feed title is missing')
assert(signalsRss.includes('Herbalisti allowlist'), 'Signals RSS feed should include the source policy')
assert(signalsRss.includes('not medical advice'), 'Signals RSS feed should include the medical boundary')
assert(signalsRss.includes('<category>Crossref</category>'), 'Signals RSS source filter should emit Crossref category tags')
assert(signalsRssItemCount > 0, 'Signals RSS feed should include at least one item')
assert(!blockedSourcePattern.test(signalsRss), 'Signals RSS feed includes blocked source text')

const dnaNews = await fetchJson('/api/news?topic=DNA%20modification', 'DNA topic news API')
assert(Array.isArray(dnaNews.items), 'DNA topic API should return an items array')
assert(
  dnaNews.items.every((item) => item.topics.includes('DNA modification')),
  'DNA topic API returned an item without the DNA modification topic',
)

const crossrefNews = await fetchJson('/api/news?source=Crossref', 'Crossref source news API')
assert(Array.isArray(crossrefNews.items), 'Crossref source API should return an items array')
assert(crossrefNews.items.length > 0, 'Crossref source API should return at least one item')
assert(
  crossrefNews.items.every((item) => item.sourceName === 'Crossref'),
  'Crossref source API returned an item from another source',
)

const crossrefGeneTherapyNews = await fetchJson(
  '/api/news?source=Crossref&topic=Gene%20therapy',
  'Crossref gene therapy news API',
)
assert(
  crossrefGeneTherapyNews.items.every(
    (item) => item.sourceName === 'Crossref' && item.topics.includes('Gene therapy'),
  ),
  'Combined source and topic filtering returned an item outside the selected source/topic',
)

const noMatchNews = await fetchJson(
  '/api/news?query=unlikely-herbalisti-no-match-24680',
  'No-match news search API',
)
assert(Array.isArray(noMatchNews.items), 'No-match news search should return an items array')
assert(noMatchNews.items.length === 0, 'No-match news search should return zero items')
assert(noMatchNews.total === 0, 'No-match news search total should be zero')

console.log(
  JSON.stringify(
    {
      status: 'pass',
      baseUrl: baseUrl.toString(),
      checks: {
        assets: assets.map((asset) => ({
          path: asset.path,
          contentType: asset.contentType,
          cacheControl: asset.cacheControl,
        })),
        books: {
          source: books.source,
          count: books.books.length,
        },
        citationNotes: {
          source: citationNotes.source,
          count: citationNotes.notes.length,
          remedyMatches: remedyCitationNotes.notes.length,
          gingerMatches: gingerCitationNotes.notes.length,
        },
        remedies: {
          source: remedies.source,
          count: remedies.remedies.length,
          gingerMatches: gingerRemedies.remedies.length,
          rhizomeMatches: rhizomeRemedies.remedies.length,
          infusionMatches: infusionRemedies.remedies.length,
        },
        graph: {
          source: graphAll.source,
          nodes: graphAll.nodes.length,
          edges: graphAll.edges.length,
          gingerNodes: gingerGraph.nodes.length,
          safetyEdges: safetyGraph.edges.length,
          plantPartEdges: plantPartGraph.edges.length,
        },
        unifiedSearch: {
          source: unifiedSearch.source,
          total: unifiedSearch.total,
          groups: unifiedSearch.groups.length,
        },
        sources: {
          source: sources.source,
          count: sources.sources.length,
          longevityMatches: longevitySources.sources.length,
          conflictMatches: conflictSources.sources.length,
        },
        sourceHealth: {
          source: sourceHealth.source,
          count: sourceHealth.sources.length,
          healthy: sourceHealth.healthyCount,
          empty: sourceHealth.emptyCount,
          warnings: sourceHealth.warningCount,
        },
        signalIntelligence: {
          source: signalIntelligence.source,
          signals: signalIntelligence.totalSignals,
          topics: signalIntelligence.representedTopics,
          sources: signalIntelligence.representedSources,
          coveragePercent: signalIntelligence.coveragePercent,
        },
        feedStatus: {
          source: feedStatus.source,
          hasLatestRefresh: Boolean(feedStatus.latestRefresh),
          staticRefreshCount: staticFeedStatus.latestRefresh.itemCount,
          signalsRssItems: signalsRssItemCount,
          signalsRssContentType,
        },
        health: {
          status: health.status,
          d1Bound: health.bindings.d1,
          r2MediaBound: health.bindings.r2Media,
          seedanceMediaJobs: health.protectedFeatures.seedanceMediaJobs,
        },
        news: {
          source: news.source,
          count: news.items.length,
          dnaTopicCount: dnaNews.items.length,
          crossrefSourceCount: crossrefNews.items.length,
          crossrefGeneTherapyCount: crossrefGeneTherapyNews.items.length,
          noMatchCount: noMatchNews.items.length,
        },
        governance: {
          version: governance.version,
          medicalBoundary: governance.medicalBoundary.status,
          sourcePolicy: governance.sourcePolicy.mode,
        },
        mediaProvenance: {
          version: mediaProvenance.version,
          assets: mediaProvenance.assets.length,
          stockMedia: mediaProvenance.policy.stockMedia,
        },
        motionMedia: {
          version: mediaManifest.version,
          videoSlots: Object.keys(mediaManifest.video).length,
          enabledVideoSlots: Object.values(mediaManifest.video).filter((slot) => slot.enabled).length,
        },
        dataExports: {
          referenceBooks: referenceBookExport.records.length,
          remedies: remedyExport.records.length,
          citationNotes: citationNotesExport.records.length,
          herbalKnowledge: herbalKnowledgeExport.records.length,
          herbalKnowledgeSources: herbalKnowledgeExport.sources.length,
          sources: sourceRegistryExport.records.length,
          discoveryDatasets: discoveryMetadata.datasets.length,
          discoveryPublicSurfaces: discoveryMetadata.publicSurfaces.length,
          apiEndpoints: apiCatalog.endpointCount,
          publicApiEndpoints: apiCatalog.publicEndpointCount,
          protectedApiEndpoints: apiCatalog.protectedEndpointCount,
          openSearch: true,
        },
        herbalKnowledge: {
          source: herbalKnowledge.source,
          records: herbalKnowledge.records.length,
          gingerMatches: gingerHerbalKnowledge.records.length,
          chatModel: herbalChat.model,
          chatCitations: herbalChat.citations.length,
        },
      },
    },
    null,
    2,
  ),
)
