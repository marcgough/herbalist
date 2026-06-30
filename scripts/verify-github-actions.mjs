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

const ciPath = '.github/workflows/ci.yml'
const releasePath = '.github/workflows/release-gate.yml'
const productionDeployPath = '.github/workflows/production-deploy.yml'
const packageJson = readJson('package.json')
const releaseVerifier = read('scripts/verify-release.mjs')
const launchVerifier = read('scripts/verify-launch-config.mjs')
const productionContractVerifier = read('scripts/verify-production-contract.mjs')
const runbook = read('docs/deployment-runbook.md')
const launchPacket = read('docs/production-launch-packet.md')
const contract = readJson('docs/production-environment-contract.json')

assert(exists(ciPath), 'GitHub CI workflow is missing')
assert(exists(releasePath), 'GitHub manual release workflow is missing')
assert(exists(productionDeployPath), 'GitHub production deploy workflow is missing')

const ci = read(ciPath)
const release = read(releasePath)
const productionDeploy = read(productionDeployPath)
const scripts = packageJson.scripts ?? {}

assert(scripts['verify:github-actions'], 'package.json should expose verify:github-actions')
assert(scripts['verify:production-deploy-workflow'], 'package.json should expose verify:production-deploy-workflow')
assert(scripts['verify:github-production-readiness'], 'package.json should expose verify:github-production-readiness')
assert(packageJson.devDependencies?.wrangler, 'Wrangler should be a devDependency for reproducible release verification')

for (const workflow of [ci, release]) {
  assert(workflow.includes('actions/checkout@v4'), 'GitHub workflows should use checkout v4')
  assert(workflow.includes('actions/setup-node@v4'), 'GitHub workflows should use setup-node v4')
  assert(workflow.includes('node-version: "24"'), 'GitHub workflows should pin Node.js 24')
  assert(workflow.includes('permissions:'), 'GitHub workflows should declare minimal permissions')
  assert(workflow.includes('contents: read'), 'GitHub workflows should use read-only repository permissions')
  assert(!/deploy:cloudflare|deploy:news-worker|wrangler pages deploy|wrangler deploy|secret put|d1 create|r2 bucket create/i.test(workflow), 'GitHub workflows should not deploy, create resources, or set secrets')
}

assert(ci.includes('push:'), 'CI workflow should run on push')
assert(ci.includes('pull_request:'), 'CI workflow should run on pull_request')
assert(ci.includes('npm ci'), 'CI workflow should install with npm ci')
assert(ci.includes('npm run lint'), 'CI workflow should run lint')
assert(ci.includes('npm run build'), 'CI workflow should run build')
assert(ci.includes('npm run verify:github-actions'), 'CI workflow should verify its own handoff contract')
assert(ci.includes('npm run verify:goal-readiness'), 'CI workflow should verify goal readiness')
assert(ci.includes('npm run verify:launch -- --soft'), 'CI workflow should run non-destructive launch preflight')
assert(ci.includes('npm run verify:production-contract'), 'CI workflow should verify production contract')
assert(ci.includes('npm run verify:search-discovery'), 'CI workflow should verify search discovery')
assert(ci.includes('npm run verify:corpus-rights -- --public-only'), 'CI workflow should verify committed public corpus exports')
assert(ci.includes('npm run verify:media-endpoints'), 'CI workflow should verify media endpoints with mocked provider responses')

assert(release.includes('workflow_dispatch:'), 'Manual release workflow should only run by workflow_dispatch')
assert(!release.includes('push:'), 'Manual release workflow should not run automatically on push')
assert(!release.includes('pull_request:'), 'Manual release workflow should not run automatically on pull_request')
assert(release.includes('PLAYWRIGHT_CHROMIUM_EXECUTABLE'), 'Manual release workflow should resolve the browser executable')
assert(release.includes('npm run verify:release -- --public-only'), 'Manual release workflow should run the repository-safe release verifier')
assert(release.includes('actions/upload-artifact@v4'), 'Manual release workflow should upload visual smoke screenshots')

assert(productionDeploy.includes('workflow_dispatch:'), 'Production deploy workflow should only run by workflow_dispatch')
assert(!productionDeploy.includes('push:'), 'Production deploy workflow should not run automatically on push')
assert(!productionDeploy.includes('pull_request:'), 'Production deploy workflow should not run automatically on pull_request')
assert(productionDeploy.includes('deploy-herbalisti-production'), 'Production deploy workflow should require the exact confirmation phrase')
assert(productionDeploy.includes('environment:'), 'Production deploy workflow should use a GitHub production environment')
assert(productionDeploy.includes('npm run verify:github-release-evidence'), 'Production deploy workflow should require exact release evidence')
assert(productionDeploy.includes('npm run verify:production-deploy-workflow'), 'Production deploy workflow should verify its own contract')
assert(productionDeploy.includes('npm run verify:d1-manifest'), 'Production deploy workflow should verify D1 migration manifest before remote migrations')
assert(productionDeploy.includes('npm run deploy:cloudflare'), 'Production deploy workflow should deploy Cloudflare Pages when manually approved')
assert(productionDeploy.includes('npm run deploy:news-worker'), 'Production deploy workflow should deploy the scheduled Worker when manually approved')

assert(releaseVerifier.includes('verify:github-actions'), 'Full release verifier should include the GitHub Actions gate')
assert(releaseVerifier.includes('verify:production-deploy-workflow'), 'Full release verifier should include the production deploy workflow gate')
assert(releaseVerifier.includes('verify:github-production-readiness'), 'Full release verifier should include the GitHub production readiness gate')
assert(releaseVerifier.includes('verify:d1-manifest'), 'Full release verifier should include the D1 production migration manifest gate')
assert(launchVerifier.includes('.github/workflows/ci.yml'), 'Launch verifier should require the CI workflow')
assert(launchVerifier.includes('.github/workflows/release-gate.yml'), 'Launch verifier should require the manual release workflow')
assert(launchVerifier.includes('.github/workflows/production-deploy.yml'), 'Launch verifier should require the production deploy workflow')
assert(productionContractVerifier.includes('verify:github-actions'), 'Production contract verifier should require GitHub Actions verification')
assert(productionContractVerifier.includes('verify:production-deploy-workflow'), 'Production contract verifier should require production deploy workflow verification')
assert(productionContractVerifier.includes('verify:github-production-readiness'), 'Production contract verifier should require GitHub production readiness verification')
assert(contract.commands.safePreflight.includes('npm run verify:github-actions'), 'Safe preflight should include GitHub Actions verification')
assert(contract.commands.safePreflight.includes('npm run verify:production-deploy-workflow'), 'Safe preflight should include production deploy workflow verification')
assert(contract.commands.safePreflight.includes('npm run verify:github-production-readiness'), 'Safe preflight should include GitHub production readiness verification')
assert(runbook.includes('npm run verify:github-actions'), 'Deployment runbook should document GitHub Actions verification')
assert(runbook.includes('npm run verify:production-deploy-workflow'), 'Deployment runbook should document production deploy workflow verification')
assert(runbook.includes('npm run verify:github-production-readiness'), 'Deployment runbook should document GitHub production readiness verification')
assert(launchPacket.includes('npm run verify:github-actions'), 'Production launch packet should document GitHub Actions verification')
assert(launchPacket.includes('npm run verify:production-deploy-workflow'), 'Production launch packet should document production deploy workflow verification')
assert(launchPacket.includes('npm run verify:github-production-readiness'), 'Production launch packet should document GitHub production readiness verification')

console.log(
  JSON.stringify(
    {
      status: 'pass',
      workflows: [ciPath, releasePath, productionDeployPath],
      automaticDeployment: false,
      fullReleaseMode: 'manual workflow_dispatch with public corpus export mode',
      safeToRun:
        'This verifier reads local workflow and contract files only. It does not call GitHub, deploy, mutate DNS, create Cloudflare resources, or print secret values.',
    },
    null,
    2,
  ),
)
