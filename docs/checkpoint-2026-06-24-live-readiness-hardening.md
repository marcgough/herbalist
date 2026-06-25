# Herbalisti Checkpoint: Live Readiness Hardening

Date: 2026-06-24

## Why this change

The live-readiness check needed to prove more than "the site responds". For Herbalisti, the production D1 binding is required for the self-updating newsfeed and the protected Seedance endpoint secrets are part of the current launch contract. A live site without those pieces should not pass final readiness.

## What changed

- tightened `scripts/verify-live-readiness.mjs`
  - live readiness now requires an active production D1 binding reported by `/api/health`
  - live readiness now requires configured protected Seedance endpoints when the launch contract still requires `KIE_API_KEY` and `MEDIA_ADMIN_TOKEN`
  - non-strict mode still reports `not-ready` without failing
- tightened `scripts/verify-production.mjs`
  - canonical production verification now fails if `/api/health` reports no D1 binding
  - canonical production verification now fails if protected Seedance endpoints are not configured
  - local `127.0.0.1` production-shaped smoke remains usable
- updated deployment and launch-packet docs to describe the stricter live criteria

## Verification

Completed verification:

- `npm run verify:live-readiness`: pass as `not-ready`
- `npm run verify:production-contract`: pass
- `npm run verify:external-actions`: pass
- `npm run verify:launch -- --soft`: pass as `needs-production-setup`, with expected D1 binding blockers
- `npm run lint`: pass
- `npm run verify:release`: pass
- `node scripts/verify-goal-readiness.mjs`: `local-ready-production-pending`

## Current live-readiness result

Current public probe status: `not-ready`.

Observed from the local probe:

- DNS/HTTP probes did not prove a live site from this environment
- required production D1 binding: false
- required protected Seedance endpoint configuration: false

## Current status

The project remains locally ready and production pending.

Remaining external setup:

- create Cloudflare D1 database `herbalisti`
- configure `wrangler.toml` and `wrangler.news.toml` with the returned D1 database ID
- set Cloudflare secrets for `FEED_ADMIN_TOKEN`, `KIE_API_KEY`, and `MEDIA_ADMIN_TOKEN`
- deploy Cloudflare Pages and the scheduled news Worker
- connect and verify `herbalisti.com`
- run strict live verification:
  - `npm run verify:live-readiness -- --strict`
  - `npm run verify:production -- https://herbalisti.com`
  - `npm run verify:goal-readiness -- --strict`

## Guardrails

- no live deployment was attempted
- no DNS was changed
- no Cloudflare resources were created
- no paid media generation was triggered
- no secret values were requested, printed, or stored
