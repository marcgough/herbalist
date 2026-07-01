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
const deployEvidenceScript = read('scripts/prepare-production-deploy-evidence.mjs')
const feedSeedScript = read('scripts/seed-production-feed.mjs')
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
assert(workflow.includes('skip_live_verification'), 'Production deploy workflow should expose a DNS-transition live verification override')
assert(workflow.includes('skip_live_verification_confirm'), 'Production deploy workflow should require a separate live-verification skip acknowledgement input')
assert(workflow.includes('skip-herbalisti-live-verification'), 'Production deploy workflow should require the exact live-verification skip acknowledgement phrase')
assert(workflow.includes('SKIP_LIVE_VERIFICATION'), 'Production deploy workflow should pass the live-verification skip input through an environment variable')
assert(workflow.includes('SKIP_LIVE_VERIFICATION_CONFIRMATION'), 'Production deploy workflow should pass the live-verification skip acknowledgement through an environment variable')
assert(workflow.includes('Live verification acknowledgement required'), 'Production deploy workflow should fail loudly when live verification is skipped without acknowledgement')
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

assert(
  workflow.includes('CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}'),
  'Production deploy workflow should read CLOUDFLARE_API_TOKEN from GitHub secrets',
)
assert(
  workflow.includes('CLOUDFLARE_ACCOUNT_ID: ${{ vars.CLOUDFLARE_ACCOUNT_ID || secrets.CLOUDFLARE_ACCOUNT_ID }}'),
  'Production deploy workflow should read CLOUDFLARE_ACCOUNT_ID from a GitHub variable with secret fallback',
)
for (const name of ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID']) {
  assert(workflow.includes(name), `Production deploy workflow should validate ${name} presence by name only`)
}
assert(workflow.includes('secrets.KIE_API_KEY'), 'Production deploy workflow may read optional KIE_API_KEY from GitHub secrets')
assert(!workflow.includes('secrets.FEED_ADMIN_TOKEN'), 'Production deploy workflow should generate FEED_ADMIN_TOKEN at runtime')
assert(!workflow.includes('secrets.MEDIA_ADMIN_TOKEN'), 'Production deploy workflow should generate MEDIA_ADMIN_TOKEN at runtime')
assert(workflow.includes('Generate runtime admin tokens'), 'Production deploy workflow should generate Herbalisti-owned admin tokens at runtime')
assert(workflow.includes("::add-mask::$value"), 'Generated runtime admin tokens should be masked in GitHub logs')
assert(workflow.includes("['FEED_ADMIN_TOKEN', 'MEDIA_ADMIN_TOKEN']"), 'Production deploy workflow should generate both runtime admin token names')
assert(workflow.includes('randomBytes(32)'), 'Generated runtime admin tokens should use cryptographic randomness')
assert(
  workflow.includes('KIE_API_KEY is not configured; optional Seedance media endpoints will remain disabled.'),
  'Production deploy workflow should treat KIE_API_KEY as optional for launch',
)
assert(
  workflow.includes('Set Cloudflare Pages runtime secrets'),
  'Production deploy workflow should set Pages runtime secrets before deploying Pages',
)
assert(
  workflow.includes('Set scheduled Worker runtime secret'),
  'Production deploy workflow should set the scheduled Worker runtime secret after the Worker exists',
)
assert(!workflow.includes('secrets.CLOUDFLARE_D1_DATABASE_ID'), 'Production deploy workflow should resolve the D1 database ID by name, not read it as a GitHub secret')
assert(exists('scripts/resolve-production-d1-database.mjs'), 'Production deploy workflow requires the D1 resolver script')
assert(packageJson.scripts?.['resolve:production-d1'], 'package.json should expose resolve:production-d1')
assert(exists('scripts/verify-production-deploy-dry-run.mjs'), 'Production deploy workflow requires the deploy dry-run verifier')
assert(packageJson.scripts?.['verify:production-deploy-dry-run'], 'package.json should expose verify:production-deploy-dry-run')
assert(exists('scripts/prepare-production-deploy-evidence.mjs'), 'Production deploy workflow requires the deploy evidence packet generator')
assert(packageJson.scripts?.['prepare:production-deploy-evidence'], 'package.json should expose prepare:production-deploy-evidence')
assert(packageJson.scripts?.['verify:production-deploy-evidence'], 'package.json should expose verify:production-deploy-evidence')
assert(
  deployEvidenceScript.includes('finalCompletionGates') &&
    deployEvidenceScript.includes('postDeployEvidenceCommands') &&
    deployEvidenceScript.includes('requiredLiveVerificationCommands'),
  'Production deploy evidence packet should include post-deploy readback, live verification, and final completion gates',
)
assert(
  deployEvidenceScript.includes('docs/production-environment-contract.json'),
  'Production deploy evidence packet should source completion gates from the production contract',
)
assert(exists('scripts/verify-production-d1-resolver.mjs'), 'Production deploy workflow requires the D1 resolver verifier')
assert(packageJson.scripts?.['verify:production-d1-resolver'], 'package.json should expose verify:production-d1-resolver')
assert(packageJson.scripts?.['verify:production-state-current'], 'package.json should expose verify:production-state-current')

for (const command of [
  'npm run verify:github-release-evidence -- --commit "$GITHUB_SHA"',
  'npm run verify:production-state-current',
  'npm run verify:production-deploy-workflow',
  'npm run verify:production-deploy-dry-run',
  'npm run verify:production-d1-resolver',
  'npm run verify:github-production-dispatch',
  'npm run verify:launch -- --soft',
  'npm run verify:production-contract',
  'npm run verify:cloudflare-token-requirements',
  'npm run verify:d1-manifest',
  'npm run verify:dns-cutover',
  'npm run verify:production-secrets',
  'npm run verify:github-generated-secrets',
  'npm run verify:production-state',
  'npm run verify:production-provisioning',
  'npx wrangler pages project create herbalisti --production-branch main',
  'npm run resolve:production-d1 -- --create-if-missing --github-env "$GITHUB_ENV"',
  'npm run configure:cloudflare -- --d1 "$CLOUDFLARE_D1_DATABASE_ID" --apply',
  'npx wrangler d1 migrations apply herbalisti --remote',
  'npx wrangler secret put FEED_ADMIN_TOKEN --config wrangler.news.toml',
  'npx wrangler pages secret put FEED_ADMIN_TOKEN --project-name herbalisti',
  'npx wrangler pages secret put KIE_API_KEY --project-name herbalisti',
  'npx wrangler pages secret put MEDIA_ADMIN_TOKEN --project-name herbalisti',
  'npm run deploy:cloudflare',
  'npm run deploy:news-worker',
  'npm run seed:production-feed -- --base-url https://herbalisti.com --confirm seed-herbalisti-feed',
  'npm run verify:live-readiness -- --strict',
  'npm run verify:production -- https://herbalisti.com',
  'npm run verify:goal-readiness -- --strict',
  'npm run prepare:production-deploy-evidence',
  'actions/upload-artifact@v4',
  'herbalisti-production-deploy-evidence',
  'output/production-deploy',
  'retention-days: 90',
]) {
  assert(workflow.includes(command), `Production deploy workflow should include: ${command}`)
}

const evidenceStart = workflow.indexOf('Write production deployment evidence')
const evidenceEnd = workflow.indexOf('Upload production deployment evidence')
assert(evidenceStart >= 0 && evidenceEnd > evidenceStart, 'Production deploy workflow should write evidence before uploading it')
const evidenceBlock = workflow.slice(evidenceStart, evidenceEnd)
for (const secretName of ['FEED_ADMIN_TOKEN', 'MEDIA_ADMIN_TOKEN', 'KIE_API_KEY', 'CLOUDFLARE_API_TOKEN']) {
  assert(!evidenceBlock.includes(secretName), `Production deployment evidence generation must not read ${secretName}`)
}
assert(
  workflow.includes('if: ${{ always() }}'),
  'Production deployment evidence should be attempted even when a deploy step fails',
)

assert(workflow.includes("printf '%s' \"$FEED_ADMIN_TOKEN\""), 'FEED_ADMIN_TOKEN should be piped without echoing')
assert(workflow.includes("printf '%s' \"$KIE_API_KEY\""), 'KIE_API_KEY should be piped without echoing')
assert(workflow.includes("printf '%s' \"$MEDIA_ADMIN_TOKEN\""), 'MEDIA_ADMIN_TOKEN should be piped without echoing')
assert(
  workflow.includes('Skipping optional Seedance media secrets because KIE_API_KEY is not configured.'),
  'Production deploy workflow should skip optional media secrets when KIE_API_KEY is absent',
)
const pagesFeedSecretIndex = workflow.indexOf('npx wrangler pages secret put FEED_ADMIN_TOKEN --project-name herbalisti')
const pagesDeployIndex = workflow.indexOf('npm run deploy:cloudflare')
const workerDeployIndex = workflow.indexOf('npm run deploy:news-worker')
const workerFeedSecretIndex = workflow.indexOf('npx wrangler secret put FEED_ADMIN_TOKEN --config wrangler.news.toml')
const feedSeedIndex = workflow.indexOf('npm run seed:production-feed -- --base-url https://herbalisti.com --confirm seed-herbalisti-feed')
assert(
  pagesFeedSecretIndex >= 0 && pagesDeployIndex > pagesFeedSecretIndex,
  'Production deploy workflow should set the Pages FEED_ADMIN_TOKEN secret before deploying Pages',
)
assert(
  workerDeployIndex >= 0 && workerFeedSecretIndex > workerDeployIndex,
  'Production deploy workflow should deploy the scheduled Worker before applying the Worker FEED_ADMIN_TOKEN secret',
)
assert(
  feedSeedIndex > workerFeedSecretIndex,
  'Production deploy workflow should seed the live feed only after the Worker FEED_ADMIN_TOKEN secret has been applied',
)
assert(packageJson.scripts?.['seed:production-feed'], 'Production deploy workflow should use the shared feed seed command')
assert(feedSeedScript.includes('/api/feed-refresh'), 'Production feed seed command should post to the protected feed-refresh endpoint')
assert(feedSeedScript.includes("['completed', 'completed_with_warnings']"), 'Production feed seed command should accept completed feed-refresh statuses only')
assert(!secretValuePattern.test(workflow), 'Production deploy workflow must not contain literal secret values')
assert(contract.commands.safePreflight.includes('npm run verify:production-deploy-workflow'), 'Safe preflight should include production deploy workflow verification')
assert(contract.commands.safePreflight.includes('npm run verify:production-deploy-dry-run'), 'Safe preflight should include production deploy dry-run verification')
assert(contract.commands.safePreflight.includes('npm run verify:production-d1-resolver'), 'Safe preflight should include production D1 resolver verification')
assert(contract.commands.safePreflight.includes('npm run verify:production-state'), 'Safe preflight should include production state snapshot verification')
assert(contract.commands.safePreflight.includes('npm run verify:cloudflare-token-requirements'), 'Safe preflight should include Cloudflare token requirement verification')
assert(
  externalActions.approvalRequiredActions?.some((action) => action.id === 'run-github-production-deploy-workflow'),
  'External action checklist should include the guarded GitHub production deploy workflow action',
)
assert(
  externalActions.approvalRequiredActions
    ?.find((action) => action.id === 'run-github-production-deploy-workflow')
    ?.notes?.some((note) => note.includes('skip_live_verification_confirm=skip-herbalisti-live-verification')),
  'External action checklist should document the live-verification skip acknowledgement phrase',
)

console.log(
  JSON.stringify(
    {
      status: 'pass',
      workflow: workflowPath,
      trigger: 'workflow_dispatch',
      environment: 'production',
      deploymentAutomatic: false,
      requiredGitHubSecrets: ['CLOUDFLARE_API_TOKEN'],
      requiredGitHubVariables: ['CLOUDFLARE_ACCOUNT_ID'],
      secretFallbacks: ['CLOUDFLARE_ACCOUNT_ID'],
      optionalGitHubSecrets: ['KIE_API_KEY'],
      generatedRuntimeSecretNames: ['FEED_ADMIN_TOKEN', 'MEDIA_ADMIN_TOKEN'],
      deploymentEvidenceArtifact: 'herbalisti-production-deploy-evidence',
      workflowDerivedValues: ['CLOUDFLARE_D1_DATABASE_ID'],
      safeToRun:
        'This verifier reads local workflow, package, and contract files only. It does not call GitHub, deploy, mutate DNS, create Cloudflare resources, set secrets, or print secret values.',
    },
    null,
    2,
  ),
)
