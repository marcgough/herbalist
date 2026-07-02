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
- The live `/api/health` endpoint proves the production D1 binding is active, protected feed refresh is configured, and a fresh completed feed refresh has items.

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
- GitHub Actions CI and manual repository release gate
- Guarded GitHub production deploy workflow
- GitHub production environment and credential-name readiness
- Consolidated production state snapshot
- Current-commit production state evidence
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

`npm run verify:github-actions` checks that the GitHub repository has a push/PR CI workflow for repository-safe gates, a manual release workflow for the heavier browser and Cloudflare-runtime checks, read-only permissions, no deployment/resource/secret mutation commands, reproducible Wrangler tooling, explicit public corpus-export mode on GitHub runners, and launch-contract wiring. The full corpus artifact audit remains a local release requirement because the multi-GB corpus layer is intentionally excluded from GitHub.

`npm run verify:production-deploy-workflow` checks the guarded production deploy workflow without running it. The workflow is manual-only, confirmation-gated, scoped to the GitHub `production` environment, exact-release-evidence-gated, and wired to Cloudflare Pages, D1 migrations, Worker deployment, runtime secrets, and live verification using the required GitHub production credentials without literal secret values in the repo. `CLOUDFLARE_API_TOKEN` is a GitHub production secret; `CLOUDFLARE_ACCOUNT_ID` is a GitHub production variable with secret fallback support. If DNS transition requires `skip_live_verification=true`, the workflow also requires `skip_live_verification_confirm=skip-herbalisti-live-verification`; final completion still requires strict live verification.

`npm run verify:github-production-dispatch` checks the no-secret dispatch packet for the guarded GitHub production workflow. It records the strict preflight, exact workflow inputs, required production credential names, and DNS-transition skip boundary without dispatching the workflow or touching production.

`npm run verify:github-production-readiness` reads GitHub workflow, environment, secret-name, variable-name, and release-run metadata without creating environments, setting secrets or variables, dispatching workflows, or printing secret values. Strict mode is the final dispatch-readiness gate after the `production` environment and required GitHub production credentials exist.

`npm run verify:github-release-evidence` checks public GitHub Actions metadata for fresh successful CI and manual release-gate runs on the intended launch commit, verifies the uploaded visual-smoke artifact metadata, then downloads only the selected no-secret structured release-evidence artifact into memory and inspects its contents. The structured release packet must prove public Signals item count, topic coverage, source-lane coverage, source-health counts, warning count, source-preservation state, source policy, and Big Pharma blocklist proof.

`npm run verify:github-release-evidence-content` is the local fixture gate for that same content-inspection path. It creates synthetic release-evidence artifacts and proves the shared rules reject missing Signals topics, Big Pharma blocklist evidence, mismatched commits, secret-looking text, and premature production-complete state.

`npm run verify:production-deploy-evidence-artifact` checks GitHub Actions metadata for the guarded production deploy run and its `herbalisti-production-deploy-evidence` artifact. Before production dispatch it reports pending without touching production; after dispatch, strict mode with `--run-id <production_deploy_run_id>` verifies the artifact exists for the exact run and inspects the non-secret artifact contents. In final-completion mode, that content inspection must prove captured feed-seed evidence for the protected live Signals refresh; in DNS-transition mode, it must prove the explicit live-verification skip boundary.

`npm run verify:production-state-current` regenerates the production state in memory, checks that the GitHub release evidence matches the current git commit, and performs read-only public live-domain readiness and production-smoke probes. It is intended for the post-CI, post-manual-release moment before a guarded production deployment, not as a pre-push local development gate.

`npm run prepare:production-provisioning` and `npm run verify:production-provisioning` generate and check the local production provisioning packet: current Wrangler binding state, hidden required secret names, next approved external action, and exact operator sequence from D1 creation through live verification.

`npm run prepare:production-state` and `npm run verify:production-state` generate and check the consolidated production state snapshot. It records the current completion audit, GitHub production readiness, release evidence, read-only Cloudflare state, public DNS status, live-domain readiness, and remaining blockers without setting secrets, deploying, mutating DNS, creating resources, calling paid APIs, or printing secret values.

`npm run verify:external-actions` checks the local handoff that separates normal local work from approval-required Cloudflare, DNS, secret, deployment, and paid-generation actions.

`npm run verify:production-cutover` checks the local production cutover simulation. It proves the future D1/R2 binding update can be modeled with fake resource IDs, confirms that Pages Functions and the scheduled Worker use the same D1 target, and verifies that migrations, secrets, deployment, and domain work remain sequenced behind the approval-required external actions.

`npm run verify:live-readiness` is the read-only DNS/HTTPS/custom-domain probe. It reports `not-ready` without failing before cutover, and `npm run verify:live-readiness -- --strict` is a live completion gate after Cloudflare Pages, DNS, production D1, protected feed refresh, and a fresh completed feed refresh are active. Seedance media endpoints remain optional until approved generation is enabled.
