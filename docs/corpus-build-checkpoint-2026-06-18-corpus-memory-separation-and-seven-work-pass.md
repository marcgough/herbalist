# Herbalisti Corpus Build Checkpoint

Date: 2026-06-18

## Objective

Separate Herbalisti corpus retrieval from the shared working-memory service, stand up the new `Corpus Memory` instance, and continue the local rights-cleared book acquisition goal on that new boundary.

## What changed

### 1. Corpus retrieval is now separated

The project now has a clean split:

- `corpus/`
  - raw source archive
  - registry
  - normalized text
  - chunks
  - derived evidence layers
- `corpus-memory/`
  - separate local semantic retrieval service
  - separate SQLite store
  - separate ingestion commands
- shared working-memory service
  - briefs
  - checkpoints
  - operator context

The top-level corpus orientation file now lives at `corpus/REGISTRY.md`.

New local commands now exist:

- `npm run corpus-memory:start`
- `npm run corpus-memory:ingest`
- `npm run corpus-memory:query -- --query=...`
- `npm run corpus-memory:stats`

Local service defaults:

- host: `127.0.0.1`
- port: `8766`
- store: `corpus-memory/store/corpus-memory.sqlite3`

### 2. Corpus Memory was populated

The first clean ingestion pass indexed:

- 124 `herb-profile` documents
- 991 `work-summary` documents

Current `Corpus Memory` total:

- 1,115 retrieval documents

### 3. The corpus goal resumed immediately

A new curated acquisition pass was completed after the separation work.

#### NLM titles landed

- `nlm-61541080R`
  - `Prodrome of a work to aid the teaching of the vegetable materia medica`
- `nlm-2575002R`
  - `A vindication of the Thomsonian system of the practice of medicine on botanical principles`
- `nlm-63610050R`
  - `The family medical guide`

#### Wellcome titles landed

- `wellcome-b25e6jga`
  - `Thesaurus medicaminum`
- `wellcome-hc2dvqnw`
  - `A practical treatise on materia medica and therapeutics`
- `wellcome-wzvfb7fu`
  - `Memoirs ... of the Botanic Garden at Chelsea`
- `wellcome-x4z328cq`
  - `A text-book of materia medica and therapeutics`

The first NLM three-work attempt landed only one work on the initial pass:

- `nlm-61541080R`
  - transient `ERR_NETWORK_CHANGED`
- `nlm-2575002R`
  - browser challenge block

Both were then recovered cleanly with explicit `--retry-failed=true` single-work retries.

## Current corpus totals

- 2,723 registered works
- 991 chunked works
- 1,728 discovered works still queued
- 1 failed work remaining
- 1,204,920 total chunk records
- 1,386,690 total paragraph records
- 8.31 GB corpus footprint
- 8,519 files

Collection mix:

- 27 Project Gutenberg works
- 325 NLM chunked works
- 639 Wellcome chunked works

## New work manifest counts

- `nlm-61541080R`
  - 49 chunks
  - 111 paragraphs
- `nlm-2575002R`
  - 51 chunks
  - 71 paragraphs
- `nlm-63610050R`
  - 3,390 chunks
  - 3,523 paragraphs
- `wellcome-b25e6jga`
  - 496 chunks
  - 501 paragraphs
- `wellcome-hc2dvqnw`
  - 4,245 chunks
  - 4,291 paragraphs
- `wellcome-wzvfb7fu`
  - 415 chunks
  - 435 paragraphs
- `wellcome-x4z328cq`
  - 1,996 chunks
  - 2,002 paragraphs

## Remaining failure queue

The active failure queue is down to one NLM record:

- `nlm-101139425`
  - `Institutiones medicinae et miscellanea medica, etc`
  - alternate official OCR routes were found earlier, but none yielded trusted text

## Outcome

The important boundary is now real:

- the Herbalisti corpus no longer shares a live semantic store with operator memory
- the new corpus retrieval layer is running separately
- corpus growth continued in the same turn instead of pausing for architecture work
