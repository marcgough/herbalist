# Herbalisti Checkpoint: Guarded Production Deploy Workflow

Date: 2026-07-01

## Summary

Herbalisti now has a guarded GitHub Actions production deployment workflow prepared for the final Cloudflare cutover phase.

This checkpoint is preparation-only. The production workflow was not dispatched. No Cloudflare resource was created, no DNS was changed, no secret value was handled, no deployment was performed, no paid media API was called, and `herbalisti.com` was not launched.

## What Changed

- Added `.github/workflows/production-deploy.yml`.
- Added `scripts/verify-production-deploy-workflow.mjs`.
- Added `npm run verify:production-deploy-workflow`.
- Added `CLOUDFLARE_D1_DATABASE_ID` to `.env.example` for the GitHub workflow route.
- Wired the workflow verifier into CI, release verification, launch preflight, production contract checks, external-action checklist, launch packet, goal-readiness audit, README, and deployment runbook.

## Workflow Contract

The production workflow is manual-only and requires the exact confirmation phrase:

```text
deploy-herbalisti-production
```

It runs under the GitHub `production` environment, verifies exact GitHub CI and manual release evidence for the dispatch commit, validates required GitHub secret names, configures runner-local D1 bindings, applies remote D1 migrations, sets Cloudflare runtime secrets from GitHub secrets without echoing values, deploys Cloudflare Pages and the scheduled news Worker, and runs live verification unless temporarily skipped during DNS transition.

## Verified Locally

Passed:

```bash
npm run verify:production-deploy-workflow
npm run verify:github-actions
npm run verify:external-actions
npm run verify:production-contract
npm run verify:production-provisioning
npm run verify:launch -- --soft
npm run verify:goal-readiness
npm run verify:completion-audit
npm run lint
npm run verify:release -- --public-only
```

## Remaining Production Gates

The full Herbalisti website goal remains active until Cloudflare D1, remote migrations, Cloudflare secrets, Pages and Worker deployment, `herbalisti.com` custom-domain routing, and strict live verification are complete.
