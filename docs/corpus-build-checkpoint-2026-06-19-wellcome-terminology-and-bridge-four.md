# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the seventh selector-driven Wellcome forward pass after the earlier manual-and-flora lane.

Main outcomes:

- 4 additional rights-cleared Wellcome books were acquired successfully with no failures
- the derived corpus layers were rebuilt against the expanded archive
- `Corpus Memory` was refreshed and now reflects `1119` work summaries
- the refreshed selector output was pruned into a shorter, cleaner next lane rather than forcing another mechanically full four-book batch

## Wellcome terminology and bridge four completed

The following 4 Wellcome works were acquired and chunked successfully:

- `wellcome-w36f7w6f` - *The Edinburgh new dispensatory*
- `wellcome-ng7fpuv2` - *Dr Pereira's elements of materia medica and therapeutics*
- `wellcome-bxc39zwn` - *A manual of scientific terms*
- `wellcome-n28yfh3u` - *A pentaglot dictionary of the terms employed ...*

All 4 processed successfully.

## Batch characteristics

This pass deliberately shifted from flora-heavy reference building into terminology and normalization support.

It added:

- one more large dispensatory witness
- one Pereira bridge text linking materia medica and pharmacopoeia use
- one scientific-terms manual with botany and medicine overlap
- one multilingual terminology volume with strong synonym-normalization value

That mix should materially improve later search, entity linking, and source-grounded chat retrieval, especially where old botanical, pharmacological, and multilingual naming conventions collide.

## Current corpus totals

- registered works: `2720`
- chunked works: `1119`
- discovered works: `1596`
- failed works: `5`
- chunk records: `1399665`
- paragraph records: `1600410`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `718` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1041`
- uncovered frontier families: `964`
- depth frontier families: `194`
- herb candidates: `77353`
- high-confidence herb candidates: `4935`
- medium-confidence herb candidates: `21566`
- low-confidence herb candidates: `50852`
- seed-ready herb families: `124`
- supporting families: `126`
- herb profiles: `124`
- total herb-profile matched chunks: `103117`
- seed-review families: `57820`
- promotion candidates: `124`
- identity-review candidates: `26`
- secondary candidates: `53859`
- deprioritized candidates: `3811`
- thin-work review flags: `143`

### Local footprint

- size: `9.55 GiB`
- files: `9607`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3109`
- `edition-family`: `1866`
- `work-summary`: `1119`
- `herb-profile`: `124`

Latest ingest result after this four-book pass:

- received: `3109`
- inserted: `4`
- updated: `3105`
- pruned: `0`

Retrieval verification also passed for both `A pentaglot dictionary ...` and `Dr Pereira's elements of materia medica and therapeutics`, which now resolve inside `Corpus Memory` as visible `work-summary` and edition-family coverage.

## Lane status after this pass

Completed clean forward lane:

- `wellcome-w36f7w6f`
- `wellcome-ng7fpuv2`
- `wellcome-bxc39zwn`
- `wellcome-n28yfh3u`

Remaining separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The next refined Wellcome forward lane now lives at:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-seventh-wellcome-pass.md`

That shortlist deliberately shortens the immediate slice to three works instead of padding it with lower-yield shapes. The next pass should take one more strong dispensatory witness, one lighter-repeat terminology dictionary, and one substantive pharmacological-and-botanical paper volume, while keeping plate-led, memoir-led, duplicate-paper, and narrow-monograph material in reserve.
