# Herbalisti Checkpoint: GitHub Production Readiness and Feed Balance

Date: 2026-07-01

## Summary

Herbalisti now has a read-only GitHub production readiness verifier and a more resilient public Signals feed balance.

This checkpoint is preparation-only. No GitHub environment was created, no GitHub secret was set, no Cloudflare resource was created, no DNS was changed, no deployment was performed, no paid API was called, and no secret value was handled.

## What Changed

- Added `scripts/verify-github-production-readiness.mjs`.
- Added `npm run verify:github-production-readiness`.
- Wired the verifier into the production contract, launch packet, external-action checklist, goal-readiness audit, README, and deployment runbook.
- Updated the release gate to run the GitHub production readiness verifier in non-strict mode.
- Repaired Signals feed balancing so narrow live source snapshots are topped up with existing allowlisted watch-lane records.
- Kept normalization tests focused by allowing fallback insertion to be disabled in the pure filter/dedupe verifier.

## Current GitHub Production State

Read-only GitHub metadata shows:

- `Herbalisti Production Deploy` workflow is active.
- The `production` GitHub environment is not configured yet.
- Required production workflow secret names are not present yet.
- Exact release evidence exists for the current launch commit at the time of this checkpoint.

Required GitHub secret names for the guarded production workflow:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_D1_DATABASE_ID`
- `FEED_ADMIN_TOKEN`
- `KIE_API_KEY`
- `MEDIA_ADMIN_TOKEN`

## Feed Balance

The current public feed refresh produced 24 items and retained all 8 tracked signal topics:

- CRISPR
- DNA modification
- Gene editing
- Gene therapy
- Health as a service
- Longevity
- Peptides
- Self-sovereign wellbeing

When live allowlisted sources are narrow, the balancer can add approved watch-lane records from existing public-source seed lanes. This preserves the product promise without adding Big Pharma sources or scraping unapproved content.

## Verified Locally

Passed:

```bash
npm run verify:github-production-readiness
npm run verify:production-deploy-workflow
npm run verify:github-actions
npm run verify:external-actions
npm run verify:production-contract
npm run verify:production-provisioning
npm run verify:launch -- --soft
npm run verify:goal-readiness
npm run verify:feed-normalization
npm run verify:signal-coverage
npm run verify:completion-audit
npm run verify:release -- --public-only
```

## Remaining Production Gates

The full Herbalisti website goal remains active until Cloudflare D1, remote migrations, Cloudflare secrets, Pages and Worker deployment, `herbalisti.com` custom-domain routing, and strict live verification are complete.
