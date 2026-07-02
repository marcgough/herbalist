import { XMLParser } from 'fast-xml-parser'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  trimValues: true,
})

export const sourcePolicyText =
  'Herbalisti allowlist: public research APIs and independent longevity sources; Big Pharma names and off-topic metadata drift filtered before publication.'

export const pharmaBlocklist = [
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

const topicMatchers = [
  ['Longevity', /\b(longevity|aging|ageing|senescence|lifespan|healthspan|rejuvenation)\b/i],
  ['Peptides', /\b(peptide|peptides|protein therapeutic)\b/i],
  ['Gene therapy', /gene therapy|viral vector|aav|lentiviral/i],
  ['Gene editing', /gene editing|base editing|prime editing|genome editing/i],
  ['CRISPR', /crispr|cas9|cas12|cas13/i],
  ['DNA modification', /dna modification|epigenetic|methylation|chromatin/i],
  ['Health as a service', /health service|health as a service|longevity as a service|preventive health|personalized health|digital health/i],
  ['Self-sovereign wellbeing', /self-sovereign|self sovereign|personal agency|owned wellbeing|sovereign wellbeing/i],
]

const healthSignalContextMatcher =
  /\b(longevity|healthspan|aging|ageing|senescence|rejuvenation|gene therapy|cell therapy|therapeutic|therapy|clinical|patient|human|medicine|biomedical|disease|healthcare|treatment|oncology|cancer|leukaemia|leukemia|immunotherapy|toxicity|antigen|vaccine|drug discovery|protein therapeutic|epigenetic|methylation|personalized health|preventive health|digital health|health as a service|dna writing|self-sovereign|personal agency|owned wellbeing|wellbeing|wellness)\b/i

const publicResearchHeadlineContextMatcher =
  /\b(longevity|healthspan|aging|ageing|senescence|rejuvenation|peptides?|protein turnover|protein therapeutic|gene therapy|viral vector|aav|lentiviral|gene editing|genome editing|base editing|prime editing|crispr|cas9|cas12|cas13|dna modification|epigenetic|methylation|chromatin|dna writing|personalized health|preventive health|digital health|healthcare chatbots?|smartphone-derived|health service|health as a service|longevity as a service|self-sovereign|self sovereign|personal agency|owned wellbeing|sovereign wellbeing)\b/i

const offTopicResearchContextMatcher =
  /\b(agriculture|agricultural|crop|crops|cotton|rice|maize|wheat|barley|soybean|potato|vegetable|plants?|arabidopsis|abiotic|starch|herbivory|pest|insect|fungal pathogen|plant health exchange|disease resistance|thin films?|sputter|mbe-grown|ciss|mipac|lammps|spica|boltzmann generators?|expansion microscopy|climate-driven mortality forecasting)\b|\blongevity of (innovation|software|systems?|brands?|markets?|networks?|products?|companies|institutions)\b/i

export const newsTopics = topicMatchers.map(([topic]) => topic)
export const newsSourceNames = ['PubMed / NCBI', 'arXiv', 'bioRxiv', 'Crossref', 'Lifespan.io', 'Fight Aging!']

const topicWatchFallbackItems = [
  {
    id: 'watch-pubmed-longevity-healthspan',
    title: 'PubMed longevity and healthspan signal lane',
    sourceName: 'PubMed / NCBI',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=longevity+healthspan+senescence',
    publishedAt: '2026-06-15T00:00:00.000Z',
    summary: 'Public biomedical metadata lane for longevity, healthspan, senescence, and rejuvenation research signals.',
    topics: ['Longevity'],
    sourceType: 'public-research-index',
  },
  {
    id: 'watch-pubmed-peptides',
    title: 'PubMed peptide research signal lane',
    sourceName: 'PubMed / NCBI',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=peptide+peptides+healthspan',
    publishedAt: '2026-06-15T00:00:00.000Z',
    summary: 'Public biomedical metadata lane for peptide research and healthspan-adjacent therapeutic discovery.',
    topics: ['Peptides', 'Longevity'],
    sourceType: 'public-research-index',
  },
  {
    id: 'watch-arxiv-crispr-editing',
    title: 'arXiv CRISPR and gene editing signal lane',
    sourceName: 'arXiv',
    url: 'https://arxiv.org/search/advanced?terms-0-term=CRISPR&terms-0-operator=AND&terms-0-field=all',
    publishedAt: '2026-06-15T00:00:00.000Z',
    summary: 'Open preprint metadata lane for CRISPR, genome editing, and computational biology signals.',
    topics: ['CRISPR', 'Gene editing'],
    sourceType: 'public-research-index',
  },
  {
    id: 'watch-biorxiv-dna-modification',
    title: 'bioRxiv DNA modification signal lane',
    sourceName: 'bioRxiv',
    url: 'https://www.biorxiv.org/search/epigenetic%2520methylation',
    publishedAt: '2026-06-15T00:00:00.000Z',
    summary: 'Public preprint metadata lane for epigenetics, methylation, chromatin, and DNA modification signals.',
    topics: ['DNA modification'],
    sourceType: 'preprint-server',
  },
  {
    id: 'watch-crossref-gene-therapy',
    title: 'Crossref gene therapy metadata lane',
    sourceName: 'Crossref',
    url: 'https://api.crossref.org/works?query.bibliographic=gene%20therapy%20viral%20vector%20AAV',
    publishedAt: '2026-06-15T00:00:00.000Z',
    summary: 'Public scholarly metadata lane for gene therapy, viral vectors, and frontier biomedical publishing.',
    topics: ['Gene therapy'],
    sourceType: 'public-research-index',
  },
  {
    id: 'watch-crossref-health-service',
    title: 'Crossref personalized health service metadata lane',
    sourceName: 'Crossref',
    url: 'https://api.crossref.org/works?query.bibliographic=personalized%20health%20digital%20health%20preventive%20health',
    publishedAt: '2026-06-15T00:00:00.000Z',
    summary: 'Public scholarly metadata lane for personalized health, digital health, preventive health, and health as a service signals.',
    topics: ['Health as a service'],
    sourceType: 'public-research-index',
  },
  {
    id: 'watch-lifespan-independent-longevity',
    title: 'Lifespan.io independent longevity signal lane',
    sourceName: 'Lifespan.io',
    url: 'https://www.lifespan.io/news/',
    publishedAt: '2026-06-15T00:00:00.000Z',
    summary: 'Independent longevity coverage lane for public research context and personally owned wellbeing decisions.',
    topics: ['Longevity', 'Self-sovereign wellbeing'],
    sourceType: 'independent-longevity',
  },
  {
    id: 'watch-fightaging-rejuvenation',
    title: 'Fight Aging independent rejuvenation commentary lane',
    sourceName: 'Fight Aging!',
    url: 'https://www.fightaging.org/',
    publishedAt: '2026-06-15T00:00:00.000Z',
    summary: 'Independent longevity commentary lane for rejuvenation, healthspan, and source-traceable discovery context.',
    topics: ['Longevity', 'Self-sovereign wellbeing'],
    sourceType: 'independent-longevity',
  },
]

export const feedSourceHealthPolicy =
  'Source health checks report allowlisted public or independent sources only; warnings do not add fallback pharma channels.'

const rssSources = [
  {
    id: 'lifespan',
    name: 'Lifespan.io',
    url: 'https://www.lifespan.io/news/',
    feed: 'https://www.lifespan.io/feed/',
    type: 'independent-longevity',
    summary: 'Independent longevity coverage from the Herbalisti source allowlist.',
  },
  {
    id: 'fightaging',
    name: 'Fight Aging!',
    url: 'https://www.fightaging.org/',
    feed: 'https://www.fightaging.org/feed/',
    type: 'independent-longevity',
    summary: 'Independent longevity commentary from the Herbalisti source allowlist.',
  },
]

const asArray = (value) => (Array.isArray(value) ? value : value ? [value] : [])

export const compact = (value) =>
  String(value ?? '')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()

const safeDate = (value) => {
  const date = new Date(value)
  if (!Number.isNaN(date.valueOf())) {
    return date.toISOString()
  }
  return new Date().toISOString()
}

const hashString = (value) => {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  return (hash >>> 0).toString(36)
}

const trackingParams = new Set([
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid',
  'ref',
  'source',
])
const sourceFetchTimeoutMs = 12000
const sourceFetchRetryCount = 1
const sourceFetchRetryDelayMs = 350
const retryableSourceStatusCodes = new Set([408, 429, 500, 502, 503, 504])

export const canonicalUrlKey = (value) => {
  const raw = compact(value)
  if (!raw) {
    return ''
  }

  try {
    const url = new URL(raw)
    url.hash = ''
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, '')

    for (const key of [...url.searchParams.keys()]) {
      const lowerKey = key.toLowerCase()
      if (lowerKey.startsWith('utm_') || trackingParams.has(lowerKey)) {
        url.searchParams.delete(key)
      }
    }

    const sortedParams = [...url.searchParams.entries()].sort(([left], [right]) => left.localeCompare(right))
    url.search = ''
    for (const [key, paramValue] of sortedParams) {
      url.searchParams.append(key, paramValue)
    }

    const pathname =
      url.hostname === 'doi.org'
        ? url.pathname.toLowerCase().replace(/\/+$/, '')
        : url.pathname.replace(/\/+$/, '')
    return `${url.hostname}${pathname || '/'}${url.search}`.toLowerCase()
  } catch {
    return raw.toLowerCase().replace(/[#?].*$/, '').replace(/\/+$/, '')
  }
}

export const canonicalTitleKey = (value) =>
  compact(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['`]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const dedupeNewsItems = (items) => {
  const seenUrls = new Set()
  const seenTitles = new Set()

  return items.filter((item) => {
    const urlKey = canonicalUrlKey(item.url)
    const titleKey = canonicalTitleKey(item.title)
    const titleIsSpecific = titleKey.length >= 28

    if ((urlKey && seenUrls.has(urlKey)) || (titleIsSpecific && seenTitles.has(titleKey))) {
      return false
    }

    if (urlKey) {
      seenUrls.add(urlKey)
    }
    if (titleIsSpecific) {
      seenTitles.add(titleKey)
    }
    return true
  })
}

export const sourceHashForNewsItem = (item) =>
  `${canonicalTitleKey(item.title) || 'untitled'}:${canonicalUrlKey(item.url) || hashString(`${item.sourceName}|${item.url}`)}`

export const textHasBlockedSource = (value) => {
  const lower = value.toLowerCase()
  return pharmaBlocklist.some((blocked) => lower.includes(blocked))
}

export const topicsFor = (text) =>
  topicMatchers.filter(([, matcher]) => matcher.test(text)).map(([topic]) => topic)

export const hasHealthSignalContext = (value) => healthSignalContextMatcher.test(compact(value))

export const hasPublicResearchHeadlineContext = (value) => publicResearchHeadlineContextMatcher.test(compact(value))

export const hasOffTopicResearchContext = (value) => offTopicResearchContextMatcher.test(compact(value))

export const isHealthRelevantNewsItem = (item) => {
  const text = [
    item.title,
    item.summary,
    item.sourceName,
    item.sourceType,
    item.topics,
    item.contextText,
  ]
    .flatMap((part) => (Array.isArray(part) ? part : [part]))
    .filter(Boolean)
    .join(' ')

  if (!hasHealthSignalContext(text)) {
    return false
  }

  if (
    ['public-research-index', 'preprint-server'].includes(item.sourceType) &&
    !hasPublicResearchHeadlineContext(`${item.title} ${item.summary}`)
  ) {
    return false
  }

  return !hasOffTopicResearchContext(text)
}

const normalizeQuery = (value) => String(value ?? '').trim().slice(0, 120)
const escapeLike = (value) => value.replace(/[\\%_]/g, (match) => `\\${match}`)

export const normalizeNewsTopic = (value) => {
  const topic = String(value ?? '').trim()
  if (!topic || topic === 'All') {
    return 'All'
  }

  return newsTopics.includes(topic) ? topic : 'All'
}

export const normalizeNewsSource = (value) => {
  const source = String(value ?? '').trim()
  if (!source || source === 'All sources') {
    return 'All sources'
  }

  return newsSourceNames.includes(source) ? source : 'All sources'
}

const includesQuery = (item, query) => {
  const text = [
    item.title,
    item.summary,
    item.sourceName,
    item.sourceType,
    item.topics,
  ]
    .flatMap((part) => (Array.isArray(part) ? part : [part]))
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return text.includes(query.toLowerCase())
}

export const filterNewsItems = (items, { topic = 'All', source = 'All sources', query = '' } = {}) => {
  const normalizedTopic = normalizeNewsTopic(topic)
  const normalizedSource = normalizeNewsSource(source)
  const normalizedQuery = normalizeQuery(query)

  return items.filter((item) => {
    const topicMatch = normalizedTopic === 'All' || item.topics.includes(normalizedTopic)
    const sourceMatch = normalizedSource === 'All sources' || item.sourceName === normalizedSource
    const queryMatch = normalizedQuery === '' || includesQuery(item, normalizedQuery)
    return topicMatch && sourceMatch && queryMatch
  })
}

const itemCoversTopic = (item, topic) => Array.isArray(item.topics) && item.topics.includes(topic)
const itemCoversSource = (item, sourceName) => item.sourceName === sourceName

const coverageBalancedNewsItems = (items, limit = 24, { includeWatchFallback = true } = {}) => {
  const candidates = includeWatchFallback ? dedupeNewsItems([...items, ...topicWatchFallbackItems]) : items
  const selected = []
  const selectedIds = new Set()
  const coversTopic = (topic) => selected.some((item) => itemCoversTopic(item, topic))
  const coversSource = (sourceName) => selected.some((item) => itemCoversSource(item, sourceName))
  const add = (item) => {
    if (!item || selectedIds.has(item.id) || selected.length >= limit) {
      return
    }

    selected.push(item)
    selectedIds.add(item.id)
  }

  for (const topic of newsTopics) {
    if (coversTopic(topic)) {
      continue
    }

    add(candidates.find((item) => itemCoversTopic(item, topic) && !selectedIds.has(item.id)))
  }

  for (const sourceName of newsSourceNames) {
    if (coversSource(sourceName)) {
      continue
    }

    add(candidates.find((item) => itemCoversSource(item, sourceName) && !selectedIds.has(item.id)))
  }

  for (const item of items) {
    add(item)
  }

  return selected.sort((a, b) => new Date(b.publishedAt).valueOf() - new Date(a.publishedAt).valueOf())
}

const fetchWithTimeout = async (url, fetchImpl = fetch) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), sourceFetchTimeoutMs)

  try {
    return await fetchImpl(url, {
      headers: {
        'User-Agent': 'Herbalisti public-source research feed (contact: hello@herbalisti.com)',
      },
      signal: controller.signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Timed out after ${sourceFetchTimeoutMs}ms: ${url}`)
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const fetchSourceResponse = async (url, fetchImpl = fetch) => {
  let lastError = null

  for (let attempt = 0; attempt <= sourceFetchRetryCount; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, fetchImpl)
      if (!retryableSourceStatusCodes.has(response.status) || attempt === sourceFetchRetryCount) {
        return response
      }
    } catch (error) {
      lastError = error
      if (attempt === sourceFetchRetryCount) {
        throw error
      }
    }

    await pause(sourceFetchRetryDelayMs * (attempt + 1))
  }

  throw lastError ?? new Error(`Source fetch failed: ${url}`)
}

const fetchJson = async (url, fetchImpl = fetch) => {
  const response = await fetchSourceResponse(url, fetchImpl)
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`)
  }
  return response.json()
}

const fetchText = async (url, fetchImpl = fetch) => {
  const response = await fetchSourceResponse(url, fetchImpl)
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`)
  }
  return response.text()
}

const pubmedItems = async ({ fetchImpl = fetch } = {}) => {
  const query =
    '(longevity[Title/Abstract] OR healthspan[Title/Abstract] OR senescence[Title/Abstract] OR peptide[Title/Abstract] OR peptides[Title/Abstract] OR CRISPR[Title/Abstract] OR "gene therapy"[Title/Abstract] OR "gene editing"[Title/Abstract] OR "DNA modification"[Title/Abstract] OR "personalized health"[Title/Abstract] OR "preventive health"[Title/Abstract] OR "digital health"[Title/Abstract] OR "health as a service"[Title/Abstract])'
  const blocked = pharmaBlocklist.map((term) => `"${term}"[All Fields]`).join(' OR ')
  const searchUrl = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi')
  searchUrl.searchParams.set('db', 'pubmed')
  searchUrl.searchParams.set('term', `${query} NOT (${blocked})`)
  searchUrl.searchParams.set('sort', 'pub date')
  searchUrl.searchParams.set('retmode', 'json')
  searchUrl.searchParams.set('retmax', '10')

  const search = await fetchJson(searchUrl, fetchImpl)
  const ids = search?.esearchresult?.idlist ?? []
  if (!ids.length) {
    return []
  }

  const summaryUrl = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi')
  summaryUrl.searchParams.set('db', 'pubmed')
  summaryUrl.searchParams.set('id', ids.join(','))
  summaryUrl.searchParams.set('retmode', 'json')

  const summary = await fetchJson(summaryUrl, fetchImpl)
  return ids
    .map((id) => summary?.result?.[id])
    .filter(Boolean)
    .map((record) => {
      const title = compact(record.title)
      const journal = compact(record.fulljournalname || record.source || 'PubMed indexed source')
      return {
        id: `pubmed-${record.uid}`,
        title,
        sourceName: 'PubMed / NCBI',
        url: `https://pubmed.ncbi.nlm.nih.gov/${record.uid}/`,
        publishedAt: safeDate(record.sortpubdate || record.pubdate),
        summary: `Public PubMed metadata from ${journal}.`,
        topics: topicsFor(`${title} ${journal}`),
        sourceType: 'public-research-index',
      }
    })
}

const arxivItems = async ({ fetchImpl = fetch } = {}) => {
  const query =
    'all:longevity OR all:CRISPR OR all:"gene therapy" OR all:"gene editing" OR all:peptide OR all:"personalized health" OR all:"digital health"'
  const url = new URL('https://export.arxiv.org/api/query')
  url.searchParams.set('search_query', query)
  url.searchParams.set('sortBy', 'submittedDate')
  url.searchParams.set('sortOrder', 'descending')
  url.searchParams.set('max_results', '8')

  const text = await fetchText(url, fetchImpl)
  const parsed = parser.parse(text)
  return asArray(parsed?.feed?.entry).map((entry) => {
    const title = compact(entry.title)
    const abstract = compact(entry.summary)
    return {
      id: `arxiv-${compact(entry.id).split('/').pop()}`,
      title,
      sourceName: 'arXiv',
      url: compact(entry.id),
      publishedAt: safeDate(entry.published),
      summary: 'Open preprint metadata matching Herbalisti frontier-biology topics.',
      topics: topicsFor(`${title} ${abstract}`),
      contextText: `${title} ${abstract}`,
      sourceType: 'public-research-index',
    }
  })
}

const biorxivItems = async ({ fetchImpl = fetch } = {}) => {
  const to = new Date()
  const from = new Date(to)
  from.setDate(from.getDate() - 30)
  const date = (value) => value.toISOString().slice(0, 10)
  const url = `https://api.biorxiv.org/details/biorxiv/${date(from)}/${date(to)}/0/json`
  const payload = await fetchJson(url, fetchImpl)

  return asArray(payload?.collection)
    .filter((record) => {
      const text = `${record.title} ${record.abstract} ${record.category}`
      return (
        topicMatchers.some(([, matcher]) => matcher.test(text)) &&
        hasHealthSignalContext(text) &&
        !hasOffTopicResearchContext(text) &&
        !textHasBlockedSource(text)
      )
    })
    .slice(0, 8)
    .map((record) => {
      const title = compact(record.title)
      return {
        id: `biorxiv-${record.doi}`,
        title,
        sourceName: 'bioRxiv',
        url: `https://www.biorxiv.org/content/${record.doi}v${record.version}`,
        publishedAt: safeDate(record.date),
        summary: `Public preprint metadata in ${compact(record.category || 'biology')}.`,
        topics: topicsFor(`${title} ${record.abstract}`),
        contextText: `${title} ${record.abstract} ${record.category}`,
        sourceType: 'preprint-server',
      }
    })
}

const datePartsToIso = (value) => {
  const parts = value?.['date-parts']?.[0]

  if (!Array.isArray(parts) || !parts.length) {
    return new Date().toISOString()
  }

  const [year, month = 1, day = 1] = parts
  return safeDate(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
}

const stripTags = (value) => compact(String(value ?? '').replace(/<[^>]*>/g, ' '))

const crossrefItems = async ({ fetchImpl = fetch } = {}) => {
  const since = new Date()
  since.setFullYear(since.getFullYear() - 2)
  const query =
    'longevity healthspan senescence peptide peptides CRISPR gene therapy gene editing genome editing DNA modification epigenetic personalized health preventive health digital health health as a service self-sovereign wellbeing'
  const url = new URL('https://api.crossref.org/works')
  url.searchParams.set('query.bibliographic', query)
  url.searchParams.set('filter', `from-pub-date:${since.toISOString().slice(0, 10)}`)
  url.searchParams.set('rows', '12')
  url.searchParams.set('mailto', 'hello@herbalisti.com')

  const payload = await fetchJson(url, fetchImpl)

  return asArray(payload?.message?.items)
    .map((record) => {
      const title = compact(asArray(record.title)[0])
      const container = compact(asArray(record['container-title'])[0] || record.type || 'Crossref record')
      const abstract = stripTags(record.abstract)
      const doi = compact(record.DOI)
      const url = compact(record.URL || (doi ? `https://doi.org/${doi}` : ''))
      const text = `${title} ${container} ${abstract}`

      return {
        id: `crossref-${hashString(doi || `${title}|${url}`)}`,
        title,
        sourceName: 'Crossref',
        url,
        publishedAt: datePartsToIso(record.published ?? record['published-print'] ?? record['published-online'] ?? record.created),
        summary: `Public Crossref metadata from ${container}.`,
        topics: topicsFor(text),
        contextText: text,
        sourceType: 'public-research-index',
      }
    })
    .filter(isHealthRelevantNewsItem)
}

const rssItems = async (source, { fetchImpl = fetch } = {}) => {
  const text = await fetchText(source.feed, fetchImpl)
  const parsed = parser.parse(text)
  const channel = parsed?.rss?.channel ?? parsed?.feed
  const entries = asArray(channel?.item ?? channel?.entry)

  return entries.slice(0, 8).map((entry) => {
    const title = compact(entry.title)
    const link = compact(entry.link?.href ?? entry.link ?? entry.guid)
    return {
      id: `${source.id}-${hashString(`${title}${link}`)}`,
      title,
      sourceName: source.name,
      url: link || source.url,
      publishedAt: safeDate(entry.pubDate ?? entry.published ?? entry.updated),
      summary: source.summary,
      topics: topicsFor(`${title} ${compact(entry.description ?? entry.summary ?? '')}`),
      sourceType: source.type,
    }
  })
}

const sourceAdapters = [
  {
    id: 'pubmed',
    name: 'PubMed / NCBI',
    url: 'https://pubmed.ncbi.nlm.nih.gov/',
    sourceType: 'public-research-index',
    role: 'Public biomedical metadata for frontier-biology terms.',
    producer: pubmedItems,
  },
  {
    id: 'arxiv',
    name: 'arXiv',
    url: 'https://arxiv.org/',
    sourceType: 'public-research-index',
    role: 'Open preprint metadata for computational biology and frontier science.',
    producer: arxivItems,
  },
  {
    id: 'biorxiv',
    name: 'bioRxiv',
    url: 'https://www.biorxiv.org/',
    sourceType: 'preprint-server',
    role: 'Public biology preprint metadata for longevity and biotechnology topics.',
    producer: biorxivItems,
  },
  {
    id: 'crossref',
    name: 'Crossref',
    url: 'https://www.crossref.org/',
    sourceType: 'public-research-index',
    role: 'Public scholarly metadata expansion for longevity and frontier biology.',
    producer: crossrefItems,
  },
  ...rssSources.map((source) => ({
    id: source.id,
    name: source.name,
    url: source.url,
    sourceType: source.type,
    role: source.summary,
    producer: (options) => rssItems(source, options),
  })),
]

export const feedSourceDescriptors = sourceAdapters.map(({ id, name, url, sourceType, role }) => ({
  id,
  name,
  url,
  sourceType,
  role,
  isAllowlisted: true,
  isBigPharmaRelated: false,
}))

const usableForFeed = (item) =>
  item.title &&
  item.url &&
  item.topics.length &&
  new Date(item.publishedAt).valueOf() <= Date.now() &&
  (item.sourceType === 'independent-longevity' || isHealthRelevantNewsItem(item)) &&
  !textHasBlockedSource(`${item.title} ${item.summary} ${item.sourceName}`)

const publicNewsItem = ({ contextText, ...item }) => item

const newestItemDate = (items) => {
  const timestamps = items
    .map((item) => new Date(item.publishedAt).valueOf())
    .filter((timestamp) => Number.isFinite(timestamp))

  if (!timestamps.length) {
    return ''
  }

  return new Date(Math.max(...timestamps)).toISOString()
}

const sourceHealthRecord = (source, items, warning = '') => {
  const usableItems = items.filter(usableForFeed)

  return {
    id: source.id,
    name: source.name,
    url: source.url,
    sourceType: source.sourceType,
    role: source.role,
    status: warning ? 'warning' : usableItems.length ? 'ok' : 'empty',
    checkedAt: new Date().toISOString(),
    itemCount: items.length,
    usableItemCount: usableItems.length,
    newestItemAt: newestItemDate(usableItems),
    warning,
    isAllowlisted: true,
    isBigPharmaRelated: false,
  }
}

const settleSource = async (source, { fetchImpl }, warnings) => {
  try {
    const items = await source.producer({ fetchImpl })
    return {
      items,
      health: sourceHealthRecord(source, items),
    }
  } catch (error) {
    const warning = `Skipped ${source.name}: ${error.message}`
    warnings.push(warning)
    return {
      items: [],
      health: sourceHealthRecord(source, [], warning),
    }
  }
}

export const normalizeNewsItems = (items, limit = 24, options = {}) =>
  coverageBalancedNewsItems(
    dedupeNewsItems(
      items
        .filter((item) => item.title && item.url)
        .filter((item) => item.topics.length)
        .filter((item) => new Date(item.publishedAt).valueOf() <= Date.now())
        .filter((item) => item.sourceType === 'independent-longevity' || isHealthRelevantNewsItem(item))
        .filter((item) => !textHasBlockedSource(`${item.title} ${item.summary} ${item.sourceName}`))
        .sort((a, b) => new Date(b.publishedAt).valueOf() - new Date(a.publishedAt).valueOf()),
    ),
    limit,
    options,
  ).map(publicNewsItem)

export const fetchHerbalistiNews = async ({ fetchImpl = fetch, limit = 24 } = {}) => {
  const warnings = []
  const sourceResults = await Promise.all(
    sourceAdapters.map((source) => settleSource(source, { fetchImpl }, warnings)),
  )
  const sourceHealth = sourceResults.map((result) => result.health)

  return {
    generatedAt: new Date().toISOString(),
    sourcePolicy: sourcePolicyText,
    sourceHealthPolicy: feedSourceHealthPolicy,
    warnings,
    sourceHealth,
    items: normalizeNewsItems(
      sourceResults.flatMap((result) => result.items),
      limit,
    ),
  }
}

export const getSourceHealthPayload = async ({ fetchImpl = fetch } = {}) => {
  const feed = await fetchHerbalistiNews({ fetchImpl, limit: 24 })
  const warningCount = feed.sourceHealth.filter((source) => source.status === 'warning').length
  const healthyCount = feed.sourceHealth.filter((source) => source.status === 'ok').length
  const emptyCount = feed.sourceHealth.filter((source) => source.status === 'empty').length

  return {
    generatedAt: feed.generatedAt,
    source: 'live-fetch',
    sourcePolicy: feed.sourcePolicy,
    sourceHealthPolicy: feed.sourceHealthPolicy,
    total: feed.sourceHealth.length,
    healthyCount,
    emptyCount,
    warningCount,
    sources: feed.sourceHealth,
    warnings: feed.warnings,
  }
}

const d1RecordToNewsItem = (record) => ({
  id: record.id,
  title: record.title,
  sourceName: record.source_name,
  sourceType: record.source_type,
  url: record.url,
  publishedAt: record.published_at,
  summary: record.summary,
  topics: JSON.parse(record.topics_json || '[]'),
})

const parseJsonArray = (value) => {
  try {
    const parsed = JSON.parse(value || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const normalizedCount = (value) => {
  const number = Number(value ?? 0)
  return Number.isFinite(number) && number >= 0 ? number : 0
}

const refreshRunId = () => {
  const randomId = globalThis.crypto?.randomUUID?.()
  if (randomId) {
    return `feed-refresh-${randomId}`
  }

  return `feed-refresh-${Date.now()}-${hashString(String(Math.random()))}`
}

const d1RecordToRefreshRun = (record) => ({
  id: record.id,
  triggerType: record.trigger_type,
  status: record.status,
  startedAt: record.started_at,
  finishedAt: record.finished_at,
  itemCount: record.item_count,
  persistedCount: record.persisted_count,
  warningCount: record.warning_count,
  warnings: parseJsonArray(record.warnings_json),
  sourcePolicy: record.source_policy,
})

export const readNewsItemsFromD1 = async (db, limit = 24, filters = {}) => {
  const normalizedTopic = normalizeNewsTopic(filters.topic ?? 'All')
  const normalizedSource = normalizeNewsSource(filters.source ?? 'All sources')
  const normalizedQuery = normalizeQuery(filters.query)
  const clauses = []
  const bindings = []

  if (normalizedTopic !== 'All') {
    clauses.push('topics_json LIKE ? ESCAPE \'\\\'')
    bindings.push(`%"${escapeLike(normalizedTopic)}"%`)
  }

  if (normalizedSource !== 'All sources') {
    clauses.push('source_name = ?')
    bindings.push(normalizedSource)
  }

  if (normalizedQuery) {
    const like = `%${escapeLike(normalizedQuery)}%`
    clauses.push(
      `(title LIKE ? ESCAPE '\\' OR source_name LIKE ? ESCAPE '\\' OR source_type LIKE ? ESCAPE '\\' OR summary LIKE ? ESCAPE '\\' OR topics_json LIKE ? ESCAPE '\\')`,
    )
    bindings.push(like, like, like, like, like)
  }

  bindings.push(limit)
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  const result = await db
    .prepare(
      `SELECT id, title, source_name, source_type, url, published_at, summary, topics_json
       FROM news_items
       ${where}
       ORDER BY published_at DESC
       LIMIT ?`,
    )
    .bind(...bindings)
    .all()

  return (result.results ?? []).map(d1RecordToNewsItem)
}

export const persistNewsItemsToD1 = async (db, items) => {
  if (!items.length) {
    return { inserted: 0 }
  }

  const statements = items.map((item) =>
    db
      .prepare(
        `INSERT OR REPLACE INTO news_items
         (id, title, source_name, source_type, url, published_at, summary, topics_json, source_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        item.id,
        item.title,
        item.sourceName,
        item.sourceType,
        item.url,
        item.publishedAt,
        item.summary,
        JSON.stringify(item.topics),
        sourceHashForNewsItem(item),
      ),
  )

  await db.batch(statements)
  return { inserted: items.length }
}

export const persistFeedRefreshRunToD1 = async (db, run = {}) => {
  const warnings = Array.isArray(run.warnings) ? run.warnings.map(compact).filter(Boolean) : []
  const warningCount = normalizedCount(run.warningCount ?? warnings.length)
  const itemCount = normalizedCount(run.itemCount)
  const persistedCount = normalizedCount(run.persistedCount)
  const startedAt = safeDate(run.startedAt ?? run.generatedAt ?? new Date().toISOString())
  const finishedAt = safeDate(run.finishedAt ?? run.generatedAt ?? new Date().toISOString())
  const status = compact(run.status || (warningCount > 0 ? 'completed_with_warnings' : 'completed')) || 'completed'
  const triggerType = compact(run.triggerType || 'unknown') || 'unknown'
  const sourcePolicy = compact(run.sourcePolicy || sourcePolicyText)
  const id = compact(run.id || refreshRunId())
  const refreshRun = {
    id,
    triggerType,
    status,
    startedAt,
    finishedAt,
    itemCount,
    persistedCount,
    warningCount,
    warnings,
    sourcePolicy,
  }

  await db.batch([
    db
      .prepare(
        `INSERT OR REPLACE INTO feed_refresh_runs
         (id, trigger_type, status, started_at, finished_at, item_count, persisted_count, warning_count, warnings_json, source_policy)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        refreshRun.id,
        refreshRun.triggerType,
        refreshRun.status,
        refreshRun.startedAt,
        refreshRun.finishedAt,
        refreshRun.itemCount,
        refreshRun.persistedCount,
        refreshRun.warningCount,
        JSON.stringify(refreshRun.warnings),
        refreshRun.sourcePolicy,
      ),
  ])

  return refreshRun
}

export const readLatestFeedRefreshRunFromD1 = async (db) => {
  const result = await db
    .prepare(
      `SELECT id, trigger_type, status, started_at, finished_at, item_count, persisted_count, warning_count, warnings_json, source_policy
       FROM feed_refresh_runs
       ORDER BY finished_at DESC, created_at DESC
       LIMIT 1`,
    )
    .all()
  const record = result.results?.[0]
  return record ? d1RecordToRefreshRun(record) : null
}
