# Herbalisti Source Verification Notes

Date: 2026-06-16

## Purpose

This note records bibliographic checks for the first Herbalisti reference-library records. The public site should stay transparent when source-plan data is unverified or corrected.

## Verified Reference Records

### Medical Herbalism

- Public title: `Medical Herbalism`
- Subtitle: `The Science and Practice of Herbal Medicine`
- Author: David Hoffmann
- Publisher/imprint: Healing Arts Press / Inner Traditions
- Publication year: 2003
- ISBN-13: `9780892817498`
- Pages: 672
- Verification source: [Simon & Schuster publisher catalogue](https://www.simonandschuster.com/books/Medical-Herbalism/David-Hoffmann/9780892817498)

### The Herbal Medicine-Maker's Handbook

- Public title: `The Herbal Medicine-Maker's Handbook`
- Subtitle: `A Home Manual`
- Author: James Green
- Publisher/imprint: Crossing Press
- Publication date: 2000-09-01
- ISBN-13: `9780895949905`
- Pages: 384
- Verification source: [Penguin Random House publisher catalogue](https://www.penguinrandomhouse.com/books/198323/the-herbal-medicine-makers-handbook-by-james-green/)

### The Complete Illustrated Holistic Herbal

- Public title: `The Complete Illustrated Holistic Herbal`
- Subtitle: `A Safe and Practical Guide to Making and Using Herbal Remedies`
- Verified author: David Hoffmann
- Publisher: Element Books
- Publication year: 1996
- ISBN-13: `9781852308476`
- Pages: 256
- Verification source: [Google Books catalogue record](https://books.google.com/books/about/The_Complete_Illustrated_Holistic_Herbal.html?id=QBJMAQAAIAAJ)
- Audit note: the starting Natural Medicines plan listed Jeoffrey Ainsworth and Anne McIntyre. The live record now preserves that mismatch in the notes while using the verified David Hoffmann author record.

### American Botanical Council

- Record type: companion public reference source, not a book.
- Public site: [American Botanical Council / HerbalGram](https://www.herbalgram.org/)
- Use: source checking, botanical safety context, terminology, and public attribution.

## Implementation Notes

- Frontend fallback records live in `src/data/books.ts`.
- Cloudflare Pages Function fallback records live in `functions/_lib/books.js`.
- Production D1 metadata is added by `migrations/0003_reference_book_metadata.sql`.
- Searches now include subtitle, publisher, publication date, ISBN, verification source, and citation notes.

## Citation Notes

Herbalisti now has a first structured citation-notes layer. These records are intentionally short public-source pointers, not copied book text, protocol advice, or treatment guidance.

- Frontend fallback records: `src/data/citationNotes.ts`.
- Cloudflare Pages Function fallback records: `functions/_lib/citation-notes.js`.
- Production D1 migration: `migrations/0008_seed_citation_notes.sql`.
- Public endpoint: `GET /api/citation-notes`.
- Search endpoint: `GET /api/citation-notes?query=ginger`.
- Type filter: `GET /api/citation-notes?type=remedy`.
- Frontend surface: `src/App.tsx` section `#citations`.
- Local verifier: `npm run verify:citation-notes`.

The launch set includes reference, remedy, signal, and governance notes. Each note stores a linked record ID, linked record label, source name, HTTPS source URL, short editorial note, tags, review status, and review date. The unified research console also includes citation-note results as a `Notes` group.

## Source Registry

The public-source registry is now API-backed:

- Frontend fallback records live in `src/data/sourcePolicy.ts`.
- Cloudflare Pages Function fallback records live in `functions/_lib/sources.js`.
- Production D1 source records are seeded in `migrations/0002_seed_reference_data.sql`.
- Production D1 feed-display names are added in `migrations/0004_feed_source_names.sql`.
- Public endpoint: `GET /api/sources`.
- Search endpoint: `GET /api/sources?query=longevity`.

The registry only returns sources that are allowlisted and not marked as Big Pharma related. It also exposes `feedName`, which maps official source names such as `NCBI / PubMed E-utilities` to the source label used on news cards, such as `PubMed / NCBI`. The public Signals source filters are generated from these `feedName` values, while the source-governance section still shows the official source names for auditability. This keeps the public source policy visible as data, not just as copy on the page.

## Source Independence Review

Herbalisti now records source-level independence review metadata in the source registry. This is stricter than a generic allowlist because each public source carries:

- `independenceStatus`
- `ownershipReview`
- `reviewEvidenceUrl`
- `reviewCadence`
- `lastReviewed`
- `reviewNote`

The launch review does not claim to audit every article author's funding or every publisher relationship. It checks whether the channel itself is appropriate for the Herbalisti feed and whether it should be treated as public infrastructure, independent coverage, commentary, or blocked. The standard review cadence is `quarterly_or_before_source_expansion`.

Launch source review records:

- `NCBI / PubMed E-utilities`: public government research index. Evidence URL: `https://www.ncbi.nlm.nih.gov/`.
- `arXiv API`: open-access preprint infrastructure, Cornell-hosted with an announced independent nonprofit transition. Evidence URL: `https://info.arxiv.org/about/index.html`.
- `bioRxiv / medRxiv API`: Cold Spring Harbor Laboratory preprint infrastructure, with medRxiv operated in partnership with Yale and BMJ. Evidence URL: `https://www.cshl.edu/partner-with-us/preprints/`.
- `Crossref REST API`: not-for-profit scholarly metadata infrastructure. Evidence URL: `https://www.crossref.org/membership/terms/`.
- `Lifespan.io`: independent longevity advocacy and research institute source. Evidence URL: `https://lifespan.io/`.
- `Fight Aging!`: independent longevity commentary with disclosed biotech involvement by the writer. It remains allowed as commentary, not as a primary research index. Evidence URL: `https://www.fightaging.org/about/`.

Implementation:

- Frontend fallback records: `src/data/sourcePolicy.ts`.
- Cloudflare Pages Function fallback records: `functions/_lib/sources.js`.
- D1 migration: `migrations/0007_source_independence_review.sql`.
- Local verifier: `npm run verify:source-governance`.
- Production verifier coverage: `npm run verify:production -- https://herbalisti.com`.

## Crossref Feed Use

Crossref is now an active feed adapter, not just a planned metadata source. The adapter uses the public `/works` endpoint with a small row count, a recent publication-date filter, and project contact metadata. Because Crossref covers broad scholarly publishing, Herbalisti applies an additional product relevance filter before records enter the public feed:

- keep records with health, longevity, therapeutic, peptide, epigenetic, DNA-writing, gene-therapy, clinical, biomedical, or personalized-health context.
- exclude generic crop, plant, rice, potato, vegetable, starch, and abiotic-stress gene-editing records.

The scheduled Worker verifier includes a deterministic Crossref fixture and checks that Crossref rows persist to D1 with topic tags while preserving the Big Pharma source-name blocklist.

Feed normalization now canonicalizes URLs, removes common tracking parameters, normalizes titles, and collapses duplicate signals before the public limit is applied. This keeps the public Signals view useful as PubMed, Crossref, preprint, and independent-source coverage overlaps.

## Source Health

The Signals feed now exposes source-by-source health for the allowlisted launch channels:

- Public endpoint: `GET /api/source-health`.
- Frontend surface: source-health chips in the public Signals section.
- Local verifier: `npm run verify:source-health`.

Each source health record includes source ID, name, URL, source type, status, item count, usable item count, newest usable item timestamp, warning text when present, `isAllowlisted`, and `isBigPharmaRelated`. The health policy is intentionally conservative: warnings do not add fallback pharma channels or broaden the allowlist.

## Signal Intelligence

The Signals feed now includes a metadata-only intelligence layer for topic and source coverage:

- Shared adapter: `functions/_lib/signal-intelligence.js`.
- Public endpoint: `GET /api/signal-intelligence`.
- Frontend surface: the `Signal intelligence` panel in `src/App.tsx`.
- Local verifier: `npm run verify:signal-intelligence`.

The endpoint reads D1-cached public signals when available and otherwise uses the same allowlisted live public-source adapters as `/api/news`. It returns total signal count, represented topics, represented sources, coverage percent, recent-signal count, newest signal timestamp, leading topic cluster, topic coverage rows, source-mix rows, source-health summary, and a policy statement. It deliberately treats topic counts as discovery context only, not as treatment ranking or medical guidance.

## Signals RSS

The public Signals feed is also available as RSS:

- Public endpoint: `GET /api/signals.xml`.
- Filtered endpoint: `GET /api/signals.xml?topic=CRISPR&source=Crossref&query=sovereign`.
- Discovery link: homepage `<link rel="alternate" type="application/rss+xml" title="Herbalisti Signals" href="https://herbalisti.com/api/signals.xml" />`.
- Visible site control: `Signals RSS` in the Signals section, pointing to the current filtered RSS URL.
- Shared adapter: `functions/_lib/signals-rss.js`.
- Local verifier: `npm run verify:signals-rss`.

## Public Data Exports

The public knowledge layers also ship as static JSON exports for data portability and independent audit:

- Reference books: `GET /data/reference-books.json`.
- Herbal commons: `GET /data/herbal-knowledge.json`.
- Remedy index: `GET /data/remedies.json`.
- Citation notes: `GET /data/citation-notes.json`.
- Source registry: `GET /data/sources.json`.

Generate and verify the local snapshots with:

```bash
npm run export:data
npm run verify:data-exports
```

The exports are versioned launch snapshots generated from the same fallback records used by the public APIs. Their policies stay non-prescriptive, avoid copied book/source text, keep the herbal commons limited to public-domain source works, and keep Big Pharma-related source channels excluded by default.

The RSS route uses the same allowlisted public-source data path as `/api/news`: D1 first when production records exist, live public-source fallback when needed, normalized topic/source/query filters, and the Big Pharma source-name blocklist. The channel description carries the source policy and medical boundary so feed readers do not detach the signals from the non-prescriptive context.

## Remedy Index

The starting Natural Medicines plan called for a remedy data structure with remedy name, botanical name, plant parts, traditional uses, preparations, safety considerations, interactions, related remedies, and source URL. Herbalisti now includes that first public-source index as a safety-led research layer:

- Frontend fallback records: `src/data/remedies.ts`.
- Cloudflare Pages Function fallback records: `functions/_lib/remedies.js`.
- Production D1 migrations: `migrations/0006_seed_remedies.sql` and `migrations/0009_remedy_plant_parts.sql`.
- Public endpoint: `GET /api/remedies`.
- Search endpoint: `GET /api/remedies?query=ginger`.
- Preparation filter: `GET /api/remedies?preparation=Infusion`.

The initial set covers 21 common herbs and supplement ingredients. Each record is intentionally framed as a source index, not a care recommendation: it includes botanical metadata, plant-part context, preparation forms, safety summaries, interaction flags, related records, tags, and a public NCCIH source URL. The public UI avoids dosages and treatment instructions.

## Relationship Graph

The remedy index now feeds a source-led relationship graph:

- Shared graph adapter: `functions/_lib/knowledge-graph.js`.
- Public endpoint: `GET /api/graph`.
- Search endpoint: `GET /api/graph?query=ginger`.
- Relation filters: `GET /api/graph?relation=HAS_PART` and `GET /api/graph?relation=SAFETY_WATCH`.
- Frontend surface: `src/App.tsx` section `#map`.
- Local verifier: `npm run verify:knowledge-graph`.

The graph exposes remedy, plant-part, preparation, context, and safety nodes. Edge types are `RELATED_TO`, `HAS_PART`, `PREPARED_AS`, `TRADITIONAL_CONTEXT`, and `SAFETY_WATCH`. It deliberately does not expose a `TREATS` relationship; traditional-use and plant-part context is preserved as source-indexed research context rather than a treatment claim.

## Research Console

The public research console is backed by `GET /api/search?query=...`.

It returns grouped results across:

- References from `reference_books`.
- Remedies from `remedies`.
- Public-source Signals from D1 when available, otherwise the live public feed adapters.
- Source registry records from `feed_sources`.

This keeps the interface closer to the project goal of a unified knowledgebase while preserving the existing governance boundary: it searches source-indexed records and public signals, not private health data or automated treatment advice.

## Refresh Heartbeat

The self-updating feed now records refresh attempts as data:

- Production D1 table: `feed_refresh_runs`.
- Production endpoint: `GET /api/feed-status`.
- Static fallback file: `public/data/feed-status.json`, written by `npm run refresh:news`.

Each refresh row stores trigger type, status, start/finish timestamps, fetched item count, persisted item count, warning count, warnings, and source policy. The React Signals section reads this heartbeat so the public interface can show when the feed refresh system last ran, while still falling back cleanly when D1 is not connected yet.
