# Herbalisti Checkpoint - Seedance Media Verification

Date: 2026-06-16

## Summary

The Seedance/Kie.ai media pipeline is now locally verifiable without external provider calls, video generation, uploads, or credits. This advances the video-readiness part of the Herbalisti launch goal while keeping the production boundary intact until real keys and reviewed assets are available.

## Implemented

- Added `functions/_lib/media.js` for Kie.ai task ID and result URL extraction.
- Updated `POST /api/media/seedance` so Kie task IDs are accepted as either `taskId` or `task_id`.
- Updated `GET /api/media/seedance-status?taskId=...` so Kie `resultJson` URLs are parsed and can be persisted into `media_jobs`.
- Added `scripts/verify-media-endpoints.mjs`.
- Added `npm run verify:media-endpoints`.
- Integrated the media endpoint verifier into `npm run verify:release`.
- Added media helper/script checks to `npm run verify:launch -- --soft`.
- Updated `README.md`, `docs/deployment-runbook.md`, `docs/media-generation.md`, and `docs/herbalisti-project-plan.md`.

## What The Verifier Proves

- The media endpoints fail closed when `KIE_API_KEY` or `MEDIA_ADMIN_TOKEN` is missing.
- Unauthorized create/status requests are rejected before any provider call is attempted.
- Prompt length, model, resolution, duration, aspect ratio, HTTPS-only media references, and disabled provider web search are enforced.
- Successful create responses persist `media_jobs` rows when D1 is bound.
- Successful status responses parse Kie `resultJson` result URLs and update `media_jobs`.
- Provider responses are mocked; no real Kie.ai call is made.

## Verification

Passed:

- `npm run verify:media-endpoints`
- `npm run lint`
- `npm run build`
- `npm run verify:launch -- --soft`
- `npm run verify:release`

Latest `npm run verify:release` included the new `Seedance media endpoints` check and passed.

## Remaining Production Setup

- Create the Cloudflare D1 database named `herbalisti`.
- Run `npm run configure:cloudflare -- --d1 <database_id> --apply`.
- Set Cloudflare secrets for `KIE_API_KEY` and `MEDIA_ADMIN_TOKEN` before any real Seedance job creation.
- Consider enabling R2 as `HERBALISTI_MEDIA` before publishing approved video outputs.
- Keep motion manifest slots disabled until videos are generated, human-reviewed, stored as owned assets, added to provenance, and verified.

## Guardrails

- No deployment was attempted.
- No external provider request was made.
- No paid media generation was attempted.
- No secrets were requested, printed, or stored.

