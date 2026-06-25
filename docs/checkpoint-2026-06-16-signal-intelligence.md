# Herbalisti Checkpoint - Signal Intelligence

Date: 2026-06-16 Australia/Sydney

## Summary

Added a metadata-only Signal Intelligence layer to the Herbalisti public Signals feed. It summarizes the allowlisted public-source feed by topic coverage, leading topic cluster, source mix, recency, and source-health counts while preserving the project boundary that Herbalisti is a discovery and research interface, not a medical-advice engine.

## Implemented

- Added shared signal-intelligence logic in `functions/_lib/signal-intelligence.js`.
- Added public endpoint `GET /api/signal-intelligence`.
- Added a high-tech `Signal intelligence` panel in the public Signals section.
- Added responsive panel styling with mobile-safe single-column body layout and two-column stat tiles.
- Added `npm run verify:signal-intelligence` with deterministic fixtures for topic/source coverage and non-medical policy checks.
- Integrated signal intelligence into health, API smoke, production-shape smoke, release verification, launch preflight, production contract, launch packet, goal-readiness audit, README, deployment runbook, project plan, and source-verification notes.

## Verification

Passed:

- `npm run verify:signal-intelligence`
- `npm run verify:goal-readiness`
- `npm run verify:production-contract`
- `npm run lint`
- `npm run build`
- `npm run verify:launch -- --soft`
- `npm run verify:api -- http://127.0.0.1:8805`
- `npm run verify:production -- http://127.0.0.1:8805`
- `npm run verify:release`

Browser QA:

- Desktop filtered URL `http://127.0.0.1:8805/?topic=Gene%20therapy&source=Crossref#signals` rendered the Signal Intelligence panel with live public-source API data, no horizontal overflow, and no console warnings/errors.
- Mobile viewport `390 x 844` rendered the panel at 335 px width inside a 375 px client width, collapsed header/body grids to one column, kept stats at two columns, showed live public-source API data after feed settle, and had no horizontal overflow or console warnings/errors.
- Viewport override was reset to the default desktop viewport after QA.

Release verifier result:

- `npm run verify:release` passed end to end.
- The release included the new `signal intelligence` check and passed Cloudflare Pages API and production-shape smoke tests.

Goal-readiness state:

- Status remains `local-ready-production-pending`.
- Local requirement groups now report 14 pass and 3 production-pending.
- Production-pending items are still independent newsfeed deployment, Seedance video production setup, and Cloudflare hosting/DNS/secrets.

## Current Boundaries

- No deployment was performed.
- No DNS changes were made.
- No Cloudflare resources were created.
- No paid OpenAI or Kie.ai media generation was called.
- No secrets were requested, used, printed, or stored.

## Remaining Production Work

- Create the Cloudflare D1 database named `herbalisti`.
- Configure both Wrangler files with the returned shared D1 database ID.
- Set required Cloudflare secrets.
- Deploy Cloudflare Pages and the scheduled news Worker.
- Connect `herbalisti.com` to the Pages project.
- Run `npm run verify:live-readiness -- --strict`, `npm run verify:production -- https://herbalisti.com`, and `npm run verify:goal-readiness -- --strict`.
