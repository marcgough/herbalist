# Herbalisti Checkpoint: Production Environment Contract

Date: 2026-06-16 Australia/Sydney

## Summary

Added a machine-readable production environment contract for Herbalisti so the Cloudflare launch handoff is checked as data, not only as prose.

The contract is stored at `docs/production-environment-contract.json` and records:

- production domain `herbalisti.com`.
- Cloudflare Pages project `herbalisti`.
- scheduled Worker `herbalisti-news-refresh`.
- D1 database `herbalisti` and required `HERBALISTI_DB` binding.
- optional R2 bucket `herbalisti-media` and `HERBALISTI_MEDIA` binding.
- required launch secrets: `FEED_ADMIN_TOKEN`, `KIE_API_KEY`, and `MEDIA_ADMIN_TOKEN`.
- optional/local secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and `OPENAI_API_KEY`.
- side-effecting launch commands for resource creation, binding activation, migrations, secret setup, deployment, and live verification.
- guardrails for no automatic deployment, no DNS mutation, no paid generation, no secret logging, disabled medical advice, disabled public accounts, and allowlist-first source mode.

## Files Changed

- `docs/production-environment-contract.json`
- `scripts/verify-production-contract.mjs`
- `package.json`
- `scripts/verify-release.mjs`
- `scripts/verify-launch-config.mjs`
- `scripts/verify-goal-readiness.mjs`
- `README.md`
- `docs/deployment-runbook.md`
- `docs/goal-readiness.md`
- `docs/herbalisti-project-plan.md`
- `docs/production-launch-packet.md`

## Verification

Passed:

- `npm run verify:production-contract`
- `npm run verify:goal-readiness`
- `npm run verify:launch -- --soft`
- `npm run lint`
- `npm run build`
- `npm run prepare:launch`
- `npm run verify:release`

Latest readiness status:

- `localImplementationReady: true`
- `goalComplete: false`
- `counts.pass: 10`
- `counts.pending-production: 3`

Launch preflight still correctly reports `needs-production-setup` because the real Cloudflare D1 database ID is not yet configured in `wrangler.toml` or `wrangler.news.toml`.

## Remaining Production Setup

The goal should remain active until:

- Cloudflare Pages project `herbalisti` exists and serves `herbalisti.com`.
- Production D1 database `herbalisti` exists and is bound to both Pages and the scheduled Worker.
- Remote D1 migrations are applied.
- Cloudflare secrets are set for deployment, feed refresh, and protected Seedance media generation.
- The scheduled news Worker is deployed.
- `npm run verify:production -- https://herbalisti.com` passes against the live domain.
- `npm run verify:goal-readiness -- --strict` passes after live verification.

No deployment, DNS mutation, Cloudflare resource creation, upload, secret exposure, paid OpenAI call, or Kie.ai generation was performed in this checkpoint.
