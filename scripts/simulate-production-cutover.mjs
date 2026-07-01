import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

import { buildConfiguredWranglerFiles } from './configure-cloudflare-bindings.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const pagesConfigPath = 'wrangler.toml'
const newsConfigPath = 'wrangler.news.toml'
const simulationD1DatabaseId = '12345678-1234-4234-9234-123456789abc'
const simulationR2BucketName = 'herbalisti-media'

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const readJson = (path) => JSON.parse(read(path))
const fingerprint = (value) => createHash('sha256').update(value).digest('hex')

const redactId = (value) => `${value.slice(0, 8)}...${value.slice(-4)}`

const readBindingValue = (toml, key) => toml.match(new RegExp(`^\\s*${key}\\s*=\\s*"([^"]+)"\\s*$`, 'm'))?.[1] ?? ''

const hasActiveD1Binding = (toml, expectedId = '') =>
  /^\s*\[\[d1_databases\]\]/m.test(toml) &&
  /^\s*binding\s*=\s*"HERBALISTI_DB"\s*$/m.test(toml) &&
  /^\s*database_name\s*=\s*"herbalisti"\s*$/m.test(toml) &&
  Boolean(readBindingValue(toml, 'database_id')) &&
  !/replace-after|todo|<replace|<database/i.test(readBindingValue(toml, 'database_id')) &&
  (!expectedId || readBindingValue(toml, 'database_id') === expectedId)

const hasActiveR2Binding = (toml) =>
  /^\s*\[\[r2_buckets\]\]/m.test(toml) &&
  /^\s*binding\s*=\s*"HERBALISTI_MEDIA"\s*$/m.test(toml) &&
  /^\s*bucket_name\s*=\s*"herbalisti-media"\s*$/m.test(toml)

const actionById = (actions, id) => actions.find((action) => action.id === id)
const actionHasAfter = (actions, id, dependency) => actionById(actions, id)?.after?.includes(dependency) === true

const addCheck = (checks, id, ok, detail) => {
  checks.push({ id, status: ok ? 'pass' : 'fail', detail })
}

export const buildProductionCutoverSimulation = () => {
  const pagesToml = read(pagesConfigPath)
  const newsToml = read(newsConfigPath)
  const contract = readJson('docs/production-environment-contract.json')
  const externalActions = readJson('docs/external-launch-actions.json')
  const beforeHashes = {
    [pagesConfigPath]: fingerprint(pagesToml),
    [newsConfigPath]: fingerprint(newsToml),
  }
  const configured = buildConfiguredWranglerFiles({
    pagesToml,
    newsToml,
    d1DatabaseId: simulationD1DatabaseId,
    r2BucketName: simulationR2BucketName,
  })
  const afterHashes = {
    [pagesConfigPath]: fingerprint(read(pagesConfigPath)),
    [newsConfigPath]: fingerprint(read(newsConfigPath)),
  }
  const configuredPages = configured[pagesConfigPath]
  const configuredNews = configured[newsConfigPath]
  const pagesDatabaseId = readBindingValue(configuredPages, 'database_id')
  const newsDatabaseId = readBindingValue(configuredNews, 'database_id')
  const localActions = externalActions.localAllowedActions ?? []
  const approvalActions = externalActions.approvalRequiredActions ?? []
  const checks = []

  addCheck(
    checks,
    'no-wrangler-file-writes',
    JSON.stringify(beforeHashes) === JSON.stringify(afterHashes),
    'The simulation leaves wrangler.toml and wrangler.news.toml unchanged.',
  )
  addCheck(
    checks,
    'pages-d1-binding',
    hasActiveD1Binding(configuredPages, simulationD1DatabaseId),
    'Simulated Pages config receives HERBALISTI_DB with the supplied D1 database ID.',
  )
  addCheck(
    checks,
    'news-worker-d1-binding',
    hasActiveD1Binding(configuredNews, simulationD1DatabaseId),
    'Simulated scheduled Worker config receives HERBALISTI_DB with the same D1 database ID.',
  )
  addCheck(
    checks,
    'shared-d1-id',
    pagesDatabaseId === newsDatabaseId && pagesDatabaseId === simulationD1DatabaseId,
    'Pages Functions and scheduled Worker share one production D1 target.',
  )
  addCheck(
    checks,
    'pages-r2-binding',
    hasActiveR2Binding(configuredPages),
    'The optional R2 binding is added to the Pages config when a bucket is supplied.',
  )
  addCheck(
    checks,
    'news-worker-no-r2-binding',
    !hasActiveR2Binding(configuredNews),
    'The scheduled Worker does not receive the optional media bucket binding.',
  )
  addCheck(
    checks,
    'no-template-placeholders',
    !/replace-after|todo|<replace|<database/i.test(`${configuredPages}\n${configuredNews}`),
    'Generated configs do not retain template placeholders.',
  )
  addCheck(
    checks,
    'safe-preflight-gate',
    contract.commands.safePreflight.includes('npm run verify:production-cutover'),
    'The production contract includes the cutover simulation verifier in safe preflight.',
  )
  addCheck(
    checks,
    'local-rehearsal-action',
    Boolean(actionById(localActions, 'run-production-cutover-simulation')),
    'The external action checklist exposes the rehearsal as a local allowed action.',
  )
  addCheck(
    checks,
    'd1-before-local-activation',
    actionHasAfter(localActions, 'activate-d1-bindings-local', 'create-d1-database'),
    'Local D1 binding activation is sequenced after Cloudflare creates the D1 database.',
  )
  addCheck(
    checks,
    'remote-migrations-after-binding',
    actionHasAfter(approvalActions, 'apply-remote-d1-migrations', 'activate-d1-bindings-local'),
    'Remote D1 migrations are sequenced after local Wrangler bindings are activated.',
  )
  addCheck(
    checks,
    'pages-deploy-after-migrations-and-secrets',
    actionHasAfter(approvalActions, 'deploy-cloudflare-pages', 'apply-remote-d1-migrations') &&
      actionHasAfter(approvalActions, 'deploy-cloudflare-pages', 'set-feed-admin-token') &&
      !actionHasAfter(approvalActions, 'deploy-cloudflare-pages', 'set-kie-api-key') &&
      !actionHasAfter(approvalActions, 'deploy-cloudflare-pages', 'set-media-admin-token'),
    'Pages deployment is sequenced after migrations and required secrets.',
  )
  addCheck(
    checks,
    'domain-after-pages-deploy',
    actionHasAfter(approvalActions, 'connect-domain', 'deploy-cloudflare-pages'),
    'Custom domain work is sequenced after the Pages deployment.',
  )
  addCheck(
    checks,
    'live-completion-gates',
    contract.commands.liveCompletionGates.includes('npm run verify:live-readiness -- --strict') &&
      contract.commands.liveCompletionGates.includes('npm run verify:production -- https://herbalisti.com') &&
      contract.commands.liveCompletionGates.includes('npm run verify:goal-readiness -- --strict'),
    'Live completion remains gated by strict live readiness, production smoke, and strict goal readiness.',
  )

  const blockers = checks.filter((check) => check.status !== 'pass')

  return {
    version: 1,
    status: blockers.length ? 'fail' : 'pass',
    generatedAt: new Date().toISOString(),
    safeToRun:
      'Local production cutover simulation only. No Cloudflare API call, deployment, DNS mutation, upload, paid generation, secret readout, or Wrangler config write is attempted.',
    scenario: {
      d1DatabaseName: contract.project.d1Database,
      d1DatabaseId: redactId(simulationD1DatabaseId),
      optionalR2Bucket: simulationR2BucketName,
      pagesProject: contract.project.pagesProject,
      newsWorker: contract.project.newsWorker,
      domain: contract.project.domain,
    },
    simulatedBindings: {
      pagesD1BindingActive: hasActiveD1Binding(configuredPages, simulationD1DatabaseId),
      newsWorkerD1BindingActive: hasActiveD1Binding(configuredNews, simulationD1DatabaseId),
      sharedD1DatabaseId: pagesDatabaseId === newsDatabaseId,
      pagesR2BindingActive: hasActiveR2Binding(configuredPages),
      newsWorkerR2BindingActive: hasActiveR2Binding(configuredNews),
    },
    sequencedCutover: [
      'Create Cloudflare D1 database after Marc approval.',
      'Activate local Wrangler bindings with the returned D1 database ID.',
      'Apply remote D1 migrations after bindings are active.',
      'Set required Cloudflare secrets without exposing values in chat, docs, Git, or logs.',
      'Deploy Pages and the scheduled Worker after migrations and secrets.',
      'Connect herbalisti.com after the Pages deployment.',
      'Run strict live completion gates against https://herbalisti.com.',
    ],
    checks,
    blockers,
    nextActions:
      blockers.length === 0
        ? [
            'Keep npm run verify:production-cutover in safe preflight and release verification.',
            'Use npm run prepare:production-cutover to refresh the human handoff artifact before approved live cutover.',
          ]
        : ['Fix failed simulation checks before approving production cutover.'],
  }
}

export const renderProductionCutoverMarkdown = (result) => {
  const lines = [
    '# Herbalisti Production Cutover Simulation',
    '',
    `Generated: ${result.generatedAt}`,
    '',
    `Status: ${result.status}`,
    '',
    result.safeToRun,
    '',
    '## Scenario',
    '',
    `- Domain: ${result.scenario.domain}`,
    `- Cloudflare Pages project: ${result.scenario.pagesProject}`,
    `- D1 database: ${result.scenario.d1DatabaseName}`,
    `- Simulated D1 database ID: ${result.scenario.d1DatabaseId}`,
    `- Optional R2 bucket: ${result.scenario.optionalR2Bucket}`,
    `- Scheduled Worker: ${result.scenario.newsWorker}`,
    '',
    '## Simulated Bindings',
    '',
    `- Pages D1 binding active: ${result.simulatedBindings.pagesD1BindingActive}`,
    `- News Worker D1 binding active: ${result.simulatedBindings.newsWorkerD1BindingActive}`,
    `- Shared D1 database ID: ${result.simulatedBindings.sharedD1DatabaseId}`,
    `- Pages R2 binding active: ${result.simulatedBindings.pagesR2BindingActive}`,
    `- News Worker R2 binding active: ${result.simulatedBindings.newsWorkerR2BindingActive}`,
    '',
    '## Cutover Order',
    '',
  ]

  for (const step of result.sequencedCutover) {
    lines.push(`- ${step}`)
  }

  lines.push('', '## Checks', '')
  for (const check of result.checks) {
    lines.push(`- ${check.status}: ${check.detail}`)
  }

  if (result.blockers.length) {
    lines.push('', '## Blockers', '')
    for (const blocker of result.blockers) {
      lines.push(`- ${blocker.id}: ${blocker.detail}`)
    }
  }

  lines.push('', '## Next Actions', '')
  for (const action of result.nextActions) {
    lines.push(`- ${action}`)
  }
  lines.push('')

  return lines.join('\n')
}

const main = () => {
  const args = new Set(process.argv.slice(2))
  const write = args.has('--write')
  const markdown = args.has('--markdown')
  const result = buildProductionCutoverSimulation()

  if (write) {
    writeFileSync(resolve(root, 'docs/production-cutover-simulation.json'), `${JSON.stringify(result, null, 2)}\n`)
    writeFileSync(resolve(root, 'docs/production-cutover-simulation.md'), renderProductionCutoverMarkdown(result))
  }

  console.log(markdown ? renderProductionCutoverMarkdown(result) : JSON.stringify(result, null, 2))

  assert.equal(result.status, 'pass', 'Production cutover simulation should pass')
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
