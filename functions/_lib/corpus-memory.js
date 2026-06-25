const defaultCorpusMemoryUrl = 'http://127.0.0.1:8766'

const escapeRegExp = (value) => String(value ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const normalizeWhitespace = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

const splitList = (value) =>
  String(value ?? '')
    .split(/\s*,\s*/)
    .map((item) => normalizeWhitespace(item))
    .filter(Boolean)

const readProcessEnv = (name) => {
  if (typeof process === 'undefined' || !process?.env) {
    return ''
  }

  return String(process.env[name] ?? '')
}

const maybeCorpusMemoryUrl = (env = {}) =>
  normalizeWhitespace(env.CORPUS_MEMORY_URL ?? readProcessEnv('CORPUS_MEMORY_URL') ?? '')

export const resolveCorpusMemoryUrl = (env = {}) => {
  const configured = maybeCorpusMemoryUrl(env)
  if (configured) {
    return configured.replace(/\/+$/, '')
  }

  return typeof process !== 'undefined' ? defaultCorpusMemoryUrl : ''
}

export const hasCorpusMemoryConfig = (env = {}) => Boolean(maybeCorpusMemoryUrl(env))

const corpusMemoryRequest = async (env, pathname, params = {}) => {
  const baseUrl = resolveCorpusMemoryUrl(env)
  if (!baseUrl) {
    throw new Error('Corpus Memory URL is not configured.')
  }

  const url = new URL(pathname, `${baseUrl}/`)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 1500)

  for (const [key, value] of Object.entries(params)) {
    const normalized = normalizeWhitespace(value)
    if (normalized) {
      url.searchParams.set(key, normalized)
    }
  }

  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Corpus Memory request failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  } finally {
    clearTimeout(timeout)
  }
}

export const searchCorpusMemoryDocuments = async (env, filters = {}) =>
  corpusMemoryRequest(env, '/search', {
    q: filters.query,
    kind: filters.kind,
    limit: filters.limit,
  })

export const getCorpusMemoryDocument = async (env, documentId) =>
  corpusMemoryRequest(env, `/documents/${encodeURIComponent(documentId)}`)

const sectionList = (text, label) => {
  const expression = new RegExp(`${escapeRegExp(label)} include (.+?)\\.`, 'i')
  return splitList(text.match(expression)?.[1] ?? '')
}

const sectionCounts = (text) => {
  const match = String(text ?? '').match(/represented across ([\d,]+) works and ([\d,]+) source-linked chunks/i)
  return {
    workCount: normalizeWhitespace(match?.[1] ?? ''),
    chunkCount: normalizeWhitespace(match?.[2] ?? ''),
  }
}

const humanizeSlug = (value) =>
  normalizeWhitespace(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())

const rightsLabel = (metadata = {}) => {
  switch (metadata.rights_status) {
    case 'public_domain_mark':
      return 'Public domain'
    case 'public_domain_usa':
      return 'Public domain in the USA'
    case 'no_known_copyright':
      return 'No known copyright restrictions'
    default:
      return 'Public-domain or permissively usable source'
  }
}

const buildHerbSearchSummary = (item) => {
  const collections = item.metadata?.collections ?? []
  const topicFamilies = item.metadata?.topic_families ?? []
  const collectionLabel =
    collections.length > 0
      ? `${collections.length} collection${collections.length === 1 ? '' : 's'}`
      : 'historical corpus profile'
  const topicLabel = topicFamilies.length > 0 ? topicFamilies.slice(0, 3).map(humanizeSlug).join(', ') : 'historical source trace'

  return {
    id: item.id,
    type: 'Herb',
    title: item.title,
    eyebrow: humanizeSlug(item.metadata?.catalog_class ?? 'historical herb profile'),
    summary: `${item.title} is indexed as a ${humanizeSlug(
      item.metadata?.catalog_class ?? 'historical herb profile',
    ).toLowerCase()} across ${collectionLabel}.`,
    meta: topicLabel,
    href: `/search?q=${encodeURIComponent(item.title)}`,
  }
}

const buildArchiveSearchSummary = (item) => {
  const metadata = item.metadata ?? {}
  const topicFamily = splitList(String(metadata.topic_family ?? metadata.topic_families ?? '').replace(/;/g, ','))
  const chunkCount = Number(metadata.chunk_count)
  const paragraphCount = Number(metadata.paragraph_count)

  return {
    id: item.id,
    type: 'Archive',
    title: item.title,
    eyebrow: metadata.creator || humanizeSlug(metadata.collection_id ?? 'historical source'),
    summary:
      topicFamily.length > 0
        ? `Topic families: ${topicFamily.slice(0, 3).map(humanizeSlug).join(', ')}.`
        : 'Historical work summary from the Herbalisti corpus.',
    meta: [
      humanizeSlug(metadata.collection_id ?? ''),
      Number.isFinite(chunkCount) ? `${chunkCount.toLocaleString('en-US')} chunks` : '',
      Number.isFinite(paragraphCount) ? `${paragraphCount.toLocaleString('en-US')} paragraphs` : '',
    ]
      .filter(Boolean)
      .join(' / '),
    href: metadata.source_url || metadata.metadata_url || '/library',
  }
}

const buildCorpusCitation = (document) => {
  const metadata = document?.metadata ?? {}
  const sourceUrl = normalizeWhitespace(metadata.source_url ?? metadata.metadata_url ?? '')
  if (!sourceUrl) {
    return null
  }

  return {
    sourceId: document.id,
    title: document.title,
    author: normalizeWhitespace(metadata.creator ?? 'Historical corpus source'),
    sourceUrl,
    licenseLabel: rightsLabel(metadata),
  }
}

const buildCorpusMatch = (document, citations = []) => {
  const text = document?.text ?? ''
  const metadata = document?.metadata ?? {}
  const counts = sectionCounts(text)
  const variants = sectionList(text, 'Recorded variants')
  const plantParts = sectionList(text, 'Common plant-part co-mentions')
  const preparations = sectionList(text, 'Common preparation co-mentions')
  const conditions = sectionList(text, 'Common condition co-mentions')
  const cautions = sectionList(text, 'Caution co-mentions')
  const topicFamilies = (metadata.topic_families ?? []).slice(0, 4).map(humanizeSlug)

  return {
    id: document.id,
    name: document.title,
    botanicalName: humanizeSlug(metadata.catalog_class ?? 'historical herb profile'),
    commonNames: variants,
    plantParts,
    categories: topicFamilies.length ? topicFamilies : [humanizeSlug(metadata.catalog_class ?? 'historical herb profile')],
    mayHelpWith: conditions,
    preparations,
    considerations: cautions,
    sourceIds: citations.map((citation) => citation.sourceId),
    sourceNote: counts.workCount
      ? `Historical retrieval summary across ${counts.workCount} works and ${counts.chunkCount || 'multiple'} source-linked chunks.`
      : 'Historical retrieval summary from the Herbalisti corpus.',
  }
}

const buildCorpusAnswer = (document, relatedTitles = []) => {
  const text = document?.text ?? ''
  const counts = sectionCounts(text)
  const plantParts = sectionList(text, 'Common plant-part co-mentions')
  const preparations = sectionList(text, 'Common preparation co-mentions')
  const conditions = sectionList(text, 'Common condition co-mentions')
  const cautions = sectionList(text, 'Caution co-mentions')

  return [
    counts.workCount
      ? `${document.title} appears across ${counts.workCount} works and ${counts.chunkCount || 'multiple'} source-linked corpus passages in the historical archive.`
      : `${document.title} is indexed in the historical Herbalisti corpus.`,
    plantParts.length ? `Frequently co-mentioned plant parts include ${plantParts.slice(0, 4).join(', ')}.` : '',
    preparations.length ? `Common preparation mentions include ${preparations.slice(0, 4).join(', ')}.` : '',
    conditions.length ? `Repeated historical context clusters include ${conditions.slice(0, 4).join(', ')}.` : '',
    cautions.length ? `Points to review include ${cautions.slice(0, 4).join(', ')}.` : '',
    relatedTitles.length ? `Related corpus profiles: ${relatedTitles.join(', ')}.` : '',
    'Use this as historical research context only, then check a qualified professional for personal health decisions.',
  ]
    .filter(Boolean)
    .join(' ')
}

export const searchCorpusHerbProfiles = async (env, query, limit = 4) => {
  try {
    const payload = await searchCorpusMemoryDocuments(env, {
      query,
      kind: 'herb-profile',
      limit,
    })

    return Array.isArray(payload?.items) ? payload.items : []
  } catch {
    return []
  }
}

export const searchCorpusWorkSummaries = async (env, query, limit = 4) => {
  try {
    const payload = await searchCorpusMemoryDocuments(env, {
      query,
      kind: 'work-summary',
      limit,
    })

    return Array.isArray(payload?.items) ? payload.items : []
  } catch {
    return []
  }
}

export const buildCorpusSearchGroups = async (env, query) => {
  const [herbs, works] = await Promise.all([
    searchCorpusHerbProfiles(env, query, 4),
    searchCorpusWorkSummaries(env, query, 4),
  ])

  return [
    {
      id: 'herbs',
      label: 'Herbs',
      total: herbs.length,
      items: herbs.map(buildHerbSearchSummary),
    },
    {
      id: 'archive',
      label: 'Archive',
      total: works.length,
      items: works.map(buildArchiveSearchSummary),
    },
  ].filter((group) => group.total > 0)
}

export const buildCorpusHerbalChatResponse = async (env, query) => {
  const cleanQuery = normalizeWhitespace(query).slice(0, 180)

  if (!cleanQuery) {
    return null
  }

  try {
    const herbResults = await searchCorpusHerbProfiles(env, cleanQuery, 3)
    if (!herbResults.length) {
      return null
    }

    const leadId = herbResults[0]?.id
    if (!leadId) {
      return null
    }

    const leadDocumentPayload = await getCorpusMemoryDocument(env, leadId)
    const leadDocument = leadDocumentPayload?.document
    if (!leadDocument) {
      return null
    }

    const supportingWorkIds = [...new Set((leadDocument.metadata?.supporting_work_ids ?? []).slice(0, 4))]
    const citationDocuments = await Promise.all(
      supportingWorkIds.map(async (workId) => {
        try {
          const payload = await getCorpusMemoryDocument(env, `work-${workId}`)
          return payload?.document ?? null
        } catch {
          return null
        }
      }),
    )

    const citations = citationDocuments.map(buildCorpusCitation).filter(Boolean)
    const matches = [buildCorpusMatch(leadDocument, citations)]
    const relatedTitles = herbResults
      .slice(1)
      .map((item) => item.title)
      .filter(Boolean)

    return {
      generatedAt: new Date().toISOString(),
      model: 'herbalisti-corpus-memory-rag-v1',
      source: 'corpus-memory-public-domain-herbal-index',
      query: cleanQuery,
      answer: buildCorpusAnswer(leadDocument, relatedTitles),
      matches,
      citations,
      policy:
        'Educational retrieval from public-domain or permissively usable historical herb sources. This is not medical advice, diagnosis, treatment, prescription, or a substitute for professional care.',
    }
  } catch {
    return null
  }
}
