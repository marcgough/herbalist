# Herbalisti Corpus Build Checkpoint

Date: 2026-06-18

## Objective

Keep growing the rights-cleared local Herbalisti book corpus, then harden the frontier again when the next preview reveals low-value witness shapes that could waste later acquisition slices.

## What changed

### 1. One live bounded batch landed cleanly

Starting from the 731-work state, one bounded uncovered-family batch completed successfully:

- 4 NLM works
- 10 Wellcome works

Representative additions:

- `School hygiene`
- `Woman's complete guide to health`
- `A materia medica, of the United States`
- `The botanical names of the U.S. pharmacopoeia`
- `Domestic medicine and surgery`
- `Pharmacographia indica`
- `The oracle of health and long life`
- `A medical manual and medicine chest companion`

That moved the corpus from 731 to 745 chunked works with no new failures.

### 2. The next preview exposed another selector gap

After that batch, the next dry-run preview surfaced three additional low-value witness shapes:

- administrative removal pamphlets such as `A short account of the occurrences which led to the removal ...`
- patent-letter product witnesses such as `A letter to the patentee ...`
- Latin thesis or disputation forms such as `Quaestio medica. Pro baccalaureatu ...`

It also confirmed that some lecture and syllabus variants with punctuation still leaked through the existing filters.

### 3. The frontier and batch selector were hardened again

Updated:

- `scripts/corpus/build-acquisition-frontier.mjs`
- `scripts/corpus/run-frontier-batch.mjs`

New suppression or downranking now covers:

- `letter to the patentee` witnesses
- `occurrences which led to the removal ... chair of ...` pamphlets
- `quaestio medica`, `pro baccalaureatu`, `mane discutienda`, and related Latin thesis phrasing
- appendix-to-homoeopathic-domestic-medicine fragments
- `lecture, introductory ...` punctuation variants
- `syllabus of a course of lectures ...` variants

The rebuilt frontier tightened from 1,323 actionable families to 1,315 before the next live run, which confirmed the rules were removing real noise rather than merely reordering it.

### 4. A second live bounded batch then landed on the cleaner frontier

With the hardened selector in place, a second bounded uncovered-family batch completed successfully:

- 4 NLM works
- 10 Wellcome works

Representative additions:

- `The elements of health`
- `Woman's guide to health`
- `Botanic materia medica`
- `Chemistry, general, medical, and pharmaceutical`
- `Home doctoring`
- `Hygiene and public health`
- `Primitive physic`
- `Southall's Organic materia medica`

That moved the corpus from 745 to 759 chunked works, again with no new failures.

## Current totals after this pass

Corpus totals now:

- 2,720 registered works
- 759 locally acquired and chunked works
- 1,960 discovered works still queued
- 1 failed work
- 997,047 total chunk records
- 1,152,642 total paragraph records

Collection mix now:

- 27 Project Gutenberg works
- 252 NLM Digital Collections works
- 480 Wellcome Collection works

Net change versus the 731-work checkpoint:

- +28 chunked works
- -28 discovered works
- +24,676 chunk records
- +25,796 paragraph records

## Semantic-layer totals after the second rebuild

- frontier families: 1,308
- uncovered families: 1,243
- depth families: 181
- evidence signals: 776,738
- herb candidates: 56,815
- term families: 55,927
- accepted plant families: 52,645
- seed-ready families: 125
- herb profiles: 125
- herb-profile matched chunks: 70,136

## Verification

Verified:

- both live batches completed with `failedCommand: null`
- all 28 selected work IDs are now `chunked` in `corpus/registry/works.csv`
- `corpus:reconcile` reported `updatedCount: 0` after both runs
- `report-status.mjs` now reports 759 chunked works and manifest-backed totals of 997,047 chunks and 1,152,642 paragraphs
- the post-hardening next preview no longer surfaces the administrative removal pamphlet, the patent-letter witness, or the Latin thesis item that triggered the cleanup

The only remaining failed registry row is still:

- `nlm-101139425` - `Institutiones medicinae et miscellanea medica, etc`

## What the next preview now looks like

After the hardening pass and second batch, the next preview is cleaner again.

Representative next candidates now include:

- `A compendium of domestic medicine, and health-adviser`
- `The American eclectic materia medica`
- `A synopsis of pharmacology`
- `A practical compendium of the materia medica`
- `A manual of hygiene`
- `Cox's companion to the family medicine chest and compendium of domestic medicine`
- `A complete dictionary of the whole materia medica`

One remaining pattern to watch is that family-physician variants still crowd the top recommendation ladder, even when the diversity picker ultimately chooses a more varied slice.

## Why this matters

This pass improved both scale and selection quality at once:

1. the archive gained another 28 rights-cleared works across two successful batches
2. the selector learned a new family of bad witness shapes instead of letting them recur
3. the next frontier is cleaner than the one that surfaced the admin and patent noise
4. the semantic archive kept deepening automatically across evidence, term-family, seed-catalog, and herb-profile layers

## Files updated or regenerated

- `scripts/corpus/build-acquisition-frontier.mjs`
- `scripts/corpus/run-frontier-batch.mjs`
- `corpus/registry/works.csv`
- `corpus/exports/nlm-corpus-summary.json`
- `corpus/exports/wellcome-corpus-summary.json`
- `corpus/exports/frontier-batch-summary.json`
- `corpus/exports/acquisition-frontier-summary.json`
- `corpus/exports/corpus-evidence-summary.json`
- `corpus/exports/term-family-summary.json`
- `corpus/exports/seed-catalog-summary.json`
- `corpus/exports/herb-profile-summary.json`
- `corpus/derived/`

## Recommended next move

1. continue another bounded uncovered-family batch from the current 1,308-family frontier
2. keep nudging the selector against over-saturated family-physician ladders without collapsing practical household-health coverage
3. leave the lone NLM OCR outlier deferred until the broader no-key lanes are further exhausted
