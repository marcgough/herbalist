import { getBooksPayload } from './books.js'
import { getCitationNotesPayload } from './citation-notes.js'
import { buildCorpusSearchGroups } from './corpus-memory.js'
import { filterNewsItems, fetchHerbalistiNews, readNewsItemsFromD1 } from './feed.js'
import { getHerbalKnowledgePayload } from './herbal-knowledge.js'
import { getRemediesPayload } from './remedies.js'
import { getSourcesPayload } from './sources.js'

const normalizeQuery = (value) => String(value ?? '').trim().slice(0, 120)

const limitResults = (items, limit = 4) => items.slice(0, limit)

const bookResult = (book) => ({
  id: `book-${book.id}`,
  type: 'Reference',
  title: book.title,
  eyebrow: book.mode,
  summary: book.role,
  meta: [book.authors?.join(', '), book.rightsLane ? `${book.rightsLane} lane` : '', book.publisher, book.publicationDate, book.isbn13 ? `ISBN ${book.isbn13}` : '']
    .filter(Boolean)
    .join(' / '),
  href: book.externalUrl || '/library',
})

const remedyResult = (remedy) => ({
  id: `remedy-${remedy.id}`,
  type: 'Remedy',
  title: remedy.name,
  eyebrow: remedy.botanicalName,
  summary: remedy.safetySummary,
  meta: [...(remedy.plantParts ?? []).slice(0, 2), ...remedy.preparations.slice(0, 3)].join(' / '),
  href: remedy.sourceUrl || '/remedies',
})

const herbResult = (entry) => ({
  id: `herb-${entry.id}`,
  type: 'Herb',
  title: entry.name,
  eyebrow: entry.botanicalName || entry.displayLabel || entry.categories?.[0] || 'Historical corpus profile',
  summary: entry.sourceNote,
  meta: [...(entry.plantParts ?? []).slice(0, 2), ...(entry.preparations ?? []).slice(0, 3)].join(' / '),
  href: `/search?q=${encodeURIComponent(entry.name)}`,
})

const signalResult = (item) => ({
  id: `signal-${item.id}`,
  type: 'Signal',
  title: item.title,
  eyebrow: item.sourceName,
  summary: item.summary,
  meta: item.topics.slice(0, 4).join(' / '),
  href: item.url,
})

const sourceResult = (source) => ({
  id: `source-${source.id}`,
  type: 'Source',
  title: source.name,
  eyebrow: source.sourceType,
  summary: source.reviewNote || source.role || source.notes,
  meta: [source.feedName ? `Feed: ${source.feedName}` : '', source.independenceStatus].filter(Boolean).join(' / '),
  href: source.url,
})

const citationNoteResult = (note) => ({
  id: `note-${note.id}`,
  type: 'Note',
  title: note.title,
  eyebrow: note.linkedRecordLabel,
  summary: note.note,
  meta: [note.sourceType, note.sourceName, note.reviewStatus].filter(Boolean).join(' / '),
  href: note.sourceUrl || '/notes',
})

const newsResults = async (env, query) => {
  if (!query) {
    return []
  }

  if (env.HERBALISTI_DB) {
    const stored = await readNewsItemsFromD1(env.HERBALISTI_DB, 4, { query })
    if (stored.length) {
      return stored.map(signalResult)
    }
  }

  const feed = await fetchHerbalistiNews({ limit: 24 })
  return limitResults(filterNewsItems(feed.items, { query }), 4).map(signalResult)
}

export const getSearchPayload = async (env, filters = {}) => {
  const query = normalizeQuery(filters.query)
  const region = String(filters.region ?? 'All lanes').trim() || 'All lanes'

  if (!query) {
    return {
      generatedAt: new Date().toISOString(),
      source: env.HERBALISTI_DB ? 'd1-and-live-public-sources' : 'static-and-live-public-sources',
      filters: { query, region },
      total: 0,
      groups: [],
    }
  }

  const [books, herbalKnowledge, remedies, notes, sources, signals, corpusGroups] = await Promise.all([
    getBooksPayload(env, { query, region }),
    getHerbalKnowledgePayload({ query }),
    getRemediesPayload(env, { query }),
    getCitationNotesPayload(env, { query }),
    getSourcesPayload(env, { query }),
    newsResults(env, query),
    buildCorpusSearchGroups(env, query),
  ])

  const corpusHerbGroup = corpusGroups.find((group) => group.id === 'herbs' && group.total > 0)
  const otherCorpusGroups = corpusGroups.filter((group) => group.id !== 'herbs')
  const herbalGroup =
    corpusHerbGroup ??
    (herbalKnowledge.total > 0
      ? {
          id: 'herbs',
          label: 'Herbs',
          total: herbalKnowledge.total,
          items: limitResults(herbalKnowledge.records).map(herbResult),
        }
      : null)

  const groups = [
    ...(herbalGroup ? [herbalGroup] : []),
    ...otherCorpusGroups,
    {
      id: 'references',
      label: 'References',
      total: books.total,
      items: limitResults(books.books).map(bookResult),
    },
    {
      id: 'remedies',
      label: 'Remedies',
      total: remedies.total,
      items: limitResults(remedies.remedies).map(remedyResult),
    },
    {
      id: 'signals',
      label: 'Signals',
      total: signals.length,
      items: signals,
    },
    {
      id: 'notes',
      label: 'Notes',
      total: notes.total,
      items: limitResults(notes.notes).map(citationNoteResult),
    },
    {
      id: 'sources',
      label: 'Sources',
      total: sources.total,
      items: limitResults(sources.sources).map(sourceResult),
    },
  ]

  return {
    generatedAt: new Date().toISOString(),
    source:
      corpusGroups.length > 0
        ? env.HERBALISTI_DB
          ? 'corpus-memory-d1-and-live-public-sources'
          : 'corpus-memory-static-and-live-public-sources'
        : env.HERBALISTI_DB
          ? 'd1-and-live-public-sources'
          : 'static-and-live-public-sources',
    filters: { query, region },
    total: groups.reduce((sum, group) => sum + group.total, 0),
    groups,
  }
}
