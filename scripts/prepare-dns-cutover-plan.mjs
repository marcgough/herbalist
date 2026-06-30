import assert from 'node:assert/strict'
import { resolve4, resolve6, resolveCaa, resolveCname, resolveNs } from 'node:dns/promises'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const outputJsonPath = 'docs/dns-cutover-plan.json'
const outputMarkdownPath = 'docs/dns-cutover-plan.md'

const args = new Set(process.argv.slice(2))
const write = args.has('--write')
const check = args.has('--check')
const markdown = args.has('--markdown')
const strict = args.has('--strict')

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const readJson = (path) => JSON.parse(read(path))
const exists = (path) => existsSync(resolve(root, path))

const secretValuePattern =
  /(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]+|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i

const resolveRecord = async (type, resolver, domain) => {
  try {
    const records = await resolver(domain)
    return {
      type,
      status: records.length ? 'present' : 'missing',
      records,
    }
  } catch (error) {
    return {
      type,
      status: 'missing',
      records: [],
      error: error.code ?? error.message,
    }
  }
}

const normalizeRecords = (records) => [...records].map((record) => String(record).toLowerCase()).sort()

const hasCloudflareNameserver = (records) =>
  normalizeRecords(records).some((record) => record.endsWith('.cloudflare.com') || record.endsWith('cloudflare.com'))

const caaAllowsCloudflareIssuers = (records) => {
  if (!records.length) {
    return true
  }

  const allowed = ['letsencrypt.org', 'pki.goog', 'ssl.com']
  return records.some((record) => {
    const issue = String(record.issue ?? record.value ?? '').toLowerCase()
    return allowed.some((issuer) => issue.includes(issuer))
  })
}

export const buildDnsCutoverPlan = async ({ generatedAt = new Date().toISOString() } = {}) => {
  const contract = readJson('docs/production-environment-contract.json')
  const domain = contract.project.domain
  const docs = {
    cloudflarePagesCustomDomains: 'https://developers.cloudflare.com/pages/configuration/custom-domains/',
  }

  const [a, aaaa, cname, ns, caa] = await Promise.all([
    resolveRecord('A', resolve4, domain),
    resolveRecord('AAAA', resolve6, domain),
    resolveRecord('CNAME', resolveCname, domain),
    resolveRecord('NS', resolveNs, domain),
    resolveRecord('CAA', resolveCaa, domain),
  ])

  const cloudflareZoneReady = hasCloudflareNameserver(ns.records)
  const apexRecordPresent = a.records.length > 0 || aaaa.records.length > 0 || cname.records.length > 0
  const caaReady = caaAllowsCloudflareIssuers(caa.records)
  const currentState = {
    domain,
    nameservers: normalizeRecords(ns.records),
    nameserversProvider: cloudflareZoneReady ? 'cloudflare' : ns.records.length ? 'external-or-registrar' : 'unknown',
    cloudflareZoneReady,
    apexRecordPresent,
    caaReadyForCloudflareCertificate: caaReady,
    records: {
      a,
      aaaa,
      cname,
      ns,
      caa,
    },
  }

  const checks = [
    {
      id: 'domain-contract',
      status: domain === 'herbalisti.com' ? 'pass' : 'fail',
      detail: `Production contract domain is ${domain}.`,
    },
    {
      id: 'dns-observed',
      status: ns.records.length || apexRecordPresent ? 'pass' : 'fail',
      detail: ns.records.length
        ? `Observed ${ns.records.length} nameserver record(s).`
        : 'No nameserver or apex records were observed.',
    },
    {
      id: 'cloudflare-zone-for-apex',
      status: cloudflareZoneReady ? 'pass' : 'pending',
      detail: cloudflareZoneReady
        ? 'Apex domain nameservers already point to Cloudflare.'
        : 'Apex domain is not yet delegated to Cloudflare nameservers.',
    },
    {
      id: 'caa-certificate-readiness',
      status: caaReady ? 'pass' : 'pending',
      detail: caa.records.length
        ? 'CAA records are present; confirm they allow Cloudflare-supported certificate issuance.'
        : 'No CAA records are present, so no CAA restriction was detected.',
    },
    {
      id: 'cloudflare-pages-custom-domain-source',
      status: docs.cloudflarePagesCustomDomains.startsWith('https://developers.cloudflare.com/') ? 'pass' : 'fail',
      detail: 'Cloudflare Pages custom-domain source URL is recorded.',
    },
  ]

  const status = checks.some((item) => item.status === 'fail')
    ? 'local-contract-failed'
    : cloudflareZoneReady && caaReady
    ? 'dns-ready-for-pages-custom-domain'
    : 'needs-dns-cutover'

  return {
    version: 1,
    generatedAt,
    status,
    productionComplete: false,
    safeToRun:
      'Reads public DNS records and local launch contracts, then optionally writes docs/dns-cutover-plan files. It does not call Cloudflare APIs, change nameservers, mutate DNS, deploy, create resources, set secrets, call paid APIs, or print secret values.',
    project: contract.project,
    docs,
    currentState,
    checks,
    targetState: {
      cloudflarePagesProject: contract.project.pagesProject,
      apexDomain: domain,
      apexDomainRequirement:
        'For a Cloudflare Pages apex domain, the domain must be a zone in the same Cloudflare account as the Pages project, with nameservers delegated to Cloudflare before custom-domain activation.',
      canonicalRedirects: [`http://${domain} -> https://${domain}/`, `https://www.${domain} -> https://${domain}/`],
      liveVerification: contract.commands.liveCompletionGates,
    },
    operatorSequence: [
      {
        id: 'confirm-cloudflare-zone-route',
        sideEffect: 'approval-required-dns-provider-decision',
        detail:
          'Use Cloudflare Pages custom-domain setup for the apex domain. Cloudflare documentation says an apex Pages domain must be a Cloudflare zone in the same account as the Pages project.',
      },
      {
        id: 'delegate-nameservers',
        sideEffect: 'mutates-public-dns',
        detail:
          'At the registrar, replace the current nameservers with the two nameservers assigned by Cloudflare for herbalisti.com.',
      },
      {
        id: 'attach-pages-custom-domain',
        sideEffect: 'mutates-cloudflare-pages-domain',
        detail:
          'In Workers & Pages, open the herbalisti Pages project, add herbalisti.com as a custom domain, and let Cloudflare create or validate the required DNS record.',
      },
      {
        id: 'configure-www-canonical-route',
        sideEffect: 'mutates-cloudflare-dns-or-redirects',
        detail:
          'Add www.herbalisti.com only as a redirect/canonical route to the apex domain, keeping herbalisti.com as the public canonical URL.',
      },
      {
        id: 'verify-live-domain',
        sideEffect: 'none',
        commands: ['npm run verify:dns-cutover', 'npm run verify:live-readiness -- --strict'],
      },
    ],
    nextActions:
      status === 'dns-ready-for-pages-custom-domain'
        ? ['Attach herbalisti.com to the Cloudflare Pages project after approved Cloudflare resource setup.']
        : [
            'Prepare Cloudflare zone delegation for herbalisti.com.',
            'Capture the Cloudflare-assigned nameservers during approved setup.',
            'Change registrar nameservers only after approval for public DNS mutation.',
            'Attach herbalisti.com as a Cloudflare Pages custom domain after the Pages project exists.',
          ],
  }
}

export const renderDnsCutoverMarkdown = (packet) => {
  const lines = [
    '# Herbalisti DNS Cutover Plan',
    '',
    `Generated: ${packet.generatedAt}`,
    '',
    `Status: ${packet.status}`,
    '',
    packet.safeToRun,
    '',
    '## Current DNS',
    '',
    `- Domain: ${packet.currentState.domain}`,
    `- Nameserver provider: ${packet.currentState.nameserversProvider}`,
    `- Cloudflare zone ready: ${packet.currentState.cloudflareZoneReady}`,
    `- Apex record present: ${packet.currentState.apexRecordPresent}`,
    `- CAA ready for Cloudflare certificate: ${packet.currentState.caaReadyForCloudflareCertificate}`,
    `- Nameservers: ${packet.currentState.nameservers.join(', ') || 'none observed'}`,
    `- A records: ${packet.currentState.records.a.records.join(', ') || 'none observed'}`,
    `- AAAA records: ${packet.currentState.records.aaaa.records.join(', ') || 'none observed'}`,
    `- CNAME records: ${packet.currentState.records.cname.records.join(', ') || 'none observed'}`,
    '',
    '## Target',
    '',
    `- Cloudflare Pages project: ${packet.targetState.cloudflarePagesProject}`,
    `- Apex domain: ${packet.targetState.apexDomain}`,
    `- Requirement: ${packet.targetState.apexDomainRequirement}`,
    `- Source: ${packet.docs.cloudflarePagesCustomDomains}`,
    '',
    'Canonical redirects:',
    '',
  ]

  for (const redirect of packet.targetState.canonicalRedirects) {
    lines.push(`- ${redirect}`)
  }

  lines.push('', '## Checks', '')
  for (const checkItem of packet.checks) {
    lines.push(`- ${checkItem.status}: ${checkItem.detail}`)
  }

  lines.push('', '## Operator Sequence', '')
  for (const step of packet.operatorSequence) {
    lines.push(`### ${step.id}`)
    lines.push('')
    lines.push(`Side effect: ${step.sideEffect}`)
    lines.push('')
    if (step.detail) {
      lines.push(step.detail)
      lines.push('')
    }
    if (step.commands?.length) {
      lines.push('```bash')
      for (const command of step.commands) {
        lines.push(command)
      }
      lines.push('```')
      lines.push('')
    }
  }

  lines.push('## Next Actions', '')
  for (const action of packet.nextActions) {
    lines.push(`- ${action}`)
  }
  lines.push('')

  return lines.join('\n')
}

const checkGeneratedAt = check && exists(outputJsonPath) ? readJson(outputJsonPath).generatedAt : undefined
const packet = await buildDnsCutoverPlan({ generatedAt: checkGeneratedAt })
const jsonOutput = `${JSON.stringify(packet, null, 2)}\n`
const markdownOutput = renderDnsCutoverMarkdown(packet)

if (write) {
  writeFileSync(resolve(root, outputJsonPath), jsonOutput)
  writeFileSync(resolve(root, outputMarkdownPath), markdownOutput, 'utf8')
}

if (check) {
  assert.notEqual(packet.status, 'local-contract-failed', 'DNS cutover plan local contract should pass')
  assert.ok(exists(outputJsonPath), `${outputJsonPath} should exist`)
  assert.ok(exists(outputMarkdownPath), `${outputMarkdownPath} should exist`)
  const storedJson = readJson(outputJsonPath)
  const storedMarkdown = read(outputMarkdownPath)
  assert.equal(storedJson.version, 1, `${outputJsonPath} should be version 1`)
  assert.equal(storedJson.project.domain, packet.project.domain, `${outputJsonPath} should target the production domain`)
  assert.ok(
    storedMarkdown.includes('Cloudflare Pages project') && storedMarkdown.includes('Operator Sequence'),
    `${outputMarkdownPath} should include the Pages target and operator sequence`,
  )
}

const combinedText = `${jsonOutput}\n${markdownOutput}`
assert.equal(secretValuePattern.test(combinedText), false, 'DNS cutover plan must not contain secret-looking values')

console.log(markdown ? markdownOutput : jsonOutput)

if (strict && packet.status !== 'dns-ready-for-pages-custom-domain') {
  process.exitCode = 1
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  assert.notEqual(packet.status, 'local-contract-failed', 'DNS cutover plan local contract should pass')
}
