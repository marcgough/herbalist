import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const args = process.argv.slice(2)
const argSet = new Set(args)
const strict = argSet.has('--strict')
const repository = getArg('--repo', 'marcgough/herbalist')

const secretValuePattern =
  /(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]+|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i

function getArg(name, fallback = '') {
  const index = args.indexOf(name)
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback
}

const scrub = (value) =>
  String(value ?? '')
    .replace(/\u001b\[[0-9;]*m/g, '')
    .replace(secretValuePattern, '[redacted-secret]')
    .trim()

const run = (label, commandArgs, { timeout = 90000 } = {}) => {
  const result = spawnSync(process.execPath, commandArgs, {
    cwd: root,
    encoding: 'utf8',
    timeout,
    env: {
      ...process.env,
      NO_COLOR: '1',
      WRANGLER_SEND_METRICS: 'false',
    },
  })

  const stdout = scrub(result.stdout)
  const stderr = scrub(result.stderr)
  let data = null
  let parseError = ''

  if (stdout) {
    try {
      data = JSON.parse(stdout)
    } catch (error) {
      parseError = error.message
    }
  }

  return {
    label,
    ok: (result.status ?? 1) === 0 && Boolean(data),
    exitCode: result.status ?? (result.error ? 1 : 0),
    timedOut: Boolean(result.error && result.error.code === 'ETIMEDOUT'),
    data,
    error: scrub(result.error?.message ?? ''),
    stderr: stderr.slice(0, 700),
    parseError,
  }
}

const runGit = (gitArgs) => {
  const result = spawnSync('git', gitArgs, { cwd: root, encoding: 'utf8' })
  return result.status === 0 ? scrub(result.stdout) : ''
}

const summarizeProbe = (probe) => ({
  ok: probe.ok,
  exitCode: probe.exitCode,
  timedOut: probe.timedOut,
  status: probe.data?.status ?? 'unavailable',
  error: probe.error || probe.parseError || probe.stderr || null,
})

const check = (id, ok, detail) => ({
  id,
  status: ok ? 'pass' : 'fail',
  detail,
})

const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const currentCommit = runGit(['rev-parse', 'HEAD'])
const dispatchPacket = readJson('docs/github-production-dispatch.json')
const provisioningPacket = readJson('docs/production-provisioning-readiness.json')
const operatorBrief = readJson('docs/production-operator-brief.json')

const releaseEvidence = run(
  'github-release-evidence',
  ['scripts/verify-github-release-evidence.mjs', '--repo', repository, '--commit', currentCommit],
  { timeout: 60000 },
)
const currentProductionState = run('production-state-current', ['scripts/prepare-production-state-snapshot.mjs', '--check-current'], {
  timeout: 180000,
})
const githubReadiness = run(
  'github-production-readiness',
  ['scripts/verify-github-production-readiness.mjs', '--repo', repository, '--environment', 'production', '--skip-release-evidence'],
  { timeout: 60000 },
)
const dispatchCheck = run('github-production-dispatch', ['scripts/prepare-github-production-dispatch.mjs', '--check'], {
  timeout: 60000,
})
const provisioningCheck = run('production-provisioning', ['scripts/prepare-production-provisioning.mjs', '--check'], {
  timeout: 60000,
})
const operatorBriefCheck = run('production-operator-brief', ['scripts/prepare-production-operator-brief.mjs', '--check'], {
  timeout: 60000,
})
const workflowCheck = run('production-deploy-workflow', ['scripts/verify-production-deploy-workflow.mjs'], {
  timeout: 60000,
})
const dnsCutover = run('dns-cutover', ['scripts/prepare-dns-cutover-plan.mjs', '--check'], { timeout: 60000 })

const dispatchStatus = dispatchPacket.status
const dnsTransitionReady = dispatchStatus === 'ready-for-approved-dispatch-dns-transition-only'
const finalDispatchReady = dispatchStatus === 'ready-for-approved-final-dispatch'
const dispatchMode = finalDispatchReady ? 'final-completion' : dnsTransitionReady ? 'dns-transition' : 'unavailable'
const dispatchCommand = finalDispatchReady
  ? dispatchPacket.dispatchInputs?.finalCompletionMode?.command
  : dnsTransitionReady
    ? dispatchPacket.dispatchInputs?.dnsTransitionMode?.command
    : null
const expectedNextAction = finalDispatchReady
  ? 'run-github-production-deploy-workflow-final'
  : dnsTransitionReady
    ? 'run-github-production-deploy-workflow-dns-transition'
    : null

const checks = [
  check('current-git-commit', Boolean(currentCommit), `Current commit is ${currentCommit || 'unavailable'}.`),
  check(
    'release-evidence-current',
    releaseEvidence.ok && releaseEvidence.data?.status === 'pass' && releaseEvidence.data?.commit === currentCommit,
    releaseEvidence.ok
      ? `Fresh CI/manual-release evidence exists for ${releaseEvidence.data.commit}.`
      : 'Fresh CI/manual-release evidence is not available for the current commit.',
  ),
  check(
    'production-state-current',
    currentProductionState.ok &&
      currentProductionState.data?.status === 'pass' &&
      currentProductionState.data?.commit === currentCommit &&
      currentProductionState.data?.releaseEvidenceCommit === currentCommit,
    currentProductionState.ok
      ? `Current production state evidence targets ${currentProductionState.data.commit}.`
      : 'Current production state evidence did not pass for the current commit.',
  ),
  check(
    'github-production-readiness',
    githubReadiness.ok && githubReadiness.data?.status === 'ready-for-guarded-production-dispatch',
    githubReadiness.ok
      ? `GitHub production readiness is ${githubReadiness.data.status}.`
      : 'GitHub production readiness did not return a passing payload.',
  ),
  check(
    'dispatch-packet-fresh',
    dispatchCheck.ok && ['ready-for-approved-dispatch-dns-transition-only', 'ready-for-approved-final-dispatch'].includes(dispatchStatus),
    dispatchCheck.ok ? `Dispatch packet status is ${dispatchStatus}.` : 'Dispatch packet check failed.',
  ),
  check(
    'no-missing-github-credentials',
    (dispatchPacket.missingGitHubCredentialNames ?? []).length === 0 &&
      (provisioningPacket.currentState?.githubProductionMissingCredentialNames ?? []).length === 0,
    'Required GitHub production credential names are present in metadata.',
  ),
  check(
    'provisioning-next-action',
    provisioningCheck.ok &&
      provisioningPacket.status === 'ready-for-approved-production-provisioning' &&
      provisioningPacket.nextApprovedAction === expectedNextAction,
    expectedNextAction
      ? `Provisioning next action is ${provisioningPacket.nextApprovedAction}.`
      : 'No valid dispatch mode is available for provisioning.',
  ),
  check(
    'operator-brief-boundary',
    operatorBriefCheck.ok &&
      operatorBrief.productionComplete === false &&
      operatorBrief.finalCompletionGates?.includes('npm run verify:goal-readiness -- --strict'),
    'Operator brief keeps final completion behind strict live goal-readiness.',
  ),
  check('production-workflow-contract', workflowCheck.ok && workflowCheck.data?.status === 'pass', 'Production workflow contract passes.'),
  check(
    'dns-mode-boundary',
    dnsCutover.ok &&
      ((dnsTransitionReady && dnsCutover.data?.status !== 'dns-ready-for-pages-custom-domain') ||
        (finalDispatchReady && dnsCutover.data?.status === 'dns-ready-for-pages-custom-domain')),
    dnsCutover.ok
      ? `DNS status ${dnsCutover.data.status} matches dispatch mode ${dispatchMode}.`
      : 'DNS cutover packet check failed.',
  ),
  check(
    'dns-transition-not-final',
    !dnsTransitionReady ||
      (dispatchCommand?.includes('skip_live_verification=true') &&
        dispatchCommand?.includes('skip_live_verification_confirm=skip-herbalisti-live-verification') &&
        dispatchPacket.dispatchInputs?.dnsTransitionMode?.completionEvidence?.includes('cannot prove goal completion')),
    'DNS-transition dispatch has explicit skip acknowledgement and non-final completion wording.',
  ),
]

const blockers = checks.filter((item) => item.status !== 'pass')
const status = blockers.length
  ? 'not-ready-for-production-dispatch'
  : finalDispatchReady
    ? 'ready-for-final-production-dispatch'
    : 'ready-for-dns-transition-production-dispatch'

const result = {
  status,
  productionComplete: false,
  repository,
  commit: currentCommit,
  dispatchMode,
  dispatchCommand,
  completionBoundary:
    dispatchMode === 'dns-transition'
      ? 'DNS-transition dispatch can deploy production infrastructure but cannot complete the Herbalisti goal. Final completion still requires deployment evidence artifact readback, strict live readiness, live production smoke, and strict goal-readiness against https://herbalisti.com.'
      : 'Final dispatch is only complete after deployment evidence artifact readback, strict live readiness, live production smoke, and strict goal-readiness all pass against https://herbalisti.com.',
  requiredPostDispatchEvidence:
    'npm run verify:production-deploy-evidence-artifact -- --strict --run-id <production_deploy_run_id>',
  requiredFinalCompletionGates: [
    'npm run verify:production-deploy-evidence-artifact -- --strict --run-id <production_deploy_run_id>',
    'npm run verify:live-readiness -- --strict',
    'npm run verify:production -- https://herbalisti.com',
    'npm run verify:goal-readiness -- --strict',
  ],
  currentEvidence: {
    ciRunId: releaseEvidence.data?.ciRun?.id ?? null,
    manualReleaseRunId: releaseEvidence.data?.manualReleaseRun?.id ?? null,
    visualSmokeArtifactId: releaseEvidence.data?.artifact?.id ?? null,
    visualSmokeArtifactDigest: releaseEvidence.data?.artifact?.digest ?? null,
    releaseEvidenceArtifactId: releaseEvidence.data?.releaseEvidenceArtifact?.id ?? null,
    releaseEvidenceArtifactDigest: releaseEvidence.data?.releaseEvidenceArtifact?.digest ?? null,
    githubProductionReadinessStatus: githubReadiness.data?.status ?? 'unavailable',
    productionStateStatus: currentProductionState.data?.snapshotStatus ?? 'unavailable',
    productionDeployEvidenceArtifactStatus:
      currentProductionState.data?.productionDeployEvidenceArtifactStatus ?? 'unavailable',
    dnsCutoverStatus: dnsCutover.data?.status ?? 'unavailable',
    provisioningStatus: provisioningPacket.status,
    provisioningNextApprovedAction: provisioningPacket.nextApprovedAction,
  },
  checks,
  probes: {
    releaseEvidence: summarizeProbe(releaseEvidence),
    currentProductionState: summarizeProbe(currentProductionState),
    githubReadiness: summarizeProbe(githubReadiness),
    dispatchCheck: summarizeProbe(dispatchCheck),
    provisioningCheck: summarizeProbe(provisioningCheck),
    operatorBriefCheck: summarizeProbe(operatorBriefCheck),
    workflowCheck: summarizeProbe(workflowCheck),
    dnsCutover: summarizeProbe(dnsCutover),
  },
  blockers,
  safeToRun:
    'Reads local packets plus public GitHub release metadata, GitHub production environment metadata, public DNS/live-readiness probes through the production-state verifier, and local workflow contracts. It does not dispatch workflows, deploy, mutate DNS, create Cloudflare resources, set secrets, download artifacts, call paid APIs, or print credential values.',
}

const serialized = JSON.stringify(result, null, 2)
assert(!secretValuePattern.test(serialized), 'Production dispatch preflight must not contain secret-looking values.')

console.log(serialized)

if (strict && blockers.length > 0) {
  process.exitCode = 1
}
