# Herbalisti Checkpoint - Remedy Plant Parts

Date: 2026-06-16 Australia/Sydney

## Summary

Added explicit plant-part metadata to the Herbalisti remedy layer and relationship map. This closes another piece of the original Natural Medicines knowledgebase plan while preserving Herbalisti's safety boundary: plant parts are source-indexed context, not treatment claims.

## Implemented

- Added `plantParts` metadata to all 21 launch remedy records in `src/data/remedies.ts`.
- Mirrored plant-part metadata into the Cloudflare Pages fallback data in `functions/_lib/remedies.js`.
- Added D1 migration `migrations/0009_remedy_plant_parts.sql` to add and backfill `plant_parts_json`.
- Extended remedy search so terms such as `rhizome`, `leaf`, `root`, `flower`, `berry`, `seed`, and `bulb` are first-class searchable metadata.
- Extended the relationship graph with `HAS_PART` edges and `Plant part` nodes.
- Added compact plant-part chips to remedy cards.
- Added Plant part graph stats and styling.
- Extended D1, API, production-shape, launch, production-contract, goal-readiness, README, runbook, launch-packet, project-plan, and source-verification coverage.

## Verification

Passed:

- `npm run verify:knowledge-graph`
- `npm run verify:d1`
- `npm run build`
- `npm run verify:production-contract`
- `npm run verify:launch -- --soft`
- `npm run verify:goal-readiness`
- `npm run lint`
- `npm run verify:api -- http://127.0.0.1:8806`
- `npm run verify:production -- http://127.0.0.1:8806`
- `npm run verify:release`

Key verification outcomes:

- Knowledge graph now reports 21 remedy nodes, 161 graph nodes, 288 graph edges, and five relation types: `RELATED_TO`, `HAS_PART`, `PREPARED_AS`, `TRADITIONAL_CONTEXT`, and `SAFETY_WATCH`.
- API smoke verifies `/api/remedies?query=rhizome`, `/api/graph?query=ginger&relation=HAS_PART`, and no `TREATS` relation.
- D1 verification applies migration `0009_remedy_plant_parts.sql` and confirms ginger carries rhizome plant-part context.
- Launch preflight now checks 68 required files and 27 scripts.
- Goal readiness remains `local-ready-production-pending` with 14 local pass groups and 3 production-pending groups.

Browser QA:

- Desktop local Cloudflare Pages preview rendered plant-part remedy chips, `HAS_PART` graph edges, Plant part graph stats, no `TREATS` text, no horizontal overflow, and no console warnings/errors.
- Mobile viewport `390 x 844` rendered plant-part chips and graph cards inside the viewport with no horizontal overflow or console warnings/errors.
- Browser viewport override was reset after QA.

## Current Boundaries

- No deployment was performed.
- No DNS changes were made.
- No Cloudflare resources were created.
- No paid OpenAI or Kie.ai media generation was called.
- No secrets were requested, used, printed, or stored.

## Remaining Production Work

- Create the Cloudflare D1 database named `herbalisti`.
- Configure both Wrangler files with the returned shared D1 database ID.
- Apply D1 migrations remotely, including `0009_remedy_plant_parts.sql`.
- Set required Cloudflare secrets.
- Deploy Cloudflare Pages and the scheduled news Worker.
- Connect `herbalisti.com` to the Pages project.
- Run `npm run verify:live-readiness -- --strict`, `npm run verify:production -- https://herbalisti.com`, and `npm run verify:goal-readiness -- --strict`.
