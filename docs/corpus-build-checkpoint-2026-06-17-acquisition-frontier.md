# Herbalisti Corpus Build Checkpoint

Date: 2026-06-17

## Objective

Move the corpus from raw backlog growth to smarter breadth-first acquisition by introducing a family-aware frontier, then use that frontier to pull another curated set of high-value books into the local archive.

## What was added

### 1. Acquisition-frontier layer

A new derived layer now sits between the edition families and the acquisition runners:

- `scripts/corpus/build-acquisition-frontier.mjs`
- `corpus/derived/acquisition-frontier/frontier.csv`
- `corpus/derived/acquisition-frontier/frontier.json`
- `corpus/derived/acquisition-frontier/worklists/`
- `corpus/exports/acquisition-frontier-summary.json`

This layer ranks the next best acquisition candidate per family rather than simply taking the next highest-scoring title from the whole discovered backlog.

### 2. Frontier-driven acquisition controls

The two active official-source runners now accept:

- `--work-ids`
- `--work-ids-file`

That makes it possible to use curated worklists directly without hacking the registry or depending on a generic sort order.

## Curated batch acquired

The first frontier-guided batch deliberately leaned toward medical botany, herbals, and practical family-health books.

### Wellcome Collection

Processed: 5

- `wellcome-abxr8auh` - `A course of fifteen lectures on medical botany...`
- `wellcome-gc87tpxn` - `Alphabet of medical botany, for the use of beginners`
- `wellcome-t2xfjmry` - `An introduction to medical botany`
- `wellcome-fc69rtpx` - `Medical botany; or, descriptions of the more important plants used in medicine...`
- `wellcome-q7w4at2x` - `In sickness and in health`

Failures: 0

### NLM Digital Collections

Processed: 6

- `nlm-2568047R` - `A course of fifteen lectures on medical botany`
- `nlm-61410580R` - `Guide to health and long life, or, What to eat, drink, and avoid`
- `nlm-61760120R` - `Medical flora, or, Manual of the medical botany of the United States of North America`
- `nlm-7704741` - `An improved system of botanic medicine`
- `nlm-61750800R` - `Resources of the southern fields and forests...`
- `nlm-64210330R` - `The complete herbalist, or, The people their own physicians...`

Failures: 0

## Current corpus totals

- 2,720 registered works
- 399 locally acquired and chunked works
- 2,312 discovered works still queued
- 9 failed works requiring alternate official routes or manual review

Current chunked works by collection:

- 27 Project Gutenberg works
- 265 Wellcome Collection works
- 107 NLM Digital Collections works

Current chunk totals from disk:

- 580,606 total chunk records
- 14,221 Project Gutenberg chunks
- 412,736 Wellcome chunks
- 153,649 NLM chunks

## Current frontier state after the batch

- 1,666 actionable family recommendations remain
- 1,633 uncovered families remain
- 27 depth families remain
- 6 failed-only families remain
- 2,245 discovered works still sit in uncovered families

Collection worklist balance:

- NLM: 411 frontier candidates remaining
- Wellcome: 1,255 frontier candidates remaining

This confirms the same strategic conclusion: the archive is still in a broad-coverage phase, and there is still substantial value in continuing to collect one strong representative from each untouched family before deepening already represented families.

## Current semantic totals after refresh

Evidence layer:

- 399 chunked works
- 464,938 chunk-signal records
- 37,381 herb candidates
- 37,449 graph nodes
- 208,564 graph edges

Term-family layer:

- 36,875 canonical families
- 34,752 accepted families
- 34,640 accepted plant-like families
- 112 accepted broader materia medica families
- 2,092 rejected families

Seed-catalog layer:

- 103 curated seed-ready families
- 58 supporting families
- 27,762 review families
- 6,717 excluded noise families

## Why this matters

This step changed the project in two ways:

1. acquisition is now family-aware rather than merely backlog-aware
2. the corpus is materially richer in medical botany and practical wellbeing texts, not just bigger in raw title count

That is a better fit for the long-term goal of building a trustworthy, source-grounded public archive of historical practical health knowledge.

## Recommended next move

Continue frontier-guided acquisition in repeated curated batches, with a preference order like this:

1. medical botany
2. herbals and medicinal-plant manuals
3. practical domestic health and hygiene guides
4. broader materia medica and dispensatory works
5. represented-family depth only after uncovered-family coverage improves further
