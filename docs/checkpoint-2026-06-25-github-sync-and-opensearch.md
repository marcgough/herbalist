# Herbalisti Checkpoint: GitHub Sync and OpenSearch Discovery

Date: 2026-06-25

## Summary

Herbalisti has been initialised as a Git repository and synced to the empty GitHub repository `marcgough/herbalist`.

Remote:

- `https://github.com/marcgough/herbalist`
- branch: `main`
- initial commit: `5efce1716254b39a7c642845a9060db68b4ec257`

The repository contains the verified site implementation, Cloudflare Functions and Worker code, D1 migrations, generated public data, corpus manifests, public-safe corpus exports, source-work summaries, Corpus Memory scaffold, launch contracts, and verification scripts.

The multi-GB local corpus archive remains out of GitHub by design. Excluded layers include raw PDFs/text captures, chunk files, normalized OCR/text layers, large evidence graphs, seed-catalog/term-family intermediates, local Corpus Memory SQLite stores, build output, screenshots, local runtime caches, and private env files.

## Search Discovery Slice

This checkpoint also records the OpenSearch discovery improvement:

- generated `public/opensearch.xml`
- homepage `<link rel="search">` points to `https://herbalisti.com/opensearch.xml`
- sitemap includes `https://herbalisti.com/opensearch.xml`
- discovery metadata exposes `openSearchUrl`
- `/api/health` exposes `searchDiscovery: true`
- release, launch, production, contract, and goal-readiness verifiers include the search-discovery gate
- edge headers include an hourly cache rule for `/opensearch.xml`

## Current Local Verification Snapshot

- `npm run verify:search-discovery`: pass
- `npm run verify:discovery-metadata`: pass
- `npm run verify:api-catalog`: pass
- `npm run verify:data-exports`: pass
- `npm run verify:edge-policy`: pass
- `npm run verify:production-contract`: pass
- `npm run verify:launch -- --soft`: expected `needs-production-setup`
- `npm run verify:goal-readiness`: expected `local-ready-production-pending`
- `npm run verify:completion-audit`: pass
- `npm run verify:visual-smoke`: pass when run outside the restricted sandbox
- `npm run verify:release`: pass

Latest objective completion audit:

- audit signature: `be25b863547da499ec855c1db281cfee9f9a6e7ba4e8d10dad95537bf07b213a`
- status: `local-ready-production-pending`
- goal complete: `false`
- local implementation ready: `true`
- pass requirements: `15`
- pending-production requirements: `3`
- launch status: `needs-production-setup`

Current public data snapshot:

- reference records: `1328`
- herbal profiles: `124`
- corpus source works: `195`
- public news items: `24`
- feed status: `completed`
- feed warnings: `0`
- public surfaces in discovery metadata: `23`
- sitemap entries: `23`
- API endpoints: `16`
- public API endpoints: `14`
- protected admin endpoints: `2`
- OpenSearch HTML route present: `true`
- OpenSearch JSON route present: `true`

## GitHub Safety Checks

- `.gitignore` excludes private env files, local runtime stores, screenshots, build output, local tool folders, Corpus Memory SQLite stores, and heavyweight corpus acquisition/intermediate layers.
- `.gitattributes` pins text normalization and marks common binary assets.
- Staged initial repo snapshot had no files over GitHub's normal 100 MB file limit.
- A stricter key-pattern scan found no OpenAI, GitHub, Google, or private-key style secrets in `HEAD`.

## Remaining Production Gates

The full Herbalisti goal remains active. The work is locally ready but not complete until:

- Cloudflare Pages project and `herbalisti.com` custom domain are active
- production Cloudflare D1 database is created and bound in both Wrangler configs
- remote D1 migrations are applied
- required Cloudflare secrets are set
- scheduled news Worker is deployed
- live production verification passes at `https://herbalisti.com`
