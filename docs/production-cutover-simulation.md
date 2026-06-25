# Herbalisti Production Cutover Simulation

Generated: 2026-06-24T03:44:01.285Z

Status: pass

Local production cutover simulation only. No Cloudflare API call, deployment, DNS mutation, upload, paid generation, secret readout, or Wrangler config write is attempted.

## Scenario

- Domain: herbalisti.com
- Cloudflare Pages project: herbalisti
- D1 database: herbalisti
- Simulated D1 database ID: 12345678...9abc
- Optional R2 bucket: herbalisti-media
- Scheduled Worker: herbalisti-news-refresh

## Simulated Bindings

- Pages D1 binding active: true
- News Worker D1 binding active: true
- Shared D1 database ID: true
- Pages R2 binding active: true
- News Worker R2 binding active: false

## Cutover Order

- Create Cloudflare D1 database after Marc approval.
- Activate local Wrangler bindings with the returned D1 database ID.
- Apply remote D1 migrations after bindings are active.
- Set required Cloudflare secrets without exposing values in chat, docs, Git, or logs.
- Deploy Pages and the scheduled Worker after migrations and secrets.
- Connect herbalisti.com after the Pages deployment.
- Run strict live completion gates against https://herbalisti.com.

## Checks

- pass: The simulation leaves wrangler.toml and wrangler.news.toml unchanged.
- pass: Simulated Pages config receives HERBALISTI_DB with the supplied D1 database ID.
- pass: Simulated scheduled Worker config receives HERBALISTI_DB with the same D1 database ID.
- pass: Pages Functions and scheduled Worker share one production D1 target.
- pass: The optional R2 binding is added to the Pages config when a bucket is supplied.
- pass: The scheduled Worker does not receive the optional media bucket binding.
- pass: Generated configs do not retain template placeholders.
- pass: The production contract includes the cutover simulation verifier in safe preflight.
- pass: The external action checklist exposes the rehearsal as a local allowed action.
- pass: Local D1 binding activation is sequenced after Cloudflare creates the D1 database.
- pass: Remote D1 migrations are sequenced after local Wrangler bindings are activated.
- pass: Pages deployment is sequenced after migrations and required secrets.
- pass: Custom domain work is sequenced after the Pages deployment.
- pass: Live completion remains gated by strict live readiness, production smoke, and strict goal readiness.

## Next Actions

- Keep npm run verify:production-cutover in safe preflight and release verification.
- Use npm run prepare:production-cutover to refresh the human handoff artifact before approved live cutover.
