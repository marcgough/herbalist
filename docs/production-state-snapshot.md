# Herbalisti Production State Snapshot

Generated: 2026-07-02T03:33:07.636Z

Status: local-ready-production-pending

Reads local launch artifacts, public DNS, public live-domain responses, GitHub release/deploy artifact metadata, the selected no-secret release evidence artifact content, and read-only Wrangler state only. It does not set secrets, deploy, mutate DNS, create resources, call paid APIs, upload files, or print secret values.

## Project

- Domain: herbalisti.com
- Cloudflare Pages project: herbalisti
- D1 database: herbalisti
- News Worker: herbalisti-news-refresh

## Stored Snapshot Summary

- Git branch: main
- Observed git commit at generation time: db060a6bdce9cb1e6ac0c277d5ddbafd1d4ebe4a
- Git note: Stored snapshot evidence is generated before the artifact commit lands, so this commit can trail repository HEAD. Use npm run verify:production-state-current for exact current-commit release evidence.
- Completion audit status: local-ready-production-pending
- Goal complete: false
- Local implementation ready: true
- Pending requirement count: 2
- Production deploy evidence artifact: pending-production-deploy-evidence-artifact
- GitHub production readiness: ready-for-guarded-production-dispatch
- Missing GitHub production credential names: none
- Cloudflare production state: needs-cloudflare-auth
- Wrangler authenticated: false
- DNS cutover status: needs-dns-cutover
- DNS nameserver provider: external-or-registrar
- Live readiness: not-ready
- Live production smoke: unavailable
- Final completion gates: 4
- Production provisioning status: ready-for-approved-production-provisioning
- Blocker count: 10

## Checks

- pass: Completion audit status is local-ready-production-pending.
- pass: Release evidence is pass for db060a6bdce9cb1e6ac0c277d5ddbafd1d4ebe4a.
- pass: Production deploy evidence artifact status is pending-production-deploy-evidence-artifact.
- pass: GitHub production readiness status is ready-for-guarded-production-dispatch.
- pass: Cloudflare production state is needs-cloudflare-auth.
- pass: DNS cutover status is needs-dns-cutover.
- pass: Live readiness status is not-ready.
- warning: Live production smoke probe did not return a current JSON payload.
- pass: Snapshot stores secret names and readiness status only; no secret values are required or printed.

## Blockers

- Completion audit pending: independent-newsfeed: pending-production.
- Completion audit pending: cloudflare-hosting: pending-production.
- Production deploy evidence artifact readback is pending-production-deploy-evidence-artifact.
- Cloudflare production state is needs-cloudflare-auth.
- DNS/custom-domain state is needs-dns-cutover.
- Live domain readiness is not-ready.
- Live production smoke verification is unavailable.
- Provisioning blocker: Pages D1 binding is not active.
- Provisioning blocker: Scheduled Worker D1 binding is not active.
- Provisioning blocker: FEED_ADMIN_TOKEN is not locally visible; confirm it is set directly in Cloudflare before launch.

## Probe Details

- Release evidence: pass
- CI run ID: 28562907441
- Manual release run ID: 28562934472
- Visual smoke artifact ID: 8028200268
- Release evidence artifact ID: 8028199899
- Release evidence artifact digest: sha256:9a34e84b9a3e2592892c8adaf4ea849ff39b98670c61f2dbc35317e74f53f0f0
- Release evidence content: verified-release-evidence-content
- Release Signals items: 24
- Release Signals topic coverage: 100%
- Release Signals sources: arXiv, bioRxiv, Crossref, Fight Aging!, Lifespan.io, PubMed / NCBI
- Production deploy evidence artifact: pending-production-deploy-evidence-artifact
- Production deploy run ID: pending
- Production deploy evidence artifact ID: pending
- Production deploy evidence artifact digest: pending
- GitHub environment protection rules: 2
- Cloudflare visible D1 names: none
- Cloudflare visible Pages projects: none
- DNS Cloudflare zone ready: false
- DNS apex record present: true
- Live HTTPS status: unknown
- Live health status: unknown
- Live health D1 bound: unknown
- Live production smoke: unavailable
- Live public surface checks: news=false, signalsRss=false, search=false, herbalChat=false, referenceBooks=false

## Next Actions

- Dispatch Herbalisti Production Deploy only after Cloudflare DNS/domain approval is ready.
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
- npm run verify:production-deploy-evidence-artifact -- --strict --run-id <production_deploy_run_id>
- npm run verify:production -- https://herbalisti.com
- Set the required GitHub production environment credentials listed by npm run verify:github-production-readiness.
- Use the guarded GitHub production workflow to resolve or create the D1 database named herbalisti, or run the manual Cloudflare D1/configuration path.
- Confirm Cloudflare runtime secret setup for protected feed refresh; Seedance media secrets remain optional until approved.
- Run npm run verify:launch again.
