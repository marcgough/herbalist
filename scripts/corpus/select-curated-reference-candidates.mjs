import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { isAbsolute, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { derivedDir, exportsDir, loadWorksRegistry, readCsvFile, writeCsvFile, writeJson } from './lib.mjs'

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, rawValue = 'true'] = argument.replace(/^--/, '').split('=')
    return [key, rawValue]
  }),
)

const scriptDir = resolve(fileURLToPath(new URL('.', import.meta.url)))
const projectRootDir = resolve(scriptDir, '..', '..')
const frontierProfilesDir = resolve(projectRootDir, 'corpus', 'review', 'frontier-profiles')

const parseList = (value) =>
  String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const parseScoreMap = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return new Map()
  }

  return new Map(
    Object.entries(value)
      .map(([key, rawScore]) => [String(key).trim().toLowerCase(), Number(rawScore)])
      .filter(([key, score]) => key && Number.isFinite(score)),
  )
}

const parseTitleScoreAdjustments = (value) =>
  Array.isArray(value)
    ? value
        .map((item) => ({
          phrase: normalizeTextMatch(item?.phrase ?? item?.title ?? ''),
          score: Number(item?.score),
        }))
        .filter((item) => item.phrase && Number.isFinite(item.score))
    : []

const parseInteger = (value, fallback, minimum = 0) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return fallback
  }

  return Math.max(minimum, Math.trunc(parsed))
}

const resolveProfilePath = (profileRef) => {
  const trimmed = String(profileRef ?? '').trim()
  if (!trimmed) {
    return null
  }

  if (isAbsolute(trimmed)) {
    return trimmed
  }

  if (/[\\/]/.test(trimmed)) {
    return resolve(projectRootDir, trimmed)
  }

  return resolve(frontierProfilesDir, trimmed.endsWith('.json') ? trimmed : `${trimmed}.json`)
}

const readProfile = async (profileRef) => {
  const profilePath = resolveProfilePath(profileRef)
  if (!profilePath) {
    return null
  }

  const profile = JSON.parse(await readFile(profilePath, 'utf8'))
  return {
    ref: String(profileRef).trim(),
    path: profilePath,
    profile,
  }
}

const normalizeAscii = (value) =>
  String(value ?? '')
    .replace(/[Ææ]/g, 'ae')
    .replace(/[Œœ]/g, 'oe')
    .replace(/[Øø]/g, 'o')
    .replace(/[Ðð]/g, 'd')
    .replace(/[Þþ]/g, 'th')
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')

const normalizeWhitespace = (value) => normalizeAscii(value).replace(/\s+/g, ' ').trim()
const normalizeTextMatch = (value) =>
  normalizeWhitespace(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const normalizeProfileKey = (value) => normalizeWhitespace(value).toLowerCase()

const stripTrailingByline = (value) => String(value ?? '').replace(/\s+\/\s+.*$/i, '').trim()

const stripVolumeMarkers = (value) =>
  String(value ?? '')
    .replace(/\((?:volume|vol(?:ume)?|part|copy|tome|band|book)\s*[^)]*\)/gi, ' ')
    .replace(/\b(?:volume|vol(?:ume)?|part|copy|tome|band|book)\.?\s*[ivxlcdm0-9]+\b/gi, ' ')
    .replace(/\bv\.\s*[ivxlcdm0-9-]+\b/gi, ' ')

const normalizeTitleKey = (value) =>
  normalizeWhitespace(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[\[\]]/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/^(the|a|an)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim()

const extractSeriesTitleKey = (title) => {
  let working = stripTrailingByline(stripVolumeMarkers(normalizeWhitespace(title).replace(/\s*\.\.\.\s*/g, ' ')))
  const orMatch = working.match(/^(.*?)(?:\s*[,;:]?\s+or\b,?\s+.+)$/i)
  if (orMatch && orMatch[1].trim().split(/\s+/).length >= 2) {
    working = orMatch[1].trim()
  }

  const clauseMatch = working.match(
    /^(.*?)(?:\s+(?:containing|including|being|with|comprising|adapted|abridged|illustrated|forming)\b.*)$/i,
  )
  if (clauseMatch && clauseMatch[1].trim().split(/\s+/).length >= 3) {
    working = clauseMatch[1].trim()
  }

  const colonIndex = working.indexOf(' : ')
  if (colonIndex > 0) {
    working = working.slice(0, colonIndex)
  }

  const semicolonIndex = working.indexOf(' ; ')
  if (semicolonIndex > 0 && semicolonIndex < 140) {
    working = working.slice(0, semicolonIndex)
  }

  return normalizeTitleKey(working)
}

const splitList = (value) =>
  String(value ?? '')
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean)

const toInteger = (value) => {
  const parsed = Number(String(value ?? '').replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

const loadedProfile = await readProfile(args.get('profile'))
const profile = loadedProfile?.profile ?? null
const projectCollections = new Set(
  parseList(args.get('collections')).length > 0
    ? parseList(args.get('collections'))
    : ['nlm-digital-collections', 'wellcome-collection'],
)
const includeDepth = args.get('include-depth') !== 'false'
const includeFailedFamilies = args.get('include-failed-families') === 'true'
const explicitPerCollectionLimit = args.has('per-collection-limit')
  ? parseInteger(args.get('per-collection-limit'), 12, 1)
  : null
const overallLimit = parseInteger(args.get('overall-limit'), Number.MAX_SAFE_INTEGER, 1)
const minScore = parseInteger(args.get('min-score'), 150, -10000)
const collectionLimits = new Map(
  [
    ['nlm-digital-collections', args.has('nlm-limit') ? args.get('nlm-limit') : profile?.nlmLimit],
    ['wellcome-collection', args.has('wellcome-limit') ? args.get('wellcome-limit') : profile?.wellcomeLimit],
  ]
    .map(([collectionId, value]) => [collectionId, parseInteger(value, Number.NaN, 1)])
    .filter(([, value]) => Number.isFinite(value)),
)
const limitForCollection = (collectionId) => explicitPerCollectionLimit ?? collectionLimits.get(collectionId) ?? 12
const excludeWorkIds = new Set([...parseList(profile?.excludeWorkIds), ...parseList(args.get('exclude-work-ids'))])
const excludeSeriesKeys = new Set(
  [...parseList(profile?.excludeSeriesKeys), ...parseList(args.get('exclude-series-keys'))]
    .map((value) => normalizeProfileKey(value))
    .filter(Boolean),
)
const excludeCreatorSeriesKeys = new Set(
  [...parseList(profile?.excludeCreatorSeriesKeys), ...parseList(args.get('exclude-creator-series-keys'))]
    .map((value) => normalizeProfileKey(value))
    .filter(Boolean),
)
const excludeTitlePhrases = new Set(
  [...parseList(profile?.excludeTitlePhrases), ...parseList(args.get('exclude-title-phrases'))]
    .map((value) => normalizeTextMatch(value))
    .filter(Boolean),
)
const profileTopicBoosts = parseScoreMap(profile?.topicBoosts)
const profileClusterBoosts = parseScoreMap(profile?.clusterBoosts)
const titleScoreAdjustments = parseTitleScoreAdjustments(profile?.titleScoreAdjustments)

const editionFamiliesDir = resolve(derivedDir, 'edition-families')
const reviewDir = resolve(derivedDir, '..', 'review', 'curated-reference-selector')
const candidatesCsvPath = resolve(reviewDir, 'candidates.csv')
const summaryPath = resolve(exportsDir, 'curated-reference-selector-summary.json')

const familyHeaders = [
  'rank',
  'priority_score',
  'collection_id',
  'work_id',
  'title',
  'series_key',
  'creator',
  'publication_year',
  'topic_family',
  'family_stage',
  'family_id',
  'family_label',
  'family_work_count',
  'family_chunked_count',
  'positive_reasons',
  'negative_reasons',
  'source_url',
]

const topicScores = new Map([
  ['pharmacopoeia', 125],
  ['materia-medica', 110],
  ['medical-botany', 110],
  ['medicinal-plants', 100],
  ['herbal', 90],
  ['botany', 70],
  ['hygiene', 45],
  ['public-health', 35],
  ['nursing', 20],
  ['dietetics', 20],
  ['domestic-medicine', -130],
  ['household-health', -25],
])

const positiveTitleSignals = [
  { label: 'dispensatory', pattern: /\bdispens(?:atory|atories|atorium)\b/i, score: 190 },
  { label: 'pharmacopoeia', pattern: /\bpharmacop(?:oe)?ia\b/i, score: 185 },
  { label: 'materia-medica', pattern: /\bmateria medica\b/i, score: 175 },
  { label: 'medical-botany', pattern: /\bmedical botany\b/i, score: 170 },
  { label: 'medicinal-plants', pattern: /\bmedicinal plants?\b/i, score: 165 },
  { label: 'medical-flora', pattern: /\bmedical flora\b|\bflora medica\b/i, score: 160 },
  { label: 'pharmacognosy', pattern: /\bpharmacognosy\b/i, score: 160 },
  { label: 'dictionary', pattern: /\b(?:medical )?dictionary\b|\blexicon medicum\b/i, score: 150 },
  { label: 'herbal', pattern: /\bherbal\b/i, score: 145 },
  { label: 'flora', pattern: /\bflora\b/i, score: 120 },
  { label: 'conspectus', pattern: /\bconspectus\b/i, score: 120 },
  { label: 'compend', pattern: /\bcompend(?:ium)?\b/i, score: 110 },
  { label: 'manual', pattern: /\bmanual\b/i, score: 85 },
  { label: 'handbook', pattern: /\bhand ?book\b/i, score: 75 },
  { label: 'reference-work', pattern: /\bencyclop(?:ae)?dia\b|\breference\b/i, score: 70 },
  { label: 'hygiene', pattern: /\bhygiene\b|\bsanitary science\b|\bpublic health\b/i, score: 55 },
  { label: 'botany', pattern: /\bbotany\b|\bbotanical\b/i, score: 50 },
]

const titleClusterSignals = [
  { cluster: 'pharmacopoeia', pattern: /\bpharmacop(?:oe)?ia\b/i },
  { cluster: 'reference-work', pattern: /\b(?:medical )?dictionary\b|\blexicon medicum\b|\bencyclop(?:ae)?dia\b|\breference\b/i },
  { cluster: 'materia-medica', pattern: /\bmateria medica\b|\bpharmacognosy\b/i },
  { cluster: 'herbal', pattern: /\bherbal\b|\bmedical botany\b|\bmedicinal plants?\b|\bmedical flora\b|\bflora medica\b|\bflora\b/i },
  { cluster: 'family-physician', pattern: /\bfamily physician\b|\bbotanic family physician\b|\bhome doctor\b/i },
  { cluster: 'domestic-medicine', pattern: /\bdomestic medicine\b|\bdomestic physician\b|\bpopular medicine\b/i },
  { cluster: 'guide-to-health', pattern: /\bguide to health\b/i },
]

const negativeTitleSignals = [
  { label: 'lecture', pattern: /\blecture(?:s)?\b/i, score: 320 },
  { label: 'address', pattern: /\bopening address\b|\binaugural lecture\b|\baddress\b/i, score: 320 },
  { label: 'proceedings', pattern: /\bproceedings\b/i, score: 360 },
  { label: 'circular', pattern: /\bcircular\b/i, score: 360 },
  { label: 'meeting-paper', pattern: /\bmeeting\b|\bpaper read before\b|\bdelivered before\b|\bread before\b/i, score: 280 },
  { label: 'testimonials', pattern: /\btestimonial(?:s)?\b/i, score: 420 },
  { label: 'examination', pattern: /\bexamination(?:s)?\b|\bprizes?\b/i, score: 420 },
  { label: 'questions-and-answers', pattern: /\bquestions?\s*(?:&|and)\s*answers?\b|\bquiz compend\b/i, score: 440 },
  { label: 'syllabus', pattern: /\bsyllabus\b|\blaboratory work\b/i, score: 300 },
  { label: 'students', pattern: /\bstudents?\b|\bfor the use of students\b|\bfor use in medical colleges\b/i, score: 160 },
  { label: 'catalogue', pattern: /\bcatalog(?:ue)?\b|\blist of books\b/i, score: 420 },
  { label: 'report', pattern: /\breport\b|\bcommission\b/i, score: 320 },
  { label: 'bulletin', pattern: /\bbulletin\b/i, score: 240 },
  { label: 'criticism', pattern: /\bcriticism\b/i, score: 220 },
  { label: 'pamphlet', pattern: /\bpamphlet\b/i, score: 320 },
  { label: 'diary', pattern: /\bdiary\b/i, score: 420 },
  { label: 'essay-paper', pattern: /^(?:an?\s+)?(?:essay|paper)\b|\bhistorical sketch\b/i, score: 320 },
  { label: 'memorial', pattern: /\bmemorial\b|\btrustees?\b|\bpraying for\b|\bprofessorship\b/i, score: 520 },
  { label: 'note-fragment', pattern: /\bpreliminary note\b|\bsupplementary note\b|\breview of\b|\bextract from\b/i, score: 360 },
  { label: 'administrative', pattern: /\bcommittee\b|\bannual meeting\b|\bsection read before\b|\btransactions\b|\bproposed plan\b|\bminutes\b|\bconvention\b|\bassociation\b/i, score: 360 },
  { label: 'sales-copy', pattern: /\bto be sold at the prices affixed\b|\bfor sale\b/i, score: 420 },
  { label: 'trade-copy', pattern: /\bdruggists?'? reference book\b|\bretail pharmacy\b|\bprice and dose labels\b|\brevised list of formulas\b|\bformula list\b|\bdose list\b|\buniform drugs\b|\bfluid extracts?\b|\bcoated pills?\b|\bspecialties\b/i, score: 480 },
  { label: 'manufacturer-copy', pattern: /\bintroduced and manufactured by\b|\bpresented to the medical profession\b|\bprepared at the laboratory of\b|\bwith their compliments\b/i, score: 520 },
  { label: 'narrow-formula', pattern: /\bweights of the pharmacopoeia\b|\bformula for official dilute hydrobromic acid\b/i, score: 420 },
  { label: 'narrow-analysis', pattern: /\bvolumetric analysis\b/i, score: 260 },
  { label: 'jail-report', pattern: /\bjails?\b|\bprisoners?\b/i, score: 420 },
  { label: 'school-architecture', pattern: /\bschool architecture\b/i, score: 380 },
  { label: 'veterinary', pattern: /\bveterinary medicine\b|\bveterinary college\b|\bfarrier\b|\bhorses?\b|\bhippiatrica\b/i, score: 320 },
  { label: 'arts-trades', pattern: /\barts?, manufactures?, professions? and trades?\b|\bdomestic economy\b/i, score: 320 },
  { label: 'repertory', pattern: /\brepertory\b/i, score: 220 },
  { label: 'reminiscence', pattern: /\breminiscences?\b/i, score: 260 },
  { label: 'family-physician-repeat', pattern: /\bfamily physician\b|\bhome doctor\b/i, score: 160 },
  { label: 'domestic-repeat', pattern: /\bdomestic medicine\b|\bdomestic physician\b/i, score: 140 },
  { label: 'sexual-manual', pattern: /\bmaster-piece\b|\bsexual physiology\b|\bphreno-chart\b/i, score: 700 },
]

const foreignLeadingSignals = [
  { label: 'foreign-leading', pattern: /^(?:abrege|abreg[eé]|catalogi|catalogus|codigo|contribucion|continuacion|dispensatorium|grundriss|institutiones|pharmacopoea|quaestio|tournefortius|hortus|de plantis|um islenzkar)\b/i, score: 360 },
  { label: 'latin-reference', pattern: /^(?:pharmacopoeia collegii|pharmacopoeia edinburgensis|pharmacopoeia londinensis|pharmacopoeia officinalis)\b/i, score: 220 },
]

const englishReferencePattern =
  /\b(?:guide|manual|hand ?book|dictionary|pharmacop(?:oe)?ia|materia medica|herbal|medicinal plants?|medical botany|dispensatory|flora|therapeutics|pharmacognosy)\b/i

const foreignFunctionWordPatterns = [
  /\bpar\b/i,
  /\bpor\b/i,
  /\bvon\b/i,
  /\bund\b/i,
  /\bdans\b/i,
  /\bdes\b/i,
  /\bdu\b/i,
  /\blas?\b/i,
  /\bder\b/i,
  /\bdie\b/i,
  /\bdas\b/i,
  /\bmit\b/i,
  /\bedidit\b/i,
  /\bzur\b/i,
]

const stageBonus = (family) => {
  const chunkedCount = toInteger(family?.chunked_count)
  const failedCount = toInteger(family?.failed_count)
  if (!family) {
    return { stage: 'standalone', score: 20 }
  }
  if (failedCount > 0 && chunkedCount === 0) {
    return { stage: 'failed_only_family', score: 90 }
  }
  if (chunkedCount === 0) {
    return { stage: 'uncovered_family', score: 120 }
  }
  return { stage: 'depth_family', score: 40 }
}

const isVolumeLike = (title) =>
  /\b(?:volume|vol(?:ume)?|part|copy|tome|band|book)\.?\s*[ivxlcdm0-9]+\b/i.test(title) ||
  /\(.*(?:volume|vol(?:ume)?|part|copy|tome|band|book)\s*[ivxlcdm0-9]+.*\)/i.test(title)

const countForeignFunctionWords = (title) =>
  foreignFunctionWordPatterns.reduce((count, pattern) => count + (pattern.test(title) ? 1 : 0), 0)

const familyIdFor = (family, work) => family?.family_id || `work-${work.work_id}`

const collectionIds = [...projectCollections]
const [works, families, memberships] = await Promise.all([
  loadWorksRegistry(),
  readCsvFile(resolve(editionFamiliesDir, 'families.csv')),
  readCsvFile(resolve(editionFamiliesDir, 'memberships.csv')),
])

const familyById = new Map(families.map((family) => [family.family_id, family]))
const familyByWorkId = new Map(
  memberships.map((membership) => [membership.work_id, familyById.get(membership.family_id) ?? null]),
)

const candidates = []

for (const work of works) {
  if (work.ingest_status !== 'discovered') {
    continue
  }

  if (!projectCollections.has(work.collection_id)) {
    continue
  }

  if (excludeWorkIds.has(work.work_id)) {
    continue
  }

  const family = familyByWorkId.get(work.work_id) ?? null
  const { stage, score: familyStageScore } = stageBonus(family)
  if (!includeDepth && stage === 'depth_family') {
    continue
  }
  if (!includeFailedFamilies && stage === 'failed_only_family') {
    continue
  }

  const title = normalizeWhitespace(work.title)
  const titleMatch = normalizeTextMatch(title)
  if ([...excludeTitlePhrases].some((phrase) => titleMatch.includes(phrase))) {
    continue
  }

  const seriesKey = extractSeriesTitleKey(family?.family_label ?? work.title)
  if (excludeSeriesKeys.has(normalizeProfileKey(seriesKey))) {
    continue
  }

  const creatorSeriesKey = normalizeProfileKey(`${work.creator ?? ''}::${seriesKey}`)
  if (excludeCreatorSeriesKeys.has(creatorSeriesKey)) {
    continue
  }

  const topicFamilies = splitList(work.topic_family)
  const positiveReasons = []
  const negativeReasons = []

  let score = familyStageScore

  for (const topic of topicFamilies) {
    const topicScore = topicScores.get(topic)
    if (!Number.isFinite(topicScore) || topicScore === 0) {
      continue
    }
    score += topicScore
    positiveReasons.push(`topic:${topic}`)
  }

  for (const topic of topicFamilies) {
    const profileTopicScore = profileTopicBoosts.get(String(topic).toLowerCase())
    if (!Number.isFinite(profileTopicScore) || profileTopicScore === 0) {
      continue
    }

    score += profileTopicScore
    ;(profileTopicScore > 0 ? positiveReasons : negativeReasons).push(`profile-topic:${topic}`)
  }

  for (const signal of positiveTitleSignals) {
    if (!signal.pattern.test(title)) {
      continue
    }
    score += signal.score
    positiveReasons.push(`title:${signal.label}`)
  }

  for (const signal of negativeTitleSignals) {
    if (!signal.pattern.test(title)) {
      continue
    }
    score -= signal.score
    negativeReasons.push(`title:${signal.label}`)
  }

  const matchedClusters = new Set()
  for (const signal of titleClusterSignals) {
    if (signal.pattern.test(title)) {
      matchedClusters.add(signal.cluster)
    }
  }

  for (const cluster of matchedClusters) {
    const clusterScore = profileClusterBoosts.get(cluster)
    if (!Number.isFinite(clusterScore) || clusterScore === 0) {
      continue
    }

    score += clusterScore
    ;(clusterScore > 0 ? positiveReasons : negativeReasons).push(`profile-cluster:${cluster}`)
  }

  for (const signal of foreignLeadingSignals) {
    if (!signal.pattern.test(titleMatch)) {
      continue
    }
    score -= signal.score
    negativeReasons.push(`language:${signal.label}`)
  }

  const foreignWordCount = countForeignFunctionWords(titleMatch)
  if (foreignWordCount >= 3 && !englishReferencePattern.test(title)) {
    score -= 180
    negativeReasons.push('language:foreign-function-word-density')
  }

  for (const adjustment of titleScoreAdjustments) {
    if (!titleMatch.includes(adjustment.phrase)) {
      continue
    }

    score += adjustment.score
    ;(adjustment.score > 0 ? positiveReasons : negativeReasons).push(`profile-title:${adjustment.phrase}`)
  }

  if (isVolumeLike(title) && stage === 'depth_family') {
    score += 35
    positiveReasons.push('structure:companion-volume')
  }

  const familyChunkedCount = toInteger(family?.chunked_count)
  const familyWorkCount = toInteger(family?.work_count)
  if (familyChunkedCount >= 1) {
    const penalty = Math.min(familyChunkedCount, 4) * 28
    score -= penalty
    negativeReasons.push(`family:already-represented-${familyChunkedCount}`)
  }

  if (familyWorkCount >= 6 && familyChunkedCount >= 2) {
    score -= 70
    negativeReasons.push('family:heavy-repeat-family')
  }

  if (familyChunkedCount >= 3) {
    score -= 90
    negativeReasons.push('family:deep-repeat-family')
  }

  if (family?.clustering_confidence === 'high') {
    score += 10
    positiveReasons.push('family:high-confidence-cluster')
  }

  if (/(?:^|;)(?:US|UK)(?:;|$)/.test(`;${work.jurisdiction_lane};`)) {
    score += 12
    positiveReasons.push(`jurisdiction:${work.jurisdiction_lane}`)
  }

  const publicationYear = Number.parseInt(String(work.publication_year ?? ''), 10)
  if (Number.isFinite(publicationYear) && publicationYear >= 1700 && publicationYear <= 1925) {
    score += 8
    positiveReasons.push('year:historical-reference-window')
  }

  const hasStrongReferenceSignal =
    positiveReasons.some((reason) =>
      /title:(?:dispensatory|pharmacopoeia|materia-medica|medical-botany|medicinal-plants|medical-flora|pharmacognosy|dictionary|herbal|flora|conspectus|compend)/.test(
        reason,
      ),
    ) ||
    topicFamilies.some((topic) =>
      ['pharmacopoeia', 'materia-medica', 'medical-botany', 'medicinal-plants', 'herbal', 'botany'].includes(topic),
    )

  if (!hasStrongReferenceSignal) {
    continue
  }

  if (score < minScore) {
    continue
  }

  candidates.push({
    collection_id: work.collection_id,
    work_id: work.work_id,
    title: work.title,
    series_key: seriesKey,
    creator: work.creator,
    publication_year: work.publication_year,
    topic_family: work.topic_family,
    family_stage: stage,
    family_id: familyIdFor(family, work),
    family_label: family?.family_label ?? work.title,
    family_work_count: family?.work_count ?? '1',
    family_chunked_count: family?.chunked_count ?? '0',
    priority_score: score,
    positive_reasons: positiveReasons.join(';'),
    negative_reasons: negativeReasons.join(';'),
    source_url: work.source_url,
  })
}

const bestPerFamily = new Map()
for (const candidate of candidates) {
  const current = bestPerFamily.get(candidate.family_id)
  if (!current || candidate.priority_score > current.priority_score) {
    bestPerFamily.set(candidate.family_id, candidate)
  }
}

const bestPerSeries = new Map()
for (const candidate of bestPerFamily.values()) {
  const seriesBucketKey = `${candidate.collection_id}:${candidate.series_key || candidate.family_id}`
  const current = bestPerSeries.get(seriesBucketKey)
  if (!current || candidate.priority_score > current.priority_score) {
    bestPerSeries.set(seriesBucketKey, candidate)
  }
}

const rankedCandidates = [...bestPerSeries.values()].sort(
  (left, right) =>
    right.priority_score - left.priority_score ||
    left.collection_id.localeCompare(right.collection_id) ||
    left.title.localeCompare(right.title),
)

const selected = []
const selectedIdsByCollection = Object.fromEntries(collectionIds.map((collectionId) => [collectionId, []]))
const perCollectionCounts = Object.fromEntries(collectionIds.map((collectionId) => [collectionId, 0]))

for (const candidate of rankedCandidates) {
  const collectionLimit = limitForCollection(candidate.collection_id)
  if ((perCollectionCounts[candidate.collection_id] ?? 0) >= collectionLimit) {
    continue
  }
  if (selected.length >= overallLimit) {
    break
  }

  perCollectionCounts[candidate.collection_id] += 1
  selectedIdsByCollection[candidate.collection_id].push(candidate.work_id)
  selected.push({
    ...candidate,
    rank: selected.length + 1,
  })
}

await mkdir(reviewDir, { recursive: true })
await writeCsvFile(candidatesCsvPath, selected, familyHeaders)

for (const collectionId of collectionIds) {
  const worklistPath = resolve(reviewDir, `${collectionId}.txt`)
  await writeFile(worklistPath, `${selectedIdsByCollection[collectionId].join('\n')}${selectedIdsByCollection[collectionId].length ? '\n' : ''}`, 'utf8')
}

await writeJson(summaryPath, {
  generatedAt: new Date().toISOString(),
  profile: loadedProfile
    ? {
        ref: loadedProfile.ref,
        path: loadedProfile.path,
        profileId: profile?.profileId ?? null,
        description: profile?.description ?? '',
      }
    : null,
  collections: collectionIds,
  includeDepth,
  includeFailedFamilies,
  perCollectionLimit: explicitPerCollectionLimit,
  collectionLimits: Object.fromEntries(collectionIds.map((collectionId) => [collectionId, limitForCollection(collectionId)])),
  overallLimit: Number.isFinite(overallLimit) ? overallLimit : null,
  minScore,
  excluded: {
    workIds: [...excludeWorkIds],
    seriesKeys: [...excludeSeriesKeys],
    creatorSeriesKeys: [...excludeCreatorSeriesKeys],
    titlePhrases: [...excludeTitlePhrases],
  },
  discoveredCandidatesConsidered: candidates.length,
  uniqueFamiliesRanked: rankedCandidates.length,
  selectedCount: selected.length,
  selectedIdsByCollection,
  perCollectionCounts,
  candidatesCsvPath,
  reviewDir,
  sampleSelected: selected.slice(0, 20),
})

console.log(
  JSON.stringify(
    {
      selectedCount: selected.length,
      perCollectionCounts,
      selectedIdsByCollection,
      summaryPath,
      candidatesCsvPath,
    },
    null,
    2,
  ),
)
