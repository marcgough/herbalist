# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the third selector-driven Wellcome forward pass after the earlier six-book practical-reference lane.

Main outcomes:

- 4 additional rights-cleared Wellcome books were acquired successfully with no failures
- the derived corpus layers were rebuilt against the expanded archive
- `Corpus Memory` was refreshed and now reflects `1103` work summaries
- a new raw eight-title Wellcome selector pass was pruned into a cleaner four-work forward slice for the next acquisition run

## Wellcome forward four completed

The following 4 Wellcome works were acquired and chunked successfully:

- `wellcome-v6b53ujp` - *The Edinburgh new dispensatory*
- `wellcome-uqs64mrs` - *On a ready method of administering remedies ... containing a materia medica*
- `wellcome-fmt88r6h` - *Manual of materia medica and therapeutics*
- `wellcome-xgcydkyj` - *Flora Lapponica*

All 4 processed successfully.

## Batch characteristics

This four-book pass was smaller, but still valuable because it kept the corpus moving along the practical-reference lane while adding one distinct botanical-normalization witness.

It added:

- one large dispensatory witness
- one applied remedies and dose reference
- one broad materia-medica handbook
- one early flora text with medicinal and economic plant context

The result is a better balance between retrieval-ready practical books and long-range botanical naming depth than a dictionary-heavy or monograph-led pass would have given.

## Current corpus totals

- registered works: `2720`
- chunked works: `1103`
- discovered works: `1612`
- failed works: `5`
- chunk records: `1369046`
- paragraph records: `1569437`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `702` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1055`
- uncovered frontier families: `979`
- depth frontier families: `194`
- herb candidates: `75962`
- high-confidence herb candidates: `4877`
- medium-confidence herb candidates: `21211`
- low-confidence herb candidates: `49874`
- seed-ready herb families: `124`
- supporting families: `122`
- herb profiles: `124`
- total herb-profile matched chunks: `101365`
- seed-review families: `56762`
- promotion candidates: `118`
- identity-review candidates: `26`
- secondary candidates: `52858`
- deprioritized candidates: `3760`
- thin-work review flags: `143`

### Local footprint

- size: `9.35 GiB`
- files: `9462`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3093`
- `edition-family`: `1866`
- `work-summary`: `1103`
- `herb-profile`: `124`

Latest ingest result after the four-book pass:

- received: `3093`
- inserted: `4`
- updated: `3089`
- pruned: `0`

Retrieval verification also passed with `Flora Lapponica`, which now resolves to both an `edition-family` record and a `work-summary` record in `Corpus Memory`.

## Lane status after this pass

Completed clean forward lane:

- `wellcome-v6b53ujp`
- `wellcome-uqs64mrs`
- `wellcome-fmt88r6h`
- `wellcome-xgcydkyj`

Remaining separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The next refined Wellcome forward lane now lives at:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-third-wellcome-pass.md`

That shortlist keeps the next pass focused on one remaining high-value dispensatory-style witness plus stronger uncovered flora families, while continuing to hold back multilingual dictionaries, heavy repeat-family dictionary witnesses, plate-led material, and narrow therapeutic monographs.
