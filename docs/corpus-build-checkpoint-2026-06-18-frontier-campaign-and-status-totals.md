# Herbalisti Corpus Build Checkpoint

Date: 2026-06-18

## Objective

Increase the rate of rights-cleared book acquisition without relaxing the current source rules, and make corpus status reporting authoritative enough that future checkpoints can be generated directly from the archive.

This pass stayed inside the locked scope:

- books only
- no web scraping
- no API-key-dependent sources
- official or clearly rights-cleared source lanes only

## What changed

### 1. A multi-cycle frontier campaign runner is now live

New script:

- `scripts/corpus/run-frontier-campaign.mjs`

New package command:

- `npm run corpus:frontier-campaign`

This sits above the existing single-pass frontier batch runner and:

- loops official-source frontier acquisition across multiple cycles
- records pre- and post-cycle corpus snapshots
- preserves per-cycle deltas in chunked works, discovered works, and chunk totals
- captures representative selected titles by collection
- writes a compact run log to `corpus/exports/frontier-campaign-summary.json`

This is useful because the corpus no longer depends on one manual batch at a time. We now have a measured campaign tool for broadening the archive while keeping each pass auditable.

### 2. Corpus status now includes manifest-backed chunk totals

`scripts/corpus/lib.mjs` now exposes:

- `summarizeManifestArchive()`

It walks the local per-work manifests and computes authoritative totals for:

- chunked work count
- total chunk records
- total paragraph records
- per-collection chunk and paragraph counts

`scripts/corpus/report-status.mjs` now includes those values directly, so the archive can report its own local scale without a separate one-off tally.

## Live campaign run completed

Executed:

- `node scripts/corpus/run-frontier-campaign.mjs --cycles=2 --nlm-limit=6 --wellcome-limit=8`

Result:

- 2 cycles completed
- 28 additional works acquired and chunked
- 0 new source failures

The remaining failed registry item is still the older NLM OCR outlier:

- `nlm-101139425`

### Cycle 1

- 6 NLM works
- 8 Wellcome works
- 14 new chunked works
- 19,018 additional chunk records

Representative additions:

- `The University guide to health`
- `A compend of domestic midwifery`
- `The London dispensatory`
- `The physical dictionary`
- `Remarks on the uses of some of the bazaar medicines and common medical plants of India`

### Cycle 2

- 6 NLM works
- 8 Wellcome works
- 14 new chunked works
- 14,349 additional chunk records

Representative additions:

- `The home physician and guide to health`
- `The botanic physician`
- `The American vegetable practice`
- `Flora medica`
- `Domestic medicine : plain and brief directions for the treatment requisite before advice can be obtained`

## Current authoritative corpus totals

After the campaign:

- 2,720 registered works
- 577 locally acquired and chunked works
- 2,142 discovered works still queued
- 1 failed work
- 788,883 total chunk records
- 930,832 total paragraph records

Current collection mix:

- 27 Project Gutenberg works / 14,221 chunks
- 358 Wellcome works / 539,665 chunks
- 192 NLM works / 234,997 chunks

## Current semantic layer totals

### Acquisition frontier

- 1,561 actionable title families
- 1,464 uncovered families
- 116 depth families
- 0 failed-only families

Remaining collection candidates:

- NLM: 333
- Wellcome: 1,228

### Evidence layer

- 623,134 chunk-signal records
- 47,641 herb candidates
- 2,873 high-confidence herb candidates
- 13,636 medium-confidence herb candidates
- 31,132 low-confidence herb candidates
- 47,709 graph nodes
- 274,937 graph edges

### Term-family layer

- 46,922 canonical families
- 44,297 accepted families
- 44,080 accepted plant families
- 217 accepted broader materia medica families
- 32 review families
- 2,593 rejected families

### Seed-catalog layer

- 112 seed-ready families
- 80 supporting families
- 35,246 review families
- 8,640 excluded noise families

### Herb-profile layer

- 112 herb profiles
- 51,602 matched chunks
- all 112 profiles still have preparation, condition, caution, and plant-part signals

Largest current profile envelopes still include:

- `Lemon`
- `Chamomile`
- `Senna`
- `Castor`
- `Olive`
- `Rose`

## Why this matters

This pass improved both throughput and trustworthiness.

Throughput improved because the corpus can now be expanded in controlled multi-cycle campaigns rather than isolated manual batches.

Trustworthiness improved because the archive now reports chunk totals directly from local manifests, which makes future checkpointing, review, and later product wiring much less fragile.

## Recommended next move

1. keep using the campaign runner for moderate uncovered-family passes while the frontier is still this broad
2. add a curator-facing review lane for depth-family and repeated-series material so later campaign runs can stay broad without drifting toward low-value duplicates
3. begin a second semantic archive envelope for non-herb entries such as preparations, substances, and materia medica classes so retrieval can expand beyond the first 112 herb profiles
