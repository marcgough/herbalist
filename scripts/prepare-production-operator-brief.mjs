import assert from 'node:assert/strict'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const outputJsonPath = 'docs/production-operator-brief.json'
const outputMarkdownPath = 'docs/production-operator-brief.md'

const args = new Set(process.argv.slice(2))
const write = args.has('--write')
const check = args.has('--check')
const markdown = args.has('--markdown')

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const readJson = (path) => JSON.parse(read(path))
const exists = (path) => existsSync(resolve(root, path))
const list = (value) => (Array.isArray(value) ? value : [])
const commandList = (value) => list(value).filter(Boolean)

const secretValuePattern =
  /(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]+|-----BEGIN [A-Z ]+PRIVATE KEY-----|TOKEN_VALUE|SECRET_VALUE)/i

const sourcePacketPaths = [
  'docs/production-environment-contract.json',
  'docs/production-state-snapshot.json',
  'docs/github-production-dispatch.json',
  'docs/production-secret-setup.json',
  'docs/cloudflare-token-requirements.json',
  'docs/dns-cutover-plan.json',
  'docs/production-provisioning-readiness.json',
  'docs/external-launch-actions.json',
]

const buildCheck = (id, ok, detail) => ({
  id,
  status: ok ? 'pass' : 'fail',
  detail,
})

const unique = (items) => [...new Set(items.filter(Boolean))]

const actionById = (actions, id) => list(actions).find((action) => action.id === id)

const compactSourcePacket = (path) => {
  const packet = readJson(path)
  return {
    path,
    version: packet.version ?? null,
    generatedAt: packet.generatedAt ?? null,
    status: packet.status ?? 'contract',
    productionComplete: packet.productionComplete ?? false,
  }
}

const deriveStatus = ({ productionState, githubDispatch, dnsCutoverPlan }) => {
  if (productionState?.productionComplete) {
    return 'production-complete'
  }

  const missingGitHubCredentials = list(githubDispatch?.missingGitHubCredentialNames ?? githubDispatch?.missingGitHubSecretNames)
  if (missingGitHubCredentials.length) {
    return 'needs-github-production-credential-entry'
  }

  if (productionState?.summary?.cloudflareProductionStateStatus === 'needs-cloudflare-auth') {
    return 'needs-cloudflare-auth-or-approved-workflow-dispatch'
  }

  if (dnsCutoverPlan?.status !== 'dns-ready-for-pages-custom-domain') {
    return 'ready-for-approved-dns-transition-dispatch'
  }

  return 'ready-for-approved-final-dispatch'
}

export const buildProductionOperatorBrief = ({ generatedAt = new Date().toISOString() } = {}) => {
  for (const path of sourcePacketPaths) {
    assert(exists(path), `${path} should exist`)
  }

  const packageJson = readJson('package.json')
  const contract = readJson('docs/production-environment-contract.json')
  const productionState = readJson('docs/production-state-snapshot.json')
  const githubDispatch = readJson('docs/github-production-dispatch.json')
  const productionSecrets = readJson('docs/production-secret-setup.json')
  const cloudflareTokenRequirements = readJson('docs/cloudflare-token-requirements.json')
  const dnsCutoverPlan = readJson('docs/dns-cutover-plan.json')
  const productionProvisioning = readJson('docs/production-provisioning-readiness.json')
  const externalActions = readJson('docs/external-launch-actions.json')
  const scripts = packageJson.scripts ?? {}
  const approvalActions = list(externalActions.approvalRequiredActions)

  const requiredGitHubSecretNames =
    productionSecrets.githubProductionEnvironment?.requiredSecretNames ??
    githubDispatch.requiredGitHubSecretNames ??
    []
  const requiredGitHubVariableNames =
    productionSecrets.githubProductionEnvironment?.requiredVariableNames ??
    githubDispatch.requiredGitHubVariableNames ??
    []
  const requiredGitHubCredentialNames =
    productionSecrets.githubProductionEnvironment?.requiredCredentialNames ??
    githubDispatch.requiredGitHubCredentialNames ??
    [...requiredGitHubSecretNames, ...requiredGitHubVariableNames]
  const optionalGitHubSecretNames =
    productionSecrets.githubProductionEnvironment?.optionalSecretNames ??
    githubDispatch.optionalGitHubSecretNames ??
    []
  const generatedRuntimeSecretNames =
    productionSecrets.githubProductionEnvironment?.generatedRuntimeSecretNames ??
    githubDispatch.generatedRuntimeSecretNames ??
    []
  const missingGitHubSecretNames =
    githubDispatch.missingGitHubSecretNames ??
    productionState.summary?.githubMissingSecretNames ??
    []
  const missingGitHubVariableNames =
    githubDispatch.missingGitHubVariableNames ??
    productionState.summary?.githubMissingVariableNames ??
    []
  const missingGitHubCredentialNames =
    githubDispatch.missingGitHubCredentialNames ??
    productionState.summary?.githubMissingCredentialNames ??
    [...missingGitHubSecretNames, ...missingGitHubVariableNames]
  const liveCompletionGates = commandList(contract.commands?.liveCompletionGates)
  const finalCompletionGates = commandList(
    contract.commands?.finalCompletionGates ?? [
      ...commandList(contract.commands?.postDeployEvidence),
      ...liveCompletionGates,
    ],
  )

  const safePreflightCommands = unique([
    'npm run verify:launch -- --soft',
    'npm run verify:github-actions',
    'npm run verify:github-production-readiness',
    'npm run verify:github-release-evidence',
    'npm run verify:production-state-current',
    'npm run verify:cloudflare-production-state',
    'npm run verify:cloudflare-token-requirements',
    'npm run verify:d1-manifest',
    'npm run verify:dns-cutover',
    'npm run verify:production-secrets',
    'npm run verify:github-production-credentials',
    'npm run verify:github-generated-secrets',
    'npm run verify:github-production-dispatch',
    'npm run verify:production-deploy-workflow',
    'npm run verify:production-deploy-evidence',
    'npm run verify:production-deploy-evidence-artifact',
    'npm run verify:production-deploy-dry-run',
    'npm run verify:production-d1-resolver',
    'npm run verify:production-feed-seed',
    'npm run verify:production-provisioning',
    'npm run verify:production-operator-brief',
  ])

  const requiredGitHubSecretCommands = list(productionSecrets.githubProductionEnvironment?.secrets)
    .filter((secret) => secret.requiredForGuardedWorkflow)
    .map((secret) => secret.setCommand)
  const requiredGitHubVariableCommands = list(productionSecrets.githubProductionEnvironment?.variables).map(
    (variable) => variable.setCommand,
  )
  const externalCredentialHelperCommands = commandList([
    productionSecrets.githubProductionEnvironment?.externalCredentialHelper?.verificationCommand,
    productionSecrets.githubProductionEnvironment?.externalCredentialHelper?.setCommand,
  ])

  const status = deriveStatus({ productionState, githubDispatch, dnsCutoverPlan })
  const productionBlockers = unique([
    ...list(productionState.blockers),
    ...list(productionProvisioning.productionBlockers),
  ])

  const checks = [
    buildCheck('project-domain', contract.project?.domain === 'herbalisti.com', 'Production contract targets herbalisti.com.'),
    buildCheck(
      'github-secret-boundary',
      requiredGitHubSecretNames.includes('CLOUDFLARE_API_TOKEN') &&
        requiredGitHubVariableNames.includes('CLOUDFLARE_ACCOUNT_ID') &&
        !requiredGitHubSecretNames.includes('FEED_ADMIN_TOKEN'),
      'Cloudflare token is a GitHub production secret; Cloudflare account ID is a production variable with secret fallback.',
    ),
    buildCheck(
      'generated-runtime-tokens',
      generatedRuntimeSecretNames.includes('FEED_ADMIN_TOKEN') &&
        generatedRuntimeSecretNames.includes('MEDIA_ADMIN_TOKEN'),
      'Protected feed and media admin tokens are generated runtime names, not required external GitHub credentials.',
    ),
    buildCheck(
      'cloudflare-token-packet',
      cloudflareTokenRequirements.status === 'ready-for-token-entry' &&
        cloudflareTokenRequirements.githubSecretNames?.includes('CLOUDFLARE_API_TOKEN'),
      'Cloudflare API token permissions are documented without token values.',
    ),
    buildCheck(
      'dispatch-packet',
      githubDispatch.guardrails?.finalCompletionRequiresStrictLiveVerification === true &&
        githubDispatch.guardrails?.dnsTransitionSkipRequiresAcknowledgement === true,
      'GitHub dispatch packet preserves strict final verification and DNS-transition acknowledgement.',
    ),
    buildCheck(
      'live-completion-gates',
      liveCompletionGates.includes('npm run verify:live-readiness -- --strict') &&
        liveCompletionGates.includes('npm run verify:production -- https://herbalisti.com') &&
        liveCompletionGates.includes('npm run verify:goal-readiness -- --strict'),
      'Strict live-domain checks are declared.',
    ),
    buildCheck(
      'final-completion-gates',
      finalCompletionGates.includes(
        'npm run verify:production-deploy-evidence-artifact -- --strict --run-id <production_deploy_run_id>',
      ) &&
        finalCompletionGates.includes('npm run verify:live-readiness -- --strict') &&
        finalCompletionGates.includes('npm run verify:production -- https://herbalisti.com') &&
        finalCompletionGates.includes('npm run verify:goal-readiness -- --strict'),
      'Final completion gates include deployment artifact readback and strict live-domain checks.',
    ),
    buildCheck(
      'package-scripts',
      Boolean(scripts['prepare:production-operator-brief']) &&
        Boolean(scripts['verify:production-operator-brief']) &&
        Boolean(scripts['verify:github-production-credentials']) &&
        Boolean(scripts['set:github-production-credentials']),
      'Package exposes generated operator brief commands.',
    ),
    buildCheck(
      'operator-brief-in-release',
      exists('scripts/verify-release.mjs') &&
        read('scripts/verify-release.mjs').includes('verify:production-operator-brief'),
      'Full release verification includes the operator brief.',
    ),
    buildCheck(
      'source-packets',
      sourcePacketPaths.every((path) => exists(path)),
      'All source packets used by the operator brief exist.',
    ),
  ]

  return {
    version: 1,
    generatedAt,
    status,
    productionComplete: status === 'production-complete',
    safeToRun:
      'Reads local launch contracts and generated readiness packets, then optionally writes docs/production-operator-brief files. It does not dispatch GitHub Actions, set or request secrets, deploy, mutate DNS, create Cloudflare resources, call paid APIs, upload files, download artifacts, or print secret values.',
    project: contract.project,
    currentState: {
      localImplementationReady: Boolean(productionState.summary?.localImplementationReady),
      goalComplete: Boolean(productionState.summary?.goalComplete),
      productionStateStatus: productionState.status,
      releaseEvidenceStatus: productionState.summary?.releaseEvidenceStatus ?? 'unknown',
      productionDeployEvidenceArtifactStatus:
        productionState.summary?.productionDeployEvidenceArtifactStatus ?? 'unknown',
      releaseEvidencePolicy:
        productionState.git?.note ??
        'Stored snapshot evidence can trail repository HEAD; use npm run verify:production-state-current for exact current-commit release evidence.',
      githubProductionReadinessStatus: productionState.summary?.githubProductionReadinessStatus ?? 'unknown',
      missingGitHubSecretNames,
      missingGitHubVariableNames,
      missingGitHubCredentialNames,
      cloudflareProductionStateStatus: productionState.summary?.cloudflareProductionStateStatus ?? 'unknown',
      wranglerAuthenticated: Boolean(productionState.summary?.wranglerAuthenticated),
      dnsCutoverStatus: productionState.summary?.dnsCutoverStatus ?? dnsCutoverPlan.status,
      dnsNameserverProvider: productionState.summary?.dnsNameserverProvider ?? dnsCutoverPlan.currentState?.nameserversProvider ?? 'unknown',
      liveReadinessStatus: productionState.summary?.liveReadinessStatus ?? 'unknown',
      productionSmokeStatus: productionState.summary?.productionSmokeStatus ?? 'unknown',
      productionProvisioningStatus: productionProvisioning.status,
      productionBlockerCount: productionBlockers.length,
    },
    secretBoundary: {
      requiredGitHubSecretNames,
      requiredGitHubVariableNames,
      requiredGitHubCredentialNames,
      optionalGitHubSecretNames,
      generatedRuntimeSecretNames,
      notRequiredAsGitHubSecretNames: ['CLOUDFLARE_ACCOUNT_ID', 'FEED_ADMIN_TOKEN', 'MEDIA_ADMIN_TOKEN', 'CLOUDFLARE_D1_DATABASE_ID'],
      valueHandling:
        'Enter externally issued secret values directly into GitHub or Cloudflare. Use a GitHub production variable for non-secret identifiers such as CLOUDFLARE_ACCOUNT_ID. Do not paste secret values into chat, docs, Git, screenshots, or logs.',
    },
    operatorSequence: [
      {
        id: 'safe-local-preflight',
        sideEffect: 'none',
        commands: safePreflightCommands,
        evidence:
          'Confirms the current local build, launch contracts, source governance, GitHub release evidence, Cloudflare readiness probes, and no-secret packets before production action.',
      },
      {
        id: 'set-required-github-production-environment-credentials',
        sideEffect: 'writes-github-secrets-and-variables',
        commands: [...externalCredentialHelperCommands, ...requiredGitHubSecretCommands, ...requiredGitHubVariableCommands],
        requires: requiredGitHubCredentialNames,
        evidence:
          'Use the value-safe helper when the required values are present as local environment variables; otherwise use the direct gh commands or GitHub interface. After entry, run npm run verify:github-production-readiness -- --strict.',
      },
      {
        id: 'dispatch-guarded-production-workflow',
        sideEffect: 'public-production-deploy',
        commands: [
          githubDispatch.dispatchInputs?.finalCompletionMode?.command,
          githubDispatch.dispatchInputs?.dnsTransitionMode?.command,
        ].filter(Boolean),
        evidence:
          'Use final completion mode only when live verification is expected to pass. DNS transition mode cannot prove completion.',
      },
      {
        id: 'verify-production-deploy-evidence-artifact',
        sideEffect: 'read-only-github-metadata',
        commands: commandList(contract.commands?.postDeployEvidence),
        evidence:
          'After the guarded workflow run completes, confirm GitHub uploaded the non-secret production deployment evidence artifact for that exact run.',
      },
      {
        id: 'connect-domain-and-dns',
        sideEffect: 'mutates-public-dns-or-custom-domain',
        commands: ['npm run verify:dns-cutover'],
        evidence:
          'Connect herbalisti.com to the Herbalisti Cloudflare Pages project and re-run DNS/live readiness checks after propagation.',
      },
      {
        id: 'seed-live-feed-and-prove-completion',
        sideEffect: 'writes-production-d1-and-verifies-live-site',
        commands: [
          'npm run verify:production-feed-seed',
          ...commandList(contract.commands?.seedProductionFeed),
          ...liveCompletionGates,
        ],
        evidence:
          'A fresh protected feed refresh and strict live verification are required before the overall Herbalisti goal can be complete.',
      },
    ],
    hardGates: [
      {
        id: 'credential-entry',
        description: 'Entering production GitHub secret values and non-secret deployment variables.',
        immediateNextWhen: status === 'needs-github-production-credential-entry',
      },
      {
        id: 'production-deployment',
        description: 'Dispatching the guarded GitHub production workflow or manually deploying Cloudflare Pages/Worker.',
        immediateNextWhen: status !== 'needs-github-production-credential-entry',
      },
      {
        id: 'dns-custom-domain',
        description: 'Changing herbalisti.com nameservers, DNS records, or Cloudflare Pages custom-domain configuration.',
        immediateNextWhen: status === 'ready-for-approved-dns-transition-dispatch',
      },
      {
        id: 'paid-media-generation',
        description: 'Calling Kie.ai Seedance or any paid generation provider.',
        immediateNextWhen: false,
      },
    ],
    productionBlockers,
    finalCompletionGates,
    sourcePackets: sourcePacketPaths.map(compactSourcePacket),
    checks,
    nextAction:
      status === 'needs-github-production-credential-entry'
        ? 'Set the required GitHub production environment credentials directly in GitHub, then run npm run verify:github-production-readiness -- --strict.'
        : status === 'needs-cloudflare-auth-or-approved-workflow-dispatch'
          ? 'Authenticate Cloudflare locally for manual inspection, or use the approved guarded GitHub workflow path with required GitHub production credentials.'
          : status === 'ready-for-approved-dns-transition-dispatch'
            ? 'Run the guarded production workflow only under the DNS-transition boundary, then connect herbalisti.com and complete strict live verification.'
            : status === 'ready-for-approved-final-dispatch'
              ? 'Run the guarded production workflow in final completion mode and prove the live completion gates.'
              : 'Keep the production goal active until strict live completion evidence passes.',
  }
}

export const renderProductionOperatorBriefMarkdown = (packet) => {
  const lines = [
    '# Herbalisti Production Operator Brief',
    '',
    `Generated: ${packet.generatedAt}`,
    '',
    `Status: ${packet.status}`,
    '',
    packet.safeToRun,
    '',
    '## Current State',
    '',
    `- Domain: ${packet.project.domain}`,
    `- Local implementation ready: ${packet.currentState.localImplementationReady}`,
    `- Goal complete: ${packet.currentState.goalComplete}`,
    `- Production state: ${packet.currentState.productionStateStatus}`,
    `- Release evidence: ${packet.currentState.releaseEvidenceStatus}`,
    `- Production deploy evidence artifact: ${packet.currentState.productionDeployEvidenceArtifactStatus}`,
    `- Release evidence policy: ${packet.currentState.releaseEvidencePolicy}`,
    `- GitHub production readiness: ${packet.currentState.githubProductionReadinessStatus}`,
    `- Missing GitHub credential names: ${packet.currentState.missingGitHubCredentialNames.join(', ') || 'none'}`,
    `- Cloudflare production state: ${packet.currentState.cloudflareProductionStateStatus}`,
    `- Wrangler authenticated: ${packet.currentState.wranglerAuthenticated}`,
    `- DNS cutover: ${packet.currentState.dnsCutoverStatus}`,
    `- DNS provider: ${packet.currentState.dnsNameserverProvider}`,
    `- Live readiness: ${packet.currentState.liveReadinessStatus}`,
    `- Live production smoke: ${packet.currentState.productionSmokeStatus}`,
    `- Production provisioning: ${packet.currentState.productionProvisioningStatus}`,
    `- Production blocker count: ${packet.currentState.productionBlockerCount}`,
    '',
    '## Credential Boundary',
    '',
    `- Required GitHub production secret names: ${packet.secretBoundary.requiredGitHubSecretNames.join(', ') || 'none'}`,
    `- Required GitHub production variable names: ${packet.secretBoundary.requiredGitHubVariableNames.join(', ') || 'none'}`,
    `- Optional GitHub production secret names: ${packet.secretBoundary.optionalGitHubSecretNames.join(', ') || 'none'}`,
    `- Generated runtime secret names: ${packet.secretBoundary.generatedRuntimeSecretNames.join(', ') || 'none'}`,
    `- Not required as GitHub secrets: ${packet.secretBoundary.notRequiredAsGitHubSecretNames.join(', ')}`,
    `- ${packet.secretBoundary.valueHandling}`,
    '',
    '## Next Action',
    '',
    packet.nextAction,
    '',
    '## Operator Sequence',
    '',
  ]

  for (const step of packet.operatorSequence) {
    lines.push(`### ${step.id}`)
    lines.push('')
    lines.push(`Side effect: ${step.sideEffect}`)
    lines.push('')
    if (step.requires?.length) {
      lines.push(`Requires: ${step.requires.join(', ')}`)
      lines.push('')
    }
    if (step.evidence) {
      lines.push(step.evidence)
      lines.push('')
    }
    if (step.commands?.length) {
      lines.push('```bash')
      for (const command of step.commands) {
        lines.push(command)
      }
      lines.push('```')
      lines.push('')
    }
  }

  lines.push('## Hard Gates', '')
  for (const gate of packet.hardGates) {
    lines.push(`- ${gate.id}: ${gate.description} Immediate next: ${gate.immediateNextWhen}`)
  }

  lines.push('', '## Production Blockers', '')
  if (packet.productionBlockers.length) {
    for (const blocker of packet.productionBlockers) {
      lines.push(`- ${blocker}`)
    }
  } else {
    lines.push('- No production blockers are visible in the consolidated packets.')
  }

  lines.push('', '## Final Completion Gates', '')
  for (const gate of packet.finalCompletionGates) {
    lines.push(`- \`${gate}\``)
  }

  lines.push('', '## Checks', '')
  for (const item of packet.checks) {
    lines.push(`- ${item.status}: ${item.detail}`)
  }

  lines.push('', '## Source Packets', '')
  for (const source of packet.sourcePackets) {
    lines.push(`- ${source.path}: ${source.status}`)
  }
  lines.push('')

  return lines.join('\n')
}

const validatePacket = (packet, jsonOutput, markdownOutput) => {
  assert.equal(packet.version, 1, 'Operator brief should be version 1')
  assert.equal(packet.project?.domain, 'herbalisti.com', 'Operator brief should target herbalisti.com')
  assert(packet.safeToRun.includes('does not dispatch GitHub Actions'), 'Operator brief should state dispatch boundary')
  assert(packet.secretBoundary.requiredGitHubSecretNames.includes('CLOUDFLARE_API_TOKEN'), 'CLOUDFLARE_API_TOKEN should be named')
  assert(packet.secretBoundary.requiredGitHubVariableNames.includes('CLOUDFLARE_ACCOUNT_ID'), 'CLOUDFLARE_ACCOUNT_ID should be named as a GitHub variable')
  assert(
    !packet.secretBoundary.requiredGitHubSecretNames.includes('FEED_ADMIN_TOKEN'),
    'FEED_ADMIN_TOKEN should not be a required GitHub production secret',
  )
  assert(packet.secretBoundary.generatedRuntimeSecretNames.includes('FEED_ADMIN_TOKEN'), 'FEED_ADMIN_TOKEN should be generated runtime token')
  assert(
    packet.operatorSequence.some((step) => step.id === 'dispatch-guarded-production-workflow'),
    'Operator brief should include guarded workflow dispatch sequence',
  )
  assert(
    packet.operatorSequence
      .find((step) => step.id === 'set-required-github-production-environment-credentials')
      ?.commands?.includes('npm run verify:github-production-credentials'),
    'Operator brief should include the value-safe GitHub production credential helper',
  )
  assert(
    packet.operatorSequence.some((step) => step.id === 'verify-production-deploy-evidence-artifact'),
    'Operator brief should include production deploy evidence artifact readback sequence',
  )
  assert(
    packet.operatorSequence.some((step) => step.id === 'seed-live-feed-and-prove-completion'),
    'Operator brief should include live feed seed and completion sequence',
  )
  assert(
    packet.finalCompletionGates.includes(
      'npm run verify:production-deploy-evidence-artifact -- --strict --run-id <production_deploy_run_id>',
    ),
    'Operator brief should include strict production deploy evidence artifact readback in final completion gates',
  )
  assert(
    packet.finalCompletionGates.includes('npm run verify:production -- https://herbalisti.com'),
    'Operator brief should include production URL verification',
  )
  assert(packet.checks.every((item) => item.status === 'pass'), 'All operator brief checks should pass')
  assert.equal(secretValuePattern.test(`${jsonOutput}\n${markdownOutput}`), false, 'Operator brief must not contain secret-looking values')
}

const checkGeneratedAt = check && exists(outputJsonPath) ? readJson(outputJsonPath).generatedAt : undefined
const packet = buildProductionOperatorBrief({ generatedAt: checkGeneratedAt })
const jsonOutput = `${JSON.stringify(packet, null, 2)}\n`
const markdownOutput = renderProductionOperatorBriefMarkdown(packet)

if (write) {
  writeFileSync(resolve(root, outputJsonPath), jsonOutput)
  writeFileSync(resolve(root, outputMarkdownPath), markdownOutput)
}

if (check) {
  assert(exists(outputJsonPath), `${outputJsonPath} should exist`)
  assert(exists(outputMarkdownPath), `${outputMarkdownPath} should exist`)
  assert.equal(read(outputJsonPath), jsonOutput, `${outputJsonPath} is stale`)
  assert.equal(read(outputMarkdownPath), markdownOutput, `${outputMarkdownPath} is stale`)
}

validatePacket(packet, jsonOutput, markdownOutput)

console.log(markdown ? markdownOutput : jsonOutput)

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  validatePacket(packet, jsonOutput, markdownOutput)
}
