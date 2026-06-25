# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the next curated Wellcome pass completed after the American eclectic, Brazilian, and tables checkpoint.

Main outcomes:

- 3 additional rights-cleared Wellcome books were acquired and chunked successfully
- the pass widened the archive with one American family medical guide, one Thomsonian book-of-health bridge, and one large prescriptions compendium
- the derived corpus layers were rebuilt after the pass
- `Corpus Memory` was refreshed and now reflects `1177` work summaries

## Wellcome family guide, Thomsonian, and prescriptions three completed

The following 3 Wellcome works are now acquired and chunked successfully:

- `wellcome-rnpdxpd2` - *The American medical guide for the use of families* - `515` chunks
- `wellcome-cr3ah4dq` - *The book of health, or, Thomsonian theory and practice of medicine* - `700` chunks
- `wellcome-bsnmkdkc` - *The book of prescriptions* - `1006` chunks

All 3 processed successfully through the official Wellcome text path.

## Batch characteristics

Taken together, this pass broadened the archive along three useful axes:

- stronger household-reference coverage through a family medicine and materia-medica guide
- wider self-care and domestic-practice continuity through a Thomsonian health manual
- deeper practical remedy and dose lookup through a large prescription compendium

That kept the corpus growing in the direction of usable public-reference medicine rather than drifting back into thin pharmacopoeia, administrative pamphlets, or article-reprint material.

## Current corpus totals

- registered works: `2720`
- chunked works: `1177`
- discovered works: `1536`
- failed works: `7`
- chunk records: `1517735`
- paragraph records: `1720703`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `776` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1002`
- uncovered frontier families: `918`
- depth frontier families: `197`
- herb candidates: `80225`
- high-confidence herb candidates: `5145`
- medium-confidence herb candidates: `22738`
- low-confidence herb candidates: `52342`
- seed-ready herb families: `124`
- supporting families: `138`
- herb profiles: `124`
- seed-review families: `60089`
- promotion candidates: `136`
- identity-review candidates: `27`
- secondary candidates: `55993`
- deprioritized candidates: `3933`
- thin-work review flags: `145`

### Local footprint

- size: `10.45 GiB`
- files: `10135`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3167`
- `edition-family`: `1866`
- `work-summary`: `1177`
- `herb-profile`: `124`

Latest ingest result after this pass:

- received: `3167`
- inserted: `3`
- updated: `3164`
- pruned: `0`

Retrieval checks confirmed via exact work-id queries that the newly added works are visible inside `Corpus Memory`, including:

- `wellcome-rnpdxpd2`
- `wellcome-cr3ah4dq`
- `wellcome-bsnmkdkc`

## Lane status after this pass

Completed in this pass:

- `wellcome-rnpdxpd2`
- `wellcome-cr3ah4dq`
- `wellcome-bsnmkdkc`

Manual retry lane still includes:

- `wellcome-bkdvy7wy`
- `wellcome-gj4s5ed2`

Existing separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The next refined Wellcome forward lane now lives at:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-twenty-seventh-wellcome-pass.md`

That shortlist now shifts the immediate slice toward one rewritten Beasley prescriptions witness, one chemists-and-dispensers vade mecum, and one Monro supplement as the cleanest remaining non-duplicate `200` route while continuing to hold back deep lexicon repeats, thin Latin pharmacopoeia, administrative pamphlets, article-reprint bundles, and current Wellcome `404` text-endpoint cases.
