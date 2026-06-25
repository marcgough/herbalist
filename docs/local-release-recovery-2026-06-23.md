# Herbalisti local release recovery

Date: 2026-06-23

## What changed

- Restored the local goal-readiness audit so the public-domain herbal chat requirement reflects the current home experience instead of older copy checks.
- Tightened the ESLint ignore set so the release gate no longer walks archive, generated, or tooling folders that are outside the shipped application surface.
- Refactored the library paging reset in `src/App.tsx` to avoid the React `set-state-in-effect` lint failure while preserving the same user-facing behavior.
- Updated `docs/attribution.md` so the direct dependency inventory matches the current package set, including `adm-zip` and `playwright-core`.
- Hardened the local release verification path around Wrangler usage in the Windows environment.

## Verification

- `npm run verify:goal-readiness`
  - current status: `local-ready-production-pending`
- `npm run verify:release`
  - current status: `pass`
- `npm run prepare:launch -- --markdown`
  - current status: `pending-production-setup`
- `npm run verify:goal-readiness -- --strict`
  - expected current outcome: still fails, because production hosting, bindings, secrets, and live-domain verification are not finished yet

## Current boundary

The local implementation is now verified as ready.

The remaining work is production-only:

1. create the real Cloudflare D1 database
2. bind that D1 id into both Wrangler configs
3. apply remote D1 migrations
4. set Cloudflare secrets
5. deploy Pages and the scheduled news Worker
6. connect `herbalisti.com`
7. run live verification against `https://herbalisti.com`

## Inputs still needed

- Cloudflare account access for the `herbalisti` Pages project
- the production D1 database id
- `FEED_ADMIN_TOKEN`
- `KIE_API_KEY`
- `MEDIA_ADMIN_TOKEN`
- optional `OPENAI_API_KEY` only if repeatable server-side image generation is wanted later

## Notes

- Seedance video remains optional for launch and should stay disabled until reviewed owned assets are generated and stored.
- The local strict goal audit is intentionally still not complete; the repo now distinguishes a finished local implementation from unfinished production cutover.
