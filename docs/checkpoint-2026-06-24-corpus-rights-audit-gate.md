# Herbalisti Corpus Rights Audit Gate Checkpoint

Date: 2026-06-24

## Summary

Added a dedicated local corpus rights audit gate for Herbalisti. The audit verifies that the local book corpus remains aligned with the agreed inclusion standard: rights-cleared, book-like works from approved no-key public archive lanes only.

The new verifier reads local files only. It does not fetch, scrape, deploy, mutate DNS, call paid APIs, or expose secrets.

## New Commands

- `npm run verify:corpus-rights`
- `npm run corpus:rights-audit`

## What The Audit Checks

- Corpus registry works use approved collections only: Project Gutenberg, National Library of Medicine, and Wellcome Collection.
- Rights status is public-domain or permissive: Public Domain Mark, public domain US/USA, PDM, CC BY, CC0, or CC BY-SA.
- Jurisdiction lane is restricted to US, UK, or Australia.
- Acquisition modes stay in official/direct archive lanes, not feed/blog/news/web scraping.
- Chunked works have source URL, download URL, metadata URL, rights basis, reuse license, topic family, and review status.
- Chunked works have local manifest, normalized text, and chunk JSONL artifacts.
- Public reference and herbal commons exports expose only approved source and license records.

## Current Audit Counts

- Total works tracked: 2,720
- Chunked works: 1,328
- Discovered works pending ingestion: 1,384
- Download failed works: 8
- Chunk records: 1,746,349
- Paragraph records: 1,968,510
- Public reference records: 1,328
- Herbal commons records: 124
- Herbal commons source works: 200

Rights status distribution:

- `public_domain_mark`: 696
- `public_domain_us`: 27
- `pdm`: 1,985
- `cc-by`: 12

## Files Added Or Updated

- `scripts/verify-corpus-rights.mjs`
- `corpus/exports/corpus-rights-audit-summary.json`
- `docs/corpus-rights-audit.md`
- `package.json`
- `scripts/verify-release.mjs`
- `scripts/verify-launch-config.mjs`
- `scripts/verify-production-contract.mjs`
- `scripts/verify-goal-readiness.mjs`
- `scripts/prepare-launch-packet.mjs`
- `docs/production-environment-contract.json`
- `docs/deployment-runbook.md`
- `docs/goal-readiness.md`
- `docs/production-launch-packet.md`

## Verification

Passed:

- `npm run corpus:rights-audit`
- `npm run verify:corpus-rights`
- `npm run verify:production-contract`
- `npm run verify:launch -- --soft`
- `npm run verify:goal-readiness`
- `npm run lint`
- `npm run build`
- `npm run verify:release`

## Current Goal State

`npm run verify:goal-readiness` still correctly reports `local-ready-production-pending`.

The full Herbalisti goal remains active because production still requires approved external actions:

- create and bind the Cloudflare D1 database
- apply remote D1 migrations
- set required Cloudflare secrets
- deploy Cloudflare Pages and the scheduled news Worker
- connect `herbalisti.com`
- run strict live verification against `https://herbalisti.com`
