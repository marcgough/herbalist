# Herbalisti Cloudflare Token Requirements

Generated: 2026-07-01T15:09:22.414Z

Status: ready-for-token-entry

Reads local launch contracts and public Cloudflare documentation citations. It does not read, request, set, store, or print token values; it does not call Cloudflare, deploy, mutate DNS, create resources, or call paid APIs.

## GitHub Secret Names

- `CLOUDFLARE_API_TOKEN`

## GitHub Variable Names

- `CLOUDFLARE_ACCOUNT_ID`

## Recommended Cloudflare API Token

- Name: Herbalisti production deploy
- Scope boundary: Restrict to the Cloudflare account that will host herbalisti.com and the Herbalisti Workers/Pages resources.
- Value handling: Create or edit the token in Cloudflare and enter the token value directly into the GitHub production environment secret named CLOUDFLARE_API_TOKEN. Do not paste the value into chat, docs, Git, screenshots, or logs.

## Required Permissions

### Account: Cloudflare Pages Edit

Covers:
- `npx wrangler pages project list --json`
- `npx wrangler pages project create herbalisti --production-branch main`
- `npx wrangler pages deploy dist --project-name herbalisti`
- `npx wrangler pages secret put KIE_API_KEY --project-name herbalisti`
- `npx wrangler pages secret put MEDIA_ADMIN_TOKEN --project-name herbalisti`

### Account: D1 Edit

Covers:
- `npx wrangler d1 list --json`
- `npx wrangler d1 create herbalisti`
- `npx wrangler d1 migrations apply herbalisti --remote`

### Account: Workers Scripts Edit

Covers:
- `npx wrangler deploy --config wrangler.news.toml`
- `npx wrangler secret put FEED_ADMIN_TOKEN --config wrangler.news.toml`
- `npx wrangler deployments list --name herbalisti-news-refresh --json`
- `npx wrangler secret list --config wrangler.news.toml --format json`

### Account: Account Settings Read

Covers:
- `npx wrangler whoami`
- `Wrangler account discovery in non-interactive CI`

## Optional Permissions

### User: User Details Read

Covers:
- `Wrangler user-token identity discovery`

### User: Memberships Read

Covers:
- `Wrangler user-token account membership discovery`

### Account: Workers R2 Storage Edit

Only needed when the optional reviewed-video R2 bucket is created.

Covers:
- `npx wrangler r2 bucket create herbalisti-media`

## Explicitly Not Required For The Guarded Workflow

- Zone: DNS Edit - The guarded GitHub workflow does not mutate DNS. herbalisti.com custom-domain and DNS work remains an explicit separate launch step.
- Account: Billing Edit - The production workflow does not need billing access.

## Checks

- pass: Guarded workflow reads CLOUDFLARE_API_TOKEN from GitHub production environment secrets.
- pass: Guarded workflow reads CLOUDFLARE_ACCOUNT_ID from a GitHub production environment variable with secret fallback.
- pass: Required Cloudflare token permission packet covers Pages, D1, Workers Scripts, and Account Settings.
- pass: Required Cloudflare token permissions map to commands used by the launch workflow or contract.
- pass: Optional R2 permission remains separate from launch-critical permissions.
- pass: Guarded workflow does not require DNS edit permission.
- pass: Token requirement inputs do not contain obvious secret values.
- pass: Cloudflare token requirement packet links only to Cloudflare documentation sources.
- pass: Deployment runbook and launch packet reference the token requirement gate.
- pass: Cloudflare token requirement verifier is exposed as an npm script.

## Source Evidence

- Cloudflare Pages direct upload with Wrangler: https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/
- Cloudflare Pages REST API token guidance: https://developers.cloudflare.com/pages/configuration/api/
- Cloudflare Workers GitHub Actions authentication: https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/
- Cloudflare Workers build-token permission set: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- Cloudflare D1 REST import token guidance: https://developers.cloudflare.com/d1/tutorials/import-to-d1-with-rest-api/
- Cloudflare API token permissions reference: https://developers.cloudflare.com/fundamentals/api/reference/permissions/
