import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { chmodSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const resolverPath = resolve(root, 'scripts/resolve-production-d1-database.mjs')

const uuidA = '11111111-1111-4111-8111-111111111111'
const uuidB = '22222222-2222-4222-8222-222222222222'
const uuidC = '33333333-3333-4333-8333-333333333333'
const secretValuePattern =
  /(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]+|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i

assert(existsSync(resolverPath), 'Production D1 resolver script should exist')

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
  state.createCallCount = (state.createCallCount ?? 0) + 1
  state.createdNames = [...(state.createdNames ?? []), wranglerArgs[2] ?? '']
  writeState(state)
  if (state.createFails) {
    console.error(state.createFailureMessage ?? 'Create failed')
    process.exit(1)
  }
  console.log(state.createOutput ?? '')
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
    const cmdPath = join(binDir, 'npx.cmd')
    writeFileSync(cmdPath, `@echo off\r\n"${process.execPath}" "${fakeNpxPath}" %*\r\nexit /b %ERRORLEVEL%\r\n`, 'utf8')
  } else {
    const shPath = join(binDir, 'npx')
    writeFileSync(shPath, `#!/bin/sh\nexec "${process.execPath}" "${fakeNpxPath}" "$@"\n`, 'utf8')
    chmodSync(shPath, 0o755)
  }

  return binDir
}

const pathKey = Object.keys(process.env).find((key) => key.toLowerCase() === 'path') ?? 'PATH'

const parseOutputJson = (label, output) => {
  try {
    return JSON.parse(output)
  } catch (error) {
    throw new Error(`${label} returned non-JSON output: ${error.message}\n${output}`)
  }
}

const readIfExists = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : '')

const runScenario = (scenario) => {
  const tempDir = mkdtempSync(join(tmpdir(), 'herbalisti-d1-resolver-'))
  try {
    const binDir = makeFakeNpx(tempDir)
    const statePath = join(tempDir, 'state.json')
    const githubEnvPath = join(tempDir, 'github.env')
    writeFileSync(statePath, JSON.stringify(scenario.state, null, 2), 'utf8')

    const env = {
      ...process.env,
      HERBALISTI_FAKE_NPX_STATE: statePath,
      [pathKey]: `${binDir}${delimiter}${process.env[pathKey] ?? ''}`,
    }
    const args = ['scripts/resolve-production-d1-database.mjs', '--github-env', githubEnvPath, ...(scenario.args ?? [])]
    const result = spawnSync(process.execPath, args, {
      cwd: root,
      env,
      encoding: 'utf8',
    })
    const state = JSON.parse(readFileSync(statePath, 'utf8'))
    const envContents = readIfExists(githubEnvPath)

    if (scenario.expectFailure) {
      assert.notEqual(result.status, 0, `${scenario.id} should fail`)
      assert.equal(state.createCallCount ?? 0, scenario.expectedCreateCalls ?? 0, `${scenario.id} create call count should match`)
      assert.equal(envContents, '', `${scenario.id} should not write GitHub env output`)
      assert.match(`${result.stdout}\n${result.stderr}`, /was not found|AssertionError/i, `${scenario.id} should fail with a missing database assertion`)
      return {
        id: scenario.id,
        status: 'pass',
        expectedFailure: true,
        listCalls: state.listCallCount ?? 0,
        createCalls: state.createCallCount ?? 0,
      }
    }

    assert.equal(result.status, 0, `${scenario.id} should pass\n${result.stderr}`)
    const output = parseOutputJson(scenario.id, result.stdout)
    assert.equal(output.databaseName, 'herbalisti', `${scenario.id} should target the Herbalisti D1 database`)
    assert.equal(output.databaseId, scenario.expectedId, `${scenario.id} should resolve the expected D1 database ID`)
    assert.equal(output.status, scenario.expectedResolverStatus, `${scenario.id} should report the expected resolver status`)
    assert.equal(output.wroteGithubEnv, true, `${scenario.id} should write to the GitHub environment file`)
    assert.equal(state.createCallCount ?? 0, scenario.expectedCreateCalls ?? 0, `${scenario.id} create call count should match`)
    assert.equal(
      envContents,
      `CLOUDFLARE_D1_DATABASE_ID=${scenario.expectedId}\nHERBALISTI_D1_DATABASE_ID=${scenario.expectedId}\n`,
      `${scenario.id} should write both D1 environment aliases`,
    )
    assert.equal(secretValuePattern.test(`${result.stdout}\n${result.stderr}\n${JSON.stringify(state)}`), false, `${scenario.id} should not print secret-looking values`)

    return {
      id: scenario.id,
      status: 'pass',
      expectedFailure: false,
      resolvedStatus: output.status,
      listCalls: state.listCallCount ?? 0,
      createCalls: state.createCallCount ?? 0,
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
}

const scenarios = [
  {
    id: 'array-list-existing-database',
    state: {
      listResponses: [[{ name: 'herbalisti', uuid: uuidA }]],
    },
    expectedId: uuidA,
    expectedResolverStatus: 'found',
    expectedCreateCalls: 0,
  },
  {
    id: 'result-list-existing-database',
    state: {
      listResponses: [{ result: [{ database_name: 'herbalisti', database_id: uuidB }] }],
    },
    expectedId: uuidB,
    expectedResolverStatus: 'found',
    expectedCreateCalls: 0,
  },
  {
    id: 'missing-database-created-from-output',
    args: ['--create-if-missing'],
    state: {
      listResponses: [[], []],
      createOutput: `Successfully created D1 database herbalisti with id ${uuidC}`,
    },
    expectedId: uuidC,
    expectedResolverStatus: 'created',
    expectedCreateCalls: 1,
  },
  {
    id: 'missing-database-without-create-permission',
    state: {
      listResponses: [[]],
    },
    expectFailure: true,
    expectedCreateCalls: 0,
  },
]

const results = scenarios.map(runScenario)

console.log(
  JSON.stringify(
    {
      status: 'pass',
      scenarios: results,
      safeToRun:
        'Runs the real production D1 resolver against a temporary fake npx/wrangler command. It does not call Cloudflare, create resources, mutate DNS, deploy, set secrets, call paid APIs, or print secret values.',
    },
    null,
    2,
  ),
)
