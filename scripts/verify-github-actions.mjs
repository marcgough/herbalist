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
assert(scripts['verify:production-deploy-dry-run'], 'package.json should expose verify:production-deploy-dry-run')
assert(scripts['verify:production-d1-resolver'], 'package.json should expose verify:production-d1-resolver')
assert(scripts['verify:production-feed-seed'], 'package.json should expose verify:production-feed-seed')
assert(scripts['verify:github-production-readiness'], 'package.json should expose verify:github-production-readiness')
assert(scripts['verify:github-production-dispatch'], 'package.json should expose verify:github-production-dispatch')
assert(scripts['verify:production-state'], 'package.json should expose verify:production-state')
assert(scripts['verify:production-state-current'], 'package.json should expose verify:production-state-current')
assert(scripts['prepare:production-deploy-evidence'], 'package.json should expose prepare:production-deploy-evidence')
assert(scripts['verify:production-deploy-evidence'], 'package.json should expose verify:production-deploy-evidence')
assert(scripts['verify:production-deploy-evidence-artifact'], 'package.json should expose verify:production-deploy-evidence-artifact')
assert(scripts['verify:cloudflare-token-requirements'], 'package.json should expose verify:cloudflare-token-requirements')
assert(packageJson.devDependencies?.wrangler, 'Wrangler should be a devDependency for reproducible release verification')

for (const workflow of [ci, release]) {
  assert(workflow.includes('actions/checkout@v5'), 'GitHub workflows should use checkout v5')
  assert(workflow.includes('actions/setup-node@v5'), 'GitHub workflows should use setup-node v5')
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
assert(ci.includes('npm run verify:production-deploy-dry-run'), 'CI workflow should verify the guarded production deploy dry run')
assert(ci.includes('npm run verify:production-d1-resolver'), 'CI workflow should verify production D1 resolver behavior')
assert(ci.includes('npm run verify:production-feed-seed'), 'CI workflow should verify production feed seed behavior')
assert(ci.includes('npm run verify:github-production-dispatch'), 'CI workflow should verify GitHub production dispatch packet')
assert(ci.includes('npm run verify:production-state'), 'CI workflow should verify the production state snapshot')
assert(ci.includes('npm run verify:search-discovery'), 'CI workflow should verify search discovery')
assert(ci.includes('npm run verify:corpus-rights -- --public-only'), 'CI workflow should verify committed public corpus exports')
assert(ci.includes('npm run verify:admin-auth'), 'CI workflow should verify protected admin token auth')
assert(ci.includes('npm run verify:media-endpoints'), 'CI workflow should verify media endpoints with mocked provider responses')

assert(release.includes('workflow_dispatch:'), 'Manual release workflow should only run by workflow_dispatch')
assert(!release.includes('push:'), 'Manual release workflow should not run automatically on push')
assert(!release.includes('pull_request:'), 'Manual release workflow should not run automatically on pull_request')
assert(release.includes('actions: read'), 'Manual release workflow should use read-only Actions metadata permission')
assert(release.includes('PLAYWRIGHT_CHROMIUM_EXECUTABLE'), 'Manual release workflow should resolve the browser executable')
assert(release.includes('npm run verify:release -- --public-only'), 'Manual release workflow should run the repository-safe release verifier')
assert(release.includes('actions/upload-artifact@v6'), 'Manual release workflow should upload visual smoke screenshots')

assert(productionDeploy.includes('workflow_dispatch:'), 'Production deploy workflow should only run by workflow_dispatch')
assert(!productionDeploy.includes('push:'), 'Production deploy workflow should not run automatically on push')
assert(!productionDeploy.includes('pull_request:'), 'Production deploy workflow should not run automatically on pull_request')
assert(productionDeploy.includes('deploy-herbalisti-production'), 'Production deploy workflow should require the exact confirmation phrase')
assert(productionDeploy.includes('skip_live_verification_confirm'), 'Production deploy workflow should require the live-verification skip acknowledgement input')
assert(productionDeploy.includes('skip-herbalisti-live-verification'), 'Production deploy workflow should require the exact live-verification skip acknowledgement phrase')
assert(productionDeploy.includes('environment:'), 'Production deploy workflow should use a GitHub production environment')
assert(productionDeploy.includes('npm run verify:github-release-evidence'), 'Production deploy workflow should require exact release evidence')
assert(productionDeploy.includes('npm run verify:production-state-current'), 'Production deploy workflow should verify current production state evidence')
assert(productionDeploy.includes('npm run verify:production-deploy-workflow'), 'Production deploy workflow should verify its own contract')
assert(productionDeploy.includes('npm run verify:production-deploy-dry-run'), 'Production deploy workflow should verify the local fake-Wrangler deploy dry run before live Cloudflare steps')
assert(productionDeploy.includes('npm run verify:production-d1-resolver'), 'Production deploy workflow should verify the D1 resolver behavior before resolving the live database')
assert(productionDeploy.includes('npm run verify:github-production-dispatch'), 'Production deploy workflow should verify the GitHub production dispatch packet')
assert(productionDeploy.includes('npm run seed:production-feed'), 'Production deploy workflow should seed the live feed through the shared command')
assert(productionDeploy.includes('npm run verify:production-state'), 'Production deploy workflow should verify the production state snapshot')
assert(productionDeploy.includes('npm run verify:d1-manifest'), 'Production deploy workflow should verify D1 migration manifest before remote migrations')
assert(productionDeploy.includes('npm run verify:dns-cutover'), 'Production deploy workflow should verify DNS cutover readiness')
assert(productionDeploy.includes('npm run verify:production-secrets'), 'Production deploy workflow should verify production secret setup')
assert(productionDeploy.includes('npm run verify:cloudflare-token-requirements'), 'Production deploy workflow should verify Cloudflare token requirements')
assert(productionDeploy.includes('npm run resolve:production-d1'), 'Production deploy workflow should resolve the D1 database ID by name during the guarded run')
assert(!productionDeploy.includes('secrets.CLOUDFLARE_D1_DATABASE_ID'), 'Production deploy workflow should not require the D1 database ID as a GitHub secret')
assert(productionDeploy.includes('npm run deploy:cloudflare'), 'Production deploy workflow should deploy Cloudflare Pages when manually approved')
assert(productionDeploy.includes('npm run deploy:news-worker'), 'Production deploy workflow should deploy the scheduled Worker when manually approved')
assert(productionDeploy.includes('npm run prepare:production-deploy-evidence'), 'Production deploy workflow should write a non-secret deployment evidence packet')
assert(productionDeploy.includes('actions/upload-artifact@v6'), 'Production deploy workflow should upload deployment evidence')
assert(productionDeploy.includes('herbalisti-production-deploy-evidence'), 'Production deploy workflow should use the stable deployment evidence artifact name')
assert(productionDeploy.includes('output/production-deploy'), 'Production deploy workflow should upload the deployment evidence directory')

assert(releaseVerifier.includes('verify:github-actions'), 'Full release verifier should include the GitHub Actions gate')
assert(releaseVerifier.includes('verify:production-deploy-workflow'), 'Full release verifier should include the production deploy workflow gate')
assert(releaseVerifier.includes('verify:production-deploy-evidence'), 'Full release verifier should include the production deploy evidence packet gate')
assert(releaseVerifier.includes('verify:production-deploy-evidence-artifact'), 'Full release verifier should include the production deploy evidence artifact readback gate')
assert(releaseVerifier.includes('verify:production-deploy-dry-run'), 'Full release verifier should include the production deploy dry-run gate')
assert(releaseVerifier.includes('verify:production-d1-resolver'), 'Full release verifier should include the production D1 resolver gate')
assert(releaseVerifier.includes('verify:production-feed-seed'), 'Full release verifier should include the production feed seed gate')
assert(releaseVerifier.includes('verify:github-production-dispatch'), 'Full release verifier should include the GitHub production dispatch packet gate')
assert(releaseVerifier.includes('verify:github-production-readiness'), 'Full release verifier should include the GitHub production readiness gate')
assert(releaseVerifier.includes('verify:production-state'), 'Full release verifier should include the production state snapshot gate')
assert(releaseVerifier.includes('verify:d1-manifest'), 'Full release verifier should include the D1 production migration manifest gate')
assert(releaseVerifier.includes('verify:dns-cutover'), 'Full release verifier should include the DNS cutover gate')
assert(releaseVerifier.includes('verify:production-secrets'), 'Full release verifier should include the production secret setup gate')
assert(
  releaseVerifier.includes('verify:github-production-credentials'),
  'Full release verifier should include the GitHub production credential helper gate',
)
assert(
  releaseVerifier.includes('verify:github-production-credential-helper'),
  'Full release verifier should include the GitHub production credential helper write-path gate',
)
assert(releaseVerifier.includes('verify:cloudflare-token-requirements'), 'Full release verifier should include the Cloudflare token requirement gate')
assert(launchVerifier.includes('.github/workflows/ci.yml'), 'Launch verifier should require the CI workflow')
assert(launchVerifier.includes('.github/workflows/release-gate.yml'), 'Launch verifier should require the manual release workflow')
assert(launchVerifier.includes('.github/workflows/production-deploy.yml'), 'Launch verifier should require the production deploy workflow')
assert(productionContractVerifier.includes('verify:github-actions'), 'Production contract verifier should require GitHub Actions verification')
assert(productionContractVerifier.includes('verify:production-deploy-workflow'), 'Production contract verifier should require production deploy workflow verification')
assert(productionContractVerifier.includes('verify:production-deploy-dry-run'), 'Production contract verifier should require production deploy dry-run verification')
assert(productionContractVerifier.includes('verify:production-deploy-evidence-artifact'), 'Production contract verifier should require production deploy evidence artifact readback verification')
assert(productionContractVerifier.includes('verify:production-d1-resolver'), 'Production contract verifier should require production D1 resolver verification')
assert(productionContractVerifier.includes('verify:production-feed-seed'), 'Production contract verifier should require production feed seed verification')
assert(productionContractVerifier.includes('verify:github-production-dispatch'), 'Production contract verifier should require GitHub production dispatch verification')
assert(productionContractVerifier.includes('verify:github-production-readiness'), 'Production contract verifier should require GitHub production readiness verification')
assert(productionContractVerifier.includes('verify:production-state'), 'Production contract verifier should require production state snapshot verification')
assert(productionContractVerifier.includes('verify:production-state-current'), 'Production contract verifier should require current production state evidence verification')
assert(productionContractVerifier.includes('verify:cloudflare-token-requirements'), 'Production contract verifier should require Cloudflare token requirement verification')
assert(contract.commands.safePreflight.includes('npm run verify:github-actions'), 'Safe preflight should include GitHub Actions verification')
assert(contract.commands.safePreflight.includes('npm run verify:production-deploy-workflow'), 'Safe preflight should include production deploy workflow verification')
assert(contract.commands.safePreflight.includes('npm run verify:production-deploy-evidence-artifact'), 'Safe preflight should include production deploy evidence artifact readback verification')
assert(contract.commands.safePreflight.includes('npm run verify:production-deploy-dry-run'), 'Safe preflight should include production deploy dry-run verification')
assert(contract.commands.safePreflight.includes('npm run verify:production-d1-resolver'), 'Safe preflight should include production D1 resolver verification')
assert(contract.commands.safePreflight.includes('npm run verify:production-feed-seed'), 'Safe preflight should include production feed seed verification')
assert(contract.commands.safePreflight.includes('npm run verify:github-production-dispatch'), 'Safe preflight should include GitHub production dispatch packet verification')
assert(contract.commands.safePreflight.includes('npm run verify:github-production-readiness'), 'Safe preflight should include GitHub production readiness verification')
assert(contract.commands.safePreflight.includes('npm run verify:github-production-credentials'), 'Safe preflight should include GitHub production credential helper verification')
assert(contract.commands.safePreflight.includes('npm run verify:production-state-current'), 'Safe preflight should include current production state evidence verification')
assert(contract.commands.safePreflight.includes('npm run verify:production-state'), 'Safe preflight should include production state snapshot verification')
assert(contract.commands.safePreflight.includes('npm run verify:cloudflare-token-requirements'), 'Safe preflight should include Cloudflare token requirement verification')
assert(runbook.includes('npm run verify:github-actions'), 'Deployment runbook should document GitHub Actions verification')
assert(runbook.includes('npm run verify:production-deploy-workflow'), 'Deployment runbook should document production deploy workflow verification')
assert(runbook.includes('npm run verify:production-deploy-evidence-artifact'), 'Deployment runbook should document production deploy evidence artifact readback verification')
assert(
  runbook.includes('skip_live_verification_confirm=skip-herbalisti-live-verification'),
  'Deployment runbook should document the live-verification skip acknowledgement phrase',
)
assert(runbook.includes('npm run verify:production-deploy-dry-run'), 'Deployment runbook should document production deploy dry-run verification')
assert(runbook.includes('npm run verify:production-d1-resolver'), 'Deployment runbook should document production D1 resolver verification')
assert(runbook.includes('npm run verify:production-feed-seed'), 'Deployment runbook should document production feed seed verification')
assert(runbook.includes('npm run verify:github-production-dispatch'), 'Deployment runbook should document GitHub production dispatch packet verification')
assert(runbook.includes('npm run verify:github-production-readiness'), 'Deployment runbook should document GitHub production readiness verification')
assert(
  runbook.includes('CLOUDFLARE_API_TOKEN` as a secret') &&
    runbook.includes('CLOUDFLARE_ACCOUNT_ID` as a variable'),
  'Deployment runbook should distinguish the Cloudflare token secret from the account ID variable',
)
assert(
  runbook.includes('npm run verify:github-production-credentials'),
  'Deployment runbook should document GitHub production credential helper verification',
)
assert(
  runbook.includes('npm run verify:github-production-credential-helper'),
  'Deployment runbook should document GitHub production credential helper write-path verification',
)
assert(
  !runbook.includes('required GitHub secret names are configured'),
  'Deployment runbook should not describe all required GitHub production credentials as secrets',
)
assert(runbook.includes('npm run verify:production-state-current'), 'Deployment runbook should document current production state evidence verification')
assert(runbook.includes('npm run verify:production-state'), 'Deployment runbook should document production state snapshot verification')
assert(runbook.includes('npm run verify:cloudflare-token-requirements'), 'Deployment runbook should document Cloudflare token requirement verification')
assert(launchPacket.includes('npm run verify:github-actions'), 'Production launch packet should document GitHub Actions verification')
assert(launchPacket.includes('npm run verify:production-deploy-workflow'), 'Production launch packet should document production deploy workflow verification')
assert(launchPacket.includes('npm run verify:production-deploy-evidence-artifact'), 'Production launch packet should document production deploy evidence artifact readback verification')
assert(
  launchPacket.includes('skip_live_verification_confirm=skip-herbalisti-live-verification'),
  'Production launch packet should document the live-verification skip acknowledgement phrase',
)
assert(launchPacket.includes('npm run verify:production-deploy-dry-run'), 'Production launch packet should document production deploy dry-run verification')
assert(launchPacket.includes('npm run verify:production-d1-resolver'), 'Production launch packet should document production D1 resolver verification')
assert(launchPacket.includes('npm run verify:production-feed-seed'), 'Production launch packet should document production feed seed verification')
assert(launchPacket.includes('npm run verify:github-production-dispatch'), 'Production launch packet should document GitHub production dispatch packet verification')
assert(launchPacket.includes('npm run verify:github-production-readiness'), 'Production launch packet should document GitHub production readiness verification')
assert(launchPacket.includes('npm run verify:production-state-current'), 'Production launch packet should document current production state evidence verification')
assert(launchPacket.includes('npm run verify:production-state'), 'Production launch packet should document production state snapshot verification')
assert(
  launchPacket.includes('npm run verify:github-production-credentials'),
  'Production launch packet should document GitHub production credential helper verification',
)
assert(launchPacket.includes('npm run verify:cloudflare-token-requirements'), 'Production launch packet should document Cloudflare token requirement verification')

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
