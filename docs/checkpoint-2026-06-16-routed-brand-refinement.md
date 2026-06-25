# Checkpoint: Routed Brand Refinement

Date: 2026-06-16

## Summary

Refined the public Herbalisti experience after design review.

The visible brand now uses a Titanium flowing botanical wordmark with the tagline `Self-sovereign health intelligence`. The previous public leaf/orbit icon was removed from the wordmark and replaced in square contexts with a Titanium typographic monogram. The Brand System and Launch Path content were removed from the visitor-facing app and kept as internal project reference only.

The site is now split into routed pages for every top navigation item:

- `/search`
- `/library`
- `/notes`
- `/remedies`
- `/map`
- `/signals`
- `/source-policy`
- `/governance`

Direct routes are supported through the Cloudflare Pages fallback in `public/_redirects`, and `public/sitemap.xml` now includes the routed pages.

## Public Copy Changes

- Removed visitor-facing Brand System content.
- Removed visitor-facing Launch Path/hosting/API-key copy.
- Removed copy that referenced the starting plan or brief from public UI and public data records.
- Replaced repeated public "calm" phrasing in remedy records with more precise botanical/research language.
- Updated RSS channel link from `https://herbalisti.com/#signals` to `https://herbalisti.com/signals`.

## Files Updated

- `src/App.tsx`
- `src/App.css`
- `public/assets/herbalisti-logo.svg`
- `public/assets/herbalisti-mark.svg`
- `public/favicon.svg`
- `public/_redirects`
- `public/sitemap.xml`
- `public/data/*.json`
- `public/data/media-provenance.json`
- `src/data/books.ts`
- `src/data/citationNotes.ts`
- `src/data/remedies.ts`
- `functions/_lib/books.js`
- `functions/_lib/citation-notes.js`
- `functions/_lib/remedies.js`
- `functions/_lib/search.js`
- `functions/_lib/signals-rss.js`
- `migrations/0002_seed_reference_data.sql`
- `migrations/0003_reference_book_metadata.sql`
- `migrations/0006_seed_remedies.sql`
- `migrations/0008_seed_citation_notes.sql`
- `scripts/verify-brand.mjs`
- `scripts/verify-governance.mjs`
- `scripts/verify-signals-rss.mjs`
- `scripts/verify-production.mjs`
- `scripts/verify-goal-readiness.mjs`
- `docs/brand-system.md`

## Verification

Passed:

- `npm run export:data`
- `npm run lint`
- `npm run build`
- `npm run verify:brand`
- `npm run verify:governance`
- `npm run verify:signals-rss`
- `npm run verify:data-exports`
- `npm run verify:motion-system`
- `npm run verify:source-governance`
- `npm run verify:knowledge-graph`
- `npm run verify:goal-readiness`
- `node scripts/verify-api.mjs http://127.0.0.1:8813`
- `node scripts/verify-production.mjs http://127.0.0.1:8813`

Browser review:

- Home page loads at `http://127.0.0.1:8813/`.
- All top nav items load as direct routed pages.
- Active navigation state works.
- Removed Brand System, Launch Path, starting-plan, and brief copy are not visible in the checked routes.
- Mobile routed pages clear the taller mobile header and avoid horizontal body overflow.

## Remaining Production Items

No paid API, DNS, deployment, Cloudflare resource creation, or Seedance generation was performed.

Remaining production setup is unchanged:

- Cloudflare Pages project and `herbalisti.com` custom domain.
- Production D1 database and matching Pages/Worker bindings.
- Required Cloudflare secrets.
- Scheduled news Worker deployment.
- Optional Kie.ai Seedance generation only after key, credits, owned storage, and review workflow are ready.
