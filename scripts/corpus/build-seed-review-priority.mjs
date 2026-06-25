import { createReadStream } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import readline from 'node:readline'
import {
  corpusDir,
  derivedDir,
  ensureCorpusDirectories,
  exportsDir,
  loadWorksRegistry,
  readCsvFile,
  writeCsvFile,
  writeJson,
} from './lib.mjs'

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, rawValue = 'true'] = argument.replace(/^--/, '').split('=')
    return [key, rawValue]
  }),
)

const topLimit = Math.max(1, Number(args.get('top-limit') ?? 250) || 250)
const sampleLimit = Math.max(1, Number(args.get('sample-limit') ?? 5) || 5)

const seedCatalogDir = resolve(derivedDir, 'seed-catalog')
const evidenceDir = resolve(derivedDir, 'evidence')
const reviewDir = resolve(corpusDir, 'review')
const seedReviewPriorityDir = resolve(reviewDir, 'seed-catalog-priority')

const catalogCsvPath = resolve(seedCatalogDir, 'catalog.csv')
const chunkSignalsPath = resolve(evidenceDir, 'chunk-signals.jsonl')
const readmePath = resolve(seedReviewPriorityDir, 'README.md')
const allRankedCsvPath = resolve(seedReviewPriorityDir, 'all-ranked.csv')
const promotionCsvPath = resolve(seedReviewPriorityDir, 'promotion-candidates.csv')
const identityCsvPath = resolve(seedReviewPriorityDir, 'identity-review.csv')
const secondaryCsvPath = resolve(seedReviewPriorityDir, 'secondary-candidates.csv')
const deprioritizedCsvPath = resolve(seedReviewPriorityDir, 'deprioritized.csv')
const summaryPath = resolve(exportsDir, 'seed-review-priority-summary.json')

const priorityHeaders = [
  'priority_rank',
  'review_bucket',
  'recommended_action',
  'priority_score',
  'lexical_score',
  'evidence_score',
  'signal_score',
  'topic_score',
  'lexical_class',
  'canonical_name',
  'canonical_key',
  'catalog_class',
  'catalog_reason',
  'member_count',
  'accepted_member_count',
  'variant_count',
  'total_mentions',
  'total_chunks',
  'total_works',
  'matched_chunk_count',
  'matched_work_count',
  'matched_mention_total',
  'collection_count',
  'topic_count',
  'top_plant_parts',
  'top_preparations',
  'top_conditions',
  'top_cautions',
  'top_supporting_works',
  'collections',
  'topic_families',
  'variant_names',
  'source_family_refs',
  'decision_note',
  'sample_work_ids',
  'sample_chunk_ids',
  'scoring_notes',
]

const stopwordWords = new Set([
  'all',
  'another',
  'both',
  'but',
  'called',
  'commonly',
  'divers',
  'good',
  'hath',
  'if',
  'like',
  'little',
  'long',
  'more',
  'rarely',
  'recent',
  'recommend',
  'recommended',
  'singular',
  'slightly',
  'some',
  'such',
  'then',
  'there',
  'these',
  'this',
  'those',
  'very',
  'when',
  'whereas',
  'whose',
  'will',
])

const descriptorWords = new Set([
  'acrid',
  'alcoholic',
  'ammoniated',
  'antimonial',
  'astringent',
  'distilled',
  'bitter',
  'black',
  'blue',
  'brown',
  'cool',
  'dark',
  'emollient',
  'excellent',
  'fine',
  'fixed',
  'fluid',
  'green',
  'light',
  'mild',
  'opening',
  'perennial',
  'ripe',
  'resinous',
  'rough',
  'smooth',
  'spongy',
  'strengthening',
  'sudorific',
  'tender',
  'taste',
  'violet',
  'white',
  'whole',
  'yellow',
  'yellowish',
  'young',
])

const genericSingleWordTerms = new Set([
  'acid',
  'acrid',
  'alcohol',
  'alcoholic',
  'alum',
  'ammonia',
  'ammoniated',
  'antimonial',
  'arrow',
  'bearing',
  'beef',
  'best',
  'butter',
  'cancer',
  'carminative',
  'chalk',
  'china',
  'concrete',
  'cod-liver',
  'distilled',
  'emetic',
  'entire',
  'excellent',
  'eye',
  'fixed',
  'first',
  'fluid',
  'fruit',
  'gall',
  'hard',
  'honey',
  'iodine',
  'indian',
  'iron',
  'lard',
  'like',
  'liquid',
  'little',
  'malt',
  'nerve',
  'pale',
  'peruvian',
  'pink',
  'pleurisy',
  'purging',
  'recent',
  'resinous',
  'soap',
  'slightly',
  'somewhat',
  'spermaceti',
  'spongy',
  'snake',
  'spanish',
  'steel',
  'strengthening',
  'sugar',
  'tar',
  'taste',
  'tin',
  'various',
  'wax',
  'worm',
  'yeast',
  'yellowish',
])

const broadGenericTailWords = new Set(['fruit', 'plant', 'vegetable', 'wood'])
const ambiguousTailWords = new Set(['snake'])
const likelySpecificTailWords = new Set([
  'ash',
  'bane',
  'berry',
  'briar',
  'cardinal',
  'cedar',
  'cohosh',
  'dock',
  'elm',
  'flag',
  'hazel',
  'indigo',
  'lettuce',
  'mint',
  'mallow',
  'thorn',
  'wort',
])

const ocrSignalPattern = /\bfirft\b|\bmall\b|\bmak\b|\bwhofe\b|\bfrefh\b/
const genericCompoundPhraseSet = new Set(['clove july', 'cod liver', 'lime water'])
const suspectPhrasePattern = /\bcommonly called\b|^recommend\b|^like$/
const suspectSplitPairSet = new Set(['com pound', 'peru vian'])

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

const splitList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeWhitespace(item)).filter(Boolean)
  }

  return String(value ?? '')
    .split(';')
    .map((item) => normalizeWhitespace(item))
    .filter(Boolean)
}

const splitWords = (value) =>
  normalizeCatalogKey(value)
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean)

const parseNumber = (value) => Number.parseInt(String(value ?? '0'), 10) || 0

const uniqueValues = (values) => [...new Set(values.filter(Boolean))]

const upsertSignalAggregate = (map, item, workId) => {
  const id = normalizeWhitespace(item?.id || item?.label || item?.name)
  if (!id) {
    return
  }

  const current = map.get(id) ?? {
    id,
    label: normalizeWhitespace(item?.label || item?.name || item?.id),
    signal_count: 0,
    work_ids: new Set(),
  }

  current.signal_count += 1
  current.work_ids.add(workId)
  map.set(id, current)
}

const insertSupportWork = (map, signal, matchedCount, work) => {
  const current = map.get(signal.work_id) ?? {
    work_id: signal.work_id,
    title: work?.title || signal.title || '',
    collection_id: work?.collection_id || signal.collection_id || '',
    signal_chunk_count: 0,
    matched_mention_count: 0,
  }

  current.signal_chunk_count += 1
  current.matched_mention_count += matchedCount
  map.set(signal.work_id, current)
}

const serializeAggregateMap = (map, limit = Number.POSITIVE_INFINITY) =>
  [...map.values()]
    .map((entry) => ({
      id: entry.id,
      label: entry.label,
      signal_count: entry.signal_count,
      work_count: entry.work_ids.size,
    }))
    .sort(
      (left, right) =>
        right.signal_count - left.signal_count ||
        right.work_count - left.work_count ||
        left.label.localeCompare(right.label),
    )
    .slice(0, limit)

const computeLexicalQuality = (row) => {
  const canonicalKey = row.canonical_key
  const words = splitWords(canonicalKey)
  const wordCount = words.length
  const descriptorCount = words.filter((word) => descriptorWords.has(word)).length
  const hasStopword = words.some((word) => stopwordWords.has(word))
  const hasOcrSignal = ocrSignalPattern.test(canonicalKey)
  const isGenericSingleWord = wordCount === 1 && genericSingleWordTerms.has(canonicalKey)
  const hasSpecificTail = wordCount === 2 && likelySpecificTailWords.has(words[1])
  const hasAmbiguousTail = wordCount === 2 && ambiguousTailWords.has(words[1])
  const hasGenericDescriptorTail =
    wordCount === 2 && descriptorWords.has(words[0]) && broadGenericTailWords.has(words[1])
  const isGenericCompound = genericCompoundPhraseSet.has(canonicalKey)
  const hasSuspectPhrase = suspectPhrasePattern.test(canonicalKey)
  const hasSuspectSplitPair = suspectSplitPairSet.has(canonicalKey)

  let score = 0
  const notes = []
  let lexicalClass = 'plain-review'

  if (row.catalog_class === 'historical-ocr-term' || hasOcrSignal) {
    score -= 120
    lexicalClass = 'historical-ocr'
    notes.push('historical-ocr-signal')
  }

  if (wordCount === 1) {
    score += 6
    notes.push('single-word-name')
  } else if (wordCount === 2) {
    score += 26
    notes.push('two-word-name')
  } else if (wordCount === 3) {
    score += 16
    notes.push('three-word-name')
  } else if (wordCount >= 4) {
    score -= 36
    notes.push('long-phrase-name')
  }

  if (isGenericSingleWord) {
    score -= 110
    lexicalClass = 'generic-single-word'
    notes.push('generic-single-word')
  }

  if (descriptorCount === wordCount && wordCount > 0) {
    score -= 95
    lexicalClass = 'descriptor-heavy'
    notes.push('all-descriptor-words')
  } else if (descriptorCount >= 2) {
    score -= 42
    lexicalClass = 'descriptor-heavy'
    notes.push('multi-descriptor-name')
  }

  if (hasStopword) {
    score -= 72
    lexicalClass = 'descriptor-heavy'
    notes.push('contains-function-word')
  }

  if (isGenericCompound) {
    score -= 120
    lexicalClass = 'generic-compound'
    notes.push('generic-compound')
  }

  if (hasSuspectPhrase || hasSuspectSplitPair) {
    score -= 120
    lexicalClass = 'suspect-fragment'
    notes.push(hasSuspectPhrase ? 'suspect-phrase-fragment' : 'suspect-split-fragment')
  }

  if (hasSpecificTail) {
    score += 26
    lexicalClass = 'compound-specific'
    notes.push('specific-second-word')
  }

  if (hasAmbiguousTail) {
    score -= 36
    lexicalClass = 'suspect-fragment'
    notes.push('ambiguous-tail-fragment')
  }

  if (hasGenericDescriptorTail) {
    score -= 72
    lexicalClass = 'descriptor-heavy'
    notes.push('descriptor-plus-generic-tail')
  }

  if (row.catalog_class === 'candidate-specific-family') {
    score += 12
    notes.push('candidate-specific-family')
  }

  if (row.catalog_class === 'ambiguous-plant-name') {
    score -= 10
    notes.push('ambiguous-plant-name')
  }

  if (row.catalog_class === 'historical-ocr-term') {
    score -= 60
  }

  return {
    score,
    lexicalClass,
    notes,
  }
}

const computeTopicScore = (row) => {
  const topics = splitList(row.topic_families).map((topic) => topic.toLowerCase())
  let score = 0

  if (topics.includes('medicinal-plants')) score += 18
  if (topics.includes('medical-botany')) score += 14
  if (topics.includes('herbal')) score += 12
  if (topics.includes('botanic-medicine')) score += 12
  if (topics.includes('botany')) score += 10
  if (topics.includes('materia-medica')) score += 10
  if (topics.includes('pharmacopoeia')) score += 6
  if (topics.includes('cultivation')) score += 4
  if (topics.includes('dietetics')) score += 3
  if (topics.includes('household-health')) score += 2
  if (topics.includes('hygiene')) score += 2

  return Math.min(score, 36)
}

const computeSignalScore = (row) => {
  const plantPartCount = row.plant_parts.length
  const preparationCount = row.preparations.length
  const conditionCount = row.conditions.length
  const cautionCount = row.cautions.length

  return (
    Math.min(plantPartCount, 5) * 2 +
    Math.min(preparationCount, 6) * 3 +
    Math.min(conditionCount, 6) * 3 +
    Math.min(cautionCount, 6) * 3
  )
}

const computeEvidenceScore = (row) => {
  const chunkScore = Math.min(row.matched_chunk_count, 1200) / 20
  const workScore = Math.min(row.matched_work_count, 240) / 6
  const mentionScore = Math.min(row.total_mentions, 1200) / 60
  const breadthScore = Math.min(row.collection_count, 3) * 4 + Math.min(row.topic_count, 8)
  const memberScore = Math.min(row.accepted_member_count, 6) * 2
  return Math.round(chunkScore + workScore + mentionScore + breadthScore + memberScore)
}

const determineBucket = (row) => {
  if (row.lexical_class === 'historical-ocr' || row.priority_score < 0) {
    return {
      review_bucket: 'deprioritized',
      recommended_action: 'consider-exclusion-or-merge',
    }
  }

  if (
    row.lexical_class === 'generic-single-word' ||
    row.lexical_class === 'generic-compound' ||
    row.lexical_class === 'suspect-fragment' ||
    row.lexical_score <= -35
  ) {
    return {
      review_bucket: 'deprioritized',
      recommended_action: 'consider-exclusion-or-merge',
    }
  }

  if (
    row.catalog_class === 'candidate-specific-family' &&
    row.lexical_score >= 18 &&
    row.evidence_score >= 50 &&
    row.signal_score >= 18
  ) {
    return {
      review_bucket: 'promotion-candidate',
      recommended_action: 'consider-manual-seed-promotion',
    }
  }

  if (
    row.catalog_class === 'ambiguous-plant-name' &&
    row.lexical_score >= 8 &&
    row.evidence_score >= 24 &&
    row.signal_score >= 10
  ) {
    return {
      review_bucket: 'identity-review',
      recommended_action: 'review-identity-or-alias-before-promotion',
    }
  }

  return {
    review_bucket: 'secondary-candidate',
    recommended_action: 'keep-in-manual-review-with-evidence',
  }
}

const bucketOrder = {
  'promotion-candidate': 0,
  'identity-review': 1,
  'secondary-candidate': 2,
  deprioritized: 3,
}

await ensureCorpusDirectories()
await mkdir(seedReviewPriorityDir, { recursive: true })

const works = await loadWorksRegistry()
const worksById = new Map(works.map((work) => [work.work_id, work]))
const catalogRows = await readCsvFile(catalogCsvPath)
const reviewRows = catalogRows
  .filter((row) => normalizeWhitespace(row.catalog_status) === 'review')
  .map((row) => ({
    family_id: normalizeWhitespace(row.family_id),
    canonical_name: normalizeWhitespace(row.canonical_name),
    canonical_key: normalizeCatalogKey(row.canonical_key || row.canonical_name),
    catalog_class: normalizeWhitespace(row.catalog_class),
    catalog_reason: normalizeWhitespace(row.catalog_reason),
    source_family_refs: splitList(row.source_family_refs),
    decision_note: normalizeWhitespace(row.decision_note),
    member_count: parseNumber(row.member_count),
    accepted_member_count: parseNumber(row.accepted_member_count),
    total_mentions: parseNumber(row.total_mentions),
    total_chunks: parseNumber(row.total_chunks),
    total_works: parseNumber(row.total_works),
    collections: splitList(row.collections),
    topic_families: splitList(row.topic_families),
    variants: uniqueValues([normalizeWhitespace(row.canonical_name), ...splitList(row.variant_names)]),
    sample_work_ids: splitList(row.sample_work_ids),
    sample_chunk_ids: splitList(row.sample_chunk_ids),
    match_keys: uniqueValues([
      normalizeCatalogKey(row.canonical_key || row.canonical_name),
      normalizeCatalogKey(row.canonical_name),
      ...splitList(row.variant_names).map((variant) => normalizeCatalogKey(variant)),
    ]).filter(Boolean),
    matched_chunk_count: 0,
    matched_work_ids: new Set(),
    matched_mention_total: 0,
    plantPartMap: new Map(),
    preparationMap: new Map(),
    cautionMap: new Map(),
    conditionMap: new Map(),
    supportingWorkMap: new Map(),
  }))

const reviewRowById = new Map(reviewRows.map((row) => [row.family_id, row]))
const matchIndex = new Map()

for (const row of reviewRows) {
  for (const key of row.match_keys) {
    const familyIds = matchIndex.get(key) ?? new Set()
    familyIds.add(row.family_id)
    matchIndex.set(key, familyIds)
  }
}

const lineReader = readline.createInterface({
  input: createReadStream(chunkSignalsPath, 'utf8'),
  crlfDelay: Infinity,
})

for await (const line of lineReader) {
  const trimmed = line.trim()
  if (!trimmed) {
    continue
  }

  let signal
  try {
    signal = JSON.parse(trimmed)
  } catch {
    continue
  }

  const matchedByFamily = new Map()

  for (const candidate of signal.herb_candidates ?? []) {
    const candidateKey = normalizeCatalogKey(candidate?.name || candidate?.herb_id)
    if (!candidateKey) {
      continue
    }

    const familyIds = matchIndex.get(candidateKey)
    if (!familyIds) {
      continue
    }

    for (const familyId of familyIds) {
      const matchedCandidates = matchedByFamily.get(familyId) ?? []
      matchedCandidates.push(candidate)
      matchedByFamily.set(familyId, matchedCandidates)
    }
  }

  if (matchedByFamily.size === 0) {
    continue
  }

  for (const [familyId, matchedCandidates] of matchedByFamily) {
    const row = reviewRowById.get(familyId)
    if (!row) {
      continue
    }

    row.matched_chunk_count += 1
    row.matched_work_ids.add(signal.work_id)
    row.matched_mention_total += matchedCandidates.length

    for (const item of signal.plant_parts ?? []) {
      upsertSignalAggregate(row.plantPartMap, item, signal.work_id)
    }
    for (const item of signal.preparations ?? []) {
      upsertSignalAggregate(row.preparationMap, item, signal.work_id)
    }
    for (const item of signal.cautions ?? []) {
      upsertSignalAggregate(row.cautionMap, item, signal.work_id)
    }
    for (const item of signal.conditions ?? []) {
      upsertSignalAggregate(row.conditionMap, item, signal.work_id)
    }

    insertSupportWork(row.supportingWorkMap, signal, matchedCandidates.length, worksById.get(signal.work_id))
  }
}

const rankedRows = reviewRows.map((row) => {
  const plantParts = serializeAggregateMap(row.plantPartMap, 10)
  const preparations = serializeAggregateMap(row.preparationMap, 10)
  const cautions = serializeAggregateMap(row.cautionMap, 10)
  const conditions = serializeAggregateMap(row.conditionMap, 10)
  const supportingWorks = [...row.supportingWorkMap.values()]
    .sort(
      (left, right) =>
        right.signal_chunk_count - left.signal_chunk_count ||
        right.matched_mention_count - left.matched_mention_count ||
        left.title.localeCompare(right.title),
    )
    .slice(0, sampleLimit)

  const lexical = computeLexicalQuality(row)
  const topicScore = computeTopicScore(row)
  const signalScore = computeSignalScore({
    plant_parts: plantParts,
    preparations,
    cautions,
    conditions,
  })
  const evidenceScore = computeEvidenceScore({
    matched_chunk_count: row.matched_chunk_count,
    matched_work_count: row.matched_work_ids.size,
    total_mentions: row.total_mentions,
    collection_count: row.collections.length,
    topic_count: row.topic_families.length,
    accepted_member_count: row.accepted_member_count,
  })
  const priorityScore = lexical.score + topicScore + signalScore + evidenceScore
  const bucket = determineBucket({
    catalog_class: row.catalog_class,
    lexical_class: lexical.lexicalClass,
    lexical_score: lexical.score,
    evidence_score: evidenceScore,
    signal_score: signalScore,
    priority_score: priorityScore,
  })

  return {
    ...row,
    matched_work_count: row.matched_work_ids.size,
    variant_count: row.variants.length,
    collection_count: row.collections.length,
    topic_count: row.topic_families.length,
    plant_parts: plantParts,
    preparations,
    cautions,
    conditions,
    supporting_works: supportingWorks,
    lexical_score: lexical.score,
    evidence_score: evidenceScore,
    signal_score: signalScore,
    topic_score: topicScore,
    lexical_class: lexical.lexicalClass,
    scoring_notes: lexical.notes,
    priority_score: priorityScore,
    review_bucket: bucket.review_bucket,
    recommended_action: bucket.recommended_action,
  }
})

const sortedRows = rankedRows
  .sort(
    (left, right) =>
      bucketOrder[left.review_bucket] - bucketOrder[right.review_bucket] ||
      right.priority_score - left.priority_score ||
      right.matched_chunk_count - left.matched_chunk_count ||
      left.canonical_name.localeCompare(right.canonical_name),
  )
  .map((row, index) => ({
    priority_rank: index + 1,
    review_bucket: row.review_bucket,
    recommended_action: row.recommended_action,
    priority_score: row.priority_score,
    lexical_score: row.lexical_score,
    evidence_score: row.evidence_score,
    signal_score: row.signal_score,
    topic_score: row.topic_score,
    lexical_class: row.lexical_class,
    canonical_name: row.canonical_name,
    canonical_key: row.canonical_key,
    catalog_class: row.catalog_class,
    catalog_reason: row.catalog_reason,
    member_count: row.member_count,
    accepted_member_count: row.accepted_member_count,
    variant_count: row.variant_count,
    total_mentions: row.total_mentions,
    total_chunks: row.total_chunks,
    total_works: row.total_works,
    matched_chunk_count: row.matched_chunk_count,
    matched_work_count: row.matched_work_count,
    matched_mention_total: row.matched_mention_total,
    collection_count: row.collection_count,
    topic_count: row.topic_count,
    top_plant_parts: row.plant_parts.slice(0, 5).map((entry) => entry.label).join(';'),
    top_preparations: row.preparations.slice(0, 5).map((entry) => entry.label).join(';'),
    top_conditions: row.conditions.slice(0, 5).map((entry) => entry.label).join(';'),
    top_cautions: row.cautions.slice(0, 5).map((entry) => entry.label).join(';'),
    top_supporting_works: row.supporting_works.slice(0, 5).map((entry) => entry.work_id).join(';'),
    collections: row.collections.join(';'),
    topic_families: row.topic_families.join(';'),
    variant_names: row.variants.join(';'),
    source_family_refs: row.source_family_refs.join(';'),
    decision_note: row.decision_note,
    sample_work_ids: row.sample_work_ids.join(';'),
    sample_chunk_ids: row.sample_chunk_ids.join(';'),
    scoring_notes: row.scoring_notes.join(';'),
  }))

const promotionRows = sortedRows.filter((row) => row.review_bucket === 'promotion-candidate')
const identityRows = sortedRows.filter((row) => row.review_bucket === 'identity-review')
const secondaryRows = sortedRows.filter((row) => row.review_bucket === 'secondary-candidate')
const deprioritizedRows = sortedRows.filter((row) => row.review_bucket === 'deprioritized')

await writeCsvFile(allRankedCsvPath, sortedRows, priorityHeaders)
await writeCsvFile(promotionCsvPath, promotionRows, priorityHeaders)
await writeCsvFile(identityCsvPath, identityRows, priorityHeaders)
await writeCsvFile(secondaryCsvPath, secondaryRows, priorityHeaders)
await writeCsvFile(deprioritizedCsvPath, deprioritizedRows, priorityHeaders)

const lexicalClassCounts = sortedRows.reduce((counts, row) => {
  counts[row.lexical_class] = (counts[row.lexical_class] ?? 0) + 1
  return counts
}, {})

const bucketCounts = {
  promotionCandidateCount: promotionRows.length,
  identityReviewCount: identityRows.length,
  secondaryCandidateCount: secondaryRows.length,
  deprioritizedCount: deprioritizedRows.length,
}

const topRows = (rows) =>
  rows.slice(0, topLimit).map((row) => ({
    priority_rank: row.priority_rank,
    canonical_name: row.canonical_name,
    priority_score: row.priority_score,
    catalog_class: row.catalog_class,
    matched_chunk_count: row.matched_chunk_count,
    matched_work_count: row.matched_work_count,
    top_preparations: splitList(row.top_preparations).slice(0, 3),
    top_conditions: splitList(row.top_conditions).slice(0, 3),
    top_cautions: splitList(row.top_cautions).slice(0, 3),
  }))

const summary = {
  generatedAt: new Date().toISOString(),
  totalReviewFamilies: sortedRows.length,
  bucketCounts,
  lexicalClassCounts,
  topPromotionCandidates: topRows(promotionRows),
  topIdentityReviewCandidates: topRows(identityRows),
  topSecondaryCandidates: topRows(secondaryRows),
  topDeprioritizedFamilies: topRows(deprioritizedRows),
  outputPaths: {
    seedReviewPriorityDir,
    allRankedCsvPath,
    promotionCsvPath,
    identityCsvPath,
    secondaryCsvPath,
    deprioritizedCsvPath,
    summaryPath,
  },
}

await writeJson(summaryPath, summary)

const readme = `# Seed Catalog Priority Review

Generated: ${summary.generatedAt}

This layer turns the seed-catalog manual review backlog into a ranked curation queue.

## Why it exists

- separate likely next herb promotions from alias or identity problems
- keep generic or OCR-heavy false positives visible without letting them dominate the curation queue
- preserve a machine-readable review order that can be rerun after every corpus expansion

## Buckets

- \`promotion-candidate\`: likely next seed-ready herb families
- \`identity-review\`: plausible herb families that still need naming or alias resolution
- \`secondary-candidate\`: useful later review families, but not the next best manual promotions
- \`deprioritized\`: weak lexical or OCR-shaped families that are stronger exclusion or merge candidates

## Key files

- \`all-ranked.csv\`
- \`promotion-candidates.csv\`
- \`identity-review.csv\`
- \`secondary-candidates.csv\`
- \`deprioritized.csv\`

## Current counts

- Review families ranked: ${summary.totalReviewFamilies}
- Promotion candidates: ${bucketCounts.promotionCandidateCount}
- Identity-review candidates: ${bucketCounts.identityReviewCount}
- Secondary candidates: ${bucketCounts.secondaryCandidateCount}
- Deprioritized families: ${bucketCounts.deprioritizedCount}
`

await writeFile(readmePath, `${readme}\n`, 'utf8')

console.log(
  JSON.stringify(
    {
      summaryPath,
      seedReviewPriorityDir,
      totalReviewFamilies: summary.totalReviewFamilies,
      ...bucketCounts,
    },
    null,
    2,
  ),
)
