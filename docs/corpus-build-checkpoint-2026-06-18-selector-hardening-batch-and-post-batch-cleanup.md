# Herbalisti Corpus Build Checkpoint

Date: 2026-06-18

## Objective

Tighten the frontier toward English-accessible practical reference books, collapse duplicate series witnesses more reliably, run the next bounded official-source batch, then clean the selector again based on what the live batch actually surfaced.

## What changed

### 1. The frontier and batch selector were hardened again

Updated:

- `scripts/corpus/build-edition-families.mjs`
- `scripts/corpus/build-acquisition-frontier.mjs`
- `scripts/corpus/run-frontier-batch.mjs`

Key selector changes:

- ligature normalization now maps `œ` and related forms to stable ASCII equivalents, so `homoeopathic` and `homœopathic` witnesses no longer split into separate series keys
- slash-led bylines are now stripped consistently in the edition-family layer as well as the frontier layer
- archive-level series cooling remains active, but now sits on cleaner series keys
- the batch picker now removes remaining candidates from the same title series once one witness has been chosen for that slice
- stronger downranking now applies to foreign-language-leading titles, `questions to be answered` shapes, `extracted from` fragments, farrier and receipt-book hybrids, multilingual specialist dictionaries, patent-office phrasing, and narrow tract-style `distinctive characters` titles
- lecture filters were widened again so `lecture introductory`, `being one of a course on`, and literal `A lecture ...` variants stop leaking into the next book-first slice

### 2. A full live bounded batch completed successfully

Ran one more uncovered-family batch through the official no-key lanes:

- 4 NLM works
- 10 Wellcome works

All 14 selected works completed successfully and were reconciled back into the registry as `chunked`.

Representative additions:

- `The household monitor of health`
- `The London medical dictionary`
- `The mother's own book and practical guide to health`
- `Hygiene and sanitary matters`
- `British pharmacopoeia`
- `The pharmacopoeia of the Royal College of Physicians of London`
- `Medicine chest directory, and family catalogue of drugs, chemicals, and medicinal compounds`
- `An epitome of the homoeopathic domestic medicine`
- `The essentials of materia medica and therapeutics`

### 3. The full semantic rebuild chain landed cleanly

The live batch completed end to end in one run:

- edition families
- acquisition frontier
- corpus evidence
- term families
- seed catalog
- herb profiles
- status summary

### 4. A post-batch selector cleanup was applied immediately

The live batch still surfaced one very short tract-like herbal item and confirmed that lecture variants needed broader filtering. Rather than leave that for later, the selector was tightened again after the batch and the frontier was rebuilt.

That post-batch cleanup reduced the actionable frontier from 1,340 families to 1,332 without changing the already-ingested corpus.

## Current totals after this pass

Corpus totals now:

- 2,720 registered works
- 731 locally acquired and chunked works
- 1,988 discovered works still queued
- 1 failed work
- 972,371 total chunk records
- 1,126,846 total paragraph records

Collection mix now:

- 27 Project Gutenberg works
- 244 NLM Digital Collections works
- 460 Wellcome Collection works

Net change versus the last 717-work checkpoint:

- +14 chunked works
- -14 discovered works
- +14,394 chunk records
- +15,069 paragraph records

## Semantic-layer totals after the rebuild

Live post-batch rebuild totals:

- edition families: 1,866
- frontier families at live rebuild time: 1,340
- evidence signals: 759,560
- herb candidates: 55,707
- term families: 54,838
- seed-ready families: 125
- herb profiles: 125

Current frontier after the post-batch selector cleanup:

- 1,332 actionable title families remain
- 1,271 uncovered families
- 169 depth families
- 0 failed-only families
- 261 current NLM frontier candidates
- 1,079 current Wellcome frontier candidates

Current semantic summaries:

- term-family layer: 54,838 canonical families, 51,893 accepted families, 51,613 accepted plant families, 280 accepted broader materia medica families, 32 review families, 2,913 rejected families
- seed-catalog layer: 125 seed-ready families, 86 supporting families, 41,348 review families, 10,044 excluded noise families
- herb-profile layer: 125 profiles and 68,098 matched profile chunks

## Verification

Verified:

- all 14 selected work IDs from the live batch are now `chunked` in `corpus/registry/works.csv`
- the live frontier batch summary reports `0` NLM failures, `0` Wellcome failures, and `failedCommand: null`
- `report-status.mjs` now reports 731 chunked works with the updated manifest-backed chunk totals
- the later post-batch dry run is cleaner than the pre-batch preview: duplicate homoeopathic witnesses are gone from the same slice, the foreign-language-leading outliers dropped away, and the short tract-style herbal item is no longer selected in the next preview

The only remaining failed registry row is still:

- `nlm-101139425` - `Institutiones medicinae et miscellanea medica, etc`

## What the next preview now looks like

After the post-batch selector cleanup, the next dry-run preview shifted toward a more plausible books-first slice.

Representative next candidates now include:

- `School hygiene`
- `Woman's complete guide to health`
- `A materia medica, of the United States`
- `Domestic medicine and surgery`
- `The organic materia medica of the British pharmacopoeia systematically arranged`
- `Pharmacographia indica`
- `The oracle of health and long life`
- `A medical manual and medicine chest companion`

That is still a broad medical-reference mix, but it is notably cleaner than the earlier fringe-heavy previews.

## Why this matters

This pass improved both scale and selection quality:

1. the archive grew by another 14 rights-cleared works
2. edition-family and frontier normalization now behave better around ligatures and slash-led bylines
3. same-series witnesses no longer consume multiple slots in the same batch
4. the next frontier is cleaner than the one that produced this batch, which means the acquisition loop is improving instead of just repeating

## Files updated or regenerated

- `scripts/corpus/build-edition-families.mjs`
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

1. continue another bounded uncovered-family batch from the current 1,332-family frontier
2. keep nudging the selector toward practical household-health and medicinal-plant references when pharmacopoeia-heavy slices start dominating again
3. leave the lone NLM OCR outlier deferred until the broader no-key corpus lanes are further exhausted
