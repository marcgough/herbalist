import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { corpusDir, exportsDir, loadWorksRegistry, readCsvFile, worksDir, writeCsvFile, writeJson } from './lib.mjs'

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, rawValue = 'true'] = argument.replace(/^--/, '').split('=')
    return [key, rawValue]
  }),
)

const thinChunkLimit = Math.max(1, Number(args.get('thin-chunk-limit') ?? 120) || 120)
const thinParagraphLimit = Math.max(1, Number(args.get('thin-paragraph-limit') ?? 160) || 160)
const severeChunkLimit = Math.max(1, Number(args.get('severe-chunk-limit') ?? 40) || 40)
const severeParagraphLimit = Math.max(1, Number(args.get('severe-paragraph-limit') ?? 50) || 50)
const microChunkLimit = Math.max(1, Number(args.get('micro-chunk-limit') ?? 12) || 12)
const microParagraphLimit = Math.max(1, Number(args.get('micro-paragraph-limit') ?? 16) || 16)

const reviewDir = resolve(corpusDir, 'review')
const thinWorkReviewDir = resolve(reviewDir, 'thin-work-review')
const editionFamiliesDir = resolve(corpusDir, 'derived', 'edition-families')
const familiesPath = resolve(editionFamiliesDir, 'families.csv')
const membershipsPath = resolve(editionFamiliesDir, 'memberships.csv')
const candidatesCsvPath = resolve(thinWorkReviewDir, 'candidates.csv')
const readmePath = resolve(thinWorkReviewDir, 'README.md')
const summaryPath = resolve(exportsDir, 'thin-work-review-summary.json')

const candidateHeaders = [
  'work_id',
  'title',
  'collection_id',
  'topic_family',
  'source_mode',
  'chunk_count',
  'paragraph_count',
  'section_count',
  'thin_band',
  'review_class',
  'recommended_action',
  'heuristic_score',
  'family_id',
  'family_label',
  'family_work_count',
  'family_chunked_count',
  'member_role',
  'reference_signals',
  'fragment_signals',
  'heuristic_reasons',
  'manifest_path',
]

const referenceSignals = [
  { label: 'herbal', pattern: /\bherbal\b/i },
  { label: 'flora', pattern: /\bflora\b/i },
  { label: 'botany', pattern: /\bbotany\b|\bbotanical\b/i },
  { label: 'medicinal-plants', pattern: /\bmedicinal plants?\b/i },
  { label: 'materia-medica', pattern: /\bmateria medica\b/i },
  { label: 'pharmacopoeia', pattern: /\bpharmacop(?:oe)?ia\b/i },
  { label: 'dispensatory', pattern: /\bdispensatory\b/i },
  { label: 'dictionary', pattern: /\bdictionary\b|\blexicon\b|\bglossary\b/i },
  { label: 'manual', pattern: /\bmanual\b|\bhand-?book\b|\bguide\b/i },
  { label: 'conspectus', pattern: /\bconspectus\b|\bformulary\b|\bcyclopaedia\b|\bencyclop/i },
]

const fragmentSignals = [
  { label: 'additions', pattern: /\badditions? to\b/i },
  { label: 'appendix', pattern: /\bappendix\b/i },
  { label: 'supplement', pattern: /\bsupplement\b/i },
  { label: 'report', pattern: /\breport on\b|\breports?\b/i },
  { label: 'note', pattern: /\bnote on\b|\bnotes on\b/i },
  { label: 'remarks', pattern: /\bremarks? on\b/i },
  { label: 'address', pattern: /\baddress\b/i },
  { label: 'lecture', pattern: /\blecture\b/i },
  { label: 'proceedings', pattern: /\bproceedings of\b|\btransactions of\b/i },
  { label: 'extract', pattern: /\bextracted from\b|\bextract\b/i },
  { label: 'experiments', pattern: /\bexperiments? and observations?\b/i },
  { label: 'companion', pattern: /\bcompanion to\b/i },
]

const normalizeTitle = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

const detectSignals = (title, signals) =>
  signals.filter((signal) => signal.pattern.test(title)).map((signal) => signal.label)

const works = await loadWorksRegistry()
const chunkedWorks = works.filter((work) => work.ingest_status === 'chunked')

let familyRows = []
let membershipRows = []
try {
  familyRows = await readCsvFile(familiesPath)
} catch {
  familyRows = []
}
try {
  membershipRows = await readCsvFile(membershipsPath)
} catch {
  membershipRows = []
}

const familiesById = new Map(familyRows.map((row) => [row.family_id, row]))
const membershipByWorkId = new Map(membershipRows.map((row) => [row.work_id, row]))

await mkdir(thinWorkReviewDir, { recursive: true })

const candidates = []
const skipped = []

for (const work of chunkedWorks) {
  const manifestPath = resolve(worksDir, work.work_id, 'manifest.json')
  let manifest
  try {
    manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  } catch {
    skipped.push({
      work_id: work.work_id,
      reason: 'missing_manifest',
    })
    continue
  }

  const title = normalizeTitle(work.title || manifest.title)
  const chunkCount = Number(manifest.chunkCount ?? 0)
  const paragraphCount = Number(manifest.paragraphCount ?? 0)
  const sectionCount = Number(manifest.sectionCount ?? 0)
  const sourceMode = String(manifest.sourceMode ?? '')
  const membership = membershipByWorkId.get(work.work_id) ?? null
  const family = membership ? familiesById.get(membership.family_id) ?? null : null

  const referenceMatches = detectSignals(title, referenceSignals)
  const fragmentMatches = detectSignals(title, fragmentSignals)
  const inMultiWorkFamily = Number(family?.work_count ?? 0) > 1
  const isMicro = chunkCount <= microChunkLimit || paragraphCount <= microParagraphLimit
  const isSevereThin = chunkCount <= severeChunkLimit || paragraphCount <= severeParagraphLimit
  const isThin = chunkCount <= thinChunkLimit || paragraphCount <= thinParagraphLimit
  const isSingleSection = sectionCount <= 1

  let heuristicScore = 0
  const reasons = []

  if (isMicro) {
    heuristicScore += 180
    reasons.push('micro-length')
  } else if (isSevereThin) {
    heuristicScore += 110
    reasons.push('severe-thin-length')
  } else if (isThin) {
    heuristicScore += 50
    reasons.push('thin-length')
  }

  if (isSingleSection) {
    heuristicScore += 18
    reasons.push('single-section-shape')
  }

  if (fragmentMatches.length > 0) {
    heuristicScore += fragmentMatches.length * 26
    reasons.push(`fragment-shaped-title:${fragmentMatches.join('|')}`)
  }

  if (inMultiWorkFamily) {
    heuristicScore += 12
    reasons.push('multi-work-family')
  }

  if (referenceMatches.length > 0) {
    heuristicScore -= Math.min(36, 10 + referenceMatches.length * 4)
    reasons.push(`reference-shaped-title:${referenceMatches.join('|')}`)
  }

  if (sourceMode === 'wellcome_pdf_local_ocr') {
    heuristicScore -= 10
    reasons.push('recovered-by-pdf-ocr')
  }

  const shouldFlag =
    isMicro ||
    isSevereThin ||
    (isThin && fragmentMatches.length > 0) ||
    (isThin && inMultiWorkFamily) ||
    (isThin && isSingleSection && referenceMatches.length === 0)

  if (!shouldFlag) {
    continue
  }

  let thinBand = 'thin'
  if (isMicro) {
    thinBand = 'micro'
  } else if (isSevereThin) {
    thinBand = 'severe-thin'
  }

  let reviewClass = 'thin-general'
  if (isMicro && fragmentMatches.length > 0) {
    reviewClass = 'micro-fragment'
  } else if (isSevereThin && fragmentMatches.length > 0) {
    reviewClass = 'severe-thin-fragment'
  } else if (isSevereThin && referenceMatches.length > 0) {
    reviewClass = 'severe-thin-reference'
  } else if (isThin && fragmentMatches.length > 0) {
    reviewClass = 'thin-fragment'
  } else if (isThin && referenceMatches.length > 0) {
    reviewClass = 'thin-reference'
  }

  let recommendedAction = 'manual-review'
  if (fragmentMatches.length > 0 && inMultiWorkFamily) {
    recommendedAction = 'review-family-supplement-weight'
  } else if (referenceMatches.length > 0) {
    recommendedAction = 'keep-but-review-retrieval-weight'
  } else if (isMicro || isSevereThin) {
    recommendedAction = 'review-for-quarantine-or-lower-weight'
  }

  candidates.push({
    work_id: work.work_id,
    title,
    collection_id: work.collection_id,
    topic_family: work.topic_family,
    source_mode: sourceMode,
    chunk_count: chunkCount,
    paragraph_count: paragraphCount,
    section_count: sectionCount,
    thin_band: thinBand,
    review_class: reviewClass,
    recommended_action: recommendedAction,
    heuristic_score: heuristicScore,
    family_id: membership?.family_id ?? '',
    family_label: family?.family_label ?? '',
    family_work_count: Number(family?.work_count ?? 0),
    family_chunked_count: Number(family?.chunked_count ?? 0),
    member_role: membership?.member_role ?? '',
    reference_signals: referenceMatches.join(';'),
    fragment_signals: fragmentMatches.join(';'),
    heuristic_reasons: reasons.join(';'),
    manifest_path: manifestPath,
  })
}

candidates.sort((left, right) => {
  if (right.heuristic_score !== left.heuristic_score) {
    return right.heuristic_score - left.heuristic_score
  }
  if (left.chunk_count !== right.chunk_count) {
    return left.chunk_count - right.chunk_count
  }
  return left.work_id.localeCompare(right.work_id)
})

const classCounts = candidates.reduce((counts, row) => {
  counts[row.review_class] = (counts[row.review_class] ?? 0) + 1
  return counts
}, {})

const collectionCounts = candidates.reduce((counts, row) => {
  counts[row.collection_id] = (counts[row.collection_id] ?? 0) + 1
  return counts
}, {})

const result = {
  generatedAt: new Date().toISOString(),
  thresholds: {
    thinChunkLimit,
    thinParagraphLimit,
    severeChunkLimit,
    severeParagraphLimit,
    microChunkLimit,
    microParagraphLimit,
  },
  totalChunkedWorks: chunkedWorks.length,
  manifestBackedWorks: chunkedWorks.length - skipped.length,
  flaggedCount: candidates.length,
  severeThinCount: candidates.filter((row) => row.thin_band === 'micro' || row.thin_band === 'severe-thin').length,
  fragmentFlagCount: candidates.filter((row) => row.fragment_signals).length,
  referenceFlagCount: candidates.filter((row) => row.reference_signals).length,
  multiWorkFamilyFlagCount: candidates.filter((row) => Number(row.family_work_count) > 1).length,
  collectionCounts,
  classCounts,
  topCandidates: candidates.slice(0, 25).map((row) => ({
    work_id: row.work_id,
    title: row.title,
    collection_id: row.collection_id,
    chunk_count: row.chunk_count,
    paragraph_count: row.paragraph_count,
    review_class: row.review_class,
    recommended_action: row.recommended_action,
    heuristic_score: row.heuristic_score,
  })),
  outputPaths: {
    candidatesCsvPath,
    summaryPath,
    readmePath,
  },
}

await writeCsvFile(candidatesCsvPath, candidates, candidateHeaders)
await writeJson(summaryPath, result)
await writeFile(
  readmePath,
  `# Thin-work review layer

This folder flags chunked works that are short or fragment-shaped enough to warrant a manual review before they influence later retrieval weighting, public search defaults, or edition-family promotion.

The heuristic does not auto-remove anything from the archive.

It is designed to surface:

- very short pharmacopoeia addenda
- report, note, lecture, appendix, or supplement shaped witnesses
- thin one-section items inside larger repeated title families
- small reference works that may still be valid but should be weighted deliberately

Current thresholds:

- micro: <= ${microChunkLimit} chunks or <= ${microParagraphLimit} paragraphs
- severe-thin: <= ${severeChunkLimit} chunks or <= ${severeParagraphLimit} paragraphs
- thin: <= ${thinChunkLimit} chunks or <= ${thinParagraphLimit} paragraphs

Primary outputs:

- \`candidates.csv\`
- \`../../exports/thin-work-review-summary.json\`

Review classes are advisory:

- \`micro-fragment\`
- \`severe-thin-fragment\`
- \`severe-thin-reference\`
- \`thin-fragment\`
- \`thin-reference\`
- \`thin-general\`
`,
  'utf8',
)

console.log(JSON.stringify(result, null, 2))
