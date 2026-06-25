import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { isAbsolute, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { exportsDir, loadWorksRegistry, readCsvFile, writeJson } from './lib.mjs'

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
  Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : String(value ?? '')
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
          phrase: String(item?.phrase ?? item?.title ?? '').trim().toLowerCase(),
          score: Number(item?.score),
        }))
        .filter((item) => item.phrase && Number.isFinite(item.score))
    : []

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

const parseIntegerOption = (value, fallback, minimum = 0) => {
  const number = Number(value)
  if (!Number.isFinite(number)) {
    return fallback
  }

  return Math.max(minimum, Math.trunc(number))
}

const loadedProfile = await readProfile(args.get('profile'))
const profile = loadedProfile?.profile ?? null

const nlmLimit = parseIntegerOption(args.has('nlm-limit') ? args.get('nlm-limit') : profile?.nlmLimit, 6, 0)
const wellcomeLimit = parseIntegerOption(args.has('wellcome-limit') ? args.get('wellcome-limit') : profile?.wellcomeLimit, 6, 0)
const stageFilter = String(args.has('stage') ? args.get('stage') : profile?.stage ?? 'uncovered_family').trim()
const dryRun = args.get('dry-run') === 'true'
const rebuildDerived = args.get('rebuild-derived') !== 'false'
const runStatus = args.get('run-status') !== 'false'
const selectionStrategy = String(
  args.has('selection-strategy') ? args.get('selection-strategy') : profile?.selectionStrategy ?? 'diverse',
).trim()
const diversityScanWindow = parseIntegerOption(
  args.has('diversity-scan-window') ? args.get('diversity-scan-window') : profile?.diversityScanWindow,
  60,
  1,
)
const excludeWorkIds = new Set([...parseList(profile?.excludeWorkIds), ...parseList(args.get('exclude-work-ids'))])
const excludeSeriesKeys = new Set([
  ...parseList(profile?.excludeSeriesKeys),
  ...parseList(args.get('exclude-series-keys')),
])
const excludeCreatorSeriesKeys = new Set([
  ...parseList(profile?.excludeCreatorSeriesKeys),
  ...parseList(args.get('exclude-creator-series-keys')),
])
const excludeTitlePhrases = new Set(
  [...parseList(profile?.excludeTitlePhrases), ...parseList(args.get('exclude-title-phrases'))]
    .map((item) => item.toLowerCase())
    .filter(Boolean),
)
const topicBoosts = parseScoreMap(profile?.topicBoosts)
const clusterBoosts = parseScoreMap(profile?.clusterBoosts)
const titleScoreAdjustments = parseTitleScoreAdjustments(profile?.titleScoreAdjustments)
const summaryPath = resolve(exportsDir, 'frontier-batch-summary.json')
const frontierCsvPath = resolve(exportsDir, '..', 'derived', 'acquisition-frontier', 'frontier.csv')
const topicPenaltyWeight = 26
const clusterPenaltyWeight = 20
const seriesPenaltyWeight = 180
const creatorSeriesPenaltyWeight = 260
const queueDistancePenaltyWeight = 1
const duplicateSeriesPenaltyWeight = 420
const duplicateCreatorSeriesPenaltyWeight = 900

const stageOrder = stageFilter === 'all' ? ['uncovered_family', 'depth_family', 'failed_only_family'] : [stageFilter]
const works = await loadWorksRegistry()
const workById = new Map(works.map((work) => [work.work_id, work]))
const frontierRows = await readCsvFile(frontierCsvPath)

const splitList = (value) =>
  String(value ?? '')
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)

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
const normalizeProfileKey = (value) => normalizeWhitespace(value).toLowerCase()
const normalizeTextMatch = (value) =>
  normalizeWhitespace(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const strongEnglishReferencePattern =
  /\b(?:guide|manual|hand ?book|dictionary|catalogue|catalog|family|domestic|physician|pharmacop(?:oe)?ia|materia medica|herbal|medicinal plants?|medical botany|dispensatory)\b/

const foreignLeadingTitlePenaltySignals = [
  { pattern: /^(?:catalogi|codigo|contribucion|principios)\b/, score: 112 },
  { pattern: /^(?:histoire|abrege|traite|cours|botanique|botanica|matiere medicale|apuntes|recherches)\b/, score: 72 },
  { pattern: /^(?:a tout le monde)\b/, score: 96 },
  { pattern: /^(?:der|du|vorlesungen|gazophylacium|kurtzes|lemithochorton)\b/, score: 72 },
  { pattern: /^(?:grundriss|um islenzkar|pharmacopoea|pharmacopoeia in usum|quaestio medica|institutiones)\b/, score: 112 },
  { pattern: /^(?:de plantis)\b/, score: 96 },
  { pattern: /^(?:ein versuch|lijst van)\b/, score: 96 },
]

const foreignFunctionWordPatterns = [
  /\bpar\b/,
  /\bpor\b/,
  /\bvon\b/,
  /\bund\b/,
  /\bdans\b/,
  /\bdes\b/,
  /\bdu\b/,
  /\blos\b/,
  /\blas\b/,
  /\bder\b/,
  /\bdie\b/,
  /\bdas\b/,
  /\bmit\b/,
  /\bauf\b/,
  /\bedidit\b/,
  /\bzur\b/,
  /\bfur\b/,
]

const stripTrailingByline = (value) => value.replace(/\s+\/\s+.*$/i, '').trim()

const stripVolumeMarkers = (value) =>
  value
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

  const semicolonLeadMatch = working.match(/^(.*?);\s+/)
  if (semicolonLeadMatch && semicolonLeadMatch[1].trim().split(/\s+/).length >= 2) {
    working = semicolonLeadMatch[1].trim()
  }

  const descriptiveCommaMatch = working.match(/^(.*?),\s+(?:containing|comprising|wherein)\b/i)
  if (descriptiveCommaMatch && descriptiveCommaMatch[1].trim().split(/\s+/).length >= 2) {
    working = descriptiveCommaMatch[1].trim()
  }

  const descriptivePeriodMatch = working.match(
    /^(.*?)\.\s+(?:wherein|containing|comprising|being|designed|including|showing|explaining|to which)\b/i,
  )
  if (descriptivePeriodMatch && descriptivePeriodMatch[1].trim().split(/\s+/).length >= 2) {
    working = descriptivePeriodMatch[1].trim()
  }

  const trailingClauseMatch = working.match(
    /^(.*?)(?:\s+|[,:;]\s+)(?:to which|with an appendix|with observations|including|containing|comprising|being|adapted to|designed(?: as| for)?|showing|explaining|embracing)\b/i,
  )
  if (trailingClauseMatch && trailingClauseMatch[1].trim().split(/\s+/).length >= 2) {
    working = trailingClauseMatch[1].trim()
  }

  const colonIndex = working.indexOf(' : ')
  if (colonIndex > 0) {
    working = working.slice(0, colonIndex)
  }

  const semicolonIndex = working.indexOf(';')
  if (semicolonIndex > 0 && semicolonIndex < 140) {
    working = working.slice(0, semicolonIndex)
  }

  return normalizeTitleKey(working) || 'general'
}

const extractCreatorKey = (creator) =>
  normalizeTitleKey(
    normalizeWhitespace(creator)
      .replace(/\([^)]*\)/g, ' ')
      .replace(/\b(author|editor|edited|translator|translated|compiler|compiled)\b/gi, ' ')
      .replace(/[.]/g, ' '),
  ) || 'unknown'

const normalizeTopicSignature = (topicFamily) => {
  const tags = splitList(topicFamily)
  return tags.length > 0 ? tags.join(';') : 'general'
}

const normalizedExcludeTitlePhrases = new Set(
  [...excludeTitlePhrases].map((phrase) => normalizeTextMatch(phrase)).filter(Boolean),
)
const normalizedTitleScoreAdjustments = titleScoreAdjustments
  .map((adjustment) => ({
    ...adjustment,
    phraseMatch: normalizeTextMatch(adjustment.phrase),
  }))
  .filter((adjustment) => adjustment.phraseMatch)

const detectTitleCluster = (title) => {
  const normalized = String(title ?? '').toLowerCase()

  if (/\bguide to health\b/.test(normalized)) return 'guide-to-health'
  if (/\bfamily physician\b/.test(normalized)) return 'family-physician'
  if (/\bdomestic medicine\b/.test(normalized)) return 'domestic-medicine'
  if (/\bherbal\b/.test(normalized)) return 'herbal'
  if (/\bmateria medica\b/.test(normalized)) return 'materia-medica'
  if (/\bpharmacopoeia\b|\bdispensatory\b/.test(normalized)) return 'pharmacopoeia'
  if (/\bmedicinal plants?\b/.test(normalized)) return 'medicinal-plants'
  if (/\bdictionary\b|\bcyclopedia\b|\bencyclop/.test(normalized)) return 'reference-work'
  return 'general'
}

const detectSelectionPenalty = (title) => {
  const original = String(title ?? '')
  const normalized = normalizeWhitespace(title).toLowerCase()
  let score = 0

  if (/\bclairvoyant\b|\breminiscences\b/.test(normalized)) score += 220
  if (/\bbeecham'?s\b|\bpills ltd\b|\bfitness\b/.test(normalized)) score += 180
  if (/\bpotter(?:'s)?\b|\bpotter\s*&\s*clarke\b/.test(normalized)) score += 160
  if (/\bfamous book\b|\btoilet\b/.test(normalized)) score += 120
  if (/\bgolden recipes?\b|\bcopyright owner\b|\buniversal satisfaction\b/.test(normalized)) score += 140
  if (/\bpamphlet advertising\b|\badvertising\b|\bdiet-?drink\b/.test(normalized)) score += 140
  if (/\binaugural-?dissertation\b|\bmemoir of the life\b|\bmemoir\b/.test(normalized)) score += 120
  if (/\bastrolog(?:y|ical|ically)?\b/.test(normalized)) score += 220
  if (/\bintroductory lecture\b|\bcommencement of the annual course of lectures\b/.test(normalized)) score += 240
  if (/\binaugural lecture\b/.test(normalized)) score += 240
  if (/\bopening address\b/.test(normalized)) score += 240
  if (/^a lecture\b/.test(normalized)) score += 280
  if (/\bbeing one of a course on\b/.test(normalized)) score += 220
  if (/\bbeing an introductory to the course of lectures\b/.test(normalized)) score += 260
  if (/\bintroductory to the course of lectures\b/.test(normalized)) score += 220
  if (/\bheads of a course of lectures\b|\bpart of a course of lectures\b/.test(normalized)) score += 260
  if (/^lectures? on\b|\bdelivered to the members of\b/.test(normalized)) score += 180
  if (/\btwo lectures delivered before\b|\blecture[,;:]?\s+introductory to (?:a|the) course\b/.test(normalized)) score += 220
  if (/^lecture[,;:]?\s+introductory\b/.test(normalized)) score += 280
  if (/\bstudents preparing for examination\b|\bexaminations in\b/.test(normalized)) score += 160
  if (/\bcourse of examinations?\s+on\b|\bcourse of examinations?\s+in\b/.test(normalized)) score += 320
  if (/\bmanual of examinations upon\b/.test(normalized)) score += 240
  if (/\bquiz-?compend\b/.test(normalized)) score += 220
  if (/\bfor the use of students(?: of medicine)?\b|\bstudents of medicine\b/.test(normalized)) score += 120
  if (/\bfor the use of teachers and students\b/.test(normalized)) score += 220
  if (/\bassistant plates?\b|\bplates? to the materia medica\b/.test(normalized)) score += 260
  if (/\bbotanical tables?\b|\btables of the materia medica\b/.test(normalized)) score += 220
  if (/\bsyllabus of (?:a course of )?lectures?\b|\boutlines of a course of lectures?\b/.test(normalized)) score += 180
  if (/\baddress of the faculty\b|\bannual report\b|\bprogramme of the ensuing sessions?\b/.test(normalized)) score += 240
  if (/\bdelivered at the opening of\b|\bopening of the .*?(?:college|session)\b/.test(normalized)) score += 240
  if (/\bbefore the faculty(?:,|\b)|\bfaculty, students,? and citizens\b/.test(normalized)) score += 220
  if (/\bcatalogue for\s+\d/.test(normalized)) score += 180
  if (/\bcatalog(?:ue)? of medical books\b|\bcatalog(?:ue)? of books,?\s+in\s+physic\b/.test(normalized))
    score += 360
  if (/\barranged catalogues?\s+of\b/.test(normalized)) score += 240
  if (/\badditional chapter to\b|\bchapter extracted from\b|\bextracted from\b/.test(normalized)) score += 220
  if (/\bwater-?cure\b/.test(normalized)) score += 140
  if (/\brecipes for the million\b/.test(normalized)) score += 220
  if (/\bconfectioner\b/.test(normalized)) score += 200
  if (/\bconcentrated organic medicines\b/.test(normalized)) score += 180
  if (/\bsecrets of albertus magnus\b/.test(normalized)) score += 260
  if (/\bempiric\b|\bquackery\b|\bopinions of the committees\b/.test(normalized)) score += 220
  if (/\bveterinary\b/.test(normalized)) score += 220
  if (/\bselect committee\b|\bpraying relief\b|\bnumerous petitions\b/.test(normalized)) score += 260
  if (/\bspecification of\b|\bpatent of\b/.test(normalized)) score += 280
  if (/\bphysic a-field\b|\bcharles dickens\b/.test(normalized)) score += 360
  if (/\bfamous bird that speaks one word\b/.test(normalized)) score += 360
  if (/\bbeauty,?\s+riches?\s+and\s+honou?r\b/.test(normalized)) score += 280
  if (/\bsexual debility\b|\bseminal weakness\b|\bsecret and excessive venery\b|\bvenery among youths\b/.test(normalized)) score += 320
  if (/\bdescriptive catalogue\b.*\bextracts?\b|\bfluid and solid extracts\b/.test(normalized)) score += 320
  if (/\bworking bulletins?\b|\bpresented to the medical profession with (?:their )?compliments\b/.test(normalized)) score += 360
  if (/\bintroduced and manufactured by\b|\bstandard medicinal products?\b|\bfine pharmaceutical specialt(?:y|ies)\b/.test(normalized)) score += 360
  if (/\bparke,\s*davis(?:\s*&\s*(?:co|company))?\b/.test(normalized)) score += 420
  if (/\bto be sold at the prices affixed\b|\bfor ready money only\b|\bfull value given for libraries\b/.test(normalized)) score += 420
  if (/\bmedical specialist\b/.test(normalized)) score += 160
  if (/\bhealth resorts?\b|\bhealth-restoring places?\b/.test(normalized)) score += 220
  if (/\bnotes on the country and its inhabitants\b/.test(normalized)) score += 120
  if (/\bhom(?:oe)?opathic laboratories?\b|\blaboratories,\s*ltd\b/.test(normalized)) score += 340
  if (/\balkaloids?\s+ltd\b/.test(normalized)) score += 340
  if (/\bwith the compliments of\b|\bhealth food stores?\b/.test(normalized)) score += 340
  if (/\bphrenological\b|\bself-?instructor\b|\billustrated chart\b/.test(normalized)) score += 280
  if (/\btransactions of the\b|\bproceedings of the\b/.test(normalized)) score += 220
  if (/\byear-?\s*book\b/.test(normalized)) score += 180
  if (/\boutlines of lectures? on\b/.test(normalized)) score += 220
  if (/\bstudent'?s guide\b/.test(normalized)) score += 120
  if (/\bcontemplating marriage\b|\bsex may be controlled\b/.test(normalized)) score += 280
  if (/\bquestions?\s*(?:&|and)\s*answers?\b/.test(normalized)) score += 220
  if (/\bquestions?\s+to\s+be\s+answered\b/.test(normalized)) score += 220
  if (/\bethereal fire\b/.test(normalized)) score += 280
  if (/\bepitome of the reports\b/.test(normalized)) score += 260
  if (/\binstructions issued by\b|\bcommittee of revision and publication\b/.test(normalized)) score += 320
  if (/\bminutes of the\b.*\bdecennial convention\b|\bminutes of the\b.*\bconvention for the revision\b/.test(normalized))
    score += 320
  if (/\bread before the\b.*\bmedical societ(?:y|ies)\b/.test(normalized)) score += 220
  if (/\bread in the section of\b|\bannual meeting of the\b/.test(normalized)) score += 220
  if (/\btout le monde\b|\bla sante\b/.test(normalized)) score += 220
  if (/\bcontribucion al estudio\b/.test(normalized)) score += 260
  if (/^on the distinctive characters of\b/.test(normalized)) score += 220
  if (/^a letter to the patentee\b|\bmedical properties of the fleecy hosiery\b/.test(normalized)) score += 280
  if (/\boccurrences which led to the removal of\b|\bremoval of .*?\bchair of\b/.test(normalized)) score += 280
  if (/\bquaestio medica\b|\bpro baccalaureatu\b|\bmane discutienda\b|\bsub hac verborum serie\b/.test(normalized)) score += 320
  if (/\bappendix to\b.*\bhom(?:oe)?opathic domestic medicine\b/.test(normalized)) score += 240
  if (/\bpatent office\b/.test(normalized)) score += 140
  if (/\bfarrier\b|\bbee-?keeper\b|\breceipt book\b/.test(normalized)) score += 180
  if (/\bco\.?'?s\b.*\bfamily physician\b/.test(normalized)) score += 160
  if (/\bpentaglot\b|\bgerman-english-french\b|\benglish explanations in english\b/.test(normalized)) score += 180
  if (/\bcatalogi\b|\bcodigo\b|\bprincipios para\b/.test(normalized)) score += 180
  if (/\bpharmacopoeia\s+in\s+usum\b|\bcollegii\b|\bregalis\b|\bregii\b|\blondinensis\b|\bedinburgensis\b|\bnosocomii\b|\bmancuniensis\b/.test(normalized)) score += 220
  if (/\bpharmacopoea\b/.test(normalized)) score += 120
  if (/\bbearbeitet\b|\bstudirende\b|\brucksichtnahme\b|\beptir\b|\bquaestio\b|\bbaccalaureatu\b|\bdiscutienda\b|\bpropugnabit\b/.test(normalized)) score += 220
  if (/\bessay (?:on|upon)\b/.test(normalized)) score += 48
  if (/^observations? on\b/.test(normalized)) score += 36
  if (/\bplea for\b|\bwithout a doctor\b/.test(normalized)) score += 36

  for (const signal of foreignLeadingTitlePenaltySignals) {
    if (signal.pattern.test(normalized)) score += signal.score
  }

  const foreignWordHitCount = foreignFunctionWordPatterns.reduce(
    (total, pattern) => total + (pattern.test(normalized) ? 1 : 0),
    0,
  )
  if (foreignWordHitCount >= 2) {
    score += strongEnglishReferencePattern.test(normalized) ? 28 : 56
  }

  if (!strongEnglishReferencePattern.test(normalized) && normalizeAscii(original) !== original) {
    score += 18
  }

  return score
}

const pickIds = (collectionId, limit) => {
  if (limit <= 0) {
    return []
  }

  const candidates = frontierRows
    .filter((row) => row.candidate_collection_id === collectionId)
    .filter((row) => stageOrder.includes(row.frontier_stage))
    .filter((row) => workById.get(row.candidate_work_id)?.ingest_status !== 'chunked')
    .map((row) => {
      const work = workById.get(row.candidate_work_id)
      const topicSignature = normalizeTopicSignature(work?.topic_family ?? row.family_topic_family)
      const title = work?.title ?? row.candidate_title
      const creator = work?.creator ?? row.candidate_creator
      const titleCluster = detectTitleCluster(title)
      return {
        row,
        normalizedTitle: normalizeProfileKey(title),
        normalizedTitleMatch: normalizeTextMatch(title),
        topicTags: splitList(work?.topic_family ?? row.family_topic_family).map((tag) => normalizeProfileKey(tag)),
        topicSignature,
        titleCluster,
        seriesTitleKey: extractSeriesTitleKey(title),
        creatorTitleKey: `${extractCreatorKey(creator)}::${extractSeriesTitleKey(title)}`,
      }
    })
    .filter((candidate) => !excludeWorkIds.has(candidate.row.candidate_work_id))
    .filter((candidate) => !excludeSeriesKeys.has(candidate.seriesTitleKey))
    .filter((candidate) => !excludeCreatorSeriesKeys.has(candidate.creatorTitleKey))
    .filter(
      (candidate) =>
        ![...normalizedExcludeTitlePhrases].some((phrase) => candidate.normalizedTitleMatch.includes(phrase)),
    )

  if (selectionStrategy === 'top') {
    return candidates.slice(0, limit).map((candidate) => candidate.row.candidate_work_id)
  }

  const remaining = [...candidates]
  const selected = []
  const topicCounts = new Map()
  const clusterCounts = new Map()
  const seriesCounts = new Map()
  const creatorSeriesCounts = new Map()

  const computeProfileBias = (candidate) => {
    const topicBoost = candidate.topicTags.reduce((total, tag) => total + (topicBoosts.get(tag) ?? 0), 0)
    const clusterBoost = clusterBoosts.get(candidate.titleCluster) ?? 0
    const titleAdjustment = normalizedTitleScoreAdjustments.reduce(
      (total, adjustment) =>
        candidate.normalizedTitleMatch.includes(adjustment.phraseMatch) ? total + adjustment.score : total,
      0,
    )
    return topicBoost + clusterBoost + titleAdjustment
  }

  while (selected.length < limit && remaining.length > 0) {
    const windowSize = Math.min(diversityScanWindow, remaining.length)
    let bestIndex = 0
    let bestScore = Number.NEGATIVE_INFINITY

    for (let index = 0; index < windowSize; index += 1) {
      const candidate = remaining[index]
      const frontierScore = Number(candidate.row.frontier_score ?? 0)
      const topicPenalty = (topicCounts.get(candidate.topicSignature) ?? 0) * topicPenaltyWeight
      const clusterPenalty = (clusterCounts.get(candidate.titleCluster) ?? 0) * clusterPenaltyWeight
      const seriesCount = seriesCounts.get(candidate.seriesTitleKey) ?? 0
      const creatorSeriesCount = creatorSeriesCounts.get(candidate.creatorTitleKey) ?? 0
      const seriesPenalty = seriesCount * seriesPenaltyWeight
      const creatorSeriesPenalty = creatorSeriesCount * creatorSeriesPenaltyWeight
      const duplicateSeriesPenalty = seriesCount > 0 ? duplicateSeriesPenaltyWeight : 0
      const duplicateCreatorSeriesPenalty = creatorSeriesCount > 0 ? duplicateCreatorSeriesPenaltyWeight : 0
      const depthPenalty = candidate.row.frontier_stage === 'depth_family' ? 36 : 0
      const queueDistancePenalty = index * queueDistancePenaltyWeight
      const qualityPenalty = detectSelectionPenalty(candidate.row.candidate_title)
      const profileBias = computeProfileBias(candidate)
      const adjustedScore =
        frontierScore +
        profileBias -
        topicPenalty -
        clusterPenalty -
        seriesPenalty -
        creatorSeriesPenalty -
        duplicateSeriesPenalty -
        duplicateCreatorSeriesPenalty -
        depthPenalty -
        queueDistancePenalty -
        qualityPenalty

      if (adjustedScore > bestScore) {
        bestScore = adjustedScore
        bestIndex = index
      }
    }

    const [chosen] = remaining.splice(bestIndex, 1)
    selected.push(chosen.row.candidate_work_id)
    topicCounts.set(chosen.topicSignature, (topicCounts.get(chosen.topicSignature) ?? 0) + 1)
    clusterCounts.set(chosen.titleCluster, (clusterCounts.get(chosen.titleCluster) ?? 0) + 1)
    seriesCounts.set(chosen.seriesTitleKey, (seriesCounts.get(chosen.seriesTitleKey) ?? 0) + 1)
    creatorSeriesCounts.set(chosen.creatorTitleKey, (creatorSeriesCounts.get(chosen.creatorTitleKey) ?? 0) + 1)

    if (chosen.seriesTitleKey && chosen.seriesTitleKey !== 'general') {
      for (let index = remaining.length - 1; index >= 0; index -= 1) {
        if (remaining[index].seriesTitleKey === chosen.seriesTitleKey) {
          remaining.splice(index, 1)
        }
      }
    }
  }

  return selected
}

const selectedIds = {
  'nlm-digital-collections': pickIds('nlm-digital-collections', nlmLimit),
  'wellcome-collection': pickIds('wellcome-collection', wellcomeLimit),
}

const selectedRows = Object.fromEntries(
  Object.entries(selectedIds).map(([collectionId, ids]) => [
    collectionId,
    ids.map((workId) => {
      const row = frontierRows.find((entry) => entry.candidate_work_id === workId)
      const work = workById.get(workId)
      return {
        work_id: workId,
        title: work?.title ?? row?.candidate_title ?? '',
        creator: work?.creator ?? row?.candidate_creator ?? '',
        frontier_stage: row?.frontier_stage ?? '',
        frontier_score: Number(row?.frontier_score ?? 0),
        topic_family: work?.topic_family ?? row?.family_topic_family ?? '',
        title_cluster: detectTitleCluster(work?.title ?? row?.candidate_title ?? ''),
        series_title_key: extractSeriesTitleKey(work?.title ?? row?.candidate_title ?? ''),
        creator_title_key: `${extractCreatorKey(work?.creator ?? row?.candidate_creator ?? '')}::${extractSeriesTitleKey(work?.title ?? row?.candidate_title ?? '')}`,
      }
    }),
  ]),
)

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

const result = {
  generatedAt: new Date().toISOString(),
  profile: loadedProfile
    ? {
        ref: loadedProfile.ref,
        path: loadedProfile.path,
        profileId: profile?.profileId ?? null,
        description: profile?.description ?? '',
        topicBoosts: profile?.topicBoosts ?? {},
        clusterBoosts: profile?.clusterBoosts ?? {},
        excludeTitlePhrases: Array.isArray(profile?.excludeTitlePhrases) ? profile.excludeTitlePhrases : [],
        titleScoreAdjustments: Array.isArray(profile?.titleScoreAdjustments) ? profile.titleScoreAdjustments : [],
        notes: Array.isArray(profile?.notes) ? profile.notes : [],
      }
    : null,
  stageFilter,
  dryRun,
  rebuildDerived,
  runStatus,
  selectionStrategy,
  diversityScanWindow,
  exclusions: {
    workIds: [...excludeWorkIds],
    seriesKeys: [...excludeSeriesKeys],
    creatorSeriesKeys: [...excludeCreatorSeriesKeys],
    titlePhrases: [...excludeTitlePhrases],
  },
  selected: selectedRows,
  commands: [],
  failedCommand: null,
}

if (!dryRun) {
  const commandSpecs = []

  if (selectedIds['nlm-digital-collections'].length > 0) {
    commandSpecs.push({
      name: 'corpus:nlm',
      path: resolve(scriptDir, 'build-nlm-corpus.mjs'),
      args: [`--work-ids=${selectedIds['nlm-digital-collections'].join(',')}`],
    })
  }

  if (selectedIds['wellcome-collection'].length > 0) {
    commandSpecs.push({
      name: 'corpus:wellcome',
      path: resolve(scriptDir, 'build-wellcome-corpus.mjs'),
      args: [`--work-ids=${selectedIds['wellcome-collection'].join(',')}`],
    })
  }

  commandSpecs.push({
    name: 'corpus:reconcile',
    path: resolve(scriptDir, 'reconcile-registry-from-manifests.mjs'),
    args: [],
  })

  if (rebuildDerived) {
    for (const scriptName of [
      'build-edition-families.mjs',
      'build-acquisition-frontier.mjs',
      'build-corpus-evidence.mjs',
      'build-thin-work-review.mjs',
      'build-term-families.mjs',
      'build-seed-catalog.mjs',
      'build-herb-profiles.mjs',
      'build-seed-review-priority.mjs',
    ]) {
      commandSpecs.push({
        name: scriptName.replace('.mjs', ''),
        path: resolve(scriptDir, scriptName),
        args: [],
      })
    }
  }

  if (runStatus) {
    commandSpecs.push({
      name: 'corpus:status',
      path: resolve(scriptDir, 'report-status.mjs'),
      args: [],
    })
  }

  try {
    for (const spec of commandSpecs) {
      const commandResult = await runNodeScript(spec.path, spec.args)
      result.commands.push({
        name: spec.name,
        args: spec.args,
        output: parseJsonOutput(commandResult),
      })
    }
  } catch (error) {
    result.failedCommand = {
      message: error.message,
      completedCommandCount: result.commands.length,
    }
    await writeJson(summaryPath, result)
    throw error
  }
}

await writeJson(summaryPath, result)

console.log(
  JSON.stringify(
    {
      selected: selectedRows,
      dryRun,
      rebuildDerived,
      runStatus,
      commandCount: result.commands.length,
      summaryPath,
    },
    null,
    2,
  ),
)
