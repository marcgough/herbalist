# Herbalisti Corpus Build Checkpoint

Date: 2026-06-17

## Objective

Recover the highest-value failed NLM works without widening the source scope, using only alternate official NLM routes when the normal OCR endpoint for a combined record is missing.

## What changed

The NLM acquisition runner now has a second official OCR fallback for combined multi-volume records:

- try the normal `-bk` OCR route first
- if that route returns an official missing-resource error, open the public NLM resource page and `mvset` catalog page
- collect any official `-mvpart` OCR links exposed there
- fetch those official part texts and concatenate them into one local source record with explicit part markers

This logic now lives in `scripts/corpus/build-nlm-corpus.mjs`.

The raw source records also now preserve the acquisition path that succeeded:

- `ocrUrlUsed`
- `attemptedOcrUrls`
- `alternativeOcrUrlsUsed`

## Recovered works

Processed: 7

Recovered with zero failures:

- `nlm-2543055R` - `American medical botany`
- `nlm-2543055RX1` - `American medical botany (Volume 1)`
- `nlm-2543055RX2` - `American medical botany (Volume 2)`
- `nlm-2543055RX3` - `American medical botany (Volume 3)`
- `nlm-101636340` - `Medicinal plants`
- `nlm-101636340X1` - `Medicinal plants (Volume 1)`
- `nlm-101636340X2` - `Medicinal plants (Volume 2)`

The recovered combined works now point to official part OCR sources in their raw source records. For example:

- `corpus/raw/nlm-2543055R/source-record.json` now records `2543055RX1`, `2543055RX2`, and `2543055RX3` as the successful alternate OCR sources
- `corpus/raw/nlm-101636340/source-record.json` now records `101636340X1` and `101636340X2` as the successful alternate OCR sources

## Current corpus totals after recovery

- 2,720 registered works
- 406 locally acquired and chunked works
- 2,312 discovered works still queued
- 2 failed works remaining overall

Current chunked works by collection:

- 27 Project Gutenberg works
- 265 Wellcome Collection works
- 114 NLM Digital Collections works

Current chunk totals from disk:

- 585,972 total chunk records
- 14,221 Project Gutenberg chunks
- 412,736 Wellcome chunks
- 159,015 NLM chunks

## Current frontier state after recovery

- 1,662 actionable family recommendations remain
- 1,633 uncovered families remain
- 27 depth families remain
- 2 failed-only families remain
- 2,245 discovered works still sit in uncovered families

Collection worklist balance:

- NLM: 407 frontier candidates remaining and 0 failed-only items
- Wellcome: 1,255 frontier candidates remaining and 2 failed-only items

## Current semantic totals after refresh

Evidence layer:

- 406 chunked works
- 469,686 chunk-signal records
- 37,717 herb candidates
- 37,785 graph nodes
- 210,475 graph edges

Term-family layer:

- 37,207 canonical families
- 35,075 accepted families
- 34,962 accepted plant-like families
- 113 accepted broader materia medica families
- 2,101 rejected families

Seed-catalog layer:

- 103 curated seed-ready families
- 58 supporting families
- 28,013 review families
- 6,788 excluded noise families

## Why this matters

This was a high-leverage recovery:

1. it restored two cornerstone medicinal-plant families instead of merely adding more marginal titles
2. it removed the active NLM failure queue without introducing any unofficial source path
3. it strengthened the future herbal database with exactly the sort of illustrated, plant-specific works the project is meant to preserve

## Recommended next move

Continue the breadth-first corpus build, but keep the same discipline:

1. exhaust official-source recovery paths for the remaining two failed Wellcome records
2. keep expanding uncovered title families before chasing depth
3. promote more seed-ready herb families only after the source base widens further
