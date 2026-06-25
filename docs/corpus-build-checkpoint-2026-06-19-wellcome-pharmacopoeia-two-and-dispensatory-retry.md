# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the sixteenth selector-driven Wellcome forward pass after the post-fifteenth shortlist was staged.

Main outcomes:

- 2 additional rights-cleared Wellcome books were acquired successfully
- 1 shortlisted Wellcome work exposed a fresh official-text `404` and was moved into manual retry
- the derived corpus layers were rebuilt against the expanded archive
- `Corpus Memory` was refreshed and now reflects `1144` work summaries

## Wellcome pharmacopoeia two completed, one dispensatory retry surfaced

The following 2 Wellcome works were acquired and chunked successfully:

- `wellcome-b4n9x8yx` - *Pharmacopoeia universalis* - `2574` chunks
- `wellcome-g3hnsw88` - *The prescriber's pharmacopoeia* - `185` chunks

The following shortlisted work failed the current official text chain and has been moved into manual retry:

- `wellcome-bkdvy7wy` - *The Edinburgh new dispensatory ...* - `404 Not Found`

## Batch characteristics

This pass kept the direct reference lane moving, but it also exposed a new Wellcome outlier that should be handled as a separate recovery problem rather than treated as routine frontier intake.

It materially strengthened:

- English dispensatory reference coverage
- prescriber-oriented pharmacopoeia coverage
- the practical pharmacy layer inside the corpus

It also clarified that the Edinburgh dispensatory family likely needs alternate witness selection or an official-text recovery path rather than blind retries against the same failing record.

## Current corpus totals

- registered works: `2720`
- chunked works: `1144`
- discovered works: `1570`
- failed works: `6`
- chunk records: `1463199`
- paragraph records: `1664796`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `743` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1027`
- uncovered frontier families: `947`
- depth frontier families: `196`
- herb candidates: `78726`
- high-confidence herb candidates: `5042`
- medium-confidence herb candidates: `22311`
- low-confidence herb candidates: `51373`
- seed-ready herb families: `124`
- supporting families: `132`
- herb profiles: `124`
- total herb-profile matched chunks: `106775`
- seed-review families: `58913`
- promotion candidates: `132`
- identity-review candidates: `26`
- secondary candidates: `54910`
- deprioritized candidates: `3845`
- thin-work review flags: `143`

### Local footprint

- size: `10.05 GiB`
- files: `9844`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3134`
- `edition-family`: `1866`
- `work-summary`: `1144`
- `herb-profile`: `124`

Latest ingest result after this pass:

- received: `3134`
- inserted: `2`
- updated: `3132`
- pruned: `0`

Retrieval checks confirmed that both newly added pharmacopoeia works are visible inside `Corpus Memory`.

## Lane status after this pass

Completed in this pass:

- `wellcome-b4n9x8yx`
- `wellcome-g3hnsw88`

New manual retry lane:

- `wellcome-bkdvy7wy`

Existing separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The next refined Wellcome forward lane now lives at:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-sixteenth-wellcome-pass.md`

That shortlist keeps the next slice conservative: one alternate Edinburgh dispensatory witness, one uncovered pharmacopoeia commentary bridge, and one controlled lexicon repeat only as the cleanest fallback if a third slot is still desired.
