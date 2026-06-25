# Corpus Memory

`Corpus Memory` is the separate semantic retrieval service for the Herbalisti archive.

It is intentionally separate from the shared working-memory service used for notes, checkpoints, and operator context.

## Boundary

- shared working-memory service
  - briefs
  - checkpoints
  - working context
  - handoffs
- `Corpus Memory`
  - herbal profiles
  - edition-family summaries
  - indexed work summaries
  - later chunk-level retrieval documents
  - public-facing corpus search and chat support

The raw book archive still lives under `corpus/`.

`Corpus Memory` is the separate semantic access layer over that archive.

## Local Defaults

- host: `127.0.0.1`
- port: `8766`
- store: `corpus-memory/store/corpus-memory.sqlite3`

## Commands

- `npm run corpus-memory:start`
- `npm run corpus-memory:ingest`
- `npm run corpus-memory:query -- --query=nettle`
- `npm run corpus-memory:refresh`
- `npm run corpus-memory:stats`
- `npm run corpus-memory:state`

## Operational State

Run `npm run corpus-memory:state` to write the current local service snapshot to:

- `corpus-memory/state.json`

That file is the current repo-local boundary marker for the separated Herbalisti corpus store.

Run `npm run corpus-memory:refresh` after a corpus rebuild when you want the separated retrieval store and the repo-local state file brought back into sync in one step.

## Current Ingestion Shape

The initial ingestion pass is intentionally conservative:

- `herb-profile` documents from `corpus/derived/herb-profiles/profile-documents.jsonl`
- `edition-family` documents from `corpus/derived/edition-families/families.csv`
- `work-summary` documents built from `corpus/works/*/manifest.json`
  - including edition-family linkage metadata on each work summary

That keeps the public retrieval layer separate and useful without forcing a million-chunk migration in one step.

When a full unbounded ingest runs, `Corpus Memory` also prunes stale `herb-profile`, `work-summary`, and `edition-family` documents that are no longer present in the source corpus layers. That keeps the retrieval store aligned with the latest derived rebuild instead of accumulating obsolete records over time.

Chunk-level ingestion can be added later once the retrieval policy and ranking rules are settled.
