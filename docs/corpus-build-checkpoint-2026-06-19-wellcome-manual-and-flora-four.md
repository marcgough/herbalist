# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the sixth selector-driven Wellcome forward pass after the earlier dispensatory-and-flora lane.

Main outcomes:

- 4 additional rights-cleared Wellcome books were acquired successfully with no failures
- the derived corpus layers were rebuilt against the expanded archive
- `Corpus Memory` was refreshed and now reflects `1115` work summaries
- the refreshed selector output was pruned into a tighter next lane that keeps practical book-scale reference value ahead of lower-yield dictionary or plate material

## Wellcome manual and flora four completed

The following 4 Wellcome works were acquired and chunked successfully:

- `wellcome-aqctmaxr` - *The Edinburgh new dispensatory*
- `wellcome-tk9hs478` - *Niger flora*
- `wellcome-ybt6etym` - *The British flora*
- `wellcome-ka454p8x` - *Gray's supplement to the pharmacopoeia*

All 4 processed successfully.

## Batch characteristics

This pass leaned into a balanced reference mix rather than a pure flora sweep.

It added:

- one more substantial dispensatory witness
- one practical pharmacopoeia/manual bridge
- two uncovered flora families with broader regional and naming coverage

That mix should help the later public corpus in two ways at once: better remedy-language grounding on the practical side and stronger botanical normalization breadth on the plant-identity side.

## Current corpus totals

- registered works: `2720`
- chunked works: `1115`
- discovered works: `1600`
- failed works: `5`
- chunk records: `1388613`
- paragraph records: `1589292`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `714` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1045`
- uncovered frontier families: `968`
- depth frontier families: `194`
- herb candidates: `76813`
- high-confidence herb candidates: `4898`
- medium-confidence herb candidates: `21387`
- low-confidence herb candidates: `50528`
- seed-ready herb families: `124`
- supporting families: `123`
- herb profiles: `124`
- total herb-profile matched chunks: `102552`
- seed-review families: `57422`
- promotion candidates: `123`
- identity-review candidates: `26`
- secondary candidates: `53479`
- deprioritized candidates: `3794`
- thin-work review flags: `143`

### Local footprint

- size: `9.48 GiB`
- files: `9570`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3105`
- `edition-family`: `1866`
- `work-summary`: `1115`
- `herb-profile`: `124`

Latest ingest result after this four-book pass:

- received: `3105`
- inserted: `4`
- updated: `3101`
- pruned: `0`

The newly acquired four-work slice is also visible as chunked `work-summary` coverage in `Corpus Memory`, with the archive now aligned again after the rebuild.

## Lane status after this pass

Completed clean forward lane:

- `wellcome-aqctmaxr`
- `wellcome-tk9hs478`
- `wellcome-ybt6etym`
- `wellcome-ka454p8x`

Remaining separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The next refined Wellcome forward lane now lives at:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-sixth-wellcome-pass.md`

That shortlist keeps the next pass book-scale but shifts slightly toward terminology and bridge references: one more strong dispensatory witness, a Pereira bridge text, a scientific-terms manual, and one multilingual terminology volume with clear synonym-normalization value.
