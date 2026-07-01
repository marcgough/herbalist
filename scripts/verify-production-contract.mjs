import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const readJson = (path) => JSON.parse(read(path))
const exists = (path) => existsSync(resolve(root, path))

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const contract = readJson('docs/production-environment-contract.json')
const packageJson = readJson('package.json')
const envExample = read('.env.example')
const pagesToml = read('wrangler.toml')
const newsToml = read('wrangler.news.toml')
const runbook = read('docs/deployment-runbook.md')
const launchPacketDoc = read('docs/production-launch-packet.md')
const launchPacketScript = read('scripts/prepare-launch-packet.mjs')
const externalActionsDoc = read('docs/external-launch-actions.md')
const externalActionsJson = readJson('docs/external-launch-actions.json')
const productionStateScript = read('scripts/prepare-production-state-snapshot.mjs')
const productionCutoverDoc = read('docs/production-cutover-simulation.md')
const productionCutoverJson = readJson('docs/production-cutover-simulation.json')
const corpusRightsAudit = readJson('corpus/exports/corpus-rights-audit-summary.json')

const scripts = packageJson.scripts ?? {}
const resources = Object.fromEntries(contract.resources.map((resource) => [resource.id, resource]))
const secretNames = contract.secrets.map((secret) => secret.name)
const npmRunCommands = Object.values(contract.commands)
  .flat()
  .map((command) => command.match(/^npm run ([^\s]+)/)?.[1])
  .filter(Boolean)

const readBindingValue = (toml, key) => toml.match(new RegExp(`^\\s*${key}\\s*=\\s*"([^"]+)"\\s*$`, 'm'))?.[1] ?? ''

const readActiveD1Binding = (toml) => {
  const binding = readBindingValue(toml, 'binding')
  const databaseName = readBindingValue(toml, 'database_name')
  const databaseId = readBindingValue(toml, 'database_id')

  if (
    !/^\s*\[\[d1_databases\]\]/m.test(toml) ||
    binding !== 'HERBALISTI_DB' ||
    databaseName !== 'herbalisti' ||
    !databaseId ||
    databaseId.includes('<') ||
    /replace-after|todo/i.test(databaseId)
  ) {
    return null
  }

  return { binding, databaseName, databaseId }
}

assert(contract.version === 1, 'Production contract version should be 1')
assert(contract.project.domain === 'herbalisti.com', 'Production domain should be herbalisti.com')
assert(contract.project.pagesProject === 'herbalisti', 'Pages project should be herbalisti')
assert(contract.project.newsWorker === 'herbalisti-news-refresh', 'News Worker name should be herbalisti-news-refresh')
assert(contract.project.d1Database === 'herbalisti', 'D1 database should be herbalisti')
assert(contract.project.optionalR2Bucket === 'herbalisti-media', 'Optional R2 bucket should be herbalisti-media')

assert(resources['cloudflare-pages']?.required === true, 'Cloudflare Pages should be required')
assert(
  resources['cloudflare-pages']?.verify?.includes('GET /opensearch.xml'),
  'Cloudflare Pages verification should include the OpenSearch description route',
)
assert(
  resources['cloudflare-pages']?.verify?.includes('GET /api/signals.xml'),
  'Cloudflare Pages verification should include the Signals RSS route',
)
assert(
  resources['cloudflare-pages']?.verify?.includes('POST /api/feed-refresh'),
  'Cloudflare Pages verification should include the protected feed-refresh route',
)
assert(
  resources['cloudflare-pages']?.verify?.includes(
    'npm run seed:production-feed -- --base-url https://herbalisti.com --confirm seed-herbalisti-feed',
  ),
  'Cloudflare Pages verification should include the protected production feed seed command',
)
assert(
  resources['cloudflare-pages']?.verify?.includes('GET /data/remedies.json'),
  'Cloudflare Pages verification should include the public data export route',
)
assert(
  resources['cloudflare-pages']?.verify?.includes('npm run verify:dns-cutover'),
  'Cloudflare Pages verification should include DNS/custom-domain cutover verification',
)
assert(
  resources['cloudflare-pages']?.verify?.includes('GET /data/api-catalog.json'),
  'Cloudflare Pages verification should include the public API catalog route',
)
assert(
  resources['cloudflare-pages']?.verify?.includes('GET /data/reference-lanes.json'),
  'Cloudflare Pages verification should include the reference lane export route',
)
assert(
  resources['cloudflare-pages']?.verify?.includes('GET /data/herbal-knowledge.json'),
  'Cloudflare Pages verification should include the herbal commons export route',
)
assert(resources['cloudflare-d1']?.required === true, 'Cloudflare D1 should be required')
assert(
  resources['cloudflare-d1']?.verify?.includes('npm run verify:d1-manifest'),
  'Cloudflare D1 verification should include the production migration manifest',
)
assert(
  resources['cloudflare-d1']?.verify?.includes('npm run verify:production-d1-resolver'),
  'Cloudflare D1 verification should include the mocked production D1 resolver verifier',
)
assert(
  resources['cloudflare-d1']?.productionWorkflowResolution ===
    'npm run resolve:production-d1 -- --create-if-missing --github-env "$GITHUB_ENV"',
  'Cloudflare D1 should be resolved inside the guarded production workflow by database name',
)
assert(resources['scheduled-news-worker']?.required === true, 'Scheduled news Worker should be required')
assert(resources['media-r2']?.required === false, 'R2 media bucket should remain optional before approved videos exist')

assert(pagesToml.includes('name = "herbalisti"'), 'wrangler.toml should target the Herbalisti Pages project')
assert(pagesToml.includes('pages_build_output_dir = "dist"'), 'wrangler.toml should use the Vite dist output')
assert(newsToml.includes('name = "herbalisti-news-refresh"'), 'wrangler.news.toml should target the scheduled news Worker')
assert(newsToml.includes('main = "workers/news-refresh.js"'), 'wrangler.news.toml should point to the news refresh Worker')
assert(newsToml.includes('crons = ["17 */6 * * *"]'), 'wrangler.news.toml should keep the six-hour refresh cron')

const pagesD1Binding = readActiveD1Binding(pagesToml)
const newsD1Binding = readActiveD1Binding(newsToml)
if (pagesD1Binding && newsD1Binding) {
  assert(
    pagesD1Binding.databaseId === newsD1Binding.databaseId,
    'Pages and scheduled Worker should point to the same HERBALISTI_DB database ID',
  )
}

assert(exists('functions/api/health.js'), 'Production contract requires the public health endpoint')
assert(exists('functions/api/herbal-knowledge.js'), 'Production contract requires the herbal knowledge endpoint')
assert(exists('functions/api/herbal-chat.js'), 'Production contract requires the herbal chat endpoint')
assert(exists('functions/_lib/herbal-knowledge.js'), 'Production contract requires the herbal knowledge helper')
assert(exists('functions/api/signals.xml.js'), 'Production contract requires the public Signals RSS endpoint')
assert(exists('functions/api/feed-refresh.js'), 'Production contract requires the protected feed refresh endpoint')
assert(exists('functions/_lib/signals-rss.js'), 'Production contract requires the Signals RSS helper')
assert(exists('functions/_lib/news-refresh.js'), 'Production contract requires the shared news refresh helper')
assert(exists('scripts/lib/static-news-refresh.mjs'), 'Production contract requires the static news refresh helper')
assert(exists('scripts/verify-static-news-refresh.mjs'), 'Production contract requires the static news refresh verifier')
assert(exists('scripts/verify-signal-coverage.mjs'), 'Production contract requires the signal coverage verifier')
assert(exists('scripts/export-public-data.mjs'), 'Production contract requires the public data export generator')
assert(exists('scripts/verify-data-exports.mjs'), 'Production contract requires the public data export verifier')
assert(exists('scripts/verify-api-catalog.mjs'), 'Production contract requires the API catalog verifier')
assert(exists('scripts/verify-search-discovery.mjs'), 'Production contract requires the search discovery verifier')
assert(exists('public/data/reference-lanes.json'), 'Production contract requires the reference lane public export')
assert(exists('public/data/reference-books.json'), 'Production contract requires the reference book public export')
assert(exists('public/opensearch.xml'), 'Production contract requires the OpenSearch description')
assert(exists('public/data/herbal-knowledge.json'), 'Production contract requires the herbal commons public export')
assert(exists('public/data/remedies.json'), 'Production contract requires the remedy public export')
assert(exists('public/data/citation-notes.json'), 'Production contract requires the citation notes public export')
assert(exists('public/data/sources.json'), 'Production contract requires the source registry public export')
assert(exists('public/data/discovery-metadata.json'), 'Production contract requires the discovery metadata public export')
assert(exists('public/data/api-catalog.json'), 'Production contract requires the API catalog public export')
assert(exists('corpus/derived/herb-profiles/profiles.json'), 'Production contract requires the herb profile corpus export')
assert(exists('corpus/exports/herb-profile-summary.json'), 'Production contract requires the herb profile summary')
assert(exists('corpus-memory/state.json'), 'Production contract requires the separated Corpus Memory state marker')
assert(exists('corpus-memory/README.md'), 'Production contract requires the Corpus Memory boundary documentation')
assert(exists('scripts/verify-corpus-rights.mjs'), 'Production contract requires the corpus rights verifier')
assert(exists('scripts/verify-corpus-memory.mjs'), 'Production contract requires the Corpus Memory verifier')
assert(exists('scripts/verify-discovery-metadata.mjs'), 'Production contract requires the discovery metadata verifier')
assert(exists('corpus/exports/corpus-rights-audit-summary.json'), 'Production contract requires the corpus rights audit summary')
assert(exists('docs/corpus-rights-audit.md'), 'Production contract requires the corpus rights audit Markdown handoff')
assert(exists('corpus/derived/australia-lane/README.md'), 'Production contract requires the Australia lane README')
assert(exists('corpus/derived/australia-lane/candidate-sources.json'), 'Production contract requires the Australia lane source queue')
assert(exists('corpus/derived/australia-lane/search-themes.json'), 'Production contract requires the Australia lane search themes')
assert(exists('corpus/exports/australia-lane-summary.json'), 'Production contract requires the Australia lane summary')
assert(exists('scripts/prepare-external-actions.mjs'), 'Production contract requires the external action packet generator')
assert(exists('scripts/verify-external-actions.mjs'), 'Production contract requires the external action verifier')
assert(exists('scripts/prepare-completion-audit.mjs'), 'Production contract requires the objective completion audit generator')
assert(exists('scripts/prepare-production-provisioning.mjs'), 'Production contract requires the production provisioning readiness generator')
assert(exists('scripts/prepare-production-operator-brief.mjs'), 'Production contract requires the production operator brief generator')
assert(exists('scripts/prepare-production-state-snapshot.mjs'), 'Production contract requires the production state snapshot generator')
assert(exists('scripts/prepare-d1-production-manifest.mjs'), 'Production contract requires the D1 production migration manifest generator')
assert(exists('scripts/prepare-dns-cutover-plan.mjs'), 'Production contract requires the DNS cutover plan generator')
assert(exists('scripts/prepare-production-secret-setup.mjs'), 'Production contract requires the production secret setup generator')
assert(
  exists('scripts/set-github-production-credentials.mjs'),
  'Production contract requires the GitHub production credential helper',
)
assert(
  exists('scripts/verify-github-production-credential-helper.mjs'),
  'Production contract requires the GitHub production credential helper write-path verifier',
)
assert(exists('scripts/set-github-generated-secrets.mjs'), 'Production contract requires the GitHub generated secret helper')
assert(exists('scripts/prepare-cloudflare-token-requirements.mjs'), 'Production contract requires the Cloudflare token requirement generator')
assert(exists('scripts/resolve-production-d1-database.mjs'), 'Production contract requires the production D1 resolver')
assert(exists('scripts/verify-production-d1-resolver.mjs'), 'Production contract requires the production D1 resolver verifier')
assert(exists('scripts/verify-production-deploy-dry-run.mjs'), 'Production contract requires the production deploy dry-run verifier')
assert(exists('scripts/verify-production-deploy-workflow.mjs'), 'Production contract requires the production deploy workflow verifier')
assert(
  exists('scripts/verify-production-dispatch-preflight.mjs'),
  'Production contract requires the production dispatch preflight verifier',
)
assert(exists('scripts/prepare-production-deploy-evidence.mjs'), 'Production contract requires the production deploy evidence packet generator')
assert(exists('scripts/verify-production-deploy-evidence-artifact.mjs'), 'Production contract requires the production deploy evidence artifact readback verifier')
assert(exists('scripts/prepare-github-production-dispatch.mjs'), 'Production contract requires the GitHub production dispatch packet generator')
assert(exists('scripts/seed-production-feed.mjs'), 'Production contract requires the production feed seed command')
assert(exists('scripts/verify-production-feed-seed.mjs'), 'Production contract requires the production feed seed verifier')
assert(exists('scripts/verify-accessibility-smoke.mjs'), 'Production contract requires the accessibility smoke verifier')
assert(exists('scripts/verify-visual-smoke.mjs'), 'Production contract requires the desktop/mobile visual smoke verifier')
assert(exists('scripts/verify-github-actions.mjs'), 'Production contract requires the GitHub Actions handoff verifier')
assert(exists('scripts/verify-github-production-readiness.mjs'), 'Production contract requires the GitHub production readiness verifier')
assert(exists('scripts/verify-github-release-evidence.mjs'), 'Production contract requires the GitHub release evidence verifier')
assert(exists('scripts/verify-cloudflare-production-state.mjs'), 'Production contract requires the Cloudflare production state verifier')
assert(exists('.github/workflows/ci.yml'), 'Production contract requires the GitHub CI workflow')
assert(exists('.github/workflows/release-gate.yml'), 'Production contract requires the manual release-gate workflow')
assert(exists('.github/workflows/production-deploy.yml'), 'Production contract requires the guarded production deploy workflow')
assert(exists('docs/objective-completion-audit.json'), 'Production contract requires the objective completion audit JSON')
assert(exists('docs/objective-completion-audit.md'), 'Production contract requires the objective completion audit Markdown')
assert(exists('docs/external-launch-actions.json'), 'Production contract requires the external action JSON handoff')
assert(exists('docs/external-launch-actions.md'), 'Production contract requires the external action Markdown handoff')
assert(exists('docs/production-provisioning-readiness.json'), 'Production contract requires the production provisioning readiness JSON')
assert(exists('docs/production-provisioning-readiness.md'), 'Production contract requires the production provisioning readiness Markdown')
assert(exists('docs/production-operator-brief.json'), 'Production contract requires the production operator brief JSON')
assert(exists('docs/production-operator-brief.md'), 'Production contract requires the production operator brief Markdown')
assert(exists('docs/production-state-snapshot.json'), 'Production contract requires the production state snapshot JSON')
assert(exists('docs/production-state-snapshot.md'), 'Production contract requires the production state snapshot Markdown')
assert(exists('docs/github-production-dispatch.json'), 'Production contract requires the GitHub production dispatch JSON')
assert(exists('docs/github-production-dispatch.md'), 'Production contract requires the GitHub production dispatch Markdown')
assert(exists('docs/d1-production-migration-manifest.json'), 'Production contract requires the D1 production migration manifest JSON')
assert(exists('docs/d1-production-migration-manifest.md'), 'Production contract requires the D1 production migration manifest Markdown')
assert(exists('docs/dns-cutover-plan.json'), 'Production contract requires the DNS cutover plan JSON')
assert(exists('docs/dns-cutover-plan.md'), 'Production contract requires the DNS cutover plan Markdown')
assert(exists('docs/production-secret-setup.json'), 'Production contract requires the production secret setup JSON')
assert(exists('docs/production-secret-setup.md'), 'Production contract requires the production secret setup Markdown')
assert(exists('docs/cloudflare-token-requirements.json'), 'Production contract requires the Cloudflare token requirements JSON')
assert(exists('docs/cloudflare-token-requirements.md'), 'Production contract requires the Cloudflare token requirements Markdown')
assert(exists('scripts/simulate-production-cutover.mjs'), 'Production contract requires the production cutover simulation')
assert(
  exists('scripts/verify-production-cutover-simulation.mjs'),
  'Production contract requires the production cutover simulation verifier',
)
assert(exists('docs/production-cutover-simulation.json'), 'Production contract requires the production cutover JSON handoff')
assert(exists('docs/production-cutover-simulation.md'), 'Production contract requires the production cutover Markdown handoff')
assert(exists('workers/news-refresh.js'), 'Production contract requires the scheduled news Worker')
assert(exists('migrations/0001_initial.sql'), 'Production contract requires D1 migrations')
assert(exists('migrations/0006_seed_remedies.sql'), 'Production contract requires the remedy seed migration')
assert(exists('migrations/0007_source_independence_review.sql'), 'Production contract requires the source review migration')
assert(exists('migrations/0008_seed_citation_notes.sql'), 'Production contract requires the citation notes migration')
assert(exists('migrations/0009_remedy_plant_parts.sql'), 'Production contract requires the remedy plant-parts migration')
assert(
  contract.commands.safePreflight.includes('npm run verify:static-news-refresh'),
  'Safe preflight should include static news refresh verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:signal-coverage'),
  'Safe preflight should include signal coverage verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:signal-intelligence'),
  'Safe preflight should include signal intelligence verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:signals-rss'),
  'Safe preflight should include Signals RSS verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:source-governance'),
  'Safe preflight should include source governance verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:knowledge-graph'),
  'Safe preflight should include knowledge graph verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:citation-notes'),
  'Safe preflight should include citation notes verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:source-health'),
  'Safe preflight should include source health verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:corpus-rights'),
  'Safe preflight should include corpus rights audit verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:corpus-memory'),
  'Safe preflight should include Corpus Memory verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:data-exports'),
  'Safe preflight should include public data export verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:discovery-metadata'),
  'Safe preflight should include discovery metadata verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:api-catalog'),
  'Safe preflight should include API catalog verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:search-discovery'),
  'Safe preflight should include search discovery verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:australia-lane'),
  'Safe preflight should include Australia lane rights-boundary verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:external-actions'),
  'Safe preflight should include external action checklist verification',
)
assert(
  contract.commands.safePreflight.includes('npm run prepare:completion-audit'),
  'Safe preflight should refresh the objective completion audit',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:completion-audit'),
  'Safe preflight should include objective completion audit verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:visual-smoke'),
  'Safe preflight should include desktop/mobile visual smoke verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:accessibility-smoke'),
  'Safe preflight should include accessibility smoke verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:production-cutover'),
  'Safe preflight should include production cutover simulation verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:github-actions'),
  'Safe preflight should include GitHub Actions handoff verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:production-deploy-workflow'),
  'Safe preflight should include guarded production deploy workflow verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:production-deploy-evidence'),
  'Safe preflight should include guarded production deploy evidence verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:production-deploy-evidence-artifact'),
  'Safe preflight should include guarded production deploy evidence artifact readback verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:production-deploy-dry-run'),
  'Safe preflight should include guarded production deploy dry-run verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:production-d1-resolver'),
  'Safe preflight should include mocked production D1 resolver verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:production-feed-seed'),
  'Safe preflight should include production feed seed verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:github-production-dispatch'),
  'Safe preflight should include GitHub production dispatch packet verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:production-dispatch-preflight'),
  'Safe preflight should include production dispatch preflight verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:github-production-readiness'),
  'Safe preflight should include GitHub production readiness verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:github-release-evidence'),
  'Safe preflight should include GitHub CI and manual release evidence verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:production-state-current'),
  'Safe preflight should include current-commit production state evidence verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:cloudflare-production-state'),
  'Safe preflight should include the read-only Cloudflare production state probe',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:cloudflare-token-requirements'),
  'Safe preflight should include Cloudflare API token requirement verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:d1-manifest'),
  'Safe preflight should include D1 production migration manifest verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:dns-cutover'),
  'Safe preflight should include DNS/custom-domain cutover verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:production-secrets'),
  'Safe preflight should include production secret setup verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:github-production-credentials'),
  'Safe preflight should include GitHub production credential helper verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:github-generated-secrets'),
  'Safe preflight should include GitHub generated admin secret helper verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:production-state'),
  'Safe preflight should include production state snapshot verification',
)
assert(
  contract.commands.safePreflight.includes('npm run prepare:production-provisioning'),
  'Safe preflight should refresh production provisioning readiness',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:production-provisioning'),
  'Safe preflight should include production provisioning readiness verification',
)
assert(
  contract.commands.safePreflight.includes('npm run verify:production-operator-brief'),
  'Safe preflight should include production operator brief verification',
)

for (const name of secretNames) {
  assert(envExample.includes(`${name}=`), `.env.example should document ${name}`)
}
assert(envExample.includes('HERBALISTI_D1_DATABASE_ID='), '.env.example should document the local D1 binding helper')
assert(!envExample.includes('CLOUDFLARE_D1_DATABASE_ID='), '.env.example should not present the D1 database ID as a Cloudflare secret')

for (const scriptName of npmRunCommands) {
  assert(Boolean(scripts[scriptName]), `package.json should include script ${scriptName}`)
}

assert(
  contract.secrets
    .filter((secret) => secret.requiredForLaunch)
    .map((secret) => secret.name)
    .join(',') === 'FEED_ADMIN_TOKEN',
  'Only the protected feed-refresh runtime secret should be required for launch',
)
assert(
  contract.secrets
    .filter((secret) => secret.setCommand)
    .every((secret) => !secret.setCommand.includes('<') && !secret.setCommand.includes('TOKEN_VALUE')),
  'Secret set commands should never include placeholder secret values',
)
assert(
  contract.secrets
    .flatMap((secret) => secret.additionalSetCommands ?? [])
    .every((command) => !command.includes('<') && !command.includes('TOKEN_VALUE')),
  'Additional secret set commands should never include placeholder secret values',
)
assert(
  contract.secrets
    .find((secret) => secret.name === 'FEED_ADMIN_TOKEN')
    ?.additionalSetCommands?.includes('npx wrangler pages secret put FEED_ADMIN_TOKEN --project-name herbalisti'),
  'FEED_ADMIN_TOKEN should also be set as a Pages secret for protected feed refresh',
)
assert(
  contract.commands.setSecrets.includes('npx wrangler pages secret put FEED_ADMIN_TOKEN --project-name herbalisti'),
  'Contract setSecrets should include the Pages feed-refresh secret command',
)
assert(
  contract.commands.seedProductionFeed?.includes(
    'npm run seed:production-feed -- --base-url https://herbalisti.com --confirm seed-herbalisti-feed',
  ),
  'Contract should include the canonical production feed seed command',
)
assert(
  contract.commands.githubProductionDeploy?.[0]?.includes(
    'skip_live_verification_confirm=skip-herbalisti-live-verification',
  ),
  'Contract should document the live-verification skip acknowledgement phrase',
)
assert(
  contract.guardrails?.liveVerificationSkipRequiresAcknowledgement === true,
  'Contract guardrails should require acknowledgement before skipping live verification',
)
assert(
  contract.commands.liveCompletionGates.includes('npm run verify:live-readiness -- --strict'),
  'Live completion gates should include strict live-domain readiness verification',
)
assert(
  contract.commands.liveCompletionGates.includes('npm run verify:production -- https://herbalisti.com'),
  'Live completion gates should include production verification',
)
assert(
  contract.commands.liveCompletionGates.includes('npm run verify:goal-readiness -- --strict'),
  'Live completion gates should include strict goal-readiness verification',
)
assert(
  contract.commands.finalCompletionGates.includes(
    'npm run verify:production-deploy-evidence-artifact -- --strict --run-id <production_deploy_run_id>',
  ),
  'Final completion gates should include strict production deploy evidence artifact readback verification',
)
for (const command of contract.commands.liveCompletionGates) {
  assert(
    contract.commands.finalCompletionGates.includes(command),
    `Final completion gates should include live completion gate: ${command}`,
  )
}
for (const command of contract.commands.liveCompletionGates) {
  assert(launchPacketScript.includes(command), `Launch packet generator should include live completion gate: ${command}`)
}
for (const command of contract.commands.finalCompletionGates) {
  assert(launchPacketScript.includes(command), `Launch packet generator should include final completion gate: ${command}`)
}
assert(
  launchPacketScript.includes('npm run verify:github-actions'),
  'Launch packet generator should include GitHub Actions handoff verification',
)
assert(
  launchPacketScript.includes('npm run verify:production-deploy-workflow'),
  'Launch packet generator should include production deploy workflow verification',
)
assert(
  launchPacketScript.includes('npm run verify:production-deploy-evidence'),
  'Launch packet generator should include production deploy evidence verification',
)
assert(
  launchPacketScript.includes('npm run verify:production-deploy-evidence-artifact'),
  'Launch packet generator should include production deploy evidence artifact readback verification',
)
assert(
  launchPacketScript.includes('skip_live_verification_confirm=skip-herbalisti-live-verification'),
  'Launch packet generator should document the live-verification skip acknowledgement phrase',
)
assert(
  launchPacketScript.includes('npm run verify:production-deploy-dry-run'),
  'Launch packet generator should include production deploy dry-run verification',
)
assert(
  launchPacketScript.includes('npm run verify:production-d1-resolver'),
  'Launch packet generator should include production D1 resolver verification',
)
assert(
  launchPacketScript.includes('npm run verify:production-feed-seed'),
  'Launch packet generator should include production feed seed verification',
)
assert(
  launchPacketScript.includes('npm run verify:github-production-dispatch'),
  'Launch packet generator should include GitHub production dispatch packet verification',
)
assert(
  launchPacketScript.includes('npm run verify:production-dispatch-preflight'),
  'Launch packet generator should include production dispatch preflight verification',
)
assert(
  launchPacketScript.includes('npm run seed:production-feed -- --base-url https://herbalisti.com --confirm seed-herbalisti-feed'),
  'Launch packet generator should include production feed seed command',
)
assert(
  launchPacketScript.includes('npm run verify:github-production-readiness'),
  'Launch packet generator should include GitHub production readiness verification',
)
assert(
  launchPacketScript.includes('npm run verify:github-release-evidence'),
  'Launch packet generator should include GitHub release evidence verification',
)
assert(
  launchPacketScript.includes('npm run verify:production-state-current'),
  'Launch packet generator should include current-commit production state evidence verification',
)
assert(
  launchPacketScript.includes('npm run verify:cloudflare-production-state'),
  'Launch packet generator should include Cloudflare production state verification',
)
assert(
  launchPacketScript.includes('npm run verify:d1-manifest'),
  'Launch packet generator should include D1 production migration manifest verification',
)
assert(
  launchPacketScript.includes('npm run verify:dns-cutover'),
  'Launch packet generator should include DNS/custom-domain cutover verification',
)
assert(
  launchPacketScript.includes('npm run verify:production-secrets'),
  'Launch packet generator should include production secret setup verification',
)
assert(
  launchPacketScript.includes('npm run verify:github-production-credentials'),
  'Launch packet generator should include GitHub production credential helper verification',
)
assert(
  launchPacketScript.includes('npm run verify:github-generated-secrets'),
  'Launch packet generator should include GitHub generated admin secret helper verification',
)
assert(
  launchPacketScript.includes('npm run verify:production-state'),
  'Launch packet generator should include production state snapshot verification',
)
assert(
  launchPacketScript.includes('npm run verify:production-provisioning'),
  'Launch packet generator should include production provisioning readiness verification',
)
assert(
  launchPacketScript.includes('npm run verify:production-operator-brief'),
  'Launch packet generator should include production operator brief verification',
)

for (const [key, enabled] of Object.entries(contract.guardrails)) {
  if (typeof enabled === 'boolean') {
    assert(enabled === true, `Guardrail ${key} should be enabled`)
  }
}
assert(contract.guardrails.medicalAdvice === 'disabled', 'Medical advice should remain disabled')
assert(contract.guardrails.publicAccounts === 'disabled', 'Public accounts should remain disabled')
assert(contract.guardrails.sourceMode === 'allowlist_first', 'Source mode should remain allowlist-first')

assert(
  runbook.includes('production-environment-contract.json'),
  'Deployment runbook should reference the production environment contract',
)
assert(runbook.includes('verify:source-governance'), 'Deployment runbook should document source governance verification')
assert(runbook.includes('verify:static-news-refresh'), 'Deployment runbook should document static news refresh verification')
assert(runbook.includes('verify:signal-coverage'), 'Deployment runbook should document signal coverage verification')
assert(runbook.includes('verify:signal-intelligence'), 'Deployment runbook should document signal intelligence verification')
assert(runbook.includes('verify:signals-rss'), 'Deployment runbook should document Signals RSS verification')
assert(runbook.includes('verify:knowledge-graph'), 'Deployment runbook should document knowledge graph verification')
assert(runbook.includes('verify:citation-notes'), 'Deployment runbook should document citation notes verification')
assert(runbook.includes('verify:source-health'), 'Deployment runbook should document source health verification')
assert(runbook.includes('verify:corpus-rights'), 'Deployment runbook should document corpus rights verification')
assert(runbook.includes('verify:corpus-memory'), 'Deployment runbook should document Corpus Memory verification')
assert(runbook.includes('verify:data-exports'), 'Deployment runbook should document public data export verification')
assert(runbook.includes('verify:discovery-metadata'), 'Deployment runbook should document discovery metadata verification')
assert(runbook.includes('verify:api-catalog'), 'Deployment runbook should document API catalog verification')
assert(runbook.includes('verify:search-discovery'), 'Deployment runbook should document search discovery verification')
assert(runbook.includes('verify:australia-lane'), 'Deployment runbook should document Australia lane verification')
assert(runbook.includes('verify:external-actions'), 'Deployment runbook should document external action verification')
assert(runbook.includes('prepare:completion-audit'), 'Deployment runbook should document completion audit generation')
assert(runbook.includes('verify:completion-audit'), 'Deployment runbook should document completion audit verification')
assert(runbook.includes('verify:accessibility-smoke'), 'Deployment runbook should document accessibility smoke verification')
assert(runbook.includes('verify:visual-smoke'), 'Deployment runbook should document visual smoke verification')
assert(runbook.includes('verify:github-actions'), 'Deployment runbook should document GitHub Actions verification')
assert(runbook.includes('verify:production-deploy-workflow'), 'Deployment runbook should document production deploy workflow verification')
assert(runbook.includes('verify:production-deploy-evidence'), 'Deployment runbook should document production deploy evidence verification')
assert(runbook.includes('verify:production-deploy-evidence-artifact'), 'Deployment runbook should document production deploy evidence artifact readback verification')
assert(
  runbook.includes('skip_live_verification_confirm=skip-herbalisti-live-verification'),
  'Deployment runbook should document the live-verification skip acknowledgement phrase',
)
assert(runbook.includes('verify:production-deploy-dry-run'), 'Deployment runbook should document production deploy dry-run verification')
assert(runbook.includes('verify:production-d1-resolver'), 'Deployment runbook should document production D1 resolver verification')
assert(runbook.includes('verify:production-feed-seed'), 'Deployment runbook should document production feed seed verification')
assert(runbook.includes('verify:github-production-dispatch'), 'Deployment runbook should document GitHub production dispatch packet verification')
assert(runbook.includes('verify:production-dispatch-preflight'), 'Deployment runbook should document production dispatch preflight verification')
assert(runbook.includes('verify:github-production-readiness'), 'Deployment runbook should document GitHub production readiness verification')
assert(runbook.includes('verify:github-release-evidence'), 'Deployment runbook should document GitHub release evidence verification')
assert(runbook.includes('verify:production-state-current'), 'Deployment runbook should document current-commit production state evidence verification')
assert(runbook.includes('verify:cloudflare-production-state'), 'Deployment runbook should document Cloudflare production state verification')
assert(runbook.includes('verify:cloudflare-token-requirements'), 'Deployment runbook should document Cloudflare token requirement verification')
assert(runbook.includes('verify:d1-manifest'), 'Deployment runbook should document D1 production migration manifest verification')
assert(runbook.includes('verify:dns-cutover'), 'Deployment runbook should document DNS/custom-domain cutover verification')
assert(runbook.includes('verify:production-secrets'), 'Deployment runbook should document production secret setup verification')
assert(
  runbook.includes('verify:github-production-credentials'),
  'Deployment runbook should document GitHub production credential helper verification',
)
assert(
  runbook.includes('verify:github-production-credential-helper'),
  'Deployment runbook should document GitHub production credential helper write-path verification',
)
assert(
  runbook.includes('verify:github-generated-secrets'),
  'Deployment runbook should document GitHub generated admin secret helper verification',
)
assert(runbook.includes('verify:production-state'), 'Deployment runbook should document production state snapshot verification')
assert(runbook.includes('resolve:production-d1'), 'Deployment runbook should document guarded D1 resolution')
assert(runbook.includes('verify:production-provisioning'), 'Deployment runbook should document production provisioning readiness verification')
assert(runbook.includes('verify:production-operator-brief'), 'Deployment runbook should document production operator brief verification')
assert(
  launchPacketDoc.includes('production-environment-contract.json'),
  'Production launch packet doc should reference the production environment contract',
)
assert(
  launchPacketDoc.includes('verify:external-actions'),
  'Production launch packet doc should include external action verification',
)
assert(
  launchPacketDoc.includes('verify:corpus-memory'),
  'Production launch packet doc should include Corpus Memory verification',
)
assert(
  launchPacketDoc.includes('verify:production-cutover'),
  'Production launch packet doc should include production cutover simulation verification',
)
assert(
  launchPacketDoc.includes('verify:discovery-metadata'),
  'Production launch packet doc should include discovery metadata verification',
)
assert(
  launchPacketDoc.includes('verify:api-catalog'),
  'Production launch packet doc should include API catalog verification',
)
assert(
  launchPacketDoc.includes('verify:search-discovery'),
  'Production launch packet doc should include search discovery verification',
)
assert(
  launchPacketDoc.includes('verify:visual-smoke'),
  'Production launch packet doc should include visual smoke verification',
)
assert(
  launchPacketDoc.includes('verify:accessibility-smoke'),
  'Production launch packet doc should include accessibility smoke verification',
)
assert(
  launchPacketDoc.includes('verify:github-actions'),
  'Production launch packet doc should include GitHub Actions verification',
)
assert(
  launchPacketDoc.includes('verify:production-deploy-workflow'),
  'Production launch packet doc should include production deploy workflow verification',
)
assert(
  launchPacketDoc.includes('verify:production-deploy-evidence'),
  'Production launch packet doc should include production deploy evidence verification',
)
assert(
  launchPacketDoc.includes('verify:production-deploy-evidence-artifact'),
  'Production launch packet doc should include production deploy evidence artifact readback verification',
)
assert(
  launchPacketDoc.includes('skip_live_verification_confirm=skip-herbalisti-live-verification'),
  'Production launch packet doc should include the live-verification skip acknowledgement phrase',
)
assert(
  launchPacketDoc.includes('verify:production-deploy-dry-run'),
  'Production launch packet doc should include production deploy dry-run verification',
)
assert(
  launchPacketDoc.includes('verify:production-d1-resolver'),
  'Production launch packet doc should include production D1 resolver verification',
)
assert(
  launchPacketDoc.includes('verify:production-feed-seed'),
  'Production launch packet doc should include production feed seed verification',
)
assert(
  launchPacketDoc.includes('verify:github-production-dispatch'),
  'Production launch packet doc should include GitHub production dispatch packet verification',
)
assert(
  launchPacketDoc.includes('verify:production-dispatch-preflight'),
  'Production launch packet doc should include production dispatch preflight verification',
)
assert(
  launchPacketDoc.includes('seed:production-feed'),
  'Production launch packet doc should include the production feed seed command',
)
assert(
  launchPacketDoc.includes('verify:github-production-readiness'),
  'Production launch packet doc should include GitHub production readiness verification',
)
assert(
  launchPacketDoc.includes('verify:github-release-evidence'),
  'Production launch packet doc should include GitHub release evidence verification',
)
assert(
  launchPacketDoc.includes('verify:production-state-current'),
  'Production launch packet doc should include current-commit production state evidence verification',
)
assert(
  launchPacketDoc.includes('verify:cloudflare-production-state'),
  'Production launch packet doc should include Cloudflare production state verification',
)
assert(
  launchPacketDoc.includes('verify:cloudflare-token-requirements'),
  'Production launch packet doc should include Cloudflare token requirement verification',
)
assert(
  launchPacketDoc.includes('verify:d1-manifest'),
  'Production launch packet doc should include D1 production migration manifest verification',
)
assert(
  launchPacketDoc.includes('verify:dns-cutover'),
  'Production launch packet doc should include DNS/custom-domain cutover verification',
)
assert(
  launchPacketDoc.includes('verify:production-secrets'),
  'Production launch packet doc should include production secret setup verification',
)
assert(
  launchPacketDoc.includes('verify:github-production-credentials'),
  'Production launch packet doc should include GitHub production credential helper verification',
)
assert(
  launchPacketDoc.includes('verify:github-generated-secrets'),
  'Production launch packet doc should include GitHub generated admin secret helper verification',
)
assert(
  launchPacketDoc.includes('verify:production-state'),
  'Production launch packet doc should include production state snapshot verification',
)
assert(
  launchPacketDoc.includes('resolve:production-d1'),
  'Production launch packet doc should include guarded D1 resolution',
)
assert(
  launchPacketDoc.includes('verify:production-provisioning'),
  'Production launch packet doc should include production provisioning readiness verification',
)
assert(
  launchPacketDoc.includes('verify:production-operator-brief'),
  'Production launch packet doc should include production operator brief verification',
)
assert(
  externalActionsDoc.includes('Do not paste secret values into chat'),
  'External action doc should include the secret-handling boundary',
)
assert(
  externalActionsJson.localAllowedActions?.some((action) => action.id === 'run-production-cutover-simulation'),
  'External action checklist should include the local production cutover simulation action',
)
assert(
  externalActionsJson.localAllowedActions?.some((action) => action.id === 'check-current-production-state-evidence'),
  'External action checklist should include the current production state evidence action',
)
assert(
  externalActionsJson.localAllowedActions?.some(
    (action) => action.id === 'generate-github-production-dispatch-packet',
  ),
  'External action checklist should include the GitHub production dispatch packet action',
)
assert(
  externalActionsJson.approvalRequiredActions?.some((action) => action.id === 'run-github-production-deploy-workflow'),
  'External action checklist should include the guarded GitHub production deploy workflow action',
)
assert(
  externalActionsJson.approvalRequiredActions
    ?.find((action) => action.id === 'run-github-production-deploy-workflow')
    ?.verification?.includes('npm run verify:production-state-current'),
  'External action checklist should require current production state evidence before the guarded GitHub production deploy workflow',
)
assert(
  externalActionsJson.approvalRequiredActions
    ?.find((action) => action.id === 'run-github-production-deploy-workflow')
    ?.verification?.includes('npm run verify:github-production-dispatch'),
  'External action checklist should require GitHub production dispatch packet verification before the guarded workflow',
)
assert(
  externalActionsJson.approvalRequiredActions
    ?.find((action) => action.id === 'run-github-production-deploy-workflow')
    ?.verification?.includes('npm run verify:production-dispatch-preflight -- --strict'),
  'External action checklist should require exact production dispatch preflight before the guarded workflow',
)
assert(
  externalActionsJson.approvalRequiredActions
    ?.find((action) => action.id === 'run-github-production-deploy-workflow')
    ?.notes?.some((note) => note.includes('skip_live_verification_confirm=skip-herbalisti-live-verification')),
  'External action checklist should document the live-verification skip acknowledgement phrase',
)
assert(
  externalActionsJson.approvalRequiredActions?.some((action) => action.id === 'seed-production-feed'),
  'External action checklist should include the protected production feed seed action',
)
assert(
  externalActionsJson.guardrails?.externalActionsRequireFreshApproval === true,
  'External action JSON should require fresh approval for external actions',
)
assert(corpusRightsAudit.status === 'pass', 'Corpus rights audit summary should pass')
assert(corpusRightsAudit.counts?.chunkedWorks >= 1000, 'Corpus rights audit should cover the chunked corpus')
assert(
  corpusRightsAudit.counts?.publicReferenceRecords >= 1000,
  'Corpus rights audit should cover public reference exports',
)
assert(productionCutoverJson.status === 'pass', 'Production cutover simulation JSON should pass')
assert(
  productionCutoverJson.simulatedBindings?.sharedD1DatabaseId === true,
  'Production cutover simulation should prove shared D1 database ID handling',
)
assert(
  productionCutoverDoc.includes('No Cloudflare API call'),
  'Production cutover simulation doc should state the no-external-action boundary',
)
assert(
  productionStateScript.includes("['scripts/verify-production.mjs', 'https://herbalisti.com']"),
  'Production state snapshot should run the live production smoke verifier against herbalisti.com',
)
assert(
  productionStateScript.includes("productionSmokeStatus === 'pass'"),
  'Production state completion should require live production smoke verification to pass',
)
assert(
  productionStateScript.includes('production-smoke-captured'),
  'Production state snapshot should expose the live production smoke check',
)
assert(
  productionStateScript.includes('finalCompletionGates'),
  'Production state snapshot should carry final completion gates for operator evidence',
)

console.log(
  JSON.stringify(
    {
      status: 'pass',
      project: contract.project,
      resources: contract.resources.length,
      secrets: secretNames.length,
      requiredLaunchSecrets: contract.secrets
        .filter((secret) => secret.requiredForLaunch)
        .map((secret) => secret.name),
      d1BindingConsistency:
        pagesD1Binding && newsD1Binding ? pagesD1Binding.databaseId === newsD1Binding.databaseId : 'pending-bindings',
      liveCompletionGates: contract.commands.liveCompletionGates,
      finalCompletionGates: contract.commands.finalCompletionGates,
      safeToRun: 'This verifier reads local files only. It does not deploy, mutate DNS, create resources, or print secret values.',
    },
    null,
    2,
  ),
)
