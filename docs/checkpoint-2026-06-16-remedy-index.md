# Herbalisti Checkpoint: Remedy Index MVP

Date: 2026-06-16

## Summary

Added the first searchable remedy index requested by the original Natural Medicines plan. This turns the site from a bibliography plus newsfeed into a source-led natural medicine knowledge interface.

## Completed

- Added 21 core remedy records with remedy name, botanical name, common names, traditional-use context, preparation forms, safety summaries, interaction flags, related remedies, tags, and source URLs.
- Added frontend fallback data in `src/data/remedies.ts`.
- Added Cloudflare/API fallback data and filtering in `functions/_lib/remedies.js`.
- Added public endpoint `GET /api/remedies`.
- Added D1 migration `migrations/0006_seed_remedies.sql`.
- Added a public Remedies section with search, preparation filters, source links, safety summaries, and related-remedy chips.
- Updated README, deployment runbook, source notes, and project plan.

## Verification

- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run verify:d1`: passed; verified 21 remedy rows and the `remedies` table.
- `npm run verify:launch -- --soft`: passed as `needs-production-setup`; remaining blockers are real Cloudflare D1 bindings and secrets.
- `npm run verify:release`: passed, including API and production-shape smoke checks for remedies.
- Browser QA through local Cloudflare Pages on `http://127.0.0.1:8796/#remedies`: desktop and mobile passed with no horizontal overflow and no console warnings/errors.
- Remedy URL check: all 21 NCCIH source URLs returned HTTP 200.

## Remaining Production Setup

- Create the Cloudflare D1 database named `herbalisti`.
- Run `npm run configure:cloudflare -- --d1 <database_id> --apply`.
- Set Cloudflare secrets for `FEED_ADMIN_TOKEN`, `KIE_API_KEY`, and `MEDIA_ADMIN_TOKEN`.
- Deploy Cloudflare Pages and the scheduled news Worker.
- Verify production at `https://herbalisti.com` with `npm run verify:production -- https://herbalisti.com`.
