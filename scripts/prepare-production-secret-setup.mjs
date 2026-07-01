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

const requiredWorkflowSecretNames = ['CLOUDFLARE_API_TOKEN']
const requiredWorkflowVariableNames = ['CLOUDFLARE_ACCOUNT_ID']
const requiredWorkflowCredentialNames = [...requiredWorkflowSecretNames, ...requiredWorkflowVariableNames]
const optionalWorkflowSecretNames = ['KIE_API_KEY']
const generatedRuntimeSecretNames = ['FEED_ADMIN_TOKEN', 'MEDIA_ADMIN_TOKEN']

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
const workflowVariableCommand = (name) => `gh variable set ${name} --env production --repo marcgough/herbalist`
const externalCredentialHelperVerifyCommand = 'npm run verify:github-production-credentials'
const externalCredentialHelperSetCommand =
  'npm run set:github-production-credentials -- --confirm set-herbalisti-production-credentials'
const generatedGithubSecretNames = ['FEED_ADMIN_TOKEN', 'MEDIA_ADMIN_TOKEN']
const generatedGithubSecretCommand =
  'npm run set:github-generated-secrets -- --confirm set-herbalisti-generated-secrets'
const generatedGithubSecretVerifyCommand = 'npm run verify:github-generated-secrets'

const commandForContractSecret = (secret) => secret.setCommand ?? workflowSecretCommand(secret.name)
const commandsForContractSecret = (secret) =>
  [commandForContractSecret(secret), ...(Array.isArray(secret.additionalSetCommands) ? secret.additionalSetCommands : [])].filter(Boolean)

export const buildProductionSecretSetup = ({ generatedAt = new Date().toISOString() } = {}) => {
  const packageJson = readJson('package.json')
  const contract = readJson('docs/production-environment-contract.json')
  const workflow = read(workflowPath)
  const externalActions = readJson('docs/external-launch-actions.json')
  const cloudflareTokenRequirements = exists('docs/cloudflare-token-requirements.json')
    ? readJson('docs/cloudflare-token-requirements.json')
    : null
  const workflowSecretRefs = [...workflow.matchAll(/secrets\.([A-Z0-9_]+)/g)].map((match) => match[1])
  const workflowVariableRefs = [...workflow.matchAll(/vars\.([A-Z0-9_]+)/g)].map((match) => match[1])
  const contractSecrets = Object.fromEntries(contract.secrets.map((secret) => [secret.name, secret]))

  const githubEnvironmentSecrets = [...requiredWorkflowSecretNames, ...optionalWorkflowSecretNames].map((name) => ({
    name,
    requiredForGuardedWorkflow: requiredWorkflowSecretNames.includes(name),
    valueSource: 'external-credential',
    preferredScope: preferredGithubScope,
    setCommand: workflowSecretCommand(name),
    source: workflowPath,
    notes: optionalWorkflowSecretNames.includes(name)
      ? 'Optional for launch. Set directly in GitHub only when approved Seedance media generation should be enabled.'
      : 'Set directly in GitHub without pasting the value into chat, docs, Git, or logs.',
  }))
  const githubEnvironmentVariables = requiredWorkflowVariableNames.map((name) => ({
    name,
    requiredForGuardedWorkflow: true,
    valueSource: 'cloudflare-account-identifier',
    preferredScope: preferredGithubScope,
    setCommand: workflowVariableCommand(name),
    secretFallbackCommand: workflowSecretCommand(name),
    source: workflowPath,
    notes:
      'Prefer a GitHub production environment variable because this is an account identifier, not a secret. A secret fallback is supported for existing setups.',
  }))

  const cloudflareRuntimeSecrets = contract.secrets
    .filter((secret) => secret.setCommand)
    .map((secret) => ({
      name: secret.name,
      requiredForLaunch: secret.requiredForLaunch,
      scope: secret.scope,
      setCommand: commandForContractSecret(secret),
      setCommands: commandsForContractSecret(secret),
      workflowCanSetFromGithubSecret:
        requiredWorkflowSecretNames.includes(secret.name) ||
        requiredWorkflowVariableNames.includes(secret.name) ||
        optionalWorkflowSecretNames.includes(secret.name) ||
        generatedRuntimeSecretNames.includes(secret.name),
      workflowValueSource: generatedRuntimeSecretNames.includes(secret.name)
        ? 'generated-runtime-token'
        : requiredWorkflowVariableNames.includes(secret.name)
          ? 'required-github-variable-or-secret-fallback'
        : optionalWorkflowSecretNames.includes(secret.name)
          ? 'optional-github-secret'
          : requiredWorkflowSecretNames.includes(secret.name)
            ? 'required-github-secret'
            : 'manual-only',
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
      status:
        requiredWorkflowSecretNames.every((name) => workflowSecretRefs.includes(name)) &&
        requiredWorkflowVariableNames.every((name) => workflowVariableRefs.includes(name) || workflowSecretRefs.includes(name)) &&
        optionalWorkflowSecretNames.every((name) => workflowSecretRefs.includes(name)) &&
        generatedRuntimeSecretNames.every((name) => workflow.includes(name))
          ? 'pass'
          : 'fail',
      detail:
        'Production deploy workflow references required external credentials, optional Kie credentials, and generated runtime admin token names.',
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
      status: [...requiredWorkflowCredentialNames, ...optionalWorkflowSecretNames, ...generatedRuntimeSecretNames].every((name) =>
        Boolean(contractSecrets[name]),
      )
        ? 'pass'
        : 'fail',
      detail: 'Production contract records required, optional, and generated runtime secret names.',
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
      detail: 'GitHub production readiness verifier is available for credential-name checks.',
    },
    {
      id: 'github-production-credential-helper',
      status:
        Boolean(packageJson.scripts?.['set:github-production-credentials']) &&
        Boolean(packageJson.scripts?.['verify:github-production-credentials']) &&
        exists('scripts/set-github-production-credentials.mjs')
          ? 'pass'
          : 'fail',
      detail:
        'Value-safe helper is available for required externally issued GitHub production credentials.',
    },
    {
      id: 'github-generated-secret-helper',
      status:
        Boolean(packageJson.scripts?.['set:github-generated-secrets']) &&
        Boolean(packageJson.scripts?.['verify:github-generated-secrets']) &&
        exists('scripts/set-github-generated-secrets.mjs')
          ? 'pass'
          : 'fail',
      detail: 'Value-free helper is available for generated Herbalisti-owned GitHub admin tokens.',
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
      herbalistiOwnedSecretsCanBeGeneratedWithoutDisplayingValues: true,
      paidMediaCredentialsAreOptionalForLaunch: true,
    },
    githubProductionEnvironment: {
      repository: preferredGithubScope.repository,
      environment: preferredGithubScope.environment,
      readinessCommand: 'npm run verify:github-production-readiness',
      strictReadinessCommand: 'npm run verify:github-production-readiness -- --strict',
      externalCredentialHelper: {
        verificationCommand: externalCredentialHelperVerifyCommand,
        setCommand: externalCredentialHelperSetCommand,
        requiredEnvironmentVariables: requiredWorkflowCredentialNames,
        confirmation: 'set-herbalisti-production-credentials',
        notes:
          'Optional value-safe CLI path. It reads CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID from the local environment and sends them to GitHub through stdin without printing values.',
      },
      generatedSecretHelper: {
        verificationCommand: generatedGithubSecretVerifyCommand,
        setCommand: generatedGithubSecretCommand,
        generatedSecretNames: generatedGithubSecretNames,
        confirmation: 'set-herbalisti-generated-secrets',
        notes:
          'Optional manual path. The guarded deployment workflow can generate FEED_ADMIN_TOKEN and MEDIA_ADMIN_TOKEN as masked runtime values without stored GitHub secrets.',
      },
      secrets: githubEnvironmentSecrets,
      variables: githubEnvironmentVariables,
      requiredSecretNames: requiredWorkflowSecretNames,
      requiredVariableNames: requiredWorkflowVariableNames,
      requiredCredentialNames: requiredWorkflowCredentialNames,
      optionalSecretNames: optionalWorkflowSecretNames,
      generatedRuntimeSecretNames,
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
        id: 'generate-herbalisti-owned-github-secrets',
        sideEffect: 'writes-github-secrets',
        commands: [generatedGithubSecretVerifyCommand, generatedGithubSecretCommand],
        detail:
          'Optional manual helper for storing Herbalisti-owned admin tokens in GitHub. The guarded production workflow can generate these as masked runtime values instead.',
      },
      {
        id: 'set-github-production-environment-credentials',
        sideEffect: 'writes-github-secrets-and-variables',
        commands: [
          externalCredentialHelperVerifyCommand,
          externalCredentialHelperSetCommand,
          ...githubEnvironmentSecrets.filter((secret) => secret.requiredForGuardedWorkflow).map((secret) => secret.setCommand),
          ...githubEnvironmentVariables.map((variable) => variable.setCommand),
        ],
        detail:
          'Use the helper when values are already available as local environment variables; otherwise use the direct gh commands and enter values through stdin or the GitHub interface.',
      },
      {
        id: 'verify-credential-name-readiness',
        sideEffect: 'none',
        commands: ['npm run verify:github-production-readiness', 'npm run verify:github-production-readiness -- --strict'],
      },
      {
        id: 'manual-cloudflare-runtime-secret-fallback',
        sideEffect: 'writes-cloudflare-secrets',
        commands: cloudflareRuntimeSecrets.flatMap((secret) => secret.setCommands),
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
    '- Prefer GitHub `production` environment secrets for externally issued deployment credentials.',
    '- Enter externally issued values directly in GitHub or Cloudflare interfaces, or pipe from a local secret manager.',
    '- The guarded production workflow generates FEED_ADMIN_TOKEN and MEDIA_ADMIN_TOKEN as masked runtime values.',
    '- KIE_API_KEY is optional for launch; setting it does not approve paid generation, and generated video remains separately approval-gated.',
    '',
    '## GitHub Production Environment Credentials',
    '',
    `Repository: \`${packet.githubProductionEnvironment.repository}\``,
    '',
    `Environment: \`${packet.githubProductionEnvironment.environment}\``,
    '',
    'Required secret value:',
    '',
    '```bash',
  ]

  for (const secret of packet.githubProductionEnvironment.secrets.filter((item) => item.requiredForGuardedWorkflow)) {
    lines.push(secret.setCommand)
  }

  lines.push('```', '', 'Required account identifier variable:', '', '```bash')
  for (const variable of packet.githubProductionEnvironment.variables) {
    lines.push(variable.setCommand)
  }
  lines.push('```', '')
  for (const variable of packet.githubProductionEnvironment.variables) {
    lines.push(`- ${variable.name}: ${variable.notes}`)
    lines.push(`- Secret fallback: \`${variable.secretFallbackCommand}\``)
  }

  lines.push(
    '',
    'Value-safe helper for required GitHub production credentials:',
    '',
    packet.githubProductionEnvironment.externalCredentialHelper.notes,
    '',
    '```bash',
    packet.githubProductionEnvironment.externalCredentialHelper.verificationCommand,
    packet.githubProductionEnvironment.externalCredentialHelper.setCommand,
    '```',
  )

  lines.push('', 'Optional paid-media secret value:', '', '```bash')
  for (const secret of packet.githubProductionEnvironment.secrets.filter((item) => !item.requiredForGuardedWorkflow)) {
    lines.push(secret.setCommand)
  }
  lines.push(
    '```',
    '',
    'Generated runtime admin tokens:',
    '',
    `- ${packet.githubProductionEnvironment.generatedRuntimeSecretNames.join(', ')}`,
    '',
    packet.githubProductionEnvironment.generatedSecretHelper.notes,
    '',
    'Optional manual GitHub helper for generated admin tokens:',
    '',
    '```bash',
    packet.githubProductionEnvironment.generatedSecretHelper.verificationCommand,
    packet.githubProductionEnvironment.generatedSecretHelper.setCommand,
    '```',
    '',
    '## Workflow-Derived Values',
    '',
  )
  for (const value of packet.githubProductionEnvironment.workflowDerivedValues) {
    lines.push(`- \`${value.name}\`: ${value.notes}`)
    lines.push('')
    lines.push('```bash')
    lines.push(value.command)
    lines.push('```')
    lines.push('')
  }

  lines.push('Verify credential-name readiness:', '', '```bash')
  lines.push(packet.githubProductionEnvironment.readinessCommand)
  lines.push(packet.githubProductionEnvironment.strictReadinessCommand)
  lines.push('```', '', '## Cloudflare Runtime Secret Fallback', '')
  lines.push(packet.cloudflareRuntime.note)
  lines.push('', '```bash')
  for (const secret of packet.cloudflareRuntime.secrets) {
    for (const command of secret.setCommands) {
      lines.push(command)
    }
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
