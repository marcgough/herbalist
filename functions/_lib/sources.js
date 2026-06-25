export const fallbackSourceRegistry = [
  {
    id: 'pubmed',
    name: 'NCBI / PubMed E-utilities',
    feedName: 'PubMed / NCBI',
    url: 'https://www.ncbi.nlm.nih.gov/home/develop/api/',
    feedUrl: '',
    sourceType: 'public-research-index',
    role: 'Public biomedical research index',
    notes: 'Public biomedical metadata. Query with topic filters and source-name blocklist.',
    isAllowlisted: true,
    isBigPharmaRelated: false,
    independenceStatus: 'public-government-research-index',
    ownershipReview: 'US public biomedical information infrastructure; no Big Pharma ownership signal in launch review.',
    reviewEvidenceUrl: 'https://www.ncbi.nlm.nih.gov/',
    reviewCadence: 'quarterly_or_before_source_expansion',
    lastReviewed: '2026-06-16',
    reviewNote: 'Allowed as a public research index, not as editorial medical authority.',
  },
  {
    id: 'arxiv',
    name: 'arXiv API',
    feedName: 'arXiv',
    url: 'https://info.arxiv.org/help/api/user-manual.html',
    feedUrl: '',
    sourceType: 'public-research-index',
    role: 'Open preprint metadata for computational and quantitative biology',
    notes: 'Open preprint metadata. Keep title-level matching strict to reduce unrelated computational results.',
    isAllowlisted: true,
    isBigPharmaRelated: false,
    independenceStatus: 'open-access-preprint-infrastructure',
    ownershipReview:
      'Cornell-hosted open-access service with independent nonprofit transition announced; no Big Pharma ownership signal in launch review.',
    reviewEvidenceUrl: 'https://info.arxiv.org/about/index.html',
    reviewCadence: 'quarterly_or_before_source_expansion',
    lastReviewed: '2026-06-16',
    reviewNote: 'Allowed as open preprint metadata; topic matching stays strict to reduce irrelevant frontier-biology results.',
  },
  {
    id: 'biorxiv',
    name: 'bioRxiv / medRxiv API',
    feedName: 'bioRxiv',
    url: 'https://api.biorxiv.org/',
    feedUrl: '',
    sourceType: 'preprint-server',
    role: 'Public preprint metadata for biology and medicine',
    notes: 'Public biology and medicine preprint metadata.',
    isAllowlisted: true,
    isBigPharmaRelated: false,
    independenceStatus: 'nonprofit-preprint-infrastructure',
    ownershipReview:
      'Cold Spring Harbor Laboratory preprint infrastructure; medRxiv partnership includes Yale and BMJ; no Big Pharma ownership signal in launch review.',
    reviewEvidenceUrl: 'https://www.cshl.edu/partner-with-us/preprints/',
    reviewCadence: 'quarterly_or_before_source_expansion',
    lastReviewed: '2026-06-16',
    reviewNote: 'Allowed as public preprint metadata; clinical claims still require human interpretation.',
  },
  {
    id: 'crossref',
    name: 'Crossref REST API',
    feedName: 'Crossref',
    url: 'https://www.crossref.org/documentation/retrieve-metadata/rest-api/',
    feedUrl: '',
    sourceType: 'public-research-index',
    role: 'Public scholarly metadata search',
    notes: 'Scholarly metadata enrichment source for current library and signal expansion.',
    isAllowlisted: true,
    isBigPharmaRelated: false,
    independenceStatus: 'not-for-profit-scholarly-infrastructure',
    ownershipReview: 'Not-for-profit scholarly metadata membership infrastructure; no Big Pharma ownership signal in launch review.',
    reviewEvidenceUrl: 'https://www.crossref.org/membership/terms/',
    reviewCadence: 'quarterly_or_before_source_expansion',
    lastReviewed: '2026-06-16',
    reviewNote: 'Allowed as metadata infrastructure; publisher-level records remain subject to title/source filtering.',
  },
  {
    id: 'lifespan',
    name: 'Lifespan.io',
    feedName: 'Lifespan.io',
    url: 'https://www.lifespan.io/news/',
    feedUrl: 'https://www.lifespan.io/feed/',
    sourceType: 'independent-longevity',
    role: 'Independent longevity coverage',
    notes: 'Independent longevity coverage.',
    isAllowlisted: true,
    isBigPharmaRelated: false,
    independenceStatus: 'independent-longevity-nonprofit',
    ownershipReview: 'Longevity advocacy and research institute source; no Big Pharma ownership signal in launch review.',
    reviewEvidenceUrl: 'https://lifespan.io/',
    reviewCadence: 'quarterly_or_before_source_expansion',
    lastReviewed: '2026-06-16',
    reviewNote: 'Allowed as independent longevity coverage with source traceability.',
  },
  {
    id: 'fightaging',
    name: 'Fight Aging!',
    feedName: 'Fight Aging!',
    url: 'https://www.fightaging.org/',
    feedUrl: 'https://www.fightaging.org/feed/',
    sourceType: 'independent-longevity',
    role: 'Independent longevity commentary',
    notes: 'Independent longevity commentary.',
    isAllowlisted: true,
    isBigPharmaRelated: false,
    independenceStatus: 'independent-longevity-commentary-disclosed-conflict',
    ownershipReview:
      'Independent longevity commentary source; writer discloses biotech company role, so content is labeled as commentary rather than primary evidence.',
    reviewEvidenceUrl: 'https://www.fightaging.org/about/',
    reviewCadence: 'quarterly_or_before_source_expansion',
    lastReviewed: '2026-06-16',
    reviewNote: 'Allowed as commentary with disclosed conflict context, not as a primary research index.',
  },
]

const pharmaBlocklist = [
  'abbvie',
  'amgen',
  'astrazeneca',
  'bayer',
  'biogen',
  'boehringer',
  'bristol myers',
  'eli lilly',
  'gilead',
  'glaxosmithkline',
  'gsk',
  'johnson & johnson',
  'merck',
  'moderna',
  'novartis',
  'novo nordisk',
  'pfizer',
  'roche',
  'sanofi',
]

const normalizeQuery = (value) => String(value ?? '').trim().slice(0, 120)

const textHasBlockedSource = (value) => {
  const lower = value.toLowerCase()
  return pharmaBlocklist.some((blocked) => lower.includes(blocked))
}

const sourceFromD1 = (record) => ({
  id: record.id,
  name: record.name,
  feedName: record.feed_name || record.name,
  url: record.url,
  feedUrl: record.feed_url ?? '',
  sourceType: record.source_type,
  role: record.notes || record.source_type,
  notes: record.notes ?? '',
  isAllowlisted: Boolean(record.is_allowlisted),
  isBigPharmaRelated: Boolean(record.is_big_pharma_related),
  independenceStatus: record.independence_status ?? '',
  ownershipReview: record.ownership_review ?? '',
  reviewEvidenceUrl: record.review_evidence_url ?? '',
  reviewCadence: record.review_cadence ?? '',
  lastReviewed: record.last_reviewed ?? '',
  reviewNote: record.review_note ?? '',
})

export const filterSources = (sources, { query = '' } = {}) => {
  const normalizedQuery = normalizeQuery(query)

  return sources
    .filter((source) => source.isAllowlisted && !source.isBigPharmaRelated)
    .filter((source) => !textHasBlockedSource(`${source.name} ${source.url} ${source.notes}`))
    .filter((source) => {
      if (!normalizedQuery) {
        return true
      }

      return [
        source.name,
        source.url,
        source.feedUrl,
        source.sourceType,
        source.role,
        source.notes,
        source.independenceStatus,
        source.ownershipReview,
        source.reviewEvidenceUrl,
        source.reviewCadence,
        source.lastReviewed,
        source.reviewNote,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery.toLowerCase())
    })
}

export const readSourcesFromD1 = async (db, filters = {}) => {
  const result = await db
    .prepare(
      `SELECT
         id,
         name,
         feed_name,
         url,
         feed_url,
         source_type,
         is_allowlisted,
         is_big_pharma_related,
         notes,
         independence_status,
         ownership_review,
         review_evidence_url,
         review_cadence,
         last_reviewed,
         review_note
       FROM feed_sources
       ORDER BY name COLLATE NOCASE`,
    )
    .all()

  return filterSources((result.results ?? []).map(sourceFromD1), filters)
}

export const getSourcesPayload = async (env, filters = {}) => {
  const normalizedFilters = {
    query: normalizeQuery(filters.query),
  }
  let sources = filterSources(fallbackSourceRegistry, normalizedFilters)
  let source = 'static-fallback'

  if (env.HERBALISTI_DB) {
    sources = await readSourcesFromD1(env.HERBALISTI_DB, normalizedFilters)
    source = 'd1'
  }

  return {
    generatedAt: new Date().toISOString(),
    source,
    sourcePolicy:
      'Allowlist-first public research and independent longevity sources. Big Pharma-related channels are excluded unless explicitly approved.',
    filters: normalizedFilters,
    total: sources.length,
    sources,
  }
}
