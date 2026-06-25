import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { signalIntelligenceFromItems } from '../functions/_lib/signal-intelligence.js'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const exists = (path) => existsSync(resolve(root, path))

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

for (const file of [
  'functions/_lib/signal-intelligence.js',
  'functions/api/signal-intelligence.js',
  'scripts/verify-signal-intelligence.mjs',
]) {
  assert(exists(file), `${file} is missing`)
}

const packageJson = JSON.parse(read('package.json'))
const app = read('src/App.tsx')
const css = read('src/App.css')
const healthApi = read('functions/api/health.js')
const runbook = read('docs/deployment-runbook.md')

assert(packageJson.scripts?.['verify:signal-intelligence'], 'package.json should expose verify:signal-intelligence')
assert(app.includes('/api/signal-intelligence'), 'Frontend should request /api/signal-intelligence')
assert(app.includes('Signal intelligence'), 'Frontend should render the Signal intelligence panel')
assert(css.includes('signal-intelligence-panel'), 'CSS should style the signal intelligence panel')
assert(healthApi.includes('signalIntelligenceApi: true'), 'Health API should expose signalIntelligenceApi')
assert(runbook.includes('/api/signal-intelligence'), 'Runbook should document the signal intelligence endpoint')

const fixtureItems = [
  {
    id: 'signal-1',
    title: 'CRISPR longevity metadata',
    sourceName: 'Crossref',
    sourceType: 'public-research-index',
    url: 'https://example.org/1',
    publishedAt: '2026-06-15T00:00:00.000Z',
    summary: 'Public metadata.',
    topics: ['CRISPR', 'Gene editing', 'Longevity'],
  },
  {
    id: 'signal-2',
    title: 'Peptide healthspan metadata',
    sourceName: 'PubMed / NCBI',
    sourceType: 'public-research-index',
    url: 'https://example.org/2',
    publishedAt: '2026-06-14T00:00:00.000Z',
    summary: 'Public metadata.',
    topics: ['Peptides', 'Longevity'],
  },
  {
    id: 'signal-3',
    title: 'Health as a service metadata',
    sourceName: 'Lifespan.io',
    sourceType: 'independent-longevity',
    url: 'https://example.org/3',
    publishedAt: '2026-06-10T00:00:00.000Z',
    summary: 'Independent metadata.',
    topics: ['Health as a service', 'Self-sovereign wellbeing'],
  },
]

const intelligence = signalIntelligenceFromItems(fixtureItems, {
  generatedAt: '2026-06-16T00:00:00.000Z',
  source: 'fixture',
  filters: { topic: 'All', source: 'All sources', query: '' },
  sourceHealth: [
    { id: 'crossref', status: 'ok' },
    { id: 'pubmed', status: 'ok' },
    { id: 'lifespan', status: 'warning' },
  ],
})

assert(intelligence.totalSignals === 3, 'Signal intelligence should count total signals')
assert(intelligence.representedTopics === 6, 'Signal intelligence should count represented topics')
assert(intelligence.representedSources === 3, 'Signal intelligence should count represented sources')
assert(intelligence.coveragePercent === 75, 'Signal intelligence should calculate topic coverage percent')
assert(intelligence.recentSignals === 3, 'Signal intelligence should count recent signals')
assert(intelligence.newestSignalAt === '2026-06-15T00:00:00.000Z', 'Signal intelligence should expose newest signal time')
assert(intelligence.leadingTopic?.topic === 'Longevity', 'Leading topic should be the highest count topic')
assert(intelligence.topTopics.length >= 4, 'Signal intelligence should expose top topic rows')
assert(intelligence.sourceMix.length === 3, 'Signal intelligence should expose source mix rows')
assert(intelligence.sourceHealth.warningCount === 1, 'Signal intelligence should carry source health warning count')
assert(
  intelligence.policy.includes('not medical guidance'),
  'Signal intelligence policy should preserve the non-medical guidance boundary',
)

console.log(
  JSON.stringify(
    {
      status: 'pass',
      totalSignals: intelligence.totalSignals,
      representedTopics: intelligence.representedTopics,
      representedSources: intelligence.representedSources,
      coveragePercent: intelligence.coveragePercent,
      leadingTopic: intelligence.leadingTopic.topic,
      sourceHealthWarnings: intelligence.sourceHealth.warningCount,
    },
    null,
    2,
  ),
)
