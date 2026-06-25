# Herbalisti Corpus Build Checkpoint

Date: 2026-06-18

## Objective

Keep expanding the rights-cleared Herbalisti local book corpus while tightening the official-source ingestion stack so broken public-text lanes do not silently degrade archive quality.

## What changed

### 1. The thin Wellcome dictionary capture was repaired properly

`wellcome-qc9bzfnh` (`A complete dictionary of the whole materia medica ... / by William Lewis.`) had previously been accepted as a bad thin capture.

The failure pattern was:

- root text endpoint returned `404`
- ALTO endpoints returned `500`
- the ZIP fallback exposed empty placeholder files
- the first fallback pass accepted only volume-label text

This pass fixed that path in two ways:

- `scripts/corpus/build-wellcome-corpus.mjs` now rejects manifest text that is only wrapper text, placeholder text, or thin volume-heading text for substantial Wellcome manifests
- the Wellcome OCR fallback now resolves its helper paths from the Herbalisti project root instead of the outer workspace root

After that repair, the work was reprocessed successfully via official copy PDF OCR:

- source mode: `wellcome_pdf_local_ocr`
- selected manifest: `b33489828_0001`
- recovered chunks: `1,065`
- recovered paragraphs: `1,802`
- OCR character count from the recovered PDF text: `868,833`

The earlier bad-capture files were preserved under:

- `corpus/review/quarantine/2026-06-18-wellcome-thin-text/`

### 2. The frontier batch runner had the same root-resolution bug and was fixed

`scripts/corpus/run-frontier-batch.mjs` was still spawning child corpus scripts from the outer workspace root rather than the Herbalisti project root.

That broke live batch execution with `MODULE_NOT_FOUND` when it tried to launch:

- `build-nlm-corpus.mjs`
- `build-wellcome-corpus.mjs`
- the downstream rebuild scripts

This pass fixed the runner so it now:

- resolves script paths from its own `scripts/corpus/` directory
- launches child commands with `cwd` set to the Herbalisti project root

### 3. The English-first frontier was nudged again

One Latin `Institutiones medicinae ...` record still leaked into the next NLM slice after the earlier relevance hardening.

Updated:

- `scripts/corpus/build-acquisition-frontier.mjs`
- `scripts/corpus/run-frontier-batch.mjs`

The foreign-leading-title penalty now also catches `institutiones ...`, which removed that low-value Latin candidate from the next diverse NLM selection.

### 4. One more bounded frontier batch landed cleanly

With the repaired runner and cleaner frontier, the next uncovered-family batch completed successfully:

- 4 NLM works
- 10 Wellcome works

Selected NLM works:

- `Jewett's Family physician`
- `The farmer's materia medica`
- `The practical household physician`
- `A compend of materia medica, therapeutics, and prescription writing`

Selected Wellcome works:

- `A practical synopsis of the materia alimentaria and materia medica`
- `A manual of hygiene, public and private, and compendium of sanitary laws`
- `A companion to the British pharmacopoeia`
- `Good health`
- `A system of materia medica and pharmacy`
- `Observations on the nature and treatment of the variolous abscess ...`
- `Domestic economy`
- `Dental medicine, a manual of dental materia medica and therapeutics`
- `A medicinal dictionary`
- `The family guide to health`

## Current totals after this pass

Corpus totals now:

- `2,720` registered works
- `787` locally acquired and chunked works
- `1,932` discovered works still queued
- `1` failed work
- `1,028,784` total chunk records
- `1,187,612` total paragraph records

Collection mix now:

- `27` Project Gutenberg works
- `260` NLM Digital Collections works
- `500` Wellcome Collection works

Net change during this pass:

- `+15` chunked works
- `-14` discovered works
- `-1` failed work
- `+24,819` chunk records
- `+25,394` paragraph records

## Semantic-layer totals after the rebuild

- frontier families: `1,285`
- uncovered families: `1,215`
- depth families: `188`
- evidence signals: `798,035`
- herb candidates: `58,195`
- graph nodes: `58,263`
- graph edges: `336,719`
- term families: `57,274`
- accepted families: `54,212`
- accepted plant families: `53,891`
- seed-ready families: `125`
- supporting families: `90`
- herb profiles: `125`
- herb-profile matched chunks: `71,962`

## Verification

Verified:

- `wellcome-qc9bzfnh` is active again under the normal corpus paths and no longer inflates the Wellcome failure queue
- its active manifest reports `wellcome_pdf_local_ocr`, `1,065` chunks, and `1,802` paragraphs
- the repaired live batch completed with `failureCount: 0` for both NLM and Wellcome
- `corpus:reconcile` reported `updatedCount: 0` and `missingRegistryRowCount: 0`
- `report-status.mjs` now reports `787` chunked works and `1` remaining failed row
- the remaining failed row is still:
  - `nlm-101139425` - `Institutiones medicinae et miscellanea medica, etc`

## Why this matters

This pass improved both scale and trustworthiness:

1. a real Wellcome recovery edge case was repaired instead of being papered over
2. the batch orchestrator is now reliable from the current workspace root
3. the frontier stayed broad while dropping another non-English false positive
4. the archive crossed the `500`-work mark in the Wellcome lane and reached `787` chunked works overall

## Files updated or regenerated

Updated code:

- `scripts/corpus/build-wellcome-corpus.mjs`
- `scripts/corpus/build-acquisition-frontier.mjs`
- `scripts/corpus/run-frontier-batch.mjs`

Updated corpus and review artifacts:

- `corpus/registry/works.csv`
- `corpus/review/quarantine/2026-06-18-wellcome-thin-text/`
- `corpus/works/wellcome-qc9bzfnh/manifest.json`
- `corpus/works/wellcome-qc9bzfnh/work.md`
- `corpus/raw/wellcome-qc9bzfnh/`
- `corpus/normalized/wellcome-qc9bzfnh/`
- `corpus/chunks/wellcome-qc9bzfnh.jsonl`

Regenerated exports and derived layers:

- `corpus/exports/wellcome-corpus-summary.json`
- `corpus/exports/nlm-corpus-summary.json`
- `corpus/exports/frontier-batch-summary.json`
- `corpus/exports/acquisition-frontier-summary.json`
- `corpus/exports/corpus-evidence-summary.json`
- `corpus/exports/term-family-summary.json`
- `corpus/exports/seed-catalog-summary.json`
- `corpus/exports/herb-profile-summary.json`
- `corpus/derived/`

## Recommended next move

1. continue another bounded uncovered-family batch from the current `1,285`-family frontier
2. keep cooling the over-saturated family-physician ladder so broader household-health and materia-medica families rise sooner
3. leave the lone NLM `Institutiones ...` outlier in the review lane until the English-first filters are tightened further or the record is manually reviewed
