import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const args = new Set(process.argv.slice(2))
const write = args.has('--write')
const markdown = args.has('--markdown')

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const readJson = (path) => JSON.parse(read(path))

const hasActiveD1Binding = (toml) =>
  /^\s*\[\[d1_databases\]\]/m.test(toml) &&
  /^\s*binding\s*=\s*"HERBALISTI_DB"\s*$/m.test(toml) &&
  /^\s*database_name\s*=\s*"herbalisti"\s*$/m.test(toml) &&
  /^\s*database_id\s*=\s*"(?!<|replace-after|TODO|todo)[^"]+"\s*$/m.test(toml)

const hasActiveR2Binding = (toml) =>
  /^\s*\[\[r2_buckets\]\]/m.test(toml) &&
  /^\s*binding\s*=\s*"HERBALISTI_MEDIA"\s*$/m.test(toml) &&
  /^\s*bucket_name\s*=\s*"herbalisti-media"\s*$/m.test(toml)

const command = (commands, group, index = 0) => commands[group]?.[index] ?? ''

const approvalAction = ({
  id,
  phase,
  title,
  command: actionCommand,
  additionalCommands = [],
  requiredForLaunch = true,
  externalEffect,
  approvalReason,
  after = [],
  verification = [],
  secretNames = [],
  variableNames = [],
  notes = [],
}) => ({
  id,
  phase,
  title,
  requiredForLaunch,
  approvalRequired: true,
  command: actionCommand,
  additionalCommands,
  externalEffect,
  approvalReason,
  after,
  verification,
  secretNames,
  variableNames,
  notes,
})

const localAction = ({ id, title, command: actionCommand, purpose, writesLocalFiles = false, after = [], notes = [] }) => ({
  id,
  title,
  approvalRequired: false,
  command: actionCommand,
  purpose,
  writesLocalFiles,
  after,
  notes,
})

const contract = readJson('docs/production-environment-contract.json')
const pagesToml = read('wrangler.toml')
const newsToml = read('wrangler.news.toml')
const pagesD1Active = hasActiveD1Binding(pagesToml)
const newsD1Active = hasActiveD1Binding(newsToml)
const r2Active = hasActiveR2Binding(pagesToml)
const visibleSecrets = Object.fromEntries(contract.secrets.map((secret) => [secret.name, Boolean(process.env[secret.name]?.trim())]))

const localAllowedActions = [
  localAction({
    id: 'run-release-proof',
    title: 'Run full local release proof',
    command: command(contract.commands, 'localRelease'),
    purpose: 'Reprove build, data exports, governance, local D1, Worker, API, and production-shaped smoke before any public action.',
  }),
  localAction({
    id: 'generate-launch-packet',
    title: 'Generate local launch packet',
    command: 'npm run prepare:launch -- --markdown',
    purpose: 'Print the current cutover state without deploying, uploading, creating resources, or printing secret values.',
  }),
  localAction({
    id: 'run-production-cutover-simulation',
    title: 'Run local production cutover simulation',
    command: 'npm run simulate:production-cutover',
    purpose:
      'Rehearse the D1/R2 binding activation and launch sequencing locally with fake resource IDs, without writing Wrangler config files or touching Cloudflare.',
    notes: ['Use npm run prepare:production-cutover to refresh the human-readable simulation artifact.'],
  }),
  localAction({
    id: 'generate-external-actions',
    title: 'Regenerate this external action checklist',
    command: 'npm run prepare:external-actions',
    purpose: 'Refresh the machine-readable and Markdown handoff artifacts from the production contract.',
    writesLocalFiles: true,
  }),
  localAction({
    id: 'generate-production-provisioning-readiness',
    title: 'Generate production provisioning readiness packet',
    command: 'npm run prepare:production-provisioning',
    purpose:
      'Refresh the machine-readable and Markdown packet that shows the current local readiness state, next approved production action, and exact operator sequence.',
    writesLocalFiles: true,
  }),
  localAction({
    id: 'generate-production-state-snapshot',
    title: 'Generate consolidated production state snapshot',
    command: 'npm run prepare:production-state',
    purpose:
      'Refresh the machine-readable and Markdown snapshot that consolidates completion, GitHub, Cloudflare, DNS, live-domain, and release evidence.',
    writesLocalFiles: true,
    notes: [
      'Use npm run verify:production-state to check the stored snapshot schema and secret-free boundary.',
      'This action is read-only against external services and must not set secrets, deploy, mutate DNS, or create resources.',
    ],
  }),
  localAction({
    id: 'verify-production-feed-seed',
    title: 'Verify production feed seed command',
    command: 'npm run verify:production-feed-seed',
    purpose:
      'Confirm the protected production feed seed command is confirmation-gated, dry-run safe, and wired into the production contract without calling the network.',
  }),
  localAction({
    id: 'check-github-production-readiness',
    title: 'Check GitHub production environment and credential-name readiness',
    command: 'npm run verify:github-production-readiness',
    purpose:
      'Read GitHub workflow, environment, secret-name, variable-name, and release evidence metadata before the guarded production deploy workflow is dispatched.',
    notes: ['Use npm run verify:github-production-readiness -- --strict as the final GitHub dispatch readiness gate.'],
  }),
  localAction({
    id: 'verify-github-production-credentials-helper',
    title: 'Verify required GitHub production credential helper',
    command: 'npm run verify:github-production-credentials',
    purpose:
      'Dry-run the helper that can send CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID to the GitHub production environment through stdin without printing values.',
    notes: [
      'This is dry-run only and does not set secrets or variables.',
      'The write path requires npm run set:github-production-credentials -- --confirm set-herbalisti-production-credentials with required values already present in the local environment.',
    ],
  }),
  localAction({
    id: 'generate-github-production-dispatch-packet',
    title: 'Generate guarded GitHub production dispatch packet',
    command: 'npm run prepare:github-production-dispatch',
    purpose:
      'Refresh the no-secret dispatch packet for the guarded GitHub production workflow, including exact inputs, preflight commands, and live-verification skip boundary.',
    writesLocalFiles: true,
    notes: [
      'Use npm run verify:github-production-dispatch before dispatching the production workflow.',
      'This packet does not dispatch GitHub Actions, set secrets, deploy, mutate DNS, or create Cloudflare resources.',
    ],
  }),
  localAction({
    id: 'check-current-production-state-evidence',
    title: 'Check current production state evidence',
    command: 'npm run verify:production-state-current',
    purpose:
      'Regenerate production state in memory and prove the current git commit has matching GitHub CI, manual release-gate, and visual-smoke artifact evidence.',
    notes: [
      'Run this after CI and the manual release gate have passed for the exact commit being prepared for production.',
      'This command writes no files and does not deploy, mutate DNS, create resources, call paid APIs, download artifacts, or print secret values.',
    ],
  }),
  localAction({
    id: 'check-cloudflare-production-state',
    title: 'Check read-only Cloudflare production state',
    command: 'npm run verify:cloudflare-production-state',
    purpose:
      'Read Wrangler authentication and remote Cloudflare resource/secret-name state before creating D1, deploying, or routing herbalisti.com.',
    notes: ['Use npm run verify:cloudflare-production-state -- --strict after Cloudflare resources, secrets, and deployments are expected to exist.'],
  }),
  localAction({
    id: 'generate-cloudflare-token-requirements',
    title: 'Generate Cloudflare API token requirement packet',
    command: 'npm run prepare:cloudflare-token-requirements',
    purpose:
      'Refresh the value-free token-permission packet for the CLOUDFLARE_API_TOKEN used by the guarded production workflow.',
    writesLocalFiles: true,
    notes: [
      'Use npm run verify:cloudflare-token-requirements before setting the GitHub production CLOUDFLARE_API_TOKEN secret.',
      'The packet names permissions and documentation sources only; it must never contain the token value.',
    ],
  }),
  localAction({
    id: 'generate-d1-production-migration-manifest',
    title: 'Generate D1 production migration manifest',
    command: 'npm run prepare:d1-manifest',
    purpose:
      'Refresh the ordered SQL migration fingerprint packet before remote D1 migrations are approved or applied.',
    writesLocalFiles: true,
    notes: ['Use npm run verify:d1-manifest before any remote D1 migration command.'],
  }),
  localAction({
    id: 'generate-dns-cutover-plan',
    title: 'Generate DNS/custom-domain cutover plan',
    command: 'npm run prepare:dns-cutover',
    purpose:
      'Refresh the read-only DNS snapshot and custom-domain operator sequence before herbalisti.com DNS or Cloudflare Pages domain changes are approved.',
    writesLocalFiles: true,
    notes: ['Use npm run verify:dns-cutover before DNS/custom-domain work and again after nameserver changes propagate.'],
  }),
  localAction({
    id: 'generate-production-secret-setup',
    title: 'Generate production secret setup packet',
    command: 'npm run prepare:production-secrets',
    purpose:
      'Refresh the GitHub production environment and Cloudflare runtime secret-name setup packet without reading, storing, or printing secret values.',
    writesLocalFiles: true,
    notes: ['Use npm run verify:production-secrets before setting GitHub or Cloudflare secret values.'],
  }),
  localAction({
    id: 'verify-github-generated-secrets',
    title: 'Verify generated GitHub admin secret helper',
    command: 'npm run verify:github-generated-secrets',
    purpose:
      'Dry-run the helper that can generate Herbalisti-owned admin tokens directly into GitHub without printing values.',
    notes: [
      'This is dry-run only and does not generate values, set secrets, deploy, mutate DNS, or call paid APIs.',
      'The write path requires npm run set:github-generated-secrets -- --confirm set-herbalisti-generated-secrets.',
    ],
  }),
  localAction({
    id: 'activate-d1-bindings-local',
    title: 'Activate local Wrangler D1 bindings after Cloudflare returns the database ID',
    command: command(contract.commands, 'activateBindings'),
    purpose: 'Write the returned D1 database ID into local Wrangler config after the external D1 resource exists.',
    writesLocalFiles: true,
    after: ['create-d1-database'],
  }),
  localAction({
    id: 'activate-r2-binding-local',
    title: 'Optionally activate local R2 media binding after the bucket exists',
    command: command(contract.commands, 'activateBindings', 1),
    purpose: 'Write the optional media bucket binding into local Wrangler config when approved Seedance assets need owned storage.',
    writesLocalFiles: true,
    after: ['create-r2-bucket-optional'],
    notes: ['R2 is optional until reviewed Seedance video outputs exist.'],
  }),
]

const approvalRequiredActions = [
  approvalAction({
    id: 'create-d1-database',
    phase: 'cloudflare-resources',
    title: 'Create Cloudflare D1 database',
    command: command(contract.commands, 'createResources'),
    externalEffect: 'Creates a Cloudflare D1 database named herbalisti.',
    approvalReason: 'Creates a production cloud resource in the Cloudflare account.',
    verification: ['npm run configure:cloudflare -- --d1 <database_id> --apply', 'npm run verify:launch -- --soft'],
  }),
  approvalAction({
    id: 'create-r2-bucket-optional',
    phase: 'cloudflare-resources',
    title: 'Optionally create Cloudflare R2 media bucket',
    command: command(contract.commands, 'createResources', 1),
    requiredForLaunch: false,
    externalEffect: 'Creates a Cloudflare R2 bucket for reviewed owned Seedance video assets.',
    approvalReason: 'Creates an optional production cloud storage resource.',
    verification: ['npm run configure:cloudflare -- --d1 <database_id> --r2 herbalisti-media --apply'],
    notes: ['Skip until approved generated video assets need durable owned storage.'],
  }),
  approvalAction({
    id: 'apply-remote-d1-migrations',
    phase: 'remote-migrations',
    title: 'Apply production D1 migrations',
    command: command(contract.commands, 'remoteMigrations'),
    externalEffect: 'Writes production database schema and seed data to Cloudflare D1.',
    approvalReason: 'Mutates the production data store.',
    after: ['create-d1-database', 'activate-d1-bindings-local'],
    verification: ['npm run verify:d1-manifest', 'npm run verify:launch -- --soft'],
  }),
  approvalAction({
    id: 'set-github-production-credentials',
    phase: 'secrets',
    title: 'Set required GitHub production credentials',
    command: 'npm run set:github-production-credentials -- --confirm set-herbalisti-production-credentials',
    additionalCommands: [
      'gh secret set CLOUDFLARE_API_TOKEN --env production --repo marcgough/herbalist',
      'gh variable set CLOUDFLARE_ACCOUNT_ID --env production --repo marcgough/herbalist',
    ],
    externalEffect:
      'Stores the required Cloudflare deployment secret and account identifier in the GitHub production environment.',
    approvalReason:
      'Writes an externally issued secret and deployment variable to GitHub production environment storage.',
    verification: ['npm run verify:github-production-credentials', 'npm run verify:github-production-readiness -- --strict'],
    secretNames: ['CLOUDFLARE_API_TOKEN'],
    variableNames: ['CLOUDFLARE_ACCOUNT_ID'],
    notes: [
      'The helper reads CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID from the local environment and sends values through stdin.',
      'Use the direct gh commands or the GitHub UI when values are not available as local environment variables.',
      'Do not paste secret values into chat, docs, Git, screenshots, or command logs.',
    ],
  }),
  approvalAction({
    id: 'generate-herbalisti-owned-github-secrets',
    phase: 'secrets',
    title: 'Generate Herbalisti-owned GitHub admin secrets',
    command: 'npm run set:github-generated-secrets -- --confirm set-herbalisti-generated-secrets',
    requiredForLaunch: false,
    externalEffect:
      'Generates FEED_ADMIN_TOKEN and MEDIA_ADMIN_TOKEN locally, then stores them as GitHub production environment secrets without printing values.',
    approvalReason:
      'Writes new secret values into GitHub. Use only when the generated-token path is preferred over manually supplied admin tokens.',
    verification: ['npm run verify:github-generated-secrets', 'npm run verify:github-production-readiness'],
    secretNames: ['FEED_ADMIN_TOKEN', 'MEDIA_ADMIN_TOKEN'],
      notes: [
        'Does not generate externally issued Cloudflare credentials, the Cloudflare account identifier, or KIE_API_KEY.',
        'Generated values are not recoverable from GitHub after setting; rotate by running the command again.',
      ],
  }),
  approvalAction({
    id: 'set-feed-admin-token',
    phase: 'secrets',
    title: 'Set Pages Feed Admin Token secret',
    command: contract.secrets.find((secret) => secret.name === 'FEED_ADMIN_TOKEN')?.additionalSetCommands?.[0] ?? '',
    externalEffect: 'Stores the feed admin secret in Cloudflare Pages before the public site deployment.',
    approvalReason: 'Writes a secret to Cloudflare. The value must be supplied outside chat/logs.',
    secretNames: ['FEED_ADMIN_TOKEN'],
    notes: [
      'Do not paste secret values into chat, docs, Git, or command logs.',
      'Pages secrets should be set before deploying the Pages project so the protected feed-refresh endpoint is live with the deployed bundle.',
    ],
  }),
  approvalAction({
    id: 'set-kie-api-key',
    phase: 'secrets',
    title: 'Set Kie.ai API key secret',
    command: contract.secrets.find((secret) => secret.name === 'KIE_API_KEY')?.setCommand ?? '',
    requiredForLaunch: false,
    externalEffect: 'Stores the Kie.ai API key in Cloudflare Pages for protected Seedance jobs.',
    approvalReason: 'Writes a secret and can later enable paid media generation if separately approved.',
    secretNames: ['KIE_API_KEY'],
    notes: ['Setting the secret does not generate video. Paid generation remains a separate approval step.'],
  }),
  approvalAction({
    id: 'set-media-admin-token',
    phase: 'secrets',
    title: 'Set Media Admin Token secret',
    command: contract.secrets.find((secret) => secret.name === 'MEDIA_ADMIN_TOKEN')?.setCommand ?? '',
    requiredForLaunch: false,
    externalEffect: 'Stores a secret in Cloudflare Pages for protected media job create/status endpoints.',
    approvalReason: 'Writes a secret to Cloudflare. The value must be supplied outside chat/logs.',
    secretNames: ['MEDIA_ADMIN_TOKEN'],
  }),
  approvalAction({
    id: 'set-openai-api-key-optional',
    phase: 'secrets',
    title: 'Optionally set OpenAI API key secret',
    command: contract.secrets.find((secret) => secret.name === 'OPENAI_API_KEY')?.setCommand ?? '',
    requiredForLaunch: false,
    externalEffect: 'Stores an OpenAI API key in Cloudflare Pages for optional hosted synthesis or repeatable server-side image generation.',
    approvalReason: 'Writes a secret and can enable paid API usage if a later feature calls it.',
    secretNames: ['OPENAI_API_KEY'],
    notes: ['Not required for launch while retrieval fallback is active.'],
  }),
  approvalAction({
    id: 'deploy-cloudflare-pages',
    phase: 'deploy',
    title: 'Deploy Cloudflare Pages site',
    command: command(contract.commands, 'deploy'),
    externalEffect: 'Publishes the Herbalisti website bundle to Cloudflare Pages.',
    approvalReason: 'Public deployment of the website.',
    after: ['apply-remote-d1-migrations', 'set-feed-admin-token'],
    verification: ['npm run verify:live-readiness -- --strict', 'npm run verify:production -- https://herbalisti.com'],
  }),
  approvalAction({
    id: 'deploy-news-worker',
    phase: 'deploy',
    title: 'Deploy scheduled news Worker',
    command: command(contract.commands, 'deploy', 1),
    externalEffect: 'Publishes the scheduled feed-refresh Worker to Cloudflare.',
    approvalReason: 'Public deployment of scheduled automation.',
    after: ['apply-remote-d1-migrations'],
    verification: ['npm run verify:source-health', 'npm run verify:production -- https://herbalisti.com'],
  }),
  approvalAction({
    id: 'set-worker-feed-admin-token',
    phase: 'secrets',
    title: 'Set scheduled Worker Feed Admin Token secret',
    command: contract.secrets.find((secret) => secret.name === 'FEED_ADMIN_TOKEN')?.setCommand ?? '',
    externalEffect: 'Stores the feed admin secret on the deployed scheduled news Worker.',
    approvalReason:
      'Writes a secret to Cloudflare. Wrangler secret put creates a new Worker version, so the Worker should exist before this action runs.',
    after: ['deploy-news-worker'],
    verification: ['npm run verify:cloudflare-production-state', 'npm run verify:production -- https://herbalisti.com'],
    secretNames: ['FEED_ADMIN_TOKEN'],
    notes: [
      'Do not paste secret values into chat, docs, Git, or command logs.',
      'Run after the scheduled Worker has been deployed at least once.',
    ],
  }),
  approvalAction({
    id: 'seed-production-feed',
    phase: 'post-deploy-feed',
    title: 'Seed live Signals feed',
    command: command(contract.commands, 'seedProductionFeed'),
    externalEffect: 'Triggers the protected production feed-refresh endpoint and writes a feed refresh run into production D1.',
    approvalReason: 'Writes production feed-refresh data and uses the feed admin secret.',
    after: ['deploy-cloudflare-pages', 'deploy-news-worker', 'set-worker-feed-admin-token', 'connect-domain'],
    verification: [
      'npm run verify:production-feed-seed',
      'npm run verify:live-readiness -- --strict',
      'npm run verify:production -- https://herbalisti.com',
    ],
    secretNames: ['FEED_ADMIN_TOKEN'],
    notes: [
      'Use this after DNS/custom-domain routing is active when the guarded deploy workflow was run with live verification skipped.',
      'The command prints sanitized feed-refresh metadata only and must not print the token value.',
    ],
  }),
  approvalAction({
    id: 'run-github-production-deploy-workflow',
    phase: 'deploy',
    title: 'Run guarded GitHub production deploy workflow',
    command: command(contract.commands, 'githubProductionDeploy'),
    requiredForLaunch: false,
    externalEffect:
      'Runs the manual GitHub production workflow that can create or confirm the Pages project, resolve or create the D1 database by name, configure runner-local D1 bindings, apply migrations, generate masked runtime admin tokens, set Cloudflare secrets, deploy Pages and the scheduled Worker, and run live verification.',
    approvalReason: 'Public production deployment automation with Cloudflare resource, secret, D1, Worker, and live-site effects.',
    verification: [
      'npm run verify:production-deploy-workflow',
      'npm run verify:production-deploy-evidence-artifact',
      'npm run verify:github-production-dispatch',
      'npm run verify:github-release-evidence',
      'npm run verify:production-state-current',
      'npm run verify:d1-manifest',
      'npm run verify:production-secrets',
      'npm run verify:github-generated-secrets',
      'npm run verify:production-state',
      'npm run verify:cloudflare-token-requirements',
      'npm run verify:live-readiness -- --strict',
      'npm run verify:production -- https://herbalisti.com',
      'npm run verify:goal-readiness -- --strict',
    ],
    secretNames: ['CLOUDFLARE_API_TOKEN', 'KIE_API_KEY'],
    variableNames: ['CLOUDFLARE_ACCOUNT_ID'],
    notes: [
      'Requires the exact workflow input confirm=deploy-herbalisti-production.',
      'If skip_live_verification=true during DNS transition, also set skip_live_verification_confirm=skip-herbalisti-live-verification.',
      'Use the GitHub production environment approval controls before dispatch.',
      'The workflow generates FEED_ADMIN_TOKEN and MEDIA_ADMIN_TOKEN as masked runtime values; they do not need to be stored as GitHub secrets for launch.',
      'The workflow sets the Pages feed secret before Pages deploy, deploys the scheduled Worker, then applies the Worker feed secret so first deploys do not depend on a pre-existing Worker.',
      'KIE_API_KEY is optional until approved Seedance media generation is needed.',
      'CLOUDFLARE_ACCOUNT_ID is preferred as a GitHub production environment variable; a secret fallback is supported for existing setups.',
      'Run npm run verify:production-secrets, npm run verify:github-generated-secrets, npm run verify:cloudflare-token-requirements, and npm run verify:github-production-readiness -- --strict before dispatch.',
      'After dispatch, run npm run verify:production-deploy-evidence-artifact -- --strict --run-id <production_deploy_run_id> to confirm the non-secret deployment evidence artifact exists.',
      'Do not use skip_live_verification for final completion evidence.',
    ],
  }),
  approvalAction({
    id: 'connect-domain',
    phase: 'domain',
    title: 'Connect herbalisti.com custom domain and DNS',
    command: 'Cloudflare dashboard: connect herbalisti.com to the herbalisti Pages project',
    externalEffect: 'Changes public DNS/custom-domain routing for herbalisti.com.',
    approvalReason: 'Mutates public DNS or Cloudflare custom-domain configuration.',
    after: ['deploy-cloudflare-pages'],
    verification: ['npm run verify:dns-cutover', ...contract.commands.liveCompletionGates],
  }),
  approvalAction({
    id: 'generate-seedance-video-optional',
    phase: 'media',
    title: 'Optionally generate Seedance 2.0 video through Kie.ai',
    command: 'POST /api/media/seedance with approved prompt and MEDIA_ADMIN_TOKEN',
    requiredForLaunch: false,
    externalEffect: 'Calls a paid third-party media-generation provider.',
    approvalReason: 'Can spend credits and create external media-generation jobs.',
    after: ['set-kie-api-key', 'set-media-admin-token'],
    verification: ['Review generated video manually.', 'Store approved output as an owned asset before enabling manifest slots.'],
  }),
]

const productionBlockers = [
  ...(!pagesD1Active ? ['Pages D1 binding is not active in wrangler.toml.'] : []),
  ...(!newsD1Active ? ['News Worker D1 binding is not active in wrangler.news.toml.'] : []),
  ...contract.secrets
    .filter((secret) => secret.requiredForLaunch && !visibleSecrets[secret.name])
    .map((secret) => `${secret.name} is not locally visible; confirm it is set in Cloudflare before using the related feature.`),
]

const packet = {
  version: 1,
  generatedAt: new Date().toISOString(),
  status: productionBlockers.length ? 'needs-approval-and-production-setup' : 'ready-for-approved-live-actions',
  safeToRun:
    'This artifact is generated from local files and environment-variable presence only. It does not deploy, create resources, mutate DNS, call paid APIs, or print secret values.',
  project: contract.project,
  localState: {
    pagesD1BindingActive: pagesD1Active,
    newsWorkerD1BindingActive: newsD1Active,
    r2MediaBindingActive: r2Active,
    visibleSecretNames: Object.entries(visibleSecrets)
      .filter(([, visible]) => visible)
      .map(([name]) => name),
  },
  guardrails: {
    localWorkPreApproved: true,
    externalActionsRequireFreshApproval: true,
    neverPasteSecretsIntoChatOrDocs: true,
    noPaidGenerationWithoutSeparateApproval: true,
    noDeploymentOrDnsMutationWithoutApproval: true,
  },
  localAllowedActions,
  approvalRequiredActions,
  requiredInputsFromMarc: [
    'Approval to create Cloudflare resources.',
    'Authenticated Cloudflare/Wrangler session or deployment operator access.',
    'Returned D1 database ID from Cloudflare only if using the manual Cloudflare path instead of the guarded GitHub production workflow.',
    'Confirmation that required secrets are available to set directly in Cloudflare without exposing values in chat.',
    'Approval to deploy Pages and the scheduled Worker.',
    'Approval to connect herbalisti.com DNS/custom domain.',
  ],
  productionBlockers,
  completionGates: contract.commands.finalCompletionGates ?? [
    ...(contract.commands.postDeployEvidence ?? []),
    ...(contract.commands.liveCompletionGates ?? []),
  ],
}

const renderMarkdown = (value) => {
  const lines = [
    '# Herbalisti External Launch Actions',
    '',
    `Generated: ${value.generatedAt}`,
    '',
    `Status: ${value.status}`,
    '',
    value.safeToRun,
    '',
    '## Guardrails',
    '',
    '- Local filesystem, build, test, verification, and Dropbox checkpoint work can continue without another approval.',
    '- Live deployment, DNS changes, Cloudflare resource creation, secrets, and paid generation require fresh approval.',
    '- Do not paste secret values into chat, docs, Git, or logs.',
    '',
    '## Local Actions',
    '',
  ]

  for (const action of value.localAllowedActions) {
    lines.push(`### ${action.title}`)
    lines.push('')
    lines.push(action.purpose)
    lines.push('')
    lines.push('```bash')
    lines.push(action.command)
    for (const extraCommand of action.additionalCommands ?? []) {
      lines.push(extraCommand)
    }
    lines.push('```')
    lines.push('')
    if (action.notes.length) {
      lines.push('Notes:')
      for (const note of action.notes) {
        lines.push(`- ${note}`)
      }
      lines.push('')
    }
  }

  lines.push('## Approval Required')
  lines.push('')

  for (const action of value.approvalRequiredActions) {
    lines.push(`### ${action.title}`)
    lines.push('')
    lines.push(`Required for launch: ${action.requiredForLaunch}`)
    lines.push('')
    lines.push(`External effect: ${action.externalEffect}`)
    lines.push('')
    lines.push(`Approval reason: ${action.approvalReason}`)
    lines.push('')
    lines.push('Command:')
    lines.push('')
    lines.push('```bash')
    lines.push(action.command)
    for (const extraCommand of action.additionalCommands ?? []) {
      lines.push(extraCommand)
    }
    lines.push('```')
    lines.push('')
    if (action.after.length) {
      lines.push(`After: ${action.after.join(', ')}`)
      lines.push('')
    }
    if (action.secretNames.length) {
      lines.push(`Secret names: ${action.secretNames.join(', ')}`)
      lines.push('')
    }
    if (action.variableNames.length) {
      lines.push(`Variable names: ${action.variableNames.join(', ')}`)
      lines.push('')
    }
    if (action.verification.length) {
      lines.push('Verification:')
      for (const check of action.verification) {
        lines.push(`- ${check}`)
      }
      lines.push('')
    }
    if (action.notes.length) {
      lines.push('Notes:')
      for (const note of action.notes) {
        lines.push(`- ${note}`)
      }
      lines.push('')
    }
  }

  lines.push('## Required Inputs')
  lines.push('')
  for (const item of value.requiredInputsFromMarc) {
    lines.push(`- ${item}`)
  }
  lines.push('')

  lines.push('## Completion Gates')
  lines.push('')
  for (const gate of value.completionGates) {
    lines.push(`- \`${gate}\``)
  }
  lines.push('')

  return lines.join('\n')
}

const jsonOutput = `${JSON.stringify(packet, null, 2)}\n`
const markdownOutput = renderMarkdown(packet)

if (write) {
  writeFileSync(resolve(root, 'docs/external-launch-actions.json'), jsonOutput)
  writeFileSync(resolve(root, 'docs/external-launch-actions.md'), markdownOutput)
}

console.log(markdown ? markdownOutput : jsonOutput)
