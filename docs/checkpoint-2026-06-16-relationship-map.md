# Herbalisti Checkpoint: Relationship Map

Date: 2026-06-16

## Summary

Added a source-led relationship map for Herbalisti so the remedy layer now behaves more like a high-tech knowledge interface instead of a static herb directory.

The graph is derived from the existing remedy index and remains Cloudflare D1-friendly. No separate graph database was added.

## Implemented

- Added shared graph builder: `functions/_lib/knowledge-graph.js`.
- Added public endpoint: `GET /api/graph`.
- Added graph query and relation filtering: `query`, `focus`, and `relation`.
- Added visible frontend section: `#map` / Relationship Map.
- Added shareable URL state: `map` and `relation`.
- Added graph verifier: `scripts/verify-knowledge-graph.mjs`.
- Added `npm run verify:knowledge-graph`.
- Added graph checks to release, launch, API, production, goal-readiness, health, contract, README, runbook, launch packet, project plan, and source-verification docs.

## Relationship Model

Node types:

- `Remedy`
- `Preparation`
- `Context`
- `Safety`

Edge types:

- `RELATED_TO`
- `PREPARED_AS`
- `TRADITIONAL_CONTEXT`
- `SAFETY_WATCH`

The graph deliberately does not expose a `TREATS` relationship. Traditional-use context is preserved as source-indexed research context, not treatment advice.

## Verification

Passed:

- `npm run verify:knowledge-graph`
- `npm run lint`
- `npm run build`
- `npm run verify:production-contract`
- `npm run verify:api -- http://127.0.0.1:8798`
- `npm run verify:production -- http://127.0.0.1:8798`
- `npm run verify:goal-readiness`
- `npm run verify:launch -- --soft`
- `npm run verify:release`

Key graph counts:

- 21 remedy nodes.
- 148 graph nodes.
- 261 graph edges.
- 60 nodes and 88 edges in the ginger neighborhood.
- 5 St. John's wort safety-watch edges.

Browser QA:

- Desktop Relationship Map rendered with active URL-driven relation filter, graph stats, and graph cards.
- Mobile 390 px viewport had no page-level horizontal overflow.
- Changing the map search updated the `map` query parameter.
- Browser console warnings/errors were empty.

## Current Status

`npm run verify:goal-readiness` reports `local-ready-production-pending`.

12 requirement groups pass locally.

3 requirement groups remain production-pending:

- Independent newsfeed deployment.
- Seedance video production setup.
- Cloudflare hosting, DNS, D1, Worker, and secrets.

## Production Blockers

No deployment, DNS mutation, upload, paid API call, or media generation was attempted.

Remaining external setup:

- Create the Cloudflare D1 database named `herbalisti`.
- Run `npm run configure:cloudflare -- --d1 <database_id> --apply`.
- Set Cloudflare Pages and Worker secrets.
- Deploy Cloudflare Pages and the scheduled news Worker.
- Point `herbalisti.com` DNS/custom domain to the Pages project.
- Run `npm run verify:production -- https://herbalisti.com`.
