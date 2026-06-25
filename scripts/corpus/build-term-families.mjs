import { createReadStream } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import readline from 'node:readline'
import {
  derivedDir,
  ensureCorpusDirectories,
  exportsDir,
  readCsvFile,
  sha256,
  slugify,
  writeCsvFile,
  writeJson,
} from './lib.mjs'

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, rawValue = 'true'] = argument.replace(/^--/, '').split('=')
    return [key, rawValue]
  }),
)

const sampleLimit = Number(args.get('sample-limit') ?? 3)

const evidenceDir = resolve(derivedDir, 'evidence')
const herbCandidatesPath = resolve(evidenceDir, 'herb-candidates.csv')
const chunkSignalsPath = resolve(evidenceDir, 'chunk-signals.jsonl')
const termFamiliesDir = resolve(derivedDir, 'term-families')
const familiesCsvPath = resolve(termFamiliesDir, 'families.csv')
const membershipsCsvPath = resolve(termFamiliesDir, 'memberships.csv')
const reviewQueueCsvPath = resolve(termFamiliesDir, 'review-queue.csv')
const acceptedFamiliesCsvPath = resolve(termFamiliesDir, 'accepted-families.csv')
const acceptedPlantFamiliesCsvPath = resolve(termFamiliesDir, 'accepted-plant-families.csv')
const acceptedMateriaMedicaFamiliesCsvPath = resolve(termFamiliesDir, 'accepted-materia-medica-families.csv')
const summaryPath = resolve(exportsDir, 'term-family-summary.json')
const readmePath = resolve(termFamiliesDir, 'README.md')

const familyHeaders = [
  'family_id',
  'canonical_name',
  'canonical_key',
  'status',
  'domain_guess',
  'reason_flags',
  'preferred_member_id',
  'preferred_member_name',
  'member_count',
  'accepted_member_count',
  'review_member_count',
  'rejected_member_count',
  'total_mentions',
  'total_chunks',
  'total_works',
  'collections',
  'topic_families',
  'variant_names',
  'sample_work_ids',
  'sample_chunk_ids',
]

const membershipHeaders = [
  'family_id',
  'canonical_name',
  'candidate_id',
  'candidate_name',
  'normalized_name',
  'status',
  'domain_guess',
  'reason_flags',
  'rules_applied',
  'confidence',
  'mention_count',
  'chunk_count',
  'work_count',
  'basis',
]

const reviewHeaders = [
  'family_id',
  'canonical_name',
  'status',
  'domain_guess',
  'reason_flags',
  'member_count',
  'variant_names',
  'sample_work_ids',
  'sample_chunk_ids',
]

const trailingPlantParts = new Set([
  'berry',
  'bark',
  'bulb',
  'flower',
  'gum',
  'herb',
  'leaf',
  'resin',
  'rhizome',
  'root',
  'seed',
  'top',
])

const genericPartTerms = new Set([
  'berries',
  'berry',
  'bark',
  'flower',
  'flowers',
  'gum',
  'gums',
  'herb',
  'herbs',
  'leaf',
  'leaves',
  'root',
  'roots',
  'seed',
  'seeds',
  'stem',
  'top',
  'tops',
])

const grammarNoiseWords = new Set([
  'being',
  'dropped',
  'four',
  'five',
  'have',
  'new',
  'other',
  'put',
  'see',
  'sweetened',
  'taken',
  'them',
  'thefe',
  'these',
  'they',
  'three',
  'top',
  'two',
  'which',
  'while',
])

const descriptorNoiseWords = new Set([
  'astringent',
  'bitter',
  'bruised',
  'diuretic',
  'emollient',
  'expressed',
  'green',
  'long',
  'lower',
  'milky',
  'narrow',
  'radical',
  'round',
  'saline',
  'soft',
  'upper',
  'watery',
  'whole',
  'young',
])

const materialTerms = new Set([
  'amber',
  'cantharides',
  'lead',
  'manna',
  'opium',
  'vitriol',
])

const phraseAliases = [
  { pattern: /\bcamo[- ]?mile\b/g, replacement: 'chamomile' },
  { pattern: /\bcamomile\b/g, replacement: 'chamomile' },
  { pattern: /\bliquorice\b/g, replacement: 'licorice' },
  { pattern: /\bpenny[- ]royal\b/g, replacement: 'pennyroyal' },
]

const singularWordOverrides = new Map([
  ['aloes', 'aloe'],
  ['berries', 'berry'],
  ['bulbs', 'bulb'],
  ['cloves', 'clove'],
  ['flowers', 'flower'],
  ['gums', 'gum'],
  ['herbs', 'herb'],
  ['leaves', 'leaf'],
  ['lemons', 'lemon'],
  ['oranges', 'orange'],
  ['poppies', 'poppy'],
  ['resins', 'resin'],
  ['rhizomes', 'rhizome'],
  ['roots', 'root'],
  ['roses', 'rose'],
  ['seeds', 'seed'],
  ['tamarinds', 'tamarind'],
  ['tops', 'top'],
])

const singularWordExceptions = new Set([
  'aloeswood',
  'cantharides',
  'molasses',
  'sassafras',
])

const normalizeWhitespace = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

const normalizeHyphenSpacing = (value) =>
  normalizeWhitespace(value)
    .replace(/\s*-\s*/g, '-')
    .replace(/-{2,}/g, '-')

const normalizeTerm = (value) =>
  normalizeHyphenSpacing(value)
    .toLowerCase()
    .replace(/[^a-z0-9' -]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const applyAliases = (value) => {
  let updated = value
  for (const alias of phraseAliases) {
    updated = updated.replace(alias.pattern, alias.replacement)
  }
  return normalizeTerm(updated)
}

const titleCaseWord = (word) =>
  word
    .split('-')
    .map((segment) => (segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : segment))
    .join('-')

const displayNameForKey = (value) => normalizeWhitespace(value).split(/\s+/).map(titleCaseWord).join(' ')

const addReason = (set, reason) => {
  if (reason) {
    set.add(reason)
  }
}

const pickSample = (list, value) => {
  if (list.length < sampleLimit && !list.includes(value)) {
    list.push(value)
  }
}

await ensureCorpusDirectories()
await mkdir(termFamiliesDir, { recursive: true })

const candidateRows = await readCsvFile(herbCandidatesPath)
const observedTerms = new Set(candidateRows.map((row) => applyAliases(normalizeTerm(row.normalized_name || row.name))))

const singularizeWord = (word) => {
  if (singularWordOverrides.has(word)) {
    return singularWordOverrides.get(word)
  }

  if (singularWordExceptions.has(word)) {
    return word
  }

  if (word.endsWith('ies') && word.length > 4) {
    const candidate = `${word.slice(0, -3)}y`
    if (observedTerms.has(candidate)) {
      return candidate
    }
  }

  if (word.endsWith('es') && word.length > 4 && !/(ss|us|is|xes|zes|ches|shes)$/.test(word)) {
    const candidate = word.slice(0, -2)
    if (observedTerms.has(candidate)) {
      return candidate
    }
  }

  if (word.endsWith('s') && word.length > 3 && !/(ss|us|is|as)$/.test(word)) {
    const candidate = word.slice(0, -1)
    if (observedTerms.has(candidate)) {
      return candidate
    }
  }

  return word
}

const deriveFamilyKey = (name) => {
  const rulesApplied = []
  let key = applyAliases(normalizeTerm(name))

  const singularized = key
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const singular = singularizeWord(word)
      if (singular !== word) {
        rulesApplied.push(`singularize:${word}->${singular}`)
      }
      return singular
    })
    .join(' ')

  key = singularized

  const words = key.split(/\s+/).filter(Boolean)
  if (words.length > 1 && trailingPlantParts.has(words.at(-1))) {
    const baseKey = words.slice(0, -1).join(' ')
    if (observedTerms.has(baseKey)) {
      key = baseKey
      rulesApplied.push(`strip_part:${words.at(-1)}`)
    }
  }

  return {
    familyKey: key,
    rulesApplied: [...new Set(rulesApplied)].join(';') || 'direct',
  }
}

const classifyMember = (member) => {
  const reasons = new Set()
  const words = member.familyKey.split(/\s+/).filter(Boolean)
  const rawWords = member.normalizedName.split(/\s+/).filter(Boolean)
  const genericPartWordCount = words.filter((word) => genericPartTerms.has(word)).length
  const grammarNoiseCount = words.filter((word) => grammarNoiseWords.has(word)).length
  const descriptorNoiseCount = words.filter((word) => descriptorNoiseWords.has(word)).length
  const hasRawOcrHyphenSplit = /\b[a-z]+-\s+[a-z]+\b/.test(member.rawNormalizedName)

  if (hasRawOcrHyphenSplit || words.some((word) => word === 'thefe')) {
    addReason(reasons, 'ocr-fragment')
  }

  if (grammarNoiseCount > 0) {
    addReason(reasons, 'grammar-fragment')
  }

  if (words.length === 1 && genericPartTerms.has(words[0])) {
    addReason(reasons, 'generic-plant-part')
  }

  if (words.length === 1 && descriptorNoiseWords.has(words[0])) {
    addReason(reasons, 'descriptor-fragment')
  }

  if (descriptorNoiseCount > 0 && genericPartWordCount > 0) {
    addReason(reasons, 'descriptor-plant-phrase')
  }

  if (rawWords.some((word) => ['boiled', 'dropped', 'sweetened'].includes(word))) {
    addReason(reasons, 'process-phrase')
  }

  if (words.length > 2 && grammarNoiseCount > 0) {
    addReason(reasons, 'long-fragment')
  }

  if (member.familyKey.length < 3) {
    addReason(reasons, 'too-short')
  }

  let status = 'accepted'
  let domainGuess = 'plant-or-herbal-term'

  if (reasons.has('ocr-fragment') || reasons.has('grammar-fragment') || reasons.has('process-phrase') || reasons.has('long-fragment')) {
    status = 'rejected'
    domainGuess = 'noise'
  } else if (reasons.has('generic-plant-part') || reasons.has('descriptor-fragment') || reasons.has('descriptor-plant-phrase')) {
    status = 'review'
    domainGuess = 'generic-or-ambiguous'
  } else if (words.some((word) => materialTerms.has(word))) {
    status = 'accepted'
    domainGuess = 'materia-medica'
  } else if (genericPartWordCount > 0 && words.length > 1) {
    domainGuess = 'plant-part-variant'
  }

  return {
    status,
    domainGuess,
    reasonFlags: [...reasons].sort().join(';') || 'direct',
  }
}

const families = new Map()
const familiesById = new Map()
const membershipByCandidateId = new Map()

for (const row of candidateRows) {
  const rawNormalizedName = normalizeTerm(row.normalized_name || row.name)
  const normalizedName = applyAliases(rawNormalizedName)
  const { familyKey, rulesApplied } = deriveFamilyKey(normalizedName)
  const member = {
    candidateId: row.herb_id,
    candidateName: row.name,
    normalizedName,
    rawNormalizedName,
    familyKey,
    rulesApplied,
    confidence: row.confidence,
    mentionCount: Number(row.mention_count || 0),
    chunkCount: Number(row.chunk_count || 0),
    workCount: Number(row.work_count || 0),
    basis: row.basis,
  }

  const classification = classifyMember(member)
  Object.assign(member, classification)

  let family = families.get(familyKey)
  if (!family) {
    family = {
      familyId: `term-${slugify(familyKey)}-${sha256(familyKey).slice(0, 10)}`,
      canonicalKey: familyKey,
      members: [],
      collections: new Set(),
      topicFamilies: new Set(),
      workIds: new Set(),
      chunkCount: 0,
      totalMentions: 0,
      sampleWorkIds: [],
      sampleChunkIds: [],
    }
    families.set(familyKey, family)
    familiesById.set(family.familyId, family)
  }

  family.members.push(member)
  family.totalMentions += member.mentionCount
  membershipByCandidateId.set(member.candidateId, member)
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
  const familyIdsInChunk = new Set()

  for (const candidate of record.herb_candidates ?? []) {
    const member = membershipByCandidateId.get(candidate.herb_id)
    if (!member) {
      continue
    }
    const family = families.get(member.familyKey)
    if (!family) {
      continue
    }

    familyIdsInChunk.add(family.familyId)
    family.collections.add(record.collection_id)
    ;(record.topic_family ?? '')
      .split(';')
      .filter(Boolean)
      .forEach((topic) => family.topicFamilies.add(topic))
    family.workIds.add(record.work_id)
    pickSample(family.sampleWorkIds, record.work_id)
    pickSample(family.sampleChunkIds, record.chunk_id)
  }

  for (const familyId of familyIdsInChunk) {
    const family = familiesById.get(familyId)
    if (family) {
      family.chunkCount += 1
    }
  }
}

const familyRows = [...families.values()]
  .map((family) => {
    const sortedMembers = [...family.members].sort((left, right) => {
      const statusRank = { accepted: 0, review: 1, rejected: 2 }
      return (
        statusRank[left.status] - statusRank[right.status] ||
        right.chunkCount - left.chunkCount ||
        left.candidateName.localeCompare(right.candidateName)
      )
    })

    const preferredMember = sortedMembers[0]
    const acceptedMemberCount = family.members.filter((member) => member.status === 'accepted').length
    const reviewMemberCount = family.members.filter((member) => member.status === 'review').length
    const rejectedMemberCount = family.members.filter((member) => member.status === 'rejected').length
    const familyStatus = acceptedMemberCount > 0 ? 'accepted' : reviewMemberCount > 0 ? 'review' : 'rejected'
    const familyReasonFlags = [...new Set(family.members.flatMap((member) => member.reasonFlags.split(';').filter(Boolean)))]
      .sort()
      .join(';')

    return {
      family_id: family.familyId,
      canonical_name: displayNameForKey(family.canonicalKey),
      canonical_key: family.canonicalKey,
      status: familyStatus,
      domain_guess: preferredMember.domainGuess,
      reason_flags: familyReasonFlags || 'direct',
      preferred_member_id: preferredMember.candidateId,
      preferred_member_name: preferredMember.candidateName,
      member_count: family.members.length,
      accepted_member_count: acceptedMemberCount,
      review_member_count: reviewMemberCount,
      rejected_member_count: rejectedMemberCount,
      total_mentions: family.totalMentions,
      total_chunks: family.chunkCount,
      total_works: family.workIds.size,
      collections: [...family.collections].sort().join(';'),
      topic_families: [...family.topicFamilies].sort().join(';'),
      variant_names: sortedMembers.map((member) => member.candidateName).join(';'),
      sample_work_ids: family.sampleWorkIds.join(';'),
      sample_chunk_ids: family.sampleChunkIds.join(';'),
      _members: sortedMembers,
    }
  })
  .sort((left, right) => Number(right.total_chunks) - Number(left.total_chunks) || left.canonical_name.localeCompare(right.canonical_name))

const membershipRows = familyRows.flatMap((family) =>
  family._members.map((member) => ({
    family_id: family.family_id,
    canonical_name: family.canonical_name,
    candidate_id: member.candidateId,
    candidate_name: member.candidateName,
    normalized_name: member.normalizedName,
    status: member.status,
    domain_guess: member.domainGuess,
    reason_flags: member.reasonFlags,
    rules_applied: member.rulesApplied,
    confidence: member.confidence,
    mention_count: member.mentionCount,
    chunk_count: member.chunkCount,
    work_count: member.workCount,
    basis: member.basis,
  })),
)

const reviewRows = familyRows
  .filter((family) => family.status !== 'accepted')
  .map((family) => ({
    family_id: family.family_id,
    canonical_name: family.canonical_name,
    status: family.status,
    domain_guess: family.domain_guess,
    reason_flags: family.reason_flags,
    member_count: family.member_count,
    variant_names: family.variant_names,
    sample_work_ids: family.sample_work_ids,
    sample_chunk_ids: family.sample_chunk_ids,
  }))

const acceptedFamilyRows = familyRows.filter((family) => family.status === 'accepted')
const acceptedPlantFamilyRows = acceptedFamilyRows.filter((family) =>
  ['plant-or-herbal-term', 'plant-part-variant'].includes(family.domain_guess),
)
const acceptedMateriaMedicaFamilyRows = acceptedFamilyRows.filter((family) => family.domain_guess === 'materia-medica')

const summary = {
  generatedAt: new Date().toISOString(),
  totalFamilies: familyRows.length,
  acceptedFamilies: acceptedFamilyRows.length,
  acceptedPlantFamilies: acceptedPlantFamilyRows.length,
  acceptedMateriaMedicaFamilies: acceptedMateriaMedicaFamilyRows.length,
  reviewFamilies: familyRows.filter((family) => family.status === 'review').length,
  rejectedFamilies: familyRows.filter((family) => family.status === 'rejected').length,
  totalMembers: membershipRows.length,
  acceptedMembers: membershipRows.filter((member) => member.status === 'accepted').length,
  reviewMembers: membershipRows.filter((member) => member.status === 'review').length,
  rejectedMembers: membershipRows.filter((member) => member.status === 'rejected').length,
  topAcceptedFamilies: acceptedFamilyRows.slice(0, 20).map((family) => ({
    family_id: family.family_id,
    canonical_name: family.canonical_name,
    total_chunks: Number(family.total_chunks),
    total_works: Number(family.total_works),
    variant_names: family.variant_names,
  })),
  topReviewFamilies: reviewRows.slice(0, 20),
}

const readme = [
  '# Term Families',
  '',
  `Generated: ${summary.generatedAt}`,
  '',
  'This layer sits above the raw evidence extraction output.',
  '',
  '## Purpose',
  '',
  '- preserve raw source extraction in `derived/evidence/`',
  '- group obvious lexical variants into canonical term families',
  '- separate likely terms from generic fragments and OCR debris',
  '- create a review queue for ambiguous or noisy candidates',
  '',
  '## Current summary',
  '',
  `- Total families: ${summary.totalFamilies}`,
  `- Accepted families: ${summary.acceptedFamilies}`,
  `- Review families: ${summary.reviewFamilies}`,
  `- Rejected families: ${summary.rejectedFamilies}`,
  `- Total raw members: ${summary.totalMembers}`,
  '',
  '## Key files',
  '',
  '- `families.csv`',
  '- `memberships.csv`',
  '- `review-queue.csv`',
  '- `accepted-families.csv`',
  '- `accepted-plant-families.csv`',
  '- `accepted-materia-medica-families.csv`',
  '',
  '## Notes',
  '',
  '- this layer does not overwrite the raw evidence output',
  '- accepted plant families are a cleaner seed layer for the future herbal database',
  '- accepted families may still include non-plant materia medica terms, which are separated into their own export',
  '- review and rejected families are intended to guide the next manual or scripted cleanup pass',
  '',
].join('\n')

await writeCsvFile(
  familiesCsvPath,
  familyRows.map(({ _members, ...family }) => family),
  familyHeaders,
)
await writeCsvFile(membershipsCsvPath, membershipRows, membershipHeaders)
await writeCsvFile(reviewQueueCsvPath, reviewRows, reviewHeaders)
await writeCsvFile(acceptedFamiliesCsvPath, acceptedFamilyRows.map(({ _members, ...family }) => family), familyHeaders)
await writeCsvFile(
  acceptedPlantFamiliesCsvPath,
  acceptedPlantFamilyRows.map(({ _members, ...family }) => family),
  familyHeaders,
)
await writeCsvFile(
  acceptedMateriaMedicaFamiliesCsvPath,
  acceptedMateriaMedicaFamilyRows.map(({ _members, ...family }) => family),
  familyHeaders,
)
await writeJson(summaryPath, summary)
await writeFile(readmePath, `${readme}\n`, 'utf8')

console.log(
  JSON.stringify(
    {
      summaryPath,
      familiesCsvPath,
      membershipsCsvPath,
      reviewQueueCsvPath,
      acceptedPlantFamiliesCsvPath,
      acceptedMateriaMedicaFamiliesCsvPath,
      totalFamilies: summary.totalFamilies,
      acceptedFamilies: summary.acceptedFamilies,
      reviewFamilies: summary.reviewFamilies,
      rejectedFamilies: summary.rejectedFamilies,
    },
    null,
    2,
  ),
)
