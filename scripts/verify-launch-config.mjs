import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const soft = process.argv.includes('--soft')

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const exists = (path) => existsSync(resolve(root, path))

const blockers = []
const warnings = []
const passes = []

const add = (ok, passMessage, failMessage, severity = 'blocker') => {
  if (ok) {
    passes.push(passMessage)
    return
  }

  if (severity === 'warning') {
    warnings.push(failMessage)
  } else {
    blockers.push(failMessage)
  }
}

const requiredFiles = [
  'index.html',
  '.github/workflows/ci.yml',
  '.github/workflows/release-gate.yml',
  '.github/workflows/production-deploy.yml',
  'wrangler.toml',
  'wrangler.news.toml',
  'public/assets/herbalisti-logo.svg',
  'public/assets/herbalisti-mark.svg',
  'public/assets/herbalisti-hero.png',
  'public/assets/herbalisti-home-background.png',
  'public/assets/herbalisti-research.png',
  'public/favicon.svg',
  'public/manifest.webmanifest',
  'public/_headers',
  'public/_redirects',
  'public/robots.txt',
  'public/sitemap.xml',
  'public/opensearch.xml',
  'public/data/reference-books.json',
  'public/data/herbal-knowledge.json',
  'public/data/remedies.json',
  'public/data/citation-notes.json',
  'public/data/discovery-metadata.json',
  'public/data/api-catalog.json',
  'public/data/sources.json',
  'public/data/governance.json',
  'public/data/feed-status.json',
  'public/data/media-manifest.json',
  'public/data/media-provenance.json',
  'corpus/derived/australia-lane/README.md',
  'corpus/derived/australia-lane/candidate-sources.json',
  'corpus/derived/australia-lane/search-themes.json',
  'corpus/exports/australia-lane-summary.json',
  'corpus/derived/herb-profiles/profiles.json',
  'corpus/exports/herb-profile-summary.json',
  'corpus/exports/corpus-rights-audit-summary.json',
  'docs/corpus-rights-audit.md',
  'docs/objective-completion-audit.json',
  'docs/objective-completion-audit.md',
  'docs/production-environment-contract.json',
  'docs/external-launch-actions.json',
  'docs/external-launch-actions.md',
  'docs/production-cutover-simulation.json',
  'docs/production-cutover-simulation.md',
  'functions/api/books.js',
  'functions/api/herbal-chat.js',
  'functions/api/herbal-knowledge.js',
  'functions/api/citation-notes.js',
  'functions/api/feed-status.js',
  'functions/api/graph.js',
  'functions/api/health.js',
  'functions/api/news.js',
  'functions/api/signals.xml.js',
  'functions/api/remedies.js',
  'functions/api/search.js',
  'functions/api/signal-intelligence.js',
  'functions/api/source-health.js',
  'functions/api/sources.js',
  'functions/api/media/seedance.js',
  'functions/api/media/seedance-status.js',
  'workers/news-refresh.js',
  'functions/_lib/citation-notes.js',
  'functions/_lib/herbal-knowledge.js',
  'functions/_lib/knowledge-graph.js',
  'functions/_lib/media.js',
  'functions/_lib/remedies.js',
  'functions/_lib/search.js',
  'functions/_lib/signal-intelligence.js',
  'functions/_lib/signals-rss.js',
  'functions/_lib/sources.js',
  'scripts/configure-cloudflare-bindings.mjs',
  'scripts/export-public-data.mjs',
  'scripts/lib/static-news-refresh.mjs',
  'scripts/prepare-completion-audit.mjs',
  'scripts/prepare-external-actions.mjs',
  'scripts/prepare-launch-packet.mjs',
  'scripts/prepare-production-provisioning.mjs',
  'scripts/simulate-production-cutover.mjs',
  'scripts/verify-accessibility-smoke.mjs',
  'scripts/verify-api-catalog.mjs',
  'scripts/verify-australia-lane.mjs',
  'scripts/verify-citation-notes.mjs',
  'scripts/verify-cloudflare-bindings.mjs',
  'scripts/verify-corpus-rights.mjs',
  'scripts/verify-data-exports.mjs',
  'scripts/verify-discovery-metadata.mjs',
  'scripts/verify-goal-readiness.mjs',
  'scripts/verify-github-actions.mjs',
  'scripts/verify-github-production-readiness.mjs',
  'scripts/verify-github-release-evidence.mjs',
  'scripts/verify-live-readiness.mjs',
  'scripts/verify-knowledge-graph.mjs',
  'scripts/verify-media-endpoints.mjs',
  'scripts/verify-motion-system.mjs',
  'scripts/verify-production-contract.mjs',
  'scripts/verify-production-cutover-simulation.mjs',
  'scripts/verify-production-deploy-workflow.mjs',
  'scripts/verify-search-discovery.mjs',
  'scripts/verify-signal-coverage.mjs',
  'scripts/verify-signal-intelligence.mjs',
  'scripts/verify-signals-rss.mjs',
  'scripts/verify-static-news-refresh.mjs',
  'scripts/verify-source-governance.mjs',
  'scripts/verify-source-health.mjs',
  'scripts/verify-visual-smoke.mjs',
  'migrations/0001_initial.sql',
  'migrations/0002_seed_reference_data.sql',
  'migrations/0003_reference_book_metadata.sql',
  'migrations/0004_feed_source_names.sql',
  'migrations/0005_feed_refresh_runs.sql',
  'migrations/0006_seed_remedies.sql',
  'migrations/0007_source_independence_review.sql',
  'migrations/0008_seed_citation_notes.sql',
  'migrations/0009_remedy_plant_parts.sql',
  'src/data/citationNotes.ts',
  'src/data/herbalKnowledge.ts',
  'docs/attribution.md',
  'docs/deployment-runbook.md',
  'docs/goal-readiness.md',
  'docs/production-launch-packet.md',
  'docs/brand-system.md',
  'docs/media-generation.md',
]

for (const file of requiredFiles) {
  add(exists(file), `${file} exists`, `${file} is missing`)
}

const packageJson = JSON.parse(read('package.json'))
for (const script of [
  'build',
  'corpus:rights-audit',
  'configure:cloudflare',
  'deploy:cloudflare',
  'deploy:news-worker',
  'export:data',
  'prepare:external-actions',
  'prepare:completion-audit',
  'prepare:launch',
  'prepare:production-provisioning',
  'prepare:production-cutover',
  'refresh:news',
  'verify:api',
  'verify:api-catalog',
  'verify:accessibility-smoke',
  'verify:australia-lane',
  'verify:attribution',
  'verify:brand',
  'verify:citation-notes',
  'verify:cloudflare-config',
  'verify:completion-audit',
  'verify:corpus-rights',
  'verify:d1',
  'verify:data-exports',
  'verify:discovery-metadata',
  'verify:edge-policy',
  'verify:external-actions',
  'verify:feed-normalization',
  'verify:goal-readiness',
  'verify:github-actions',
  'verify:github-production-readiness',
  'verify:github-release-evidence',
  'verify:governance',
  'verify:knowledge-graph',
  'verify:media-endpoints',
  'verify:motion-system',
  'verify:live-readiness',
  'verify:news-worker',
  'verify:production-contract',
  'verify:production-cutover',
  'verify:production-deploy-workflow',
  'verify:production-provisioning',
  'verify:production',
  'verify:release',
  'verify:search-discovery',
  'verify:signal-coverage',
  'verify:signal-intelligence',
  'verify:signals-rss',
  'verify:static-news-refresh',
  'verify:source-governance',
  'verify:source-health',
  'verify:visual-smoke',
]) {
  add(Boolean(packageJson.scripts?.[script]), `npm script ${script} exists`, `npm script ${script} is missing`)
}

const hasActiveD1Binding = (toml) =>
  /^\s*\[\[d1_databases\]\]/m.test(toml) &&
  /^\s*binding\s*=\s*"HERBALISTI_DB"\s*$/m.test(toml) &&
  /^\s*database_name\s*=\s*"herbalisti"\s*$/m.test(toml) &&
  /^\s*database_id\s*=\s*"(?!<|replace-after|TODO|todo)[^"]+"\s*$/m.test(toml)

const readBindingValue = (toml, key) => toml.match(new RegExp(`^\\s*${key}\\s*=\\s*"([^"]+)"\\s*$`, 'm'))?.[1] ?? ''

const readD1Binding = (toml) => {
  if (!hasActiveD1Binding(toml)) {
    return null
  }

  return {
    binding: readBindingValue(toml, 'binding'),
    databaseName: readBindingValue(toml, 'database_name'),
    databaseId: readBindingValue(toml, 'database_id'),
  }
}

const redactId = (value) => (value ? `${value.slice(0, 6)}...${value.slice(-4)}` : null)

const hasActiveR2Binding = (toml) =>
  /^\s*\[\[r2_buckets\]\]/m.test(toml) &&
  /^\s*binding\s*=\s*"HERBALISTI_MEDIA"\s*$/m.test(toml) &&
  /^\s*bucket_name\s*=\s*"herbalisti-media"\s*$/m.test(toml)

const pagesToml = read('wrangler.toml')
const newsToml = read('wrangler.news.toml')
const pagesD1Binding = readD1Binding(pagesToml)
const newsD1Binding = readD1Binding(newsToml)

add(
  Boolean(pagesD1Binding),
  'Cloudflare Pages D1 binding is active in wrangler.toml',
  'Create the Cloudflare D1 database, then run npm run configure:cloudflare -- --d1 <database_id> --apply to activate the HERBALISTI_DB binding in wrangler.toml',
)
add(
  Boolean(newsD1Binding),
  'News Worker D1 binding is active in wrangler.news.toml',
  'Create the Cloudflare D1 database, then run npm run configure:cloudflare -- --d1 <database_id> --apply to activate the HERBALISTI_DB binding in wrangler.news.toml',
)
if (pagesD1Binding && newsD1Binding) {
  add(
    pagesD1Binding.databaseId === newsD1Binding.databaseId,
    'Cloudflare Pages and News Worker D1 bindings use the same database ID',
    'wrangler.toml and wrangler.news.toml point to different HERBALISTI_DB database IDs; run npm run configure:cloudflare -- --d1 <database_id> --apply again with the intended production D1 ID',
  )
}
add(
  hasActiveR2Binding(pagesToml),
  'Cloudflare R2 media binding is active in wrangler.toml',
  'R2 binding is not active yet; this is optional until Seedance video outputs need to be copied into Herbalisti-owned storage',
  'warning',
)

const envExample = read('.env.example')
const localSecretNames = [
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_ACCOUNT_ID',
  'FEED_ADMIN_TOKEN',
  'KIE_API_KEY',
  'MEDIA_ADMIN_TOKEN',
  'OPENAI_API_KEY',
]

for (const name of localSecretNames) {
  add(envExample.includes(`${name}=`), `.env.example documents ${name}`, `.env.example does not document ${name}`)
}

const locallyVisible = Object.fromEntries(
  localSecretNames.map((name) => [name, Boolean(String(process.env[name] ?? '').trim())]),
)

for (const name of ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID']) {
  add(
    locallyVisible[name],
    `${name} is visible in the local shell`,
    `${name} is not visible in the local shell; set it for scripted deployment or use an authenticated Wrangler session`,
    'warning',
  )
}

for (const name of ['FEED_ADMIN_TOKEN', 'KIE_API_KEY', 'MEDIA_ADMIN_TOKEN']) {
  add(
    locallyVisible[name],
    `${name} is visible in the local shell`,
    `${name} is not visible in the local shell; make sure it is set as a Cloudflare secret before using the related production feature`,
    'warning',
  )
}

add(
  locallyVisible.OPENAI_API_KEY,
  'OPENAI_API_KEY is visible in the local shell',
  'OPENAI_API_KEY is not visible locally; this is only needed if hosted herbal chat synthesis or repeatable server-side OpenAI image generation is enabled',
  'warning',
)

const result = {
  status: blockers.length === 0 ? 'pass' : 'needs-production-setup',
  productionReady: blockers.length === 0,
  safeToRun: 'No deployment, external API call, upload, or paid generation was attempted.',
  blockers,
  warnings,
  locallyVisibleSecrets: locallyVisible,
  productionBindings: {
    pagesD1DatabaseId: redactId(pagesD1Binding?.databaseId),
    newsWorkerD1DatabaseId: redactId(newsD1Binding?.databaseId),
    d1DatabaseIdsMatch: pagesD1Binding && newsD1Binding ? pagesD1Binding.databaseId === newsD1Binding.databaseId : null,
  },
  nextActions:
    blockers.length === 0
      ? [
          'Run npm run verify:release before deployment.',
          'Deploy Cloudflare Pages.',
          'Deploy the scheduled news Worker.',
          'Verify herbalisti.com after DNS and custom domain activation.',
        ]
      : [
          'Create the Cloudflare D1 database named herbalisti.',
          'Run npm run configure:cloudflare -- --d1 <database_id> --apply with the returned database ID.',
          'Set Cloudflare secrets for protected refresh and media-generation features.',
          'Run npm run verify:launch again.',
        ],
  checked: {
    files: requiredFiles.length,
    scripts: Object.keys(packageJson.scripts ?? {}).length,
    passes: passes.length,
  },
}

console.log(JSON.stringify(result, null, 2))

if (blockers.length > 0 && !soft) {
  process.exitCode = 1
}
