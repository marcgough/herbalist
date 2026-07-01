# Herbalisti Production Operator Brief

Generated: 2026-07-01T17:19:47.064Z

Status: needs-github-production-credential-entry

Reads local launch contracts and generated readiness packets, then optionally writes docs/production-operator-brief files. It does not dispatch GitHub Actions, set or request secrets, deploy, mutate DNS, create Cloudflare resources, call paid APIs, upload files, download artifacts, or print secret values.

## Current State

- Domain: herbalisti.com
- Local implementation ready: true
- Goal complete: false
- Production state: local-ready-production-pending
- Release evidence: pass
- Production deploy evidence artifact: pending-production-deploy-evidence-artifact
- Release evidence policy: Stored snapshot evidence is generated before the artifact commit lands, so this commit can trail repository HEAD. Use npm run verify:production-state-current for exact current-commit release evidence.
- GitHub production readiness: needs-github-production-setup
- Missing GitHub credential names: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
- Cloudflare production state: needs-cloudflare-auth
- Wrangler authenticated: false
- DNS cutover: needs-dns-cutover
- DNS provider: external-or-registrar
- Live readiness: not-ready
- Live production smoke: unavailable
- Production provisioning: ready-for-approved-production-provisioning
- Production blocker count: 15

## Credential Boundary

- Required GitHub production secret names: CLOUDFLARE_API_TOKEN
- Required GitHub production variable names: CLOUDFLARE_ACCOUNT_ID
- Optional GitHub production secret names: KIE_API_KEY
- Generated runtime secret names: FEED_ADMIN_TOKEN, MEDIA_ADMIN_TOKEN
- Not required as GitHub secrets: CLOUDFLARE_ACCOUNT_ID, FEED_ADMIN_TOKEN, MEDIA_ADMIN_TOKEN, CLOUDFLARE_D1_DATABASE_ID
- Enter externally issued secret values directly into GitHub or Cloudflare. Use a GitHub production variable for non-secret identifiers such as CLOUDFLARE_ACCOUNT_ID. Do not paste secret values into chat, docs, Git, screenshots, or logs.

## Next Action

Set the required GitHub production environment credentials directly in GitHub, then run npm run verify:github-production-readiness -- --strict.

## Operator Sequence

### safe-local-preflight

Side effect: none

Confirms the current local build, launch contracts, source governance, GitHub release evidence, Cloudflare readiness probes, and no-secret packets before production action.

```bash
npm run verify:launch -- --soft
npm run verify:github-actions
npm run verify:github-production-readiness
npm run verify:github-release-evidence
npm run verify:production-state-current
npm run verify:cloudflare-production-state
npm run verify:cloudflare-token-requirements
npm run verify:d1-manifest
npm run verify:dns-cutover
npm run verify:production-secrets
npm run verify:github-generated-secrets
npm run verify:github-production-dispatch
npm run verify:production-deploy-workflow
npm run verify:production-deploy-evidence
npm run verify:production-deploy-evidence-artifact
npm run verify:production-deploy-dry-run
npm run verify:production-d1-resolver
npm run verify:production-feed-seed
npm run verify:production-provisioning
npm run verify:production-operator-brief
```

### set-required-github-production-environment-credentials

Side effect: writes-github-secrets-and-variables

Requires: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID

After entry, run npm run verify:github-production-readiness -- --strict.

```bash
gh secret set CLOUDFLARE_API_TOKEN --env production --repo marcgough/herbalist
gh variable set CLOUDFLARE_ACCOUNT_ID --env production --repo marcgough/herbalist
```

### dispatch-guarded-production-workflow

Side effect: public-production-deploy

Use final completion mode only when live verification is expected to pass. DNS transition mode cannot prove completion.

```bash
gh workflow run production-deploy.yml --repo marcgough/herbalist --ref main -f confirm=deploy-herbalisti-production -f skip_live_verification=false
gh workflow run production-deploy.yml --repo marcgough/herbalist --ref main -f confirm=deploy-herbalisti-production -f skip_live_verification=true -f skip_live_verification_confirm=skip-herbalisti-live-verification
```

### verify-production-deploy-evidence-artifact

Side effect: read-only-github-metadata

After the guarded workflow run completes, confirm GitHub uploaded the non-secret production deployment evidence artifact for that exact run.

```bash
npm run verify:production-deploy-evidence-artifact -- --strict --run-id <production_deploy_run_id>
```

### connect-domain-and-dns

Side effect: mutates-public-dns-or-custom-domain

Connect herbalisti.com to the Herbalisti Cloudflare Pages project and re-run DNS/live readiness checks after propagation.

```bash
npm run verify:dns-cutover
```

### seed-live-feed-and-prove-completion

Side effect: writes-production-d1-and-verifies-live-site

A fresh protected feed refresh and strict live verification are required before the overall Herbalisti goal can be complete.

```bash
npm run verify:production-feed-seed
npm run seed:production-feed -- --base-url https://herbalisti.com --confirm seed-herbalisti-feed
npm run verify:live-readiness -- --strict
npm run verify:production -- https://herbalisti.com
npm run verify:goal-readiness -- --strict
```

## Hard Gates

- credential-entry: Entering production GitHub secret values and non-secret deployment variables. Immediate next: true
- production-deployment: Dispatching the guarded GitHub production workflow or manually deploying Cloudflare Pages/Worker. Immediate next: false
- dns-custom-domain: Changing herbalisti.com nameservers, DNS records, or Cloudflare Pages custom-domain configuration. Immediate next: false
- paid-media-generation: Calling Kie.ai Seedance or any paid generation provider. Immediate next: false

## Production Blockers

- Completion audit pending: independent-newsfeed: pending-production.
- Completion audit pending: cloudflare-hosting: pending-production.
- Production deploy evidence artifact readback is pending-production-deploy-evidence-artifact.
- GitHub production credential missing: CLOUDFLARE_API_TOKEN.
- GitHub production credential missing: CLOUDFLARE_ACCOUNT_ID.
- Cloudflare production state is needs-cloudflare-auth.
- DNS/custom-domain state is needs-dns-cutover.
- Live domain readiness is not-ready.
- Live production smoke verification is unavailable.
- Provisioning blocker: Pages D1 binding is not active.
- Provisioning blocker: Scheduled Worker D1 binding is not active.
- Provisioning blocker: FEED_ADMIN_TOKEN is not locally visible; confirm it is set directly in Cloudflare before launch.
- Pages D1 binding is not active.
- Scheduled Worker D1 binding is not active.
- FEED_ADMIN_TOKEN is not locally visible; confirm it is set directly in Cloudflare before launch.

## Final Completion Gates

- `npm run verify:production-deploy-evidence-artifact -- --strict --run-id <production_deploy_run_id>`
- `npm run verify:live-readiness -- --strict`
- `npm run verify:production -- https://herbalisti.com`
- `npm run verify:goal-readiness -- --strict`

## Checks

- pass: Production contract targets herbalisti.com.
- pass: Cloudflare token is a GitHub production secret; Cloudflare account ID is a production variable with secret fallback.
- pass: Protected feed and media admin tokens are generated runtime names, not required external GitHub credentials.
- pass: Cloudflare API token permissions are documented without token values.
- pass: GitHub dispatch packet preserves strict final verification and DNS-transition acknowledgement.
- pass: Strict live-domain checks are declared.
- pass: Final completion gates include deployment artifact readback and strict live-domain checks.
- pass: Package exposes generated operator brief commands.
- pass: Full release verification includes the operator brief.
- pass: All source packets used by the operator brief exist.

## Source Packets

- docs/production-environment-contract.json: contract
- docs/production-state-snapshot.json: local-ready-production-pending
- docs/github-production-dispatch.json: needs-github-production-credentials
- docs/production-secret-setup.json: ready-for-secret-entry
- docs/cloudflare-token-requirements.json: ready-for-token-entry
- docs/dns-cutover-plan.json: needs-dns-cutover
- docs/production-provisioning-readiness.json: ready-for-approved-production-provisioning
- docs/external-launch-actions.json: needs-approval-and-production-setup
