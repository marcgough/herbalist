# Herbalisti External Launch Actions

Generated: 2026-06-30T15:48:37.235Z

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
- npm run verify:launch -- --soft

### Set Feed Admin Token secret

Required for launch: true

External effect: Stores a secret in Cloudflare for protected feed-refresh controls.

Approval reason: Writes a secret to Cloudflare. The value must be supplied outside chat/logs.

Command:

```bash
npx wrangler secret put FEED_ADMIN_TOKEN --config wrangler.news.toml
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
- Returned D1 database ID from Cloudflare.
- Confirmation that required secrets are available to set directly in Cloudflare without exposing values in chat.
- Approval to deploy Pages and the scheduled Worker.
- Approval to connect herbalisti.com DNS/custom domain.

## Completion Gates

- `npm run verify:live-readiness -- --strict`
- `npm run verify:production -- https://herbalisti.com`
- `npm run verify:goal-readiness -- --strict`
