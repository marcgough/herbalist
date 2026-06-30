# Herbalisti Production Deploy Dry Run

Date: 2026-07-01

## Summary

Added a safe local dry-run verifier for the guarded GitHub production deployment path. The verifier rehearses the Cloudflare-facing sequence with a temporary fake `npx wrangler` command and in-memory Wrangler binding output.

The dry run proves:

- Cloudflare Pages project list/create command shape
- production D1 resolution through the real resolver
- D1 binding activation through the real configurator logic without writing Wrangler files
- remote D1 migration command shape
- Worker and Pages secret put command shape without storing secret values
- Pages deploy command shape
- scheduled Worker deploy command shape
- no secret-looking values are printed

## Implementation Notes

- Added `scripts/verify-production-deploy-dry-run.mjs`.
- Added `npm run verify:production-deploy-dry-run`.
- Added the gate to CI, the guarded production deploy workflow preflight, the full release verifier, safe preflight, launch config, production contract verification, GitHub Actions verification, provisioning readiness, launch packet, runbook, and goal/completion audit evidence.

## Verification

- `node --check scripts/verify-production-deploy-dry-run.mjs`
- `npm run verify:production-deploy-dry-run`
- `npm run verify:production-deploy-workflow`
- `npm run verify:github-actions`
- `npm run verify:production-contract`
- `npm run verify:launch -- --soft`
- `npm run verify:production-provisioning`
- `npm run verify:goal-readiness`
- `npm run verify:completion-audit`
- `npm run lint`
- `npm run build`
- `node --trace-uncaught scripts/verify-release.mjs --public-only`

## Current State

The local implementation remains ready, and the release verifier now includes a fake-Wrangler rehearsal of the production deployment path. Final goal completion is still pending live production setup: GitHub production secrets, Cloudflare D1 and runtime secrets, remote migrations, Pages and Worker deployment, `herbalisti.com` DNS/custom-domain activation, and strict live verification.
