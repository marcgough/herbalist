import assert from 'node:assert/strict'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const outputJsonPath = 'docs/cloudflare-token-requirements.json'
const outputMarkdownPath = 'docs/cloudflare-token-requirements.md'

const args = new Set(process.argv.slice(2))
const write = args.has('--write')
const check = args.has('--check')
const markdown = args.has('--markdown')

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const readJson = (path) => JSON.parse(read(path))
const exists = (path) => existsSync(resolve(root, path))

const secretValuePattern =
  /(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]+|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i

const sourceEvidence = [
  {
    id: 'cloudflare-pages-direct-upload',
    title: 'Cloudflare Pages direct upload with Wrangler',
    url: 'https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/',
    retrievedAt: '2026-07-01',
    supports: [
      'Pages Wrangler deploys require CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in CI.',
      'The Pages deployment token needs Account / Cloudflare Pages / Edit permission.',
    ],
  },
  {
    id: 'cloudflare-pages-api',
    title: 'Cloudflare Pages REST API token guidance',
    url: 'https://developers.cloudflare.com/pages/configuration/api/',
    retrievedAt: '2026-07-01',
    supports: [
      'Custom Cloudflare tokens for Pages automation need the Cloudflare Pages permission with Edit access.',
      'Pages API requests accept a Cloudflare API token in the authorization header.',
    ],
  },
  {
    id: 'cloudflare-workers-github-actions',
    title: 'Cloudflare Workers GitHub Actions authentication',
    url: 'https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/',
    retrievedAt: '2026-07-01',
    supports: [
      'Non-interactive Wrangler CI uses CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID.',
      'Cloudflare recommends scoping deployment tokens down to the account and zone being deployed.',
    ],
  },
  {
    id: 'cloudflare-workers-builds-token',
    title: 'Cloudflare Workers build-token permission set',
    url: 'https://developers.cloudflare.com/workers/ci-cd/builds/configuration/',
    retrievedAt: '2026-07-01',
    supports: [
      'Workers build tokens use Account Settings Read, Workers Scripts Edit, Workers KV Storage Edit, Workers R2 Storage Edit, zone Workers Routes Edit, User Details Read, and Memberships Read.',
      'Herbalisti needs Workers Scripts Edit for scheduled Worker deploy and secret operations; R2 is optional until reviewed video assets exist.',
    ],
  },
  {
    id: 'cloudflare-d1-rest-import',
    title: 'Cloudflare D1 REST import token guidance',
    url: 'https://developers.cloudflare.com/d1/tutorials/import-to-d1-with-rest-api/',
    retrievedAt: '2026-07-01',
    supports: ['D1 write automation needs Account / D1 / Edit permission.'],
  },
  {
    id: 'cloudflare-token-permissions',
    title: 'Cloudflare API token permissions reference',
    url: 'https://developers.cloudflare.com/fundamentals/api/reference/permissions/',
    retrievedAt: '2026-07-01',
    supports: [
      'Cloudflare Pages Edit can create, edit, and delete Pages projects.',
      'D1 Edit grants write access to D1.',
      'Workers Scripts Edit grants write access to Workers scripts.',
      'Workers R2 Storage Edit grants write access to R2 storage.',
      'User Details Read and Memberships Read are user-scoped read permissions.',
    ],
  },
]

const cloudflareApiTokenPermissions = [
  {
    category: 'Account',
    permission: 'Cloudflare Pages',
    access: 'Edit',
    requiredForLaunch: true,
    coveredCommands: [
      'npx wrangler pages project list --json',
      'npx wrangler pages project create herbalisti --production-branch main',
      'npx wrangler pages deploy dist --project-name herbalisti',
      'npx wrangler pages secret put KIE_API_KEY --project-name herbalisti',
      'npx wrangler pages secret put MEDIA_ADMIN_TOKEN --project-name herbalisti',
    ],
    sourceIds: ['cloudflare-pages-direct-upload', 'cloudflare-pages-api', 'cloudflare-token-permissions'],
  },
  {
    category: 'Account',
    permission: 'D1',
    access: 'Edit',
    requiredForLaunch: true,
    coveredCommands: [
      'npx wrangler d1 list --json',
      'npx wrangler d1 create herbalisti',
      'npx wrangler d1 migrations apply herbalisti --remote',
    ],
    sourceIds: ['cloudflare-d1-rest-import', 'cloudflare-token-permissions'],
  },
  {
    category: 'Account',
    permission: 'Workers Scripts',
    access: 'Edit',
    requiredForLaunch: true,
    coveredCommands: [
      'npx wrangler deploy --config wrangler.news.toml',
      'npx wrangler secret put FEED_ADMIN_TOKEN --config wrangler.news.toml',
      'npx wrangler deployments list --name herbalisti-news-refresh --json',
      'npx wrangler secret list --config wrangler.news.toml --format json',
    ],
    sourceIds: ['cloudflare-workers-github-actions', 'cloudflare-workers-builds-token', 'cloudflare-token-permissions'],
  },
  {
    category: 'Account',
    permission: 'Account Settings',
    access: 'Read',
    requiredForLaunch: true,
    coveredCommands: ['npx wrangler whoami', 'Wrangler account discovery in non-interactive CI'],
    sourceIds: ['cloudflare-workers-builds-token'],
  },
  {
    category: 'User',
    permission: 'User Details',
    access: 'Read',
    requiredForLaunch: false,
    coveredCommands: ['Wrangler user-token identity discovery'],
    sourceIds: ['cloudflare-workers-builds-token', 'cloudflare-token-permissions'],
  },
  {
    category: 'User',
    permission: 'Memberships',
    access: 'Read',
    requiredForLaunch: false,
    coveredCommands: ['Wrangler user-token account membership discovery'],
    sourceIds: ['cloudflare-workers-builds-token', 'cloudflare-token-permissions'],
  },
  {
    category: 'Account',
    permission: 'Workers R2 Storage',
    access: 'Edit',
    requiredForLaunch: false,
    coveredCommands: ['npx wrangler r2 bucket create herbalisti-media'],
    sourceIds: ['cloudflare-workers-builds-token', 'cloudflare-token-permissions'],
    notes: 'Only needed when the optional reviewed-video R2 bucket is created.',
  },
]

const forbiddenForGuardedWorkflow = [
  {
    category: 'Zone',
    permission: 'DNS',
    access: 'Edit',
    reason:
      'The guarded GitHub workflow does not mutate DNS. herbalisti.com custom-domain and DNS work remains an explicit separate launch step.',
  },
  {
    category: 'Account',
    permission: 'Billing',
    access: 'Edit',
    reason: 'The production workflow does not need billing access.',
  },
]

const commandAppears = (haystack, command) =>
  !/^(npx|npm|GitHub Actions:)/.test(command) ||
  command
    .split(/\s+/)
    .filter((part) => !part.startsWith('<') && !part.includes('Wrangler'))
    .every((part) => haystack.includes(part))

export const buildCloudflareTokenRequirements = ({ generatedAt = new Date().toISOString() } = {}) => {
  const contract = readJson('docs/production-environment-contract.json')
  const workflow = read('.github/workflows/production-deploy.yml')
  const productionSecretSetup = exists('docs/production-secret-setup.json')
    ? readJson('docs/production-secret-setup.json')
    : null
  const runbook = exists('docs/deployment-runbook.md') ? read('docs/deployment-runbook.md') : ''
  const launchPacket = exists('docs/production-launch-packet.md') ? read('docs/production-launch-packet.md') : ''
  const packageJson = readJson('package.json')

  const workflowText = [workflow, JSON.stringify(contract), JSON.stringify(productionSecretSetup)].join('\n')
  const requiredPermissions = cloudflareApiTokenPermissions.filter((permission) => permission.requiredForLaunch)
  const optionalPermissions = cloudflareApiTokenPermissions.filter((permission) => !permission.requiredForLaunch)
  const requiredGithubSecrets =
    productionSecretSetup?.githubProductionEnvironment?.secrets
      ?.filter((secret) => secret.requiredForGuardedWorkflow)
      .map((secret) => secret.name) ?? []
  const requiredGithubVariables = productionSecretSetup?.githubProductionEnvironment?.requiredVariableNames ?? []
  const hasAccountIdVariableWithFallback =
    /CLOUDFLARE_ACCOUNT_ID:\s*\$\{\{\s*vars\.CLOUDFLARE_ACCOUNT_ID\s*\|\|\s*secrets\.CLOUDFLARE_ACCOUNT_ID\s*\}\}/.test(
      workflow,
    )

  const checks = [
    {
      id: 'cloudflare-token-secret-named',
      status:
        requiredGithubSecrets.includes('CLOUDFLARE_API_TOKEN') &&
        workflow.includes('secrets.CLOUDFLARE_API_TOKEN') &&
        workflow.includes('CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}')
          ? 'pass'
          : 'fail',
      detail: 'Guarded workflow reads CLOUDFLARE_API_TOKEN from GitHub production environment secrets.',
    },
    {
      id: 'cloudflare-account-id-variable-named',
      status:
        requiredGithubVariables.includes('CLOUDFLARE_ACCOUNT_ID') && hasAccountIdVariableWithFallback
          ? 'pass'
          : 'fail',
      detail: 'Guarded workflow reads CLOUDFLARE_ACCOUNT_ID from a GitHub production environment variable with secret fallback.',
    },
    {
      id: 'required-permission-coverage',
      status: ['Cloudflare Pages', 'D1', 'Workers Scripts', 'Account Settings'].every((permission) =>
        requiredPermissions.some((item) => item.permission === permission),
      )
        ? 'pass'
        : 'fail',
      detail: 'Required Cloudflare token permission packet covers Pages, D1, Workers Scripts, and Account Settings.',
    },
    {
      id: 'workflow-command-coverage',
      status: requiredPermissions.every((permission) =>
        permission.coveredCommands.some((command) => commandAppears(workflowText, command)),
      )
        ? 'pass'
        : 'fail',
      detail: 'Required Cloudflare token permissions map to commands used by the launch workflow or contract.',
    },
    {
      id: 'optional-r2-separate',
      status:
        optionalPermissions.some((permission) => permission.permission === 'Workers R2 Storage') &&
        contract.resources.some((resource) => resource.id === 'media-r2' && resource.required === false)
          ? 'pass'
          : 'fail',
      detail: 'Optional R2 permission remains separate from launch-critical permissions.',
    },
    {
      id: 'no-dns-token-permission',
      status: /wrangler\s+dns|dns\s+record|secrets\.CLOUDFLARE_DNS|DNS_EDIT/i.test(workflow) ? 'fail' : 'pass',
      detail: 'Guarded workflow does not require DNS edit permission.',
    },
    {
      id: 'secret-value-free',
      status: !secretValuePattern.test(workflowText) ? 'pass' : 'fail',
      detail: 'Token requirement inputs do not contain obvious secret values.',
    },
    {
      id: 'source-evidence',
      status: sourceEvidence.every((source) => source.url.startsWith('https://developers.cloudflare.com/')) ? 'pass' : 'fail',
      detail: 'Cloudflare token requirement packet links only to Cloudflare documentation sources.',
    },
    {
      id: 'handoff-docs-reference',
      status:
        runbook.includes('cloudflare-token-requirements') &&
        launchPacket.includes('verify:cloudflare-token-requirements')
          ? 'pass'
          : 'fail',
      detail: 'Deployment runbook and launch packet reference the token requirement gate.',
    },
    {
      id: 'npm-script',
      status: Boolean(packageJson.scripts?.['verify:cloudflare-token-requirements']) ? 'pass' : 'fail',
      detail: 'Cloudflare token requirement verifier is exposed as an npm script.',
    },
  ]

  const packet = {
    version: 1,
    generatedAt,
    status: checks.every((check) => check.status === 'pass') ? 'ready-for-token-entry' : 'local-contract-failed',
    productionComplete: false,
    safeToRun:
      'Reads local launch contracts and public Cloudflare documentation citations. It does not read, request, set, store, or print token values; it does not call Cloudflare, deploy, mutate DNS, create resources, or call paid APIs.',
    project: contract.project,
    githubSecretNames: ['CLOUDFLARE_API_TOKEN'],
    githubVariableNames: ['CLOUDFLARE_ACCOUNT_ID'],
    cloudflareApiToken: {
      recommendedName: 'Herbalisti production deploy',
      scopeBoundary: 'Restrict to the Cloudflare account that will host herbalisti.com and the Herbalisti Workers/Pages resources.',
      requiredPermissions,
      optionalPermissions,
      explicitlyNotRequired: forbiddenForGuardedWorkflow,
      valueHandling:
        'Create or edit the token in Cloudflare and enter the token value directly into the GitHub production environment secret named CLOUDFLARE_API_TOKEN. Do not paste the value into chat, docs, Git, screenshots, or logs.',
    },
    sourceEvidence,
    checks,
  }

  assert.equal(secretValuePattern.test(JSON.stringify(packet)), false, 'Cloudflare token packet must not contain secret-looking values')

  return packet
}

export const renderCloudflareTokenRequirementsMarkdown = (packet) => {
  const lines = [
    '# Herbalisti Cloudflare Token Requirements',
    '',
    `Generated: ${packet.generatedAt}`,
    '',
    `Status: ${packet.status}`,
    '',
    packet.safeToRun,
    '',
    '## GitHub Secret Names',
    '',
  ]

  for (const name of packet.githubSecretNames) {
    lines.push(`- \`${name}\``)
  }

  lines.push('', '## GitHub Variable Names', '')
  for (const name of packet.githubVariableNames) {
    lines.push(`- \`${name}\``)
  }

  lines.push('', '## Recommended Cloudflare API Token', '')
  lines.push(`- Name: ${packet.cloudflareApiToken.recommendedName}`)
  lines.push(`- Scope boundary: ${packet.cloudflareApiToken.scopeBoundary}`)
  lines.push(`- Value handling: ${packet.cloudflareApiToken.valueHandling}`)
  lines.push('', '## Required Permissions', '')

  for (const permission of packet.cloudflareApiToken.requiredPermissions) {
    lines.push(`### ${permission.category}: ${permission.permission} ${permission.access}`)
    lines.push('')
    lines.push('Covers:')
    for (const command of permission.coveredCommands) {
      lines.push(`- \`${command}\``)
    }
    lines.push('')
  }

  lines.push('## Optional Permissions', '')
  for (const permission of packet.cloudflareApiToken.optionalPermissions) {
    lines.push(`### ${permission.category}: ${permission.permission} ${permission.access}`)
    lines.push('')
    if (permission.notes) {
      lines.push(permission.notes)
      lines.push('')
    }
    lines.push('Covers:')
    for (const command of permission.coveredCommands) {
      lines.push(`- \`${command}\``)
    }
    lines.push('')
  }

  lines.push('## Explicitly Not Required For The Guarded Workflow', '')
  for (const permission of packet.cloudflareApiToken.explicitlyNotRequired) {
    lines.push(`- ${permission.category}: ${permission.permission} ${permission.access} - ${permission.reason}`)
  }

  lines.push('', '## Checks', '')
  for (const check of packet.checks) {
    lines.push(`- ${check.status}: ${check.detail}`)
  }

  lines.push('', '## Source Evidence', '')
  for (const source of packet.sourceEvidence) {
    lines.push(`- ${source.title}: ${source.url}`)
  }

  return `${lines.join('\n')}\n`
}

const checkGeneratedAt = check && exists(outputJsonPath) ? readJson(outputJsonPath).generatedAt : undefined
const packet = buildCloudflareTokenRequirements({ generatedAt: checkGeneratedAt })
const jsonOutput = `${JSON.stringify(packet, null, 2)}\n`
const markdownOutput = renderCloudflareTokenRequirementsMarkdown(packet)

if (write) {
  writeFileSync(resolve(root, outputJsonPath), jsonOutput)
  writeFileSync(resolve(root, outputMarkdownPath), markdownOutput, 'utf8')
}

if (check) {
  assert.equal(packet.status, 'ready-for-token-entry', 'Cloudflare token requirement local contract should pass')
  assert.ok(exists(outputJsonPath), `${outputJsonPath} should exist`)
  assert.ok(exists(outputMarkdownPath), `${outputMarkdownPath} should exist`)
  assert.equal(read(outputJsonPath), jsonOutput, `${outputJsonPath} is stale`)
  assert.equal(read(outputMarkdownPath), markdownOutput, `${outputMarkdownPath} is stale`)
}

console.log(markdown ? markdownOutput : jsonOutput)

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  assert.equal(packet.status, 'ready-for-token-entry', 'Cloudflare token requirement local contract should pass')
}
