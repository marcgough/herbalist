# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the fourth selector-driven Wellcome forward pass after the earlier mixed practical-reference and flora lanes.

Main outcomes:

- 4 additional rights-cleared Wellcome books were acquired successfully with no failures
- the derived corpus layers were rebuilt against the expanded archive
- `Corpus Memory` was refreshed and now reflects `1107` work summaries
- a new raw eight-title Wellcome selector pass was pruned into a cleaner four-work forward slice for the next acquisition run

## Wellcome flora four completed

The following 4 Wellcome works were acquired and chunked successfully:

- `wellcome-yydaj72m` - *The Edinburgh new dispensatory*
- `wellcome-z63zn5v9` - *Flora Britanica*
- `wellcome-sqp7vspa` - *Flora Britannica*
- `wellcome-whxjz6sr` - *Flora Edinensis*

All 4 processed successfully.

## Batch characteristics

This pass leaned more heavily into flora coverage than the previous one.

It added:

- one more large dispensatory witness that still beats the remaining dictionary-shaped alternatives on practical reference value
- three uncovered flora families with strong potential for synonym resolution, locality-aware plant discovery, and historical naming coverage

This should help the later herb search experience in a different way from the materia-medica-heavy passes: less protocol language, more plant identity depth and cross-reference potential.

## Current corpus totals

- registered works: `2720`
- chunked works: `1107`
- discovered works: `1608`
- failed works: `5`
- chunk records: `1376921`
- paragraph records: `1577339`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `706` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1051`
- uncovered frontier families: `975`
- depth frontier families: `194`
- herb candidates: `76184`
- high-confidence herb candidates: `4886`
- medium-confidence herb candidates: `21268`
- low-confidence herb candidates: `50030`
- seed-ready herb families: `124`
- supporting families: `122`
- herb profiles: `124`
- total herb-profile matched chunks: `101719`
- seed-review families: `56953`
- promotion candidates: `119`
- identity-review candidates: `26`
- secondary candidates: `53027`
- deprioritized candidates: `3781`
- thin-work review flags: `143`

### Local footprint

- size: `9.40 GiB`
- files: `9499`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3097`
- `edition-family`: `1866`
- `work-summary`: `1107`
- `herb-profile`: `124`

Latest ingest result after the flora-heavy four-book pass:

- received: `3097`
- inserted: `4`
- updated: `3093`
- pruned: `0`

Retrieval verification also passed with `Flora Britannica`, which now resolves to both an `edition-family` record and a `work-summary` record in `Corpus Memory`.

## Lane status after this pass

Completed clean forward lane:

- `wellcome-yydaj72m`
- `wellcome-z63zn5v9`
- `wellcome-sqp7vspa`
- `wellcome-whxjz6sr`

Remaining separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The next refined Wellcome forward lane now lives at:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-fourth-wellcome-pass.md`

That shortlist keeps the next pass centered on one remaining strong dispensatory witness plus uncovered flora families with medicinal-context potential, while continuing to hold back multilingual dictionaries, repeat-family dictionary witnesses, plate-led material, and narrow therapeutic monographs.
