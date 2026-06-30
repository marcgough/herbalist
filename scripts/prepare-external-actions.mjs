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
  requiredForLaunch = true,
  externalEffect,
  approvalReason,
  after = [],
  verification = [],
  secretNames = [],
  notes = [],
}) => ({
  id,
  phase,
  title,
  requiredForLaunch,
  approvalRequired: true,
  command: actionCommand,
  externalEffect,
  approvalReason,
  after,
  verification,
  secretNames,
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
    id: 'check-github-production-readiness',
    title: 'Check GitHub production environment and secret-name readiness',
    command: 'npm run verify:github-production-readiness',
    purpose:
      'Read GitHub workflow, environment, secret-name, and release evidence metadata before the guarded production deploy workflow is dispatched.',
    notes: ['Use npm run verify:github-production-readiness -- --strict as the final GitHub dispatch readiness gate.'],
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
    verification: ['npm run verify:launch -- --soft'],
  }),
  approvalAction({
    id: 'set-feed-admin-token',
    phase: 'secrets',
    title: 'Set Feed Admin Token secret',
    command: contract.secrets.find((secret) => secret.name === 'FEED_ADMIN_TOKEN')?.setCommand ?? '',
    externalEffect: 'Stores a secret in Cloudflare for protected feed-refresh controls.',
    approvalReason: 'Writes a secret to Cloudflare. The value must be supplied outside chat/logs.',
    secretNames: ['FEED_ADMIN_TOKEN'],
    notes: ['Do not paste secret values into chat, docs, Git, or command logs.'],
  }),
  approvalAction({
    id: 'set-kie-api-key',
    phase: 'secrets',
    title: 'Set Kie.ai API key secret',
    command: contract.secrets.find((secret) => secret.name === 'KIE_API_KEY')?.setCommand ?? '',
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
    after: ['apply-remote-d1-migrations', 'set-feed-admin-token', 'set-kie-api-key', 'set-media-admin-token'],
    verification: ['npm run verify:live-readiness -- --strict', 'npm run verify:production -- https://herbalisti.com'],
  }),
  approvalAction({
    id: 'deploy-news-worker',
    phase: 'deploy',
    title: 'Deploy scheduled news Worker',
    command: command(contract.commands, 'deploy', 1),
    externalEffect: 'Publishes the scheduled feed-refresh Worker to Cloudflare.',
    approvalReason: 'Public deployment of scheduled automation.',
    after: ['apply-remote-d1-migrations', 'set-feed-admin-token'],
    verification: ['npm run verify:source-health', 'npm run verify:production -- https://herbalisti.com'],
  }),
  approvalAction({
    id: 'run-github-production-deploy-workflow',
    phase: 'deploy',
    title: 'Run guarded GitHub production deploy workflow',
    command: command(contract.commands, 'githubProductionDeploy'),
    requiredForLaunch: false,
    externalEffect:
      'Runs the manual GitHub production workflow that can create or confirm the Pages project, configure runner-local D1 bindings, apply migrations, set Cloudflare secrets from GitHub secrets, deploy Pages and the scheduled Worker, and run live verification.',
    approvalReason: 'Public production deployment automation with Cloudflare resource, secret, D1, Worker, and live-site effects.',
    after: ['create-d1-database'],
    verification: [
      'npm run verify:production-deploy-workflow',
      'npm run verify:github-release-evidence',
      'npm run verify:live-readiness -- --strict',
      'npm run verify:production -- https://herbalisti.com',
      'npm run verify:goal-readiness -- --strict',
    ],
    secretNames: [
      'CLOUDFLARE_API_TOKEN',
      'CLOUDFLARE_ACCOUNT_ID',
      'CLOUDFLARE_D1_DATABASE_ID',
      'FEED_ADMIN_TOKEN',
      'KIE_API_KEY',
      'MEDIA_ADMIN_TOKEN',
    ],
    notes: [
      'Requires the exact workflow input confirm=deploy-herbalisti-production.',
      'Use the GitHub production environment approval controls before dispatch.',
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
    verification: contract.commands.liveCompletionGates,
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
    'Returned D1 database ID from Cloudflare.',
    'Confirmation that required secrets are available to set directly in Cloudflare without exposing values in chat.',
    'Approval to deploy Pages and the scheduled Worker.',
    'Approval to connect herbalisti.com DNS/custom domain.',
  ],
  productionBlockers,
  completionGates: contract.commands.liveCompletionGates,
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
