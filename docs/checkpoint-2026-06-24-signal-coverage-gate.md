# Herbalisti Signal Coverage Gate Checkpoint

Date: 2026-06-24

## Objective

Strengthen the Herbalisti independent Signals/newsfeed layer so the local release gate proves coverage of the full frontier topic set requested for the project: longevity, peptides, gene therapy, gene editing, DNA modification, CRISPR, health as a service, and self-sovereign wellbeing.

## What Changed

- Added `scripts/verify-signal-coverage.mjs`.
- Added `npm run verify:signal-coverage`.
- Wired signal coverage into `npm run verify:release`, launch config checks, the production environment contract, the launch packet generator, and goal readiness.
- Expanded the browser seed fallback from 3 broad placeholders to 8 allowlisted source-lane records using the real filterable source names.
- Expanded feed matching for personalized health, preventive health, digital health, health as a service, self-sovereign, personal agency, and owned wellbeing terms.
- Added coverage-balanced feed normalization so rarer requested topics are retained before the feed fills the remaining slots by recency.
- Added `topicClusters` to signal intelligence so every watched topic can be represented as active or watch status.
- Added the missing `Self-sovereign wellbeing` category to the public Signals RSS channel.
- Updated `docs/deployment-runbook.md`, `docs/goal-readiness.md`, `docs/production-launch-packet.md`, and `docs/production-environment-contract.json`.

## Current Public Export

After refreshing the local public data snapshot, `public/data/news.json` contains 24 current signals from the allowlisted feed sources.

Current topic mix:

- Longevity: 14
- Peptides: 2
- Gene therapy: 3
- Gene editing: 3
- DNA modification: 5
- CRISPR: 5
- Health as a service: 1

The live public snapshot does not currently contain a self-sovereign wellbeing item, but that topic is now present in the source policy, browser seed fallback, topic matcher, signal intelligence watchlist, RSS channel categories, and deterministic coverage fixture. It will appear in the live feed when matching allowlisted public metadata is found.

## Verification

Passed:

- `npm run verify:signal-coverage`
- `npm run verify:feed-normalization`
- `npm run verify:signal-intelligence`
- `npm run verify:signals-rss`
- `npm run verify:source-health`
- `npm run prepare:launch`
- `npm run verify:production-contract`
- `npm run verify:launch -- --soft`
- `npm run verify:goal-readiness`
- `npm run lint`
- `npm run build`
- `npm run verify:release`

Full release verification passed, including refresh, data export, lint, production build, feed normalization, signal coverage, signal intelligence, Signals RSS, source health, corpus rights, public exports, Australia lane, governance, graph, citation notes, goal readiness, media endpoint fixtures, Cloudflare config checks, production cutover simulation, production contract, local D1 migrations, scheduled Worker verification, Cloudflare Pages API smoke, and production-shape smoke.

## Status

Local implementation remains `local-ready-production-pending`.

The project should remain active until the production Cloudflare D1, scheduled Worker, domain, protected runtime secrets, and live-domain verification are in place.
