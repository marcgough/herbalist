import { spawn, spawnSync } from 'node:child_process'
import { createServer } from 'node:net'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const args = new Set(process.argv.slice(2))
const publicCorpusOnly = args.has('--public-only')
const localWranglerCli = resolve(
  root,
  'node_modules',
  'wrangler',
  'bin',
  'wrangler.js',
)
const wranglerCli = existsSync(localWranglerCli)
  ? localWranglerCli
  : process.env.APPDATA
  ? resolve(process.env.APPDATA, 'npm', 'node_modules', 'wrangler', 'bin', 'wrangler.js')
  : process.env.USERPROFILE
  ? resolve(process.env.USERPROFILE, 'AppData', 'Roaming', 'npm', 'node_modules', 'wrangler', 'bin', 'wrangler.js')
  : ''
const localWranglerCmd = resolve(root, 'node_modules', '.bin', 'wrangler.cmd')
const wranglerCmd = existsSync(localWranglerCmd)
  ? localWranglerCmd
  : process.env.APPDATA
  ? resolve(process.env.APPDATA, 'npm', 'wrangler.cmd')
  : process.env.USERPROFILE
  ? resolve(process.env.USERPROFILE, 'AppData', 'Roaming', 'npm', 'wrangler.cmd')
  : ''
const powerShell = process.platform === 'win32'
  ? process.env.ProgramFiles
    ? resolve(process.env.ProgramFiles, 'PowerShell', '7', 'pwsh.exe')
    : 'powershell.exe'
  : ''

if (!wranglerCli) {
  throw new Error('Could not find a local or global Wrangler CLI entrypoint for release verification.')
}

const quoteShellArg = (value) => {
  if (/^[A-Za-z0-9_@%+=:,./\\-]+$/.test(value)) {
    return value
  }

  return `"${value.replace(/"/g, '\\"')}"`
}
const quotePowerShellArg = (value) => `'${String(value).replace(/'/g, "''")}'`
const commandString = (parts) => parts.map(quoteShellArg).join(' ')

const run = (label, command) => {
  const started = Date.now()
  const result = spawnSync(command, {
    cwd: root,
    encoding: 'utf8',
    shell: true,
  })

  if (result.error || result.status !== 0) {
    throw new Error(
      [
        `${label} failed`,
        `Command: ${command}`,
        result.error?.message,
        result.stdout?.trim(),
        result.stderr?.trim(),
      ]
        .filter(Boolean)
        .join('\n'),
    )
  }

  return {
    label,
    seconds: Number(((Date.now() - started) / 1000).toFixed(1)),
    output: result.stdout.trim(),
  }
}

const getOpenPort = async () =>
  new Promise((resolvePort, rejectPort) => {
    const server = createServer()
    server.on('error', rejectPort)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      server.close(() => {
        if (address && typeof address === 'object') {
          resolvePort(address.port)
        } else {
          rejectPort(new Error('Could not reserve an open local port'))
        }
      })
    })
  })

const fetchWithTimeout = async (url, timeoutMs = 10000) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

const waitForServer = async (url, timeoutMs = 45000) => {
  const started = Date.now()
  let lastError = ''

  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetchWithTimeout(url, 4000)
      if (response.ok) {
        return
      }
      lastError = `HTTP ${response.status}`
    } catch (error) {
      lastError = error.message
    }

    await new Promise((resolveWait) => setTimeout(resolveWait, 1000))
  }

  throw new Error(`Timed out waiting for Pages dev server: ${lastError}`)
}

const stopProcessTree = (childProcess) => {
  if (!childProcess?.pid) {
    return
  }

  if (process.platform === 'win32') {
    spawnSync(`taskkill /pid ${childProcess.pid} /t /f`, { shell: true, stdio: 'ignore' })
  } else {
    childProcess.kill('SIGTERM')
  }
}

const npm = (...args) => commandString(['npm', ...args])
const node = (...args) => commandString(['node', ...args])
const corpusRightsCheck = publicCorpusOnly
  ? ['corpus rights audit (public export mode)', npm('run', 'verify:corpus-rights', '--', '--public-only')]
  : ['corpus rights audit', npm('run', 'verify:corpus-rights')]

const checks = []

for (const [label, command] of [
  ['refresh public news seed', npm('run', 'refresh:news')],
  ['export public data snapshots', npm('run', 'export:data')],
  ['lint', npm('run', 'lint')],
  ['production build', npm('run', 'build')],
  ['GitHub Actions handoff', npm('run', 'verify:github-actions')],
  ['GitHub production readiness verifier contract', npm('run', 'verify:github-production-readiness', '--', '--skip-release-evidence')],
  ['Cloudflare production state probe', npm('run', 'verify:cloudflare-production-state')],
  ['DNS custom-domain cutover plan', npm('run', 'verify:dns-cutover')],
  ['production secret setup packet', npm('run', 'verify:production-secrets')],
  ['brand assets', npm('run', 'verify:brand')],
  ['media attribution', npm('run', 'verify:attribution')],
  ['high-tech motion system', npm('run', 'verify:motion-system')],
  ['edge policy', npm('run', 'verify:edge-policy')],
  ['feed normalization', npm('run', 'verify:feed-normalization')],
  ['static news refresh resilience', npm('run', 'verify:static-news-refresh')],
  ['signal coverage', npm('run', 'verify:signal-coverage')],
  ['signal intelligence', npm('run', 'verify:signal-intelligence')],
  ['Signals RSS', npm('run', 'verify:signals-rss')],
  ['source health', npm('run', 'verify:source-health')],
  corpusRightsCheck,
  ['public data exports', npm('run', 'verify:data-exports')],
  ['discovery metadata', npm('run', 'verify:discovery-metadata')],
  ['API catalog', npm('run', 'verify:api-catalog')],
  ['search discovery', npm('run', 'verify:search-discovery')],
  ['Australia corpus lane', npm('run', 'verify:australia-lane')],
  ['external action checklist', npm('run', 'verify:external-actions')],
  ['source governance', npm('run', 'verify:source-governance')],
  ['knowledge graph', npm('run', 'verify:knowledge-graph')],
  ['citation notes', npm('run', 'verify:citation-notes')],
  ['goal readiness audit', npm('run', 'verify:goal-readiness')],
  ['objective completion audit', npm('run', 'prepare:completion-audit')],
  ['objective completion audit signature', npm('run', 'verify:completion-audit')],
  ['launch governance', npm('run', 'verify:governance')],
  ['Seedance media endpoints', npm('run', 'verify:media-endpoints')],
  ['Cloudflare binding configurator', npm('run', 'verify:cloudflare-config')],
  ['production cutover simulation', npm('run', 'verify:production-cutover')],
  ['production deploy workflow', npm('run', 'verify:production-deploy-workflow')],
  ['production provisioning readiness', npm('run', 'verify:production-provisioning')],
  ['production environment contract', npm('run', 'verify:production-contract')],
  ['D1 production migration manifest', npm('run', 'verify:d1-manifest')],
  ['local D1 migrations', npm('run', 'verify:d1')],
  ['scheduled news Worker', npm('run', 'verify:news-worker')],
]) {
  checks.push(run(label, command))
}

const port = await getOpenPort()
const baseUrl = `http://127.0.0.1:${port}`
let stdout = ''
let stderr = ''
const serverCommand = commandString([
  process.execPath,
  wranglerCli,
  'pages',
  'dev',
  'dist',
  '--port',
  String(port),
  '--compatibility-date',
  '2026-06-15',
  '--log-level',
  'error',
])
const server =
  process.platform === 'win32'
    ? spawn(
        process.env.ComSpec || 'cmd.exe',
        [
          '/d',
          '/s',
          '/c',
          `${wranglerCmd || 'wrangler.cmd'} pages dev dist --port ${String(port)} --compatibility-date 2026-06-15 --log-level error`,
        ],
        {
          cwd: root,
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      )
    : spawn(process.execPath, [
        wranglerCli,
        'pages',
        'dev',
        'dist',
        '--port',
        String(port),
        '--compatibility-date',
        '2026-06-15',
        '--log-level',
        'error',
      ], {
        cwd: root,
        stdio: ['ignore', 'pipe', 'pipe'],
      })
server.stdout.on('data', (chunk) => {
  stdout += chunk.toString()
})
server.stderr.on('data', (chunk) => {
  stderr += chunk.toString()
})

try {
  await waitForServer(baseUrl)
  checks.push(run('Cloudflare Pages API smoke', node('scripts/verify-api.mjs', baseUrl)))
  checks.push(run('Cloudflare Pages production-shape smoke', node('scripts/verify-production.mjs', baseUrl)))
  checks.push(run('desktop and mobile visual smoke', node('scripts/verify-visual-smoke.mjs', baseUrl)))
  checks.push(run('accessibility smoke', node('scripts/verify-accessibility-smoke.mjs', baseUrl)))
} catch (error) {
  const logExcerpt = [stdout.trim(), stderr.trim()].filter(Boolean).join('\n').slice(-4000)
  throw new Error([error.message, logExcerpt ? `Pages dev log excerpt:\n${logExcerpt}` : ''].filter(Boolean).join('\n'))
} finally {
  stopProcessTree(server)
}

console.log(
  JSON.stringify(
    {
      status: 'pass',
      mode: publicCorpusOnly ? 'public-corpus-export' : 'full-local-corpus',
      pagesBaseUrl: baseUrl,
      checks: checks.map((check) => ({
        label: check.label,
        seconds: check.seconds,
      })),
    },
    null,
    2,
  ),
)
