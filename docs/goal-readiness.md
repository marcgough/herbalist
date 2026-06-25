# Herbalisti Goal Readiness Audit

Date: 2026-06-16

## Purpose

`npm run verify:goal-readiness` checks the current project against the full Herbalisti objective rather than a narrow build pass. It is designed to prevent accidental over-claiming: the script can report that the local implementation is ready while still stating that the full goal is not complete until production resources, DNS, secrets, and live verification exist.

## Current Expected Status

Expected local status before Cloudflare setup:

```text
local-ready-production-pending
```

This means the codebase has the local implementation surfaces in place, but the full project goal is not yet achieved.

The goal should remain active until:

- `herbalisti.com` is connected to Cloudflare Pages.
- The production Cloudflare D1 database is created and bound in both Wrangler configs.
- D1 migrations are applied remotely.
- Required Cloudflare secrets are set.
- The scheduled news Worker is deployed.
- Any Seedance video slots remain disabled unless reviewed owned assets exist.
- `npm run verify:production -- https://herbalisti.com` passes against the live domain.
- `npm run verify:live-readiness -- --strict` passes against the live domain.
- The live `/api/health` endpoint proves the production D1 binding is active and protected Seedance endpoints are configured.

## Requirement Groups

The audit currently checks:

- Brand system
- OpenAI Image Gen 2 launch imagery provenance
- High-tech procedural motion system
- Searchable referenced-books database
- Public-domain herbal database and home chat, including 100+ corpus-scale herbal profiles
- Corpus rights audit for permissively licensed, book-like source ingestion
- Citation/source notes
- Remedy index foundation
- Source-led relationship map with plant-part context
- Public data exports for references, herbal commons, remedies, citation notes, and sources
- Structured discovery metadata and public data catalog
- Public API catalog for endpoint discovery and launch verification
- OpenSearch search discovery for the public search route and JSON search API
- Unified research console
- Independent public-source newsfeed
- Static public news refresh resilience
- Full signal topic coverage across longevity, peptides, gene therapy, gene editing, DNA modification, CRISPR, health as a service, and self-sovereign wellbeing
- Public Signals RSS feed
- Metadata-only signal intelligence
- Source-by-source feed health
- Non-Big-Pharma source governance
- Source independence review metadata
- Seedance video readiness
- Operational health contract
- Production environment contract
- External-action checklist for approval-required launch steps
- Local production cutover simulation for D1/R2 binding rehearsal
- Cloudflare hosting readiness
- Medical and privacy boundaries
- Release verification coverage
- Accessibility launch smoke
- Desktop/mobile browser visual smoke
- Portable objective completion audit

## Commands

Run the normal non-failing audit:

```bash
npm run verify:goal-readiness
```

Run a strict completion audit that fails until the full production goal is complete:

```bash
npm run verify:goal-readiness -- --strict
```

The strict mode should only pass after production setup and live-domain verification are complete.

Generate and verify the portable objective completion audit:

```bash
npm run prepare:completion-audit
npm run verify:completion-audit
```

The completion audit writes `docs/objective-completion-audit.json` and `docs/objective-completion-audit.md`. It converts the current goal-readiness result, launch preflight, production contract, public data exports, media provenance, corpus-rights evidence, and feed heartbeat into a requirement-by-requirement matrix of locally proven, production-pending, or missing evidence.

The production verifier also checks `GET /api/health` so the live site can expose its public launch surfaces, including herbal knowledge, herbal chat, citation notes, Signals RSS, signal intelligence, source policy, public data exports, binding booleans, and medical/account boundaries without exposing secret values.

The herbal commons gate now requires the public export and API to expose the corpus-scale layer: at least 100 herbal records, at least 100 corpus-derived profiles, at least 150 rights-cleared source works, and profile metadata from the local source-linked corpus. This prevents the site from silently falling back to the small seed list.

`npm run verify:discovery-metadata` checks the inline JSON-LD, canonical URL, search action, public data catalog, generated `public/data/discovery-metadata.json`, generated sitemap, robots file, public data/RSS sitemap entries, and dataset counts for the reference-book, herbal commons, remedy, citation-note, and source-registry exports.

`npm run verify:api-catalog` checks generated `public/data/api-catalog.json`, the public/protected endpoint split, the no-secret-values boundary, the UI export link, the sitemap and discovery metadata links, the public health surface, and release/production verifier wiring.

`npm run verify:search-discovery` checks generated `public/opensearch.xml`, the homepage search discovery link, the public search route, the JSON search API route, sitemap/discovery links, the public health surface, and release/production verifier wiring.

`npm run verify:signal-coverage` checks the Signals topic vocabulary, local fallback seed, source allowlist, Big Pharma blocklist, topic filtering, keyword search, RSS categories, signal-intelligence topic clusters, and the current public news export. It uses deterministic local fixtures so the release gate proves the coverage contract without fetching live sources.

`npm run verify:visual-smoke` opens the local Cloudflare Pages build in Edge or Chrome, exercises the home search hero, routed search console, library, Signals, and Source Policy pages at desktop and mobile widths, and fails on console warnings/errors, broken generated imagery, or page-level horizontal overflow.

`npm run verify:accessibility-smoke` opens the local Cloudflare Pages build in Edge or Chrome with reduced motion enabled. It checks launch-critical accessibility basics: landmarks, skip navigation, one `h1` per route, labelled controls, accessible names for interactive elements, image alt attributes, safe external-link relationships, reduced-motion behavior, and basic contrast signals.

`npm run verify:static-news-refresh` checks that static fallback refreshes preserve the last good `public/data/news.json` snapshot when every allowlisted source fails or returns zero usable items. The refresh heartbeat still records the degraded attempt, warnings, attempted item count, and preserved public item count.

`npm run verify:corpus-rights` checks the corpus registry, chunk manifests, normalized text, and public exports against the source inclusion standard: public-domain or permissively licensed book-like works only, from approved no-key public archive lanes. `npm run corpus:rights-audit` refreshes the JSON and Markdown audit handoff.

`docs/production-environment-contract.json` is the canonical machine-readable handoff for Cloudflare resources, required launch secrets, side-effecting commands, guardrails, and live completion gates. It is checked by `npm run verify:production-contract`.

`npm run verify:external-actions` checks the local handoff that separates normal local work from approval-required Cloudflare, DNS, secret, deployment, and paid-generation actions.

`npm run verify:production-cutover` checks the local production cutover simulation. It proves the future D1/R2 binding update can be modeled with fake resource IDs, confirms that Pages Functions and the scheduled Worker use the same D1 target, and verifies that migrations, secrets, deployment, and domain work remain sequenced behind the approval-required external actions.

`npm run verify:live-readiness` is the read-only DNS/HTTPS/custom-domain probe. It reports `not-ready` without failing before cutover, and `npm run verify:live-readiness -- --strict` is a live completion gate after Cloudflare Pages, DNS, production D1, and required protected endpoint secrets are active.
