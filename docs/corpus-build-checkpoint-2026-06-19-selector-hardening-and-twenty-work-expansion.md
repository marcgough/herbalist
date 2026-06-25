# Corpus Build Checkpoint - 2026-06-19 Selector Hardening and Twenty-Work Expansion

Date: 2026-06-19

## What changed

This pass pushed the corpus forward in three ways:

1. A reusable curated-reference selector was added so discovered official-lane works can be ranked more deliberately before acquisition.
2. Twenty additional rights-cleared works were acquired locally from the existing no-key lanes.
3. The derived layers and the separate `Corpus Memory` archive were refreshed from the expanded corpus state.

## New selector

New file:

- `scripts/corpus/select-curated-reference-candidates.mjs`

New package script:

- `npm run corpus:select-reference`

The selector now:

- boosts practical reference shapes such as dispensatories, pharmacopoeias, materia medica, medicinal plants, medical botany, flora, dictionaries, manuals, and pharmacognosy
- penalizes low-value shapes such as lectures, addresses, proceedings, circulars, reports, diaries, examinations, catalogues, narrow administrative pamphlets, and repetitive household-general witnesses
- deduplicates both edition-family repeats and broader title-series repeats so one intake slice does not get wasted on near-clone witnesses
- writes review outputs to:
  - `corpus/review/curated-reference-selector/candidates.csv`
  - `corpus/review/curated-reference-selector/nlm-digital-collections.txt`
  - `corpus/review/curated-reference-selector/wellcome-collection.txt`
  - `corpus/exports/curated-reference-selector-summary.json`

## New works acquired in this pass

### NLM Digital Collections

- `nlm-101602779` - `The American dispensatory`
- `nlm-2574015R` - `The American new dispensatory`
- `nlm-61631000RX2` - `The family flora and materia medica botanica`
- `nlm-2547021R` - `The domestic physician`
- `nlm-101307564` - `New, old, and forgotten remedies`
- `nlm-61620650R` - `The improved practice of medicine`
- `nlm-61660440R` - `A synopsis of the vegetable materia medica of the United States`
- `nlm-2449056RX1` - `The botanical family physician`
- `nlm-2661459RX1` - `The New England dispensatory`
- `nlm-2751057R` - `The new dispensatory`

### Wellcome Collection

- `wellcome-dz26ymj8` - `The complete herbalist`
- `wellcome-ujbsp48n` - `The herbal, or, General history of plants`
- `wellcome-wg4y3uv4` - `A modern herbal`
- `wellcome-tbt9dxgq` - `A manual of pharmacodynamics`
- `wellcome-w6wxy8cw` - `The Indian and colonial addendum to the British pharmacopoeia`
- `wellcome-dwk6bbmw` - `A manual of materia medica and therapeutics`
- `wellcome-dgu7rvn6` - `The American dispensatory`
- `wellcome-q2wyzrpj` - `The medicinal plants of the Philippines`
- `wellcome-w35k6ghm` - `A handbook of some South Indian grasses`
- `wellcome-km7hbr3x` - `Flora medica`

All 20 processed successfully with no new failures.

## Verified corpus state after this pass

- registered works: 2,720
- chunked works: 1,038
- discovered works still queued: 1,680
- failed works: 2
- chunk records: 1,290,066
- paragraph records: 1,481,020

Collection mix:

- Project Gutenberg: 27 chunked of 27 total
- NLM Digital Collections: 348 chunked of 696 total
- Wellcome Collection: 663 chunked of 1,997 total

Derived layers after rebuild:

- edition families: 1,866
- multi-work families: 411
- actionable frontier families: 1,099
- uncovered frontier families: 1,009
- depth frontier families: 209
- herb candidates: 71,875
- high-confidence herb candidates: 4,637
- accepted term families: 67,109
- seed-ready herb families: 124
- supporting families: 123
- total seed-review families: 53,574
- promotion candidates: 92
- identity-review candidates: 24
- secondary candidates: 49,872
- deprioritized candidates: 3,586
- thin-work review flags: 140

Local corpus footprint:

- 8,911 files
- 8.82 GB

## Corpus Memory refresh

The separated `Corpus Memory` archive was brought back into sync with the refreshed corpus.

Verified local service state:

- base URL: `http://127.0.0.1:8766`
- total documents: 3,028
- `edition-family`: 1,866
- `work-summary`: 1,038
- `herb-profile`: 124

Verification checks completed:

- HTTP stats endpoint returned the expected counts
- semantic query check for `flora medica` returned the newly indexed `wellcome-km7hbr3x` work summary

## Notes

The refreshed frontier still contains some low-value domestic-medicine and administrative noise high in the generic ranking. The new selector gives us a calmer path forward because it lets us keep using the broad official discovery pool without blindly trusting the raw frontier score.

## Recommended next action

Use the selector-driven review files for the next acquisition wave and keep biasing toward:

- herbals and materia medica references
- dispensatories and pharmacopoeia commentary with practical value
- medical botany and medicinal-plant references
- country- or region-specific plant manuals that still read as real book-scale references
