# Herbalisti Production State Snapshot

Generated: 2026-07-01T09:07:41.432Z

Status: local-ready-production-pending

Reads local launch artifacts, public DNS, public live-domain responses, GitHub readiness metadata, and read-only Wrangler state only. It does not set secrets, deploy, mutate DNS, create resources, call paid APIs, upload files, download artifacts, or print secret values.

## Project

- Domain: herbalisti.com
- Cloudflare Pages project: herbalisti
- D1 database: herbalisti
- News Worker: herbalisti-news-refresh

## Stored Snapshot Summary

- Git branch: main
- Observed git commit at generation time: ceccce7a93e3c238f7399d865d6390d31393eb6a
- Git note: Stored snapshot evidence is generated before the artifact commit lands, so this commit can trail repository HEAD. Use npm run verify:production-state-current for exact current-commit release evidence.
- Completion audit status: local-ready-production-pending
- Goal complete: false
- Local implementation ready: true
- Pending requirement count: 2
- GitHub production readiness: needs-github-production-setup
- Missing GitHub production secret names: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
- Cloudflare production state: needs-cloudflare-auth
- Wrangler authenticated: false
- DNS cutover status: needs-dns-cutover
- DNS nameserver provider: external-or-registrar
- Live readiness: not-ready
- Production provisioning status: ready-for-approved-production-provisioning
- Blocker count: 10

## Checks

- pass: Completion audit status is local-ready-production-pending.
- pass: Release evidence is pass for ceccce7a93e3c238f7399d865d6390d31393eb6a.
- pass: GitHub production readiness status is needs-github-production-setup.
- pass: Cloudflare production state is needs-cloudflare-auth.
- pass: DNS cutover status is needs-dns-cutover.
- pass: Live readiness status is not-ready.
- pass: Snapshot stores secret names and readiness status only; no secret values are required or printed.

## Blockers

- Completion audit pending: independent-newsfeed: pending-production.
- Completion audit pending: cloudflare-hosting: pending-production.
- GitHub production secret name missing: CLOUDFLARE_API_TOKEN.
- GitHub production secret name missing: CLOUDFLARE_ACCOUNT_ID.
- Cloudflare production state is needs-cloudflare-auth.
- DNS/custom-domain state is needs-dns-cutover.
- Live domain readiness is not-ready.
- Provisioning blocker: Pages D1 binding is not active.
- Provisioning blocker: Scheduled Worker D1 binding is not active.
- Provisioning blocker: FEED_ADMIN_TOKEN is not locally visible; confirm it is set directly in Cloudflare before launch.

## Probe Details

- Release evidence: pass
- CI run ID: 28505020198
- Manual release run ID: 28505061359
- Visual smoke artifact ID: 8004842837
- GitHub environment protection rules: 2
- Cloudflare visible D1 names: none
- Cloudflare visible Pages projects: none
- DNS Cloudflare zone ready: false
- DNS apex record present: true
- Live HTTPS status: unknown
- Live health status: unknown
- Live health D1 bound: unknown
- Live public surface checks: news=false, signalsRss=false, search=false, herbalChat=false, referenceBooks=false

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
- Leave KIE_API_KEY and MEDIA_ADMIN_TOKEN disabled until approved Seedance generation is needed.
- Run the protected POST /api/feed-refresh path or wait for the scheduled Worker until /api/health reports a fresh completed feed refresh.
- Confirm /api/news, /api/signals.xml, /api/search, /api/herbal-chat, and /data/reference-books.json are live on the canonical domain.
- Deploy Cloudflare Pages and the scheduled news Worker.
- Run npm run verify:live-readiness again.
- Set the required GitHub production environment secrets listed by npm run verify:github-production-readiness.
- Use the guarded GitHub production workflow to resolve or create the D1 database named herbalisti, or run the manual Cloudflare D1/configuration path.
- Confirm Cloudflare runtime secret setup for protected feed refresh; Seedance media secrets remain optional until approved.
- Run npm run verify:launch again.
