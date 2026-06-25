# Herbalisti Feed Heartbeat Visibility Checkpoint

Date: 2026-06-24

## Objective

Make the static news refresh resilience visible and verifiable in the public Signals experience, not only in the local writer script.

## What Changed

- Extended the frontend feed heartbeat model with `latestRefresh.publicItemCount`.
- Extended the frontend feed heartbeat model with `publicSnapshot.status`, `publicSnapshot.itemCount`, and `publicSnapshot.generatedAt`.
- Updated the Signals heartbeat text so a preserved snapshot can be described as a preserved public snapshot, including the visible public item count when it differs from the attempted refresh item count.
- Strengthened `scripts/verify-static-news-refresh.mjs` so it verifies the frontend contains the preserved snapshot heartbeat display path.
- Strengthened `scripts/verify-production.mjs` so the static `/data/feed-status.json` smoke requires:
  - `latestRefresh.publicItemCount`
  - `publicSnapshot.status`
  - `publicSnapshot.itemCount`
  - an updated-or-preserved status value

## Current Static Feed State

After the full release run:

- `public/data/news.json` generated at: `2026-06-24T04:56:06.580Z`
- visible public feed items: `24`
- latest static refresh status: `completed`
- attempted refresh items: `24`
- visible public item count: `24`
- public snapshot status: `updated`
- warning count: `0`

## Verification

Passed:

- `npm run verify:static-news-refresh`
- `npm run lint`
- `npm run build`
- `npm run verify:launch -- --soft`
- `npm run verify:release`

Full release verification passed with the static news refresh resilience stage and the Cloudflare Pages production-shape smoke both exercising the new heartbeat fields.

## Status

Local implementation remains `local-ready-production-pending`.

The production goal remains active until the Cloudflare D1 database, scheduled Worker, required secrets, `herbalisti.com` DNS/custom domain, and live-domain verification are complete.
