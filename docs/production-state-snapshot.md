# Herbalisti Production State Snapshot

Generated: 2026-07-01T02:21:22.013Z

Status: local-ready-production-pending

Reads local launch artifacts, public DNS, public live-domain responses, GitHub readiness metadata, and read-only Wrangler state only. It does not set secrets, deploy, mutate DNS, create resources, call paid APIs, upload files, download artifacts, or print secret values.

## Project

- Domain: herbalisti.com
- Cloudflare Pages project: herbalisti
- D1 database: herbalisti
- News Worker: herbalisti-news-refresh

## Current Summary

- Git branch: main
- Git commit: 82aa05709f81b1e658d45296b0bd97cd315b1ece
- Git note: Commit is the repository HEAD observed when the snapshot was generated; the snapshot artifact itself may be committed afterward.
- Completion audit status: local-ready-production-pending
- Goal complete: false
- Local implementation ready: true
- Pending requirement count: 3
- GitHub production readiness: needs-github-production-setup
- Missing GitHub production secret names: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, FEED_ADMIN_TOKEN, KIE_API_KEY, MEDIA_ADMIN_TOKEN
- Cloudflare production state: needs-cloudflare-auth
- Wrangler authenticated: false
- DNS cutover status: needs-dns-cutover
- DNS nameserver provider: external-or-registrar
- Live readiness: not-ready
- Production provisioning status: ready-for-approved-production-provisioning
- Blocker count: 16

## Checks

- pass: Completion audit status is local-ready-production-pending.
- pass: Release evidence is pass for 82aa05709f81b1e658d45296b0bd97cd315b1ece.
- pass: GitHub production readiness status is needs-github-production-setup.
- pass: Cloudflare production state is needs-cloudflare-auth.
- pass: DNS cutover status is needs-dns-cutover.
- pass: Live readiness status is not-ready.
- pass: Snapshot stores secret names and readiness status only; no secret values are required or printed.

## Blockers

- Completion audit pending: independent-newsfeed: pending-production.
- Completion audit pending: seedance-video-readiness: pending-production.
- Completion audit pending: cloudflare-hosting: pending-production.
- GitHub production secret name missing: CLOUDFLARE_API_TOKEN.
- GitHub production secret name missing: CLOUDFLARE_ACCOUNT_ID.
- GitHub production secret name missing: FEED_ADMIN_TOKEN.
- GitHub production secret name missing: KIE_API_KEY.
- GitHub production secret name missing: MEDIA_ADMIN_TOKEN.
- Cloudflare production state is needs-cloudflare-auth.
- DNS/custom-domain state is needs-dns-cutover.
- Live domain readiness is not-ready.
- Provisioning blocker: Pages D1 binding is not active.
- Provisioning blocker: Scheduled Worker D1 binding is not active.
- Provisioning blocker: FEED_ADMIN_TOKEN is not locally visible; confirm it is set directly in Cloudflare before launch.
- Provisioning blocker: KIE_API_KEY is not locally visible; confirm it is set directly in Cloudflare before launch.
- Provisioning blocker: MEDIA_ADMIN_TOKEN is not locally visible; confirm it is set directly in Cloudflare before launch.

## Probe Details

- Release evidence: pass
- CI run ID: 28486878064
- Manual release run ID: 28486906252
- Visual smoke artifact ID: 7997865092
- GitHub environment protection rules: 2
- Cloudflare visible D1 names: none
- Cloudflare visible Pages projects: none
- DNS Cloudflare zone ready: false
- DNS apex record present: true
- Live HTTPS status: unknown
- Live health status: unknown
- Live health D1 bound: unknown

## Next Actions

- Add the required GitHub secret names without exposing values in chat, docs, or logs.
- Run npm run verify:github-production-readiness again.
- Authenticate Wrangler interactively or provide CLOUDFLARE_API_TOKEN, then rerun npm run verify:cloudflare-production-state.
- Prepare Cloudflare zone delegation for herbalisti.com.
- Capture the Cloudflare-assigned nameservers during approved setup.
- Change registrar nameservers only after approval for public DNS mutation.
- Attach herbalisti.com as a Cloudflare Pages custom domain after the Pages project exists.
- Connect herbalisti.com as a Cloudflare Pages custom domain.
- Confirm DNS is active for the apex domain.
- Confirm the HERBALISTI_DB D1 binding is active in production.
- Confirm FEED_ADMIN_TOKEN is set as a Cloudflare Pages secret for the protected feed-refresh endpoint.
- Confirm KIE_API_KEY and MEDIA_ADMIN_TOKEN are set if protected Seedance endpoints remain required for launch.
- Run the protected POST /api/feed-refresh path or wait for the scheduled Worker until /api/health reports a fresh completed feed refresh.
- Deploy Cloudflare Pages and the scheduled news Worker.
- Run npm run verify:live-readiness again.
- Set the five GitHub production environment secrets listed by npm run verify:github-production-readiness.
- Use the guarded GitHub production workflow to resolve or create the D1 database named herbalisti, or run the manual Cloudflare D1/configuration path.
- Confirm Cloudflare runtime secrets for protected refresh and media-generation features.
- Run npm run verify:launch again.
