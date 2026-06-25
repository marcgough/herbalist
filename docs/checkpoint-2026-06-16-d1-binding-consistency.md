# Herbalisti Checkpoint: D1 Binding Consistency Guard

Date: 2026-06-16 Australia/Sydney

## Summary

Added a production safety guard so the Cloudflare Pages site and scheduled news Worker cannot silently use different D1 databases after launch configuration is applied.

The guard matters because Herbalisti has two production surfaces that need the same `HERBALISTI_DB`:

- Pages Functions for public APIs such as `/api/books`, `/api/remedies`, `/api/news`, `/api/search`, `/api/sources`, `/api/feed-status`, and `/api/health`.
- Scheduled Worker `herbalisti-news-refresh`, which refreshes and persists the independent public-source newsfeed.

## Files Changed

- `scripts/verify-launch-config.mjs`
- `scripts/verify-production-contract.mjs`
- `scripts/verify-cloudflare-bindings.mjs`
- `docs/deployment-runbook.md`
- `docs/production-launch-packet.md`
- `docs/herbalisti-project-plan.md`

## Verification

Passed:

- `npm run verify:cloudflare-config`
- `npm run verify:production-contract`
- `npm run verify:launch -- --soft`
- `npm run verify:goal-readiness`
- `npm run lint`
- `npm run build`
- `npm run prepare:launch`
- `npm run verify:release`

Latest status:

- `npm run verify:cloudflare-config` confirms the dry-run configurator writes the same fake D1 ID into both generated Wrangler configs.
- `npm run verify:production-contract` reports `d1BindingConsistency: pending-bindings` while the real production D1 ID is not yet applied.
- `npm run verify:launch -- --soft` reports `productionBindings.d1DatabaseIdsMatch: null` while bindings are still template comments.
- `npm run verify:goal-readiness` remains `local-ready-production-pending` with `counts.pass: 10` and `counts.pending-production: 3`.

## Remaining Production Setup

The goal should remain active until:

- Cloudflare Pages project `herbalisti` exists and serves `herbalisti.com`.
- Production D1 database `herbalisti` exists and the same returned `database_id` is bound in both `wrangler.toml` and `wrangler.news.toml`.
- Remote D1 migrations are applied.
- Cloudflare secrets are set for deployment, feed refresh, and protected Seedance media generation.
- The scheduled news Worker is deployed.
- `npm run verify:production -- https://herbalisti.com` passes against the live domain.
- `npm run verify:goal-readiness -- --strict` passes after live verification.

No deployment, DNS mutation, Cloudflare resource creation, upload, secret exposure, paid OpenAI call, or Kie.ai generation was performed in this checkpoint.
