# Herbalisti checkpoint - 2026-06-23 - public archive boundary

## Goal

Align the public book/library surfaces with the user's stated corpus rule:

- rights-cleared, public-domain, or permissively reusable works only
- no modern placeholder bibliography leaking into the public archive view
- keep internal citation helpers available for audit workflows without confusing the public corpus story

## What changed

1. `functions/_lib/books.js`
   - added a public archive filter keyed to rights-cleared source statuses
   - kept the older fallback bibliography as internal helper data
   - changed `/api/books` payload generation to return public corpus books only

2. `scripts/export-public-data.mjs`
   - `public/data/reference-books.json` now exports the rights-cleared corpus catalog only

3. `src/data/books.ts`
   - replaced the small modern fallback bibliography with a small rights-cleared archive seed for offline UI fallback

4. `src/App.tsx`
   - updated library fallback labeling so degraded mode reads as a local archive seed rather than a generic seed database
   - added readable labels for the new public corpus source identifiers

5. verification scripts
   - updated `verify-data-exports.mjs`, `verify-api.mjs`, `verify-production.mjs`, and `verify-goal-readiness.mjs`
   - the checks now validate corpus-scale rights-cleared export behavior instead of expecting `Medical Herbalism` and other modern placeholder records in the public library

## Verified state

- `npm run export:data`: passed
- `npm run verify:data-exports`: passed
- `npm run lint`: passed
- `npm run build`: passed

Direct local payload verification:

- public reference export total: `1319`
- public `/api/books` logic total: `1319`
- all public book records use allowed rights statuses only
- all public book records point to approved archive URLs only
- `Coffin` query returns the Coffin botanic guide records
- `Bulliard` query returns `A botanical dictionary`
- `Safety` mode returns `94` records

Preview verification:

- `/library` shows `1319 references from public data export + corpus catalog`
- `/library` no longer shows `Medical Herbalism` or `The Herbal Medicine-Maker's Handbook`
- `/source-policy` shows `193` rights-cleared source records

## Note

The lightweight local preview at `127.0.0.1:4173` is good for page-level behavior, but it does not fully emulate the production edge-header contract. For that reason, the strict HTTP production verifier was not treated as authoritative for this checkpoint.
