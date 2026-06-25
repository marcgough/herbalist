# Herbalisti Corpus Build Checkpoint

Date: 2026-06-18

## Objective

Keep the Herbalisti corpus growing from official no-key book sources while making the English-accessible intake lane more trustworthy for the later public retrieval experience.

This pass combined two kinds of work:

1. hardening the frontier selector and the English-reference profile after a poor dry run
2. running a live bounded acquisition batch and rebuilding the derived semantic archive

## What changed

### 1. The English-reference intake profile was tightened against live dry-run evidence

The first dry run still selected too many weak witnesses:

- examination-course books
- medical-book catalogues
- revision instructions and convention minutes
- lecture-shaped material
- persistent non-English or Latin witnesses that were not right for the English-accessible lane

Two files were tightened:

- `scripts/corpus/run-frontier-batch.mjs`
- `corpus/review/frontier-profiles/english-practical-reference-2026-06-18.json`

#### New generic selector penalties

`run-frontier-batch.mjs` now penalizes additional weak title shapes, including:

- `course of examinations`
- `catalogue of medical books`
- `arranged catalogues of`
- `instructions issued by`
- `committee of revision and publication`
- `minutes of the ... decennial convention`
- `heads of a course of lectures`
- `part of a course of lectures`
- `read before the medical society`
- `for the use of teachers and students`

These are global selector improvements, not just one-off profile hacks.

#### English-reference profile exclusions were also sharpened

The English-accessible profile now explicitly excludes several persistent outliers that still slipped through after the generic penalty pass, including:

- `nlm-2546065R`
- `nlm-101220398`
- `nlm-101188994`
- `nlm-101166797`
- `nlm-101221259`
- `nlm-101125242`
- `nlm-100961073`
- `wellcome-fstcqcz6`
- `wellcome-eerza6hf`
- `wellcome-rf7zwwnq`
- `wellcome-tg29adr8`
- `wellcome-jkjv35ym`
- `wellcome-kptt2h24`
- `wellcome-xtum85vk`
- `wellcome-bn68mk4f`

It also carries stronger title-score adjustments for good reference shapes such as:

- `medical and botanical dictionary`
- `family flora and materia medica botanica`
- `experimental history of the materia medica`
- `manual of practical hygiene`

and stronger penalties for weak phrase families such as:

- `course of examinations on`
- `catalogue of medical books`
- `instructions issued by`
- `arranged catalogues of`
- `caroli a linne`
- `potissimum regni vegetabilis`
- `continuacion, o suplemento`

### 2. A live no-key acquisition batch was run end to end

After the dry-run cleanup, the live batch ran with:

- profile: `english-practical-reference-2026-06-18`
- 10 NLM selections
- 14 Wellcome selections

Executed command chain:

- `corpus:nlm`
- `corpus:wellcome`
- `corpus:reconcile`
- `build-edition-families`
- `build-acquisition-frontier`
- `build-corpus-evidence`
- `build-thin-work-review`
- `build-term-families`
- `build-seed-catalog`
- `build-herb-profiles`
- `build-seed-review-priority`
- `corpus:status`

The batch completed with:

- `failedCommand: null`
- `selectedNlm: 10`
- `selectedWellcome: 14`
- `commandCount: 12`

NLM processed all 10 requested works successfully.

Wellcome processed 13 of 14 requested works successfully and surfaced one explicit outlier:

- `wellcome-skdfu5qa`
- title: `The elements of materia medica. Comprehending the natural history, preparation, properties, composition, effects and uses of medicines / [Jonathan Pereira].`
- error: `404 Not Found`

## Current corpus totals after the batch

Verified current archive totals:

- 2,720 registered works
- 893 locally acquired and chunked works
- 1,825 discovered works still queued
- 2 failed works reflected in status totals
- 1,127,013 total chunk records
- 1,303,003 total paragraph records

Current source mix:

- 27 Project Gutenberg works
- 304 NLM Digital Collections works
- 562 Wellcome Collection works

Current local footprint:

- 7.63 GB
- 7,718 files

Net change from the pre-batch state:

- `+23` chunked works
- `-24` discovered works
- `+13,846` chunk records
- `+16,818` paragraph records
- `+193` files

## Current semantic-archive totals after the rebuild

### Acquisition frontier

- 1,206 actionable frontier title families
- 1,108 uncovered families
- 221 depth families
- 1 failed-only family
- 1,279 discovered works in uncovered families
- 546 discovered works in depth families

### Evidence layer

- 893 chunked works represented
- 873,476 chunk-signal records
- 64,392 herb candidates
- 4,112 high-confidence herb candidates
- 17,042 medium-confidence herb candidates
- 43,238 low-confidence herb candidates
- 64,460 graph nodes
- 372,635 graph edges

### Term-family layer

- 63,366 canonical families
- 60,068 accepted families
- 59,702 accepted plant families
- 366 accepted broader materia medica families
- 31 review families
- 3,267 rejected families

### Seed-catalog layer

- 125 seed-ready families
- 116 supporting families
- 47,979 review families
- 11,473 excluded families

### Herb-profile layer

- 125 herb profiles
- 125 profiles with preparation, condition, caution, and plant-part signals
- 81,276 matched profile chunks

Largest current profiles remain led by:

- `Lemon`
- `Olive`
- `Chamomile`
- `Castor`
- `Senna`

### Seed-review-priority layer

After the post-batch semantic rebuild and a small lexical cleanup for `Slightly`, the ranked review backlog now sits at:

- 47,979 total review families
- 49 promotion candidates
- 20 identity-review candidates
- 44,692 secondary candidates
- 3,218 deprioritized families

Current top promotion candidates now begin with:

- `Prickly-Ash`
- `Elm`
- `Tolu`
- `Nux Vomica`
- `Quassia`
- `Lesser Cardamom`
- `Horse-Radish`
- `Calumba`
- `Benzoin`
- `Tormentil`

## Why this matters

This pass improved both sides of the corpus-building problem.

It grew the local archive materially, and it also made the intake lane more intentional:

1. better book-like English-reference acquisition
2. fewer obvious admin, lecture, and convention witnesses
3. stronger semantic rebuilds immediately after acquisition
4. a cleaner ranked herb-review queue for the next manual promotion pass

That combination is closer to the long-term goal than raw growth alone.

## Remaining rough edges

- The English-reference lane is better, but not perfect. Some selected works are still more professional-reference or pharmacopoeia-heavy than strictly herb-first.
- The term-family and evidence layers still admit some broader materia medica or preparation-shaped names such as `Fixed`, which means later public-facing curation should continue to sit above the raw accepted-family layer.
- The current explicit failed Wellcome outlier is `wellcome-skdfu5qa`.

## Files updated

Updated scripts:

- `scripts/corpus/run-frontier-batch.mjs`
- `scripts/corpus/build-seed-review-priority.mjs`

Updated profile/config files:

- `corpus/review/frontier-profiles/english-practical-reference-2026-06-18.json`

Updated project notes:

- `docs/knowledge-corpus-first-plan.md`
- `corpus/REGISTRY.md`

Updated exports and derived layers:

- `corpus/exports/frontier-batch-summary.json`
- `corpus/exports/nlm-corpus-summary.json`
- `corpus/exports/wellcome-corpus-summary.json`
- `corpus/exports/acquisition-frontier-summary.json`
- `corpus/exports/corpus-evidence-summary.json`
- `corpus/exports/term-family-summary.json`
- `corpus/exports/seed-catalog-summary.json`
- `corpus/exports/herb-profile-summary.json`
- `corpus/exports/seed-review-priority-summary.json`
- `corpus/derived/`
- `corpus/review/seed-catalog-priority/`

## Recommended next move

1. keep using the hardened English-reference profile for another bounded no-key batch while the frontier is still deep
2. start a small manual promotion pass from the new top `promotion-candidate` queue
3. continue tightening the accepted-family layer above broad materia medica artifacts such as `Fixed` before those terms can distort the eventual public herb database
