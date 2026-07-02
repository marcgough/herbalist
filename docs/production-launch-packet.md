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
- guarded production deployment evidence artifact verification
- guarded production deployment evidence artifact readback verification
- guarded production deploy dry-run verification
- mocked production D1 resolver behavior verification
- protected production feed seed verification
- GitHub production environment credential-name readiness verification
- GitHub production credential helper dry-run verification for the externally issued Cloudflare token and account ID
- GitHub generated admin secret helper dry-run verification
- GitHub CI/manual release evidence for the intended launch commit
- structured release-evidence artifact with Signals topic/source coverage, source-health counts, source policy, and blocklist proof
- current production state evidence for the exact GitHub commit
- consolidated production state snapshot verification
- Cloudflare API token permission requirement verification
- production provisioning readiness and exact operator sequence
- production operator brief verification for the consolidated no-secret launch handoff
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
- production secret setup
- Pages and scheduled Worker deployment
- `herbalisti.com` custom domain setup
- protected live Signals feed seed through `/api/feed-refresh`
- live verification

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
- live `/api/health` cannot yet prove an active production D1 binding, configured protected feed refresh, and a fresh completed feed refresh

After the D1 database is created, both Wrangler files must be configured from the same returned `database_id`. The launch preflight and production contract verifier check that the Pages Functions and scheduled news Worker share one `HERBALISTI_DB` target.

## Handoff Rule

Use this packet with:

```bash
npm run verify:launch -- --soft
npm run verify:github-actions
npm run verify:production-deploy-workflow
npm run verify:production-deploy-dry-run
npm run verify:production-d1-resolver
npm run verify:production-feed-seed
npm run verify:github-production-dispatch
npm run verify:production-dispatch-preflight -- --strict
npm run verify:github-production-readiness
npm run verify:github-release-evidence
npm run verify:production-state-current
npm run verify:cloudflare-production-state
npm run prepare:production-state
npm run verify:production-state
npm run verify:cloudflare-token-requirements
npm run verify:d1-manifest
npm run verify:dns-cutover
npm run verify:production-secrets
npm run verify:github-production-credentials
npm run verify:github-generated-secrets
npm run resolve:production-d1
npm run prepare:production-provisioning
npm run verify:production-provisioning
npm run prepare:production-operator-brief
npm run verify:production-operator-brief
npm run verify:source-governance
npm run verify:knowledge-graph
npm run verify:citation-notes
npm run verify:static-news-refresh
npm run verify:signal-coverage
npm run verify:signal-intelligence
npm run verify:signals-rss
npm run verify:source-health
npm run verify:corpus-rights
npm run verify:corpus-memory
npm run verify:data-exports
npm run verify:discovery-metadata
npm run verify:api-catalog
npm run verify:search-discovery
npm run verify:australia-lane
npm run verify:production-cutover
npm run verify:production-deploy-evidence
npm run verify:production-deploy-evidence-artifact
npm run verify:production-deploy-evidence-artifact-content
npm run verify:external-actions
npm run seed:production-feed -- --base-url https://herbalisti.com --confirm seed-herbalisti-feed
npm run verify:live-readiness
npm run verify:goal-readiness
npm run prepare:completion-audit
npm run verify:completion-audit
npm run verify:visual-smoke
npm run verify:accessibility-smoke
npm run verify:production-contract
npm run verify:release
```

If the guarded GitHub production deployment is dispatched with `skip_live_verification=true` during DNS transition, also set `skip_live_verification_confirm=skip-herbalisti-live-verification`. That acknowledgement does not count as completion evidence; final completion still requires production deployment evidence artifact readback and strict live verification against `https://herbalisti.com`.

The project should not be treated as complete until `npm run verify:production-deploy-evidence-artifact -- --strict --run-id <production_deploy_run_id>`, `npm run verify:live-readiness -- --strict`, `npm run verify:production -- https://herbalisti.com`, and `npm run verify:goal-readiness -- --strict` pass after deployment. Strict deployment artifact readback now inspects the non-secret artifact contents and must prove either captured feed-seed evidence or the explicit DNS-transition non-final boundary. Strict live readiness now requires the production domain, canonical redirects, `/api/health`, an active production D1 binding, configured protected feed refresh, and a fresh completed feed refresh with items. Seedance media endpoints are optional until approved generation is enabled.
