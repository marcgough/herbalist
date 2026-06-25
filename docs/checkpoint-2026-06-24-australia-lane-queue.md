# Herbalisti Checkpoint: Australia Lane Queue

Date: 2026-06-24

## Why this change

The Herbalisti corpus needs US, UK, and Australia search lanes, but the Australian lane should not be populated from rights-uncertain material. The next safe step is a local review queue that identifies Australian discovery routes without scraping, downloading, or depending on API keys.

## What changed

- added a local Australia-lane queue builder
- added a verifier for the Australia-lane rights boundary
- added source-review artifacts under `corpus/derived/australia-lane/`
- added a machine-readable summary at `corpus/exports/australia-lane-summary.json`
- integrated the queue builder into the local corpus refresh flow
- kept the current public book export unchanged except for preserving the existing Australia filter support

## Current lane state

- status: `prepared-not-populated`
- candidate source lanes: `5`
- search themes: `9`
- corpus-ready Australian source candidates: `0`
- current Australia reference-book count: `0`

## Rights boundary

The Australia lane is review-only until item-level rights are proven. Acceptable corpus candidates must be book-like and clearly public domain, CC0, CC BY, CC BY-SA, or similarly permissively reusable.

Excluded by default:

- newspapers
- blogs
- general web pages
- serial feeds
- uncertain-rights scans
- platform-only viewing records
- image-only collection records without a practical rights-cleared text path

## Trove boundary

Trove is tracked as a high-value Australian discovery source, but it remains metadata-review-only at this stage. Trove API access requires an API key, and Trove API terms cover metadata use rather than automatically granting rights to digital objects or full text. Full-text harvesting, commercial use, or AI-modelling use may require higher review.

Official source notes:

- Trove API access: https://trove.nla.gov.au/about/create-something/using-api
- Trove API terms: https://trove.nla.gov.au/about/create-something/using-api/trove-api-terms-use

## Cultural safety

First Australian and Indigenous knowledge must not be extracted, reframed, or indexed unless rights, authority, and culturally safe review are explicit. The bush-medicine theme is therefore stored as a restricted metadata lead only.

## Files changed

- `package.json`
- `scripts/corpus/build-australia-lane.mjs`
- `scripts/verify-australia-lane.mjs`
- `scripts/corpus/refresh-corpus-state.mjs`
- `scripts/verify-goal-readiness.mjs`
- `corpus/derived/australia-lane/candidate-sources.json`
- `corpus/derived/australia-lane/candidate-sources.csv`
- `corpus/derived/australia-lane/search-themes.json`
- `corpus/derived/australia-lane/README.md`
- `corpus/exports/australia-lane-summary.json`

## Verification

Completed verification:

- `npm run corpus:australia-lane`
- `npm run verify:australia-lane`
- `npm run lint`
- `npm run build`
- `node scripts/verify-data-exports.mjs`
- `node scripts/verify-goal-readiness.mjs`

Results:

- Australia-lane verifier: pass
- public data export verifier: pass
- lint: pass
- production build: pass
- goal readiness: `local-ready-production-pending`

## Notes

- no external API calls were added
- no Australian full text was acquired in this pass
- the lane is ready for manual book-level candidate review
