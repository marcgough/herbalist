# Herbalisti Project Plan

Date: 2026-06-15

## Brief

Build Herbalisti for `herbalisti.com` as a fully functioning website and brand system. The brand should feel like Star Trek meets holistic health: stylish, elegant, spacious, high-tech, light, airy, and Japanese Zen influenced. It should not feel old-school, rustic, dusty, occult, or low-tech. This is now a locked creative constraint: Herbalisti is high-tech wellbeing intelligence, not heritage herbalism.

Core product surfaces:

- Original Herbalisti branding: logo, fonts, colours, tone of voice.
- AI-generated site imagery using OpenAI image generation for project-bound visual assets.
- Searchable database of books referenced in the starting Natural Medicines development plan.
- Source-led relationship map connecting remedies, preparation forms, traditional-use context, related records, and safety watches.
- Self-updating newsfeed from public, independent, non-Big-Pharma sources covering longevity, peptides, gene therapy, gene editing, DNA modification, CRISPR, health and longevity as a service, and related subjects.
- Source-by-source health visibility for the independent public-source feed.
- Public RSS access for the independent Signals feed so `herbalisti.com` can be subscribed to outside the website.
- Optional cinematic video backgrounds generated through Seedance 2.0 via Kie.ai once the API key and credits are ready.

## Starting Source

The supplied development plan was a lightweight implementation plan for a herbal remedy knowledgebase. It named these reference books/sources:

- `Medical Herbalism` by David Hoffmann.
- `The Herbal Medicine-Maker's Handbook` by James Green.
- `The Complete Illustrated Holistic Herbal`; the starting plan listed Jeoffrey Ainsworth and Anne McIntyre, but catalogue verification corrected the record to David Hoffmann.
- American Botanical Council, PubMed, and Google Scholar as companion research sources.

The current site indexes these as source records only. Bibliographic metadata for the initial records is now stored in code and D1 migration form. See `docs/source-verification.md`.

## Brand Direction

Brand concept: self-sovereign health intelligence.

Visual system:

- Warm white, glass blue, pale sage, titanium, chlorophyll, restrained amber.
- Light, luminous architecture rather than dark apothecary imagery.
- Futuristic botanical interfaces, glass panels, DNA/peptide light patterns, and calm spatial rhythm.
- No pills, syringes, hospital cues, pharmaceutical packaging, or medical claims.

Logo:

- Name: Herbalisti.
- Current implementation: custom SVG no-icon wordmark and standalone typographic monogram for square technical contexts.
- Direction: precise, elegant, modern, and not nostalgic.
- Assets:
  - `public/assets/herbalisti-logo.svg`
  - `public/assets/herbalisti-mark.svg`
  - `public/favicon.svg`
  - `public/manifest.webmanifest`
  - `docs/brand-system.md`

Fonts:

- Current build uses performant system font stacks with an Avenir/Aptos/Inter-like profile.
- Later brand refinement can self-host a licensed geometric humanist sans if needed.

Tone of voice:

- Clear, calm, intelligent, empowering.
- Avoid hype, miracle claims, or hidden medical authority.
- Invite inquiry and personal agency.

## Research And Source Plan

Initial public feed sources:

- [NCBI / PubMed E-utilities](https://www.ncbi.nlm.nih.gov/home/develop/api/) for public biomedical metadata.
- [arXiv API](https://info.arxiv.org/help/api/user-manual.html) for open preprint metadata.
- [bioRxiv / medRxiv API](https://api.biorxiv.org/) for public preprint metadata.
- [Crossref REST API](https://www.crossref.org/documentation/retrieve-metadata/rest-api/) for scholarly metadata expansion.
- [Lifespan.io](https://www.lifespan.io/news/) and [Fight Aging!](https://www.fightaging.org/) as independent longevity sources.
- [Kie.ai Seedance 2.0](https://kie.ai/seedance-2-0) for optional video generation; [Kie docs](https://docs.kie.ai/) for API access and rate-limit guidance.

Source governance:

- Use an allowlist first, not an open web crawl.
- Exclude Big Pharma-owned channels by default.
- Carry source-level independence review metadata with evidence URLs, review cadence, and conflict notes.
- Store source, date, title, URL, topic tags, and source type.
- Keep every feed item traceable to the original source.
- Do not publish automated medical advice or treatment recommendations.

## Technical Direction

Current local build:

- React + Vite + TypeScript.
- Project path: `outputs/herbalisti-site`.
- Static generated images stored in `public/assets`.
- Public media provenance stored in `public/data/media-provenance.json`.
- Public motion-media slots stored in `public/data/media-manifest.json`; video loops are disabled until reviewed local Seedance assets exist.
- Procedural motion layers in `src/App.css` now support the high-tech Zen direction without requiring paid video generation.
- Launch attribution and dependency license notes stored in `docs/attribution.md`.
- Local feed refresh script: `npm run refresh:news`.
- Feed normalization verifier: `npm run verify:feed-normalization`.
- Signals RSS verifier: `npm run verify:signals-rss`.
- Static feed output: `public/data/news.json`.
- Static feed heartbeat: `public/data/feed-status.json`.
- Remedy fallback index: `src/data/remedies.ts`.
- Browser fallback feed: `src/data/newsSeed.ts`.
- Frontend reads `/api/books` and `/api/news` first, then gracefully falls back to local seed/static data when the Cloudflare runtime is not available.
- Signals source filters are driven by `/api/sources` and show a request-aware loading state so stale feed cards are hidden while a new source/topic/search request is resolving.
- Signals source-health chips read `/api/source-health` so the public feed can show allowlisted source reachability and usable item counts.
- Shared feed adapter: `functions/_lib/feed.js`.
- Shared book database adapter: `functions/_lib/books.js`.
- Shared remedy database adapter: `functions/_lib/remedies.js`.
- Shared relationship graph adapter: `functions/_lib/knowledge-graph.js`.
- Shared unified search adapter: `functions/_lib/search.js`.
- Shared source registry adapter: `functions/_lib/sources.js`.
- Shared media helper: `functions/_lib/media.js`.
- Cloudflare-style production routes:
  - `functions/api/health.js`
  - `functions/api/news.js`
  - `functions/api/signals.xml.js`
  - `functions/api/source-health.js`
  - `functions/api/feed-status.js`
  - `functions/api/books.js`
  - `functions/api/remedies.js`
  - `functions/api/graph.js`
  - `functions/api/search.js`
  - `functions/api/sources.js`
  - `functions/api/media/seedance.js`
  - `functions/api/media/seedance-status.js`
- Searchable API behavior:
  - `GET /api/health`
  - `GET /api/books?query=...&mode=...`
  - `GET /api/remedies?query=...&preparation=...`
  - `GET /api/graph?query=...&relation=...`
  - `GET /api/search?query=...`
  - `GET /api/news?topic=...&source=...&query=...`
  - `GET /api/signals.xml?topic=...&source=...&query=...`
  - `GET /api/source-health`
  - `GET /api/feed-status`
  - `GET /api/sources?query=...`
- Shareable public filter URLs:
  - `?book=...&bookMode=...`
  - `?map=...&relation=...`
  - `?signal=...&topic=...&source=...`
- Launch governance:
  - visible `#governance` section
  - public `/data/governance.json` policy file
  - `npm run verify:governance`
- Cloudflare Pages edge policy:
  - `public/_headers`
  - `public/_redirects`
  - `scripts/verify-edge-policy.mjs`
  - `npm run verify:edge-policy`
- D1 migrations:
  - `migrations/0001_initial.sql`
  - `migrations/0002_seed_reference_data.sql`
  - `migrations/0003_reference_book_metadata.sql`
  - `migrations/0004_feed_source_names.sql`
  - `migrations/0005_feed_refresh_runs.sql`
  - `migrations/0006_seed_remedies.sql`
  - `migrations/0007_source_independence_review.sql`
- Local D1 verification:
  - `wrangler.local.toml`
  - `scripts/verify-d1.mjs`
  - `npm run verify:d1`
- Local scheduled-news verification:
  - `wrangler.news.local.toml`
  - `scripts/verify-news-worker.mjs`
  - `npm run verify:news-worker`
- Source governance verification:
  - `scripts/verify-source-governance.mjs`
  - `npm run verify:source-governance`
- Source health verification:
  - `scripts/verify-source-health.mjs`
  - `npm run verify:source-health`
- Relationship graph verification:
  - `scripts/verify-knowledge-graph.mjs`
  - `npm run verify:knowledge-graph`
- Attribution verification:
  - `scripts/verify-attribution.mjs`
  - `npm run verify:attribution`
- Protected media endpoint verification:
  - `scripts/verify-media-endpoints.mjs`
  - `npm run verify:media-endpoints`
- High-tech motion-system verification:
  - `scripts/verify-motion-system.mjs`
  - `npm run verify:motion-system`
- Release verification:
  - `scripts/verify-release.mjs`
  - `npm run verify:release`
- Cloudflare binding setup:
  - `scripts/configure-cloudflare-bindings.mjs`
  - `scripts/verify-cloudflare-bindings.mjs`
  - `npm run configure:cloudflare`
  - `npm run verify:cloudflare-config`
- Production verification:
  - `scripts/verify-live-readiness.mjs`
  - `npm run verify:live-readiness`
  - `scripts/verify-production.mjs`
  - `npm run verify:production -- https://herbalisti.com`
- Production environment contract:
  - `docs/production-environment-contract.json`
  - `scripts/verify-production-contract.mjs`
  - `npm run verify:production-contract`
- Full goal-readiness audit:
  - `scripts/verify-goal-readiness.mjs`
  - `npm run verify:goal-readiness`
  - `docs/goal-readiness.md`
- Production launch packet:
  - `scripts/prepare-launch-packet.mjs`
  - `npm run prepare:launch`
  - `docs/production-launch-packet.md`
- Scheduled feed Worker:
  - `workers/news-refresh.js`
  - `wrangler.news.toml`
- Deployment and media runbooks:
  - `docs/deployment-runbook.md`
  - `docs/brand-system.md`
  - `docs/media-generation.md`

Recommended production setup:

- Cloudflare DNS for `herbalisti.com`.
- Cloudflare Pages for hosting.
- Cloudflare Pages Functions or Workers for `/api/news`.
- Cloudflare cache for low-cost refresh.
- D1 for book records, feed-source governance, cached feed items, and media job records.
- D1 for the safety-led remedy index.
- D1 refresh ledger for manual, scheduled, live API, and static feed refresh status.
- Scheduled Worker cron for D1 newsfeed refresh every six hours.
- R2 later for generated videos and media assets.

Required secrets later:

- `CLOUDFLARE_API_TOKEN` for deployment automation.
- `KIE_API_KEY` for Seedance 2.0 video generation.
- `FEED_ADMIN_TOKEN` for manually triggering the scheduled feed Worker.
- `OPENAI_API_KEY` only if repeatable server-side image generation is added.
- Optional: Turnstile keys and email provider keys if forms are added.

Do not paste secrets into chat. Add them locally or in Cloudflare environment variables.

## Progress Update: 2026-06-15

Completed since the first prototype:

- Added `wrangler.toml` with Cloudflare Pages output configuration and commented D1/R2 binding templates.
- Added D1 migrations for reference books, feed sources, news items, and media jobs.
- Added `/api/books`, which uses D1 when `HERBALISTI_DB` exists and falls back to static seed records when it does not.
- Added protected Seedance 2.0 admin endpoints through Kie.ai:
  - `POST /api/media/seedance`
  - `GET /api/media/seedance-status?taskId=...`
- Seedance endpoints require `KIE_API_KEY` and `MEDIA_ADMIN_TOKEN` and fail closed when they are missing.
- Added deployment runbook, media-generation prompts, `.env.example`, `robots.txt`, `sitemap.xml`, and social preview metadata.
- Verified the Cloudflare Pages local server served `/api/books` successfully from the fallback path.

## Progress Update: 2026-06-16

Completed:

- Refactored all newsfeed source adapters into `functions/_lib/feed.js` so local refresh, Pages API, and scheduled Worker share the same source allowlist and Big Pharma blocklist.
- Expanded production feed coverage to match the local feed: PubMed, arXiv, bioRxiv, Crossref, Lifespan.io, and Fight Aging!.
- Updated `/api/news` to read from D1 when cached items exist, fetch live when needed, and persist live results into D1 when `HERBALISTI_DB` is bound.
- Added `workers/news-refresh.js` and `wrangler.news.toml` for a Cloudflare Cron Trigger that refreshes D1 every six hours.
- Added `deploy:news-worker` and `dev:news-worker` package scripts.
- Added `FEED_ADMIN_TOKEN` to `.env.example` and deployment documentation for protected manual refresh.

## Progress Update: 2026-06-16 Book Search API

Completed:

- Added `functions/_lib/books.js` to centralize book seed records, D1 record mapping, query filtering, and mode filtering.
- Updated `/api/books` to support `query` and `mode` parameters against D1 when bound, with the same behavior against static fallback records when D1 is absent.
- Added `scripts/verify-api.mjs` and `npm run verify:api` to test:
  - `/api/books`
  - `/api/books?query=tincture`
  - `/api/books?mode=Safety`
  - `/api/news?live=1`

## Progress Update: 2026-06-16 Live Frontend Wiring

Completed:

- Wired the public reference library UI to `/api/books` with debounced search and mode filters.
- Wired the public signal feed UI to `/api/news`, with fallback to `public/data/news.json` and then browser seed records.
- Added visible source/count status chips so Marc can see whether the page is reading the seed database, static refresh data, live public-source API, or D1 when bound.
- Added polished empty states for no-match book and signal searches.
- Updated the first-screen positioning and copy to keep the direction explicitly high-tech, not low-tech.
- Verified desktop and mobile browser behavior through the Cloudflare Pages local runtime at `http://127.0.0.1:8788`.

## Progress Update: 2026-06-16 Source Verification Layer

Completed:

- Added richer reference metadata fields: subtitle, publisher, publication date, ISBN-13, page count, external catalogue URL, verification source, and citation note.
- Corrected `The Complete Illustrated Holistic Herbal` from the source-plan author mismatch to the verified David Hoffmann author record while preserving the discrepancy in audit notes.
- Added `migrations/0003_reference_book_metadata.sql` so D1 production data receives the same citation metadata.
- Updated the public reference cards to show compact citation metadata and catalogue links.
- Added `docs/source-verification.md`.
- Extended `npm run verify:api` so searches cover ISBN metadata, publisher metadata, and the corrected bibliography record.

## Progress Update: 2026-06-16 Local D1 Verification

Completed:

- Added `wrangler.local.toml` with a local-only `HERBALISTI_DB` binding for migration verification.
- Added `scripts/verify-d1.mjs` and `npm run verify:d1`.
- The verifier creates a clean ignored local D1 sandbox, applies all migrations, and checks:
  - `reference_books` source metadata columns.
  - 4 seeded reference records.
  - corrected `The Complete Illustrated Holistic Herbal` bibliography metadata.
  - 6 allowlisted feed source records.
  - `news_items` insert/query behavior.
  - `media_jobs` Seedance result columns.
- Added `.wrangler-herbalisti-*` to `.gitignore` so local D1/log state is not committed.

## Progress Update: 2026-06-16 Scheduled News Worker Verification

Completed:

- Added `wrangler.news.local.toml` with a local-only `HERBALISTI_DB` binding and disposable `FEED_ADMIN_TOKEN`.
- Added `scripts/verify-news-worker.mjs` and `npm run verify:news-worker`.
- The verifier runs the real scheduled-news Worker module against deterministic public-source fixtures, while persisting through Wrangler-backed local D1.
- It verifies:
  - unauthenticated manual refresh returns 401.
  - authenticated manual refresh fetches and persists feed rows.
  - scheduled handler registers one `waitUntil` refresh task.
  - persisted rows include required source/title/link/topic data.
  - fixture sources cover PubMed / NCBI, arXiv, bioRxiv, Lifespan.io, and Fight Aging!.
  - persisted rows avoid blocked Big Pharma source names.

## Progress Update: 2026-06-16 Brand Asset System

Completed:

- Replaced the generic icon lockup with a custom Herbalisti SVG wordmark and standalone typographic monogram.
- Updated `favicon.svg` to use the new mark inside a rounded warm-white app tile.
- Added `manifest.webmanifest` and linked it from `index.html`.
- Added canonical URL, theme colour, application name, and app-title metadata.
- Added `docs/brand-system.md` covering positioning, logo use, colour, typography, voice, motion, and launch metadata.
- Added `scripts/verify-brand.mjs` and `npm run verify:brand` to check brand assets, metadata, manifest, generated image dimensions, and old generic icon removal.

## Progress Update: 2026-06-16 Release Verification Gate

Completed:

- Added `scripts/verify-release.mjs` and `npm run verify:release`.
- The release verifier runs:
  - `npm run refresh:news`
  - `npm run lint`
  - `npm run build`
  - `npm run verify:brand`
  - `npm run verify:attribution`
  - `npm run verify:governance`
  - `npm run verify:cloudflare-config`
  - `npm run verify:d1`
  - `npm run verify:news-worker`
  - local Cloudflare Pages startup on a fresh open port
  - `scripts/verify-api.mjs` against that Pages runtime
  - `scripts/verify-production.mjs` against that Pages runtime
- The verifier shuts down the temporary Pages process after the API and production-shape smoke checks.
- Latest run passed in one command, producing a release-readiness gate for local handoff before Cloudflare deployment.

## Progress Update: 2026-06-16 Expanded Signal Filtering

Completed:

- Expanded the visible signal-feed topic surface to include longevity, peptides, gene therapy, gene editing, DNA modification, CRISPR, health as a service, and self-sovereign wellbeing.
- Added query and topic filtering to `/api/news` so Cloudflare Pages Functions can return focused feed results instead of relying only on client-side filtering.
- Added shared server-side filter helpers in `functions/_lib/feed.js` for live fetches, D1-cached results, static fallback, and the frontend seed fallback.
- Extended scheduled Worker fixture verification so persisted public-source rows cover the full topic surface, including DNA modification, health as a service, and self-sovereign wellbeing.
- Extended `npm run verify:api` to verify DNA topic filtering and a no-match news search.
- Browser QA at `http://127.0.0.1:8788/#signals` confirmed the DNA modification filter shows one live public-source signal and every returned card is tagged `DNA modification`.

## Progress Update: 2026-06-16 Launch Preflight

Completed:

- Added `scripts/verify-launch-config.mjs` and `npm run verify:launch`.
- The launch preflight checks required launch files, npm scripts, Cloudflare Pages D1 binding, scheduled Worker D1 binding, optional R2 media binding, and locally visible deployment variables.
- The preflight is safe to run locally: it does not deploy, upload, create external resources, call paid APIs, or print secret values.
- Added `npm run verify:launch -- --soft` as the non-failing report mode for handoff and planning.
- Updated `.env.example`, `README.md`, and `docs/deployment-runbook.md` so the required Cloudflare, feed-refresh, and Seedance tokens are documented together.

## Progress Update: 2026-06-16 Post-deployment Verification

Completed:

- Added `scripts/verify-production.mjs` and `npm run verify:production -- https://herbalisti.com`.
- The verifier checks the public homepage, canonical URL, manifest, generated image assets, logo/mark/favicon, robots, sitemap, public governance policy, book API, book search, ISBN search, source registry API, source registry search, news API, topic-tagged news rows, Big Pharma source-name blocklist, DNA modification topic filtering, and no-match news search.
- Integrated the same production-shape smoke into `npm run verify:release` against the temporary local Cloudflare Pages URL.
- Updated `README.md` and `docs/deployment-runbook.md` with the live verification command.

## Progress Update: 2026-06-16 Public Governance Layer

Completed:

- Added a visible launch-governance section to the public site.
- Added `public/data/governance.json` as a machine-checkable public policy file.
- Added `scripts/verify-governance.mjs` and `npm run verify:governance`.
- The governance verifier checks the visible React section, footer medical boundary, public governance policy, allowlist-first source policy, privacy restraint, disabled automated advice, and required human review language.
- Integrated governance verification into `npm run verify:release`.

## Progress Update: 2026-06-16 Media Provenance And Attribution

Completed:

- Added `public/data/media-provenance.json` with launch provenance for generated imagery and original SVG brand assets.
- Added `docs/attribution.md` covering media provenance, OpenAI-generated launch images, direct runtime dependencies, direct build/verification dependencies, and launch attribution rules.
- Added `scripts/verify-attribution.mjs` and `npm run verify:attribution`.
- The attribution verifier checks public provenance records, image dimensions, app/manifest/social asset references, OpenAI-generated image records, no-stock/no-hotlink policy, direct package specs, installed package licenses, and attribution note coverage.
- Integrated attribution verification into `npm run verify:release`.

## Progress Update: 2026-06-16 Cloudflare Binding Configurator

Completed:

- Added `scripts/configure-cloudflare-bindings.mjs` and `npm run configure:cloudflare`.
- The configurator accepts the real Cloudflare D1 database ID after `npx wrangler d1 create herbalisti` and updates both `wrangler.toml` and `wrangler.news.toml`.
- Added optional R2 media-bucket setup for `HERBALISTI_MEDIA` when Seedance video outputs are ready to be copied into Herbalisti-owned storage.
- Added `scripts/verify-cloudflare-bindings.mjs` and `npm run verify:cloudflare-config`.
- The verifier tests the configurator with fake production-shaped IDs and confirms it writes no files, makes no Cloudflare API calls, and leaves the real production configs untouched.
- Integrated the Cloudflare binding configurator check into `npm run verify:release`.

## Progress Update: 2026-06-16 API-backed Source Registry

Completed:

- Added `functions/_lib/sources.js` and `functions/api/sources.js`.
- `/api/sources` now returns the allowlisted public-source registry from D1 when `HERBALISTI_DB` is bound, otherwise from static launch records.
- `/api/sources?query=longevity` searches source name, URL, source type, role, and notes.
- The public Source Governance section now reads `/api/sources` and shows whether it is using D1, static fallback, or local seed data.
- Source cards now expose source type and non-pharma allowlist status.
- Extended API, production, D1, and launch-preflight verification so the source registry is checked as data, not only as page copy.

## Progress Update: 2026-06-16 Crossref Feed Adapter

Completed:

- Added Crossref as an active feed adapter in `functions/_lib/feed.js`.
- The adapter uses the public Crossref `/works` endpoint with a recent publication-date filter and small row count.
- Added a health-context relevance filter so Crossref records need biomedical, therapeutic, longevity, peptide, epigenetic, DNA-writing, gene-therapy, clinical, or personalized-health context.
- Added an off-topic filter to keep generic crop, plant, rice, potato, vegetable, starch, and abiotic-stress gene-editing records out of the public feed.
- Extended `scripts/verify-news-worker.mjs` with a deterministic Crossref fixture and a persisted-source assertion.
- `public/data/news.json` now includes filtered Crossref records alongside independent longevity and public preprint sources.

## Progress Update: 2026-06-16 D1 News Filter Fidelity

Completed:

- Updated `readNewsItemsFromD1` in `functions/_lib/feed.js` so topic and free-text search filters are applied in the D1 SQL query before `ORDER BY` and `LIMIT`.
- This prevents older matching D1 rows from being hidden after the scheduled feed has accumulated more than one refresh cycle.
- Extended `scripts/verify-news-worker.mjs` to prove that an older `DNA modification` row and a `self-sovereign wellbeing` query row remain findable even with `limit = 1`.
- The production `/api/news?topic=...&query=...` path is now closer to the live-fetch behavior and safer for a growing D1 cache.

## Progress Update: 2026-06-16 Signal Source Filtering And Warnings

Completed:

- Added `source` filtering to `/api/news`, including D1 filtering before `ORDER BY` and `LIMIT`.
- Added visible signal-source controls to the public Signals section: All sources, PubMed / NCBI, arXiv, bioRxiv, Crossref, Lifespan.io, and Fight Aging!.
- Added public feed-warning display so partial adapter failures are visible instead of silently reducing the feed.
- Extended API and production verifiers to check Crossref source filtering and combined source/topic filtering.
- Extended the scheduled Worker verifier with deterministic D1 source-filter checks.

## Progress Update: 2026-06-16 Registry-driven Signal Source Filters

Completed:

- Added `migrations/0004_feed_source_names.sql` so D1 `feed_sources` records carry the public news-card source label in `feed_name`.
- Added `feedName` to static source records and `/api/sources` responses.
- Updated the Signals source-filter buttons to derive from `/api/sources` instead of a hardcoded list.
- The source registry can now distinguish official source names from feed labels, for example `NCBI / PubMed E-utilities` as the source record and `PubMed / NCBI` as the filterable feed label.
- Extended D1, API, production, and launch preflight verification for the new migration and feed-name contract.

## Progress Update: 2026-06-16 Signal Filter Loading State

Completed:

- Added request-key tracking to the public Signals feed so topic, source, and text-filter changes display `Updating signals...` while the matching `/api/news` request resolves.
- This prevents stale cards from remaining visible under a newly selected source filter.
- Browser QA through local Cloudflare Pages at `http://127.0.0.1:63021/#signals` confirmed:
  - source buttons render from the registry as All sources, PubMed / NCBI, arXiv, bioRxiv, Crossref, Lifespan.io, and Fight Aging!.
  - `NCBI / PubMed E-utilities` remains the official source-registry name, while `PubMed / NCBI` is the feed label used for filtering.
  - selecting PubMed / NCBI no longer leaves unrelated cards visible and settles to the empty state when no matches are available.
  - selecting Crossref returns six Crossref-labelled cards and no non-Crossref cards.
  - a 390 px mobile viewport has no page-level horizontal overflow and the source buttons wrap cleanly.
  - browser console warnings and errors are empty.

## Progress Update: 2026-06-16 Video-ready Motion Manifest

Completed:

- Added `/data/media-manifest.json` and `src/data/mediaManifest.ts` for governed motion-media slots.
- Added hero and research Seedance video slots with local MP4 paths, OpenAI image poster fallbacks, provider metadata, and disabled launch status.
- Updated the React hero and research band to render muted looping ambient video only when a manifest slot is enabled.
- Added reduced-motion CSS so ambient video is hidden for users who prefer reduced motion.
- Extended attribution and production verification so enabled video slots must use local/owned asset paths and approved review status.
- Updated media documentation with the exact path from Seedance generation to review, provenance, storage, manifest enablement, and release verification.
- Verification passed with `npm run verify:release`; browser QA confirmed the manifest is served and disabled slots render no video elements or console warnings.

## Progress Update: 2026-06-16 Feed Identity And Deduplication

Completed:

- Added canonical feed identity helpers in `functions/_lib/feed.js` for source URL cleanup, title normalization, duplicate detection, and D1 source-hash generation.
- Feed normalization now removes tracking parameters, collapses matching DOI/title duplicates across public sources, filters blocked/future/untagged records, then applies the display limit.
- Added `scripts/verify-feed-normalization.mjs` and `npm run verify:feed-normalization`.
- Integrated the new verifier into `npm run verify:release` and the launch preflight script list.
- Verification passed with `npm run verify:feed-normalization`, `npm run lint`, `npm run build`, `npm run verify:launch -- --soft`, and `npm run verify:release`.

## Progress Update: 2026-06-16 Shareable Search URLs

Completed:

- Added URL-backed state for reference-library and Signals filters.
- The page now initializes from `book`, `bookMode`, `signal`, `topic`, and `source` query parameters, then updates the URL as filters change.
- This makes filtered research views shareable without introducing accounts, tracking, or server-side session state.
- Browser QA through local Cloudflare Pages at `http://127.0.0.1:63023/` confirmed:
  - `?book=tincture&bookMode=Making&signal=CRISPR&topic=CRISPR&source=Crossref#signals` loads the expected active controls.
  - the library shows `The Herbal Medicine-Maker's Handbook` for the shared tincture/making view.
  - the Signals feed shows Crossref-only CRISPR cards for the shared source/topic/search view.
  - changing the source back to All sources removes the `source` query parameter.
  - changing the Signals search updates the `signal` query parameter.
  - browser console warnings and errors are empty.
- Verification passed with `npm run lint`, `npm run build`, and `npm run verify:release`.

## Progress Update: 2026-06-16 Cloudflare Edge Policy

Completed:

- Added `public/_headers` for Cloudflare Pages security and cache policy.
- Added a strict self-hosted Content Security Policy without `unsafe-inline`.
- Added `public/_redirects` for canonical `https://herbalisti.com` redirects from `www` and HTTP variants.
- Replaced inline React palette swatch styles with CSS classes so the brand section works under the stricter CSP.
- Added `scripts/verify-edge-policy.mjs` and `npm run verify:edge-policy`.
- Integrated edge-policy verification into `npm run verify:release` and the launch preflight file/script checks.
- Extended production-shape verification so the local Cloudflare Pages runtime must serve CSP, nosniff, referrer, frame-deny, and immutable asset cache headers.
- Browser QA through local Cloudflare Pages at `http://127.0.0.1:63024/` confirmed logo, hero image, and all five palette swatches render under the strict CSP with no console warnings or errors.
- Verification passed with `npm run verify:edge-policy`, `npm run lint`, `npm run build`, `npm run verify:launch -- --soft`, and `npm run verify:release`.

## Progress Update: 2026-06-16 Feed Refresh Heartbeat

Completed:

- Added `migrations/0005_feed_refresh_runs.sql` so D1 records refresh attempts separately from article rows.
- Added shared feed helpers for persisting and reading latest refresh runs.
- Updated the scheduled news Worker so protected manual refreshes, scheduled refreshes, and refresh failures write heartbeat rows.
- Updated `/api/news` so live API fallback refreshes also record heartbeat rows when D1 is bound.
- Added `GET /api/feed-status` for the latest D1 refresh heartbeat.
- Updated `npm run refresh:news` so static fallback builds also write `public/data/feed-status.json`.
- Added a subtle Signals heartbeat badge that reads `/api/feed-status` first and falls back to `/data/feed-status.json`.
- Extended D1, Worker, API, production, and launch-preflight verification for the heartbeat contract.

## Progress Update: 2026-06-16 Remedy Index MVP

Completed:

- Added a safety-led remedy index matching the original Natural Medicines plan data model: remedy name, botanical name, plant-part context, traditional-use context, preparations, safety considerations, interaction flags, related remedies, tags, and source URLs.
- Added 21 core remedy records sourced as public NCCIH fact-sheet index entries rather than copyrighted book extraction.
- Added `src/data/remedies.ts` for frontend fallback records.
- Added `functions/_lib/remedies.js` and `functions/api/remedies.js`.
- Added D1 migration `migrations/0006_seed_remedies.sql`.
- Added a public Remedies section with searchable cards, preparation filtering, safety summaries, related-remedy chips, and source links.
- Extended D1, API, production, and launch-preflight verification to include the remedy table and endpoint.

## Progress Update: 2026-06-16 Unified Research Console

Completed:

- Added `functions/_lib/search.js` and `functions/api/search.js`.
- Added a public Research Console section that searches across references, remedies, public-source signals, and source registry records.
- Added URL-backed global search state through the `q` parameter.
- Added grouped result cards for References, Remedies, Signals, and Sources.
- Extended API, production, and launch-preflight verification for `/api/search?query=ginger`.

## Progress Update: 2026-06-16 Seedance Media Endpoint Verification

Completed:

- Added `functions/_lib/media.js` for Kie.ai task ID and result URL extraction.
- Updated the protected Seedance create endpoint to accept Kie task IDs returned as either `taskId` or `task_id`.
- Updated the protected Seedance status endpoint to parse provider result URLs from Kie `resultJson`, matching the documented task-detail shape.
- Added `scripts/verify-media-endpoints.mjs` and `npm run verify:media-endpoints`.
- The verifier checks fail-closed behavior without secrets, admin authentication, prompt validation, Seedance model/resolution/duration/aspect-ratio defaults, HTTPS-only media references, provider web-search suppression, D1 media-job insertion, status updates, and Kie `resultJson` URL parsing.
- Provider responses are mocked; the verifier does not contact Kie.ai, generate video, upload files, or spend credits.
- Integrated the media endpoint verifier into `npm run verify:release` and the launch preflight script/file checks.

## Progress Update: 2026-06-16 Goal Readiness Audit

Completed:

- Added `scripts/verify-goal-readiness.mjs` and `npm run verify:goal-readiness`.
- Added `docs/goal-readiness.md`.
- The audit maps the full Herbalisti objective into requirement groups: brand, OpenAI Image Gen 2 imagery, referenced-books database, remedy index, unified research console, independent public-source newsfeed, non-Big-Pharma source governance, Seedance video readiness, Cloudflare hosting, medical/privacy boundaries, and release verification coverage.
- The default audit exits successfully when the local implementation is ready but reports `goalComplete: false` while production setup is pending.
- Strict mode is available with `npm run verify:goal-readiness -- --strict` and should fail until `herbalisti.com`, D1, Worker deployment, required secrets, and live production verification are complete.
- Integrated the goal-readiness audit into `npm run verify:release` and the launch preflight script/file checks.

## Progress Update: 2026-06-16 Production Launch Packet

Completed:

- Added `scripts/prepare-launch-packet.mjs` and `npm run prepare:launch`.
- Added `docs/production-launch-packet.md`.
- The launch packet reads local Wrangler files, npm scripts, and environment-variable presence, then outputs ordered Cloudflare launch phases, commands, blockers, and the next command.
- The packet is non-destructive: it does not deploy, upload, create Cloudflare resources, write config files, call paid APIs, or print secret values.
- Added JSON and Markdown output modes with `npm run prepare:launch` and `npm run prepare:launch -- --markdown`.
- Added strict mode with `npm run prepare:launch -- --strict` for post-setup checks.
- Added the packet generator to launch preflight checks and goal-readiness evidence.

## Progress Update: 2026-06-16 Operational Health Endpoint

Completed:

- Added `functions/api/health.js` as a no-secret public health contract for launch verification.
- The health response reports public surface presence, D1/R2 binding booleans, protected Seedance/OpenAI feature states, source policy, latest feed refresh field, and launch boundaries.
- The launch boundaries explicitly keep medical advice and public accounts disabled and preserve allowlist-first source mode.
- Extended local API, production-shape, launch-preflight, and goal-readiness verification to include `/api/health`.

## Progress Update: 2026-06-16 Production Environment Contract

Completed:

- Added `docs/production-environment-contract.json` as a machine-readable launch handoff.
- The contract records the Cloudflare Pages project, D1 database, scheduled news Worker, optional R2 media bucket, required launch secrets, side-effecting commands, guardrails, and live completion gates.
- Added `scripts/verify-production-contract.mjs` and `npm run verify:production-contract`.
- Integrated the production environment contract check into release verification, launch preflight, goal-readiness, README, deployment runbook, and production launch packet documentation.

## Progress Update: 2026-06-16 D1 Binding Consistency Guard

Completed:

- Extended the launch preflight so once production bindings are active it checks that `wrangler.toml` and `wrangler.news.toml` use the same `HERBALISTI_DB` database ID.
- Extended the production environment contract verifier with the same D1 consistency rule.
- Extended the Cloudflare binding configurator verifier so dry-run generated Pages and Worker configs must share the supplied D1 database ID.
- Documented the rule in the deployment runbook and production launch packet.

## Progress Update: 2026-06-16 Live Domain Readiness Probe

Completed:

- Added `scripts/verify-live-readiness.mjs` and `npm run verify:live-readiness`.
- The probe reads public DNS and HTTP(S) state for `herbalisti.com`, including apex DNS records, HTTPS homepage reachability, HTTP-to-HTTPS redirect, `www` canonical redirect, and `/api/health`.
- Default mode is non-failing and reports `not-ready` before DNS/custom-domain setup; strict mode is a live completion gate after deployment.
- Added the strict live-readiness check to `docs/production-environment-contract.json` live completion gates.
- Documented the probe in README, deployment runbook, goal-readiness notes, and the production launch packet.

## Progress Update: 2026-06-16 High-Tech Motion System

Completed:

- Added a subtle procedural signal-lattice layer to the hero and research image band to push the visual system further toward high-tech wellbeing intelligence without requiring paid Seedance generation yet.
- Kept the video-background path governed by the existing manifest: Seedance slots remain disabled until reviewed local MP4 assets exist.
- Added `scripts/verify-motion-system.mjs` and `npm run verify:motion-system` to check procedural motion layers, manifest-controlled video slots, local-only asset paths, no provider hotlinks, and reduced-motion support.
- Integrated motion-system verification into release, launch preflight, and goal-readiness checks.

## Progress Update: 2026-06-16 Source Independence Review

Completed:

- Added source-level independence review metadata to the launch source registry, including review evidence URL, review cadence, last-reviewed date, and notes.
- Added D1 migration `migrations/0007_source_independence_review.sql` so production `feed_sources` records receive the same metadata.
- Updated the public Source Governance section to show compact review notes and cadence metadata.
- Added `scripts/verify-source-governance.mjs` and `npm run verify:source-governance` to guard the non-Big-Pharma source standard.
- Treated Fight Aging! as independent longevity commentary with a disclosed-conflict label rather than a primary research index.
- Integrated source-governance verification into release, launch preflight, goal-readiness, API, production, and D1 checks.

## Progress Update: 2026-06-16 Relationship Map

Completed:

- Added `functions/_lib/knowledge-graph.js` to derive a source-led graph from the remedy index without adding a separate graph database.
- Added public endpoint `GET /api/graph` with query and relation filters.
- Added the public `#map` Relationship Map section with search, relation controls, node counts, and calm high-tech relation cards.
- Added shareable URL parameters `map` and `relation`.
- Added `scripts/verify-knowledge-graph.mjs` and `npm run verify:knowledge-graph`.
- Extended release, launch, API, production, goal-readiness, health, contract, README, runbook, and source-verification coverage to include the graph.
- Kept the relationship vocabulary safety-led: `RELATED_TO`, `HAS_PART`, `PREPARED_AS`, `TRADITIONAL_CONTEXT`, and `SAFETY_WATCH`; no `TREATS` edge is exposed.

## Progress Update: 2026-06-16 Remedy Plant Parts

Completed:

- Added explicit `plantParts` metadata to all 21 launch remedy records in the frontend and Cloudflare Pages Function fallbacks.
- Added D1 migration `migrations/0009_remedy_plant_parts.sql` to add and backfill `plant_parts_json` in production.
- Extended remedy search so plant-part terms such as `rhizome`, `leaf`, `root`, `flower`, `berry`, `seed`, and `bulb` are first-class searchable metadata.
- Extended the source-led relationship map with `HAS_PART` edges and `Plant part` nodes while preserving the no-`TREATS` safety boundary.
- Updated remedy cards to show compact plant-part chips above preparation forms.
- Extended D1, API, production-shape, launch, contract, goal-readiness, README, runbook, launch packet, and source-verification coverage for the plant-part layer.

## Progress Update: 2026-06-16 Source Health

Completed:

- Added structured source-health records to the public-source feed adapter.
- Added `GET /api/source-health` with cached per-source health for PubMed / NCBI, arXiv, bioRxiv, Crossref, Lifespan.io, and Fight Aging!.
- Added source-health chips to the public Signals section, including source status, usable item counts, and latest usable item time.
- Added `scripts/verify-source-health.mjs` and `npm run verify:source-health` with deterministic public-source fixtures.
- Integrated source-health verification into release, launch, API, production, goal-readiness, health, contract, README, runbook, and source-verification coverage.
- Kept the source-health policy allowlist-first: source warnings do not add fallback pharma channels or broaden the feed source set.

## Progress Update: 2026-06-16 Citation Notes

Completed:

- Added `src/data/citationNotes.ts` and `functions/_lib/citation-notes.js` as the first structured citation/source notes layer.
- Added public endpoint `GET /api/citation-notes` with search and source-type filtering.
- Added D1 migration `migrations/0008_seed_citation_notes.sql` for production citation-note records.
- Added the public `#citations` section with search, type controls, linked record labels, review status, source links, and tags.
- Added citation-note results to the unified research console as a `Notes` group.
- Added `scripts/verify-citation-notes.mjs` and `npm run verify:citation-notes`.
- Integrated citation-note verification into release, launch, API, production, D1, health, contract, goal-readiness, README, runbook, and source-verification coverage.
- Kept notes copyright-safe and non-prescriptive: they are short public-source pointers, not copied book text or medical advice.

## Progress Update: 2026-06-16 Signal Intelligence

Completed:

- Added `functions/_lib/signal-intelligence.js` to summarize topic coverage, leading topic cluster, source mix, recency, and source-health counts from allowlisted public feed metadata.
- Added public endpoint `GET /api/signal-intelligence`, with D1-first behavior when production data is bound and live-public-source fallback when D1 has no rows.
- Added a high-tech `Signal intelligence` panel to the Signals section so visitors can scan topic momentum and source mix without leaving the page.
- Added `scripts/verify-signal-intelligence.mjs` and `npm run verify:signal-intelligence` with deterministic fixtures and policy-boundary checks.
- Integrated signal-intelligence verification into release, launch, API, production, health, contract, goal-readiness, README, runbook, launch packet, and source-verification coverage.
- Kept the layer metadata-only: it exposes discovery context, not health advice, treatment rankings, or protocol recommendations.

## Progress Update: 2026-06-16 Signals RSS

Completed:

- Added public endpoint `GET /api/signals.xml` for RSS access to Herbalisti Signals.
- Added homepage RSS discovery via `<link rel="alternate" type="application/rss+xml" title="Herbalisti Signals" href="https://herbalisti.com/api/signals.xml" />`.
- Added a visible `Signals RSS` control to the Signals section. It builds a filter-aware RSS URL from the active topic, source, and signal search state.
- Added `functions/_lib/signals-rss.js` so RSS generation uses the same D1-first/live-fallback public-source path, filters, source policy, and Big Pharma blocklist as `/api/news`.
- Added `scripts/verify-signals-rss.mjs` and `npm run verify:signals-rss` with deterministic XML, escaping, policy-boundary, and blocked-source checks.
- Integrated Signals RSS into health, launch, production-contract, API, production-shape, release, goal-readiness, README, runbook, and source-verification coverage.

## Progress Update: 2026-06-16 Public Data Exports

Completed:

- Added `scripts/export-public-data.mjs` and `npm run export:data` to generate versioned public JSON exports from the same launch records used by the APIs.
- Added static exports for reference books, herbal commons, remedies, citation notes, and source registry records at `/data/reference-books.json`, `/data/herbal-knowledge.json`, `/data/remedies.json`, `/data/citation-notes.json`, and `/data/sources.json`.
- Added `scripts/verify-data-exports.mjs` and `npm run verify:data-exports` to check record counts, source URLs, non-prescriptive policy boundaries, launch version metadata, and the non-Big-Pharma source boundary.
- Added a compact Public data exports panel to the Source Governance section so visitors can open the portable data layers directly.
- Integrated data-export checks into health, production-shape, production-contract, launch preflight, release, goal-readiness, README, runbook, launch packet, and source-verification coverage.

## Progress Update: 2026-06-16 Routed Brand Refinement

Completed:

- Replaced the visible logo with a Titanium flowing botanical wordmark; the tagline remains live text in the hero rather than embedded in the logo.
- Removed the previous public leaf/orbit icon from the wordmark; square technical contexts now use a Titanium typographic monogram.
- Split the visitor experience into routed pages for Search, Library, Notes, Remedies, Map, Signals, Source policy, and Governance.
- Added the Cloudflare Pages fallback route and updated the sitemap for the new page structure.
- Removed the visitor-facing Brand System and Launch Path sections while keeping `docs/brand-system.md` as the internal reference.
- Removed visible brief/starting-plan language from the UI, public data exports, API fallbacks, and D1 seed records.
- Replaced public remedy copy that repeated "calm" with more precise research and botanical language.
- Updated RSS, search-result fallbacks, verification scripts, and production-shape checks to match the routed architecture.
- Verified desktop routes and mobile deep-page spacing in the in-app browser at `http://127.0.0.1:8813/`.

## Step-by-step Plan

1. Build the local website shell and brand system.
2. Add generated visual assets that match the high-tech Zen direction.
3. Implement the searchable reference-library surface.
4. Implement the public-source feed seed and refresh adapter.
5. Add Cloudflare-ready API routes, deployment checks, and dry-run-first hosting setup.
6. Run local build and visual QA.
7. Decide whether to generate Seedance video loops after Kie.ai access is ready.
8. Expand the database from book-level records into herbs, preparations, contraindications, and cited source notes.
9. Deploy `herbalisti.com` via Cloudflare once DNS and tokens are available.

## Current Caveats

- The site is not medical advice and should keep that disclaimer visible.
- The book database and citation notes are verified source indexes, not a full extracted copyrighted knowledgebase.
- Big Pharma exclusion is implemented as source allowlisting plus metadata blocklist, not a full affiliation audit.
- Seedance video generation is not run yet because it requires Kie.ai access, API key, and credits.
- Cloudflare deployment is not complete until `herbalisti.com` DNS, Cloudflare project access, the real D1 database ID, and required secrets are provided.
- This folder is not currently a Git repository, so the saved project docs are in the local project output folder rather than committed to a repo.

## Progress Update: 2026-06-16 Home Newsfeed And Herbal Chat

Completed:

- Reworked the home page into a search-first interface with the OpenAI-generated hero image preserved in the existing subtle motion layer.
- Added a home-page chat interface that retrieves from a public-domain herbal commons index and cites Project Gutenberg source works.
- Moved the home-page newsfeed into its own section below the hero, powered by the existing allowlisted public-source signals feed, with links to the full Signals page and RSS feed.
- Added `GET /api/herbal-knowledge` and `GET/POST /api/herbal-chat` for the public-domain herbal index and local RAG-style chat responses.
- Added `/data/herbal-knowledge.json` to the static public data exports and verification contract.
- Added a visible footer with navigation, tracked topics, educational boundary, and source-use boundary.
- Added a source-policy `Herbal commons` section listing the public-domain Project Gutenberg works used by the herbal chat and database.

Current caveats:

- The chat is a deterministic local retrieval generator over the seed herbal index, not a paid hosted LLM.
- The home background image was supplied in the review thread and is tracked as a user-supplied local project asset; confirm final rights before public production if needed.
