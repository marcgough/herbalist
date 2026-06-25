# Herbalisti Checkpoint: Citation Notes

Date: 2026-06-16

## Summary

Herbalisti now has a first-class citation/source notes layer that connects reference books, remedy records, signal sources, and governance decisions back to public source URLs. The notes are deliberately short, source-led, copyright-safe, and non-prescriptive.

## Implemented

- Added static fallback records in `src/data/citationNotes.ts`.
- Added Cloudflare Pages Function support in `functions/_lib/citation-notes.js` and `functions/api/citation-notes.js`.
- Added D1 migration `migrations/0008_seed_citation_notes.sql`.
- Added the public `#citations` section with search, type filters, linked record labels, review status, tags, and source links.
- Added citation-note results to unified search as a `Notes` group.
- Added `npm run verify:citation-notes`.
- Updated health, API, production, D1, release, launch, contract, goal-readiness, README, runbook, project-plan, and source-verification coverage.
- Added mobile wrapping for long feed warning text so live-source warning URLs cannot create page-level horizontal overflow.

## Verification

- `npm run verify:citation-notes`: passed with 10 notes across reference, remedy, signal, and governance types.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run verify:d1`: passed with 10 `citation_notes` rows.
- `npm run verify:launch -- --soft`: passed as `needs-production-setup`, checking 64 files and 26 scripts.
- `npm run verify:goal-readiness`: passed as `local-ready-production-pending`, with 13 local requirement groups passing and 3 production-only groups pending.
- `npm run verify:production-contract`: passed.
- `npm run verify:api -- http://127.0.0.1:8804`: passed with 10 citation notes and 5 unified search groups.
- `npm run verify:production -- http://127.0.0.1:8804`: passed.
- Browser QA on local Cloudflare Pages runtime: desktop and 390 px mobile passed; Notes nav, filtered citation note, 5-group search, no console warnings/errors, and no mobile horizontal overflow.
- `npm run verify:release`: passed end to end.

## Current State

Local implementation remains ready. The full active goal should remain open because production still requires Cloudflare Pages, D1 binding, D1 remote migrations, Cloudflare secrets, scheduled Worker deployment, DNS/custom-domain activation for `herbalisti.com`, and live production verification.

No deployment, DNS mutation, paid media generation, external upload, or secret exposure was performed.
