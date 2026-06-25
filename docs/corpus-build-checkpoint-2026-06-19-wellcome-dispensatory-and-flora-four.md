# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the fifth selector-driven Wellcome forward pass after the earlier flora-heavy lane.

Main outcomes:

- 4 additional rights-cleared Wellcome books were acquired successfully with no failures
- the derived corpus layers were rebuilt against the expanded archive
- `Corpus Memory` was refreshed and now reflects `1111` work summaries
- the refreshed selector output was pruned into a cleaner four-work forward slice for the next acquisition run

## Wellcome dispensatory and flora four completed

The following 4 Wellcome works were acquired and chunked successfully:

- `wellcome-z8myrvtr` - *The Edinburgh new dispensatory*
- `wellcome-ks34wqxh` - *Flora Japonica*
- `wellcome-mx322r5m` - *Flora Londinensis*
- `wellcome-q84rxdwk` - *Flora Oxoniensis*

All 4 processed successfully.

## Batch characteristics

This pass kept the botanical-reference lane open while also taking one more strong dispensatory witness.

It added:

- one high-value practical dispensatory witness that still outperformed the remaining dictionary-heavy candidates
- three uncovered flora families that widen the archive's regional and synonym coverage beyond the increasingly dense British-only lane

This keeps the corpus balanced between practical medical reference language and plant-identity depth, which should help later herb retrieval, citation linking, and cross-source synonym resolution.

## Current corpus totals

- registered works: `2720`
- chunked works: `1111`
- discovered works: `1604`
- failed works: `5`
- chunk records: `1381601`
- paragraph records: `1582076`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `710` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1047`
- uncovered frontier families: `971`
- depth frontier families: `194`
- herb candidates: `76368`
- high-confidence herb candidates: `4890`
- medium-confidence herb candidates: `21284`
- low-confidence herb candidates: `50194`
- seed-ready herb families: `124`
- supporting families: `122`
- herb profiles: `124`
- total herb-profile matched chunks: `101963`
- seed-review families: `57093`
- promotion candidates: `121`
- identity-review candidates: `26`
- secondary candidates: `53159`
- deprioritized candidates: `3787`
- thin-work review flags: `143`

### Local footprint

- size: `9.43 GiB`
- files: `9536`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3101`
- `edition-family`: `1866`
- `work-summary`: `1111`
- `herb-profile`: `124`

Latest ingest result after this four-book pass:

- received: `3101`
- inserted: `4`
- updated: `3097`
- pruned: `0`

Retrieval verification also passed with both `Flora Japonica` and `Flora Londinensis`, which now resolve to fresh `work-summary` records and matching edition-family coverage in `Corpus Memory`.

## Lane status after this pass

Completed clean forward lane:

- `wellcome-z8myrvtr`
- `wellcome-ks34wqxh`
- `wellcome-mx322r5m`
- `wellcome-q84rxdwk`

Remaining separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The next refined Wellcome forward lane now lives at:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-fifth-wellcome-pass.md`

That shortlist keeps the next pass centered on one more strong dispensatory/manual witness plus uncovered flora families with broad reference value, while continuing to hold back dictionary-heavy, plate-led, and narrow-monograph witnesses for later editorial lanes.
