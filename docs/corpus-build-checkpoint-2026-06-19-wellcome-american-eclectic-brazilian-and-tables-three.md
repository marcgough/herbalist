# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the next curated Wellcome pass completed after the vade mecum, practice, and Linnaean checkpoint.

Main outcomes:

- 3 additional rights-cleared Wellcome books were acquired and chunked successfully
- the pass widened the archive with one large American eclectic therapeutics anchor, one Brazilian vegetal materia-medica reference, and one compact tables-of-materia-medica handbook
- the derived corpus layers were rebuilt after the pass
- `Corpus Memory` was refreshed and now reflects `1174` work summaries

## Wellcome American eclectic, Brazilian, and tables three completed

The following 3 Wellcome works are now acquired and chunked successfully:

- `wellcome-awbgqprm` - *The American eclectic materia medica and therapeutics* - `1902` chunks
- `wellcome-tjsrnm95` - *Systema de materia medica vegetal brasileira* - `365` chunks
- `wellcome-tse6znah` - *Tables of the materia medica* - `135` chunks

All 3 processed successfully through the official Wellcome text path.

## Batch characteristics

Taken together, this pass broadened the archive along three useful axes:

- stronger therapeutics depth through a substantial American eclectic reference
- wider regional plant-centered coverage through a Brazilian materia-medica witness
- tighter practical lookup structure through a compact tabular handbook of substances, formulae, and salts

That kept the corpus growing along durable public-reference lines rather than drifting into thin pharmacopoeia, supplements, administrative pamphlets, or article-reprint material.

## Current corpus totals

- registered works: `2720`
- chunked works: `1174`
- discovered works: `1539`
- failed works: `7`
- chunk records: `1515514`
- paragraph records: `1718442`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `773` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1005`
- uncovered frontier families: `921`
- depth frontier families: `197`
- herb candidates: `80155`
- high-confidence herb candidates: `5136`
- medium-confidence herb candidates: `22730`
- low-confidence herb candidates: `52289`
- seed-ready herb families: `124`
- supporting families: `137`
- herb profiles: `124`
- seed-review families: `60042`
- promotion candidates: `136`
- identity-review candidates: `27`
- secondary candidates: `55947`
- deprioritized candidates: `3932`
- thin-work review flags: `145`

### Local footprint

- size: `10.44 GiB`
- files: `10109`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3164`
- `edition-family`: `1866`
- `work-summary`: `1174`
- `herb-profile`: `124`

Latest ingest result after this pass:

- received: `3164`
- inserted: `3`
- updated: `3161`
- pruned: `0`

Retrieval checks confirmed via exact work-id queries that the newly added works are visible inside `Corpus Memory`, including:

- `wellcome-awbgqprm`
- `wellcome-tjsrnm95`
- `wellcome-tse6znah`

## Lane status after this pass

Completed in this pass:

- `wellcome-awbgqprm`
- `wellcome-tjsrnm95`
- `wellcome-tse6znah`

Manual retry lane still includes:

- `wellcome-bkdvy7wy`
- `wellcome-gj4s5ed2`

Existing separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The next refined Wellcome forward lane now lives at:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-twenty-sixth-wellcome-pass.md`

That shortlist now shifts the immediate slice toward one American family medical guide, one Thomsonian book-of-health bridge, and one large prescriptions compendium while continuing to hold back deep lexicon repeats, supplement-only material, thin Latin pharmacopoeia, administrative pamphlets, article-reprint bundles, and current Wellcome `404` text-endpoint cases.
