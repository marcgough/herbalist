# Herbalisti Corpus Build Checkpoint

Date: 2026-06-17

## Objective

Push the local Herbalisti corpus further toward broad no-key coverage while adding a semantic organization layer for repeated editions and cross-collection variants.

## Current corpus state

- 2,720 registered works
- 309 locally acquired, normalized, and chunked works
- 2,403 queued works
- 8 failed works awaiting alternate official recovery

Chunk totals from disk:

- 390,507 total chunks
- 14,221 Project Gutenberg chunks
- 281,672 Wellcome Collection chunks
- 94,614 NLM Digital Collections chunks

Current collection mix:

- 27 Project Gutenberg works
- 211 Wellcome Collection works
- 71 NLM Digital Collections works

## Semantic archive progress

The archive now has a live edition-family layer.

Generated outputs:

- `corpus/derived/edition-families/families.csv`
- `corpus/derived/edition-families/memberships.csv`
- `corpus/derived/edition-families/families.json`
- `corpus/exports/edition-family-summary.json`

Current edition-family totals:

- 1,917 edition families
- 394 multi-work families
- 299 high-confidence families
- 1,581 medium-confidence families
- 37 low-confidence families

Current clustering rule:

- normalized title family
- creator signature when present
- exact-title fallback for unattributed records
- conservative handling of ambiguous anonymous records

This is intentionally bibliographic rather than interpretive. It groups likely editions and copies, but it does not assume text identity.

## Acquisition work completed in this pass

### NLM

- Processed 20 additional works
- No new failures
- Current local NLM count: 71 chunked works

### Wellcome

- Processed 30 additional works
- No new failures
- Current local Wellcome count: 211 chunked works

## Why this matters

The corpus is no longer only a pile of downloaded books. It now has the beginnings of an internal catalogue layer that can:

- collapse duplicate editions into navigable families
- help future search results prefer a canonical work record
- support edition-aware herb pages and chat answers
- keep provenance intact across multiple source collections

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

## Recommended next moves

1. Continue larger no-key acquisition passes across Wellcome and NLM.
2. Add a second semantic layer for title groups above edition families so broader series like `Domestic medicine` can be reviewed as catalog clusters without over-merging editions.
3. Begin the first evidence-extraction layer from the chunked corpus:
   - herb names
   - plant parts
   - preparations
   - cautions
   - condition mentions
4. Start review rules for dangerous or obsolete treatment passages before public retrieval is built on top.
