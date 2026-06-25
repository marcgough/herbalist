# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the eleventh selector-driven Wellcome forward pass after the post-tenth shortlist was staged.

Main outcomes:

- 3 additional rights-cleared Wellcome books were acquired successfully with no failures
- the derived corpus layers were rebuilt against the expanded archive
- `Corpus Memory` was refreshed and now reflects `1130` work summaries
- the refreshed selector output now tilts the next slice toward one broad medical dictionary volume, one uncovered dispensatory supplement, and one narrower therapeutics monograph

## Wellcome botanic manual, lexicon, and flora three completed

The following 3 Wellcome works were acquired and chunked successfully:

- `wellcome-q59tmjuk` - *An improved system of botanic medicine* - `2454` chunks
- `wellcome-m2jh6npr` - *Lexicon-medicum, or, Medical dictionary* - `8073` chunks
- `wellcome-pfemsehm` - *Beauties of flora, and outlines of botany* - `733` chunks

All 3 processed successfully.

## Batch characteristics

This pass kept the archive book-first while improving both botanical and terminology coverage.

It materially strengthened:

- practical botanic-medicine coverage
- botany and materia-medica terminology depth
- flora-oriented plant-reference coverage

That mix helped broaden the archive without falling back into plate-led or memoir-shaped additions.

## Current corpus totals

- registered works: `2720`
- chunked works: `1130`
- discovered works: `1585`
- failed works: `5`
- chunk records: `1436279`
- paragraph records: `1637415`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `729` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1037`
- uncovered frontier families: `959`
- depth frontier families: `195`
- herb candidates: `78254`
- high-confidence herb candidates: `4990`
- medium-confidence herb candidates: `21917`
- low-confidence herb candidates: `51347`
- seed-ready herb families: `124`
- supporting families: `130`
- herb profiles: `124`
- total herb-profile matched chunks: `104751`
- seed-review families: `58542`
- promotion candidates: `126`
- identity-review candidates: `26`
- secondary candidates: `54553`
- deprioritized candidates: `3837`
- thin-work review flags: `143`

### Local footprint

- size: `9.77 GiB`
- files: `9703`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3120`
- `edition-family`: `1866`
- `work-summary`: `1130`
- `herb-profile`: `124`

Latest ingest result after this three-book pass:

- received: `3120`
- inserted: `3`
- updated: `3117`
- pruned: `0`

Retrieval checks confirmed that the newly added botanic-medicine manual, lexicon witness, and flora companion are all visible inside `Corpus Memory`.

## Lane status after this pass

Completed clean forward lane:

- `wellcome-q59tmjuk`
- `wellcome-m2jh6npr`
- `wellcome-pfemsehm`

Remaining separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The next refined Wellcome forward lane now lives at:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-eleventh-wellcome-pass.md`

That shortlist now narrows the immediate slice to one broad medical dictionary volume, one uncovered dispensatory supplement, and one controlled narrower therapeutics witness. Plate-led material, memoir-led material, foreign-language-leading dictionary material, and heavier repeat-dictionary witnesses remain in reserve.
