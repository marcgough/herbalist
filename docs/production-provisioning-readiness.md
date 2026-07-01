# Herbalisti Production Provisioning Readiness

Generated: 2026-07-01T16:10:42.398Z

Status: ready-for-approved-production-provisioning

Reads local launch contracts, Wrangler config, package scripts, and environment-variable presence only. It does not call Cloudflare, deploy, mutate DNS, create resources, set secrets, call paid APIs, or print secret values.

## Current State

- Pages D1 binding active: false
- News Worker D1 binding active: false
- D1 database IDs match: null
- R2 media binding active: false
- Required secret names: FEED_ADMIN_TOKEN
- Locally visible required secret names: none
- D1 migration count: 9
- D1 migration manifest fingerprint: 6cb4b13052011388db058b32d706ee920d016f08b3f598f06e0c89173aad63d3
- DNS cutover status: needs-dns-cutover
- DNS nameserver provider: external-or-registrar
- Production secret setup status: ready-for-secret-entry
- Production state snapshot status: local-ready-production-pending
- Production state snapshot blockers: 12
- Production deploy evidence artifact: pending-production-deploy-evidence-artifact
- Live production smoke: unavailable
- GitHub production dispatch status: needs-github-production-credentials
- Required GitHub production secret names: CLOUDFLARE_API_TOKEN
- Required GitHub production variable names: CLOUDFLARE_ACCOUNT_ID
- Required GitHub production credential names: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
- Optional GitHub production secret names: KIE_API_KEY
- GitHub generated secret helper: available
- Cloudflare token requirement status: ready-for-token-entry
- Cloudflare token required permissions: 4

## Next Approved Action

`set-github-production-environment-credentials`

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
- pass: Value-free helper is available and included in safe preflight for generated Herbalisti-owned GitHub admin tokens.
- pass: Production state snapshot is available and included in safe preflight.
- pass: Consolidated production operator brief is available and included in safe preflight.
- pass: Cloudflare API token permission packet is current and included in safe preflight.
- pass: Safe preflight includes GitHub CI/manual release evidence verification.
- pass: Guarded GitHub production dispatch packet is available and included in safe preflight.
- pass: Safe preflight includes current-commit production state evidence verification.
- pass: Cloudflare binding configurator is available.
- pass: Guarded production workflow can resolve or create the named D1 database without a D1 ID secret.
- pass: Guarded production workflow can emit a non-secret deployment evidence artifact.
- pass: Production deployment evidence artifact can be read back from GitHub Actions metadata after dispatch.
- pass: Guarded production workflow can rehearse its Cloudflare-facing command path with fake Wrangler.
- pass: Protected production feed seed command is available for post-deploy freshness proof.
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
- pass: Final completion gates include deployment artifact readback and strict live-domain checks.
- pass: Provisioning inputs do not contain obvious secret values.

## Production Blockers

- Pages D1 binding is not active.
- Scheduled Worker D1 binding is not active.
- FEED_ADMIN_TOKEN is not locally visible; confirm it is set directly in Cloudflare before launch.

## Operator Sequence

### preflight

Side effect: none

```bash
npm run verify:github-release-evidence
npm run verify:production-state-current
npm run verify:cloudflare-production-state
npm run verify:d1-manifest
npm run verify:dns-cutover
npm run verify:production-secrets
npm run verify:github-generated-secrets
npm run verify:production-state
npm run verify:cloudflare-token-requirements
npm run verify:github-production-dispatch
npm run verify:production-deploy-evidence
npm run verify:production-deploy-evidence-artifact
npm run verify:production-deploy-dry-run
npm run verify:production-d1-resolver
npm run verify:production-feed-seed
npm run verify:launch -- --soft
npm run verify:production-contract
npm run verify:production-provisioning
npm run verify:production-operator-brief
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

### generate-herbalisti-owned-github-secrets

Side effect: writes-github-secrets

```bash
npm run verify:github-generated-secrets
npm run set:github-generated-secrets -- --confirm set-herbalisti-generated-secrets
```

- Generates FEED_ADMIN_TOKEN and MEDIA_ADMIN_TOKEN directly into GitHub secret storage without printing values.

### set-required-secrets

Side effect: writes-cloudflare-secrets

```bash
npm run verify:production-secrets
npx wrangler secret put FEED_ADMIN_TOKEN --config wrangler.news.toml
npx wrangler pages secret put FEED_ADMIN_TOKEN --project-name herbalisti
```

### deploy

Side effect: public-deployment

```bash
npm run deploy:cloudflare
npm run deploy:news-worker
```

### verify-production-deploy-evidence-artifact

Side effect: read-only-github-metadata

```bash
npm run verify:production-deploy-evidence-artifact -- --strict --run-id <production_deploy_run_id>
```

### domain-cutover

Side effect: dns-and-custom-domain-change

```bash
npm run verify:dns-cutover
```

- Connect herbalisti.com to the Cloudflare Pages project before seeding through the canonical domain.

### seed-live-feed

Side effect: writes-cloudflare-d1

```bash
npm run verify:production-feed-seed
npm run seed:production-feed -- --base-url https://herbalisti.com --confirm seed-herbalisti-feed
```

### live-verification

Side effect: live-verification

```bash
npm run verify:live-readiness -- --strict
npm run verify:production -- https://herbalisti.com
npm run verify:goal-readiness -- --strict
```

