# Herbalisti Checkpoint: Source Independence Review

Date: 2026-06-16

## Summary

Strengthened the Herbalisti independent-source standard for the self-updating Signals feed.

The source registry now carries explicit source-level review metadata instead of relying only on a simple allowlist and Big Pharma blocklist. This better supports the project requirement that the newsfeed use publicly available sources that are not Big Pharma related.

## What Changed

- Added source review fields to `src/data/sourcePolicy.ts` and `functions/_lib/sources.js`:
  - `independenceStatus`
  - `ownershipReview`
  - `reviewEvidenceUrl`
  - `reviewCadence`
  - `lastReviewed`
  - `reviewNote`
- Added D1 migration `migrations/0007_source_independence_review.sql`.
- Updated `/api/sources` D1 mapping so production source records expose the review metadata.
- Updated Source Governance UI so each source shows a compact review note, status, last-reviewed date, and cadence.
- Updated unified search so source review metadata is searchable and source cards can show review context.
- Added `scripts/verify-source-governance.mjs` and `npm run verify:source-governance`.
- Integrated source-governance checks into release, launch preflight, D1, API, production, production contract, and goal-readiness verification.
- Updated source documentation, launch packet notes, README, deployment runbook, public governance policy, and project plan.

## Source Review Positioning

The source review is source-level, not article-author-level. It verifies that the channel itself is appropriate for the launch source registry and is not marked as a Big Pharma-owned channel by default.

Important nuance:

- Public research infrastructure such as PubMed / NCBI, arXiv, bioRxiv / medRxiv, and Crossref is treated as metadata infrastructure, not medical authority.
- Lifespan.io is treated as independent longevity coverage.
- Fight Aging! is treated as independent longevity commentary with disclosed conflict context, not as a primary research index.

## Verification

Passed:

- `npm run verify:source-governance`
- `npm run verify:governance`
- `npm run verify:production-contract`
- `npm run verify:goal-readiness`
- `npm run verify:launch -- --soft`
- `npm run verify:d1`
- `npm run lint`
- `npm run build`
- `npm run verify:release`

Browser QA:

- Desktop Source Governance section rendered six sources with review metadata.
- Mobile 390 px viewport had no page-level horizontal overflow.
- Fight Aging! displayed disclosed-conflict commentary status.
- Crossref displayed not-for-profit scholarly infrastructure status.
- Browser console warnings/errors were empty.

Goal readiness after this checkpoint:

- Status: `local-ready-production-pending`
- Passing local requirement groups: 11
- Production-pending groups: 3

## Remaining Production Setup

The goal remains active and not complete until the production environment exists and passes live verification.

Still needed:

- Create the Cloudflare D1 database named `herbalisti`.
- Run `npm run configure:cloudflare -- --d1 <database_id> --apply`.
- Set required Cloudflare secrets.
- Deploy Cloudflare Pages and the scheduled news Worker.
- Connect `herbalisti.com` DNS/custom domain.
- Run `npm run verify:live-readiness -- --strict`.
- Run `npm run verify:production -- https://herbalisti.com`.

## Guardrails

No deployment, DNS mutation, external API write, paid OpenAI generation, Seedance/Kie.ai generation, upload, or secret use was performed in this checkpoint.
