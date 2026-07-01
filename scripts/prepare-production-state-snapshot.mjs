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
const markdown = args.has('--markdown')

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
  error: probe.error || probe.parseError || probe.stderr || null,
})

const unique = (items) => [...new Set(items.filter(Boolean))]
const checkItem = (id, status, detail) => ({ id, status, detail })

export const buildProductionStateSnapshot = async ({ generatedAt = new Date().toISOString() } = {}) => {
  const contract = readJson('docs/production-environment-contract.json')
  const completionAudit = exists('docs/objective-completion-audit.json') ? readJson('docs/objective-completion-audit.json') : null
  const provisioning = exists('docs/production-provisioning-readiness.json')
    ? readJson('docs/production-provisioning-readiness.json')
    : null

  const releaseEvidenceProbe = run('github-release-evidence', ['scripts/verify-github-release-evidence.mjs'], {
    timeout: 45000,
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

  const github = githubProbe.data
  const cloudflare = cloudflareProbe.data
  const dns = dnsProbe.data
  const live = liveProbe.data
  const releaseEvidence = releaseEvidenceProbe.data

  const pendingRequirementIds =
    completionAudit?.requirementMatrix
      ?.filter((item) => item.status !== 'pass')
      .map((item) => `${item.id}: ${item.status}`) ?? []
  const githubMissingSecrets = github?.missingSecretNames ?? []
  const cloudflareStatus = cloudflare?.status ?? 'unavailable'
  const dnsStatus = dns?.status ?? 'unavailable'
  const liveStatus = live?.status ?? 'unavailable'

  const blockers = unique([
    ...pendingRequirementIds.map((item) => `Completion audit pending: ${item}.`),
    ...githubMissingSecrets.map((name) => `GitHub production secret name missing: ${name}.`),
    ...(cloudflareStatus === 'ready-for-live-verification' || cloudflareStatus === 'ready-with-cloudflare-warnings'
      ? []
      : [`Cloudflare production state is ${cloudflareStatus}.`]),
    ...(dnsStatus === 'dns-ready-for-pages-custom-domain' ? [] : [`DNS/custom-domain state is ${dnsStatus}.`]),
    ...(liveStatus === 'ready-for-production-verification' ? [] : [`Live domain readiness is ${liveStatus}.`]),
    ...(provisioning?.productionBlockers ?? []).map((item) => `Provisioning blocker: ${item}`),
  ])

  const status = completionAudit?.goalComplete && liveStatus === 'ready-for-production-verification'
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
    safeToRun:
      'Reads local launch artifacts, public DNS, public live-domain responses, GitHub readiness metadata, and read-only Wrangler state only. It does not set secrets, deploy, mutate DNS, create resources, call paid APIs, upload files, download artifacts, or print secret values.',
    project: contract.project,
    git: {
      branch: runGit(['branch', '--show-current']) || null,
      commit: runGit(['rev-parse', 'HEAD']) || null,
      note: 'Commit is the repository HEAD observed when the snapshot was generated; the snapshot artifact itself may be committed afterward.',
    },
    summary: {
      completionAuditStatus: completionAudit?.status ?? 'missing',
      goalComplete: Boolean(completionAudit?.goalComplete),
      localImplementationReady: Boolean(completionAudit?.localImplementationReady),
      pendingRequirementCount: pendingRequirementIds.length,
      releaseEvidenceStatus: releaseEvidenceProbe.data?.status ?? 'unavailable',
      githubProductionReadinessStatus: github?.status ?? 'unavailable',
      githubMissingSecretNames: githubMissingSecrets,
      cloudflareProductionStateStatus: cloudflareStatus,
      wranglerAuthenticated: Boolean(cloudflare?.wrangler?.authenticated),
      dnsCutoverStatus: dnsStatus,
      dnsNameserverProvider: dns?.currentState?.nameserversProvider ?? 'unknown',
      liveReadinessStatus: liveStatus,
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
      ...(completionAudit?.launchReadiness?.nextActions ?? []),
    ]),
    probes: {
      releaseEvidence: {
        summary: summarizeProbe(releaseEvidenceProbe),
        commit: releaseEvidence?.commit ?? null,
        ciRunId: releaseEvidence?.ciRun?.id ?? null,
        manualReleaseRunId: releaseEvidence?.manualReleaseRun?.id ?? null,
        artifactId: releaseEvidence?.artifact?.id ?? null,
      },
      githubProductionReadiness: {
        summary: summarizeProbe(githubProbe),
        environment: github?.environment ?? null,
        protectionRuleCount: github?.productionEnvironment?.protectionRuleCount ?? null,
        branchPolicies: github?.productionEnvironment?.branchPolicies ?? [],
        requiredSecretNames: github?.requiredSecretNames ?? [],
        missingSecretNames: github?.missingSecretNames ?? [],
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
        },
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
    '## Current Summary',
    '',
    `- Git branch: ${packet.git.branch ?? 'unknown'}`,
    `- Git commit: ${packet.git.commit ?? 'unknown'}`,
    `- Git note: ${packet.git.note}`,
    `- Completion audit status: ${packet.summary.completionAuditStatus}`,
    `- Goal complete: ${packet.summary.goalComplete}`,
    `- Local implementation ready: ${packet.summary.localImplementationReady}`,
    `- Pending requirement count: ${packet.summary.pendingRequirementCount}`,
    `- GitHub production readiness: ${packet.summary.githubProductionReadinessStatus}`,
    `- Missing GitHub production secret names: ${packet.summary.githubMissingSecretNames.join(', ') || 'none'}`,
    `- Cloudflare production state: ${packet.summary.cloudflareProductionStateStatus}`,
    `- Wrangler authenticated: ${packet.summary.wranglerAuthenticated}`,
    `- DNS cutover status: ${packet.summary.dnsCutoverStatus}`,
    `- DNS nameserver provider: ${packet.summary.dnsNameserverProvider}`,
    `- Live readiness: ${packet.summary.liveReadinessStatus}`,
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
  lines.push(`- GitHub environment protection rules: ${packet.probes.githubProductionReadiness.protectionRuleCount ?? 'unknown'}`)
  lines.push(`- Cloudflare visible D1 names: ${packet.probes.cloudflareProductionState.visibleState?.d1DatabaseNames?.join(', ') || 'none'}`)
  lines.push(`- Cloudflare visible Pages projects: ${packet.probes.cloudflareProductionState.visibleState?.pagesProjectNames?.join(', ') || 'none'}`)
  lines.push(`- DNS Cloudflare zone ready: ${packet.probes.dnsCutover.cloudflareZoneReady}`)
  lines.push(`- DNS apex record present: ${packet.probes.dnsCutover.apexRecordPresent}`)
  lines.push(`- Live HTTPS status: ${packet.probes.liveReadiness.http.httpsStatus ?? 'unknown'}`)
  lines.push(`- Live health status: ${packet.probes.liveReadiness.http.healthStatus ?? 'unknown'}`)
  lines.push(`- Live health D1 bound: ${packet.probes.liveReadiness.http.healthD1Bound ?? 'unknown'}`)

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
  assert(packet.probes?.githubProductionReadiness, 'Snapshot should include GitHub production readiness probe data')
  assert(packet.probes?.cloudflareProductionState, 'Snapshot should include Cloudflare production state probe data')
  assert(packet.probes?.dnsCutover, 'Snapshot should include DNS cutover probe data')
  assert(packet.probes?.liveReadiness, 'Snapshot should include live readiness probe data')
  assert(storedMarkdown.includes('## Current Summary'), `${outputMarkdownPath} should include a current summary`)
  assert(storedMarkdown.includes('## Blockers'), `${outputMarkdownPath} should include blockers`)
  assert.equal(secretValuePattern.test(`${storedJson}\n${storedMarkdown}`), false, 'Snapshot must not contain secret-looking values')

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
