# Herbalisti Checkpoint: US / UK / Australia Search Lanes

Date: 2026-06-23

## Why this change

The brief explicitly asked for search to support the US, UK, and Australia.

The corpus already carried implicit US and UK rights-lane signals in the reference records, but the product did not expose them as a first-class search control. Australia was not yet represented as a user-facing lane at all.

## What changed

- added explicit reference-lane metadata to the generated corpus reference catalog:
  - `rightsLane`
  - `searchRegions`
- updated `/api/books` to accept `region`
- updated `/api/search` to accept `region`
- updated the library page with a lane filter:
  - `All lanes`
  - `US`
  - `UK`
  - `Australia`
- updated the research console with the same lane filter
- surfaced lane labels in book cards and reference search results
- kept fallback search/export behaviour aligned with the live API behaviour

## Current lane coverage

Current exported reference-book counts:

- `US`: `465`
- `UK`: `863`
- `Australia`: `0`

That means the Australia lane is now a prepared search surface, but not yet a populated corpus lane.

## Files changed

- `scripts/corpus/build-reference-catalog.mjs`
- `functions/_lib/books.js`
- `functions/api/books.js`
- `functions/_lib/search.js`
- `functions/api/search.js`
- `src/data/books.ts`
- `src/App.tsx`
- `src/App.css`
- `scripts/verify-api.mjs`
- `scripts/verify-data-exports.mjs`
- `scripts/verify-goal-readiness.mjs`

## Verification

- `npm run lint`
- `npm run build`
- `node scripts/verify-data-exports.mjs`
- `node scripts/verify-goal-readiness.mjs`
- local Pages runtime plus `node scripts/verify-api.mjs http://127.0.0.1:8788`

Results:

- lint: pass
- build: pass
- data export verification: pass
- goal-readiness: pass locally, production still pending Cloudflare setup
- API verification: pass

## Notes

- the lane filter is currently authoritative for the reference corpus and reference group in the research console
- the broader search console still returns non-reference groups such as remedies, notes, sources, and signals outside those archive lanes
- the next substantive content step for this requirement would be ingesting rights-cleared Australian archive works so the Australia lane is populated rather than merely prepared
