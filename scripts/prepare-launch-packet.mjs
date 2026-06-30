import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const exists = (path) => existsSync(resolve(root, path))

const args = new Set(process.argv.slice(2))
const markdown = args.has('--markdown')
const strict = args.has('--strict')

const hasActiveD1Binding = (toml) =>
  /^\s*\[\[d1_databases\]\]/m.test(toml) &&
  /^\s*binding\s*=\s*"HERBALISTI_DB"\s*$/m.test(toml) &&
  /^\s*database_name\s*=\s*"herbalisti"\s*$/m.test(toml) &&
  /^\s*database_id\s*=\s*"(?!<|replace-after|TODO|todo)[^"]+"\s*$/m.test(toml)

const hasActiveR2Binding = (toml) =>
  /^\s*\[\[r2_buckets\]\]/m.test(toml) &&
  /^\s*binding\s*=\s*"HERBALISTI_MEDIA"\s*$/m.test(toml) &&
  /^\s*bucket_name\s*=\s*"herbalisti-media"\s*$/m.test(toml)

const secretNames = [
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_ACCOUNT_ID',
  'FEED_ADMIN_TOKEN',
  'KIE_API_KEY',
  'MEDIA_ADMIN_TOKEN',
  'OPENAI_API_KEY',
]

const visibleSecrets = Object.fromEntries(secretNames.map((name) => [name, Boolean(process.env[name]?.trim())]))
const pagesToml = read('wrangler.toml')
const newsToml = read('wrangler.news.toml')
const packageJson = JSON.parse(read('package.json'))
const pagesD1Active = hasActiveD1Binding(pagesToml)
const newsD1Active = hasActiveD1Binding(newsToml)
const r2Active = hasActiveR2Binding(pagesToml)

const command = (value, sideEffect = 'none') => ({ value, sideEffect })

const phase = ({ id, title, status, purpose, commands = [], checks = [], blockers = [], notes = [] }) => ({
  id,
  title,
  status,
  purpose,
  commands,
  checks,
  blockers,
  notes,
})

const phases = [
  phase({
    id: 'local-release',
    title: 'Local release proof',
    status: exists('dist/index.html') ? 'ready-to-run' : 'pending-build',
    purpose: 'Prove the current code, assets, API shape, data migrations, governance, media, and production-shape smoke locally.',
    commands: [command('npm install'), command('npm run verify:release')],
    checks: [
      'Build succeeds.',
      'GitHub Actions safe-gate and manual repository release-gate workflows are present, read-only, non-deploying, and use public corpus-export mode on GitHub runners.',
      'Current GitHub CI and manual release-gate evidence is verified for the intended launch commit.',
      'Local Cloudflare Pages runtime starts.',
      'API and production-shape smoke tests pass.',
      'Desktop and mobile visual smoke confirms routed pages render without console warnings, broken imagery, or horizontal overflow.',
      'Accessibility smoke confirms landmarks, skip navigation, h1 structure, labels, accessible names, reduced-motion behavior, and basic contrast signals.',
      'Static news refresh preserves the last good public snapshot if all allowlisted sources fail.',
      'Objective completion audit states which full-goal requirements are locally proven, production-pending, or missing.',
      'Signal coverage verifies the full frontier topic set across seed, search, RSS, and intelligence fixtures.',
      'Signal intelligence summarizes topic and source coverage for the public feed.',
      'The public Signals RSS feed is discoverable and policy-bound.',
      'Public data exports are generated and verified for reference books, herbal commons, remedies, citation notes, and sources.',
      'Discovery metadata verifies canonical URL, JSON-LD, generated sitemap, robots, data/RSS sitemap entries, data catalog, and public dataset counts.',
      'API catalog verification proves the public and protected endpoint surface is documented without secret values.',
      'Search discovery verification proves the homepage advertises OpenSearch for the public search route and JSON search API.',
      'Corpus rights audit confirms chunked works and public exports remain within approved public-domain or permissive archive lanes.',
      'Australia corpus lane remains a prepared, rights-review-only path until item-level reuse rights are proven.',
      'Production cutover simulation proves D1/R2 binding activation and external-action sequencing locally.',
      'Relationship map includes source-led plant-part context without treatment-claim edges.',
      'Independent-source governance and source review metadata pass.',
      'Citation notes pass as source-led, copyright-safe records.',
      'Goal readiness reports local-ready-production-pending until production setup exists.',
    ],
  }),
  phase({
    id: 'cloudflare-resources',
    title: 'Create Cloudflare resources',
    status: pagesD1Active && newsD1Active ? 'configured' : 'pending-external',
    purpose: 'Create the production D1 database and optional media bucket before local Wrangler config is activated.',
    commands: [
      command('npx wrangler d1 create herbalisti', 'creates-cloudflare-resource'),
      command('npx wrangler r2 bucket create herbalisti-media', 'optional-creates-cloudflare-resource'),
    ],
    blockers: pagesD1Active && newsD1Active ? [] : ['A real Cloudflare D1 database ID is required.'],
    notes: ['R2 is optional until approved Seedance videos are ready to store as Herbalisti-owned assets.'],
  }),
  phase({
    id: 'activate-bindings',
    title: 'Activate local Wrangler bindings',
    status: pagesD1Active && newsD1Active ? 'complete' : 'pending-d1-id',
    purpose: 'Write the real D1 binding into both Pages and scheduled Worker Wrangler configs.',
    commands: [
      command('npm run configure:cloudflare -- --d1 <database_id> --apply', 'writes-local-config'),
      command('npm run configure:cloudflare -- --d1 <database_id> --r2 herbalisti-media --apply', 'optional-writes-local-config'),
      command('npm run verify:launch -- --soft'),
      command('npm run verify:github-actions'),
      command('npm run verify:github-release-evidence'),
      command('npm run verify:static-news-refresh'),
      command('npm run verify:signal-coverage'),
      command('npm run verify:signal-intelligence'),
      command('npm run verify:signals-rss'),
      command('npm run verify:knowledge-graph'),
      command('npm run verify:citation-notes'),
      command('npm run verify:source-health'),
      command('npm run verify:corpus-rights'),
      command('npm run verify:data-exports'),
      command('npm run verify:discovery-metadata'),
      command('npm run verify:api-catalog'),
      command('npm run verify:search-discovery'),
      command('npm run verify:australia-lane'),
      command('npm run verify:production-cutover'),
      command('npm run verify:external-actions'),
      command('npm run prepare:completion-audit'),
      command('npm run verify:completion-audit'),
      command('npm run verify:visual-smoke'),
      command('npm run verify:accessibility-smoke'),
      command('npm run verify:goal-readiness'),
    ],
    blockers: pagesD1Active && newsD1Active ? [] : ['wrangler.toml and wrangler.news.toml still use template D1 bindings.'],
  }),
  phase({
    id: 'remote-migrations',
    title: 'Apply production D1 migrations',
    status: pagesD1Active && newsD1Active ? 'ready-to-run' : 'blocked-by-bindings',
    purpose: 'Create the production tables and seed launch data for references, remedies, plant parts, sources, news, media jobs, and feed refresh runs.',
    commands: [command('npx wrangler d1 migrations apply herbalisti --remote', 'writes-cloudflare-d1')],
    blockers: pagesD1Active && newsD1Active ? [] : ['Activate the D1 binding before remote migrations.'],
  }),
  phase({
    id: 'secrets',
    title: 'Set Cloudflare secrets',
    status:
      visibleSecrets.FEED_ADMIN_TOKEN && visibleSecrets.KIE_API_KEY && visibleSecrets.MEDIA_ADMIN_TOKEN
        ? 'locally-visible'
        : 'pending-external',
    purpose: 'Protect manual feed refreshes and Seedance media endpoints without committing or printing secret values.',
    commands: [
      command('npx wrangler secret put FEED_ADMIN_TOKEN --config wrangler.news.toml', 'writes-cloudflare-secret'),
      command('npx wrangler pages secret put KIE_API_KEY --project-name herbalisti', 'writes-cloudflare-secret'),
      command('npx wrangler pages secret put MEDIA_ADMIN_TOKEN --project-name herbalisti', 'writes-cloudflare-secret'),
      command('npx wrangler pages secret put OPENAI_API_KEY --project-name herbalisti', 'optional-writes-cloudflare-secret'),
    ],
    blockers: [
      ...(!visibleSecrets.FEED_ADMIN_TOKEN ? ['FEED_ADMIN_TOKEN is not visible locally or confirmed in Cloudflare.'] : []),
      ...(!visibleSecrets.KIE_API_KEY ? ['KIE_API_KEY is not visible locally or confirmed in Cloudflare.'] : []),
      ...(!visibleSecrets.MEDIA_ADMIN_TOKEN ? ['MEDIA_ADMIN_TOKEN is not visible locally or confirmed in Cloudflare.'] : []),
    ],
    notes: ['OPENAI_API_KEY is optional unless repeatable server-side image generation is added.'],
  }),
  phase({
    id: 'deploy',
    title: 'Deploy Pages and scheduled Worker',
    status: pagesD1Active && newsD1Active ? 'ready-after-secrets' : 'blocked-by-bindings',
    purpose: 'Publish the site and scheduled news refresher after local verification, bindings, migrations, and secrets are ready.',
    commands: [
      command('npm run deploy:cloudflare', 'deploys-cloudflare-pages'),
      command('npm run deploy:news-worker', 'deploys-cloudflare-worker'),
    ],
    blockers: pagesD1Active && newsD1Active ? [] : ['D1 bindings are not active yet.'],
  }),
  phase({
    id: 'domain-and-live-verify',
    title: 'Connect herbalisti.com and verify live production',
    status: 'pending-external',
    purpose: 'Connect the custom domain, verify DNS, and prove the live site satisfies the production contract.',
    commands: [
      command('npm run verify:live-readiness -- --strict'),
      command('npm run verify:production -- https://herbalisti.com'),
      command('npm run verify:goal-readiness -- --strict'),
    ],
    blockers: ['Cloudflare Pages custom domain and DNS must be active before live verification can pass.'],
  }),
]

const blockers = phases.flatMap((item) => item.blockers.map((blocker) => ({ phase: item.id, blocker })))
const result = {
  status: blockers.length ? 'pending-production-setup' : 'ready-for-live-verification',
  safeToRun:
    'This command only reads local files and environment-variable presence. It does not deploy, upload, create resources, call paid APIs, or print secret values.',
  generatedAt: new Date().toISOString(),
  project: {
    name: 'Herbalisti',
    domain: 'herbalisti.com',
    pagesProject: 'herbalisti',
    d1Database: 'herbalisti',
    optionalR2Bucket: 'herbalisti-media',
  },
  localState: {
    pagesD1BindingActive: pagesD1Active,
    newsWorkerD1BindingActive: newsD1Active,
    r2MediaBindingActive: r2Active,
    visibleSecrets,
    scripts: Object.keys(packageJson.scripts ?? {}).sort(),
  },
  phases,
  blockers,
  nextCommand: blockers.length ? 'npm run verify:launch -- --soft' : 'npm run verify:production -- https://herbalisti.com',
}

const renderMarkdown = (packet) => {
  const lines = [
    '# Herbalisti Production Launch Packet',
    '',
    `Generated: ${packet.generatedAt}`,
    '',
    `Status: ${packet.status}`,
    '',
    packet.safeToRun,
    '',
    '## Project',
    '',
    `- Domain: ${packet.project.domain}`,
    `- Cloudflare Pages project: ${packet.project.pagesProject}`,
    `- D1 database: ${packet.project.d1Database}`,
    `- Optional R2 bucket: ${packet.project.optionalR2Bucket}`,
    '',
    '## Local State',
    '',
    `- Pages D1 binding active: ${packet.localState.pagesD1BindingActive}`,
    `- News Worker D1 binding active: ${packet.localState.newsWorkerD1BindingActive}`,
    `- R2 media binding active: ${packet.localState.r2MediaBindingActive}`,
    `- Visible secret names: ${Object.entries(packet.localState.visibleSecrets)
      .filter(([, visible]) => visible)
      .map(([name]) => name)
      .join(', ') || 'none'}`,
    '',
    '## Phases',
    '',
  ]

  for (const item of packet.phases) {
    lines.push(`### ${item.title}`)
    lines.push('')
    lines.push(`Status: ${item.status}`)
    lines.push('')
    lines.push(item.purpose)
    lines.push('')

    if (item.commands.length) {
      lines.push('Commands:')
      lines.push('')
      lines.push('```bash')
      for (const entry of item.commands) {
        lines.push(entry.value)
      }
      lines.push('```')
      lines.push('')
    }

    if (item.blockers.length) {
      lines.push('Blockers:')
      for (const blocker of item.blockers) {
        lines.push(`- ${blocker}`)
      }
      lines.push('')
    }

    if (item.notes.length) {
      lines.push('Notes:')
      for (const note of item.notes) {
        lines.push(`- ${note}`)
      }
      lines.push('')
    }
  }

  lines.push('## Next Command')
  lines.push('')
  lines.push('```bash')
  lines.push(packet.nextCommand)
  lines.push('```')
  lines.push('')

  return lines.join('\n')
}

if (markdown) {
  console.log(renderMarkdown(result))
} else {
  console.log(JSON.stringify(result, null, 2))
}

if (strict && blockers.length) {
  process.exitCode = 1
}
