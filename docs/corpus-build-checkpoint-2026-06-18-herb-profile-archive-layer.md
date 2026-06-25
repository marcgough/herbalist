# Herbalisti Corpus Build Checkpoint

Date: 2026-06-18

## Objective

Move the Herbalisti corpus closer to a Corpus Memory semantic archive by adding a durable herb-profile layer between the seed catalog and any future public search or chat experience.

This pass did not add new books. It turned the existing corpus evidence into retrieval-ready profile envelopes for the 112 seed-ready herb families already curated in the archive.

## What changed

### 1. A new herb-profile builder is now live

New script:

- `scripts/corpus/build-herb-profiles.mjs`

It builds a profile layer from:

- `corpus/derived/seed-catalog/seed-ready-families.csv`
- `corpus/derived/evidence/chunk-signals.jsonl`
- `registry/works.csv`

For each seed-ready family, the builder now creates:

- a durable machine record
- a human-readable profile note
- a flattened search index row
- a retrieval-oriented profile document

The profile records preserve:

- seed-catalog provenance via `source_family_refs`
- curator decisions via `decision_note`
- collection and topic coverage
- co-mentioned preparations
- co-mentioned plant parts
- co-mentioned cautions
- co-mentioned conditions
- representative supporting works
- representative source-linked passages

Important constraint:

These are explicitly historical co-mention profiles, not treatment claims or modern efficacy assertions.

### 2. The archive now has a dedicated herb-profile output layer

New output folder:

- `corpus/derived/herb-profiles/`

Key outputs:

- `index.csv`
- `profiles.json`
- `profiles.jsonl`
- `profile-documents.jsonl`
- `records/<profile-id>/profile.json`
- `records/<profile-id>/profile.md`
- `exports/herb-profile-summary.json`

Example profile records now exist for:

- `seed-chamomile`
- `seed-lemon`
- `seed-senna`
- `seed-castor`
- `seed-burdock`

### 3. The corpus workflow now treats herb profiles as a first-class derived layer

The following workflow glue was added:

- `package.json` now exposes `npm run corpus:profiles`
- `scripts/corpus/report-status.mjs` now reports `herbProfileSummary`
- `scripts/corpus/query-corpus.mjs` now supports `--scope=profiles`
- `scripts/corpus/run-frontier-batch.mjs` now rebuilds herb profiles automatically after the seed-catalog layer

That means future corpus-expansion runs can keep the profile archive current without a separate manual rebuild step.

## Current herb-profile totals

From `exports/herb-profile-summary.json`:

- 112 herb profiles built
- 112 profiles with preparation signals
- 112 profiles with condition signals
- 112 profiles with caution signals
- 112 profiles with plant-part signals
- 47,785 matched profile chunks in the builder pass

Largest profiles by source-linked chunk coverage currently include:

- `Lemon`
- `Chamomile`
- `Senna`
- `Castor`
- `Olive`
- `Rose`

## Example archive behavior

Example query:

- `node scripts/corpus/query-corpus.mjs --query=chamomile --scope=profiles --limit=3`

This now returns the `seed-chamomile` profile with:

- canonical name
- catalog class
- total chunk and work coverage
- top preparations
- top conditions
- top cautions

Example profile outputs verified:

- `corpus/derived/herb-profiles/records/seed-chamomile/profile.json`
- `corpus/derived/herb-profiles/records/seed-chamomile/profile.md`

## Why this matters

This is the first layer that makes the corpus feel structurally like the end-state system rather than just a well-organized text archive.

It matters because it:

1. creates a durable semantic envelope for the first public herb entries
2. keeps provenance attached to every profile
3. gives future website search and chat a profile-level retrieval surface
4. lets us keep growing the corpus while still exposing stable, source-linked herb records

## Corpus totals remain unchanged from the last acquisition pass

- 2,720 registered works
- 535 chunked works
- 2,184 discovered works
- 1 failed work
- 734,646 total chunk records

## Recommended next move

1. continue another moderate frontier acquisition batch so the profile layer has more supporting works to draw from
2. add a watchlist or quarantine lane for weak commercial herbal titles that are public domain but semantically low-value
3. begin shaping a second profile tier for selected supporting families and derived substances so public retrieval can distinguish herbs from preparations and materia medica language
