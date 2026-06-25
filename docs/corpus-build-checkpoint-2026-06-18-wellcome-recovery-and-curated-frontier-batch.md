# Herbalisti Corpus Build Checkpoint

Date: 2026-06-18

## Objective

Recover the interrupted Wellcome slice from the prior frontier run, refresh the semantic layers, then keep the archive moving with one more bounded book-first batch.

## What changed

### 1. The failed Wellcome recovery landed cleanly

Re-ran the eight previously failed Wellcome work IDs through the official recovery path already built into `scripts/corpus/build-wellcome-corpus.mjs`.

Recovered works:

- `wellcome-bfdgn7dd`
- `wellcome-ptecscrf`
- `wellcome-f84un7ym`
- `wellcome-r74qsznp`
- `wellcome-qq92892e`
- `wellcome-eqspnywg`
- `wellcome-vap2a7m4`
- `wellcome-rzxh3ted`

Result:

- 8 of 8 recovered successfully
- Wellcome failure queue returned to zero
- archive state moved from the interrupted partial batch to a clean 689-work corpus before the next expansion step

### 2. The derived corpus layers were rebuilt immediately after recovery

Refreshed:

- edition families
- acquisition frontier
- evidence layer
- term families
- seed catalog
- herb profiles
- status summary

That put the archive back into a trustworthy semantic state before taking another live acquisition slice.

### 3. One more curated uncovered-family batch was completed successfully

Ran one additional bounded live batch with manual exclusions for a handful of obvious duplicate or low-value witnesses that were still surfacing near the top of the frontier.

Batch mix:

- 4 NLM works
- 10 Wellcome works

All 14 selected works completed successfully and were reconciled back into the registry as `chunked`.

Representative additions:

- `A hand-book of materia medica and therapeutics`
- `The practical herbalist, or, Health versus disease`
- `Gunn's New domestic physician, or, Home book of health`
- `The American vegetable practice`
- `Homoepathic domestic medicine`
- `A laboratory course of pharmacy and materia medica`
- `Medical admonitions addressed to families`
- `A new and compleat body of practical botanic physic`
- `A manual of medical treatment or clinical therapeutics`
- `A translation of the Pharmacopoeia of the Royal College of Physicians of London, 1836`

## Current totals after this pass

Corpus totals now:

- 2,720 registered works
- 703 locally acquired and chunked works
- 2,016 discovered works still queued
- 1 failed work
- 947,237 total chunk records
- 1,100,571 total paragraph records

Collection mix now:

- 27 Project Gutenberg works
- 236 NLM Digital Collections works
- 440 Wellcome Collection works

Net change versus the last stable 675-work checkpoint:

- +28 chunked works
- -28 discovered works
- +35,802 chunk records
- +39,405 paragraph records

Net change from the post-recovery 689-work state:

- +14 chunked works
- -14 discovered works
- +15,698 chunk records
- +17,355 paragraph records

## Semantic-layer totals after the rebuild

Acquisition frontier:

- 1,419 actionable title families remain
- 1,338 uncovered families
- 158 depth families
- 0 failed-only families
- 286 current NLM frontier candidates
- 1,133 current Wellcome frontier candidates

Evidence layer:

- 740,329 chunk-signal records
- 54,420 herb candidates
- 3,389 high-confidence herb candidates
- 15,425 medium-confidence herb candidates
- 35,606 low-confidence herb candidates
- 54,488 graph nodes
- 314,694 graph edges

Term-family layer:

- 53,587 canonical families
- 50,696 accepted families
- 50,429 accepted plant families
- 267 accepted broader materia medica families
- 32 review families
- 2,859 rejected families

Seed-catalog layer:

- 125 seed-ready families
- 83 supporting families
- 40,357 review families
- 9,854 excluded noise families
- 39 curator decision rows
- 8 aliased catalog families

Herb-profile layer:

- 125 herb profiles
- 125 profiles with preparation signals
- 125 profiles with condition signals
- 125 profiles with caution signals
- 125 profiles with plant-part signals
- 65,630 matched profile chunks

## Verification

Verified:

- the 8 recovered Wellcome work IDs are now `chunked`
- the later 14-work frontier batch finished with `0` NLM failures and `0` Wellcome failures
- all 14 selected IDs from that batch are now `chunked` in `corpus/registry/works.csv`

The only remaining failed registry row is still:

- `nlm-101139425` - `Institutiones medicinae et miscellanea medica, etc`

## Why this matters

This pass did two useful things together:

1. it repaired an interrupted official-source acquisition pass instead of leaving false failure residue in the archive
2. it kept the corpus moving forward with another 14 book-like works after trimming obvious duplicate and weak frontier witnesses out of the way

That means the archive is both broader and cleaner than it was at the start of the turn.

## Files updated or regenerated

- `scripts/corpus/build-acquisition-frontier.mjs`
- `scripts/corpus/run-frontier-batch.mjs`
- `corpus/registry/works.csv`
- `corpus/exports/wellcome-corpus-summary.json`
- `corpus/exports/frontier-batch-summary.json`
- `corpus/exports/acquisition-frontier-summary.json`
- `corpus/exports/corpus-evidence-summary.json`
- `corpus/exports/term-family-summary.json`
- `corpus/exports/seed-catalog-summary.json`
- `corpus/exports/herb-profile-summary.json`
- `corpus/derived/`

## Recommended next move

1. formalize a small persistent exclusion memory for obvious near-copy repeats so the next batches need less manual steering
2. continue another bounded uncovered-family batch from the tightened 1,419-family frontier
3. revisit the single remaining NLM outlier only after the broader no-key book frontier has moved further down
