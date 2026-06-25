# Herbalisti Checkpoint: Public Data Exports

Date: 2026-06-16

## Summary

Added portable public JSON exports for the core Herbalisti knowledge layers:

- `/data/reference-books.json`
- `/data/herbal-knowledge.json`
- `/data/remedies.json`
- `/data/citation-notes.json`
- `/data/sources.json`

These exports are generated from the same launch records used by the APIs and are exposed in the Source Governance section through a compact Public data exports panel.

## Implementation

- Added `scripts/export-public-data.mjs` and `npm run export:data`.
- Added `scripts/verify-data-exports.mjs` and `npm run verify:data-exports`.
- Generated launch snapshots in `public/data/`.
- Added `dataExports: true` to `/api/health`.
- Extended API, production-shape, production-contract, launch, release, and goal-readiness verification.
- Updated `README.md`, deployment runbook, source verification notes, goal-readiness notes, production launch packet, and project plan.
- Added a bounded timeout around public-source feed fetches so slow allowlisted sources become source-health warnings instead of blocking the page.
- Improved internal anchor navigation and hash deep-link alignment so Source Governance and other one-page sections land correctly after dynamic content expands.

## Verification

Passed:

- `npm run export:data`
- `npm run verify:data-exports`
- `npm run verify:source-health`
- `npm run verify:feed-normalization`
- `npm run verify:signal-intelligence`
- `npm run verify:production-contract`
- `npm run verify:goal-readiness`
- `npm run verify:launch -- --soft`
- `npm run lint`
- `npm run build`
- `npm run verify:production -- http://127.0.0.1:8813`
- `npm run verify:api -- http://127.0.0.1:8813`
- `npm run verify:release`

Latest full release result: `status: pass`.

Latest goal-readiness result: `local-ready-production-pending`, with `pass: 14` and `pending-production: 3`.

Browser QA:

- Desktop Source Governance navigation lands with the Public data exports panel visible.
- Mobile direct link to `#source-policy` lands with stacked export links visible.
- No console warnings or errors observed in desktop or mobile browser QA.
- No horizontal overflow observed in desktop or mobile browser QA.

## Current State

Local implementation remains ready, but the full goal is not complete until production setup is performed:

- Create Cloudflare Pages project `herbalisti`.
- Connect `herbalisti.com`.
- Create production Cloudflare D1 database `herbalisti`.
- Apply the real D1 binding to both Wrangler configs.
- Apply D1 migrations remotely.
- Set required Cloudflare secrets.
- Deploy Pages and the scheduled news Worker.
- Run live verification against `https://herbalisti.com`.

Seedance video generation remains disabled until Kie.ai credentials, credits, explicit approval, reviewed MP4 assets, storage, and provenance are in place.
