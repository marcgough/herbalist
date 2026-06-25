# Herbalisti GitHub Sync Scope

Date: 2026-06-25

Repository: `marcgough/herbalist`

## Included

- Website source, routes, styling, generated imagery, logo assets, and public app shell.
- Cloudflare Pages Functions, scheduled Worker code, Wrangler templates, and D1 migrations.
- Verification scripts, production contract, launch packet, completion audit, and deployment runbook.
- Generated public data under `public/data/`, including reference books, herbal knowledge, remedies, citation notes, sources, discovery metadata, and API catalog.
- Public discovery files, including `robots.txt`, `sitemap.xml`, `opensearch.xml`, manifest, favicon, and edge headers/redirects.
- Corpus manifests, public-safe corpus exports, source-work summaries, Australia-lane review metadata, herb-profile outputs, and edition-family outputs.
- Corpus Memory scaffold, state marker, scripts, and documentation.

## Excluded

- `node_modules/`, `dist/`, local screenshots, and build/runtime output.
- Private env files, local logs, local `.wrangler` stores, and temporary tool folders.
- Local Corpus Memory SQLite databases under `corpus-memory/store/`.
- Multi-GB corpus acquisition and intermediate layers:
  - `corpus/raw/`
  - `corpus/chunks/`
  - `corpus/normalized/`
  - `corpus/derived/evidence/`
  - `corpus/derived/seed-catalog/`
  - `corpus/derived/term-families/`
  - `corpus/review/seed-catalog-priority/`

## Rationale

The excluded corpus archive is too large for a normal GitHub source repository and contains files above GitHub's standard file-size limit. The repository keeps enough evidence and public-safe derived data to build, verify, and understand the project while preserving the raw archive locally for rebuilds and future object-storage planning.
