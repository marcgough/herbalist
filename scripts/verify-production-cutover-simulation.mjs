import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildProductionCutoverSimulation } from './simulate-production-cutover.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const readJson = (path) => JSON.parse(read(path))
const exists = (path) => existsSync(resolve(root, path))

const packageJson = readJson('package.json')
const contract = readJson('docs/production-environment-contract.json')
const externalActions = readJson('docs/external-launch-actions.json')
const runbook = read('docs/deployment-runbook.md')
const launchPacket = read('docs/production-launch-packet.md')
const goalReadiness = read('docs/goal-readiness.md')

assert(exists('scripts/simulate-production-cutover.mjs'), 'Production cutover simulation script should exist')
assert(exists('scripts/verify-production-cutover-simulation.mjs'), 'Production cutover verifier should exist')
assert(exists('docs/production-cutover-simulation.json'), 'Production cutover simulation JSON should exist')
assert(exists('docs/production-cutover-simulation.md'), 'Production cutover simulation Markdown should exist')
assert(packageJson.scripts?.['simulate:production-cutover'], 'package.json should expose simulate:production-cutover')
assert(packageJson.scripts?.['prepare:production-cutover'], 'package.json should expose prepare:production-cutover')
assert(packageJson.scripts?.['verify:production-cutover'], 'package.json should expose verify:production-cutover')
assert(
  contract.commands.safePreflight.includes('npm run verify:production-cutover'),
  'Production contract safe preflight should include cutover simulation verification',
)

const current = buildProductionCutoverSimulation()
const documented = readJson('docs/production-cutover-simulation.json')
const markdown = read('docs/production-cutover-simulation.md')

assert.equal(current.status, 'pass', 'Current production cutover simulation should pass')
assert.equal(documented.version, 1, 'Documented simulation version should be 1')
assert.equal(documented.status, 'pass', 'Documented simulation should be passing')
assert.equal(documented.scenario.domain, 'herbalisti.com', 'Simulation should target herbalisti.com')
assert.equal(documented.scenario.pagesProject, 'herbalisti', 'Simulation should target the Herbalisti Pages project')
assert.equal(documented.scenario.optionalR2Bucket, 'herbalisti-media', 'Simulation should model the optional media R2 bucket')
assert.equal(documented.simulatedBindings.pagesD1BindingActive, true, 'Simulation should activate Pages D1 binding')
assert.equal(documented.simulatedBindings.newsWorkerD1BindingActive, true, 'Simulation should activate News Worker D1 binding')
assert.equal(documented.simulatedBindings.sharedD1DatabaseId, true, 'Simulation should keep D1 database ID shared')
assert.equal(documented.simulatedBindings.pagesR2BindingActive, true, 'Simulation should activate optional Pages R2 binding')
assert.equal(documented.simulatedBindings.newsWorkerR2BindingActive, false, 'Simulation should keep R2 out of the News Worker')
assert(
  documented.safeToRun.includes('No Cloudflare API call') && documented.safeToRun.includes('Wrangler config write'),
  'Simulation should declare the no-external-action boundary',
)

const checkIds = new Set(documented.checks.map((check) => check.id))
for (const id of [
  'no-wrangler-file-writes',
  'pages-d1-binding',
  'news-worker-d1-binding',
  'shared-d1-id',
  'pages-r2-binding',
  'news-worker-no-r2-binding',
  'safe-preflight-gate',
  'local-rehearsal-action',
  'd1-before-local-activation',
  'remote-migrations-after-binding',
  'pages-deploy-after-migrations-and-secrets',
  'domain-after-pages-deploy',
  'live-completion-gates',
]) {
  assert(checkIds.has(id), `Simulation should include check ${id}`)
}

const localActionIds = new Set(externalActions.localAllowedActions.map((action) => action.id))
assert(localActionIds.has('run-production-cutover-simulation'), 'External action checklist should expose simulation locally')
assert(markdown.includes('Cutover Order'), 'Simulation Markdown should document cutover order')
assert(markdown.includes('No Cloudflare API call'), 'Simulation Markdown should document the safe boundary')
assert(runbook.includes('verify:production-cutover'), 'Deployment runbook should document cutover verification')
assert(launchPacket.includes('verify:production-cutover'), 'Launch packet should document cutover verification')
assert(goalReadiness.includes('production cutover simulation'), 'Goal readiness doc should mention cutover simulation')

console.log(
  JSON.stringify(
    {
      status: 'pass',
      checks: documented.checks.length,
      safeToRun:
        'This verifier reads local files and runs an in-memory simulation. It does not deploy, mutate DNS, create resources, call paid APIs, write Wrangler config files, or print secret values.',
    },
    null,
    2,
  ),
)
