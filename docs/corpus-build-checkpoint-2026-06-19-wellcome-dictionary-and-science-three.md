# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the eighth selector-driven Wellcome forward pass after the earlier terminology-and-bridge lane.

Main outcomes:

- 3 additional rights-cleared Wellcome books were acquired successfully with no failures
- the derived corpus layers were rebuilt against the expanded archive
- `Corpus Memory` was refreshed and now reflects `1122` work summaries
- the refreshed selector output was pruned into a deliberately smaller two-book next lane rather than forcing marginal additions

## Wellcome dictionary and science three completed

The following 3 Wellcome works were acquired and chunked successfully:

- `wellcome-zphmbrys` - *The Edinburgh new dispensatory ...*
- `wellcome-qfnr53mf` - *Quincy's Lexicon-medicum*
- `wellcome-pybf3nye` - *Science papers : chiefly pharmacological and botanical*

All 3 processed successfully.

## Batch characteristics

This pass continued the shift from broad flora acquisition into terminology and pharmacological reference support.

It added:

- one more large dispensatory witness
- one lighter-repeat medical dictionary with practical terminology value
- one substantive pharmacological-and-botanical paper volume

That mix keeps expanding useful search and retrieval coverage without leaning too hard into weaker witness shapes.

## Current corpus totals

- registered works: `2720`
- chunked works: `1122`
- discovered works: `1593`
- failed works: `5`
- chunk records: `1408442`
- paragraph records: `1609304`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `721` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1040`
- uncovered frontier families: `962`
- depth frontier families: `195`
- herb candidates: `77745`
- high-confidence herb candidates: `4954`
- medium-confidence herb candidates: `21615`
- low-confidence herb candidates: `51176`
- seed-ready herb families: `124`
- supporting families: `129`
- herb profiles: `124`
- total herb-profile matched chunks: `103460`
- seed-review families: `58131`
- promotion candidates: `125`
- identity-review candidates: `26`
- secondary candidates: `54157`
- deprioritized candidates: `3823`
- thin-work review flags: `143`

### Local footprint

- size: `9.60 GiB`
- files: `9633`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3112`
- `edition-family`: `1866`
- `work-summary`: `1122`
- `herb-profile`: `124`

Latest ingest result after this three-book pass:

- received: `3112`
- inserted: `3`
- updated: `3109`
- pruned: `0`

The newly acquired three-work slice is also visible as chunked `work-summary` coverage in `Corpus Memory`, keeping the semantic layer aligned with the latest archive state.

## Lane status after this pass

Completed clean forward lane:

- `wellcome-zphmbrys`
- `wellcome-qfnr53mf`
- `wellcome-pybf3nye`

Remaining separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The next refined Wellcome forward lane now lives at:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-eighth-wellcome-pass.md`

That shortlist now intentionally trims the immediate slice to two works: one more strong dispensatory witness and one broader public-health and materia-medica bridge book. Lower-yield dictionary repeats, plate-led material, memoir-led volumes, duplicate science-paper witnesses, narrow monographs, and foreign-language-leading dictionary material stay in reserve.
