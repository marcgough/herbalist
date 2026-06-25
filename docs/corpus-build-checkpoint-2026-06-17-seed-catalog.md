# Herbalisti Corpus Build Checkpoint

Date: 2026-06-17

## Objective

Add a conservative second-pass curation layer above the accepted plant-family output so the first public Herbalisti herb database can start from a shortlist that is specific, explainable, and source-traceable.

## What was added

A new derived layer now sits above `corpus/derived/term-families/`:

- accepted plant-family output in `corpus/derived/term-families/accepted-plant-families.csv`
- curated shortlist and review queues in `corpus/derived/seed-catalog/`

This keeps the raw evidence and the canonical family layer intact, while creating a cleaner shortlist for the first herb pages and chat retrieval flows.

## New outputs

- `corpus/derived/seed-catalog/catalog.csv`
- `corpus/derived/seed-catalog/seed-ready-families.csv`
- `corpus/derived/seed-catalog/culinary-medicinal-families.csv`
- `corpus/derived/seed-catalog/plant-material-families.csv`
- `corpus/derived/seed-catalog/derived-material-families.csv`
- `corpus/derived/seed-catalog/broad-plant-families.csv`
- `corpus/derived/seed-catalog/manual-review.csv`
- `corpus/derived/seed-catalog/excluded.csv`
- `corpus/derived/seed-catalog/README.md`
- `corpus/exports/seed-catalog-summary.json`

## Current seed-catalog totals

- 32,363 accepted plant families used as input
- 103 curated seed-ready families
- 54 supporting families
- 25,924 review families
- 6,282 excluded noise families

Current seed-catalog class counts:

- 13 `culinary-medicinal-plant`
- 90 `medicinal-herb`
- 39 `plant-material`
- 7 `derived-substance`
- 8 `broad-plant-class`
- 2,861 `ambiguous-plant-name`
- 23,059 `candidate-specific-family`
- 4 `historical-ocr-term`
- 6,282 `noise-fragment`

## Why this matters

This is the first genuinely database-shaped shortlist in the corpus:

- small enough to inspect
- conservative enough to trust more than the raw term layer
- still traceable back to source passages
- compatible with a Corpus Memory semantic archive

The seed-ready shortlist now includes obvious families such as:

- `lemon`
- `chamomile`
- `senna`
- `ginger`
- `lavender`
- `fennel`
- `buckthorn`
- `parsley`
- `nettle`
- `wild cherry`

## Important design choice

This layer is intentionally not trying to solve full botanical authority in one pass.

Instead it does three useful things:

1. promotes a small explicit shortlist of high-confidence herb families
2. preserves supporting plant materials and broader classes without mixing them into the first shortlist
3. pushes ambiguous, descriptor-led, and OCR-shaped families into review instead of pretending they are clean herb identities

That trade-off is deliberate. It gives us a usable first seed while preserving the much larger candidate space for later expansion.

## Recommended next move

Expand the curated seed shortlist in controlled batches:

1. review the highest-frequency `candidate-specific-family` rows
2. promote clear plant identities into the shortlist
3. add synonym resolution and historical-spelling recovery for older OCR forms
4. attach passage-level claims, cautions, and preparation evidence to each promoted family
