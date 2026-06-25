# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the tenth selector-driven Wellcome forward pass after the post-ninth shortlist was staged.

Main outcomes:

- 3 additional rights-cleared Wellcome books were acquired successfully with no failures
- the derived corpus layers were rebuilt against the expanded archive
- `Corpus Memory` was refreshed and now reflects `1127` work summaries
- the refreshed selector output now leans toward a practical botanic-medicine manual, a controlled lexicon repeat, and one flora-and-botany companion for the next slice

## Wellcome lexicon, dispensatory, and botanical three completed

The following 3 Wellcome works were acquired and chunked successfully:

- `wellcome-guh5dmh9` - *Lexicon medicum, or, Medical dictionary* - `8712` chunks
- `wellcome-hhhxg64u` - *The new dispensatory* - `2349` chunks
- `wellcome-usxe87yv` - *Science papers, chiefly pharmacological and botanical* - `1301` chunks

All 3 processed successfully.

## Batch characteristics

This pass added one large terminology anchor, one further dispensatory witness, and one substantive pharmacological-and-botanical papers volume.

It materially strengthened:

- botany and materia-medica terminology coverage
- the book-scale dispensatory spine
- broader botanical evidence density for later herb-level retrieval

That mix is especially useful because it raises archive depth without drifting into plate-led or fragment-shaped material.

## Current corpus totals

- registered works: `2720`
- chunked works: `1127`
- discovered works: `1588`
- failed works: `5`
- chunk records: `1425019`
- paragraph records: `1626028`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `726` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1038`
- uncovered frontier families: `959`
- depth frontier families: `196`
- herb candidates: `78147`
- high-confidence herb candidates: `4982`
- medium-confidence herb candidates: `21790`
- low-confidence herb candidates: `51375`
- seed-ready herb families: `124`
- supporting families: `130`
- herb profiles: `124`
- total herb-profile matched chunks: `104208`
- seed-review families: `58468`
- promotion candidates: `126`
- identity-review candidates: `26`
- secondary candidates: `54482`
- deprioritized candidates: `3834`
- thin-work review flags: `143`

### Local footprint

- size: `9.70 GiB`
- files: `9677`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3117`
- `edition-family`: `1866`
- `work-summary`: `1127`
- `herb-profile`: `124`

Latest ingest result after this three-book pass:

- received: `3117`
- inserted: `3`
- updated: `3114`
- pruned: `0`

Retrieval checks confirmed that the newly added lexicon, dispensatory, and science-papers works are all visible inside `Corpus Memory`, alongside stable herb-profile retrieval for entries such as `Lemon` and `Ginger`.

## Lane status after this pass

Completed clean forward lane:

- `wellcome-guh5dmh9`
- `wellcome-hhhxg64u`
- `wellcome-usxe87yv`

Remaining separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The next refined Wellcome forward lane now lives at:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-tenth-wellcome-pass.md`

That shortlist now rebalances the immediate slice toward one practical botanic-medicine manual, one controlled lexicon repeat, and one flora-and-botany companion. Plate-led material, memoir-led material, narrow monographs, and foreign-language-leading dictionary witnesses remain in reserve.
