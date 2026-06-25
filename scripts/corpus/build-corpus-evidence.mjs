import { once } from 'node:events'
import { createWriteStream } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  chunksDir,
  derivedDir,
  ensureCorpusDirectories,
  exportsDir,
  loadWorksRegistry,
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

const collectionFilter = args.get('collection') ?? ''
const limit = Number(args.get('limit') ?? Number.POSITIVE_INFINITY)
const sampleLimit = Number(args.get('sample-limit') ?? 3)

const evidenceDir = resolve(derivedDir, 'evidence')
const graphPath = resolve(evidenceDir, 'graph.json')
const chunkSignalsPath = resolve(evidenceDir, 'chunk-signals.jsonl')
const herbCandidatesCsvPath = resolve(evidenceDir, 'herb-candidates.csv')
const herbCandidatesJsonPath = resolve(evidenceDir, 'herb-candidates.json')
const plantPartsCsvPath = resolve(evidenceDir, 'plant-parts.csv')
const preparationsCsvPath = resolve(evidenceDir, 'preparations.csv')
const cautionsCsvPath = resolve(evidenceDir, 'cautions.csv')
const conditionsCsvPath = resolve(evidenceDir, 'conditions.csv')
const readmePath = resolve(evidenceDir, 'README.md')
const summaryPath = resolve(exportsDir, 'corpus-evidence-summary.json')

const herbCandidateHeaders = [
  'herb_id',
  'name',
  'normalized_name',
  'confidence',
  'basis',
  'mention_count',
  'chunk_count',
  'work_count',
  'collections',
  'topic_families',
  'sample_work_ids',
  'sample_chunk_ids',
]

const aggregateHeaders = ['id', 'label', 'mention_count', 'chunk_count', 'work_count', 'sample_work_ids', 'sample_chunk_ids']

const plantParts = [
  { id: 'root', label: 'Root', pattern: /\broots?\b/gi },
  { id: 'rhizome', label: 'Rhizome', pattern: /\brhizomes?\b/gi },
  { id: 'leaf', label: 'Leaf', pattern: /\bleaves\b|\bleaf\b/gi },
  { id: 'flower', label: 'Flower', pattern: /\bflowers?\b/gi },
  { id: 'flowering-top', label: 'Flowering tops', pattern: /\bflowering tops?\b/gi },
  { id: 'seed', label: 'Seed', pattern: /\bseeds?\b/gi },
  { id: 'berry', label: 'Berry', pattern: /\bberries\b|\bberry\b/gi },
  { id: 'fruit', label: 'Fruit', pattern: /\bfruits?\b/gi },
  { id: 'bark', label: 'Bark', pattern: /\bbarks?\b/gi },
  { id: 'bulb', label: 'Bulb', pattern: /\bbulbs?\b/gi },
  { id: 'gum', label: 'Gum', pattern: /\bgums?\b/gi },
  { id: 'resin', label: 'Resin', pattern: /\bresins?\b/gi },
  { id: 'aerial-part', label: 'Aerial parts', pattern: /\baerial parts?\b/gi },
  { id: 'tops', label: 'Tops', pattern: /\btops?\b/gi },
]

const preparations = [
  { id: 'infusion', label: 'Infusion', pattern: /\binfusions?\b/gi },
  { id: 'decoction', label: 'Decoction', pattern: /\bdecoctions?\b/gi },
  { id: 'tincture', label: 'Tincture', pattern: /\btinctures?\b/gi },
  { id: 'syrup', label: 'Syrup', pattern: /\bsyrups?\b/gi },
  { id: 'tea', label: 'Tea', pattern: /\bteas?\b/gi },
  { id: 'extract', label: 'Extract', pattern: /\bextracts?\b/gi },
  { id: 'powder', label: 'Powder', pattern: /\bpowders?\b/gi },
  { id: 'ointment', label: 'Ointment', pattern: /\bointments?\b/gi },
  { id: 'salve', label: 'Salve', pattern: /\bsalves?\b/gi },
  { id: 'poultice', label: 'Poultice', pattern: /\bpoultices?\b/gi },
  { id: 'compress', label: 'Compress', pattern: /\bcompress(?:es)?\b/gi },
  { id: 'wash', label: 'Wash', pattern: /\bwashes\b|\bwash\b/gi },
  { id: 'bath', label: 'Bath', pattern: /\bbaths?\b|\bvapor bath\b|\bhot air bath\b/gi },
  { id: 'gargle', label: 'Gargle', pattern: /\bgargles?\b/gi },
  { id: 'liniment', label: 'Liniment', pattern: /\bliniments?\b/gi },
  { id: 'plaster', label: 'Plaster', pattern: /\bplasters?\b/gi },
  { id: 'juice', label: 'Juice', pattern: /\bjuices?\b/gi },
  { id: 'oil', label: 'Oil', pattern: /\boils?\b/gi },
  { id: 'essence', label: 'Essence', pattern: /\bessences?\b/gi },
  { id: 'cordial', label: 'Cordial', pattern: /\bcordials?\b/gi },
  { id: 'draught', label: 'Draught', pattern: /\bdraughts?\b/gi },
  { id: 'emetic', label: 'Emetic', pattern: /\bemetics?\b/gi },
  { id: 'capsule', label: 'Capsule', pattern: /\bcapsules?\b/gi },
  { id: 'pill', label: 'Pill', pattern: /\bpills?\b/gi },
  { id: 'steam', label: 'Steam', pattern: /\bsteaming\b|\bsteam\b/gi },
]

const cautionRules = [
  { id: 'pregnancy', label: 'Pregnancy caution', pattern: /\bpregnan(?:t|cy)\b|\bwith child\b/gi },
  { id: 'child-use', label: 'Child-use caution', pattern: /\binfants?\b|\bchildren\b|\bchild\b|\bbabes?\b/gi },
  { id: 'toxicity', label: 'Toxicity watch', pattern: /\bpoison(?:ous)?\b|\btoxic\b|\bvenom(?:ous)?\b/gi },
  { id: 'dose', label: 'Dose caution', pattern: /\boverdose\b|\bdose\b|\bdoses\b|\btoo much\b/gi },
  { id: 'bleeding', label: 'Bleeding caution', pattern: /\bbleeding\b|\bhaemorrhag(?:e|es)\b|\bhemorrhag(?:e|es)\b/gi },
  { id: 'fatal-risk', label: 'Fatal-risk warning', pattern: /\bfatal\b|\bdeath\b|\bdied\b|\bmortal\b/gi },
  { id: 'narcotic', label: 'Narcotic or sedative caution', pattern: /\bnarcotic\b|\bopium\b|\banodyne\b|\bsedative\b/gi },
  { id: 'allergy', label: 'Allergy or sensitivity caution', pattern: /\ballerg(?:y|ic)\b|\bsensitive\b|\birritation\b/gi },
  { id: 'abortifacient', label: 'Abortifacient warning', pattern: /\babortion\b|\babort\b|\bmiscarri(?:age|ages)\b/gi },
]

const conditions = [
  { id: 'fever', label: 'Fever', pattern: /\bfevers?\b|\bague\b/gi },
  { id: 'cholera', label: 'Cholera', pattern: /\bcholera\b/gi },
  { id: 'cough', label: 'Cough', pattern: /\bcoughs?\b/gi },
  { id: 'cold', label: 'Cold or catarrh', pattern: /\bcolds?\b|\bcatarrh\b/gi },
  { id: 'consumption', label: 'Consumption', pattern: /\bconsumption\b|\bphthisis\b/gi },
  { id: 'asthma', label: 'Asthma', pattern: /\basthma\b/gi },
  { id: 'rheumatism', label: 'Rheumatism', pattern: /\brheumati(?:sm|c)\b/gi },
  { id: 'gout', label: 'Gout', pattern: /\bgout\b/gi },
  { id: 'diarrhoea', label: 'Diarrhoea or looseness', pattern: /\bdiarrh(?:ea|oea)\b|\blooseness of the bowels\b|\bpurging\b/gi },
  { id: 'dysentery', label: 'Dysentery', pattern: /\bdysentery\b/gi },
  { id: 'constipation', label: 'Constipation', pattern: /\bconstipation\b|\bcostiveness\b/gi },
  { id: 'headache', label: 'Headache', pattern: /\bhead[- ]?ache\b/gi },
  { id: 'vomiting', label: 'Vomiting or nausea', pattern: /\bvomit(?:ing)?\b|\bnausea\b|\bsickne(?:ss)?\b/gi },
  { id: 'wounds', label: 'Wounds or ulcers', pattern: /\bwounds?\b|\bulcers?\b|\bsores?\b/gi },
  { id: 'dropsy', label: 'Dropsy', pattern: /\bdropsy\b/gi },
  { id: 'inflammation', label: 'Inflammation', pattern: /\binflammati(?:on|ons)\b/gi },
  { id: 'colic', label: 'Colic', pattern: /\bcolic\b/gi },
  { id: 'smallpox', label: 'Smallpox', pattern: /\bsmall pox\b|\bsmallpox\b/gi },
  { id: 'measles', label: 'Measles', pattern: /\bmeasles\b/gi },
  { id: 'epilepsy', label: 'Epilepsy or convulsions', pattern: /\bepilep(?:sy|tic)\b|\bconvulsions?\b|\bfits\b/gi },
]

const plantPartPhrase = '(?:flowering tops?|roots?|leaves|leaf|barks?|berries|berry|seeds?|flowers?|flower|rhizomes?|bulbs?|gums?|resins?|herbs?)'
const preparationPhrase =
  '(?:infusions?|decoctions?|tinctures?|syrups?|teas?|extracts?|powders?|oils?|juices?|ointments?|salves?|poultices?|compress(?:es)?|washes|wash|gargles?|liniments?|plasters?|essences?|cordials?|draughts?|bitters?)'

const herbFromPartRegex = new RegExp(
  `\\b((?:[A-Za-z][A-Za-z'-]*\\s+){0,2}[A-Za-z][A-Za-z'-]*)\\s+(${plantPartPhrase})\\b`,
  'gi',
)
const herbFromPreparationOfRegex = new RegExp(`\\b${preparationPhrase}\\s+of\\s+((?:[A-Za-z][A-Za-z'-]*\\s+){0,2}[A-Za-z][A-Za-z'-]*)\\b`, 'gi')
const herbFromPreparationSuffixRegex = new RegExp(
  `\\b((?:[A-Za-z][A-Za-z'-]*\\s+){0,2}[A-Za-z][A-Za-z'-]*)\\s+${preparationPhrase}\\b`,
  'gi',
)

const weakWords = new Set([
  'a',
  'an',
  'any',
  'as',
  'and',
  'at',
  'by',
  'each',
  'every',
  'for',
  'from',
  'have',
  'his',
  'in',
  'into',
  'is',
  'its',
  'new',
  'of',
  'our',
  'on',
  'or',
  'taken',
  'their',
  'that',
  'the',
  'them',
  'they',
  'these',
  'this',
  'those',
  'to',
  'with',
  'your',
])

const blockedCandidateWords = new Set([
  'abdomen',
  'administer',
  'air',
  'animal',
  'aromatic',
  'apothecary',
  'article',
  'bath',
  'baths',
  'bark',
  'black',
  'blistering',
  'blood',
  'body',
  'bowels',
  'bowl',
  'bread',
  'breathe',
  'brought',
  'case',
  'cases',
  'charcoal',
  'cholera',
  'cold',
  'common',
  'compound',
  'composition',
  'condition',
  'cordial',
  'decoction',
  'disease',
  'diseases',
  'doctor',
  'dose',
  'doses',
  'drink',
  'dried',
  'english',
  'essence',
  'extractive',
  'extract',
  'family',
  'fever',
  'flannel',
  'flannels',
  'following',
  'food',
  'form',
  'french',
  'fresh',
  'gargle',
  'german',
  'gingerbread',
  'guide',
  'half',
  'health',
  'heart',
  'hospital',
  'hot',
  'hours',
  'household',
  'inflammation',
  'infusion',
  'ingredient',
  'ingredients',
  'inner',
  'it',
  'its',
  'juice',
  'juice',
  'kind',
  'large',
  'leaf',
  'leaves',
  'legs',
  'liniment',
  'made',
  'make',
  'medicine',
  'medicines',
  'mixture',
  'milk',
  'mix',
  'morn',
  'nourishment',
  'ointment',
  'oil',
  'one',
  'ounce',
  'ounces',
  'palm',
  'palms',
  'patient',
  'patients',
  'physician',
  'plaster',
  'poultice',
  'powder',
  'powdered',
  'preparation',
  'preparations',
  'prescription',
  'prescriptions',
  'prepared',
  'proper',
  'quarter',
  'red',
  'remedy',
  'remedies',
  'resin',
  'roman',
  'root',
  'roots',
  'same',
  'salve',
  'seed',
  'seeds',
  'several',
  'sick',
  'simple',
  'small',
  'salt',
  'salts',
  'stomach',
  'strong',
  'sufficient',
  'sweet',
  'syrup',
  'take',
  'tea',
  'treatment',
  'two',
  'use',
  'used',
  'volatile',
  'water',
  'warm',
  'weak',
  'white',
  'wine',
  'women',
  'work',
  'yellow',
])

const descriptiveLeadWords = new Set([
  'american',
  'black',
  'english',
  'french',
  'german',
  'green',
  'peruvian',
  'red',
  'roman',
  'sweet',
  'white',
  'wild',
  'yellow',
])

const blockedSingleWords = new Set([
  'essential',
  'expressed',
  'female',
  'lower',
  'mall',
  'male',
  'three',
])

const singularizePart = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/\bberries\b/g, 'berry')
    .replace(/\bleaves\b/g, 'leaf')
    .replace(/\broots\b/g, 'root')
    .replace(/\bflowers\b/g, 'flower')
    .replace(/\bseeds\b/g, 'seed')
    .replace(/\bbarks\b/g, 'bark')
    .replace(/\brhizomes\b/g, 'rhizome')
    .replace(/\bbulbs\b/g, 'bulb')
    .replace(/\bgums\b/g, 'gum')
    .replace(/\bresins\b/g, 'resin')
    .replace(/\btops\b/g, 'top')

const titleCase = (value) =>
  String(value ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const normalizeWhitespace = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

const normalizeCandidate = (value) =>
  normalizeWhitespace(value)
    .toLowerCase()
    .replace(/(^|\s)(?:the|a|an)\s+/g, ' ')
    .replace(/[^a-z0-9 -]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const isPlausibleHerbCandidate = (value) => {
  const normalized = normalizeCandidate(value)
  if (!normalized || normalized.length < 3 || normalized.length > 40) {
    return false
  }

  const words = normalized.split(/\s+/).filter(Boolean)
  if (words.length < 1 || words.length > 4) {
    return false
  }

  if (words.some((word) => weakWords.has(word))) {
    return false
  }

  if (words.some((word) => blockedCandidateWords.has(word))) {
    return false
  }

  if (words.length === 1 && blockedSingleWords.has(words[0])) {
    return false
  }

  if (words.some((word) => /^\d+$/.test(word))) {
    return false
  }

  return true
}

const dedupeById = (items) => {
  const seen = new Set()
  const unique = []
  for (const item of items) {
    if (seen.has(item.id)) {
      continue
    }
    seen.add(item.id)
    unique.push(item)
  }
  return unique
}

const collectRuleMatches = (text, rules) => {
  const hits = []
  for (const rule of rules) {
    rule.pattern.lastIndex = 0
    let matched = false
    while (rule.pattern.exec(text)) {
      matched = true
    }
    if (matched) {
      hits.push({ id: rule.id, label: rule.label })
    }
  }
  return dedupeById(hits)
}

const addCandidate = (container, rawValue, basis) => {
  const normalized = normalizeCandidate(rawValue)
  if (!isPlausibleHerbCandidate(normalized)) {
    return
  }

  const id = slugify(normalized)
  const current = container.get(id) ?? {
    id,
    name: titleCase(normalized),
    normalized_name: normalized,
    basis: new Set(),
    mention_count: 0,
  }
  current.basis.add(basis)
  current.mention_count += 1
  container.set(id, current)
}

const splitCandidateVariants = (rawValue) =>
  normalizeWhitespace(rawValue)
    .split(/\s+(?:or|and)\s+/i)
    .map((value) => normalizeWhitespace(value))
    .filter(Boolean)

const projectPartCandidate = (candidate, partRaw) => {
  const normalized = normalizeCandidate(candidate)
  const words = normalized.split(/\s+/).filter(Boolean)
  if (words.length === 1 && descriptiveLeadWords.has(words[0])) {
    return `${candidate} ${singularizePart(partRaw)}`
  }
  return candidate
}

const extractHerbCandidates = (text, { allowPreparationSuffix = true, trustedSuffixIds = null } = {}) => {
  const candidates = new Map()
  for (const pattern of [
    { type: 'part_phrase', regex: herbFromPartRegex, basis: 'part_phrase' },
    { type: 'preparation_of', regex: herbFromPreparationOfRegex, basis: 'preparation_of' },
    ...(allowPreparationSuffix ? [{ type: 'preparation_suffix', regex: herbFromPreparationSuffixRegex, basis: 'preparation_suffix' }] : []),
  ]) {
    pattern.regex.lastIndex = 0
    let match
    while ((match = pattern.regex.exec(text)) !== null) {
      const rawValue =
        pattern.type === 'part_phrase'
          ? projectPartCandidate(match[1], match[2])
          : match[1]

      for (const variant of splitCandidateVariants(rawValue)) {
        const normalizedId = slugify(normalizeCandidate(variant))
        if (pattern.type === 'preparation_suffix' && trustedSuffixIds && !trustedSuffixIds.has(normalizedId)) {
          continue
        }
        addCandidate(candidates, variant, pattern.basis)
      }
    }
  }

  return [...candidates.values()].map((candidate) => ({
    ...candidate,
    basis: [...candidate.basis].sort(),
  }))
}

const excerpt = (text, maxLength = 220) => {
  const cleaned = normalizeWhitespace(text)
  if (cleaned.length <= maxLength) {
    return cleaned
  }
  return `${cleaned.slice(0, maxLength - 3).trim()}...`
}

const confidenceForHerb = (candidate) => {
  const basisCount = candidate.basis.split(';').filter(Boolean).length
  const chunkCount = Number(candidate.chunk_count)
  const workCount = Number(candidate.work_count)

  if (basisCount >= 2 && chunkCount >= 3 && workCount >= 2) {
    return 'high'
  }
  if (chunkCount >= 2 || workCount >= 2 || basisCount >= 2) {
    return 'medium'
  }
  return 'low'
}

const buildAggregateRow = (aggregate) => ({
  id: aggregate.id,
  label: aggregate.label,
  mention_count: aggregate.mentionCount,
  chunk_count: aggregate.chunkIds.size,
  work_count: aggregate.workIds.size,
  sample_work_ids: [...aggregate.workIds].slice(0, sampleLimit).join(';'),
  sample_chunk_ids: [...aggregate.chunkIds].slice(0, sampleLimit).join(';'),
})

await ensureCorpusDirectories()
await mkdir(evidenceDir, { recursive: true })

const works = (await loadWorksRegistry())
  .filter((work) => work.ingest_status === 'chunked')
  .filter((work) => !collectionFilter || work.collection_id === collectionFilter)
  .slice(0, Number.isFinite(limit) ? limit : Number.MAX_SAFE_INTEGER)

const worksById = new Map(works.map((work) => [work.work_id, work]))
const trustedSuffixIds = new Set()
let chunkSignalCount = 0
const herbAggregates = new Map()
const plantPartAggregates = new Map()
const preparationAggregates = new Map()
const cautionAggregates = new Map()
const conditionAggregates = new Map()
const graphNodes = new Map()
const graphEdges = new Map()

const chunkSignalsStream = createWriteStream(chunkSignalsPath, { encoding: 'utf8' })
chunkSignalsStream.on('error', () => {
  // Error is handled by the awaited finish/error race below.
})

const writeChunkSignal = async (record) => {
  const line = `${JSON.stringify(record)}\n`
  if (!chunkSignalsStream.write(line)) {
    await once(chunkSignalsStream, 'drain')
  }
  chunkSignalCount += 1
}

for (const work of works) {
  const chunkFile = resolve(chunksDir, `${work.work_id}.jsonl`)
  let chunkText
  try {
    chunkText = await readFile(chunkFile, 'utf8')
  } catch {
    continue
  }

  for (const line of chunkText.split(/\r?\n/).filter(Boolean)) {
    const chunk = JSON.parse(line)
    const text = String(chunk.text ?? '')
    const seedCandidates = extractHerbCandidates(text, { allowPreparationSuffix: false })
    for (const candidate of seedCandidates) {
      trustedSuffixIds.add(candidate.id)
    }
  }
}

const addAggregateHit = (map, item, chunk) => {
  const current = map.get(item.id) ?? {
    id: item.id,
    label: item.label,
    mentionCount: 0,
    chunkIds: new Set(),
    workIds: new Set(),
  }
  current.mentionCount += 1
  current.chunkIds.add(chunk.chunk_id)
  current.workIds.add(chunk.work_id)
  map.set(item.id, current)
}

const ensureNode = (node) => {
  if (!graphNodes.has(node.id)) {
    graphNodes.set(node.id, node)
  }
}

const addEdge = (source, target, relation, label, chunk) => {
  const id = `${source}-${relation}-${target}`
  const current = graphEdges.get(id) ?? {
    id,
    source,
    target,
    relation,
    label,
    count: 0,
    chunkIds: new Set(),
    workIds: new Set(),
  }
  current.count += 1
  current.chunkIds.add(chunk.chunk_id)
  current.workIds.add(chunk.work_id)
  graphEdges.set(id, current)
}

for (const work of works) {
  const chunkFile = resolve(chunksDir, `${work.work_id}.jsonl`)
  let chunkText
  try {
    chunkText = await readFile(chunkFile, 'utf8')
  } catch {
    continue
  }

  for (const line of chunkText.split(/\r?\n/).filter(Boolean)) {
    const chunk = JSON.parse(line)
    const text = String(chunk.text ?? '')
    const herbCandidates = extractHerbCandidates(text, { trustedSuffixIds })
    const partHits = collectRuleMatches(text, plantParts)
    const preparationHits = collectRuleMatches(text, preparations)
    const cautionHits = collectRuleMatches(text, cautionRules)
    const conditionHits = collectRuleMatches(text, conditions)

    if (
      herbCandidates.length === 0 &&
      partHits.length === 0 &&
      preparationHits.length === 0 &&
      cautionHits.length === 0 &&
      conditionHits.length === 0
    ) {
      continue
    }

    const signalRecord = {
      chunk_id: chunk.chunk_id,
      work_id: chunk.work_id,
      title: chunk.title,
      collection_id: work.collection_id,
      topic_family: work.topic_family,
      section_heading: chunk.section_heading,
      herb_candidates: herbCandidates.map((candidate) => ({
        herb_id: candidate.id,
        name: candidate.name,
        basis: candidate.basis,
      })),
      plant_parts: partHits,
      preparations: preparationHits,
      cautions: cautionHits,
      conditions: conditionHits,
      source_url: chunk.source_url,
      excerpt: excerpt(text),
    }
    await writeChunkSignal(signalRecord)

    for (const candidate of herbCandidates) {
      const current = herbAggregates.get(candidate.id) ?? {
        id: candidate.id,
        name: candidate.name,
        normalized_name: candidate.normalized_name,
        basis: new Set(),
        mentionCount: 0,
        chunkIds: new Set(),
        workIds: new Set(),
        collections: new Set(),
        topicFamilies: new Set(),
      }
      candidate.basis.forEach((basis) => current.basis.add(basis))
      current.mentionCount += candidate.mention_count
      current.chunkIds.add(chunk.chunk_id)
      current.workIds.add(chunk.work_id)
      current.collections.add(work.collection_id)
      ;(work.topic_family ?? '')
        .split(';')
        .filter(Boolean)
        .forEach((topic) => current.topicFamilies.add(topic))
      herbAggregates.set(candidate.id, current)

      ensureNode({
        id: candidate.id,
        type: 'Herb candidate',
        label: candidate.name,
        summary: 'Corpus-derived herb candidate from source-linked passage extraction.',
      })
    }

    for (const hit of partHits) {
      addAggregateHit(plantPartAggregates, { id: hit.id, label: hit.label }, chunk)
    }

    for (const hit of preparationHits) {
      addAggregateHit(preparationAggregates, { id: hit.id, label: hit.label }, chunk)
      ensureNode({
        id: `preparation-${hit.id}`,
        type: 'Preparation',
        label: hit.label,
        summary: 'Preparation context co-mentioned in the corpus.',
      })
    }

    for (const hit of cautionHits) {
      addAggregateHit(cautionAggregates, { id: hit.id, label: hit.label }, chunk)
      ensureNode({
        id: `caution-${hit.id}`,
        type: 'Caution',
        label: hit.label,
        summary: 'Safety or caution context co-mentioned in the corpus.',
      })
    }

    for (const hit of conditionHits) {
      addAggregateHit(conditionAggregates, { id: hit.id, label: hit.label }, chunk)
      ensureNode({
        id: `condition-${hit.id}`,
        type: 'Condition',
        label: hit.label,
        summary: 'Condition or symptom context co-mentioned in the corpus.',
      })
    }

    for (const candidate of herbCandidates) {
      for (const hit of partHits) {
        ensureNode({
          id: `part-${hit.id}`,
          type: 'Plant part',
          label: hit.label,
          summary: 'Plant-part context co-mentioned in the corpus.',
        })
        addEdge(candidate.id, `part-${hit.id}`, 'HAS_PART_CONTEXT', 'Has part context', chunk)
      }

      for (const hit of preparationHits) {
        addEdge(candidate.id, `preparation-${hit.id}`, 'PREPARATION_CONTEXT', 'Preparation context', chunk)
      }

      for (const hit of cautionHits) {
        addEdge(candidate.id, `caution-${hit.id}`, 'CAUTION_CONTEXT', 'Caution context', chunk)
      }

      for (const hit of conditionHits) {
        addEdge(candidate.id, `condition-${hit.id}`, 'CONDITION_CONTEXT', 'Condition context', chunk)
      }
    }
  }
}

const herbRows = [...herbAggregates.values()]
  .map((aggregate) => ({
    herb_id: aggregate.id,
    name: aggregate.name,
    normalized_name: aggregate.normalized_name,
    confidence: '',
    basis: [...aggregate.basis].sort().join(';'),
    mention_count: aggregate.mentionCount,
    chunk_count: aggregate.chunkIds.size,
    work_count: aggregate.workIds.size,
    collections: [...aggregate.collections].sort().join(';'),
    topic_families: [...aggregate.topicFamilies].sort().join(';'),
    sample_work_ids: [...aggregate.workIds].slice(0, sampleLimit).join(';'),
    sample_chunk_ids: [...aggregate.chunkIds].slice(0, sampleLimit).join(';'),
  }))
  .map((row) => ({
    ...row,
    confidence: confidenceForHerb(row),
  }))
  .sort((left, right) => Number(right.chunk_count) - Number(left.chunk_count) || left.name.localeCompare(right.name))

const preparationRows = [...preparationAggregates.values()]
  .map(buildAggregateRow)
  .sort((left, right) => Number(right.chunk_count) - Number(left.chunk_count) || left.label.localeCompare(right.label))

const plantPartRows = [...plantPartAggregates.values()]
  .map(buildAggregateRow)
  .sort((left, right) => Number(right.chunk_count) - Number(left.chunk_count) || left.label.localeCompare(right.label))

const cautionRows = [...cautionAggregates.values()]
  .map(buildAggregateRow)
  .sort((left, right) => Number(right.chunk_count) - Number(left.chunk_count) || left.label.localeCompare(right.label))

const conditionRows = [...conditionAggregates.values()]
  .map(buildAggregateRow)
  .sort((left, right) => Number(right.chunk_count) - Number(left.chunk_count) || left.label.localeCompare(right.label))

const graph = {
  generatedAt: new Date().toISOString(),
  policy:
    'Corpus-derived co-mention graph from rights-cleared books. Condition and caution edges are context signals, not treatment claims or medical advice.',
  nodeCount: graphNodes.size,
  edgeCount: graphEdges.size,
  nodes: [...graphNodes.values()].sort((left, right) => left.type.localeCompare(right.type) || left.label.localeCompare(right.label)),
  edges: [...graphEdges.values()]
    .map((edge) => ({
      ...edge,
      chunk_count: edge.chunkIds.size,
      work_count: edge.workIds.size,
      sample_chunk_ids: [...edge.chunkIds].slice(0, sampleLimit),
      sample_work_ids: [...edge.workIds].slice(0, sampleLimit),
    }))
    .sort((left, right) => Number(right.chunk_count) - Number(left.chunk_count) || left.id.localeCompare(right.id)),
}

const summary = {
  generatedAt: graph.generatedAt,
  totalChunkedWorks: works.length,
  chunkSignalCount,
  herbCandidateCount: herbRows.length,
  highConfidenceHerbCount: herbRows.filter((row) => row.confidence === 'high').length,
  mediumConfidenceHerbCount: herbRows.filter((row) => row.confidence === 'medium').length,
  lowConfidenceHerbCount: herbRows.filter((row) => row.confidence === 'low').length,
  plantPartCount: plantPartRows.length,
  preparationCount: preparationRows.length,
  cautionCount: cautionRows.length,
  conditionCount: conditionRows.length,
  graphNodeCount: graph.nodeCount,
  graphEdgeCount: graph.edgeCount,
  topHerbs: herbRows.slice(0, 20).map((row) => ({
    herb_id: row.herb_id,
    name: row.name,
    confidence: row.confidence,
    chunk_count: Number(row.chunk_count),
    work_count: Number(row.work_count),
    basis: row.basis,
  })),
}

const readme = [
  '# Corpus Evidence',
  '',
  `Generated: ${summary.generatedAt}`,
  '',
  'This folder contains the first source-linked evidence layer derived from the local Herbalisti corpus.',
  '',
  '## What it does',
  '',
  '- extracts herb candidates from passage-level plant-part and preparation phrases',
  '- records plant-part, preparation, caution, and condition co-mentions by chunk',
  '- aggregates those signals into reviewable tables',
  '- builds a conservative co-mention graph for later retrieval work',
  '',
  '## What it does not do',
  '',
  '- it does not assert medical efficacy',
  '- it does not turn co-mentioned conditions into treatment claims',
  '- it does not replace human review for herb identity or safety interpretation',
  '',
  '## Key files',
  '',
  '- `chunk-signals.jsonl`',
  '- `herb-candidates.csv`',
  '- `plant-parts.csv`',
  '- `preparations.csv`',
  '- `cautions.csv`',
  '- `conditions.csv`',
  '- `graph.json`',
  '',
  '## Current summary',
  '',
  `- Chunk signals: ${summary.chunkSignalCount}`,
  `- Herb candidates: ${summary.herbCandidateCount}`,
  `- High-confidence herb candidates: ${summary.highConfidenceHerbCount}`,
  `- Plant-part types: ${summary.plantPartCount}`,
  `- Preparation types: ${summary.preparationCount}`,
  `- Caution types: ${summary.cautionCount}`,
  `- Condition types: ${summary.conditionCount}`,
  `- Graph nodes: ${summary.graphNodeCount}`,
  `- Graph edges: ${summary.graphEdgeCount}`,
  '',
].join('\n')

chunkSignalsStream.end()
await once(chunkSignalsStream, 'finish')
await writeCsvFile(herbCandidatesCsvPath, herbRows, herbCandidateHeaders)
await writeJson(herbCandidatesJsonPath, herbRows)
await writeCsvFile(plantPartsCsvPath, plantPartRows, aggregateHeaders)
await writeCsvFile(preparationsCsvPath, preparationRows, aggregateHeaders)
await writeCsvFile(cautionsCsvPath, cautionRows, aggregateHeaders)
await writeCsvFile(conditionsCsvPath, conditionRows, aggregateHeaders)
await writeJson(graphPath, graph)
await writeJson(summaryPath, summary)
await writeFile(readmePath, `${readme}\n`, 'utf8')

console.log(
  JSON.stringify(
    {
      summaryPath,
      chunkSignalsPath,
      herbCandidatesPath: herbCandidatesCsvPath,
      herbCandidateCount: summary.herbCandidateCount,
      chunkSignalCount: summary.chunkSignalCount,
      graphNodeCount: summary.graphNodeCount,
      graphEdgeCount: summary.graphEdgeCount,
    },
    null,
    2,
  ),
)
