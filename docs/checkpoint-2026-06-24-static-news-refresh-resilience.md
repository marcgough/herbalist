# Herbalisti Static News Refresh Resilience Checkpoint

Date: 2026-06-24

## Objective

Harden the Herbalisti Signals/newsfeed path so a temporary outage across the allowlisted public sources cannot collapse the static public fallback feed to zero items.

## What Changed

- Added `scripts/lib/static-news-refresh.mjs` as the shared writer for static news refresh snapshots and feed-status heartbeats.
- Updated `scripts/refresh-news.mjs` so `public/data/news.json` is preserved when a refresh returns zero usable items and a previous non-empty snapshot exists.
- Added `scripts/verify-static-news-refresh.mjs`.
- Added `npm run verify:static-news-refresh`.
- Wired static refresh resilience into `npm run verify:release`, launch config verification, production contract verification, goal readiness, the launch packet generator, and the project runbook.
- Updated the static heartbeat shape to include:
  - attempted refresh item count
  - preserved or updated public item count
  - warning count and warning text
  - `publicSnapshot.status`
  - `publicSnapshot.itemCount`
  - `publicSnapshot.generatedAt`

## Behavior

If a static refresh succeeds with usable items:

- `public/data/news.json` is rewritten with the new feed.
- `public/data/feed-status.json` records `latestRefresh.status: completed`.
- `publicSnapshot.status` is `updated`.

If a static refresh returns zero usable items while an existing non-empty public snapshot exists:

- `public/data/news.json` is not rewritten.
- `public/data/feed-status.json` records `latestRefresh.status: completed_with_preserved_snapshot`.
- `latestRefresh.itemCount` records the attempted refresh result, usually `0`.
- `latestRefresh.publicItemCount` records the preserved public feed count.
- warnings include the source errors plus a preservation warning.
- `publicSnapshot.status` is `preserved_existing`.

## Current Public Snapshot

After the full release run, the current static public feed remains healthy:

- generated at: `2026-06-24T04:47:53.949Z`
- items: `24`
- refresh status: `completed`
- public snapshot status: `updated`
- public snapshot item count: `24`
- warning count: `0`

Current topic mix:

- Longevity: 14
- Peptides: 2
- Gene therapy: 3
- Gene editing: 3
- DNA modification: 5
- CRISPR: 5
- Health as a service: 1

Current source mix:

- Fight Aging!: 8
- Lifespan.io: 5
- arXiv: 3
- bioRxiv: 5
- Crossref: 3

## Verification

Passed:

- `npm run verify:static-news-refresh`
- `npm run verify:launch -- --soft`
- `npm run verify:production-contract`
- `npm run verify:goal-readiness`
- `npm run lint`
- `npm run build`
- `npm run prepare:launch`
- `npm run verify:release`

Full release verification passed with the new `static news refresh resilience` stage included, followed by signal coverage, signal intelligence, Signals RSS, source health, corpus rights audit, data exports, local D1 migrations, scheduled news Worker verification, Cloudflare Pages API smoke, and production-shape smoke.

## Status

Local implementation remains `local-ready-production-pending`.

The goal should remain active until production D1, scheduled Worker deployment, Cloudflare secrets, `herbalisti.com` DNS/custom domain, and live-domain verification are complete.
