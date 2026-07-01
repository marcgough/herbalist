import {
  canonicalTitleKey,
  canonicalUrlKey,
  dedupeNewsItems,
  hasHealthSignalContext,
  hasOffTopicResearchContext,
  isHealthRelevantNewsItem,
  normalizeNewsItems,
  sourceHashForNewsItem,
} from '../functions/_lib/feed.js'

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const item = (overrides) => ({
  ...overrides,
  id: overrides.id,
  title: overrides.title,
  sourceName: overrides.sourceName ?? 'Crossref',
  sourceType: overrides.sourceType ?? 'public-research-index',
  url: overrides.url,
  publishedAt: overrides.publishedAt ?? '2026-06-10T00:00:00.000Z',
  summary: overrides.summary ?? 'Public metadata for longevity, peptide, and CRISPR research.',
  topics: overrides.topics ?? ['Longevity', 'Peptides', 'CRISPR'],
})

assert(
  canonicalUrlKey('https://www.Example.org/research/item/?utm_source=newsletter&b=2&a=1#section') ===
    'example.org/research/item?a=1&b=2',
  'Canonical URL should remove tracking params, sort params, strip hash, and normalize host',
)

assert(
  canonicalTitleKey('CRISPR & Peptide Signals: A Longevity Update') ===
    'crispr and peptide signals a longevity update',
  'Canonical title should normalize punctuation and ampersands',
)

const duplicateRows = [
  item({
    id: 'crossref-new',
    title: 'CRISPR peptide repair signals for longevity medicine',
    sourceName: 'Crossref',
    url: 'https://doi.org/10.5555/Herbalisti.Dupe?utm_campaign=launch#abstract',
    publishedAt: '2026-06-11T00:00:00.000Z',
  }),
  item({
    id: 'pubmed-old',
    title: 'CRISPR peptide repair signals for longevity medicine',
    sourceName: 'PubMed / NCBI',
    url: 'https://doi.org/10.5555/herbalisti.dupe',
    publishedAt: '2026-06-10T00:00:00.000Z',
  }),
  item({
    id: 'rss-same-title',
    title: 'CRISPR peptide repair signals for longevity medicine',
    sourceName: 'Fight Aging!',
    sourceType: 'independent-longevity',
    url: 'https://www.fightaging.org/archives/2026/06/duplicate-title/',
    publishedAt: '2026-06-09T00:00:00.000Z',
  }),
  item({
    id: 'unique',
    title: 'Health as a service platforms for self-sovereign wellbeing',
    sourceName: 'Lifespan.io',
    sourceType: 'independent-longevity',
    url: 'https://www.lifespan.io/news/health-as-a-service/',
    topics: ['Health as a service', 'Self-sovereign wellbeing'],
  }),
]

const deduped = dedupeNewsItems(duplicateRows)
assert(deduped.length === 2, `Expected duplicate feed rows to collapse to 2 items, got ${deduped.length}`)
assert(deduped[0].id === 'crossref-new', 'Dedupe should keep the newest duplicate after date sorting')
assert(
  sourceHashForNewsItem(duplicateRows[0]) === sourceHashForNewsItem(duplicateRows[1]),
  'Canonical source hash should match DOI duplicates with tracking differences',
)

const therapeuticSignal = item({
  id: 'therapeutic-signal',
  title: 'Therapeutic applications of CRISPR-Cas9 gene editing',
  sourceName: 'Crossref',
  url: 'https://doi.org/10.5555/herbalisti-therapeutic-signal',
  summary: 'Public Crossref metadata from Frontiers in Genome Editing.',
  topics: ['Gene editing', 'CRISPR'],
  contextText: 'Therapeutic applications of CRISPR-Cas9 gene editing for patient medicine.',
})
const agricultureSignal = item({
  id: 'agriculture-signal',
  title: 'CRISPR-Cas9 genome editing of cotton genes for herbivory resistance',
  sourceName: 'Crossref',
  url: 'https://doi.org/10.5555/herbalisti-agriculture-signal',
  summary: 'Public Crossref metadata from Plant Health Exchange.',
  topics: ['Gene editing', 'CRISPR'],
  contextText: 'Cotton crop herbivory resistance and agricultural plant health exchange metadata.',
})
const genericCrisprSignal = item({
  id: 'generic-crispr-signal',
  title: 'CRISPR method optimization in model organisms',
  sourceName: 'bioRxiv',
  sourceType: 'preprint-server',
  url: 'https://www.biorxiv.org/content/10.1101/herbalisti-generic-crisprv1',
  summary: 'Public preprint metadata in biology.',
  topics: ['CRISPR'],
  contextText: 'Basic method optimization in model organisms only.',
})
const metaphoricalLongevitySignal = item({
  id: 'metaphorical-longevity-signal',
  title: 'The Longevity of Innovation',
  sourceName: 'arXiv',
  sourceType: 'public-research-index',
  url: 'https://arxiv.org/abs/2606.29777v1',
  summary: 'Open preprint metadata matching Herbalisti frontier-biology topics.',
  topics: ['Longevity'],
  contextText: 'The longevity of innovation in technology markets and institutions.',
})
const materialsPeptideSignal = item({
  id: 'materials-peptide-signal',
  title: 'MBE-grown thin films for CISS effect studies',
  sourceName: 'arXiv',
  sourceType: 'public-research-index',
  url: 'https://arxiv.org/abs/2606.28508v1',
  summary: 'Open preprint metadata matching peptide-adjacent physics topics.',
  topics: ['Peptides'],
  contextText: 'Microscopic characterization of sputter-deposited thin films for CISS and MIPAC studies.',
})

assert(hasHealthSignalContext(therapeuticSignal.contextText), 'Therapeutic signal should have health context')
assert(hasOffTopicResearchContext(agricultureSignal.contextText), 'Agriculture signal should have off-topic context')
assert(isHealthRelevantNewsItem(therapeuticSignal), 'Therapeutic CRISPR metadata should be health relevant')
assert(!isHealthRelevantNewsItem(agricultureSignal), 'Agricultural CRISPR metadata should not be health relevant')
assert(!isHealthRelevantNewsItem(genericCrisprSignal), 'Generic CRISPR metadata should need a health or longevity context')
assert(
  !isHealthRelevantNewsItem(metaphoricalLongevitySignal),
  'Metaphorical longevity metadata should not be health relevant',
)
assert(!isHealthRelevantNewsItem(materialsPeptideSignal), 'Materials-science peptide metadata should not be health relevant')

const normalized = normalizeNewsItems(
  [
    ...duplicateRows,
    therapeuticSignal,
    agricultureSignal,
    genericCrisprSignal,
    metaphoricalLongevitySignal,
    materialsPeptideSignal,
    item({
      id: 'blocked',
      title: 'Pfizer peptide announcement for longevity medicine',
      sourceName: 'Blocked source',
      url: 'https://example.org/blocked',
    }),
    item({
      id: 'future',
      title: 'Future CRISPR longevity paper',
      url: 'https://example.org/future',
      publishedAt: '2999-01-01T00:00:00.000Z',
    }),
    item({
      id: 'untagged',
      title: 'Useful but untagged signal',
      url: 'https://example.org/untagged',
      topics: [],
    }),
  ],
  10,
  { includeWatchFallback: false },
)

assert(normalized.length === 3, `Expected normalized feed to keep 3 valid unique items, got ${normalized.length}`)
assert(
  normalized.every(
    (newsItem) =>
      ![
        'agriculture-signal',
        'blocked',
        'future',
        'generic-crispr-signal',
        'materials-peptide-signal',
        'metaphorical-longevity-signal',
        'untagged',
        'pubmed-old',
        'rss-same-title',
      ].includes(newsItem.id),
  ),
  'Normalized feed should remove off-topic, blocked, future, untagged, and duplicate items',
)
assert(
  normalized.every((newsItem) => !('contextText' in newsItem)),
  'Normalized public feed items should not expose private relevance context text',
)

const limited = normalizeNewsItems(
  [
    ...duplicateRows,
    item({
      id: 'third',
      title: 'Gene therapy frontier methods for longevity research',
      url: 'https://example.org/gene-therapy-frontier',
      topics: ['Gene therapy', 'Longevity'],
    }),
  ],
  2,
  { includeWatchFallback: false },
)

assert(limited.length === 2, 'Limit should be applied after invalid and duplicate rows are removed')
assert(
  new Set(limited.map((newsItem) => newsItem.id)).size === limited.length,
  'Limited normalized feed should not include duplicate IDs',
)

console.log(
  JSON.stringify(
    {
      status: 'pass',
      canonicalUrl: canonicalUrlKey('https://www.Example.org/research/item/?utm_source=newsletter&b=2&a=1#section'),
      duplicateInput: duplicateRows.length,
      duplicateOutput: deduped.length,
      normalizedOutput: normalized.length,
      limitedOutput: limited.length,
      healthRelevantKept: normalized.some((newsItem) => newsItem.id === 'therapeutic-signal'),
    },
    null,
    2,
  ),
)
