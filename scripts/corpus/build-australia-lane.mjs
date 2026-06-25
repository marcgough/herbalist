import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { derivedDir, ensureCorpusDirectories, exportsDir, writeCsvFile, writeJson } from './lib.mjs'

const australiaLaneDir = resolve(derivedDir, 'australia-lane')
const candidateSourcesJsonPath = resolve(australiaLaneDir, 'candidate-sources.json')
const candidateSourcesCsvPath = resolve(australiaLaneDir, 'candidate-sources.csv')
const searchThemesJsonPath = resolve(australiaLaneDir, 'search-themes.json')
const readmePath = resolve(australiaLaneDir, 'README.md')
const summaryPath = resolve(exportsDir, 'australia-lane-summary.json')

const candidateSources = [
  {
    id: 'trove-nla',
    name: 'Trove / National Library of Australia',
    jurisdictionLane: 'Australia',
    sourceType: 'national-discovery-metadata',
    status: 'metadata-review-only',
    corpusReadiness: 'metadata-review-only',
    url: 'https://trove.nla.gov.au/',
    apiUrl: 'https://trove.nla.gov.au/about/create-something/using-api',
    termsUrl: 'https://trove.nla.gov.au/about/create-something/using-api/trove-api-terms-use',
    requiresApiKey: true,
    permittedUseAtThisStage: 'Manual discovery notes and item-level rights review only.',
    rightsBoundary:
      'Trove API terms cover metadata access. Digital objects and full text require item-level open licence, public-domain certainty, or content-owner permission.',
    noIngestReason:
      'API use requires an active key, and harvesting full text or using records for AI modelling can require higher review. This lane does not depend on a Trove key.',
    acceptedWorkTypes: [
      'public-domain books',
      'historical herbal manuals',
      'domestic medicine books',
      'materia medica',
      'pharmacopoeias',
      'botanical guides with medicinal plant coverage',
    ],
    excludedWorkTypes: [
      'newspapers',
      'blogs',
      'serial feeds',
      'uncertain-rights items',
      'platform-only viewing records',
      'image-only records without a practical rights-cleared text path',
    ],
    nextAction:
      'Use manual catalogue search now; consider an API key later only for metadata review, not full-text ingestion.',
  },
  {
    id: 'state-library-victoria',
    name: 'State Library Victoria catalogue and digitised books',
    jurisdictionLane: 'Australia',
    sourceType: 'state-library-catalogue',
    status: 'manual-rights-review-only',
    corpusReadiness: 'manual-rights-review-only',
    url: 'https://www.slv.vic.gov.au/',
    apiUrl: '',
    termsUrl: 'https://www.slv.vic.gov.au/copyright',
    requiresApiKey: false,
    permittedUseAtThisStage: 'Manual candidate discovery and catalogue note taking only.',
    rightsBoundary:
      'Only item-level public-domain, CC0, CC BY, or similarly permissive text can move into the corpus.',
    noIngestReason:
      'State-library discovery pages can mix public-domain metadata, digitised objects, and third-party rights. Each book needs its own rights review.',
    acceptedWorkTypes: [
      'public-domain books',
      'Victorian domestic medicine books',
      'botanical guides',
      'pharmacopoeias',
      'public health manuals',
    ],
    excludedWorkTypes: ['newspapers', 'exhibition pages', 'blogs', 'uncertain-rights scans', 'rights-restricted images'],
    nextAction: 'Manually identify book-level candidates and record item-level copyright/licence evidence.',
  },
  {
    id: 'state-library-nsw',
    name: 'State Library of New South Wales catalogue and digital collections',
    jurisdictionLane: 'Australia',
    sourceType: 'state-library-catalogue',
    status: 'manual-rights-review-only',
    corpusReadiness: 'manual-rights-review-only',
    url: 'https://www.sl.nsw.gov.au/',
    apiUrl: '',
    termsUrl: 'https://www.sl.nsw.gov.au/about-library/policies/copyright',
    requiresApiKey: false,
    permittedUseAtThisStage: 'Manual candidate discovery and catalogue note taking only.',
    rightsBoundary:
      'Only item-level public-domain, CC0, CC BY, or similarly permissive text can move into the corpus.',
    noIngestReason:
      'Catalogue records and digital objects can carry different reuse terms. This lane requires a separate rights proof before acquisition.',
    acceptedWorkTypes: [
      'public-domain books',
      'domestic medicine guides',
      'botanical reference manuals',
      'materia medica',
      'public health handbooks',
    ],
    excludedWorkTypes: ['newspapers', 'manuscript fragments without text reuse rights', 'blogs', 'uncertain-rights scans'],
    nextAction: 'Manually screen book-level results and preserve source-page rights evidence with each candidate.',
  },
  {
    id: 'state-library-queensland',
    name: 'State Library of Queensland catalogue and digital collections',
    jurisdictionLane: 'Australia',
    sourceType: 'state-library-catalogue',
    status: 'manual-rights-review-only',
    corpusReadiness: 'manual-rights-review-only',
    url: 'https://www.slq.qld.gov.au/',
    apiUrl: '',
    termsUrl: 'https://www.slq.qld.gov.au/using-library/copyright',
    requiresApiKey: false,
    permittedUseAtThisStage: 'Manual candidate discovery and catalogue note taking only.',
    rightsBoundary:
      'Only item-level public-domain, CC0, CC BY, or similarly permissive text can move into the corpus.',
    noIngestReason: 'Digital collection entries need item-level copyright checks before any local text acquisition.',
    acceptedWorkTypes: [
      'public-domain books',
      'domestic medicine books',
      'botanical guides',
      'Queensland public health manuals',
      'plant-reference manuals',
    ],
    excludedWorkTypes: ['newspapers', 'oral histories', 'blogs', 'uncertain-rights images', 'restricted collection objects'],
    nextAction: 'Manually screen catalogue records for book-like, rights-clear, full-text candidates.',
  },
  {
    id: 'bhl-australia',
    name: 'Biodiversity Heritage Library Australia-linked holdings',
    jurisdictionLane: 'Australia',
    sourceType: 'biodiversity-book-library',
    status: 'manual-rights-review-only',
    corpusReadiness: 'manual-rights-review-only',
    url: 'https://www.biodiversitylibrary.org/',
    apiUrl: '',
    termsUrl: 'https://about.biodiversitylibrary.org/about/copyright-and-reuse/',
    requiresApiKey: false,
    permittedUseAtThisStage: 'Manual candidate discovery for botanical books with medicinal-plant relevance.',
    rightsBoundary:
      'BHL items can carry title-level rights statements. Only public-domain or permissively licensed full text can move into the corpus.',
    noIngestReason: 'Many botanical works are taxonomic rather than practical medicine; candidates need both relevance and rights review.',
    acceptedWorkTypes: [
      'public-domain botanical books',
      'medical botany',
      'flora with medicinal plant references',
      'materia medica with plant monographs',
    ],
    excludedWorkTypes: ['pure taxonomy without practical medicinal relevance', 'uncertain-rights items', 'image-only records'],
    nextAction: 'Use this as a botanical backfill lane only after practical health relevance is confirmed.',
  },
]

const searchThemes = [
  {
    id: 'australian-herbal',
    query: '"Australian herbal"',
    jurisdictionLane: 'Australia',
    priority: 'high',
    workTypeFocus: 'book, manual, guide',
    relevance: 'Direct Australian herbal-practice phrase likely to surface candidate manuals.',
    culturalSafety: 'standard',
    noIngestWithout: 'item-level rights proof and full-text availability',
  },
  {
    id: 'australian-medicinal-plants',
    query: '"Australian medicinal plants"',
    jurisdictionLane: 'Australia',
    priority: 'high',
    workTypeFocus: 'botanical guide, materia medica',
    relevance: 'Core phrase for plant monographs and regional materia medica.',
    culturalSafety: 'standard',
    noIngestWithout: 'item-level rights proof and practical medicinal relevance',
  },
  {
    id: 'medical-botany-australia',
    query: '"medical botany" Australia',
    jurisdictionLane: 'Australia',
    priority: 'high',
    workTypeFocus: 'medical botany, materia medica',
    relevance: 'Likely to surface older book-like medical botany records.',
    culturalSafety: 'standard',
    noIngestWithout: 'item-level rights proof and full-text availability',
  },
  {
    id: 'australian-flora-medicinal',
    query: '"Australian flora" medicinal',
    jurisdictionLane: 'Australia',
    priority: 'medium',
    workTypeFocus: 'flora, botanical guide',
    relevance: 'Useful for botanical works that include medicinal notes without being full herbal manuals.',
    culturalSafety: 'standard',
    noIngestWithout: 'item-level rights proof and enough medicinal-practice content',
  },
  {
    id: 'domestic-medicine-australia',
    query: '"domestic medicine" Australia',
    jurisdictionLane: 'Australia',
    priority: 'medium',
    workTypeFocus: 'domestic medicine book, household guide',
    relevance: 'Matches the Pears-style practical health knowledge pattern.',
    culturalSafety: 'standard',
    noIngestWithout: 'item-level rights proof and book-like source structure',
  },
  {
    id: 'materia-medica-australia',
    query: '"materia medica" Australia',
    jurisdictionLane: 'Australia',
    priority: 'medium',
    workTypeFocus: 'materia medica, pharmacopoeia',
    relevance: 'Finds formal medicine and pharmacy references with plant/drug entries.',
    culturalSafety: 'standard',
    noIngestWithout: 'item-level rights proof and full-text availability',
  },
  {
    id: 'australian-pharmacopoeia',
    query: '"Australian pharmacopoeia"',
    jurisdictionLane: 'Australia',
    priority: 'medium',
    workTypeFocus: 'pharmacopoeia, formulary',
    relevance: 'Can surface formal drug and preparation references with public-domain potential.',
    culturalSafety: 'standard',
    noIngestWithout: 'item-level rights proof and edition-date review',
  },
  {
    id: 'botanical-guide-australia',
    query: '"botanical guide" Australia',
    jurisdictionLane: 'Australia',
    priority: 'medium',
    workTypeFocus: 'botanical guide',
    relevance: 'Broad practical plant-identification route; medicinal relevance must be checked.',
    culturalSafety: 'standard',
    noIngestWithout: 'item-level rights proof and practical medicinal relevance',
  },
  {
    id: 'bush-medicine-book',
    query: '"bush medicine" book Australia',
    jurisdictionLane: 'Australia',
    priority: 'restricted',
    workTypeFocus: 'metadata leads only',
    relevance: 'May surface culturally sensitive knowledge and should not be treated as open material by default.',
    culturalSafety:
      'restricted. First Australian and Indigenous knowledge must not be extracted, reframed, or indexed unless rights, authority, and culturally safe review are explicit.',
    noIngestWithout: 'explicit reuse rights, cultural authority, and separate approval',
  },
]

const readCurrentAustraliaReferenceCount = async () => {
  try {
    const payload = JSON.parse(await readFile(resolve('public/data/reference-books.json'), 'utf8'))
    return (payload.records ?? []).filter((record) => record.searchRegions?.includes('Australia')).length
  } catch {
    return null
  }
}

const csvRows = candidateSources.map((source) => ({
  id: source.id,
  name: source.name,
  jurisdictionLane: source.jurisdictionLane,
  sourceType: source.sourceType,
  status: source.status,
  corpusReadiness: source.corpusReadiness,
  url: source.url,
  apiUrl: source.apiUrl,
  termsUrl: source.termsUrl,
  requiresApiKey: String(source.requiresApiKey),
  rightsBoundary: source.rightsBoundary,
  acceptedWorkTypes: source.acceptedWorkTypes.join('; '),
  excludedWorkTypes: source.excludedWorkTypes.join('; '),
  nextAction: source.nextAction,
}))

const summary = {
  status: 'prepared-not-populated',
  generatedAt: new Date().toISOString(),
  jurisdictionLane: 'Australia',
  safeToRun: 'Writes local queue artifacts only; no external API calls, scraping, downloads, or API keys.',
  candidateSourceCount: candidateSources.length,
  searchThemeCount: searchThemes.length,
  corpusReadyCandidateCount: candidateSources.filter((source) => source.corpusReadiness === 'corpus-ready').length,
  requiresExternalApprovalForApi: candidateSources.some((source) => source.requiresApiKey),
  currentAustraliaReferenceCount: await readCurrentAustraliaReferenceCount(),
  allowedContentRule:
    'Book-like sources only, with full text allowed only when public domain, CC0, CC BY, CC BY-SA, or similarly permissive item-level reuse rights are clear.',
  excludedContentRule:
    'No newspapers, blogs, general web pages, serial feeds, uncertain-rights scans, or platform-only records enter the corpus.',
  culturalSafety:
    'First Australian and Indigenous knowledge remains restricted metadata only unless explicit rights, authority, and culturally safe review are obtained.',
  sourceIds: candidateSources.map((source) => source.id),
  themeIds: searchThemes.map((theme) => theme.id),
}

const readme = `# Herbalisti Australia Lane Queue

Status: prepared, not populated.

This folder records Australian corpus-discovery leads for later manual review. It does not fetch, scrape, download, or ingest any external content.

## Rights boundary

- book-like sources only: bound books, historical herbal manuals, domestic medicine books, materia medica, pharmacopoeias, practical public-health handbooks, and botanical guides with medicinal-plant relevance
- accepted only after item-level evidence of public domain, CC0, CC BY, CC BY-SA, or similarly permissive reuse
- excluded by default: newspapers, blogs, general web pages, serial feeds, uncertain-rights scans, platform-only viewing records, and image-only items without a practical rights-cleared text path
- Trove is treated as metadata-review-only until API access and item-level rights are separately approved

## Trove note

Trove API access requires an API key. Trove API terms cover developer metadata use; they do not automatically grant rights to digital objects or full text. Harvesting full-text records or using records for AI modelling can require higher review. This lane therefore keeps Trove as a manual discovery and metadata-review source at this stage.

## Cultural safety

First Australian and Indigenous knowledge must not be extracted, reframed, or indexed unless rights, authority, and culturally safe review are explicit. The restricted bush-medicine search theme is a metadata lead only.

## Files

- \`candidate-sources.json\`: review-only source lanes
- \`candidate-sources.csv\`: spreadsheet-friendly copy of the review queue
- \`search-themes.json\`: Australian book-search themes and restrictions
- \`../../exports/australia-lane-summary.json\`: machine-readable status summary
`

await ensureCorpusDirectories()
await mkdir(australiaLaneDir, { recursive: true })
await writeJson(candidateSourcesJsonPath, candidateSources)
await writeCsvFile(candidateSourcesCsvPath, csvRows, [
  'id',
  'name',
  'jurisdictionLane',
  'sourceType',
  'status',
  'corpusReadiness',
  'url',
  'apiUrl',
  'termsUrl',
  'requiresApiKey',
  'rightsBoundary',
  'acceptedWorkTypes',
  'excludedWorkTypes',
  'nextAction',
])
await writeJson(searchThemesJsonPath, searchThemes)
await writeFile(readmePath, readme, 'utf8')
await writeJson(summaryPath, summary)

console.log(
  JSON.stringify(
    {
      status: 'pass',
      outputDir: australiaLaneDir,
      summaryPath,
      ...summary,
    },
    null,
    2,
  ),
)
