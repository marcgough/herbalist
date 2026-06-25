# Herbalisti Corpus Build Checkpoint

Date: 2026-06-23

## Objective

Strengthen the separated Corpus Memory operations path and continue the rights-cleared Herbalisti archive with another small practical-reference acquisition pass.

## What changed

### 1. Corpus Memory refresh is now a single command

The separated retrieval store now has a clean sync command:

- `npm run corpus-memory:refresh`

That command now runs the Corpus Memory ingest and then rewrites the local `corpus-memory/state.json` snapshot in sequence, which removes the easy failure mode where the state file could be written before a just-finished ingest had actually updated the retrieval totals.

Files updated for that:

- `package.json`
- `scripts/corpus-memory/refresh.mjs`
- `corpus-memory/README.md`
- `docs/corpus-memory-separation-architecture-2026-06-18.md`

### 2. Three more practical-reference works were acquired

This pass deliberately favored practical family-health and dispensatory witnesses over the noisy raw frontier top ranks.

Landed works:

1. `wellcome-fd873e2h`
   - *New guide to health, or Botanic family physician*
   - `468` chunks
   - `484` paragraphs
   - topic family: `domestic-medicine`

2. `wellcome-d6g6adwj`
   - *The American dispensatory*
   - `2380` chunks
   - `2440` paragraphs
   - topic family: `materia-medica`

3. `wellcome-b4mvj3hp`
   - *The Indian doctor's dispensatory, or Every man his own physician*
   - `289` chunks
   - `302` paragraphs
   - topic family: `materia-medica`

All 3 were processed from the local Wellcome registry using explicit official work IDs only.

### 3. The derived layers and public export were refreshed

After the acquisition pass, the following were rerun successfully:

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
- Corpus Memory refresh

## Current state

### Archive totals

- total works: `2720`
- chunked works: `1324`
- discovered works: `1388`
- failed works: `8`

### By collection

- NLM Digital Collections: `437` chunked of `696`
- Wellcome Collection: `860` chunked of `1997`
- Project Gutenberg: `27` chunked of `27`

### Public export totals

From `public/data/reference-books.json` and `verify:data-exports`:

- reference-book records: `1324`
- remedies: `21`
- herbal-knowledge records: `124`
- citation notes: `10`
- sources: `6`

### Corpus Memory totals

From `corpus-memory/state.json` and `npm run corpus-memory:stats`:

- total retrieval documents: `3314`
- `edition-family`: `1866`
- `work-summary`: `1324`
- `herb-profile`: `124`

## Retrieval verification

Exact work-id retrieval passed in the separate store for:

- `wellcome-fd873e2h`
- `wellcome-d6g6adwj`
- `wellcome-b4mvj3hp`

That confirms the three new works are not only on disk but also searchable through the separated Corpus Memory layer.

## What this means

The corpus-first path is moving in a better direction again:

- the separated retrieval layer is easier to keep honest
- the public reference export is larger and still valid
- the newest books deepen both the botanic-family-physician lane and the dispensatory lane

## Best next move

The next intake should still be hand-picked rather than blind frontier batching.

Current strongest follow-up candidates:

1. `nlm-0061627`
   - *New guide to health, or, Botanic family physician*
   - strong mission fit
   - best handled as an isolated NLM pass

2. `wellcome-aw2c3dda`
   - *The family physician : a manual of domestic medicine*
   - reasonable practical-reference depth

3. a further screened Wellcome dispensatory or household-medicine witness
   - only if it stays book-scale and avoids the lecture, exam, and administrative noise still present near the top of the raw frontier

## Verification

Passed in this pass:

- `npm run corpus-memory:refresh`
- `npm run lint`
- `node scripts/corpus/build-wellcome-corpus.mjs --work-ids=wellcome-fd873e2h,wellcome-d6g6adwj,wellcome-b4mvj3hp`
- `npm run verify:data-exports`
- `npm run corpus-memory:stats`
- exact `Corpus Memory` queries for all 3 newly landed Wellcome work IDs
