# Herbalisti Corpus Build Checkpoint

Date: 2026-06-17

## Objective

Continue the Herbalisti corpus-first build under the locked constraints:

- books only
- rights-cleared or clearly public-domain material only
- no web scraping
- no API-key-dependent sources
- local acquisition first, then semantic organization

This pass focused on making the frontier batch selector more diversity-aware so each local acquisition run expands coverage instead of over-consuming repeated domestic-medicine and dispensatory variants.

## What changed

### 1. `run-frontier-batch.mjs` now defaults to a diversity-aware selector

The batch runner now prefers `selection-strategy=diverse` by default and keeps `--selection-strategy=top` only as a comparison mode.

The selector now scores candidates using:

- topic-signature repetition penalties
- title-cluster repetition penalties
- normalized title-series penalties
- creator-plus-title-series penalties
- lower queue-distance bias than before, so slightly lower-ranked but more diverse works can surface
- runtime quality penalties for low-value commercial or esoteric titles such as Beecham, Potter & Clarke, and clairvoyant/reminiscence material

This materially improved the selected mix, especially in the Wellcome lane, where repeated editions of the same dispensatory family had been crowding out broader practical coverage.

### 2. The next frontier batch was acquired locally and rebuilt cleanly

The batch runner completed a real acquisition pass with:

- 8 NLM works selected
- 12 Wellcome works selected
- 19 works processed successfully
- 1 NLM work left in `download_failed`

The failed NLM item was:

- `nlm-101139425` - `Institutiones medicinae et miscellanea medica, etc`

That failure is not a scraping issue or a rights issue. The runner found alternate official `mvpart` OCR routes, but the official OCR pages did not expose trusted text blocks, so there was no acceptable text to ingest automatically.

### 3. The semantic rebuild completed after acquisition

After acquisition, the orchestrated run completed:

- registry reconcile
- edition-family rebuild
- acquisition-frontier rebuild
- evidence rebuild
- term-family rebuild
- seed-catalog rebuild
- status refresh

## Current corpus totals after this pass

Registry totals:

- 2,720 total registered works
- 535 chunked works
- 2,184 discovered works
- 1 failed work

Chunked corpus mix:

- 174 NLM Digital Collections works
- 27 Project Gutenberg works
- 334 Wellcome Collection works

Chunk volume from local manifests:

- 734,646 total chunk records
- 220,366 NLM chunks
- 14,221 Project Gutenberg chunks
- 500,059 Wellcome chunks

Net growth since the previous checkpoint:

- 19 additional chunked works
- 22,519 additional chunk records

## Current semantic totals after rebuild

Acquisition frontier:

- 1,588 actionable title families
- 1,506 uncovered families
- 101 depth families
- 0 failed-only families
- 1,853 discovered works still sitting in uncovered families
- 331 discovered works sitting in depth families
- 351 current NLM frontier candidates
- 1,237 current Wellcome frontier candidates

Evidence layer:

- 583,528 chunk-signal records
- 45,309 herb candidates
- 2,673 high-confidence herb candidates
- 13,166 medium-confidence herb candidates
- 29,470 low-confidence herb candidates
- 45,377 graph nodes
- 259,354 graph edges

Term-family layer:

- 44,641 canonical families
- 42,104 accepted families
- 41,906 accepted plant families
- 198 accepted broader materia medica families
- 32 review families
- 2,505 rejected families

Seed-catalog layer:

- 112 seed-ready families
- 76 supporting families
- 33,477 review families
- 8,239 excluded families

## Notable new local coverage in this pass

NLM additions included stronger representation in:

- domestic medicine
- guide-to-health literature
- materia medica
- medicinal plants
- pharmacopoeia
- homoeopathic domestic medicine

Wellcome additions included stronger representation in:

- practical herbals
- medical botany
- household and family medicine
- dispensatories and pharmacopoeias
- medicinal-plant monographs

Representative successful works from this run:

- `nlm-63620260R` - `A guide to health`
- `nlm-64310710RX1` - `A new and comprehensive system of materia medica and therapeutics`
- `nlm-61660460R` - `Manual of the active principles of indigenous and foreign medicinal plants`
- `nlm-2548018R` - `Pharmacopoeia Londinensis, or, the London dispensatory`
- `wellcome-gfchkr25` - `Slack's herbal`
- `wellcome-jv6f25s7` - practical medical botany / preservation-of-health text
- `wellcome-fsbqzcgm` - `Illustration of the genus Cinchona`
- `wellcome-kwfrydbs` - `A manual of vegetable materia medica`

## Important operational note

The selector-side quality guard is now stronger than the frontier CSV penalties for some low-value titles. During inspection, some titles that should arguably have received frontier-level penalties still showed `candidate_title_penalty=0` in `frontier.csv`.

That does not block forward progress because the batch runner now filters them more aggressively at selection time, but the frontier-builder penalty audit is still worth revisiting so the CSV ranking itself stays truthful.

## Why this matters

This pass moved the project closer to the actual archive we want:

1. the corpus kept growing locally from appropriate book sources only
2. the selector became more aligned with breadth-first knowledge gathering
3. the semantic archive layers grew alongside the text corpus instead of lagging behind it
4. the corpus remains organized in a way that can map naturally onto a Corpus Memory retrieval architecture later

## Recommended next move

1. continue another moderate frontier batch with the new selector
2. add a small quarantine or watchlist layer for official-source records that are public domain but weak, commercial, or semantically off-target
3. start formalizing the Corpus Memory semantic storage layout for the herb profile layer, evidence nodes, source excerpts, and provenance links
