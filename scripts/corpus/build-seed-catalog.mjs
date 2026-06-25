import { createReadStream } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import readline from 'node:readline'
import {
  corpusDir,
  derivedDir,
  ensureCorpusDirectories,
  exportsDir,
  readCsvFile,
  slugify,
  writeCsvFile,
  writeJson,
} from './lib.mjs'

const acceptedPlantFamiliesPath = resolve(derivedDir, 'term-families', 'accepted-plant-families.csv')
const membershipsPath = resolve(derivedDir, 'term-families', 'memberships.csv')
const evidenceDir = resolve(derivedDir, 'evidence')
const chunkSignalsPath = resolve(evidenceDir, 'chunk-signals.jsonl')
const seedCatalogDir = resolve(derivedDir, 'seed-catalog')
const reviewDir = resolve(corpusDir, 'review')
const decisionsCsvPath = resolve(reviewDir, 'seed-catalog-decisions.csv')
const catalogCsvPath = resolve(seedCatalogDir, 'catalog.csv')
const seedReadyCsvPath = resolve(seedCatalogDir, 'seed-ready-families.csv')
const culinaryCsvPath = resolve(seedCatalogDir, 'culinary-medicinal-families.csv')
const plantMaterialsCsvPath = resolve(seedCatalogDir, 'plant-material-families.csv')
const derivedMaterialsCsvPath = resolve(seedCatalogDir, 'derived-material-families.csv')
const broadPlantCsvPath = resolve(seedCatalogDir, 'broad-plant-families.csv')
const reviewCsvPath = resolve(seedCatalogDir, 'manual-review.csv')
const excludedCsvPath = resolve(seedCatalogDir, 'excluded.csv')
const summaryPath = resolve(exportsDir, 'seed-catalog-summary.json')
const readmePath = resolve(seedCatalogDir, 'README.md')

const catalogHeaders = [
  'family_id',
  'canonical_name',
  'canonical_key',
  'catalog_status',
  'catalog_class',
  'catalog_reason',
  'source_family_refs',
  'decision_note',
  'member_count',
  'accepted_member_count',
  'total_mentions',
  'total_chunks',
  'total_works',
  'collections',
  'topic_families',
  'variant_names',
  'sample_work_ids',
  'sample_chunk_ids',
]

const phraseStopwords = new Set([
  'a',
  'all',
  'almost',
  'also',
  'an',
  'and',
  'another',
  'any',
  'are',
  'as',
  'at',
  'be',
  'been',
  'being',
  'both',
  'but',
  'by',
  'can',
  'did',
  'do',
  'does',
  'either',
  'for',
  'from',
  'has',
  'have',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'last',
  'many',
  'may',
  'might',
  'more',
  'most',
  'much',
  'never',
  'no',
  'not',
  'of',
  'off',
  'on',
  'once',
  'or',
  'other',
  'out',
  'over',
  'rather',
  'should',
  'some',
  'such',
  'than',
  'that',
  'the',
  'their',
  'them',
  'then',
  'there',
  'these',
  'this',
  'those',
  'through',
  'to',
  'upon',
  'very',
  'when',
  'where',
  'which',
  'whose',
  'will',
  'with',
  'without',
])

const descriptorWords = new Set([
  'astringent',
  'bitter',
  'black',
  'blue',
  'broad',
  'brown',
  'dark',
  'detergent',
  'dry',
  'emollient',
  'fibrous',
  'fine',
  'floral',
  'generous',
  'good',
  'green',
  'hairy',
  'healthful',
  'imperfect',
  'inferior',
  'inflamed',
  'long',
  'mild',
  'mucilaginous',
  'narrow',
  'opening',
  'perfect',
  'perforated',
  'purple',
  'pure',
  'radical',
  'rarely',
  'red',
  'ripe',
  'round',
  'saline',
  'singular',
  'slender',
  'soft',
  'stimulating',
  'sudorific',
  'sweating',
  'sweet',
  'thick',
  'upper',
  'useful',
  'valuable',
  'watery',
  'whitish',
  'whole',
  'wild',
  'white',
  'yellow',
  'young',
])

const hardNoiseExactTerms = new Set([
  'all',
  'another',
  'both',
  'different',
  'good',
  'more',
  'very',
  'when',
  'where',
  'whose',
  'will',
  'are',
  'but',
  'has',
  'have',
  'if',
  'off',
  'once',
  'other',
  'some',
  'such',
  'then',
  'there',
  'these',
  'this',
  'those',
])

const broadPlantExactTerms = new Set([
  'fern',
  'grass',
  'moss',
  'plant',
  'tree',
  'vegetable',
  'weed',
  'wood',
])

const ambiguousExactTerms = new Set([
  'balm',
  'bay',
])

const derivedMaterialExactTerms = new Set([
  'amber',
  'camphor',
  'cantharides',
  'lead',
  'manna',
  'myrrh',
  'opium',
  'spanish fly',
  'sulphur',
  'tartar',
  'tartar emetic',
  'turpentine',
  'vitriol',
])

const plantMaterialTerminalWords = new Set([
  'bark',
  'berry',
  'berries',
  'bulb',
  'bulbs',
  'flower',
  'flowers',
  'gum',
  'gums',
  'herb',
  'herbs',
  'leaf',
  'leaves',
  'peel',
  'peels',
  'resin',
  'resins',
  'rhizome',
  'rhizomes',
  'root',
  'roots',
  'seed',
  'seeds',
  'top',
  'tops',
])

const reviewOcrExactTerms = new Set([
  'frefh',
  'fweet',
  'rofe',
  'whofe',
])

const highConfidenceSeedTerms = new Set([
  'almond',
  'aloe',
  'anise',
  'aniseed',
  'apple',
  'arnica',
  'barberry',
  'barley',
  'bitter almond',
  'bitter orange',
  'blackberry',
  'borage',
  'broom',
  'buckthorn',
  'caraway',
  'cardamom',
  'carraway',
  'carrot',
  'cascarilla',
  'castor',
  'catnip',
  'chamomile',
  'cherry',
  'chicory',
  'cinchona',
  'cinnamon',
  'citron',
  'clove',
  'colocynth',
  'columbo',
  'coriander',
  'croton',
  'cucumber',
  'dandelion',
  'dock',
  'dogwood',
  'elder',
  'fennel',
  'fig',
  'foxglove',
  'garlic',
  'gentian',
  'ginger',
  'grape',
  'guaiacum',
  'hemlock',
  'henbane',
  'hop',
  'ipecacuanha',
  'jalap',
  'juniper',
  'laurel',
  'lavender',
  'lemon',
  'licorice',
  'lime',
  'linseed',
  'lobelia',
  'logwood',
  'mace',
  'madder',
  'mallow',
  'mandrake',
  'marsh-mallow',
  'marshmallow',
  'mint',
  'mulberry',
  'mustard',
  'myrtle',
  'nettle',
  'nutmeg',
  'oak',
  'olive',
  'onion',
  'orange',
  'parsley',
  'peach',
  'peppermint',
  'pennyroyal',
  'pine',
  'poppy',
  'poplar',
  'prune',
  'quince',
  'raspberry',
  'rhubarb',
  'rosemary',
  'rose',
  'sage',
  'saffron',
  'sarsaparilla',
  'sassafras',
  'senna',
  'slippery elm',
  'squill',
  'sumach',
  'tamarind',
  'thyme',
  'tobacco',
  'valerian',
  'violet',
  'wild cherry',
  'wormwood',
])

const normalizeWhitespace = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

const rawFamilyKey = (value) => normalizeWhitespace(value).toLowerCase().replace(/[\u2010-\u2015]/g, '-')

const normalizeCatalogKey = (value) =>
  rawFamilyKey(value)
    .replace(/[^a-z0-9\s-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^-+|-+$/g, '')
    .replace(/\s*-\s*/g, '-')
    .replace(/[-\s]+$/g, '')
    .trim()

const splitList = (value) =>
  String(value ?? '')
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)

const splitWords = (value) =>
  normalizeWhitespace(value)
    .split(/\s+/)
    .filter(Boolean)

const toNumber = (value) => {
  const number = Number(value ?? 0)
  return Number.isFinite(number) ? number : 0
}

const topicIncludes = (row, topic) => splitList(row.topic_families).includes(topic)

const titleCaseWord = (word) =>
  word
    .split('-')
    .map((segment) => (segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : segment))
    .join('-')

const displayNameForKey = (value) => splitWords(value).map(titleCaseWord).join(' ')
const cleanDisplayName = (value) => normalizeWhitespace(value).replace(/[\s\-,:;./]+$/g, '').trim()

const pickSample = (list, value, limit = 3) => {
  if (value && list.length < limit && !list.includes(value)) {
    list.push(value)
  }
}

const stableCatalogKey = (value) => normalizeCatalogKey(value) || rawFamilyKey(value)

const sourceFamilyRef = (row) => `${row.family_id}#${stableCatalogKey(row.canonical_key)}`
const sourceFamilyLookupRef = (familyId, value) => `${familyId}#${stableCatalogKey(value)}`

const loadDecisionRows = async () => {
  try {
    return await readCsvFile(decisionsCsvPath)
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return []
    }
    throw error
  }
}

const parseDecisionRow = (row) => ({
  matchKeyRaw: rawFamilyKey(row.match_key),
  matchKeyNormalized: normalizeCatalogKey(row.match_key),
  canonicalKeyOverride: normalizeCatalogKey(row.canonical_key_override),
  canonicalNameOverride: normalizeWhitespace(row.canonical_name_override),
  catalogStatusOverride: normalizeWhitespace(row.catalog_status_override),
  catalogClassOverride: normalizeWhitespace(row.catalog_class_override),
  catalogReasonOverride: normalizeWhitespace(row.catalog_reason_override),
  decisionNote: normalizeWhitespace(row.decision_note),
})

const buildDecisionIndex = (rows) => {
  const parsedRows = rows.map(parseDecisionRow)
  const byRawKey = new Map()
  const byNormalizedKey = new Map()

  for (const row of parsedRows) {
    if (row.matchKeyRaw && !byRawKey.has(row.matchKeyRaw)) {
      byRawKey.set(row.matchKeyRaw, row)
    }
    if (row.matchKeyNormalized && !byNormalizedKey.has(row.matchKeyNormalized)) {
      byNormalizedKey.set(row.matchKeyNormalized, row)
    }
  }

  return {
    rows: parsedRows,
    get(sourceKey) {
      const rawKey = rawFamilyKey(sourceKey)
      const normalizedKey = normalizeCatalogKey(sourceKey)
      return byRawKey.get(rawKey) ?? byNormalizedKey.get(normalizedKey) ?? null
    },
  }
}

const sortMemberRows = (rows) =>
  [...rows].sort((left, right) => {
    const statusRank = { accepted: 0, review: 1, rejected: 2 }
    return (
      (statusRank[left.status] ?? 9) - (statusRank[right.status] ?? 9) ||
      toNumber(right.chunk_count) - toNumber(left.chunk_count) ||
      String(left.candidate_name ?? '').localeCompare(String(right.candidate_name ?? ''))
    )
  })

const selectPreferredSourceRow = (rows, targetKey) =>
  [...rows].sort((left, right) => {
    const leftExactTarget = stableCatalogKey(left.canonical_key) === targetKey ? 0 : 1
    const rightExactTarget = stableCatalogKey(right.canonical_key) === targetKey ? 0 : 1
    return (
      leftExactTarget - rightExactTarget ||
      toNumber(right.total_chunks) - toNumber(left.total_chunks) ||
      String(left.canonical_name ?? '').localeCompare(String(right.canonical_name ?? ''))
    )
  })[0]

const chooseGroupOverrideDecision = (group, decisionIndex) => {
  const targetDecision = decisionIndex.get(group.targetKey)
  if (
    targetDecision &&
    (targetDecision.catalogStatusOverride ||
      targetDecision.catalogClassOverride ||
      targetDecision.catalogReasonOverride ||
      targetDecision.canonicalNameOverride)
  ) {
    return targetDecision
  }

  return (
    group.decisions.find(
      (decision) =>
        decision.catalogStatusOverride ||
        decision.catalogClassOverride ||
        decision.catalogReasonOverride ||
        decision.canonicalNameOverride,
    ) ?? null
  )
}

const buildCatalogRow = (row, classification) => ({
  family_id: row.family_id,
  canonical_name: row.canonical_name,
  canonical_key: row.canonical_key,
  catalog_status: classification.catalogStatus,
  catalog_class: classification.catalogClass,
  catalog_reason: classification.catalogReason,
  source_family_refs: row.source_family_refs,
  decision_note: row.decision_note,
  member_count: row.member_count,
  accepted_member_count: row.accepted_member_count,
  total_mentions: row.total_mentions,
  total_chunks: row.total_chunks,
  total_works: row.total_works,
  collections: row.collections,
  topic_families: row.topic_families,
  variant_names: row.variant_names,
  sample_work_ids: row.sample_work_ids,
  sample_chunk_ids: row.sample_chunk_ids,
})

const hasStandaloneSingleLetter = (words) => words.some((word) => word.length === 1)

const isLikelyNoisePhrase = (words, canonicalKey) => {
  if (hardNoiseExactTerms.has(canonicalKey)) {
    return true
  }

  if (words.length >= 4) {
    return true
  }

  if (hasStandaloneSingleLetter(words) || words.includes('s')) {
    return true
  }

  if (words.some((word) => phraseStopwords.has(word))) {
    return true
  }

  if (words.every((word) => descriptorWords.has(word))) {
    return true
  }

  return false
}

const classifyFamily = (row) => {
  const canonicalKey = String(row.canonical_key ?? '').trim().toLowerCase()
  const words = splitWords(canonicalKey)
  const trailingWord = words.at(-1) ?? ''
  const culinary = topicIncludes(row, 'culinary-herbs')

  if (!canonicalKey) {
    return {
      catalogStatus: 'excluded',
      catalogClass: 'noise-fragment',
      catalogReason: 'empty-canonical-key',
    }
  }

  if (reviewOcrExactTerms.has(canonicalKey)) {
    return {
      catalogStatus: 'review',
      catalogClass: 'historical-ocr-term',
      catalogReason: 'legacy-ocr-spelling',
    }
  }

  if (isLikelyNoisePhrase(words, canonicalKey)) {
    return {
      catalogStatus: 'excluded',
      catalogClass: 'noise-fragment',
      catalogReason: 'phrase-or-descriptor-noise',
    }
  }

  if (derivedMaterialExactTerms.has(canonicalKey)) {
    return {
      catalogStatus: 'supporting',
      catalogClass: 'derived-substance',
      catalogReason: 'plant-derived-or-broader-materia-medica',
    }
  }

  if (broadPlantExactTerms.has(canonicalKey)) {
    return {
      catalogStatus: 'supporting',
      catalogClass: 'broad-plant-class',
      catalogReason: 'generic-plant-category',
    }
  }

  if (ambiguousExactTerms.has(canonicalKey)) {
    return {
      catalogStatus: 'review',
      catalogClass: 'ambiguous-plant-name',
      catalogReason: 'short-ambiguous-canonical-name',
    }
  }

  if (plantMaterialTerminalWords.has(trailingWord)) {
    return {
      catalogStatus: 'supporting',
      catalogClass: 'plant-material',
      catalogReason: 'specific-plant-part-or-material',
    }
  }

  if (highConfidenceSeedTerms.has(canonicalKey)) {
    return {
      catalogStatus: 'seed-ready',
      catalogClass: culinary ? 'culinary-medicinal-plant' : 'medicinal-herb',
      catalogReason: 'curated-high-confidence-seed-term',
    }
  }

  if (words.some((word) => descriptorWords.has(word)) && words.length > 1) {
    return {
      catalogStatus: 'review',
      catalogClass: 'ambiguous-plant-name',
      catalogReason: 'descriptor-heavy-canonical-name',
    }
  }

  if (culinary) {
    return {
      catalogStatus: 'review',
      catalogClass: 'candidate-specific-family',
      catalogReason: 'culinary-topic-hit-without-curated-seed-approval',
    }
  }

  return {
    catalogStatus: 'review',
    catalogClass: 'candidate-specific-family',
    catalogReason: 'specific-family-not-yet-promoted-to-curated-seed-list',
  }
}

const applyClassificationOverrides = (classification, decision) => ({
  catalogStatus: decision?.catalogStatusOverride || classification.catalogStatus,
  catalogClass: decision?.catalogClassOverride || classification.catalogClass,
  catalogReason: decision?.catalogReasonOverride || classification.catalogReason,
})

const sortCatalogRows = (rows) =>
  [...rows].sort((left, right) => {
    const statusRank = {
      'seed-ready': 0,
      supporting: 1,
      review: 2,
      excluded: 3,
    }

    return (
      statusRank[left.catalog_status] - statusRank[right.catalog_status] ||
      left.catalog_class.localeCompare(right.catalog_class) ||
      toNumber(right.total_chunks) - toNumber(left.total_chunks) ||
      left.canonical_name.localeCompare(right.canonical_name)
    )
  })

await ensureCorpusDirectories()
await mkdir(seedCatalogDir, { recursive: true })
await mkdir(reviewDir, { recursive: true })

const [acceptedPlantFamilyRows, membershipRows, decisionRows] = await Promise.all([
  readCsvFile(acceptedPlantFamiliesPath),
  readCsvFile(membershipsPath),
  loadDecisionRows(),
])

const decisionIndex = buildDecisionIndex(decisionRows)
const sourceFamiliesByRef = new Map()
const catalogGroups = new Map()
const candidateToGroupKey = new Map()

for (const row of acceptedPlantFamilyRows) {
  const sourceKey = stableCatalogKey(row.canonical_key)
  const decision = decisionIndex.get(sourceKey)
  const targetKey = decision?.canonicalKeyOverride || sourceKey
  const sourceRef = sourceFamilyRef(row)
  const sourceLookupRef = sourceFamilyLookupRef(row.family_id, row.canonical_key)

  sourceFamiliesByRef.set(sourceLookupRef, row)

  if (!catalogGroups.has(targetKey)) {
    catalogGroups.set(targetKey, {
      targetKey,
      sourceRows: [],
      memberRows: [],
      sourceFamilyRefs: [],
      collections: new Set(),
      topicFamilies: new Set(),
      workIds: new Set(),
      sampleWorkIds: [],
      sampleChunkIds: [],
      totalChunks: 0,
      totalMentions: 0,
      decisions: [],
      decisionNotes: new Set(),
    })
  }

  const group = catalogGroups.get(targetKey)
  group.sourceRows.push(row)
  group.sourceFamilyRefs.push(sourceRef)
  for (const collection of splitList(row.collections)) {
    group.collections.add(collection)
  }
  for (const topic of splitList(row.topic_families)) {
    group.topicFamilies.add(topic)
  }
  for (const workId of splitList(row.sample_work_ids)) {
    group.workIds.add(workId)
    pickSample(group.sampleWorkIds, workId)
  }
  for (const chunkId of splitList(row.sample_chunk_ids)) {
    pickSample(group.sampleChunkIds, chunkId)
  }
  if (decision) {
    group.decisions.push(decision)
    if (decision.decisionNote) {
      group.decisionNotes.add(decision.decisionNote)
    }
  }
}

for (const row of membershipRows) {
  const sourceRef = sourceFamilyLookupRef(row.family_id, row.canonical_name)
  const sourceFamily = sourceFamiliesByRef.get(sourceRef)
  if (!sourceFamily) {
    continue
  }

  const sourceKey = stableCatalogKey(sourceFamily.canonical_key)
  const decision = decisionIndex.get(sourceKey)
  const targetKey = decision?.canonicalKeyOverride || sourceKey
  const group = catalogGroups.get(targetKey)

  if (!group) {
    continue
  }

  group.memberRows.push(row)
  group.totalMentions += toNumber(row.mention_count)
  candidateToGroupKey.set(row.candidate_id, targetKey)
}

const chunkSignalReader = readline.createInterface({
  input: createReadStream(chunkSignalsPath),
  crlfDelay: Infinity,
})

for await (const line of chunkSignalReader) {
  const trimmed = line.trim()
  if (!trimmed) {
    continue
  }

  const record = JSON.parse(trimmed)
  const groupKeysInChunk = new Set()

  for (const candidate of record.herb_candidates ?? []) {
    const groupKey = candidateToGroupKey.get(candidate.herb_id)
    if (!groupKey) {
      continue
    }

    const group = catalogGroups.get(groupKey)
    if (!group) {
      continue
    }

    groupKeysInChunk.add(groupKey)
    group.collections.add(record.collection_id)
    for (const topic of splitList(record.topic_family)) {
      group.topicFamilies.add(topic)
    }
    group.workIds.add(record.work_id)
    pickSample(group.sampleWorkIds, record.work_id)
    pickSample(group.sampleChunkIds, record.chunk_id)
  }

  for (const groupKey of groupKeysInChunk) {
    const group = catalogGroups.get(groupKey)
    if (group) {
      group.totalChunks += 1
    }
  }
}

const aggregatedRows = [...catalogGroups.values()].map((group) => {
  const sortedMembers = sortMemberRows(group.memberRows)
  const preferredSourceRow = selectPreferredSourceRow(group.sourceRows, group.targetKey)
  const overrideDecision = chooseGroupOverrideDecision(group, decisionIndex)
  const cleanedPreferredName = cleanDisplayName(preferredSourceRow?.canonical_name)
  const canonicalName =
    overrideDecision?.canonicalNameOverride ||
    (cleanedPreferredName && normalizeCatalogKey(cleanedPreferredName) === group.targetKey
      ? cleanedPreferredName
      : null) ||
    displayNameForKey(group.targetKey)
  const acceptedMemberCount = sortedMembers.filter((row) => row.status === 'accepted').length

  return {
    family_id: `seed-${slugify(group.targetKey) || 'family'}`,
    canonical_name: canonicalName,
    canonical_key: group.targetKey,
    source_family_refs: [...new Set(group.sourceFamilyRefs)].sort().join(';'),
    decision_note: [...group.decisionNotes].sort().join(' | '),
    member_count: sortedMembers.length,
    accepted_member_count: acceptedMemberCount,
    total_mentions: group.totalMentions,
    total_chunks: group.totalChunks,
    total_works: group.workIds.size,
    collections: [...group.collections].sort().join(';'),
    topic_families: [...group.topicFamilies].sort().join(';'),
    variant_names: sortedMembers.map((row) => row.candidate_name).join(';'),
    sample_work_ids: group.sampleWorkIds.join(';'),
    sample_chunk_ids: group.sampleChunkIds.join(';'),
    _overrideDecision: overrideDecision,
  }
})

const catalogRows = sortCatalogRows(
  aggregatedRows.map((row) =>
    buildCatalogRow(row, applyClassificationOverrides(classifyFamily(row), row._overrideDecision)),
  ),
)

const seedReadyRows = catalogRows.filter((row) => row.catalog_status === 'seed-ready')
const culinaryRows = catalogRows.filter((row) => row.catalog_class === 'culinary-medicinal-plant')
const plantMaterialRows = catalogRows.filter((row) => row.catalog_class === 'plant-material')
const derivedMaterialRows = catalogRows.filter((row) => row.catalog_class === 'derived-substance')
const broadPlantRows = catalogRows.filter((row) => row.catalog_class === 'broad-plant-class')
const reviewRows = catalogRows.filter((row) => row.catalog_status === 'review')
const excludedRows = catalogRows.filter((row) => row.catalog_status === 'excluded')

await writeCsvFile(catalogCsvPath, catalogRows, catalogHeaders)
await writeCsvFile(seedReadyCsvPath, seedReadyRows, catalogHeaders)
await writeCsvFile(culinaryCsvPath, culinaryRows, catalogHeaders)
await writeCsvFile(plantMaterialsCsvPath, plantMaterialRows, catalogHeaders)
await writeCsvFile(derivedMaterialsCsvPath, derivedMaterialRows, catalogHeaders)
await writeCsvFile(broadPlantCsvPath, broadPlantRows, catalogHeaders)
await writeCsvFile(reviewCsvPath, reviewRows, catalogHeaders)
await writeCsvFile(excludedCsvPath, excludedRows, catalogHeaders)

const classCounts = catalogRows.reduce((counts, row) => {
  counts[row.catalog_class] = (counts[row.catalog_class] ?? 0) + 1
  return counts
}, {})

const summary = {
  generatedAt: new Date().toISOString(),
  inputAcceptedPlantFamilies: acceptedPlantFamilyRows.length,
  decisionRowCount: decisionRows.length,
  aliasedCatalogFamilies: catalogRows.filter((row) => splitList(row.source_family_refs).length > 1).length,
  seedReadyFamilies: seedReadyRows.length,
  supportingFamilies: catalogRows.filter((row) => row.catalog_status === 'supporting').length,
  reviewFamilies: reviewRows.length,
  excludedFamilies: excludedRows.length,
  classCounts,
  sampleSeedReadyFamilies: seedReadyRows.slice(0, 20).map((row) => row.canonical_name),
  sampleReviewFamilies: reviewRows.slice(0, 20).map((row) => row.canonical_name),
  sampleExcludedFamilies: excludedRows.slice(0, 20).map((row) => row.canonical_name),
}

await writeJson(summaryPath, summary)

const readme = `# Seed Catalog

This layer curates the accepted plant-family output into a cleaner seed catalog for the eventual public Herbalisti database.

Why it exists:

- keep the broader term-family layer intact for provenance
- separate specific plant families from generic classes, materials, and phrase noise
- allow durable manual curator decisions and alias merges without mutating the upstream term-family layer
- produce a more conservative starting set for herb-profile assembly and later retrieval work

Current outputs:

- \`catalog.csv\`
- \`seed-ready-families.csv\`
- \`culinary-medicinal-families.csv\`
- \`plant-material-families.csv\`
- \`derived-material-families.csv\`
- \`broad-plant-families.csv\`
- \`manual-review.csv\`
- \`excluded.csv\`
- \`../../review/seed-catalog-decisions.csv\`

Catalog statuses:

- \`seed-ready\`: specific plant families suitable to seed the first herbal database
- \`supporting\`: broader plant materials or derived substances worth retaining, but not ideal as first-page herb seeds
- \`review\`: ambiguous or OCR-shaped families that need a later identity pass
- \`excluded\`: obvious phrase fragments, descriptor noise, or malformed entries

Catalog classes currently in use:

- \`medicinal-herb\`
- \`culinary-medicinal-plant\`
- \`plant-material\`
- \`derived-substance\`
- \`broad-plant-class\`
- \`therapeutic-descriptor\`
- \`ambiguous-plant-name\`
- \`candidate-specific-family\`
- \`historical-ocr-term\`
- \`noise-fragment\`

Implementation notes:

- exact chunk and work counts are recomputed from \`derived/evidence/chunk-signals.jsonl\`
- manual alias merges and promotions are controlled from \`corpus/review/seed-catalog-decisions.csv\`
`

await writeFile(readmePath, readme, 'utf8')

console.log(
  JSON.stringify(
    {
      seedCatalogDir,
      summary,
    },
    null,
    2,
  ),
)
