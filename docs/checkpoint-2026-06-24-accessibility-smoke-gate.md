# Herbalisti Checkpoint - Accessibility Smoke Gate

Date: 2026-06-24

## Summary

Herbalisti now has a repeatable accessibility smoke gate in the local launch workflow. This complements the visual smoke gate by checking the keyboard and semantic basics that matter for a public research interface before production deployment.

The accessibility smoke gate opens the local Cloudflare Pages build in Edge or Chrome with reduced motion enabled and checks:

- clean landmark structure
- visible skip link and keyboard skip navigation into main content
- one `h1` per routed page
- labelled primary navigation
- labelled form controls
- accessible names for interactive controls and links
- explicit image `alt` attributes
- safe `rel` values on links opened in new tabs
- reduced-motion behavior for ambient animation/video
- basic contrast signals
- console warnings and page errors

## Implemented

- Added `scripts/verify-accessibility-smoke.mjs`.
- Added `npm run verify:accessibility-smoke`.
- Refactored app landmarks so header, main, and footer are sibling landmarks rather than nesting header/footer inside main.
- Added a keyboard-visible `Skip to main content` link.
- Added one hidden `h1` per non-home route while preserving the visible home `Herbalisti` h1.
- Added consistent focus-visible styling for navigation, buttons, search fields, cards, and key links.
- Integrated accessibility smoke into `npm run verify:release`.
- Added accessibility smoke coverage to launch preflight verification.
- Added accessibility smoke to the production environment contract safe preflight.
- Added production-contract assertions that the verifier and docs remain wired.
- Added accessibility smoke evidence to goal-readiness release verification.
- Updated the deployment runbook, production launch packet, and goal-readiness documentation.

## Verification Result

Passed:

- `npm run verify:accessibility-smoke`
- `npm run verify:production-contract`
- `npm run verify:launch -- --soft`
- `npm run verify:goal-readiness`
- `npm run lint`
- `npm run verify:release`
- `npm run verify:completion-audit`
- `npm run prepare:launch`

The standalone accessibility smoke passed across these routed pages:

- home
- search
- library
- notes
- remedies
- map
- signals
- source-policy
- governance

The full release gate now includes:

- `Cloudflare Pages API smoke`
- `Cloudflare Pages production-shape smoke`
- `desktop and mobile visual smoke`
- `accessibility smoke`

## Current Objective Audit

- Audit signature: `efdafb4f8809e85cc4e88573a9554c492c57f7f840ab43118a606a7d1c7e1393`
- Status: `local-ready-production-pending`
- Goal complete: `false`
- Local implementation ready: `true`
- Requirement groups passing locally: 15
- Requirement groups pending production: 3

## Current Public Feed Snapshot

- Public news items: 24
- Static feed refresh status: `completed`
- Public snapshot status: `updated`
- Public snapshot items: 24

## Remaining Production Work

The full Herbalisti goal remains active. Local implementation is ready, but completion still requires production Cloudflare D1 bindings, required Cloudflare secrets, scheduled Worker deployment, `herbalisti.com` DNS/custom domain setup, and strict live verification against the production domain.
