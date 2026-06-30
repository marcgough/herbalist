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
  'check-github-production-readiness',
  'check-cloudflare-production-state',
  'generate-d1-production-migration-manifest',
  'generate-dns-cutover-plan',
  'activate-d1-bindings-local',
]) {
  assert(localIds.has(id), `Checklist should include local action ${id}`)
}

const externalActions = Object.fromEntries(checklist.approvalRequiredActions.map((action) => [action.id, action]))
for (const id of [
  'create-d1-database',
  'apply-remote-d1-migrations',
  'set-feed-admin-token',
  'set-kie-api-key',
  'set-media-admin-token',
  'deploy-cloudflare-pages',
  'deploy-news-worker',
  'connect-domain',
]) {
  assert(externalActions[id]?.approvalRequired === true, `External action ${id} should require approval`)
  assert(externalActions[id]?.requiredForLaunch === true, `External action ${id} should be required for launch`)
}

for (const id of [
  'create-r2-bucket-optional',
  'set-openai-api-key-optional',
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
  externalActions['deploy-cloudflare-pages'].command === contract.commands.deploy[0],
  'Pages deploy command should match the production contract',
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
  'CLOUDFLARE_D1_DATABASE_ID',
  'FEED_ADMIN_TOKEN',
  'KIE_API_KEY',
  'MEDIA_ADMIN_TOKEN',
]) {
  assert(secretNames.includes(name), `Checklist should name required secret ${name}`)
}

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
