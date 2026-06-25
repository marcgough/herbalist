# Herbalisti Checkpoint - Production Launch Packet

Date: 2026-06-16

## Summary

Herbalisti now has a non-destructive production launch packet generator. This gives the future Cloudflare handoff an ordered cutover plan without deploying, creating resources, writing config files, uploading assets, calling paid APIs, or printing secrets.

## Implemented

- Added `scripts/prepare-launch-packet.mjs`.
- Added `npm run prepare:launch`.
- Added `docs/production-launch-packet.md`.
- Added launch packet evidence to `scripts/verify-goal-readiness.mjs`.
- Added launch packet script/doc checks to `scripts/verify-launch-config.mjs`.
- Updated `README.md`, `docs/deployment-runbook.md`, and `docs/herbalisti-project-plan.md`.

## What The Packet Shows

The packet reads local files and environment-variable presence, then prints:

- local release proof commands
- Cloudflare D1 and optional R2 resource commands
- local Wrangler binding activation commands
- remote D1 migration command
- required Cloudflare secret commands
- Pages and scheduled Worker deployment commands
- `herbalisti.com` custom-domain and live-verification commands
- current blockers and the next suggested command

## Commands

JSON:

```bash
npm run prepare:launch
```

Markdown:

```bash
npm run prepare:launch -- --markdown
```

Strict mode:

```bash
npm run prepare:launch -- --strict
```

Strict mode currently fails as expected because production D1 bindings, secrets, DNS, and live verification are not yet complete.

## Verification

Passed:

- `npm run prepare:launch`
- `npm run prepare:launch -- --markdown`
- `npm run lint`
- `npm run build`
- `npm run verify:goal-readiness`
- `npm run verify:launch -- --soft`
- `npm run verify:release`

Also checked:

- `npm run prepare:launch -- --strict` returns a failure while production blockers remain, as intended.

## Current Production State

Current packet status:

```text
pending-production-setup
```

Known blockers:

- real Cloudflare D1 database ID is not configured
- `wrangler.toml` and `wrangler.news.toml` still use template D1 binding comments
- production D1 migrations cannot run until bindings exist
- required Cloudflare secrets are not visible locally or confirmed
- Pages and scheduled Worker are not deployed
- `herbalisti.com` is not live-verified

## Guardrails

- No deployment was attempted.
- No Cloudflare resource was created.
- No config file was written by the packet command.
- No external API keys were requested or exposed.
- No paid generation was attempted.

