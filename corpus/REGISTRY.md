# Herbalisti Corpus Registry

This file is the top-level registry and orientation note for the local Herbalisti book corpus.

It is separate from the shared working-memory service.

The source archive stays in `corpus/`.

The separate semantic retrieval layer now lives in `corpus-memory/` as `Corpus Memory`.

## Current Scope

- books only
- no web scraping
- no API-key-dependent sources yet
- rights-cleared or permissively licensed works only

## Registry Pointers

- `registry/works.csv`
- `registry/collections.csv`
- `review/`
- `review/thin-work-review/`
- `review/seed-catalog-priority/`
- `works/`
- `chunks/`
- `derived/`
- `derived/edition-families/`
- `derived/acquisition-frontier/`
- `derived/evidence/`
- `derived/term-families/`
- `derived/seed-catalog/`
- `derived/herb-profiles/`

## Semantic Unit

The core semantic unit is:

`work -> section -> passage -> entity/claim/caution`

This keeps the archive understandable both as a library and as a retrieval system.

## Separation

- shared working-memory service
  - operator context
  - briefs
  - checkpoints
  - project handoffs
- `Corpus Memory`
  - herbal profiles
  - indexed work summaries
  - later chunk-level retrieval documents
  - public corpus search and chat support

## Current Build State

As of 2026-06-18:

- `registry/works.csv` contains 2,723 registered works.
- 991 works are locally acquired, normalized, and chunked.
- 1,728 additional works are registered and still queued for acquisition.
- 1 work is currently reflected as failed in status totals.

Current chunked corpus mix:

- 27 Project Gutenberg works
- 639 Wellcome Collection works
- 325 NLM Digital Collections works

Current chunk volume:

- 1,204,920 total chunk records
- 14,221 chunks from Project Gutenberg
- 835,618 chunks from Wellcome Collection
- 355,081 chunks from NLM Digital Collections

Current paragraph volume:

- 1,386,690 total paragraph records
- 863,070 paragraphs from Wellcome Collection
- 456,166 paragraphs from NLM Digital Collections

Current seed-review-priority layer:

- 50,025 ranked review families from the seed catalog manual-review backlog
- 67 promotion candidates
- 24 identity-review candidates
- 46,530 secondary candidates
- 3,404 deprioritized families

Edition-family layer:

- 1,866 edition families generated from the current registry
- 411 multi-work families
- 294 high-confidence families
- 1,534 medium-confidence families
- 38 low-confidence families that should remain review candidates rather than assumed merges

## Operational Notes

- Project Gutenberg remains the cleanest full-text lane and is fully processed for the current filtered set.
- Wellcome Collection is the broadest no-key expansion lane and now supplies most of the growth.
- NLM discovery is driven only by the official `https://wsearch.nlm.nih.gov/ws/query` service and only keeps book-like, English-language, text-format, explicitly public-domain works.
- The active English practical reference selector now uses stronger title normalization and punctuation-insensitive phrase matching to suppress lecture fragments, catalogues, exam material, and other weak witnesses more aggressively.
- The current reusable intake profile lives at `review/frontier-profiles/english-practical-reference-2026-06-18.json`.
- Thin-work review, seed-review-priority, herb-profile, and evidence layers are all derived locally from the archive and rebuilt from the source registry.
- `Corpus Memory` is now the separate semantic retrieval target for Herbalisti. The raw archive and derived layers remain in `corpus/`, but semantic indexing belongs to `corpus-memory/`, not the shared working-memory service.
- The live `Corpus Memory` instance is currently populated with 1,115 retrieval documents: 991 `work-summary` records and 124 `herb-profile` records.
- The latest curated acquisition pass added 3 new NLM/Wellcome registry records and 7 chunked works in practice: `nlm-61541080R`, `nlm-2575002R`, `nlm-63610050R`, `wellcome-b25e6jga`, `wellcome-hc2dvqnw`, `wellcome-wzvfb7fu`, and `wellcome-x4z328cq`.
- The active failure queue is back down to a single NLM outlier: `nlm-101139425`.
