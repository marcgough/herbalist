# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the cleaned post-nineteenth Wellcome follow-up after the staged shortlist was revalidated against the stricter book-only standard.

Main outcomes:

- 3 additional rights-cleared Wellcome books were acquired and chunked successfully
- the tract-shaped `wellcome-c5t9cgqr` was removed from the immediate slice before acquisition
- `wellcome-gj4s5ed2` failed official Wellcome text retrieval with `404 Not Found` and moved into manual retry
- `wellcome-eerza6hf` was used as the replacement because it remained book-shaped and was still retrievable through the official Wellcome text path
- the derived corpus layers were rebuilt against the expanded archive
- `Corpus Memory` was refreshed and now reflects `1156` work summaries

## Wellcome manual, therapeutics, and Americana three completed

The following 3 Wellcome works are now acquired and chunked successfully:

- `wellcome-xdwqj3xz` - *A manual of vegetable materia medica* - `961` chunks
- `wellcome-kkpnd6fh` - *General therapeutics and materia medica: adapted for a medical textbook (Volume 2)* - `1836` chunks
- `wellcome-eerza6hf` - *Materia medica Americana potissimum regni vegetabilis* - `224` chunks

The staged two-volume bridge `wellcome-gj4s5ed2` did not complete. Its official Wellcome text route failed with `404 Not Found`, so it now sits in manual retry rather than being counted as a landed witness.

## Batch characteristics

This follow-up kept the next slice inside the cleaner book-only lane:

- one practical vegetable materia-medica manual
- one therapeutics-and-materia-medica bridge volume
- one botanical-American materia-medica witness used as a source-available replacement

That mix kept the acquisition moving without falling back to the tract-shaped Seneca-root epistle or pretending the broken two-volume Wellcome bridge had landed cleanly.

## Current corpus totals

- registered works: `2720`
- chunked works: `1156`
- discovered works: `1557`
- failed works: `7`
- chunk records: `1486353`
- paragraph records: `1688846`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `755` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1017`
- uncovered frontier families: `937`
- depth frontier families: `195`
- herb candidates: `79200`
- high-confidence herb candidates: `5071`
- medium-confidence herb candidates: `22533`
- low-confidence herb candidates: `51596`
- seed-ready herb families: `124`
- supporting families: `134`
- herb profiles: `124`
- seed-review families: `59295`
- promotion candidates: `133`
- identity-review candidates: `26`
- secondary candidates: `55246`
- deprioritized candidates: `3890`
- thin-work review flags: `143`

### Local footprint

- size: `10.26 GiB`
- files: `9955`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3146`
- `edition-family`: `1866`
- `work-summary`: `1156`
- `herb-profile`: `124`

Latest ingest result after this pass:

- received: `3146`
- inserted: `3`
- updated: `3143`
- pruned: `0`

Retrieval checks confirmed via exact work-id queries that all three newly added works are visible inside `Corpus Memory`:

- `wellcome-xdwqj3xz`
- `wellcome-kkpnd6fh`
- `wellcome-eerza6hf`

## Lane status after this pass

Completed in this pass:

- `wellcome-xdwqj3xz`
- `wellcome-kkpnd6fh`
- `wellcome-eerza6hf`

Manual retry lane now includes:

- `wellcome-bkdvy7wy`
- `wellcome-gj4s5ed2`

Existing separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The next refined Wellcome forward lane now lives at:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-twentieth-wellcome-pass.md`

That shortlist now shifts the immediate slice toward one uncovered experimental materia-medica history, one prescriber-oriented pharmacopoeia, and one controlled botanical-plate witness while continuing to hold back deeper lexicon repeats, memoir framing, tract-like witnesses, supplement-only volumes, and the current Wellcome `404` text-endpoint cases.
