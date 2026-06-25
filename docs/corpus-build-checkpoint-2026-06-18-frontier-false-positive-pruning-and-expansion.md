# Herbalisti Corpus Build Checkpoint

Date: 2026-06-18

## Objective

Keep growing the local Herbalisti corpus from official no-key lanes while pruning title-level false positives that were still leaking into the acquisition frontier.

## What changed

### 1. The frontier was hardened against another layer of noisy witness shapes

Updated scripts:

- `scripts/corpus/build-acquisition-frontier.mjs`
- `scripts/corpus/run-frontier-batch.mjs`

New suppression or penalty shapes added in this pass:

- `Physic a-field` / Charles Dickens false-positive witnesses
- lecture-derived fragments such as `two lectures delivered before ...` and `lecture introductory to a course`
- `manual of examinations` and quiz-compend/student-prep witnesses
- `additional chapter to ...` and chapter-extract witnesses
- sex-debility and excessive-venery guide variants
- extract-catalogue shapes such as `descriptive catalogue of ... fluid and solid extracts`
- the stray `The famous bird that speaks one word` record that had been misclassified into the herbal lane

Why this mattered:

- the previous frontier was much better than earlier versions, but a few clearly misaligned works were still rising high enough to distort diversity-aware batch selection
- after this tightening pass, the actionable frontier dropped from 1,472 to 1,453 families before the next live acquisition batch, which confirmed that the new rules were removing real noise rather than only shuffling order

### 2. A new tuned frontier batch was completed successfully

Live batch mix:

- 4 NLM works
- 10 Wellcome works

All 14 selected works completed successfully and were reconciled into the registry as `chunked`.

Selected acquisitions:

#### NLM Digital Collections

- `nlm-101573469` - `Quincy's Lexicon-medicum`
- `nlm-63360800RX1` - `The American cyclopaedia of domestic medicine and household surgery`
- `nlm-101250099` - `The old root and herb doctor, or, the Indian method of healing`
- `nlm-9435889` - `The family physician and the farmer's companion`

#### Wellcome Collection

- `wellcome-x76f7xv8` - `The Philadelphia medical dictionary`
- `wellcome-nmp77q5d` - `The garden of health`
- `wellcome-jvxsxf58` - `A guide to health`
- `wellcome-vpb463s2` - `The Edinburgh new dispensatory`
- `wellcome-jmh3m2rt` - `A cyclopedia of domestic medicine and surgery`
- `wellcome-jh6tg6kz` - `On dermatology and the treatment of skin diseases by means of herbs in place of arsenic and mercury`
- `wellcome-gfdnm2ke` - `Pharmacopoeia Collegii Regalis Medicorum Londinensis. MDCCCIX.`
- `wellcome-u2a88frg` - `A contribution to South African materia medica`
- `wellcome-rt52bskh` - `The American vegetable practice`
- `wellcome-wsy88uka` - `Vitalogy`

### 3. The derived semantic archive was rebuilt immediately after acquisition

The live run rebuilt:

- edition families
- acquisition frontier
- evidence layer
- term families
- seed catalog
- herb profiles
- status summary

## Current totals after this pass

Corpus totals now:

- 2,720 registered works
- 675 locally acquired and chunked works
- 2,044 discovered works still queued
- 1 failed work
- 911,435 total chunk records
- 1,061,166 total paragraph records

Collection mix now:

- 27 Project Gutenberg works
- 228 NLM Digital Collections works
- 420 Wellcome Collection works

Batch delta versus the prior verified state:

- +14 chunked works
- -14 discovered works
- +15,331 chunk records
- +15,637 paragraph records

By collection:

- NLM: +4 works, +1,754 chunk records, +1,830 paragraph records
- Wellcome: +10 works, +13,577 chunk records, +13,807 paragraph records

## Semantic-layer totals after the rebuild

Acquisition frontier:

- 1,442 actionable title families remain
- 1,366 uncovered families
- 147 depth families
- 0 failed-only families
- 1,624 discovered works still sit in uncovered families
- 420 discovered works still sit in already represented families

Collection worklist balance:

- NLM: 293 total frontier candidates remaining, 262 uncovered and 31 depth
- Wellcome: 1,149 total frontier candidates remaining, 1,036 uncovered and 113 depth

Evidence layer:

- 713,581 chunk-signal records
- 53,132 herb candidates
- 3,272 high-confidence herb candidates
- 15,132 medium-confidence herb candidates
- 34,728 low-confidence herb candidates
- 53,200 graph nodes
- 306,402 graph edges

Delta versus the prior verified state:

- +12,017 chunk-signal records
- +631 herb candidates
- +52 high-confidence herb candidates
- +239 medium-confidence herb candidates
- +340 low-confidence herb candidates
- +631 graph nodes
- +3,716 graph edges

Term-family layer:

- 52,320 canonical families
- 49,490 accepted families
- 49,237 accepted plant families
- 253 accepted broader materia medica families
- 32 review families
- 2,798 rejected families

Seed-catalog layer:

- 49,237 accepted plant families as input
- 39 curator decision rows applied
- 8 aliased catalog families
- 125 seed-ready families
- 83 supporting families
- 39,357 review families
- 9,662 excluded noise families

Herb-profile layer:

- 125 herb profiles
- 62,704 matched profile chunks

That is an increase of 1,419 matched profile chunks while keeping the curated public herb layer stable at 125 entries.

## Verification

Verified all 14 selected work IDs are now `chunked` in:

- `corpus/registry/works.csv`

Verified the rebuilt archive summaries in:

- `corpus/exports/frontier-batch-summary.json`
- `corpus/exports/acquisition-frontier-summary.json`
- `corpus/exports/corpus-evidence-summary.json`
- `corpus/exports/term-family-summary.json`
- `corpus/exports/seed-catalog-summary.json`
- `corpus/exports/herb-profile-summary.json`

Spot-checked deeper promoted herb profiles:

- `Aconite` now shows 339 matched chunks across 93 works
- `Spearmint` now shows 232 matched chunks across 81 works
- `Plantain (Plantago)` remains at 191 across 112 works
- `Witch Hazel` now shows 105 matched chunks across 47 works
- `Yarrow` remains at 72 across 35 works

## Why this matters

This pass improved two different parts of the corpus pipeline at once:

1. the archive itself got larger by another 14 rights-cleared local works from the approved no-key lanes
2. the frontier became less willing to spend future batch budget on obvious false positives and thin witness shapes

That combination is the right direction for Herbalisti: broader archive, denser evidence, and a cleaner acquisition queue.

## Files updated or regenerated

- `scripts/corpus/build-acquisition-frontier.mjs`
- `scripts/corpus/run-frontier-batch.mjs`
- `corpus/registry/works.csv`
- `corpus/exports/frontier-batch-summary.json`
- `corpus/exports/acquisition-frontier-summary.json`
- `corpus/exports/corpus-evidence-summary.json`
- `corpus/exports/term-family-summary.json`
- `corpus/exports/seed-catalog-summary.json`
- `corpus/exports/herb-profile-summary.json`
- `corpus/derived/`

## Recommended next move

1. continue another bounded frontier batch from the improved 1,442-family frontier
2. add one more ranking pass for geographic travel or spa-guide shapes such as `health resorts` and other broad lifestyle/travel witnesses that are still surfacing in the upper frontier
3. keep the curated 125-herb public layer stable while the archive and profile depth continue compounding underneath it
