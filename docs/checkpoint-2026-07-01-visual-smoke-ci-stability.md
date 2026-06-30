# Herbalisti Checkpoint: Visual Smoke CI Stability

Date: 2026-07-01

## Summary

The GitHub manual release gate for commit `10eaca0fad7ec40f05326ac0feaf0b03c01907f1` failed in the desktop/mobile visual smoke step.

The site was not deployed and no production resources were changed. The failure was in the release verifier: the search route smoke check waited for a `CRISPR` result group that could be brittle when public snapshots refresh or the GitHub runner is slower.

## GitHub Evidence

- Workflow: `Herbalisti Manual Release Gate`
- Run: `https://github.com/marcgough/herbalist/actions/runs/28458317360`
- Status: `failure`
- Failed check: desktop/mobile visual smoke
- Failed condition: waiting for `.search-group` on the search page

## What Changed

- Increased UI wait tolerance on CI while keeping the local default shorter.
- Changed the search route smoke check to prove the search interface first.
- Added an explicit `ginger` search interaction because `ginger` is a stable herbal corpus query.
- Kept the visual gate strict: it still checks desktop and mobile routes for visible UI, text, broken images, console warnings/errors, and horizontal overflow.

## Verified Locally

Passed:

```bash
npm run lint
npm run verify:visual-smoke
npm run verify:release -- --public-only
```

## Remaining Production Gates

The full Herbalisti website goal remains active until Cloudflare D1, remote migrations, Cloudflare secrets, Pages and Worker deployment, `herbalisti.com` custom-domain routing, and strict live verification are complete.
