import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const outputJsonPath = 'docs/production-provisioning-readiness.json'
const outputMarkdownPath = 'docs/production-provisioning-readiness.md'

const args = new Set(process.argv.slice(2))
const write = args.has('--write')
const check = args.has('--check')
const markdown = args.has('--markdown')

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const readJson = (path) => JSON.parse(read(path))
const exists = (path) => existsSync(resolve(root, path))
const hash = (value) => createHash('sha256').update(value).digest('hex')

const hasActiveD1Binding = (toml) =>
  /^\s*\[\[d1_databases\]\]/m.test(toml) &&
  /^\s*binding\s*=\s*"HERBALISTI_DB"\s*$/m.test(toml) &&
  /^\s*database_name\s*=\s*"herbalisti"\s*$/m.test(toml) &&
  /^\s*database_id\s*=\s*"(?!<|replace-after|TODO|todo)[^"]+"\s*$/m.test(toml)

const bindingValue = (toml, key) => toml.match(new RegExp(`^\\s*${key}\\s*=\\s*"([^"]+)"\\s*$`, 'm'))?.[1] ?? ''

const hasActiveR2Binding = (toml) =>
  /^\s*\[\[r2_buckets\]\]/m.test(toml) &&
  /^\s*binding\s*=\s*"HERBALISTI_MEDIA"\s*$/m.test(toml) &&
  /^\s*bucket_name\s*=\s*"herbalisti-media"\s*$/m.test(toml)

const command = (contract, group, index = 0) => contract.commands[group]?.[index] ?? ''
const actionById = (actions, id) => actions.find((action) => action.id === id)

const buildCheck = (id, ok, detail) => ({
  id,
  status: ok ? 'pass' : 'fail',
  detail,
})

const secretValuePattern = /(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]+|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i

export const buildProductionProvisioningReadiness = ({ generatedAt = new Date().toISOString() } = {}) => {
  const packageJson = readJson('package.json')
  const contract = readJson('docs/production-environment-contract.json')
  const externalActions = readJson('docs/external-launch-actions.json')
  const d1Manifest = exists('docs/d1-production-migration-manifest.json')
    ? readJson('docs/d1-production-migration-manifest.json')
    : null
  const dnsCutoverPlan = exists('docs/dns-cutover-plan.json') ? readJson('docs/dns-cutover-plan.json') : null
  const pagesToml = read('wrangler.toml')
  const newsToml = read('wrangler.news.toml')
  const pagesD1Active = hasActiveD1Binding(pagesToml)
  const newsD1Active = hasActiveD1Binding(newsToml)
  const pagesD1DatabaseId = bindingValue(pagesToml, 'database_id')
  const newsD1DatabaseId = bindingValue(newsToml, 'database_id')
  const d1IdsMatch = pagesD1Active && newsD1Active && pagesD1DatabaseId === newsD1DatabaseId
  const requiredSecrets = contract.secrets.filter((secret) => secret.requiredForLaunch).map((secret) => secret.name)
  const visibleSecrets = requiredSecrets.filter((name) => Boolean(process.env[name]?.trim()))
  const scripts = packageJson.scripts ?? {}
  const approvalActions = externalActions.approvalRequiredActions ?? []
  const localActions = externalActions.localAllowedActions ?? []

  const checks = [
    buildCheck('production-contract', contract.project.domain === 'herbalisti.com', 'Production contract targets herbalisti.com.'),
    buildCheck('external-action-checklist', externalActions.status.includes('production-setup'), 'External action checklist describes production setup state.'),
    buildCheck('github-release-evidence-gate', Boolean(scripts['verify:github-release-evidence']), 'GitHub release evidence verifier is exposed as an npm script.'),
    buildCheck(
      'cloudflare-production-state-gate',
      Boolean(scripts['verify:cloudflare-production-state']) &&
        contract.commands.safePreflight.includes('npm run verify:cloudflare-production-state'),
      'Read-only Cloudflare production state verifier is exposed and included in safe preflight.',
    ),
    buildCheck(
      'd1-production-migration-manifest',
      Boolean(scripts['verify:d1-manifest']) &&
        contract.commands.safePreflight.includes('npm run verify:d1-manifest') &&
        d1Manifest?.status === 'pass' &&
        d1Manifest.summary?.migrationCount >= 1,
      'D1 production migration manifest is current and included in safe preflight.',
    ),
    buildCheck(
      'dns-cutover-plan',
      Boolean(scripts['verify:dns-cutover']) &&
        contract.commands.safePreflight.includes('npm run verify:dns-cutover') &&
        dnsCutoverPlan?.status !== 'local-contract-failed',
      'DNS/custom-domain cutover plan is available and included in safe preflight.',
    ),
    buildCheck(
      'github-release-evidence-preflight',
      contract.commands.safePreflight.includes('npm run verify:github-release-evidence'),
      'Safe preflight includes GitHub CI/manual release evidence verification.',
    ),
    buildCheck('cloudflare-configurator', Boolean(scripts['configure:cloudflare']), 'Cloudflare binding configurator is available.'),
    buildCheck('production-cutover-simulation', Boolean(scripts['verify:production-cutover']), 'Production cutover simulation verifier is available.'),
    buildCheck('external-action-verifier', Boolean(scripts['verify:external-actions']), 'External action verifier is available.'),
    buildCheck('pages-deploy-script', Boolean(scripts['deploy:cloudflare']), 'Cloudflare Pages deploy script is available.'),
    buildCheck('worker-deploy-script', Boolean(scripts['deploy:news-worker']), 'Scheduled Worker deploy script is available.'),
    buildCheck('d1-create-action', Boolean(actionById(approvalActions, 'create-d1-database')), 'D1 creation action exists.'),
    buildCheck('d1-migration-action', Boolean(actionById(approvalActions, 'apply-remote-d1-migrations')), 'Remote D1 migration action exists.'),
    buildCheck('required-secret-actions', requiredSecrets.every((name) => approvalActions.some((action) => action.secretNames?.includes(name))), 'Required launch secrets have named setup actions.'),
    buildCheck('deployment-actions', Boolean(actionById(approvalActions, 'deploy-cloudflare-pages')) && Boolean(actionById(approvalActions, 'deploy-news-worker')), 'Pages and scheduled Worker deployment actions exist.'),
    buildCheck('domain-action', Boolean(actionById(approvalActions, 'connect-domain')), 'Custom domain action exists.'),
    buildCheck('live-completion-gates', contract.commands.liveCompletionGates.length === 3, 'Strict live completion gates are declared.'),
    buildCheck('no-secret-values', !secretValuePattern.test(JSON.stringify({ contract, externalActions })), 'Provisioning inputs do not contain obvious secret values.'),
  ]

  const failedChecks = checks.filter((item) => item.status !== 'pass')
  const productionBlockers = [
    ...(!pagesD1Active ? ['Pages D1 binding is not active.'] : []),
    ...(!newsD1Active ? ['Scheduled Worker D1 binding is not active.'] : []),
    ...(pagesD1Active && newsD1Active && !d1IdsMatch ? ['Pages and scheduled Worker D1 bindings do not point at the same database ID.'] : []),
    ...requiredSecrets.filter((name) => !visibleSecrets.includes(name)).map((name) => `${name} is not locally visible; confirm it is set directly in Cloudflare before launch.`),
  ]
  const nextApprovedAction = !pagesD1Active || !newsD1Active
    ? 'create-d1-database'
    : requiredSecrets.some((name) => !visibleSecrets.includes(name))
    ? 'set-required-cloudflare-secrets'
    : 'deploy-cloudflare-pages-and-worker'

  return {
    version: 1,
    generatedAt,
    status: failedChecks.length
      ? 'local-contract-failed'
      : productionBlockers.length
      ? 'ready-for-approved-production-provisioning'
      : 'ready-for-approved-deployment-and-live-verification',
    productionComplete: false,
    safeToRun:
      'Reads local launch contracts, Wrangler config, package scripts, and environment-variable presence only. It does not call Cloudflare, deploy, mutate DNS, create resources, set secrets, call paid APIs, or print secret values.',
    project: contract.project,
    currentState: {
      pagesD1BindingActive: pagesD1Active,
      newsWorkerD1BindingActive: newsD1Active,
      d1DatabaseIdsMatch: pagesD1Active && newsD1Active ? d1IdsMatch : null,
      r2MediaBindingActive: hasActiveR2Binding(pagesToml),
      requiredSecretNames: requiredSecrets,
      visibleRequiredSecretNames: visibleSecrets,
      hiddenRequiredSecretNames: requiredSecrets.filter((name) => !visibleSecrets.includes(name)),
      contractFingerprint: hash(JSON.stringify(contract)),
      externalActionsFingerprint: hash(JSON.stringify(externalActions)),
      d1MigrationManifestFingerprint: d1Manifest?.summary?.manifestFingerprint ?? null,
      d1MigrationCount: d1Manifest?.summary?.migrationCount ?? 0,
      dnsCutoverStatus: dnsCutoverPlan?.status ?? 'missing',
      dnsNameserverProvider: dnsCutoverPlan?.currentState?.nameserversProvider ?? 'unknown',
    },
    checks,
    productionBlockers,
    nextApprovedAction,
    operatorSequence: [
      {
        id: 'preflight',
        sideEffect: 'none',
        commands: [
          'npm run verify:github-release-evidence',
          'npm run verify:cloudflare-production-state',
          'npm run verify:d1-manifest',
          'npm run verify:dns-cutover',
          'npm run verify:launch -- --soft',
          'npm run verify:production-contract',
          'npm run verify:production-provisioning',
        ],
      },
      {
        id: 'create-cloudflare-d1',
        sideEffect: 'creates-cloudflare-resource',
        command: command(contract, 'createResources'),
        captures: ['Returned D1 database ID only; do not store secret values in chat or docs.'],
      },
      {
        id: 'activate-local-bindings',
        sideEffect: 'writes-local-config',
        command: command(contract, 'activateBindings'),
      },
      {
        id: 'remote-d1-migrations',
        sideEffect: 'writes-cloudflare-d1',
        command: command(contract, 'remoteMigrations'),
      },
      {
        id: 'set-required-secrets',
        sideEffect: 'writes-cloudflare-secrets',
        commands: contract.secrets.filter((secret) => secret.requiredForLaunch).map((secret) => secret.setCommand),
      },
      {
        id: 'deploy',
        sideEffect: 'public-deployment',
        commands: contract.commands.deploy,
      },
      {
        id: 'domain-and-live-verification',
        sideEffect: 'dns-and-live-verification',
        commands: ['npm run verify:dns-cutover', ...contract.commands.liveCompletionGates],
      },
    ],
  }
}

export const renderProductionProvisioningMarkdown = (packet) => {
  const lines = [
    '# Herbalisti Production Provisioning Readiness',
    '',
    `Generated: ${packet.generatedAt}`,
    '',
    `Status: ${packet.status}`,
    '',
    packet.safeToRun,
    '',
    '## Current State',
    '',
    `- Pages D1 binding active: ${packet.currentState.pagesD1BindingActive}`,
    `- News Worker D1 binding active: ${packet.currentState.newsWorkerD1BindingActive}`,
    `- D1 database IDs match: ${packet.currentState.d1DatabaseIdsMatch}`,
    `- R2 media binding active: ${packet.currentState.r2MediaBindingActive}`,
    `- Required secret names: ${packet.currentState.requiredSecretNames.join(', ')}`,
    `- Locally visible required secret names: ${packet.currentState.visibleRequiredSecretNames.join(', ') || 'none'}`,
    `- D1 migration count: ${packet.currentState.d1MigrationCount}`,
    `- D1 migration manifest fingerprint: ${packet.currentState.d1MigrationManifestFingerprint ?? 'missing'}`,
    `- DNS cutover status: ${packet.currentState.dnsCutoverStatus}`,
    `- DNS nameserver provider: ${packet.currentState.dnsNameserverProvider}`,
    '',
    '## Next Approved Action',
    '',
    `\`${packet.nextApprovedAction}\``,
    '',
    '## Checks',
    '',
  ]

  for (const check of packet.checks) {
    lines.push(`- ${check.status}: ${check.detail}`)
  }

  lines.push('', '## Production Blockers', '')
  if (packet.productionBlockers.length) {
    for (const blocker of packet.productionBlockers) {
      lines.push(`- ${blocker}`)
    }
  } else {
    lines.push('- No local provisioning blockers are visible; continue only with approved external launch actions.')
  }

  lines.push('', '## Operator Sequence', '')
  for (const step of packet.operatorSequence) {
    lines.push(`### ${step.id}`)
    lines.push('')
    lines.push(`Side effect: ${step.sideEffect}`)
    lines.push('')
    const commands = step.commands ?? [step.command].filter(Boolean)
    if (commands.length) {
      lines.push('```bash')
      for (const item of commands) {
        lines.push(item)
      }
      lines.push('```')
      lines.push('')
    }
    if (step.captures?.length) {
      for (const item of step.captures) {
        lines.push(`- ${item}`)
      }
      lines.push('')
    }
  }

  return `${lines.join('\n')}\n`
}

const checkGeneratedAt = check && exists(outputJsonPath) ? readJson(outputJsonPath).generatedAt : undefined
const packet = buildProductionProvisioningReadiness({ generatedAt: checkGeneratedAt })
const jsonOutput = `${JSON.stringify(packet, null, 2)}\n`
const markdownOutput = renderProductionProvisioningMarkdown(packet)

if (write) {
  writeFileSync(resolve(root, outputJsonPath), jsonOutput)
  writeFileSync(resolve(root, outputMarkdownPath), markdownOutput)
}

if (check) {
  assert(exists(outputJsonPath), `${outputJsonPath} should exist`)
  assert(exists(outputMarkdownPath), `${outputMarkdownPath} should exist`)
  assert.equal(read(outputJsonPath), jsonOutput, `${outputJsonPath} is stale`)
  assert.equal(read(outputMarkdownPath), markdownOutput, `${outputMarkdownPath} is stale`)
  assert.notEqual(packet.status, 'local-contract-failed', 'Production provisioning local contract should pass')
  assert(packet.checks.every((item) => item.status === 'pass'), 'All production provisioning checks should pass')
}

console.log(markdown ? markdownOutput : jsonOutput)

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  assert.notEqual(packet.status, 'local-contract-failed', 'Production provisioning local contract should pass')
}
