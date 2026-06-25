import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fallbackSourceRegistry, filterSources } from '../functions/_lib/sources.js'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

const read = (path) => readFileSync(resolve(root, path), 'utf8')

const failures = []
const assert = (condition, message) => {
  if (!condition) {
    failures.push(message)
  }
}

const expectedSourceIds = ['pubmed', 'arxiv', 'biorxiv', 'crossref', 'lifespan', 'fightaging']
const requiredFields = [
  'id',
  'name',
  'feedName',
  'url',
  'sourceType',
  'role',
  'notes',
  'isAllowlisted',
  'isBigPharmaRelated',
  'independenceStatus',
  'ownershipReview',
  'reviewEvidenceUrl',
  'reviewCadence',
  'lastReviewed',
  'reviewNote',
]
const blockedPattern =
  /abbvie|amgen|astrazeneca|bayer|biogen|boehringer|bristol myers|eli lilly|gilead|glaxosmithkline|gsk|johnson & johnson|merck|moderna|novartis|novo nordisk|pfizer|roche|sanofi/i
const reviewDatePattern = /^\d{4}-\d{2}-\d{2}$/

const sourceIds = fallbackSourceRegistry.map((source) => source.id).sort()
assert(
  JSON.stringify(sourceIds) === JSON.stringify([...expectedSourceIds].sort()),
  'Fallback source registry should contain exactly the approved launch source IDs',
)

for (const source of fallbackSourceRegistry) {
  for (const field of requiredFields) {
    assert(Object.hasOwn(source, field), `${source.id} is missing ${field}`)
  }

  assert(source.isAllowlisted === true, `${source.id} should be allowlisted`)
  assert(source.isBigPharmaRelated === false, `${source.id} should not be marked Big Pharma related`)
  assert(source.reviewEvidenceUrl.startsWith('https://'), `${source.id} review evidence should be HTTPS`)
  assert(reviewDatePattern.test(source.lastReviewed), `${source.id} lastReviewed should be an ISO date`)
  assert(
    source.reviewCadence === 'quarterly_or_before_source_expansion',
    `${source.id} should use the standard review cadence`,
  )
  assert(!blockedPattern.test(`${source.name} ${source.url} ${source.notes}`), `${source.id} includes blocked pharma text`)
  assert(
    source.ownershipReview.toLowerCase().includes('no big pharma ownership signal') ||
      source.independenceStatus.includes('disclosed-conflict'),
    `${source.id} ownership review should state the Big Pharma review result or disclosed-conflict exception`,
  )
}

const filteredSources = filterSources(fallbackSourceRegistry)
assert(filteredSources.length === fallbackSourceRegistry.length, 'All launch sources should survive source filtering')
assert(
  filterSources(fallbackSourceRegistry, { query: 'disclosed conflict' }).some((source) => source.id === 'fightaging'),
  'Source search should include review metadata for disclosed conflicts',
)
assert(
  filterSources(fallbackSourceRegistry, { query: 'not-for-profit' }).some((source) => source.id === 'crossref'),
  'Source search should include review metadata for not-for-profit infrastructure',
)

const tsSource = read('src/data/sourcePolicy.ts')
const app = read('src/App.tsx')
const docs = read('docs/source-verification.md')
const migration = read('migrations/0007_source_independence_review.sql')
const governance = JSON.parse(read('public/data/governance.json'))

for (const token of [
  'independenceStatus',
  'ownershipReview',
  'reviewEvidenceUrl',
  'reviewCadence',
  'lastReviewed',
  'reviewNote',
]) {
  assert(tsSource.includes(token), `src/data/sourcePolicy.ts is missing ${token}`)
  assert(app.includes(token), `src/App.tsx is missing ${token}`)
}

for (const token of [
  'independence_status',
  'ownership_review',
  'review_evidence_url',
  'review_cadence',
  'last_reviewed',
  'review_note',
]) {
  assert(migration.includes(token), `source review migration is missing ${token}`)
}

assert(app.includes('source-review'), 'Source Governance UI should render review notes')
assert(docs.includes('Source Independence Review'), 'Source verification notes should include source independence review')
assert(
  governance.sourcePolicy?.reviewCadence === 'quarterly_or_before_source_expansion',
  'Governance policy should record the source review cadence',
)
assert(
  governance.sourcePolicy?.conflictHandling?.includes('commentary'),
  'Governance policy should record the disclosed-conflict handling rule',
)

if (failures.length > 0) {
  console.error(
    JSON.stringify(
      {
        status: 'fail',
        failures,
      },
      null,
      2,
    ),
  )
  process.exit(1)
}

console.log(
  JSON.stringify(
    {
      status: 'pass',
      sourceCount: fallbackSourceRegistry.length,
      sourceIds,
      reviewCadence: 'quarterly_or_before_source_expansion',
      disclosedConflictSources: fallbackSourceRegistry
        .filter((source) => source.independenceStatus.includes('disclosed-conflict'))
        .map((source) => source.id),
      policy: 'allowlist-first with explicit independence review metadata',
    },
    null,
    2,
  ),
)
