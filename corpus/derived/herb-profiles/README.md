# Herb Profiles

Generated: 2026-06-23T13:20:49.170Z

This layer turns the seed-ready Herbalisti plant families into retrieval-ready profile envelopes.

## What it does

- anchors each seed-ready family to a durable profile record
- keeps source-family provenance from the seed catalog
- aggregates co-mentioned preparations, plant parts, cautions, and conditions from chunk-level evidence
- writes both human-readable profile notes and machine-readable retrieval documents

## What it does not do

- it does not assert efficacy
- it does not convert co-mentions into medical claims
- it does not replace later editorial review for safety, identity, or modern interpretation

## Key files

- `index.csv`
- `profiles.json`
- `profiles.jsonl`
- `profile-documents.jsonl`
- `records/<profile-id>/profile.json`
- `records/<profile-id>/profile.md`

## Current summary

- Profiles built: 124
- Profiles with preparation signals: 124
- Profiles with condition signals: 124
- Profiles with caution signals: 124
- Profiles with plant-part signals: 124
- Total matched chunks in the builder pass: 121899

