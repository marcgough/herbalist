# Herbalisti Checkpoint - Desktop and Mobile Visual Smoke Gate

Date: 2026-06-24

## Summary

Herbalisti now has a repeatable browser-level visual smoke gate in the local launch workflow. The release process no longer only proves data, APIs, headers, and build output; it also opens the site in a real Chromium browser and verifies that the key routed pages render cleanly at desktop and mobile widths.

The visual smoke gate checks:

- home search hero and chat flow
- routed research console
- searchable reference library
- Signals feed and source-health panels
- Source Policy page
- generated imagery load state
- page-level horizontal overflow
- console warnings and errors
- screenshots for review

Screenshots are written to:

```text
output/playwright/herbalisti-visual-smoke/
```

## Implemented

- Added `scripts/verify-visual-smoke.mjs`.
- Added `npm run verify:visual-smoke`.
- Made the standalone `verify:visual-smoke` command rebuild `dist` before launching the browser.
- Integrated the visual smoke script into `npm run verify:release` using the same local Cloudflare Pages runtime as the API and production-shape smoke tests.
- Added visual smoke coverage to launch preflight verification.
- Added visual smoke coverage to the production environment contract safe preflight.
- Added production-contract assertions that the script and docs remain wired.
- Added visual smoke evidence to the goal-readiness audit.
- Updated the deployment runbook, production launch packet, and goal-readiness documentation.
- Ignored local Playwright screenshot artifacts with `output/` in `.gitignore`.

## UX Refinement

During screenshot review, the home-page Newsfeed heading was visually too cramped on desktop. The section layout was adjusted so `Independent public-source signals.` reads as a spacious heading rather than a narrow stacked column.

## Current Screenshots

- `output/playwright/herbalisti-visual-smoke/desktop-home.png`
- `output/playwright/herbalisti-visual-smoke/desktop-search.png`
- `output/playwright/herbalisti-visual-smoke/desktop-library.png`
- `output/playwright/herbalisti-visual-smoke/desktop-signals.png`
- `output/playwright/herbalisti-visual-smoke/desktop-source-policy.png`
- `output/playwright/herbalisti-visual-smoke/mobile-home.png`
- `output/playwright/herbalisti-visual-smoke/mobile-search.png`
- `output/playwright/herbalisti-visual-smoke/mobile-library.png`
- `output/playwright/herbalisti-visual-smoke/mobile-signals.png`
- `output/playwright/herbalisti-visual-smoke/mobile-source-policy.png`

## Verification

Passed:

- `npm run verify:visual-smoke`
- `npm run verify:production-contract`
- `npm run verify:launch -- --soft`
- `npm run verify:goal-readiness`
- `npm run lint`
- `npm run verify:release`
- `npm run verify:completion-audit`
- `npm run prepare:launch`

Full release verification now includes:

- `Cloudflare Pages API smoke`
- `Cloudflare Pages production-shape smoke`
- `desktop and mobile visual smoke`

Current completion audit after release:

- Audit signature: `3c97c02b2cbe7395373ada44e72fb1384e599b459a2017a9f8bce4f751f09c63`
- Status: `local-ready-production-pending`
- Goal complete: `false`
- Local implementation ready: `true`
- Requirement groups passing locally: 15
- Requirement groups pending production: 3

Current public feed snapshot:

- Public news items: 24
- Static feed refresh status: `completed`
- Public snapshot status: `updated`
- Public snapshot items: 24

## Remaining Production Work

The full goal remains active. The local implementation is ready, but completion still requires production Cloudflare D1 bindings, required Cloudflare secrets, scheduled Worker deployment, `herbalisti.com` DNS/custom domain setup, and strict live verification against the production domain.
