# Herbalisti

Herbalisti is a high-technology natural medicine and longevity knowledge website for `herbalisti.com`.

## Local Build

```bash
npm install
npm run verify:release
```

The release verifier refreshes the public feed seed and heartbeat, exports public data snapshots, lints, builds, verifies brand assets, checks the high-tech motion system, checks feed normalization, signal intelligence, Signals RSS, source health, and public data exports, verifies independent-source governance, verifies the source-led relationship map, verifies citation notes, audits full-goal readiness, verifies the protected Seedance media endpoints without real provider calls, checks the Cloudflare binding configurator, applies local D1 migrations, verifies the scheduled news Worker and refresh ledger, starts local Cloudflare Pages, smokes the public API, and runs the production-shape verifier against the temporary local URL.

Individual checks:

```bash
npm run refresh:news
npm run export:data
npm run lint
npm run build
npm run verify:github-actions
npm run verify:github-release-evidence
npm run prepare:launch
npm run verify:attribution
npm run verify:brand
npm run verify:citation-notes
npm run verify:cloudflare-config
npm run verify:d1
npm run verify:data-exports
npm run verify:edge-policy
npm run verify:feed-normalization
npm run verify:goal-readiness
npm run verify:governance
npm run verify:knowledge-graph
npm run verify:launch -- --soft
npm run verify:live-readiness
npm run verify:media-endpoints
npm run verify:motion-system
npm run verify:news-worker
npm run verify:production-contract
npm run verify:production -- http://127.0.0.1:8788
npm run verify:signal-intelligence
npm run verify:signals-rss
npm run verify:source-governance
npm run verify:source-health
npm run pages:dev
```

GitHub Actions:

- `.github/workflows/ci.yml` runs local safe gates on pushes and pull requests to `main`.
- `.github/workflows/release-gate.yml` is manual only and runs the repository-safe release verifier with public corpus-export checks, browser smoke, and local Cloudflare-runtime checks. Full local corpus verification remains covered by `npm run verify:release` on a workstation with the local corpus layer.
- `npm run verify:github-actions` checks that those workflows remain read-only, non-deploying, and connected to the launch contract.
- `npm run verify:github-release-evidence` checks that the intended launch commit has fresh successful GitHub CI and manual release-gate runs, plus the uploaded visual-smoke artifact.

## Production Direction

Recommended hosting is Cloudflare Pages with Pages Functions for `/api/health`, `/api/search`, `/api/books`, `/api/herbal-knowledge`, `/api/herbal-chat`, `/api/citation-notes`, `/api/remedies`, `/api/graph`, `/api/news`, `/api/signals.xml`, `/api/signal-intelligence`, `/api/source-health`, `/api/sources`, and `/api/feed-status`, D1 for records, Cloudflare edge headers/redirects, and a scheduled Worker for feed refresh. The home page is search-first, with a public-domain herbal chat and a live preview of allowlisted public-source signals. The public research console searches across references, citation notes, remedies, signals, and source records as one interface. The citation-notes layer connects books, remedy records, signal sources, and governance decisions to public source URLs without copying copyrighted content or giving medical advice. Static public exports are available at `/data/reference-books.json`, `/data/herbal-knowledge.json`, `/data/remedies.json`, `/data/citation-notes.json`, and `/data/sources.json` for auditability and data portability. The public-domain herbal commons indexes historical Project Gutenberg herbals as paraphrased research context. The public remedy index now covers 21 core herbs with botanical names, plant-part context, preparation forms, safety watch text, interaction flags, related remedies, and public NCCIH source links. The relationship map connects those remedy records through related plants, plant parts, preparation forms, traditional-use context, and safety-watch edges without treatment-claim relations. The public signal feed supports topic, source, and text filtering, public RSS at `/api/signals.xml`, source options driven by the source registry, source-health chips, signal-intelligence topic/source summaries, canonical duplicate cleanup, shareable URL filters, a refresh-heartbeat badge, and a loading state that prevents stale cards during filter changes. `/api/health` exposes a no-secret launch health contract for public verification. `docs/production-environment-contract.json` records the Cloudflare resources, secrets, launch commands, guardrails, and live completion gates in a machine-checked format. Cinematic Seedance video slots are manifest-driven and currently disabled until reviewed local assets exist.

Run the production preflight before attempting launch:

```bash
npm run verify:launch
```

It does not deploy, upload, call paid APIs, or expose secret values. It checks whether required files, package scripts, Cloudflare D1 bindings, and locally visible deployment variables are in place. Use `npm run verify:launch -- --soft` when you want the JSON report without a failing exit code.

After creating the Cloudflare D1 database, configure the local Wrangler files with the returned database ID:

```bash
npm run configure:cloudflare -- --d1 <database_id> --apply
```

For the optional generated-media bucket:

```bash
npm run configure:cloudflare -- --d1 <database_id> --r2 herbalisti-media --apply
```

Without `--apply`, the command is a dry run and writes nothing.

Generate the current production cutover packet without deploying or writing files:

```bash
npm run prepare:launch
npm run prepare:launch -- --markdown
```

Useful scripts:

```bash
npm run pages:dev
npm run prepare:launch
npm run verify:live-readiness
npm run deploy:cloudflare
npm run verify:production -- https://herbalisti.com
```

Required later:

- `CLOUDFLARE_API_TOKEN` for deployment automation.
- `CLOUDFLARE_ACCOUNT_ID` for deployment automation.
- `FEED_ADMIN_TOKEN` for protected manual news refresh.
- `KIE_API_KEY` for Seedance 2.0 generated video backgrounds.
- `MEDIA_ADMIN_TOKEN` for protected Seedance job endpoints.
- `OPENAI_API_KEY` only if repeatable server-side image generation is added.

Do not commit secrets.

## Project Notes

See `docs/herbalisti-project-plan.md`.

## GitHub Sync Scope

This repository is the Herbalisti product and source-control home. It includes the website, Cloudflare Functions and Worker code, migrations, generated public data exports, corpus manifests, public-safe corpus exports, source-work summaries, Corpus Memory scaffolding, and verification scripts.

The heavyweight local corpus acquisition layers are intentionally excluded from GitHub: raw PDFs/text captures, chunk files, normalized OCR/text layers, large evidence graphs, local Corpus Memory SQLite stores, browser screenshots, build output, local runtime caches, and private env files. Those assets remain local and should move to a purpose-built archive or object store if we later want remote backup.

Also see:

- `docs/deployment-runbook.md`
- `docs/goal-readiness.md`
- `docs/production-launch-packet.md`
- `docs/attribution.md`
- `docs/brand-system.md`
- `docs/media-generation.md`
- `docs/source-verification.md`
- `docs/github-sync-scope.md`
