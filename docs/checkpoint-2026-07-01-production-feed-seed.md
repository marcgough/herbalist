# Herbalisti Production Feed Seed Checkpoint

Date: 2026-07-01

## Summary

This checkpoint adds a guarded production feed seed command for Herbalisti launch operations.

The command gives the launch operator a reusable way to trigger the protected Pages `/api/feed-refresh` endpoint after Cloudflare Pages, D1, runtime secrets, the scheduled Worker, and `herbalisti.com` DNS/custom-domain routing are active. This reduces launch risk because strict live verification no longer needs to wait for the six-hour scheduled Worker cadence before proving a fresh completed Signals feed refresh.

## Implemented

- Added `scripts/seed-production-feed.mjs`.
- Added `scripts/verify-production-feed-seed.mjs`.
- Added npm scripts:
  - `npm run seed:production-feed`
  - `npm run verify:production-feed-seed`
- Updated the guarded production deploy workflow to use the shared seed command instead of inline request logic.
- Added the feed seed verifier to CI, release verification, production contract verification, launch verification, GitHub Actions handoff verification, and production provisioning readiness.
- Updated external launch actions with a new approval-required `seed-production-feed` action.
- Updated the deployment runbook and production launch packet.

## Guardrails

- The production seed command requires the exact confirmation phrase `seed-herbalisti-feed`.
- The verifier only runs the command in `--dry-run` mode.
- The command reads `FEED_ADMIN_TOKEN` from the environment at request time and does not print the token.
- No production seed command was run during this checkpoint.

## Verification

Passed locally:

- `npm run verify:production-feed-seed`
- `npm run verify:production-deploy-workflow`
- `npm run verify:production-deploy-dry-run`
- `npm run verify:external-actions`
- `npm run verify:production-contract`
- `npm run verify:github-actions`
- `npm run verify:production-provisioning`
- `npm run verify:launch -- --soft`
- `npm run verify:goal-readiness`
- `npm run verify:completion-audit`
- `npm run lint`
- `npm run build`
- `npm run verify:release -- --public-only`

## Current State

Herbalisti remains `local-ready-production-pending`.

Local implementation is ready. Full completion still requires approved production setup: Cloudflare D1, Cloudflare runtime secrets, Pages and Worker deployment, `herbalisti.com` DNS/custom domain, the protected feed seed, and strict live verification.
