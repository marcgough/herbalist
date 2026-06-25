# Herbalisti Corpus Build Checkpoint

Date: 2026-06-17

## Objective

Harden the semantic herbal shortlist so the growing corpus behaves more like a usable knowledge archive and less like a raw extraction dump.

This pass focused on:

- fixing punctuation-driven term-family ID collisions
- adding a durable curator decision layer for the seed catalog
- recomputing seed-catalog counts from the evidence layer instead of inheriting them blindly

## What changed

### 1. Term-family IDs are now collision-safe

`scripts/corpus/build-term-families.mjs` now appends a short hash suffix to each `family_id`.

Why that mattered:

- the earlier ID scheme could collide when two canonical keys slugified to the same value
- one live example was `Clove` versus `Clove-`
- those collisions distorted chunk counts in the accepted plant-family layer because later rows could overwrite earlier rows during chunk aggregation

The rebuilt term-family layer keeps the same high-level totals, but the IDs are now stable and unique.

### 2. The seed catalog now supports curator decisions

A new decision file is now live at:

- `corpus/review/seed-catalog-decisions.csv`

The seed-catalog builder now uses that file to:

- merge chosen alias families into a canonical target
- promote clear medicinal plant families into the seed-ready shortlist
- reclassify non-plant therapeutic vocabulary into supporting lanes
- preserve provenance through `source_family_refs` and `decision_note`

### 3. Seed-catalog counts are now recomputed from the evidence layer

`scripts/corpus/build-seed-catalog.mjs` now reads:

- `corpus/derived/term-families/accepted-plant-families.csv`
- `corpus/derived/term-families/memberships.csv`
- `corpus/derived/evidence/chunk-signals.jsonl`

That means:

- merged families retain exact chunk and work counts
- promoted families inherit the real evidence totals already present in the archive
- the public herbal shortlist can grow without quietly double-counting aliases

## Current semantic totals after the rebuild

Corpus totals remain:

- 2,720 registered works
- 479 locally acquired and chunked works
- 2,241 discovered works still queued
- 0 failed works

Term-family layer after rebuild:

- 41,602 canonical families
- 39,249 accepted families
- 39,075 accepted plant-like families
- 174 accepted broader materia medica families
- 31 review families
- 2,322 rejected families

Seed-catalog layer after curation rebuild:

- 39,075 accepted plant families as input
- 17 curator decision rows applied
- 2 aliased catalog families
- 112 seed-ready families
- 72 supporting families
- 31,256 review families
- 7,633 excluded noise families

New supporting classes now in live use:

- `therapeutic-descriptor`
- `derived-substance`

## Initial curator decisions applied

Alias merges:

- `clove-` -> `clove`
- `wild cherry tree` -> `wild cherry`

Promoted into `seed-ready`:

- `capsicum`
- `stramonium`
- `bayberry`
- `burdock`
- `belladonna`
- `blue cohosh`
- `wild lettuce`
- `wild indigo`
- `wild valerian`

Reclassified into `supporting`:

- `mercurial` -> `therapeutic-descriptor`
- `camphorated` -> `derived-substance`
- `vinegar` -> `derived-substance`
- `anodyne` -> `therapeutic-descriptor`
- `diaphoretic` -> `therapeutic-descriptor`
- `tonic` -> `therapeutic-descriptor`

## Why this matters

This was a meaningful archive-quality improvement:

1. it removed a real structural bug in the semantic layer rather than only adding more data
2. it converted several obvious medicinal plants from limbo into the first public-ready shortlist
3. it kept broader historical therapeutic language, but in the right semantic lane
4. it made future manual curation durable, reviewable, and source-grounded

## Files updated

- `scripts/corpus/build-term-families.mjs`
- `scripts/corpus/build-seed-catalog.mjs`
- `corpus/review/seed-catalog-decisions.csv`
- `corpus/derived/term-families/`
- `corpus/derived/seed-catalog/`
- `corpus/exports/term-family-summary.json`
- `corpus/exports/seed-catalog-summary.json`

## Recommended next move

1. continue growing the local corpus from official no-key book lanes while this new curation layer is in place
2. expand `seed-catalog-decisions.csv` with the next wave of high-value medicinal families from the `candidate-specific-family` review lane
3. start assembling herb-profile outputs from the stronger 112-family seed shortlist rather than waiting for the entire review queue to be cleaned
