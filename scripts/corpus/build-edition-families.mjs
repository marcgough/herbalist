import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  derivedDir,
  ensureCorpusDirectories,
  exportsDir,
  loadWorksRegistry,
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

const minFamilySize = Number(args.get('min-family-size') ?? 1)
const limit = Number(args.get('limit') ?? Number.POSITIVE_INFINITY)

const editionFamiliesDir = resolve(derivedDir, 'edition-families')
const familiesCsvPath = resolve(editionFamiliesDir, 'families.csv')
const membershipsCsvPath = resolve(editionFamiliesDir, 'memberships.csv')
const familiesJsonPath = resolve(editionFamiliesDir, 'families.json')
const readmePath = resolve(editionFamiliesDir, 'README.md')
const summaryPath = resolve(exportsDir, 'edition-family-summary.json')

const statusWeight = {
  chunked: 3,
  discovered: 2,
  download_failed: 1,
}

const weakTitleTokens = new Set(['the', 'a', 'an', 'of', 'and', 'or', 'to', 'for', 'on', 'with', 'by', 'in', 'at'])

const familyHeaders = [
  'family_id',
  'family_slug',
  'family_title_key',
  'family_label',
  'canonical_work_id',
  'canonical_title',
  'canonical_creator',
  'creator_key',
  'creator_display',
  'creator_variants',
  'clustering_confidence',
  'clustering_basis',
  'work_count',
  'chunked_count',
  'discovered_count',
  'failed_count',
  'volume_like_count',
  'publication_year_min',
  'publication_year_max',
  'collection_ids',
  'jurisdiction_lanes',
  'topic_family',
]

const membershipHeaders = [
  'family_id',
  'work_id',
  'canonical_work_id',
  'member_role',
  'ingest_status',
  'collection_id',
  'publication_year',
  'volume_like',
  'creator_key',
  'family_title_key',
  'exact_title_key',
  'clustering_basis',
  'title',
]

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

const extractFamilyTitleLabel = (title) => {
  let working = stripTrailingByline(stripVolumeMarkers(normalizeWhitespace(title)))
  const orMatch = working.match(/^(.*?)(?:\s*[,;:]?\s+or\s+,?\s+.+)$/i)
  if (orMatch && orMatch[1].trim().split(/\s+/).length >= 2) {
    working = orMatch[1].trim()
  }

  const colonIndex = working.indexOf(' : ')
  if (colonIndex > 0) {
    working = working.slice(0, colonIndex)
  }

  const semicolonIndex = working.indexOf(' ; ')
  if (semicolonIndex > 0 && semicolonIndex < 140) {
    working = working.slice(0, semicolonIndex)
  }

  return normalizeWhitespace(working)
}

const extractFamilyTitleKey = (title) => normalizeTitleKey(extractFamilyTitleLabel(title))

const extractExactTitleKey = (title) => normalizeTitleKey(stripTrailingByline(stripVolumeMarkers(title)))

const extractCreatorKey = (creator) => {
  const normalized = normalizeWhitespace(creator)
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b(author|editor|edited|translator|translated|compiler|compiled)\b/g, ' ')
    .replace(/[.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!normalized) {
    return ''
  }

  if (normalized.includes(',')) {
    const parts = normalized
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
    const surname = parts[0] ?? ''
    const initials = parts
      .slice(1)
      .join(' ')
      .split(/\s+/)
      .filter((value) => value && !/^\d+$/.test(value) && !/^(jr|sr)$/.test(value))
      .map((value) => value[0])
      .slice(0, 3)
      .join('')
    return slugify(`${surname}-${initials || 'anon'}`)
  }

  const tokens = normalized
    .split(/\s+/)
    .filter((value) => value && !/^\d+$/.test(value) && !/^(jr|sr)$/.test(value))
  if (tokens.length === 0) {
    return ''
  }
  if (tokens.length === 1) {
    return slugify(tokens[0])
  }

  const surname = tokens.at(-1)
  const initials = tokens
    .slice(0, -1)
    .map((value) => value[0])
    .slice(0, 3)
    .join('')
  return slugify(`${surname}-${initials || 'anon'}`)
}

const isVolumeLikeTitle = (title) =>
  /(?:\(|\b)(?:volume|vol(?:ume)?|part|copy|tome|band|book)\.?\s*[ivxlcdm0-9-]+/i.test(title) ||
  /\bv\.\s*[ivxlcdm0-9-]+\b/i.test(title)

const normalizeYear = (value) => {
  const year = Number.parseInt(String(value ?? ''), 10)
  return Number.isFinite(year) ? year : null
}

const buildTitleTokenSet = (value) =>
  new Set(
    String(value ?? '')
      .split(/\s+/)
      .filter((token) => token && token.length > 2 && !weakTitleTokens.has(token)),
  )

const titleSimilarity = (left, right) => {
  const leftTokens = buildTitleTokenSet(left)
  const rightTokens = buildTitleTokenSet(right)
  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0
  }

  let intersection = 0
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersection += 1
    }
  }

  const overlap = intersection / Math.max(Math.min(leftTokens.size, rightTokens.size), 1)
  const containment =
    left.includes(right) || right.includes(left)
      ? Math.min(left.length, right.length) / Math.max(left.length, right.length)
      : 0
  return Math.max(overlap, containment)
}

const chooseCanonicalMember = (members) =>
  [...members].sort((left, right) => {
    const statusDelta = (statusWeight[right.ingest_status] ?? 0) - (statusWeight[left.ingest_status] ?? 0)
    if (statusDelta !== 0) return statusDelta

    const volumeDelta = Number(left.volumeLike) - Number(right.volumeLike)
    if (volumeDelta !== 0) return volumeDelta

    const creatorDelta = Number(Boolean(right.creator)) - Number(Boolean(left.creator))
    if (creatorDelta !== 0) return creatorDelta

    const leftYear = left.publicationYear ?? Number.POSITIVE_INFINITY
    const rightYear = right.publicationYear ?? Number.POSITIVE_INFINITY
    if (leftYear !== rightYear) return leftYear - rightYear

    const titleLengthDelta = left.title.length - right.title.length
    if (titleLengthDelta !== 0) return titleLengthDelta

    return left.work_id.localeCompare(right.work_id)
  })[0]

const buildFamilyId = (familyTitleKey, creatorKey, members) => {
  const seed = `${familyTitleKey}|${creatorKey || 'unknown'}|${members.map((member) => member.work_id).sort().join('|')}`
  const hash = sha256(seed).slice(0, 10)
  return `family-${slugify(`${familyTitleKey}-${creatorKey || 'unknown'}`).slice(0, 48)}-${hash}`
}

const buildFamilyRecord = (members, creatorKey, confidence, basis) => {
  const canonical = chooseCanonicalMember(members)
  const titleLabel = extractFamilyTitleLabel(canonical.title) || canonical.title
  const familyTitleKey = canonical.familyTitleKey
  const familyId = buildFamilyId(familyTitleKey, creatorKey, members)
  const collectionIds = [...new Set(members.map((member) => member.collection_id).filter(Boolean))].sort()
  const jurisdictions = [...new Set(members.map((member) => member.jurisdiction_lane).filter(Boolean))].sort()
  const creators = [...new Set(members.map((member) => member.creator).filter(Boolean))].sort()
  const topicCounts = {}
  const years = members.map((member) => member.publicationYear).filter((value) => value != null)

  for (const member of members) {
    for (const topic of (member.topic_family ?? '').split(';').filter(Boolean)) {
      topicCounts[topic] = (topicCounts[topic] ?? 0) + 1
    }
  }

  return {
    family_id: familyId,
    family_slug: familyId.replace(/^family-/, ''),
    family_title_key: familyTitleKey,
    family_label: titleLabel,
    canonical_work_id: canonical.work_id,
    canonical_title: canonical.title,
    canonical_creator: canonical.creator,
    creator_key: creatorKey,
    creator_display: canonical.creator || creators[0] || 'Unknown',
    creator_variants: creators.join(' | '),
    clustering_confidence: confidence,
    clustering_basis: basis,
    work_count: members.length,
    chunked_count: members.filter((member) => member.ingest_status === 'chunked').length,
    discovered_count: members.filter((member) => member.ingest_status === 'discovered').length,
    failed_count: members.filter((member) => member.ingest_status === 'download_failed').length,
    volume_like_count: members.filter((member) => member.volumeLike).length,
    publication_year_min: years.length > 0 ? Math.min(...years) : '',
    publication_year_max: years.length > 0 ? Math.max(...years) : '',
    collection_ids: collectionIds.join(';'),
    jurisdiction_lanes: jurisdictions.join(';'),
    topic_family: Object.entries(topicCounts)
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, 6)
      .map(([topic]) => topic)
      .join(';'),
  }
}

await ensureCorpusDirectories()
await mkdir(editionFamiliesDir, { recursive: true })

const works = (await loadWorksRegistry())
  .slice(0, Number.isFinite(limit) ? limit : Number.MAX_SAFE_INTEGER)
  .map((work) => ({
    ...work,
    familyTitleKey: extractFamilyTitleKey(work.title),
    exactTitleKey: extractExactTitleKey(work.title),
    creatorKey: extractCreatorKey(work.creator),
    publicationYear: normalizeYear(work.publication_year),
    volumeLike: isVolumeLikeTitle(work.title),
  }))
  .filter((work) => work.familyTitleKey)

const byFamilyTitle = new Map()
for (const work of works) {
  const bucket = byFamilyTitle.get(work.familyTitleKey) ?? []
  bucket.push(work)
  byFamilyTitle.set(work.familyTitleKey, bucket)
}

const families = []
const memberships = []

for (const [familyTitleKey, titleBucket] of byFamilyTitle.entries()) {
  const creatorBuckets = new Map()
  const anonymousRows = []

  for (const row of titleBucket) {
    if (row.creatorKey) {
      const bucket = creatorBuckets.get(row.creatorKey) ?? []
      bucket.push(row)
      creatorBuckets.set(row.creatorKey, bucket)
    } else {
      anonymousRows.push(row)
    }
  }

  const anonymousExactBuckets = new Map()

  // Assign unattributed rows to a unique matching creator family where the evidence is strong enough.
  for (const row of anonymousRows) {
    const exactMatches = [...creatorBuckets.entries()].filter(([, bucket]) =>
      bucket.some((member) => member.exactTitleKey === row.exactTitleKey),
    )

    if (
      creatorBuckets.size === 1 &&
      [...creatorBuckets.values()][0].some((member) => titleSimilarity(member.exactTitleKey, row.exactTitleKey) >= 0.72)
    ) {
      const [onlyCreatorKey, bucket] = [...creatorBuckets.entries()][0]
      bucket.push(row)
      creatorBuckets.set(onlyCreatorKey, bucket)
      row.assignmentBasis = 'single_creator_fallback'
      continue
    }

    if (exactMatches.length === 1) {
      const [matchedCreatorKey, bucket] = exactMatches[0]
      bucket.push(row)
      creatorBuckets.set(matchedCreatorKey, bucket)
      row.assignmentBasis = 'exact_title_fallback'
      continue
    }

    const fallbackKey = row.exactTitleKey || `${familyTitleKey}-${slugify(row.work_id)}`
    const fallbackBucket = anonymousExactBuckets.get(fallbackKey) ?? []
    fallbackBucket.push(row)
    anonymousExactBuckets.set(fallbackKey, fallbackBucket)
  }

  for (const [creatorKey, bucket] of creatorBuckets.entries()) {
    const basisCandidates = new Set(bucket.map((member) => member.assignmentBasis).filter(Boolean))
    const basis = basisCandidates.size > 0 ? [...basisCandidates].sort().join('+') : 'creator_title_match'
    const confidence =
      basis === 'creator_title_match'
        ? 'high'
        : basis === 'single_creator_fallback' || basis === 'exact_title_fallback'
          ? 'medium'
          : 'low'

    const family = buildFamilyRecord(bucket, creatorKey, confidence, basis)
    families.push(family)

    for (const member of bucket) {
      const memberRole =
        member.work_id === family.canonical_work_id
          ? 'canonical'
          : member.volumeLike
            ? 'volume'
            : member.exactTitleKey === extractExactTitleKey(family.canonical_title)
              ? 'copy'
              : 'edition'
      memberships.push({
        family_id: family.family_id,
        work_id: member.work_id,
        canonical_work_id: family.canonical_work_id,
        member_role: memberRole,
        ingest_status: member.ingest_status,
        collection_id: member.collection_id,
        publication_year: member.publication_year,
        volume_like: member.volumeLike ? 'yes' : 'no',
        creator_key: creatorKey,
        family_title_key: familyTitleKey,
        exact_title_key: member.exactTitleKey,
        clustering_basis: member.assignmentBasis || basis,
        title: member.title,
      })
    }
  }

  for (const [anonymousKey, bucket] of anonymousExactBuckets.entries()) {
    const family = buildFamilyRecord(bucket, '', creatorBuckets.size === 0 ? 'medium' : 'low', 'anonymous_exact_title')
    families.push(family)

    for (const member of bucket) {
      memberships.push({
        family_id: family.family_id,
        work_id: member.work_id,
        canonical_work_id: family.canonical_work_id,
        member_role: member.work_id === family.canonical_work_id ? 'canonical' : member.volumeLike ? 'volume' : 'copy',
        ingest_status: member.ingest_status,
        collection_id: member.collection_id,
        publication_year: member.publication_year,
        volume_like: member.volumeLike ? 'yes' : 'no',
        creator_key: '',
        family_title_key: familyTitleKey,
        exact_title_key: anonymousKey,
        clustering_basis: 'anonymous_exact_title',
        title: member.title,
      })
    }
  }
}

const filteredFamilies = families
  .filter((family) => Number(family.work_count) >= minFamilySize)
  .sort((left, right) => Number(right.work_count) - Number(left.work_count) || left.family_label.localeCompare(right.family_label))

const allowedFamilyIds = new Set(filteredFamilies.map((family) => family.family_id))
const filteredMemberships = memberships
  .filter((membership) => allowedFamilyIds.has(membership.family_id))
  .sort((left, right) => left.family_id.localeCompare(right.family_id) || left.work_id.localeCompare(right.work_id))

const summary = {
  generatedAt: new Date().toISOString(),
  totalWorksConsidered: works.length,
  familyCount: filteredFamilies.length,
  multiWorkFamilyCount: filteredFamilies.filter((family) => Number(family.work_count) > 1).length,
  highConfidenceFamilyCount: filteredFamilies.filter((family) => family.clustering_confidence === 'high').length,
  mediumConfidenceFamilyCount: filteredFamilies.filter((family) => family.clustering_confidence === 'medium').length,
  lowConfidenceFamilyCount: filteredFamilies.filter((family) => family.clustering_confidence === 'low').length,
  memberCount: filteredMemberships.length,
  topFamilies: filteredFamilies.slice(0, 20).map((family) => ({
    family_id: family.family_id,
    family_label: family.family_label,
    canonical_work_id: family.canonical_work_id,
    work_count: Number(family.work_count),
    collection_ids: family.collection_ids,
    clustering_confidence: family.clustering_confidence,
  })),
}

await writeCsvFile(familiesCsvPath, filteredFamilies, familyHeaders)
await writeCsvFile(membershipsCsvPath, filteredMemberships, membershipHeaders)
await writeJson(familiesJsonPath, filteredFamilies)
await writeJson(summaryPath, summary)

const readme = [
  '# Edition Families',
  '',
  `Generated: ${summary.generatedAt}`,
  '',
  'This folder groups likely editions, volumes, copies, and cross-collection variants of the same bibliographic work.',
  '',
  '## Current summary',
  '',
  `- Families: ${summary.familyCount}`,
  `- Multi-work families: ${summary.multiWorkFamilyCount}`,
  `- High-confidence families: ${summary.highConfidenceFamilyCount}`,
  `- Medium-confidence families: ${summary.mediumConfidenceFamilyCount}`,
  `- Low-confidence families: ${summary.lowConfidenceFamilyCount}`,
  '',
  '## Key files',
  '',
  '- `families.csv`',
  '- `memberships.csv`',
  '- `families.json`',
  '',
  '## Largest current families',
  '',
  ...summary.topFamilies.slice(0, 12).map(
    (family) =>
      `- \`${family.family_id}\` - ${family.family_label} (${family.work_count} works; ${family.collection_ids}; ${family.clustering_confidence})`,
  ),
  '',
  '## Notes',
  '',
  '- The current family logic clusters by normalized title family plus creator signature.',
  '- Unattributed records are only merged into an attributed family when there is a single clear creator family or a unique exact-title match.',
  '- These families are a bibliographic organization layer, not a claim that all grouped editions are text-identical.',
  '',
].join('\n')

await writeFile(readmePath, `${readme}\n`, 'utf8')

console.log(
  JSON.stringify(
    {
      summaryPath,
      familiesPath: familiesCsvPath,
      membershipsPath: membershipsCsvPath,
      familyCount: summary.familyCount,
      multiWorkFamilyCount: summary.multiWorkFamilyCount,
      highConfidenceFamilyCount: summary.highConfidenceFamilyCount,
    },
    null,
    2,
  ),
)
