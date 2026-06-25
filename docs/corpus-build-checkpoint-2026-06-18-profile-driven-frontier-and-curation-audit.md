# Herbalisti Corpus Build Checkpoint

Date: 2026-06-18

## Objective

Keep the Herbalisti archive growing while turning one-off frontier curation into reusable acquisition infrastructure and making the seed catalog easier to trust as the corpus expands.

## What changed

### 1. Frontier curation is now reusable

This pass converted the recent hand-built exclusion logic into a reusable profile system for frontier batches and campaigns.

Added:

- `corpus/review/frontier-profiles/README.md`
- `corpus/review/frontier-profiles/diverse-broadening-2026-06-18.json`

`run-frontier-batch.mjs` now accepts:

- `--profile=<profile-name-or-path>`

and merges profile defaults for:

- stage
- selection strategy
- diversity scan window
- limits
- exclusion lists

`run-frontier-campaign.mjs` now passes the same profile through to batch runs, so the same editorial bias can survive across repeated acquisition cycles.

### 2. The seed-catalog curation layer now has its own audit

Added:

- `scripts/corpus/audit-seed-catalog-curation.mjs`

This audit verifies that:

- manual `seed-ready` promotions still appear in the seed-ready export
- manual `supporting` decisions still appear in the supporting lane
- alias-merge decisions still resolve to real catalog targets

That gives us a direct answer when the curated herb layer changes after a rebuild.

### 3. The new profile was exercised end to end

Verified first:

- a profile-driven dry run for `run-frontier-batch.mjs`
- a profile-driven dry run for `run-frontier-campaign.mjs`

Then the profile was used for a live bounded batch:

- `8` NLM works
- `12` Wellcome works
- `0` failures in either lane

Selected NLM works:

- `The family physician, and domestic practice of medicine`
- `G. H. G. Jahr's Manual of homoeopathic medicine`
- `The Indian doctor's dispensatory`
- `Homoeopathic domestic practice`
- `How to get well and how to keep well`
- `Beauties of flora, and outlines of botany`
- `Pharmacopoeia chirurgica, or, A manual of chirurgical pharmacy`
- `A digest of materia medica and pharmacy`

Selected Wellcome works:

- `Medicines : their uses and mode of administration`
- `The soldier's manual of sanitation`
- `Pharmacopoeia chirurgica`
- `Merck's manual of the materia medica`
- `Food for the invalid`
- `Pharmaco-botanologia`
- `The clinical guide`
- `Medical and miscellaneous recipes`
- `Household health`
- `The British Pharmacopoeia, 1885`
- `The domestic medical guide`
- `A dictionary of botanical terms`

## Current totals after this pass

Corpus totals now:

- `2,720` registered works
- `828` locally acquired and chunked works
- `1,891` discovered works still queued
- `1` failed work
- `1,072,132` total chunk records
- `1,236,159` total paragraph records

Collection mix now:

- `27` Project Gutenberg works
- `276` NLM Digital Collections works
- `525` Wellcome Collection works

Net change during this pass:

- `+20` chunked works
- `-20` discovered works
- `+15,634` chunk records
- `+17,218` paragraph records

Local corpus footprint now:

- `7.234 GB`
- `7,168` files

## Semantic-layer totals after the rebuild

- frontier families: `1,254`
- uncovered families: `1,174`
- depth families: `198`
- herb candidates: `60,906`
- evidence signals: `831,172`
- graph nodes: `60,974`
- graph edges: `351,737`
- term families: `59,953`
- accepted families: `56,760`
- accepted plant families: `56,423`
- seed-ready families: `123`
- supporting families: `93`
- herb profiles: `123`

## What the curation audit proved

The earlier seed-ready drop remains real, but it is not caused by lost manual decisions.

Current audit result:

- manual `seed-ready` decisions present: `22 / 22`
- manual `supporting` decisions present: `7 / 7`
- alias-merge decisions unresolved: `0`

That means:

1. none of the manual herb promotions fell out of the catalog
2. the seed-ready reduction sits in the automatic `curated-high-confidence-seed-term` lane
3. the rebuilt archive is tightening its automatic shortlist without damaging the manually curated foundation

There was also a small upward shift in the supporting lane:

- supporting families: `91 -> 93`

That is another hint that richer evidence is reclassifying edge families rather than simply inflating every category.

## Verification

Verified:

- all modified scripts pass `node --check`
- `run-frontier-batch.mjs --profile=diverse-broadening-2026-06-18 --dry-run=true` completed successfully
- `run-frontier-campaign.mjs --profile=diverse-broadening-2026-06-18 --cycles=1 --dry-run=true --rebuild-derived=false --run-status=false` completed successfully
- the live profile-driven batch completed with `processedCount: 8` for NLM and `processedCount: 12` for Wellcome
- both source lanes reported `failureCount: 0`
- the Wellcome exact-ID path again processed with `scannedResults: 0`
- `corpus:reconcile` reported `updatedCount: 0` and `missingRegistryRowCount: 0`
- `report-status.mjs` now reports `828` chunked works and `1` remaining failed row
- the curation audit reports:
  - `missingManualSeedReadyDecisions: []`
  - `missingManualSupportingDecisions: []`
  - `unresolvedAliasTargets: []`

## Why this matters

This pass improved the Herbalisti archive in two different ways:

1. it added another meaningful block of rights-cleared source material
2. it turned fragile manual curation into reusable acquisition and audit infrastructure

That is exactly the kind of groundwork the later website needs: more books, cleaner repeatability, and a better answer to the question "can we trust what the seed catalog is doing?"

## Files updated or added

Updated project notes:

- `docs/knowledge-corpus-first-plan.md`

Updated scripts:

- `scripts/corpus/run-frontier-batch.mjs`
- `scripts/corpus/run-frontier-campaign.mjs`

Added scripts:

- `scripts/corpus/audit-seed-catalog-curation.mjs`

Added review/config files:

- `corpus/review/frontier-profiles/README.md`
- `corpus/review/frontier-profiles/diverse-broadening-2026-06-18.json`

Updated corpus and exports:

- `corpus/registry/works.csv`
- `corpus/exports/nlm-corpus-summary.json`
- `corpus/exports/wellcome-corpus-summary.json`
- `corpus/exports/frontier-batch-summary.json`
- `corpus/exports/frontier-campaign-summary.json`
- `corpus/exports/edition-family-summary.json`
- `corpus/exports/acquisition-frontier-summary.json`
- `corpus/exports/corpus-evidence-summary.json`
- `corpus/exports/term-family-summary.json`
- `corpus/exports/seed-catalog-summary.json`
- `corpus/exports/herb-profile-summary.json`
- `corpus/exports/seed-catalog-curation-audit.json`
- `corpus/derived/`

## Recommended next move

1. inspect the automatic `curated-high-confidence-seed-term` lane to find which families moved out of seed-ready and into supporting or review
2. keep using small profile-driven batches so the corpus expands without reverting to repetitive top-score intake
3. add a second reusable frontier profile for a more aggressive botany and pharmacopoeia bias once the current uncovered-family lane thins further
