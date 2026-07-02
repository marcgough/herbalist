import assert from 'node:assert/strict'
import {
  buildCheck,
  deriveGithubProductionDispatchStatus,
  githubProductionDispatchInputs,
  githubProductionStrictPreflightCommands,
} from './prepare-github-production-dispatch.mjs'

const secretValuePattern =
  /(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]+|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i

const passChecks = [
  buildCheck('workflow-file', true, 'Production deploy workflow exists.'),
  buildCheck('manual-workflow', true, 'Production deploy workflow is manually dispatched only.'),
]

const fixtures = [
  {
    label: 'local contract failure',
    input: {
      checks: [...passChecks, buildCheck('skip-acknowledgement', false, 'Skip acknowledgement is missing.')],
      missingGitHubCredentialNames: [],
      dnsCutoverStatus: 'needs-dns-cutover',
    },
    expectedStatus: 'local-contract-failed',
  },
  {
    label: 'missing GitHub credentials',
    input: {
      checks: passChecks,
      missingGitHubCredentialNames: ['CLOUDFLARE_API_TOKEN'],
      dnsCutoverStatus: 'needs-dns-cutover',
    },
    expectedStatus: 'needs-github-production-credentials',
  },
  {
    label: 'DNS transition dispatch',
    input: {
      checks: passChecks,
      missingGitHubCredentialNames: [],
      dnsCutoverStatus: 'needs-dns-cutover',
    },
    expectedStatus: 'ready-for-approved-dispatch-dns-transition-only',
  },
  {
    label: 'final dispatch',
    input: {
      checks: passChecks,
      missingGitHubCredentialNames: [],
      dnsCutoverStatus: 'dns-ready-for-pages-custom-domain',
    },
    expectedStatus: 'ready-for-approved-final-dispatch',
  },
]

const results = fixtures.map((fixture) => {
  const actualStatus = deriveGithubProductionDispatchStatus(fixture.input)
  assert.equal(actualStatus, fixture.expectedStatus, `${fixture.label} should derive ${fixture.expectedStatus}.`)
  return {
    label: fixture.label,
    status: actualStatus,
  }
})

assert(
  githubProductionStrictPreflightCommands.includes('npm run verify:github-release-evidence -- --commit <dispatch_commit_sha>'),
  'Strict preflight should require exact release evidence for the dispatch commit.',
)
assert(
  githubProductionStrictPreflightCommands.includes('npm run verify:production-state-current'),
  'Strict preflight should require current production-state evidence.',
)
assert(
  githubProductionStrictPreflightCommands.includes('npm run verify:production-dispatch-preflight -- --strict'),
  'Strict preflight should include its own exact production dispatch preflight.',
)
assert(
  githubProductionStrictPreflightCommands.includes('npm run verify:github-production-dispatch-content'),
  'Strict preflight should include dispatch-mode fixture verification.',
)
assert(
  githubProductionStrictPreflightCommands.includes('npm run verify:launch -- --soft'),
  'Strict preflight should include launch contract verification.',
)

assert.equal(githubProductionDispatchInputs.finalCompletionMode.confirm, 'deploy-herbalisti-production')
assert.equal(githubProductionDispatchInputs.finalCompletionMode.skip_live_verification, false)
assert.equal(githubProductionDispatchInputs.finalCompletionMode.skip_live_verification_confirm, '')
assert(
  githubProductionDispatchInputs.finalCompletionMode.command.includes('skip_live_verification=false'),
  'Final dispatch command should not skip live verification.',
)
assert(
  githubProductionDispatchInputs.finalCompletionMode.completionEvidence.includes('Final completion requires'),
  'Final dispatch should preserve strict completion wording.',
)

assert.equal(githubProductionDispatchInputs.dnsTransitionMode.confirm, 'deploy-herbalisti-production')
assert.equal(githubProductionDispatchInputs.dnsTransitionMode.skip_live_verification, true)
assert.equal(githubProductionDispatchInputs.dnsTransitionMode.skip_live_verification_confirm, 'skip-herbalisti-live-verification')
assert(
  githubProductionDispatchInputs.dnsTransitionMode.command.includes('skip_live_verification=true') &&
    githubProductionDispatchInputs.dnsTransitionMode.command.includes(
      'skip_live_verification_confirm=skip-herbalisti-live-verification',
    ),
  'DNS-transition command should include the explicit live-verification skip acknowledgement.',
)
assert(
  githubProductionDispatchInputs.dnsTransitionMode.completionEvidence.includes('cannot prove goal completion'),
  'DNS-transition dispatch should remain explicitly non-final.',
)

const serialized = JSON.stringify(
  {
    githubProductionDispatchInputs,
    githubProductionStrictPreflightCommands,
  },
  null,
  2,
)
assert.equal(secretValuePattern.test(serialized), false, 'Dispatch fixture constants must not contain secret-looking values.')

console.log(
  JSON.stringify(
    {
      status: 'pass',
      fixtures: results,
      verified: [
        'local contract failure blocks dispatch',
        'missing GitHub credentials block dispatch',
        'DNS-transition mode requires explicit skip acknowledgement and remains non-final',
        'final dispatch mode requires DNS readiness and live verification',
        'strict preflight includes exact release evidence, current production state, dispatch fixtures, dispatch preflight, and launch checks',
      ],
      safeToRun:
        'Uses local dispatch-mode fixtures and exported packet constants only. It does not call GitHub, deploy, mutate DNS, create resources, set secrets, call paid APIs, or print credential values.',
    },
    null,
    2,
  ),
)
