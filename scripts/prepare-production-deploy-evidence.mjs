import assert from 'node:assert/strict'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const outputDirectory = 'output/production-deploy'
const outputJsonPath = `${outputDirectory}/production-deploy-evidence.json`
const outputMarkdownPath = `${outputDirectory}/production-deploy-evidence.md`
const defaultFeedSeedEvidencePath = `${outputDirectory}/feed-seed-evidence.json`
const feedSeedEvidencePath =
  String(process.env.HERBALISTI_FEED_SEED_EVIDENCE_PATH ?? '').trim() || defaultFeedSeedEvidencePath
const artifactName = 'herbalisti-production-deploy-evidence'

const args = new Set(process.argv.slice(2))
const write = args.has('--write') || (!args.has('--check') && !args.has('--markdown'))
const check = args.has('--check')
const markdown = args.has('--markdown')

const secretValuePattern =
  /(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]+|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i

const clean = (value, fallback = null) => {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  return text || fallback
}

const boolFromEnv = (name) => String(process.env[name] ?? '').toLowerCase() === 'true'
const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const readOptionalJson = (path) => {
  const absolutePath = resolve(root, path)
  if (!existsSync(absolutePath)) {
    return null
  }
  return JSON.parse(readFileSync(absolutePath, 'utf8'))
}

const sanitizeFeedSeedEvidence = (evidence) => {
  if (!evidence) {
    return null
  }

  return {
    status: clean(evidence.status, 'unknown'),
    generatedAt: clean(evidence.generatedAt),
    baseUrl: clean(evidence.baseUrl),
    endpoint: clean(evidence.endpoint),
    itemCount: Number(evidence.itemCount ?? 0),
    persisted: Number(evidence.persisted ?? 0),
    refreshRun: evidence.refreshRun
      ? {
          status: clean(evidence.refreshRun.status),
          triggerType: clean(evidence.refreshRun.triggerType),
          itemCount: Number(evidence.refreshRun.itemCount ?? 0),
          startedAt: clean(evidence.refreshRun.startedAt),
          finishedAt: clean(evidence.refreshRun.finishedAt),
        }
      : null,
  }
}

const buildProductionDeployEvidence = ({ generatedAt = new Date().toISOString() } = {}) => {
  const contract = readJson('docs/production-environment-contract.json')
  const repository = clean(process.env.GITHUB_REPOSITORY, 'marcgough/herbalist')
  const runId = clean(process.env.GITHUB_RUN_ID)
  const runAttempt = clean(process.env.GITHUB_RUN_ATTEMPT)
  const runUrl = runId && repository ? `https://github.com/${repository}/actions/runs/${runId}` : null
  const liveVerificationSkipped = boolFromEnv('LIVE_VERIFICATION_SKIPPED')
  const liveVerificationSkipAcknowledged = boolFromEnv('LIVE_VERIFICATION_SKIP_ACKNOWLEDGED')
  const jobStatusAtEvidenceStep = clean(process.env.PRODUCTION_DEPLOY_JOB_STATUS, 'unknown')
  const feedSeedEvidence = sanitizeFeedSeedEvidence(readOptionalJson(feedSeedEvidencePath))
  const feedSeedEvidenceStatus = feedSeedEvidence
    ? 'captured'
    : liveVerificationSkipped
      ? 'skipped-dns-transition'
      : 'pending-live-workflow-seed-result'
  const postDeployEvidenceCommands = contract.commands?.postDeployEvidence ?? [
    'npm run verify:production-deploy-evidence-artifact -- --strict --run-id <production_deploy_run_id>',
  ]
  const requiredLiveVerificationCommands = contract.commands?.liveCompletionGates ?? [
    'npm run verify:live-readiness -- --strict',
    'npm run verify:production -- https://herbalisti.com',
    'npm run verify:goal-readiness -- --strict',
  ]
  const finalCompletionGates = contract.commands?.finalCompletionGates ?? [
    ...postDeployEvidenceCommands,
    ...requiredLiveVerificationCommands,
  ]

  assert(
    !liveVerificationSkipped || liveVerificationSkipAcknowledged,
    'Skipped live verification evidence requires the explicit skip acknowledgement.',
  )
  assert(
    !(
      process.env.GITHUB_ACTIONS === 'true' &&
      !liveVerificationSkipped &&
      jobStatusAtEvidenceStep === 'success' &&
      !feedSeedEvidence
    ),
    `Successful live production deployment evidence requires sanitized feed seed evidence at ${feedSeedEvidencePath}.`,
  )

  return {
    schemaVersion: 1,
    generatedAt,
    status: 'production-deploy-evidence-ready',
    artifact: {
      name: artifactName,
      outputDirectory,
      jsonPath: outputJsonPath,
      markdownPath: outputMarkdownPath,
      retentionDays: 90,
    },
    site: {
      name: 'Herbalisti',
      url: clean(process.env.HERBALISTI_PRODUCTION_URL, 'https://herbalisti.com'),
      customDomain: 'herbalisti.com',
    },
    github: {
      repository,
      workflow: clean(process.env.GITHUB_WORKFLOW, 'Herbalisti Production Deploy'),
      job: clean(process.env.GITHUB_JOB, 'deploy'),
      runId,
      runAttempt,
      runUrl,
      sha: clean(process.env.GITHUB_SHA),
      ref: clean(process.env.GITHUB_REF),
      refName: clean(process.env.GITHUB_REF_NAME),
      actor: clean(process.env.GITHUB_ACTOR),
    },
    deployment: {
      environment: 'production',
      pagesProject: 'herbalisti',
      newsWorker: 'herbalisti-news-refresh',
      d1Database: 'herbalisti',
      jobStatusAtEvidenceStep,
      liveVerificationSkipped,
      liveVerificationSkipAcknowledged,
      liveVerificationMode: liveVerificationSkipped ? 'dns-transition-skip' : 'strict-live-verification',
      feedSeedEvidence: {
        status: feedSeedEvidenceStatus,
        path: feedSeedEvidencePath,
        summary: feedSeedEvidence,
      },
      completionEvidence: liveVerificationSkipped
        ? 'Not complete: production deploy evidence artifact readback and strict live verification against https://herbalisti.com remain required after DNS is connected.'
        : 'Not complete until this workflow run succeeds, this evidence artifact is uploaded and read back, and strict live verification passes.',
      postDeployEvidenceCommands,
      requiredLiveVerificationCommands,
      finalCompletionGates,
    },
    safety: {
      includesSecretValues: false,
      notes: [
        'This packet records workflow, domain, and verification metadata only.',
        'It does not read or write admin tokens, provider keys, Cloudflare API tokens, or GitHub tokens.',
      ],
    },
  }
}

const renderMarkdown = (evidence) => [
  '# Herbalisti Production Deploy Evidence',
  '',
  `Generated: ${evidence.generatedAt}`,
  '',
  `- Site: ${evidence.site.url}`,
  `- Environment: ${evidence.deployment.environment}`,
  `- GitHub run: ${evidence.github.runUrl ?? 'unavailable'}`,
  `- Commit: ${evidence.github.sha ?? 'unavailable'}`,
  `- Workflow: ${evidence.github.workflow}`,
  `- Job status at evidence step: ${evidence.deployment.jobStatusAtEvidenceStep}`,
  `- Live verification mode: ${evidence.deployment.liveVerificationMode}`,
  `- Feed seed evidence: ${evidence.deployment.feedSeedEvidence.status}`,
  `- Feed seed evidence path: ${evidence.deployment.feedSeedEvidence.path}`,
  '',
  '## Feed Seed Evidence',
  '',
  evidence.deployment.feedSeedEvidence.summary
    ? `The protected feed seed result was captured with ${evidence.deployment.feedSeedEvidence.summary.itemCount} item(s), ${evidence.deployment.feedSeedEvidence.summary.persisted} persisted record(s), and refresh status \`${evidence.deployment.feedSeedEvidence.summary.refreshRun?.status ?? 'unknown'}\`.`
    : evidence.deployment.liveVerificationSkipped
      ? 'Feed seed evidence was skipped because this production run is in DNS-transition mode. The live feed must be seeded and verified after DNS is connected.'
      : 'Feed seed evidence is pending until the guarded production workflow seeds the protected live feed.',
  '',
  '## Completion Boundary',
  '',
  evidence.deployment.completionEvidence,
  '',
  'Required post-deploy evidence readback:',
  '',
  ...evidence.deployment.postDeployEvidenceCommands.map((command) => `- \`${command}\``),
  '',
  'Required live verification commands:',
  '',
  ...evidence.deployment.requiredLiveVerificationCommands.map((command) => `- \`${command}\``),
  '',
  'Final completion gates:',
  '',
  ...evidence.deployment.finalCompletionGates.map((command) => `- \`${command}\``),
  '',
  '## Safety',
  '',
  'This evidence packet is intentionally non-secret. It records only workflow metadata and completion boundaries.',
  '',
].join('\n')

const evidence = buildProductionDeployEvidence()
const json = `${JSON.stringify(evidence, null, 2)}\n`
const md = renderMarkdown(evidence)

assert(!secretValuePattern.test(json), 'Production deploy evidence JSON must not contain literal secret values.')
assert(!secretValuePattern.test(md), 'Production deploy evidence Markdown must not contain literal secret values.')
assert(evidence.artifact.name === artifactName, 'Production deploy evidence artifact name is stable.')
assert(evidence.site.url === 'https://herbalisti.com', 'Production deploy evidence must target herbalisti.com.')
assert(
  evidence.deployment.feedSeedEvidence.path === feedSeedEvidencePath,
  'Production deploy evidence should carry the sanitized feed seed evidence path.',
)
assert(
  evidence.deployment.finalCompletionGates.includes(
    'npm run verify:production-deploy-evidence-artifact -- --strict --run-id <production_deploy_run_id>',
  ),
  'Production deploy evidence should include post-deploy evidence artifact readback in final completion gates.',
)
for (const command of evidence.deployment.requiredLiveVerificationCommands) {
  assert(
    evidence.deployment.finalCompletionGates.includes(command),
    `Production deploy evidence should include live verification gate in final completion gates: ${command}`,
  )
}

if (check) {
  console.log(
    JSON.stringify(
      {
        status: 'pass',
        artifactName,
        outputDirectory,
        liveVerificationMode: evidence.deployment.liveVerificationMode,
        feedSeedEvidenceStatus: evidence.deployment.feedSeedEvidence.status,
        feedSeedEvidencePath: evidence.deployment.feedSeedEvidence.path,
        finalCompletionGates: evidence.deployment.finalCompletionGates,
        safeToRun:
          'This verifier builds a non-secret deployment evidence packet in memory only. It does not deploy, mutate DNS, create resources, set secrets, call paid APIs, or print secret values.',
      },
      null,
      2,
    ),
  )
} else if (markdown) {
  console.log(md)
} else if (write) {
  mkdirSync(resolve(root, outputDirectory), { recursive: true })
  writeFileSync(resolve(root, outputJsonPath), json)
  writeFileSync(resolve(root, outputMarkdownPath), md)
  console.log(
    JSON.stringify(
      {
        status: 'written',
        artifactName,
        files: [outputJsonPath, outputMarkdownPath],
        safeToRun:
          'This command writes non-secret deployment evidence only. It does not deploy, mutate DNS, create resources, set secrets, call paid APIs, or print secret values.',
      },
      null,
      2,
    ),
  )
}
