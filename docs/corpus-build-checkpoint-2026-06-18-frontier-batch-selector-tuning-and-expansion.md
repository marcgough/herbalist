# Herbalisti Corpus Build Checkpoint

Date: 2026-06-18

## Objective

Continue growing the local Herbalisti book corpus from official no-key sources while keeping the acquisition lane biased toward book-like practical references instead of administrative or fragmentary material.

## What changed

### 1. The frontier selector was tightened before the next live batch

Updated script:

- `scripts/corpus/run-frontier-batch.mjs`

New penalty signals were added for:

- opening-session or college-opening addresses
- faculty-and-citizen event framing
- chapter-extract and additional-chapter witnesses

Why that mattered:

- the broad frontier still contains many legally usable but semantically weaker records
- these penalties keep the live acquisition pass closer to whole references, manuals, dictionaries, pharmacopoeias, and domestic medicine works

This was a selector-quality improvement, not a change to source policy.

### 2. A new bounded frontier batch was completed from official no-key lanes

Live batch mix:

- 4 NLM works
- 10 Wellcome works

All 14 selected works finished successfully and were reconciled back into the registry as `chunked`.

Representative additions:

- `An epitome of the American eclectic practice of medicine...`
- `The family physician, consumptives guide to health and lady's medical companion`
- `The home nurse and nursery`
- `Encyclopedia of health and home` (Volume 2)
- `Lexicon-medicum`
- `Medical reform, or, Physiology and botanic practice for the people`
- `Royle's manual of materia medica and therapeutics`
- `The Family physician`
- `A botanical materia medica`
- `Pharmacopoeia Edinburgensis`

### 3. The derived archive layers were rebuilt immediately after acquisition

The batch then reran:

- edition families
- acquisition frontier
- evidence layer
- term families
- seed catalog
- herb profiles
- corpus status summary

That means the archive state below reflects the current live corpus, not a partial ingest state.

## Current totals after this pass

Corpus totals now:

- 2,720 registered works
- 647 locally acquired and chunked works
- 2,072 discovered works still queued
- 1 failed work
- 879,769 total chunk records
- 1,027,883 total paragraph records

Collection mix now:

- 27 Project Gutenberg works
- 220 NLM Digital Collections works
- 400 Wellcome Collection works

Batch delta:

- +14 chunked works
- -14 discovered works
- +24,199 chunk records
- +24,993 paragraph records

By collection:

- NLM: +4 works, +2,690 chunk records, +3,241 paragraph records
- Wellcome: +10 works, +21,509 chunk records, +21,752 paragraph records

## Semantic-layer changes after the rebuild

Acquisition frontier:

- 1,509 actionable title families remain
- 1,394 uncovered families
- 140 depth families
- 0 failed-only families

Evidence layer:

- 692,073 chunk-signal records
- 51,945 herb candidates
- 3,171 high-confidence herb candidates
- 14,729 medium-confidence herb candidates
- 34,045 low-confidence herb candidates
- 52,013 graph nodes
- 299,098 graph edges

Delta versus the prior verified state:

- +18,155 chunk-signal records
- +792 herb candidates
- +76 high-confidence herb candidates
- +284 medium-confidence herb candidates
- +432 low-confidence herb candidates
- +792 graph nodes
- +4,235 graph edges

Term-family layer:

- 51,164 canonical families
- 48,370 accepted families
- 48,124 accepted plant families
- 246 accepted broader materia medica families
- 32 review families
- 2,762 rejected families

Seed-catalog layer:

- 48,124 accepted plant families as input
- 39 curator decision rows applied
- 8 aliased catalog families
- 125 seed-ready families
- 81 supporting families
- 38,424 review families
- 9,484 excluded noise families

Note:

The supporting-family count dipped from 82 to 81 during this broader rebuild because the plant-material lane compressed by one family. The manual supporting overrides remain present, including `Catechu`, `Camphorated`, and `Vinegar`.

Herb-profile layer:

- 125 herb profiles
- 125 profiles with preparation signals
- 125 profiles with condition signals
- 125 profiles with caution signals
- 125 profiles with plant-part signals
- 60,518 matched profile chunks

That is an increase of 1,195 matched profile chunks while holding the curated public herb set stable at 125 entries.

## Verification

Verified all 14 selected work IDs are now `chunked` in:

- `corpus/registry/works.csv`

Verified the rebuilt semantic layers in:

- `corpus/exports/frontier-batch-summary.json`
- `corpus/exports/acquisition-frontier-summary.json`
- `corpus/exports/corpus-evidence-summary.json`
- `corpus/exports/seed-catalog-summary.json`
- `corpus/exports/herb-profile-summary.json`

Spot-checked current profile deepening for promoted herb entries:

- `Aconite` now shows 327 matched chunks across 89 works
- `Spearmint` now shows 226 matched chunks across 79 works
- `Plantain (Plantago)` now shows 190 matched chunks across 111 works

## Why this matters

This pass improved the archive in two ways at once:

1. it added 14 more rights-cleared books locally from approved no-key lanes
2. it improved the acquisition selector so future batch quality stays higher as the frontier gets noisier

That is the right shape of progress for Herbalisti: broader source coverage, better retrieval density, and tighter archive discipline.

## Files updated or regenerated

- `scripts/corpus/run-frontier-batch.mjs`
- `corpus/registry/works.csv`
- `corpus/exports/frontier-batch-summary.json`
- `corpus/exports/acquisition-frontier-summary.json`
- `corpus/exports/corpus-evidence-summary.json`
- `corpus/exports/seed-catalog-summary.json`
- `corpus/exports/herb-profile-summary.json`
- `corpus/derived/`

## Recommended next move

1. continue another bounded frontier batch, again leaning slightly toward the stronger Wellcome lane while NLM remains more mixed
2. extend the selector penalties one step further for explicit examination tables, assistant plates, and similarly thin reference fragments that still appear in the raw frontier rankings
3. keep the curated 125-herb public layer stable for now while the underlying corpus and profile depth continue to compound
