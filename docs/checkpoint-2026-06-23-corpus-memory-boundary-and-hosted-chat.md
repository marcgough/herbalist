# Herbalisti Checkpoint: Corpus Memory Boundary and Hosted Archive Chat

Date: 2026-06-23

## What changed

- confirmed the Herbalisti corpus retrieval layer is now isolated inside `corpus-memory/`
- confirmed the repo-local retrieval store is separate from the shared Agent Memory service
- added an optional hosted OpenAI synthesis layer for `/api/herbal-chat`
- preserved retrieval-first behaviour and deterministic fallback when `OPENAI_API_KEY` is not configured
- updated the home hero archive prompt to `Ask the herbal archive.`
- updated environment and launch-contract notes so OpenAI is clearly optional for chat synthesis

## Corpus Memory boundary

- service name: `Corpus Memory`
- base URL: `http://127.0.0.1:8766`
- store path: `corpus-memory/store/corpus-memory.sqlite3`
- dedicated purpose: Herbalisti corpus retrieval only
- excluded from this store:
  - shared working-memory notes
  - operator checkpoints
  - general Agent Memory documents

Current local state snapshot:

- total documents: `3318`
- kinds:
  - `edition-family`: `1866`
  - `work-summary`: `1328`
  - `herb-profile`: `124`

## Website implementation details

- new helper: `functions/_lib/openai-herbal-chat.js`
- hosted path only activates when `OPENAI_API_KEY` is present
- default hosted model: `gpt-5.4-mini`
- `/api/health` now reports `serverSideOpenAiHerbalChat` as:
  - `configured`, or
  - `fallback_only`

## Verification

- `npm run lint`
- `npm run build`
- `node scripts/verify-goal-readiness.mjs`
- local Pages runtime check with `node scripts/verify-api.mjs http://127.0.0.1:8788`

Results:

- lint: pass
- build: pass
- local implementation readiness: `true`
- goal-readiness status: `local-ready-production-pending`

## Remaining production work

- create and bind the Cloudflare D1 database
- set required Cloudflare secrets
- deploy Cloudflare Pages and the scheduled Worker
- connect `herbalisti.com`
- run live production verification against the public domain
