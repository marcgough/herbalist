# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the ninth selector-driven Wellcome forward pass after the earlier two-book bridge shortlist was staged.

Main outcomes:

- 2 additional rights-cleared Wellcome books were acquired successfully with no failures
- the derived corpus layers were rebuilt against the expanded archive
- `Corpus Memory` was refreshed and now reflects `1124` work summaries
- the refreshed selector output was reopened into a cleaner three-book next lane rather than forcing plate-led, memoir-led, narrow-monograph, or foreign-language-leading additions

## Wellcome dispensatory and public-health two completed

The following 2 Wellcome works were acquired and chunked successfully:

- `wellcome-c3u76kss` - *The Edinburgh new dispensatory*
- `wellcome-wjpnewyj` - *An epitome of the reports of the medical officers to the Chinese imperial maritime customs service*

Both processed successfully.

## Batch characteristics

This pass deliberately stayed small and book-heavy.

It added:

- one more large dispensatory witness to the materia-medica and pharmacy spine
- one broader bridge volume connecting materia medica with epidemics, famine, chronology, medical history, and public health in China

That mix keeps strengthening both the reference core and the later retrieval surface without padding the lane with weaker dictionary, plate, or memoir witnesses.

## Current corpus totals

- registered works: `2720`
- chunked works: `1124`
- discovered works: `1591`
- failed works: `5`
- chunk records: `1412657`
- paragraph records: `1613551`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `723` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1039`
- uncovered frontier families: `960`
- depth frontier families: `196`
- herb candidates: `77804`
- high-confidence herb candidates: `4957`
- medium-confidence herb candidates: `21619`
- low-confidence herb candidates: `51228`
- seed-ready herb families: `124`
- supporting families: `129`
- herb profiles: `124`
- total herb-profile matched chunks: `103759`
- seed-review families: `58179`
- promotion candidates: `126`
- identity-review candidates: `26`
- secondary candidates: `54203`
- deprioritized candidates: `3824`
- thin-work review flags: `143`

### Local footprint

- size: `9.63 GiB`
- files: `9651`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3114`
- `edition-family`: `1866`
- `work-summary`: `1124`
- `herb-profile`: `124`

Latest ingest result after this two-book pass:

- received: `3114`
- inserted: `2`
- updated: `3112`
- pruned: `0`

Retrieval checks confirmed that the newly acquired public-health bridge work is visible inside `Corpus Memory`, and herb profiles such as `Lemon` and `Ginger` still resolve cleanly inside the separate archive.

## Lane status after this pass

Completed clean forward lane:

- `wellcome-c3u76kss`
- `wellcome-wjpnewyj`

Remaining separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The next refined Wellcome forward lane now lives at:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-ninth-wellcome-pass.md`

That shortlist now reopens the immediate slice to three stronger book-scale witnesses: one botany-linked lexicon, one large dispensatory witness, and one pharmacological-and-botanical papers volume. Plate-led material, memoir-led material, narrow monographs, and foreign-language-leading dictionary witnesses stay in reserve.
