# Herbalisti Production Cutover Simulation Checkpoint

Date: 2026-06-24

## Summary

Added a local production cutover simulation for Herbalisti. It rehearses the future Cloudflare D1/R2 activation with fake resource IDs, checks that Pages Functions and the scheduled news Worker share one `HERBALISTI_DB` target, keeps the optional R2 media bucket out of the news Worker, and verifies that migrations, secrets, deployment, and `herbalisti.com` domain work remain sequenced behind approval-required external actions.

This is local-only tooling. It does not call Cloudflare, deploy, mutate DNS, upload files, spend credits, generate media, print secrets, or write Wrangler config files.

## New Commands

- `npm run simulate:production-cutover`
- `npm run prepare:production-cutover`
- `npm run verify:production-cutover`

## Main Artifacts

- `scripts/simulate-production-cutover.mjs`
- `scripts/verify-production-cutover-simulation.mjs`
- `docs/production-cutover-simulation.json`
- `docs/production-cutover-simulation.md`
- `docs/external-launch-actions.json`
- `docs/external-launch-actions.md`
- `docs/production-environment-contract.json`
- `docs/deployment-runbook.md`
- `docs/production-launch-packet.md`
- `docs/goal-readiness.md`

## Verification

Passed:

- `npm run verify:production-cutover`
- `npm run verify:external-actions`
- `npm run verify:production-contract`
- `npm run verify:launch -- --soft`
- `npm run verify:goal-readiness`
- `npm run lint`
- `npm run verify:release`

Notes:

- The first full release proof hit a Windows `Access is denied` failure when the sandboxed command wrapper tried to run Wrangler local D1 migrations.
- The same full release proof passed after rerunning with normal local command permissions.
- `npm run verify:launch -- --soft` still correctly reports `needs-production-setup` because real Cloudflare D1 bindings and secrets are not yet active.
- `npm run verify:goal-readiness` still correctly reports `local-ready-production-pending`, with 15 passing requirement groups and 3 pending production groups.

## Remaining Production Work

- Create the Cloudflare D1 database after approval.
- Activate local Wrangler bindings with the returned D1 database ID.
- Apply remote D1 migrations after bindings are active.
- Set required Cloudflare secrets without exposing values in chat, docs, Git, or logs.
- Deploy Cloudflare Pages and the scheduled news Worker after approval.
- Connect `herbalisti.com` after approval.
- Run strict live gates against `https://herbalisti.com`.
