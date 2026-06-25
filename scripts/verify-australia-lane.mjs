import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const readJson = (path) => JSON.parse(read(path))
const exists = (path) => existsSync(resolve(root, path))
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const candidateSourcesPath = 'corpus/derived/australia-lane/candidate-sources.json'
const candidateSourcesCsvPath = 'corpus/derived/australia-lane/candidate-sources.csv'
const searchThemesPath = 'corpus/derived/australia-lane/search-themes.json'
const readmePath = 'corpus/derived/australia-lane/README.md'
const summaryPath = 'corpus/exports/australia-lane-summary.json'

for (const path of [candidateSourcesPath, candidateSourcesCsvPath, searchThemesPath, readmePath, summaryPath]) {
  assert(exists(path), `${path} is missing; run npm run corpus:australia-lane`)
}

const packageJson = readJson('package.json')
const candidateSources = readJson(candidateSourcesPath)
const searchThemes = readJson(searchThemesPath)
const summary = readJson(summaryPath)
const referenceBooks = readJson('public/data/reference-books.json')
const appSource = read('src/App.tsx')
const readme = read(readmePath)

assert(packageJson.scripts?.['corpus:australia-lane'], 'package.json should include corpus:australia-lane')
assert(packageJson.scripts?.['verify:australia-lane'], 'package.json should include verify:australia-lane')
assert(summary.status === 'prepared-not-populated', 'Australia lane should remain prepared-not-populated')
assert(summary.safeToRun?.includes('no external API calls'), 'summary should state that the builder has no external calls')
assert(summary.corpusReadyCandidateCount === 0, 'No Australia candidate should be corpus-ready yet')
assert(Array.isArray(candidateSources) && candidateSources.length >= 5, 'Australia lane should track source leads')
assert(Array.isArray(searchThemes) && searchThemes.length >= 8, 'Australia lane should track search themes')

const trove = candidateSources.find((source) => source.id === 'trove-nla')
assert(trove, 'Trove / NLA should be tracked as an Australia-lane discovery source')
assert(trove.requiresApiKey === true, 'Trove should be marked as requiring an API key')
assert(trove.termsUrl?.includes('trove-api-terms-use'), 'Trove source should link to API terms')
assert(trove.status === 'metadata-review-only', 'Trove should be metadata-review-only')
assert(
  /metadata/i.test(trove.rightsBoundary) && /Digital objects and full text/i.test(trove.rightsBoundary),
  'Trove rights boundary should separate metadata from digital objects and full text',
)

assert(
  candidateSources.every((source) => source.jurisdictionLane === 'Australia'),
  'Every source should be in the Australia lane',
)
assert(
  candidateSources.every((source) => source.corpusReadiness !== 'corpus-ready'),
  'No source should be marked corpus-ready without item-level review',
)
assert(
  candidateSources.every((source) => Array.isArray(source.excludedWorkTypes) && source.excludedWorkTypes.length > 0),
  'Every source should carry exclusions',
)
assert(
  searchThemes.every((theme) => theme.jurisdictionLane === 'Australia' && theme.noIngestWithout),
  'Every search theme should keep the Australia lane and no-ingest guard',
)
assert(
  searchThemes.some((theme) => theme.id === 'bush-medicine-book' && theme.priority === 'restricted'),
  'Culturally sensitive bush-medicine discovery should remain restricted',
)
assert(readme.includes('prepared, not populated'), 'README should state the lane is prepared, not populated')
assert(readme.includes('Trove API access requires an API key'), 'README should capture the Trove API-key boundary')
assert(readme.includes('First Australian and Indigenous knowledge'), 'README should include cultural-safety boundary')
assert(appSource.includes('All lanes') && appSource.includes('Australia'), 'UI should expose the Australia lane')

const australiaReferenceCount = (referenceBooks.records ?? []).filter((record) =>
  record.searchRegions?.includes('Australia'),
).length
assert(
  summary.currentAustraliaReferenceCount === australiaReferenceCount,
  'summary currentAustraliaReferenceCount should match public reference export',
)

console.log(
  JSON.stringify(
    {
      status: 'pass',
      summaryPath,
      candidateSourceCount: candidateSources.length,
      searchThemeCount: searchThemes.length,
      currentAustraliaReferenceCount: australiaReferenceCount,
      safeToRun: 'This verifier reads local files only. It does not call external APIs or expose secrets.',
    },
    null,
    2,
  ),
)
