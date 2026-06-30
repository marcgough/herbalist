# Herbalisti Production Provisioning Readiness

Generated: 2026-06-30T21:09:36.944Z

Status: ready-for-approved-production-provisioning

Reads local launch contracts, Wrangler config, package scripts, and environment-variable presence only. It does not call Cloudflare, deploy, mutate DNS, create resources, set secrets, call paid APIs, or print secret values.

## Current State

- Pages D1 binding active: false
- News Worker D1 binding active: false
- D1 database IDs match: null
- R2 media binding active: false
- Required secret names: FEED_ADMIN_TOKEN, KIE_API_KEY, MEDIA_ADMIN_TOKEN
- Locally visible required secret names: none
- D1 migration count: 9
- D1 migration manifest fingerprint: 6cb4b13052011388db058b32d706ee920d016f08b3f598f06e0c89173aad63d3
- DNS cutover status: needs-dns-cutover
- DNS nameserver provider: external-or-registrar
- Production secret setup status: ready-for-secret-entry
- GitHub production secret names: 5

## Next Approved Action

`set-github-production-environment-secrets`

## Manual Cloudflare Path

`create-d1-database`

## Checks

- pass: Production contract targets herbalisti.com.
- pass: External action checklist describes production setup state.
- pass: GitHub release evidence verifier is exposed as an npm script.
- pass: Read-only Cloudflare production state verifier is exposed and included in safe preflight.
- pass: D1 production migration manifest is current and included in safe preflight.
- pass: DNS/custom-domain cutover plan is available and included in safe preflight.
- pass: Production secret setup packet is current and included in safe preflight.
- pass: Safe preflight includes GitHub CI/manual release evidence verification.
- pass: Cloudflare binding configurator is available.
- pass: Guarded production workflow can resolve or create the named D1 database without a D1 ID secret.
- pass: Guarded production workflow can rehearse its Cloudflare-facing command path with fake Wrangler.
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
npm run verify:cloudflare-production-state
npm run verify:d1-manifest
npm run verify:dns-cutover
npm run verify:production-secrets
npm run verify:production-deploy-dry-run
npm run verify:production-d1-resolver
npm run verify:launch -- --soft
npm run verify:production-contract
npm run verify:production-provisioning
```

### guarded-workflow-d1-resolution

Side effect: creates-cloudflare-resource-when-missing

```bash
npm run resolve:production-d1 -- --create-if-missing --github-env "$GITHUB_ENV"
```

- D1 database ID is written to the GitHub runner environment only; it is not handled as a GitHub secret.

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
npm run verify:production-secrets
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
npm run verify:dns-cutover
npm run verify:live-readiness -- --strict
npm run verify:production -- https://herbalisti.com
npm run verify:goal-readiness -- --strict
```

