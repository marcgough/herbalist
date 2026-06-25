# Herbalisti Checkpoint: Production Gate Hardening

Date: 2026-06-24

## Why this change

The local implementation was already reporting `local-ready-production-pending`, but the newly prepared Australia corpus lane needed to become part of the normal launch proof rather than a side check. The production gate also exposed two stale verifier assumptions during the full release run.

## What changed

- added `npm run verify:australia-lane` to the full `verify:release` gate
- added Australia-lane artifacts to `verify:launch -- --soft`
- added Australia-lane verification to the production environment contract safe preflight
- added production-contract assertions for Australia-lane queue files
- updated the launch packet generator and static launch packet documentation
- fixed an API smoke verifier typo where `coffinBooks` was declared with a lookalike character
- aligned the production smoke verifier with the current herbal chat retrieval contract:
  - local deterministic RAG
  - separated Corpus Memory RAG
  - optional hosted GPT-5 synthesis

## Verification

Completed verification:

- `npm run verify:australia-lane`: pass
- `npm run verify:production-contract`: pass
- `npm run verify:launch -- --soft`: pass as `needs-production-setup`, with expected D1 binding blockers
- `npm run lint`: pass
- `npm run verify:release`: pass
- `node scripts/verify-goal-readiness.mjs`: `local-ready-production-pending`

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

## Notes

- no live deployment was attempted
- no DNS was changed
- no paid media generation was triggered
- no secret values were requested or exposed
