# Herbalisti Production D1 Resolver Verifier

Date: 2026-07-01

## Summary

Added a mocked local verifier for the guarded production D1 resolver so the GitHub production workflow can prove the resolver behavior before touching live Cloudflare. The verifier runs the real resolver against a temporary fake `npx wrangler` command and covers:

- existing D1 found from array-shaped Wrangler output
- existing D1 found from result-shaped Wrangler output
- missing D1 created only when `--create-if-missing` is present
- missing D1 fails without create permission
- both `CLOUDFLARE_D1_DATABASE_ID` and `HERBALISTI_D1_DATABASE_ID` are written to the workflow environment file
- no secret-looking values are printed

## Implementation Notes

- Added `scripts/verify-production-d1-resolver.mjs`.
- Added `npm run verify:production-d1-resolver`.
- Added the verifier to CI, the guarded production deploy workflow, the full release verifier, safe preflight, launch config, production contract verification, GitHub Actions verification, provisioning readiness, launch packet, and runbook.
- Hardened `scripts/resolve-production-d1-database.mjs` for Windows by using `cmd.exe /c call npx.cmd ...`; Linux/GitHub runners continue to use direct `npx`.

## Verification

- `node --check scripts/resolve-production-d1-database.mjs`
- `node --check scripts/verify-production-d1-resolver.mjs`
- `npm run verify:production-d1-resolver`
- `npm run verify:production-deploy-workflow`
- `npm run verify:production-contract`
- `npm run verify:github-actions`
- `npm run verify:production-provisioning`
- `npm run verify:launch -- --soft`
- `npm run verify:goal-readiness`
- `npm run verify:completion-audit`
- `npm run verify:data-exports`
- `npm run lint`
- `npm run build`
- `node --trace-uncaught scripts/verify-release.mjs --public-only`

## Current State

The local implementation remains ready, while final production completion is still pending Cloudflare/GitHub production setup: production D1 binding, required secrets, deployment, DNS/custom domain activation, and live verification at `https://herbalisti.com`.
