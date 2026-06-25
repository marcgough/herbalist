# Herbalisti Herbal Commons Scale Hardening Checkpoint

Date: 2026-06-24

## Summary

Strengthened the Herbalisti herbal commons surface so the website and release gates prove corpus-scale public-domain coverage rather than merely proving the original seed list still exists.

The public herbal commons now remains contractually tied to the local rights-cleared corpus layer:

- 124 public herbal commons records
- 112 corpus-derived herb profiles
- at least 150 rights-cleared source works required by the launch gates
- source-linked corpus metadata required on corpus profile records
- 100,000+ matched corpus chunks required by the goal-readiness audit

The Source Policy page now shows a compact herbal commons scale panel with counts for herb profiles, corpus-derived profiles, source works, and linked passages.

## Files Updated

- `src/App.tsx`
- `src/App.css`
- `scripts/verify-data-exports.mjs`
- `scripts/verify-api.mjs`
- `scripts/verify-production.mjs`
- `scripts/verify-goal-readiness.mjs`
- `scripts/verify-launch-config.mjs`
- `scripts/verify-production-contract.mjs`
- `docs/goal-readiness.md`
- `docs/deployment-runbook.md`

## Verification

Passed:

- `npm run verify:data-exports`
- `npm run verify:production-contract`
- `npm run verify:launch -- --soft`
- `npm run verify:goal-readiness`
- `npm run lint`
- `npm run build`
- `npm run verify:release`

Visual smoke:

- Source Policy page screenshot: `tmp/source-policy-herbal-commons.png`
- The screenshot confirms the herbal commons stats row renders above the rights-cleared source list.

## Current Goal State

`npm run verify:goal-readiness` still correctly reports `local-ready-production-pending`.

The full goal remains active because production work still requires approved external actions:

- Cloudflare D1 database creation
- Wrangler binding activation with the real D1 database ID
- remote D1 migrations
- required Cloudflare secrets
- Cloudflare Pages and scheduled Worker deployment
- `herbalisti.com` DNS/custom-domain connection
- strict live verification against `https://herbalisti.com`
