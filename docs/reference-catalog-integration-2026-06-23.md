# Herbalisti reference catalog integration

Date: 2026-06-23

## What changed

- Added a build-time reference-catalog generator at `scripts/corpus/build-reference-catalog.mjs`.
- The generator converts locally collected, rights-cleared corpus works into public reference records.
- It currently emits `1318` corpus-derived records across:
  - `854` Wellcome Collection works
  - `437` National Library of Medicine works
  - `27` Project Gutenberg works
- The public reference export now combines those records with the `4` existing curated seed references for a total of `1322` library records.

## App wiring

- `functions/_generated/reference-catalog.js` is now the deploy-safe catalog artifact for edge/runtime use.
- `functions/_lib/books.js` now serves the merged catalog instead of the four-record seed set alone.
- `scripts/export-public-data.mjs` now exports the merged catalog to `public/data/reference-books.json`.
- `package.json` now rebuilds the catalog automatically during `npm run build` and `npm run export:data`.

## Frontend behavior

- The library page now falls back in three stages:
  1. `/api/books`
  2. `/data/reference-books.json`
  3. local seed records
- The library grid now uses progressive reveal so the page does not render the full corpus-sized list at once.
- The search page static-review fallback now hydrates from public exports instead of the tiny local seed:
  - `/data/reference-books.json`
  - `/data/herbal-knowledge.json`
  - `/data/remedies.json`
  - `/data/citation-notes.json`
  - `/data/sources.json`
  - `/data/news.json`
- This means local Vite review now surfaces corpus-backed reference matches and refreshed signals even when `/api/search` is unavailable.

## Verification

- `npm run export:data`
- `npm run build`
- `node scripts/verify-data-exports.mjs`
- Manual browser verification on local review:
  - `/search?q=pharmacopoeia` now shows `231` reference matches from the static review cache
  - `/search?q=longevity` now shows references, signals, notes, and source matches from the static review cache

## Notes

- Verification rules were updated so historical book titles are not mistaken for blocked live-news sources.
- I did not push this checkpoint into the live shared Agent Memory instance during this pass, to preserve the separation between website work and the dedicated corpus-memory layer.
