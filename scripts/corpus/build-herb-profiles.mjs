import { createReadStream } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import readline from 'node:readline'
import {
  derivedDir,
  ensureCorpusDirectories,
  exportsDir,
  loadWorksRegistry,
  readCsvFile,
  slugify,
  writeCsvFile,
  writeJson,
  writeJsonLines,
} from './lib.mjs'

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, rawValue = 'true'] = argument.replace(/^--/, '').split('=')
    return [key, rawValue]
  }),
)

const limit = Number(args.get('limit') ?? Number.POSITIVE_INFINITY)
const sampleLimit = Math.max(1, Number(args.get('sample-limit') ?? 5) || 5)

const seedCatalogDir = resolve(derivedDir, 'seed-catalog')
const evidenceDir = resolve(derivedDir, 'evidence')
const herbProfilesDir = resolve(derivedDir, 'herb-profiles')
const recordsDir = resolve(herbProfilesDir, 'records')

const seedReadyCsvPath = resolve(seedCatalogDir, 'seed-ready-families.csv')
const chunkSignalsPath = resolve(evidenceDir, 'chunk-signals.jsonl')
const indexCsvPath = resolve(herbProfilesDir, 'index.csv')
const profilesJsonPath = resolve(herbProfilesDir, 'profiles.json')
const profilesJsonlPath = resolve(herbProfilesDir, 'profiles.jsonl')
const profileDocumentsJsonlPath = resolve(herbProfilesDir, 'profile-documents.jsonl')
const readmePath = resolve(herbProfilesDir, 'README.md')
const summaryPath = resolve(exportsDir, 'herb-profile-summary.json')

const indexHeaders = [
  'profile_id',
  'canonical_name',
  'canonical_key',
  'catalog_class',
  'catalog_reason',
  'total_mentions',
  'total_chunks',
  'total_works',
  'matched_chunk_count',
  'matched_work_count',
  'variant_count',
  'collections',
  'topic_families',
  'variants',
  'top_plant_parts',
  'top_preparations',
  'top_conditions',
  'top_cautions',
  'top_supporting_works',
  'source_family_refs',
]

const normalizeWhitespace = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

const normalizeCatalogKey = (value) =>
  normalizeWhitespace(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const splitList = (value) =>
  String(value ?? '')
    .split(';')
    .map((item) => normalizeWhitespace(item))
    .filter(Boolean)

const parseNumber = (value) => Number.parseInt(String(value ?? '0'), 10) || 0

const uniqueValues = (values) => [...new Set(values.filter(Boolean))]

const formatLabelList = (entries, limitCount = 6) =>
  entries
    .slice(0, limitCount)
    .map((entry) => entry.label)
    .join(', ')

const buildSampleScore = (signal, matchedCandidates) =>
  matchedCandidates.length * 6 +
  signal.plant_parts.length * 2 +
  signal.preparations.length * 3 +
  signal.cautions.length * 4 +
  signal.conditions.length * 4

const upsertSignalAggregate = (map, item, workId) => {
  const id = normalizeWhitespace(item.id || item.label || item.name)
  if (!id) {
    return
  }

  const current = map.get(id) ?? {
    id,
    label: normalizeWhitespace(item.label || item.name || item.id),
    signal_count: 0,
    work_ids: new Set(),
  }

  current.signal_count += 1
  current.work_ids.add(workId)
  map.set(id, current)
}

const upsertBasisAggregate = (map, basisValue) => {
  const id = normalizeWhitespace(basisValue)
  if (!id) {
    return
  }

  const current = map.get(id) ?? {
    id,
    label: id.replace(/_/g, ' '),
    mention_count: 0,
  }

  current.mention_count += 1
  map.set(id, current)
}

const insertSample = (list, sample, maxItems) => {
  const existingIndex = list.findIndex((entry) => entry.chunk_id === sample.chunk_id)
  if (existingIndex >= 0) {
    if (sample.score > list[existingIndex].score) {
      list[existingIndex] = sample
    }
  } else {
    list.push(sample)
  }

  list.sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
  if (list.length > maxItems) {
    list.length = maxItems
  }
}

const serializeAggregateMap = (map, limitCount = Number.POSITIVE_INFINITY) =>
  [...map.values()]
    .map((entry) => ({
      id: entry.id,
      label: entry.label,
      signal_count: entry.signal_count,
      work_count: entry.work_ids.size,
    }))
    .sort((left, right) => right.signal_count - left.signal_count || right.work_count - left.work_count || left.label.localeCompare(right.label))
    .slice(0, limitCount)

const serializeBasisMap = (map, limitCount = Number.POSITIVE_INFINITY) =>
  [...map.values()]
    .map((entry) => ({
      id: entry.id,
      label: entry.label,
      mention_count: entry.mention_count,
    }))
    .sort((left, right) => right.mention_count - left.mention_count || left.label.localeCompare(right.label))
    .slice(0, limitCount)

const buildMarkdownList = (entries, formatter) =>
  entries.length > 0 ? entries.map((entry) => `- ${formatter(entry)}`).join('\n') : '- None yet.'

const createProfileMarkdown = (profile) => {
  const preparations = buildMarkdownList(
    profile.signal_summary.preparations,
    (entry) => `${entry.label}: ${entry.signal_count} chunk co-mentions across ${entry.work_count} works`,
  )
  const plantParts = buildMarkdownList(
    profile.signal_summary.plant_parts,
    (entry) => `${entry.label}: ${entry.signal_count} chunk co-mentions across ${entry.work_count} works`,
  )
  const conditions = buildMarkdownList(
    profile.signal_summary.conditions,
    (entry) => `${entry.label}: ${entry.signal_count} chunk co-mentions across ${entry.work_count} works`,
  )
  const cautions = buildMarkdownList(
    profile.signal_summary.cautions,
    (entry) => `${entry.label}: ${entry.signal_count} chunk co-mentions across ${entry.work_count} works`,
  )
  const works = buildMarkdownList(
    profile.supporting_works,
    (entry) =>
      `${entry.title} (\`${entry.work_id}\`, ${entry.collection_id}, ${entry.signal_chunk_count} matched chunks)`,
  )

  const buildPassageSection = (title, entries) => [
    `### ${title}`,
    '',
    entries.length > 0
      ? entries
          .map(
            (entry) =>
              `- ${entry.title} (\`${entry.work_id}\`, ${entry.collection_id}) - ${entry.excerpt}`,
          )
          .join('\n')
      : '- No representative passages captured yet.',
  ].join('\n')

  return `# ${profile.canonical_name}

- Profile ID: \`${profile.profile_id}\`
- Catalog class: ${profile.catalog_class}
- Catalog reason: ${profile.catalog_reason}
- Total mentions: ${profile.metrics.total_mentions}
- Total chunks: ${profile.metrics.total_chunks}
- Total works: ${profile.metrics.total_works}
- Matched chunks in the profile builder pass: ${profile.metrics.matched_chunk_count}
- Collections: ${profile.coverage.collections.join(', ') || 'None recorded'}
- Topic families: ${profile.coverage.topic_families.join(', ') || 'None recorded'}

## Variants

${profile.coverage.variants.join(', ') || 'None recorded'}

## Signal Summary

### Preparations

${preparations}

### Plant Parts

${plantParts}

### Conditions

${conditions}

### Cautions

${cautions}

## Supporting Works

${works}

## Representative Passages

${buildPassageSection('Overview', profile.evidence_passages.overview)}

${buildPassageSection('Preparations', profile.evidence_passages.preparations)}

${buildPassageSection('Conditions', profile.evidence_passages.conditions)}

${buildPassageSection('Cautions', profile.evidence_passages.cautions)}

## Note

This profile is a source-linked retrieval aid built from historical co-mentions in rights-cleared books. It does not assert efficacy or modern safety.
`
}

await ensureCorpusDirectories()
await mkdir(herbProfilesDir, { recursive: true })
await mkdir(recordsDir, { recursive: true })

const works = await loadWorksRegistry()
const worksById = new Map(works.map((work) => [work.work_id, work]))
const seedRows = await readCsvFile(seedReadyCsvPath)
const targetRows = seedRows.slice(0, Number.isFinite(limit) ? limit : seedRows.length)

const profiles = targetRows.map((row) => {
  const variants = uniqueValues([row.canonical_name, ...splitList(row.variant_names)])
  const normalizedVariantKeys = uniqueValues([
    normalizeCatalogKey(row.canonical_key),
    normalizeCatalogKey(row.canonical_name),
    ...variants.map((variant) => normalizeCatalogKey(variant)),
  ]).filter(Boolean)

  return {
    profile_id: row.family_id || `seed-${slugify(row.canonical_key || row.canonical_name)}`,
    family_id: row.family_id || '',
    canonical_name: normalizeWhitespace(row.canonical_name),
    canonical_key: normalizeCatalogKey(row.canonical_key || row.canonical_name),
    catalog_status: normalizeWhitespace(row.catalog_status),
    catalog_class: normalizeWhitespace(row.catalog_class),
    catalog_reason: normalizeWhitespace(row.catalog_reason),
    source_family_refs: splitList(row.source_family_refs),
    decision_note: normalizeWhitespace(row.decision_note),
    total_mentions: parseNumber(row.total_mentions),
    total_chunks: parseNumber(row.total_chunks),
    total_works: parseNumber(row.total_works),
    collections: splitList(row.collections),
    topic_families: splitList(row.topic_families),
    variants,
    sample_work_ids: splitList(row.sample_work_ids),
    sample_chunk_ids: splitList(row.sample_chunk_ids),
    match_keys: normalizedVariantKeys,
    matched_chunk_count: 0,
    matched_work_ids: new Set(),
    matched_mention_total: 0,
    basisMap: new Map(),
    plantPartMap: new Map(),
    preparationMap: new Map(),
    cautionMap: new Map(),
    conditionMap: new Map(),
    supportingWorkMap: new Map(),
    overviewSamples: [],
    preparationSamples: [],
    conditionSamples: [],
    cautionSamples: [],
  }
})

const profileById = new Map(profiles.map((profile) => [profile.profile_id, profile]))
const matchIndex = new Map()

for (const profile of profiles) {
  for (const key of profile.match_keys) {
    const profileIds = matchIndex.get(key) ?? new Set()
    profileIds.add(profile.profile_id)
    matchIndex.set(key, profileIds)
  }
}

const lineReader = readline.createInterface({
  input: createReadStream(chunkSignalsPath, 'utf8'),
  crlfDelay: Infinity,
})

for await (const line of lineReader) {
  if (!line.trim()) {
    continue
  }

  let signal
  try {
    signal = JSON.parse(line)
  } catch {
    continue
  }

  const matchedCandidatesByProfile = new Map()
  for (const candidate of signal.herb_candidates ?? []) {
    const candidateKey = normalizeCatalogKey(candidate.name || candidate.herb_id)
    if (!candidateKey) {
      continue
    }

    const profileIds = matchIndex.get(candidateKey)
    if (!profileIds) {
      continue
    }

    for (const profileId of profileIds) {
      const matchedCandidates = matchedCandidatesByProfile.get(profileId) ?? []
      matchedCandidates.push(candidate)
      matchedCandidatesByProfile.set(profileId, matchedCandidates)
    }
  }

  if (matchedCandidatesByProfile.size === 0) {
    continue
  }

  for (const [profileId, matchedCandidates] of matchedCandidatesByProfile) {
    const profile = profileById.get(profileId)
    if (!profile) {
      continue
    }

    profile.matched_chunk_count += 1
    profile.matched_mention_total += matchedCandidates.length
    profile.matched_work_ids.add(signal.work_id)

    for (const candidate of matchedCandidates) {
      for (const basisValue of Array.isArray(candidate.basis) ? candidate.basis : [candidate.basis]) {
        upsertBasisAggregate(profile.basisMap, basisValue)
      }
    }

    for (const item of signal.plant_parts ?? []) {
      upsertSignalAggregate(profile.plantPartMap, item, signal.work_id)
    }
    for (const item of signal.preparations ?? []) {
      upsertSignalAggregate(profile.preparationMap, item, signal.work_id)
    }
    for (const item of signal.cautions ?? []) {
      upsertSignalAggregate(profile.cautionMap, item, signal.work_id)
    }
    for (const item of signal.conditions ?? []) {
      upsertSignalAggregate(profile.conditionMap, item, signal.work_id)
    }

    const sourceWork = worksById.get(signal.work_id)
    const workSummary = profile.supportingWorkMap.get(signal.work_id) ?? {
      work_id: signal.work_id,
      title: sourceWork?.title || signal.title || '',
      creator: sourceWork?.creator || '',
      publication_year: sourceWork?.publication_year || '',
      collection_id: sourceWork?.collection_id || signal.collection_id || '',
      topic_family: sourceWork?.topic_family || signal.topic_family || '',
      source_url: sourceWork?.source_url || signal.source_url || '',
      signal_chunk_count: 0,
      matched_mention_count: 0,
    }
    workSummary.signal_chunk_count += 1
    workSummary.matched_mention_count += matchedCandidates.length
    profile.supportingWorkMap.set(signal.work_id, workSummary)

    const sample = {
      chunk_id: signal.chunk_id,
      work_id: signal.work_id,
      title: signal.title,
      collection_id: signal.collection_id,
      section_heading: signal.section_heading,
      source_url: signal.source_url,
      matched_herbs: uniqueValues(matchedCandidates.map((candidate) => normalizeWhitespace(candidate.name))),
      herb_basis: uniqueValues(
        matchedCandidates.flatMap((candidate) => (Array.isArray(candidate.basis) ? candidate.basis : [candidate.basis])),
      ),
      plant_parts: uniqueValues((signal.plant_parts ?? []).map((item) => normalizeWhitespace(item.label))),
      preparations: uniqueValues((signal.preparations ?? []).map((item) => normalizeWhitespace(item.label))),
      cautions: uniqueValues((signal.cautions ?? []).map((item) => normalizeWhitespace(item.label))),
      conditions: uniqueValues((signal.conditions ?? []).map((item) => normalizeWhitespace(item.label))),
      excerpt: normalizeWhitespace(signal.excerpt).slice(0, 320),
      score: buildSampleScore(signal, matchedCandidates),
    }

    insertSample(profile.overviewSamples, sample, sampleLimit)
    if (sample.preparations.length > 0) {
      insertSample(profile.preparationSamples, sample, sampleLimit)
    }
    if (sample.conditions.length > 0) {
      insertSample(profile.conditionSamples, sample, sampleLimit)
    }
    if (sample.cautions.length > 0) {
      insertSample(profile.cautionSamples, sample, sampleLimit)
    }
  }
}

const serializedProfiles = []
const indexRows = []
const documentRows = []

for (const profile of profiles) {
  const plantParts = serializeAggregateMap(profile.plantPartMap, 10)
  const preparations = serializeAggregateMap(profile.preparationMap, 10)
  const cautions = serializeAggregateMap(profile.cautionMap, 10)
  const conditions = serializeAggregateMap(profile.conditionMap, 10)
  const basis = serializeBasisMap(profile.basisMap, 10)
  const supportingWorks = [...profile.supportingWorkMap.values()]
    .sort(
      (left, right) =>
        right.signal_chunk_count - left.signal_chunk_count ||
        right.matched_mention_count - left.matched_mention_count ||
        left.title.localeCompare(right.title),
    )
    .slice(0, 10)

  const retrievalText = [
    `${profile.canonical_name} is a ${profile.catalog_class.replace(/-/g, ' ')} profile in the Herbalisti historical corpus.`,
    `It is represented across ${profile.total_works} works and ${profile.total_chunks} source-linked chunks.`,
    profile.variants.length > 0 ? `Recorded variants include ${profile.variants.join(', ')}.` : '',
    plantParts.length > 0 ? `Common plant-part co-mentions include ${formatLabelList(plantParts)}.` : '',
    preparations.length > 0 ? `Common preparation co-mentions include ${formatLabelList(preparations)}.` : '',
    conditions.length > 0 ? `Common condition co-mentions include ${formatLabelList(conditions)}.` : '',
    cautions.length > 0 ? `Caution co-mentions include ${formatLabelList(cautions)}.` : '',
    supportingWorks.length > 0
      ? `Representative source works include ${supportingWorks
          .slice(0, 4)
          .map((work) => work.title)
          .join('; ')}.`
      : '',
    'This is a retrieval summary of historical co-mentions only, not a medical claim.',
  ]
    .filter(Boolean)
    .join(' ')

  const outputProfile = {
    profile_id: profile.profile_id,
    family_id: profile.family_id,
    canonical_name: profile.canonical_name,
    canonical_key: profile.canonical_key,
    catalog_status: profile.catalog_status,
    catalog_class: profile.catalog_class,
    catalog_reason: profile.catalog_reason,
    source_family_refs: profile.source_family_refs,
    decision_note: profile.decision_note,
    metrics: {
      total_mentions: profile.total_mentions,
      total_chunks: profile.total_chunks,
      total_works: profile.total_works,
      matched_chunk_count: profile.matched_chunk_count,
      matched_work_count: profile.matched_work_ids.size,
      matched_mention_total: profile.matched_mention_total,
    },
    coverage: {
      collections: profile.collections,
      topic_families: profile.topic_families,
      variants: profile.variants,
      sample_work_ids: profile.sample_work_ids,
      sample_chunk_ids: profile.sample_chunk_ids,
    },
    signal_summary: {
      herb_basis: basis,
      plant_parts: plantParts,
      preparations,
      cautions,
      conditions,
    },
    supporting_works: supportingWorks,
    evidence_passages: {
      overview: profile.overviewSamples,
      preparations: profile.preparationSamples,
      conditions: profile.conditionSamples,
      cautions: profile.cautionSamples,
    },
    retrieval_text: retrievalText,
    generated_at: new Date().toISOString(),
    builder: 'build-herb-profiles.mjs',
  }

  serializedProfiles.push(outputProfile)
  indexRows.push({
    profile_id: outputProfile.profile_id,
    canonical_name: outputProfile.canonical_name,
    canonical_key: outputProfile.canonical_key,
    catalog_class: outputProfile.catalog_class,
    catalog_reason: outputProfile.catalog_reason,
    total_mentions: outputProfile.metrics.total_mentions,
    total_chunks: outputProfile.metrics.total_chunks,
    total_works: outputProfile.metrics.total_works,
    matched_chunk_count: outputProfile.metrics.matched_chunk_count,
    matched_work_count: outputProfile.metrics.matched_work_count,
    variant_count: outputProfile.coverage.variants.length,
    collections: outputProfile.coverage.collections.join(';'),
    topic_families: outputProfile.coverage.topic_families.join(';'),
    variants: outputProfile.coverage.variants.join(';'),
    top_plant_parts: plantParts.slice(0, 5).map((entry) => entry.label).join(';'),
    top_preparations: preparations.slice(0, 5).map((entry) => entry.label).join(';'),
    top_conditions: conditions.slice(0, 5).map((entry) => entry.label).join(';'),
    top_cautions: cautions.slice(0, 5).map((entry) => entry.label).join(';'),
    top_supporting_works: supportingWorks.slice(0, 5).map((entry) => entry.work_id).join(';'),
    source_family_refs: outputProfile.source_family_refs.join(';'),
  })
  documentRows.push({
    document_id: `herb-profile-${outputProfile.canonical_key || slugify(outputProfile.canonical_name)}`,
    profile_id: outputProfile.profile_id,
    canonical_name: outputProfile.canonical_name,
    catalog_class: outputProfile.catalog_class,
    collections: outputProfile.coverage.collections,
    topic_families: outputProfile.coverage.topic_families,
    retrieval_text: outputProfile.retrieval_text,
    source_family_refs: outputProfile.source_family_refs,
    supporting_work_ids: supportingWorks.slice(0, 8).map((entry) => entry.work_id),
  })

  const recordDir = resolve(recordsDir, outputProfile.profile_id)
  await mkdir(recordDir, { recursive: true })
  await writeJson(resolve(recordDir, 'profile.json'), outputProfile)
  await writeFile(resolve(recordDir, 'profile.md'), `${createProfileMarkdown(outputProfile)}\n`, 'utf8')
}

await writeCsvFile(indexCsvPath, indexRows, indexHeaders)
await writeJson(profilesJsonPath, serializedProfiles)
await writeJsonLines(profilesJsonlPath, serializedProfiles)
await writeJsonLines(profileDocumentsJsonlPath, documentRows)

const summary = {
  generatedAt: new Date().toISOString(),
  profileCount: serializedProfiles.length,
  buildScope: 'seed-ready',
  sampleLimit,
  profilesWithPreparationSignals: serializedProfiles.filter((profile) => profile.signal_summary.preparations.length > 0).length,
  profilesWithConditionSignals: serializedProfiles.filter((profile) => profile.signal_summary.conditions.length > 0).length,
  profilesWithCautionSignals: serializedProfiles.filter((profile) => profile.signal_summary.cautions.length > 0).length,
  profilesWithPlantPartSignals: serializedProfiles.filter((profile) => profile.signal_summary.plant_parts.length > 0).length,
  totalMatchedChunks: serializedProfiles.reduce((sum, profile) => sum + profile.metrics.matched_chunk_count, 0),
  topProfilesByChunks: serializedProfiles
    .slice()
    .sort((left, right) => right.metrics.total_chunks - left.metrics.total_chunks || left.canonical_name.localeCompare(right.canonical_name))
    .slice(0, 20)
    .map((profile) => ({
      profile_id: profile.profile_id,
      canonical_name: profile.canonical_name,
      total_chunks: profile.metrics.total_chunks,
      total_works: profile.metrics.total_works,
      top_preparations: profile.signal_summary.preparations.slice(0, 3).map((entry) => entry.label),
      top_conditions: profile.signal_summary.conditions.slice(0, 3).map((entry) => entry.label),
      top_cautions: profile.signal_summary.cautions.slice(0, 3).map((entry) => entry.label),
    })),
  outputPaths: {
    herbProfilesDir,
    indexCsvPath,
    profilesJsonPath,
    profilesJsonlPath,
    profileDocumentsJsonlPath,
    summaryPath,
  },
}

await writeJson(summaryPath, summary)

const readme = `# Herb Profiles

Generated: ${summary.generatedAt}

This layer turns the seed-ready Herbalisti plant families into retrieval-ready profile envelopes.

## What it does

- anchors each seed-ready family to a durable profile record
- keeps source-family provenance from the seed catalog
- aggregates co-mentioned preparations, plant parts, cautions, and conditions from chunk-level evidence
- writes both human-readable profile notes and machine-readable retrieval documents

## What it does not do

- it does not assert efficacy
- it does not convert co-mentions into medical claims
- it does not replace later editorial review for safety, identity, or modern interpretation

## Key files

- \`index.csv\`
- \`profiles.json\`
- \`profiles.jsonl\`
- \`profile-documents.jsonl\`
- \`records/<profile-id>/profile.json\`
- \`records/<profile-id>/profile.md\`

## Current summary

- Profiles built: ${summary.profileCount}
- Profiles with preparation signals: ${summary.profilesWithPreparationSignals}
- Profiles with condition signals: ${summary.profilesWithConditionSignals}
- Profiles with caution signals: ${summary.profilesWithCautionSignals}
- Profiles with plant-part signals: ${summary.profilesWithPlantPartSignals}
- Total matched chunks in the builder pass: ${summary.totalMatchedChunks}
`

await writeFile(readmePath, `${readme}\n`, 'utf8')

console.log(
  JSON.stringify(
    {
      summaryPath,
      herbProfilesDir,
      profileCount: summary.profileCount,
      sampleLimit,
    },
    null,
    2,
  ),
)
