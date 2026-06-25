# Herbalisti Checkpoint: Feed Refresh Heartbeat

Date: 2026-06-16

## Summary

Added a production-ready refresh heartbeat for the Herbalisti self-updating Signals feed.

## Completed

- Added D1 migration `migrations/0005_feed_refresh_runs.sql`.
- Added shared helpers in `functions/_lib/feed.js` to write and read refresh-run records.
- Updated `workers/news-refresh.js` so manual, scheduled, and failed refresh attempts write heartbeat rows.
- Updated `functions/api/news.js` so live API fallback refreshes write heartbeat rows when D1 is bound.
- Added `functions/api/feed-status.js` for the public refresh-status API.
- Updated `scripts/refresh-news.mjs` to write `public/data/feed-status.json` for static fallback builds.
- Added a subtle Signals heartbeat badge to the React frontend.
- Updated README, deployment runbook, source notes, and project plan.

## Verification

- `npm run refresh:news`: passed; wrote 19 feed items and `public/data/feed-status.json`.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run verify:d1`: passed; verified `feed_refresh_runs`.
- `npm run verify:news-worker`: passed; verified manual and scheduled heartbeat rows.
- `npm run verify:launch -- --soft`: passed as `needs-production-setup`; remaining blockers are the real Cloudflare D1 bindings.
- `npm run verify:edge-policy`: passed.
- `npm run verify:release`: passed.
- Browser QA through local Cloudflare Pages on `http://127.0.0.1:8788/#signals`: desktop and 390 px mobile passed with no horizontal overflow and no console warnings/errors.

## Remaining Production Setup

- Create the Cloudflare D1 database named `herbalisti`.
- Run `npm run configure:cloudflare -- --d1 <database_id> --apply`.
- Set Cloudflare secrets for `FEED_ADMIN_TOKEN`, `KIE_API_KEY`, and `MEDIA_ADMIN_TOKEN`.
- Deploy Cloudflare Pages and the scheduled news Worker.
- Verify production at `https://herbalisti.com` with `npm run verify:production -- https://herbalisti.com`.
