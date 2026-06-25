# Herbalisti Corpus Build Checkpoint

Date: 2026-06-19
Checkpoint: Botanical selector profile, 21-work expansion, Corpus Memory refresh

## What changed

This pass shifted the acquisition workflow from broad reference gathering toward a more botanical editorial lane.

Two structural changes landed first:

- `scripts/corpus/select-curated-reference-candidates.mjs` now accepts reusable frontier-profile JSON directly
- a new profile, `corpus/review/frontier-profiles/botanical-reference-2026-06-19.json`, now biases discovered-work review toward herbals, floras, medico-botanical glossaries, vegetable materia medica, and plant-centered regional references

That profile was then used as the starting point for a curated registry review and acquisition pass.

## New works acquired in this pass

### NLM Digital Collections

- `nlm-61631000R` - `The family flora and materia medica botanica`
- `nlm-2558003RX1` - `An improved system of botanic medicine` (Volume 1)
- `nlm-2558003RX2` - `An improved system of botanic medicine` (Volume 2)
- `nlm-2661459RX3` - `Flora Londinensis` (Volume 1, Part 3)
- `nlm-64231020R` - `Wilkinson's botanico-medical practice`
- `nlm-64210310R` - `The complete herbalist`
- `nlm-101526707` - `Lexicon-medicum, or, Medical dictionary`
- `nlm-2542052R` - `Collections for an essay towards a materia medica of the United-States`
- `nlm-2574016R` - `The American new dispensatory`
- `nlm-2575008R` - `New guide to health, or, Botanic family physician`

### Wellcome Collection

- `wellcome-njb9evvk` - `A botanical arrangement of British plants`
- `wellcome-tp8ryc8k` - `A glossary of botanical terms`
- `wellcome-pksm5zt9` - `A manual of vegetable materia medica`
- `wellcome-c2a6ce6m` - `Wilkinson's botanico-medical practice`
- `wellcome-vrrn2a38` - `The farmer's materia medica`
- `wellcome-w2zrsz42` - `The vegetable materia medica of western India`
- `wellcome-qzqghnfu` - `The materia medica of the Hindus`
- `wellcome-xrjheg64` - `Resources of the southern fields and forests`
- `wellcome-bpcvg8n7` - `Flora Scotica`
- `wellcome-es98ncs2` - `Flora of British India`
- `wellcome-e45my5w6` - `Alphita : a medico-botanical glossary`

## One unfinished candidate

One targeted Wellcome title did not complete cleanly in this pass:

- `wellcome-n2yp92tq` - `The elements of botany, structural, physiological, systematical, and medical`

What happened:

- the work stalled twice inside `build-wellcome-corpus.mjs`
- each stalled worker kept the works-registry lock after it stopped making progress
- the stale workers were stopped after confirming they were idle
- the stale lock directories were removed only after verifying the owning process was gone

Current state:

- the title remains in `discovered` state
- it should be treated as a later recovery candidate, not as a completed ingestion

## Corpus totals after rebuild

Current live archive totals:

- total works: `2,720`
- chunked works: `1,079`
- discovered works: `1,639`
- failed works: `2`
- total chunk records: `1,344,214`
- total paragraph records: `1,543,669`

By collection:

- NLM Digital Collections: `368` chunked / `326` discovered / `2` failed
- Project Gutenberg: `27` chunked
- Wellcome Collection: `684` chunked / `1,313` discovered

Derived layers after rebuild:

- edition families: `1,866`
- multi-work families: `411`
- high-confidence families: `294`
- frontier families: `1,072`
- uncovered families: `988`
- herb candidates: `74,816`
- high-confidence herb candidates: `4,822`
- graph nodes: `74,884`
- graph edges: `433,913`
- herb profiles: `124`
- herb-profile matched chunks: `99,397`
- seed-ready families: `124`
- supporting families: `121`
- review families: `55,849`

Local corpus footprint:

- files: `9,256`
- size: `9.188 GB`

## Corpus Memory refresh

`Corpus Memory` was refreshed after the rebuild.

Ingest result:

- received: `3,069`
- inserted: `21`
- updated: `3,048`
- pruned: `0`
- work summaries: `1,079`
- edition families: `1,866`
- herb profiles: `124`

Verified live stats after restart:

- total indexed retrieval documents: `3,069`
- `work-summary`: `1,079`
- `edition-family`: `1,866`
- `herb-profile`: `124`

Verified retrieval:

- query `Alphita medico-botanical glossary` returned the newly indexed `wellcome-e45my5w6` work summary
- query `Flora Londinensis medicinal plants` returned the expected Flora Londinensis family in Corpus Memory

## Why this pass matters

This moved the archive in a better direction than another generic reference slice would have done.

The corpus is now richer in:

- herbals
- plant glossaries
- botanical dictionaries
- regional floras
- vegetable materia medica
- botanic-medicine witnesses

That should materially improve the later herb database, citation trails, and plant-centered retrieval experience.

## Recommended next action

Continue with another botanical-reference pass, but keep it split into two lanes:

1. a selector-driven lane for clean botanical and glossary families
2. a manual recovery lane for stubborn or unusually slow Wellcome witnesses such as `wellcome-n2yp92tq`
