# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the next curated Wellcome pass after the cleaned post-nineteenth follow-up was completed and the selector was refreshed against the live archive.

Main outcomes:

- 3 additional rights-cleared Wellcome books were acquired and chunked successfully
- the selected slice mixed one substantial experimental materia-medica history, one prescriber-oriented pharmacopoeia, and one lighter botanical-plate witness
- the derived corpus layers were rebuilt against the expanded archive
- `Corpus Memory` was refreshed and now reflects `1159` work summaries

## Wellcome experimental, prescriber, and plates three completed

The following 3 Wellcome works are now acquired and chunked successfully:

- `wellcome-z3vrmmat` - *An experimental history of the materia medica* - `1863` chunks
- `wellcome-qwu5nvnn` - *The Prescriber's pharmacopoeia* - `150` chunks
- `wellcome-me9wem67` - *Assistant plates to the materia medica* - `31` chunks

All 3 processed successfully through the direct official Wellcome text path.

## Batch characteristics

This pass kept the archive moving across three different reference shapes:

- one uncovered book-scale materia-medica history
- one uncovered English prescriber reference
- one smaller botanical-plate witness that can still help later plant-identification support

That mix broadened the corpus without falling back into another source-broken Wellcome lane or overcommitting to more lexicon repeats in the same slice.

## Current corpus totals

- registered works: `2720`
- chunked works: `1159`
- discovered works: `1554`
- failed works: `7`
- chunk records: `1488397`
- paragraph records: `1690960`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `758` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1015`
- uncovered frontier families: `934`
- depth frontier families: `195`
- herb candidates: `79366`
- high-confidence herb candidates: `5078`
- medium-confidence herb candidates: `22603`
- low-confidence herb candidates: `51685`
- seed-ready herb families: `124`
- supporting families: `135`
- herb profiles: `124`
- seed-review families: `59430`
- promotion candidates: `133`
- identity-review candidates: `26`
- secondary candidates: `55369`
- deprioritized candidates: `3902`
- thin-work review flags: `144`

### Local footprint

- size: `10.27 GiB`
- files: `9981`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3149`
- `edition-family`: `1866`
- `work-summary`: `1159`
- `herb-profile`: `124`

Latest ingest result after this pass:

- received: `3149`
- inserted: `3`
- updated: `3146`
- pruned: `0`

Retrieval checks confirmed via exact work-id queries that all three newly added works are visible inside `Corpus Memory`:

- `wellcome-z3vrmmat`
- `wellcome-qwu5nvnn`
- `wellcome-me9wem67`

## Lane status after this pass

Completed in this pass:

- `wellcome-z3vrmmat`
- `wellcome-qwu5nvnn`
- `wellcome-me9wem67`

Manual retry lane still includes:

- `wellcome-bkdvy7wy`
- `wellcome-gj4s5ed2`

Existing separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The next refined Wellcome forward lane now lives at:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-twenty-first-wellcome-pass.md`

That shortlist now shifts the immediate slice toward one uncovered vegetable-kingdom materia-medica reference, one controlled two-volume lexicon repeat, and one English-framed botanical memoir-and-papers witness while continuing to hold back Latin- and German-leading titles, tract-like witnesses, supplement-only volumes, and the current Wellcome `404` text-endpoint cases.
