# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the next curated Wellcome pass completed after the reference-and-botanica six checkpoint.

Main outcomes:

- 3 additional rights-cleared Wellcome books were acquired and chunked successfully
- the pass widened the archive with one family-physician bridge, one Chinese materia-medica note set, and one German-leading deep reference
- the derived corpus layers were rebuilt after the pass
- `Corpus Memory` was refreshed and now reflects `1168` work summaries

## Wellcome family-physician, Chinese, and German three completed

The following 3 Wellcome works are now acquired and chunked successfully:

- `wellcome-jt7wyzcy` - *My own physician* - `269` chunks
- `wellcome-rpvs9hh8` - *Notes on Chinese materia medica* - `148` chunks
- `wellcome-dczsx3at` - *Materia medica oder gründliche abhandlung ...* - `355` chunks

All 3 processed successfully through the official Wellcome text path.

## Batch characteristics

Taken together, this pass broadened the archive along three useful axes:

- stronger practical household-reference continuity through a family-physician witness
- wider regional therapeutic coverage through a Chinese materia-medica reference
- deeper multilingual reference breadth through a German materia-medica work

That kept the corpus moving toward a genuinely broad historical health library without drifting into supplements, administrative pamphlets, or article-reprint material.

## Current corpus totals

- registered works: `2720`
- chunked works: `1168`
- discovered works: `1545`
- failed works: `7`
- chunk records: `1508711`
- paragraph records: `1711602`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `767` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1010`
- uncovered frontier families: `927`
- depth frontier families: `197`
- herb candidates: `79911`
- high-confidence herb candidates: `5109`
- medium-confidence herb candidates: `22724`
- low-confidence herb candidates: `52078`
- seed-ready herb families: `124`
- supporting families: `136`
- herb profiles: `124`
- seed-review families: `59837`
- promotion candidates: `134`
- identity-review candidates: `27`
- secondary candidates: `55748`
- deprioritized candidates: `3928`
- thin-work review flags: `145`

### Local footprint

- size: `10.39 GiB`
- files: `10057`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3158`
- `edition-family`: `1866`
- `work-summary`: `1168`
- `herb-profile`: `124`

Latest ingest result after this pass:

- received: `3158`
- inserted: `3`
- updated: `3155`
- pruned: `0`

Retrieval checks confirmed via exact work-id queries that the newly added works are visible inside `Corpus Memory`, including:

- `wellcome-jt7wyzcy`
- `wellcome-rpvs9hh8`
- `wellcome-dczsx3at`

## Lane status after this pass

Completed in this pass:

- `wellcome-jt7wyzcy`
- `wellcome-rpvs9hh8`
- `wellcome-dczsx3at`

Manual retry lane still includes:

- `wellcome-bkdvy7wy`
- `wellcome-gj4s5ed2`

Existing separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The next refined Wellcome forward lane now lives at:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-twenty-fourth-wellcome-pass.md`

That shortlist now shifts the immediate slice toward one practical late materia-medica vade mecum, one earlier practice-of-physic bridge, and one source-ready Linnaean materia-medica anchor while continuing to hold back very deep lexicon repeats, supplement-only material, administrative witnesses, article-reprint bundles, and current Wellcome `404` text-endpoint cases.
