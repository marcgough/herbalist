# Herbalisti Checkpoint: Protected Admin Auth

Date: 2026-07-01

## Summary

Protected manual operations now share one Worker-safe admin-token authentication helper. This hardens the production-facing controls for the scheduled Signals news refresh and the optional Seedance media endpoints without changing public site behavior or requiring any secret values in the repository.

## What Changed

- Added `functions/_lib/admin-auth.js`.
- Replaced direct feed/media admin-token string comparisons in:
  - `workers/news-refresh.js`
  - `functions/api/media/seedance.js`
  - `functions/api/media/seedance-status.js`
- Added `scripts/verify-admin-auth.mjs` and `npm run verify:admin-auth`.
- Wired protected admin-auth verification into GitHub CI, the GitHub Actions verifier, the full release verifier, goal-readiness evidence, and the deployment runbook.
- Expanded the scheduled news Worker verifier to prove wrong-token rejection plus both bearer-token and `x-herbalisti-feed-token` protected refresh paths.

## Auth Pattern

- Accepts `Authorization: Bearer ...` for protected endpoints.
- Accepts the endpoint-specific Herbalisti header:
  - `x-herbalisti-feed-token` for the scheduled news Worker manual refresh.
  - `x-herbalisti-admin-token` for Seedance media endpoints.
- Fails closed when the configured token is missing.
- Hashes candidate and configured token values to fixed-size SHA-256 digests before comparison.
- Uses Cloudflare Workers `crypto.subtle.timingSafeEqual` when available, with a fixed-length local fallback for Node verification.

## Verification

Passed:

- `node --check functions\_lib\admin-auth.js`
- `node --check workers\news-refresh.js`
- `node --check functions\api\media\seedance.js`
- `node --check functions\api\media\seedance-status.js`
- `node --check scripts\verify-admin-auth.mjs`
- `npm run verify:admin-auth`
- `npm run verify:media-endpoints`
- `npm run verify:news-worker`
- `npm run verify:github-actions`
- `npm run verify:production-contract`
- `npm run verify:goal-readiness`
- `npm run lint`
- `npm run build`
- `npm run verify:launch -- --soft`
- `npm run verify:release -- --public-only`

## Current State

The local implementation remains ready and production pending:

- `npm run verify:goal-readiness`: `local-ready-production-pending`
- `npm run verify:release -- --public-only`: `pass`

Remaining production setup is unchanged: GitHub production secrets, Cloudflare D1 and runtime setup, remote migrations, Pages and Worker deployment, `herbalisti.com` domain routing, and strict live verification.
