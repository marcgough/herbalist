# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the eighteenth selector-driven Wellcome forward pass after the widened post-seventeenth review window was pruned back into a cleaner lane.

Main outcomes:

- 3 additional rights-cleared Wellcome books were acquired successfully with no failures
- the pass moved away from saturated lexicon and pharmacopoeia families and back toward uncovered book-scale materia-medica references
- the derived corpus layers were rebuilt against the expanded archive
- `Corpus Memory` was refreshed and now reflects `1150` work summaries

## Wellcome experimental, Indian, and clinical three completed

The following 3 Wellcome works were acquired and chunked successfully:

- `wellcome-cnev3knk` - *An experimental history of the materia medica* - `2153` chunks
- `wellcome-dz5j7b6t` - *A digest of the principles and practice of medicine ... tables of Indian materia medica* - `2494` chunks
- `wellcome-ugt3huu2` - *The clinical guide ... with a practical pharmacopoeia* - `365` chunks

All 3 processed successfully.

## Batch characteristics

This pass deliberately broadened the corpus again after the dispensatory-recovery lane:

- one experimental materia-medica history
- one regional India-linked digest
- one practical medicine plus pharmacopoeia bridge

That mix keeps the archive useful for later herbal and practical-health retrieval while avoiding another immediate turn back into heavily repeated dictionary or pharmacopoeia families.

## Current corpus totals

- registered works: `2720`
- chunked works: `1150`
- discovered works: `1564`
- failed works: `6`
- chunk records: `1478807`
- paragraph records: `1680595`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `749` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1022`
- uncovered frontier families: `942`
- depth frontier families: `196`
- herb candidates: `79121`
- high-confidence herb candidates: `5061`
- medium-confidence herb candidates: `22409`
- low-confidence herb candidates: `51651`
- seed-ready herb families: `124`
- supporting families: `134`
- herb profiles: `124`
- total herb-profile matched chunks: `107232`
- seed-review families: `59229`
- promotion candidates: `133`
- identity-review candidates: `26`
- secondary candidates: `55183`
- deprioritized candidates: `3887`
- thin-work review flags: `143`

### Local footprint

- size: `10.14 GiB`
- files: `9894`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3140`
- `edition-family`: `1866`
- `work-summary`: `1150`
- `herb-profile`: `124`

Latest ingest result after this pass:

- received: `3140`
- inserted: `3`
- updated: `3137`
- pruned: `0`

Retrieval checks confirmed via exact work-id queries that all three newly added works are visible inside `Corpus Memory`.

## Lane status after this pass

Completed in this pass:

- `wellcome-cnev3knk`
- `wellcome-dz5j7b6t`
- `wellcome-ugt3huu2`

Manual retry lane still active:

- `wellcome-bkdvy7wy`

Existing separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The next refined Wellcome forward lane now lives at:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-eighteenth-wellcome-pass.md`

That shortlist now shifts the immediate slice toward one practical therapeutics handbook, one uncovered homoeopathic pharmacopoeia and posology witness, and one broad natural-history bridge while continuing to hold back plate-led, memoir-led, administrative, supplement-only, Latin-leading, and heavier repeat-family material.
