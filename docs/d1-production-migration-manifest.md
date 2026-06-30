# Herbalisti D1 Production Migration Manifest

Generated: 2026-06-30T18:49:23.362Z

Status: pass

Reads local migration SQL and launch contracts, then optionally writes docs/d1-production-migration-manifest files. It does not call Cloudflare, apply remote migrations, deploy, mutate DNS, create resources, call paid APIs, or print secret values.

## Project

- Database: herbalisti
- Binding: HERBALISTI_DB
- Migrations path: migrations
- Remote command: `npx wrangler d1 migrations apply herbalisti --remote`
- Local verifier: `npm run verify:d1`

## Summary

- Migration files: 9
- Total bytes: 35080
- Manifest fingerprint: `6cb4b13052011388db058b32d706ee920d016f08b3f598f06e0c89173aad63d3`
- Tables created: citation_notes, feed_refresh_runs, feed_sources, media_jobs, news_items, reference_books, remedies
- Tables altered: feed_sources, reference_books, remedies
- Seed targets: citation_notes, feed_sources, reference_books, remedies

## Checks

- pass: 9 SQL migration files found in migrations.
- pass: Migration files use the ordered NNNN_description.sql naming pattern.
- pass: Migration sequence: 0001, 0002, 0003, 0004, 0005, 0006, 0007, 0008, 0009.
- pass: Production contract points Cloudflare D1 at the herbalisti migration directory.
- pass: Local D1 migration verifier is exposed as npm run verify:d1.
- pass: Remote D1 migration command is recorded in the production contract.
- pass: Migration SQL does not contain obvious API keys, bearer tokens, or private keys.

## Migrations

### migrations/0001_initial.sql

- SHA-256: `9426cb6082769c5f2af4df43299ecba8281357e0d176f0c54dc1029d5759f217`
- Bytes: 1763
- Creates tables: feed_sources, media_jobs, news_items, reference_books
- Alters tables: none
- Insert targets: none

### migrations/0002_seed_reference_data.sql

- SHA-256: `8b21ee063cd4138fd8553831865a01f27af10b7fac2a081d400b7541b836a6c2`
- Bytes: 3400
- Creates tables: none
- Alters tables: none
- Insert targets: feed_sources, reference_books

### migrations/0003_reference_book_metadata.sql

- SHA-256: `9d185c3d3a5e02baf7d691c1d57e69bd9fcdd30f8083d36e0fedfe1640c0e6fb`
- Bytes: 3306
- Creates tables: none
- Alters tables: reference_books
- Insert targets: none

### migrations/0004_feed_source_names.sql

- SHA-256: `8f5f845577882e232b7831c97d8cc8022eb50181f9645c937b2a96846c7b38bf`
- Bytes: 502
- Creates tables: none
- Alters tables: feed_sources
- Insert targets: none

### migrations/0005_feed_refresh_runs.sql

- SHA-256: `e8147ab97c3fb4a12bfd7299b97aa0c76bbf825cd18cf4c5658d6450d66e5127`
- Bytes: 557
- Creates tables: feed_refresh_runs
- Alters tables: none
- Insert targets: none

### migrations/0006_seed_remedies.sql

- SHA-256: `a1e4825dd183d9c8f06e3e1f9cfb2adeeec05b393d3f8525bd191c8b37048b8d`
- Bytes: 14609
- Creates tables: remedies
- Alters tables: none
- Insert targets: remedies

### migrations/0007_source_independence_review.sql

- SHA-256: `374ddc394f70a95127eede3b148e81ac5eb933e069c85b48cd4b0fa87f49c347`
- Bytes: 3709
- Creates tables: none
- Alters tables: feed_sources
- Insert targets: none

### migrations/0008_seed_citation_notes.sql

- SHA-256: `44a5a04e2b7641ab32dc47a5b2e69ca3b10a9a32d48e62c3fe28d6905538f08b`
- Bytes: 5498
- Creates tables: citation_notes
- Alters tables: none
- Insert targets: citation_notes

### migrations/0009_remedy_plant_parts.sql

- SHA-256: `633576d3b20bebc7dd3afd885fd5c35bd7b4f618e45649d262a960f911940ef6`
- Bytes: 1736
- Creates tables: none
- Alters tables: remedies
- Insert targets: none

## Production Guardrail

Apply remote D1 migrations only after this manifest, npm run verify:d1, npm run verify:launch -- --soft, npm run verify:production-contract, and approved Cloudflare D1 provisioning have passed.
