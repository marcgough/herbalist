# Herbalisti Production Launch Packet

Date: 2026-06-16

## Purpose

`npm run prepare:launch` generates a non-destructive production cutover packet for Herbalisti. It reads the current local Wrangler files, npm scripts, and environment-variable presence, then prints the ordered launch phases, commands, blockers, and next command. The machine-readable production environment contract lives at `docs/production-environment-contract.json`.

It does not:

- deploy the site
- upload files
- create Cloudflare resources
- write local config files
- call paid APIs
- print secret values

## Usage

JSON output:

```bash
npm run prepare:launch
```

Markdown output:

```bash
npm run prepare:launch -- --markdown
```

Strict mode, useful after production setup when all blockers should be gone:

```bash
npm run prepare:launch -- --strict
```

## Launch Phases

The packet covers:

- local release proof
- GitHub Actions safe-gate and manual repository release-gate verification
- guarded GitHub production deploy workflow verification
- GitHub production environment and secret-name readiness verification
- GitHub CI/manual release evidence for the intended launch commit
- production provisioning readiness and exact operator sequence
- objective completion audit generation and signature verification
- public `/api/health` launch contract verification
- independent-source governance and source-review metadata verification
- source-led relationship-map and plant-part verification
- citation-notes verification
- static news refresh resilience verification
- desktop/mobile visual smoke verification for the key routed pages
- accessibility smoke verification for landmarks, labels, keyboard skip navigation, headings, and reduced-motion behavior
- signal-coverage verification for the full frontier topic set
- signal-intelligence verification for the public Signals feed
- Signals RSS verification for `/api/signals.xml`
- source-health verification for the public Signals feed
- corpus rights audit verification for permissively licensed, book-like source ingestion
- public data export verification for `/data/reference-books.json`, `/data/herbal-knowledge.json`, `/data/remedies.json`, `/data/citation-notes.json`, and `/data/sources.json`
- discovery metadata verification for inline JSON-LD, canonical search action, generated sitemap, robots, public data/RSS sitemap entries, and the public data catalog
- API catalog verification for the public/protected endpoint surface and no-secret-values boundary
- OpenSearch search-discovery verification for the public search route and JSON search API
- Australia corpus lane rights-boundary verification
- production cutover simulation for local D1/R2 binding rehearsal and launch sequencing
- external-action checklist verification for approval-required Cloudflare, DNS, secret, deployment, and paid-generation steps
- Cloudflare resource creation
- local Wrangler binding activation
- remote D1 migration
- Cloudflare secret setup
- Pages and scheduled Worker deployment
- `herbalisti.com` custom domain and live verification

## Current Expected Status

Before Cloudflare setup, the expected packet status is:

```text
pending-production-setup
```

That is correct while:

- `wrangler.toml` has no active production D1 binding
- `wrangler.news.toml` has no active production D1 binding
- Cloudflare secrets are not locally visible or confirmed
- `herbalisti.com` has not been verified live
- live `/api/health` cannot yet prove an active production D1 binding and configured protected Seedance endpoints

After the D1 database is created, both Wrangler files must be configured from the same returned `database_id`. The launch preflight and production contract verifier check that the Pages Functions and scheduled news Worker share one `HERBALISTI_DB` target.

## Handoff Rule

Use this packet with:

```bash
npm run verify:launch -- --soft
npm run verify:github-actions
npm run verify:production-deploy-workflow
npm run verify:github-production-readiness
npm run verify:github-release-evidence
npm run verify:cloudflare-production-state
npm run verify:d1-manifest
npm run verify:dns-cutover
npm run verify:production-secrets
npm run prepare:production-provisioning
npm run verify:production-provisioning
npm run verify:source-governance
npm run verify:knowledge-graph
npm run verify:citation-notes
npm run verify:static-news-refresh
npm run verify:signal-coverage
npm run verify:signal-intelligence
npm run verify:signals-rss
npm run verify:source-health
npm run verify:corpus-rights
npm run verify:data-exports
npm run verify:discovery-metadata
npm run verify:api-catalog
npm run verify:search-discovery
npm run verify:australia-lane
npm run verify:production-cutover
npm run verify:external-actions
npm run verify:live-readiness
npm run verify:goal-readiness
npm run prepare:completion-audit
npm run verify:completion-audit
npm run verify:visual-smoke
npm run verify:accessibility-smoke
npm run verify:production-contract
npm run verify:release
```

The project should not be treated as complete until `npm run verify:live-readiness -- --strict`, `npm run verify:production -- https://herbalisti.com`, and `npm run verify:goal-readiness -- --strict` pass after deployment. Strict live readiness now requires the production domain, canonical redirects, `/api/health`, an active production D1 binding, and configured protected Seedance endpoints.
