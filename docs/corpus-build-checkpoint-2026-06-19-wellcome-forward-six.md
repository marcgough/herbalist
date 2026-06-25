# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the second selector-driven Wellcome forward pass after the earlier eight-book botanical Wellcome lane.

Main outcomes:

- 6 additional rights-cleared Wellcome books were acquired successfully with no failures
- the derived corpus layers were rebuilt against the expanded archive
- `Corpus Memory` was refreshed and now reflects `1099` work summaries
- the next raw eight-title Wellcome selector pass was pruned into a tighter four-work forward slice before the next acquisition run

## Wellcome forward six completed

The following 6 Wellcome works were acquired and chunked successfully:

- `wellcome-t4wudf9r` - *The Edinburgh new dispensatory*
- `wellcome-kadwx9mj` - *The botanic physician*
- `wellcome-epwbukrc` - *Flora Scotica*
- `wellcome-m7ynte5e` - *The new dispensatory*
- `wellcome-fva5e7v2` - *Translation of the Pharmacopoeia of the Royal College of Physicians, of London, 1851*
- `wellcome-wzfn65h9` - *Elements of materia medica*

All 6 processed successfully.

## Batch characteristics

This six-book pass deepened the corpus in a more practical-reference direction than the prior flora-heavy octet.

It added:

- two large dispensatory witnesses
- one botanic-principles medicine compendium
- one regional flora for plant normalization depth
- one pharmacopoeia translation witness
- one broad materia-medica handbook

That combination strengthens both public-facing retrieval value and the underlying plant-and-preparation evidence graph without widening back into noisy dictionaries or administrative material.

## Current corpus totals

- registered works: `2720`
- chunked works: `1099`
- discovered works: `1616`
- failed works: `5`
- chunk records: `1365504`
- paragraph records: `1565852`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `698` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1058`
- uncovered frontier families: `982`
- depth frontier families: `194`
- herb candidates: `75905`
- high-confidence herb candidates: `4865`
- medium-confidence herb candidates: `21199`
- low-confidence herb candidates: `49841`
- seed-ready herb families: `124`
- supporting families: `122`
- herb profiles: `124`
- total herb-profile matched chunks: `100949`
- seed-review families: `56714`
- promotion candidates: `116`
- identity-review candidates: `26`
- secondary candidates: `52815`
- deprioritized candidates: `3757`
- thin-work review flags: `142`

### Local footprint

- size: `9.32 GiB`
- files: `9428`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3089`
- `edition-family`: `1866`
- `work-summary`: `1099`
- `herb-profile`: `124`

Latest ingest result after the six-book pass:

- received: `3089`
- inserted: `6`
- updated: `3083`
- pruned: `0`

## Lane status after this pass

Completed clean forward lane:

- `wellcome-t4wudf9r`
- `wellcome-kadwx9mj`
- `wellcome-epwbukrc`
- `wellcome-m7ynte5e`
- `wellcome-fva5e7v2`
- `wellcome-wzfn65h9`

Remaining separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The next refined Wellcome forward lane now lives at:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-second-wellcome-pass.md`

That shortlist keeps the next pass smaller and cleaner by prioritizing uncovered dispensatory and flora families, holding back multilingual dictionaries, repeat-family medical dictionaries, plate-heavy witnesses, and a narrow phosphorus monograph.
