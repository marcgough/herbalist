import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const readJson = (path) => JSON.parse(read(path))
const exists = (path) => existsSync(resolve(root, path))
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const packageJson = readJson('package.json')
const contract = readJson('docs/production-environment-contract.json')
const checklist = readJson('docs/external-launch-actions.json')
const markdown = read('docs/external-launch-actions.md')
const runbook = read('docs/deployment-runbook.md')

assert(exists('scripts/prepare-external-actions.mjs'), 'External action packet generator should exist')
assert(exists('docs/external-launch-actions.json'), 'External action JSON should exist')
assert(exists('docs/external-launch-actions.md'), 'External action Markdown should exist')
assert(packageJson.scripts?.['prepare:external-actions'], 'package.json should include prepare:external-actions')
assert(packageJson.scripts?.['verify:external-actions'], 'package.json should include verify:external-actions')

assert(checklist.version === 1, 'External action checklist version should be 1')
assert(checklist.project.domain === 'herbalisti.com', 'Checklist should target herbalisti.com')
assert(checklist.guardrails.localWorkPreApproved === true, 'Checklist should preserve local work permission')
assert(
  checklist.guardrails.externalActionsRequireFreshApproval === true,
  'Checklist should require fresh approval for external actions',
)
assert(checklist.guardrails.neverPasteSecretsIntoChatOrDocs === true, 'Checklist should protect secret values')
assert(
  checklist.safeToRun.includes('does not deploy') && checklist.safeToRun.includes('print secret values'),
  'Checklist should state it is local and non-destructive',
)

const localIds = new Set(checklist.localAllowedActions.map((action) => action.id))
for (const id of [
  'run-release-proof',
  'generate-launch-packet',
  'run-production-cutover-simulation',
  'generate-external-actions',
  'generate-production-provisioning-readiness',
  'generate-production-state-snapshot',
  'verify-production-feed-seed',
  'check-github-production-readiness',
  'generate-github-production-dispatch-packet',
  'check-current-production-state-evidence',
  'check-cloudflare-production-state',
  'generate-cloudflare-token-requirements',
  'generate-d1-production-migration-manifest',
  'generate-dns-cutover-plan',
  'generate-production-secret-setup',
  'verify-github-generated-secrets',
  'activate-d1-bindings-local',
]) {
  assert(localIds.has(id), `Checklist should include local action ${id}`)
}

const externalActions = Object.fromEntries(checklist.approvalRequiredActions.map((action) => [action.id, action]))
for (const id of [
  'create-d1-database',
  'apply-remote-d1-migrations',
  'set-feed-admin-token',
  'deploy-cloudflare-pages',
  'deploy-news-worker',
  'seed-production-feed',
  'connect-domain',
]) {
  assert(externalActions[id]?.approvalRequired === true, `External action ${id} should require approval`)
  assert(externalActions[id]?.requiredForLaunch === true, `External action ${id} should be required for launch`)
}

for (const id of [
  'create-r2-bucket-optional',
  'set-openai-api-key-optional',
  'generate-herbalisti-owned-github-secrets',
  'set-kie-api-key',
  'set-media-admin-token',
  'run-github-production-deploy-workflow',
  'generate-seedance-video-optional',
]) {
  assert(externalActions[id]?.approvalRequired === true, `Optional external action ${id} should still require approval`)
  assert(externalActions[id]?.requiredForLaunch === false, `Optional external action ${id} should not block launch`)
}

assert(
  externalActions['create-d1-database'].command === contract.commands.createResources[0],
  'D1 creation command should match the production contract',
)
assert(
  externalActions['apply-remote-d1-migrations'].command === contract.commands.remoteMigrations[0],
  'Remote migration command should match the production contract',
)
assert(
  externalActions['apply-remote-d1-migrations'].verification.includes('npm run verify:d1-manifest'),
  'Remote migration action should require D1 production migration manifest verification',
)
assert(
  externalActions['set-feed-admin-token'].additionalCommands?.includes(
    'npx wrangler pages secret put FEED_ADMIN_TOKEN --project-name herbalisti',
  ),
  'Feed admin token action should include the Pages feed-refresh secret command',
)
assert(
  markdown.includes('npx wrangler pages secret put FEED_ADMIN_TOKEN --project-name herbalisti'),
  'External action Markdown should include the Pages feed-refresh secret command',
)
assert(
  externalActions['deploy-cloudflare-pages'].command === contract.commands.deploy[0],
  'Pages deploy command should match the production contract',
)
assert(
  !externalActions['deploy-cloudflare-pages'].after.includes('set-kie-api-key') &&
    !externalActions['deploy-cloudflare-pages'].after.includes('set-media-admin-token'),
  'Pages deploy should not depend on optional Seedance secret setup',
)
assert(
  externalActions['deploy-news-worker'].command === contract.commands.deploy[1],
  'News Worker deploy command should match the production contract',
)
assert(
  externalActions['run-github-production-deploy-workflow'].command === contract.commands.githubProductionDeploy[0],
  'Guarded GitHub production deploy workflow command should match the production contract',
)
assert(
  externalActions['seed-production-feed'].command === contract.commands.seedProductionFeed[0],
  'Production feed seed command should match the production contract',
)
assert(
  externalActions['seed-production-feed'].secretNames.includes('FEED_ADMIN_TOKEN'),
  'Production feed seed action should name FEED_ADMIN_TOKEN',
)
assert(
  externalActions['seed-production-feed'].verification.includes('npm run verify:production-feed-seed'),
  'Production feed seed action should require its dry-run verifier',
)
assert(
  externalActions['run-github-production-deploy-workflow'].verification.includes('npm run verify:production-secrets'),
  'Guarded GitHub production deploy workflow should require production secret setup verification',
)
assert(
  externalActions['run-github-production-deploy-workflow'].verification.includes(
    'npm run verify:github-generated-secrets',
  ),
  'Guarded GitHub production deploy workflow should require generated admin secret helper verification',
)
assert(
  externalActions['run-github-production-deploy-workflow'].verification.includes('npm run verify:cloudflare-token-requirements'),
  'Guarded GitHub production deploy workflow should require Cloudflare token requirement verification',
)
assert(
  externalActions['run-github-production-deploy-workflow'].verification.includes('npm run verify:production-state'),
  'Guarded GitHub production deploy workflow should require production state snapshot verification',
)
assert(
  externalActions['run-github-production-deploy-workflow'].verification.includes(
    'npm run verify:github-production-dispatch',
  ),
  'Guarded GitHub production deploy workflow should require GitHub production dispatch packet verification',
)
assert(
  externalActions['run-github-production-deploy-workflow'].verification.includes(
    'npm run verify:production-state-current',
  ),
  'Guarded GitHub production deploy workflow should require current production state evidence verification',
)
assert(
  externalActions['run-github-production-deploy-workflow'].verification.includes(
    'npm run verify:production-deploy-evidence-artifact',
  ),
  'Guarded GitHub production deploy workflow should require production deploy evidence artifact readback verification',
)
assert(
  externalActions['run-github-production-deploy-workflow'].notes?.some((note) =>
    note.includes('skip_live_verification_confirm=skip-herbalisti-live-verification'),
  ),
  'Guarded GitHub production deploy workflow should document the live-verification skip acknowledgement phrase',
)
assert(
  markdown.includes('skip_live_verification_confirm=skip-herbalisti-live-verification'),
  'External action Markdown should document the live-verification skip acknowledgement phrase',
)
assert(
  localIds.has('generate-production-state-snapshot') && markdown.includes('verify:production-state'),
  'Checklist should include production state snapshot generation and verification',
)
assert(
  localIds.has('verify-github-generated-secrets') && markdown.includes('npm run verify:github-generated-secrets'),
  'Checklist should include the generated GitHub admin secret helper dry-run verification',
)
assert(
  externalActions['generate-herbalisti-owned-github-secrets'].command ===
    'npm run set:github-generated-secrets -- --confirm set-herbalisti-generated-secrets',
  'Generated GitHub admin secret action should require the exact confirmation-gated helper command',
)
assert(
  externalActions['generate-herbalisti-owned-github-secrets'].secretNames.includes('FEED_ADMIN_TOKEN') &&
    externalActions['generate-herbalisti-owned-github-secrets'].secretNames.includes('MEDIA_ADMIN_TOKEN'),
  'Generated GitHub admin secret action should name only the generated admin tokens',
)
assert(
  localIds.has('check-current-production-state-evidence') &&
    markdown.includes('npm run verify:production-state-current'),
  'Checklist should include current production state evidence verification',
)
assert(
  localIds.has('generate-github-production-dispatch-packet') &&
    markdown.includes('npm run verify:github-production-dispatch'),
  'Checklist should include GitHub production dispatch packet generation and verification',
)
assert(
  localIds.has('generate-cloudflare-token-requirements') &&
    markdown.includes('verify:cloudflare-token-requirements'),
  'Checklist should include Cloudflare token requirement generation and verification',
)
assert(
  checklist.completionGates.every((gate) => contract.commands.liveCompletionGates.includes(gate)),
  'Checklist completion gates should mirror the production contract',
)
assert(
  externalActions['connect-domain'].verification.includes('npm run verify:dns-cutover'),
  'Custom-domain action should require DNS/custom-domain cutover verification',
)

const secretNames = checklist.approvalRequiredActions.flatMap((action) => action.secretNames)
for (const name of [
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_ACCOUNT_ID',
  'FEED_ADMIN_TOKEN',
  'KIE_API_KEY',
  'MEDIA_ADMIN_TOKEN',
]) {
  assert(secretNames.includes(name), `Checklist should name managed secret ${name}`)
}
assert(!secretNames.includes('CLOUDFLARE_D1_DATABASE_ID'), 'D1 database ID should be resolved by the guarded workflow, not handled as a GitHub secret')

const combinedText = `${JSON.stringify(checklist)}\n${markdown}`
assert(!/sk-[A-Za-z0-9_-]{20,}/.test(combinedText), 'Checklist must not contain OpenAI-looking secret values')
assert(!/Bearer\s+[A-Za-z0-9._-]+/i.test(combinedText), 'Checklist must not contain bearer tokens')
assert(!/TOKEN_VALUE|SECRET_VALUE/.test(combinedText), 'Checklist must not include placeholder secret values')
assert(markdown.includes('Do not paste secret values into chat'), 'Markdown should include secret-handling boundary')
assert(markdown.includes('Live deployment'), 'Markdown should call out deployment approval boundary')
assert(runbook.includes('verify:external-actions'), 'Deployment runbook should document external action verification')
assert(
  contract.commands.safePreflight.includes('npm run verify:external-actions'),
  'Production contract safe preflight should include external action verification',
)

console.log(
  JSON.stringify(
    {
      status: 'pass',
      approvalRequiredActions: checklist.approvalRequiredActions.length,
      localAllowedActions: checklist.localAllowedActions.length,
      requiredForLaunch: checklist.approvalRequiredActions.filter((action) => action.requiredForLaunch).length,
      optionalExternalActions: checklist.approvalRequiredActions.filter((action) => !action.requiredForLaunch).length,
      safeToRun: 'This verifier reads local files only. It does not deploy, mutate DNS, create resources, call paid APIs, or print secret values.',
    },
    null,
    2,
  ),
)
