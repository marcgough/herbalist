import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

const read = (path) => readFileSync(resolve(root, path), 'utf8')
const readJson = (path) => JSON.parse(read(path))
const exists = (path) => existsSync(resolve(root, path))
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const packageJson = readJson('package.json')
const appSource = read('src/App.tsx')
const cssSource = read('src/App.css')
const blockedSourcePattern = /pfizer|moderna|novartis|roche|merck|gsk|astrazeneca|sanofi|bayer|johnson\s*&\s*johnson/i
const treatmentClaimPattern = /\bTREATS\b|diagnose|prescribe|cure\b/i
const herbalSourceUrlPattern = /^https:\/\/(www\.gutenberg\.org\/ebooks\/|wellcomecollection\.org\/works\/|collections\.nlm\.nih\.gov\/catalog\/)/i
const allowedHerbalLicenses = new Set(['public_domain_usa', 'public_domain_mark', 'pdm', 'cc-by'])
const allowedReferenceStatuses = new Set(['public_domain_us', 'public_domain_mark', 'pdm', 'cc-by'])
const allowedReferenceLanes = new Set(['US', 'UK', 'Australia'])

const expectedExports = [
  {
    path: 'public/data/reference-books.json',
    minRecords: 1000,
    allowBlockedSourceNames: true,
    validator: (record) =>
      record.id &&
      record.title &&
      Array.isArray(record.authors) &&
      herbalSourceUrlPattern.test(record.externalUrl ?? '') &&
      allowedReferenceStatuses.has(String(record.sourceStatus ?? '')) &&
      allowedReferenceLanes.has(String(record.rightsLane ?? '')) &&
      Array.isArray(record.searchRegions) &&
      record.searchRegions.length > 0 &&
      record.searchRegions.every((region) => allowedReferenceLanes.has(String(region ?? ''))) &&
      record.verificationSource &&
      record.citationNote,
  },
  {
    path: 'public/data/remedies.json',
    minRecords: 20,
    validator: (record) =>
      record.id &&
      record.name &&
      record.botanicalName &&
      Array.isArray(record.plantParts) &&
      record.plantParts.length > 0 &&
      Array.isArray(record.traditionalUses) &&
      record.traditionalUses.length > 0 &&
      Array.isArray(record.interactionFlags) &&
      record.interactionFlags.length > 0 &&
      record.sourceUrl?.startsWith('https://www.nccih.nih.gov/health/'),
  },
  {
    path: 'public/data/herbal-knowledge.json',
    minRecords: 100,
    minSources: 150,
    minCorpusProfiles: 100,
    validator: (record) =>
      record.id &&
      record.name &&
      (record.botanicalName || record.displayLabel || (Array.isArray(record.categories) && record.categories.length > 0)) &&
      Array.isArray(record.mayHelpWith) &&
      record.mayHelpWith.length > 0 &&
      Array.isArray(record.considerations) &&
      record.considerations.length > 0 &&
      Array.isArray(record.sourceIds) &&
      record.sourceIds.length > 0 &&
      !record.sourceNote?.includes('TREATS'),
    sourceValidator: (source) =>
      source.id &&
      source.title &&
      herbalSourceUrlPattern.test(source.sourceUrl ?? '') &&
      allowedHerbalLicenses.has(String(source.licenseStatus ?? '')) &&
      source.licenseLabel,
  },
  {
    path: 'public/data/citation-notes.json',
    minRecords: 10,
    validator: (record) =>
      record.id &&
      record.sourceType &&
      record.linkedRecordId &&
      record.sourceUrl?.startsWith('https://') &&
      Array.isArray(record.tags),
  },
  {
    path: 'public/data/sources.json',
    minRecords: 6,
    validator: (record) =>
      record.id &&
      record.name &&
      record.url?.startsWith('https://') &&
      record.isAllowlisted === true &&
      record.isBigPharmaRelated === false &&
      record.reviewEvidenceUrl?.startsWith('https://') &&
      record.reviewCadence === 'quarterly_or_before_source_expansion',
  },
]

const summaries = expectedExports.map(({ path, minRecords, minSources, minCorpusProfiles, validator, sourceValidator, allowBlockedSourceNames }) => {
  assert(exists(path), `${path} is missing; run npm run export:data`)
  const payload = readJson(path)
  assert(
    String(payload.source ?? '').startsWith('static-export'),
    `${path} should be a static-export payload`,
  )
  assert(payload.version === '2026-06-16', `${path} should expose the launch data version`)
  assert(payload.policy && !treatmentClaimPattern.test(payload.policy), `${path} policy should stay non-prescriptive`)
  assert(Array.isArray(payload.records), `${path} should expose records array`)
  assert(payload.records.length >= minRecords, `${path} should include at least ${minRecords} records`)
  assert(payload.total === payload.records.length, `${path} total should match records length`)
  assert(payload.records.every(validator), `${path} has a record that fails the public export contract`)
  if (sourceValidator) {
    assert(Array.isArray(payload.sources), `${path} should expose source works`)
    assert(payload.sources.length >= (minSources ?? 5), `${path} should include the rights-cleared source works`)
    assert(payload.sources.every(sourceValidator), `${path} has a source that fails the licensing contract`)
  }
  if (minCorpusProfiles) {
    const corpusProfiles = payload.records.filter((record) => record.entryKind === 'corpus-profile')
    assert(
      corpusProfiles.length >= minCorpusProfiles,
      `${path} should expose at least ${minCorpusProfiles} corpus-derived herbal profiles`,
    )
    assert(
      corpusProfiles.every(
        (record) =>
          Number(record.corpusWorkCount ?? 0) > 0 &&
          Number(record.corpusChunkCount ?? 0) > 0 &&
          String(record.sourceNote ?? '').includes('source-linked'),
      ),
      `${path} corpus profiles should include source-linked corpus scale metadata`,
    )
  }
  if (!allowBlockedSourceNames) {
    assert(!blockedSourcePattern.test(JSON.stringify(payload.records)), `${path} should not include blocked source names`)
  }

  return {
    path,
    total: payload.total,
  }
})

const referenceBooksExport = readJson('public/data/reference-books.json')
const referenceLanesExport = readJson('public/data/reference-lanes.json')
assert(referenceLanesExport.name === 'Herbalisti reference lane coverage', 'Reference-lanes export name is incorrect')
assert(referenceLanesExport.source === 'static-export-reference-lanes', 'Reference-lanes export should be static metadata')
assert(referenceLanesExport.total === 3, 'Reference-lanes export should expose US, UK, and Australia')
assert(Array.isArray(referenceLanesExport.lanes), 'Reference-lanes export should expose lane records')
assert(Array.isArray(referenceLanesExport.australiaQueue?.candidateSources), 'Reference-lanes export should expose Australia review sources')
assert(referenceLanesExport.australiaQueue.status === 'prepared-not-populated', 'Australia lane should remain prepared-not-populated')
assert(referenceLanesExport.australiaQueue.currentAustraliaReferenceCount === 0, 'Australia lane should not publish unproven references')
assert(referenceLanesExport.australiaQueue.corpusReadyCandidateCount === 0, 'Australia lane should have no corpus-ready candidates yet')
assert(referenceLanesExport.australiaQueue.candidateSourceCount >= 5, 'Australia lane should expose candidate source count')
assert(
  String(referenceLanesExport.australiaQueue.culturalSafety ?? '').includes('culturally safe review'),
  'Reference-lanes export should preserve cultural safety boundary',
)
assert(
  referenceLanesExport.australiaQueue.candidateSources.every(
    (source) =>
      source.id &&
      source.name &&
      source.url?.startsWith('https://') &&
      source.status &&
      source.corpusReadiness &&
      source.rightsBoundary &&
      source.noIngestReason,
  ),
  'Reference-lanes Australia queue sources should expose review metadata without ingesting works',
)
const laneCoverage = referenceBooksExport.laneCoverage
assert(Array.isArray(laneCoverage), 'Reference-book export should expose laneCoverage')
assert(laneCoverage.length === 3, 'Reference-book export should expose US, UK, and Australia lane coverage')
const laneCoverageByLane = new Map(laneCoverage.map((lane) => [lane.lane, lane]))
assert(
  laneCoverageByLane.get('US')?.status === 'active' && Number(laneCoverageByLane.get('US')?.referenceCount ?? 0) > 0,
  'Reference-book export should report the US lane as active',
)
assert(
  laneCoverageByLane.get('UK')?.status === 'active' && Number(laneCoverageByLane.get('UK')?.referenceCount ?? 0) > 0,
  'Reference-book export should report the UK lane as active',
)
assert(
  laneCoverageByLane.get('Australia')?.status === 'prepared-not-populated' &&
    Number(laneCoverageByLane.get('Australia')?.referenceCount ?? -1) === 0,
  'Reference-book export should report Australia as prepared but not populated',
)
assert(
  String(laneCoverageByLane.get('Australia')?.message ?? '').includes('rights-cleared archive intake'),
  'Reference-book export should explain the Australia rights-cleared intake boundary',
)

assert(packageJson.scripts?.['export:data'], 'package.json should include export:data')
assert(packageJson.scripts?.['verify:data-exports'], 'package.json should include verify:data-exports')
assert(
  String(packageJson.scripts?.build ?? '').includes('export-public-data.mjs'),
  'build script should regenerate public data exports before vite build',
)
assert(appSource.includes('/data/reference-books.json'), 'UI should expose reference-book data export')
assert(appSource.includes('/data/reference-lanes.json'), 'UI should expose reference-lane data export')
assert(appSource.includes('/data/herbal-knowledge.json'), 'UI should expose herbal commons data export')
assert(appSource.includes('/data/remedies.json'), 'UI should expose remedy data export')
assert(appSource.includes('/data/citation-notes.json'), 'UI should expose citation-note data export')
assert(appSource.includes('/data/sources.json'), 'UI should expose source-registry data export')
assert(appSource.includes('/data/discovery-metadata.json'), 'UI should expose discovery metadata data export')
assert(appSource.includes('/data/api-catalog.json'), 'UI should expose API catalog data export')
assert(cssSource.includes('.data-export-panel'), 'Data export UI should have dedicated styling')

const discoveryMetadata = readJson('public/data/discovery-metadata.json')
assert(discoveryMetadata.name === 'Herbalisti discovery metadata', 'Discovery metadata export name is incorrect')
assert(discoveryMetadata.source === 'static-export-discovery-metadata', 'Discovery metadata should be a static discovery export')
assert(discoveryMetadata.canonicalUrl === 'https://herbalisti.com/', 'Discovery metadata should expose the production canonical URL')
assert(Array.isArray(discoveryMetadata.datasets), 'Discovery metadata should expose datasets')
assert(
  discoveryMetadata.datasets.some((dataset) => dataset.id === 'reference-books' && dataset.recordCount >= 1000),
  'Discovery metadata should expose the reference-book dataset count',
)
assert(
  discoveryMetadata.datasets.some((dataset) => dataset.id === 'reference-lanes' && dataset.recordCount === 3),
  'Discovery metadata should expose the reference-lanes dataset',
)
assert(
  discoveryMetadata.datasets.some((dataset) => dataset.id === 'herbal-commons' && dataset.recordCount >= 100),
  'Discovery metadata should expose the herbal commons dataset count',
)
assert(
  discoveryMetadata.datasets.every((dataset) => dataset.rightsBoundary && !treatmentClaimPattern.test(dataset.rightsBoundary)),
  'Discovery metadata dataset rights boundaries should be present and non-prescriptive',
)

const apiCatalog = readJson('public/data/api-catalog.json')
assert(apiCatalog.name === 'Herbalisti public API catalog', 'API catalog export name is incorrect')
assert(apiCatalog.source === 'static-export-api-catalog', 'API catalog should be a static API catalog export')
assert(apiCatalog.apiBaseUrl === 'https://herbalisti.com', 'API catalog should expose the production API base URL')
assert(apiCatalog.endpointCount === apiCatalog.endpoints?.length, 'API catalog endpoint count should match endpoint records')
assert(apiCatalog.publicEndpointCount >= 14, 'API catalog should expose the public API surface count')
assert(apiCatalog.protectedEndpointCount === 3, 'API catalog should expose the protected admin endpoint count')
for (const protectedEndpointId of ['feed-refresh', 'seedance-create', 'seedance-status']) {
  assert(
    apiCatalog.endpoints.some((endpoint) => endpoint.id === protectedEndpointId && endpoint.access === 'protected-admin'),
    `API catalog should expose protected admin endpoint ${protectedEndpointId}`,
  )
}
assert(apiCatalog.boundaries?.medicalAdvice === 'disabled', 'API catalog should preserve the medical advice boundary')
assert(apiCatalog.boundaries?.publicAccounts === 'disabled', 'API catalog should preserve the public account boundary')
assert(apiCatalog.boundaries?.secretValues === 'never_returned', 'API catalog should preserve the no-secret-values boundary')
assert(
  apiCatalog.endpoints.every(
    (endpoint) =>
      endpoint.id &&
      ['GET', 'POST'].includes(endpoint.method) &&
      endpoint.path?.startsWith('/api/') &&
      ['public', 'protected-admin'].includes(endpoint.access) &&
      endpoint.purpose &&
      Array.isArray(endpoint.parameters) &&
      Array.isArray(endpoint.responseShape),
  ),
  'API catalog endpoints should expose method, path, access, purpose, parameters, and response shape',
)

console.log(
  JSON.stringify(
    {
      status: 'pass',
      exports: summaries,
      apiEndpoints: apiCatalog.endpointCount,
      safeToRun: 'This verifier reads local files only. It does not call external APIs or expose secrets.',
    },
    null,
    2,
  ),
)
