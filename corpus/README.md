# Herbalisti Corpus

This folder is the local source archive for the Herbalisti book corpus.

It is designed as a semantic knowledge store rather than a loose file dump.

## Principles

- books only in the current phase
- no web scraping
- no API-key-dependent sources in the current phase
- every work registered before download
- every derived fact traceable back to a work and passage

## Structure

- `REGISTRY.md`
  - top-level corpus registry and orientation note
- `registry/`
  - acquisition and rights records
- `works/`
  - per-work canonical metadata and notes
- `raw/`
  - downloaded originals
- `normalized/`
  - extracted normalized text
- `chunks/`
  - retrieval-sized passage records
- `derived/`
  - edition families, evidence layers, herb profiles, and later retrieval exports
- `review/`
  - rights checks, editor flags, and dangerous-content review
- `exports/`
  - public-safe derivative outputs

The website should eventually read from this archive through `Corpus Memory`, not the other way around.
