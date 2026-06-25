# Herbalisti Checkpoint - Unified Research Console

Date: 2026-06-16

## Summary

Herbalisti now has a unified research console at `#console` that searches across the launch knowledge layers:

- Reference books
- Remedy records
- Public research/news signals
- Source registry records

The console is designed as the first practical research surface for the brand: fast, spacious, high-tech, and aligned with the self-sovereign health positioning. It keeps the experience non-advisory and transparent by separating references, remedies, signals, and sources.

## Implemented

- Added `functions/api/search.js` for `GET /api/search?query=...`.
- Added `functions/_lib/search.js` as the shared search adapter across books, remedies, signals, and sources.
- Added grouped search result UI in `src/App.tsx`.
- Added responsive console styling in `src/App.css`.
- Added fast local seed fallback while the live public-source layer is still loading.
- Added URL state for the global query via `?q=...`.
- Updated launch, API, and production verification scripts to include the new search endpoint.
- Updated `README.md`, `docs/deployment-runbook.md`, `docs/source-verification.md`, and `docs/herbalisti-project-plan.md`.

## Verification

Passed:

- `npm run lint`
- `npm run build`
- `npm run verify:release`
- `npm run verify:launch -- --soft`

Browser QA:

- Mobile viewport confirmed at 375px client width.
- Mobile `?q=ginger#console` shows local results quickly, then settles to API-backed status.
- Desktop `?q=CRISPR#console` returns public research signal results.
- No horizontal page overflow observed.
- No browser console warnings or errors observed in the tested flows.

## Current Launch Status

Local build status: passing.

Production status: needs production setup.

The current hard blockers are Cloudflare setup items, not app code:

- Create the Cloudflare D1 database named `herbalisti`.
- Run `npm run configure:cloudflare -- --d1 <database_id> --apply`.
- Confirm `HERBALISTI_DB` is active in both `wrangler.toml` and `wrangler.news.toml`.
- Set Cloudflare secrets for protected refresh and media-generation features.
- Run `npm run verify:launch` again after secrets and bindings are in place.

## Required External Setup

Minimum hosting stack:

- Cloudflare Pages for `herbalisti.com`.
- Cloudflare D1 for durable books, remedies, sources, feed items, and refresh logs.
- Cloudflare Workers Cron for the self-updating public-source newsfeed.
- Optional Cloudflare R2 for owned storage of generated video outputs.

Secrets and credentials to prepare:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `FEED_ADMIN_TOKEN`
- `MEDIA_ADMIN_TOKEN`
- `KIE_API_KEY` for Seedance 2.0 through kie.ai video generation
- `OPENAI_API_KEY` only if repeatable server-side OpenAI image generation is added

DNS:

- Point `herbalisti.com` to the Cloudflare Pages project once Pages is deployed.

## Guardrails

- No deployment was attempted.
- No external paid media generation was attempted.
- No production API keys or secrets were requested or used.
- The app remains informational and non-diagnostic; it does not provide automated medical advice.

