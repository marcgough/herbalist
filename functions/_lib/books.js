import { corpusReferenceBooks } from '../_generated/reference-catalog.js'

export const fallbackBooks = [
  {
    id: 'medical-herbalism-hoffmann',
    title: 'Medical Herbalism',
    subtitle: 'The Science and Practice of Herbal Medicine',
    authors: ['David Hoffmann'],
    mode: 'Materia medica',
    role: 'Core materia medica and clinical herbalism reference for herb profiles, actions, energetics, preparations, and safety notes.',
    tags: ['herbal actions', 'materia medica', 'safety', 'preparations', 'tradition'],
    status: 'Publisher citation verified; structured extraction pending',
    notes: 'Use as a source-index record only until chapter-level notes are manually extracted and checked.',
    sourceStatus: 'citation_verified',
    publisher: 'Healing Arts Press / Inner Traditions',
    publicationDate: '2003',
    isbn13: '9780892817498',
    pages: 672,
    externalUrl: 'https://www.simonandschuster.com/books/Medical-Herbalism/David-Hoffmann/9780892817498',
    verificationSource: 'Simon & Schuster publisher catalogue',
    citationNote: 'Verified against publisher catalogue for title, author, publisher imprint, ISBN, and page count.',
    rightsLane: 'US',
    searchRegions: ['US'],
  },
  {
    id: 'herbal-medicine-makers-handbook-green',
    title: "The Herbal Medicine-Maker's Handbook",
    subtitle: 'A Home Manual',
    authors: ['James Green'],
    mode: 'Making',
    role: 'Practical preparation reference for tinctures, infusions, salves, oils, vinegars, syrups, and hands-on medicine making.',
    tags: ['preparations', 'formulation', 'home apothecary', 'practical method'],
    status: 'Publisher citation verified; preparation taxonomy ready',
    notes: 'Good candidate for extracting method-level records without copying substantial copyrighted text.',
    sourceStatus: 'citation_verified',
    publisher: 'Crossing Press',
    publicationDate: '2000-09-01',
    isbn13: '9780895949905',
    pages: 384,
    externalUrl: 'https://www.penguinrandomhouse.com/books/198323/the-herbal-medicine-makers-handbook-by-james-green/',
    verificationSource: 'Penguin Random House publisher catalogue',
    citationNote: 'Verified against publisher catalogue for title, author, imprint, publication date, ISBN, and page count.',
    rightsLane: 'US',
    searchRegions: ['US'],
  },
  {
    id: 'complete-illustrated-holistic-herbal',
    title: 'The Complete Illustrated Holistic Herbal',
    subtitle: 'A Safe and Practical Guide to Making and Using Herbal Remedies',
    authors: ['David Hoffmann'],
    mode: 'Reference',
    role: 'Illustrated holistic herbal reference in the foundational bibliography; corrected metadata remains visible for audit.',
    tags: ['holistic herbalism', 'illustrated reference', 'traditional use', 'source verification'],
    status: 'Author corrected during bibliographic verification',
    notes: 'Early bibliography data listed Jeoffrey Ainsworth and Anne McIntyre. Catalogue records identify David Hoffmann as author for this title and edition.',
    sourceStatus: 'bibliography_author_mismatch_corrected',
    publisher: 'Element Books',
    publicationDate: '1996',
    isbn13: '9781852308476',
    pages: 256,
    externalUrl: 'https://books.google.com/books/about/The_Complete_Illustrated_Holistic_Herbal.html?id=QBJMAQAAIAAJ',
    verificationSource: 'Google Books catalogue record',
    citationNote: 'Catalogue verification corrected the author inherited from the source plan.',
    rightsLane: 'UK',
    searchRegions: ['UK'],
  },
  {
    id: 'american-botanical-council',
    title: 'American Botanical Council source notes',
    authors: ['American Botanical Council'],
    mode: 'Safety',
    role: 'Non-book companion source for terminology, herb safety, quality-control references, and industry context.',
    tags: ['botanical safety', 'quality', 'source checking', 'external reference'],
    status: 'Companion source in the foundational bibliography',
    notes: 'Use for cross-checking and citations. Keep full source attribution in the public database.',
    sourceStatus: 'companion_source',
    publisher: 'American Botanical Council',
    externalUrl: 'https://www.herbalgram.org/',
    verificationSource: 'American Botanical Council website',
    citationNote: 'Companion public reference source rather than a book record.',
    rightsLane: 'US',
    searchRegions: ['US'],
  },
]

const publicArchiveStatuses = new Set(['cc-by', 'pdm', 'public_domain_mark', 'public_domain_us'])
const validRegionFilters = ['All lanes', 'US', 'UK', 'Australia']
const validRightsLanes = new Set(validRegionFilters.filter((value) => value !== 'All lanes'))
export const referenceLaneDefinitions = [
  {
    lane: 'US',
    label: 'US',
    emptyStatus: 'awaiting-rights-cleared-intake',
    activeMessage: 'US archive lane active with rights-cleared public-domain and permissively reusable source records.',
    emptyMessage: 'US lane is prepared for rights-cleared archive intake.',
  },
  {
    lane: 'UK',
    label: 'UK',
    emptyStatus: 'awaiting-rights-cleared-intake',
    activeMessage: 'UK archive lane active with rights-cleared public-domain and permissively reusable source records.',
    emptyMessage: 'UK lane is prepared for rights-cleared archive intake.',
  },
  {
    lane: 'Australia',
    label: 'Australia',
    emptyStatus: 'prepared-not-populated',
    activeMessage: 'Australia archive lane active with rights-cleared public-domain and permissively reusable source records.',
    emptyMessage:
      'Australia lane is prepared for rights-cleared archive intake; no Australian reference books are published yet.',
  },
]
const publisherRightsLanes = {
  'National Library of Medicine': 'US',
  'Project Gutenberg': 'US',
  'Wellcome Collection': 'UK',
}

const validModes = new Set(['Materia medica', 'Making', 'Safety', 'Reference'])

const mergeBookCollections = (...collections) => {
  const orderedIds = []
  const records = new Map()

  for (const collection of collections) {
    for (const record of collection ?? []) {
      if (!record?.id) {
        continue
      }

      if (!records.has(record.id)) {
        orderedIds.push(record.id)
      }

      records.set(record.id, record)
    }
  }

  return orderedIds.map((id) => records.get(id)).filter(Boolean)
}

const parseJsonList = (value) => {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const normalizeQuery = (value) => String(value ?? '').trim().slice(0, 120)

const includesQuery = (parts, query) => {
  const lowerQuery = query.toLowerCase()
  const text = parts
    .flatMap((part) => (Array.isArray(part) ? part : [part]))
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return text.includes(lowerQuery)
}

const escapeLike = (value) => value.replace(/[\\%_]/g, (match) => `\\${match}`)

export const normalizeBookMode = (value) => (validModes.has(value) ? value : 'All')
export const normalizeBookRegionFilter = (value) => (validRegionFilters.includes(value) ? value : 'All lanes')

const normalizeBookRegion = (value) => {
  const normalized = String(value ?? '').trim()
  return validRightsLanes.has(normalized) ? normalized : ''
}

const uniqueRegions = (...values) => [...new Set(values.flat().map(normalizeBookRegion).filter(Boolean))]

const inferBookSearchRegions = (record) => {
  const explicit = uniqueRegions(record.searchRegions ?? [], record.rightsLane)
  if (explicit.length) {
    return explicit
  }

  const regions = []
  const text = [
    record.title,
    record.subtitle,
    record.authors,
    record.tags,
    record.status,
    record.notes,
    record.publisher,
    record.citationNote,
  ]
    .flat()
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const publisherLane = publisherRightsLanes[record.publisher] ?? ''
  if (publisherLane) {
    regions.push(publisherLane)
  }

  if (text.includes('rights lane: us') || text.includes('us rights lane') || text.includes('united states')) {
    regions.push('US')
  }

  if (text.includes('rights lane: uk') || text.includes('uk rights lane') || text.includes('united kingdom')) {
    regions.push('UK')
  }

  if (/\baustralia|australian\b/i.test(text)) {
    regions.push('Australia')
  }

  return uniqueRegions(regions)
}

const normalizeBookRecord = (record) => {
  const searchRegions = inferBookSearchRegions(record)
  const rightsLane = normalizeBookRegion(record.rightsLane) || searchRegions[0] || undefined

  return {
    ...record,
    rightsLane,
    searchRegions,
  }
}

const normalizeBookCollection = (records) => (records ?? []).map(normalizeBookRecord)

export const referenceCatalogBooks = normalizeBookCollection(mergeBookCollections(fallbackBooks, corpusReferenceBooks))
export const publicReferenceBooks = normalizeBookCollection(
  corpusReferenceBooks.filter((record) => publicArchiveStatuses.has(record.sourceStatus)),
)

export const fromD1BookRecord = (record) => ({
  ...normalizeBookRecord({
    id: record.id,
    title: record.title,
    subtitle: record.subtitle,
    authors: parseJsonList(record.authors_json),
    mode: record.mode,
    role: record.role,
    tags: parseJsonList(record.tags_json),
    status: record.status,
    notes: record.notes,
    sourceStatus: record.source_status,
    publisher: record.publisher,
    publicationDate: record.published_date,
    isbn13: record.isbn_13,
    pages: record.pages,
    externalUrl: record.external_url,
    verificationSource: record.verification_source,
    citationNote: record.citation_note,
  }),
})

const bookMatchesRegion = (book, region) => {
  const normalizedRegion = normalizeBookRegionFilter(region)
  if (normalizedRegion === 'All lanes') {
    return true
  }

  return inferBookSearchRegions(book).includes(normalizedRegion)
}

export const filterBooks = (books, { query = '', mode = 'All', region = 'All lanes' } = {}) => {
  const normalizedQuery = normalizeQuery(query)
  const normalizedMode = normalizeBookMode(mode)
  const normalizedRegion = normalizeBookRegionFilter(region)

  return books.filter((book) => {
    const modeMatch = normalizedMode === 'All' || book.mode === normalizedMode
    const regionMatch = bookMatchesRegion(book, normalizedRegion)
    const queryMatch =
      normalizedQuery === '' ||
      includesQuery(
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
          book.verificationSource,
          book.citationNote,
        ],
        normalizedQuery,
      )

    return modeMatch && regionMatch && queryMatch
  })
}

export const isPublicArchiveBook = (book) => publicArchiveStatuses.has(String(book?.sourceStatus ?? ''))

export const buildReferenceLaneCoverage = (books = publicReferenceBooks) => {
  const normalizedBooks = normalizeBookCollection(books)

  return referenceLaneDefinitions.map((definition) => {
    const referenceCount = normalizedBooks.filter((book) => inferBookSearchRegions(book).includes(definition.lane)).length
    const active = referenceCount > 0

    return {
      lane: definition.lane,
      label: definition.label,
      status: active ? 'active' : definition.emptyStatus,
      referenceCount,
      message: active ? definition.activeMessage : definition.emptyMessage,
    }
  })
}

export const readBooksFromD1 = async (db, { query = '', mode = 'All' } = {}) => {
  const normalizedQuery = normalizeQuery(query)
  const normalizedMode = normalizeBookMode(mode)
  const clauses = []
  const bindings = []

  if (normalizedMode !== 'All') {
    clauses.push('mode = ?')
    bindings.push(normalizedMode)
  }

  if (normalizedQuery) {
    const like = `%${escapeLike(normalizedQuery)}%`
    clauses.push(
      `(title LIKE ? ESCAPE '\\' OR subtitle LIKE ? ESCAPE '\\' OR authors_json LIKE ? ESCAPE '\\' OR mode LIKE ? ESCAPE '\\' OR role LIKE ? ESCAPE '\\' OR tags_json LIKE ? ESCAPE '\\' OR status LIKE ? ESCAPE '\\' OR notes LIKE ? ESCAPE '\\' OR source_status LIKE ? ESCAPE '\\' OR publisher LIKE ? ESCAPE '\\' OR published_date LIKE ? ESCAPE '\\' OR isbn_13 LIKE ? ESCAPE '\\' OR verification_source LIKE ? ESCAPE '\\' OR citation_note LIKE ? ESCAPE '\\')`,
    )
    bindings.push(like, like, like, like, like, like, like, like, like, like, like, like, like, like)
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  const result = await db
    .prepare(
      `SELECT id, title, subtitle, authors_json, mode, role, tags_json, status, notes, source_status, publisher, published_date, isbn_13, pages, external_url, verification_source, citation_note
       FROM reference_books
       ${where}
       ORDER BY title COLLATE NOCASE`,
    )
    .bind(...bindings)
    .all()

  return (result.results ?? []).map(fromD1BookRecord)
}

export const getBooksPayload = async (env, filters = {}) => {
  const normalizedFilters = {
    query: normalizeQuery(filters.query),
    mode: normalizeBookMode(filters.mode),
    region: normalizeBookRegionFilter(filters.region),
  }
  let bookCollection = publicReferenceBooks
  let books = filterBooks(bookCollection, normalizedFilters)
  let source = publicReferenceBooks.length ? 'static-corpus-registry' : 'static-fallback'

  if (env.HERBALISTI_DB) {
    const d1Books = (await readBooksFromD1(env.HERBALISTI_DB)).filter(isPublicArchiveBook)
    bookCollection = normalizeBookCollection(mergeBookCollections(publicReferenceBooks, d1Books))
    source = publicReferenceBooks.length ? 'd1-and-corpus-registry' : 'd1'
    books = filterBooks(bookCollection, normalizedFilters)
  }

  return {
    generatedAt: new Date().toISOString(),
    source,
    filters: normalizedFilters,
    laneCoverage: buildReferenceLaneCoverage(bookCollection),
    total: books.length,
    books,
  }
}
