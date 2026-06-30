# Herbalisti Checkpoint: GitHub Production Environment

Date: 2026-07-01

## Summary

The GitHub repository now has a `production` environment prepared for the guarded Herbalisti production deploy workflow.

This checkpoint did not deploy the site, create Cloudflare resources, mutate DNS, set secrets, request secret values, call paid APIs, or launch `herbalisti.com`.

## What Changed

- Created the GitHub `production` environment for `marcgough/herbalist`.
- Added a 5-minute production environment wait timer.
- Restricted production deployments to the `main` branch with a deployment branch policy.
- Tightened `scripts/verify-github-production-readiness.mjs` so it reports the `main` branch policy and gives accurate next actions.

## Current GitHub Production State

Read-only verification now reports:

- `Herbalisti Production Deploy` workflow is active.
- GitHub `production` environment exists.
- Production environment has 2 protection rules.
- Production environment is restricted to `main`.
- Required production workflow secret names are still missing.

Required GitHub secret names still needed:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_D1_DATABASE_ID`
- `FEED_ADMIN_TOKEN`
- `KIE_API_KEY`
- `MEDIA_ADMIN_TOKEN`

## Verified Locally

Passed:

```bash
npm run verify:github-production-readiness
npm run verify:github-actions
npm run verify:production-contract
npm run verify:launch -- --soft
npm run verify:goal-readiness
npm run verify:release -- --public-only
```

Strict GitHub production readiness still correctly fails until the required secret names exist:

```bash
npm run verify:github-production-readiness -- --strict
```

## Remaining Production Gates

The full Herbalisti website goal remains active until Cloudflare D1, remote migrations, Cloudflare secrets, Pages and Worker deployment, `herbalisti.com` custom-domain routing, and strict live verification are complete.
