# Herbalisti Corpus Build Checkpoint

Date: 2026-06-18

## Objective

Keep expanding the rights-cleared Herbalisti book corpus while making the acquisition flow more efficient and keeping the semantic archive honest about what the newer evidence changes.

## What changed

### 1. The next bounded frontier batch was intentionally widened sideways

This pass did not just take the top raw frontier slice.

It ran a curated uncovered-family batch with explicit exclusions to avoid:

- the most saturated `family physician` witnesses already dominating the NLM lane
- a handful of weaker Wellcome lifestyle or awkward-language candidates
- several low-yield or less useful repeats that would have spent slots without improving retrieval breadth

That produced a more useful mixed intake across:

- botany
- materia medica
- pharmacopoeia
- hygiene
- nursing
- household-health
- dietetics

### 2. The registry-first Wellcome path proved itself at batch scale

The live batch used the newer explicit-ID workflow rather than re-running broad Wellcome discovery.

For the Wellcome slice:

- `requestedWorkIdsCount: 12`
- `processedCount: 12`
- `failureCount: 0`
- `scannedResults: 0`

That means the local registry is now doing real work as an archive index rather than just a passive ledger.

### 3. Twenty more works were acquired and rebuilt into the semantic archive

The live batch completed successfully with:

- `8` NLM works
- `12` Wellcome works
- `0` failures in either lane

Selected NLM works:

- `The American botanist, and family physician`
- `The vegetable materia medica and practice of medicine`
- `A grammar of botany`
- `A lexicon for the use of druggists and students in pharmacy`
- `A dictionary of medical science`
- `The American eclectic dispensatory`
- `The eclectic family physician`
- `Illustrated domestic medical counsellor ... Domestic materia medica`

Selected Wellcome works:

- `A manual of pharmacy`
- `Merck's manual of the materia medica`
- `A manual of hygiene, sanitation and sanitary engineering`
- `Alterations adopted in the London Pharmacopoeia of MDCCCXXIV`
- `Manual of home nursing and hygiene`
- `A new medical dictionary`
- `A translation of the pharmacopoeia of the Royal College of Physicians of London, 1836`
- `The articles and preparations of the British Pharmacopoeia`
- `The domestic oracle`
- `Merck's 1901 manual of the materia medica`
- `Food for the invalid`
- `New homoeopathic pharmacopoeia and posology`

## Current totals after this pass

Corpus totals now:

- `2,720` registered works
- `808` locally acquired and chunked works
- `1,911` discovered works still queued
- `1` failed work
- `1,056,498` total chunk records
- `1,218,941` total paragraph records

Collection mix now:

- `27` Project Gutenberg works
- `268` NLM Digital Collections works
- `513` Wellcome Collection works

Net change during this pass:

- `+20` chunked works
- `-20` discovered works
- `+26,889` chunk records
- `+30,492` paragraph records

Local corpus footprint now:

- `7.137 GB`
- `7,005` files

## Semantic-layer totals after the rebuild

- frontier families: `1,268`
- uncovered families: `1,194`
- depth families: `192`
- herb candidates: `59,739`
- evidence signals: `818,281`
- graph nodes: `59,807`
- graph edges: `345,972`
- term families: `58,805`
- accepted families: `55,669`
- accepted plant families: `55,335`
- seed-ready families: `123`
- supporting families: `91`
- herb profiles: `123`
- herb-profile matched chunks: `74,113`

## Important semantic note

The richer corpus increased evidence density and expanded accepted plant families, but the curated seed-ready layer tightened slightly:

- previously tracked seed-ready families: `125`
- current seed-ready families: `123`

That is not necessarily a regression. It means the curation layer is sensitive to the changed evidence mix, and we should treat that movement as signal rather than hide it.

The likely next semantic-quality task is to inspect which two seed-ready families dropped and decide whether:

- they were correctly demoted by stricter evidence
- they need alias or decision-row support
- the catalog rules are still over-admitting or under-admitting edge cases

## Verification

Verified:

- the batch completed with `processedCount: 8` for NLM and `processedCount: 12` for Wellcome
- both source lanes reported `failureCount: 0`
- the Wellcome exact-ID batch processed with `scannedResults: 0`
- `corpus:reconcile` reported `updatedCount: 0` and `missingRegistryRowCount: 0`
- `report-status.mjs` now reports `808` chunked works and `1` remaining failed row
- derived layers rebuilt successfully:
  - `edition families`
  - `acquisition frontier`
  - `corpus evidence`
  - `term families`
  - `seed catalog`
  - `herb profiles`

## Why this matters

This pass improved the archive in three ways at once:

1. it added another meaningful block of rights-cleared books
2. it made the Wellcome lane cheaper to re-run because explicit IDs no longer force rediscovery scans
3. it kept the semantic archive grounded by showing where more evidence can tighten, not just inflate, the curated herb layer

## Files updated or regenerated

Updated project notes:

- `docs/knowledge-corpus-first-plan.md`

Updated corpus and exports:

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

1. inspect the two seed-ready families that dropped out of the curated catalog
2. keep expanding the uncovered-family frontier with small diverse slices instead of raw top-score batches
3. consider turning the ad hoc exclusion list used here into a reusable campaign profile so the next batch stays broad without manual curation each time
