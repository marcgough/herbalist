# Herbalisti Production Secret Setup

Generated: 2026-06-30T19:43:59.909Z

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
gh secret set CLOUDFLARE_D1_DATABASE_ID --env production --repo marcgough/herbalist
gh secret set FEED_ADMIN_TOKEN --env production --repo marcgough/herbalist
gh secret set KIE_API_KEY --env production --repo marcgough/herbalist
gh secret set MEDIA_ADMIN_TOKEN --env production --repo marcgough/herbalist
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
- pass: Production contract records every guarded workflow secret name.
- pass: Required Cloudflare runtime secrets have command templates without values.
- pass: GitHub production readiness verifier is available for secret-name checks.
- pass: External action packet names the required production workflow secrets.

## Operator Sequence

### create-cloudflare-d1-first

Side effect: creates-cloudflare-resource

Create the Cloudflare D1 database before setting CLOUDFLARE_D1_DATABASE_ID, because the returned production database ID is one of the required GitHub production secrets.

### set-github-production-environment-secrets

Side effect: writes-github-secrets

```bash
gh secret set CLOUDFLARE_API_TOKEN --env production --repo marcgough/herbalist
gh secret set CLOUDFLARE_ACCOUNT_ID --env production --repo marcgough/herbalist
gh secret set CLOUDFLARE_D1_DATABASE_ID --env production --repo marcgough/herbalist
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
