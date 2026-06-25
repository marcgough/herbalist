# Corpus Build Checkpoint - 2026-06-19 Edition-Family Memory and Five-Work Pass

Date: 2026-06-19

## What changed

This pass improved both the semantic archive structure and the local book corpus itself.

Completed in this step:

1. `Corpus Memory` now indexes bibliographic edition families as first-class retrieval documents.
2. Work-summary retrieval documents now carry edition-family linkage metadata.
3. Five additional rights-cleared discovered works were acquired locally from official no-key lanes.
4. The derived corpus layers were rebuilt from the updated archive state.
5. `Corpus Memory` was re-ingested from the refreshed corpus state.

## Why this matters

The corpus is now less like a flat pile of witnesses and more like a managed library:

- family-level retrieval can answer "what is this work tradition?" instead of only "what is this specific witness?"
- duplicate-heavy historical series can later be searched, reviewed, and displayed without pretending every witness is a separate conceptual work
- work-level retrieval can now point back to its family context
- the local archive continues to expand with book-scale texts rather than metadata placeholders

## Corpus Memory work

Updated file:

- `scripts/corpus-memory/ingest-herbalisti-corpus.mjs`

New retrieval shape now includes:

- `herb-profile`
- `work-summary`
- `edition-family`

Work summaries now also store:

- `family_id`
- `family_label`
- `family_work_count`
- `family_confidence`

Verified live `Corpus Memory` totals after re-ingest:

- total documents: 2,987
- `edition-family`: 1,867
- `work-summary`: 996
- `herb-profile`: 124

## New works acquired in this pass

NLM:

- `nlm-63580350R` - `Johnson's family physician`
- `nlm-8004761` - `Popular medicine, or, The American family physician`
- `nlm-2576043R` - `The botanist`

Wellcome:

- `wellcome-y76d856v` - `Organic materia medica and therapeutics`
- `wellcome-ep6yntuz` - `Syllabus of materia medica for the use of teachers and students`

All five processed successfully with no failures.

## Verified corpus state after this pass

- registered works: 2,723
- chunked works: 996
- discovered works still queued: 1,723
- failed works: 1
- chunk records: 1,208,584
- paragraph records: 1,390,683

Collection mix:

- Project Gutenberg chunked: 27
- NLM chunked: 328
- Wellcome chunked: 641

Local corpus footprint:

- 8,559 files
- 8.33 GB

## Notes on rebuild behavior

The full `run-frontier-batch.mjs --rebuild-derived=true` wrapper exceeded the interactive tool window, but the important derived outputs did refresh:

- `edition-family-summary.json`
- `acquisition-frontier-summary.json`
- `corpus-evidence-summary.json`
- `thin-work-review-summary.json`

The lingering batch runner was stopped before the final `Corpus Memory` re-ingest so the SQLite store could be updated cleanly.

## Recommended next action

Prioritize another explicit rights-cleared acquisition pass from the current uncovered frontier, but keep it curated:

1. select practical references and materia medica families only
2. avoid low-value household-general, phrenology, sexual-physiology, and false-positive witnesses
3. continue expanding `Corpus Memory` with higher-value semantic layers after the next acquisition step:
   - rights-review summaries
   - seed-catalog promotion candidates
   - later chunk-level retrieval for selected high-value witnesses only
