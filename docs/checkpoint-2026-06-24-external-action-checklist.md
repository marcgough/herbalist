# Herbalisti Checkpoint: External Action Checklist

Date: 2026-06-24

## Why this change

The local Herbalisti release gate is passing, but final completion still depends on external production actions: Cloudflare resource creation, remote migrations, secrets, deployment, DNS/custom-domain connection, and live verification. This checkpoint makes those actions explicit while keeping normal local work separate from steps that require fresh approval.

## What changed

- added `scripts/prepare-external-actions.mjs`
- added `scripts/verify-external-actions.mjs`
- added `npm run prepare:external-actions`
- added `npm run verify:external-actions`
- generated `docs/external-launch-actions.json`
- generated `docs/external-launch-actions.md`
- added the external-action verifier to:
  - `npm run verify:release`
  - the production environment contract safe preflight
  - launch preflight required script/file checks
  - the launch packet generator
  - the deployment runbook
  - the static production launch packet

## External action summary

The checklist separates:

- 5 local actions that do not require fresh approval
- 11 external actions that do require fresh approval
- 8 required-for-launch external actions
- 3 optional external actions

Required-for-launch external actions:

- create Cloudflare D1 database
- apply remote D1 migrations
- set `FEED_ADMIN_TOKEN`
- set `KIE_API_KEY`
- set `MEDIA_ADMIN_TOKEN`
- deploy Cloudflare Pages
- deploy scheduled news Worker
- connect `herbalisti.com` DNS/custom domain

Optional external actions:

- create R2 media bucket
- set `OPENAI_API_KEY`
- generate Seedance 2.0 video through Kie.ai

## Verification

Completed verification:

- `npm run prepare:external-actions`: pass
- `npm run verify:external-actions`: pass
- `npm run verify:production-contract`: pass
- `npm run verify:launch -- --soft`: pass as `needs-production-setup`, with expected D1 binding blockers
- `npm run lint`: pass
- `npm run verify:release`: pass
- `node scripts/verify-goal-readiness.mjs`: `local-ready-production-pending`

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
