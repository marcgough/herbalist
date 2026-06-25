# Herbalisti Checkpoint: Goal Readiness Alignment

Date: 2026-06-24

## Why this change

Recent launch hardening added two important safeguards: the external-action checklist and stricter live-readiness checks for production D1 and protected Seedance endpoint configuration. The top-level goal-readiness audit already reported the correct status, but its evidence model needed to name those newer safeguards explicitly.

## What changed

- updated `scripts/verify-goal-readiness.mjs`
  - production health now checks that the production verifier requires D1 on the canonical live domain
  - production health now checks that the production verifier requires protected Seedance endpoint configuration on the canonical live domain
  - operational health evidence now includes `scripts/verify-live-readiness.mjs`
  - production environment evidence now includes `docs/external-launch-actions.json`, `docs/external-launch-actions.md`, and `npm run verify:external-actions`
  - Cloudflare hosting evidence now includes `npm run verify:live-readiness -- --strict` and `npm run prepare:external-actions`
  - release verification evidence now includes `verify:external-actions`, `verify:live-readiness`, and `prepare:external-actions`
- updated `docs/goal-readiness.md`
  - documents that live `/api/health` must prove production D1 and protected Seedance endpoint readiness
  - documents the external-action checklist as a requirement group
  - documents the stricter live-readiness gate

## Verification

Completed verification:

- `node scripts/verify-goal-readiness.mjs`: `local-ready-production-pending`
- `npm run verify:external-actions`: pass
- `npm run verify:production-contract`: pass
- `npm run lint`: pass
- `npm run verify:release`: pass

Full release proof included:

- refresh public news seed
- export public data snapshots
- lint
- production build
- brand assets
- media attribution
- high-tech motion system
- edge policy
- feed normalization
- signal intelligence
- Signals RSS
- source health
- public data exports
- Australia corpus lane
- external action checklist
- source governance
- knowledge graph
- citation notes
- goal readiness audit
- launch governance
- Seedance media endpoints
- Cloudflare binding configurator
- production environment contract
- local D1 migrations
- scheduled news Worker
- Cloudflare Pages API smoke
- Cloudflare Pages production-shape smoke

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
