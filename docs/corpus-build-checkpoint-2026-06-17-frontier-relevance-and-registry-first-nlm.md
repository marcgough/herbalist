# Herbalisti Corpus Build Checkpoint

Date: 2026-06-17

## Objective

Keep growing the Herbalisti local book corpus while improving the quality of frontier selection so the next acquisitions favor practical, rights-cleared health and herbal works rather than merely book-like matches.

This pass focused on:

- tightening frontier relevance around practical medical and herbal books
- reducing repeated exposure to already well-represented Culpeper and complete-herbal variants
- fixing the NLM exact-work-ID path so curated frontier batches can run from the local registry without rediscovering the whole NLM lane first

## What changed

### 1. The acquisition frontier now knows more about relevance, redundancy, and auditability

`scripts/corpus/build-acquisition-frontier.mjs` now adds three important layers on top of the earlier non-book filter:

- title penalties for devotional, ornamental, animal-husbandry-heavy, and other lower-priority practical-health titles
- a non-English title penalty layer for clearly Welsh or otherwise non-English-leading titles that are less useful for the first English-language retrieval experience
- a saturation-aware penalty for Culpeper, `English physician`, and `complete herbal` style titles once the corpus already contains many chunked witnesses from that same cluster

The frontier export is also more auditable now because it records:

- `candidate_title_penalty`
- `candidate_topic_score`

That makes it easier to inspect why a title rose or fell instead of treating the frontier as a black box.

### 2. The NLM runner now supports registry-first exact work-ID acquisition

`scripts/corpus/build-nlm-corpus.mjs` previously always ran a fresh NLM discovery sweep before trying to process requested work IDs. That became a problem for frontier-driven batches because:

- the frontier already chooses exact known NLM work IDs from the local registry
- the NLM discovery endpoint started returning `400 Bad Request` in that exact-ID path

The runner now:

- loads requested work IDs first
- checks whether those NLM rows already exist in the local registry
- skips rediscovery when the requested IDs are already present locally
- builds the source-record map from the registry so OCR acquisition still works in that registry-first mode

That removed the `400` failure and let exact-ID NLM frontier acquisition proceed cleanly again.

### 3. The next vetted corpus slice completed successfully

After the frontier and NLM fixes, the acquisition flow completed with:

- 1 manual retry of the first NLM work after the registry-first bug fix
- 8 additional NLM frontier works
- 12 additional Wellcome frontier works
- 0 remaining failed works in the corpus

The 20-work frontier batch itself finished with no source failures, and the earlier one-off NLM retry is now fully normalized inside the corpus.

## Current corpus totals after this pass

Corpus totals:

- 2,720 registered works
- 516 locally acquired and chunked works
- 2,204 discovered works still queued
- 0 failed works

Chunked corpus mix:

- 27 Project Gutenberg works
- 322 Wellcome Collection works
- 167 NLM Digital Collections works

Current chunk volume:

- 712,127 total chunk records
- 14,221 chunks from Project Gutenberg
- 484,202 chunks from Wellcome Collection
- 213,704 chunks from NLM Digital Collections

Net archive growth since the previous checkpoint:

- 21 additional chunked works
- 23,407 additional chunk records

## Current semantic totals after rebuild

Acquisition frontier:

- 1,598 actionable family recommendations
- 1,525 uncovered families
- 92 depth families
- 0 failed-only families
- 355 current NLM frontier candidates
- 1,243 current Wellcome frontier candidates

Evidence layer:

- 516 chunked works covered
- 566,165 chunk-signal records
- 44,264 herb candidates
- 2,581 high-confidence herb candidates
- 13,023 medium-confidence herb candidates
- 28,660 low-confidence herb candidates
- 44,332 graph nodes
- 253,055 graph edges

Term-family layer:

- 43,613 canonical families
- 41,132 accepted families
- 40,940 accepted plant-like families
- 192 accepted broader materia medica families
- 31 review families
- 2,450 rejected families

Seed-catalog layer:

- 112 seed-ready families
- 75 supporting families
- 32,717 review families
- 8,034 excluded noise families

## Notable new local works in this pass

NLM:

- `Medical information for the million`
- `The female's guide to health`
- `The Indian guide to health`
- `The principles of hydropathy`
- `A popular cyclopedia of modern domestic medicine`
- `Modern domestic medicine`

Wellcome:

- `Herbal. A boke of the propertyes of herbes...`
- `Ram's little Dodeon`
- `The British herbal`
- `The new family herbal`
- `The useful family herbal`
- `The woman's medical companion and guide to health`
- `Translation of the Pharmacopoeia of the Royal College of Physicians, of London, 1851`
- `The family physician : a manual of domestic medicine`

## Why this matters

This pass mattered for both quantity and control:

1. it made the frontier more opinionated about what is genuinely useful for the Herbalisti archive
2. it fixed a live NLM batch-acquisition failure in a way that fits the corpus-first architecture
3. it increased local full-text coverage across herbal, domestic medicine, hygiene, dietetics, and pharmacopoeia without introducing new failures
4. it preserved the "rights-cleared books only, no scraping, no API keys" constraint while still keeping momentum high

## Files updated

- `scripts/corpus/build-acquisition-frontier.mjs`
- `scripts/corpus/build-nlm-corpus.mjs`
- `corpus/works/`
- `corpus/raw/`
- `corpus/normalized/`
- `corpus/chunks/`
- `corpus/derived/acquisition-frontier/`
- `corpus/exports/frontier-batch-summary.json`
- `corpus/exports/nlm-corpus-summary.json`
- `corpus/exports/wellcome-corpus-summary.json`
- `corpus/exports/acquisition-frontier-summary.json`
- `corpus/exports/corpus-evidence-summary.json`
- `corpus/exports/term-family-summary.json`
- `corpus/exports/seed-catalog-summary.json`

## Recommended next move

1. continue the frontier in another moderate slice, but consider a stronger diversity preference inside the Wellcome lane so practical herbals and non-herbal medical references alternate more deliberately
2. start promoting more high-value plant families from the large accepted layer into the seed-ready and supporting layers now that the corpus has crossed 500 local works
3. begin defining the first herb-profile retrieval schema directly from the stronger evidence, term-family, and seed-catalog layers already on disk
