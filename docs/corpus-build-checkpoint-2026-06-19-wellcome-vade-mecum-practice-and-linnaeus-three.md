# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the next curated Wellcome pass completed after the family-physician, Chinese, and German checkpoint.

Main outcomes:

- 3 additional rights-cleared Wellcome books were acquired and chunked successfully
- the pass widened the archive with one late practical materia-medica vade mecum, one earlier practice-of-physic bridge, and one Linnaean materia-medica anchor
- the derived corpus layers were rebuilt after the pass
- `Corpus Memory` was refreshed and now reflects `1171` work summaries

## Wellcome vade mecum, practice, and Linnaeus three completed

The following 3 Wellcome works are now acquired and chunked successfully:

- `wellcome-y66g7ucd` - *Practitioner's vade mecum* - `3383` chunks
- `wellcome-hgcgmrsu` - *Practice of physic* - `549` chunks
- `wellcome-fstcqcz6` - *Caroli a Linné ... Materia medica* - `469` chunks

All 3 processed successfully through the official Wellcome text path.

## Batch characteristics

Taken together, this pass broadened the archive along three useful axes:

- stronger practical retrieval weight through a large late materia-medica and therapeutics handbook
- better continuity between household-reference medicine and the broader materia-medica lane through a practice manual with formulae and index structure
- deeper plant-centered historical grounding through a source-ready Linnaean materia-medica witness

That kept the corpus widening along durable reference lines rather than slipping back into supplements, administrative pamphlets, or article-reprint material.

## Current corpus totals

- registered works: `2720`
- chunked works: `1171`
- discovered works: `1542`
- failed works: `7`
- chunk records: `1513112`
- paragraph records: `1716023`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `770` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1007`
- uncovered frontier families: `924`
- depth frontier families: `197`
- herb candidates: `80070`
- high-confidence herb candidates: `5124`
- medium-confidence herb candidates: `22732`
- low-confidence herb candidates: `52214`
- seed-ready herb families: `124`
- supporting families: `137`
- herb profiles: `124`
- seed-review families: `59965`
- promotion candidates: `134`
- identity-review candidates: `27`
- secondary candidates: `55873`
- deprioritized candidates: `3931`
- thin-work review flags: `145`

### Local footprint

- size: `10.42 GiB`
- files: `10083`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3161`
- `edition-family`: `1866`
- `work-summary`: `1171`
- `herb-profile`: `124`

Latest ingest result after this pass:

- received: `3161`
- inserted: `3`
- updated: `3158`
- pruned: `0`

Retrieval checks confirmed via exact work-id queries that the newly added works are visible inside `Corpus Memory`, including:

- `wellcome-y66g7ucd`
- `wellcome-hgcgmrsu`
- `wellcome-fstcqcz6`

## Lane status after this pass

Completed in this pass:

- `wellcome-y66g7ucd`
- `wellcome-hgcgmrsu`
- `wellcome-fstcqcz6`

Manual retry lane still includes:

- `wellcome-bkdvy7wy`
- `wellcome-gj4s5ed2`

Existing separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The next refined Wellcome forward lane now lives at:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-twenty-fifth-wellcome-pass.md`

That shortlist now shifts the immediate slice toward one large American eclectic therapeutics anchor, one Brazilian vegetal materia-medica reference, and one compact tables-of-materia-medica handbook while continuing to hold back deep lexicon repeats, supplement-only material, thin Latin pharmacopoeia, administrative pamphlets, article-reprint bundles, and current Wellcome `404` text-endpoint cases.
