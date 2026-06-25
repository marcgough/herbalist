# Herbalisti Checkpoint: Generated Sitemap Discovery Surfaces

Date: 2026-06-24

## Purpose

Make Herbalisti's public discovery layer more launch-ready by generating the sitemap from the public export pipeline rather than keeping it as a stale static file. The sitemap now advertises the routed app pages, the public Signals RSS feed, and the public JSON data surfaces that support the searchable archive, herbal commons, news snapshot, governance, media provenance, and discovery metadata.

## What Changed

- `scripts/export-public-data.mjs` now generates `public/sitemap.xml`.
- Sitemap `lastmod` now uses the current export date.
- Sitemap entries now include:
  - 9 routed app pages
  - `/api/signals.xml`
  - `/data/news.json`
  - `/data/feed-status.json`
  - `/data/reference-books.json`
  - `/data/herbal-knowledge.json`
  - `/data/remedies.json`
  - `/data/citation-notes.json`
  - `/data/sources.json`
  - `/data/discovery-metadata.json`
  - `/data/governance.json`
  - `/data/media-provenance.json`
  - `/data/media-manifest.json`
- `public/data/discovery-metadata.json` now exposes:
  - `sitemapUrl`
  - `publicSurfaces` with 21 canonical public URLs
- `scripts/verify-discovery-metadata.mjs` now verifies public data/RSS sitemap entries, the generated sitemap date, and the discovery metadata public-surface list.
- `scripts/verify-production.mjs` now verifies that production sitemap discovery advertises the public data/RSS surfaces and that discovery metadata lists them.
- Runbook, goal-readiness notes, launch packet docs, and generated launch packet wording were updated.

## Current Discovery Snapshot

- discovery metadata generated at: `2026-06-24T12:48:21.026Z`
- discovery public surfaces: 21
- discovery datasets: 5
- sitemap entries: 21
- sitemap includes Signals RSS: yes
- sitemap includes discovery metadata export: yes

## Current Data Snapshot

- reference books: 1,328
- herbal commons records: 124
- remedies: 21
- citation notes: 10
- source registry records: 6
- news items: 24
- feed refresh status: `completed_with_warnings`
- public snapshot status: `updated`
- public snapshot items: 24

The feed warning was a single arXiv timeout. The public snapshot still updated with 24 items.

## Verification

Focused gates passed:

- `npm run export:data`
- `npm run verify:discovery-metadata`
- `npm run verify:data-exports`
- `npm run lint`
- `npm run build`
- `npm run verify:production-contract`
- `npm run verify:launch -- --soft`
- `npm run verify:goal-readiness`
- `npm run prepare:launch`
- `npm run prepare:completion-audit`
- `npm run verify:completion-audit`

Full release gate passed:

- `npm run verify:release`

The full release gate exercised the generated sitemap through local Cloudflare Pages API smoke, production-shape smoke, desktop/mobile visual smoke, and accessibility smoke.

## Current Goal State

- objective status: `local-ready-production-pending`
- goal complete: `false`
- local implementation ready: `true`
- requirement groups passing locally: 15
- production-pending requirement groups: 3
- launch preflight status: `needs-production-setup`
- completion audit signature: `7d74bbd2cc7f2967adcf814094a640ae684cbeac34550bea3b79c10b62d133c9`

## Boundaries

- No Cloudflare resources were created.
- No DNS was changed.
- No production deployment was attempted.
- No paid media generation was attempted.
- No secrets were requested, printed, or stored.
- Corpus source material remains in the separate Corpus Memory layer, not the shared working Agent Memory instance.

## Remaining Production Work

The project remains active until:

- Cloudflare D1 is created and bound to both Pages Functions and the scheduled news Worker.
- Required Cloudflare secrets are set.
- Remote D1 migrations are applied.
- Cloudflare Pages and the scheduled Worker are deployed.
- `herbalisti.com` is connected and verified.
- `npm run verify:live-readiness -- --strict`, `npm run verify:production -- https://herbalisti.com`, and `npm run verify:goal-readiness -- --strict` pass against production.
