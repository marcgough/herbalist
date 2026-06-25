# Herbalisti Checkpoint: Operational Health Endpoint

Date: 2026-06-16 Australia/Sydney

## Summary

Added a public no-secret operational health contract at `GET /api/health` so Herbalisti can be verified after launch without exposing API keys or private configuration.

The endpoint reports:

- public launch surface presence for homepage, books, remedies, search, news, sources, feed status, governance policy, and media manifest.
- D1 and R2 binding presence as booleans only.
- protected feature state for Seedance media jobs and optional server-side OpenAI image generation.
- feed source policy and latest feed refresh field.
- launch boundaries keeping medical advice and public accounts disabled with allowlist-first source mode.

## Files Changed

- `functions/api/health.js`
- `scripts/verify-api.mjs`
- `scripts/verify-production.mjs`
- `scripts/verify-launch-config.mjs`
- `scripts/verify-goal-readiness.mjs`
- `README.md`
- `docs/deployment-runbook.md`
- `docs/goal-readiness.md`
- `docs/herbalisti-project-plan.md`
- `docs/production-launch-packet.md`

## Verification

Passed:

- `npm run lint`
- `npm run build`
- `npm run verify:goal-readiness`
- `npm run verify:launch -- --soft`
- `npm run verify:release`

Latest readiness status:

- `localImplementationReady: true`
- `goalComplete: false`
- `counts.pass: 9`
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

No deployment, DNS mutation, Cloudflare resource creation, upload, secret exposure, paid OpenAI call, or Kie.ai generation was performed in this checkpoint.
