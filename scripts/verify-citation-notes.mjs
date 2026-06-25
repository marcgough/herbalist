import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fallbackCitationNotes, filterCitationNotes } from '../functions/_lib/citation-notes.js'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const exists = (path) => existsSync(resolve(root, path))

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

for (const file of [
  'src/data/citationNotes.ts',
  'functions/_lib/citation-notes.js',
  'functions/api/citation-notes.js',
  'migrations/0008_seed_citation_notes.sql',
]) {
  assert(exists(file), `${file} is missing`)
}

const packageJson = JSON.parse(read('package.json'))
const app = read('src/App.tsx')
const searchLib = read('functions/_lib/search.js')
const healthApi = read('functions/api/health.js')
const migration = read('migrations/0008_seed_citation_notes.sql')
const docs = read('docs/source-verification.md')

assert(packageJson.scripts?.['verify:citation-notes'], 'package.json should expose verify:citation-notes')
assert(fallbackCitationNotes.length >= 10, 'Citation notes should include at least 10 launch records')

const expectedTypes = new Set(['reference', 'remedy', 'signal', 'governance'])
const actualTypes = new Set(fallbackCitationNotes.map((note) => note.sourceType))
for (const type of expectedTypes) {
  assert(actualTypes.has(type), `Citation notes should include ${type} notes`)
}

const forbiddenAdvicePattern = /\b(cures?|treats?|diagnoses?|prescribes?|take\s+\d+|\d+\s*(mg|ml|mcg))\b/i

for (const note of fallbackCitationNotes) {
  assert(note.id && note.title && note.linkedRecordId, `Citation note ${note.id} is missing identity fields`)
  assert(note.sourceUrl.startsWith('https://'), `${note.id} should use an HTTPS source URL`)
  assert(Array.isArray(note.tags) && note.tags.length >= 2, `${note.id} should include tags`)
  assert(note.note.length >= 80 && note.note.length <= 260, `${note.id} note length should stay concise`)
  assert(!forbiddenAdvicePattern.test(note.note), `${note.id} should not contain treatment or dosage language`)
  assert(note.lastReviewed === '2026-06-16', `${note.id} should have the launch review date`)
}

assert(filterCitationNotes(fallbackCitationNotes, { query: 'ginger' }).some((note) => note.id === 'ginger-nccih-source'), 'Ginger query should find the ginger citation note')
assert(filterCitationNotes(fallbackCitationNotes, { type: 'remedy' }).every((note) => note.sourceType === 'remedy'), 'Remedy type filter should only return remedy notes')
assert(filterCitationNotes(fallbackCitationNotes, { type: 'Reference' }).every((note) => note.sourceType === 'reference'), 'Type normalization should accept display labels')
assert(filterCitationNotes(fallbackCitationNotes, { query: 'unlikely-herbalisti-no-match-24680' }).length === 0, 'No-match query should return zero citation notes')

assert(app.includes('/api/citation-notes'), 'Frontend should request /api/citation-notes')
assert(app.includes('Citation notes'), 'Frontend should render the Citation notes section')
assert(app.includes('id="citations"'), 'Frontend should expose the citations anchor')
assert(searchLib.includes("id: 'notes'"), 'Unified search should expose a notes group')
assert(healthApi.includes('citationNotesApi: true'), 'Health API should expose citationNotesApi')
assert(migration.includes('CREATE TABLE IF NOT EXISTS citation_notes'), 'D1 migration should create citation_notes')
assert(migration.includes('idx_citation_notes_source_type'), 'D1 migration should index source_type')
assert(docs.includes('/api/citation-notes'), 'Source verification docs should document citation notes')

console.log(
  JSON.stringify(
    {
      status: 'pass',
      notes: fallbackCitationNotes.length,
      sourceTypes: [...actualTypes].sort(),
      sourceUrls: fallbackCitationNotes.length,
      filters: {
        ginger: filterCitationNotes(fallbackCitationNotes, { query: 'ginger' }).length,
        remedy: filterCitationNotes(fallbackCitationNotes, { type: 'remedy' }).length,
      },
    },
    null,
    2,
  ),
)
