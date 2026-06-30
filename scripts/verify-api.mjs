const baseUrl = process.argv[2] ?? process.env.HERBALISTI_BASE_URL ?? 'http://127.0.0.1:8788'

const readJson = async (path) => {
  const response = await fetch(new URL(path, baseUrl))
  const text = await response.text()
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}: ${text}`)
  }
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`${path} did not return valid JSON`)
  }
}

const readTextResponse = async (path) => {
  const response = await fetch(new URL(path, baseUrl))
  const text = await response.text()
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}: ${text}`)
  }
  return {
    text,
    contentType: response.headers.get('content-type') ?? '',
    cacheControl: response.headers.get('cache-control') ?? '',
  }
}

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const herbalSourceUrlPattern = /^https:\/\/(www\.gutenberg\.org\/ebooks\/|wellcomecollection\.org\/works\/|collections\.nlm\.nih\.gov\/catalog\/)/i
const allowedHerbalLicenses = new Set(['public_domain_usa', 'public_domain_mark', 'pdm', 'cc-by'])
const allowedReferenceStatuses = new Set(['public_domain_us', 'public_domain_mark', 'pdm', 'cc-by'])
const allowedReferenceLanes = new Set(['US', 'UK', 'Australia'])

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
  assert(health.name === 'Herbalisti operational health', '/api/health should return the Herbalisti health name')
  assert(health.status === 'ok', '/api/health should report ok')
  assert(health.domain === 'herbalisti.com', '/api/health should report the production domain')
  assert(
    expectedHealthSurfaces.every((surface) => health.surfaces?.[surface] === true),
    '/api/health should expose every public launch surface',
  )
  assert(typeof health.bindings?.d1 === 'boolean', '/api/health should expose D1 binding presence as a boolean')
  assert(
    typeof health.bindings?.r2Media === 'boolean',
    '/api/health should expose R2 media binding presence as a boolean',
  )
  assert(
    ['configured', 'disabled'].includes(health.protectedFeatures?.feedRefresh),
    '/api/health should expose protected feed refresh feature state without secret values',
  )
  assert(
    ['configured', 'disabled'].includes(health.protectedFeatures?.seedanceMediaJobs),
    '/api/health should expose protected Seedance feature state without secret values',
  )
  assert(
    ['configured', 'not_required'].includes(health.protectedFeatures?.serverSideOpenAiImages),
    '/api/health should expose OpenAI image feature state without secret values',
  )
  assert(
    ['configured', 'fallback_only'].includes(health.protectedFeatures?.serverSideOpenAiHerbalChat),
    '/api/health should expose hosted herbal chat feature state without secret values',
  )
  assert(health.feed?.sourcePolicy?.includes('Herbalisti allowlist'), '/api/health should expose source policy')
  assert(Object.hasOwn(health.feed ?? {}, 'latestRefresh'), '/api/health should expose latestRefresh')
  assert(health.launchBoundary?.medicalAdvice === 'disabled', '/api/health should disable medical advice')
  assert(health.launchBoundary?.publicAccounts === 'disabled', '/api/health should disable public accounts')
  assert(health.launchBoundary?.sourceMode === 'allowlist_first', '/api/health should preserve allowlist-first mode')
}

const booksAll = await readJson('/api/books')
assert(Array.isArray(booksAll.books), '/api/books must return a books array')
assert(booksAll.books.length >= 1000, '/api/books should return the corpus-scale public archive')
assert(
  booksAll.books.every(
    (book) =>
      herbalSourceUrlPattern.test(book.externalUrl ?? '') && allowedReferenceStatuses.has(String(book.sourceStatus ?? '')),
  ),
  '/api/books should expose only rights-cleared corpus records',
)
assert(
  booksAll.books.every(
    (book) =>
      allowedReferenceLanes.has(String(book.rightsLane ?? '')) &&
      Array.isArray(book.searchRegions) &&
      book.searchRegions.length >= 1 &&
      book.searchRegions.every((region) => allowedReferenceLanes.has(String(region ?? ''))),
  ),
  '/api/books should expose searchable rights-lane metadata for US, UK, and Australia filtering',
)

const ukBooks = await readJson('/api/books?region=UK')
assert(ukBooks.books.length >= 1, '/api/books?region=UK should return at least one UK-lane record')
assert(
  ukBooks.books.every((book) => Array.isArray(book.searchRegions) && book.searchRegions.includes('UK')),
  '/api/books?region=UK should only return UK-lane records',
)

const usBooks = await readJson('/api/books?region=US')
assert(usBooks.books.length >= 1, '/api/books?region=US should return at least one US-lane record')
assert(
  usBooks.books.every((book) => Array.isArray(book.searchRegions) && book.searchRegions.includes('US')),
  '/api/books?region=US should only return US-lane records',
)

const australiaBooks = await readJson('/api/books?region=Australia')
assert(Array.isArray(australiaBooks.books), '/api/books?region=Australia should return a books array even when sparse')
assert(
  australiaBooks.books.every((book) => Array.isArray(book.searchRegions) && book.searchRegions.includes('Australia')),
  '/api/books?region=Australia should only return Australia-lane records',
)

const coffinBooks = await readJson('/api/books?query=Coffin')
assert(
  coffinBooks.books.some((book) => book.id === 'wellcome-ajcphwk7' || book.id === 'wellcome-jksmvzyw'),
  'Book search for Coffin should find the Coffin botanic guide records',
)

const safetyBooks = await readJson('/api/books?mode=Safety')
assert(safetyBooks.books.length >= 1, 'Safety mode should return at least one record')
assert(
  safetyBooks.books.every((book) => book.mode === 'Safety'),
  'Safety mode should only return Safety records',
)

const bulliardBooks = await readJson('/api/books?query=Bulliard')
const bulliardRecord = bulliardBooks.books.find((book) => book.id === 'nlm-2165030R')
assert(bulliardRecord, 'Author search should find the botanical dictionary record')
assert(
  bulliardRecord.authors.includes('Bulliard, Pierre, 1752-1793.'),
  'The botanical dictionary record should preserve the catalogued author attribution',
)
assert(
  bulliardRecord.sourceStatus === 'public_domain_mark',
  'The botanical dictionary record should keep its rights-cleared source status',
)

const publisherBooks = await readJson('/api/books?query=Wellcome%20Collection')
assert(
  publisherBooks.books.some((book) => book.publisher === 'Wellcome Collection'),
  'Book search should include collection metadata',
)

const ukSearch = await readJson('/api/search?query=Coffin&region=UK')
assert(
  ukSearch.groups?.some(
    (group) => group.id === 'references' && group.items.some((item) => item.id === 'book-wellcome-ajcphwk7'),
  ),
  '/api/search should allow UK-lane reference filtering',
)

const usSearch = await readJson('/api/search?query=Bulliard&region=US')
assert(
  usSearch.groups?.some(
    (group) => group.id === 'references' && group.items.some((item) => item.id === 'book-nlm-2165030R'),
  ),
  '/api/search should allow US-lane reference filtering',
)

const herbalKnowledge = await readJson('/api/herbal-knowledge')
assert(Array.isArray(herbalKnowledge.records), '/api/herbal-knowledge must return records array')
assert(
  herbalKnowledge.records.length >= 100,
  '/api/herbal-knowledge should return the corpus-scale public-domain herbal commons',
)
const herbalCorpusProfiles = herbalKnowledge.records.filter((record) => record.entryKind === 'corpus-profile')
assert(
  herbalCorpusProfiles.length >= 100,
  '/api/herbal-knowledge should expose corpus-derived herb profiles',
)
assert(
  herbalCorpusProfiles.every(
    (record) =>
      Number(record.corpusWorkCount ?? 0) > 0 &&
      Number(record.corpusChunkCount ?? 0) > 0 &&
      String(record.sourceNote ?? '').includes('source-linked'),
  ),
  '/api/herbal-knowledge corpus profiles should include source-linked corpus scale metadata',
)
assert(Array.isArray(herbalKnowledge.sources), '/api/herbal-knowledge should return source works')
assert(
  herbalKnowledge.sources.length >= 150 &&
    herbalKnowledge.sources.every(
      (source) =>
        herbalSourceUrlPattern.test(source.sourceUrl ?? '') &&
        allowedHerbalLicenses.has(String(source.licenseStatus ?? '')),
    ),
  '/api/herbal-knowledge source works should be rights-cleared historical source records',
)
assert(
  herbalKnowledge.records.every(
    (record) =>
      record.name &&
      (record.botanicalName || record.displayLabel || (Array.isArray(record.categories) && record.categories.length > 0)) &&
      Array.isArray(record.mayHelpWith) &&
      Array.isArray(record.considerations) &&
      Array.isArray(record.sourceIds),
  ),
  '/api/herbal-knowledge records should include herb, context, considerations, and source ids',
)

const gingerHerbalKnowledge = await readJson('/api/herbal-knowledge?query=ginger')
assert(
  gingerHerbalKnowledge.records.some((record) => record.id === 'ginger'),
  '/api/herbal-knowledge search should find ginger',
)

const herbalChat = await readJson('/api/herbal-chat?query=ginger')
assert(
  ['herbalisti-local-rag-small-v1', 'herbalisti-corpus-memory-rag-v1'].includes(herbalChat.model) ||
    /^gpt-5(?:\.\d+)?(?:-[a-z0-9.]+)?$/i.test(String(herbalChat.model ?? '')),
  '/api/herbal-chat should expose a supported herbal retrieval model id',
)
assert(herbalChat.answer?.includes('Ginger'), '/api/herbal-chat should answer from the ginger index record')
assert(Array.isArray(herbalChat.citations) && herbalChat.citations.length > 0, '/api/herbal-chat should cite source works')
assert(
  herbalChat.policy?.includes('not medical advice') &&
    ['public-domain-herbal-index', 'corpus-memory-public-domain-herbal-index'].includes(herbalChat.source),
  '/api/herbal-chat should expose the educational boundary and source layer',
)

const citationNotes = await readJson('/api/citation-notes')
assert(Array.isArray(citationNotes.notes), '/api/citation-notes must return a notes array')
assert(citationNotes.notes.length >= 10, '/api/citation-notes should return the launch citation notes')
assert(
  new Set(citationNotes.notes.map((note) => note.sourceType)).size >= 4,
  '/api/citation-notes should cover references, remedies, signals, and governance',
)
assert(
  citationNotes.notes.every((note) => note.sourceUrl?.startsWith('https://') && Array.isArray(note.tags)),
  'Every citation note should include an HTTPS source URL and tags',
)

const remedyCitationNotes = await readJson('/api/citation-notes?type=remedy')
assert(
  remedyCitationNotes.notes.length > 0 && remedyCitationNotes.notes.every((note) => note.sourceType === 'remedy'),
  'Citation note type filter should return only remedy notes',
)

const gingerCitationNotes = await readJson('/api/citation-notes?query=ginger')
assert(
  gingerCitationNotes.notes.some((note) => note.id === 'ginger-nccih-source'),
  'Citation note search should find the ginger source note',
)

const remediesAll = await readJson('/api/remedies')
assert(Array.isArray(remediesAll.remedies), '/api/remedies must return a remedies array')
assert(remediesAll.remedies.length >= 20, '/api/remedies should return the core remedy index')
assert(
  remediesAll.remedies.every(
    (remedy) =>
      remedy.name &&
      remedy.botanicalName &&
      Array.isArray(remedy.plantParts) &&
      remedy.plantParts.length > 0 &&
      remedy.safetySummary &&
      remedy.sourceUrl,
  ),
  'Every remedy should include name, botanicalName, plantParts, safetySummary, and sourceUrl',
)
assert(
  remediesAll.remedies.every((remedy) => remedy.sourceUrl.startsWith('https://www.nccih.nih.gov/health/')),
  'Remedy source URLs should use the public NCCIH source index',
)

const gingerRemedies = await readJson('/api/remedies?query=ginger')
assert(
  gingerRemedies.remedies.some((remedy) => remedy.id === 'ginger' && remedy.botanicalName === 'Zingiber officinale'),
  'Remedy search for ginger should find the ginger botanical record',
)
const rhizomeRemedies = await readJson('/api/remedies?query=rhizome')
assert(
  rhizomeRemedies.remedies.some(
    (remedy) => remedy.id === 'ginger' && remedy.plantParts.includes('Rhizome'),
  ),
  'Remedy search should include plant-part metadata such as rhizome',
)

const infusionRemedies = await readJson('/api/remedies?preparation=Infusion')
assert(
  infusionRemedies.remedies.length > 0 &&
    infusionRemedies.remedies.every((remedy) =>
      remedy.preparations.some((preparation) => preparation.includes('Infusion')),
    ),
  'Remedy preparation filter should return only infusion records',
)

const interactionRemedies = await readJson('/api/remedies?query=anticoagulant')
assert(
  interactionRemedies.remedies.some((remedy) => remedy.id === 'st-johns-wort' || remedy.id === 'garlic'),
  'Remedy search should include safety and interaction text',
)

const graphAll = await readJson('/api/graph')
assert(Array.isArray(graphAll.nodes), '/api/graph must return a nodes array')
assert(Array.isArray(graphAll.edges), '/api/graph must return an edges array')
assert(graphAll.nodes.filter((node) => node.type === 'Remedy').length >= 20, '/api/graph should include remedy nodes')
assert(graphAll.edges.length >= 200, '/api/graph should include the source-led plant-part relationship layer')
const graphRelations = new Set(graphAll.edges.map((edge) => edge.relation))
for (const relation of ['RELATED_TO', 'HAS_PART', 'PREPARED_AS', 'TRADITIONAL_CONTEXT', 'SAFETY_WATCH']) {
  assert(graphRelations.has(relation), `/api/graph should include ${relation} edges`)
}
assert(!graphRelations.has('TREATS'), '/api/graph must not expose treatment-claim relations')
assert(
  graphAll.policy?.includes('not treatment claims'),
  '/api/graph should expose the non-treatment-claim policy',
)

const gingerGraph = await readJson('/api/graph?query=ginger')
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

const safetyGraph = await readJson('/api/graph?query=St.%20John%27s&relation=SAFETY_WATCH')
assert(
  safetyGraph.edges.length > 0 && safetyGraph.edges.every((edge) => edge.relation === 'SAFETY_WATCH'),
  '/api/graph relation filter should return only safety-watch edges',
)
const plantPartGraph = await readJson('/api/graph?query=ginger&relation=HAS_PART')
assert(
  plantPartGraph.edges.length > 0 && plantPartGraph.edges.every((edge) => edge.relation === 'HAS_PART'),
  '/api/graph relation filter should return only plant-part edges',
)
assert(
  safetyGraph.nodes.some((node) => node.type === 'Safety' && node.label.includes('Antidepressant')),
  "St. John's wort graph should include antidepressant safety-watch context",
)

const unifiedSearch = await readJson('/api/search?query=ginger')
assert(Array.isArray(unifiedSearch.groups), '/api/search must return grouped results')
assert(unifiedSearch.groups.length >= 5, '/api/search should return reference, remedy, signal, note, and source groups')
assert(unifiedSearch.total > 0, '/api/search should report matches for ginger')
assert(
  unifiedSearch.groups.some(
    (group) => group.id === 'herbs' && group.items.some((item) => item.title === 'Ginger'),
  ) ||
    unifiedSearch.groups.some(
      (group) => group.id === 'remedies' && group.items.some((item) => item.title === 'Ginger'),
    ),
  'Unified search should include the ginger herb or remedy result',
)
assert(
  unifiedSearch.groups.some((group) => group.id === 'notes' && group.items.some((item) => item.id === 'note-ginger-nccih-source')),
  'Unified search should include the ginger citation note result',
)
assert(
  unifiedSearch.groups.every((group) => typeof group.total === 'number' && Array.isArray(group.items)),
  'Unified search groups should include totals and result arrays',
)

const sources = await readJson('/api/sources')
assert(Array.isArray(sources.sources), '/api/sources must return a sources array')
assert(sources.sources.length >= 6, '/api/sources should return the initial allowlisted source registry')
assert(
  sources.sources.every((source) => source.isAllowlisted && !source.isBigPharmaRelated),
  '/api/sources should only return allowlisted non-Big-Pharma sources',
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
  '/api/sources should expose source independence review metadata',
)
assert(
  sources.sources.some((source) => source.id === 'pubmed') &&
    sources.sources.some((source) => source.id === 'fightaging'),
  '/api/sources should include public research and independent longevity sources',
)
assert(
  sources.sources.some((source) => source.id === 'pubmed' && source.feedName === 'PubMed / NCBI') &&
    sources.sources.some((source) => source.id === 'crossref' && source.feedName === 'Crossref'),
  '/api/sources should expose feedName values for signal source filters',
)
assert(
  sources.sources.some(
    (source) =>
      source.id === 'fightaging' &&
      source.independenceStatus === 'independent-longevity-commentary-disclosed-conflict',
  ),
  '/api/sources should expose disclosed-conflict commentary status for Fight Aging',
)

const longevitySources = await readJson('/api/sources?query=longevity')
assert(
  longevitySources.sources.some((source) => source.id === 'lifespan' || source.id === 'fightaging'),
  'Source registry search should find independent longevity sources',
)

const conflictSources = await readJson('/api/sources?query=disclosed%20conflict')
assert(
  conflictSources.sources.some((source) => source.id === 'fightaging'),
  'Source registry search should include source review metadata',
)

const sourceHealth = await readJson('/api/source-health')
assert(Array.isArray(sourceHealth.sources), '/api/source-health must return a sources array')
assert(sourceHealth.sources.length >= 6, '/api/source-health should report the launch source set')
assert(typeof sourceHealth.healthyCount === 'number', '/api/source-health should report healthyCount')
assert(typeof sourceHealth.emptyCount === 'number', '/api/source-health should report emptyCount')
assert(typeof sourceHealth.warningCount === 'number', '/api/source-health should report warningCount')
assert(
  sourceHealth.sources.every((source) => source.isAllowlisted && !source.isBigPharmaRelated),
  '/api/source-health should only report allowlisted non-Big-Pharma sources',
)
assert(
  sourceHealth.sources.every((source) => ['ok', 'warning', 'empty'].includes(source.status)),
  '/api/source-health should report a known source status for every source',
)
assert(
  sourceHealth.sources.some((source) => source.id === 'pubmed') &&
    sourceHealth.sources.some((source) => source.id === 'fightaging'),
  '/api/source-health should cover public research and independent longevity sources',
)
assert(
  sourceHealth.sourceHealthPolicy?.includes('allowlisted'),
  '/api/source-health should expose source health policy text',
)

const signalIntelligence = await readJson('/api/signal-intelligence')
assert(
  typeof signalIntelligence.totalSignals === 'number',
  '/api/signal-intelligence should report totalSignals',
)
assert(
  Array.isArray(signalIntelligence.topicCoverage) && signalIntelligence.topicCoverage.length >= 8,
  '/api/signal-intelligence should expose topicCoverage for the launch topic surface',
)
assert(Array.isArray(signalIntelligence.topTopics), '/api/signal-intelligence should expose topTopics')
assert(Array.isArray(signalIntelligence.sourceMix), '/api/signal-intelligence should expose sourceMix')
assert(
  signalIntelligence.policy?.includes('not medical guidance'),
  '/api/signal-intelligence should expose the metadata-only policy boundary',
)
assert(
  typeof signalIntelligence.coveragePercent === 'number' &&
    signalIntelligence.coveragePercent >= 0 &&
    signalIntelligence.coveragePercent <= 100,
  '/api/signal-intelligence should report a bounded coveragePercent',
)

const feedStatus = await readJson('/api/feed-status')
assert(
  feedStatus.sourcePolicy?.includes('Herbalisti allowlist'),
  '/api/feed-status should return the Herbalisti source policy',
)
assert(
  Object.hasOwn(feedStatus, 'latestRefresh'),
  '/api/feed-status should expose a latestRefresh field',
)

const health = await readJson('/api/health')
assertOperationalHealth(health)

const blockedSourcePattern = /pfizer|moderna|novartis|roche|merck|gsk|astrazeneca|sanofi|bayer|johnson\s*&\s*johnson/i
const signalsRss = await readTextResponse('/api/signals.xml?live=1&source=Crossref')
const signalsRssItemCount = [...signalsRss.text.matchAll(/<item>/g)].length
assert(
  signalsRss.contentType.includes('application/rss+xml'),
  '/api/signals.xml should return an RSS XML content type',
)
assert(
  signalsRss.cacheControl.includes('max-age=900'),
  '/api/signals.xml should expose a short public cache policy',
)
assert(signalsRss.text.includes('<title>Herbalisti Signals</title>'), '/api/signals.xml should name the feed')
assert(signalsRss.text.includes('Herbalisti allowlist'), '/api/signals.xml should include the source policy')
assert(signalsRss.text.includes('not medical advice'), '/api/signals.xml should include the medical boundary')
assert(signalsRss.text.includes('<category>Crossref</category>'), '/api/signals.xml source filter should emit Crossref categories')
assert(signalsRssItemCount > 0, '/api/signals.xml should return at least one RSS item')
assert(!blockedSourcePattern.test(signalsRss.text), '/api/signals.xml should not include blocked source text')

const liveNews = await readJson('/api/news?live=1')
assert(Array.isArray(liveNews.items), '/api/news?live=1 must return an items array')
assert(liveNews.items.length > 0, '/api/news?live=1 should return feed items')
assert(
  liveNews.items.every((item) => item.title && item.sourceName && item.url && item.publishedAt),
  'Every news item should include title, sourceName, url, and publishedAt',
)

const dnaNews = await readJson('/api/news?live=1&topic=DNA%20modification')
assert(Array.isArray(dnaNews.items), '/api/news?topic=DNA modification must return an items array')
assert(
  dnaNews.items.every((item) => item.topics.includes('DNA modification')),
  'DNA modification topic filter should only return DNA modification items',
)
assert(
  dnaNews.total === dnaNews.items.length,
  'Filtered news payload total should match the returned item count',
)

const crossrefNews = await readJson('/api/news?live=1&source=Crossref')
assert(Array.isArray(crossrefNews.items), '/api/news source filter must return an items array')
assert(crossrefNews.items.length > 0, 'Crossref source filter should return at least one current feed item')
assert(
  crossrefNews.items.every((item) => item.sourceName === 'Crossref'),
  'Crossref source filter should only return Crossref items',
)
assert(
  crossrefNews.total === crossrefNews.items.length,
  'Source-filtered news payload total should match the returned item count',
)

const sourceTopicNews = await readJson('/api/news?live=1&source=Crossref&topic=Gene%20therapy')
assert(
  sourceTopicNews.items.every(
    (item) => item.sourceName === 'Crossref' && item.topics.includes('Gene therapy'),
  ),
  'Combined source and topic filtering should apply both filters',
)

const noMatchNews = await readJson('/api/news?live=1&query=unlikely-herbalisti-no-match-24680')
assert(Array.isArray(noMatchNews.items), '/api/news no-match query must still return an items array')
assert(noMatchNews.items.length === 0, '/api/news no-match query should return an empty items array')
assert(noMatchNews.total === 0, '/api/news no-match query should report total 0')

console.log(
  JSON.stringify(
    {
      baseUrl,
      booksSource: booksAll.source,
      bookCount: booksAll.books.length,
      coffinMatches: coffinBooks.books.length,
      safetyMatches: safetyBooks.books.length,
      bulliardMatches: bulliardBooks.books.length,
      publisherMetadataMatches: publisherBooks.books.length,
      herbalKnowledgeSource: herbalKnowledge.source,
      herbalKnowledgeRecords: herbalKnowledge.records.length,
      herbalKnowledgeSources: herbalKnowledge.sources.length,
      gingerHerbalKnowledgeMatches: gingerHerbalKnowledge.records.length,
      herbalChatModel: herbalChat.model,
      herbalChatCitations: herbalChat.citations.length,
      citationNoteSource: citationNotes.source,
      citationNoteCount: citationNotes.notes.length,
      remedyCitationMatches: remedyCitationNotes.notes.length,
      gingerCitationMatches: gingerCitationNotes.notes.length,
      remedySource: remediesAll.source,
      remedyCount: remediesAll.remedies.length,
      gingerRemedyMatches: gingerRemedies.remedies.length,
      rhizomeRemedyMatches: rhizomeRemedies.remedies.length,
      infusionRemedyMatches: infusionRemedies.remedies.length,
      interactionRemedyMatches: interactionRemedies.remedies.length,
      graphSource: graphAll.source,
      graphNodes: graphAll.nodes.length,
      graphEdges: graphAll.edges.length,
      gingerGraphNodes: gingerGraph.nodes.length,
      plantPartGraphEdges: plantPartGraph.edges.length,
      safetyGraphEdges: safetyGraph.edges.length,
      unifiedSearchSource: unifiedSearch.source,
      unifiedSearchTotal: unifiedSearch.total,
      sourceRegistrySource: sources.source,
      sourceRegistryCount: sources.sources.length,
      longevitySourceMatches: longevitySources.sources.length,
      conflictSourceMatches: conflictSources.sources.length,
      sourceHealthCount: sourceHealth.sources.length,
      sourceHealthHealthy: sourceHealth.healthyCount,
      sourceHealthEmpty: sourceHealth.emptyCount,
      sourceHealthWarnings: sourceHealth.warningCount,
      signalIntelligenceSource: signalIntelligence.source,
      signalIntelligenceSignals: signalIntelligence.totalSignals,
      signalIntelligenceTopics: signalIntelligence.representedTopics,
      signalIntelligenceSources: signalIntelligence.representedSources,
      feedStatusSource: feedStatus.source,
      feedStatusLatestRefresh: Boolean(feedStatus.latestRefresh),
      signalsRssItems: signalsRssItemCount,
      signalsRssContentType: signalsRss.contentType,
      healthStatus: health.status,
      healthD1Bound: health.bindings.d1,
      healthR2Bound: health.bindings.r2Media,
      newsSource: liveNews.source,
      newsCount: liveNews.items.length,
      dnaTopicMatches: dnaNews.items.length,
      crossrefSourceMatches: crossrefNews.items.length,
      crossrefGeneTherapyMatches: sourceTopicNews.items.length,
      noMatchNewsCount: noMatchNews.items.length,
      warnings: liveNews.warnings?.length ?? 0,
    },
    null,
    2,
  ),
)
