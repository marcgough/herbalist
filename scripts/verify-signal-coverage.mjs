import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  feedSourceDescriptors,
  filterNewsItems,
  newsSourceNames,
  newsTopics,
  normalizeNewsItems,
  sourcePolicyText,
  textHasBlockedSource,
  topicsFor,
} from '../functions/_lib/feed.js'
import { signalIntelligenceFromItems } from '../functions/_lib/signal-intelligence.js'
import { signalsRssXmlFromItems } from '../functions/_lib/signals-rss.js'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (path) => readFileSync(resolve(root, path), 'utf8')
const readJson = (path) => JSON.parse(read(path))
const exists = (path) => existsSync(resolve(root, path))

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const expectedTopics = [
  'Longevity',
  'Peptides',
  'Gene therapy',
  'Gene editing',
  'DNA modification',
  'CRISPR',
  'Health as a service',
  'Self-sovereign wellbeing',
]

const expectedSources = ['PubMed / NCBI', 'arXiv', 'bioRxiv', 'Crossref', 'Lifespan.io', 'Fight Aging!']

for (const file of [
  'functions/_lib/feed.js',
  'functions/_lib/signal-intelligence.js',
  'functions/_lib/signals-rss.js',
  'functions/api/news.js',
  'functions/api/signals.xml.js',
  'functions/api/signal-intelligence.js',
  'public/data/news.json',
  'public/data/sources.json',
  'src/data/newsSeed.ts',
  'src/data/sourcePolicy.ts',
]) {
  assert(exists(file), `${file} is missing`)
}

assert(
  expectedTopics.every((topic) => newsTopics.includes(topic)) && newsTopics.length === expectedTopics.length,
  'Server feed topic vocabulary should match the Herbalisti frontier coverage contract',
)
assert(
  expectedSources.every((source) => newsSourceNames.includes(source)) && newsSourceNames.length === expectedSources.length,
  'Server feed source filters should match the allowlisted public source names',
)
assert(
  expectedSources.every((source) => feedSourceDescriptors.some((descriptor) => descriptor.name === source)),
  'Every filterable source should have a source-health descriptor',
)
assert(
  feedSourceDescriptors.every((descriptor) => descriptor.isAllowlisted && !descriptor.isBigPharmaRelated),
  'Feed source descriptors must stay allowlisted and non-Big-Pharma by default',
)

const sourcePolicy = read('src/data/sourcePolicy.ts')
const seedNews = read('src/data/newsSeed.ts')
const feedSource = read('functions/_lib/feed.js')
const rssSource = read('functions/_lib/signals-rss.js')
const intelligenceSource = read('functions/_lib/signal-intelligence.js')

for (const topic of expectedTopics) {
  assert(sourcePolicy.includes(`'${topic}'`), `Source policy topic filters should include ${topic}`)
  assert(seedNews.includes(`'${topic}'`), `Seed fallback should include ${topic}`)
  assert(rssSource.includes(`<category>${topic}</category>`), `Signals RSS channel categories should include ${topic}`)
}

for (const source of expectedSources) {
  assert(seedNews.includes(`sourceName: '${source}'`), `Seed fallback should include source lane ${source}`)
}

for (const term of [
  'personalized health',
  'preventive health',
  'digital health',
  'health as a service',
  'self-sovereign',
  'personal agency',
  'owned wellbeing',
]) {
  assert(feedSource.toLowerCase().includes(term), `Feed source matching should include ${term}`)
}
assert(intelligenceSource.includes('topicClusters'), 'Signal intelligence should expose topicClusters for the full topic watchlist')

const aliasChecks = [
  ['cellular senescence extends healthspan and longevity', 'Longevity'],
  ['cyclic peptide discovery and protein therapeutic design', 'Peptides'],
  ['AAV viral vector gene therapy for resilient tissue repair', 'Gene therapy'],
  ['base editing and prime editing in genome editing workflows', 'Gene editing'],
  ['epigenetic methylation and chromatin DNA modification clocks', 'DNA modification'],
  ['CRISPR Cas9 and Cas12 editing methods', 'CRISPR'],
  ['personalized health, preventive health, and digital health services', 'Health as a service'],
  ['self-sovereign health, personal agency, and owned wellbeing', 'Self-sovereign wellbeing'],
]

for (const [text, topic] of aliasChecks) {
  assert(topicsFor(text).includes(topic), `Topic matcher should recognize ${topic}`)
}

const fixtureItems = [
  {
    id: 'coverage-longevity',
    title: 'Longevity and healthspan signal from public metadata',
    sourceName: 'PubMed / NCBI',
    sourceType: 'public-research-index',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=longevity',
    publishedAt: '2026-06-20T00:00:00.000Z',
    summary: 'Public biomedical metadata for senescence and rejuvenation research.',
    topics: ['Longevity'],
  },
  {
    id: 'coverage-peptides',
    title: 'Therapeutic peptide discovery signal from open preprint metadata',
    sourceName: 'arXiv',
    sourceType: 'public-research-index',
    url: 'https://arxiv.org/search/advanced?terms-0-term=peptide',
    publishedAt: '2026-06-19T00:00:00.000Z',
    summary: 'Open preprint metadata for peptide structure, protein therapeutic design, and drug discovery.',
    topics: ['Peptides'],
  },
  {
    id: 'coverage-gene-therapy',
    title: 'Gene therapy and viral vector signal',
    sourceName: 'Crossref',
    sourceType: 'public-research-index',
    url: 'https://doi.org/10.5555/herbalisti-gene-therapy',
    publishedAt: '2026-06-18T00:00:00.000Z',
    summary: 'Public scholarly metadata for gene therapy and AAV vector research.',
    topics: ['Gene therapy'],
  },
  {
    id: 'coverage-gene-editing',
    title: 'Genome editing and prime editing signal for therapeutic cell repair',
    sourceName: 'bioRxiv',
    sourceType: 'preprint-server',
    url: 'https://www.biorxiv.org/content/10.1101/2026.06.17.000001v1',
    publishedAt: '2026-06-17T00:00:00.000Z',
    summary: 'Public preprint metadata for therapeutic base editing, prime editing, and genome editing.',
    topics: ['Gene editing'],
  },
  {
    id: 'coverage-dna-modification',
    title: 'Epigenetic DNA modification signal',
    sourceName: 'Fight Aging!',
    sourceType: 'independent-longevity',
    url: 'https://www.fightaging.org/archives/2026/06/dna-modification-signal/',
    publishedAt: '2026-06-16T00:00:00.000Z',
    summary: 'Independent longevity commentary on methylation, chromatin, and epigenetic clocks.',
    topics: ['DNA modification', 'Longevity'],
  },
  {
    id: 'coverage-crispr',
    title: 'CRISPR Cas9 signal from open metadata',
    sourceName: 'Crossref',
    sourceType: 'public-research-index',
    url: 'https://doi.org/10.5555/herbalisti-crispr',
    publishedAt: '2026-06-15T00:00:00.000Z',
    summary: 'Public scholarly metadata for CRISPR, Cas9, and gene editing.',
    topics: ['CRISPR', 'Gene editing'],
  },
  {
    id: 'coverage-health-service',
    title: 'Personalized health as a service signal',
    sourceName: 'Crossref',
    sourceType: 'public-research-index',
    url: 'https://doi.org/10.5555/herbalisti-health-service',
    publishedAt: '2026-06-14T00:00:00.000Z',
    summary: 'Public scholarly metadata for personalized health, digital health, and preventive health services.',
    topics: ['Health as a service'],
  },
  {
    id: 'coverage-sovereign-wellbeing',
    title: 'Self-sovereign wellbeing signal',
    sourceName: 'Lifespan.io',
    sourceType: 'independent-longevity',
    url: 'https://www.lifespan.io/news/self-sovereign-wellbeing-signal/',
    publishedAt: '2026-06-13T00:00:00.000Z',
    summary: 'Independent longevity coverage framed around personal agency and owned wellbeing decisions.',
    topics: ['Self-sovereign wellbeing', 'Longevity'],
  },
]

const allowedSourceSet = new Set(expectedSources)
assert(
  fixtureItems.every((item) => allowedSourceSet.has(item.sourceName)),
  'Signal coverage fixtures should use only allowlisted public source names',
)
assert(
  fixtureItems.every((item) => !textHasBlockedSource(`${item.title} ${item.summary} ${item.sourceName}`)),
  'Signal coverage fixtures should not include blocked Big Pharma source names',
)

const normalizedFixtureItems = normalizeNewsItems(fixtureItems, 24)
const representedFixtureTopics = new Set(normalizedFixtureItems.flatMap((item) => item.topics))
for (const topic of expectedTopics) {
  assert(representedFixtureTopics.has(topic), `Normalized fixture feed should retain ${topic}`)
  assert(
    filterNewsItems(normalizedFixtureItems, { topic }).every((item) => item.topics.includes(topic)),
    `Topic filter should only return ${topic} items`,
  )
}

for (const query of ['peptide', 'CRISPR', 'methylation', 'personalized health', 'self-sovereign']) {
  assert(filterNewsItems(normalizedFixtureItems, { query }).length > 0, `Feed search should find ${query}`)
}

const crowdedFeed = [
  ...Array.from({ length: 36 }, (_, index) => ({
    id: `crowded-longevity-${index}`,
    title: `Fresh longevity-only signal ${index}`,
    sourceName: 'Fight Aging!',
    sourceType: 'independent-longevity',
    url: `https://www.fightaging.org/archives/2026/06/fresh-longevity-${index}/`,
    publishedAt: `2026-06-${String(24 - (index % 4)).padStart(2, '0')}T00:00:00.000Z`,
    summary: 'Fresh independent longevity commentary.',
    topics: ['Longevity'],
  })),
  ...fixtureItems.map((item, index) => ({
    ...item,
    publishedAt: `2026-05-${String(20 - index).padStart(2, '0')}T00:00:00.000Z`,
  })),
]
const balanced = normalizeNewsItems(crowdedFeed, 12)
const balancedTopics = new Set(balanced.flatMap((item) => item.topics))
for (const topic of expectedTopics) {
  assert(balancedTopics.has(topic), `Coverage-balanced normalization should retain ${topic} when available`)
}

const intelligence = signalIntelligenceFromItems(normalizedFixtureItems, {
  generatedAt: '2026-06-21T00:00:00.000Z',
  source: 'coverage-fixture',
  filters: { topic: 'All', source: 'All sources', query: '' },
  sourceHealth: feedSourceDescriptors.map((source) => ({ id: source.id, status: 'ok' })),
})
assert(intelligence.coveragePercent === 100, 'Signal intelligence fixture should show 100 percent topic coverage')
assert(intelligence.representedTopics === expectedTopics.length, 'Signal intelligence should count every represented topic')
assert(
  intelligence.topicClusters?.length === expectedTopics.length,
  'Signal intelligence should expose one topicCluster per coverage topic',
)
assert(
  intelligence.topicClusters.every((cluster) => expectedTopics.includes(cluster.topic) && cluster.status === 'active'),
  'Signal intelligence topicClusters should mark fully represented fixture topics as active',
)

const xml = signalsRssXmlFromItems(normalizedFixtureItems, {
  generatedAt: '2026-06-21T00:00:00.000Z',
  source: 'coverage-fixture',
})
for (const topic of expectedTopics) {
  assert(xml.includes(`<category>${topic}</category>`), `RSS XML should include ${topic}`)
}
for (const source of expectedSources) {
  assert(xml.includes(`<category>${source}</category>`), `RSS XML should include source category ${source}`)
}
assert(!/pfizer|moderna|novartis|roche|merck|gsk|astrazeneca|sanofi|bayer/i.test(xml), 'RSS XML should exclude blocked source text')

const publicNews = readJson('public/data/news.json')
const publicSources = readJson('public/data/sources.json')
assert(publicNews.sourcePolicy === sourcePolicyText, 'Public news export should carry the server source policy')
assert(Array.isArray(publicNews.items) && publicNews.items.length >= 8, 'Public news export should include current signals')
assert(
  publicNews.items.every((item) => Array.isArray(item.topics) && item.topics.every((topic) => expectedTopics.includes(topic))),
  'Public news export items should use only approved topic labels',
)
assert(
  publicNews.items.every((item) => allowedSourceSet.has(item.sourceName)),
  'Public news export items should use only allowlisted feed source names',
)
assert(
  publicNews.items.every((item) => !textHasBlockedSource(`${item.title} ${item.summary} ${item.sourceName}`)),
  'Public news export should not include blocked Big Pharma source names',
)
assert(
  publicNews.items.every((item) => !Object.hasOwn(item, 'contextText')),
  'Public news export should not expose private relevance context text',
)
assert(
  publicNews.items.every(
    (item) =>
      !/cotton|crop|plant health|herbivory|arabidopsis|rice|maize|wheat|potato|longevity of innovation|thin films|sputter|mbe-grown|lammps|spica|boltzmann generators|expansion microscopy|climate-driven mortality/i.test(
        `${item.title} ${item.summary}`,
      ),
  ),
  'Public news export should exclude known off-topic research metadata drift',
)
assert(
  Array.isArray(publicNews.sourceHealth) &&
    publicNews.sourceHealth.length === feedSourceDescriptors.length &&
    publicNews.sourceHealth.every((source) => source.isAllowlisted && !source.isBigPharmaRelated),
  'Public news export should include non-Big-Pharma source-health records for every descriptor',
)
assert(
  new Set(publicNews.items.flatMap((item) => item.topics)).size >= 4,
  'Current public news export should retain a multi-topic signal mix after balancing',
)
assert(
  Array.isArray(publicSources.records) &&
    publicSources.records.every((source) => source.isAllowlisted && !source.isBigPharmaRelated),
  'Public source registry export should remain allowlisted and non-Big-Pharma',
)

console.log(
  JSON.stringify(
    {
      status: 'pass',
      coverageTopics: expectedTopics.length,
      filterableSources: expectedSources.length,
      fixtureSignals: normalizedFixtureItems.length,
      fixtureCoveragePercent: intelligence.coveragePercent,
      balancedTopics: [...balancedTopics].sort(),
      publicExportSignals: publicNews.items.length,
      publicExportTopics: [...new Set(publicNews.items.flatMap((item) => item.topics))].sort(),
      sourcePolicy: publicNews.sourcePolicy,
      safeToRun:
        'This verifier uses local fixtures and existing public data exports only. It does not fetch live sources or call paid APIs.',
    },
    null,
    2,
  ),
)
