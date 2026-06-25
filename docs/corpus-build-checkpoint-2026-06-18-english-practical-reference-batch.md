# Herbalisti corpus checkpoint - 2026-06-18 English practical reference batch

Workspace: C:\Users\Superuser\Documents\Codex\2026-06-15\files-mentioned-by-the-user-natural
Project root: outputs/herbalisti-site

## Objective

Keep expanding the rights-cleared Herbalisti book corpus while shifting the acquisition lane closer to the later public search experience: practical, source-rich, English-accessible reference works first, with fewer lecture fragments, sale catalogues, and low-value foreign-language-leading witnesses.

## What changed

### 1. The frontier and batch selectors were hardened again

Both of these scripts were updated:

- `scripts/corpus/build-acquisition-frontier.mjs`
- `scripts/corpus/run-frontier-batch.mjs`

The new pass pushes down or filters additional weak title shapes, including:

- `inaugural lecture`
- `opening address`
- `being an introductory to the course of lectures`
- sale-catalogue phrasing such as `to be sold at the prices affixed`
- foreign-language-leading catalog or pharmacopoeia witnesses such as `catalogi`, `codigo`, `principios`, and `pharmacopoea`

That means the frontier is now better aligned with the later public retrieval goal instead of merely collecting whatever still scores highly inside the raw archive backlog.

### 2. A reusable intake profile now captures that editorial bias

New profile:

- `corpus/review/frontier-profiles/english-practical-reference-2026-06-18.json`

This profile preserves the current batch preferences for:

- botany
- materia medica
- pharmacopoeia
- hygiene
- household-health

It also carries explicit exclusions and title-score adjustments so later runs do not have to rediscover the same fringe cases by hand.

### 3. A live official-source frontier batch ran cleanly

The completed batch used the new profile and processed:

- 10 NLM works
- 14 Wellcome works
- 0 source failures
- `corpus:reconcile` reported `updatedCount: 0` and `missingRegistryRowCount: 0`

Representative additions from this slice included:

- `The American medical lexicon`
- `A botanical dictionary`
- `Flora cestrica`
- `Botanical terminology`
- `A history of the materia medica`
- `The book of prescriptions`
- `Neligan's Medicines`
- `The pharmacopoeia of the Royal College of Physicians of Edinburgh`

## Verified live totals after the batch

- 2,720 registered works
- 870 locally acquired and chunked works
- 1,849 discovered works still queued
- 1 failed work
- 1,113,167 total chunk records
- 1,286,185 total paragraph records
- local footprint: 7.50 GiB across 7,518 files

Collection deltas from the pre-batch state:

- NLM chunked works: 284 -> 294
- Wellcome chunked works: 535 -> 549
- total chunk records: 1,094,578 -> 1,113,167
- total paragraph records: 1,262,004 -> 1,286,185

## Semantic-layer state after rebuild

- acquisition frontier: 1,223 actionable families
- uncovered families: 1,132
- depth families: 215
- discovered works still in uncovered families: 1,309
- thin-work review queue: 106 flagged works
- severe-thin review cases: 55
- fragment-like review cases: 16
- reference-like review cases: 64
- evidence layer: 864,304 chunk-signal records
- herb candidates: 63,941
- term families: 62,923 total
- accepted plant families: 59,278
- seed catalog: 125 seed-ready families and 113 supporting families
- herb profiles: 125

## Verification

- `node --check` passed for both updated selector scripts
- the rebuilt frontier completed successfully
- dry-run previews were used to confirm the quality shift before spending acquisition time
- the live batch completed with `failedCommand: null`
- the full derived rebuild ran behind the acquisition batch

## Why this matters

This pass did two useful things at once:

1. it added another 24 rights-cleared works to the local archive with no new failures
2. it made the next acquisition slices more honest about the kind of corpus we actually want to serve later

That is the right direction for Herbalisti. We are still broadening the archive, but the broadening is now more clearly shaped around practical reference quality rather than raw backlog pressure.

## Recommended next move

1. keep using `english-practical-reference-2026-06-18` for another bounded batch or short campaign while the uncovered-family frontier remains this broad
2. use the thin-work review queue to watch new small witnesses such as `wellcome-tdye7f29` so retrieval weighting does not over-credit very short texts
3. begin a focused pass over the largest seed-catalog review families so more of the expanded evidence layer turns into stable public herb envelopes
