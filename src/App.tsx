import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, MouseEvent } from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Cpu,
  Database,
  ExternalLink,
  FileText,
  Globe2,
  Newspaper,
  RefreshCw,
  Rss,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import './App.css'
import { bookRecords } from './data/books'
import type { BookRecord, BookRegionFilter, BookRightsLane } from './data/books'
import { citationNotes } from './data/citationNotes'
import type { CitationNote, CitationSourceType } from './data/citationNotes'
import {
  buildHerbalChatResponse,
  herbalKnowledgeEntries,
  herbalSourceWorks,
} from './data/herbalKnowledge'
import type { HerbalChatResponse, HerbalKnowledgeEntry, HerbalSourceWork } from './data/herbalKnowledge'
import { defaultMediaManifest } from './data/mediaManifest'
import type { MediaManifest, MotionMediaSlot } from './data/mediaManifest'
import { seedNews } from './data/newsSeed'
import type { NewsItem } from './data/newsSeed'
import { remedyRecords } from './data/remedies'
import type { RemedyRecord } from './data/remedies'
import { sourceAllowlist, sourcePrinciples, topicFilters } from './data/sourcePolicy'
import type { SourceRegistryItem } from './data/sourcePolicy'

const bookModes = ['All', 'Materia medica', 'Making', 'Safety', 'Reference']
const bookRegionModes: BookRegionFilter[] = ['All lanes', 'US', 'UK', 'Australia']
const citationTypeModes = ['All notes', 'Reference', 'Remedy', 'Signal', 'Governance']
const remedyPreparationModes = ['All preparations', 'Infusion', 'Tincture', 'Capsule', 'Extract', 'Topical', 'Food']
const graphRelationModes = ['All relations', 'RELATED_TO', 'HAS_PART', 'PREPARED_AS', 'TRADITIONAL_CONTEXT', 'SAFETY_WATCH']
const feedModes = ['All', ...topicFilters]
const initialLibraryVisibleCount = 60
const initialFeedSourceModes = ['All sources', ...new Set(sourceAllowlist.map((source) => source.feedName ?? source.name))]
const dataExports = [
  { label: 'Reference books', href: '/data/reference-books.json' },
  { label: 'Herbal commons', href: '/data/herbal-knowledge.json' },
  { label: 'Remedies', href: '/data/remedies.json' },
  { label: 'Citation notes', href: '/data/citation-notes.json' },
  { label: 'Source registry', href: '/data/sources.json' },
  { label: 'Discovery metadata', href: '/data/discovery-metadata.json' },
  { label: 'API catalog', href: '/data/api-catalog.json' },
]

type PageId = 'home' | 'search' | 'library' | 'notes' | 'remedies' | 'map' | 'signals' | 'source-policy' | 'governance'

const navigationItems: { label: string; page: PageId; path: string }[] = [
  { label: 'Search', page: 'search', path: '/search' },
  { label: 'Library', page: 'library', path: '/library' },
  { label: 'Notes', page: 'notes', path: '/notes' },
  { label: 'Remedies', page: 'remedies', path: '/remedies' },
  { label: 'Map', page: 'map', path: '/map' },
  { label: 'Signals', page: 'signals', path: '/signals' },
  { label: 'Source policy', page: 'source-policy', path: '/source-policy' },
  { label: 'Governance', page: 'governance', path: '/governance' },
]

const routeToPage: Record<string, PageId> = {
  '/': 'home',
  '/search': 'search',
  '/library': 'library',
  '/notes': 'notes',
  '/citations': 'notes',
  '/remedies': 'remedies',
  '/map': 'map',
  '/signals': 'signals',
  '/source-policy': 'source-policy',
  '/sources': 'source-policy',
  '/governance': 'governance',
}

const legacyHashRoutes: Record<string, string> = {
  top: '/',
  console: '/search',
  library: '/library',
  citations: '/notes',
  remedies: '/remedies',
  map: '/map',
  signals: '/signals',
  'source-policy': '/source-policy',
  governance: '/governance',
}

const pageFromPath = (pathname: string): PageId => {
  const normalized = pathname.replace(/\/+$/, '') || '/'
  return routeToPage[normalized] ?? 'home'
}

const pathFromLegacyHash = (hash: string) => {
  const rawId = hash.startsWith('#') ? hash.slice(1) : hash
  if (!rawId) {
    return ''
  }

  try {
    return legacyHashRoutes[decodeURIComponent(rawId)] ?? ''
  } catch {
    return legacyHashRoutes[rawId] ?? ''
  }
}

const urlParam = (name: string) => {
  if (typeof window === 'undefined') {
    return ''
  }

  return new URLSearchParams(window.location.search).get(name)?.trim().slice(0, 120) ?? ''
}

const urlOptionParam = (name: string, allowed: string[], fallback: string) => {
  const value = urlParam(name)
  return allowed.includes(value) ? value : fallback
}

const setOptionalUrlParam = (params: URLSearchParams, name: string, value: string, defaultValue = '') => {
  const normalized = value.trim()
  if (!normalized || normalized === defaultValue) {
    params.delete(name)
    return
  }

  params.set(name, normalized)
}

type BookPayload = {
  generatedAt?: string
  source?: string
  laneCoverage?: ReferenceLaneCoverage[]
  total?: number
  books?: BookRecord[]
}

type BookExportPayload = {
  generatedAt?: string
  source?: string
  laneCoverage?: ReferenceLaneCoverage[]
  total?: number
  records?: BookRecord[]
}

type ReferenceLaneCoverage = {
  lane: BookRightsLane
  label: string
  status: 'active' | 'prepared-not-populated' | 'awaiting-rights-cleared-intake' | string
  referenceCount: number
  message: string
}

type DataExportPayload<T> = {
  generatedAt?: string
  source?: string
  total?: number
  records?: T[]
}

type HerbalKnowledgeExportPayload = DataExportPayload<HerbalKnowledgeEntry> & {
  sources?: HerbalSourceWork[]
}

type NewsPayload = {
  generatedAt?: string
  source?: string
  total?: number
  warnings?: string[]
  items?: NewsItem[]
}

type RemedyPayload = {
  generatedAt?: string
  source?: string
  total?: number
  remedies?: RemedyRecord[]
}

type CitationPayload = {
  generatedAt?: string
  source?: string
  total?: number
  notes?: CitationNote[]
}

type GraphNode = {
  id: string
  type: 'Remedy' | 'Plant part' | 'Preparation' | 'Context' | 'Safety'
  label: string
  summary?: string
  sourceName?: string
  sourceUrl?: string
  tags?: string[]
}

type GraphEdge = {
  id: string
  source: string
  target: string
  relation: string
  label: string
  evidence?: string
  sourceUrl?: string
}

type GraphPayload = {
  generatedAt?: string
  source?: string
  filters?: {
    query?: string
    focus?: string
    relation?: string
  }
  nodeCount?: number
  edgeCount?: number
  policy?: string
  nodes?: GraphNode[]
  edges?: GraphEdge[]
}

const emptyGraphNodes: GraphNode[] = []
const emptyGraphEdges: GraphEdge[] = []
const initialHomeHerbalResponse = buildHerbalChatResponse('')

type FeedRefreshRun = {
  triggerType?: string
  status?: string
  finishedAt?: string
  itemCount?: number
  publicItemCount?: number
  preservedSourceItemCount?: number
  preservedSourceNames?: string[]
  warningCount?: number
}

type FeedStatusPayload = {
  generatedAt?: string
  source?: string
  latestRefresh?: FeedRefreshRun | null
  publicSnapshot?: {
    status?: string
    itemCount?: number
    preservedSourceItemCount?: number
    preservedSourceNames?: string[]
    generatedAt?: string
  } | null
}

type SourceHealthItem = {
  id: string
  name: string
  url: string
  sourceType: string
  role?: string
  status: 'ok' | 'warning' | 'empty' | 'pending'
  checkedAt?: string
  itemCount: number
  usableItemCount: number
  newestItemAt?: string
  warning?: string
  isAllowlisted: boolean
  isBigPharmaRelated: boolean
}

type SourceHealthPayload = {
  generatedAt?: string
  source?: string
  sourcePolicy?: string
  sourceHealthPolicy?: string
  total?: number
  healthyCount?: number
  emptyCount?: number
  warningCount?: number
  sources?: SourceHealthItem[]
  warnings?: string[]
}

type SourcesPayload = {
  generatedAt?: string
  source?: string
  total?: number
  sources?: SourceRegistryItem[]
}

type SearchResult = {
  id: string
  type: string
  title: string
  eyebrow: string
  summary: string
  meta: string
  href: string
}

type SearchGroup = {
  id: string
  label: string
  total: number
  items: SearchResult[]
}

type SearchRegionGuidance = {
  lane: string
  status: 'active' | 'no-reference-matches' | 'prepared-not-populated'
  referenceFiltered: boolean
  referenceTotal: number
  appliesTo: string[]
  globalResultTypes: string[]
  message: string
}

type SearchPayload = {
  generatedAt?: string
  source?: string
  total?: number
  filters?: {
    query?: string
    region?: string
  }
  regionGuidance?: SearchRegionGuidance
  groups?: SearchGroup[]
}

type ChatMessage = {
  id: string
  role: 'assistant' | 'user'
  text: string
}

type SignalTopicRow = {
  topic: string
  label?: string
  count: number
  share: number
  status?: 'active' | 'watch'
  summary?: string
}

type SignalSourceRow = {
  sourceName: string
  label?: string
  count: number
  share: number
}

type SignalIntelligencePayload = {
  generatedAt?: string
  source?: string
  policy?: string
  totalSignals: number
  representedTopics: number
  representedSources: number
  coveragePercent: number
  recentSignals: number
  newestSignalAt?: string
  leadingTopic?: {
    topic: string
    count: number
    share: number
    summary: string
  } | null
  topicCoverage: SignalTopicRow[]
  topicClusters?: SignalTopicRow[]
  topTopics: SignalTopicRow[]
  sourceMix: SignalSourceRow[]
  sourceHealth?: {
    checkedSources?: number
    healthySourceCount?: number
    warningCount?: number
  }
}

const matchingText = (parts: Array<string | string[] | number | undefined>, query: string) => {
  const haystack = parts
    .flatMap((part) => (Array.isArray(part) ? part : [part]))
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(query.toLowerCase())
}

const bookSearchRegions = (book: BookRecord): string[] => {
  const explicit = [...new Set([...(book.searchRegions ?? []), ...(book.rightsLane ? [book.rightsLane] : [])])].filter(Boolean)
  if (explicit.length) {
    return explicit
  }

  const text = [
    book.title,
    book.subtitle,
    book.authors,
    book.tags,
    book.status,
    book.notes,
    book.publisher,
    book.citationNote,
  ]
    .flat()
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const regions: string[] = []
  if (
    text.includes('rights lane: us') ||
    text.includes('us rights lane') ||
    book.publisher === 'Project Gutenberg' ||
    book.publisher === 'National Library of Medicine'
  ) {
    regions.push('US')
  }
  if (text.includes('rights lane: uk') || text.includes('uk rights lane') || book.publisher === 'Wellcome Collection') {
    regions.push('UK')
  }
  if (/\baustralia|australian\b/i.test(text)) {
    regions.push('Australia')
  }

  return [...new Set(regions)]
}

const buildReferenceLaneCoverage = (items: BookRecord[]): ReferenceLaneCoverage[] =>
  bookRegionModes
    .filter((lane): lane is BookRightsLane => lane !== 'All lanes')
    .map((lane) => {
      const referenceCount = items.filter((book) => bookSearchRegions(book).includes(lane)).length
      const active = referenceCount > 0

      return {
        lane,
        label: lane,
        status: active ? 'active' : lane === 'Australia' ? 'prepared-not-populated' : 'awaiting-rights-cleared-intake',
        referenceCount,
        message: active
          ? `${lane} archive lane active with rights-cleared source records.`
          : lane === 'Australia'
            ? 'Australia lane is prepared for rights-cleared archive intake; no Australian reference books are published yet.'
            : `${lane} lane is prepared for rights-cleared archive intake.`,
      }
    })

const filterBookRecords = (items: BookRecord[], mode: string, query: string, region: BookRegionFilter = 'All lanes') => {
  const normalizedQuery = query.trim()

  return items.filter((book) => {
    const modeMatch = mode === 'All' || book.mode === mode
    const regionMatch = region === 'All lanes' || bookSearchRegions(book).includes(region)
    const queryMatch =
      normalizedQuery === '' ||
      matchingText(
        [
          book.title,
          book.subtitle,
          book.authors,
          book.mode,
          book.role,
          book.tags,
          book.status,
          book.notes,
          book.sourceStatus,
          book.rightsLane,
          book.searchRegions,
          book.publisher,
          book.publicationDate,
          book.isbn13,
          book.pages,
          book.verificationSource,
          book.citationNote,
        ],
        normalizedQuery,
      )

    return modeMatch && regionMatch && queryMatch
  })
}

const searchHerbalEntries = (entries: HerbalKnowledgeEntry[], query: string, limit = 6) => {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) {
    return []
  }

  const tokens = normalizedQuery.split(/\s+/).filter((token) => token.length > 2)

  return entries
    .map((entry) => {
      const exactName =
        entry.name.toLowerCase() === normalizedQuery ||
        entry.commonNames.some((name) => name.toLowerCase() === normalizedQuery)
      const score =
        (exactName ? 12 : 0) +
        (matchingText(
          [
            entry.name,
            entry.botanicalName,
            entry.commonNames,
            entry.plantParts,
            entry.categories,
            entry.mayHelpWith,
            entry.preparations,
            entry.considerations,
            entry.sourceNote,
          ],
          normalizedQuery,
        )
          ? 3
          : 0) +
        tokens.reduce(
          (sum, token) =>
            sum +
            (matchingText(
              [
                entry.name,
                entry.botanicalName,
                entry.commonNames,
                entry.plantParts,
                entry.categories,
                entry.mayHelpWith,
                entry.preparations,
                entry.considerations,
                entry.sourceNote,
              ],
              token,
            )
              ? 1
              : 0),
          0,
        )

      return { entry, score }
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.entry.name.localeCompare(right.entry.name))
    .slice(0, limit)
    .map((item) => item.entry)
}

const herbEyebrow = (entry: HerbalKnowledgeEntry) =>
  entry.botanicalName || entry.displayLabel || entry.categories[0] || 'Historical corpus profile'

const buildFallbackHerbalChatResponse = (
  query: string,
  entries: HerbalKnowledgeEntry[],
  sources: HerbalSourceWork[],
): HerbalChatResponse => {
  const cleanQuery = query.trim().slice(0, 180)
  const matches = searchHerbalEntries(entries, cleanQuery, 3)
  const sourceById = new Map(sources.map((source) => [source.id, source]))
  const citations = [...new Set(matches.flatMap((entry) => entry.sourceIds))]
    .map((id) => sourceById.get(id))
    .filter((source): source is HerbalSourceWork => Boolean(source))
    .slice(0, 5)
    .map((source) => ({
      sourceId: source.id,
      title: source.title,
      author: source.author,
      sourceUrl: source.sourceUrl,
      licenseLabel: source.licenseLabel,
    }))
  const policy =
    'Educational retrieval from public-domain or rights-cleared historical herb sources. This is not medical advice, diagnosis, treatment, prescription, or a substitute for professional care.'

  if (!cleanQuery) {
    return {
      generatedAt: new Date().toISOString(),
      model: 'herbalisti-static-review-rag-v1',
      source: 'public-domain-herbal-index',
      query: cleanQuery,
      answer: 'Ask about an herb, a plant part, a traditional use, or a consideration to search the public herbal index.',
      matches: [],
      citations: [],
      policy,
    }
  }

  if (!matches.length) {
    return {
      generatedAt: new Date().toISOString(),
      model: 'herbalisti-static-review-rag-v1',
      source: 'public-domain-herbal-index',
      query: cleanQuery,
      answer:
        'I could not find a strong match in the current historical herb index. Try a specific herb such as ginger, chamomile, nettle, elder, fennel, lemon, rosemary, sage, thyme, or yarrow.',
      matches: [],
      citations: [],
      policy,
    }
  }

  const lead = matches[0]
  const supporting = matches.slice(1).map((entry) => entry.name)
  const leadSummary =
    lead.entryKind === 'corpus-profile'
      ? `${lead.name} is indexed as ${String(lead.displayLabel ?? 'a historical herb profile').toLowerCase()}.`
      : `${lead.name}${lead.botanicalName ? ` (${lead.botanicalName})` : ''} is indexed as ${lead.categories.join(', ')}.`
  const answer = [
    leadSummary,
    lead.corpusWorkCount && lead.corpusChunkCount
      ? `The rights-cleared Herbalisti corpus links ${lead.name} across ${lead.corpusWorkCount.toLocaleString('en-US')} works and ${lead.corpusChunkCount.toLocaleString('en-US')} source-linked passages.`
      : '',
    `Traditional contexts in the historical corpus include ${lead.mayHelpWith.join(', ')}.`,
    `Common preparation forms include ${lead.preparations.join(', ')}.`,
    `Considerations to review: ${lead.considerations.join(', ')}.`,
    supporting.length ? `Related index matches: ${supporting.join(', ')}.` : '',
    'Use this as historical research context only, then check a qualified professional for personal health decisions.',
  ]
    .filter(Boolean)
    .join(' ')

  return {
    generatedAt: new Date().toISOString(),
    model: 'herbalisti-static-review-rag-v1',
    source: 'public-domain-herbal-index',
    query: cleanQuery,
    answer,
    matches,
    citations,
    policy,
  }
}

const filterNewsRecords = (items: NewsItem[], topic: string, source: string, query: string) => {
  const normalizedQuery = query.trim()

  return items.filter((item) => {
    const topicMatch = topic === 'All' || item.topics.includes(topic)
    const sourceMatch = source === 'All sources' || item.sourceName === source
    const queryMatch =
      normalizedQuery === '' ||
      matchingText([item.title, item.summary, item.sourceName, item.sourceType, item.topics], normalizedQuery)

    return topicMatch && sourceMatch && queryMatch
  })
}

const percentOf = (count: number, total: number) => (total > 0 ? Math.round((count / total) * 100) : 0)

const sortSignalRows = <T extends { count: number; label?: string }>(left: T, right: T) => {
  if (right.count !== left.count) {
    return right.count - left.count
  }

  return (left.label ?? '').localeCompare(right.label ?? '')
}

const newestSignalTime = (items: NewsItem[]) => {
  const newest = items
    .map((item) => new Date(item.publishedAt).valueOf())
    .filter((timestamp) => Number.isFinite(timestamp))
    .sort((left, right) => right - left)[0]

  return newest ? new Date(newest).toISOString() : ''
}

const recentSignalCount = (items: NewsItem[], generatedAt: string) => {
  const generatedAtMs = new Date(generatedAt).valueOf()
  const cutoff = Number.isFinite(generatedAtMs)
    ? generatedAtMs - 14 * 24 * 60 * 60 * 1000
    : Date.now() - 14 * 24 * 60 * 60 * 1000

  return items.filter((item) => {
    const timestamp = new Date(item.publishedAt).valueOf()
    return Number.isFinite(timestamp) && timestamp >= cutoff
  }).length
}

const buildFallbackSignalIntelligence = (
  items: NewsItem[],
  health: SourceHealthItem[] = [],
  source = 'static-fallback',
): SignalIntelligencePayload => {
  const generatedAt = new Date().toISOString()
  const totalSignals = items.length
  const topicCoverage = topicFilters.map((topic) => {
    const count = items.filter((item) => item.topics.includes(topic)).length
    return {
      topic,
      label: topic,
      count,
      share: percentOf(count, totalSignals),
    }
  })
  const topTopics = topicCoverage.filter((topic) => topic.count > 0).sort(sortSignalRows)
  const sourceMix = [...new Set(items.map((item) => item.sourceName).filter(Boolean))]
    .map((sourceName) => {
      const count = items.filter((item) => item.sourceName === sourceName).length
      return {
        sourceName,
        label: sourceName,
        count,
        share: percentOf(count, totalSignals),
      }
    })
    .sort(sortSignalRows)

  return {
    generatedAt,
    source,
    policy:
      'Metadata-only signal intelligence from allowlisted public sources; topic counts are discovery context, not medical guidance.',
    totalSignals,
    representedTopics: topTopics.length,
    representedSources: sourceMix.length,
    coveragePercent: percentOf(topTopics.length, topicFilters.length),
    recentSignals: recentSignalCount(items, generatedAt),
    newestSignalAt: newestSignalTime(items),
    leadingTopic: topTopics[0]
      ? {
          topic: topTopics[0].topic,
          count: topTopics[0].count,
          share: topTopics[0].share,
          summary: `${topTopics[0].topic} is the strongest current metadata cluster across the selected public-source signals.`,
        }
      : null,
    topicCoverage,
    topicClusters: topicCoverage.map((topic) => ({
      ...topic,
      status: topic.count > 0 ? 'active' : 'watch',
      summary:
        topic.count > 0
          ? `${topic.topic} is represented in the selected public-source signals.`
          : `${topic.topic} is monitored by the source adapters and will appear when matching public metadata arrives.`,
    })),
    topTopics: topTopics.slice(0, 6),
    sourceMix: sourceMix.slice(0, 6),
    sourceHealth: {
      checkedSources: health.length,
      healthySourceCount: health.filter((item) => item.status === 'ok').length,
      warningCount: health.filter((item) => item.status === 'warning').length,
    },
  }
}

const filterRemedyRecords = (items: RemedyRecord[], query: string, preparation: string) => {
  const normalizedQuery = query.trim()
  const normalizedPreparation = preparation.trim()

  return items.filter((item) => {
    const preparationMatch =
      normalizedPreparation === 'All preparations' ||
      item.preparations.some((prep) => prep.toLowerCase().includes(normalizedPreparation.toLowerCase()))
    const queryMatch =
      normalizedQuery === '' ||
      matchingText(
        [
          item.name,
          item.botanicalName,
          item.commonNames,
          item.plantParts,
          item.overview,
          item.traditionalUses,
          item.preparations,
          item.safetySummary,
          item.interactionFlags,
          item.related,
          item.tags,
          item.sourceName,
          item.sourceStatus,
        ],
        normalizedQuery,
      )

    return preparationMatch && queryMatch
  })
}

const citationSourceTypeLabels: Record<CitationSourceType, string> = {
  reference: 'Reference',
  remedy: 'Remedy',
  signal: 'Signal',
  governance: 'Governance',
}

const citationTypeParam = (value: string) => (value === 'All notes' ? 'all' : value.toLowerCase())

const filterCitationNoteRecords = (items: CitationNote[], query: string, type: string) => {
  const normalizedQuery = query.trim()
  const normalizedType = citationTypeParam(type)

  return items.filter((item) => {
    const typeMatch = normalizedType === 'all' || item.sourceType === normalizedType
    const queryMatch =
      normalizedQuery === '' ||
      matchingText(
        [
          item.title,
          item.sourceType,
          item.linkedRecordId,
          item.linkedRecordLabel,
          item.sourceName,
          item.sourceUrl,
          item.note,
          item.tags,
          item.reviewStatus,
          item.lastReviewed,
        ],
        normalizedQuery,
      )

    return typeMatch && queryMatch
  })
}

const graphRelationLabels: Record<string, string> = {
  RELATED_TO: 'Related to',
  HAS_PART: 'Has part',
  PREPARED_AS: 'Prepared as',
  TRADITIONAL_CONTEXT: 'Traditional context',
  SAFETY_WATCH: 'Safety watch',
}

const relationLabel = (relation: string) => graphRelationLabels[relation] ?? relation
const graphNodeTone = (type: string) => type.toLowerCase().replace(/[^a-z0-9]+/g, '-')

const graphSlug = (value: string) =>
  value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)

const addGraphNode = (nodes: Map<string, GraphNode>, node: GraphNode) => {
  if (!nodes.has(node.id)) {
    nodes.set(node.id, node)
  }
}

const addGraphEdge = (edges: Map<string, GraphEdge>, edge: GraphEdge) => {
  if (!edges.has(edge.id)) {
    edges.set(edge.id, edge)
  }
}

const buildFallbackGraphPayload = (
  items: RemedyRecord[],
  query: string,
  relation: string,
): GraphPayload => {
  const normalizedQuery = query.trim()
  const normalizedRelation = graphRelationModes.includes(relation) ? relation : 'All relations'
  const nodes = new Map<string, GraphNode>()
  const edges = new Map<string, GraphEdge>()
  const nameMap = new Map<string, string>()

  items.forEach((remedy) => {
    nameMap.set(remedy.name.toLowerCase(), remedy.id)
    nameMap.set(remedy.id.toLowerCase(), remedy.id)
    remedy.commonNames.forEach((name) => nameMap.set(name.toLowerCase(), remedy.id))
    addGraphNode(nodes, {
      id: remedy.id,
      type: 'Remedy',
      label: remedy.name,
      summary: remedy.safetySummary,
      sourceName: remedy.sourceName,
      sourceUrl: remedy.sourceUrl,
      tags: remedy.tags,
    })
  })

  items.forEach((remedy) => {
    remedy.related.forEach((relatedName) => {
      const target = nameMap.get(relatedName.toLowerCase())
      if (!target || target === remedy.id) {
        return
      }

      addGraphEdge(edges, {
        id: `${remedy.id}-RELATED_TO-${target}`,
        source: remedy.id,
        target,
        relation: 'RELATED_TO',
        label: 'Related to',
        evidence: `${remedy.name} records ${relatedName} as a related remedy.`,
        sourceUrl: remedy.sourceUrl,
      })
    })

    remedy.preparations.forEach((preparation) => {
      const target = `preparation-${graphSlug(preparation)}`
      addGraphNode(nodes, {
        id: target,
        type: 'Preparation',
        label: preparation,
        summary: 'Preparation context from the remedy source index.',
      })
      addGraphEdge(edges, {
        id: `${remedy.id}-PREPARED_AS-${target}`,
        source: remedy.id,
        target,
        relation: 'PREPARED_AS',
        label: 'Prepared as',
        evidence: `${remedy.name} includes ${preparation} as a preparation context.`,
        sourceUrl: remedy.sourceUrl,
      })
    })

    remedy.plantParts.forEach((part) => {
      const target = `part-${graphSlug(part)}`
      addGraphNode(nodes, {
        id: target,
        type: 'Plant part',
        label: part,
        summary: 'Plant-part context from the public remedy index.',
      })
      addGraphEdge(edges, {
        id: `${remedy.id}-HAS_PART-${target}`,
        source: remedy.id,
        target,
        relation: 'HAS_PART',
        label: 'Has part',
        evidence: `${remedy.name} is indexed with ${part} plant-part context.`,
        sourceUrl: remedy.sourceUrl,
      })
    })

    remedy.traditionalUses.forEach((context) => {
      const target = `context-${graphSlug(context)}`
      addGraphNode(nodes, {
        id: target,
        type: 'Context',
        label: context,
        summary: 'Traditional-use context from the public remedy index; not a treatment claim.',
      })
      addGraphEdge(edges, {
        id: `${remedy.id}-TRADITIONAL_CONTEXT-${target}`,
        source: remedy.id,
        target,
        relation: 'TRADITIONAL_CONTEXT',
        label: 'Traditional context',
        evidence: `${remedy.name} is indexed with ${context}.`,
        sourceUrl: remedy.sourceUrl,
      })
    })

    remedy.interactionFlags.forEach((flag) => {
      const target = `safety-${graphSlug(flag)}`
      addGraphNode(nodes, {
        id: target,
        type: 'Safety',
        label: flag,
        summary: 'Safety-watch context from the public remedy index.',
      })
      addGraphEdge(edges, {
        id: `${remedy.id}-SAFETY_WATCH-${target}`,
        source: remedy.id,
        target,
        relation: 'SAFETY_WATCH',
        label: 'Safety watch',
        evidence: `${remedy.name} carries a ${flag.toLowerCase()} safety watch.`,
        sourceUrl: remedy.sourceUrl,
      })
    })
  })

  const selectedRemedyIds = new Set(
    (normalizedQuery ? filterRemedyRecords(items, normalizedQuery, 'All preparations') : items).map(
      (remedy) => remedy.id,
    ),
  )
  const allowedNodeIds = new Set<string>()
  const visibleEdges = [...edges.values()].filter((edge) => {
    const relationMatch = normalizedRelation === 'All relations' || edge.relation === normalizedRelation
    const sourceMatch =
      !normalizedQuery || selectedRemedyIds.has(edge.source) || selectedRemedyIds.has(edge.target)

    if (relationMatch && sourceMatch) {
      allowedNodeIds.add(edge.source)
      allowedNodeIds.add(edge.target)
      return true
    }

    return false
  })

  selectedRemedyIds.forEach((id) => allowedNodeIds.add(id))

  return {
    generatedAt: new Date().toISOString(),
    source: 'static-fallback',
    filters: { query: normalizedQuery, relation: normalizedRelation },
    nodeCount: allowedNodeIds.size,
    edgeCount: visibleEdges.length,
    policy: 'Source-led relationship graph. Traditional context edges are not treatment claims.',
    nodes: [...allowedNodeIds].map((id) => nodes.get(id)).filter((node): node is GraphNode => Boolean(node)),
    edges: visibleEdges,
  }
}

const buildFallbackSourceHealth = (items: NewsItem[], registry: SourceRegistryItem[]): SourceHealthItem[] =>
  registry.map((source) => {
    const feedName = source.feedName ?? source.name
    const matches = items.filter((item) => item.sourceName === feedName)
    const newestItemAt = matches
      .map((item) => new Date(item.publishedAt).valueOf())
      .filter((timestamp) => Number.isFinite(timestamp))
      .sort((left, right) => right - left)[0]

    return {
      id: source.id,
      name: feedName,
      url: source.url,
      sourceType: source.sourceType,
      role: source.role,
      status: matches.length ? 'ok' : 'pending',
      itemCount: matches.length,
      usableItemCount: matches.length,
      newestItemAt: newestItemAt ? new Date(newestItemAt).toISOString() : '',
      isAllowlisted: source.isAllowlisted,
      isBigPharmaRelated: source.isBigPharmaRelated,
    }
  })

const limited = <T,>(items: T[], limit = 4) => items.slice(0, limit)

type SearchFallbackIndex = {
  books: BookRecord[]
  herbs: HerbalKnowledgeEntry[]
  herbalSources: HerbalSourceWork[]
  remedies: RemedyRecord[]
  notes: CitationNote[]
  signals: NewsItem[]
  sources: SourceRegistryItem[]
}

const defaultSearchFallbackIndex: SearchFallbackIndex = {
  books: bookRecords,
  herbs: herbalKnowledgeEntries,
  herbalSources: herbalSourceWorks,
  remedies: remedyRecords,
  notes: citationNotes,
  signals: seedNews,
  sources: sourceAllowlist,
}

const buildFallbackSearchGroups = (
  query: string,
  index: SearchFallbackIndex = defaultSearchFallbackIndex,
  region: BookRegionFilter = 'All lanes',
): SearchGroup[] => {
  const normalizedQuery = query.trim()
  if (!normalizedQuery) {
    return []
  }

  const bookMatches = filterBookRecords(index.books, 'All', normalizedQuery, region)
  const herbMatches = searchHerbalEntries(index.herbs, normalizedQuery, 6)
  const remedyMatches = filterRemedyRecords(index.remedies, normalizedQuery, 'All preparations')
  const citationMatches = filterCitationNoteRecords(index.notes, normalizedQuery, 'All notes')
  const signalMatches = filterNewsRecords(index.signals, 'All', 'All sources', normalizedQuery)
  const sourceMatches = index.sources.filter((source) =>
    matchingText(
        [
          source.name,
          source.feedName,
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
        ],
      normalizedQuery,
    ),
  )

  return [
    {
      id: 'herbs',
      label: 'Herbs',
      total: herbMatches.length,
      items: limited(herbMatches).map((entry) => ({
        id: `herb-${entry.id}`,
        type: 'Herb',
        title: entry.name,
        eyebrow: herbEyebrow(entry),
        summary: entry.sourceNote,
        meta: [...entry.plantParts.slice(0, 2), ...entry.preparations.slice(0, 3)].join(' / '),
        href: `/search?q=${encodeURIComponent(entry.name)}`,
      })),
    },
    {
      id: 'references',
      label: 'References',
      total: bookMatches.length,
      items: limited(bookMatches).map((book) => ({
        id: `book-${book.id}`,
        type: 'Reference',
        title: book.title,
        eyebrow: book.mode,
        summary: book.role,
        meta: [book.authors.join(', '), book.rightsLane ? `${book.rightsLane} lane` : '', book.publisher, book.publicationDate, book.isbn13 ? `ISBN ${book.isbn13}` : '']
          .filter(Boolean)
          .join(' / '),
        href: book.externalUrl ?? '/library',
      })),
    },
    {
      id: 'remedies',
      label: 'Remedies',
      total: remedyMatches.length,
      items: limited(remedyMatches).map((remedy) => ({
        id: `remedy-${remedy.id}`,
        type: 'Remedy',
        title: remedy.name,
        eyebrow: remedy.botanicalName,
        summary: remedy.safetySummary,
        meta: [...remedy.plantParts.slice(0, 2), ...remedy.preparations.slice(0, 3)].join(' / '),
        href: remedy.sourceUrl,
      })),
    },
    {
      id: 'signals',
      label: 'Signals',
      total: signalMatches.length,
      items: limited(signalMatches).map((item) => ({
        id: `signal-${item.id}`,
        type: 'Signal',
        title: item.title,
        eyebrow: item.sourceName,
        summary: item.summary,
        meta: item.topics.slice(0, 4).join(' / '),
        href: item.url,
      })),
    },
    {
      id: 'notes',
      label: 'Notes',
      total: citationMatches.length,
      items: limited(citationMatches).map((note) => ({
        id: `note-${note.id}`,
        type: 'Note',
        title: note.title,
        eyebrow: note.linkedRecordLabel,
        summary: note.note,
        meta: [citationSourceTypeLabels[note.sourceType], note.sourceName, note.reviewStatus.replace(/_/g, ' ')]
          .filter(Boolean)
          .join(' / '),
        href: note.sourceUrl,
      })),
    },
    {
      id: 'sources',
      label: 'Sources',
      total: sourceMatches.length,
      items: limited(sourceMatches).map((source) => ({
        id: `source-${source.id}`,
        type: 'Source',
        title: source.name,
        eyebrow: source.sourceType,
        summary: source.reviewNote || source.role,
        meta: [source.feedName ? `Feed: ${source.feedName}` : '', source.independenceStatus].filter(Boolean).join(' / '),
        href: source.url,
      })),
    },
  ]
}

const readableSource = (source?: string) => {
  switch (source) {
    case 'd1':
      return 'D1 database'
    case 'd1-and-live-public-sources':
      return 'D1 + live public sources'
    case 'corpus-memory-public-domain-herbal-index':
      return 'Corpus Memory'
    case 'corpus-memory-d1-and-live-public-sources':
      return 'Corpus Memory + D1 + live public sources'
    case 'corpus-memory-static-and-live-public-sources':
      return 'Corpus Memory + seed database + live public sources'
    case 'd1-and-corpus-registry':
      return 'D1 + corpus catalog'
    case 'static-corpus-registry':
      return 'public corpus catalog'
    case 'static-fallback':
      return 'local archive seed'
    case 'static-and-corpus-registry':
      return 'seed database + corpus catalog'
    case 'static-export-corpus-registry':
      return 'public data export + corpus catalog'
    case 'static-export':
      return 'public data export'
    case 'static-export-and-corpus-registry':
      return 'public data export + corpus catalog'
    case 'static-and-live-public-sources':
      return 'seed database + live public sources'
    case 'live-fetch':
      return 'live public-source API'
    case 'live-fetch-and-d1-persist':
      return 'live public-source API + D1'
    default:
      return source ?? 'local seed'
  }
}

const formatRefreshTime = (value?: string) => {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

const formatSignalDate = (value?: string) => (value ? formatRefreshTime(value) : 'No signal yet')
const topicMeterLevel = (share: number, count: number) => (count > 0 ? Math.min(10, Math.max(1, Math.ceil(share / 10))) : 0)

const nonEmptySearchGroups = (groups: SearchGroup[] = []) => groups.filter((group) => group.items.length > 0)

const summarizeSearchGroups = (groups: SearchGroup[] = []) => {
  const labels = nonEmptySearchGroups(groups).slice(0, 3).map((group) => group.label.toLowerCase())

  if (!labels.length) {
    return 'the indexed archive'
  }

  if (labels.length === 1) {
    return labels[0]
  }

  if (labels.length === 2) {
    return `${labels[0]} and ${labels[1]}`
  }

  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`
}

const buildSearchRegionGuidance = (
  region: BookRegionFilter,
  groups: SearchGroup[] = [],
): SearchRegionGuidance | null => {
  if (region === 'All lanes') {
    return null
  }

  const referenceTotal = groups.find((group) => group.id === 'references')?.total ?? 0

  return {
    lane: region,
    status:
      region === 'Australia' && referenceTotal === 0
        ? 'prepared-not-populated'
        : referenceTotal > 0
          ? 'active'
          : 'no-reference-matches',
    referenceFiltered: true,
    referenceTotal,
    appliesTo: ['References'],
    globalResultTypes: ['Herbs', 'Remedies', 'Signals', 'Notes', 'Sources'],
    message:
      region === 'Australia' && referenceTotal === 0
        ? 'Australia references are queued for rights-cleared archive intake; herbs, remedies, notes, sources, and signals remain global.'
        : `${region} filters the References group; herbs, remedies, notes, sources, and signals remain global.`,
  }
}

const readableRefreshTrigger = (trigger?: string) => {
  switch (trigger) {
    case 'scheduled':
      return 'scheduled refresh'
    case 'manual':
      return 'manual refresh'
    case 'live-api':
      return 'live API refresh'
    case 'live-api-forced':
      return 'forced live refresh'
    case 'static-refresh':
      return 'static refresh'
    default:
      return trigger ?? 'refresh'
  }
}

const refreshHeartbeatText = (payload: FeedStatusPayload) => {
  const latest = payload.latestRefresh
  if (!latest?.finishedAt) {
    return ''
  }

  const count = typeof latest.itemCount === 'number' ? `, ${latest.itemCount} signals checked` : ''
  const publicCount =
    typeof latest.publicItemCount === 'number' && latest.publicItemCount !== latest.itemCount
      ? `, ${latest.publicItemCount} visible`
      : ''
  const warning =
    typeof latest.warningCount === 'number' && latest.warningCount > 0
      ? `, ${latest.warningCount} source warning${latest.warningCount === 1 ? '' : 's'}`
      : ''
  const status =
    latest.status && latest.status !== 'completed' ? `, ${latest.status.replace(/_/g, ' ')}` : ''
  const snapshot =
    payload.publicSnapshot?.status === 'preserved_existing' ? ', preserved public snapshot' : ''
  const preservedSources =
    payload.publicSnapshot?.status === 'updated_with_source_preservation'
      ? ', preserved source signals'
      : ''

  return `Refresh heartbeat: ${readableRefreshTrigger(latest.triggerType)}, ${formatRefreshTime(latest.finishedAt)}${count}${publicCount}${warning}${status}${snapshot}${preservedSources}`
}

function useDebouncedValue(value: string, delay = 220) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timeout)
  }, [delay, value])

  return debounced
}

function Logo({ onHomeClick }: { onHomeClick?: (event: MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <a className="brand-lockup" href="/" aria-label="Herbalisti home" onClick={onHomeClick}>
      <img className="brand-logo-image" src="/assets/herbalisti-logo.svg" alt="" aria-hidden="true" />
      <span className="visually-hidden">Herbalisti - Self-sovereign health intelligence</span>
    </a>
  )
}

function BookCard({ book }: { book: BookRecord }) {
  return (
    <article className="book-card">
      <div className="card-kicker">
        <BookOpen size={16} />
        <span>{book.mode}</span>
      </div>
      <h3>{book.title}</h3>
      {book.subtitle ? <p className="book-subtitle">{book.subtitle}</p> : null}
      <p className="authors">{book.authors.join(', ')}</p>
      <div className="book-meta-grid" aria-label={`${book.title} citation metadata`}>
        {book.rightsLane ? <span>{book.rightsLane} lane</span> : null}
        {book.publisher ? <span>{book.publisher}</span> : null}
        {book.publicationDate ? <span>{book.publicationDate}</span> : null}
        {book.isbn13 ? <span>ISBN {book.isbn13}</span> : null}
        {book.pages ? <span>{book.pages} pages</span> : null}
      </div>
      <p>{book.role}</p>
      <div className="tag-row" aria-label={`${book.title} topics`}>
        {book.tags.slice(0, 4).map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className="status-line">
        <CheckCircle2 size={16} />
        <span>{book.status}</span>
      </div>
      {book.externalUrl ? (
        <a className="source-link" href={book.externalUrl} target="_blank" rel="noreferrer">
          {book.verificationSource ?? 'Catalogue source'} <ExternalLink size={14} />
        </a>
      ) : null}
    </article>
  )
}

function CitationNoteCard({ note }: { note: CitationNote }) {
  return (
    <article className={`citation-card citation-source-${note.sourceType}`}>
      <div className="card-kicker">
        <FileText size={16} />
        <span>{citationSourceTypeLabels[note.sourceType]}</span>
      </div>
      <h3>{note.title}</h3>
      <div className="citation-linked-line" aria-label={`${note.title} linked record and review status`}>
        <span>{note.linkedRecordLabel}</span>
        <span>{note.reviewStatus.replace(/_/g, ' ')}</span>
      </div>
      <p>{note.note}</p>
      <div className="tag-row" aria-label={`${note.title} tags`}>
        {note.tags.slice(0, 4).map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <a className="source-link" href={note.sourceUrl} target="_blank" rel="noreferrer">
        {note.sourceName} <ExternalLink size={14} />
      </a>
    </article>
  )
}

function NewsCard({ item }: { item: NewsItem }) {
  const date = new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(item.publishedAt))

  return (
    <article className="news-card">
      <div className="card-kicker">
        <Newspaper size={16} />
        <span>{item.sourceName}</span>
      </div>
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
      <div className="tag-row" aria-label={`${item.title} topics`}>
        {item.topics.slice(0, 4).map((topic) => (
          <span key={topic}>{topic}</span>
        ))}
      </div>
      <div className="news-meta">
        <span>{date}</span>
        <a href={item.url} target="_blank" rel="noreferrer">
          Source <ExternalLink size={15} />
        </a>
      </div>
    </article>
  )
}

function RemedyCard({ remedy }: { remedy: RemedyRecord }) {
  return (
    <article className="remedy-card">
      <div className="card-kicker">
        <Sparkles size={16} />
        <span>{remedy.botanicalName}</span>
      </div>
      <h3>{remedy.name}</h3>
      <p>{remedy.overview}</p>
      <div className="plant-part-row" aria-label={`${remedy.name} plant parts`}>
        {remedy.plantParts.slice(0, 3).map((part) => (
          <span key={part}>{part}</span>
        ))}
      </div>
      <div className="remedy-meta-grid" aria-label={`${remedy.name} preparation and use context`}>
        {remedy.preparations.slice(0, 4).map((preparation) => (
          <span key={preparation}>{preparation}</span>
        ))}
      </div>
      <div className="status-line safety-line">
        <ShieldCheck size={16} />
        <span>{remedy.safetySummary}</span>
      </div>
      <div className="tag-row" aria-label={`${remedy.name} related remedies`}>
        {remedy.related.slice(0, 3).map((related) => (
          <span key={related}>{related}</span>
        ))}
      </div>
      <a className="source-link" href={remedy.sourceUrl} target="_blank" rel="noreferrer">
        {remedy.sourceName} <ExternalLink size={14} />
      </a>
    </article>
  )
}

function GraphEdgeCard({ edge, nodeById }: { edge: GraphEdge; nodeById: Map<string, GraphNode> }) {
  const source = nodeById.get(edge.source)
  const target = nodeById.get(edge.target)

  if (!source || !target) {
    return null
  }

  return (
    <article className="graph-edge-card">
      <div className="graph-node-line">
        <span className={`graph-node-chip graph-node-${graphNodeTone(source.type)}`}>{source.label}</span>
        <span className="graph-relation-chip">{relationLabel(edge.relation)}</span>
        <span className={`graph-node-chip graph-node-${graphNodeTone(target.type)}`}>{target.label}</span>
      </div>
      {edge.evidence ? <p>{edge.evidence}</p> : null}
    </article>
  )
}

function SourceHealthChip({ source }: { source: SourceHealthItem }) {
  const countText =
    source.status === 'warning'
      ? 'warning'
      : `${source.usableItemCount} usable signal${source.usableItemCount === 1 ? '' : 's'}`
  const checkedText = source.newestItemAt ? `Latest ${formatRefreshTime(source.newestItemAt)}` : source.sourceType

  return (
    <a className={`source-health-chip source-health-${source.status}`} href={source.url} target="_blank" rel="noreferrer">
      <span>{source.name}</span>
      <strong>{countText}</strong>
      <small>{checkedText}</small>
    </a>
  )
}

function SignalIntelligencePanel({
  payload,
  status,
}: {
  payload: SignalIntelligencePayload
  status: string
}) {
  const topTopics = payload.topTopics?.length ? payload.topTopics : payload.topicCoverage.filter((topic) => topic.count > 0)
  const sourceMix = payload.sourceMix ?? []
  const leadingTopic = payload.leadingTopic

  return (
    <div className="signal-intelligence-panel">
      <div className="signal-lattice signal-intelligence-lattice" aria-hidden="true"></div>
      <div className="signal-intelligence-header">
        <div>
          <div className="card-kicker">
            <BarChart3 size={16} />
            <span>Signal intelligence</span>
          </div>
          <h3>{leadingTopic ? leadingTopic.topic : 'Signal field warming up'}</h3>
          <p>
            {leadingTopic
              ? leadingTopic.summary
              : 'Public-source metadata will populate this layer as matching signals arrive.'}
          </p>
        </div>
        <div className="signal-intelligence-status">
          <strong>{payload.totalSignals}</strong>
          <span>{status}</span>
        </div>
      </div>

      <div className="signal-intelligence-stats" aria-label="Signal intelligence summary">
        <div>
          <strong>{payload.representedTopics}</strong>
          <span>topics</span>
        </div>
        <div>
          <strong>{payload.coveragePercent}%</strong>
          <span>coverage</span>
        </div>
        <div>
          <strong>{payload.representedSources}</strong>
          <span>sources</span>
        </div>
        <div>
          <strong>{payload.recentSignals}</strong>
          <span>recent</span>
        </div>
      </div>

      <div className="signal-intelligence-body">
        <div className="topic-meter-list" aria-label="Signal topic coverage">
          {topTopics.slice(0, 6).map((topic) => (
            <div className="topic-meter" key={topic.topic}>
              <div>
                <span>{topic.topic}</span>
                <strong>{topic.count}</strong>
              </div>
              <span className={`topic-meter-track topic-meter-level-${topicMeterLevel(topic.share, topic.count)}`}>
                <span></span>
              </span>
            </div>
          ))}
        </div>

        <div className="source-mix-list" aria-label="Signal source mix">
          <span>Latest {formatSignalDate(payload.newestSignalAt)}</span>
          {sourceMix.slice(0, 5).map((source) => (
            <div key={source.sourceName}>
              <strong>{source.sourceName}</strong>
              <span>{source.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SearchResultCard({ item }: { item: SearchResult }) {
  const external = item.href.startsWith('http')

  return (
    <a className="search-result-card" href={item.href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
      <div className="card-kicker">
        <Search size={16} />
        <span>{item.type}</span>
      </div>
      <h4>{item.title}</h4>
      <span className="result-eyebrow">{item.eyebrow}</span>
      <p>{item.summary}</p>
      {item.meta ? <span className="result-meta">{item.meta}</span> : null}
    </a>
  )
}

function HomeSignalItem({ item }: { item: NewsItem }) {
  const date = new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(item.publishedAt))

  return (
    <a className="home-signal-item" href={item.url} target="_blank" rel="noreferrer">
      <span>{item.sourceName}</span>
      <h3>{item.title}</h3>
      <p>{item.topics.slice(0, 3).join(' / ')}</p>
      <small>{date}</small>
    </a>
  )
}

function ChatCitations({ response }: { response: HerbalChatResponse }) {
  if (!response.citations.length) {
    return null
  }

  return (
    <div className="chat-citations" aria-label="Herbal chat public-domain sources">
      {response.citations.slice(0, 4).map((source) => (
        <a key={source.sourceId} href={source.sourceUrl} target="_blank" rel="noreferrer">
          <span>{source.title}</span>
          <small>{source.licenseLabel}</small>
        </a>
      ))}
    </div>
  )
}

function AmbientVideo({ className, slot }: { className: string; slot: MotionMediaSlot }) {
  if (!slot.enabled || !slot.src) {
    return null
  }

  return (
    <video
      className={`${className} ambient-video`}
      poster={slot.poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
    >
      <source src={slot.src} type={slot.type} />
    </video>
  )
}

function App() {
  const [globalQuery, setGlobalQuery] = useState(() => urlParam('q'))
  const [searchGroups, setSearchGroups] = useState<SearchGroup[]>([])
  const [searchStatus, setSearchStatus] = useState('Unified research console')
  const [searchRegionGuidance, setSearchRegionGuidance] = useState<SearchRegionGuidance | null>(null)
  const [loadedSearchRequestKey, setLoadedSearchRequestKey] = useState('')
  const [searchFallbackIndex, setSearchFallbackIndex] = useState<SearchFallbackIndex>(defaultSearchFallbackIndex)
  const [searchFallbackSourceLabel, setSearchFallbackSourceLabel] = useState('local seed')
  const [searchFallbackReady, setSearchFallbackReady] = useState(false)
  const [searchRegion, setSearchRegion] = useState<BookRegionFilter>(
    () => urlOptionParam('region', bookRegionModes, 'All lanes') as BookRegionFilter,
  )
  const [bookQuery, setBookQuery] = useState(() => urlParam('book'))
  const [bookMode, setBookMode] = useState(() => urlOptionParam('bookMode', bookModes, 'All'))
  const [bookRegion, setBookRegion] = useState<BookRegionFilter>(
    () => urlOptionParam('bookRegion', bookRegionModes, 'All lanes') as BookRegionFilter,
  )
  const [books, setBooks] = useState<BookRecord[]>(bookRecords)
  const [referenceLaneCoverage, setReferenceLaneCoverage] = useState<ReferenceLaneCoverage[]>(() =>
    buildReferenceLaneCoverage(bookRecords),
  )
  const [bookPageCount, setBookPageCount] = useState(1)
  const [libraryStatus, setLibraryStatus] = useState('Seed reference library')
  const [citationQuery, setCitationQuery] = useState(() => urlParam('note'))
  const [citationType, setCitationType] = useState(() =>
    urlOptionParam('noteType', citationTypeModes, 'All notes'),
  )
  const [notes, setNotes] = useState<CitationNote[]>(citationNotes)
  const [citationStatus, setCitationStatus] = useState(`${citationNotes.length} citation notes from seed index`)
  const [remedyQuery, setRemedyQuery] = useState(() => urlParam('remedy'))
  const [remedyPreparation, setRemedyPreparation] = useState(() =>
    urlOptionParam('prep', remedyPreparationModes, 'All preparations'),
  )
  const [remedies, setRemedies] = useState<RemedyRecord[]>(remedyRecords)
  const [remedyStatus, setRemedyStatus] = useState(`${remedyRecords.length} remedies from seed index`)
  const [graphQuery, setGraphQuery] = useState(() => urlParam('map'))
  const [graphRelation, setGraphRelation] = useState(() =>
    urlOptionParam('relation', graphRelationModes, 'All relations'),
  )
  const [graphPayload, setGraphPayload] = useState<GraphPayload>(() =>
    buildFallbackGraphPayload(remedyRecords, '', 'All relations'),
  )
  const [graphStatus, setGraphStatus] = useState('Relationship map from seed index')
  const [feedQuery, setFeedQuery] = useState(() => urlParam('signal'))
  const [feedMode, setFeedMode] = useState(() => urlOptionParam('topic', feedModes, 'All'))
  const [feedSource, setFeedSource] = useState(() => urlOptionParam('source', initialFeedSourceModes, 'All sources'))
  const [newsItems, setNewsItems] = useState<NewsItem[]>(seedNews)
  const [feedStatus, setFeedStatus] = useState('Seeded public-source feed')
  const [feedHeartbeat, setFeedHeartbeat] = useState('Refresh heartbeat pending')
  const [feedWarnings, setFeedWarnings] = useState<string[]>([])
  const [sourceHealth, setSourceHealth] = useState<SourceHealthItem[]>(() =>
    buildFallbackSourceHealth(seedNews, sourceAllowlist),
  )
  const [sourceHealthStatus, setSourceHealthStatus] = useState('Source health from seed registry')
  const [signalIntelligence, setSignalIntelligence] = useState<SignalIntelligencePayload>(() =>
    buildFallbackSignalIntelligence(seedNews, buildFallbackSourceHealth(seedNews, sourceAllowlist)),
  )
  const [signalIntelligenceStatus, setSignalIntelligenceStatus] = useState('from seed signals')
  const [sources, setSources] = useState<SourceRegistryItem[]>(sourceAllowlist)
  const [sourceStatus, setSourceStatus] = useState(`${sourceAllowlist.length} sources from seed registry`)
  const [mediaManifest, setMediaManifest] = useState<MediaManifest>(defaultMediaManifest)
  const [homeChatQuery, setHomeChatQuery] = useState('')
  const [homeChatResponse, setHomeChatResponse] = useState<HerbalChatResponse>(() => initialHomeHerbalResponse)
  const [homeChatMessages, setHomeChatMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'assistant-intro',
      role: 'assistant',
      text: initialHomeHerbalResponse.answer,
    },
  ])
  const [homeChatLoading, setHomeChatLoading] = useState(false)
  const [homeSearchGroups, setHomeSearchGroups] = useState<SearchGroup[]>([])
  const [homeSearchStatus, setHomeSearchStatus] = useState('Search herbs, references, signals, and source notes')
  const [homeSearchLastQuery, setHomeSearchLastQuery] = useState('')
  const [activePage, setActivePage] = useState<PageId>(() => {
    if (typeof window === 'undefined') {
      return 'home'
    }

    return pageFromPath(pathFromLegacyHash(window.location.hash) || window.location.pathname)
  })
  const debouncedGlobalQuery = useDebouncedValue(globalQuery)
  const debouncedBookQuery = useDebouncedValue(bookQuery)
  const debouncedCitationQuery = useDebouncedValue(citationQuery)
  const debouncedRemedyQuery = useDebouncedValue(remedyQuery)
  const debouncedGraphQuery = useDebouncedValue(graphQuery)
  const debouncedFeedQuery = useDebouncedValue(feedQuery)
  const trimmedGlobalQuery = debouncedGlobalQuery.trim()
  const fallbackSearchGroups = useMemo(
    () => buildFallbackSearchGroups(trimmedGlobalQuery, searchFallbackIndex, searchRegion),
    [searchFallbackIndex, searchRegion, trimmedGlobalQuery],
  )
  const fallbackSearchTotal = fallbackSearchGroups.reduce((sum, group) => sum + group.total, 0)
  const visibleHerbalSources = useMemo(
    () => (searchFallbackIndex.herbalSources.length ? searchFallbackIndex.herbalSources : herbalSourceWorks),
    [searchFallbackIndex.herbalSources],
  )
  const visibleHerbalEntries = useMemo(
    () => (searchFallbackIndex.herbs.length ? searchFallbackIndex.herbs : herbalKnowledgeEntries),
    [searchFallbackIndex.herbs],
  )
  const herbalCorpusProfileCount = visibleHerbalEntries.filter((entry) => entry.entryKind === 'corpus-profile').length
  const herbalLinkedPassageCount = visibleHerbalEntries.reduce(
    (sum, entry) => sum + Number(entry.corpusChunkCount ?? 0),
    0,
  )
  const visibleBookCount = bookPageCount * initialLibraryVisibleCount
  const visibleBooks = useMemo(() => books.slice(0, visibleBookCount), [books, visibleBookCount])
  const feedSourceModes = useMemo(
    () => ['All sources', ...new Set(sources.map((source) => source.feedName ?? source.name))],
    [sources],
  )
  const activeFeedSource = feedSourceModes.includes(feedSource) ? feedSource : 'All sources'
  const feedRequestKey = `${feedMode}|${activeFeedSource}|${debouncedFeedQuery.trim()}`
  const searchRequestKey = `${trimmedGlobalQuery}|${searchRegion}`
  const signalsRssHref = useMemo(() => {
    const params = new URLSearchParams()
    const trimmedQuery = debouncedFeedQuery.trim()

    if (feedMode !== 'All') {
      params.set('topic', feedMode)
    }

    if (activeFeedSource !== 'All sources') {
      params.set('source', activeFeedSource)
    }

    if (trimmedQuery) {
      params.set('query', trimmedQuery)
    }

    const query = params.toString()
    return `/api/signals.xml${query ? `?${query}` : ''}`
  }, [activeFeedSource, debouncedFeedQuery, feedMode])
  const [loadedFeedRequestKey, setLoadedFeedRequestKey] = useState(feedRequestKey)
  const feedLoading = loadedFeedRequestKey !== feedRequestKey
  const searchLoading = Boolean(trimmedGlobalQuery) && loadedSearchRequestKey !== searchRequestKey
  const fallbackSearchPending = Boolean(trimmedGlobalQuery) && searchLoading && !searchFallbackReady
  const visibleSearchGroups = fallbackSearchPending ? [] : searchLoading ? fallbackSearchGroups : searchGroups
  const visibleSearchTotal = fallbackSearchPending
    ? 0
    : searchLoading
    ? fallbackSearchTotal
    : searchGroups.reduce((sum, group) => sum + group.total, 0)
  const activeSearchRegionGuidance =
    searchRegion === 'All lanes'
      ? null
      : loadedSearchRequestKey === searchRequestKey && searchRegionGuidance?.lane === searchRegion
        ? searchRegionGuidance
        : buildSearchRegionGuidance(searchRegion, visibleSearchGroups)
  const activeSearchStatus = trimmedGlobalQuery
    ? fallbackSearchPending
      ? 'Loading indexed records...'
      : searchLoading
      ? `${visibleSearchTotal} matches from ${searchFallbackSourceLabel}; checking live sources`
      : searchStatus
    : 'Unified research console'
  const searchEmptyText = fallbackSearchPending
    ? 'Loading indexed records for this query...'
    : searchLoading
    ? 'Checking live public sources for this query...'
    : 'No indexed records match this query yet.'
  const graphNodes = graphPayload.nodes ?? emptyGraphNodes
  const graphEdges = graphPayload.edges ?? emptyGraphEdges
  const graphNodeById = useMemo(() => new Map(graphNodes.map((node) => [node.id, node])), [graphNodes])
  const graphStats = useMemo(
    () =>
      ['Remedy', 'Plant part', 'Preparation', 'Context', 'Safety'].map((type) => ({
        type,
        count: graphNodes.filter((node) => node.type === type).length,
      })),
    [graphNodes],
  )
  const visibleGraphEdges = graphEdges.slice(0, 16)
  const homeSignals = newsItems.slice(0, 6)
  const homePreviewGroups = useMemo(() => nonEmptySearchGroups(homeSearchGroups).slice(0, 3), [homeSearchGroups])

  useEffect(() => {
    const legacyPath = pathFromLegacyHash(window.location.hash)
    if (legacyPath) {
      window.history.replaceState(null, '', `${legacyPath}${window.location.search}`)
    }

    const handlePopState = () => {
      setActivePage(pageFromPath(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const url = new URL(window.location.href)

    setOptionalUrlParam(url.searchParams, 'q', debouncedGlobalQuery)
    setOptionalUrlParam(url.searchParams, 'region', searchRegion, 'All lanes')
    setOptionalUrlParam(url.searchParams, 'book', debouncedBookQuery)
    setOptionalUrlParam(url.searchParams, 'bookMode', bookMode, 'All')
    setOptionalUrlParam(url.searchParams, 'bookRegion', bookRegion, 'All lanes')
    setOptionalUrlParam(url.searchParams, 'note', debouncedCitationQuery)
    setOptionalUrlParam(url.searchParams, 'noteType', citationType, 'All notes')
    setOptionalUrlParam(url.searchParams, 'remedy', debouncedRemedyQuery)
    setOptionalUrlParam(url.searchParams, 'prep', remedyPreparation, 'All preparations')
    setOptionalUrlParam(url.searchParams, 'map', debouncedGraphQuery)
    setOptionalUrlParam(url.searchParams, 'relation', graphRelation, 'All relations')
    setOptionalUrlParam(url.searchParams, 'signal', debouncedFeedQuery)
    setOptionalUrlParam(url.searchParams, 'topic', feedMode, 'All')
    setOptionalUrlParam(url.searchParams, 'source', activeFeedSource, 'All sources')

    const nextUrl = `${url.pathname}${url.search}`
    const currentUrl = `${window.location.pathname}${window.location.search}`
    if (nextUrl !== currentUrl) {
      window.history.replaceState(null, '', nextUrl)
    }
  }, [
    activeFeedSource,
    bookRegion,
    bookMode,
    citationType,
    debouncedBookQuery,
    debouncedCitationQuery,
    debouncedFeedQuery,
    debouncedGraphQuery,
    debouncedGlobalQuery,
    debouncedRemedyQuery,
    feedMode,
    graphRelation,
    remedyPreparation,
    searchRegion,
  ])

  const navigateToPage = (page: PageId, path: string) => {
    const nextUrl = `${path}${window.location.search}`
    const currentUrl = `${window.location.pathname}${window.location.search}`

    if (nextUrl !== currentUrl) {
      window.history.pushState(null, '', nextUrl)
    }

    setActivePage(page)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  const handlePageNavigation = (event: MouseEvent<HTMLAnchorElement>, page: PageId, path: string) => {
    event.preventDefault()
    navigateToPage(page, path)
  }

  const handleHomeNavigation = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    navigateToPage('home', '/')
  }

  const openSearchConsole = (query: string) => {
    const trimmedQuery = query.trim()
    const params = new URLSearchParams(window.location.search)
    setGlobalQuery(trimmedQuery)
    setLoadedSearchRequestKey('')
    setSearchGroups([])
    setOptionalUrlParam(params, 'q', trimmedQuery)
    navigateToPage('search', `/search${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const handleHomeChatSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = homeChatQuery.trim()
    if (!query || homeChatLoading) {
      return
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
    }
    setHomeChatMessages((messages) => [...messages, userMessage])
    setHomeChatLoading(true)
    setHomeSearchGroups([])
    setHomeSearchLastQuery(query)
    setHomeSearchStatus(`Searching indexed records for "${query}"`)

    const loadHomeSearchGroups = async () => {
      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`, { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Search API unavailable')
        }

        const payload = (await response.json()) as SearchPayload
        const groups = Array.isArray(payload.groups) ? payload.groups : []
        return {
          groups,
          total: payload.total ?? groups.reduce((sum, group) => sum + group.total, 0),
          source: readableSource(payload.source),
        }
      } catch {
        const groups = buildFallbackSearchGroups(query, searchFallbackIndex)
        return {
          groups,
          total: groups.reduce((sum, group) => sum + group.total, 0),
          source: searchFallbackSourceLabel,
        }
      }
    }

    const loadHomeHerbalResponse = async () => {
      try {
        const response = await fetch(`/api/herbal-chat?query=${encodeURIComponent(query)}`, { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Herbal chat API unavailable')
        }
        return (await response.json()) as HerbalChatResponse
      } catch {
        try {
          const exportResponse = await fetch('/data/herbal-knowledge.json', { cache: 'no-store' })
          if (!exportResponse.ok) {
            throw new Error('Herbal knowledge export unavailable')
          }

          const payload = (await exportResponse.json()) as HerbalKnowledgeExportPayload
          const entries =
            Array.isArray(payload.records) && payload.records.length ? payload.records : searchFallbackIndex.herbs
          const sources =
            Array.isArray(payload.sources) && payload.sources.length
              ? payload.sources
              : searchFallbackIndex.herbalSources

          return buildFallbackHerbalChatResponse(query, entries, sources)
        } catch {
          return buildFallbackHerbalChatResponse(query, searchFallbackIndex.herbs, searchFallbackIndex.herbalSources)
        }
      }
    }

    const homeSearchPromise = loadHomeSearchGroups().then((searchPayload) => {
      setHomeSearchGroups(searchPayload.groups)
      setHomeSearchStatus(
        searchPayload.total > 0
          ? `${searchPayload.total} indexed results from ${searchPayload.source}`
          : `No indexed results yet from ${searchPayload.source}`,
      )
      setHomeSearchLastQuery(query)
      return searchPayload
    })

    Promise.all([homeSearchPromise, loadHomeHerbalResponse()])
      .then(([searchPayload, herbalPayload]) => {
        const visibleGroups = nonEmptySearchGroups(searchPayload.groups)
        const hasHerbalMatch = herbalPayload.matches.length > 0
        const assistantText = hasHerbalMatch
          ? herbalPayload.answer
          : searchPayload.total > 0
          ? `I found ${searchPayload.total} indexed result${searchPayload.total === 1 ? '' : 's'} across ${summarizeSearchGroups(
              visibleGroups,
            )}. Review the preview below or open the research console for the full result set.`
          : herbalPayload.answer

        setHomeChatResponse({
          ...herbalPayload,
          answer: assistantText,
          citations: hasHerbalMatch ? herbalPayload.citations : [],
        })
        setHomeChatMessages((messages) => [
          ...messages,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            text: assistantText,
          },
        ])
        setHomeChatQuery('')
      })
      .finally(() => setHomeChatLoading(false))
  }

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    const loadFallbackIndex = async () => {
      const results = await Promise.allSettled([
        fetch('/data/reference-books.json', { cache: 'no-store', signal: controller.signal }).then((response) => {
          if (!response.ok) {
            throw new Error('Reference export unavailable')
          }

          return response.json() as Promise<DataExportPayload<BookRecord>>
        }),
        fetch('/data/herbal-knowledge.json', { cache: 'no-store', signal: controller.signal }).then((response) => {
          if (!response.ok) {
            throw new Error('Herbal knowledge export unavailable')
          }

          return response.json() as Promise<HerbalKnowledgeExportPayload>
        }),
        fetch('/data/remedies.json', { cache: 'no-store', signal: controller.signal }).then((response) => {
          if (!response.ok) {
            throw new Error('Remedy export unavailable')
          }

          return response.json() as Promise<DataExportPayload<RemedyRecord>>
        }),
        fetch('/data/citation-notes.json', { cache: 'no-store', signal: controller.signal }).then((response) => {
          if (!response.ok) {
            throw new Error('Citation export unavailable')
          }

          return response.json() as Promise<DataExportPayload<CitationNote>>
        }),
        fetch('/data/sources.json', { cache: 'no-store', signal: controller.signal }).then((response) => {
          if (!response.ok) {
            throw new Error('Source export unavailable')
          }

          return response.json() as Promise<DataExportPayload<SourceRegistryItem>>
        }),
        fetch('/data/news.json', { cache: 'no-store', signal: controller.signal }).then((response) => {
          if (!response.ok) {
            throw new Error('News export unavailable')
          }

          return response.json() as Promise<NewsPayload>
        }),
      ])

      if (!active) {
        return
      }

      const nextIndex: SearchFallbackIndex = { ...defaultSearchFallbackIndex }
      let hydrated = false

      const [booksResult, herbsResult, remediesResult, notesResult, sourcesResult, newsResult] = results

      if (booksResult.status === 'fulfilled' && Array.isArray(booksResult.value.records) && booksResult.value.records.length) {
        nextIndex.books = booksResult.value.records
        hydrated = true
      }

      if (herbsResult.status === 'fulfilled' && Array.isArray(herbsResult.value.records) && herbsResult.value.records.length) {
        nextIndex.herbs = herbsResult.value.records
        nextIndex.herbalSources =
          Array.isArray(herbsResult.value.sources) && herbsResult.value.sources.length
            ? herbsResult.value.sources
            : nextIndex.herbalSources
        hydrated = true
      }

      if (
        remediesResult.status === 'fulfilled' &&
        Array.isArray(remediesResult.value.records) &&
        remediesResult.value.records.length
      ) {
        nextIndex.remedies = remediesResult.value.records
        hydrated = true
      }

      if (notesResult.status === 'fulfilled' && Array.isArray(notesResult.value.records) && notesResult.value.records.length) {
        nextIndex.notes = notesResult.value.records
        hydrated = true
      }

      if (
        sourcesResult.status === 'fulfilled' &&
        Array.isArray(sourcesResult.value.records) &&
        sourcesResult.value.records.length
      ) {
        nextIndex.sources = sourcesResult.value.records
        hydrated = true
      }

      if (newsResult.status === 'fulfilled' && Array.isArray(newsResult.value.items) && newsResult.value.items.length) {
        nextIndex.signals = newsResult.value.items
        hydrated = true
      }

      setSearchFallbackIndex(nextIndex)
      setSearchFallbackSourceLabel(hydrated ? 'static review cache' : 'local seed')
      setSearchFallbackReady(true)
    }

    loadFallbackIndex().catch((error) => {
      if ((error as Error).name === 'AbortError') {
        return
      }

      if (active) {
        setSearchFallbackIndex(defaultSearchFallbackIndex)
        setSearchFallbackSourceLabel('local seed')
        setSearchFallbackReady(true)
      }
    })

    return () => {
      active = false
      controller.abort()
    }
  }, [])

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const query = trimmedGlobalQuery

    if (!query) {
      return () => {
        active = false
        controller.abort()
      }
    }

    const params = new URLSearchParams()
    params.set('query', query)
    if (searchRegion !== 'All lanes') {
      params.set('region', searchRegion)
    }

    fetch(`/api/search?${params.toString()}`, { cache: 'no-store', signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Search API unavailable')
        }
        return response.json() as Promise<SearchPayload>
      })
      .then((payload) => {
        if (active && Array.isArray(payload.groups)) {
          setSearchGroups(payload.groups)
          setSearchRegionGuidance(payload.regionGuidance ?? buildSearchRegionGuidance(searchRegion, payload.groups))
          setSearchStatus(`${payload.total ?? 0} matches from ${readableSource(payload.source)}`)
          setLoadedSearchRequestKey(searchRequestKey)
        }
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          return
        }

        if (active) {
          if (!searchFallbackReady) {
            setSearchGroups([])
            setSearchStatus('Loading indexed records...')
            return
          }
          const fallbackGroups = buildFallbackSearchGroups(query, searchFallbackIndex, searchRegion)
          const total = fallbackGroups.reduce((sum, group) => sum + group.total, 0)
          setSearchGroups(fallbackGroups)
          setSearchRegionGuidance(buildSearchRegionGuidance(searchRegion, fallbackGroups))
          setSearchStatus(`${total} matches from ${searchFallbackSourceLabel}`)
          setLoadedSearchRequestKey(searchRequestKey)
        }
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [searchFallbackIndex, searchFallbackReady, searchFallbackSourceLabel, searchRegion, searchRequestKey, trimmedGlobalQuery])

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    fetch('/data/media-manifest.json', { cache: 'no-store', signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Media manifest unavailable')
        }
        return response.json() as Promise<MediaManifest>
      })
      .then((payload) => {
        if (active && payload.video?.hero && payload.video?.research) {
          setMediaManifest(payload)
        }
      })
      .catch((error) => {
        if (active && error.name !== 'AbortError') {
          setMediaManifest(defaultMediaManifest)
        }
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [])

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    fetch('/api/source-health', { cache: 'no-store', signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Source health API unavailable')
        }
        return response.json() as Promise<SourceHealthPayload>
      })
      .then((payload) => {
        if (!active || !Array.isArray(payload.sources)) {
          return
        }

        setSourceHealth(payload.sources)
        const healthyCount = payload.healthyCount ?? payload.sources.filter((source) => source.status === 'ok').length
        const emptyCount = payload.emptyCount ?? payload.sources.filter((source) => source.status === 'empty').length
        const warningCount = payload.warningCount ?? payload.sources.filter((source) => source.status === 'warning').length
        setSourceHealthStatus(
          `${healthyCount} healthy / ${emptyCount} empty / ${warningCount} warnings from ${readableSource(payload.source)}`,
        )
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          return
        }

        if (active) {
          const fallbackHealth = buildFallbackSourceHealth(seedNews, sourceAllowlist)
          setSourceHealth(fallbackHealth)
          setSourceHealthStatus(`${fallbackHealth.length} sources from local seed registry`)
        }
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [])

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const params = new URLSearchParams()

    if (debouncedBookQuery.trim()) {
      params.set('query', debouncedBookQuery.trim())
    }

    if (bookMode !== 'All') {
      params.set('mode', bookMode)
    }

    if (bookRegion !== 'All lanes') {
      params.set('region', bookRegion)
    }

    const booksUrl = `/api/books${params.toString() ? `?${params.toString()}` : ''}`

    const loadBooks = async () => {
      try {
        const response = await fetch(booksUrl, { cache: 'no-store', signal: controller.signal })
        if (!response.ok) {
          throw new Error('Books API unavailable')
        }

        const payload = (await response.json()) as BookPayload
        if (active && Array.isArray(payload.books)) {
          setBooks(payload.books)
          setReferenceLaneCoverage(
            Array.isArray(payload.laneCoverage) && payload.laneCoverage.length
              ? payload.laneCoverage
              : buildReferenceLaneCoverage(payload.books),
          )
          setLibraryStatus(
            `${payload.total ?? payload.books.length} references from ${readableSource(payload.source)}${bookRegion !== 'All lanes' ? ` for ${bookRegion} lane` : ''}`,
          )
        }
        return
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return
        }
      }

      try {
        const exportResponse = await fetch('/data/reference-books.json', {
          cache: 'no-store',
          signal: controller.signal,
        })
        if (!exportResponse.ok) {
          throw new Error('Reference book export unavailable')
        }

        const payload = (await exportResponse.json()) as BookExportPayload
        if (active && Array.isArray(payload.records)) {
          const exportBooks = filterBookRecords(payload.records, bookMode, debouncedBookQuery, bookRegion)
          setBooks(exportBooks)
          setReferenceLaneCoverage(
            Array.isArray(payload.laneCoverage) && payload.laneCoverage.length
              ? payload.laneCoverage
              : buildReferenceLaneCoverage(payload.records),
          )
          setLibraryStatus(
            `${exportBooks.length} references from ${readableSource(payload.source)}${bookRegion !== 'All lanes' ? ` for ${bookRegion} lane` : ''}`,
          )
        }
        return
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return
        }
      }

      if (active) {
        const fallbackBooks = filterBookRecords(bookRecords, bookMode, debouncedBookQuery, bookRegion)
        setBooks(fallbackBooks)
        setReferenceLaneCoverage(buildReferenceLaneCoverage(bookRecords))
        setLibraryStatus(
          `${fallbackBooks.length} references from local archive seed${bookRegion !== 'All lanes' ? ` for ${bookRegion} lane` : ''}`,
        )
      }
    }

    void loadBooks()

    return () => {
      active = false
      controller.abort()
    }
  }, [bookMode, bookRegion, debouncedBookQuery])

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const params = new URLSearchParams()

    if (debouncedCitationQuery.trim()) {
      params.set('query', debouncedCitationQuery.trim())
    }

    if (citationType !== 'All notes') {
      params.set('type', citationTypeParam(citationType))
    }

    const notesUrl = `/api/citation-notes${params.toString() ? `?${params.toString()}` : ''}`

    fetch(notesUrl, { cache: 'no-store', signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Citation notes API unavailable')
        }
        return response.json() as Promise<CitationPayload>
      })
      .then((payload) => {
        if (active && Array.isArray(payload.notes)) {
          setNotes(payload.notes)
          setCitationStatus(`${payload.total ?? payload.notes.length} notes from ${readableSource(payload.source)}`)
        }
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          return
        }

        if (active) {
          const fallbackNotes = filterCitationNoteRecords(citationNotes, debouncedCitationQuery, citationType)
          setNotes(fallbackNotes)
          setCitationStatus(`${fallbackNotes.length} notes from local seed`)
        }
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [citationType, debouncedCitationQuery])

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const params = new URLSearchParams()

    if (debouncedRemedyQuery.trim()) {
      params.set('query', debouncedRemedyQuery.trim())
    }

    if (remedyPreparation !== 'All preparations') {
      params.set('preparation', remedyPreparation)
    }

    const remediesUrl = `/api/remedies${params.toString() ? `?${params.toString()}` : ''}`

    fetch(remediesUrl, { cache: 'no-store', signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Remedies API unavailable')
        }
        return response.json() as Promise<RemedyPayload>
      })
      .then((payload) => {
        if (active && Array.isArray(payload.remedies)) {
          setRemedies(payload.remedies)
          setRemedyStatus(`${payload.total ?? payload.remedies.length} remedies from ${readableSource(payload.source)}`)
        }
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          return
        }

        if (active) {
          const fallbackRemedies = filterRemedyRecords(remedyRecords, debouncedRemedyQuery, remedyPreparation)
          setRemedies(fallbackRemedies)
          setRemedyStatus(`${fallbackRemedies.length} remedies from local seed`)
        }
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [debouncedRemedyQuery, remedyPreparation])

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const params = new URLSearchParams()

    if (debouncedGraphQuery.trim()) {
      params.set('query', debouncedGraphQuery.trim())
    }

    if (graphRelation !== 'All relations') {
      params.set('relation', graphRelation)
    }

    const graphUrl = `/api/graph${params.toString() ? `?${params.toString()}` : ''}`

    fetch(graphUrl, { cache: 'no-store', signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Relationship map API unavailable')
        }
        return response.json() as Promise<GraphPayload>
      })
      .then((payload) => {
        if (!active || !Array.isArray(payload.nodes) || !Array.isArray(payload.edges)) {
          return
        }

        setGraphPayload(payload)
        setGraphStatus(
          `${payload.nodeCount ?? payload.nodes.length} nodes / ${
            payload.edgeCount ?? payload.edges.length
          } links from ${readableSource(payload.source)}`,
        )
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          return
        }

        if (active) {
          const fallbackGraph = buildFallbackGraphPayload(remedyRecords, debouncedGraphQuery, graphRelation)
          setGraphPayload(fallbackGraph)
          setGraphStatus(`${fallbackGraph.nodeCount ?? 0} nodes / ${fallbackGraph.edgeCount ?? 0} links from local seed`)
        }
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [debouncedGraphQuery, graphRelation])

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const params = new URLSearchParams()

    if (feedMode !== 'All') {
      params.set('topic', feedMode)
    }

    if (activeFeedSource !== 'All sources') {
      params.set('source', activeFeedSource)
    }

    if (debouncedFeedQuery.trim()) {
      params.set('query', debouncedFeedQuery.trim())
    }

    const newsUrl = `/api/news${params.toString() ? `?${params.toString()}` : ''}`

    fetch(newsUrl, { cache: 'no-store', signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('News API unavailable')
        }
        return response.json() as Promise<NewsPayload>
      })
      .then((payload) => {
        if (!active || !Array.isArray(payload.items)) {
          return
        }
        setNewsItems(payload.items)
        setFeedWarnings(payload.warnings ?? [])
        setLoadedFeedRequestKey(feedRequestKey)
        setFeedStatus(
          `${payload.total ?? payload.items.length} signals from ${readableSource(payload.source)}${
            payload.generatedAt ? `, refreshed ${formatRefreshTime(payload.generatedAt)}` : ''
          }`,
        )
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          return
        }

        fetch('/data/news.json', { cache: 'no-store' })
          .then((response) => {
            if (!response.ok) {
              throw new Error('No refreshed feed yet')
            }
            return response.json() as Promise<NewsPayload>
          })
          .then((payload) => {
            if (!active || !Array.isArray(payload.items)) {
              return
            }
            const fallbackItems = filterNewsRecords(payload.items, feedMode, activeFeedSource, debouncedFeedQuery)
            setNewsItems(fallbackItems)
            setFeedWarnings(payload.warnings ?? [])
            setLoadedFeedRequestKey(feedRequestKey)
            setFeedStatus(
              `${fallbackItems.length} signals from static refresh${
                payload.generatedAt ? `, refreshed ${formatRefreshTime(payload.generatedAt)}` : ''
              }`,
            )
          })
          .catch(() => {
            if (active) {
              const fallbackItems = filterNewsRecords(seedNews, feedMode, activeFeedSource, debouncedFeedQuery)
              setNewsItems(fallbackItems)
              setFeedWarnings([])
              setLoadedFeedRequestKey(feedRequestKey)
              setFeedStatus(`${fallbackItems.length} signals from local seed`)
            }
          })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [activeFeedSource, debouncedFeedQuery, feedMode, feedRequestKey])

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const params = new URLSearchParams()

    if (feedMode !== 'All') {
      params.set('topic', feedMode)
    }

    if (activeFeedSource !== 'All sources') {
      params.set('source', activeFeedSource)
    }

    if (debouncedFeedQuery.trim()) {
      params.set('query', debouncedFeedQuery.trim())
    }

    const intelligenceUrl = `/api/signal-intelligence${params.toString() ? `?${params.toString()}` : ''}`

    fetch(intelligenceUrl, { cache: 'no-store', signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Signal intelligence API unavailable')
        }
        return response.json() as Promise<SignalIntelligencePayload>
      })
      .then((payload) => {
        if (!active || !Array.isArray(payload.topicCoverage) || !Array.isArray(payload.sourceMix)) {
          return
        }

        setSignalIntelligence(payload)
        setSignalIntelligenceStatus(`from ${readableSource(payload.source)}`)
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          return
        }

        if (active) {
          const fallbackItems = filterNewsRecords(seedNews, feedMode, activeFeedSource, debouncedFeedQuery)
          setSignalIntelligence(buildFallbackSignalIntelligence(fallbackItems, sourceHealth, 'local seed'))
          setSignalIntelligenceStatus('from local seed')
        }
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [activeFeedSource, debouncedFeedQuery, feedMode, sourceHealth])

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    const applyPayload = (payload: FeedStatusPayload) => {
      const text = refreshHeartbeatText(payload)
      if (!text) {
        return false
      }

      if (active) {
        setFeedHeartbeat(text)
      }
      return true
    }

    const loadStaticHeartbeat = () =>
      fetch('/data/feed-status.json', { cache: 'no-store', signal: controller.signal })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Static feed status unavailable')
          }
          return response.json() as Promise<FeedStatusPayload>
        })
        .then((payload) => {
          applyPayload(payload)
        })
        .catch((error) => {
          if (active && error.name !== 'AbortError') {
            setFeedHeartbeat('Refresh heartbeat pending')
          }
        })

    fetch('/api/feed-status', { cache: 'no-store', signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Feed status API unavailable')
        }
        return response.json() as Promise<FeedStatusPayload>
      })
      .then((payload) => {
        if (!applyPayload(payload)) {
          return loadStaticHeartbeat()
        }
        return undefined
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          return loadStaticHeartbeat()
        }
        return undefined
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [])

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    fetch('/api/sources', { cache: 'no-store', signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Sources API unavailable')
        }
        return response.json() as Promise<SourcesPayload>
      })
      .then((payload) => {
        if (active && Array.isArray(payload.sources)) {
          setSources(payload.sources)
          setSourceStatus(`${payload.total ?? payload.sources.length} sources from ${readableSource(payload.source)}`)
        }
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          return
        }

        if (active) {
          setSources(sourceAllowlist)
          setSourceStatus(`${sourceAllowlist.length} sources from local seed`)
        }
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [])

  const currentPageLabel =
    activePage === 'home'
      ? 'Herbalisti'
      : (navigationItems.find((item) => item.page === activePage)?.label ?? 'Herbalisti')

  return (
    <>
      <a className="skip-link" href="#top">
        Skip to main content
      </a>
      <header className="site-header">
        <Logo onHomeClick={handleHomeNavigation} />
        <nav aria-label="Primary navigation">
          {navigationItems.map((item) => (
            <a
              key={item.path}
              className={activePage === item.page ? 'active' : ''}
              href={item.path}
              onClick={(event) => handlePageNavigation(event, item.page, item.path)}
              aria-current={activePage === item.page ? 'page' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

    <main id="top" tabIndex={-1}>
      {activePage !== 'home' ? <h1 className="visually-hidden">{currentPageLabel}</h1> : null}

      {activePage === 'home' ? (
        <>
      <section className="hero-section home-search-hero" aria-labelledby="hero-title">
        <img className="hero-image" src="/assets/herbalisti-hero.png" alt="" />
        <AmbientVideo className="hero-video" slot={mediaManifest.video.hero} />
        <div className="motion-grid" aria-hidden="true"></div>
        <div className="signal-lattice" aria-hidden="true"></div>
        <div className="scanline" aria-hidden="true"></div>
        <div className="home-hero-grid">
          <div className="home-hero-primary">
            <div className="hero-copy home-copy">
              <div className="eyebrow">
                <Sparkles size={16} />
                <span>Self-sovereign health intelligence</span>
              </div>
              <h1 id="hero-title">Herbalisti</h1>
              <p>
                Natural medicine, longevity science, and independent research signals for people
                who prefer to understand the evidence before making wellbeing decisions.
              </p>
              <div className="home-source-counts" aria-label="Indexed public-domain herbal sources">
                <span>Historical herb corpus</span>
                <span>Public-domain source links</span>
                <span>{newsItems.length} current signals</span>
              </div>
            </div>

            <div className="home-interface-stack" aria-label="Herbalisti search">
              <section className="home-chat-panel" aria-labelledby="home-chat-title">
                <div className="home-panel-heading">
                  <div>
                    <span>Archive search</span>
                    <h2 id="home-chat-title">Ask the herbal archive.</h2>
                  </div>
                  <BookOpen size={22} />
                </div>

                <form className="home-chat-form" onSubmit={handleHomeChatSubmit}>
                  <label className="visually-hidden" htmlFor="home-herbal-search">
                    Search the herbal index
                  </label>
                  <Search size={19} />
                  <input
                    id="home-herbal-search"
                    value={homeChatQuery}
                    onChange={(event) => setHomeChatQuery(event.target.value)}
                    placeholder="Search ginger, CRISPR, peptides, digestion, safety, source policy..."
                  />
                  <button type="submit" disabled={homeChatLoading || !homeChatQuery.trim()}>
                    <Search size={17} />
                    <span>{homeChatLoading ? 'Searching' : 'Search'}</span>
                  </button>
                </form>

                <div className="chat-thread" aria-live="polite">
                  {homeChatMessages.slice(-4).map((message) => (
                    <div className={`chat-message chat-message-${message.role}`} key={message.id}>
                      <span>{message.role === 'assistant' ? 'Herbalisti' : 'You'}</span>
                      <p>{message.text}</p>
                    </div>
                  ))}
                </div>

                <ChatCitations response={homeChatResponse} />
                {homeSearchLastQuery || homePreviewGroups.length ? (
                  <section className="home-search-preview" aria-label="Search preview results">
                    <div className="home-search-preview-header">
                      <div>
                        <span>Result preview</span>
                        <p>{homeSearchStatus}</p>
                      </div>
                      <a
                        href={`/search?q=${encodeURIComponent(homeSearchLastQuery)}`}
                        onClick={(event) => {
                          event.preventDefault()
                          openSearchConsole(homeSearchLastQuery)
                        }}
                      >
                        <Search size={15} />
                        <span>Open research console</span>
                      </a>
                    </div>
                    {homePreviewGroups.length ? (
                      <div className="home-search-preview-grid">
                        {homePreviewGroups.map((group) => (
                          <section className="home-search-group" key={group.id} aria-label={`${group.label} preview`}>
                            <div className="search-group-heading">
                              <h3>{group.label}</h3>
                              <span>{group.total}</span>
                            </div>
                            <div className="search-group-results">
                              {group.items.slice(0, 2).map((item) => (
                                <SearchResultCard key={item.id} item={item} />
                              ))}
                            </div>
                          </section>
                        ))}
                      </div>
                    ) : (
                      <p className="home-search-preview-empty">
                        {homeChatLoading
                          ? 'Checking the index and public-source signals...'
                          : 'No preview records matched yet. Open the research console to widen the search.'}
                      </p>
                    )}
                  </section>
                ) : null}
                <div className="home-chat-meta">
                  <Database size={16} />
                  <span>Searches herbs, references, signals, and source notes. Educational research only.</span>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      <section className="home-news-section" aria-labelledby="home-news-title">
        <div className="home-news-shell">
          <div className="section-heading home-news-heading">
            <span>Newsfeed</span>
            <h2 id="home-news-title">Independent public-source signals.</h2>
            <p>
              Allowlisted research and longevity sources, refreshed for emerging work across
              peptides, gene therapy, gene editing, DNA modification, CRISPR, and adjacent
              wellbeing infrastructure.
            </p>
          </div>

          <div className="home-news-toolbar">
            <div className="data-status">
              <RefreshCw size={18} />
              <span>{feedLoading ? 'Updating signals...' : feedStatus}</span>
            </div>
            <div className="home-news-actions">
              <a href="/signals" onClick={(event) => handlePageNavigation(event, 'signals', '/signals')}>
                <Activity size={16} />
                <span>Open signals</span>
              </a>
              <a href={signalsRssHref} target="_blank" rel="noreferrer">
                <Rss size={16} />
                <span>RSS</span>
              </a>
            </div>
          </div>

          <div className="home-news-grid">
            {feedLoading ? (
              <div className="compact-empty">
                <RefreshCw size={18} />
                <span>Updating signals...</span>
              </div>
            ) : homeSignals.length > 0 ? (
              homeSignals.map((item) => <HomeSignalItem key={item.id} item={item} />)
            ) : (
              <div className="compact-empty">
                <Search size={18} />
                <span>No current signals match the active filters.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="system-strip" aria-label="Herbalisti operating principles">
        <div>
          <Cpu size={20} />
          <span>Precision knowledge layer</span>
        </div>
        <div>
          <ShieldCheck size={20} />
          <span>Public-source transparency</span>
        </div>
        <div>
          <Zap size={20} />
          <span>Portable data access</span>
        </div>
      </section>
        </>
      ) : null}

      {activePage === 'search' ? (
      <section className="console-section" id="console" aria-labelledby="console-title">
        <div className="section-heading">
          <span>Research console</span>
          <h2 id="console-title">One interface for books, notes, remedies, sources, and signals.</h2>
          <p>
            Search across the knowledge layers without accounts, tracking, or automated medical
            advice.
          </p>
        </div>

        <div className="console-toolbar">
          <label className="search-field">
            <Search size={18} />
            <span className="visually-hidden">Search Herbalisti</span>
            <input
              value={globalQuery}
              onChange={(event) => setGlobalQuery(event.target.value)}
              placeholder="Search ginger, CRISPR, tincture, sleep, safety..."
            />
          </label>
          <div className="data-status">
            <Database size={18} />
            <span>{activeSearchStatus}</span>
          </div>
        </div>

        <div className="filter-stack console-filter-stack">
          <div className="segmented-control" aria-label="Archive lane filter">
            {bookRegionModes.map((mode) => (
              <button
                key={mode}
                type="button"
                className={mode === searchRegion ? 'active' : ''}
                onClick={() => {
                  setSearchRegion(mode)
                  setSearchRegionGuidance(null)
                  setLoadedSearchRequestKey('')
                }}
              >
                {mode}
              </button>
            ))}
          </div>
          {activeSearchRegionGuidance ? (
            <div className="lane-guidance" role="status">
              <Globe2 size={16} />
              <span>{activeSearchRegionGuidance.message}</span>
            </div>
          ) : null}
        </div>

        {trimmedGlobalQuery ? (
          <div className="search-results-grid">
            {visibleSearchGroups.some((group) => group.items.length > 0) ? (
              visibleSearchGroups.map((group) => (
                <section className="search-group" key={group.id} aria-label={`${group.label} search results`}>
                  <div className="search-group-heading">
                    <h3>{group.label}</h3>
                    <span>{group.total}</span>
                  </div>
                  <div className="search-group-results">
                    {group.items.length > 0 ? (
                      group.items.map((item) => <SearchResultCard key={item.id} item={item} />)
                    ) : (
                      <div className="compact-empty">No match</div>
                    )}
                  </div>
                </section>
              ))
            ) : (
              <div className="empty-state">
                <Search size={20} />
                <span>{searchEmptyText}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={20} />
            <span>Research console standing by.</span>
          </div>
        )}
      </section>
      ) : null}

      {activePage === 'home' ? (
      <section className="image-band" aria-label="Herbalisti research environment">
        <img src="/assets/herbalisti-research.png" alt="" />
        <AmbientVideo className="image-band-video" slot={mediaManifest.video.research} />
        <div className="signal-lattice image-band-lattice" aria-hidden="true"></div>
        <div className="image-band-copy">
          <span>Knowledge interface</span>
          <h2>Books, public research, and emerging longevity signals in one spatial intelligence layer.</h2>
        </div>
      </section>
      ) : null}

      {activePage === 'library' ? (
      <section className="library-section" id="library" aria-labelledby="library-title">
        <div className="section-heading">
          <span>Reference library</span>
          <h2 id="library-title">Searchable references for natural medicine and longevity research.</h2>
          <p>
            Foundational books and companion sources are structured as traceable reference
            records, ready for chapters, herbs, preparations, and contraindications as the
            library expands.
          </p>
        </div>

        <div className="data-status">
          <Database size={18} />
          <span>{libraryStatus}</span>
        </div>

        <div className="lane-coverage-strip" aria-label="Reference lane coverage">
          {referenceLaneCoverage.map((lane) => (
            <span
              key={lane.lane}
              className={`lane-coverage-chip lane-coverage-chip-${lane.status === 'active' ? 'active' : 'pending'}`}
              title={lane.message}
            >
              <span className="lane-coverage-name">{lane.label}</span>
              <span>
                {lane.status === 'active'
                  ? `${lane.referenceCount.toLocaleString('en-US')} references`
                  : 'rights review'}
              </span>
            </span>
          ))}
        </div>

        <div className="controls-row">
          <label className="search-field">
            <Search size={18} />
            <span className="visually-hidden">Search books</span>
            <input
              value={bookQuery}
              onChange={(event) => {
                setBookQuery(event.target.value)
                setBookPageCount(1)
              }}
              placeholder="Search title, author, safety, preparations..."
            />
          </label>
          <div className="filter-stack">
            <div className="segmented-control" aria-label="Book filter">
              {bookModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={mode === bookMode ? 'active' : ''}
                  onClick={() => {
                    setBookMode(mode)
                    setBookPageCount(1)
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
            <div className="segmented-control" aria-label="Reference lane filter">
              {bookRegionModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={mode === bookRegion ? 'active' : ''}
                  onClick={() => {
                    setBookRegion(mode)
                    setBookPageCount(1)
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="cards-grid">
          {books.length > 0 ? (
            visibleBooks.map((book) => <BookCard key={book.id} book={book} />)
          ) : (
            <div className="empty-state">
              <Search size={20} />
              <span>
                {bookRegion === 'Australia'
                  ? bookQuery.trim()
                    ? 'No Australian-lane references match this search yet.'
                    : 'Australia lane is prepared for rights-cleared archive works; local corpus intake is still expanding.'
                  : 'No references match this search yet.'}
              </span>
            </div>
          )}
        </div>

        {books.length > initialLibraryVisibleCount ? (
          <div className="library-window-note">
            <span>
              Showing {visibleBooks.length.toLocaleString('en-US')} of {books.length.toLocaleString('en-US')} references.
            </span>
            {visibleBooks.length < books.length ? (
              <button
                type="button"
                className="library-window-button"
                onClick={() => setBookPageCount((count) => count + 1)}
              >
                Show more
              </button>
            ) : null}
          </div>
        ) : null}
      </section>
      ) : null}

      {activePage === 'notes' ? (
      <section className="citation-section" id="citations" aria-labelledby="citations-title">
        <div className="section-heading">
          <span>Citation notes</span>
          <h2 id="citations-title">Source traces for the knowledge layer.</h2>
          <p>
            Short editorial notes connect reference books, remedy records, signal sources, and
            governance decisions back to public source links without copying copyrighted content
            or turning research into medical advice.
          </p>
        </div>

        <div className="data-status">
          <FileText size={18} />
          <span>{citationStatus}</span>
        </div>

        <div className="controls-row">
          <label className="search-field">
            <Search size={18} />
            <span className="visually-hidden">Search citation notes</span>
            <input
              value={citationQuery}
              onChange={(event) => setCitationQuery(event.target.value)}
              placeholder="Search source notes, ginger, PubMed, audit..."
            />
          </label>
          <div className="segmented-control" aria-label="Citation note filter">
            {citationTypeModes.map((mode) => (
              <button
                key={mode}
                type="button"
                className={mode === citationType ? 'active' : ''}
                onClick={() => setCitationType(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="cards-grid citation-grid">
          {notes.length > 0 ? (
            notes.map((note) => <CitationNoteCard key={note.id} note={note} />)
          ) : (
            <div className="empty-state">
              <Search size={20} />
              <span>No citation notes match this search yet.</span>
            </div>
          )}
        </div>
      </section>
      ) : null}

      {activePage === 'remedies' ? (
      <section className="remedies-section" id="remedies" aria-labelledby="remedies-title">
        <div className="section-heading">
          <span>Remedy index</span>
          <h2 id="remedies-title">Core herbs structured for source-led discovery.</h2>
          <p>
            Botanical names, plant parts, traditional-use context, preparations, safety
            considerations, interactions, related records, and source links are presented as a
            research index, not automated care.
          </p>
        </div>

        <div className="data-status">
          <Database size={18} />
          <span>{remedyStatus}</span>
        </div>

        <div className="controls-row">
          <label className="search-field">
            <Search size={18} />
            <span className="visually-hidden">Search remedies</span>
            <input
              value={remedyQuery}
              onChange={(event) => setRemedyQuery(event.target.value)}
              placeholder="Search ginger, rhizome, sleep, safety, tincture..."
            />
          </label>
          <div className="segmented-control" aria-label="Remedy preparation filter">
            {remedyPreparationModes.map((mode) => (
              <button
                key={mode}
                type="button"
                className={mode === remedyPreparation ? 'active' : ''}
                onClick={() => setRemedyPreparation(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="cards-grid remedies-grid">
          {remedies.length > 0 ? (
            remedies.map((remedy) => <RemedyCard key={remedy.id} remedy={remedy} />)
          ) : (
            <div className="empty-state">
              <Search size={20} />
              <span>No remedies match this search yet.</span>
            </div>
          )}
        </div>
      </section>
      ) : null}

      {activePage === 'map' ? (
      <section className="graph-section" id="map" aria-labelledby="map-title">
        <div className="section-heading">
          <span>Relationship map</span>
          <h2 id="map-title">Plant records as a source-led intelligence layer.</h2>
          <p>
            Explore remedies through related plants, plant parts, preparation forms,
            traditional-use context, and safety watches. The map is designed for discovery and editorial review, not
            automated recommendations.
          </p>
        </div>

        <div className="data-status">
          <Cpu size={18} />
          <span>{graphStatus}</span>
        </div>

        <div className="controls-row">
          <label className="search-field">
            <Search size={18} />
            <span className="visually-hidden">Search relationship map</span>
            <input
              value={graphQuery}
              onChange={(event) => setGraphQuery(event.target.value)}
              placeholder="Search ginger, rhizome, anticoagulant, tea..."
            />
          </label>
          <div className="segmented-control" aria-label="Relationship filter">
            {graphRelationModes.map((mode) => (
              <button
                key={mode}
                type="button"
                className={mode === graphRelation ? 'active' : ''}
                onClick={() => setGraphRelation(mode)}
              >
                {mode === 'All relations' ? mode : relationLabel(mode)}
              </button>
            ))}
          </div>
        </div>

        <div className="graph-shell">
          <div className="signal-lattice" aria-hidden="true"></div>
          <div className="graph-stat-grid" aria-label="Relationship map node summary">
            {graphStats.map((stat) => (
              <div key={stat.type} className={`graph-stat graph-node-${graphNodeTone(stat.type)}`}>
                <strong>{stat.count}</strong>
                <span>{stat.type}</span>
              </div>
            ))}
          </div>

          <div className="graph-edge-grid">
            {visibleGraphEdges.length > 0 ? (
              visibleGraphEdges.map((edge) => (
                <GraphEdgeCard key={edge.id} edge={edge} nodeById={graphNodeById} />
              ))
            ) : (
              <div className="empty-state">
                <Search size={20} />
                <span>No relationship links match this search yet.</span>
              </div>
            )}
          </div>

          {graphPayload.policy ? <p className="graph-policy">{graphPayload.policy}</p> : null}
        </div>
      </section>
      ) : null}

      {activePage === 'signals' ? (
      <section className="signals-section" id="signals" aria-labelledby="signals-title">
        <div className="section-heading signals-heading">
          <div className="signals-heading-copy">
            <span>Independent signals</span>
            <h2 id="signals-title">A self-updating feed for longevity and frontier biology.</h2>
            <p>
              The feed starts with public research APIs and independent longevity sources. It is
              allowlisted by design, so Big Pharma-owned sources stay out unless explicitly approved.
            </p>
          </div>
          <a
            className="rss-action"
            href={signalsRssHref}
            target="_blank"
            rel="noreferrer"
            aria-label="Open Herbalisti Signals RSS feed"
          >
            <Rss size={18} />
            <span>Signals RSS</span>
          </a>
        </div>

        <div className="status-pair">
          <div className="data-status">
            <RefreshCw size={18} />
            <span>{feedStatus}</span>
          </div>
          <div className="data-status data-status-secondary">
            <Activity size={18} />
            <span>{feedHeartbeat}</span>
          </div>
        </div>
        <SignalIntelligencePanel payload={signalIntelligence} status={signalIntelligenceStatus} />
        <div className="source-health-panel">
          <div className="data-status data-status-secondary">
            <Globe2 size={18} />
            <span>{sourceHealthStatus}</span>
          </div>
          <div className="source-health-strip" aria-label="Signal source health">
            {sourceHealth.map((source) => (
              <SourceHealthChip key={source.id} source={source} />
            ))}
          </div>
        </div>
        {feedWarnings.length > 0 ? (
          <div className="feed-warning" role="status">
            <AlertTriangle size={18} />
            <span>{feedWarnings.slice(0, 2).join(' ')}</span>
          </div>
        ) : null}

        <div className="controls-row">
          <label className="search-field">
            <Search size={18} />
            <span className="visually-hidden">Search newsfeed</span>
            <input
              value={feedQuery}
              onChange={(event) => setFeedQuery(event.target.value)}
              placeholder="Search CRISPR, peptides, DNA, longevity..."
            />
          </label>
          <div className="segmented-control" aria-label="Newsfeed filter">
            {feedModes.map((mode) => (
              <button
                key={mode}
                type="button"
                className={mode === feedMode ? 'active' : ''}
                onClick={() => setFeedMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        <div className="source-filter-row" aria-label="Newsfeed source filter">
          {feedSourceModes.map((source) => (
            <button
              key={source}
              type="button"
              className={source === activeFeedSource ? 'active' : ''}
              onClick={() => setFeedSource(source)}
            >
              {source}
            </button>
          ))}
        </div>

        <div className="cards-grid news-grid">
          {feedLoading ? (
            <div className="empty-state">
              <RefreshCw size={20} />
              <span>Updating signals...</span>
            </div>
          ) : newsItems.length > 0 ? (
            newsItems.map((item) => <NewsCard key={item.id} item={item} />)
          ) : (
            <div className="empty-state">
              <Search size={20} />
              <span>No signals match this filter yet.</span>
            </div>
          )}
        </div>
      </section>
      ) : null}

      {activePage === 'source-policy' ? (
      <section className="source-section" id="source-policy" aria-labelledby="source-title">
        <div className="section-heading">
          <span>Source governance</span>
          <h2 id="source-title">Public, independent, auditable by default.</h2>
          <p>
            Clear source rules, visible review notes, no hidden sponsor influence, and no
            automated advice disguised as care.
          </p>
        </div>

        <div className="data-status">
          <ShieldCheck size={18} />
          <span>{sourceStatus}</span>
        </div>

        <div className="data-export-panel" aria-label="Public data exports">
          <div>
            <Database size={22} />
            <h3>Public data exports</h3>
          </div>
          <div className="data-export-links">
            {dataExports.map((item) => (
              <a key={item.href} href={item.href} target="_blank" rel="noreferrer">
                <FileText size={15} />
                <span>{item.label}</span>
                <ExternalLink size={13} />
              </a>
            ))}
          </div>
        </div>

        <div className="source-license-panel" aria-label="Herbal database source licensing">
          <div className="source-license-intro">
            <BookOpen size={22} />
            <h3>Herbal commons</h3>
            <p>
              The herbal chat and database begin with public-domain seed texts and expand through
              rights-cleared historical corpus profiles from Project Gutenberg, Wellcome Collection,
              and the National Library of Medicine. Modern copyrighted books remain citation
              pointers only unless a license explicitly allows reuse.
            </p>
            <div className="source-license-stats" aria-label="Herbal commons scale">
              <div>
                <strong>{visibleHerbalEntries.length.toLocaleString('en-US')}</strong>
                <span>herb profiles</span>
              </div>
              <div>
                <strong>{herbalCorpusProfileCount.toLocaleString('en-US')}</strong>
                <span>corpus-derived</span>
              </div>
              <div>
                <strong>{visibleHerbalSources.length.toLocaleString('en-US')}</strong>
                <span>source works</span>
              </div>
              <div>
                <strong>{herbalLinkedPassageCount.toLocaleString('en-US')}</strong>
                <span>linked passages</span>
              </div>
            </div>
          </div>
          <div className="source-license-grid">
            {visibleHerbalSources.map((source) => (
              <a key={source.id} href={source.sourceUrl} target="_blank" rel="noreferrer">
                <span>{source.title}</span>
                <small>{source.author}</small>
                <em>{source.licenseLabel}</em>
              </a>
            ))}
          </div>
        </div>

        <div className="principles-grid">
          {sourcePrinciples.map((principle) => (
            <article className="principle-item" key={principle.title}>
              <principle.icon size={22} />
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </article>
          ))}
        </div>

        <div className="allowlist-block">
          <div>
            <Globe2 size={22} />
            <h3>Initial allowlist</h3>
          </div>
          <ul>
            {sources.map((source) => (
              <li key={source.name}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.name}
                  <ExternalLink size={14} />
                </a>
                <span>{source.role}</span>
                <div className="source-meta">
                  <span>{source.sourceType}</span>
                  <span>Feed: {source.feedName ?? source.name}</span>
                  <span>{source.isBigPharmaRelated ? 'Blocked' : 'Non-pharma allowlist'}</span>
                </div>
                {source.reviewNote || source.ownershipReview ? (
                  <p className="source-review">{source.reviewNote || source.ownershipReview}</p>
                ) : null}
                <div className="source-meta source-review-meta" aria-label={`${source.name} source review`}>
                  <span>{source.independenceStatus || 'review pending'}</span>
                  <span>Reviewed: {source.lastReviewed || 'pending'}</span>
                  <span>{source.reviewCadence?.replace(/_/g, ' ') ?? 'review cadence pending'}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
      ) : null}

      {activePage === 'governance' ? (
      <section className="governance-section" id="governance" aria-labelledby="governance-title">
        <div className="section-heading">
          <span>Research boundaries</span>
          <h2 id="governance-title">A clear boundary for self-sovereign research.</h2>
          <p>
            Herbalisti can support personal agency without drifting into automated medicine.
            Education, privacy, source traceability, and human review stay clearly separated
            from care.
          </p>
        </div>

        <div className="governance-grid">
          <article>
            <ShieldCheck size={22} />
            <h3>Educational boundary</h3>
            <p>
              Herbalisti is an educational research interface only. It does not diagnose, treat,
              prescribe, or replace professional care.
            </p>
          </article>
          <article>
            <Globe2 size={22} />
            <h3>Traceable sources</h3>
            <p>
              Public signals keep source name, URL, date, source type, and topic tags. The feed
              stays allowlist-first, with Big Pharma-owned channels excluded by default.
            </p>
          </article>
          <article>
            <Database size={22} />
            <h3>Privacy by restraint</h3>
            <p>
              No user accounts, personal health records, payment forms, or private medical
              intake are part of the public experience.
            </p>
          </article>
          <article>
            <CheckCircle2 size={22} />
            <h3>Human review</h3>
            <p>
              Generated videos, medical commentary, protocol-style recommendations, and treatment
              claims require review before publication.
            </p>
          </article>
        </div>
      </section>
      ) : null}
    </main>

      <footer className="site-footer">
        <Logo onHomeClick={handleHomeNavigation} />
        <div className="footer-nav" aria-label="Footer navigation">
          {navigationItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              onClick={(event) => handlePageNavigation(event, item.page, item.path)}
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className="footer-topics" aria-label="Tracked topics">
          {topicFilters.map((topic) => (
            <span key={topic}>{topic}</span>
          ))}
        </div>
        <div className="footer-boundary">
          <p>
            Educational research interface only. Herbalisti does not diagnose, treat, prescribe,
            or replace professional care.
          </p>
          <p>
            Herbal records are sourced from public-domain or permissively usable material. Signal
            feeds are allowlisted public sources with Big Pharma-related channels excluded by
            default.
          </p>
        </div>
      </footer>
    </>
  )
}

export default App
