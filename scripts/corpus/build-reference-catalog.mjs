import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { readCsvFile, worksRegistryPath } from './lib.mjs'

const rootDir = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const generatedDir = resolve(rootDir, 'functions/_generated')
const outputPath = resolve(generatedDir, 'reference-catalog.js')

const allowedRights = new Set(['cc-by', 'pdm', 'public_domain_mark', 'public_domain_us'])
const validRightsLanes = new Set(['US', 'UK', 'Australia'])

const collectionLabels = {
  'nlm-digital-collections': 'National Library of Medicine',
  'project-gutenberg': 'Project Gutenberg',
  'wellcome-collection': 'Wellcome Collection',
}

const collectionRightsLanes = {
  'nlm-digital-collections': 'US',
  'project-gutenberg': 'US',
  'wellcome-collection': 'UK',
}

const rightsLabels = {
  'cc-by': 'CC BY',
  pdm: 'Public Domain Mark',
  public_domain_mark: 'Public Domain Mark 1.0',
  public_domain_us: 'Public domain in the United States',
}

const normalizeWhitespace = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

const splitList = (value) =>
  normalizeWhitespace(value)
    .replace(/;/g, ',')
    .split(/\s*,\s*/)
    .map((item) => normalizeWhitespace(item))
    .filter(Boolean)

const uniqueList = (values) => [...new Set(values.filter(Boolean))]

const humanizeSlug = (value) =>
  normalizeWhitespace(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())

const collectionLabel = (value) => collectionLabels[value] ?? humanizeSlug(value || 'Historical archive')
const rightsLabel = (value) => rightsLabels[value] ?? 'Permissively reusable source'
const normalizeRightsLane = (value) => {
  const normalized = normalizeWhitespace(value)
  return validRightsLanes.has(normalized) ? normalized : ''
}

const normalizeCreator = (value) => {
  const normalized = normalizeWhitespace(value)
    .replace(/\b(author|editor|compiler|translator)\.?$/i, '')
    .replace(/[;,]+$/g, '')
    .trim()

  return normalized || 'Unknown'
}

const resolveRightsLane = (row) => normalizeRightsLane(row.jurisdiction_lane) || collectionRightsLanes[row.collection_id] || ''

const buildSearchRegions = (row, rightsLane) => {
  const regions = []

  if (rightsLane) {
    regions.push(rightsLane)
  }

  const geographyText = [row.title, row.creator, row.topic_family, row.source_url, row.metadata_url]
    .filter(Boolean)
    .join(' ')

  if (/\baustralia|australian\b/i.test(geographyText)) {
    regions.push('Australia')
  }

  return uniqueList(regions)
}

const modeForTopicFamilies = (families) => {
  const familySet = new Set(families)

  if (
    familySet.has('herbal') ||
    familySet.has('materia-medica') ||
    familySet.has('medicinal-plants') ||
    familySet.has('medical-botany') ||
    familySet.has('botanic-medicine') ||
    familySet.has('pharmacopoeia')
  ) {
    return 'Materia medica'
  }

  if (familySet.has('hygiene') || familySet.has('public-health') || familySet.has('nursing') || familySet.has('dietetics')) {
    return 'Safety'
  }

  if (familySet.has('culinary-herbs') || familySet.has('cultivation')) {
    return 'Making'
  }

  return 'Reference'
}

const buildRole = (families, sourceCollection) => {
  const topicLabel =
    families.length > 0
      ? families
          .slice(0, 3)
          .map((family) => humanizeSlug(family).toLowerCase())
          .join(', ')
      : 'historical health and wellbeing'

  return `Rights-cleared historical source from ${collectionLabel(sourceCollection)} indexed for ${topicLabel} retrieval and comparison.`
}

const buildNotes = (row, families, rightsLane) => {
  const topics =
    families.length > 0
      ? `Topic families: ${families.map((family) => humanizeSlug(family)).join(', ')}.`
      : 'Topic family review remains open.'
  const lane = rightsLane ? ` Rights lane: ${rightsLane}.` : ''

  return normalizeWhitespace(
    `Collected into the local Herbalisti corpus from ${collectionLabel(row.collection_id)}. ${topics}${lane} Retrieval uses local normalized text and chunk indexes rather than copied display text.`,
  )
}

const buildTags = (row, families, rightsLane) =>
  uniqueList([
    ...families.map((family) => humanizeSlug(family).toLowerCase()),
    rightsLane ? `${String(rightsLane).toLowerCase()} rights lane` : '',
    collectionLabel(row.collection_id).toLowerCase(),
    'historical corpus',
  ])

const buildCorpusRecord = (row) => {
  const topicFamilies = splitList(row.topic_family)
  const rightsLane = resolveRightsLane(row)
  const searchRegions = buildSearchRegions(row, rightsLane)

  return {
    id: row.work_id,
    title: normalizeWhitespace(row.title),
    authors: [normalizeCreator(row.creator)],
    mode: modeForTopicFamilies(topicFamilies),
    role: buildRole(topicFamilies, row.collection_id),
    tags: buildTags(row, topicFamilies, rightsLane),
    status: `${rightsLabel(row.rights_status)} source archived and indexed locally`,
    notes: buildNotes(row, topicFamilies, rightsLane),
    sourceStatus: row.rights_status,
    rightsLane: rightsLane || undefined,
    searchRegions,
    publisher: collectionLabel(row.collection_id),
    publicationDate: normalizeWhitespace(row.publication_year) || undefined,
    externalUrl: normalizeWhitespace(row.source_url || row.metadata_url) || undefined,
    verificationSource: `${collectionLabel(row.collection_id)} catalogue`,
    citationNote: `Rights: ${rightsLabel(row.rights_status)}. Local ingest: ${humanizeSlug(row.ingest_status)}. Review: ${humanizeSlug(row.review_status)}.`,
  }
}

const rows = await readCsvFile(worksRegistryPath)

const corpusReferenceBooks = rows
  .filter((row) => row.ingest_status === 'chunked' && allowedRights.has(normalizeWhitespace(row.rights_status)))
  .map(buildCorpusRecord)
  .sort(
    (left, right) =>
      left.title.localeCompare(right.title, 'en', { sensitivity: 'base' }) ||
      String(left.publicationDate ?? '').localeCompare(String(right.publicationDate ?? '')),
  )

const corpusReferenceCatalogStats = {
  totalRecords: corpusReferenceBooks.length,
  collections: corpusReferenceBooks.reduce((summary, record) => {
    summary[record.publisher] = (summary[record.publisher] ?? 0) + 1
    return summary
  }, {}),
  modes: corpusReferenceBooks.reduce((summary, record) => {
    summary[record.mode] = (summary[record.mode] ?? 0) + 1
    return summary
  }, {}),
}

await mkdir(generatedDir, { recursive: true })
await writeFile(
  outputPath,
  `// Generated by scripts/corpus/build-reference-catalog.mjs. Do not edit by hand.\n` +
    `export const corpusReferenceBooks = ${JSON.stringify(corpusReferenceBooks, null, 2)}\n\n` +
    `export const corpusReferenceCatalogStats = ${JSON.stringify(corpusReferenceCatalogStats, null, 2)}\n`,
  'utf8',
)

console.log(
  JSON.stringify(
    {
      status: 'pass',
      outputPath,
      totalRecords: corpusReferenceBooks.length,
      collections: corpusReferenceCatalogStats.collections,
      modes: corpusReferenceCatalogStats.modes,
    },
    null,
    2,
  ),
)
