# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the next curated Wellcome pass completed after the family guide, Thomsonian, and prescriptions checkpoint.

Main outcomes:

- 3 additional rights-cleared Wellcome books were acquired and chunked successfully
- the pass widened the archive with one rewritten Beasley prescriptions witness, one chemists-and-dispensers vade mecum, and one Monro supplement bridge
- the derived corpus layers were rebuilt after the pass
- `Corpus Memory` was refreshed and now reflects `1180` work summaries

## Wellcome rewritten prescriptions, vade mecum, and Monro supplement three completed

The following 3 Wellcome works are now acquired and chunked successfully:

- `wellcome-dnp36947` - *The book of prescriptions (Beasley)* - `734` chunks
- `wellcome-sdq8m36q` - *The chemists' and dispensers' vade mecum* - `820` chunks
- `wellcome-p6afhue8` - *Appendix or supplement to Dr. D. Monro's Treatise ...* - `339` chunks

All 3 processed successfully through the official Wellcome text path.

## Batch characteristics

Taken together, this pass broadened the archive along three useful axes:

- deeper applied prescribing and therapeutics coverage through the rewritten Beasley compendium
- stronger pharmacy and formulary utility through the dispensers' vade mecum
- one explicit supplement bridge that still adds omitted materia-medica material and index value without resorting to a `404` recovery lane

That kept the corpus moving forward while acknowledging that the remaining clean Wellcome queue is now less rich and more repetition-prone than the earlier passes.

## Current corpus totals

- registered works: `2720`
- chunked works: `1180`
- discovered works: `1533`
- failed works: `7`
- chunk records: `1519628`
- paragraph records: `1722632`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `779` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `999`
- uncovered frontier families: `915`
- depth frontier families: `197`
- herb candidates: `80300`
- high-confidence herb candidates: `5157`
- medium-confidence herb candidates: `22752`
- low-confidence herb candidates: `52391`
- seed-ready herb families: `124`
- supporting families: `138`
- herb profiles: `124`
- seed-review families: `60142`
- promotion candidates: `136`
- identity-review candidates: `27`
- secondary candidates: `56045`
- deprioritized candidates: `3934`
- thin-work review flags: `145`

### Local footprint

- size: `10.47 GiB`
- files: `10161`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3170`
- `edition-family`: `1866`
- `work-summary`: `1180`
- `herb-profile`: `124`

Latest ingest result after this pass:

- received: `3170`
- inserted: `3`
- updated: `3167`
- pruned: `0`

Retrieval checks confirmed via exact work-id queries that the newly added works are visible inside `Corpus Memory`, including:

- `wellcome-dnp36947`
- `wellcome-sdq8m36q`
- `wellcome-p6afhue8`

## Lane status after this pass

Completed in this pass:

- `wellcome-dnp36947`
- `wellcome-sdq8m36q`
- `wellcome-p6afhue8`

Manual retry lane still includes:

- `wellcome-bkdvy7wy`
- `wellcome-gj4s5ed2`

Existing separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The next refined Wellcome forward lane now lives at:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-twenty-eighth-wellcome-pass.md`

That shortlist now shifts the immediate slice toward one clinical pharmacopoeia pocket reference, one older Beasley prescriptions witness only as a deliberate family supplement, and one thin Latin pharmacopoeia witness as the cleanest remaining `200` route while explicitly holding back the prospectus-shaped homoeopathic item, deep lexicon repeats, administrative pamphlets, article-reprint bundles, and current Wellcome `404` text-endpoint cases.
