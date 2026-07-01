import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const tempDir = mkdtempSync(join(tmpdir(), 'herbalisti-gh-credential-helper-'))
const statePath = join(tempDir, 'gh-calls.jsonl')
const fakeGhPath = join(tempDir, 'fake-gh.mjs')
const helperPath = resolve(root, 'scripts/set-github-production-credentials.mjs')
const secretValuePattern =
  /(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]+|-----BEGIN [A-Z ]+PRIVATE KEY-----|herbalisti_[A-Za-z0-9_-]{20,})/i

const fakeCloudflareToken = 'ghp_fakeCloudflareApiTokenForHerbalistiWritePath1234567890'
const fakeAccountId = 'fake-cloudflare-account-id-for-herbalisti-write-path'

const hashText = (value) => createHash('sha256').update(String(value)).digest('hex')

const fakeGhSource = `
import { appendFileSync } from 'node:fs'

const args = process.argv.slice(2)
const statePath = process.env.HERBALISTI_FAKE_GH_STATE

if (args.includes('--version')) {
  console.log('gh version 0.0.0-herbalisti-fake')
  process.exit(0)
}

const chunks = []
for await (const chunk of process.stdin) {
  chunks.push(chunk)
}
const stdin = Buffer.concat(chunks).toString('utf8')

appendFileSync(
  statePath,
  JSON.stringify({
    args,
    stdin,
    stdinBytes: Buffer.byteLength(stdin),
  }) + '\\n',
)
`

try {
  writeFileSync(fakeGhPath, fakeGhSource)

  const env = {
    ...process.env,
    HERBALISTI_FAKE_GH_STATE: statePath,
    HERBALISTI_GITHUB_CREDENTIAL_HELPER_TEST: '1',
    HERBALISTI_GH_EXECUTABLE: process.execPath,
    HERBALISTI_GH_ARGS_PREFIX: JSON.stringify([fakeGhPath]),
    CLOUDFLARE_API_TOKEN: fakeCloudflareToken,
    CLOUDFLARE_ACCOUNT_ID: fakeAccountId,
  }

  const missingConfirmation = spawnSync(
    process.execPath,
    [helperPath],
    {
      cwd: root,
      env,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )
  assert.notEqual(missingConfirmation.status, 0, 'Write mode should fail without the exact confirmation phrase.')
  assert(!readFileSync(statePath, { encoding: 'utf8', flag: 'a+' }).trim(), 'No GitHub writes should occur before confirmation.')

  const result = spawnSync(
    process.execPath,
    [helperPath, '--confirm', 'set-herbalisti-production-credentials'],
    {
      cwd: root,
      env,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )

  assert.equal(result.status, 0, result.stderr || result.stdout)
  assert.equal(result.stderr.trim(), '', 'Credential helper write path should not write stderr on success.')
  assert(!result.stdout.includes(fakeCloudflareToken), 'Credential helper stdout must not contain the fake token value.')
  assert(!result.stdout.includes(fakeAccountId), 'Credential helper stdout must not contain the fake account id value.')
  assert(!secretValuePattern.test(result.stdout), 'Credential helper stdout must not contain secret-shaped values.')

  const calls = readFileSync(statePath, 'utf8')
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line))

  assert.equal(calls.length, 2, 'Write path should call gh exactly twice.')

  const [secretCall, variableCall] = calls
  assert.deepEqual(
    secretCall.args,
    ['secret', 'set', 'CLOUDFLARE_API_TOKEN', '--env', 'production', '--repo', 'marcgough/herbalist'],
    'First gh call should set the Cloudflare API token as a GitHub production secret.',
  )
  assert.deepEqual(
    variableCall.args,
    ['variable', 'set', 'CLOUDFLARE_ACCOUNT_ID', '--env', 'production', '--repo', 'marcgough/herbalist'],
    'Second gh call should set the Cloudflare account id as a GitHub production variable.',
  )
  assert.equal(secretCall.stdin, fakeCloudflareToken, 'Cloudflare token should be provided through stdin.')
  assert.equal(variableCall.stdin, fakeAccountId, 'Cloudflare account id should be provided through stdin.')
  assert(
    calls.every((call) => !call.args.join(' ').includes(fakeCloudflareToken) && !call.args.join(' ').includes(fakeAccountId)),
    'Credential values must not appear in gh command arguments.',
  )

  const output = {
    status: 'pass',
    calls: calls.map((call) => ({
      command: `gh ${call.args.join(' ')}`,
      stdinBytes: call.stdinBytes,
      stdinSha256: hashText(call.stdin),
    })),
    checkedFailureModes: ['missing-confirmation-no-write'],
    safeToRun:
      'Runs the GitHub production credential helper against a temporary fake GitHub CLI target with fake local values. It does not call GitHub, set secrets or variables, deploy, mutate DNS, create Cloudflare resources, call paid APIs, or print credential values.',
  }

  const serialized = JSON.stringify(output, null, 2)
  assert(!serialized.includes(fakeCloudflareToken), 'Verifier output must not contain the fake token value.')
  assert(!serialized.includes(fakeAccountId), 'Verifier output must not contain the fake account id value.')
  assert(!secretValuePattern.test(serialized), 'Verifier output must not contain secret-shaped values.')
  console.log(serialized)
} finally {
  rmSync(tempDir, { recursive: true, force: true })
}
