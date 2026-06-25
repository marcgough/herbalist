import { createReadStream } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import readline from 'node:readline'
import { derivedDir, loadWorksRegistry, readCsvFile, worksDir } from '../corpus/lib.mjs'
import { closeCorpusMemoryDatabase, openCorpusMemoryDatabase, pruneDocumentsByKind, upsertDocuments } from './lib.mjs'

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, ...rest] = argument.replace(/^--/, '').split('=')
    return [key, rest.join('=')]
  }),
)

const scopes = new Set(
  String(args.get('scope') ?? 'profiles,works,families')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
)
const batchSize = Math.max(1, Number(args.get('batch-size') ?? 200) || 200)
const limit = Number(args.get('limit') ?? Number.POSITIVE_INFINITY)
const includeDiscovered = String(args.get('include-discovered') ?? 'false') === 'true'

const herbProfilesPath = resolve(derivedDir, 'herb-profiles', 'profile-documents.jsonl')
const editionFamiliesDir = resolve(derivedDir, 'edition-families')
const editionFamiliesCsvPath = resolve(editionFamiliesDir, 'families.csv')
const editionFamilyMembershipsCsvPath = resolve(editionFamiliesDir, 'memberships.csv')

const normalizeWhitespace = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()
const splitValues = (value) =>
  String(value ?? '')
    .split(/[;,]/)
    .map((item) => normalizeWhitespace(item))
    .filter(Boolean)
const numberOrNull = (value) => {
  const parsed = Number(String(value ?? '').replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : null
}
const toInteger = (value) => {
  const parsed = numberOrNull(value)
  return Number.isFinite(parsed) ? parsed : 0
}
const listPhrase = (items, limit = 4) => [...new Set((items ?? []).filter(Boolean))].slice(0, limit).join(', ')

const extractNotesSection = (markdown) => {
  const match = String(markdown ?? '').match(/## Notes\s+([\s\S]*?)(?:\n## |\s*$)/)
  return normalizeWhitespace(match?.[1] ?? '')
}

const loadEditionFamilyContext = async () => {
  const [families, memberships] = await Promise.all([
    readCsvFile(editionFamiliesCsvPath),
    readCsvFile(editionFamilyMembershipsCsvPath),
  ])

  const familyById = new Map(families.map((family) => [family.family_id, family]))
  const membershipsByFamilyId = new Map()
  const familyByWorkId = new Map()

  for (const membership of memberships) {
    const bucket = membershipsByFamilyId.get(membership.family_id) ?? []
    bucket.push(membership)
    membershipsByFamilyId.set(membership.family_id, bucket)
    familyByWorkId.set(membership.work_id, familyById.get(membership.family_id) ?? null)
  }

  return {
    families,
    membershipsByFamilyId,
    familyById,
    familyByWorkId,
  }
}

const buildWorkDocument = async (work, editionFamilyContext) => {
  const manifestPath = resolve(worksDir, work.work_id, 'manifest.json')
  const workMarkdownPath = resolve(worksDir, work.work_id, 'work.md')

  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  const family = editionFamilyContext?.familyByWorkId?.get(work.work_id) ?? null
  let notes = ''

  try {
    notes = extractNotesSection(await readFile(workMarkdownPath, 'utf8'))
  } catch {
    notes = normalizeWhitespace(work.notes)
  }

  const text = [
    `${manifest.title}.`,
    `Work ID: ${work.work_id}.`,
    manifest.creator ? `Creator: ${manifest.creator}.` : '',
    manifest.collectionId ? `Collection: ${manifest.collectionId}.` : '',
    manifest.topicFamily ? `Topic family: ${manifest.topicFamily}.` : '',
    manifest.rightsStatus ? `Rights status: ${manifest.rightsStatus}.` : '',
    Number.isFinite(manifest.chunkCount) ? `Chunk count: ${manifest.chunkCount}.` : '',
    Number.isFinite(manifest.paragraphCount) ? `Paragraph count: ${manifest.paragraphCount}.` : '',
    manifest.sourceUrl ? `Source URL: ${manifest.sourceUrl}.` : '',
    manifest.metadataUrl ? `Metadata URL: ${manifest.metadataUrl}.` : '',
    family
      ? `Edition family: ${family.family_label}. Witness count: ${family.work_count}. Family confidence: ${family.clustering_confidence}.`
      : '',
    notes ? `Notes: ${notes}` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return {
    document_id: `work-${work.work_id}`,
    title: manifest.title,
    kind: 'work-summary',
    text,
    metadata: {
      work_id: work.work_id,
      creator: manifest.creator,
      collection_id: manifest.collectionId,
      topic_family: manifest.topicFamily,
      rights_status: manifest.rightsStatus,
      source_url: manifest.sourceUrl,
      metadata_url: manifest.metadataUrl,
      chunk_count: manifest.chunkCount,
      paragraph_count: manifest.paragraphCount,
      normalized_file: manifest.normalizedFile,
      chunk_file: manifest.chunkFile,
      family_id: family?.family_id ?? '',
      family_label: family?.family_label ?? '',
      family_work_count: family ? toInteger(family.work_count) : 0,
      family_confidence: family?.clustering_confidence ?? '',
    },
    source_path: manifest.normalizedFile ?? manifest.chunkFile ?? '',
    tags: [
      manifest.collectionId,
      manifest.topicFamily,
      manifest.rightsStatus,
      family?.family_id ? 'edition-family-linked' : '',
      family?.clustering_confidence ? `family-${family.clustering_confidence}` : '',
    ].filter(Boolean),
  }
}

const buildFamilyDocument = (family, memberships) => {
  const collectionIds = splitValues(family.collection_ids)
  const jurisdictions = splitValues(family.jurisdiction_lanes)
  const topicFamilies = splitValues(family.topic_family)
  const chunkedMembers = memberships.filter((member) => member.ingest_status === 'chunked')
  const discoveredMembers = memberships.filter((member) => member.ingest_status === 'discovered')
  const failedMembers = memberships.filter((member) => member.ingest_status === 'download_failed')
  const chunkedTitles = chunkedMembers.map((member) => member.title)
  const discoveredTitles = discoveredMembers.map((member) => member.title)
  const yearMin = normalizeWhitespace(family.publication_year_min)
  const yearMax = normalizeWhitespace(family.publication_year_max)

  const text = [
    `${family.family_label}.`,
    family.creator_display && family.creator_display !== 'Unknown' ? `Primary creator: ${family.creator_display}.` : '',
    `Edition family with ${family.work_count} known witnesses, ${family.chunked_count} locally acquired texts, ${family.discovered_count} queued records, and ${family.failed_count} failed records.`,
    yearMin && yearMax ? `Publication span: ${yearMin} to ${yearMax}.` : '',
    collectionIds.length ? `Collections: ${collectionIds.join(', ')}.` : '',
    jurisdictions.length ? `Jurisdiction lanes: ${jurisdictions.join(', ')}.` : '',
    topicFamilies.length ? `Topic families: ${topicFamilies.join(', ')}.` : '',
    family.canonical_title ? `Canonical witness: ${family.canonical_title}.` : '',
    chunkedTitles.length ? `Representative acquired witnesses: ${listPhrase(chunkedTitles, 5)}.` : '',
    discoveredTitles.length ? `Representative queued witnesses: ${listPhrase(discoveredTitles, 4)}.` : '',
    failedMembers.length ? `Failed witness titles: ${listPhrase(failedMembers.map((member) => member.title), 3)}.` : '',
    `Clustering confidence: ${family.clustering_confidence}. Basis: ${family.clustering_basis}.`,
  ]
    .filter(Boolean)
    .join(' ')

  return {
    document_id: `edition-family-${family.family_slug}`,
    title: family.family_label,
    kind: 'edition-family',
    text,
    metadata: {
      family_id: family.family_id,
      family_slug: family.family_slug,
      family_title_key: family.family_title_key,
      canonical_work_id: family.canonical_work_id,
      canonical_title: family.canonical_title,
      canonical_creator: family.canonical_creator,
      creator_key: family.creator_key,
      creator_display: family.creator_display,
      clustering_confidence: family.clustering_confidence,
      clustering_basis: family.clustering_basis,
      work_count: toInteger(family.work_count),
      chunked_count: toInteger(family.chunked_count),
      discovered_count: toInteger(family.discovered_count),
      failed_count: toInteger(family.failed_count),
      publication_year_min: numberOrNull(family.publication_year_min),
      publication_year_max: numberOrNull(family.publication_year_max),
      collection_ids: collectionIds,
      jurisdiction_lanes: jurisdictions,
      topic_families: topicFamilies,
      member_work_ids: memberships.map((member) => member.work_id),
    },
    source_path: editionFamiliesCsvPath,
    tags: [
      ...collectionIds,
      ...jurisdictions,
      ...topicFamilies,
      family.clustering_confidence ? `family-${family.clustering_confidence}` : '',
    ].filter(Boolean),
  }
}

const flushBatch = (db, batch, totals) => {
  if (batch.length === 0) {
    return
  }

  const result = upsertDocuments(db, batch)
  totals.receivedCount += result.receivedCount
  totals.insertedCount += result.insertedCount
  totals.updatedCount += result.updatedCount
  batch.length = 0
}

const totals = {
  receivedCount: 0,
  insertedCount: 0,
  updatedCount: 0,
  prunedCount: 0,
  profileCount: 0,
  workCount: 0,
  familyCount: 0,
}

const { db, config } = await openCorpusMemoryDatabase()
const batch = []
const profileDocumentIds = []
const workDocumentIds = []
const familyDocumentIds = []
const needsEditionFamilies = scopes.has('families') || scopes.has('works')
const editionFamilyContext = needsEditionFamilies ? await loadEditionFamilyContext() : null
const canPrune = !Number.isFinite(limit)

try {
  if (scopes.has('profiles')) {
    const reader = readline.createInterface({
      input: createReadStream(herbProfilesPath, 'utf8'),
      crlfDelay: Infinity,
    })

    for await (const line of reader) {
      if (!line.trim()) {
        continue
      }

      const document = JSON.parse(line)
      profileDocumentIds.push(document.document_id)
      batch.push({
        document_id: document.document_id,
        title: document.canonical_name,
        kind: 'herb-profile',
        text: document.retrieval_text,
        metadata: {
          profile_id: document.profile_id,
          catalog_class: document.catalog_class,
          collections: document.collections,
          topic_families: document.topic_families,
          source_family_refs: document.source_family_refs,
          supporting_work_ids: document.supporting_work_ids,
        },
        source_path: herbProfilesPath,
        tags: [...(document.collections ?? []), ...(document.topic_families ?? []), document.catalog_class].filter(Boolean),
      })

      totals.profileCount += 1
      if (batch.length >= batchSize) {
        flushBatch(db, batch, totals)
      }
      if (totals.profileCount + totals.workCount + totals.familyCount >= limit) {
        break
      }
    }
  }

  if (scopes.has('works') && totals.profileCount + totals.workCount + totals.familyCount < limit) {
    const works = await loadWorksRegistry()
    const eligibleWorks = works.filter(
      (work) => work.ingest_status === 'chunked' || (includeDiscovered && work.ingest_status === 'discovered'),
    )

    for (const work of eligibleWorks) {
      const document = await buildWorkDocument(work, editionFamilyContext)
      workDocumentIds.push(document.document_id)
      batch.push(document)
      totals.workCount += 1

      if (batch.length >= batchSize) {
        flushBatch(db, batch, totals)
      }
      if (totals.profileCount + totals.workCount + totals.familyCount >= limit) {
        break
      }
    }
  }

  if (scopes.has('families') && totals.profileCount + totals.workCount + totals.familyCount < limit) {
    for (const family of editionFamilyContext?.families ?? []) {
      const memberships = editionFamilyContext?.membershipsByFamilyId?.get(family.family_id) ?? []
      const document = buildFamilyDocument(family, memberships)
      familyDocumentIds.push(document.document_id)
      batch.push(document)
      totals.familyCount += 1

      if (batch.length >= batchSize) {
        flushBatch(db, batch, totals)
      }
      if (totals.profileCount + totals.workCount + totals.familyCount >= limit) {
        break
      }
    }
  }

  flushBatch(db, batch, totals)

  if (canPrune) {
    if (scopes.has('profiles')) {
      totals.prunedCount += pruneDocumentsByKind(db, 'herb-profile', profileDocumentIds).deletedCount
    }

    if (scopes.has('works')) {
      totals.prunedCount += pruneDocumentsByKind(db, 'work-summary', workDocumentIds).deletedCount
    }

    if (scopes.has('families')) {
      totals.prunedCount += pruneDocumentsByKind(db, 'edition-family', familyDocumentIds).deletedCount
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        service: config.name,
        databasePath: config.databasePath,
        scopes: [...scopes],
        ...totals,
      },
      null,
      2,
    ),
  )
} finally {
  closeCorpusMemoryDatabase(db)
}
