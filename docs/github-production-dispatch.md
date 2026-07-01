# Herbalisti GitHub Production Dispatch Packet

Generated: 2026-07-01T10:54:59.206Z

Status: needs-github-production-secret-names

Reads local launch contracts, workflow files, and generated readiness packets only. It does not dispatch GitHub Actions, set secrets, deploy, mutate DNS, create Cloudflare resources, call paid APIs, or print secret values.

## Current Readiness

- Repository: marcgough/herbalist
- Branch: main
- Dispatch commit: <dispatch_commit_sha>
- Dispatch commit policy: Replace <dispatch_commit_sha> with the exact main-branch commit that will be dispatched, then run the strict release evidence and production-state-current gates before dispatch.
- Production state: local-ready-production-pending
- GitHub production readiness: needs-github-production-setup
- Cloudflare production state: needs-cloudflare-auth
- DNS cutover: needs-dns-cutover
- Live readiness: not-ready
- Production provisioning: ready-for-approved-production-provisioning

## Required GitHub Secret Names

- CLOUDFLARE_API_TOKEN: missing
- CLOUDFLARE_ACCOUNT_ID: missing

## Optional GitHub Secret Names

- KIE_API_KEY: present

## Generated Runtime Secret Names

- FEED_ADMIN_TOKEN: generated and masked during the guarded workflow
- MEDIA_ADMIN_TOKEN: generated and masked during the guarded workflow

## Strict Preflight

```bash
npm run verify:github-actions
npm run verify:github-production-readiness -- --strict
npm run verify:github-release-evidence -- --commit <dispatch_commit_sha>
npm run verify:production-state-current
npm run verify:production-secrets
npm run verify:cloudflare-token-requirements
npm run verify:production-deploy-workflow
npm run verify:production-deploy-evidence
npm run verify:production-deploy-evidence-artifact
npm run verify:production-deploy-dry-run
npm run verify:production-d1-resolver
npm run verify:production-feed-seed
npm run verify:d1-manifest
npm run verify:dns-cutover
npm run verify:production-provisioning
npm run verify:github-generated-secrets
npm run verify:github-production-dispatch
npm run verify:launch -- --soft
```

## Final Completion Dispatch

Use this only when production DNS/custom-domain routing and live verification are expected to pass.

Inputs:

- confirm: deploy-herbalisti-production
- skip_live_verification: false
- skip_live_verification_confirm: 

```bash
gh workflow run production-deploy.yml --repo marcgough/herbalist --ref main -f confirm=deploy-herbalisti-production -f skip_live_verification=false
```

Final completion requires live verification inside the workflow plus npm run verify:live-readiness -- --strict, npm run verify:production -- https://herbalisti.com, and npm run verify:goal-readiness -- --strict.

## DNS Transition Dispatch

Use this only when the production deployment must run before DNS/custom-domain routing can pass.

Inputs:

- confirm: deploy-herbalisti-production
- skip_live_verification: true
- skip_live_verification_confirm: skip-herbalisti-live-verification

```bash
gh workflow run production-deploy.yml --repo marcgough/herbalist --ref main -f confirm=deploy-herbalisti-production -f skip_live_verification=true -f skip_live_verification_confirm=skip-herbalisti-live-verification
```

This mode is only for DNS-transition sequencing and cannot prove goal completion. Strict live verification remains required afterward.

## Post Dispatch Evidence

```bash
npm run verify:production-deploy-evidence-artifact -- --strict --run-id <production_deploy_run_id>
```

## Checks

- pass: Production deploy workflow exists.
- pass: Production deploy workflow is manually dispatched only.
- pass: Production deploy workflow requires the primary confirmation phrase.
- pass: Production deploy workflow requires a second acknowledgement when live verification is skipped.
- pass: Package exposes prepare and verify commands for this dispatch packet.
- pass: Production contract safe preflight includes GitHub production dispatch verification.
- pass: External action checklist wires the guarded dispatch packet into the production workflow action.
- pass: Full release verifier includes the GitHub production dispatch packet.
- pass: Production provisioning packet is available and locally consistent.
- pass: Production state snapshot still separates local readiness from live completion.
- pass: Production secret setup packet is available without secret values.
- pass: Value-free helper is available for generated Herbalisti-owned GitHub admin tokens.
- pass: Cloudflare token requirement packet is available without token values.

## Final Completion Gates

- `npm run verify:live-readiness -- --strict`
- `npm run verify:production -- https://herbalisti.com`
- `npm run verify:goal-readiness -- --strict`

