# Herbalisti Checkpoint: Public API Catalog

Date: 2026-06-24

## Purpose

Add a machine-readable API catalog to Herbalisti so the public search, source, news, herbal commons, citation, graph, health, and RSS endpoints are discoverable as part of the launch surface. This makes the site more complete for public data users, crawler-style discovery, operations checks, and future integrations without exposing secrets or creating any external resources.

## What Changed

- Added generated `public/data/api-catalog.json`.
- Added the API catalog to the generated sitemap.
- Added `apiCatalogUrl` and the API catalog public surface to `public/data/discovery-metadata.json`.
- Exposed the API catalog in the site data export links.
- Added the `apiCatalog` surface to `/api/health`.
- Added `npm run verify:api-catalog`.
- Wired API catalog verification into:
  - `npm run verify:data-exports`
  - `npm run verify:discovery-metadata`
  - `npm run verify:production`
  - `npm run verify:release`
  - `npm run verify:launch -- --soft`
  - `npm run verify:production-contract`
  - `npm run verify:goal-readiness`
  - `npm run prepare:launch`
  - `npm run prepare:completion-audit`
- Updated the deployment runbook, goal-readiness notes, production launch packet, and production environment contract.

## API Catalog Snapshot

- file: `public/data/api-catalog.json`
- endpoint count: 16
- public endpoints: 14
- protected admin endpoints: 2
- API base URL: `https://herbalisti.com`
- boundaries:
  - medical advice: `disabled`
  - public accounts: `disabled`
  - source mode: `allowlist_first`
  - secret values: `never_returned`

Public endpoints catalogued:

- `GET /api/health`
- `GET /api/books`
- `GET /api/herbal-knowledge`
- `GET /api/herbal-chat`
- `GET /api/citation-notes`
- `GET /api/remedies`
- `GET /api/graph`
- `GET /api/search`
- `GET /api/sources`
- `GET /api/source-health`
- `GET /api/signal-intelligence`
- `GET /api/feed-status`
- `GET /api/news`
- `GET /api/signals.xml`

Protected admin endpoints catalogued:

- `POST /api/media/seedance`
- `GET /api/media/seedance-status`

The protected endpoints are documented as admin-authorized and do not expose secret names or secret values.

## Current Discovery Snapshot

- discovery public surfaces: 22
- discovery datasets: 5
- sitemap entries: 22
- sitemap includes API catalog: yes

## Current Data Snapshot

- reference books: 1,328
- herbal commons records: 124
- remedies: 21
- citation notes: 10
- source registry records: 6
- news items: 24
- feed refresh status: `completed`
- feed warnings: 0
- public snapshot status: `updated`
- public snapshot items: 24

## Verification

Focused gates passed:

- `npm run export:data`
- `npm run verify:api-catalog`
- `npm run verify:discovery-metadata`
- `npm run verify:data-exports`
- `npm run lint`
- `npm run build`
- `npm run verify:production-contract`
- `npm run verify:launch -- --soft`
- `npm run verify:goal-readiness`
- `npm run prepare:launch`
- `npm run prepare:completion-audit`
- `npm run verify:completion-audit`

Full release gate passed:

- `npm run verify:release`

The full release gate included the new `API catalog` check and exercised the generated catalog through local Cloudflare Pages API smoke, production-shape smoke, desktop/mobile visual smoke, and accessibility smoke.

## Current Goal State

- objective status: `local-ready-production-pending`
- goal complete: `false`
- local implementation ready: `true`
- requirement groups passing locally: 15
- production-pending requirement groups: 3
- launch preflight status: `needs-production-setup`
- completion audit signature: `5a23dcbee567b13a487d90d072d65c05641a05884d49a4bbfc13bd9ab8407cf3`

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
