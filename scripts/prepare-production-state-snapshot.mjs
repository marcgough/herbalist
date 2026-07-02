import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const outputJsonPath = 'docs/production-state-snapshot.json'
const outputMarkdownPath = 'docs/production-state-snapshot.md'

const args = new Set(process.argv.slice(2))
const write = args.has('--write')
const check = args.has('--check')
const checkCurrent = args.has('--check-current')
const markdown = args.has('--markdown')

assert(
  [check, checkCurrent].filter(Boolean).length <= 1,
  'Use only one verification mode: --check or --check-current.',
)

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const readJson = (path) => JSON.parse(read(path))
const exists = (path) => existsSync(resolve(root, path))

const secretValuePattern =
  /(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]+|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i

const scrub = (value) =>
  String(value ?? '')
    .replace(/\u001b\[[0-9;]*m/g, '')
    .replace(/sk-[A-Za-z0-9_-]{20,}/gi, '[redacted-secret]')
    .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/gi, '[redacted-token]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted-token]')
    .replace(/-----BEGIN [A-Z ]+PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+PRIVATE KEY-----/gi, '[redacted-private-key]')
    .trim()

const run = (label, commandArgs, { timeout = 60000 } = {}) => {
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
  const status = result.status ?? (result.error ? 1 : 0)
  let parsed = null
  let parseError = ''

  if (stdout) {
    try {
      parsed = JSON.parse(stdout)
    } catch (error) {
      parseError = error.message
    }
  }

  return {
    label,
    ok: status === 0 && Boolean(parsed),
    exitCode: status,
    timedOut: Boolean(result.error && result.error.code === 'ETIMEDOUT'),
    data: parsed,
    error: result.error?.message ? scrub(result.error.message) : '',
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
  error: compactProbeError(probe),
})

const unique = (items) => [...new Set(items.filter(Boolean))]
const checkItem = (id, status, detail) => ({ id, status, detail })

const compactProbeError = (probe) => {
  const text = probe.error || probe.parseError || probe.stderr || ''
  if (!text) return null
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  const errorLine =
    lines.find((line) => line.startsWith('Error:')) ??
    lines.find((line) => !line.startsWith('file://') && !line.startsWith('at ') && !line.startsWith('^')) ??
    lines[0] ??
    text
  return errorLine.slice(0, 500)
}

export const buildProductionStateSnapshot = async ({ generatedAt = new Date().toISOString() } = {}) => {
  const contract = readJson('docs/production-environment-contract.json')
  const completionAudit = exists('docs/objective-completion-audit.json') ? readJson('docs/objective-completion-audit.json') : null
  const provisioning = exists('docs/production-provisioning-readiness.json')
    ? readJson('docs/production-provisioning-readiness.json')
    : null
  const branch = runGit(['branch', '--show-current']) || null
  const commit = runGit(['rev-parse', 'HEAD']) || null

  const releaseEvidenceArgs = ['scripts/verify-github-release-evidence.mjs']
  if (commit) {
    releaseEvidenceArgs.push('--commit', commit)
  }

  const releaseEvidenceProbe = run('github-release-evidence', releaseEvidenceArgs, {
    timeout: 45000,
  })
  const deployEvidenceArtifactArgs = ['scripts/verify-production-deploy-evidence-artifact.mjs']
  if (commit) {
    deployEvidenceArtifactArgs.push('--commit', commit)
  }

  const deployEvidenceArtifactProbe = run('production-deploy-evidence-artifact', deployEvidenceArtifactArgs, {
    timeout: 60000,
  })
  const githubProbe = run(
    'github-production-readiness',
    ['scripts/verify-github-production-readiness.mjs', '--skip-release-evidence'],
    { timeout: 45000 },
  )
  const cloudflareProbe = run('cloudflare-production-state', ['scripts/verify-cloudflare-production-state.mjs'], {
    timeout: 45000,
  })
  const dnsProbe = run('dns-cutover-plan', ['scripts/prepare-dns-cutover-plan.mjs'], { timeout: 45000 })
  const liveProbe = run('live-readiness', ['scripts/verify-live-readiness.mjs'], { timeout: 45000 })
  const productionSmokeProbe = run('production-smoke', ['scripts/verify-production.mjs', 'https://herbalisti.com'], {
    timeout: 90000,
  })

  const github = githubProbe.data
  const cloudflare = cloudflareProbe.data
  const dns = dnsProbe.data
  const live = liveProbe.data
  const productionSmoke = productionSmokeProbe.data
  const releaseEvidence = releaseEvidenceProbe.data

  const pendingRequirementIds =
    completionAudit?.requirementMatrix
      ?.filter((item) => item.status !== 'pass')
      .map((item) => `${item.id}: ${item.status}`) ?? []
  const githubMissingSecrets = github?.missingSecretNames ?? []
  const githubMissingVariables = github?.missingVariableNames ?? []
  const githubMissingCredentials = github?.missingCredentialNames ?? [...githubMissingSecrets, ...githubMissingVariables]
  const cloudflareStatus = cloudflare?.status ?? 'unavailable'
  const dnsStatus = dns?.status ?? 'unavailable'
  const liveStatus = live?.status ?? 'unavailable'
  const productionSmokeStatus = productionSmoke?.status ?? 'unavailable'
  const deployEvidenceArtifactStatus = deployEvidenceArtifactProbe.data?.status ?? 'unavailable'
  const finalCompletionGates = contract.commands?.finalCompletionGates ?? []

  const blockers = unique([
    ...pendingRequirementIds.map((item) => `Completion audit pending: ${item}.`),
    ...(deployEvidenceArtifactStatus === 'pass'
      ? []
      : [`Production deploy evidence artifact readback is ${deployEvidenceArtifactStatus}.`]),
    ...githubMissingCredentials.map((name) => `GitHub production credential missing: ${name}.`),
    ...(cloudflareStatus === 'ready-for-live-verification' || cloudflareStatus === 'ready-with-cloudflare-warnings'
      ? []
      : [`Cloudflare production state is ${cloudflareStatus}.`]),
    ...(dnsStatus === 'dns-ready-for-pages-custom-domain' ? [] : [`DNS/custom-domain state is ${dnsStatus}.`]),
    ...(liveStatus === 'ready-for-production-verification' ? [] : [`Live domain readiness is ${liveStatus}.`]),
    ...(productionSmokeStatus === 'pass' ? [] : [`Live production smoke verification is ${productionSmokeStatus}.`]),
    ...(provisioning?.productionBlockers ?? []).map((item) => `Provisioning blocker: ${item}`),
  ])

  const productionEvidenceComplete =
    completionAudit?.goalComplete &&
    liveStatus === 'ready-for-production-verification' &&
    productionSmokeStatus === 'pass' &&
    deployEvidenceArtifactStatus === 'pass'

  const status = productionEvidenceComplete
    ? 'complete'
    : completionAudit?.localImplementationReady
      ? 'local-ready-production-pending'
      : 'incomplete'

  const checks = [
    checkItem(
      'completion-audit-loaded',
      completionAudit ? 'pass' : 'warning',
      completionAudit ? `Completion audit status is ${completionAudit.status}.` : 'Completion audit artifact is missing.',
    ),
    checkItem(
      'github-release-evidence-captured',
      releaseEvidenceProbe.ok ? 'pass' : 'warning',
      releaseEvidenceProbe.ok
        ? `Release evidence is ${releaseEvidence.status} for ${releaseEvidence.commit}.`
        : 'Release evidence probe did not return a current JSON payload.',
    ),
    checkItem(
      'production-deploy-evidence-artifact-captured',
      deployEvidenceArtifactProbe.ok ? 'pass' : 'warning',
      deployEvidenceArtifactProbe.ok
        ? `Production deploy evidence artifact status is ${deployEvidenceArtifactStatus}.`
        : 'Production deploy evidence artifact probe did not return a current JSON payload.',
    ),
    checkItem(
      'github-production-readiness-captured',
      githubProbe.ok ? 'pass' : 'warning',
      githubProbe.ok
        ? `GitHub production readiness status is ${github.status}.`
        : 'GitHub production readiness probe did not return a current JSON payload.',
    ),
    checkItem(
      'cloudflare-production-state-captured',
      cloudflareProbe.ok ? 'pass' : 'warning',
      cloudflareProbe.ok
        ? `Cloudflare production state is ${cloudflare.status}.`
        : 'Cloudflare production state probe did not return a current JSON payload.',
    ),
    checkItem(
      'dns-cutover-state-captured',
      dnsProbe.ok ? 'pass' : 'warning',
      dnsProbe.ok ? `DNS cutover status is ${dns.status}.` : 'DNS cutover probe did not return a current JSON payload.',
    ),
    checkItem(
      'live-readiness-captured',
      liveProbe.ok ? 'pass' : 'warning',
      liveProbe.ok ? `Live readiness status is ${live.status}.` : 'Live readiness probe did not return a current JSON payload.',
    ),
    checkItem(
      'production-smoke-captured',
      productionSmokeProbe.ok ? 'pass' : 'warning',
      productionSmokeProbe.ok
        ? `Live production smoke status is ${productionSmoke.status}.`
        : 'Live production smoke probe did not return a current JSON payload.',
    ),
    checkItem(
      'secret-value-boundary',
      'pass',
      'Snapshot stores secret names and readiness status only; no secret values are required or printed.',
    ),
  ]

  return {
    version: 1,
    generatedAt,
    status,
    productionComplete: status === 'complete',
    completionBoundary:
      'Production is complete only when the deployment evidence artifact, strict live readiness, live production smoke, and goal-readiness gates all pass against the live herbalisti.com deployment.',
    finalCompletionGates,
    safeToRun:
      'Reads local launch artifacts, public DNS, public live-domain responses, GitHub release/deploy artifact metadata, the selected no-secret release evidence artifact content, and read-only Wrangler state only. It does not set secrets, deploy, mutate DNS, create resources, call paid APIs, upload files, or print secret values.',
    project: contract.project,
    git: {
      branch,
      commit,
      note:
        'Stored snapshot evidence is generated before the artifact commit lands, so this commit can trail repository HEAD. Use npm run verify:production-state-current for exact current-commit release evidence.',
    },
    summary: {
      completionAuditStatus: completionAudit?.status ?? 'missing',
      goalComplete: Boolean(completionAudit?.goalComplete),
      localImplementationReady: Boolean(completionAudit?.localImplementationReady),
      pendingRequirementCount: pendingRequirementIds.length,
      releaseEvidenceStatus: releaseEvidenceProbe.data?.status ?? 'unavailable',
      productionDeployEvidenceArtifactStatus: deployEvidenceArtifactStatus,
      githubProductionReadinessStatus: github?.status ?? 'unavailable',
      githubMissingSecretNames: githubMissingSecrets,
      githubMissingVariableNames: githubMissingVariables,
      githubMissingCredentialNames: githubMissingCredentials,
      cloudflareProductionStateStatus: cloudflareStatus,
      wranglerAuthenticated: Boolean(cloudflare?.wrangler?.authenticated),
      dnsCutoverStatus: dnsStatus,
      dnsNameserverProvider: dns?.currentState?.nameserversProvider ?? 'unknown',
      liveReadinessStatus: liveStatus,
      productionSmokeStatus,
      finalCompletionGateCount: finalCompletionGates.length,
      productionProvisioningStatus: provisioning?.status ?? 'missing',
      blockerCount: blockers.length,
    },
    checks,
    blockers,
    nextActions: unique([
      ...(github?.nextActions ?? []),
      ...(cloudflare?.nextActions ?? []),
      ...(dns?.nextActions ?? []),
      ...(live?.nextActions ?? []),
      ...(deployEvidenceArtifactStatus === 'pass'
        ? []
        : [
            deployEvidenceArtifactProbe.data?.strictCompletionCommand ||
              'npm run verify:production-deploy-evidence-artifact -- --strict --run-id <production_deploy_run_id>',
          ]),
      ...(productionSmokeStatus === 'pass' ? [] : ['npm run verify:production -- https://herbalisti.com']),
      ...(completionAudit?.launchReadiness?.nextActions ?? []),
    ]),
    probes: {
      releaseEvidence: {
        summary: summarizeProbe(releaseEvidenceProbe),
        commit: releaseEvidence?.commit ?? null,
        ciRunId: releaseEvidence?.ciRun?.id ?? null,
        manualReleaseRunId: releaseEvidence?.manualReleaseRun?.id ?? null,
        artifactId: releaseEvidence?.artifact?.id ?? null,
        releaseEvidenceArtifactId: releaseEvidence?.releaseEvidenceArtifact?.id ?? null,
        releaseEvidenceArtifactDigest: releaseEvidence?.releaseEvidenceArtifact?.digest ?? null,
        releaseEvidenceArtifactContent: releaseEvidence?.releaseEvidenceArtifactContent ?? null,
      },
      productionDeployEvidenceArtifact: {
        summary: summarizeProbe(deployEvidenceArtifactProbe),
        runId: deployEvidenceArtifactProbe.data?.run?.id ?? null,
        artifactId: deployEvidenceArtifactProbe.data?.artifact?.id ?? null,
        artifactDigest: deployEvidenceArtifactProbe.data?.artifact?.digest ?? null,
        strictCompletionCommand: deployEvidenceArtifactProbe.data?.strictCompletionCommand ?? null,
        detail: deployEvidenceArtifactProbe.data?.detail ?? null,
      },
      githubProductionReadiness: {
        summary: summarizeProbe(githubProbe),
        environment: github?.environment ?? null,
        protectionRuleCount: github?.productionEnvironment?.protectionRuleCount ?? null,
        branchPolicies: github?.productionEnvironment?.branchPolicies ?? [],
        requiredSecretNames: github?.requiredSecretNames ?? [],
        requiredVariableNames: github?.requiredVariableNames ?? [],
        requiredCredentialNames: github?.requiredCredentialNames ?? [],
        missingSecretNames: github?.missingSecretNames ?? [],
        missingVariableNames: github?.missingVariableNames ?? [],
        missingCredentialNames: github?.missingCredentialNames ?? [],
      },
      cloudflareProductionState: {
        summary: summarizeProbe(cloudflareProbe),
        wrangler: cloudflare?.wrangler ?? null,
        visibleState: cloudflare?.visibleState ?? null,
      },
      dnsCutover: {
        summary: summarizeProbe(dnsProbe),
        provider: dns?.currentState?.nameserversProvider ?? null,
        cloudflareZoneReady: dns?.currentState?.cloudflareZoneReady ?? null,
        apexRecordPresent: dns?.currentState?.apexRecordPresent ?? null,
        caaReadyForCloudflareCertificate: dns?.currentState?.caaReadyForCloudflareCertificate ?? null,
      },
      liveReadiness: {
        summary: summarizeProbe(liveProbe),
        dns: {
          aRecords: live?.dns?.a?.records ?? [],
          aaaaRecords: live?.dns?.aaaa?.records ?? [],
          cnameRecords: live?.dns?.cname?.records ?? [],
          nsRecords: live?.dns?.ns?.records ?? [],
        },
        http: {
          httpsStatus: live?.http?.httpsHomepage?.status ?? null,
          httpRedirectStatus: live?.http?.httpRedirect?.status ?? null,
          wwwRedirectStatus: live?.http?.wwwRedirect?.status ?? null,
          healthStatus: live?.http?.health?.status ?? null,
          healthD1Bound: live?.http?.health?.d1Bound ?? null,
          protectedFeatures: live?.http?.health?.protectedFeatures ?? null,
          feedRefreshFreshness: live?.http?.feedRefreshFreshness ?? null,
          requiredPublicSurfaces: live?.http?.requiredPublicSurfaces ?? null,
          publicSurfaces: live?.http?.publicSurfaces ?? null,
        },
      },
      productionSmoke: {
        summary: summarizeProbe(productionSmokeProbe),
        baseUrl: productionSmoke?.baseUrl ?? 'https://herbalisti.com/',
        checks: productionSmoke?.checks ?? null,
      },
    },
  }
}

export const renderProductionStateMarkdown = (packet) => {
  const lines = [
    '# Herbalisti Production State Snapshot',
    '',
    `Generated: ${packet.generatedAt}`,
    '',
    `Status: ${packet.status}`,
    '',
    packet.safeToRun,
    '',
    '## Project',
    '',
    `- Domain: ${packet.project.domain}`,
    `- Cloudflare Pages project: ${packet.project.pagesProject}`,
    `- D1 database: ${packet.project.d1Database}`,
    `- News Worker: ${packet.project.newsWorker}`,
    '',
    '## Stored Snapshot Summary',
    '',
    `- Git branch: ${packet.git.branch ?? 'unknown'}`,
    `- Observed git commit at generation time: ${packet.git.commit ?? 'unknown'}`,
    `- Git note: ${packet.git.note}`,
    `- Completion audit status: ${packet.summary.completionAuditStatus}`,
    `- Goal complete: ${packet.summary.goalComplete}`,
    `- Local implementation ready: ${packet.summary.localImplementationReady}`,
    `- Pending requirement count: ${packet.summary.pendingRequirementCount}`,
    `- Production deploy evidence artifact: ${packet.summary.productionDeployEvidenceArtifactStatus}`,
    `- GitHub production readiness: ${packet.summary.githubProductionReadinessStatus}`,
    `- Missing GitHub production credential names: ${packet.summary.githubMissingCredentialNames.join(', ') || 'none'}`,
    `- Cloudflare production state: ${packet.summary.cloudflareProductionStateStatus}`,
    `- Wrangler authenticated: ${packet.summary.wranglerAuthenticated}`,
    `- DNS cutover status: ${packet.summary.dnsCutoverStatus}`,
    `- DNS nameserver provider: ${packet.summary.dnsNameserverProvider}`,
    `- Live readiness: ${packet.summary.liveReadinessStatus}`,
    `- Live production smoke: ${packet.summary.productionSmokeStatus}`,
    `- Final completion gates: ${packet.summary.finalCompletionGateCount}`,
    `- Production provisioning status: ${packet.summary.productionProvisioningStatus}`,
    `- Blocker count: ${packet.summary.blockerCount}`,
    '',
    '## Checks',
    '',
  ]

  for (const item of packet.checks) {
    lines.push(`- ${item.status}: ${item.detail}`)
  }

  lines.push('', '## Blockers', '')
  if (packet.blockers.length) {
    for (const blocker of packet.blockers) {
      lines.push(`- ${blocker}`)
    }
  } else {
    lines.push('- No blockers are visible in the snapshot.')
  }

  lines.push('', '## Probe Details', '')
  lines.push(`- Release evidence: ${packet.probes.releaseEvidence.summary.status}`)
  lines.push(`- CI run ID: ${packet.probes.releaseEvidence.ciRunId ?? 'unknown'}`)
  lines.push(`- Manual release run ID: ${packet.probes.releaseEvidence.manualReleaseRunId ?? 'unknown'}`)
  lines.push(`- Visual smoke artifact ID: ${packet.probes.releaseEvidence.artifactId ?? 'unknown'}`)
  lines.push(`- Release evidence artifact ID: ${packet.probes.releaseEvidence.releaseEvidenceArtifactId ?? 'unknown'}`)
  lines.push(`- Release evidence artifact digest: ${packet.probes.releaseEvidence.releaseEvidenceArtifactDigest ?? 'unknown'}`)
  if (packet.probes.releaseEvidence.releaseEvidenceArtifactContent) {
    const content = packet.probes.releaseEvidence.releaseEvidenceArtifactContent
    lines.push(`- Release evidence content: ${content.status}`)
    lines.push(`- Release Signals items: ${content.itemCount}`)
    lines.push(`- Release Signals topic coverage: ${content.topicCoveragePercent}%`)
    lines.push(`- Release Signals sources: ${content.sources?.join(', ') || 'unknown'}`)
  }
  lines.push(`- Production deploy evidence artifact: ${packet.probes.productionDeployEvidenceArtifact.summary.status}`)
  lines.push(`- Production deploy run ID: ${packet.probes.productionDeployEvidenceArtifact.runId ?? 'pending'}`)
  lines.push(`- Production deploy evidence artifact ID: ${packet.probes.productionDeployEvidenceArtifact.artifactId ?? 'pending'}`)
  lines.push(
    `- Production deploy evidence artifact digest: ${
      packet.probes.productionDeployEvidenceArtifact.artifactDigest ?? 'pending'
    }`,
  )
  lines.push(`- GitHub environment protection rules: ${packet.probes.githubProductionReadiness.protectionRuleCount ?? 'unknown'}`)
  lines.push(`- Cloudflare visible D1 names: ${packet.probes.cloudflareProductionState.visibleState?.d1DatabaseNames?.join(', ') || 'none'}`)
  lines.push(`- Cloudflare visible Pages projects: ${packet.probes.cloudflareProductionState.visibleState?.pagesProjectNames?.join(', ') || 'none'}`)
  lines.push(`- DNS Cloudflare zone ready: ${packet.probes.dnsCutover.cloudflareZoneReady}`)
  lines.push(`- DNS apex record present: ${packet.probes.dnsCutover.apexRecordPresent}`)
  lines.push(`- Live HTTPS status: ${packet.probes.liveReadiness.http.httpsStatus ?? 'unknown'}`)
  lines.push(`- Live health status: ${packet.probes.liveReadiness.http.healthStatus ?? 'unknown'}`)
  lines.push(`- Live health D1 bound: ${packet.probes.liveReadiness.http.healthD1Bound ?? 'unknown'}`)
  lines.push(`- Live production smoke: ${packet.probes.productionSmoke.summary.status}`)
  lines.push(
    `- Live public surface checks: ${
      packet.probes.liveReadiness.http.requiredPublicSurfaces
        ? Object.entries(packet.probes.liveReadiness.http.requiredPublicSurfaces)
            .map(([key, value]) => `${key}=${value}`)
            .join(', ')
        : 'unknown'
    }`,
  )

  lines.push('', '## Next Actions', '')
  for (const action of packet.nextActions) {
    lines.push(`- ${action}`)
  }
  lines.push('')

  return lines.join('\n')
}

const validateStoredSnapshot = () => {
  assert(exists(outputJsonPath), `${outputJsonPath} should exist`)
  assert(exists(outputMarkdownPath), `${outputMarkdownPath} should exist`)
  const storedJson = read(outputJsonPath)
  const storedMarkdown = read(outputMarkdownPath)
  const packet = JSON.parse(storedJson)

  assert.equal(packet.version, 1, `${outputJsonPath} should be version 1`)
  assert.equal(packet.project?.domain, 'herbalisti.com', `${outputJsonPath} should target herbalisti.com`)
  assert(['complete', 'local-ready-production-pending', 'incomplete'].includes(packet.status), 'Snapshot status should be known')
  assert(packet.safeToRun?.includes('does not set secrets'), 'Snapshot should state the no-secret/no-deploy boundary')
  assert(packet.summary && typeof packet.summary.blockerCount === 'number', 'Snapshot should include a summary with blocker count')
  assert(
    typeof packet.summary.productionDeployEvidenceArtifactStatus === 'string',
    'Snapshot should include production deploy evidence artifact status',
  )
  assert(packet.probes?.githubProductionReadiness, 'Snapshot should include GitHub production readiness probe data')
  assert(
    packet.probes?.productionDeployEvidenceArtifact,
    'Snapshot should include production deploy evidence artifact probe data',
  )
  assert(packet.probes?.cloudflareProductionState, 'Snapshot should include Cloudflare production state probe data')
  assert(packet.probes?.dnsCutover, 'Snapshot should include DNS cutover probe data')
  assert(packet.probes?.liveReadiness, 'Snapshot should include live readiness probe data')
  assert(packet.probes?.productionSmoke, 'Snapshot should include live production smoke probe data')
  assert(
    packet.finalCompletionGates?.includes('npm run verify:production -- https://herbalisti.com'),
    'Snapshot should include the live production smoke final completion gate',
  )
  assert(storedMarkdown.includes('## Stored Snapshot Summary'), `${outputMarkdownPath} should include a stored snapshot summary`)
  assert(storedMarkdown.includes('## Blockers'), `${outputMarkdownPath} should include blockers`)
  assert.equal(secretValuePattern.test(`${storedJson}\n${storedMarkdown}`), false, 'Snapshot must not contain secret-looking values')

  return packet
}

const validateCurrentSnapshot = (packet) => {
  const currentCommit = runGit(['rev-parse', 'HEAD']) || null
  const serialized = JSON.stringify(packet, null, 2)
  const rendered = renderProductionStateMarkdown(packet)

  assert(currentCommit, 'Current git commit should be available')
  assert.equal(packet.git?.commit, currentCommit, 'Generated production state should target the current git commit')
  assert.equal(
    packet.probes?.releaseEvidence?.summary?.ok,
    true,
    'Current production state should include successful GitHub release evidence',
  )
  assert.equal(
    packet.probes?.releaseEvidence?.summary?.status,
    'pass',
    'Current production state release evidence should pass',
  )
  assert.equal(
    packet.probes?.releaseEvidence?.commit,
    currentCommit,
    'GitHub release evidence should match the current git commit',
  )
  assert(packet.probes.releaseEvidence.ciRunId, 'Current release evidence should include a CI run ID')
  assert(packet.probes.releaseEvidence.manualReleaseRunId, 'Current release evidence should include a manual release run ID')
  assert(packet.probes.releaseEvidence.artifactId, 'Current release evidence should include a visual smoke artifact ID')
  assert(
    packet.probes.releaseEvidence.releaseEvidenceArtifactId,
    'Current release evidence should include a release evidence artifact ID',
  )
  assert.equal(
    packet.probes?.productionDeployEvidenceArtifact?.summary?.ok,
    true,
    'Current production state should include production deploy evidence artifact readback status',
  )
  assert(
    ['pass', 'pending-production-deploy-evidence-artifact'].includes(
      packet.probes.productionDeployEvidenceArtifact.summary.status,
    ),
    'Current production deploy evidence artifact status should be pass or pending-production-deploy-evidence-artifact',
  )
  if (packet.productionComplete) {
    assert.equal(
      packet.probes.productionDeployEvidenceArtifact.summary.status,
      'pass',
      'Complete production state requires production deploy evidence artifact readback to pass',
    )
    assert.equal(
      packet.summary.liveReadinessStatus,
      'ready-for-production-verification',
      'Complete production state requires strict live readiness to pass',
    )
    assert.equal(
      packet.probes.productionSmoke.summary.status,
      'pass',
      'Complete production state requires live production smoke verification to pass',
    )
  }
  assert.equal(secretValuePattern.test(`${serialized}\n${rendered}`), false, 'Current snapshot must not contain secret-looking values')

  return packet
}

if (check) {
  const packet = validateStoredSnapshot()
  console.log(
    JSON.stringify(
      {
        status: 'pass',
        snapshotStatus: packet.status,
        generatedAt: packet.generatedAt,
        blockerCount: packet.summary.blockerCount,
        safeToRun:
          'Reads committed snapshot artifacts only. It does not call GitHub, Cloudflare, DNS, production URLs, paid APIs, or print secret values.',
      },
      null,
      2,
    ),
  )
} else if (checkCurrent) {
  const packet = validateCurrentSnapshot(await buildProductionStateSnapshot())
  console.log(
    JSON.stringify(
      {
        status: 'pass',
        snapshotStatus: packet.status,
        commit: packet.git.commit,
        releaseEvidenceCommit: packet.probes.releaseEvidence.commit,
        ciRunId: packet.probes.releaseEvidence.ciRunId,
        manualReleaseRunId: packet.probes.releaseEvidence.manualReleaseRunId,
        artifactId: packet.probes.releaseEvidence.artifactId,
        releaseEvidenceArtifactId: packet.probes.releaseEvidence.releaseEvidenceArtifactId,
        releaseEvidenceArtifactDigest: packet.probes.releaseEvidence.releaseEvidenceArtifactDigest,
        productionDeployEvidenceArtifactStatus: packet.probes.productionDeployEvidenceArtifact.summary.status,
        productionDeployRunId: packet.probes.productionDeployEvidenceArtifact.runId,
        productionDeployEvidenceArtifactId: packet.probes.productionDeployEvidenceArtifact.artifactId,
        productionSmokeStatus: packet.probes.productionSmoke.summary.status,
        safeToRun:
          'Regenerates the production state in memory for the current git commit, checks public GitHub release/deploy metadata, inspects the selected no-secret release evidence artifact content, and probes public live-domain readiness plus production smoke. It does not write files, deploy, mutate DNS, create resources, call paid APIs, or print secret values.',
      },
      null,
      2,
    ),
  )
} else {
  const packet = await buildProductionStateSnapshot()
  const jsonOutput = `${JSON.stringify(packet, null, 2)}\n`
  const markdownOutput = renderProductionStateMarkdown(packet)

  assert.equal(secretValuePattern.test(`${jsonOutput}\n${markdownOutput}`), false, 'Snapshot must not contain secret-looking values')

  if (write) {
    writeFileSync(resolve(root, outputJsonPath), jsonOutput)
    writeFileSync(resolve(root, outputMarkdownPath), markdownOutput)
  }

  console.log(markdown ? markdownOutput : jsonOutput)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href && check) {
  validateStoredSnapshot()
}
