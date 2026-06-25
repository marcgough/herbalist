# Herbalisti Corpus Build Checkpoint

Date: 2026-06-17

## Objective

Continue the rights-cleared, no-key, books-only corpus build and push the official-source lanes deeper without using web scraping.

## Current corpus state

- 2,720 total registered works
- 259 locally acquired, normalized, and chunked works
- 2,453 queued works
- 8 failed works awaiting alternate official recovery

Chunk totals from disk:

- 319,917 total chunks
- 14,221 Project Gutenberg chunks
- 244,982 Wellcome Collection chunks
- 60,714 NLM Digital Collections chunks

Current collection mix:

- 27 Project Gutenberg works
- 181 Wellcome Collection works
- 51 NLM Digital Collections works

## What changed in this pass

### NLM expansion

- Ran a larger NLM batch and processed 27 additional works locally.
- The NLM queue now skips known `download_failed` records unless `--retry-failed=true` is explicitly passed.
- This pass surfaced a second official OCR-missing family:
  - `nlm-101636340`
  - `nlm-101636340X1`
  - `nlm-101636340X2`

### Wellcome expansion

- Ran a larger Wellcome batch and processed 49 additional works locally.
- Hardened `build-wellcome-corpus.mjs` so it now:
  - skips known `download_failed` records by default
  - retries them only when `--retry-failed=true` is passed
  - saves registry progress after each processed item
  - marks failed items as `manual_retry_required`
- This pass surfaced one current official-text outlier:
  - `wellcome-zuph7pum` (`Ortus sanitatis.`)

## Current failure inventory

NLM OCR-missing families:

- Bigelow `American medical botany`
  - `nlm-2543055R`
  - `nlm-2543055RX1`
  - `nlm-2543055RX2`
  - `nlm-2543055RX3`
- Millspaugh `Medicinal plants`
  - `nlm-101636340`
  - `nlm-101636340X1`
  - `nlm-101636340X2`

Wellcome official-text outlier:

- `wellcome-zuph7pum`

## Emerging curation note

The broader Wellcome lane is now surfacing multilingual and globally sourced materia medica texts, not only English-language UK material. That is valuable for corpus breadth, but the public Herbalisti experience may later want an explicit presentation filter for language and geography even if the archive keeps the broader source base.

## Recommended next moves

1. Keep running larger Wellcome and NLM batches until the no-key official queues are materially reduced.
2. Start edition-family clustering and deduplication so repeated title families can later be presented as linked editions rather than isolated records.
3. Investigate alternate official recovery paths for the 8 failed works.
4. Begin the first derived evidence layers: herb names, preparations, cautions, and condition mentions linked back to passages.
