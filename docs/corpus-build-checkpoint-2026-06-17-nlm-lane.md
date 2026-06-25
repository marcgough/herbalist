# Herbalisti Corpus Checkpoint - 2026-06-17 NLM Lane

Date: 2026-06-17

## Active Goal

Build the Herbalisti corpus as a broad local archive of rights-cleared books only.

For this phase:

- no web scraping
- no API-key-dependent sources
- no modern copyrighted books
- no thin seed-only dataset

The working model is still a Corpus Memory semantic archive:

`collection -> work -> section -> passage -> derived evidence`

## What Changed

Added a third official no-key source lane:

- NLM Digital Collections

New local script:

- `scripts/corpus/build-nlm-corpus.mjs`

New npm command:

- `npm run corpus:nlm`

New dependency:

- `playwright-core`

## Why The NLM Lane Works This Way

The official NLM search service is machine-readable and stable:

- `https://wsearch.nlm.nih.gov/ws/query`

The catalog record for each book then exposes official per-work download routes:

- catalog page
- OCR text page
- PDF page

In practice, NLM currently puts a browser challenge in front of plain HTTP access to the collections host. Because of that, the corpus builder uses:

1. the official NLM web service for discovery
2. a local browser runtime for OCR retrieval from the official OCR route

This keeps the lane source-led and local without introducing web scraping against arbitrary sites.

## Current Corpus State

After the 2026-06-17 run:

- total registered works: `2,720`
- total chunked works: `144`
- total queued works: `2,552`
- total failed works: `24`

By collection:

- Project Gutenberg: `27` total, `27` chunked
- Wellcome Collection: `1,997` total, `107` chunked, `21` failed
- NLM Digital Collections: `696` total, `10` chunked, `3` failed

## NLM Discovery And Intake Result

Current NLM discovery summary:

- scanned result rows: `9,630`
- currently matched rights-cleared discovery records: `691`
- locally processed in the current verified batch: `10`
- verified OCR failures quarantined: `3`

Examples now locally acquired:

- `nlm-2573006R` - *The American herbal, or materia medica*
- `nlm-2542066R` - *Vegetable materia medica of the United States, or, Medical botany*
- `nlm-101312479` - *Domestic medicine*
- `nlm-101230724` - *The medical companion, or family physician*

## Quality Guard Added

The first NLM batch exposed a failure mode where some OCR routes return a short error page instead of real text.

The NLM script now rejects OCR results when:

- the OCR page says the resource is missing
- the extracted OCR text is implausibly short for a book-level work

Bad records from the first pass were removed from the active corpus and archived under:

- `corpus/review/quarantine/2026-06-17-nlm-ocr-missing/`

## Important Storage Decision

We are keeping the Corpus Memory structure.

That means:

- one semantic registry at `corpus/REGISTRY.md`
- one row per work in `corpus/registry/works.csv`
- durable per-work manifests in `corpus/works/<work-id>/`
- raw source preservation in `corpus/raw/<work-id>/`
- normalized text in `corpus/normalized/<work-id>/`
- passage chunks in `corpus/chunks/`
- quarantine and recovery notes in `corpus/review/`

This is the right structure for a future herbal search and chat system because it preserves provenance and lets every answer point back to real passages.

## Next Recommended Steps

1. Continue NLM acquisition in controlled batches until the highest-value public-domain book set is locally stored.
2. Add a Wellcome PDF-first fallback for the remaining `21` failed Wellcome items.
3. Add dedupe review rules for edition clusters across Gutenberg, Wellcome, and NLM.
4. Start building derived evidence layers on top of the real corpus:
   - herbs
   - preparations
   - cautions
   - traditional uses
   - source-linked passage evidence

## Key Files

- `scripts/corpus/build-nlm-corpus.mjs`
- `corpus/exports/nlm-corpus-summary.json`
- `corpus/REGISTRY.md`
- `corpus/review/quarantine/2026-06-17-nlm-ocr-missing/README.md`
