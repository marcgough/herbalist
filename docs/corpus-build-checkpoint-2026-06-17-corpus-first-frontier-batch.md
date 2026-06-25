# Herbalisti Corpus Build Checkpoint

Date: 2026-06-17

## Objective

Continue the locked Herbalisti corpus-first goal by collecting more rights-cleared books locally from official no-key sources only, with no scraping, and by keeping the storage model aligned to a Corpus Memory semantic archive.

## Goal alignment

This batch stayed inside the current guardrails:

- books only
- no web scraping
- no API-key-dependent sources
- local acquisition, not link-only cataloging
- breadth-first expansion across meaningful title families

## Batch acquired

Processed: 12

Failures: 0

### NLM Digital Collections

Processed: 6

- `nlm-64330390R` - `Homoeopathic domestic physician`
- `nlm-101526705` - `Lexicon medicum, or, Medical dictionary`
- `nlm-2574014R` - `The American new dispensatory`
- `nlm-2575005R` - `A narrative of the life and medical discoveries of Samuel Thomson`
- `nlm-54410330R` - `Primary studies for nurses`
- `nlm-64230220R` - `A course of fifteen lectures on medical botany`

### Wellcome Collection

Processed: 6

- `wellcome-n9mqfwbn` - `Pharmacopoeia Collegii Regalis Medicorum Londinensis.`
- `wellcome-skt8zhzw` - `Pharmacopoeia Collegii Regii Medicorum Edinburgensis.`
- `wellcome-ctrns2vu` - `The cyclopaedia of practical medicine (Volume 1)`
- `wellcome-msvmhr7b` - `A course of fifteen lectures on medical botany`
- `wellcome-ndpjxuu6` - `A handbook of hygiene and sanitary science`
- `wellcome-uxtkmwqd` - `Culpeper's complete herbal, etc`

## Current corpus totals after the batch

- 2,720 registered works
- 431 locally acquired and chunked works
- 2,289 discovered works still queued
- 0 failed works remaining overall

Current chunked works by collection:

- 27 Project Gutenberg works
- 278 Wellcome Collection works
- 126 NLM Digital Collections works

Current chunk totals from disk:

- 618,400 total chunk records
- 14,221 Project Gutenberg chunks
- 428,680 Wellcome chunks
- 175,499 NLM chunks

## Current frontier state after refresh

- 1,654 actionable family recommendations remain
- 1,610 uncovered families remain
- 44 depth families remain
- 0 failed-only families remain
- 2,076 discovered works still sit in uncovered families

Collection worklist balance:

- NLM: 397 frontier candidates remaining
- Wellcome: 1,257 frontier candidates remaining

## Current semantic totals after refresh

Evidence layer:

- 431 chunked works
- 491,454 chunk-signal records
- 38,733 herb candidates
- 2,154 high-confidence herb candidates
- 11,807 medium-confidence herb candidates
- 24,772 low-confidence herb candidates
- 38,801 graph nodes
- 216,808 graph edges

Term-family layer:

- 38,208 canonical families
- 36,020 accepted families
- 35,902 accepted plant-like families
- 118 accepted broader materia medica families
- 31 review families
- 2,157 rejected families

Seed-catalog layer:

- 103 curated seed-ready families
- 58 supporting families
- 28,763 review families
- 6,978 excluded noise families

## Why this matters

This was the right kind of expansion for the stated goal:

1. it increased the local archive materially without opening any new rights or scraping risk
2. it strengthened the practical knowledge base across herbals, pharmacopoeias, domestic medicine, hygiene, and medical botany
3. it kept the semantic archive current, so later search, chat, and structured herb retrieval can be built on real corpus depth rather than a thin starter set

## Recommended next move

Keep the collection program breadth-first:

1. continue frontier-guided batches from official NLM and Wellcome sources
2. favor uncovered families over repeated depth unless a depth work adds obvious practical value
3. start a separate review pass to identify the next safe expansion lane after NLM, Wellcome, and Gutenberg are further exhausted
