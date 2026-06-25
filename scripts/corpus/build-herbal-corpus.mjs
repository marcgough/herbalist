import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { readCsvFile, worksRegistryPath } from './lib.mjs'

const rootDir = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const profilesPath = resolve(rootDir, 'corpus/derived/herb-profiles/profiles.json')
const generatedDir = resolve(rootDir, 'functions/_generated')
const outputPath = resolve(generatedDir, 'herbal-corpus.js')

const collectionLabels = {
  'nlm-digital-collections': 'National Library of Medicine',
  'project-gutenberg': 'Project Gutenberg',
  'wellcome-collection': 'Wellcome Collection',
}

const rightsLabels = {
  'cc-by': 'CC BY',
  pdm: 'Public Domain Mark',
  public_domain_mark: 'Public Domain Mark 1.0',
  public_domain_us: 'Public domain in the USA',
  public_domain_usa: 'Public domain in the USA',
}

const normalizeWhitespace = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

const slugify = (value) =>
  normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

const humanizeSlug = (value) =>
  normalizeWhitespace(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())

const uniqueList = (values) => {
  const output = []
  const seen = new Set()

  for (const value of values.flat()) {
    const normalized = normalizeWhitespace(value)
    if (!normalized) {
      continue
    }

    const key = normalized.toLowerCase()
    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    output.push(normalized)
  }

  return output
}

const topLabels = (items, limit = 5) =>
  (Array.isArray(items) ? items : [])
    .map((item) => normalizeWhitespace(item?.label))
    .filter(Boolean)
    .slice(0, limit)

const collectionLabel = (value) => collectionLabels[value] ?? humanizeSlug(value || 'Historical collection')

const rightsLabel = (work, registryRow) =>
  normalizeWhitespace(registryRow?.reuse_license || work?.reuse_license || rightsLabels[registryRow?.rights_status] || rightsLabels[work?.rights_status]) ||
  'Rights-cleared historical source'

const normalizeLicenseStatus = (value) => {
  const normalized = normalizeWhitespace(value)
  return normalized === 'public_domain_us' ? 'public_domain_usa' : normalized
}

const workAuthor = (work, registryRow) =>
  normalizeWhitespace(work?.creator || registryRow?.creator || '').replace(/[;,]+$/g, '') || 'Historical corpus source'

const workYear = (work, registryRow) => normalizeWhitespace(work?.publication_year || registryRow?.publication_year || '')

const sourceTypeForCollection = (collectionId) => {
  switch (collectionId) {
    case 'project-gutenberg':
      return 'public-domain reference'
    case 'nlm-digital-collections':
    case 'wellcome-collection':
      return 'official historical collection'
    default:
      return 'rights-cleared historical source'
  }
}

const profiles = JSON.parse(await readFile(profilesPath, 'utf8'))
const works = await readCsvFile(worksRegistryPath)
const workById = new Map(works.map((row) => [row.work_id, row]))

const sourceMap = new Map()

const corpusHerbalKnowledgeEntries = profiles
  .map((profile) => {
    const displayLabel = humanizeSlug(profile.catalog_class || 'historical corpus profile')
    const topicFamilies = uniqueList((profile.coverage?.topic_families ?? []).map((family) => humanizeSlug(family)))
    const supportingWorks = (profile.supporting_works ?? []).slice(0, 5)

    for (const work of supportingWorks) {
      const registryRow = workById.get(work.work_id)
      sourceMap.set(work.work_id, {
        id: work.work_id,
        title: normalizeWhitespace(work.title),
        author: workAuthor(work, registryRow),
        year: workYear(work, registryRow),
        sourceUrl: normalizeWhitespace(work.source_url || registryRow?.source_url || registryRow?.metadata_url),
        licenseStatus: normalizeLicenseStatus(registryRow?.rights_status || '') || 'public_domain_mark',
        licenseLabel: rightsLabel(work, registryRow),
        sourceType: sourceTypeForCollection(work.collection_id || registryRow?.collection_id),
        notes: `Rights-cleared historical source from ${collectionLabel(work.collection_id || registryRow?.collection_id)}.`,
      })
    }

    const workCount = Number(profile.metrics?.total_works ?? 0)
    const chunkCount = Number(profile.metrics?.total_chunks ?? 0)
    const plantParts = topLabels(profile.signal_summary?.plant_parts, 6)
    const preparations = topLabels(profile.signal_summary?.preparations, 6)
    const mayHelpWith = topLabels(profile.signal_summary?.conditions, 6)
    const considerations = topLabels(profile.signal_summary?.cautions, 6)

    return {
      id: `corpus-${profile.canonical_key || slugify(profile.canonical_name)}`,
      name: normalizeWhitespace(profile.canonical_name),
      botanicalName: '',
      commonNames: uniqueList(profile.coverage?.variants ?? []).filter(
        (variant) => variant.toLowerCase() !== normalizeWhitespace(profile.canonical_name).toLowerCase(),
      ),
      plantParts,
      categories: uniqueList([displayLabel, ...topicFamilies.slice(0, 2)]),
      mayHelpWith,
      preparations,
      considerations,
      sourceIds: supportingWorks.map((work) => work.work_id),
      sourceNote: `${normalizeWhitespace(profile.canonical_name)} appears across ${workCount.toLocaleString(
        'en-US',
      )} works and ${chunkCount.toLocaleString('en-US')} source-linked passages in the rights-cleared Herbalisti corpus.`,
      entryKind: 'corpus-profile',
      displayLabel,
      corpusWorkCount: workCount,
      corpusChunkCount: chunkCount,
      topicFamilies,
      catalogClass: normalizeWhitespace(profile.catalog_class),
    }
  })
  .sort((left, right) => left.name.localeCompare(right.name, 'en', { sensitivity: 'base' }))

const corpusHerbalSourceWorks = [...sourceMap.values()].sort(
  (left, right) => left.title.localeCompare(right.title, 'en', { sensitivity: 'base' }) || left.id.localeCompare(right.id),
)

await mkdir(generatedDir, { recursive: true })
await writeFile(
  outputPath,
  `// Generated by scripts/corpus/build-herbal-corpus.mjs. Do not edit by hand.\n` +
    `export const corpusHerbalKnowledgeEntries = ${JSON.stringify(corpusHerbalKnowledgeEntries, null, 2)}\n\n` +
    `export const corpusHerbalSourceWorks = ${JSON.stringify(corpusHerbalSourceWorks, null, 2)}\n`,
  'utf8',
)

console.log(
  JSON.stringify(
    {
      status: 'pass',
      outputPath,
      profileCount: corpusHerbalKnowledgeEntries.length,
      sourceCount: corpusHerbalSourceWorks.length,
    },
    null,
    2,
  ),
)
