# Herbalisti Checkpoint: Signals RSS

Date: 2026-06-16

## Summary

Added a public RSS feed for Herbalisti Signals at `GET /api/signals.xml`, discoverable from the homepage with:

```html
<link rel="alternate" type="application/rss+xml" title="Herbalisti Signals" href="https://herbalisti.com/api/signals.xml" />
```

The route follows the same public-source policy as `/api/news`: D1-first when production data is bound, live public-source fallback when needed, normalized `topic`, `source`, and `query` filters, source-policy text, non-medical boundary copy, XML escaping, and blocked Big Pharma source-name filtering.

## Files Added

- `functions/_lib/signals-rss.js`
- `functions/api/signals.xml.js`
- `scripts/verify-signals-rss.mjs`
- `docs/checkpoint-2026-06-16-signals-rss.md`

## Files Updated

- `index.html`
- `functions/api/health.js`
- `package.json`
- `scripts/verify-api.mjs`
- `scripts/verify-production.mjs`
- `scripts/verify-release.mjs`
- `scripts/verify-launch-config.mjs`
- `scripts/verify-goal-readiness.mjs`
- `scripts/verify-production-contract.mjs`
- `scripts/prepare-launch-packet.mjs`
- `docs/production-environment-contract.json`
- `README.md`
- `docs/deployment-runbook.md`
- `docs/source-verification.md`
- `docs/herbalisti-project-plan.md`
- `docs/goal-readiness.md`
- `docs/production-launch-packet.md`
- `public/data/news.json`
- `public/data/feed-status.json`

## Verification

Passed:

- `npm run verify:signals-rss`
- `npm run lint`
- `npm run build`
- `npm run verify:feed-normalization`
- `npm run verify:source-health`
- `npm run refresh:news`
- `npm run verify:news-worker`
- `npm run verify:signal-intelligence`
- `npm run verify:api -- http://127.0.0.1:8811`
- `npm run verify:production -- http://127.0.0.1:8811`
- `npm run verify:release`
- `npm run verify:production-contract`
- `npm run verify:goal-readiness`
- `npm run verify:launch -- --soft`

Browser QA through the in-app browser passed against `http://127.0.0.1:8811/?_qa=signals-rss#signals`:

- Homepage title rendered correctly.
- RSS alternate link resolved to `https://herbalisti.com/api/signals.xml`.
- Signals section rendered.
- No console warnings or errors were captured.
- No desktop horizontal overflow was observed at the default viewport.

## Current Goal Status

`npm run verify:goal-readiness` still reports `local-ready-production-pending` with 14 local requirement groups passing and 3 production-pending groups:

- Independent newsfeed deployment: needs production D1, configured bindings, and deployed scheduled Worker.
- Seedance video readiness: needs Kie.ai and media admin secrets, approved generation, reviewed owned video assets.
- Cloudflare hosting: needs Cloudflare Pages, `herbalisti.com` DNS/custom domain, remote migrations, secrets, deployment, and live verification.

No deployment, DNS mutation, paid generation, external resource creation, or secret exposure was performed.
