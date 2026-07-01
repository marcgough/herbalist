import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { chmodSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildConfiguredWranglerFiles } from './configure-cloudflare-bindings.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const workflowPath = '.github/workflows/production-deploy.yml'
const simulatedD1DatabaseId = '44444444-4444-4444-8444-444444444444'
const fakeSecretValue = 'local-dry-run-value'
const secretValuePattern =
  /(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]+|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const readJson = (path) => JSON.parse(read(path))
const quoteCmdArg = (value) =>
  /^[A-Za-z0-9_@%+=:,./\\-]+$/.test(value) ? String(value) : `"${String(value).replace(/"/g, '""')}"`

const fakeNpxSource = `
import { readFileSync, writeFileSync } from 'node:fs'

const statePath = process.env.HERBALISTI_FAKE_NPX_STATE
if (!statePath) {
  console.error('HERBALISTI_FAKE_NPX_STATE is required')
  process.exit(1)
}

const readState = () => JSON.parse(readFileSync(statePath, 'utf8'))
const writeState = (state) => writeFileSync(statePath, JSON.stringify(state, null, 2))
const args = process.argv.slice(2)
const state = readState()
state.calls = state.calls ?? []
state.calls.push(args)

const fail = (message) => {
  state.failures = [...(state.failures ?? []), message]
  writeState(state)
  console.error(message)
  process.exit(1)
}

if (args[0] !== 'wrangler') {
  fail('Expected npx wrangler invocation')
}

const wranglerArgs = args.slice(1)
const command = wranglerArgs.join(' ')

if (command === 'pages project list --json') {
  writeState(state)
  console.log(JSON.stringify({ result: (state.pagesProjects ?? []).map((name) => ({ name })) }))
  process.exit(0)
}

if (wranglerArgs[0] === 'pages' && wranglerArgs[1] === 'project' && wranglerArgs[2] === 'create') {
  state.pagesProjects = Array.from(new Set([...(state.pagesProjects ?? []), wranglerArgs[3] ?? '']))
  state.createdPagesProjects = [...(state.createdPagesProjects ?? []), wranglerArgs[3] ?? '']
  writeState(state)
  console.log(JSON.stringify({ name: wranglerArgs[3] ?? '' }))
  process.exit(0)
}

if (command === 'd1 list --json') {
  const index = state.listCallCount ?? 0
  const responses = state.listResponses ?? []
  const response = responses[Math.min(index, Math.max(responses.length - 1, 0))] ?? []
  state.listCallCount = index + 1
  writeState(state)
  console.log(JSON.stringify(response))
  process.exit(0)
}

if (wranglerArgs[0] === 'd1' && wranglerArgs[1] === 'create') {
  state.createdD1Databases = [...(state.createdD1Databases ?? []), wranglerArgs[2] ?? '']
  writeState(state)
  console.log(state.createOutput ?? '')
  process.exit(0)
}

if (command === 'd1 migrations apply herbalisti --remote') {
  state.remoteMigrationsApplied = true
  writeState(state)
  console.log('remote migrations applied')
  process.exit(0)
}

if (wranglerArgs[0] === 'secret' && wranglerArgs[1] === 'put') {
  const value = readFileSync(0, 'utf8')
  state.workerSecrets = [...(state.workerSecrets ?? []), { name: wranglerArgs[2] ?? '', stdinBytes: value.length }]
  writeState(state)
  console.log('worker secret accepted')
  process.exit(0)
}

if (wranglerArgs[0] === 'pages' && wranglerArgs[1] === 'secret' && wranglerArgs[2] === 'put') {
  const value = readFileSync(0, 'utf8')
  state.pagesSecrets = [...(state.pagesSecrets ?? []), { name: wranglerArgs[3] ?? '', stdinBytes: value.length }]
  writeState(state)
  console.log('pages secret accepted')
  process.exit(0)
}

if (command === 'pages deploy dist --project-name herbalisti') {
  state.pagesDeployed = true
  writeState(state)
  console.log('pages deployed')
  process.exit(0)
}

if (command === 'deploy --config wrangler.news.toml') {
  state.workerDeployed = true
  writeState(state)
  console.log('worker deployed')
  process.exit(0)
}

fail(\`Unexpected wrangler command: \${command}\`)
`

const makeFakeNpx = (tempDir) => {
  const binDir = join(tempDir, 'bin')
  mkdirSync(binDir, { recursive: true })
  const fakeNpxPath = join(tempDir, 'fake-npx.mjs')
  writeFileSync(fakeNpxPath, fakeNpxSource, 'utf8')

  if (process.platform === 'win32') {
    writeFileSync(join(binDir, 'npx.cmd'), `@echo off\r\n"${process.execPath}" "${fakeNpxPath}" %*\r\nexit /b %ERRORLEVEL%\r\n`, 'utf8')
  } else {
    const shellPath = join(binDir, 'npx')
    writeFileSync(shellPath, `#!/bin/sh\nexec "${process.execPath}" "${fakeNpxPath}" "$@"\n`, 'utf8')
    chmodSync(shellPath, 0o755)
  }

  return binDir
}

const pathKey = Object.keys(process.env).find((key) => key.toLowerCase() === 'path') ?? 'PATH'

const runNpxWrangler = ({ binDir, statePath, args, input = '' }) => {
  const env = {
    ...process.env,
    HERBALISTI_FAKE_NPX_STATE: statePath,
    [pathKey]: `${binDir}${delimiter}${process.env[pathKey] ?? ''}`,
  }
  const command =
    process.platform === 'win32'
      ? [process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', ['call', 'npx.cmd', 'wrangler', ...args].map(quoteCmdArg).join(' ')]]
      : ['npx', ['wrangler', ...args]]
  const result = spawnSync(command[0], command[1], {
    cwd: root,
    env,
    input,
    encoding: 'utf8',
  })

  assert.equal(result.status, 0, `Fake Wrangler command failed: wrangler ${args.join(' ')}\n${result.stderr}`)
  return result.stdout
}

const runResolver = ({ binDir, statePath, githubEnvPath }) => {
  const env = {
    ...process.env,
    HERBALISTI_FAKE_NPX_STATE: statePath,
    [pathKey]: `${binDir}${delimiter}${process.env[pathKey] ?? ''}`,
  }
  const result = spawnSync(process.execPath, ['scripts/resolve-production-d1-database.mjs', '--create-if-missing', '--github-env', githubEnvPath], {
    cwd: root,
    env,
    encoding: 'utf8',
  })

  assert.equal(result.status, 0, `Production D1 resolver dry run should pass\n${result.stderr}`)
  return JSON.parse(result.stdout)
}

const parseEnvFile = (contents) =>
  Object.fromEntries(
    contents
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        const index = line.indexOf('=')
        return [line.slice(0, index), line.slice(index + 1)]
      }),
  )

const hasActiveD1Binding = (toml, id) =>
  /^\s*\[\[d1_databases\]\]/m.test(toml) &&
  /^\s*binding\s*=\s*"HERBALISTI_DB"\s*$/m.test(toml) &&
  /^\s*database_name\s*=\s*"herbalisti"\s*$/m.test(toml) &&
  new RegExp(`^\\s*database_id\\s*=\\s*"${id}"\\s*$`, 'm').test(toml)

const seedFakeWranglerState = (statePath) =>
  writeFileSync(
    statePath,
    JSON.stringify(
      {
        pagesProjects: [],
        listResponses: [[], []],
        createOutput: `Successfully created D1 database herbalisti with id ${simulatedD1DatabaseId}`,
      },
      null,
      2,
    ),
    'utf8',
  )

const runProductionCommandPath = ({ binDir, statePath, githubEnvPath, includeOptionalMediaSecrets }) => {
  const projectsOutput = runNpxWrangler({ binDir, statePath, args: ['pages', 'project', 'list', '--json'] })
  const projects = JSON.parse(projectsOutput).result ?? []
  if (!projects.some((project) => project.name === 'herbalisti')) {
    runNpxWrangler({ binDir, statePath, args: ['pages', 'project', 'create', 'herbalisti', '--production-branch', 'main'] })
  }

  const resolverOutput = runResolver({ binDir, statePath, githubEnvPath })
  const envValues = parseEnvFile(readFileSync(githubEnvPath, 'utf8'))
  assert.equal(envValues.CLOUDFLARE_D1_DATABASE_ID, simulatedD1DatabaseId, 'Resolver should write the Cloudflare D1 ID to the runner env file')
  assert.equal(envValues.HERBALISTI_D1_DATABASE_ID, simulatedD1DatabaseId, 'Resolver should write the Herbalisti D1 ID alias to the runner env file')

  const configured = buildConfiguredWranglerFiles({
    pagesToml: read('wrangler.toml'),
    newsToml: read('wrangler.news.toml'),
    d1DatabaseId: envValues.CLOUDFLARE_D1_DATABASE_ID,
  })
  assert(hasActiveD1Binding(configured['wrangler.toml'], simulatedD1DatabaseId), 'Simulated Pages config should receive the resolved D1 ID')
  assert(hasActiveD1Binding(configured['wrangler.news.toml'], simulatedD1DatabaseId), 'Simulated Worker config should receive the resolved D1 ID')

  runNpxWrangler({ binDir, statePath, args: ['d1', 'migrations', 'apply', 'herbalisti', '--remote'] })
  runNpxWrangler({ binDir, statePath, args: ['secret', 'put', 'FEED_ADMIN_TOKEN', '--config', 'wrangler.news.toml'], input: fakeSecretValue })
  runNpxWrangler({ binDir, statePath, args: ['pages', 'secret', 'put', 'FEED_ADMIN_TOKEN', '--project-name', 'herbalisti'], input: fakeSecretValue })
  if (includeOptionalMediaSecrets) {
    runNpxWrangler({ binDir, statePath, args: ['pages', 'secret', 'put', 'KIE_API_KEY', '--project-name', 'herbalisti'], input: fakeSecretValue })
    runNpxWrangler({ binDir, statePath, args: ['pages', 'secret', 'put', 'MEDIA_ADMIN_TOKEN', '--project-name', 'herbalisti'], input: fakeSecretValue })
  }
  runNpxWrangler({ binDir, statePath, args: ['pages', 'deploy', 'dist', '--project-name', 'herbalisti'] })
  runNpxWrangler({ binDir, statePath, args: ['deploy', '--config', 'wrangler.news.toml'] })
  const feedSeedDryRun = spawnSync(
    process.execPath,
    [
      'scripts/seed-production-feed.mjs',
      '--dry-run',
      '--base-url',
      'https://herbalisti.com',
      '--confirm',
      'seed-herbalisti-feed',
    ],
    {
      cwd: root,
      encoding: 'utf8',
    },
  )
  assert.equal(feedSeedDryRun.status, 0, `Production feed seed dry run should pass\n${feedSeedDryRun.stderr}`)

  return {
    resolverOutput,
    feedSeedDryRunPayload: JSON.parse(feedSeedDryRun.stdout),
    state: JSON.parse(readFileSync(statePath, 'utf8')),
  }
}

const workflow = read(workflowPath)
const packageJson = readJson('package.json')
const contract = readJson('docs/production-environment-contract.json')

assert(packageJson.scripts?.['verify:production-deploy-dry-run'], 'package.json should expose verify:production-deploy-dry-run')
assert(workflow.includes('npm run verify:production-deploy-dry-run'), 'Production deploy workflow should include its local dry-run gate')
assert(contract.commands.safePreflight.includes('npm run verify:production-deploy-dry-run'), 'Safe preflight should include production deploy dry-run verification')

const tempDir = mkdtempSync(join(tmpdir(), 'herbalisti-production-deploy-dry-run-'))
try {
  const binDir = makeFakeNpx(tempDir)
  const mediaEnabledStatePath = join(tempDir, 'state-media-enabled.json')
  const mediaEnabledGithubEnvPath = join(tempDir, 'github-media-enabled.env')
  seedFakeWranglerState(mediaEnabledStatePath)
  const mediaEnabled = runProductionCommandPath({
    binDir,
    statePath: mediaEnabledStatePath,
    githubEnvPath: mediaEnabledGithubEnvPath,
    includeOptionalMediaSecrets: true,
  })
  const { state, resolverOutput, feedSeedDryRunPayload } = mediaEnabled
  const callStrings = state.calls.map((call) => call.join(' '))

  const mediaDisabledStatePath = join(tempDir, 'state-media-disabled.json')
  const mediaDisabledGithubEnvPath = join(tempDir, 'github-media-disabled.env')
  seedFakeWranglerState(mediaDisabledStatePath)
  const mediaDisabled = runProductionCommandPath({
    binDir,
    statePath: mediaDisabledStatePath,
    githubEnvPath: mediaDisabledGithubEnvPath,
    includeOptionalMediaSecrets: false,
  })
  const mediaDisabledCallStrings = mediaDisabled.state.calls.map((call) => call.join(' '))
  const checks = [
    ['pages project list', callStrings.includes('wrangler pages project list --json')],
    ['pages project create', state.createdPagesProjects?.includes('herbalisti')],
    ['d1 resolver create path', resolverOutput.status === 'created' && state.createdD1Databases?.includes('herbalisti')],
    ['remote migrations', state.remoteMigrationsApplied === true],
    ['worker secret', state.workerSecrets?.some((secret) => secret.name === 'FEED_ADMIN_TOKEN' && secret.stdinBytes > 0)],
    ['pages feed secret', state.pagesSecrets?.some((secret) => secret.name === 'FEED_ADMIN_TOKEN' && secret.stdinBytes > 0)],
    ['kie secret', state.pagesSecrets?.some((secret) => secret.name === 'KIE_API_KEY' && secret.stdinBytes > 0)],
    ['media secret', state.pagesSecrets?.some((secret) => secret.name === 'MEDIA_ADMIN_TOKEN' && secret.stdinBytes > 0)],
    ['pages deploy', state.pagesDeployed === true],
    ['worker deploy', state.workerDeployed === true],
    ['feed seed dry run', feedSeedDryRunPayload.endpoint === 'https://herbalisti.com/api/feed-refresh'],
    [
      'optional media disabled path',
      mediaDisabled.state.workerSecrets?.some((secret) => secret.name === 'FEED_ADMIN_TOKEN' && secret.stdinBytes > 0) &&
        mediaDisabled.state.pagesSecrets?.some((secret) => secret.name === 'FEED_ADMIN_TOKEN' && secret.stdinBytes > 0) &&
        !mediaDisabled.state.pagesSecrets?.some((secret) => ['KIE_API_KEY', 'MEDIA_ADMIN_TOKEN'].includes(secret.name)) &&
        mediaDisabled.state.pagesDeployed === true &&
        mediaDisabled.state.workerDeployed === true &&
        mediaDisabled.feedSeedDryRunPayload.endpoint === 'https://herbalisti.com/api/feed-refresh',
    ],
    [
      'no secret-looking values',
      !secretValuePattern.test(
        JSON.stringify({ state, resolverOutput, feedSeedDryRunPayload, mediaDisabledState: mediaDisabled.state }),
      ),
    ],
  ].map(([id, ok]) => ({ id, status: ok ? 'pass' : 'fail' }))

  assert(checks.every((check) => check.status === 'pass'), `Production deploy dry-run checks failed: ${JSON.stringify(checks)}`)

  console.log(
    JSON.stringify(
      {
        status: 'pass',
        resolvedD1Status: resolverOutput.status,
        commandsRehearsed: callStrings.length + mediaDisabledCallStrings.length,
        scenarios: [
          {
            id: 'optional-media-enabled',
            commandsRehearsed: callStrings.length,
          },
          {
            id: 'optional-media-disabled',
            commandsRehearsed: mediaDisabledCallStrings.length,
          },
        ],
        checks,
        safeToRun:
          'Runs the production Cloudflare-facing command path against a temporary fake npx/wrangler command and in-memory Wrangler config output, including launch paths with and without optional Seedance media secrets. It does not call Cloudflare, deploy, mutate DNS, create real resources, set real secrets, call paid APIs, write Wrangler config files, or print secret values.',
      },
      null,
      2,
    ),
  )
} finally {
  rmSync(tempDir, { recursive: true, force: true })
}
