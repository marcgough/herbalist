# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the nineteenth selector-driven Wellcome forward pass after the post-eighteenth shortlist was staged.

Main outcomes:

- 3 additional rights-cleared Wellcome books were acquired successfully with no failures
- the pass broadened the corpus across practical therapeutics, homoeopathic preparation, and natural-history-linked materia medica
- the derived corpus layers were rebuilt against the expanded archive
- `Corpus Memory` was refreshed and now reflects `1153` work summaries

## Wellcome therapeutics, homoeopathic, and natural-history three completed

The following 3 Wellcome works were acquired and chunked successfully:

- `wellcome-atxapab6` - *A hand-book of materia medica and therapeutics* - `291` chunks
- `wellcome-tgduxs22` - *New homoeopathic pharmacopoeia & posology* - `816` chunks
- `wellcome-vt9bcgbv` - *A general natural history ... including the history of the materia medica* - `3418` chunks

All 3 processed successfully.

## Batch characteristics

This pass deliberately widened the public-reference spine again:

- one practical therapeutics handbook
- one practical preparation-and-dosing witness
- one broader natural-history bridge with explicit materia-medica relevance

That mix keeps the corpus moving toward broader herbal, therapeutic, and historical-use coverage without falling immediately back into heavier dictionary or pharmacopoeia repeat families.

## Current corpus totals

- registered works: `2720`
- chunked works: `1153`
- discovered works: `1561`
- failed works: `6`
- chunk records: `1483332`
- paragraph records: `1685777`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `752` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1019`
- uncovered frontier families: `940`
- depth frontier families: `195`
- herb candidates: `79141`
- high-confidence herb candidates: `5066`
- medium-confidence herb candidates: `22459`
- low-confidence herb candidates: `51616`
- seed-ready herb families: `124`
- supporting families: `134`
- herb profiles: `124`
- total herb-profile matched chunks: `107249`
- seed-review families: `59242`
- promotion candidates: `133`
- identity-review candidates: `26`
- secondary candidates: `55195`
- deprioritized candidates: `3888`
- thin-work review flags: `143`

### Local footprint

- size: `10.14 GiB`
- files: `9894`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3143`
- `edition-family`: `1866`
- `work-summary`: `1153`
- `herb-profile`: `124`

Latest ingest result after this pass:

- received: `3143`
- inserted: `3`
- updated: `3140`
- pruned: `0`

Retrieval checks confirmed via exact work-id queries that all three newly added works are visible inside `Corpus Memory`.

## Lane status after this pass

Completed in this pass:

- `wellcome-atxapab6`
- `wellcome-tgduxs22`
- `wellcome-vt9bcgbv`

Manual retry lane still active:

- `wellcome-bkdvy7wy`

Existing separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The next refined Wellcome forward lane now lives at:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-nineteenth-wellcome-pass.md`

That shortlist now shifts the immediate slice toward one practical vegetable materia-medica manual, one plant-specific Seneca-root witness, and one two-volume experimental materia-medica bridge while continuing to hold back plate-led, memoir-led, supplement-only, Latin-leading, administrative, and heavier repeat-family material.
