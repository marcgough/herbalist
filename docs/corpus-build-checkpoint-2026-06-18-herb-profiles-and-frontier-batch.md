# Herbalisti Corpus Build Checkpoint

Date: 2026-06-18

## Objective

Keep the Herbalisti corpus moving in the book-first direction by:

1. turning the new seed-ready herb layer into a durable semantic archive surface
2. running another rights-cleared acquisition batch from official book sources only
3. preserving the resulting state in a form that can later back a retrieval and chat experience

This pass stayed inside the current guardrails:

- books only
- no web scraping
- no API-key-dependent sources
- official or clearly rights-cleared acquisition lanes only

## What changed

### 1. The herb-profile archive layer is now proven in the live batch workflow

The new builder at:

- `scripts/corpus/build-herb-profiles.mjs`

is now part of the regular derived rebuild path. It creates a durable profile envelope for each seed-ready herb family using:

- `corpus/derived/seed-catalog/seed-ready-families.csv`
- `corpus/derived/evidence/chunk-signals.jsonl`
- `registry/works.csv`

Each profile preserves:

- canonical herb identity
- source-family provenance
- curator decision notes
- co-mentioned plant parts
- co-mentioned preparations
- co-mentioned cautions
- co-mentioned conditions
- representative supporting works
- representative source-linked passages

The output lives under:

- `corpus/derived/herb-profiles/`

and publishes:

- `corpus/exports/herb-profile-summary.json`

Important archive rule:

These profiles summarize historical co-mentions only. They do not assert efficacy or replace later editorial review.

### 2. The diversity-aware frontier selector now handles long subtitle variants more cleanly

While testing the next acquisition batch, the selector was still willing to place multiple long-form `London dispensatory` variants in the same run because some records used:

- `Title : subtitle`

and others used:

- `Title, containing ...`

The title-series extraction logic in:

- `scripts/corpus/run-frontier-batch.mjs`

was tightened so comma-led descriptive subtitles collapse into the same normalized series key as colon-led subtitles. The selector also applies stronger penalties for repeated series and repeated creator-plus-series combinations.

Practical result:

- the same batch no longer selects multiple near-duplicate `London dispensatory` witnesses together
- the frontier mix stays broader across families, topics, and collections

### 3. A new official-source acquisition batch completed successfully

Executed batch:

- 6 additional NLM works
- 8 additional Wellcome works

All 14 completed with no new source failures.

Representative additions from this pass include:

- `Guide to health , with remarks on the cholera`
- `The home physician, or, A treatise upon the cure of diseases by the botanical system of medicine`
- `The hygienic family physician`
- `The London dispensatory`
- `Catalogue of medicinal plants, according to their natural orders`
- `The ladies dispensatory`
- `Domestic medicine; or, the family physician`

The batch then rebuilt:

- edition families
- acquisition frontier
- evidence layer
- term families
- seed catalog
- herb profiles
- corpus status summary

## Current authoritative corpus totals

From the latest local manifests and exports:

- 2,720 registered works
- 549 locally acquired, normalized, and chunked works
- 2,170 discovered works still queued
- 1 currently failed work
- 755,516 total chunk records

Current collection mix:

- 27 Project Gutenberg works / 14,221 chunks
- 342 Wellcome works / 515,852 chunks
- 180 NLM works / 225,443 chunks

## Current semantic layer totals

### Acquisition frontier

- 1,578 actionable title families
- 1,492 uncovered families
- 105 depth families
- 0 failed-only families

Current collection worklists:

- NLM: 345 frontier candidates
- Wellcome: 1,233 frontier candidates

### Evidence layer

- 597,462 chunk-signal records
- 46,204 herb candidates
- 2,742 high-confidence herb candidates
- 13,326 medium-confidence herb candidates
- 30,136 low-confidence herb candidates
- 46,272 graph nodes
- 264,218 graph edges

### Term-family layer

- 45,516 canonical families
- 42,940 accepted families
- 42,736 accepted plant families
- 204 accepted broader materia medica families
- 32 review families
- 2,544 rejected families

### Seed-catalog layer

- 112 seed-ready families
- 75 supporting families
- 34,131 review families
- 8,416 excluded noise families

### Herb-profile layer

- 112 herb profiles
- 48,861 matched chunks
- all 112 profiles currently have preparation, condition, caution, and plant-part signals

Largest current profile envelopes by chunk coverage include:

- `Lemon`
- `Chamomile`
- `Senna`
- `Castor`
- `Olive`
- `Rose`

## Why this matters

This pass was useful in two ways at once.

First, it deepened the archive shape. We now have a real per-herb semantic layer that looks much closer to the end-state retrieval system than a simple pile of source texts.

Second, it widened the evidence base behind that layer without breaking the source rules. We are still gathering from books only, with no scraping and no API-key dependency, but the semantic outputs are already becoming rich enough to support a later website search and source-grounded chat interface.

## Recommended next move

1. continue moderate uncovered-family acquisition batches from NLM and Wellcome to widen the corpus before spending effort on a public UI
2. begin a second semantic envelope layer for non-herb but still useful material such as preparations, substances, and broader materia medica entries
3. add a curator-facing review lane for high-value review families so we can intentionally promote the next wave beyond the first 112 seed-ready herbs
