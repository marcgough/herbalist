# Herbalisti Corpus Build Checkpoint

Date: 2026-06-18

## Objective

Keep growing the local Herbalisti corpus from official no-key lanes while improving the frontier so semantically thin witness shapes stop taking space away from stronger books.

## What changed

### 1. The frontier ranking and batch selection were hardened again

Updated scripts:

- `scripts/corpus/build-acquisition-frontier.mjs`
- `scripts/corpus/run-frontier-batch.mjs`

New or stronger penalties now target:

- exam-style tables and assistant plates
- general lecture-form witnesses
- committee-report and petition witnesses
- specification and patent-style records
- polemical empiric/quackery framing
- veterinary-only framing in otherwise relevant-looking records

Why that matters:

- the corpus is already large enough that poor frontier choices have a real opportunity cost
- these penalties preserve breadth while giving more of the next batch budget to books that will actually help search, chat, and herb retrieval later

### 2. A new tuned frontier batch was completed successfully

Live batch mix:

- 4 NLM works
- 10 Wellcome works

All 14 selected works completed successfully and were reconciled back into the registry as `chunked`.

Representative additions:

- `A comprehensive medical dictionary`
- `The nurse, or, Hints on the care of the sick`
- `Shelton's American medicine`
- `Pharmacologia`
- `The book of herbs`
- `The family doctor`
- `The Philadelphia medical dictionary`
- `A guide to health through the various stages of life`

### 3. The derived archive was rebuilt immediately after the batch

The live run rebuilt:

- edition families
- acquisition frontier
- evidence layer
- term families
- seed catalog
- herb profiles
- status summary

So the totals below are from the current live archive, not from a partial ingest state.

## Current totals after this pass

Corpus totals now:

- 2,720 registered works
- 661 locally acquired and chunked works
- 2,058 discovered works still queued
- 1 failed work
- 896,104 total chunk records
- 1,045,529 total paragraph records

Collection mix now:

- 27 Project Gutenberg works
- 224 NLM Digital Collections works
- 410 Wellcome Collection works

Batch delta versus the prior verified state:

- +14 chunked works
- -14 discovered works
- +16,335 chunk records
- +17,646 paragraph records

By collection:

- NLM: +4 works, +2,307 chunk records, +3,035 paragraph records
- Wellcome: +10 works, +14,028 chunk records, +14,611 paragraph records

## Semantic-layer changes after the rebuild

Acquisition frontier:

- 1,472 actionable title families remain
- 1,380 uncovered families
- 144 depth families
- 0 failed-only families

This is a meaningful tightening from the previously verified 1,509-family frontier, and part of that reduction comes from the stronger filtering of thin witness shapes.

Evidence layer:

- 701,564 chunk-signal records
- 52,501 herb candidates
- 3,220 high-confidence herb candidates
- 14,893 medium-confidence herb candidates
- 34,388 low-confidence herb candidates
- 52,569 graph nodes
- 302,686 graph edges

Delta versus the prior verified state:

- +9,491 chunk-signal records
- +556 herb candidates
- +49 high-confidence herb candidates
- +164 medium-confidence herb candidates
- +343 low-confidence herb candidates
- +556 graph nodes
- +3,588 graph edges

Term-family layer:

- 51,703 canonical families
- 48,892 accepted families
- 48,644 accepted plant families
- 248 accepted broader materia medica families
- 32 review families
- 2,779 rejected families

Seed-catalog layer:

- 48,644 accepted plant families as input
- 39 curator decision rows applied
- 8 aliased catalog families
- 125 seed-ready families
- 81 supporting families
- 38,867 review families
- 9,561 excluded noise families

Herb-profile layer:

- 125 herb profiles
- 125 profiles with preparation signals
- 125 profiles with condition signals
- 125 profiles with caution signals
- 125 profiles with plant-part signals
- 61,285 matched profile chunks

That is an increase of 767 matched profile chunks while keeping the curated public herb layer stable at 125 entries.

## Verification

Verified all 14 selected work IDs are now `chunked` in:

- `corpus/registry/works.csv`

Verified the rebuilt archive summaries in:

- `corpus/exports/frontier-batch-summary.json`
- `corpus/exports/acquisition-frontier-summary.json`
- `corpus/exports/corpus-evidence-summary.json`
- `corpus/exports/seed-catalog-summary.json`
- `corpus/exports/herb-profile-summary.json`

Spot-checked deeper promoted herb profiles:

- `Aconite` now shows 336 matched chunks across 90 works
- `Spearmint` now shows 226 matched chunks across 79 works
- `Plantain (Plantago)` now shows 191 matched chunks across 112 works
- `Yarrow` now shows 72 matched chunks across 35 works

## Why this matters

This pass improved both the archive and the acquisition discipline:

1. it added 14 more rights-cleared local works from the approved no-key lanes
2. it made the frontier meaningfully less willing to spend future batch budget on thin, fragmentary, or administrative material

That combination is exactly what we want now: larger corpus, better evidence density, and smarter next picks.

## Files updated or regenerated

- `scripts/corpus/build-acquisition-frontier.mjs`
- `scripts/corpus/run-frontier-batch.mjs`
- `corpus/registry/works.csv`
- `corpus/exports/frontier-batch-summary.json`
- `corpus/exports/acquisition-frontier-summary.json`
- `corpus/exports/corpus-evidence-summary.json`
- `corpus/exports/seed-catalog-summary.json`
- `corpus/exports/herb-profile-summary.json`
- `corpus/derived/`

## Recommended next move

1. continue another bounded frontier batch from the improved 1,472-family frontier
2. add one more ranking pass for essay-like, literary, and weak pseudo-medical title shapes such as `Physic a-field`
3. keep the curated 125-herb public layer stable while the archive and profile depth continue compounding underneath it
