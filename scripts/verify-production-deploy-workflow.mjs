import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const workflowPath = '.github/workflows/production-deploy.yml'

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const readJson = (path) => JSON.parse(read(path))
const exists = (path) => existsSync(resolve(root, path))

const workflow = read(workflowPath)
const packageJson = readJson('package.json')
const contract = readJson('docs/production-environment-contract.json')
const externalActions = readJson('docs/external-launch-actions.json')

const secretValuePattern =
  /(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]+|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i

assert(exists(workflowPath), 'Production deploy workflow should exist')
assert(packageJson.scripts?.['verify:production-deploy-workflow'], 'package.json should expose verify:production-deploy-workflow')
assert(workflow.includes('workflow_dispatch:'), 'Production deploy workflow must be manually dispatched')
assert(!workflow.includes('push:'), 'Production deploy workflow must not run on push')
assert(!workflow.includes('pull_request:'), 'Production deploy workflow must not run on pull requests')
assert(!workflow.includes('schedule:'), 'Production deploy workflow must not run on a schedule')
assert(workflow.includes('deploy-herbalisti-production'), 'Production deploy workflow must require an exact confirmation phrase')
assert(workflow.includes('DEPLOY_CONFIRMATION'), 'Production deploy workflow should pass confirmation input through an environment variable')
assert(workflow.includes('environment:'), 'Production deploy workflow should use a GitHub environment')
assert(workflow.includes('name: production'), 'Production deploy workflow should target the production environment')
assert(workflow.includes('url: https://herbalisti.com'), 'Production deploy workflow should publish the production URL')
assert(workflow.includes('permissions:'), 'Production deploy workflow should declare permissions')
assert(workflow.includes('contents: read'), 'Production deploy workflow should use read-only contents permission')
assert(workflow.includes('actions: read'), 'Production deploy workflow should use read-only Actions permission')
assert(workflow.includes('actions/checkout@v4'), 'Production deploy workflow should use checkout v4')
assert(workflow.includes('actions/setup-node@v4'), 'Production deploy workflow should use setup-node v4')
assert(workflow.includes('node-version: "24"'), 'Production deploy workflow should pin Node.js 24')
assert(workflow.includes('npm ci'), 'Production deploy workflow should install from the lockfile')

for (const name of [
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_D1_DATABASE_ID',
  'FEED_ADMIN_TOKEN',
  'KIE_API_KEY',
  'MEDIA_ADMIN_TOKEN',
]) {
  assert(workflow.includes(`secrets.${name}`), `Production deploy workflow should read ${name} from GitHub secrets`)
  assert(workflow.includes(name), `Production deploy workflow should validate ${name} presence by name only`)
}

for (const command of [
  'npm run verify:github-release-evidence -- --commit "$GITHUB_SHA"',
  'npm run verify:production-deploy-workflow',
  'npm run verify:launch -- --soft',
  'npm run verify:production-contract',
  'npm run verify:d1-manifest',
  'npm run verify:dns-cutover',
  'npm run verify:production-secrets',
  'npm run verify:production-provisioning',
  'npx wrangler pages project create herbalisti --production-branch main',
  'npm run configure:cloudflare -- --d1 "$CLOUDFLARE_D1_DATABASE_ID" --apply',
  'npx wrangler d1 migrations apply herbalisti --remote',
  'npx wrangler secret put FEED_ADMIN_TOKEN --config wrangler.news.toml',
  'npx wrangler pages secret put KIE_API_KEY --project-name herbalisti',
  'npx wrangler pages secret put MEDIA_ADMIN_TOKEN --project-name herbalisti',
  'npm run deploy:cloudflare',
  'npm run deploy:news-worker',
  'npm run verify:live-readiness -- --strict',
  'npm run verify:production -- https://herbalisti.com',
  'npm run verify:goal-readiness -- --strict',
]) {
  assert(workflow.includes(command), `Production deploy workflow should include: ${command}`)
}

assert(workflow.includes("printf '%s' \"$FEED_ADMIN_TOKEN\""), 'FEED_ADMIN_TOKEN should be piped without echoing')
assert(workflow.includes("printf '%s' \"$KIE_API_KEY\""), 'KIE_API_KEY should be piped without echoing')
assert(workflow.includes("printf '%s' \"$MEDIA_ADMIN_TOKEN\""), 'MEDIA_ADMIN_TOKEN should be piped without echoing')
assert(workflow.includes('skip_live_verification'), 'Production deploy workflow should expose a DNS-transition live verification override')
assert(!secretValuePattern.test(workflow), 'Production deploy workflow must not contain literal secret values')
assert(contract.commands.safePreflight.includes('npm run verify:production-deploy-workflow'), 'Safe preflight should include production deploy workflow verification')
assert(
  externalActions.approvalRequiredActions?.some((action) => action.id === 'run-github-production-deploy-workflow'),
  'External action checklist should include the guarded GitHub production deploy workflow action',
)

console.log(
  JSON.stringify(
    {
      status: 'pass',
      workflow: workflowPath,
      trigger: 'workflow_dispatch',
      environment: 'production',
      deploymentAutomatic: false,
      requiredGitHubSecrets: [
        'CLOUDFLARE_API_TOKEN',
        'CLOUDFLARE_ACCOUNT_ID',
        'CLOUDFLARE_D1_DATABASE_ID',
        'FEED_ADMIN_TOKEN',
        'KIE_API_KEY',
        'MEDIA_ADMIN_TOKEN',
      ],
      safeToRun:
        'This verifier reads local workflow, package, and contract files only. It does not call GitHub, deploy, mutate DNS, create Cloudflare resources, set secrets, or print secret values.',
    },
    null,
    2,
  ),
)
