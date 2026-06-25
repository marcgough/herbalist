# Herbalisti Corpus Build Checkpoint

Date: 2026-06-18

## Objective

Harden the family-aware frontier so repeated edition-series witnesses stop crowding out better candidates, then complete one more bounded official-source acquisition batch and rebuild the semantic archive.

## What changed

### 1. The frontier now cools saturated series across the whole archive

Hardened both `scripts/corpus/build-acquisition-frontier.mjs` and `scripts/corpus/run-frontier-batch.mjs`.

Key changes:

- added archive-level penalties for already chunked `series_title_key` families
- added archive-level penalties for repeated creator-plus-series witnesses
- normalized slash-led bylines so Wellcome titles like `Domestic medicine ... / [William Buchan].` collapse into the right repeat family
- tightened subtitle stripping so long `or,`, `to which`, and descriptive-tail variants map back to shorter stable series keys
- pushed down a few more weak witnesses such as `questions and answers`, `ethereal fire`, annual-meeting phrasing, and thin foreign-leading titles

This was the missing piece that finally stopped saturated families such as Buchan `Domestic medicine`, Burnett `Medical adviser ... long life`, and repeat `Pharmacologia` witnesses from dominating the next slice.

### 2. The next live bounded batch completed successfully

Ran one more uncovered-family batch through the official no-key lanes:

- 4 NLM works
- 10 Wellcome works

All 14 selected works completed successfully and were reconciled back into the registry as `chunked`.

Representative additions:

- `Homoeopathic materia medica of the new remedies`
- `The practice of medicine by the Chinese in America`
- `The medical adviser and guide to health`
- `Cure of disease simplified`
- `A companion to the medicine chest`
- `A dictionary of materia medica and practical pharmacy`
- `A compendium of domestic medicine`
- `The London manual of medical chemistry`
- `An introduction to the study of materia medica`
- `The natural method of healing`

### 3. The full semantic rebuild chain completed after the batch

The batch runner finished the whole rebuild path end to end:

- edition families
- acquisition frontier
- corpus evidence
- term families
- seed catalog
- herb profiles
- status summary

The long run exceeded the app command window once, but the actual work completed successfully in the background and the refreshed exports were verified afterward.

## Current totals after this pass

Corpus totals now:

- 2,720 registered works
- 717 locally acquired and chunked works
- 2,002 discovered works still queued
- 1 failed work
- 957,977 total chunk records
- 1,111,777 total paragraph records

Collection mix now:

- 27 Project Gutenberg works
- 240 NLM Digital Collections works
- 450 Wellcome Collection works

Net change versus the last 703-work checkpoint:

- +14 chunked works
- -14 discovered works
- +10,740 chunk records
- +11,206 paragraph records

## Semantic-layer totals after the rebuild

Acquisition frontier:

- 1,389 actionable title families remain
- 1,324 uncovered families
- 162 depth families
- 0 failed-only families
- 271 current NLM frontier candidates
- 1,118 current Wellcome frontier candidates

Evidence layer:

- 748,582 chunk-signal records
- 55,145 herb candidates
- 3,435 high-confidence herb candidates
- 15,518 medium-confidence herb candidates
- 36,192 low-confidence herb candidates
- 55,213 graph nodes
- 318,680 graph edges

Term-family layer:

- 54,294 canonical families
- 51,376 accepted families
- 51,101 accepted plant families
- 275 accepted broader materia medica families
- 32 review families
- 2,886 rejected families

Seed-catalog layer:

- 125 seed-ready families
- 85 supporting families
- 40,922 review families
- 9,959 excluded noise families
- 39 curator decision rows
- 8 aliased catalog families

Herb-profile layer:

- 125 herb profiles
- 125 profiles with preparation signals
- 125 profiles with condition signals
- 125 profiles with caution signals
- 125 profiles with plant-part signals
- 67,166 matched profile chunks

## Verification

Verified:

- the live frontier batch summary now records all 14 selected work IDs and `0` source failures
- `report-status.mjs` now reports 717 chunked works and the refreshed manifest-backed chunk totals
- the downstream exports were rewritten after the batch, including `corpus-evidence-summary.json`, `term-family-summary.json`, `seed-catalog-summary.json`, and `herb-profile-summary.json`

The only remaining failed registry row is still:

- `nlm-101139425` - `Institutiones medicinae et miscellanea medica, etc`

## What still needs tightening

This pass improved the selector materially, but two fringe witnesses still surfaced in the live batch:

- `nlm-101719212` - `The practice of medicine by the Chinese in America`
- `wellcome-f6acbt8h` - `Um íslenzkar drykkurtir ...`

So the next selector pass should strengthen the English-accessible practical-book bias a little further without narrowing the archive back down to a tiny or repetitive canon.

## Why this matters

This was a quality-and-scale step at the same time:

1. the archive keeps broadening with another 14 rights-cleared works
2. the frontier is now much less vulnerable to getting trapped in repeated witness families
3. the semantic archive remains current automatically after each live acquisition slice

That is exactly the behavior we want before we push deeper into large-scale collection.

## Files updated or regenerated

- `scripts/corpus/build-acquisition-frontier.mjs`
- `scripts/corpus/run-frontier-batch.mjs`
- `corpus/registry/works.csv`
- `corpus/exports/nlm-corpus-summary.json`
- `corpus/exports/wellcome-corpus-summary.json`
- `corpus/exports/frontier-batch-summary.json`
- `corpus/exports/edition-family-summary.json`
- `corpus/exports/acquisition-frontier-summary.json`
- `corpus/exports/corpus-evidence-summary.json`
- `corpus/exports/term-family-summary.json`
- `corpus/exports/seed-catalog-summary.json`
- `corpus/exports/herb-profile-summary.json`
- `corpus/derived/`

## Recommended next move

1. tighten the selector again for English-accessible practical-book bias, especially around ethnographic and clearly non-English fringe witnesses
2. run the next bounded uncovered-family batch from the 1,389-family frontier
3. keep deferring the lone remaining NLM OCR outlier until the broader no-key frontier is further exhausted
