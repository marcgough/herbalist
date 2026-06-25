import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { exportsDir, loadWorksRegistry, summarizeManifestArchive, writeJson } from './lib.mjs'

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, rawValue = 'true'] = argument.replace(/^--/, '').split('=')
    return [key, rawValue]
  }),
)

const cycles = Math.max(1, Number(args.get('cycles') ?? 2) || 2)
const nlmLimit = Math.max(0, Number(args.get('nlm-limit') ?? 6) || 0)
const wellcomeLimit = Math.max(0, Number(args.get('wellcome-limit') ?? 8) || 0)
const stageFilter = String(args.get('stage') ?? 'uncovered_family').trim()
const profileRef = String(args.get('profile') ?? '').trim()
const dryRun = args.get('dry-run') === 'true'
const rebuildDerived = args.get('rebuild-derived') !== 'false'
const runStatus = args.get('run-status') !== 'false'
const selectionStrategy = String(args.get('selection-strategy') ?? 'diverse').trim()
const diversityScanWindow = Math.max(1, Number(args.get('diversity-scan-window') ?? 60) || 60)
const stopOnEmpty = args.get('stop-on-empty') !== 'false'
const haltOnFailure = args.get('halt-on-failure') !== 'false'
const avoidRepeatSeries = args.get('avoid-repeat-series') !== 'false'
const summaryPath = resolve(exportsDir, 'frontier-campaign-summary.json')
const batchSummaryPath = resolve(exportsDir, 'frontier-batch-summary.json')
const scriptDir = resolve(fileURLToPath(new URL('.', import.meta.url)))
const projectRootDir = resolve(scriptDir, '..', '..')

const runNodeScript = async (scriptPath, scriptArgs = []) =>
  new Promise((resolveRun, rejectRun) => {
    const child = spawn(process.execPath, [scriptPath, ...scriptArgs], {
      cwd: projectRootDir,
      stdio: ['ignore', 'pipe', 'pipe'],
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
        rejectRun(new Error(stderr.trim() || stdout.trim() || `Command failed with exit code ${code}`))
        return
      }

      resolveRun({
        code,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      })
    })
  })

const parseJsonOutput = (result) => {
  try {
    const startIndex = result.stdout.indexOf('{')
    return JSON.parse(startIndex >= 0 ? result.stdout.slice(startIndex) : result.stdout)
  } catch {
    return {
      rawOutput: result.stdout,
    }
  }
}

const summarizeCommandOutput = (name, output) => {
  if (!output || typeof output !== 'object') {
    return output
  }

  if (name === 'corpus:nlm' || name === 'corpus:wellcome') {
    return {
      processedCount: Number(output.processedCount ?? 0),
      failureCount: Number(output.failureCount ?? 0),
      discoveredCount: Number(output.discoveredCount ?? 0),
      scannedResults: Number(output.scannedResults ?? 0),
      summaryPath: output.summaryPath ?? null,
    }
  }

  if (name === 'corpus:reconcile') {
    return {
      scannedManifestCount: Number(output.scannedManifestCount ?? 0),
      updatedCount: Number(output.updatedCount ?? 0),
      missingRegistryRowCount: Number(output.missingRegistryRowCount ?? 0),
    }
  }

  if (name === 'build-edition-families') {
    return {
      familyCount: Number(output.familyCount ?? 0),
      multiWorkFamilyCount: Number(output.multiWorkFamilyCount ?? 0),
      highConfidenceFamilyCount: Number(output.highConfidenceFamilyCount ?? 0),
      summaryPath: output.summaryPath ?? null,
    }
  }

  if (name === 'build-acquisition-frontier') {
    return {
      frontierFamilyCount: Number(output.frontierFamilyCount ?? 0),
      uncoveredFamilyCount: Number(output.uncoveredFamilyCount ?? 0),
      depthFamilyCount: Number(output.depthFamilyCount ?? 0),
      failedOnlyFamilyCount: Number(output.failedOnlyFamilyCount ?? 0),
      summaryPath: output.summaryPath ?? null,
    }
  }

  if (name === 'build-corpus-evidence') {
    return {
      herbCandidateCount: Number(output.herbCandidateCount ?? 0),
      chunkSignalCount: Number(output.chunkSignalCount ?? 0),
      graphNodeCount: Number(output.graphNodeCount ?? 0),
      graphEdgeCount: Number(output.graphEdgeCount ?? 0),
      summaryPath: output.summaryPath ?? null,
    }
  }

  if (name === 'build-thin-work-review') {
    return {
      flaggedCount: Number(output.flaggedCount ?? 0),
      severeThinCount: Number(output.severeThinCount ?? 0),
      fragmentFlagCount: Number(output.fragmentFlagCount ?? 0),
      referenceFlagCount: Number(output.referenceFlagCount ?? 0),
      summaryPath: output.outputPaths?.summaryPath ?? output.summaryPath ?? null,
    }
  }

  if (name === 'build-term-families') {
    return {
      totalFamilies: Number(output.totalFamilies ?? 0),
      acceptedFamilies: Number(output.acceptedFamilies ?? 0),
      reviewFamilies: Number(output.reviewFamilies ?? 0),
      rejectedFamilies: Number(output.rejectedFamilies ?? 0),
      summaryPath: output.summaryPath ?? null,
    }
  }

  if (name === 'build-seed-catalog') {
    return {
      seedReadyFamilies: Number(output.summary?.seedReadyFamilies ?? 0),
      supportingFamilies: Number(output.summary?.supportingFamilies ?? 0),
      reviewFamilies: Number(output.summary?.reviewFamilies ?? 0),
      excludedFamilies: Number(output.summary?.excludedFamilies ?? 0),
      generatedAt: output.summary?.generatedAt ?? null,
      seedCatalogDir: output.seedCatalogDir ?? null,
    }
  }

  if (name === 'build-herb-profiles') {
    return {
      profileCount: Number(output.profileCount ?? 0),
      sampleLimit: Number(output.sampleLimit ?? 0),
      summaryPath: output.summaryPath ?? null,
      herbProfilesDir: output.herbProfilesDir ?? null,
    }
  }

  if (name === 'build-seed-review-priority') {
    return {
      totalReviewFamilies: Number(output.totalReviewFamilies ?? 0),
      promotionCandidateCount: Number(output.promotionCandidateCount ?? 0),
      identityReviewCount: Number(output.identityReviewCount ?? 0),
      secondaryCandidateCount: Number(output.secondaryCandidateCount ?? 0),
      deprioritizedCount: Number(output.deprioritizedCount ?? 0),
      summaryPath: output.summaryPath ?? null,
    }
  }

  if (name === 'corpus:status') {
    return {
      totalWorks: Number(output.totalWorks ?? 0),
      chunkedCount: Number(output.chunkedCount ?? 0),
      discoveredCount: Number(output.discoveredCount ?? 0),
      failedCount: Number(output.failedCount ?? 0),
      totalChunkRecords: Number(output.totalChunkRecords ?? 0),
      byCollection: output.byCollection ?? {},
      topTopics: output.topTopics ?? [],
    }
  }

  return output
}

const summarizeBatchSummary = (summary) => ({
  generatedAt: summary.generatedAt ?? null,
  stageFilter: summary.stageFilter ?? null,
  dryRun: Boolean(summary.dryRun),
  rebuildDerived: Boolean(summary.rebuildDerived),
  runStatus: Boolean(summary.runStatus),
  selectionStrategy: summary.selectionStrategy ?? null,
  diversityScanWindow: Number(summary.diversityScanWindow ?? 0),
  selected: summary.selected ?? {},
  selectedCount: Object.values(summary.selected ?? {}).reduce((total, rows) => total + rows.length, 0),
  selectedByCollection: Object.fromEntries(
    Object.entries(summary.selected ?? {}).map(([collectionId, rows]) => [collectionId, rows.length]),
  ),
  commands: Array.isArray(summary.commands)
    ? summary.commands.map((command) => ({
        name: command.name,
        args: command.args ?? [],
        output: summarizeCommandOutput(command.name, command.output),
      }))
    : [],
  failedCommand: summary.failedCommand ?? null,
})

const buildSnapshot = async () => {
  const works = await loadWorksRegistry()
  const manifestSummary = await summarizeManifestArchive()
  const chunked = works.filter((work) => work.ingest_status === 'chunked')
  const failed = works.filter((work) => work.ingest_status === 'download_failed')
  const discovered = works.filter((work) => work.ingest_status === 'discovered')
  const byCollection = works.reduce((collections, work) => {
    const key = work.collection_id || 'unknown'
    collections[key] ??= { total: 0, chunked: 0, discovered: 0, failed: 0, chunkRecords: 0, paragraphRecords: 0 }
    collections[key].total += 1
    if (work.ingest_status === 'chunked') collections[key].chunked += 1
    if (work.ingest_status === 'discovered') collections[key].discovered += 1
    if (work.ingest_status === 'download_failed') collections[key].failed += 1
    return collections
  }, {})

  for (const [collectionId, counts] of Object.entries(manifestSummary.byCollection)) {
    byCollection[collectionId] ??= { total: 0, chunked: 0, discovered: 0, failed: 0, chunkRecords: 0, paragraphRecords: 0 }
    byCollection[collectionId].chunkRecords = counts.chunkRecords
    byCollection[collectionId].paragraphRecords = counts.paragraphRecords
  }

  return {
    totalWorks: works.length,
    chunkedCount: chunked.length,
    discoveredCount: discovered.length,
    failedCount: failed.length,
    totalChunkRecords: manifestSummary.totalChunkRecords,
    totalParagraphRecords: manifestSummary.totalParagraphRecords,
    manifestWorkCount: manifestSummary.totalWorks,
    byCollection,
  }
}

const buildDelta = (before, after) => {
  const allCollectionIds = new Set([...Object.keys(before.byCollection ?? {}), ...Object.keys(after.byCollection ?? {})])
  const byCollection = {}

  for (const collectionId of allCollectionIds) {
    const previous = before.byCollection?.[collectionId] ?? {}
    const current = after.byCollection?.[collectionId] ?? {}
    byCollection[collectionId] = {
      total: Number(current.total ?? 0) - Number(previous.total ?? 0),
      chunked: Number(current.chunked ?? 0) - Number(previous.chunked ?? 0),
      discovered: Number(current.discovered ?? 0) - Number(previous.discovered ?? 0),
      failed: Number(current.failed ?? 0) - Number(previous.failed ?? 0),
      chunkRecords: Number(current.chunkRecords ?? 0) - Number(previous.chunkRecords ?? 0),
      paragraphRecords: Number(current.paragraphRecords ?? 0) - Number(previous.paragraphRecords ?? 0),
    }
  }

  return {
    totalWorks: after.totalWorks - before.totalWorks,
    chunkedCount: after.chunkedCount - before.chunkedCount,
    discoveredCount: after.discoveredCount - before.discoveredCount,
    failedCount: after.failedCount - before.failedCount,
    totalChunkRecords: after.totalChunkRecords - before.totalChunkRecords,
    totalParagraphRecords: after.totalParagraphRecords - before.totalParagraphRecords,
    byCollection,
  }
}

const batchScriptPath = resolve(scriptDir, 'run-frontier-batch.mjs')

const result = {
  generatedAt: new Date().toISOString(),
  options: {
    cycles,
    nlmLimit,
    wellcomeLimit,
    stageFilter,
    profileRef,
    dryRun,
    rebuildDerived,
    runStatus,
    selectionStrategy,
    diversityScanWindow,
    stopOnEmpty,
    haltOnFailure,
    avoidRepeatSeries,
  },
  initialSnapshot: await buildSnapshot(),
  cycles: [],
  stoppedReason: null,
  failedCycle: null,
  summaryPath,
}

let currentSnapshot = result.initialSnapshot
const excludedWorkIds = new Set()
const excludedSeriesKeys = new Set()
const excludedCreatorSeriesKeys = new Set()

for (let cycleIndex = 0; cycleIndex < cycles; cycleIndex += 1) {
  const cycleNumber = cycleIndex + 1
  const batchArgs = [
    `--nlm-limit=${nlmLimit}`,
    `--wellcome-limit=${wellcomeLimit}`,
    `--stage=${stageFilter}`,
    `--dry-run=${dryRun}`,
    `--rebuild-derived=${rebuildDerived}`,
    `--run-status=${runStatus}`,
    `--selection-strategy=${selectionStrategy}`,
    `--diversity-scan-window=${diversityScanWindow}`,
  ]

  if (excludedWorkIds.size > 0) {
    batchArgs.push(`--exclude-work-ids=${[...excludedWorkIds].join(',')}`)
  }

  if (profileRef) {
    batchArgs.push(`--profile=${profileRef}`)
  }

  if (avoidRepeatSeries && excludedSeriesKeys.size > 0) {
    batchArgs.push(`--exclude-series-keys=${[...excludedSeriesKeys].join(',')}`)
  }

  if (avoidRepeatSeries && excludedCreatorSeriesKeys.size > 0) {
    batchArgs.push(`--exclude-creator-series-keys=${[...excludedCreatorSeriesKeys].join(',')}`)
  }

  let batchOutput = null
  let batchSummary = null
  let cycleError = null

  try {
    const commandResult = await runNodeScript(batchScriptPath, batchArgs)
    batchOutput = parseJsonOutput(commandResult)
  } catch (error) {
    cycleError = error
  }

  try {
    batchSummary = JSON.parse(await readFile(batchSummaryPath, 'utf8'))
  } catch {
    batchSummary = null
  }

  const nextSnapshot = dryRun ? currentSnapshot : await buildSnapshot()
  const compactBatchSummary = batchSummary ? summarizeBatchSummary(batchSummary) : null
  const selectedCount = compactBatchSummary?.selectedCount ?? 0
  const cycleRecord = {
    cycle: cycleNumber,
    batchArgs,
    batchExclusions: {
      workIds: [...excludedWorkIds],
      seriesKeys: [...excludedSeriesKeys],
      creatorSeriesKeys: [...excludedCreatorSeriesKeys],
    },
    batchOutput,
    batchSummaryPath,
    batchSummary: compactBatchSummary,
    selectedCount,
    preSnapshot: currentSnapshot,
    postSnapshot: nextSnapshot,
    delta: buildDelta(currentSnapshot, nextSnapshot),
    error: cycleError ? { message: cycleError.message } : null,
  }

  result.cycles.push(cycleRecord)
  currentSnapshot = nextSnapshot

  for (const rows of Object.values(compactBatchSummary?.selected ?? {})) {
    for (const row of rows) {
      if (row?.work_id) {
        excludedWorkIds.add(row.work_id)
      }
      if (avoidRepeatSeries && row?.series_title_key) {
        excludedSeriesKeys.add(row.series_title_key)
      }
      if (avoidRepeatSeries && row?.creator_title_key) {
        excludedCreatorSeriesKeys.add(row.creator_title_key)
      }
    }
  }

  if (cycleError || compactBatchSummary?.failedCommand) {
    result.failedCycle = cycleNumber
    result.stoppedReason = 'batch_failed'
    await writeJson(summaryPath, {
      ...result,
      finalSnapshot: currentSnapshot,
    })

    if (haltOnFailure) {
      throw new Error(cycleError?.message ?? compactBatchSummary?.failedCommand?.message ?? `Campaign failed at cycle ${cycleNumber}`)
    }

    continue
  }

  if (dryRun) {
    result.stoppedReason = 'dry_run_completed'
    break
  }

  if (selectedCount === 0 && stopOnEmpty) {
    result.stoppedReason = 'no_selections_remaining'
    break
  }
}

if (!result.stoppedReason) {
  result.stoppedReason = 'completed_requested_cycles'
}

result.finalSnapshot = currentSnapshot
await writeJson(summaryPath, result)

console.log(
  JSON.stringify(
    {
      cyclesRequested: cycles,
      cyclesCompleted: result.cycles.length,
      stoppedReason: result.stoppedReason,
      initialChunkedCount: result.initialSnapshot.chunkedCount,
      finalChunkedCount: result.finalSnapshot.chunkedCount,
      initialChunkRecords: result.initialSnapshot.totalChunkRecords,
      finalChunkRecords: result.finalSnapshot.totalChunkRecords,
      summaryPath,
    },
    null,
    2,
  ),
)
