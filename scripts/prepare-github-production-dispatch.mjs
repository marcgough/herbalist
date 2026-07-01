import assert from 'node:assert/strict'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const outputJsonPath = 'docs/github-production-dispatch.json'
const outputMarkdownPath = 'docs/github-production-dispatch.md'

const args = new Set(process.argv.slice(2))
const write = args.has('--write')
const check = args.has('--check')
const markdown = args.has('--markdown')

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const readJson = (path) => JSON.parse(read(path))
const exists = (path) => existsSync(resolve(root, path))
const secretValuePattern =
  /(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]+|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i

const buildCheck = (id, ok, detail) => ({
  id,
  status: ok ? 'pass' : 'fail',
  detail,
})

const list = (value) => (Array.isArray(value) ? value : [])

export const buildGithubProductionDispatchPacket = ({ generatedAt = new Date().toISOString() } = {}) => {
  const packageJson = readJson('package.json')
  const contract = readJson('docs/production-environment-contract.json')
  const externalActions = readJson('docs/external-launch-actions.json')
  const productionProvisioning = exists('docs/production-provisioning-readiness.json')
    ? readJson('docs/production-provisioning-readiness.json')
    : null
  const productionState = exists('docs/production-state-snapshot.json')
    ? readJson('docs/production-state-snapshot.json')
    : null
  const productionSecrets = exists('docs/production-secret-setup.json')
    ? readJson('docs/production-secret-setup.json')
    : null
  const cloudflareTokenRequirements = exists('docs/cloudflare-token-requirements.json')
    ? readJson('docs/cloudflare-token-requirements.json')
    : null
  const workflow = read('.github/workflows/production-deploy.yml')
  const releaseVerifier = read('scripts/verify-release.mjs')
  const packageScripts = packageJson.scripts ?? {}
  const dispatchAction = list(externalActions.approvalRequiredActions).find(
    (action) => action.id === 'run-github-production-deploy-workflow',
  )
  const requiredSecretNames = [
    'CLOUDFLARE_API_TOKEN',
    'CLOUDFLARE_ACCOUNT_ID',
  ]
  const optionalSecretNames = ['KIE_API_KEY']
  const generatedRuntimeSecretNames = ['FEED_ADMIN_TOKEN', 'MEDIA_ADMIN_TOKEN']
  const missingGitHubSecretNames = productionState?.summary?.githubMissingSecretNames ?? requiredSecretNames

  const strictPreflightCommands = [
    'npm run verify:github-actions',
    'npm run verify:github-production-readiness -- --strict',
    'npm run verify:github-release-evidence -- --commit <dispatch_commit_sha>',
    'npm run verify:production-state-current',
    'npm run verify:production-secrets',
    'npm run verify:cloudflare-token-requirements',
    'npm run verify:production-deploy-workflow',
    'npm run verify:production-deploy-evidence',
    'npm run verify:production-deploy-dry-run',
    'npm run verify:production-d1-resolver',
    'npm run verify:production-feed-seed',
    'npm run verify:d1-manifest',
    'npm run verify:dns-cutover',
    'npm run verify:production-provisioning',
    'npm run verify:github-generated-secrets',
    'npm run verify:github-production-dispatch',
    'npm run verify:launch -- --soft',
  ]

  const dispatchInputs = {
    finalCompletionMode: {
      confirm: 'deploy-herbalisti-production',
      skip_live_verification: false,
      skip_live_verification_confirm: '',
      command:
        'gh workflow run production-deploy.yml --repo marcgough/herbalist --ref main -f confirm=deploy-herbalisti-production -f skip_live_verification=false',
      completionEvidence:
        'Final completion requires live verification inside the workflow plus npm run verify:live-readiness -- --strict, npm run verify:production -- https://herbalisti.com, and npm run verify:goal-readiness -- --strict.',
    },
    dnsTransitionMode: {
      confirm: 'deploy-herbalisti-production',
      skip_live_verification: true,
      skip_live_verification_confirm: 'skip-herbalisti-live-verification',
      command:
        'gh workflow run production-deploy.yml --repo marcgough/herbalist --ref main -f confirm=deploy-herbalisti-production -f skip_live_verification=true -f skip_live_verification_confirm=skip-herbalisti-live-verification',
      completionEvidence:
        'This mode is only for DNS-transition sequencing and cannot prove goal completion. Strict live verification remains required afterward.',
    },
  }

  const checks = [
    buildCheck('workflow-file', exists('.github/workflows/production-deploy.yml'), 'Production deploy workflow exists.'),
    buildCheck(
      'manual-workflow',
      workflow.includes('workflow_dispatch:') && !workflow.includes('pull_request:'),
      'Production deploy workflow is manually dispatched only.',
    ),
    buildCheck(
      'primary-confirmation',
      workflow.includes('deploy-herbalisti-production') && workflow.includes('DEPLOY_CONFIRMATION'),
      'Production deploy workflow requires the primary confirmation phrase.',
    ),
    buildCheck(
      'skip-acknowledgement',
      workflow.includes('skip_live_verification_confirm') &&
        workflow.includes('skip-herbalisti-live-verification') &&
        workflow.includes('SKIP_LIVE_VERIFICATION_CONFIRMATION'),
      'Production deploy workflow requires a second acknowledgement when live verification is skipped.',
    ),
    buildCheck(
      'package-scripts',
      Boolean(packageScripts['prepare:github-production-dispatch']) &&
        Boolean(packageScripts['verify:github-production-dispatch']),
      'Package exposes prepare and verify commands for this dispatch packet.',
    ),
    buildCheck(
      'contract-preflight',
      contract.commands.safePreflight.includes('npm run verify:github-production-dispatch'),
      'Production contract safe preflight includes GitHub production dispatch verification.',
    ),
    buildCheck(
      'external-action-wiring',
      Boolean(dispatchAction) &&
        dispatchAction.verification?.includes('npm run verify:github-production-dispatch') &&
        dispatchAction.notes?.some((note) => note.includes('skip_live_verification_confirm=skip-herbalisti-live-verification')),
      'External action checklist wires the guarded dispatch packet into the production workflow action.',
    ),
    buildCheck(
      'release-gate',
      releaseVerifier.includes('verify:github-production-dispatch'),
      'Full release verifier includes the GitHub production dispatch packet.',
    ),
    buildCheck(
      'production-provisioning',
      productionProvisioning?.status === 'ready-for-approved-production-provisioning' ||
        productionProvisioning?.status === 'ready-for-approved-deployment-and-live-verification',
      'Production provisioning packet is available and locally consistent.',
    ),
    buildCheck(
      'production-state',
      productionState?.status === 'local-ready-production-pending' && productionState?.productionComplete === false,
      'Production state snapshot still separates local readiness from live completion.',
    ),
    buildCheck(
      'production-secret-setup',
      productionSecrets?.status === 'ready-for-secret-entry',
      'Production secret setup packet is available without secret values.',
    ),
    buildCheck(
      'github-generated-secret-helper',
      Boolean(packageScripts['set:github-generated-secrets']) &&
        Boolean(packageScripts['verify:github-generated-secrets']) &&
        exists('scripts/set-github-generated-secrets.mjs') &&
        productionSecrets?.githubProductionEnvironment?.generatedSecretHelper?.generatedSecretNames?.includes('FEED_ADMIN_TOKEN') &&
        productionSecrets?.githubProductionEnvironment?.generatedSecretHelper?.generatedSecretNames?.includes('MEDIA_ADMIN_TOKEN'),
      'Value-free helper is available for generated Herbalisti-owned GitHub admin tokens.',
    ),
    buildCheck(
      'cloudflare-token-requirements',
      cloudflareTokenRequirements?.status === 'ready-for-token-entry',
      'Cloudflare token requirement packet is available without token values.',
    ),
  ]

  const failedChecks = checks.filter((item) => item.status !== 'pass')
  const status = failedChecks.length
    ? 'local-contract-failed'
    : missingGitHubSecretNames.length
    ? 'needs-github-production-secret-names'
    : productionState?.summary?.dnsCutoverStatus !== 'ready'
    ? 'ready-for-approved-dispatch-dns-transition-only'
    : 'ready-for-approved-final-dispatch'

  return {
    version: 1,
    generatedAt,
    status,
    productionComplete: false,
    safeToRun:
      'Reads local launch contracts, workflow files, and generated readiness packets only. It does not dispatch GitHub Actions, set secrets, deploy, mutate DNS, create Cloudflare resources, call paid APIs, or print secret values.',
    repository: 'marcgough/herbalist',
    branch: 'main',
    dispatchCommit: '<dispatch_commit_sha>',
    dispatchCommitPolicy:
      'Replace <dispatch_commit_sha> with the exact main-branch commit that will be dispatched, then run the strict release evidence and production-state-current gates before dispatch.',
    workflow: {
      file: '.github/workflows/production-deploy.yml',
      name: 'Herbalisti Production Deploy',
      environment: 'production',
      url: 'https://herbalisti.com',
    },
    dispatchInputs,
    strictPreflightCommands,
    requiredGitHubSecretNames: requiredSecretNames,
    optionalGitHubSecretNames: optionalSecretNames,
    generatedRuntimeSecretNames,
    missingGitHubSecretNames,
    currentReadiness: {
      productionStateStatus: productionState?.status ?? 'missing',
      githubProductionReadinessStatus: productionState?.summary?.githubProductionReadinessStatus ?? 'missing',
      cloudflareProductionStateStatus: productionState?.summary?.cloudflareProductionStateStatus ?? 'missing',
      dnsCutoverStatus: productionState?.summary?.dnsCutoverStatus ?? 'missing',
      liveReadinessStatus: productionState?.summary?.liveReadinessStatus ?? 'missing',
      productionProvisioningStatus: productionProvisioning?.status ?? 'missing',
    },
    checks,
    finalCompletionGates: contract.commands.liveCompletionGates,
    guardrails: {
      noSecretValuesInPacket: true,
      noActionDispatchDuringPreparation: true,
      finalCompletionRequiresStrictLiveVerification: true,
      dnsTransitionSkipRequiresAcknowledgement: true,
    },
  }
}

export const renderGithubProductionDispatchMarkdown = (packet) => {
  const lines = [
    '# Herbalisti GitHub Production Dispatch Packet',
    '',
    `Generated: ${packet.generatedAt}`,
    '',
    `Status: ${packet.status}`,
    '',
    packet.safeToRun,
    '',
    '## Current Readiness',
    '',
    `- Repository: ${packet.repository}`,
    `- Branch: ${packet.branch}`,
    `- Dispatch commit: ${packet.dispatchCommit}`,
    `- Dispatch commit policy: ${packet.dispatchCommitPolicy}`,
    `- Production state: ${packet.currentReadiness.productionStateStatus}`,
    `- GitHub production readiness: ${packet.currentReadiness.githubProductionReadinessStatus}`,
    `- Cloudflare production state: ${packet.currentReadiness.cloudflareProductionStateStatus}`,
    `- DNS cutover: ${packet.currentReadiness.dnsCutoverStatus}`,
    `- Live readiness: ${packet.currentReadiness.liveReadinessStatus}`,
    `- Production provisioning: ${packet.currentReadiness.productionProvisioningStatus}`,
    '',
    '## Required GitHub Secret Names',
    '',
  ]

  for (const name of packet.requiredGitHubSecretNames) {
    const missing = packet.missingGitHubSecretNames.includes(name)
    lines.push(`- ${name}: ${missing ? 'missing' : 'present'}`)
  }

  lines.push('', '## Optional GitHub Secret Names', '')
  for (const name of packet.optionalGitHubSecretNames) {
    const missing = packet.missingGitHubSecretNames.includes(name)
    lines.push(`- ${name}: ${missing ? 'optional / not set' : 'present'}`)
  }

  lines.push('', '## Generated Runtime Secret Names', '')
  for (const name of packet.generatedRuntimeSecretNames) {
    lines.push(`- ${name}: generated and masked during the guarded workflow`)
  }

  lines.push('', '## Strict Preflight', '', '```bash')
  for (const command of packet.strictPreflightCommands) {
    lines.push(command)
  }
  lines.push('```', '')

  lines.push('## Final Completion Dispatch', '')
  lines.push('Use this only when production DNS/custom-domain routing and live verification are expected to pass.')
  lines.push('')
  lines.push('Inputs:')
  lines.push('')
  for (const [key, value] of Object.entries(packet.dispatchInputs.finalCompletionMode)) {
    if (key !== 'command' && key !== 'completionEvidence') {
      lines.push(`- ${key}: ${String(value)}`)
    }
  }
  lines.push('', '```bash', packet.dispatchInputs.finalCompletionMode.command, '```', '')
  lines.push(packet.dispatchInputs.finalCompletionMode.completionEvidence)
  lines.push('')

  lines.push('## DNS Transition Dispatch', '')
  lines.push('Use this only when the production deployment must run before DNS/custom-domain routing can pass.')
  lines.push('')
  lines.push('Inputs:')
  lines.push('')
  for (const [key, value] of Object.entries(packet.dispatchInputs.dnsTransitionMode)) {
    if (key !== 'command' && key !== 'completionEvidence') {
      lines.push(`- ${key}: ${String(value)}`)
    }
  }
  lines.push('', '```bash', packet.dispatchInputs.dnsTransitionMode.command, '```', '')
  lines.push(packet.dispatchInputs.dnsTransitionMode.completionEvidence)
  lines.push('')

  lines.push('## Checks', '')
  for (const check of packet.checks) {
    lines.push(`- ${check.status}: ${check.detail}`)
  }

  lines.push('', '## Final Completion Gates', '')
  for (const gate of packet.finalCompletionGates) {
    lines.push(`- \`${gate}\``)
  }
  lines.push('')

  return `${lines.join('\n')}\n`
}

const checkGeneratedAt = check && exists(outputJsonPath) ? readJson(outputJsonPath).generatedAt : undefined
const packet = buildGithubProductionDispatchPacket({ generatedAt: checkGeneratedAt })
const jsonOutput = `${JSON.stringify(packet, null, 2)}\n`
const markdownOutput = renderGithubProductionDispatchMarkdown(packet)

if (write) {
  writeFileSync(resolve(root, outputJsonPath), jsonOutput)
  writeFileSync(resolve(root, outputMarkdownPath), markdownOutput)
}

if (check) {
  assert(exists(outputJsonPath), `${outputJsonPath} should exist`)
  assert(exists(outputMarkdownPath), `${outputMarkdownPath} should exist`)
  assert.equal(read(outputJsonPath), jsonOutput, `${outputJsonPath} is stale`)
  assert.equal(read(outputMarkdownPath), markdownOutput, `${outputMarkdownPath} is stale`)
  assert.notEqual(packet.status, 'local-contract-failed', 'GitHub production dispatch local contract should pass')
  assert(packet.checks.every((item) => item.status === 'pass'), 'All GitHub production dispatch checks should pass')
}

assert(!secretValuePattern.test(jsonOutput), 'GitHub production dispatch packet must not contain secret values')
assert(!secretValuePattern.test(markdownOutput), 'GitHub production dispatch Markdown must not contain secret values')

console.log(markdown ? markdownOutput : jsonOutput)

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  assert.notEqual(packet.status, 'local-contract-failed', 'GitHub production dispatch local contract should pass')
}
