import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'

const args = process.argv.slice(2)
const argSet = new Set(args)

const getArg = (name, fallback) => {
  const index = args.indexOf(name)
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback
}

const databaseName = getArg('--name', 'herbalisti')
const githubEnvPath = getArg('--github-env', process.env.GITHUB_ENV ?? '')
const createIfMissing = argSet.has('--create-if-missing')

const uuidPattern = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i
const secretValuePattern =
  /(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Bearer\s+[A-Za-z0-9._-]+|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i

const runWrangler = (wranglerArgs) =>
  execFileSync('npx', ['wrangler', ...wranglerArgs], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

const normalizeDatabases = (payload) => {
  if (Array.isArray(payload)) {
    return payload
  }
  if (Array.isArray(payload?.result)) {
    return payload.result
  }
  if (Array.isArray(payload?.databases)) {
    return payload.databases
  }
  return []
}

const databaseFields = (database) => ({
  name: database.name ?? database.database_name ?? '',
  id: database.uuid ?? database.id ?? database.database_id ?? '',
})

const listDatabases = () => {
  const output = runWrangler(['d1', 'list', '--json'])
  const payload = JSON.parse(output)
  return normalizeDatabases(payload).map(databaseFields)
}

const findDatabase = () => listDatabases().find((database) => database.name === databaseName && database.id)

let database = findDatabase()
let created = false
let createOutput = ''

if (!database && createIfMissing) {
  createOutput = runWrangler(['d1', 'create', databaseName])
  created = true
  database = findDatabase()
  if (!database) {
    const uuid = createOutput.match(uuidPattern)?.[0] ?? ''
    if (uuid) {
      database = {
        name: databaseName,
        id: uuid,
      }
    }
  }
}

assert(database?.id, `Cloudflare D1 database ${databaseName} was not found`)
assert(uuidPattern.test(database.id), `Cloudflare D1 database ID for ${databaseName} does not look like a UUID`)

if (githubEnvPath) {
  appendFileSync(githubEnvPath, `CLOUDFLARE_D1_DATABASE_ID=${database.id}\n`)
  appendFileSync(githubEnvPath, `HERBALISTI_D1_DATABASE_ID=${database.id}\n`)
}

const result = {
  status: created ? 'created' : 'found',
  databaseName,
  databaseId: database.id,
  wroteGithubEnv: Boolean(githubEnvPath),
  safeToRun:
    'Lists Cloudflare D1 databases and, only with --create-if-missing, creates the named D1 database during an already approved production workflow. It does not read, set, or print secret values.',
}

assert.equal(secretValuePattern.test(JSON.stringify(result)), false, 'Result must not contain secret-looking values')

console.log(JSON.stringify(result, null, 2))
