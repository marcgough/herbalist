# Herbalisti Corpus Build Checkpoint

Date: 2026-06-17

## Objective

Keep the Herbalisti corpus moving breadth-first under the locked rules:

- rights-cleared books only
- no web scraping
- no API-key-dependent sources
- local acquisition first
- semantic archive structure that can later power retrieval, search, and chat

## Batch acquired

Processed: 12

Failures: 0

### NLM Digital Collections

Processed: 6

- `nlm-61741140R` - `Manual of materia medica & therapeutics`
- `nlm-9711165` - `The gentleman's medical adviser, and sure guide to health and long life`
- `nlm-2561025R` - `The Edinburgh new dispensatory ...`
- `nlm-101651492` - `A treatise on therapeutics`
- `nlm-101760486` - `Medical botany and chemistry`
- `nlm-2574039R` - `The family physician : or, Domestic medical friend`

### Wellcome Collection

Processed: 6

- `wellcome-ctkumbc4` - `A new supplement to the pharmacopoeias of London, Edinburgh, Dublin, and Paris`
- `wellcome-dw4f7fkd` - `The London dispensatory`
- `wellcome-eajytywz` - `A guide to health`
- `wellcome-hsv3uurf` - `Hints and remedies for the treatment of common accidents and diseases`
- `wellcome-m6sypr27` - `The "Winged Lion" receipt book`
- `wellcome-rsr86f4e` - `The catechism of health`

## Archive improvements

Two local archive-management tools were added:

1. `npm run corpus:query`
   - searches work metadata, herb candidates, and chunked passages
   - supports `works`, `herbs`, `chunks`, and `all` scopes
   - supports optional collection, topic, and work filters

2. `npm run corpus:reconcile`
   - repairs registry state from authoritative local manifests
   - promotes rows to `chunked` when local manifests already exist
   - useful after interrupted runs or conflicting writes

## Operational note

This batch exposed an important registry-write hazard:

- NLM and Wellcome acquisition commands should not be run in parallel when both write `corpus/registry/works.csv`
- a parallel write race left six Wellcome rows stale even though the local manifests and chunk files existed
- `corpus:reconcile` repaired those rows from the local archive
- the edition-family and acquisition-frontier layers were then rebuilt so recommendations matched the repaired registry

## Current corpus totals after the batch and repair

- 2,720 registered works
- 443 locally acquired and chunked works
- 2,277 discovered works still queued
- 0 failed works remaining overall

Current chunked works by collection:

- 27 Project Gutenberg works
- 284 Wellcome Collection works
- 132 NLM Digital Collections works

Current chunk totals from disk:

- 630,032 total chunk records
- 14,221 Project Gutenberg chunks
- 434,558 Wellcome chunks
- 181,253 NLM chunks

## Current frontier state after rebuild

- 1,650 actionable family recommendations remain
- 1,598 uncovered families remain
- 52 depth families remain
- 0 failed-only families remain
- 2,039 discovered works still sit in uncovered families

Collection worklist balance:

- NLM: 391 frontier candidates remaining
- Wellcome: 1,259 frontier candidates remaining

## Current semantic totals after refresh

Evidence layer:

- 437 chunked works
- 495,891 chunk-signal records
- 39,073 herb candidates
- 2,173 high-confidence herb candidates
- 11,824 medium-confidence herb candidates
- 25,076 low-confidence herb candidates
- 39,141 graph nodes
- 218,224 graph edges

Term-family layer:

- 38,539 canonical families
- 36,336 accepted families
- 36,208 accepted plant-like families
- 128 accepted broader materia medica families
- 31 review families
- 2,172 rejected families

Seed-catalog layer:

- 103 curated seed-ready families
- 60 supporting families
- 29,016 review families
- 7,029 excluded noise families

## Why this matters

This step improved the corpus in three useful ways at once:

1. it increased local book coverage in practical domestic health, pharmacopoeia, therapeutics, hygiene, and herbal remedy literature
2. it added an immediate retrieval surface so we can interrogate the archive before the website layer exists
3. it hardened the archive against registry drift by adding a manifest-to-registry reconciliation path

## Recommended next move

1. continue sequential frontier-guided acquisition, not parallel registry writers
2. prioritize the next NLM uncovered domestic-medicine families now at the top of the frontier
3. keep alternating collection growth with archive hardening so the corpus scales without bookkeeping drift
