# Herbalisti Checkpoint: Source Health

Date: 2026-06-16

## Summary

Added source-by-source health visibility for the Herbalisti Signals feed. This makes the self-updating public-source feed more auditable by showing whether each allowlisted source is returning usable items, empty, or warning.

## Implemented

- Added structured source-health records to `functions/_lib/feed.js`.
- Added public endpoint `GET /api/source-health`.
- Added source-health chips to the public Signals section.
- Added `sourceHealthApi: true` to `/api/health`.
- Added `scripts/verify-source-health.mjs`.
- Added `npm run verify:source-health`.
- Integrated source-health checks into release, launch preflight, API smoke, production-shape smoke, production contract, goal readiness, README, deployment runbook, production launch packet, project plan, and source-verification docs.

## Source Health Data

Each source-health record includes:

- source ID, name, URL, type, and role
- status: `ok`, `empty`, or `warning`
- item count and usable item count
- newest usable item timestamp
- warning text when present
- `isAllowlisted`
- `isBigPharmaRelated`

The health policy remains allowlist-first. Source warnings do not add fallback pharma channels or broaden the feed source set.

## Verification

Passed:

- `npm run verify:source-health`
- `npm run lint`
- `npm run build`
- `npm run verify:launch -- --soft`
- `npm run verify:goal-readiness`
- `npm run verify:production-contract`
- `npm run verify:feed-normalization`
- `npm run verify:news-worker`
- `npm run verify:api -- http://127.0.0.1:8803`
- `npm run verify:production -- http://127.0.0.1:8803`
- `npm run verify:release`

Runtime source-health smoke:

- 6 source-health records.
- 5 healthy sources.
- 1 empty source.
- 0 warning sources.

Browser QA:

- Desktop Signals section rendered six source-health chips.
- Mobile 390 px viewport rendered all six chips at 335 px width with no page-level horizontal overflow from the source-health panel.
- Browser console warnings/errors were empty.

## Current Status

`npm run verify:goal-readiness` reports `local-ready-production-pending`.

12 requirement groups pass locally.

3 requirement groups remain production-pending:

- Independent newsfeed deployment.
- Seedance video production setup.
- Cloudflare hosting, DNS, D1, Worker, and secrets.

## Production Blockers

No deployment, DNS mutation, upload, paid API call, or media generation was attempted.

Remaining external setup:

- Create the Cloudflare D1 database named `herbalisti`.
- Run `npm run configure:cloudflare -- --d1 <database_id> --apply`.
- Set Cloudflare Pages and Worker secrets.
- Deploy Cloudflare Pages and the scheduled news Worker.
- Point `herbalisti.com` DNS/custom domain to the Pages project.
- Run `npm run verify:production -- https://herbalisti.com`.
