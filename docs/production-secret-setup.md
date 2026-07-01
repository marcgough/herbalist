# Herbalisti Production Secret Setup

Generated: 2026-07-01T05:17:00.055Z

Status: ready-for-secret-entry

Reads local launch contracts and workflow files, then optionally writes docs/production-secret-setup files. It does not read, request, set, store, or print secret values; it does not call GitHub or Cloudflare APIs, deploy, mutate DNS, create resources, or call paid APIs.

## Guardrails

- Do not paste secret values into chat, docs, Git, screenshots, or command logs.
- Prefer GitHub `production` environment secrets for externally issued deployment credentials.
- Enter externally issued values directly in GitHub or Cloudflare interfaces, or pipe from a local secret manager.
- The guarded production workflow generates FEED_ADMIN_TOKEN and MEDIA_ADMIN_TOKEN as masked runtime values.
- KIE_API_KEY is optional for launch; setting it does not approve paid generation, and generated video remains separately approval-gated.

## GitHub Production Environment Secrets

Repository: `marcgough/herbalist`

Environment: `production`

Required externally issued values:

```bash
gh secret set CLOUDFLARE_API_TOKEN --env production --repo marcgough/herbalist
gh secret set CLOUDFLARE_ACCOUNT_ID --env production --repo marcgough/herbalist
```

Optional paid-media value:

```bash
gh secret set KIE_API_KEY --env production --repo marcgough/herbalist
```

Generated runtime admin tokens:

- FEED_ADMIN_TOKEN, MEDIA_ADMIN_TOKEN

Optional manual path. The guarded deployment workflow can generate FEED_ADMIN_TOKEN and MEDIA_ADMIN_TOKEN as masked runtime values without stored GitHub secrets.

Optional manual GitHub helper for generated admin tokens:

```bash
npm run verify:github-generated-secrets
npm run set:github-generated-secrets -- --confirm set-herbalisti-generated-secrets
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
npx wrangler pages secret put FEED_ADMIN_TOKEN --project-name herbalisti
npx wrangler pages secret put KIE_API_KEY --project-name herbalisti
npx wrangler pages secret put MEDIA_ADMIN_TOKEN --project-name herbalisti
npx wrangler pages secret put OPENAI_API_KEY --project-name herbalisti
```

## Cloudflare API Token Permissions

CLOUDFLARE_API_TOKEN is a GitHub production secret name; its Cloudflare permissions are documented separately so values and permission metadata do not get mixed.

- Status: ready-for-token-entry
- Documentation: `docs/cloudflare-token-requirements.md`
- Verification: `npm run verify:cloudflare-token-requirements`

## Checks

- pass: .github/workflows/production-deploy.yml exists.
- pass: Production deploy workflow references required external credentials, optional Kie credentials, and generated runtime admin token names.
- pass: Production deploy workflow resolves the D1 database ID during the guarded run instead of requiring it as a GitHub secret.
- pass: Production contract records required, optional, and generated runtime secret names.
- pass: Required Cloudflare runtime secrets have command templates without values.
- pass: GitHub production readiness verifier is available for secret-name checks.
- pass: Value-free helper is available for generated Herbalisti-owned GitHub admin tokens.
- pass: Cloudflare API token permission packet is available for CLOUDFLARE_API_TOKEN setup.
- pass: External action packet names the required production workflow secrets.

## Operator Sequence

### resolve-cloudflare-d1-during-guarded-workflow

Side effect: creates-cloudflare-resource

The guarded production workflow resolves the Cloudflare D1 database named herbalisti and creates it only if it is missing during the approved run.

### generate-herbalisti-owned-github-secrets

Side effect: writes-github-secrets

Optional manual helper for storing Herbalisti-owned admin tokens in GitHub. The guarded production workflow can generate these as masked runtime values instead.

```bash
npm run verify:github-generated-secrets
npm run set:github-generated-secrets -- --confirm set-herbalisti-generated-secrets
```

### set-github-production-environment-secrets

Side effect: writes-github-secrets

```bash
gh secret set CLOUDFLARE_API_TOKEN --env production --repo marcgough/herbalist
gh secret set CLOUDFLARE_ACCOUNT_ID --env production --repo marcgough/herbalist
gh secret set KIE_API_KEY --env production --repo marcgough/herbalist
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
npx wrangler pages secret put FEED_ADMIN_TOKEN --project-name herbalisti
npx wrangler pages secret put KIE_API_KEY --project-name herbalisti
npx wrangler pages secret put MEDIA_ADMIN_TOKEN --project-name herbalisti
npx wrangler pages secret put OPENAI_API_KEY --project-name herbalisti
```
