# Herbalisti Checkpoint: Cloudflare Token Requirements

Date: 2026-07-01

## Summary

Added a value-free Cloudflare API-token requirement packet for the guarded Herbalisti production deployment path. The packet separates the `CLOUDFLARE_API_TOKEN` secret name from the token permissions needed to run the workflow, so production setup can be checked without exposing or storing token values.

## What Changed

- Added `scripts/prepare-cloudflare-token-requirements.mjs`.
- Added generated handoff artifacts:
  - `docs/cloudflare-token-requirements.json`
  - `docs/cloudflare-token-requirements.md`
- Added `prepare:cloudflare-token-requirements` and `verify:cloudflare-token-requirements`.
- Wired token verification into the production contract, production workflow, launch packet, external action checklist, production secret setup packet, provisioning readiness packet, GitHub Actions verifier, goal-readiness audit, and full release verifier.
- Corrected stale runbook secret commands from `npm run wrangler -- ...` to `npx wrangler ...`.

## Token Permission Packet

The packet records Cloudflare documentation-backed launch permissions for `CLOUDFLARE_API_TOKEN`:

- Account / Cloudflare Pages / Edit
- Account / D1 / Edit
- Account / Workers Scripts / Edit
- Account / Account Settings / Read

Optional permissions stay separate:

- User Details / Read
- Memberships / Read
- Account / Workers R2 Storage / Edit, only when the optional reviewed-video bucket is created

The guarded workflow does not require DNS Edit or Billing Edit.

## Verification

Passed:

- `node --check scripts\prepare-cloudflare-token-requirements.mjs`
- `node --check scripts\prepare-production-secret-setup.mjs`
- `node --check scripts\prepare-production-provisioning.mjs`
- `node --check scripts\prepare-external-actions.mjs`
- `node --check scripts\verify-external-actions.mjs`
- `npm run verify:cloudflare-token-requirements`
- `npm run verify:production-secrets`
- `npm run verify:external-actions`
- `npm run verify:production-provisioning`
- `npm run verify:production-deploy-workflow`
- `npm run verify:github-actions`
- `npm run verify:launch -- --soft`
- `npm run verify:production-contract`
- `npm run verify:goal-readiness`
- `npm run verify:completion-audit`
- `npm run lint`
- `npm run build`

## Current State

The local implementation remains ready and production pending:

- `npm run verify:goal-readiness`: `local-ready-production-pending`
- Passing requirement groups: 15
- Production-pending groups: 3

Remaining production setup is unchanged: GitHub production secrets, Cloudflare D1 and runtime setup, remote migrations, Pages and Worker deployment, `herbalisti.com` domain routing, and strict live verification.
