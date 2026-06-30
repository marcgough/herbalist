import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const readJson = (path) => JSON.parse(read(path))
const exists = (path) => existsSync(resolve(root, path))
const secretValuePattern =
  /(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]+|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i

const packageJson = readJson('package.json')
const contract = readJson('docs/production-environment-contract.json')
const externalActions = readJson('docs/external-launch-actions.json')
const workflow = read('.github/workflows/production-deploy.yml')
const scriptSource = read('scripts/seed-production-feed.mjs')

assert(exists('scripts/seed-production-feed.mjs'), 'Production feed seed command should exist')
assert(packageJson.scripts?.['seed:production-feed'], 'package.json should expose seed:production-feed')
assert(packageJson.scripts?.['verify:production-feed-seed'], 'package.json should expose verify:production-feed-seed')
assert(
  contract.commands.safePreflight.includes('npm run verify:production-feed-seed'),
  'Safe preflight should include production feed seed verification',
)
assert(
  contract.commands.seedProductionFeed?.includes(
    'npm run seed:production-feed -- --base-url https://herbalisti.com --confirm seed-herbalisti-feed',
  ),
  'Production contract should expose the canonical feed seed command',
)
assert(
  externalActions.localAllowedActions?.some((action) => action.id === 'verify-production-feed-seed'),
  'External action checklist should include the local feed seed verifier',
)
const seedAction = externalActions.approvalRequiredActions?.find((action) => action.id === 'seed-production-feed')
assert(seedAction?.approvalRequired === true, 'Production feed seed action should require approval')
assert(seedAction?.requiredForLaunch === true, 'Production feed seed action should be launch-required for manual launch freshness proof')
assert(seedAction?.secretNames?.includes('FEED_ADMIN_TOKEN'), 'Production feed seed action should name FEED_ADMIN_TOKEN')
assert(
  seedAction?.command === contract.commands.seedProductionFeed[0],
  'Production feed seed action should use the contract command',
)
assert(
  workflow.includes('npm run seed:production-feed -- --base-url https://herbalisti.com --confirm seed-herbalisti-feed'),
  'Production deploy workflow should use the shared feed seed command',
)
assert(scriptSource.includes('seed-herbalisti-feed'), 'Feed seed command should require an exact confirmation phrase')
assert(scriptSource.includes('--dry-run'), 'Feed seed command should provide a dry-run mode')
assert(scriptSource.includes('authorization'), 'Feed seed command should send authorization only at request time')
assert(!secretValuePattern.test(scriptSource), 'Feed seed command must not contain literal secret values')

const missingConfirm = spawnSync(process.execPath, ['scripts/seed-production-feed.mjs', '--dry-run'], {
  cwd: root,
  encoding: 'utf8',
})
assert.notEqual(missingConfirm.status, 0, 'Feed seed dry-run should fail without exact confirmation')
assert(missingConfirm.stderr.includes('Confirmation required'), 'Missing confirmation error should be explicit')

const dryRun = spawnSync(
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
assert.equal(dryRun.status, 0, `Feed seed dry-run should pass\n${dryRun.stderr}`)
const dryRunPayload = JSON.parse(dryRun.stdout)
assert.equal(dryRunPayload.status, 'dry-run', 'Feed seed dry-run should report dry-run status')
assert.equal(dryRunPayload.endpoint, 'https://herbalisti.com/api/feed-refresh', 'Feed seed dry-run should target the protected feed-refresh endpoint')
assert.equal(dryRunPayload.wouldSendAuthorizationHeader, true, 'Feed seed dry-run should document authorization behavior')
assert(!secretValuePattern.test(dryRun.stdout), 'Feed seed dry-run output must not contain secret-looking values')

console.log(
  JSON.stringify(
    {
      status: 'pass',
      command: packageJson.scripts['seed:production-feed'],
      dryRunEndpoint: dryRunPayload.endpoint,
      approvalAction: seedAction.id,
      safeToRun:
        'This verifier reads local files and runs the feed seed command in dry-run mode only. It does not call the network, deploy, mutate DNS, create resources, set secrets, call paid APIs, or print secret values.',
    },
    null,
    2,
  ),
)
