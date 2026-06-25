import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = resolve(fileURLToPath(new URL('.', import.meta.url)))
const projectRoot = resolve(scriptDir, '..', '..')

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, rawValue = 'true'] = argument.replace(/^--/, '').split('=')
    return [key, rawValue]
  }),
)

const runStatus = args.get('run-status') !== 'false'

const parseJsonFromStdout = (stdout) => {
  const startIndex = String(stdout ?? '').indexOf('{')
  if (startIndex < 0) {
    return null
  }

  return JSON.parse(String(stdout).slice(startIndex))
}

const runNodeScript = async (scriptPath) =>
  new Promise((resolveRun, rejectRun) => {
    const child = spawn(process.execPath, [scriptPath], {
      cwd: projectRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    child.on('error', rejectRun)
    child.on('close', (code) => {
      if (code !== 0) {
        rejectRun(new Error(stderr.trim() || stdout.trim() || `${scriptPath} failed with exit code ${code}`))
        return
      }

      resolveRun({
        scriptPath,
        stdout,
        stderr,
        payload: parseJsonFromStdout(stdout),
      })
    })
  })

const commandSpecs = [
  { label: 'reconcile', path: resolve(scriptDir, 'reconcile-registry-from-manifests.mjs') },
  { label: 'edition-families', path: resolve(scriptDir, 'build-edition-families.mjs') },
  { label: 'acquisition-frontier', path: resolve(scriptDir, 'build-acquisition-frontier.mjs') },
  { label: 'corpus-evidence', path: resolve(scriptDir, 'build-corpus-evidence.mjs') },
  { label: 'thin-work-review', path: resolve(scriptDir, 'build-thin-work-review.mjs') },
  { label: 'term-families', path: resolve(scriptDir, 'build-term-families.mjs') },
  { label: 'seed-catalog', path: resolve(scriptDir, 'build-seed-catalog.mjs') },
  { label: 'herb-profiles', path: resolve(scriptDir, 'build-herb-profiles.mjs') },
  { label: 'seed-review-priority', path: resolve(scriptDir, 'build-seed-review-priority.mjs') },
  { label: 'reference-catalog', path: resolve(scriptDir, 'build-reference-catalog.mjs') },
  { label: 'herbal-corpus-export', path: resolve(scriptDir, 'build-herbal-corpus.mjs') },
  { label: 'australia-lane', path: resolve(scriptDir, 'build-australia-lane.mjs') },
  { label: 'public-data-export', path: resolve(projectRoot, 'scripts', 'export-public-data.mjs') },
  { label: 'corpus-memory-refresh', path: resolve(projectRoot, 'scripts', 'corpus-memory', 'refresh.mjs') },
]

if (runStatus) {
  commandSpecs.push({
    label: 'corpus-status',
    path: resolve(scriptDir, 'report-status.mjs'),
  })
}

const steps = []

for (const spec of commandSpecs) {
  const result = await runNodeScript(spec.path)
  steps.push({
    label: spec.label,
    payload: result.payload,
  })
}

const finalStatus = steps.find((step) => step.label === 'corpus-status')?.payload ?? null
const memoryRefresh = steps.find((step) => step.label === 'corpus-memory-refresh')?.payload ?? null

console.log(
  JSON.stringify(
    {
      ok: true,
      steps,
      summary: {
        chunkedCount: finalStatus?.chunkedCount ?? null,
        discoveredCount: finalStatus?.discoveredCount ?? null,
        failedCount: finalStatus?.failedCount ?? null,
        totalWorks: finalStatus?.totalWorks ?? null,
        corpusMemoryDocuments: memoryRefresh?.totals?.totalDocuments ?? null,
      },
    },
    null,
    2,
  ),
)
