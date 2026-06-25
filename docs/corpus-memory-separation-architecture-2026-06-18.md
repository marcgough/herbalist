# Corpus Memory Separation Architecture

Date: 2026-06-18

## Decision

Herbalisti corpus retrieval is now separated from the shared working-memory service.

The project now uses three distinct layers:

1. `corpus/`
   - the local source archive
   - registry records
   - normalized text
   - chunks
   - derived evidence and herb-profile layers
2. `corpus-memory/`
   - the Herbalisti-only semantic retrieval service
   - separate host, port, and store
   - separate ingestion scripts
3. shared working-memory service
   - briefs
   - checkpoints
   - operator context
   - handoffs

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

`npm run corpus-memory:refresh` is now the clean post-rebuild sync path for the separated retrieval store. It runs the ingest and rewrites the repo-local `corpus-memory/state.json` snapshot in sequence.

## Initial Ingestion Scope

The first clean pass indexes:

- `herb-profile` retrieval documents from `corpus/derived/herb-profiles/profile-documents.jsonl`
- `edition-family` retrieval documents from `corpus/derived/edition-families/families.csv`
- `work-summary` documents built from `corpus/works/*/manifest.json`
  - with edition-family metadata stitched onto each work summary when a family exists

Full ingests now also prune stale documents within each indexed kind when the run is unbounded, so family rebuilds cannot leave orphaned `edition-family` records behind in `Corpus Memory`.

This keeps the separation real immediately while avoiding a rushed full-chunk migration.

## Why This Split Matters

- the public knowledge system no longer shares storage with operator memory
- the corpus can evolve its own retrieval rules without polluting project notes
- the raw archive remains stable on disk even as the retrieval layer changes
- future public search, chat, and herb pages can target `Corpus Memory` directly
- the semantic layer can now represent bibliographic families as first-class retrieval objects instead of only isolated witnesses
