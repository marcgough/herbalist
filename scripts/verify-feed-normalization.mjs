import {
  canonicalTitleKey,
  canonicalUrlKey,
  dedupeNewsItems,
  normalizeNewsItems,
  sourceHashForNewsItem,
} from '../functions/_lib/feed.js'

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const item = (overrides) => ({
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

const normalized = normalizeNewsItems(
  [
    ...duplicateRows,
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
)

assert(normalized.length === 2, `Expected normalized feed to keep 2 valid unique items, got ${normalized.length}`)
assert(
  normalized.every((newsItem) => !['blocked', 'future', 'untagged', 'pubmed-old', 'rss-same-title'].includes(newsItem.id)),
  'Normalized feed should remove blocked, future, untagged, and duplicate items',
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
    },
    null,
    2,
  ),
)
