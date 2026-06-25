# Herbalisti Corpus Build Checkpoint

Date: 2026-06-17

## Objective

Recover the last two failed Wellcome books using only official, rights-cleared source material, without introducing web scraping or API-key-dependent acquisition.

## What changed

The Wellcome acquisition runner now handles a harder official-source case:

1. the root IIIF record can be a collection rather than a directly ingestible manifest
2. the child copy manifests can expose only an official PDF rendering, with no working text endpoint, ZIP rendering, or ALTO lane

To handle that, the runner now:

- resolves copy-level child manifests when the root record is a collection
- attempts the normal Wellcome text endpoint first
- attempts the existing ZIP and ALTO fallbacks next
- downloads the official copy PDF when no text lane is available
- runs a local OCR helper, `scripts/corpus/extract-pdf-ocr.py`, against that official PDF using the workspace-local OCR stack in `.tools/ocr-site/`

This stays inside the project rules:

- rights-cleared books only
- no web scraping
- no API-key-dependent source acquisition

## Recovered works

Processed: 2

Failures: 0

- `wellcome-t4jc2wma` - `Isagoges in rem herbariam libri duo / [Adriaan van de Spiegel].`
- `wellcome-zuph7pum` - `Ortus sanitatis.`

Recovery details:

- `wellcome-t4jc2wma` used copy manifest `b12062820_0002`
  - 311 pages processed
  - 293 nonempty OCR pages
  - 281,182 OCR characters before downstream normalization
- `wellcome-zuph7pum` used copy manifest `b12954500_0003`
  - 865 pages processed
  - 846 nonempty OCR pages
  - 1,357,863 OCR characters before downstream normalization

Both recovered works now record their actual acquisition path in the local work manifests:

- selected copy-manifest URL
- selected copy-manifest ID
- official PDF path
- OCR text path
- OCR summary metadata

## Current corpus totals after recovery

- 2,720 registered works
- 419 locally acquired and chunked works
- 2,301 discovered works still queued
- 0 failed works remaining

Current chunked works by collection:

- 27 Project Gutenberg works
- 272 Wellcome Collection works
- 120 NLM Digital Collections works

Current chunk totals from disk:

- 599,680 total chunk records
- 14,221 Project Gutenberg chunks
- 419,373 Wellcome chunks
- 166,086 NLM chunks

## Current frontier state after recovery

- 1,655 actionable family recommendations remain
- 1,622 uncovered families remain
- 33 depth families remain
- 0 failed-only families remain
- 2,202 discovered works still sit in uncovered families

Collection worklist balance:

- NLM: 402 frontier candidates remaining
- Wellcome: 1,253 frontier candidates remaining

## Current semantic totals after refresh

Evidence layer:

- 419 chunked works
- 479,437 chunk-signal records
- 38,289 herb candidates
- 38,357 graph nodes
- 214,303 graph edges

Term-family layer:

- 37,766 canonical families
- 35,597 accepted families
- 35,482 accepted plant-like families
- 115 accepted broader materia medica families
- 2,138 rejected families

Seed-catalog layer:

- 103 curated seed-ready families
- 57 supporting families
- 28,421 review families
- 6,901 excluded noise families

## Why this matters

This closes an important gap in the corpus build:

1. the active failure queue is now empty
2. rare image-only official sources are no longer dead ends
3. the archive can now keep broadening without silently losing historically important books that only survive as scanned PDF copies

## Recommended next move

Resume uncovered-family acquisition, with the same discipline:

1. continue breadth-first acquisition across domestic medicine, materia medica, and herbal reference families
2. keep the PDF OCR lane available only for official-source cases where no text, ZIP, or ALTO route exists
3. add a later cleanup pass for old registry notes so recovered rows do not carry repetitive historical failure strings forever
