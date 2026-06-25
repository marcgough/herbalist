# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the first clean run after separating `Corpus Memory` from the shared working-memory service and then resuming the Herbalisti corpus goal.

The main outcomes were:

- the works registry was cleaned so malformed rows and repeated note fragments no longer pollute later retrieval text
- `Corpus Memory` gained stale-document pruning during full ingests, which keeps its family and work counts aligned with the rebuilt corpus
- a curated 14-work expansion was completed from rights-cleared official lanes only
- the derived evidence, frontier, family, and herb-profile layers were rebuilt from the expanded archive

## Curated acquisitions completed

### NLM Digital Collections

- `nlm-101646760` - A manual of organic materia medica and pharmacognosy
- `nlm-61631010R` - The family flora and materia medica botanica
- `nlm-101526711` - Lexicon medicum, or, Medical dictionary
- `nlm-101602774` - A conspectus of the pharmacopoeias of the London, Edinburgh, and Dublin Colleges of Physicians, and of the United States pharmacopoeia
- `nlm-2571053R` - Flora Carolinaeensis
- `nlm-101646485` - A compend of materia medica, therapeutics, and prescription writing

### Wellcome Collection

- `wellcome-b7ehehck` - The London dispensatory
- `wellcome-zcj4t6ha` - A dispensatory, or commentary on the pharmacopoeias of Great Britain
- `wellcome-pcsy3x7m` - A manual of materia medica and therapeutics
- `wellcome-jemf85pr` - Medical flora, or, Manual of the medical botany of the United States of North America
- `wellcome-jdffa4nu` - A manual of vegetable materia medica
- `wellcome-aseuuvn7` - Extra pharmacopoeia
- `wellcome-maqqmyv3` - General therapeutics and materia medica
- `wellcome-yme2hr8u` - Pharmacopoeia domestica, or, the family dispensatory

All 14 processed successfully.

## Current corpus totals

- registered works: `2720`
- chunked works: `1018`
- discovered works: `1700`
- failed works: `2`
- chunk records: `1244758`
- paragraph records: `1430377`

### By collection

- NLM Digital Collections: `338` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `653` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1111`
- herb candidates: `69546`
- seed-ready herb families: `124`
- supporting families: `123`
- total seed-review families: `51697`
- promotion candidates: `78`
- identity-review candidates: `24`
- secondary candidates: `48085`
- deprioritized candidates: `3510`
- thin-work review flags: `138`

### Local footprint

- files: `8744`
- size: `8.54 GB`

## Corpus Memory status

`Corpus Memory` is live again at `127.0.0.1:8766`.

Verified totals after the prune-aware re-ingest:

- total documents: `3008`
- `edition-family`: `1866`
- `work-summary`: `1018`
- `herb-profile`: `124`

Latest ingest result:

- received: `3008`
- inserted: `0`
- updated: `3008`
- pruned: `1`

That final prune removed the stale edition-family document that was left behind after the family-count rebuild.

## Selector note

The English practical-reference frontier profile was tightened again after dry runs surfaced several low-value shapes that still looked attractive numerically:

- testimonials
- lecture notes
- prize examinations
- nurse diaries
- jail-management reports
- narrow pharmacopoeia administrative pamphlets

This should make the next automated intake slices calmer and more book-like.

## Recommended next move

Continue with another curated reference-heavy pass, biased toward:

- medical botany
- medicinal plant manuals
- major dispensatories
- practical pharmacopoeia references
- strong household and hygiene references that are not just repetitive family-physician variants
