# Herbalisti External Launch Actions

Generated: 2026-06-30T23:25:49.038Z

Status: needs-approval-and-production-setup

This artifact is generated from local files and environment-variable presence only. It does not deploy, create resources, mutate DNS, call paid APIs, or print secret values.

## Guardrails

- Local filesystem, build, test, verification, and Dropbox checkpoint work can continue without another approval.
- Live deployment, DNS changes, Cloudflare resource creation, secrets, and paid generation require fresh approval.
- Do not paste secret values into chat, docs, Git, or logs.

## Local Actions

### Run full local release proof

Reprove build, data exports, governance, local D1, Worker, API, and production-shaped smoke before any public action.

```bash
npm run verify:release
```

### Generate local launch packet

Print the current cutover state without deploying, uploading, creating resources, or printing secret values.

```bash
npm run prepare:launch -- --markdown
```

### Run local production cutover simulation

Rehearse the D1/R2 binding activation and launch sequencing locally with fake resource IDs, without writing Wrangler config files or touching Cloudflare.

```bash
npm run simulate:production-cutover
```

Notes:
- Use npm run prepare:production-cutover to refresh the human-readable simulation artifact.

### Regenerate this external action checklist

Refresh the machine-readable and Markdown handoff artifacts from the production contract.

```bash
npm run prepare:external-actions
```

### Generate production provisioning readiness packet

Refresh the machine-readable and Markdown packet that shows the current local readiness state, next approved production action, and exact operator sequence.

```bash
npm run prepare:production-provisioning
```

### Verify production feed seed command

Confirm the protected production feed seed command is confirmation-gated, dry-run safe, and wired into the production contract without calling the network.

```bash
npm run verify:production-feed-seed
```

### Check GitHub production environment and secret-name readiness

Read GitHub workflow, environment, secret-name, and release evidence metadata before the guarded production deploy workflow is dispatched.

```bash
npm run verify:github-production-readiness
```

Notes:
- Use npm run verify:github-production-readiness -- --strict as the final GitHub dispatch readiness gate.

### Check read-only Cloudflare production state

Read Wrangler authentication and remote Cloudflare resource/secret-name state before creating D1, deploying, or routing herbalisti.com.

```bash
npm run verify:cloudflare-production-state
```

Notes:
- Use npm run verify:cloudflare-production-state -- --strict after Cloudflare resources, secrets, and deployments are expected to exist.

### Generate Cloudflare API token requirement packet

Refresh the value-free token-permission packet for the CLOUDFLARE_API_TOKEN used by the guarded production workflow.

```bash
npm run prepare:cloudflare-token-requirements
```

Notes:
- Use npm run verify:cloudflare-token-requirements before setting the GitHub production CLOUDFLARE_API_TOKEN secret.
- The packet names permissions and documentation sources only; it must never contain the token value.

### Generate D1 production migration manifest

Refresh the ordered SQL migration fingerprint packet before remote D1 migrations are approved or applied.

```bash
npm run prepare:d1-manifest
```

Notes:
- Use npm run verify:d1-manifest before any remote D1 migration command.

### Generate DNS/custom-domain cutover plan

Refresh the read-only DNS snapshot and custom-domain operator sequence before herbalisti.com DNS or Cloudflare Pages domain changes are approved.

```bash
npm run prepare:dns-cutover
```

Notes:
- Use npm run verify:dns-cutover before DNS/custom-domain work and again after nameserver changes propagate.

### Generate production secret setup packet

Refresh the GitHub production environment and Cloudflare runtime secret-name setup packet without reading, storing, or printing secret values.

```bash
npm run prepare:production-secrets
```

Notes:
- Use npm run verify:production-secrets before setting GitHub or Cloudflare secret values.

### Activate local Wrangler D1 bindings after Cloudflare returns the database ID

Write the returned D1 database ID into local Wrangler config after the external D1 resource exists.

```bash
npm run configure:cloudflare -- --d1 <database_id> --apply
```

### Optionally activate local R2 media binding after the bucket exists

Write the optional media bucket binding into local Wrangler config when approved Seedance assets need owned storage.

```bash
npm run configure:cloudflare -- --d1 <database_id> --r2 herbalisti-media --apply
```

Notes:
- R2 is optional until reviewed Seedance video outputs exist.

## Approval Required

### Create Cloudflare D1 database

Required for launch: true

External effect: Creates a Cloudflare D1 database named herbalisti.

Approval reason: Creates a production cloud resource in the Cloudflare account.

Command:

```bash
npx wrangler d1 create herbalisti
```

Verification:
- npm run configure:cloudflare -- --d1 <database_id> --apply
- npm run verify:launch -- --soft

### Optionally create Cloudflare R2 media bucket

Required for launch: false

External effect: Creates a Cloudflare R2 bucket for reviewed owned Seedance video assets.

Approval reason: Creates an optional production cloud storage resource.

Command:

```bash
npx wrangler r2 bucket create herbalisti-media
```

Verification:
- npm run configure:cloudflare -- --d1 <database_id> --r2 herbalisti-media --apply

Notes:
- Skip until approved generated video assets need durable owned storage.

### Apply production D1 migrations

Required for launch: true

External effect: Writes production database schema and seed data to Cloudflare D1.

Approval reason: Mutates the production data store.

Command:

```bash
npx wrangler d1 migrations apply herbalisti --remote
```

After: create-d1-database, activate-d1-bindings-local

Verification:
- npm run verify:d1-manifest
- npm run verify:launch -- --soft

### Set Feed Admin Token secret

Required for launch: true

External effect: Stores a secret in Cloudflare for protected feed-refresh controls.

Approval reason: Writes a secret to Cloudflare. The value must be supplied outside chat/logs.

Command:

```bash
npx wrangler secret put FEED_ADMIN_TOKEN --config wrangler.news.toml
npx wrangler pages secret put FEED_ADMIN_TOKEN --project-name herbalisti
```

Secret names: FEED_ADMIN_TOKEN

Notes:
- Do not paste secret values into chat, docs, Git, or command logs.

### Set Kie.ai API key secret

Required for launch: true

External effect: Stores the Kie.ai API key in Cloudflare Pages for protected Seedance jobs.

Approval reason: Writes a secret and can later enable paid media generation if separately approved.

Command:

```bash
npx wrangler pages secret put KIE_API_KEY --project-name herbalisti
```

Secret names: KIE_API_KEY

Notes:
- Setting the secret does not generate video. Paid generation remains a separate approval step.

### Set Media Admin Token secret

Required for launch: true

External effect: Stores a secret in Cloudflare Pages for protected media job create/status endpoints.

Approval reason: Writes a secret to Cloudflare. The value must be supplied outside chat/logs.

Command:

```bash
npx wrangler pages secret put MEDIA_ADMIN_TOKEN --project-name herbalisti
```

Secret names: MEDIA_ADMIN_TOKEN

### Optionally set OpenAI API key secret

Required for launch: false

External effect: Stores an OpenAI API key in Cloudflare Pages for optional hosted synthesis or repeatable server-side image generation.

Approval reason: Writes a secret and can enable paid API usage if a later feature calls it.

Command:

```bash
npx wrangler pages secret put OPENAI_API_KEY --project-name herbalisti
```

Secret names: OPENAI_API_KEY

Notes:
- Not required for launch while retrieval fallback is active.

### Deploy Cloudflare Pages site

Required for launch: true

External effect: Publishes the Herbalisti website bundle to Cloudflare Pages.

Approval reason: Public deployment of the website.

Command:

```bash
npm run deploy:cloudflare
```

After: apply-remote-d1-migrations, set-feed-admin-token, set-kie-api-key, set-media-admin-token

Verification:
- npm run verify:live-readiness -- --strict
- npm run verify:production -- https://herbalisti.com

### Deploy scheduled news Worker

Required for launch: true

External effect: Publishes the scheduled feed-refresh Worker to Cloudflare.

Approval reason: Public deployment of scheduled automation.

Command:

```bash
npm run deploy:news-worker
```

After: apply-remote-d1-migrations, set-feed-admin-token

Verification:
- npm run verify:source-health
- npm run verify:production -- https://herbalisti.com

### Seed live Signals feed

Required for launch: true

External effect: Triggers the protected production feed-refresh endpoint and writes a feed refresh run into production D1.

Approval reason: Writes production feed-refresh data and uses the feed admin secret.

Command:

```bash
npm run seed:production-feed -- --base-url https://herbalisti.com --confirm seed-herbalisti-feed
```

After: deploy-cloudflare-pages, deploy-news-worker, connect-domain

Secret names: FEED_ADMIN_TOKEN

Verification:
- npm run verify:production-feed-seed
- npm run verify:live-readiness -- --strict
- npm run verify:production -- https://herbalisti.com

Notes:
- Use this after DNS/custom-domain routing is active when the guarded deploy workflow was run with live verification skipped.
- The command prints sanitized feed-refresh metadata only and must not print the token value.

### Run guarded GitHub production deploy workflow

Required for launch: false

External effect: Runs the manual GitHub production workflow that can create or confirm the Pages project, resolve or create the D1 database by name, configure runner-local D1 bindings, apply migrations, set Cloudflare secrets from GitHub secrets, deploy Pages and the scheduled Worker, and run live verification.

Approval reason: Public production deployment automation with Cloudflare resource, secret, D1, Worker, and live-site effects.

Command:

```bash
GitHub Actions: Herbalisti Production Deploy workflow_dispatch with confirm=deploy-herbalisti-production
```

Secret names: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, FEED_ADMIN_TOKEN, KIE_API_KEY, MEDIA_ADMIN_TOKEN

Verification:
- npm run verify:production-deploy-workflow
- npm run verify:github-release-evidence
- npm run verify:d1-manifest
- npm run verify:production-secrets
- npm run verify:cloudflare-token-requirements
- npm run verify:live-readiness -- --strict
- npm run verify:production -- https://herbalisti.com
- npm run verify:goal-readiness -- --strict

Notes:
- Requires the exact workflow input confirm=deploy-herbalisti-production.
- Use the GitHub production environment approval controls before dispatch.
- Run npm run verify:production-secrets, npm run verify:cloudflare-token-requirements, and npm run verify:github-production-readiness -- --strict before dispatch.
- Do not use skip_live_verification for final completion evidence.

### Connect herbalisti.com custom domain and DNS

Required for launch: true

External effect: Changes public DNS/custom-domain routing for herbalisti.com.

Approval reason: Mutates public DNS or Cloudflare custom-domain configuration.

Command:

```bash
Cloudflare dashboard: connect herbalisti.com to the herbalisti Pages project
```

After: deploy-cloudflare-pages

Verification:
- npm run verify:dns-cutover
- npm run verify:live-readiness -- --strict
- npm run verify:production -- https://herbalisti.com
- npm run verify:goal-readiness -- --strict

### Optionally generate Seedance 2.0 video through Kie.ai

Required for launch: false

External effect: Calls a paid third-party media-generation provider.

Approval reason: Can spend credits and create external media-generation jobs.

Command:

```bash
POST /api/media/seedance with approved prompt and MEDIA_ADMIN_TOKEN
```

After: set-kie-api-key, set-media-admin-token

Verification:
- Review generated video manually.
- Store approved output as an owned asset before enabling manifest slots.

## Required Inputs

- Approval to create Cloudflare resources.
- Authenticated Cloudflare/Wrangler session or deployment operator access.
- Returned D1 database ID from Cloudflare only if using the manual Cloudflare path instead of the guarded GitHub production workflow.
- Confirmation that required secrets are available to set directly in Cloudflare without exposing values in chat.
- Approval to deploy Pages and the scheduled Worker.
- Approval to connect herbalisti.com DNS/custom domain.

## Completion Gates

- `npm run verify:live-readiness -- --strict`
- `npm run verify:production -- https://herbalisti.com`
- `npm run verify:goal-readiness -- --strict`
