# Herbalisti Corpus Build Checkpoint

Date: 2026-06-18

## Objective

Improve campaign-scale corpus growth quality so the archive keeps broadening into new title families instead of repeatedly ingesting near-duplicate witnesses across adjacent cycles.

This pass stayed inside the current constraints:

- books only
- no web scraping
- no API-key-dependent sources
- official or clearly rights-cleared source lanes only

## What changed

### 1. Frontier batch selection now exposes and accepts campaign memory

`scripts/corpus/run-frontier-batch.mjs` now:

- accepts `--exclude-work-ids`
- accepts `--exclude-series-keys`
- accepts `--exclude-creator-series-keys`
- exposes `creator`
- exposes `title_cluster`
- exposes `series_title_key`
- exposes `creator_title_key`

That means a higher-level runner can tell the selector:

- do not reacquire the exact same work
- do not reacquire the same normalized title series
- do not reacquire the same creator-plus-series witness family

### 2. Series normalization is stronger for descriptive period forms

The selector already handled:

- `Title : subtitle`
- `Title, containing ...`

It now also collapses:

- `Title. Wherein ...`
- `Title. Containing ...`
- similar descriptive period-led title forms

This matters because long-form `physical dictionary` witnesses were still slipping through as separate selections even when they were obviously the same practical title family.

### 3. The campaign runner now remembers what it already chose

`scripts/corpus/run-frontier-campaign.mjs` now carries forward exclusion memory between cycles by default through:

- selected work IDs
- normalized title series keys
- creator-plus-series keys

This means cycle 2 no longer starts from a blank slate after cycle 1. It is nudged toward genuinely new families.

### 4. A few extra quality penalties were added

The batch selector now penalizes:

- astrology-led titles
- clearly introductory lecture titles
- explicit exam-preparation title shapes

That does not solve every relevance issue yet, but it keeps the frontier better aligned to practical manuals, materia medica references, medicinal-plant works, hygiene books, and domestic medicine guides.

## Live improved campaign run completed

Executed:

- `node scripts/corpus/run-frontier-campaign.mjs --cycles=2 --nlm-limit=6 --wellcome-limit=8`

Result:

- 2 cycles completed
- 28 additional works acquired and chunked
- 0 new source failures

The remaining failed registry item is still:

- `nlm-101139425`

## Campaign outcome

### Starting state

- 577 chunked works
- 788,883 chunk records

### Ending state

- 605 chunked works
- 816,640 chunk records

Net gain:

- 28 additional chunked works
- 27,757 additional chunk records

### Cycle 1

- 6 NLM works
- 8 Wellcome works
- 14 new chunked works
- 19,717 additional chunk records

Representative additions:

- `The home doctor`
- `The American cyclopaedia of domestic medicine and household surgery`
- `Catalogue of the medicinal plants`
- `The London dispensatory`

Important behavior change:

The old same-cycle `physical dictionary` duplication did not recur.

### Cycle 2

- 6 NLM works
- 8 Wellcome works
- 14 new chunked works
- 8,040 additional chunk records

Representative additions:

- `Everybody's doctor`
- `The medicinal plants of Tennnessee`
- `A manual of organic materia medica`
- `Solanum dulcamara as a medicinal plant`
- `A manual of hygiene and sanitation`

Important behavior change:

Cycle 2 moved into different series families because the campaign carried forward the cycle 1 exclusion memory.

## Current authoritative corpus totals

After the improved campaign:

- 2,720 registered works
- 605 locally acquired and chunked works
- 2,114 discovered works still queued
- 1 failed work
- 816,640 total chunk records
- 960,108 total paragraph records

Current collection mix:

- 27 Project Gutenberg works / 14,221 chunks
- 374 Wellcome works / 558,396 chunks
- 204 NLM works / 244,023 chunks

## Current semantic layer totals

### Acquisition frontier

- 1,541 actionable title families
- 1,436 uncovered families
- 124 depth families
- 0 failed-only families

Remaining collection candidates:

- NLM: 323
- Wellcome: 1,218

### Evidence layer

- 644,917 chunk-signal records
- 49,185 herb candidates
- 2,958 high-confidence herb candidates
- 14,194 medium-confidence herb candidates
- 32,033 low-confidence herb candidates
- 49,253 graph nodes
- 282,663 graph edges

### Term-family layer

- 48,449 canonical families
- 45,764 accepted families
- 45,540 accepted plant families
- 224 accepted broader materia medica families
- 32 review families
- 2,653 rejected families

### Seed-catalog layer

- 112 seed-ready families
- 82 supporting families
- 36,366 review families
- 8,978 excluded noise families

### Herb-profile layer

- 112 herb profiles
- 53,363 matched chunks
- all 112 profiles still have preparation, condition, caution, and plant-part signals

## Why this matters

This pass did two useful things at once.

First, it increased the corpus again in a measurable way.

Second, it improved the behavior of future acquisition itself. That matters because broad corpus building is not only about adding more works; it is also about making sure each additional pass spends its effort on new knowledge rather than nearby repeats.

## Recommended next move

1. keep using the campaign runner for moderate uncovered-family passes while the frontier remains this broad
2. add a light English-first and practical-reference penalty layer so clearly non-English-leading or weak commercial titles are deprioritized unless they fill a real gap
3. begin the second semantic archive envelope for preparations, substances, and broader materia medica classes so retrieval can expand beyond the first 112 herb profiles
