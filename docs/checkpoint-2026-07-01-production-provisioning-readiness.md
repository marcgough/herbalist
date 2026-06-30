# Herbalisti Checkpoint: Production Provisioning Readiness

Date: 2026-07-01

## Summary

Herbalisti is synced to the public GitHub repository `marcgough/herbalist` and now has a local, auditable production provisioning packet for the next Cloudflare setup phase.

This checkpoint is preparation-only. It does not create Cloudflare resources, mutate DNS, set secrets, deploy the site, call paid media APIs, or launch `herbalisti.com`.

## What Changed

- Added `scripts/prepare-production-provisioning.mjs`.
- Added `npm run prepare:production-provisioning`.
- Added `npm run verify:production-provisioning`.
- Generated `docs/production-provisioning-readiness.json`.
- Generated `docs/production-provisioning-readiness.md`.
- Wired the provisioning readiness gate into the launch contract, runbook, release verification, external-action checklist, launch packet, and goal-readiness audit.

## Current State

- Status: `ready-for-approved-production-provisioning`.
- Next approved production action: create the Cloudflare D1 database named `herbalisti`.
- Pages D1 binding is not active yet.
- Scheduled Worker D1 binding is not active yet.
- Required secret names are known, but secret values are not stored in the repo or printed by the readiness packet.

## Verified Locally

Passed:

```bash
npm run verify:production-provisioning
npm run verify:external-actions
npm run verify:production-contract
npm run verify:launch -- --soft
npm run verify:goal-readiness
npm run verify:completion-audit
```

## Remaining Production Gates

The full Herbalisti website goal remains active until Cloudflare D1, remote migrations, Cloudflare secrets, Pages and Worker deployment, `herbalisti.com` custom-domain routing, and strict live verification are complete.
