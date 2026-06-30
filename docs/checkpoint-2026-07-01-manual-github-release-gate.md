# Herbalisti Checkpoint: Manual GitHub Release Gate

Date: 2026-07-01

## Summary

The manual GitHub release gate was triggered from the public `marcgough/herbalist` repository and completed successfully. This proves the repository can run the heavier pre-production verification path from GitHub without using local-only filesystem state.

This was a verification-only action. It did not deploy the website, create Cloudflare resources, mutate DNS, set secrets, call paid media APIs, or publish production changes.

## GitHub Evidence

- Workflow: `Herbalisti Manual Release Gate`
- Run: `https://github.com/marcgough/herbalist/actions/runs/28454725783`
- Trigger: `workflow_dispatch`
- Branch: `main`
- Commit: `d1e519c54c69339b2b62f1af46726687ab5bc176`
- Status: `completed`
- Conclusion: `success`
- Started: `2026-06-30T15:08:56Z`
- Updated: `2026-06-30T15:15:07Z`

## Artifact Evidence

The manual release gate uploaded the visual-smoke artifact:

- Artifact name: `herbalisti-visual-smoke`
- Artifact ID: `7985005927`
- Size: `25,822,601` bytes
- Digest: `sha256:bb4c051582c765299a2ec5c9f9303ab7fbf731f1d0e181f04898466ac334709d`
- Expires: `2026-09-28T15:08:57Z`

## Why This Matters

The public repository now has two verified safety paths:

- Push and pull-request CI for repository-safe local gates.
- Manual release verification for the heavier browser and Cloudflare-runtime checks.

GitHub-hosted runners use public corpus-export mode because the heavyweight local corpus artifact layer is intentionally excluded from the repository. Full local corpus verification remains covered by `npm run verify:release` on the workstation where the local corpus layer exists.

## Remaining Production Gates

The full Herbalisti goal remains active. The website is still not production-complete until:

- Cloudflare D1 database `herbalisti` is created and bound in both Wrangler configs.
- Remote D1 migrations are applied.
- Required Cloudflare secrets are set without exposing values in chat, docs, or logs.
- Cloudflare Pages and the scheduled news Worker are deployed.
- `herbalisti.com` DNS/custom-domain routing is connected.
- Strict live verification passes:
  - `npm run verify:live-readiness -- --strict`
  - `npm run verify:production -- https://herbalisti.com`
  - `npm run verify:goal-readiness -- --strict`
