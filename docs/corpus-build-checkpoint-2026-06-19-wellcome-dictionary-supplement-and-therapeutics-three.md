# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the twelfth selector-driven Wellcome forward pass after the post-eleventh shortlist was staged.

Main outcomes:

- 3 additional rights-cleared Wellcome books were acquired successfully with no failures
- the derived corpus layers were rebuilt against the expanded archive
- `Corpus Memory` was refreshed and now reflects `1133` work summaries
- the refreshed selector output now leans toward one controlled lexicon repeat, one uncovered pharmacology reference, and one uncovered dispensatory supplement variant

## Wellcome dictionary, supplement, and therapeutics three completed

The following 3 Wellcome works were acquired and chunked successfully:

- `wellcome-t8tt3j2c` - *The London medical dictionary (Volume 1)* - `8030` chunks
- `wellcome-fwzua59q` - *A new supplement to the pharmacopoeias of London, Edinburgh, Dublin, and Paris* - `1482` chunks
- `wellcome-e5egngt7` - *Free phosphorus in medicine* - `510` chunks

All 3 processed successfully.

## Batch characteristics

This pass stayed reference-heavy while widening pharmacology and dispensatory coverage.

It materially strengthened:

- broad medical-dictionary coverage
- uncovered-family pharmacopoeia supplement coverage
- narrower therapeutics and materia-medica coverage

That mix keeps moving the corpus outward without padding the lane with plate-led or memoir-framed material.

## Current corpus totals

- registered works: `2720`
- chunked works: `1133`
- discovered works: `1582`
- failed works: `5`
- chunk records: `1446301`
- paragraph records: `1647498`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `732` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1036`
- uncovered frontier families: `957`
- depth frontier families: `196`
- herb candidates: `78357`
- high-confidence herb candidates: `5011`
- medium-confidence herb candidates: `22141`
- low-confidence herb candidates: `51205`
- seed-ready herb families: `124`
- supporting families: `130`
- herb profiles: `124`
- total herb-profile matched chunks: `105512`
- seed-review families: `58611`
- promotion candidates: `129`
- identity-review candidates: `26`
- secondary candidates: `54618`
- deprioritized candidates: `3838`
- thin-work review flags: `143`

### Local footprint

- size: `9.83 GiB`
- files: `9729`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3123`
- `edition-family`: `1866`
- `work-summary`: `1133`
- `herb-profile`: `124`

Latest ingest result after this three-book pass:

- received: `3123`
- inserted: `3`
- updated: `3120`
- pruned: `0`

Retrieval checks confirmed that the newly added London medical dictionary volume, pharmacopoeia supplement, and therapeutics monograph are all visible inside `Corpus Memory`.

## Lane status after this pass

Completed clean forward lane:

- `wellcome-t8tt3j2c`
- `wellcome-fwzua59q`
- `wellcome-e5egngt7`

Remaining separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The next refined Wellcome forward lane now lives at:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-twelfth-wellcome-pass.md`

That shortlist now narrows the immediate slice to one controlled lexicon repeat, one uncovered pharmacology reference, and one uncovered dispensatory supplement variant. Plate-led material, memoir-led material, and foreign-language-leading material remain in reserve.
