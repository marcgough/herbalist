# Herbalisti Checkpoint: Discovery Metadata Gate

Date: 2026-06-24

## Purpose

Add a structured discovery metadata layer to the Herbalisti public launch package so search engines, crawlers, and public data users can understand the site, search surface, data catalog, RSS feed, and public datasets without relying only on page copy.

## What Changed

- Added inline JSON-LD structured data to `index.html` with Organization, WebSite, WebPage, DataCatalog, Dataset, and DataFeed graph nodes.
- Added `public/data/discovery-metadata.json` to the public data export pipeline.
- Exposed the discovery metadata export in the site data export links.
- Added `npm run verify:discovery-metadata`.
- Wired the discovery metadata gate into:
  - `npm run verify:data-exports`
  - `npm run verify:production`
  - `npm run verify:release`
  - `npm run verify:launch -- --soft`
  - `npm run verify:production-contract`
  - `npm run verify:goal-readiness`
  - `npm run prepare:launch`
- Updated the deployment runbook, production launch packet, production environment contract, and goal-readiness notes.

## Public Discovery Surfaces

- Inline structured data id: `herbalisti-structured-data`
- Canonical URL: `https://herbalisti.com/`
- Search action: `https://herbalisti.com/search?q={search_term_string}`
- Public data catalog: `https://herbalisti.com/data/#catalog`
- Signals RSS: `https://herbalisti.com/api/signals.xml`
- Public metadata export: `/data/discovery-metadata.json`

## Dataset Counts

The refreshed public data export reports:

- reference books: 1,328
- herbal commons records: 124
- remedies: 21
- citation notes: 10
- source registry records: 6
- discovery metadata datasets: 5

## Verification

Focused gates passed:

- `npm run export:data`
- `npm run verify:discovery-metadata`
- `npm run verify:data-exports`
- `npm run verify:production-contract`
- `npm run verify:launch -- --soft`
- `npm run verify:goal-readiness`
- `npm run lint`
- `npm run verify:completion-audit`
- `npm run prepare:launch`

Full release gate passed:

- `npm run verify:release`

The full release gate included refresh, public data export, lint, production build, brand, attribution, motion system, edge policy, feed normalization, static news refresh resilience, signal coverage, signal intelligence, Signals RSS, source health, corpus rights, public data exports, discovery metadata, Australia lane, external actions, source governance, knowledge graph, citation notes, goal readiness, completion audit, governance, Seedance media endpoints, Cloudflare configurator, production cutover simulation, production environment contract, local D1 migrations, scheduled news Worker, Cloudflare Pages API smoke, production-shape smoke, desktop/mobile visual smoke, and accessibility smoke.

The first full release run failed inside the local sandbox because Wrangler could not write the temporary D1 verification store. The same command passed when rerun outside the restricted sandbox.

## Current Goal State

- objective status: `local-ready-production-pending`
- goal complete: `false`
- local implementation ready: `true`
- requirement groups passing locally: 15
- production-pending requirement groups: 3
- launch preflight status: `needs-production-setup`
- completion audit signature: `3d9fa324c2d162a231412e88b83d63edd50fe967f986108f9586dfcec7674096`

## Feed Snapshot

- news generated at: `2026-06-24T06:14:23.173Z`
- public news items: 24
- latest feed refresh status: `completed`
- feed public item count: 24
- public snapshot status: `updated`
- public snapshot items: 24

## Boundaries

- No Cloudflare resources were created.
- No DNS was changed.
- No production deployment was attempted.
- No paid media generation was attempted.
- No secrets were requested, printed, or stored.
- Corpus source material remains in the separate Corpus Memory layer, not the shared working Agent Memory instance.

## Remaining Production Work

The project remains active until:

- Cloudflare D1 is created and bound to both Pages Functions and the scheduled news Worker.
- Required Cloudflare secrets are set.
- Remote D1 migrations are applied.
- Cloudflare Pages and the scheduled Worker are deployed.
- `herbalisti.com` is connected and verified.
- `npm run verify:live-readiness -- --strict`, `npm run verify:production -- https://herbalisti.com`, and `npm run verify:goal-readiness -- --strict` pass against production.
