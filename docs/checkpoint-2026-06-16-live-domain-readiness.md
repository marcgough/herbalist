# Herbalisti Checkpoint: Live Domain Readiness Probe

Date: 2026-06-16 Australia/Sydney

## Summary

Added a read-only live-domain readiness probe for `herbalisti.com` so DNS/custom-domain state can be checked before and after Cloudflare Pages cutover without deploying, mutating DNS, creating resources, calling paid APIs, uploading files, or exposing secrets.

The probe is available as:

```bash
npm run verify:live-readiness
```

Strict post-deployment mode is:

```bash
npm run verify:live-readiness -- --strict
```

The strict command is now one of the production completion gates before `npm run verify:production -- https://herbalisti.com` and `npm run verify:goal-readiness -- --strict`.

## Files Changed

- `scripts/verify-live-readiness.mjs`
- `package.json`
- `docs/production-environment-contract.json`
- `scripts/verify-production-contract.mjs`
- `scripts/verify-launch-config.mjs`
- `scripts/prepare-launch-packet.mjs`
- `README.md`
- `docs/deployment-runbook.md`
- `docs/goal-readiness.md`
- `docs/herbalisti-project-plan.md`
- `docs/production-launch-packet.md`

## Current Live Domain Reading

`npm run verify:live-readiness` returned `not-ready`.

Observed public state:

- Apex A record resolves to `192.64.119.134`.
- Nameservers are `dns1.registrar-servers.com` and `dns2.registrar-servers.com`.
- HTTP redirects to `http://www.herbalisti.com/`.
- HTTPS homepage does not serve Herbalisti.
- `/api/health` does not serve the Herbalisti operational health contract.

This confirms the domain is not yet connected to the Cloudflare Pages production site.

## Verification

Passed:

- `npm run verify:live-readiness`
- `npm run verify:production-contract`
- `npm run verify:launch -- --soft`
- `npm run verify:goal-readiness`
- `npm run lint`
- `npm run build`
- `npm run prepare:launch`
- `npm run verify:release`

Latest status:

- `npm run verify:live-readiness`: `not-ready`
- `npm run verify:launch -- --soft`: `needs-production-setup`
- `npm run verify:goal-readiness`: `local-ready-production-pending`
- `counts.pass: 10`
- `counts.pending-production: 3`

## Remaining Production Setup

The goal should remain active until:

- Cloudflare Pages project `herbalisti` exists and serves `herbalisti.com`.
- Production D1 database `herbalisti` exists and the same returned `database_id` is bound in both `wrangler.toml` and `wrangler.news.toml`.
- Remote D1 migrations are applied.
- Cloudflare secrets are set for deployment, feed refresh, and protected Seedance media generation.
- The scheduled news Worker is deployed.
- `npm run verify:live-readiness -- --strict` passes.
- `npm run verify:production -- https://herbalisti.com` passes against the live domain.
- `npm run verify:goal-readiness -- --strict` passes after live verification.

No deployment, DNS mutation, Cloudflare resource creation, upload, secret exposure, paid OpenAI call, or Kie.ai generation was performed in this checkpoint.
