# Herbalisti Corpus Build Checkpoint

Date: 2026-06-17

## Objective

Continue growing the local Herbalisti knowledge corpus from official, no-key, rights-cleared book sources while tightening the acquisition frontier so it prefers actual books over peripheral ephemera.

This pass focused on:

- filtering the acquisition frontier to suppress obviously non-book title shapes
- running the next family-aware frontier batch from that cleaner book-only worklist
- rebuilding the downstream semantic layers from the expanded local archive

## What changed

### 1. The frontier now rejects obvious non-book title patterns

`scripts/corpus/build-acquisition-frontier.mjs` now excludes titles that are likely to be ephemera rather than books when ranking the next acquisition candidate for a family.

The current filter suppresses patterns such as:

- `synopsis of lectures`
- introductory addresses tied to openings or ceremonies
- druggist sale notices
- `for sale`
- `price list`
- `circular`
- `announcement`
- `prospectus`

That keeps the next acquisition wave closer to the user's stated corpus goal: practical, rights-cleared books rather than adjacent catalog notices or institutional fragments.

### 2. The next book-only frontier batch completed cleanly

The batch runner acquired:

- 8 NLM Digital Collections works
- 8 Wellcome Collection works
- 0 failed works

Notable additions in this pass include:

- `A dictionary of popular medicine and hygiene`
- `The first edition of Steward's healing art`
- `An improved system of botanic medicine`
- `The American dispensatory`
- `The family physician; or, Domestic medical friend`
- `A catalogue of Indian medicinal plants and drugs`
- `A pocket herbal`
- `Botanicum officinale`

### 3. The semantic layers were rebuilt from the larger archive

After acquisition, the batch runner rebuilt:

- edition families
- the acquisition frontier
- corpus evidence
- term families
- the seed catalog

That means the retrieval-facing layers now reflect the additional books immediately rather than waiting for a later maintenance pass.

## Current corpus totals after this batch

Corpus totals:

- 2,720 registered works
- 495 locally acquired and chunked works
- 2,225 discovered works still queued
- 0 failed works

Chunked corpus mix:

- 27 Project Gutenberg works
- 310 Wellcome Collection works
- 158 NLM Digital Collections works

Current chunk volume:

- 688,720 total chunk records
- 14,221 chunks from Project Gutenberg
- 468,655 chunks from Wellcome Collection
- 205,844 chunks from NLM Digital Collections

This batch increased the live local archive by:

- 16 additional chunked works
- 15,143 additional chunk records

## Current semantic totals after rebuild

Acquisition frontier:

- 1,608 actionable family recommendations
- 1,546 uncovered families
- 81 depth families
- 0 failed-only families
- 364 current NLM frontier candidates
- 1,244 current Wellcome frontier candidates

Evidence layer:

- 495 chunked works covered
- 547,468 chunk-signal records
- 43,212 herb candidates
- 2,507 high-confidence herb candidates
- 12,715 medium-confidence herb candidates
- 27,990 low-confidence herb candidates
- 43,280 graph nodes
- 247,236 graph edges
- 9 caution signals
- 25 preparation signals
- 20 condition signals

Term-family layer:

- 42,576 canonical families
- 40,173 accepted families
- 39,988 accepted plant-like families
- 185 accepted broader materia medica families
- 31 review families
- 2,372 rejected families

Seed-catalog layer:

- 112 seed-ready families
- 73 supporting families
- 31,966 review families
- 7,835 excluded noise families

## Why this matters

This was a solid corpus-quality pass for three reasons:

1. it tightened the acquisition logic around actual books before adding more volume
2. it increased local full-text coverage without introducing new source failures
3. it pushed the semantic archive forward in lockstep, so retrieval quality can improve continuously as the corpus grows

## Files updated

- `scripts/corpus/build-acquisition-frontier.mjs`
- `corpus/derived/acquisition-frontier/`
- `corpus/works/`
- `corpus/raw/`
- `corpus/normalized/`
- `corpus/chunks/`
- `corpus/exports/frontier-batch-summary.json`
- `corpus/exports/acquisition-frontier-summary.json`
- `corpus/exports/corpus-evidence-summary.json`
- `corpus/exports/term-family-summary.json`
- `corpus/exports/seed-catalog-summary.json`

## Recommended next move

1. continue the book-only frontier acquisition in similar 8 plus 8 batches while failures remain at zero
2. add a second relevance filter that can demote clearly devotional, ceremonial, or merchandise-adjacent titles even when they are technically books
3. begin shaping the first herb-profile output schema from the 112 seed-ready families and 73 supporting families already present in the archive
