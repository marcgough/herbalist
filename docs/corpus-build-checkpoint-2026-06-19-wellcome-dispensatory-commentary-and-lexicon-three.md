# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the seventeenth selector-driven Wellcome forward pass after the post-sixteenth shortlist was staged.

Main outcomes:

- 3 additional rights-cleared Wellcome books were acquired successfully with no failures
- the alternate Edinburgh dispensatory witness cleared cleanly where the prior witness had failed
- the derived corpus layers were rebuilt against the expanded archive
- `Corpus Memory` was refreshed and now reflects `1147` work summaries

## Wellcome dispensatory, commentary, and lexicon three completed

The following 3 Wellcome works were acquired and chunked successfully:

- `wellcome-f3xmzaat` - *The Edinburgh new dispensatory ...* - `1718` chunks
- `wellcome-tsr5qg85` - *Observations on the Edinburgh pharmacopoeia ...* - `146` chunks
- `wellcome-wdckcztx` - *Lexicon medicum* - `8732` chunks

All 3 processed successfully.

## Batch characteristics

This pass served two different jobs at once:

- recover the dispensatory family that had just surfaced a failing witness
- take one last controlled lexicon repeat while stronger uncovered pharmacy references were still thinning out

It materially strengthened:

- Edinburgh dispensatory coverage
- pharmacopoeia commentary and practical pharmacy context
- dictionary-style normalization support for later retrieval

That made it a useful transitional pass before widening the selector window again to find cleaner uncovered materia-medica books below the saturated top ranks.

## Current corpus totals

- registered works: `2720`
- chunked works: `1147`
- discovered works: `1567`
- failed works: `6`
- chunk records: `1473795`
- paragraph records: `1675491`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `746` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1025`
- uncovered frontier families: `945`
- depth frontier families: `196`
- herb candidates: `78877`
- high-confidence herb candidates: `5050`
- medium-confidence herb candidates: `22353`
- low-confidence herb candidates: `51474`
- seed-ready herb families: `124`
- supporting families: `133`
- herb profiles: `124`
- total herb-profile matched chunks: `107127`
- seed-review families: `59029`
- promotion candidates: `133`
- identity-review candidates: `26`
- secondary candidates: `55006`
- deprioritized candidates: `3864`
- thin-work review flags: `143`

### Local footprint

- size: `10.05 GiB`
- files: `9844`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3137`
- `edition-family`: `1866`
- `work-summary`: `1147`
- `herb-profile`: `124`

Latest ingest result after this pass:

- received: `3137`
- inserted: `3`
- updated: `3134`
- pruned: `0`

Retrieval checks confirmed that the alternate Edinburgh dispensatory witness, the pharmacopoeia commentary bridge, and the lexicon repeat are all visible inside `Corpus Memory`.

## Lane status after this pass

Completed in this pass:

- `wellcome-f3xmzaat`
- `wellcome-tsr5qg85`
- `wellcome-wdckcztx`

Manual retry lane still active:

- `wellcome-bkdvy7wy`

Existing separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

After this pass, the selector window was widened beyond the saturated top ranks so the next lane could focus on uncovered book-scale materia-medica references instead of additional lexicon and pharmacopoeia near-duplicates.
