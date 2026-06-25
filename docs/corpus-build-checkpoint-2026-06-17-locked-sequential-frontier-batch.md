# Herbalisti Corpus Build Checkpoint

Date: 2026-06-17

## Objective

Continue broad local corpus collection from official no-key book sources, while hardening the archive so registry state stays reliable as the corpus grows.

## Archive hardening completed first

This step added a real single-writer lock around the corpus registry:

- `scripts/corpus/lib.mjs` now exposes `withWorksRegistryLock(...)`
- `build-gutenberg-corpus.mjs`
- `build-nlm-corpus.mjs`
- `build-wellcome-corpus.mjs`
- `reconcile-registry-from-manifests.mjs`

All now serialize writes to `corpus/registry/works.csv`.

## Lock validation

A live lock test confirmed the intended behavior:

- one process acquired the registry lock immediately
- the second process waited until the first released it
- a follow-up `npm run corpus:reconcile` reported:
  - `updatedCount: 0`
  - `missingRegistryRowCount: 0`

That is the practical proof that the latest sequential acquisition pass left the registry consistent without repair.

## Batch acquired

Processed: 12

Failures: 0

### NLM Digital Collections

Processed: 6

- `nlm-63570320R` - `American family physician`
- `nlm-63360800R` - `The American cyclopaedia of domestic medicine and household surgery`
- `nlm-61570130R` - `A synopsis, or, Systematic catalogue of the medicinal plants of the United States`
- `nlm-61710350R` - `A catalogue of the medicinal plants ... growing in the state of New-York`
- `nlm-64220910R` - `The occult family physician and botanic guide to health`
- `nlm-61440090R` - `The guide to health`

### Wellcome Collection

Processed: 6

- `wellcome-bkpnf494` - `The poisons in our food, or, Guide to health`
- `wellcome-jamxx58n` - `The antiseptic or commonsense practice of medicine and guide to health`
- `wellcome-quqvdepz` - `A new guide to health; or, botanic family physician`
- `wellcome-xw4v9dh2` - `A narrative of the life and medical discoveries of Samuel Thomson`
- `wellcome-f6v52btj` - `The general dispensatory`
- `wellcome-c2fdp9wa` - `The complete herbal`

## Current corpus totals after the batch

- 2,720 registered works
- 455 locally acquired and chunked works
- 2,265 discovered works still queued
- 0 failed works remaining overall

Current chunked works by collection:

- 27 Project Gutenberg works
- 290 Wellcome Collection works
- 138 NLM Digital Collections works

Current chunk totals from disk:

- 639,948 total chunk records
- 14,221 Project Gutenberg chunks
- 440,038 Wellcome chunks
- 185,689 NLM chunks

## Current frontier state after rebuild

- 1,646 actionable family recommendations remain
- 1,586 uncovered families remain
- 60 depth families remain
- 0 failed-only families remain
- 2,016 discovered works still sit in uncovered families

Collection worklist balance:

- NLM: 388 frontier candidates remaining
- Wellcome: 1,258 frontier candidates remaining

## Current semantic totals after refresh

Evidence layer:

- 455 chunked works
- 508,665 chunk-signal records
- 39,965 herb candidates
- 2,273 high-confidence herb candidates
- 11,970 medium-confidence herb candidates
- 25,722 low-confidence herb candidates
- 40,033 graph nodes
- 225,966 graph edges

Term-family layer:

- 39,403 canonical families
- 37,168 accepted families
- 37,025 accepted plant-like families
- 143 accepted broader materia medica families
- 31 review families
- 2,204 rejected families

Seed-catalog layer:

- 103 curated seed-ready families
- 61 supporting families
- 29,652 review families
- 7,209 excluded noise families

## Why this matters

This step improved both the corpus and the system that holds it:

1. it added another 12 substantial rights-cleared books without introducing any new sourcing risk
2. it materially deepened domestic medicine, medicinal-plant, botanic-family-physician, and practical herbal lanes
3. it made the registry path safer for future long-running collection work by preventing concurrent writers from trampling each other

## Recommended next move

1. continue sequential frontier-guided acquisition, keeping the lock-protected writer path as the norm
2. finish the current high-value NLM domestic-medicine and medicinal-plant families near the top of the frontier
3. keep alternating practical corpus growth with archive hygiene so retrieval quality rises with the corpus instead of lagging behind it
