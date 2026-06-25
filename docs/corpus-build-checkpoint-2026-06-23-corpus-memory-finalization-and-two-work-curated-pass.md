# Herbalisti Corpus Build Checkpoint

Date: 2026-06-23

## Objective

Finish the Corpus Memory separation cleanly inside the repo, then resume the book-corpus goal with a small curated acquisition pass from rights-cleared official sources only.

## Separation finalization

The corpus boundary is now explicit in repo state, not just implied by code:

- `Corpus Memory` remains the separate local retrieval service at `http://127.0.0.1:8766`
- the live local store remains `corpus-memory/store/corpus-memory.sqlite3`
- a new repo-local state snapshot now writes to `corpus-memory/state.json`
- `npm run corpus-memory:state` now captures the current service totals and boundary note on demand
- the old shared Agent Memory sync note was archived to `docs/archive/shared-agent-memory-sync-map.legacy-2026-06-23.json`
- `docs/archive/README.md` now marks shared-memory notes as legacy trace material rather than live corpus control files

This leaves the active corpus path as:

1. `corpus/` for raw and derived archive material
2. `corpus-memory/` for Herbalisti-only retrieval documents
3. shared working memory outside the corpus lane

## Curated acquisition pass

Rather than trust the noisy top of the raw frontier, this pass used explicit local-registry work IDs that better match the project mission.

Landed works:

1. `wellcome-a264n73x`
   - *Pharmacopoeia extemporanea: or, a body of medicines / Done into English out of Latin by the author ... with large additions.*
   - collection: `wellcome-collection`
   - topic family: `pharmacopoeia`
   - result: `930` chunks, `959` paragraphs

2. `wellcome-a7hj5sbp`
   - *A dictionary of domestic medicine and household surgery / by Spencer Thomson.*
   - collection: `wellcome-collection`
   - topic family: `domestic-medicine;household-health`
   - result: `4900` chunks, `5043` paragraphs

Both were processed through the official Wellcome routes using explicit local registry IDs, with no scraping and no API-key sources.

## Refresh work completed

After the two-work pass, the local corpus was refreshed through:

- registry reconciliation
- edition families
- acquisition frontier
- corpus evidence
- thin-work review
- term families
- seed catalog
- herb profiles
- seed-review priority
- public data export
- Corpus Memory re-ingest
- Corpus Memory state snapshot rewrite

## Current archive totals

- registered works: `2720`
- chunked works: `1321`
- discovered works: `1391`
- failed works: `8`
- chunk records: `1737223`
- paragraph records: `1959198`

By collection:

- NLM Digital Collections: `437` chunked
- Wellcome Collection: `857` chunked
- Project Gutenberg: `27` chunked

## Current Corpus Memory totals

From `corpus-memory/state.json` after the post-ingest refresh:

- total retrieval documents: `3311`
- `edition-family`: `1866`
- `work-summary`: `1321`
- `herb-profile`: `124`

## Important note on the frontier

The raw frontier still over-promotes noisy uncovered items at the top, including sensational domestic-medicine titles, lecture material, and other low-fit shapes.

That means the safest next move is still manual or profile-led curation before acquisition, not blind frontier batching.

## Best next candidates to screen next

The locally registered discovered lane now suggests a better hand-picked follow-up than the raw frontier top ranks:

1. `wellcome-d6g6adwj`
   - *The American dispensatory...*
   - promising practical pharmacy and materia-medica bridge

2. `wellcome-b4mvj3hp`
   - *The Indian doctor's dispensatory, or Every man his own physician*
   - promising practical dispensatory witness with only light same-family depth

3. `nlm-0061627`
   - *New guide to health, or, Botanic family physician*
   - strong mission fit for plant-based domestic medicine, but should be taken in an isolated NLM step rather than mixed into a broader noisy batch

## Verification

Passed in this pass:

- `npm run corpus-memory:stats`
- `npm run corpus-memory:state`
- `node scripts/corpus/build-wellcome-corpus.mjs --work-ids=wellcome-a264n73x,wellcome-a7hj5sbp`
- `npm run export:data`
- `npm run corpus-memory:ingest`
- `node scripts/corpus/report-status.mjs`

The corpus-first goal is back in motion on the separate Corpus Memory boundary.
