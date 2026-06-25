# Herbalisti Checkpoint: Visible Signals RSS Link

Date: 2026-06-16

## Summary

Added a visible `Signals RSS` subscription control to the public Signals section. The control points to `/api/signals.xml` and automatically carries the active topic, source, and signal-search filters into the RSS URL.

Example verified filtered URL:

```text
/api/signals.xml?topic=CRISPR&source=Crossref&query=peptide
```

## Files Updated

- `src/App.tsx`
- `src/App.css`
- `scripts/verify-signals-rss.mjs`
- `scripts/verify-goal-readiness.mjs`
- `docs/source-verification.md`
- `docs/herbalisti-project-plan.md`

## Verification

Passed:

- `npm run verify:signals-rss`
- `npm run lint`
- `npm run build`
- `npm run verify:goal-readiness`

Browser QA through local Cloudflare Pages at `http://127.0.0.1:8812`:

- Desktop filtered Signals URL rendered `Signals RSS`.
- Desktop link href was `/api/signals.xml?topic=CRISPR&source=Crossref&query=peptide`.
- Mobile 390 x 844 viewport kept the same filtered href.
- No desktop or mobile console warnings/errors were captured.
- Mobile viewport had no horizontal overflow.

## Current Goal Status

The build remains `local-ready-production-pending`. This slice improved the public usability of the self-updating Signals feed but did not perform deployment, DNS mutation, paid generation, external resource creation, or secret exposure.
