# Herbalisti Production Launch Packet

Generated: 2026-07-02T03:41:29.838Z

Status: pending-production-setup

This command only reads local files and environment-variable presence. It does not deploy, upload, create resources, call paid APIs, or print secret values.

## Project

- Domain: herbalisti.com
- Cloudflare Pages project: herbalisti
- D1 database: herbalisti
- Optional R2 bucket: herbalisti-media
- Production environment contract: docs/production-environment-contract.json

## Local State

- Pages D1 binding active: false
- News Worker D1 binding active: false
- R2 media binding active: false
- Visible secret names: none
- Visible variable names: none

## Phases

### Local release proof

Status: ready-to-run

Prove the current code, assets, API shape, data migrations, governance, media, and production-shape smoke locally.

Commands:

```bash
npm install
npm run verify:release
```

### Create Cloudflare resources

Status: pending-external

Create the production D1 database and optional media bucket before local Wrangler config is activated.

Commands:

```bash
npx wrangler d1 create herbalisti
npx wrangler r2 bucket create herbalisti-media
```

Blockers:
- A real Cloudflare D1 database ID is required.

Notes:
- R2 is optional until approved Seedance videos are ready to store as Herbalisti-owned assets.

### Activate local Wrangler bindings

Status: pending-d1-id

Write the real D1 binding into both Pages and scheduled Worker Wrangler configs.

Commands:

```bash
npm run configure:cloudflare -- --d1 <database_id> --apply
npm run configure:cloudflare -- --d1 <database_id> --r2 herbalisti-media --apply
npm run verify:launch -- --soft
npm run verify:github-actions
npm run verify:production-deploy-workflow
npm run verify:production-deploy-evidence
npm run verify:production-deploy-evidence-artifact
npm run verify:production-deploy-evidence-artifact-content
npm run verify:github-release-evidence-content
npm run verify:production-deploy-dry-run
npm run verify:production-d1-resolver
npm run verify:github-production-readiness
npm run verify:github-release-evidence
npm run verify:production-state-current
npm run verify:production-dispatch-preflight -- --strict
npm run verify:cloudflare-production-state
npm run verify:cloudflare-token-requirements
npm run verify:d1-manifest
npm run verify:dns-cutover
npm run verify:production-secrets
npm run verify:github-production-credentials
npm run verify:github-generated-secrets
npm run prepare:production-state
npm run verify:production-state
npm run prepare:production-provisioning
npm run verify:production-provisioning
npm run verify:production-operator-brief
npm run verify:static-news-refresh
npm run verify:signal-coverage
npm run verify:signal-intelligence
npm run verify:signals-rss
npm run verify:knowledge-graph
npm run verify:citation-notes
npm run verify:source-health
npm run verify:corpus-rights
npm run verify:corpus-memory
npm run verify:data-exports
npm run verify:discovery-metadata
npm run verify:api-catalog
npm run verify:search-discovery
npm run verify:australia-lane
npm run verify:production-cutover
npm run verify:external-actions
npm run prepare:completion-audit
npm run verify:completion-audit
npm run verify:visual-smoke
npm run verify:accessibility-smoke
npm run verify:goal-readiness
```

Blockers:
- wrangler.toml and wrangler.news.toml still use template D1 bindings.

### Guarded GitHub production workflow

Status: prepared

Provide a single manual GitHub Actions path that can create/confirm the Pages project, resolve or create the D1 database by name, configure runner-local D1 bindings, apply migrations, set Cloudflare secrets from GitHub secrets, deploy Pages and the scheduled Worker, then run live verification.

Commands:

```bash
npm run verify:production-deploy-workflow
npm run verify:production-deploy-evidence
npm run verify:production-deploy-evidence-artifact
npm run verify:production-deploy-evidence-artifact-content
npm run verify:github-release-evidence-content
npm run verify:production-deploy-dry-run
npm run verify:production-d1-resolver
npm run verify:production-feed-seed
npm run verify:github-production-dispatch
npm run verify:github-production-dispatch-content
npm run verify:production-dispatch-preflight -- --strict
npm run verify:production-operator-brief
npm run verify:production-secrets
npm run verify:github-production-credentials
npm run verify:github-generated-secrets
npm run verify:cloudflare-token-requirements
npm run verify:github-production-readiness -- --strict
npm run verify:production-state-current
npm run resolve:production-d1 -- --create-if-missing --github-env "$GITHUB_ENV"
GitHub Actions: Herbalisti Production Deploy workflow_dispatch with confirm=deploy-herbalisti-production; if skip_live_verification=true, also set skip_live_verification_confirm=skip-herbalisti-live-verification
```

Notes:
- The workflow is manual-only and requires the GitHub production environment.
- The workflow still requires exact GitHub CI/manual release evidence for the dispatch commit.
- The production dispatch preflight must pass for the exact commit before any Cloudflare-facing workflow step runs.
- Live verification can be temporarily skipped only while DNS is being connected and only with skip_live_verification_confirm=skip-herbalisti-live-verification; final completion still requires strict live verification.

### Apply production D1 migrations

Status: blocked-by-bindings

Create the production tables and seed launch data for references, remedies, plant parts, sources, news, media jobs, and feed refresh runs.

Commands:

```bash
npm run verify:d1-manifest
npx wrangler d1 migrations apply herbalisti --remote
```

Blockers:
- Activate the D1 binding before remote migrations.

### Set production secrets

Status: pending-required-feed-secret

Protect required feed-refresh controls while keeping optional Seedance media secrets separate from the launch blocker path.

Commands:

```bash
npm run verify:github-production-credentials
npm run set:github-production-credentials -- --confirm set-herbalisti-production-credentials
npm run verify:github-generated-secrets
npm run set:github-generated-secrets -- --confirm set-herbalisti-generated-secrets
npx wrangler secret put FEED_ADMIN_TOKEN --config wrangler.news.toml
npx wrangler pages secret put FEED_ADMIN_TOKEN --project-name herbalisti
npx wrangler pages secret put KIE_API_KEY --project-name herbalisti
npx wrangler pages secret put MEDIA_ADMIN_TOKEN --project-name herbalisti
npx wrangler pages secret put OPENAI_API_KEY --project-name herbalisti
```

Blockers:
- FEED_ADMIN_TOKEN is not visible locally or confirmed in Cloudflare.

Notes:
- The GitHub production credential helper reads CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID from the local environment and sends them to GitHub without printing values.
- The guarded GitHub production workflow can generate FEED_ADMIN_TOKEN and MEDIA_ADMIN_TOKEN as masked runtime values.
- KIE_API_KEY and MEDIA_ADMIN_TOKEN are optional until approved Seedance media generation is enabled.
- OPENAI_API_KEY is optional unless repeatable server-side image generation is added.

### Deploy Pages and scheduled Worker

Status: blocked-by-bindings

Publish the site and scheduled news refresher after local verification, bindings, migrations, and secrets are ready.

Commands:

```bash
npm run deploy:cloudflare
npm run deploy:news-worker
```

Blockers:
- D1 bindings are not active yet.

### Connect herbalisti.com and verify live production

Status: pending-external

Connect the custom domain, verify DNS, and prove the live site satisfies the production contract.

Commands:

```bash
npm run verify:dns-cutover
npm run verify:production-feed-seed
npm run seed:production-feed -- --base-url https://herbalisti.com --confirm seed-herbalisti-feed
npm run verify:production-deploy-evidence-artifact -- --strict --run-id <production_deploy_run_id>
npm run verify:live-readiness -- --strict
npm run verify:production -- https://herbalisti.com
npm run verify:goal-readiness -- --strict
```

Blockers:
- Cloudflare Pages custom domain and DNS must be active before the canonical feed seed and live verification can pass.

## Next Command

```bash
npm run verify:launch -- --soft
```
