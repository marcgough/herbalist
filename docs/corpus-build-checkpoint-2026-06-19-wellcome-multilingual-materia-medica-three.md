# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the fourteenth selector-driven Wellcome forward pass after the post-thirteenth shortlist was staged.

Main outcomes:

- 3 additional rights-cleared Wellcome books were acquired successfully with no failures
- the derived corpus layers were rebuilt against the expanded archive
- `Corpus Memory` was refreshed and now reflects `1139` work summaries
- the refreshed selector output now rebalances the next slice toward North American medical plants, one Spanish-language materia-medica dictionary, and one practical botanic-medicine witness

## Wellcome multilingual materia-medica three completed

The following 3 Wellcome works were acquired and chunked successfully:

- `wellcome-be5d5nrr` - *Dictionnaire botanique et pharmaceutique* - `2451` chunks
- `wellcome-u338cm6k` - *Traite elementaire de matiere medicale* - `1443` chunks
- `wellcome-pjxw6n2t` - *Traite de la matiere medicale* - `879` chunks

All 3 processed successfully.

## Batch characteristics

This pass deliberately broadened the multilingual reference layer.

It materially strengthened:

- botanical-and-pharmaceutical dictionary coverage
- French-language materia-medica reference coverage
- broader historical multilingual evidence that can later support herb-level synthesis

That mix keeps the corpus expanding across language and geography instead of only deepening the already-strong English dictionary spine.

## Current corpus totals

- registered works: `2720`
- chunked works: `1139`
- discovered works: `1576`
- failed works: `5`
- chunk records: `1457830`
- paragraph records: `1659358`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `738` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1031`
- uncovered frontier families: `952`
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

- size: `9.90 GiB`
- files: `9793`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3129`
- `edition-family`: `1866`
- `work-summary`: `1139`
- `herb-profile`: `124`

Latest ingest result after this three-book pass:

- received: `3129`
- inserted: `3`
- updated: `3126`
- pruned: `0`

Retrieval checks confirmed that the newly added multilingual dictionary and both French-language materia-medica works are all visible inside `Corpus Memory`.

## Lane status after this pass

Completed clean forward lane:

- `wellcome-be5d5nrr`
- `wellcome-u338cm6k`
- `wellcome-pjxw6n2t`

Remaining separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The next refined Wellcome forward lane now lives at:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-fourteenth-wellcome-pass.md`

That shortlist now narrows the immediate slice to one North American medical-plants reference, one Spanish-language materia-medica dictionary, and one practical botanic-medicine witness. Plate-led material, memoir-led material, and heavy repeat-dictionary intake remain in reserve.
