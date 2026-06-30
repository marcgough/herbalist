# Herbalisti Protected Feed Refresh Checkpoint

Date: 2026-07-01

## Summary

This checkpoint adds a protected Cloudflare Pages feed-refresh endpoint so the live Herbalisti deployment can seed and prove the independent Signals newsfeed immediately after production deployment.

The scheduled Worker still owns ongoing refresh automation, but both the Worker and the Pages endpoint now share the same refresh/persistence logic. This reduces launch risk because production verification can confirm a fresh completed feed refresh through `/api/health` after the guarded deploy workflow runs.

## Implemented

- Added `POST /api/feed-refresh` as a protected admin endpoint using `FEED_ADMIN_TOKEN`.
- Added shared refresh logic in `functions/_lib/news-refresh.js`.
- Updated the scheduled news Worker to use the shared refresh function.
- Updated the guarded production workflow to set the Pages feed token and seed the live Signals feed after deploy.
- Updated health, API catalog, production contract, secret setup, provisioning readiness, external action, live readiness, and goal readiness checks.
- Updated verifiers so protected admin endpoints now include:
  - `feed-refresh`
  - `seedance-create`
  - `seedance-status`

## Verification

Passed locally:

- `npm run verify:release -- --public-only`
- `npm run verify:news-worker`
- `npm run verify:production-deploy-dry-run`
- `npm run verify:production-provisioning`
- `npm run verify:production-contract`
- `npm run verify:external-actions`
- `npm run verify:api-catalog`
- `npm run verify:api`
- `npm run verify:live-readiness`
- `npm run verify:goal-readiness`
- `npm run verify:data-exports`
- `npm run verify:completion-audit`
- `npm run lint`
- `npm run build`

## Current State

Herbalisti remains `local-ready-production-pending`.

Local implementation is ready. Final completion still requires the deliberate production setup path: Cloudflare D1, Cloudflare runtime secrets, Pages and Worker deployment, `herbalisti.com` DNS/custom domain, and strict live verification.
