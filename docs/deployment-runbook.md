# Herbalisti Deployment Runbook

Date: 2026-06-15

## Target

Deploy Herbalisti to `herbalisti.com` using Cloudflare Pages, Pages Functions, D1, and a scheduled Worker for feed refresh.

## Local Verification

```bash
npm install
npm run verify:release
```

`verify:release` refreshes `public/data/news.json` and `public/data/feed-status.json`, exports public data snapshots, lints, builds, verifies brand assets, verifies the high-tech motion system, verifies feed normalization, static news refresh resilience, signal coverage, signal intelligence, Signals RSS, source health, the corpus rights audit, public data exports, discovery metadata, the public API catalog, OpenSearch discovery, the Australia corpus lane rights boundary, the production cutover simulation, the guarded production deploy workflow, the guarded production deploy dry run, the mocked production D1 resolver behavior, Cloudflare token requirements, protected admin token authentication, and the external-action checklist, verifies independent-source governance, verifies the source-led relationship map, verifies citation notes, audits full-goal readiness, refreshes and verifies the objective completion audit, verifies the protected Seedance media endpoints with mocked provider responses, checks the Cloudflare binding configurator, verifies the machine-readable production environment contract, verifies local D1 migrations, verifies the scheduled news Worker and feed-refresh ledger, starts Cloudflare Pages on an open local port, runs the API smoke test including `/api/health`, runs desktop/mobile visual smoke in a real browser, runs accessibility smoke for keyboard and semantic launch basics, then shuts the local Pages server down.

Individual gates:

```bash
npm run refresh:news
npm run export:data
npm run lint
npm run build
npm run verify:github-actions
npm run verify:production-deploy-workflow
npm run verify:production-deploy-dry-run
npm run verify:production-d1-resolver
npm run verify:github-production-readiness
npm run verify:github-release-evidence
npm run verify:cloudflare-production-state
npm run verify:cloudflare-token-requirements
npm run verify:d1-manifest
npm run verify:dns-cutover
npm run verify:production-secrets
npm run prepare:production-provisioning
npm run verify:production-provisioning
npm run prepare:launch
npm run prepare:completion-audit
npm run verify:completion-audit
npm run verify:accessibility-smoke
npm run verify:attribution
npm run verify:brand
npm run verify:citation-notes
npm run verify:cloudflare-config
npm run verify:data-exports
npm run verify:discovery-metadata
npm run verify:api-catalog
npm run verify:search-discovery
npm run verify:australia-lane
npm run verify:production-cutover
npm run verify:external-actions
npm run verify:edge-policy
npm run verify:feed-normalization
npm run verify:goal-readiness
npm run verify:governance
npm run verify:admin-auth
npm run verify:knowledge-graph
npm run verify:live-readiness
npm run verify:media-endpoints
npm run verify:motion-system
npm run verify:production-contract
npm run verify:static-news-refresh
npm run verify:signal-coverage
npm run verify:signal-intelligence
npm run verify:signals-rss
npm run verify:source-governance
npm run verify:source-health
npm run verify:visual-smoke
npm run verify:corpus-rights
npm run verify:cloudflare-token-requirements
npm run verify:d1-manifest
npm run verify:dns-cutover
npm run verify:production-secrets
npm run verify:d1
npm run verify:news-worker
npm run pages:dev
```

When the Cloudflare Pages local server is running, verify the API surface:

```bash
npm run verify:api -- http://127.0.0.1:8788
```

For browser-level launch QA, run:

```bash
npm run verify:visual-smoke -- http://127.0.0.1:8788
```

`verify:visual-smoke` opens the local Pages runtime in Edge or Chrome, checks the home, search, library, Signals, and Source Policy pages at desktop and mobile widths, verifies required headings and sections, confirms generated imagery loads, fails on page-level horizontal overflow or console warnings/errors, and writes screenshots to `output/playwright/herbalisti-visual-smoke/`.

For semantic and keyboard launch QA, run:

```bash
npm run verify:accessibility-smoke -- http://127.0.0.1:8788
```

`verify:accessibility-smoke` opens the local Pages runtime in Edge or Chrome with reduced motion enabled. It checks landmark structure, skip navigation, one `h1` per route, labelled navigation, labelled controls, accessible names for interactive elements, image alt attributes, safe external-link relationships, reduced-motion behavior, and basic contrast signals.

## Launch Preflight

Before attempting production deployment, run:

```bash
npm run verify:launch
```

The launch preflight is intentionally local and non-destructive. It does not deploy, upload, call paid APIs, create external resources, or print secret values. It verifies that the project files, npm scripts, D1 bindings, and locally visible deployment variables are in the expected shape.

Use this form when you want the JSON report without a failing exit code:

```bash
npm run verify:launch -- --soft
```

Expected current state before Cloudflare setup: `needs-production-setup`, because `wrangler.toml` and `wrangler.news.toml` still need real `HERBALISTI_DB` `database_id` values from Cloudflare D1.

For full objective status, run:

```bash
npm run verify:goal-readiness
```

Expected current state before Cloudflare setup: `local-ready-production-pending`. Strict completion mode is available with `npm run verify:goal-readiness -- --strict` and should fail until the live domain, D1, Worker, secrets, and production verification are complete.

For the current portable completion evidence, run:

```bash
npm run prepare:completion-audit
npm run verify:completion-audit
```

`prepare:completion-audit` writes `docs/objective-completion-audit.json` and `docs/objective-completion-audit.md` from the current local evidence. `verify:completion-audit` recomputes the stable audit signature and fails if those artifacts drift from the current goal-readiness, launch-preflight, production-contract, public-data, and feed-heartbeat state.

For the current production cutover packet, run:

```bash
npm run prepare:launch
npm run prepare:launch -- --markdown
```

The packet reads local config and environment-variable presence, then prints the ordered Cloudflare launch phases without deploying, creating resources, writing config files, calling paid APIs, or printing secret values.

The machine-readable production environment contract is stored at `docs/production-environment-contract.json` and verified with:

```bash
npm run verify:production-contract
```

It records the required Cloudflare Pages project, D1 database, scheduled Worker, optional R2 media bucket, Cloudflare secret scopes, side-effecting commands, launch guardrails, and live completion gates.

GitHub Actions verification is local and read-only:

```bash
npm run verify:github-actions
```

It checks that the public repository has a push/PR CI workflow for repository-safe gates, a manual release-gate workflow for the heavier browser and Cloudflare-runtime checks, read-only workflow permissions, no deployment/resource/secret mutation commands, reproducible Wrangler tooling, explicit public corpus-export mode on GitHub runners, and launch-contract wiring. Full local corpus verification remains covered by `npm run verify:release` on a workstation with the local corpus layer.

GitHub release evidence verification is read-only and should be run after the manual release gate has completed:

```bash
npm run verify:github-release-evidence
```

It checks the public GitHub Actions metadata for fresh successful CI and manual release-gate runs on the intended launch commit, then verifies the visual-smoke artifact metadata without downloading it.

Guarded production deploy workflow verification is local and read-only:

```bash
npm run verify:production-deploy-workflow
```

It checks `.github/workflows/production-deploy.yml` without running it. The workflow is manual-only, requires the exact `deploy-herbalisti-production` confirmation phrase, uses the GitHub `production` environment, validates named GitHub secrets, verifies exact release evidence, configures runner-local D1 bindings, applies remote D1 migrations, sets Cloudflare secrets from GitHub secrets without echoing values, deploys Pages and the scheduled Worker, and runs strict live verification unless temporarily skipped during DNS transition.

Guarded production deploy dry-run verification is local and mocked:

```bash
npm run verify:production-deploy-dry-run
```

It rehearses the production workflow's Cloudflare-facing command path with a temporary fake `npx wrangler`: Pages project list/create, D1 resolution, in-memory binding activation, remote migration command shape, secret put command shape, Pages deploy, and scheduled Worker deploy. It does not call Cloudflare, create resources, mutate DNS, deploy, set real secrets, write Wrangler config files, call paid APIs, or print secret values.

Production D1 resolver verification is local and mocked:

```bash
npm run verify:production-d1-resolver
```

It runs the real D1 resolver against a temporary fake `npx wrangler` command and proves the existing-database, create-if-missing, and missing-without-create paths without calling Cloudflare, creating resources, mutating DNS, deploying, setting secrets, or printing secret values.

GitHub production readiness verification is read-only:

```bash
npm run verify:github-production-readiness
npm run verify:github-production-readiness -- --strict
```

It checks GitHub workflow, environment, secret-name, and release-run metadata without creating environments, setting secrets, dispatching workflows, or printing secret values. Current setup should report `needs-github-production-setup` until the `production` environment and required GitHub secret names are configured.

Cloudflare production state verification is read-only and should be run before resource creation or deployment:

```bash
npm run verify:cloudflare-production-state
npm run verify:cloudflare-production-state -- --strict
```

Without a valid Wrangler session or `CLOUDFLARE_API_TOKEN`, it reports `needs-cloudflare-auth`. Once authenticated, it checks visible Cloudflare Pages, D1, Worker deployment, custom-domain metadata, and required secret names without creating resources, deploying, mutating DNS, setting secrets, calling paid APIs, or printing secret values.

Cloudflare API token requirement planning is local and value-free:

```bash
npm run prepare:cloudflare-token-requirements
npm run verify:cloudflare-token-requirements
```

It writes `docs/cloudflare-token-requirements.json` and `docs/cloudflare-token-requirements.md`, naming the Cloudflare permission set needed by `CLOUDFLARE_API_TOKEN` for the guarded workflow: Cloudflare Pages Edit, D1 Edit, Workers Scripts Edit, and Account Settings Read, with optional R2 permission kept separate until reviewed video assets need owned storage. It does not read, request, set, store, or print token values.

DNS/custom-domain cutover planning is read-only:

```bash
npm run prepare:dns-cutover
npm run verify:dns-cutover
```

It records current public DNS for `herbalisti.com`, checks whether the apex domain is already delegated to Cloudflare nameservers, notes CAA certificate-readiness state, and writes `docs/dns-cutover-plan.json` plus `docs/dns-cutover-plan.md`. It does not call Cloudflare APIs, change nameservers, mutate DNS, deploy, create resources, set secrets, or print secret values.

Production secret setup planning is local and value-free:

```bash
npm run prepare:production-secrets
npm run verify:production-secrets
```

It writes `docs/production-secret-setup.json` and `docs/production-secret-setup.md`, naming the required GitHub `production` environment secrets for the guarded deployment workflow and the Cloudflare runtime secret fallback commands. It does not read, request, set, store, or print secret values.

Production provisioning readiness is local and read-only except for the generated handoff files:

```bash
npm run prepare:production-provisioning
npm run verify:production-provisioning
```

It records the current Wrangler binding state, hidden required secret names, next approved external action, and exact operator sequence before Cloudflare resource creation, migrations, secrets, deployment, domain connection, or live verification.

Public data export verification is local and read-only after generation:

```bash
npm run export:data
npm run verify:data-exports
npm run verify:discovery-metadata
npm run verify:api-catalog
npm run verify:search-discovery
```

`verify:discovery-metadata` checks the inline JSON-LD, canonical URL, search action, public data catalog, generated `public/data/discovery-metadata.json`, generated sitemap, robots file, public data/RSS sitemap entries, and dataset counts for the reference-book, herbal commons, remedy, citation-note, and source-registry exports.

`verify:api-catalog` checks generated `public/data/api-catalog.json`, the public/protected endpoint split, the no-secret-values boundary, the UI export link, the sitemap and discovery metadata links, the public health surface, and the release/production verifier wiring.

`verify:search-discovery` checks generated `public/opensearch.xml`, the homepage `<link rel="search">`, the public search route, the JSON search API route, sitemap and discovery metadata links, the public health surface, and the release/production verifier wiring.

It checks `/data/reference-books.json`, `/data/herbal-knowledge.json`, `/data/remedies.json`, `/data/citation-notes.json`, and `/data/sources.json` for launch-version metadata, non-prescriptive policy text, record counts, source URLs, public-domain herbal source licensing, and the non-Big-Pharma allowlist boundary. The herbal commons check now requires the corpus-scale layer: at least 100 herbal records, at least 100 corpus-derived profiles, at least 150 rights-cleared source works, and source-linked corpus metadata on profile records.

Corpus rights verification is local and read-only unless the audit handoff is explicitly regenerated:

```bash
npm run verify:corpus-rights
npm run corpus:rights-audit
```

It checks the corpus registry, chunk manifests, normalized text artifacts, and public exports against the inclusion standard: no-key public archive lanes only, approved public-domain or permissive rights statuses, source URLs from Project Gutenberg/NLM/Wellcome, book-like acquisition modes, and no feed/blog/news scraping.

Australia corpus lane verification is local and read-only:

```bash
npm run corpus:australia-lane
npm run verify:australia-lane
```

It checks that the Australian lane is prepared but not populated, that Trove is treated as metadata-review-only until API access and item-level rights are separately approved, and that no Australian candidate is marked corpus-ready before reuse rights are proven.

Production cutover simulation is local and non-destructive:

```bash
npm run simulate:production-cutover
npm run prepare:production-cutover
npm run verify:production-cutover
```

It rehearses the future D1/R2 binding activation with fake resource IDs, verifies that Pages Functions and the scheduled Worker share the same D1 target, checks that the optional R2 media binding stays out of the news Worker, and confirms that the external launch actions are sequenced before deployment and DNS work. It does not call Cloudflare, deploy, mutate DNS, print secrets, spend credits, or write Wrangler config files.

External action checklist generation is local and read-only apart from writing the handoff artifacts:

```bash
npm run prepare:external-actions
npm run verify:external-actions
```

It separates normal local work from actions that require fresh approval: Cloudflare resource creation, remote migrations, secrets, deployment, DNS/custom-domain changes, and optional paid Seedance generation. It does not print or store secret values.

Live domain readiness can be checked without deploying or mutating DNS:

```bash
npm run verify:live-readiness
```

Before DNS/custom-domain setup this should normally report `not-ready` without failing. After Cloudflare Pages, DNS, the required production D1 binding, and protected Seedance endpoint secrets are active, strict mode should pass before the full production verifier:

```bash
npm run verify:live-readiness -- --strict
```

## Cloudflare Setup

1. Add `herbalisti.com` to Cloudflare or point its DNS to Cloudflare.
2. Create a Cloudflare Pages project named `herbalisti`.
3. Build command: `npm run build`.
4. Build output directory: `dist`.
5. Connect the custom domain `herbalisti.com`.

Before custom-domain work, run:

```bash
npm run verify:dns-cutover
```

Current expected state before DNS setup: `needs-dns-cutover`, because the apex domain is still delegated outside Cloudflare.

## Brand Assets

Core launch assets:

- `public/assets/herbalisti-logo.svg`
- `public/assets/herbalisti-mark.svg`
- `public/favicon.svg`
- `public/manifest.webmanifest`
- `public/data/media-manifest.json`
- `docs/brand-system.md`

Verify before deployment:

```bash
npm run verify:brand
npm run verify:motion-system
```

## Edge Policy

Cloudflare Pages launch policy is defined in:

- `public/_headers`
- `public/_redirects`

The policy sets a self-hosted Content Security Policy, denies framing, disables broad browser permissions, keeps referrers restrained, applies immutable caching to built assets, and redirects `www` / HTTP variants to canonical `https://herbalisti.com`.

Verify before deployment:

```bash
npm run verify:edge-policy
```

## Direct Upload Deploy

After logging in to Wrangler:

```bash
npm run deploy:cloudflare
```

The script builds the site and runs:

```bash
npm run wrangler -- pages deploy dist --project-name herbalisti
```

## Post-deployment Verification

After DNS and the custom domain are active, verify the live site:

```bash
npm run verify:dns-cutover
npm run verify:live-readiness -- --strict
npm run verify:production -- https://herbalisti.com
```

This reads the public website only. It checks:

- homepage title, canonical production URL, manifest link, and launch asset references.
- logo, mark, generated hero image, generated research image, favicon, manifest, robots, and sitemap.
- `/api/books`, book search, ISBN search, and the corrected `The Complete Illustrated Holistic Herbal` record.
- `/api/citation-notes`, citation-note search, type filtering, source URLs, tags, and unified search `Notes` results.
- `/api/remedies`, remedy search, remedy preparation filtering, safety summaries, and public source URLs.
- `/api/graph`, relationship-map node and edge counts, ginger neighborhood search, relation filtering, safety-watch context, and no treatment-claim edges.
- `/api/search`, grouped unified search across references, remedies, signals, and sources.
- `/api/sources`, source-registry search, allowlisted source flags, and non-Big-Pharma source flags.
- `/api/signal-intelligence`, metadata-only topic coverage, leading topic cluster, source mix, recent-signal count, source-health summary, and non-medical policy boundary.
- `/api/source-health`, per-source feed health for the allowlisted public research and independent longevity sources.
- `/api/news`, topic-tagged signal rows, Big Pharma source-name blocklist, DNA modification topic filtering, and no-match search behavior.
- `/api/feed-status` and `/data/feed-status.json`, confirming the public refresh heartbeat surface exists.
- `/api/health`, confirming the public launch surface, D1/R2 binding presence, protected feature states, feed source policy, and disabled medical-advice/account boundaries without exposing secret values.
- `/data/governance.json`, including educational boundary, allowlist-first source policy, public-launch privacy restraint, disabled automated advice, and human-review requirements.

The same verifier now runs inside `npm run verify:release` against the temporary local Cloudflare Pages URL as a production-shape smoke test before deployment.

## Media Provenance And Attribution

The public launch records generated media and direct dependency attribution:

- Human-readable note: `docs/attribution.md`
- Public media provenance: `/data/media-provenance.json`
- Public motion manifest: `/data/media-manifest.json`
- Local verifier: `npm run verify:attribution`

The attribution verifier checks:

- OpenAI-generated launch image provenance for `herbalisti-hero.png` and `herbalisti-research.png`.
- Original project SVG status for the Herbalisti logo and mark.
- Disabled Seedance motion-media slots for the hero and research sections until reviewed local video assets exist.
- No stock-photo dependencies and no external media hotlinks.
- Direct runtime/build package licenses from installed package metadata.
- The public launch assets referenced by the app, manifest, and social metadata.

The protected media endpoint verifier checks:

- `POST /api/media/seedance` fails closed when `KIE_API_KEY` or `MEDIA_ADMIN_TOKEN` is missing.
- Unauthorized create/status requests are rejected before any provider call is attempted.
- Prompt length, model, resolution, duration, aspect ratio, HTTPS-only media references, and disabled provider web search are enforced.
- Kie task IDs are persisted into `media_jobs` when D1 is bound.
- Kie `resultJson` URLs are parsed and stored during status checks.
- Provider calls are mocked; the verifier does not generate video, spend credits, upload files, or contact Kie.ai.

## Governance Policy

The public launch includes a visible governance section and a machine-checkable policy file:

- Visible section: `#governance`
- Public policy: `/data/governance.json`
- Local verifier: `npm run verify:governance`

The Governance policy keeps four boundaries explicit:

- Herbalisti is an educational research interface only and does not diagnose, treat, prescribe, or replace professional care.
- The feed remains allowlist-first, with Big Pharma-owned channels excluded unless explicitly approved.
- The first public launch does not collect user accounts, personal health records, payment forms, or private medical intake.
- Generated videos, medical commentary, protocol-style recommendations, and treatment claims require human review before publication.

## D1 Database

For local migration verification without Cloudflare account access:

```bash
npm run prepare:d1-manifest
npm run verify:d1-manifest
npm run verify:d1
```

The manifest commands write and verify `docs/d1-production-migration-manifest.json` and `docs/d1-production-migration-manifest.md`, fingerprinting the ordered SQL files that will later be applied remotely. `verify:d1` uses `wrangler.local.toml`, creates a clean ignored local D1 sandbox at `.wrangler-herbalisti-verify`, applies all migrations, and checks the reference-book metadata, feed source seed records, `news_items`, and `media_jobs`.

Create the database:

```bash
npm run wrangler -- d1 create herbalisti
```

The guarded GitHub production workflow can resolve the D1 database named `herbalisti` during the approved workflow run, creating it only if it is missing, and write the database ID to the runner environment without storing it as a GitHub secret:

```bash
npm run verify:production-d1-resolver
npm run resolve:production-d1 -- --create-if-missing --github-env "$GITHUB_ENV"
```

Use the local configurator to update both production Wrangler files with the returned database ID:

```bash
npm run configure:cloudflare -- --d1 <database_id> --apply
```

Both `wrangler.toml` and `wrangler.news.toml` must use the same `HERBALISTI_DB` `database_id`. `npm run verify:launch -- --soft` and `npm run verify:production-contract` check this once the bindings are active, so the public site and scheduled news Worker cannot silently point at different D1 databases.

For the optional generated-media bucket:

```bash
npm run configure:cloudflare -- --d1 <database_id> --r2 herbalisti-media --apply
```

Without `--apply`, the configurator is a dry run. It writes no files and makes no Cloudflare API calls.

Manual file editing should only be needed if Cloudflare changes the Wrangler binding format later.

Apply migrations:

```bash
npm run verify:d1-manifest
npm run wrangler -- d1 migrations apply herbalisti --local
npm run wrangler -- d1 migrations apply herbalisti --remote
```

The migrations create:

- `reference_books`
- `remedies`
- `feed_sources`
- `news_items`
- `media_jobs`
- `feed_refresh_runs`
- `citation_notes`

Migration `0003_reference_book_metadata.sql` adds source-verification metadata to `reference_books`, including subtitle, publisher, publication date, ISBN-13, page count, external catalogue URL, verification source, and citation note.

Migration `0004_feed_source_names.sql` adds `feed_name` to `feed_sources` so the public Signals source filter can be driven from the source registry while still using the exact source labels stored on news items.

Migration `0005_feed_refresh_runs.sql` adds `feed_refresh_runs`, which records manual, scheduled, live-API, and static refresh attempts with timing, status, item counts, persisted counts, warning counts, warnings, and source policy.

Migration `0006_seed_remedies.sql` adds the first remedy index: 21 core herbs with botanical names, common names, traditional-use context, preparation forms, safety summaries, interaction flags, related remedies, tags, and public NCCIH source URLs.

Migration `0007_source_independence_review.sql` adds source-level independence review metadata to `feed_sources`, including independence status, ownership review, evidence URL, review cadence, last reviewed date, and review note.

Migration `0008_seed_citation_notes.sql` adds source-led citation notes for references, remedies, signals, and governance decisions. The notes point to public source URLs and short review context without copying copyrighted book content or publishing medical advice.

Migration `0009_remedy_plant_parts.sql` adds `plant_parts_json` to remedies and backfills source-led plant-part context such as root, leaf, flower, berry, seed, bulb, and rhizome for the launch remedy set.

## Secrets

Before entering or setting any secret value, run:

```bash
npm run prepare:production-secrets
npm run verify:production-secrets
```

Set these in the Cloudflare dashboard or with Wrangler:

```bash
npx wrangler pages secret put KIE_API_KEY --project-name herbalisti
npx wrangler pages secret put MEDIA_ADMIN_TOKEN --project-name herbalisti
```

The canonical secret list and scope mapping lives in `docs/production-environment-contract.json`. Do not paste secret values into chat, docs, config files, or logs.

Set this for the scheduled news Worker:

```bash
npx wrangler secret put FEED_ADMIN_TOKEN --config wrangler.news.toml
```

For CI-style deployment automation, provide these in the deployment environment rather than committing them:

```bash
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

`CLOUDFLARE_D1_DATABASE_ID` is not a GitHub production secret. The guarded workflow derives it from the Cloudflare D1 database named `herbalisti`.

Optional later:

```bash
npx wrangler pages secret put OPENAI_API_KEY --project-name herbalisti
```

That key remains optional. It is only needed when we want hosted OpenAI synthesis for the archive chat or repeatable server-side image generation.

Do not paste secrets into chat or commit them to the repository.

## Seedance Video Enablement

The site is already wired for cinematic background loops without making video mandatory for launch. The current `/data/media-manifest.json` keeps both MP4 slots disabled:

- `/assets/herbalisti-hero-loop.mp4`
- `/assets/herbalisti-research-loop.mp4`

Enable a slot only after the Seedance output is generated through Kie.ai, reviewed, stored as a local or Herbalisti-owned asset, recorded in provenance, and verified with:

```bash
npm run verify:attribution
npm run verify:release
```

Do not enable a manifest slot while it points to a missing local file or a provider hotlink.

## Self-updating Newsfeed

The public website can read `/api/news` from D1 once `HERBALISTI_DB` is bound. The scheduled Worker refreshes that D1 table every six hours and writes a row to `feed_refresh_runs`. The frontend also reads `/api/feed-status`, falling back to `/data/feed-status.json`, so the Signals section can show a refresh heartbeat rather than relying only on article timestamps.

For static fallback builds, `npm run refresh:news` preserves the previous non-empty `public/data/news.json` when the latest refresh returns zero usable items. It still writes `public/data/feed-status.json` with `completed_with_preserved_snapshot`, the attempted item count, preserved public item count, and source warnings. This prevents a temporary source outage from collapsing the public fallback feed to an empty page.

For deterministic local Worker verification:

```bash
npm run verify:news-worker
```

This uses `wrangler.news.local.toml`, applies migrations to a clean ignored local D1 sandbox, runs the real scheduled-news Worker module with public-source fixtures, verifies that unauthenticated manual refresh is rejected, verifies that the protected manual refresh persists feed rows, verifies that manual and scheduled refreshes write heartbeat rows, and verifies that the scheduled handler registers one background refresh task. The deterministic fixture set covers PubMed / NCBI, arXiv, bioRxiv, Crossref, Lifespan.io, and Fight Aging!.

1. Uncomment and fill the D1 binding in `wrangler.news.toml`.
2. Set a manual-refresh token:

```bash
npm run wrangler -- secret put FEED_ADMIN_TOKEN --config wrangler.news.toml
```

3. Deploy the scheduled Worker:

```bash
npm run deploy:news-worker
```

The cron schedule is currently:

```toml
[triggers]
crons = ["17 */6 * * *"]
```

Manual refresh is available through the Worker URL when the `FEED_ADMIN_TOKEN` is provided as `Authorization: Bearer ...` or `x-herbalisti-feed-token`.

## Current API Surface

- `GET /api/health`: returns the public launch health contract, including surface presence, D1/R2 binding booleans, protected feature states, source policy, latest refresh field, and launch boundaries without secret values.
- `GET /api/books`: returns D1 `reference_books` records when `HERBALISTI_DB` exists, otherwise static seed records.
- `GET /api/books?query=tincture`: searches title, author JSON, mode, role, tags, status, notes, and source status.
- `GET /api/books?mode=Safety`: filters book records by the public library mode.
- `GET /api/books?query=9781852308476`: verifies ISBN metadata search and the corrected David Hoffmann record for `The Complete Illustrated Holistic Herbal`.
- `GET /api/books?query=Crossing%20Press`: verifies publisher metadata search.
- `GET /api/citation-notes`: returns D1 `citation_notes` records when `HERBALISTI_DB` exists, otherwise static seed records.
- `GET /api/citation-notes?query=ginger`: searches citation note title, linked record, source, note text, tags, review status, and review date.
- `GET /api/citation-notes?type=remedy`: filters citation notes by source type.
- `GET /api/remedies`: returns D1 `remedies` records when `HERBALISTI_DB` exists, otherwise static seed records.
- `GET /api/remedies?query=ginger`: searches remedy name, botanical name, common names, plant parts, traditional-use context, preparations, safety summary, interactions, related remedies, tags, source name, and source status.
- `GET /api/remedies?query=rhizome`: verifies plant-part metadata search.
- `GET /api/remedies?preparation=Infusion`: filters remedy records by public preparation type.
- `GET /api/graph`: returns the source-led relationship graph across remedy, plant-part, preparation, context, and safety nodes.
- `GET /api/graph?query=ginger`: returns the ginger relationship neighborhood, including related remedy, plant-part, and preparation context.
- `GET /api/graph?query=ginger&relation=HAS_PART`: filters graph edges to plant-part context.
- `GET /api/graph?relation=SAFETY_WATCH`: filters graph edges to safety-watch context.
- `GET /api/search?query=ginger`: returns grouped results from references, citation notes, remedies, signals, and sources for the public research console.
- `GET /api/sources`: returns D1 `feed_sources` records when `HERBALISTI_DB` exists, otherwise static allowlist source records.
- `GET /api/sources?query=longevity`: searches source name, URL, source type, role, and notes.
- `GET /api/source-health`: returns cached source-by-source health for PubMed / NCBI, arXiv, bioRxiv, Crossref, Lifespan.io, and Fight Aging!, including status, usable item count, newest item time, allowlist flag, and Big Pharma flag.
- `GET /api/signal-intelligence`: returns metadata-only signal intelligence for the selected public-source feed filters, including topic coverage, leading topic cluster, source mix, recent-signal count, and the non-medical policy boundary.
- `GET /api/feed-status`: returns the latest D1 refresh heartbeat when `HERBALISTI_DB` exists, otherwise a null dynamic fallback so the frontend can read `/data/feed-status.json`.
- `GET /data/feed-status.json`: static heartbeat written by `npm run refresh:news` for local/static fallback builds.
- `GET /api/news`: returns D1-cached feed items when available, otherwise live public-source signals with edge caching and D1 persistence.
- `GET /api/news?topic=DNA%20modification`: verifies server-side topic filtering for the expanded signal-feed surface.
- `GET /api/news?source=Crossref`: verifies server-side source filtering.
- `GET /api/news?source=Crossref&topic=Gene%20therapy`: verifies combined source and topic filtering.
- `GET /api/news?query=unlikely-herbalisti-no-match-24680`: verifies server-side no-match search returns an empty result rather than stale fallback content.
- The React frontend reads `/api/books`, `/api/remedies`, `/api/graph`, `/api/news`, and `/api/sources` first, then falls back to static refreshed data and seed records when running outside Cloudflare Pages.
- The React frontend syncs public filters to URL query parameters: `book`, `bookMode`, `map`, `relation`, `signal`, `topic`, and `source`.
- `POST /api/media/seedance`: protected admin endpoint that creates a Kie.ai Seedance 2.0 video job.
- `GET /api/media/seedance-status?taskId=...`: protected admin endpoint that checks Kie.ai task status.
- `GET /data/media-manifest.json`: public motion-media manifest for disabled/enabled ambient video slots.

## Remaining Production Decisions

- Whether the public feed should eventually read only from D1 after scheduled refresh, or continue keeping the live API fallback.
- Whether Seedance results should be copied into Cloudflare R2 before publication.
- Whether to add a human review queue before generated videos appear on the live site.

## Latest Local Verification

Date: 2026-06-16 Australia/Sydney

- `npm run refresh:news`: passed; wrote 20 feed items to `public/data/news.json`, including filtered Crossref biomedical/gene-editing metadata.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run verify:cloudflare-config`: passed; verified the D1/R2 configurator builds active Pages and scheduled Worker bindings from the same fake Cloudflare D1 ID without modifying local Wrangler files.
- `npm run verify:edge-policy`: passed; verified `public/_headers`, `public/_redirects`, strict self-hosted CSP without `unsafe-inline`, asset/data cache policies, canonical redirects, and no inline React style objects.
- `npm run verify:attribution`: passed; verified 4 launch media provenance records, 2 OpenAI-generated image assets, 2 disabled Seedance motion-media slots, no stock media/hotlink policy, generated image dimensions, motion manifest usage, and 16 direct package licenses.
- `npm run verify:brand`: passed; verified logo/mark/favicon assets, manifest metadata, canonical URL, generated image dimensions, and removal of the generic leaf icon logo.
- `npm run verify:motion-system`: passed; verified hero/research procedural signal-lattice layers, manifest-governed Seedance video slots, local-only asset paths, no provider hotlinks, reduced-motion support, and disabled video slots with `pending_generation` review status.
- `npm run verify:feed-normalization`: passed; verified canonical URL cleanup, title normalization, cross-source duplicate collapse, canonical D1 source hashes, blocked-source filtering, future-date filtering, untagged-row filtering, and limit-after-dedupe behavior.
- `npm run verify:source-health`: passed; verified 6 allowlisted non-Big-Pharma source-health records with deterministic fixtures, 6 healthy fixture sources, 0 empty fixture sources, 0 warning fixture sources, frontend source-health UI presence, and `/api/source-health` policy metadata.
- `npm run verify:signal-intelligence`: passed; verified the public signal-intelligence endpoint, frontend panel, health surface, deterministic topic/source coverage, leading topic cluster, source-health warning count, and non-medical policy boundary.
- `npm run verify:signals-rss`: passed; verified deterministic RSS XML generation, canonical `https://herbalisti.com/api/signals.xml` identity, XML escaping, RSS content type, source-policy and non-medical boundary text, Crossref/source categories, and blocked-source filtering.
- `npm run verify:citation-notes`: passed; verified 10 citation notes across reference, remedy, signal, and governance types, HTTPS source URLs, concise non-prescriptive note text, search/type filtering, `/api/citation-notes`, the `#citations` UI surface, D1 migration `0008_seed_citation_notes.sql`, unified search `Notes` results, and `/api/health` surface coverage.
- `npm run verify:source-governance`: passed; verified 6 launch source records with source independence review metadata, HTTPS evidence URLs, quarterly-or-before-expansion review cadence, no blocked pharma-owned channel names, source-review UI fields, public governance conflict-handling policy, and the disclosed-conflict label for Fight Aging! commentary.
- `npm run verify:knowledge-graph`: passed; verified 21 remedy nodes, 161 graph nodes, 288 graph edges, all five relation types including `HAS_PART`, ginger rhizome plant-part context, St. John's wort safety-watch context, and no `TREATS` edge.
- `npm run verify:goal-readiness`: passed with status `local-ready-production-pending`; confirmed 14 full-objective requirement groups pass locally and 3 remain production-pending: independent newsfeed deployment, Seedance video production setup, and Cloudflare hosting/DNS/secrets.
- `npm run verify:governance`: passed; verified the visible governance section, footer medical boundary, public policy file, allowlist-first source policy, privacy restraint, disabled automated advice, and human-review requirements.
- `npm run verify:admin-auth`: passed; verified shared protected admin-token authentication for bearer and Herbalisti admin/feed headers, rejects wrong and partial tokens, fails closed without configured secrets, and prevents direct token-string comparisons from returning to the news Worker or Seedance endpoints.
- `npm run verify:media-endpoints`: passed; verified protected Seedance endpoints fail closed without secrets, reject unauthorized requests before provider calls, validate prompts, sanitize model/resolution/duration/aspect-ratio/reference URL inputs, persist created media jobs, parse Kie `resultJson` URLs, and update media-job status with mocked provider responses only.
- `npm run verify:d1`: passed; applied all migrations to a clean local D1 sandbox, verified 4 reference books, 6 allowlisted non-Big-Pharma feed sources, feed-display names, corrected bibliography metadata, `news_items` insert/query behavior, `media_jobs` media columns, 21 remedies, and 10 `citation_notes` records.
- `npm run verify:production-contract`: passed; verified `docs/production-environment-contract.json` against package scripts, Wrangler project names, six-hour cron, required Cloudflare resources, required launch secrets, no-secret command shapes, guardrails, live completion gates, and the D1 binding consistency rule. Current consistency status is `pending-bindings` until the real D1 ID is applied.
- `npm run verify:live-readiness`: passed as a non-failing report with status `not-ready`; current DNS resolves the apex to `192.64.119.134` with registrar nameservers, HTTP redirects to `http://www.herbalisti.com/`, HTTPS/API health are not serving Herbalisti yet, and the next action remains Cloudflare Pages custom-domain/DNS connection.
- `npm run verify:launch -- --soft`: passed as a non-failing report; checked 71 required launch files and 27 scripts including `functions/api/citation-notes.js`, `functions/api/signal-intelligence.js`, `functions/api/signals.xml.js`, `functions/api/source-health.js`, `functions/api/graph.js`, `functions/api/health.js`, `functions/_lib/signals-rss.js`, `scripts/verify-citation-notes.mjs`, `scripts/verify-signal-intelligence.mjs`, `scripts/verify-signals-rss.mjs`, `scripts/verify-source-health.mjs`, `scripts/verify-knowledge-graph.mjs`, `scripts/verify-live-readiness.mjs`, `scripts/verify-motion-system.mjs`, `scripts/verify-source-governance.mjs`, `migrations/0009_remedy_plant_parts.sql`, `migrations/0008_seed_citation_notes.sql`, `migrations/0007_source_independence_review.sql`, and `docs/production-environment-contract.json`, returned `needs-production-setup` with two true blockers: create the production D1 database, then run `npm run configure:cloudflare -- --d1 <database_id> --apply` so `wrangler.toml` and `wrangler.news.toml` receive the real shared `HERBALISTI_DB` binding.
- `npm run verify:news-worker`: passed; verified protected manual refresh through bearer and feed-token headers, wrong-token rejection, scheduled `waitUntil`, 6 deterministic public-source feed items, D1 persistence, source names including Crossref, topic tags, Big Pharma blocklist filtering, and D1 topic/query/source filtering before `LIMIT`.
- `npm run verify:release`: passed after the protected admin-auth work; ran refresh, lint, build, brand, attribution, motion-system verification, edge-policy, protected admin-token verification, feed normalization, signal-intelligence verification, Signals RSS verification, source-health verification, source-governance verification, knowledge-graph verification with `HAS_PART`, citation-notes verification, goal readiness, governance, Seedance media endpoint verification, Cloudflare configurator verification, production contract verification, D1 including `plant_parts_json`, scheduled news Worker, local Cloudflare Pages startup, API smoke, production-shape smoke, visual smoke, and accessibility smoke in one command.
- Cloudflare Pages API smoke inside `npm run verify:release`: passed through the local runtime and included `/api/citation-notes` checks for 10 notes, `/api/search` checks for 5 grouped result types including `Notes`, `/api/remedies?query=rhizome` checks for plant-part metadata, `/api/signals.xml?source=Crossref` checks for RSS content type and 6 Crossref RSS items, `/api/signal-intelligence` topic/source coverage checks, `/api/source-health` checks for 6 source-health records, `/api/graph` checks for 161 nodes, 288 edges, and `HAS_PART` filtering, and `/api/health` checks for `status: ok`, launch surface presence including `signalsRssApi`, D1/R2 binding booleans, protected feature states, source policy, latest refresh field, and disabled medical-advice/account boundaries.
- `scripts/verify-production.mjs` against the temporary local Cloudflare Pages URL: passed inside `npm run verify:release`, checking homepage metadata including the RSS alternate link, served security/cache headers, assets, media provenance, motion media manifest, governance policy, manifest, robots, sitemap, health API, book API, book search, ISBN search, remedy API, rhizome remedy search, relationship graph API, `HAS_PART` graph filtering, source registry API, source-health API, signal-intelligence API, Signals RSS content type/cache/source policy/medical boundary, source registry search, news API, DNA topic filtering, Big Pharma source-name blocklist, and no-match news search.
- Direct API checks against `http://127.0.0.1:8811/api/signals.xml?source=Crossref` confirmed RSS XML is served by the local Cloudflare Pages runtime with `application/rss+xml; charset=utf-8`, short public caching, Crossref category tags, policy text, non-medical boundary text, and 6 RSS items.
- Direct API checks against `http://127.0.0.1:8788/api/news` confirmed live public-source results, `topic=DNA modification` filtering, and empty results for an intentionally impossible query.
- `npm run wrangler -- pages dev dist --port 8788 --compatibility-date 2026-06-15`: `/api/news` returned live items with source `live-fetch`.
- `npm run wrangler -- dev --config wrangler.news.toml --local --port 8790`: scheduled Worker loaded and returned `unauthorized` for unauthenticated manual refresh, as expected.
- Browser QA through local Cloudflare Pages/Vite runtimes: generated images loaded, desktop rendered 4 books and live feed items, strict CSP served without breaking the page, logo/hero/palette swatches rendered under CSS-only styling, `tincture` reference search returned the handbook, shareable URL filters loaded expected library and Signals controls, changing the Signals source/search updated URL parameters without reload, the full signal filter set rendered without horizontal overflow, source-health chips rendered 6 allowlisted sources with live public-source counts and a `5 healthy / 1 empty / 0 warnings` summary, registry-driven source filter buttons rendered as All sources, PubMed / NCBI, arXiv, bioRxiv, Crossref, Lifespan.io, and Fight Aging!, the PubMed / NCBI filter hid stale cards and settled to the no-match empty state, the Crossref filter returned six Crossref-labelled cards, the DNA modification filter returned one live card tagged `DNA modification`, the Governance section rendered 4 cards, the Relationship Map rendered active URL-driven relation filters, graph stats, and graph cards, changing the map search updated the `map` query parameter, the Citation Notes section rendered the ginger remedy note from URL filters, global search rendered 5 groups including `Notes`, the motion manifest was served, disabled motion slots rendered no `<video>` elements, the new signal-lattice layers rendered in hero and research sections, 390 px mobile viewport had no page-level horizontal overflow after long warning text wrapping, and browser console errors/warnings were empty.
- Source metadata UI check: reference cards render compact citation metadata and source links; `The Complete Illustrated Holistic Herbal` renders David Hoffmann, Element Books, 1996, ISBN `9781852308476`, 256 pages, and the Google Books catalogue link.
- Brand UI check: `herbalisti-logo.svg` renders in header, brand panel, and footer; canonical and manifest links are present; desktop and 390 px mobile logo layouts have no horizontal overflow.

