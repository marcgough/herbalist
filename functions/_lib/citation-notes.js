export const fallbackCitationNotes = [
  {
    id: 'medical-herbalism-catalogue',
    title: 'Medical Herbalism catalogue verification',
    sourceType: 'reference',
    linkedRecordId: 'medical-herbalism-hoffmann',
    linkedRecordLabel: 'Medical Herbalism',
    sourceName: 'Simon & Schuster publisher catalogue',
    sourceUrl: 'https://www.simonandschuster.com/books/Medical-Herbalism/David-Hoffmann/9780892817498',
    note:
      'Publisher metadata verifies the launch bibliography for title, author, imprint, ISBN, and page count. Herbalisti keeps this as a citation record until human-extracted topic notes are added.',
    tags: ['book metadata', 'bibliography', 'source verification'],
    reviewStatus: 'citation_verified',
    lastReviewed: '2026-06-16',
  },
  {
    id: 'medicine-makers-catalogue',
    title: 'Medicine-maker handbook catalogue verification',
    sourceType: 'reference',
    linkedRecordId: 'herbal-medicine-makers-handbook-green',
    linkedRecordLabel: "The Herbal Medicine-Maker's Handbook",
    sourceName: 'Penguin Random House catalogue',
    sourceUrl: 'https://www.penguinrandomhouse.com/books/198323/the-herbal-medicine-makers-handbook-by-james-green/',
    note:
      'Publisher metadata supports the preparation-method reference record. The public site uses it as a structured source pointer rather than copying method text from the book.',
    tags: ['preparations', 'book metadata', 'copyright-safe'],
    reviewStatus: 'citation_verified',
    lastReviewed: '2026-06-16',
  },
  {
    id: 'holistic-herbal-author-audit',
    title: 'Holistic herbal author correction audit',
    sourceType: 'reference',
    linkedRecordId: 'complete-illustrated-holistic-herbal',
    linkedRecordLabel: 'The Complete Illustrated Holistic Herbal',
    sourceName: 'Google Books catalogue record',
    sourceUrl: 'https://books.google.com/books/about/The_Complete_Illustrated_Holistic_Herbal.html?id=QBJMAQAAIAAJ',
    note:
      'Catalogue review corrected the inherited author mismatch and keeps the discrepancy visible as audit context.',
    tags: ['bibliography', 'audit trail', 'source correction'],
    reviewStatus: 'bibliography_mismatch_corrected',
    lastReviewed: '2026-06-16',
  },
  {
    id: 'abc-companion-source',
    title: 'American Botanical Council companion source',
    sourceType: 'reference',
    linkedRecordId: 'american-botanical-council',
    linkedRecordLabel: 'American Botanical Council source notes',
    sourceName: 'American Botanical Council',
    sourceUrl: 'https://www.herbalgram.org/',
    note:
      'Companion public botanical source for terminology, botanical safety context, quality-control references, and public attribution during editorial review.',
    tags: ['botanical safety', 'terminology', 'companion source'],
    reviewStatus: 'companion_source_indexed',
    lastReviewed: '2026-06-16',
  },
  {
    id: 'ginger-nccih-source',
    title: 'Ginger public-source remedy note',
    sourceType: 'remedy',
    linkedRecordId: 'ginger',
    linkedRecordLabel: 'Ginger',
    sourceName: 'NCCIH herb fact sheet',
    sourceUrl: 'https://www.nccih.nih.gov/health/ginger',
    note:
      'Public NCCIH source link anchors the ginger record with safety-led language, preparation context, and interaction review prompts rather than protocol advice.',
    tags: ['ginger', 'safety watch', 'public source'],
    reviewStatus: 'public_source_indexed',
    lastReviewed: '2026-06-16',
  },
  {
    id: 'st-johns-wort-safety-watch',
    title: "St. John's wort interaction note",
    sourceType: 'remedy',
    linkedRecordId: 'st-johns-wort',
    linkedRecordLabel: "St. John's wort",
    sourceName: 'NCCIH herb fact sheet',
    sourceUrl: 'https://www.nccih.nih.gov/health/st-johns-wort',
    note:
      'This record stays safety-led because the herb has prominent medication-interaction review needs. The note is a public source pointer, not a recommendation.',
    tags: ['interaction review', 'safety watch', 'editorial boundary'],
    reviewStatus: 'public_source_indexed',
    lastReviewed: '2026-06-16',
  },
  {
    id: 'green-tea-extract-watch',
    title: 'Green tea extract safety distinction',
    sourceType: 'remedy',
    linkedRecordId: 'green-tea',
    linkedRecordLabel: 'Green tea',
    sourceName: 'NCCIH herb fact sheet',
    sourceUrl: 'https://www.nccih.nih.gov/health/green-tea',
    note:
      'The source note distinguishes everyday tea context from concentrated extract safety review, keeping the public record precise and non-prescriptive.',
    tags: ['green tea', 'extract safety', 'longevity adjacent'],
    reviewStatus: 'public_source_indexed',
    lastReviewed: '2026-06-16',
  },
  {
    id: 'pubmed-public-index',
    title: 'PubMed public research index note',
    sourceType: 'signal',
    linkedRecordId: 'pubmed',
    linkedRecordLabel: 'PubMed / NCBI',
    sourceName: 'NCBI',
    sourceUrl: 'https://www.ncbi.nlm.nih.gov/',
    note:
      'PubMed is treated as public research infrastructure for discovery. Article-level claims still require human review before being turned into Herbalisti commentary.',
    tags: ['public research', 'signal feed', 'human review'],
    reviewStatus: 'public_infrastructure_allowed',
    lastReviewed: '2026-06-16',
  },
  {
    id: 'crossref-metadata-filter',
    title: 'Crossref metadata filtering note',
    sourceType: 'signal',
    linkedRecordId: 'crossref',
    linkedRecordLabel: 'Crossref',
    sourceName: 'Crossref',
    sourceUrl: 'https://www.crossref.org/membership/terms/',
    note:
      'Crossref is used as scholarly metadata infrastructure. Herbalisti applies relevance filters and blocked-source checks before items enter the public signal feed.',
    tags: ['metadata', 'signal feed', 'source filtering'],
    reviewStatus: 'public_infrastructure_allowed',
    lastReviewed: '2026-06-16',
  },
  {
    id: 'fightaging-commentary-context',
    title: 'Fight Aging commentary context',
    sourceType: 'governance',
    linkedRecordId: 'fightaging',
    linkedRecordLabel: 'Fight Aging!',
    sourceName: 'Fight Aging!',
    sourceUrl: 'https://www.fightaging.org/about/',
    note:
      'Allowed as independent longevity commentary with disclosed-conflict context. It should not be treated as a primary research index or medical authority.',
    tags: ['longevity commentary', 'conflict context', 'source governance'],
    reviewStatus: 'allowed_with_context',
    lastReviewed: '2026-06-16',
  },
]

const validSourceTypes = new Set(['reference', 'remedy', 'signal', 'governance'])

const parseJsonList = (value) => {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const normalizeQuery = (value) => String(value ?? '').trim().slice(0, 120)

export const normalizeCitationSourceType = (value) => {
  const normalized = String(value ?? 'all').trim().toLowerCase()
  return validSourceTypes.has(normalized) ? normalized : 'all'
}

const escapeLike = (value) => value.replace(/[\\%_]/g, (match) => `\\${match}`)

const includesQuery = (parts, query) => {
  const lowerQuery = query.toLowerCase()
  const text = parts
    .flatMap((part) => (Array.isArray(part) ? part : [part]))
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return text.includes(lowerQuery)
}

export const fromD1CitationNoteRecord = (record) => ({
  id: record.id,
  title: record.title,
  sourceType: record.source_type,
  linkedRecordId: record.linked_record_id,
  linkedRecordLabel: record.linked_record_label,
  sourceName: record.source_name,
  sourceUrl: record.source_url,
  note: record.note,
  tags: parseJsonList(record.tags_json),
  reviewStatus: record.review_status,
  lastReviewed: record.last_reviewed,
})

export const filterCitationNotes = (notes, { query = '', type = 'all' } = {}) => {
  const normalizedQuery = normalizeQuery(query)
  const normalizedType = normalizeCitationSourceType(type)

  return notes.filter((note) => {
    const typeMatch = normalizedType === 'all' || note.sourceType === normalizedType
    const queryMatch =
      normalizedQuery === '' ||
      includesQuery(
        [
          note.title,
          note.sourceType,
          note.linkedRecordId,
          note.linkedRecordLabel,
          note.sourceName,
          note.sourceUrl,
          note.note,
          note.tags,
          note.reviewStatus,
          note.lastReviewed,
        ],
        normalizedQuery,
      )

    return typeMatch && queryMatch
  })
}

export const readCitationNotesFromD1 = async (db, { query = '', type = 'all' } = {}) => {
  const normalizedQuery = normalizeQuery(query)
  const normalizedType = normalizeCitationSourceType(type)
  const clauses = []
  const bindings = []

  if (normalizedType !== 'all') {
    clauses.push('source_type = ?')
    bindings.push(normalizedType)
  }

  if (normalizedQuery) {
    const like = `%${escapeLike(normalizedQuery)}%`
    clauses.push(
      `(title LIKE ? ESCAPE '\\' OR source_type LIKE ? ESCAPE '\\' OR linked_record_id LIKE ? ESCAPE '\\' OR linked_record_label LIKE ? ESCAPE '\\' OR source_name LIKE ? ESCAPE '\\' OR source_url LIKE ? ESCAPE '\\' OR note LIKE ? ESCAPE '\\' OR tags_json LIKE ? ESCAPE '\\' OR review_status LIKE ? ESCAPE '\\' OR last_reviewed LIKE ? ESCAPE '\\')`,
    )
    bindings.push(like, like, like, like, like, like, like, like, like, like)
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  const result = await db
    .prepare(
      `SELECT id, title, source_type, linked_record_id, linked_record_label, source_name, source_url, note, tags_json, review_status, last_reviewed
       FROM citation_notes
       ${where}
       ORDER BY source_type, title COLLATE NOCASE`,
    )
    .bind(...bindings)
    .all()

  return (result.results ?? []).map(fromD1CitationNoteRecord)
}

export const getCitationNotesPayload = async (env, filters = {}) => {
  const normalizedFilters = {
    query: normalizeQuery(filters.query),
    type: normalizeCitationSourceType(filters.type),
  }
  let notes = filterCitationNotes(fallbackCitationNotes, normalizedFilters)
  let source = 'static-fallback'

  if (env.HERBALISTI_DB) {
    const d1Notes = await readCitationNotesFromD1(env.HERBALISTI_DB, normalizedFilters)
    source = 'd1'
    notes = d1Notes.length ? d1Notes : notes
  }

  return {
    generatedAt: new Date().toISOString(),
    source,
    filters: normalizedFilters,
    total: notes.length,
    notes,
  }
}
