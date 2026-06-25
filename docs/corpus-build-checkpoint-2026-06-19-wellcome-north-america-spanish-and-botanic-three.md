# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the fifteenth selector-driven Wellcome forward pass after the post-fourteenth shortlist was staged.

Main outcomes:

- 3 additional rights-cleared Wellcome books were acquired successfully with no failures
- the derived corpus layers were rebuilt against the expanded archive
- `Corpus Memory` was refreshed and now reflects `1142` work summaries
- the refreshed selector output now shifts the next slice toward direct English dispensatory and pharmacopoeia references while holding back repeat lexicons, plate-led material, and memoir-shaped witnesses

## Wellcome North America, Spanish, and botanic three completed

The following 3 Wellcome works were acquired and chunked successfully:

- `wellcome-gthesfpr` - *Drugs and medicines of North America* - `1106` chunks
- `wellcome-xj4suk39` - *Principios para la materia medica del pais en forma de diccionario* - `176` chunks
- `wellcome-xed7wwta` - *An improved system of botanic medicine* - `1328` chunks

All 3 processed successfully.

## Batch characteristics

This pass deliberately widened the corpus across geography, language, and practical treatment style without drifting away from book-scale references.

It materially strengthened:

- North American medical-plants reference coverage
- Spanish-language materia-medica dictionary coverage
- practical botanic-medicine treatment coverage

That mix keeps the archive useful for later public retrieval by adding direct reference books rather than only deepening repeat dictionary or dispensatory families.

## Current corpus totals

- registered works: `2720`
- chunked works: `1142`
- discovered works: `1573`
- failed works: `5`
- chunk records: `1460440`
- paragraph records: `1661994`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `741` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1029`
- uncovered frontier families: `950`
- depth frontier families: `196`
- herb candidates: `78519`
- high-confidence herb candidates: `5026`
- medium-confidence herb candidates: `22284`
- low-confidence herb candidates: `51209`
- seed-ready herb families: `124`
- supporting families: `131`
- herb profiles: `124`
- total herb-profile matched chunks: `106471`
- seed-review families: `58749`
- promotion candidates: `131`
- identity-review candidates: `26`
- secondary candidates: `54754`
- deprioritized candidates: `3838`
- thin-work review flags: `143`

### Local footprint

- size: `9.91 GiB`
- files: `9819`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3132`
- `edition-family`: `1866`
- `work-summary`: `1142`
- `herb-profile`: `124`

Latest ingest result after this three-book pass:

- received: `3132`
- inserted: `3`
- updated: `3129`
- pruned: `0`

Retrieval checks confirmed that the newly added North American reference, Spanish-language materia-medica dictionary, and practical botanic-medicine witness are all visible inside `Corpus Memory`.

## Lane status after this pass

Completed clean forward lane:

- `wellcome-gthesfpr`
- `wellcome-xj4suk39`
- `wellcome-xed7wwta`

Remaining separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The next refined Wellcome forward lane now lives at:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-fifteenth-wellcome-pass.md`

That shortlist now narrows the immediate slice to three direct English reference books: one broad universal dispensatory, one Edinburgh dispensatory witness, and one prescriber-oriented pharmacopoeia. Commentary-heavy, plate-led, memoir-led, and repeat-dictionary material remain in reserve.
