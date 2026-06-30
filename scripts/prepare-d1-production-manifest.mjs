import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const migrationsPath = 'migrations'
const outputJsonPath = 'docs/d1-production-migration-manifest.json'
const outputMarkdownPath = 'docs/d1-production-migration-manifest.md'

const args = new Set(process.argv.slice(2))
const write = args.has('--write')
const check = args.has('--check')
const markdown = args.has('--markdown')

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const readJson = (path) => JSON.parse(read(path))
const exists = (path) => existsSync(resolve(root, path))
const sha256 = (value) => createHash('sha256').update(value).digest('hex')

const secretValuePattern =
  /(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]+|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i

const unique = (items) => [...new Set(items)].sort()

const matches = (pattern, value) => {
  const results = []
  for (const match of value.matchAll(pattern)) {
    results.push(match[1])
  }
  return results
}

const expectedSequence = (files) =>
  files.map((_, index) => String(index + 1).padStart(4, '0'))

const buildMigrationRecord = (file) => {
  const relativePath = `${migrationsPath}/${file}`
  const sql = read(relativePath)

  return {
    file: relativePath,
    bytes: Buffer.byteLength(sql, 'utf8'),
    sha256: sha256(sql),
    createsTables: unique(matches(/\bCREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([A-Za-z_][A-Za-z0-9_]*)/gi, sql)),
    altersTables: unique(matches(/\bALTER\s+TABLE\s+([A-Za-z_][A-Za-z0-9_]*)/gi, sql)),
    createsIndexes: unique(
      matches(/\bCREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?([A-Za-z_][A-Za-z0-9_]*)/gi, sql),
    ),
    insertTargets: unique(
      matches(/\bINSERT\s+(?:OR\s+(?:REPLACE|IGNORE|ABORT|FAIL|ROLLBACK)\s+)?INTO\s+([A-Za-z_][A-Za-z0-9_]*)/gi, sql),
    ),
    updateTargets: unique(matches(/\bUPDATE\s+([A-Za-z_][A-Za-z0-9_]*)/gi, sql)),
  }
}

export const buildD1ProductionManifest = ({ generatedAt = new Date().toISOString() } = {}) => {
  const packageJson = readJson('package.json')
  const contract = readJson('docs/production-environment-contract.json')
  const migrationFiles = readdirSync(resolve(root, migrationsPath))
    .filter((file) => file.endsWith('.sql'))
    .sort()

  const migrations = migrationFiles.map(buildMigrationRecord)
  const combinedFingerprint = sha256(
    JSON.stringify(
      migrations.map((migration) => ({
        file: migration.file,
        sha256: migration.sha256,
      })),
    ),
  )

  const sequence = expectedSequence(migrationFiles)
  const sequenceNumbers = migrationFiles.map((file) => file.slice(0, 4))
  const allSql = migrationFiles.map((file) => read(`${migrationsPath}/${file}`)).join('\n')

  const checks = [
    {
      id: 'migration-directory',
      status: migrationFiles.length > 0 ? 'pass' : 'fail',
      detail: `${migrationFiles.length} SQL migration files found in ${migrationsPath}.`,
    },
    {
      id: 'file-naming',
      status: migrationFiles.every((file) => /^\d{4}_[a-z0-9_]+\.sql$/.test(file)) ? 'pass' : 'fail',
      detail: 'Migration files use the ordered NNNN_description.sql naming pattern.',
    },
    {
      id: 'continuous-sequence',
      status: sequenceNumbers.every((value, index) => value === sequence[index]) ? 'pass' : 'fail',
      detail: `Migration sequence: ${sequenceNumbers.join(', ')}.`,
    },
    {
      id: 'production-contract',
      status:
        contract.project.d1Database === 'herbalisti' &&
        contract.resources.some((resource) => resource.id === 'cloudflare-d1' && resource.migrationsPath === migrationsPath)
          ? 'pass'
          : 'fail',
      detail: 'Production contract points Cloudflare D1 at the herbalisti migration directory.',
    },
    {
      id: 'local-d1-verifier',
      status: Boolean(packageJson.scripts?.['verify:d1']) ? 'pass' : 'fail',
      detail: 'Local D1 migration verifier is exposed as npm run verify:d1.',
    },
    {
      id: 'remote-command-recorded',
      status: contract.commands.remoteMigrations?.[0] === 'npx wrangler d1 migrations apply herbalisti --remote' ? 'pass' : 'fail',
      detail: 'Remote D1 migration command is recorded in the production contract.',
    },
    {
      id: 'no-secret-values',
      status: secretValuePattern.test(allSql) ? 'fail' : 'pass',
      detail: 'Migration SQL does not contain obvious API keys, bearer tokens, or private keys.',
    },
  ]

  const failedChecks = checks.filter((item) => item.status !== 'pass')

  return {
    version: 1,
    generatedAt,
    status: failedChecks.length ? 'fail' : 'pass',
    productionComplete: false,
    safeToRun:
      'Reads local migration SQL and launch contracts, then optionally writes docs/d1-production-migration-manifest files. It does not call Cloudflare, apply remote migrations, deploy, mutate DNS, create resources, call paid APIs, or print secret values.',
    project: {
      databaseName: contract.project.d1Database,
      binding: 'HERBALISTI_DB',
      migrationsPath,
      remoteMigrationCommand: contract.commands.remoteMigrations?.[0] ?? '',
      localVerificationCommand: 'npm run verify:d1',
    },
    summary: {
      migrationCount: migrations.length,
      totalBytes: migrations.reduce((sum, migration) => sum + migration.bytes, 0),
      manifestFingerprint: combinedFingerprint,
      tablesCreated: unique(migrations.flatMap((migration) => migration.createsTables)),
      tablesAltered: unique(migrations.flatMap((migration) => migration.altersTables)),
      seedTargets: unique(migrations.flatMap((migration) => migration.insertTargets)),
      indexesCreated: unique(migrations.flatMap((migration) => migration.createsIndexes)),
    },
    checks,
    migrations,
    productionGuardrail:
      'Apply remote D1 migrations only after this manifest, npm run verify:d1, npm run verify:launch -- --soft, npm run verify:production-contract, and approved Cloudflare D1 provisioning have passed.',
  }
}

export const renderD1ProductionManifestMarkdown = (packet) => {
  const lines = [
    '# Herbalisti D1 Production Migration Manifest',
    '',
    `Generated: ${packet.generatedAt}`,
    '',
    `Status: ${packet.status}`,
    '',
    packet.safeToRun,
    '',
    '## Project',
    '',
    `- Database: ${packet.project.databaseName}`,
    `- Binding: ${packet.project.binding}`,
    `- Migrations path: ${packet.project.migrationsPath}`,
    `- Remote command: \`${packet.project.remoteMigrationCommand}\``,
    `- Local verifier: \`${packet.project.localVerificationCommand}\``,
    '',
    '## Summary',
    '',
    `- Migration files: ${packet.summary.migrationCount}`,
    `- Total bytes: ${packet.summary.totalBytes}`,
    `- Manifest fingerprint: \`${packet.summary.manifestFingerprint}\``,
    `- Tables created: ${packet.summary.tablesCreated.join(', ') || 'none'}`,
    `- Tables altered: ${packet.summary.tablesAltered.join(', ') || 'none'}`,
    `- Seed targets: ${packet.summary.seedTargets.join(', ') || 'none'}`,
    '',
    '## Checks',
    '',
  ]

  for (const checkItem of packet.checks) {
    lines.push(`- ${checkItem.status}: ${checkItem.detail}`)
  }

  lines.push('', '## Migrations', '')
  for (const migration of packet.migrations) {
    lines.push(`### ${migration.file}`)
    lines.push('')
    lines.push(`- SHA-256: \`${migration.sha256}\``)
    lines.push(`- Bytes: ${migration.bytes}`)
    lines.push(`- Creates tables: ${migration.createsTables.join(', ') || 'none'}`)
    lines.push(`- Alters tables: ${migration.altersTables.join(', ') || 'none'}`)
    lines.push(`- Insert targets: ${migration.insertTargets.join(', ') || 'none'}`)
    lines.push('')
  }

  lines.push('## Production Guardrail', '', packet.productionGuardrail, '')

  return `${lines.join('\n')}`
}

const checkGeneratedAt = check && exists(outputJsonPath) ? readJson(outputJsonPath).generatedAt : undefined
const packet = buildD1ProductionManifest({ generatedAt: checkGeneratedAt })
const jsonOutput = `${JSON.stringify(packet, null, 2)}\n`
const markdownOutput = renderD1ProductionManifestMarkdown(packet)

if (write) {
  writeFileSync(resolve(root, outputJsonPath), jsonOutput)
  writeFileSync(resolve(root, outputMarkdownPath), markdownOutput, 'utf8')
}

if (check) {
  assert.equal(packet.status, 'pass', 'D1 production migration manifest checks should pass')
  assert.ok(exists(outputJsonPath), `${outputJsonPath} should exist`)
  assert.ok(exists(outputMarkdownPath), `${outputMarkdownPath} should exist`)
  assert.equal(read(outputJsonPath), jsonOutput, `${outputJsonPath} is stale`)
  assert.equal(read(outputMarkdownPath), markdownOutput, `${outputMarkdownPath} is stale`)
}

console.log(markdown ? markdownOutput : jsonOutput)

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  assert.equal(packet.status, 'pass', 'D1 production migration manifest checks should pass')
}
