# Herbalisti Production Provisioning Readiness

Generated: 2026-06-30T15:51:29.510Z

Status: ready-for-approved-production-provisioning

Reads local launch contracts, Wrangler config, package scripts, and environment-variable presence only. It does not call Cloudflare, deploy, mutate DNS, create resources, set secrets, call paid APIs, or print secret values.

## Current State

- Pages D1 binding active: false
- News Worker D1 binding active: false
- D1 database IDs match: null
- R2 media binding active: false
- Required secret names: FEED_ADMIN_TOKEN, KIE_API_KEY, MEDIA_ADMIN_TOKEN
- Locally visible required secret names: none

## Next Approved Action

`create-d1-database`

## Checks

- pass: Production contract targets herbalisti.com.
- pass: External action checklist describes production setup state.
- pass: GitHub release evidence verifier is exposed as an npm script.
- pass: Safe preflight includes GitHub CI/manual release evidence verification.
- pass: Cloudflare binding configurator is available.
- pass: Production cutover simulation verifier is available.
- pass: External action verifier is available.
- pass: Cloudflare Pages deploy script is available.
- pass: Scheduled Worker deploy script is available.
- pass: D1 creation action exists.
- pass: Remote D1 migration action exists.
- pass: Required launch secrets have named setup actions.
- pass: Pages and scheduled Worker deployment actions exist.
- pass: Custom domain action exists.
- pass: Strict live completion gates are declared.
- pass: Provisioning inputs do not contain obvious secret values.

## Production Blockers

- Pages D1 binding is not active.
- Scheduled Worker D1 binding is not active.
- FEED_ADMIN_TOKEN is not locally visible; confirm it is set directly in Cloudflare before launch.
- KIE_API_KEY is not locally visible; confirm it is set directly in Cloudflare before launch.
- MEDIA_ADMIN_TOKEN is not locally visible; confirm it is set directly in Cloudflare before launch.

## Operator Sequence

### preflight

Side effect: none

```bash
npm run verify:github-release-evidence
npm run verify:launch -- --soft
npm run verify:production-contract
npm run verify:production-provisioning
```

### create-cloudflare-d1

Side effect: creates-cloudflare-resource

```bash
npx wrangler d1 create herbalisti
```

- Returned D1 database ID only; do not store secret values in chat or docs.

### activate-local-bindings

Side effect: writes-local-config

```bash
npm run configure:cloudflare -- --d1 <database_id> --apply
```

### remote-d1-migrations

Side effect: writes-cloudflare-d1

```bash
npx wrangler d1 migrations apply herbalisti --remote
```

### set-required-secrets

Side effect: writes-cloudflare-secrets

```bash
npx wrangler secret put FEED_ADMIN_TOKEN --config wrangler.news.toml
npx wrangler pages secret put KIE_API_KEY --project-name herbalisti
npx wrangler pages secret put MEDIA_ADMIN_TOKEN --project-name herbalisti
```

### deploy

Side effect: public-deployment

```bash
npm run deploy:cloudflare
npm run deploy:news-worker
```

### domain-and-live-verification

Side effect: dns-and-live-verification

```bash
npm run verify:live-readiness -- --strict
npm run verify:production -- https://herbalisti.com
npm run verify:goal-readiness -- --strict
```

