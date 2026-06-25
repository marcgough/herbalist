import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
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

const limit = Number(args.get('limit') ?? Number.POSITIVE_INFINITY)
const worklistLimit = Number(args.get('worklist-limit') ?? 200)
const includeDepthFamilies = args.get('include-depth') !== 'false'
const includeFailedOnlyFamilies = args.get('include-failed-only') !== 'false'

const editionFamiliesDir = resolve(derivedDir, 'edition-families')
const acquisitionFrontierDir = resolve(derivedDir, 'acquisition-frontier')
const worklistsDir = resolve(acquisitionFrontierDir, 'worklists')
const familiesPath = resolve(editionFamiliesDir, 'families.csv')
const membershipsPath = resolve(editionFamiliesDir, 'memberships.csv')
const frontierCsvPath = resolve(acquisitionFrontierDir, 'frontier.csv')
const frontierJsonPath = resolve(acquisitionFrontierDir, 'frontier.json')
const readmePath = resolve(acquisitionFrontierDir, 'README.md')
const summaryPath = resolve(exportsDir, 'acquisition-frontier-summary.json')

const frontierHeaders = [
  'rank',
  'frontier_score',
  'frontier_stage',
  'family_id',
  'family_label',
  'canonical_work_id',
  'family_work_count',
  'family_chunked_count',
  'family_discovered_count',
  'family_failed_count',
  'family_collection_ids',
  'family_jurisdiction_lanes',
  'family_topic_family',
  'candidate_work_id',
  'candidate_title',
  'candidate_collection_id',
  'candidate_jurisdiction_lane',
  'candidate_creator',
  'candidate_publication_year',
  'candidate_ingest_status',
  'candidate_member_role',
  'candidate_volume_like',
  'candidate_series_title_key',
  'candidate_creator_title_key',
  'candidate_priority_score',
  'candidate_title_penalty',
  'candidate_topic_score',
  'candidate_archive_series_count',
  'candidate_archive_creator_series_count',
  'candidate_archive_series_penalty',
  'candidate_archive_creator_series_penalty',
  'rationale',
]

const topicWeights = {
  herbal: 95,
  'medicinal-plants': 88,
  'medical-botany': 84,
  'botanic-medicine': 80,
  'domestic-medicine': 74,
  cultivation: 48,
  botany: 44,
  'materia-medica': 38,
  dietetics: 36,
  hygiene: 32,
  'household-health': 28,
  convalescence: 26,
  'public-health': 24,
  nursing: 20,
  pharmacopoeia: 18,
}

const collectionWeights = {
  'project-gutenberg': 30,
  'wellcome-collection': 24,
  'nlm-digital-collections': 20,
}

const titleSignals = [
  { pattern: /\bherbal\b/i, score: 24 },
  { pattern: /\bmedical botany\b/i, score: 20 },
  { pattern: /\bmedicinal plants?\b/i, score: 18 },
  { pattern: /\bbotanic family physician\b/i, score: 18 },
  { pattern: /\bguide to health\b/i, score: 16 },
  { pattern: /\bfamily physician\b/i, score: 14 },
  { pattern: /\bfamily doctor\b/i, score: 14 },
  { pattern: /\bdomestic medicine\b/i, score: 14 },
  { pattern: /\bflora medica\b/i, score: 14 },
  { pattern: /\bmateria medica\b/i, score: 14 },
  { pattern: /\bmanual\b/i, score: 12 },
  { pattern: /\bhand-?book\b/i, score: 12 },
  { pattern: /\bcatalogue\b|\bcatalog\b/i, score: 10 },
  { pattern: /\bdictionary\b/i, score: 10 },
  { pattern: /\bcompanion\b/i, score: 10 },
  { pattern: /\bpharmacographia\b/i, score: 12 },
  { pattern: /\bpharmacop(?:oe)?ia\b/i, score: 10 },
  { pattern: /\bdispensatory\b/i, score: 10 },
]

const titlePenaltySignals = [
  { pattern: /\bscripture herbal\b/i, score: 96 },
  { pattern: /\bholy bible\b/i, score: 84 },
  { pattern: /\bvegetabilium sacra\b/i, score: 84 },
  { pattern: /\bclairvoyant\b/i, score: 120 },
  { pattern: /\breminiscences\b/i, score: 48 },
  { pattern: /\bbeecham'?s\b/i, score: 108 },
  { pattern: /\bpills ltd\b/i, score: 108 },
  { pattern: /\bpotter(?:'s)?\b/i, score: 72 },
  { pattern: /\bpotter\s*&\s*clarke\b/i, score: 96 },
  { pattern: /\bfitness\b/i, score: 44 },
  { pattern: /\btoilet\b/i, score: 28 },
  { pattern: /\bfamous book\b/i, score: 64 },
  { pattern: /\boccult\b/i, score: 56 },
  { pattern: /\bgolden recipes?\b/i, score: 132 },
  { pattern: /\bcopyright owner\b/i, score: 120 },
  { pattern: /\buniversal satisfaction\b/i, score: 108 },
  { pattern: /\bdiet-?drink\b/i, score: 92 },
  { pattern: /\bwithout a doctor\b/i, score: 48 },
  { pattern: /\bpamphlet advertising\b|\badvertising\b/i, score: 160 },
  { pattern: /\binaugural-?dissertation\b/i, score: 140 },
  { pattern: /\bmemoir of the life\b|\bmemoir\b/i, score: 84 },
  { pattern: /\bessay (?:on|upon)\b/i, score: 34 },
  { pattern: /^observations? on\b/i, score: 28 },
  { pattern: /\bplea for\b/i, score: 28 },
  { pattern: /\bintroductory lecture\b/i, score: 72 },
  { pattern: /\binaugural lecture\b/i, score: 156 },
  { pattern: /\bopening address\b/i, score: 156 },
  { pattern: /^a lecture\b/i, score: 140 },
  { pattern: /^lectures? on\b/i, score: 96 },
  { pattern: /\bbeing one of a course on\b/i, score: 120 },
  { pattern: /\bbeing an introductory to the course of lectures\b/i, score: 156 },
  { pattern: /\bintroductory to the course of lectures\b/i, score: 140 },
  { pattern: /\bdelivered to the members of\b/i, score: 96 },
  { pattern: /\bdelivered at the opening of\b|\bopening of the .*?(?:college|session)\b/i, score: 156 },
  { pattern: /\bbefore the faculty(?:,|\b)|\bfaculty, students,? and citizens\b/i, score: 156 },
  { pattern: /\btwo lectures delivered before\b|\blecture[,;:]?\s+introductory to (?:a|the) course\b/i, score: 120 },
  { pattern: /^lecture[,;:]?\s+introductory\b/i, score: 140 },
  { pattern: /\bexaminations? in\b/i, score: 120 },
  { pattern: /\bmanual of examinations upon\b/i, score: 156 },
  { pattern: /\bquiz-?compend\b/i, score: 140 },
  { pattern: /\bfor the use of students(?: of medicine)?\b|\bstudents of medicine\b/i, score: 72 },
  { pattern: /\bstudents preparing for examination\b/i, score: 140 },
  { pattern: /\bassistant plates?\b/i, score: 168 },
  { pattern: /\bplates? to the materia medica\b/i, score: 168 },
  { pattern: /\bbotanical tables?\b|\btables of the materia medica\b/i, score: 140 },
  { pattern: /\bsyllabus of (?:a course of )?lectures?\b|\boutlines of a course of lectures?\b/i, score: 120 },
  { pattern: /\baddress of the faculty\b|\bannual report\b|\bprogramme of the ensuing sessions?\b/i, score: 160 },
  { pattern: /\bcatalogue for\s+\d/i, score: 120 },
  { pattern: /\badditional chapter to\b|\bchapter extracted from\b|\bextracted from\b/i, score: 156 },
  { pattern: /\bflorist\b/i, score: 42 },
  { pattern: /\bflower garden\b/i, score: 42 },
  { pattern: /\balmanac\b/i, score: 84 },
  { pattern: /\bhusbandry\b/i, score: 30 },
  { pattern: /\bhorses?\b/i, score: 24 },
  { pattern: /\bcattle\b/i, score: 18 },
  { pattern: /\bsheep\b/i, score: 16 },
  { pattern: /\bwater-?cure\b/i, score: 84 },
  { pattern: /\brecipes for the million\b/i, score: 156 },
  { pattern: /\bconfectioner\b/i, score: 132 },
  { pattern: /\bconcentrated organic medicines\b/i, score: 120 },
  { pattern: /\bsecrets of albertus magnus\b/i, score: 180 },
  { pattern: /\bempiric\b|\bquackery\b|\bopinions of the committees\b/i, score: 140 },
  { pattern: /\bveterinary\b/i, score: 120 },
  { pattern: /\bselect committee\b|\bpraying relief\b|\bnumerous petitions\b/i, score: 168 },
  { pattern: /\bspecification of\b|\bpatent of\b/i, score: 180 },
  { pattern: /\bphysic a-field\b|\bcharles dickens\b/i, score: 180 },
  { pattern: /\bfamous bird that speaks one word\b/i, score: 180 },
  { pattern: /\bbeauty,?\s+riches?\s+and\s+honou?r\b/i, score: 164 },
  { pattern: /\bsexual debility\b|\bseminal weakness\b|\bsecret and excessive venery\b|\bvenery among youths\b/i, score: 172 },
  { pattern: /\bdescriptive catalogue\b.*\bextracts?\b|\bfluid and solid extracts\b/i, score: 176 },
  { pattern: /\bworking bulletins?\b|\bpresented to the medical profession with (?:their )?compliments\b/i, score: 180 },
  { pattern: /\bintroduced and manufactured by\b|\bstandard medicinal products?\b|\bfine pharmaceutical specialt(?:y|ies)\b/i, score: 180 },
  { pattern: /\bparke,\s*davis(?:\s*&\s*(?:co|company))?\b/i, score: 180 },
  { pattern: /\bto be sold at the prices affixed\b|\bfor ready money only\b|\bfull value given for libraries\b/i, score: 180 },
  { pattern: /\bmedical specialist\b/i, score: 92 },
  { pattern: /\bhealth resorts?\b|\bhealth-restoring places?\b/i, score: 132 },
  { pattern: /\bnotes on the country and its inhabitants\b/i, score: 84 },
  { pattern: /\bhom(?:oe)?opathic laboratories?\b|\blaboratories,\s*ltd\b/i, score: 180 },
  { pattern: /\balkaloids?\s+ltd\b/i, score: 180 },
  { pattern: /\bwith the compliments of\b|\bhealth food stores?\b/i, score: 180 },
  { pattern: /\bphrenological\b|\bself-?instructor\b|\billustrated chart\b/i, score: 180 },
  { pattern: /\btransactions of the\b|\bproceedings of the\b/i, score: 156 },
  { pattern: /\byear-?\s*book\b/i, score: 132 },
  { pattern: /\boutlines of lectures? on\b/i, score: 164 },
  { pattern: /\bstudent'?s guide\b/i, score: 92 },
  { pattern: /\bcontemplating marriage\b|\bsex may be controlled\b/i, score: 172 },
  { pattern: /\bquestions?\s*(?:&|and)\s*answers?\b/i, score: 156 },
  { pattern: /\bquestions?\s+to\s+be\s+answered\b/i, score: 156 },
  { pattern: /\bethereal fire\b/i, score: 180 },
  { pattern: /\bepitome of the reports\b/i, score: 168 },
  { pattern: /\bread in the section of\b|\bannual meeting of the\b/i, score: 156 },
  { pattern: /\btout le monde\b|\bla sante\b/i, score: 120 },
  { pattern: /\bcontribucion al estudio\b/i, score: 156 },
  { pattern: /^on the distinctive characters of\b/i, score: 156 },
  { pattern: /^a letter to the patentee\b|\bmedical properties of the fleecy hosiery\b/i, score: 180 },
  { pattern: /\boccurrences which led to the removal of\b|\bremoval of .*?\bchair of\b/i, score: 180 },
  { pattern: /\bquaestio medica\b|\bpro baccalaureatu\b|\bmane discutienda\b|\bsub hac verborum serie\b/i, score: 220 },
  { pattern: /\bappendix to\b.*\bhom(?:oe)?opathic domestic medicine\b/i, score: 180 },
  { pattern: /\bpatent office\b/i, score: 92 },
  { pattern: /\bfarrier\b|\bbee-?keeper\b|\breceipt book\b/i, score: 120 },
  { pattern: /\bco\.?'?s\b.*\bfamily physician\b/i, score: 92 },
  { pattern: /\bpentaglot\b|\bgerman-english-french\b|\benglish explanations in english\b/i, score: 120 },
  {
    pattern: /\bpharmacopoeia\s+in\s+usum\b|\bcollegii\b|\bregalis\b|\bregii\b|\blondinensis\b|\bedinburgensis\b|\bnosocomii\b|\bmancuniensis\b/i,
    score: 112,
  },
]

const likelyNonEnglishTitlePenaltySignals = [
  { pattern: /\bcatalogi\b/i, score: 92 },
  { pattern: /\bcodigo\b/i, score: 92 },
  { pattern: /\bprincipios para\b/i, score: 92 },
  { pattern: /\bpharmacopoea\b/i, score: 72 },
  { pattern: /\blysieulyfr\b/i, score: 92 },
  { pattern: /\bcynghorion\b/i, score: 72 },
  { pattern: /\bcynwys\b/i, score: 72 },
  { pattern: /\by rhan\b/i, score: 56 },
  { pattern: /\bneu\b/i, score: 28 },
  { pattern: /\bbearbeitet\b|\bstudirende\b|\brucksichtnahme\b|\beptir\b|\bquaestio\b|\bbaccalaureatu\b|\bdiscutienda\b|\bpropugnabit\b/i, score: 92 },
]

const foreignLeadingTitlePenaltySignals = [
  { pattern: /^(?:catalogi|codigo|contribucion|principios)\b/i, score: 112 },
  { pattern: /^(?:histoire|abrege|traite|cours|botanique|botanica|matiere medicale|apuntes|recherches)\b/i, score: 72 },
  { pattern: /^(?:a tout le monde)\b/i, score: 96 },
  { pattern: /^(?:der|du|vorlesungen|gazophylacium|kurtzes|lemithochorton)\b/i, score: 72 },
  { pattern: /^(?:grundriss|um islenzkar|pharmacopoea|pharmacopoeia in usum|quaestio medica|institutiones)\b/i, score: 112 },
  { pattern: /^(?:de plantis)\b/i, score: 96 },
  { pattern: /^(?:ein versuch|lijst van)\b/i, score: 96 },
]

const foreignFunctionWordPatterns = [
  /\bpar\b/i,
  /\bpor\b/i,
  /\bvon\b/i,
  /\bund\b/i,
  /\bdans\b/i,
  /\bdes\b/i,
  /\bdu\b/i,
  /\blos\b/i,
  /\blas\b/i,
  /\bder\b/i,
  /\bdie\b/i,
  /\bdas\b/i,
  /\bmit\b/i,
  /\bauf\b/i,
  /\bedidit\b/i,
  /\bzur\b/i,
  /\bfur\b/i,
]

const saturatedThemeSignals = [
  {
    key: 'culpeper-complete-herbal',
    pattern: /\bculpeper(?:'s)?\b|\bculpepper(?:'s)?\b|\benglish physician\b|\bcomplete herbal\b/i,
    minChunked: 8,
    score: 132,
  },
]

const nonBookTitlePatterns = [
  /\bsynopsis of lectures?\b/i,
  /\baddress\b.*\bintroductory\b/i,
  /\bintroductory\b.*\baddress\b/i,
  /\bintroductory to opening\b/i,
  /\binaugural lecture\b/i,
  /\bopening address\b/i,
  /\bbeing an introductory to the course of lectures\b/i,
  /\bintroductory to the course of lectures\b/i,
  /\bdelivered at the opening of\b/i,
  /\bopening of the .*?(?:college|session)\b/i,
  /\bbefore the faculty(?:,|\b)|\bfaculty, students,? and citizens\b/i,
  /\bpamphlet advertising\b/i,
  /\badvertising\b.*\bdiet-?drink\b/i,
  /\binaugural-?dissertation\b/i,
  /\baddress of the faculty\b/i,
  /\bannual report\b/i,
  /\bprogramme of the ensuing sessions?\b/i,
  /^a lecture\b/i,
  /^lectures? on\b/i,
  /\bbeing one of a course on\b/i,
  /\btwo lectures delivered before\b/i,
  /\blecture[,;:]?\s+introductory to (?:a|the) course\b/i,
  /^lecture[,;:]?\s+introductory\b/i,
  /\bsyllabus of (?:a course of )?lectures?\b/i,
  /\bexaminations? in\b/i,
  /\bmanual of examinations upon\b/i,
  /\bstudents preparing for examination\b/i,
  /\bassistant plates?\b/i,
  /\bplates? to the materia medica\b/i,
  /\bbotanical tables?\b|\btables of the materia medica\b/i,
  /\bcatalogue for\s+\d/i,
  /\badditional chapter to\b/i,
  /\bchapter extracted from\b/i,
  /\bempiric\b.*\bquackery\b/i,
  /\bselect committee\b.*\bpetitions\b/i,
  /\bspecification of\b/i,
  /\bpatent of\b/i,
  /\bphysic a-field\b/i,
  /\bfamous bird that speaks one word\b/i,
  /\bbeauty,?\s+riches?\s+and\s+honou?r\b/i,
  /\bsexual debility\b|\bseminal weakness\b|\bsecret and excessive venery\b|\bvenery among youths\b/i,
  /\bdescriptive catalogue\b.*\bextracts?\b/i,
  /\bfluid and solid extracts\b/i,
  /\bworking bulletins?\b/i,
  /\bpresented to the medical profession with (?:their )?compliments\b/i,
  /\bintroduced and manufactured by\b/i,
  /\bstandard medicinal products?\b/i,
  /\bfine pharmaceutical specialt(?:y|ies)\b/i,
  /\bparke,\s*davis(?:\s*&\s*(?:co|company))?\b/i,
  /\bto be sold at the prices affixed\b|\bfor ready money only\b|\bfull value given for libraries\b/i,
  /\bhom(?:oe)?opathic laboratories?\b|\blaboratories,\s*ltd\b/i,
  /\balkaloids?\s+ltd\b/i,
  /\bwith the compliments of\b|\bhealth food stores?\b/i,
  /\bphrenological\b|\bself-?instructor\b|\billustrated chart\b/i,
  /\btransactions of the\b|\bproceedings of the\b/i,
  /\byear-?\s*book\b/i,
  /\boutlines of lectures? on\b/i,
  /\bstudent'?s guide\b/i,
  /\bcontemplating marriage\b|\bsex may be controlled\b/i,
  /\bquestions?\s*(?:&|and)\s*answers?\b/i,
  /\bquestions?\s+to\s+be\s+answered\b/i,
  /\bethereal fire\b/i,
  /\bread in the section of\b|\bannual meeting of the\b/i,
  /\btout le monde\b|\bla sante\b/i,
  /^on the distinctive characters of\b/i,
  /^a letter to the patentee\b/i,
  /\bmedical properties of the fleecy hosiery\b/i,
  /\boccurrences which led to the removal of\b/i,
  /\bremoval of .*?\bchair of\b/i,
  /\bquaestio medica\b|\bpro baccalaureatu\b|\bmane discutienda\b|\bsub hac verborum serie\b/i,
  /\bappendix to\b.*\bhom(?:oe)?opathic domestic medicine\b/i,
  /\bextracted from\b/i,
  /\bdruggist\b/i,
  /\bfor sale\b/i,
  /\bprice list\b/i,
  /\bcircular\b/i,
  /\bannouncement\b/i,
  /\bprospectus\b/i,
]

const stageWeights = {
  uncovered_family: 920,
  depth_family: 360,
  failed_only_family: 140,
}

const stageOrder = {
  uncovered_family: 0,
  depth_family: 1,
  failed_only_family: 2,
}

const stageLabels = {
  uncovered_family: 'Uncovered family',
  depth_family: 'Depth family',
  failed_only_family: 'Failed-only family',
}

let saturatedThemeChunkedCounts = new Map()
let chunkedSeriesCounts = new Map()
let chunkedCreatorSeriesCounts = new Map()

const asNumber = (value) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

const normalizeYear = (value) => {
  const year = Number.parseInt(String(value ?? ''), 10)
  return Number.isFinite(year) ? year : null
}

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

const hasStrongEnglishReferenceSignal = (title) =>
  /\b(?:guide|manual|hand ?book|dictionary|catalogue|catalog|family|domestic|physician|pharmacop(?:oe)?ia|materia medica|herbal|medicinal plants?|medical botany|dispensatory)\b/i.test(
    title,
  )

const isLikelyNonBookTitle = (title) => nonBookTitlePatterns.some((pattern) => pattern.test(title ?? ''))

const uniqueOrdered = (values) => {
  const seen = new Set()
  const ordered = []
  for (const value of values) {
    if (value && !seen.has(value)) {
      seen.add(value)
      ordered.push(value)
    }
  }
  return ordered
}

const computeTopicScore = (topicFamily, title) => {
  const tags = splitList(topicFamily)
  let score = uniqueOrdered(tags).reduce((total, tag) => total + (topicWeights[tag] ?? 0), 0)

  for (const signal of titleSignals) {
    if (signal.pattern.test(title ?? '')) {
      score += signal.score
    }
  }

  return Math.min(score, 220)
}

const computeTitlePenalty = (title) => {
  const original = String(title ?? '')
  const normalized = normalizeAscii(title).toLowerCase()
  let score = 0

  for (const signal of titlePenaltySignals) {
    if (signal.pattern.test(normalized)) {
      score += signal.score
    }
  }

  for (const signal of likelyNonEnglishTitlePenaltySignals) {
    if (signal.pattern.test(normalized)) {
      score += signal.score
    }
  }

  for (const signal of foreignLeadingTitlePenaltySignals) {
    if (signal.pattern.test(normalized)) {
      score += signal.score
    }
  }

  const foreignWordHitCount = foreignFunctionWordPatterns.reduce(
    (total, pattern) => total + (pattern.test(normalized) ? 1 : 0),
    0,
  )
  if (foreignWordHitCount >= 2) {
    score += hasStrongEnglishReferenceSignal(normalized) ? 28 : 56
  }

  if (!hasStrongEnglishReferenceSignal(normalized) && normalizeAscii(title) !== original) {
    score += 18
  }

  for (const signal of saturatedThemeSignals) {
    if ((saturatedThemeChunkedCounts.get(signal.key) ?? 0) >= signal.minChunked && signal.pattern.test(normalized)) {
      score += signal.score
    }
  }

  return Math.min(score, 180)
}

const determineStage = (family) => {
  const chunkedCount = asNumber(family.chunked_count)
  const discoveredCount = asNumber(family.discovered_count)
  const failedCount = asNumber(family.failed_count)

  if (chunkedCount === 0 && discoveredCount > 0) {
    return 'uncovered_family'
  }

  if (chunkedCount > 0 && discoveredCount > 0) {
    return 'depth_family'
  }

  if (chunkedCount === 0 && discoveredCount === 0 && failedCount > 0) {
    return 'failed_only_family'
  }

  return null
}

const computeArchiveSeriesPenalty = (seriesCount) => (seriesCount > 0 ? Math.min(96 + (seriesCount - 1) * 16, 220) : 0)

const computeArchiveCreatorSeriesPenalty = (creatorKey, creatorSeriesCount) =>
  creatorKey !== 'unknown' && creatorSeriesCount > 0 ? Math.min(48 + (creatorSeriesCount - 1) * 12, 120) : 0

const candidateStatusWeight = {
  discovered: 260,
  download_failed: 60,
}

const memberRoleWeight = {
  canonical: 70,
  copy: 32,
  edition: 24,
  volume: -20,
}

const buildCandidateSelector = (family, workById, members) => {
  const chunkedMembers = members.filter((member) => member.ingest_status === 'chunked')
  const chunkedCollections = new Set(chunkedMembers.map((member) => member.collection_id).filter(Boolean))
  const chunkedJurisdictions = new Set(
    chunkedMembers.map((member) => workById.get(member.work_id)?.jurisdiction_lane).filter(Boolean),
  )

  return (member) => {
    const work = workById.get(member.work_id) ?? {}
    const year = normalizeYear(work.publication_year)
    const title = work.title || member.title
    const topicScore = computeTopicScore(work.topic_family || family.topic_family, title)
    const titlePenalty = computeTitlePenalty(title)
    const seriesTitleKey = extractSeriesTitleKey(title)
    const creatorKey = extractCreatorKey(work.creator || '')
    const creatorTitleKey = `${creatorKey}::${seriesTitleKey}`
    const archiveSeriesCount = chunkedSeriesCounts.get(seriesTitleKey) ?? 0
    const archiveCreatorSeriesCount = chunkedCreatorSeriesCounts.get(creatorTitleKey) ?? 0
    const archiveSeriesPenalty = computeArchiveSeriesPenalty(archiveSeriesCount)
    const archiveCreatorSeriesPenalty = computeArchiveCreatorSeriesPenalty(creatorKey, archiveCreatorSeriesCount)
    const newCollectionBonus =
      chunkedCollections.size > 0 && work.collection_id && !chunkedCollections.has(work.collection_id) ? 34 : 0
    const newJurisdictionBonus =
      chunkedJurisdictions.size > 0 &&
      work.jurisdiction_lane &&
      !chunkedJurisdictions.has(work.jurisdiction_lane)
        ? 18
        : 0

    return {
      member,
      work,
      score:
        (candidateStatusWeight[member.ingest_status] ?? 0) +
        (member.work_id === family.canonical_work_id ? 85 : 0) +
        (memberRoleWeight[member.member_role] ?? 0) +
        (member.volume_like === 'yes' ? -24 : 20) +
        (collectionWeights[work.collection_id] ?? 0) +
        Math.round(topicScore * 0.34) +
        newCollectionBonus +
        newJurisdictionBonus +
        -titlePenalty +
        -archiveSeriesPenalty +
        -archiveCreatorSeriesPenalty +
        (year == null ? -4 : year < 1850 ? 10 : year < 1900 ? 6 : 0) +
        (work.creator ? 0 : -6),
      year,
      topicScore,
      titlePenalty,
      seriesTitleKey,
      creatorTitleKey,
      archiveSeriesCount,
      archiveCreatorSeriesCount,
      archiveSeriesPenalty,
      archiveCreatorSeriesPenalty,
    }
  }
}

await ensureCorpusDirectories()
await mkdir(acquisitionFrontierDir, { recursive: true })
await mkdir(worklistsDir, { recursive: true })

const works = await loadWorksRegistry()
const workById = new Map(works.map((work) => [work.work_id, work]))
const chunkedWorks = works.filter((work) => work.ingest_status === 'chunked')
saturatedThemeChunkedCounts = new Map(
  saturatedThemeSignals.map((signal) => [
    signal.key,
    chunkedWorks.filter((work) => signal.pattern.test(work.title ?? '')).length,
  ]),
)
chunkedSeriesCounts = chunkedWorks.reduce((map, work) => {
  const seriesTitleKey = extractSeriesTitleKey(work.title ?? '')
  map.set(seriesTitleKey, (map.get(seriesTitleKey) ?? 0) + 1)
  return map
}, new Map())
chunkedCreatorSeriesCounts = chunkedWorks.reduce((map, work) => {
  const seriesTitleKey = extractSeriesTitleKey(work.title ?? '')
  const creatorTitleKey = `${extractCreatorKey(work.creator ?? '')}::${seriesTitleKey}`
  map.set(creatorTitleKey, (map.get(creatorTitleKey) ?? 0) + 1)
  return map
}, new Map())
const families = await readCsvFile(familiesPath)
const memberships = await readCsvFile(membershipsPath)

const membersByFamily = memberships.reduce((map, member) => {
  const bucket = map.get(member.family_id) ?? []
  bucket.push(member)
  map.set(member.family_id, bucket)
  return map
}, new Map())

let uncoveredFamilyCount = 0
let depthFamilyCount = 0
let failedOnlyFamilyCount = 0
let discoveredInUncoveredFamilies = 0
let discoveredInDepthFamilies = 0
let failedOnlyWorkCount = 0

const frontierRows = []

for (const family of families) {
  const stage = determineStage(family)
  if (!stage) {
    continue
  }

  if (stage === 'depth_family' && !includeDepthFamilies) {
    continue
  }

  if (stage === 'failed_only_family' && !includeFailedOnlyFamilies) {
    continue
  }

  if (stage === 'uncovered_family') {
    uncoveredFamilyCount += 1
    discoveredInUncoveredFamilies += asNumber(family.discovered_count)
  } else if (stage === 'depth_family') {
    depthFamilyCount += 1
    discoveredInDepthFamilies += asNumber(family.discovered_count)
  } else if (stage === 'failed_only_family') {
    failedOnlyFamilyCount += 1
    failedOnlyWorkCount += asNumber(family.failed_count)
  }

  const members = membersByFamily.get(family.family_id) ?? []
  const candidateMembers = members.filter((member) => {
    if (member.ingest_status === 'chunked') {
      return false
    }

    const work = workById.get(member.work_id) ?? {}
    return !isLikelyNonBookTitle(work.title || member.title)
  })
  if (candidateMembers.length === 0) {
    continue
  }

  const selectCandidate = buildCandidateSelector(family, workById, members)
  const rankedCandidates = candidateMembers
    .map(selectCandidate)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.member.member_role.localeCompare(right.member.member_role) ||
        (left.year ?? Number.POSITIVE_INFINITY) - (right.year ?? Number.POSITIVE_INFINITY) ||
        left.member.work_id.localeCompare(right.member.work_id),
    )

  const selected = rankedCandidates[0]
  const selectedWork = selected.work
  const familyTopicScore = computeTopicScore(
    family.topic_family || selectedWork.topic_family,
    family.family_label || selectedWork.title,
  )
  const breadthScore = Math.min(asNumber(family.work_count) * 12, 180)
  const discoveryBreadthBonus = Math.min(asNumber(family.discovered_count) * 6, 96)
  const crossCollectionBonus = splitList(family.collection_ids).length > 1 ? 28 : 0
  const representedPenalty =
    stage === 'depth_family' ? Math.min(asNumber(family.chunked_count) * 24, 120) : 0
  const failedPenalty = selected.member.ingest_status === 'download_failed' ? 96 : 0

  const frontierScore =
    stageWeights[stage] +
    familyTopicScore +
    breadthScore +
    discoveryBreadthBonus +
    crossCollectionBonus +
    selected.score -
    representedPenalty -
    failedPenalty

  const rationaleParts = [
    stageLabels[stage],
    `${asNumber(family.work_count)} works in family`,
    `${asNumber(family.chunked_count)} chunked`,
    `${asNumber(family.discovered_count)} discovered`,
    family.topic_family ? `topics: ${family.topic_family}` : null,
    selectedWork.collection_id ? `recommended lane: ${selectedWork.collection_id}` : null,
    selected.member.work_id === family.canonical_work_id ? 'canonical candidate' : null,
  ].filter(Boolean)

  frontierRows.push({
    frontier_score: frontierScore,
    frontier_stage: stage,
    family_id: family.family_id,
    family_label: family.family_label,
    canonical_work_id: family.canonical_work_id,
    family_work_count: asNumber(family.work_count),
    family_chunked_count: asNumber(family.chunked_count),
    family_discovered_count: asNumber(family.discovered_count),
    family_failed_count: asNumber(family.failed_count),
    family_collection_ids: family.collection_ids,
    family_jurisdiction_lanes: family.jurisdiction_lanes,
    family_topic_family: family.topic_family,
    candidate_work_id: selected.member.work_id,
    candidate_title: selectedWork.title || selected.member.title,
    candidate_collection_id: selectedWork.collection_id || selected.member.collection_id,
    candidate_jurisdiction_lane: selectedWork.jurisdiction_lane || '',
    candidate_creator: selectedWork.creator || '',
    candidate_publication_year: selectedWork.publication_year || selected.member.publication_year || '',
    candidate_ingest_status: selected.member.ingest_status,
    candidate_member_role: selected.member.member_role,
    candidate_volume_like: selected.member.volume_like,
    candidate_series_title_key: selected.seriesTitleKey,
    candidate_creator_title_key: selected.creatorTitleKey,
    candidate_priority_score: selected.score,
    candidate_title_penalty: selected.titlePenalty,
    candidate_topic_score: selected.topicScore,
    candidate_archive_series_count: selected.archiveSeriesCount,
    candidate_archive_creator_series_count: selected.archiveCreatorSeriesCount,
    candidate_archive_series_penalty: selected.archiveSeriesPenalty,
    candidate_archive_creator_series_penalty: selected.archiveCreatorSeriesPenalty,
    rationale: rationaleParts.join('; '),
  })
}

const sortedFrontier = frontierRows
  .sort(
    (left, right) =>
      stageOrder[left.frontier_stage] - stageOrder[right.frontier_stage] ||
      right.frontier_score - left.frontier_score ||
      right.family_work_count - left.family_work_count ||
      left.family_label.localeCompare(right.family_label),
  )
  .slice(0, Number.isFinite(limit) ? limit : Number.MAX_SAFE_INTEGER)
  .map((row, index) => ({
    rank: index + 1,
    ...row,
  }))

const worklists = {}
for (const collectionId of uniqueOrdered(sortedFrontier.map((row) => row.candidate_collection_id))) {
  const collectionRows = sortedFrontier.filter((row) => row.candidate_collection_id === collectionId)
  const stageBuckets = {
    uncovered_family: collectionRows.filter((row) => row.frontier_stage === 'uncovered_family'),
    depth_family: collectionRows.filter((row) => row.frontier_stage === 'depth_family'),
    failed_only_family: collectionRows.filter((row) => row.frontier_stage === 'failed_only_family'),
  }

  const filePaths = {}
  for (const [stage, rows] of Object.entries(stageBuckets)) {
    const ids = rows.slice(0, worklistLimit).map((row) => row.candidate_work_id)
    const filePath = resolve(worklistsDir, `${collectionId}-${stage}.txt`)
    await writeFile(filePath, ids.length > 0 ? `${ids.join('\n')}\n` : '', 'utf8')
    filePaths[stage] = filePath
  }

  const topIds = collectionRows.slice(0, worklistLimit).map((row) => row.candidate_work_id)
  const topFilePath = resolve(worklistsDir, `${collectionId}-top.txt`)
  await writeFile(topFilePath, topIds.length > 0 ? `${topIds.join('\n')}\n` : '', 'utf8')

  worklists[collectionId] = {
    total: collectionRows.length,
    uncovered: stageBuckets.uncovered_family.length,
    depth: stageBuckets.depth_family.length,
    failedOnly: stageBuckets.failed_only_family.length,
    topFilePath,
    stageFilePaths: filePaths,
    sampleWorkIds: topIds.slice(0, 12),
  }
}

const summary = {
  generatedAt: new Date().toISOString(),
  totalFamiliesConsidered: families.length,
  frontierFamilyCount: sortedFrontier.length,
  uncoveredFamilyCount,
  depthFamilyCount,
  failedOnlyFamilyCount,
  discoveredInUncoveredFamilies,
  discoveredInDepthFamilies,
  failedOnlyWorkCount,
  worklistLimit,
  includeDepthFamilies,
  includeFailedOnlyFamilies,
  collectionWorklists: worklists,
  topRecommendations: sortedFrontier.slice(0, 20).map((row) => ({
    rank: row.rank,
    frontier_stage: row.frontier_stage,
    frontier_score: row.frontier_score,
    family_label: row.family_label,
    candidate_work_id: row.candidate_work_id,
    candidate_collection_id: row.candidate_collection_id,
    family_topic_family: row.family_topic_family,
  })),
}

await writeCsvFile(frontierCsvPath, sortedFrontier, frontierHeaders)
await writeJson(frontierJsonPath, sortedFrontier)
await writeJson(summaryPath, summary)

const collectionCommandHints = []
for (const [collectionId, worklist] of Object.entries(worklists)) {
  const scriptName =
    collectionId === 'wellcome-collection'
      ? 'corpus:wellcome'
      : collectionId === 'nlm-digital-collections'
        ? 'corpus:nlm'
        : null

  if (!scriptName) {
    continue
  }

  collectionCommandHints.push(
    `- \`${collectionId}\` top list: \`npm run ${scriptName} -- --work-ids-file=corpus/derived/acquisition-frontier/worklists/${collectionId}-top.txt --limit=10\``,
  )
}

const readme = [
  '# Acquisition Frontier',
  '',
  `Generated: ${summary.generatedAt}`,
  '',
  'This folder ranks the next best book acquisitions by unique knowledge coverage rather than raw title backlog alone.',
  '',
  '## Why it exists',
  '',
  '- prefer one strong candidate from an uncovered book family before pulling more editions of already represented families',
  '- keep the corpus broad across herbals, domestic medicine, medicinal-plant guides, and related practical references',
  '- retain collection-aware worklists that can be fed directly into the official-source acquisition scripts',
  '- cool off title-series that already have strong local representation, even when alternate witnesses make them appear as fresh families',
  '',
  '## Current summary',
  '',
  `- Families considered: ${summary.totalFamiliesConsidered}`,
  `- Frontier families: ${summary.frontierFamilyCount}`,
  `- Uncovered families: ${summary.uncoveredFamilyCount}`,
  `- Depth families: ${summary.depthFamilyCount}`,
  `- Failed-only families: ${summary.failedOnlyFamilyCount}`,
  `- Discovered works still sitting in uncovered families: ${summary.discoveredInUncoveredFamilies}`,
  `- Discovered works sitting in already represented families: ${summary.discoveredInDepthFamilies}`,
  '',
  '## Key files',
  '',
  '- `frontier.csv`',
  '- `frontier.json`',
  '- `worklists/`',
  '',
  '## Recommended next acquisitions',
  '',
  ...summary.topRecommendations.slice(0, 12).map(
    (row) =>
      `- ${row.rank}. ${row.family_label} -> \`${row.candidate_work_id}\` (${row.candidate_collection_id}; ${row.frontier_stage}; ${row.family_topic_family || 'topic review'})`,
  ),
  '',
  '## Command hints',
  '',
  ...collectionCommandHints,
  '',
  '## Notes',
  '',
  '- This layer is acquisition-oriented and intentionally keeps only one recommended next work per family.',
  '- The ranking favors uncovered families, practical herb and domestic-health topics, canonical members, and candidates that add new source-lane coverage.',
  '- Archive-level series saturation is now part of the score so repeated Buchan-, Gunn-, pharmacopoeia-, and similar witness chains stop dominating the top frontier.',
  '- Failed-only families are kept visible but deprioritized behind clean discovered candidates.',
  '',
].join('\n')

await writeFile(readmePath, `${readme}\n`, 'utf8')

console.log(
  JSON.stringify(
    {
      summaryPath,
      frontierCsvPath,
      frontierJsonPath,
      frontierFamilyCount: summary.frontierFamilyCount,
      uncoveredFamilyCount: summary.uncoveredFamilyCount,
      depthFamilyCount: summary.depthFamilyCount,
      failedOnlyFamilyCount: summary.failedOnlyFamilyCount,
    },
    null,
    2,
  ),
)
