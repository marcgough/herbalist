# Herbalisti Corpus Build Checkpoint

Date: 2026-06-17

## Objective

Continue broad rights-cleared corpus collection from official no-key book sources using the new frontier runner, then refresh the semantic archive so the larger corpus remains retrieval-ready.

## Batch acquired

Processed: 12

Failures during source acquisition: 0

### NLM Digital Collections

Processed: 6

- `nlm-07221340R` - `Optimistic medicine`
- `nlm-101278154` - `The family adviser and guide to the medicine chest`
- `nlm-2568014R` - `The medical guide, for the use of families and young practitioners`
- `nlm-8004287` - `The household guide, or, Domestic cyclopedia`
- `nlm-2577008R` - `The family physician, and guide to health in three parts`
- `nlm-64210840R` - `The improved American family physician, or, Sick man's guide to health`

### Wellcome Collection

Processed: 6

- `wellcome-wthpjdsw` - `The general dispensatory`
- `wellcome-vfqwreqz` - `Culpeper's English physician and complete herbal`
- `wellcome-d878ar7x` - `Culpeper's English physician; and complete herbal`
- `wellcome-f8rny4jt` - `New guide to health, or, Botanic family physician`
- `wellcome-apdpgwkn` - `The old man's guide to health and longer life`
- `wellcome-tsr8w3fh` - `A text-book of pharmacology, therapeutics and materia medica`

## Current corpus totals after the batch

- 2,720 registered works
- 479 locally acquired and chunked works
- 2,241 discovered works still queued
- 0 failed works overall

Current chunked works by collection:

- 27 Project Gutenberg works
- 302 Wellcome Collection works
- 150 NLM Digital Collections works

Current chunk totals from disk:

- 673,577 total chunk records
- 14,221 Project Gutenberg chunks
- 463,372 Wellcome chunks
- 195,984 NLM chunks

## Current frontier state after rebuild

- 1,636 actionable family recommendations remain
- 1,562 uncovered families remain
- 74 depth families remain
- 0 failed-only families remain
- 1,966 discovered works still sit in uncovered families
- 275 discovered works still sit in depth families

Collection worklist balance:

- NLM: 378 frontier candidates remaining
- Wellcome: 1,258 frontier candidates remaining

Top next recommendations now include:

- `nlm-63610060R` - `A dictionary of popular medicine and hygiene`
- `nlm-64230630R` - `The first edition of Steward's healing art`
- `nlm-2558004RX1` - `An improved system of botanic medicine`
- `wellcome-djkpjuxk` - `The family physician; or, Domestic medical friend`
- `wellcome-s2rfczwu` - `A catalogue of Indian medicinal plants and drugs`
- `wellcome-dwhz86ma` - `A pocket herbal`

## Current semantic totals after rebuild

Evidence layer:

- 479 chunked works
- 535,637 chunk-signal records
- 42,219 herb candidates
- 2,443 high-confidence herb candidates
- 12,527 medium-confidence herb candidates
- 27,249 low-confidence herb candidates
- 42,287 graph nodes
- 240,876 graph edges

Term-family layer:

- 41,602 canonical families
- 39,249 accepted families
- 39,075 accepted plant-like families
- 174 accepted broader materia medica families
- 31 review families
- 2,322 rejected families

Seed-catalog layer:

- 103 curated seed-ready families
- 66 supporting families
- 31,273 review families
- 7,633 excluded noise families

## Why this matters

This pass continued to move the project toward the actual goal:

1. it added another 12 official-source, rights-cleared works without introducing any scrape-based dependency
2. it strengthened practical family medicine, hygiene, pharmacology, and materia-medica lanes rather than only adding repeated herbals
3. it confirmed the new frontier runner can keep scaling the corpus without reintroducing the earlier rebuild failure
4. it kept the semantic archive synchronized so retrieval quality rises with corpus size

## Recommended next move

1. continue `corpus:frontier-batch` on uncovered-family mode while the frontier is still overwhelmingly broad rather than depth-heavy
2. prioritize the next NLM and Wellcome recommendations that widen domestic medicine, hygiene, medicinal-plant, and botanic-medicine coverage
3. begin a curated review pass for the largest accepted-but-not-seed-ready plant families after another one or two growth slices, so the corpus-first strategy starts turning into a stronger public herbal database
