import assert from 'node:assert/strict'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const outputJsonPath = 'docs/production-secret-setup.json'
const outputMarkdownPath = 'docs/production-secret-setup.md'
const workflowPath = '.github/workflows/production-deploy.yml'

const args = new Set(process.argv.slice(2))
const write = args.has('--write')
const check = args.has('--check')
const markdown = args.has('--markdown')

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const readJson = (path) => JSON.parse(read(path))
const exists = (path) => existsSync(resolve(root, path))

const secretValuePattern =
  /(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]+|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i

const requiredWorkflowSecretNames = [
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_ACCOUNT_ID',
  'FEED_ADMIN_TOKEN',
  'KIE_API_KEY',
  'MEDIA_ADMIN_TOKEN',
]

const workflowDerivedValues = [
  {
    name: 'CLOUDFLARE_D1_DATABASE_ID',
    source: 'Cloudflare D1 database named herbalisti',
    command: 'npm run resolve:production-d1 -- --create-if-missing --github-env "$GITHUB_ENV"',
    notes:
      'Resolved inside the guarded production workflow and written to the runner environment; it is not required as a GitHub secret.',
  },
]

const preferredGithubScope = {
  repository: 'marcgough/herbalist',
  environment: 'production',
  reason:
    'The guarded production deploy workflow targets the GitHub production environment, so environment-scoped secrets keep launch credentials behind the same approval boundary.',
}

const workflowSecretCommand = (name) => `gh secret set ${name} --env production --repo marcgough/herbalist`

const commandForContractSecret = (secret) => secret.setCommand ?? workflowSecretCommand(secret.name)

export const buildProductionSecretSetup = ({ generatedAt = new Date().toISOString() } = {}) => {
  const packageJson = readJson('package.json')
  const contract = readJson('docs/production-environment-contract.json')
  const workflow = read(workflowPath)
  const externalActions = readJson('docs/external-launch-actions.json')
  const cloudflareTokenRequirements = exists('docs/cloudflare-token-requirements.json')
    ? readJson('docs/cloudflare-token-requirements.json')
    : null
  const workflowSecretRefs = [...workflow.matchAll(/secrets\.([A-Z0-9_]+)/g)].map((match) => match[1])
  const contractSecrets = Object.fromEntries(contract.secrets.map((secret) => [secret.name, secret]))

  const githubEnvironmentSecrets = requiredWorkflowSecretNames.map((name) => ({
    name,
    requiredForGuardedWorkflow: true,
    preferredScope: preferredGithubScope,
    setCommand: workflowSecretCommand(name),
    source: workflowPath,
    notes: 'Set directly in GitHub without pasting the value into chat, docs, Git, or logs.',
  }))

  const cloudflareRuntimeSecrets = contract.secrets
    .filter((secret) => secret.setCommand)
    .map((secret) => ({
      name: secret.name,
      requiredForLaunch: secret.requiredForLaunch,
      scope: secret.scope,
      setCommand: commandForContractSecret(secret),
      workflowCanSetFromGithubSecret: requiredWorkflowSecretNames.includes(secret.name),
      notes: secret.notes,
    }))

  const checks = [
    {
      id: 'workflow-file',
      status: exists(workflowPath) ? 'pass' : 'fail',
      detail: `${workflowPath} exists.`,
    },
    {
      id: 'workflow-secret-references',
      status: requiredWorkflowSecretNames.every((name) => workflowSecretRefs.includes(name)) ? 'pass' : 'fail',
      detail: 'Production deploy workflow references every required workflow secret name.',
    },
    {
      id: 'workflow-derived-d1-id',
      status:
        workflowDerivedValues.every((value) => workflow.includes(value.command)) &&
        !workflowSecretRefs.includes('CLOUDFLARE_D1_DATABASE_ID')
          ? 'pass'
          : 'fail',
      detail: 'Production deploy workflow resolves the D1 database ID during the guarded run instead of requiring it as a GitHub secret.',
    },
    {
      id: 'contract-secret-records',
      status: requiredWorkflowSecretNames.every((name) => Boolean(contractSecrets[name])) ? 'pass' : 'fail',
      detail: 'Production contract records every guarded workflow secret name.',
    },
    {
      id: 'runtime-secret-commands',
      status: cloudflareRuntimeSecrets.filter((secret) => secret.requiredForLaunch).every((secret) => secret.setCommand)
        ? 'pass'
        : 'fail',
      detail: 'Required Cloudflare runtime secrets have command templates without values.',
    },
    {
      id: 'github-readiness-verifier',
      status:
        Boolean(packageJson.scripts?.['verify:github-production-readiness']) &&
        exists('scripts/verify-github-production-readiness.mjs')
          ? 'pass'
          : 'fail',
      detail: 'GitHub production readiness verifier is available for secret-name checks.',
    },
    {
      id: 'cloudflare-token-requirements',
      status:
        Boolean(packageJson.scripts?.['verify:cloudflare-token-requirements']) &&
        cloudflareTokenRequirements?.status === 'ready-for-token-entry'
          ? 'pass'
          : 'fail',
      detail: 'Cloudflare API token permission packet is available for CLOUDFLARE_API_TOKEN setup.',
    },
    {
      id: 'external-action-secret-coverage',
      status: requiredWorkflowSecretNames.every((name) =>
        externalActions.approvalRequiredActions.some((action) => action.secretNames?.includes(name)),
      )
        ? 'pass'
        : 'fail',
      detail: 'External action packet names the required production workflow secrets.',
    },
  ]

  const packet = {
    version: 1,
    generatedAt,
    status: checks.every((item) => item.status === 'pass') ? 'ready-for-secret-entry' : 'local-contract-failed',
    productionComplete: false,
    safeToRun:
      'Reads local launch contracts and workflow files, then optionally writes docs/production-secret-setup files. It does not read, request, set, store, or print secret values; it does not call GitHub or Cloudflare APIs, deploy, mutate DNS, create resources, or call paid APIs.',
    project: contract.project,
    guardrails: {
      neverPasteSecretValuesIntoChatDocsGitOrLogs: true,
      preferGithubProductionEnvironmentSecrets: true,
      productionWorkflowRequiresManualDispatch: true,
      cloudflareRuntimeSecretsCanBeSetByGuardedWorkflow: true,
    },
    githubProductionEnvironment: {
      repository: preferredGithubScope.repository,
      environment: preferredGithubScope.environment,
      readinessCommand: 'npm run verify:github-production-readiness',
      strictReadinessCommand: 'npm run verify:github-production-readiness -- --strict',
      secrets: githubEnvironmentSecrets,
      workflowDerivedValues,
    },
    cloudflareRuntime: {
      note:
        'When the guarded GitHub production deploy workflow is used, it sets required Cloudflare runtime secrets from GitHub secrets. Direct Wrangler commands are the manual fallback path.',
      secrets: cloudflareRuntimeSecrets,
    },
    cloudflareApiTokenRequirements: {
      status: cloudflareTokenRequirements?.status ?? 'missing',
      documentation: 'docs/cloudflare-token-requirements.md',
      verificationCommand: 'npm run verify:cloudflare-token-requirements',
      note:
        'CLOUDFLARE_API_TOKEN is a GitHub production secret name; its Cloudflare permissions are documented separately so values and permission metadata do not get mixed.',
    },
    checks,
    operatorSequence: [
      {
        id: 'resolve-cloudflare-d1-during-guarded-workflow',
        sideEffect: 'creates-cloudflare-resource',
        detail:
          'The guarded production workflow resolves the Cloudflare D1 database named herbalisti and creates it only if it is missing during the approved run.',
      },
      {
        id: 'set-github-production-environment-secrets',
        sideEffect: 'writes-github-secrets',
        commands: githubEnvironmentSecrets.map((secret) => secret.setCommand),
      },
      {
        id: 'verify-secret-name-readiness',
        sideEffect: 'none',
        commands: ['npm run verify:github-production-readiness', 'npm run verify:github-production-readiness -- --strict'],
      },
      {
        id: 'manual-cloudflare-runtime-secret-fallback',
        sideEffect: 'writes-cloudflare-secrets',
        commands: cloudflareRuntimeSecrets.map((secret) => secret.setCommand),
        detail:
          'Use only if not using the guarded GitHub production deploy workflow. Values must be entered interactively or piped from a local secret manager, not pasted into chat, docs, or Git.',
      },
    ],
  }

  const combined = JSON.stringify(packet)
  assert.equal(secretValuePattern.test(combined), false, 'Production secret setup packet must not contain secret-looking values')

  return packet
}

export const renderProductionSecretSetupMarkdown = (packet) => {
  const lines = [
    '# Herbalisti Production Secret Setup',
    '',
    `Generated: ${packet.generatedAt}`,
    '',
    `Status: ${packet.status}`,
    '',
    packet.safeToRun,
    '',
    '## Guardrails',
    '',
    '- Do not paste secret values into chat, docs, Git, screenshots, or command logs.',
    '- Prefer GitHub `production` environment secrets for the guarded production deploy workflow.',
    '- Enter values directly in GitHub or Cloudflare interfaces, or pipe from a local secret manager.',
    '- Setting a Kie.ai key does not approve paid generation; generated video remains separately approval-gated.',
    '',
    '## GitHub Production Environment Secrets',
    '',
    `Repository: \`${packet.githubProductionEnvironment.repository}\``,
    '',
    `Environment: \`${packet.githubProductionEnvironment.environment}\``,
    '',
    '```bash',
  ]

  for (const secret of packet.githubProductionEnvironment.secrets) {
    lines.push(secret.setCommand)
  }

  lines.push('```', '', '## Workflow-Derived Values', '')
  for (const value of packet.githubProductionEnvironment.workflowDerivedValues) {
    lines.push(`- \`${value.name}\`: ${value.notes}`)
    lines.push('')
    lines.push('```bash')
    lines.push(value.command)
    lines.push('```')
    lines.push('')
  }

  lines.push('Verify secret-name readiness:', '', '```bash')
  lines.push(packet.githubProductionEnvironment.readinessCommand)
  lines.push(packet.githubProductionEnvironment.strictReadinessCommand)
  lines.push('```', '', '## Cloudflare Runtime Secret Fallback', '')
  lines.push(packet.cloudflareRuntime.note)
  lines.push('', '```bash')
  for (const secret of packet.cloudflareRuntime.secrets) {
    lines.push(secret.setCommand)
  }
  lines.push('```', '', '## Cloudflare API Token Permissions', '')
  lines.push(packet.cloudflareApiTokenRequirements.note)
  lines.push('')
  lines.push(`- Status: ${packet.cloudflareApiTokenRequirements.status}`)
  lines.push(`- Documentation: \`${packet.cloudflareApiTokenRequirements.documentation}\``)
  lines.push(`- Verification: \`${packet.cloudflareApiTokenRequirements.verificationCommand}\``)
  lines.push('', '## Checks', '')

  for (const check of packet.checks) {
    lines.push(`- ${check.status}: ${check.detail}`)
  }

  lines.push('', '## Operator Sequence', '')
  for (const step of packet.operatorSequence) {
    lines.push(`### ${step.id}`)
    lines.push('')
    lines.push(`Side effect: ${step.sideEffect}`)
    lines.push('')
    if (step.detail) {
      lines.push(step.detail)
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

  return lines.join('\n')
}

const checkGeneratedAt = check && exists(outputJsonPath) ? readJson(outputJsonPath).generatedAt : undefined
const packet = buildProductionSecretSetup({ generatedAt: checkGeneratedAt })
const jsonOutput = `${JSON.stringify(packet, null, 2)}\n`
const markdownOutput = renderProductionSecretSetupMarkdown(packet)

if (write) {
  writeFileSync(resolve(root, outputJsonPath), jsonOutput)
  writeFileSync(resolve(root, outputMarkdownPath), markdownOutput, 'utf8')
}

if (check) {
  assert.equal(packet.status, 'ready-for-secret-entry', 'Production secret setup local contract should pass')
  assert.ok(exists(outputJsonPath), `${outputJsonPath} should exist`)
  assert.ok(exists(outputMarkdownPath), `${outputMarkdownPath} should exist`)
  assert.equal(read(outputJsonPath), jsonOutput, `${outputJsonPath} is stale`)
  assert.equal(read(outputMarkdownPath), markdownOutput, `${outputMarkdownPath} is stale`)
}

console.log(markdown ? markdownOutput : jsonOutput)

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  assert.equal(packet.status, 'ready-for-secret-entry', 'Production secret setup local contract should pass')
}
