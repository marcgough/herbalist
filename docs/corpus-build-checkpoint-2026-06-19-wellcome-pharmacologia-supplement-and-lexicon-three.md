# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the thirteenth selector-driven Wellcome forward pass after the post-twelfth shortlist was staged.

Main outcomes:

- 3 additional rights-cleared Wellcome books were acquired successfully with no failures
- the derived corpus layers were rebuilt against the expanded archive
- `Corpus Memory` was refreshed and now reflects `1136` work summaries
- the refreshed selector output now opens a more explicitly multilingual reference lane: one botanical-and-pharmaceutical dictionary, one French materia-medica treatise, and one controlled lexicon repeat

## Wellcome pharmacologia, supplement, and lexicon three completed

The following 3 Wellcome works were acquired and chunked successfully:

- `wellcome-pwkjcn7f` - *Pharmacologia* - `984` chunks
- `wellcome-yfu6989c` - *A new supplement to the pharmacopoeias of London, Edinburgh, Dublin, and Paris* - `1307` chunks
- `wellcome-sxnhezav` - *Lexicon medicum, or, Medical dictionary* - `4465` chunks

All 3 processed successfully.

## Batch characteristics

This pass stayed reference-heavy while widening pharmacology, supplement, and terminology coverage.

It materially strengthened:

- uncovered-family pharmacology coverage
- variant coverage within the Rennie supplement lane
- one further lexicon witness while keeping repeat pressure controlled to a single slot

That mix keeps broadening the source base without spending a whole batch on repeats or weak witness shapes.

## Current corpus totals

- registered works: `2720`
- chunked works: `1136`
- discovered works: `1579`
- failed works: `5`
- chunk records: `1453057`
- paragraph records: `1654351`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `735` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1034`
- uncovered frontier families: `955`
- depth frontier families: `196`
- herb candidates: `78497`
- high-confidence herb candidates: `5023`
- medium-confidence herb candidates: `22197`
- low-confidence herb candidates: `51277`
- seed-ready herb families: `124`
- supporting families: `131`
- herb profiles: `124`
- total herb-profile matched chunks: `106241`
- seed-review families: `58734`
- promotion candidates: `130`
- identity-review candidates: `26`
- secondary candidates: `54740`
- deprioritized candidates: `3838`
- thin-work review flags: `143`

### Local footprint

- size: `9.87 GiB`
- files: `9761`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3126`
- `edition-family`: `1866`
- `work-summary`: `1136`
- `herb-profile`: `124`

Latest ingest result after this three-book pass:

- received: `3126`
- inserted: `3`
- updated: `3123`
- pruned: `0`

Retrieval checks confirmed that the newly added pharmacology reference, supplement variant, and lexicon witness are all visible inside `Corpus Memory`.

## Lane status after this pass

Completed clean forward lane:

- `wellcome-pwkjcn7f`
- `wellcome-yfu6989c`
- `wellcome-sxnhezav`

Remaining separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The next refined Wellcome forward lane now lives at:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-thirteenth-wellcome-pass.md`

That shortlist now opens a more deliberate multilingual-reference slice, taking two strong uncovered French-language materia-medica and botanical references while keeping only one remaining English lexicon repeat in reserve.
