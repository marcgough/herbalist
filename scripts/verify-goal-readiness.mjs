import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const strict = process.argv.includes('--strict')

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const exists = (path) => existsSync(resolve(root, path))
const readJson = (path) => JSON.parse(read(path))

const hasActiveD1Binding = (toml) =>
  /^\s*\[\[d1_databases\]\]/m.test(toml) &&
  /^\s*binding\s*=\s*"HERBALISTI_DB"\s*$/m.test(toml) &&
  /^\s*database_name\s*=\s*"herbalisti"\s*$/m.test(toml) &&
  /^\s*database_id\s*=\s*"(?!<|replace-after|TODO|todo)[^"]+"\s*$/m.test(toml)

const hasActiveR2Binding = (toml) =>
  /^\s*\[\[r2_buckets\]\]/m.test(toml) &&
  /^\s*binding\s*=\s*"HERBALISTI_MEDIA"\s*$/m.test(toml) &&
  /^\s*bucket_name\s*=\s*"herbalisti-media"\s*$/m.test(toml)

const requirement = ({ id, requirement, status, evidence = [], remaining = [], caveats = [] }) => ({
  id,
  requirement,
  status,
  evidence,
  remaining,
  caveats,
})

const packageJson = readJson('package.json')
const index = read('index.html')
const app = read('src/App.tsx')
const css = read('src/App.css')
const pagesToml = read('wrangler.toml')
const newsToml = read('wrangler.news.toml')
const governance = readJson('public/data/governance.json')
const mediaProvenance = readJson('public/data/media-provenance.json')
const mediaManifest = readJson('public/data/media-manifest.json')
const herbalKnowledgeExport = readJson('public/data/herbal-knowledge.json')
const herbProfileSummary = readJson('corpus/exports/herb-profile-summary.json')
const corpusRightsAudit = readJson('corpus/exports/corpus-rights-audit-summary.json')
const projectPlan = read('docs/herbalisti-project-plan.md')
const deploymentRunbook = read('docs/deployment-runbook.md')
const productionVerifier = read('scripts/verify-production.mjs')
const liveReadinessVerifier = read('scripts/verify-live-readiness.mjs')
const externalActions = readJson('docs/external-launch-actions.json')
const productionCutoverSimulation = readJson('docs/production-cutover-simulation.json')
const productionProvisioningReadiness = readJson('docs/production-provisioning-readiness.json')
const d1ProductionManifest = exists('docs/d1-production-migration-manifest.json')
  ? readJson('docs/d1-production-migration-manifest.json')
  : { status: 'missing', summary: { migrationCount: 0 } }
const dnsCutoverPlan = exists('docs/dns-cutover-plan.json')
  ? readJson('docs/dns-cutover-plan.json')
  : { status: 'missing' }
const productionSecretSetup = exists('docs/production-secret-setup.json')
  ? readJson('docs/production-secret-setup.json')
  : { status: 'missing' }

const scripts = packageJson.scripts ?? {}
const activePagesD1 = hasActiveD1Binding(pagesToml)
const activeNewsD1 = hasActiveD1Binding(newsToml)
const activeR2 = hasActiveR2Binding(pagesToml)
const requiredSecrets = [
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_ACCOUNT_ID',
  'FEED_ADMIN_TOKEN',
  'KIE_API_KEY',
  'MEDIA_ADMIN_TOKEN',
]
const visibleSecrets = Object.fromEntries(requiredSecrets.map((name) => [name, Boolean(process.env[name]?.trim())]))
const openAiAssets = mediaProvenance.assets.filter((asset) => asset.provider === 'OpenAI image generation')
const herbalCorpusProfiles = (herbalKnowledgeExport.records ?? []).filter((record) => record.entryKind === 'corpus-profile')

const requirements = [
  requirement({
    id: 'brand',
    requirement: 'Original Herbalisti branding with high-tech holistic tone, logo, colours, fonts, and voice.',
    status:
      exists('public/assets/herbalisti-logo.svg') &&
      exists('public/assets/herbalisti-mark.svg') &&
      exists('docs/brand-system.md') &&
      projectPlan.includes('Star Trek meets holistic health') &&
      css.includes('swatch-glass-blue')
        ? 'pass'
        : 'missing',
    evidence: [
      'public/assets/herbalisti-logo.svg',
      'public/assets/herbalisti-mark.svg',
      'public/favicon.svg',
      'public/manifest.webmanifest',
      'docs/brand-system.md',
      'npm run verify:brand',
    ],
  }),
  requirement({
    id: 'openai-imagery',
    requirement: 'OpenAI-generated launch imagery using the requested Image Gen 2 workflow.',
    status:
      openAiAssets.length >= 2 &&
      openAiAssets.every((asset) => asset.generationWorkflow.includes('Image Gen 2')) &&
      exists('public/assets/herbalisti-hero.png') &&
      exists('public/assets/herbalisti-research.png')
        ? 'pass'
        : 'missing',
    evidence: [
      'public/assets/herbalisti-hero.png',
      'public/assets/herbalisti-research.png',
      'public/data/media-provenance.json',
      'docs/attribution.md',
      'npm run verify:attribution',
    ],
    caveats: ['OPENAI_API_KEY is only needed later if repeatable server-side generation is added.'],
  }),
  requirement({
    id: 'high-tech-motion-system',
    requirement:
      'Contemporary high-tech motion language with subtle procedural movement, manifest-governed ambient video slots, and reduced-motion support.',
    status:
      exists('scripts/verify-motion-system.mjs') &&
      Boolean(scripts['verify:motion-system']) &&
      app.includes('className="signal-lattice"') &&
      app.includes('className="signal-lattice image-band-lattice"') &&
      app.includes('AmbientVideo') &&
      css.includes('@keyframes signalSweep') &&
      css.includes('@media (prefers-reduced-motion: reduce)') &&
      mediaManifest.policy?.externalHotlinks === 'none'
        ? 'pass'
        : 'missing',
    evidence: [
      'src/App.tsx',
      'src/App.css',
      'src/data/mediaManifest.ts',
      'public/data/media-manifest.json',
      'scripts/verify-motion-system.mjs',
      'npm run verify:motion-system',
    ],
    caveats: ['Seedance video remains disabled until reviewed owned MP4 assets exist.'],
  }),
  requirement({
    id: 'book-database',
    requirement: 'Searchable database of the books and source records referenced by the starting Natural Medicines plan.',
    status:
      exists('functions/api/books.js') &&
      exists('functions/_lib/books.js') &&
      exists('public/data/reference-books.json') &&
      exists('corpus/exports/australia-lane-summary.json') &&
      exists('corpus/exports/corpus-rights-audit-summary.json') &&
      exists('docs/corpus-rights-audit.md') &&
      exists('scripts/verify-corpus-rights.mjs') &&
      corpusRightsAudit.status === 'pass' &&
      corpusRightsAudit.counts?.chunkedWorks >= 1000 &&
      scripts['verify:australia-lane'] &&
      scripts['verify:corpus-rights'] &&
      exists('migrations/0003_reference_book_metadata.sql') &&
      app.includes('/api/books') &&
      app.includes('All lanes') &&
      read('functions/api/books.js').includes("url.searchParams.get('region')")
        ? 'pass'
        : 'missing',
    evidence: [
      'functions/api/books.js',
      'functions/_lib/books.js',
      'public/data/reference-books.json',
      'migrations/0002_seed_reference_data.sql',
      'migrations/0003_reference_book_metadata.sql',
      'docs/source-verification.md',
      'corpus/derived/australia-lane/README.md',
      'corpus/exports/corpus-rights-audit-summary.json',
      'docs/corpus-rights-audit.md',
      'npm run verify:corpus-rights',
      'npm run verify:australia-lane',
      'npm run verify:api',
    ],
    caveats: [
      'The database is a verified source index, not a copyrighted book-extraction corpus.',
      'Australia is prepared as a rights-review lane; no Australian works enter the searchable corpus until item-level reuse rights are proven.',
    ],
  }),
  requirement({
    id: 'public-domain-herbal-chat',
    requirement:
      'Search-first home interface with a public-domain herbal database and retrieval chat from open, out-of-copyright, or permissively usable sources.',
    status:
      exists('functions/api/herbal-knowledge.js') &&
      exists('functions/api/herbal-chat.js') &&
      exists('functions/_lib/herbal-knowledge.js') &&
      exists('public/data/herbal-knowledge.json') &&
      herbalKnowledgeExport.total >= 100 &&
      herbalCorpusProfiles.length >= 100 &&
      (herbalKnowledgeExport.sources?.length ?? 0) >= 150 &&
      herbProfileSummary.profileCount >= 100 &&
      herbProfileSummary.totalMatchedChunks >= 100000 &&
      app.includes('/api/herbal-chat') &&
      (app.includes('Ask the herbal archive.') || app.includes('Ask the public-domain herbal index')) &&
      app.includes('/data/herbal-knowledge.json') &&
      app.includes('source-license-stats') &&
      app.includes('Independent public-source signals.') &&
      read('functions/api/health.js').includes('herbalKnowledgeApi: true') &&
      read('functions/api/health.js').includes('herbalChatApi: true')
        ? 'pass'
        : 'missing',
    evidence: [
      'functions/api/herbal-knowledge.js',
      'functions/api/herbal-chat.js',
      'functions/_lib/herbal-knowledge.js',
      'public/data/herbal-knowledge.json',
      'corpus/exports/herb-profile-summary.json',
      'corpus/derived/herb-profiles/profiles.json',
      'src/data/herbalKnowledge.ts',
      'src/App.tsx home search/chat',
      'npm run verify:data-exports',
      'npm run verify:api',
    ],
    caveats: [
      'The archive chat stays retrieval-first with deterministic fallback; optional hosted synthesis activates when OPENAI_API_KEY is configured.',
    ],
  }),
  requirement({
    id: 'citation-notes',
    requirement:
      'Structured citation/source notes tying reference books, remedies, signals, and governance decisions back to public source links without copyrighted extraction.',
    status:
      exists('src/data/citationNotes.ts') &&
      exists('functions/api/citation-notes.js') &&
      exists('functions/_lib/citation-notes.js') &&
      exists('public/data/citation-notes.json') &&
      exists('migrations/0008_seed_citation_notes.sql') &&
      exists('scripts/verify-citation-notes.mjs') &&
      Boolean(scripts['verify:citation-notes']) &&
      app.includes('/api/citation-notes') &&
      app.includes('Citation notes') &&
      read('functions/_lib/search.js').includes("id: 'notes'")
        ? 'pass'
        : 'missing',
    evidence: [
      'src/data/citationNotes.ts',
      'functions/api/citation-notes.js',
      'functions/_lib/citation-notes.js',
      'public/data/citation-notes.json',
      'migrations/0008_seed_citation_notes.sql',
      'src/App.tsx /notes',
      'npm run verify:citation-notes',
      'npm run verify:api',
    ],
    caveats: ['Citation notes are short public-source pointers, not copied book text or medical advice.'],
  }),
  requirement({
    id: 'remedy-index',
    requirement: 'Natural-medicines knowledgebase foundation with safety-led remedy records.',
    status:
      exists('functions/api/remedies.js') &&
      exists('functions/_lib/remedies.js') &&
      exists('public/data/remedies.json') &&
      exists('migrations/0006_seed_remedies.sql') &&
      app.includes('/api/remedies')
        ? 'pass'
        : 'missing',
    evidence: [
      'functions/api/remedies.js',
      'functions/_lib/remedies.js',
      'public/data/remedies.json',
      'src/data/remedies.ts',
      'migrations/0006_seed_remedies.sql',
      'npm run verify:d1',
      'npm run verify:api',
    ],
  }),
  requirement({
    id: 'relationship-map',
    requirement:
      'Source-led relationship discovery across remedies, plant parts, preparations, traditional-use context, related records, and safety watches.',
    status:
      exists('functions/api/graph.js') &&
      exists('functions/_lib/knowledge-graph.js') &&
      exists('scripts/verify-knowledge-graph.mjs') &&
      exists('migrations/0009_remedy_plant_parts.sql') &&
      app.includes('/api/graph') &&
      app.includes('Relationship map') &&
      app.includes('Has part') &&
      app.includes('Traditional context') &&
      scripts['verify:knowledge-graph']
        ? 'pass'
        : 'missing',
    evidence: [
      'functions/api/graph.js',
      'functions/_lib/knowledge-graph.js',
      'migrations/0009_remedy_plant_parts.sql',
      'src/App.tsx /map',
      'scripts/verify-knowledge-graph.mjs',
      'npm run verify:knowledge-graph',
      'npm run verify:api',
    ],
    caveats: ['Relationship edges use traditional-context language rather than treatment-claim language.'],
  }),
  requirement({
    id: 'unified-search',
    requirement: 'Unified searchable public research surface across references, citation notes, remedies, signals, and source records.',
    status:
      exists('functions/api/search.js') &&
      exists('functions/_lib/search.js') &&
      app.includes('Research console') &&
      app.includes('/api/search')
        ? 'pass'
        : 'missing',
    evidence: [
      'functions/api/search.js',
      'functions/_lib/search.js',
      'src/App.tsx /search',
      'functions/_lib/citation-notes.js',
      'npm run verify:api',
      'npm run verify:production -- <url>',
    ],
  }),
  requirement({
    id: 'independent-newsfeed',
    requirement:
      'Self-updating public-source newsfeed for longevity, peptides, gene therapy, gene editing, DNA modification, CRISPR, health as a service, and related self-sovereign wellbeing topics.',
    status:
      exists('functions/api/news.js') &&
      exists('functions/api/signals.xml.js') &&
      exists('functions/api/source-health.js') &&
      exists('functions/_lib/feed.js') &&
      exists('functions/_lib/signals-rss.js') &&
      exists('workers/news-refresh.js') &&
      exists('migrations/0005_feed_refresh_runs.sql') &&
      exists('scripts/lib/static-news-refresh.mjs') &&
      exists('scripts/verify-static-news-refresh.mjs') &&
      exists('scripts/verify-signal-coverage.mjs') &&
      exists('scripts/verify-signals-rss.mjs') &&
      exists('scripts/verify-source-health.mjs') &&
      scripts['verify:static-news-refresh'] &&
      scripts['verify:signal-coverage'] &&
      scripts['verify:signals-rss'] &&
      scripts['verify:source-health'] &&
      app.includes('/api/news') &&
      app.includes('/api/signals.xml') &&
      app.includes('Signals RSS') &&
      app.includes('/api/source-health') &&
      index.includes('application/rss+xml')
        ? activePagesD1 && activeNewsD1
          ? 'pass'
          : 'pending-production'
        : 'missing',
    evidence: [
      'functions/api/news.js',
      'functions/api/signals.xml.js',
      'functions/api/source-health.js',
      'functions/_lib/feed.js',
      'functions/_lib/signals-rss.js',
      'workers/news-refresh.js',
      'wrangler.news.toml',
      'public/data/news.json',
      'public/data/feed-status.json',
      'npm run verify:static-news-refresh',
      'npm run verify:signal-coverage',
      'npm run verify:signals-rss',
      'npm run verify:source-health',
      'npm run verify:feed-normalization',
      'npm run verify:news-worker',
    ],
    remaining:
      activePagesD1 && activeNewsD1
        ? []
        : [
            'Create the production Cloudflare D1 database.',
            'Run npm run configure:cloudflare -- --d1 <database_id> --apply.',
            'Deploy the scheduled news Worker.',
      ],
  }),
  requirement({
    id: 'signal-intelligence',
    requirement:
      'Metadata-only topic and source intelligence for the public Signals feed, showing coverage, leading clusters, recency, and source mix without medical guidance.',
    status:
      exists('functions/api/signal-intelligence.js') &&
      exists('functions/_lib/signal-intelligence.js') &&
      exists('scripts/verify-signal-intelligence.mjs') &&
      Boolean(scripts['verify:signal-intelligence']) &&
      app.includes('/api/signal-intelligence') &&
      app.includes('Signal intelligence') &&
      css.includes('signal-intelligence-panel') &&
      read('functions/api/health.js').includes('signalIntelligenceApi: true')
        ? 'pass'
        : 'missing',
    evidence: [
      'functions/api/signal-intelligence.js',
      'functions/_lib/signal-intelligence.js',
      'src/App.tsx SignalIntelligencePanel',
      'src/App.css signal-intelligence-panel',
      'scripts/verify-signal-intelligence.mjs',
      'npm run verify:signal-intelligence',
      'npm run verify:api',
      'npm run verify:production -- <url>',
    ],
    caveats: ['Signal intelligence summarizes public metadata only; it is not medical guidance or treatment ranking.'],
  }),
  requirement({
    id: 'non-pharma-source-governance',
    requirement: 'Allowlist-first source governance excluding Big Pharma-owned channels by default.',
    status:
      exists('functions/_lib/sources.js') &&
      exists('functions/api/sources.js') &&
      exists('public/data/sources.json') &&
      governance.sourcePolicy?.bigPharmaDefault === 'excluded_unless_explicitly_approved' &&
      governance.sourcePolicy?.reviewCadence === 'quarterly_or_before_source_expansion' &&
      exists('scripts/verify-source-governance.mjs') &&
      exists('migrations/0007_source_independence_review.sql') &&
      app.includes('source-review')
        ? 'pass'
        : 'missing',
    evidence: [
      'functions/_lib/sources.js',
      'functions/api/sources.js',
      'public/data/sources.json',
      'migrations/0007_source_independence_review.sql',
      'public/data/governance.json',
      'docs/source-verification.md',
      'npm run verify:source-governance',
      'npm run verify:governance',
      'npm run verify:production -- <url>',
    ],
    caveats: [
      'This is an allowlist, blocklist, and source-level review control, not a full funding/affiliation audit for every article author.',
    ],
  }),
  requirement({
    id: 'seedance-video-readiness',
    requirement: 'Seedance 2.0 via Kie.ai support for optional high-tech ambient video backgrounds.',
    status:
      exists('functions/api/media/seedance.js') &&
      exists('functions/api/media/seedance-status.js') &&
      exists('functions/_lib/media.js') &&
      exists('scripts/verify-media-endpoints.mjs') &&
      mediaManifest.video?.hero &&
      mediaManifest.video?.research
        ? 'pending-production'
        : 'missing',
    evidence: [
      'functions/api/media/seedance.js',
      'functions/api/media/seedance-status.js',
      'functions/_lib/media.js',
      'public/data/media-manifest.json',
      'docs/media-generation.md',
      'npm run verify:media-endpoints',
    ],
    remaining: [
      'Set KIE_API_KEY and MEDIA_ADMIN_TOKEN as Cloudflare secrets.',
      'Generate candidate videos only after credits are approved.',
      'Review, store as owned assets, record provenance, then enable manifest slots.',
    ],
    caveats: ['Video is optional for launch; current slots stay disabled until reviewed owned assets exist.'],
  }),
  requirement({
    id: 'operational-health',
    requirement: 'Public operational health contract for launch verification without exposing secret values.',
    status:
      exists('functions/api/health.js') &&
      read('functions/api/health.js').includes('signalsRssApi: true') &&
      read('functions/api/health.js').includes('herbalKnowledgeApi: true') &&
      read('functions/api/health.js').includes('herbalChatApi: true') &&
      read('scripts/verify-api.mjs').includes('/api/health') &&
      productionVerifier.includes('/api/health') &&
      productionVerifier.includes('Production Health API should report an active D1 binding') &&
      productionVerifier.includes('Production Health API should report protected Seedance endpoints configured') &&
      liveReadinessVerifier.includes('requiredProductionBindings') &&
      liveReadinessVerifier.includes('requiredProtectedFeatures')
        ? 'pass'
        : 'missing',
    evidence: [
      'functions/api/health.js',
      'scripts/verify-api.mjs',
      'scripts/verify-production.mjs',
      'scripts/verify-live-readiness.mjs',
      'npm run verify:api',
      'npm run verify:production -- <url>',
      'npm run verify:live-readiness -- --strict',
    ],
  }),
  requirement({
    id: 'production-environment-contract',
    requirement: 'Machine-readable production environment contract for Cloudflare resources, secrets, commands, and completion gates.',
    status:
      exists('docs/production-environment-contract.json') &&
      exists('docs/external-launch-actions.json') &&
      exists('docs/external-launch-actions.md') &&
      exists('docs/production-provisioning-readiness.json') &&
      exists('docs/production-provisioning-readiness.md') &&
      exists('docs/d1-production-migration-manifest.json') &&
      exists('docs/d1-production-migration-manifest.md') &&
      exists('docs/dns-cutover-plan.json') &&
      exists('docs/dns-cutover-plan.md') &&
      exists('docs/production-secret-setup.json') &&
      exists('docs/production-secret-setup.md') &&
      exists('docs/production-cutover-simulation.json') &&
      exists('docs/production-cutover-simulation.md') &&
      exists('scripts/verify-production-contract.mjs') &&
      exists('scripts/verify-external-actions.mjs') &&
      exists('scripts/prepare-d1-production-manifest.mjs') &&
      exists('scripts/prepare-dns-cutover-plan.mjs') &&
      exists('scripts/prepare-production-secret-setup.mjs') &&
      exists('scripts/resolve-production-d1-database.mjs') &&
      exists('scripts/verify-production-deploy-dry-run.mjs') &&
      exists('scripts/verify-production-d1-resolver.mjs') &&
      exists('scripts/simulate-production-cutover.mjs') &&
      exists('scripts/verify-production-cutover-simulation.mjs') &&
      exists('scripts/prepare-production-provisioning.mjs') &&
      exists('scripts/verify-production-deploy-workflow.mjs') &&
      exists('scripts/verify-github-production-readiness.mjs') &&
      exists('scripts/verify-cloudflare-production-state.mjs') &&
      exists('.github/workflows/production-deploy.yml') &&
      Boolean(scripts['verify:production-contract']) &&
      Boolean(scripts['verify:external-actions']) &&
      Boolean(scripts['verify:production-provisioning']) &&
      Boolean(scripts['verify:d1-manifest']) &&
      Boolean(scripts['prepare:d1-manifest']) &&
      Boolean(scripts['verify:dns-cutover']) &&
      Boolean(scripts['prepare:dns-cutover']) &&
      Boolean(scripts['verify:production-secrets']) &&
      Boolean(scripts['prepare:production-secrets']) &&
      Boolean(scripts['resolve:production-d1']) &&
      Boolean(scripts['verify:production-deploy-dry-run']) &&
      Boolean(scripts['verify:production-d1-resolver']) &&
      Boolean(scripts['verify:production-deploy-workflow']) &&
      Boolean(scripts['verify:github-production-readiness']) &&
      Boolean(scripts['verify:cloudflare-production-state']) &&
      Boolean(scripts['verify:production-cutover']) &&
      Boolean(scripts['simulate:production-cutover']) &&
      Boolean(scripts['prepare:production-cutover']) &&
      externalActions.guardrails?.externalActionsRequireFreshApproval === true &&
      productionCutoverSimulation.status === 'pass' &&
      productionCutoverSimulation.simulatedBindings?.sharedD1DatabaseId === true &&
      productionProvisioningReadiness.status !== 'local-contract-failed' &&
      d1ProductionManifest.status === 'pass' &&
      d1ProductionManifest.summary?.migrationCount >= 1 &&
      dnsCutoverPlan.status !== 'local-contract-failed' &&
      productionSecretSetup.status === 'ready-for-secret-entry'
        ? 'pass'
        : 'missing',
    evidence: [
      'docs/production-environment-contract.json',
      'docs/external-launch-actions.json',
      'docs/external-launch-actions.md',
      'docs/production-provisioning-readiness.json',
      'docs/production-provisioning-readiness.md',
      'docs/d1-production-migration-manifest.json',
      'docs/d1-production-migration-manifest.md',
      'docs/dns-cutover-plan.json',
      'docs/dns-cutover-plan.md',
      'docs/production-secret-setup.json',
      'docs/production-secret-setup.md',
      'docs/production-cutover-simulation.json',
      'docs/production-cutover-simulation.md',
      'scripts/verify-production-contract.mjs',
      'scripts/verify-external-actions.mjs',
      'scripts/prepare-d1-production-manifest.mjs',
      'scripts/prepare-dns-cutover-plan.mjs',
      'scripts/prepare-production-secret-setup.mjs',
      'scripts/resolve-production-d1-database.mjs',
      'scripts/verify-production-deploy-dry-run.mjs',
      'scripts/verify-production-d1-resolver.mjs',
      'scripts/simulate-production-cutover.mjs',
      'scripts/verify-production-cutover-simulation.mjs',
      'scripts/prepare-production-provisioning.mjs',
      'scripts/verify-production-deploy-workflow.mjs',
      'scripts/verify-github-production-readiness.mjs',
      'scripts/verify-cloudflare-production-state.mjs',
      '.github/workflows/production-deploy.yml',
      'npm run verify:production-contract',
      'npm run verify:external-actions',
      'npm run verify:production-provisioning',
      'npm run verify:d1-manifest',
      'npm run verify:dns-cutover',
      'npm run verify:production-secrets',
      'npm run resolve:production-d1',
      'npm run verify:production-deploy-dry-run',
      'npm run verify:production-d1-resolver',
      'npm run verify:production-deploy-workflow',
      'npm run verify:github-production-readiness',
      'npm run verify:cloudflare-production-state',
      'npm run verify:production-cutover',
      'docs/deployment-runbook.md',
      'docs/production-launch-packet.md',
    ],
  }),
  requirement({
    id: 'cloudflare-hosting',
    requirement: 'Production hosting at herbalisti.com using Cloudflare Pages, D1, and scheduled Worker infrastructure.',
    status: activePagesD1 && activeNewsD1 ? 'pending-production' : 'pending-production',
    evidence: [
      'wrangler.toml',
      'wrangler.news.toml',
      'scripts/configure-cloudflare-bindings.mjs',
      'scripts/simulate-production-cutover.mjs',
      'scripts/prepare-launch-packet.mjs',
      'scripts/prepare-external-actions.mjs',
      'scripts/prepare-production-provisioning.mjs',
      'scripts/verify-production-deploy-workflow.mjs',
      'scripts/verify-github-production-readiness.mjs',
      'scripts/verify-cloudflare-production-state.mjs',
      'scripts/prepare-d1-production-manifest.mjs',
      'scripts/prepare-dns-cutover-plan.mjs',
      'scripts/prepare-production-secret-setup.mjs',
      'scripts/resolve-production-d1-database.mjs',
      'scripts/verify-production-deploy-dry-run.mjs',
      'scripts/verify-production-d1-resolver.mjs',
      '.github/workflows/production-deploy.yml',
      'functions/api/health.js',
      'docs/deployment-runbook.md',
      'npm run verify:launch -- --soft',
      'npm run verify:production-cutover',
      'npm run verify:production-provisioning',
      'npm run verify:production-deploy-workflow',
      'npm run verify:github-production-readiness',
      'npm run verify:cloudflare-production-state',
      'npm run verify:d1-manifest',
      'npm run verify:dns-cutover',
      'npm run verify:production-secrets',
      'npm run resolve:production-d1',
      'npm run verify:production-deploy-dry-run',
      'npm run verify:production-d1-resolver',
      'npm run verify:live-readiness -- --strict',
      'npm run prepare:launch',
      'npm run prepare:external-actions',
    ],
    remaining: [
      'Create Cloudflare Pages project herbalisti.',
      'Connect herbalisti.com DNS/custom domain.',
      'Create and bind Cloudflare D1 database.',
      'Apply D1 migrations remotely.',
      'Set required Cloudflare secrets.',
      'Deploy Pages and scheduled Worker.',
      'Run npm run verify:production -- https://herbalisti.com.',
    ],
  }),
  requirement({
    id: 'medical-and-privacy-boundaries',
    requirement: 'Public medical, editorial, source, and privacy boundaries suitable for a non-diagnostic research interface.',
    status:
      governance.medicalBoundary?.status === 'educational_research_interface' &&
      governance.editorialReview?.automatedAdvice === 'disabled' &&
      app.includes('does not diagnose, treat')
        ? 'pass'
        : 'missing',
    evidence: ['public/data/governance.json', 'src/App.tsx /governance', 'npm run verify:governance'],
  }),
  requirement({
    id: 'release-verification',
    requirement: 'Local release gate covers build, assets, governance, feed, database, media, API, and production-shape checks.',
    status:
      scripts['verify:release'] &&
      scripts['verify:accessibility-smoke'] &&
      scripts['verify:australia-lane'] &&
      scripts['verify:external-actions'] &&
      scripts['verify:github-actions'] &&
      scripts['verify:github-release-evidence'] &&
      scripts['verify:github-production-readiness'] &&
      scripts['verify:cloudflare-production-state'] &&
      scripts['verify:d1-manifest'] &&
      scripts['prepare:d1-manifest'] &&
      scripts['verify:dns-cutover'] &&
      scripts['prepare:dns-cutover'] &&
      scripts['verify:production-secrets'] &&
      scripts['prepare:production-secrets'] &&
      scripts['resolve:production-d1'] &&
      scripts['verify:production-deploy-dry-run'] &&
      scripts['verify:production-d1-resolver'] &&
      scripts['verify:production-deploy-workflow'] &&
      scripts['verify:live-readiness'] &&
      scripts['verify:brand'] &&
      scripts['verify:attribution'] &&
      scripts['verify:citation-notes'] &&
      scripts['verify:media-endpoints'] &&
      scripts['verify:motion-system'] &&
      scripts['verify:news-worker'] &&
      scripts['verify:static-news-refresh'] &&
      scripts['verify:signal-coverage'] &&
      scripts['verify:signal-intelligence'] &&
      scripts['verify:signals-rss'] &&
      scripts['verify:source-health'] &&
      scripts['verify:corpus-rights'] &&
      scripts['verify:data-exports'] &&
      scripts['verify:discovery-metadata'] &&
      scripts['verify:api-catalog'] &&
      scripts['verify:search-discovery'] &&
      scripts['verify:source-governance'] &&
      scripts['verify:knowledge-graph'] &&
      scripts['verify:production-contract'] &&
      scripts['verify:production-cutover'] &&
      scripts['verify:production-deploy-workflow'] &&
      scripts['verify:production-provisioning'] &&
      scripts['verify:production'] &&
      scripts['verify:visual-smoke'] &&
      scripts['prepare:external-actions'] &&
      scripts['prepare:production-provisioning'] &&
      scripts['prepare:production-cutover'] &&
      scripts['prepare:launch']
        ? 'pass'
        : 'missing',
    evidence: [
      'package.json scripts',
      'scripts/verify-release.mjs',
      'scripts/verify-accessibility-smoke.mjs',
      'scripts/verify-production.mjs',
      'scripts/verify-visual-smoke.mjs',
      'scripts/verify-production-contract.mjs',
      'scripts/verify-production-cutover-simulation.mjs',
      'scripts/prepare-production-provisioning.mjs',
      'scripts/verify-launch-config.mjs',
      'scripts/verify-github-actions.mjs',
      'scripts/verify-github-release-evidence.mjs',
      'scripts/verify-github-production-readiness.mjs',
      'scripts/verify-cloudflare-production-state.mjs',
      'scripts/prepare-d1-production-manifest.mjs',
      'scripts/prepare-dns-cutover-plan.mjs',
      'scripts/prepare-production-secret-setup.mjs',
      'scripts/resolve-production-d1-database.mjs',
      'scripts/verify-production-deploy-dry-run.mjs',
      'scripts/verify-production-d1-resolver.mjs',
      'scripts/verify-production-deploy-workflow.mjs',
      '.github/workflows/ci.yml',
      '.github/workflows/release-gate.yml',
      '.github/workflows/production-deploy.yml',
      'scripts/verify-australia-lane.mjs',
      'scripts/verify-external-actions.mjs',
      'scripts/verify-live-readiness.mjs',
      'scripts/verify-citation-notes.mjs',
      'scripts/verify-static-news-refresh.mjs',
      'scripts/verify-signal-coverage.mjs',
      'scripts/verify-signal-intelligence.mjs',
      'scripts/verify-signals-rss.mjs',
      'scripts/verify-motion-system.mjs',
      'scripts/verify-source-health.mjs',
      'scripts/verify-corpus-rights.mjs',
      'scripts/export-public-data.mjs',
      'scripts/verify-data-exports.mjs',
      'scripts/verify-discovery-metadata.mjs',
      'scripts/verify-api-catalog.mjs',
      'scripts/verify-search-discovery.mjs',
      'scripts/verify-source-governance.mjs',
      'scripts/verify-knowledge-graph.mjs',
      'scripts/prepare-external-actions.mjs',
      'scripts/simulate-production-cutover.mjs',
      'scripts/prepare-production-provisioning.mjs',
      'scripts/prepare-launch-packet.mjs',
    ],
  }),
]

const counts = requirements.reduce(
  (acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1
    return acc
  },
  {},
)

const missing = requirements.filter((item) => item.status === 'missing')
const pendingProduction = requirements.filter((item) => item.status === 'pending-production')
const goalComplete = missing.length === 0 && pendingProduction.length === 0
const localImplementationReady = missing.length === 0

const result = {
  status: goalComplete ? 'complete' : localImplementationReady ? 'local-ready-production-pending' : 'incomplete',
  goalComplete,
  localImplementationReady,
  generatedAt: new Date().toISOString(),
  objective:
    'Build Herbalisti as a fully functioning website for herbalisti.com with original high-tech holistic branding, OpenAI-generated imagery, searchable referenced-books database, and self-updating independent-source newsfeed for longevity and related health sovereignty topics.',
  counts,
  productionSignals: {
    pagesD1BindingActive: activePagesD1,
    newsWorkerD1BindingActive: activeNewsD1,
    r2MediaBindingActive: activeR2,
    locallyVisibleSecrets: visibleSecrets,
    canonicalUrlPresent: index.includes('https://herbalisti.com/'),
  },
  requirements,
  nextActions: goalComplete
    ? ['Run a final live browser QA pass before marking the goal complete.']
    : [
        'Create or resolve the Cloudflare D1 database named herbalisti through the approved Cloudflare path or guarded GitHub workflow.',
        'Run npm run configure:cloudflare -- --d1 <database_id> --apply if using the manual Cloudflare path.',
        'Set Cloudflare Pages and Worker secrets.',
        'Deploy Cloudflare Pages and the scheduled news Worker.',
        'Point herbalisti.com DNS/custom domain to the Pages project.',
        'Run npm run verify:production -- https://herbalisti.com.',
      ],
}

console.log(JSON.stringify(result, null, 2))

if (missing.length > 0 || (strict && !goalComplete)) {
  process.exitCode = 1
}
