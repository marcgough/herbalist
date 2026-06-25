# Herbalisti Corpus Build Checkpoint

Date: 2026-06-16

## Objective

Build the Herbalisti local knowledge corpus from appropriate rights-cleared books only, with no web scraping and no API-key-dependent sources at this stage.

## What Was Built

### Corpus tooling

Added local corpus scripts:

- `scripts/corpus/build-gutenberg-corpus.mjs`
- `scripts/corpus/build-wellcome-corpus.mjs`
- `scripts/corpus/rebuild-text-derivatives.mjs`
- `scripts/corpus/report-status.mjs`
- `scripts/corpus/lib.mjs`

Added package scripts:

- `npm run corpus:gutenberg`
- `npm run corpus:wellcome`
- `npm run corpus:rebuild-derived`
- `npm run corpus:status`

### Source lanes now active

1. Project Gutenberg
2. Wellcome Collection

Both are official no-key collection paths.

## Current Corpus State

### Registry totals

- Total registered works: `2,024`
- Registered Project Gutenberg works: `27`
- Registered Wellcome works: `1,997`

### Locally acquired and processed works

- Total chunked works: `134`
- Project Gutenberg chunked works: `27`
- Wellcome chunked works: `107`

### Queue state

- Discovered but not yet acquired: `1,869`
- Failed acquisitions: `21`

### Chunk volume

- Total chunk records: `164,284`
- Project Gutenberg chunks: `14,221`
- Wellcome chunks: `150,063`

## Acquisition Notes

### Project Gutenberg

- Catalog source: official `pg_catalog.csv`
- Discovery scan size: `90,095` catalog rows
- Filtered relevant works: `27`
- Acquisition result: `27/27` processed successfully

This lane is currently the cleanest end-to-end source path and gives stable text files with clear public-domain-in-the-US status.

### Wellcome Collection

- Discovery mode uses the official catalogue API with open-access and public-domain filters.
- First discovery pass registered `1,287` relevant public-domain book records.
- After merge and dedupe against the working registry, the Wellcome registry now contains `1,997` records.
- First acquisition batch attempted: `120`
- Successful text acquisitions: `98`
- Failed text acquisitions: `22`

The first failed slice was then retried with an ALTO fallback taken from the manifest OCR package.

- Additional Wellcome recoveries via ALTO fallback: `9`
- Remaining Wellcome failures after retry: `21`

The remaining failures are mostly public-domain items where the IIIF manifest exists but the raw text endpoint and the ALTO route still do not produce usable text.

## Important Technical Finding

Wellcome raw text often arrives as OCR-heavy continuous text with weak line breaks. The first chunking pass treated some works as a single paragraph, which was not useful for retrieval.

This has now been corrected by:

- splitting oversized OCR text into sentence and word-based pseudo-paragraphs
- rebuilding the derived normalized text and chunk files from the already-downloaded raw sources

After the rebuild, the processed Wellcome works now produce usable retrieval chunks at corpus scale.

## Files and Evidence

Core registry:

- `corpus/registry/works.csv`
- `corpus/registry/collections.csv`

Current summary exports:

- `corpus/exports/project-gutenberg-corpus-summary.json`
- `corpus/exports/wellcome-corpus-summary.json`

Semantic registry:

- `corpus/REGISTRY.md`

Per-work artifacts:

- `corpus/raw/<work-id>/`
- `corpus/normalized/<work-id>/`
- `corpus/chunks/<work-id>.jsonl`
- `corpus/works/<work-id>/manifest.json`
- `corpus/works/<work-id>/work.md`

## Quality and Governance Notes

- No web scraping was used.
- No API-key-dependent source was used.
- Only official source lanes were used for acquisition.
- Wellcome intake is currently restricted to open public-domain-mark items in the active scripted lane.
- Rights and provenance are preserved in the registry and in each per-work manifest.

## Known Gaps

1. Wellcome `404` text endpoints need a fallback path:
   - fetch manifest
   - download PDF where available
   - preserve item locally
   - add later OCR or page-level extraction path for the remaining unresolved items

2. The Wellcome registry currently contains many edition variants and duplicate historical printings.
   A later pass should cluster these into work families so the public interface can show one canonical work with edition children.

3. NLM Digital Collections has not yet been added as a live acquisition lane because the official machine-readable query syntax still needs confirming.

4. The current build creates chunked text corpora, but not yet:
   - extracted herbs
   - extracted cautions
   - claim/evidence tables
   - semantic embeddings

## Recommended Next Step

The highest-value next move is:

1. add a Wellcome PDF fallback for raw-text `404` items
2. continue Wellcome acquisition in larger batches
3. confirm and add the NLM web-service acquisition lane
4. begin entity and caution extraction over the 125 locally processed works

That sequence grows the local corpus while also starting to turn it into a retrieval-grade herbal evidence database.
