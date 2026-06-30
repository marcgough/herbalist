# Herbalisti Production Secret Setup

Generated: 2026-06-30T20:11:09.708Z

Status: ready-for-secret-entry

Reads local launch contracts and workflow files, then optionally writes docs/production-secret-setup files. It does not read, request, set, store, or print secret values; it does not call GitHub or Cloudflare APIs, deploy, mutate DNS, create resources, or call paid APIs.

## Guardrails

- Do not paste secret values into chat, docs, Git, screenshots, or command logs.
- Prefer GitHub `production` environment secrets for the guarded production deploy workflow.
- Enter values directly in GitHub or Cloudflare interfaces, or pipe from a local secret manager.
- Setting a Kie.ai key does not approve paid generation; generated video remains separately approval-gated.

## GitHub Production Environment Secrets

Repository: `marcgough/herbalist`

Environment: `production`

```bash
gh secret set CLOUDFLARE_API_TOKEN --env production --repo marcgough/herbalist
gh secret set CLOUDFLARE_ACCOUNT_ID --env production --repo marcgough/herbalist
gh secret set FEED_ADMIN_TOKEN --env production --repo marcgough/herbalist
gh secret set KIE_API_KEY --env production --repo marcgough/herbalist
gh secret set MEDIA_ADMIN_TOKEN --env production --repo marcgough/herbalist
```

## Workflow-Derived Values

- `CLOUDFLARE_D1_DATABASE_ID`: Resolved inside the guarded production workflow and written to the runner environment; it is not required as a GitHub secret.

```bash
npm run resolve:production-d1 -- --create-if-missing --github-env "$GITHUB_ENV"
```

Verify secret-name readiness:

```bash
npm run verify:github-production-readiness
npm run verify:github-production-readiness -- --strict
```

## Cloudflare Runtime Secret Fallback

When the guarded GitHub production deploy workflow is used, it sets required Cloudflare runtime secrets from GitHub secrets. Direct Wrangler commands are the manual fallback path.

```bash
npx wrangler secret put FEED_ADMIN_TOKEN --config wrangler.news.toml
npx wrangler pages secret put KIE_API_KEY --project-name herbalisti
npx wrangler pages secret put MEDIA_ADMIN_TOKEN --project-name herbalisti
npx wrangler pages secret put OPENAI_API_KEY --project-name herbalisti
```

## Checks

- pass: .github/workflows/production-deploy.yml exists.
- pass: Production deploy workflow references every required workflow secret name.
- pass: Production deploy workflow resolves the D1 database ID during the guarded run instead of requiring it as a GitHub secret.
- pass: Production contract records every guarded workflow secret name.
- pass: Required Cloudflare runtime secrets have command templates without values.
- pass: GitHub production readiness verifier is available for secret-name checks.
- pass: External action packet names the required production workflow secrets.

## Operator Sequence

### resolve-cloudflare-d1-during-guarded-workflow

Side effect: creates-cloudflare-resource

The guarded production workflow resolves the Cloudflare D1 database named herbalisti and creates it only if it is missing during the approved run.

### set-github-production-environment-secrets

Side effect: writes-github-secrets

```bash
gh secret set CLOUDFLARE_API_TOKEN --env production --repo marcgough/herbalist
gh secret set CLOUDFLARE_ACCOUNT_ID --env production --repo marcgough/herbalist
gh secret set FEED_ADMIN_TOKEN --env production --repo marcgough/herbalist
gh secret set KIE_API_KEY --env production --repo marcgough/herbalist
gh secret set MEDIA_ADMIN_TOKEN --env production --repo marcgough/herbalist
```

### verify-secret-name-readiness

Side effect: none

```bash
npm run verify:github-production-readiness
npm run verify:github-production-readiness -- --strict
```

### manual-cloudflare-runtime-secret-fallback

Side effect: writes-cloudflare-secrets

Use only if not using the guarded GitHub production deploy workflow. Values must be entered interactively or piped from a local secret manager, not pasted into chat, docs, or Git.

```bash
npx wrangler secret put FEED_ADMIN_TOKEN --config wrangler.news.toml
npx wrangler pages secret put KIE_API_KEY --project-name herbalisti
npx wrangler pages secret put MEDIA_ADMIN_TOKEN --project-name herbalisti
npx wrangler pages secret put OPENAI_API_KEY --project-name herbalisti
```
