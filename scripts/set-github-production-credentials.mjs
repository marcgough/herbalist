import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const args = process.argv.slice(2)
const argSet = new Set(args)

const expectedConfirmation = 'set-herbalisti-production-credentials'
const secretValuePattern =
  /(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]+|-----BEGIN [A-Z ]+PRIVATE KEY-----|herbalisti_[A-Za-z0-9_-]{20,})/i

const valueAfter = (name, fallback = '') => {
  const index = args.indexOf(name)
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback
}

const repository = valueAfter('--repo', 'marcgough/herbalist')
const environment = valueAfter('--environment', 'production')
const confirm = valueAfter('--confirm')
const dryRun = argSet.has('--dry-run') || argSet.has('--check')
const requireValues = argSet.has('--require-values')

const credentials = [
  {
    name: 'CLOUDFLARE_API_TOKEN',
    kind: 'secret',
    sourceEnv: 'CLOUDFLARE_API_TOKEN',
    purpose: 'Allows the guarded GitHub production workflow to deploy Cloudflare Pages, D1, and the scheduled Worker.',
  },
  {
    name: 'CLOUDFLARE_ACCOUNT_ID',
    kind: 'variable',
    sourceEnv: 'CLOUDFLARE_ACCOUNT_ID',
    purpose: 'Identifies the Cloudflare account for non-interactive Wrangler commands.',
  },
]

const ghArgsFor = (credential) => [
  credential.kind === 'secret' ? 'secret' : 'variable',
  'set',
  credential.name,
  '--env',
  environment,
  '--repo',
  repository,
]
const commandFor = (credential) => `gh ${ghArgsFor(credential).join(' ')}`

const localValueState = Object.fromEntries(
  credentials.map((credential) => [
    credential.name,
    {
      sourceEnv: credential.sourceEnv,
      present: Boolean(process.env[credential.sourceEnv]?.trim()),
    },
  ]),
)

const ghAvailable = spawnSync('gh', ['--version'], {
  cwd: root,
  encoding: 'utf8',
  stdio: ['ignore', 'ignore', 'ignore'],
})

const checks = [
  {
    id: 'github-cli',
    status: ghAvailable.status === 0 ? 'pass' : 'fail',
    detail: 'GitHub CLI is available for credential entry.',
  },
  {
    id: 'production-environment-scope',
    status: environment === 'production' ? 'pass' : 'fail',
    detail: 'Required credentials are scoped to the GitHub production environment.',
  },
  {
    id: 'required-credential-names',
    status: credentials.map((credential) => credential.name).join(',') === 'CLOUDFLARE_API_TOKEN,CLOUDFLARE_ACCOUNT_ID' ? 'pass' : 'fail',
    detail: 'Only the required externally issued Cloudflare production credential names are handled.',
  },
  {
    id: 'no-generated-external-values',
    status: credentials.every((credential) => !['FEED_ADMIN_TOKEN', 'MEDIA_ADMIN_TOKEN', 'KIE_API_KEY'].includes(credential.name))
      ? 'pass'
      : 'fail',
    detail: 'The helper does not generate or handle Herbalisti-owned admin tokens or optional paid-media credentials.',
  },
  {
    id: 'stdin-value-entry',
    status: credentials.every((credential) => !commandFor(credential).includes('--body')) ? 'pass' : 'fail',
    detail: 'Credential values are passed to gh over stdin instead of command-line arguments.',
  },
  {
    id: 'local-values',
    status:
      !requireValues || credentials.every((credential) => localValueState[credential.name].present)
        ? 'pass'
        : 'fail',
    detail: requireValues
      ? 'Required local environment values are present.'
      : 'Local environment value presence is reported but not required in dry-run mode.',
  },
]

const fail = (message) => {
  const output = {
    status: 'fail',
    dryRun,
    repository,
    environment,
    message,
    requiredCredentialNames: credentials.map((credential) => credential.name),
    localValueState,
    checks,
    safeToRun:
      'Dry-run mode has no side effects. Write mode reads CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID from the local environment, sends them to GitHub through stdin, and does not print or store the values.',
  }
  console.error(JSON.stringify(output, null, 2))
  process.exit(1)
}

if (checks.some((check) => check.status !== 'pass')) {
  fail('GitHub production credential helper failed local checks.')
}

if (!dryRun && confirm !== expectedConfirmation) {
  fail(`Confirmation required. Re-run with --confirm ${expectedConfirmation}.`)
}

if (!dryRun) {
  const missingValues = credentials.filter((credential) => !localValueState[credential.name].present)
  if (missingValues.length) {
    fail(`Missing local environment values for: ${missingValues.map((credential) => credential.sourceEnv).join(', ')}.`)
  }
}

const result = {
  status: 'pass',
  dryRun,
  repository,
  environment,
  requiredCredentialNames: credentials.map((credential) => credential.name),
  localValueState,
  commands: credentials.map((credential) => commandFor(credential)),
  confirmationRequired: expectedConfirmation,
  checks,
  safeToRun: dryRun
    ? 'Dry-run mode validates command shape and local value presence only. It does not call GitHub, set secrets or variables, deploy, mutate DNS, create Cloudflare resources, call paid APIs, or print credential values.'
    : 'Write mode sends CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID to GitHub production environment storage through stdin. It does not print, store, or log the values.',
}

if (!dryRun) {
  result.setCredentialNames = []

  for (const credential of credentials) {
    const value = process.env[credential.sourceEnv]?.trim()
    const write = spawnSync('gh', ghArgsFor(credential), {
      cwd: root,
      input: value,
      encoding: 'utf8',
      stdio: ['pipe', 'ignore', 'pipe'],
    })

    if (write.error || write.status !== 0) {
      fail(`Could not set ${credential.name} in GitHub ${environment} environment.`)
    }

    result.setCredentialNames.push(credential.name)
  }
}

const output = JSON.stringify(result, null, 2)
assert.equal(secretValuePattern.test(output), false, 'GitHub production credential helper output must not contain secret values.')
console.log(output)
