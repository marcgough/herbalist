# Herbalisti Checkpoint: GitHub Actions Release Gates

Date: 2026-07-01

## Summary

Herbalisti is synced to the GitHub repository `marcgough/herbalist` and now has repository-level CI plus a manual repository release-gate workflow. The workflows are deliberately verification-only: they do not deploy, create Cloudflare resources, mutate DNS, set secrets, or publish production changes. GitHub-hosted runners use public corpus-export mode because the heavyweight local corpus artifact layer is intentionally excluded from the public repository; full corpus artifact verification remains part of local `npm run verify:release`.

Remote:

- `https://github.com/marcgough/herbalist`
- branch: `main`
- base commit before this slice: `d5f36d8`

## What Changed

- Added `.github/workflows/ci.yml` for push and pull-request verification on `main`.
- Added `.github/workflows/release-gate.yml` as a manual `workflow_dispatch` release gate that runs the repository-safe release suite and uploads visual-smoke screenshots.
- Added `scripts/verify-github-actions.mjs` to prove workflow safety, expected coverage, and release-contract wiring.
- Added `wrangler` as a direct dev dependency so local and GitHub release checks have the Cloudflare CLI available through `npm ci`.
- Made browser smoke verification portable across Windows, Linux, and macOS runners.
- Wired GitHub Actions verification into the release script, launch verifier, production contract, goal-readiness audit, launch packet, deployment runbook, README, and production handoff docs.
- Updated attribution governance for Wrangler's permissive `MIT OR Apache-2.0` license expression.

## Verification

Full local release verification passed:

```text
npm run verify:release
```

Release snapshot after the passing run:

- objective status: `local-ready-production-pending`
- goal complete: `false`
- local implementation ready: `true`
- audit signature: `daa0d36ff6894e1ac8f6938453408dc91071fc18c0c21e79f706df5d41a1aebf`
- passed requirement groups: `15`
- pending production groups: `3`
- launch status: `needs-production-setup`
- news items: `24`
- feed status: `completed`
- feed warnings: `0`
- public API endpoints: `14`
- protected API endpoints: `2`
- sitemap entries: `23`

Focused gates also passed:

- `npm run verify:attribution`
- `npm run verify:github-actions`
- `npm run verify:production-contract`
- `npm run verify:launch -- --soft`

## Production Gates Still Open

The website is locally ready but the full Herbalisti goal remains active until production is configured and verified:

- Cloudflare Pages project and `herbalisti.com` custom domain are active.
- Production Cloudflare D1 database is created and bound in both Wrangler configs.
- Remote D1 migrations are applied.
- Required Cloudflare secrets are set.
- Scheduled news Worker is deployed.
- Live production verification passes at `https://herbalisti.com`.
