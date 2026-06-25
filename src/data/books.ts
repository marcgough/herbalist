export type BookRightsLane = 'US' | 'UK' | 'Australia'
export type BookRegionFilter = 'All lanes' | BookRightsLane

export type BookRecord = {
  id: string
  title: string
  subtitle?: string
  authors: string[]
  mode: 'Materia medica' | 'Making' | 'Safety' | 'Reference'
  role: string
  tags: string[]
  status: string
  notes: string
  sourceStatus?: string
  publisher?: string
  publicationDate?: string
  isbn13?: string
  pages?: number
  externalUrl?: string
  verificationSource?: string
  citationNote?: string
  rightsLane?: BookRightsLane
  searchRegions?: BookRightsLane[]
}

export const bookRecords: BookRecord[] = [
  {
    id: 'pg-13265',
    title: 'A Book of Fruits and Flowers',
    authors: ['Anonymous'],
    mode: 'Materia medica',
    role: 'Rights-cleared historical source from Project Gutenberg indexed for materia medica retrieval and comparison.',
    tags: ['materia medica', 'us rights lane', 'project gutenberg', 'historical corpus'],
    status: 'Public domain in the United States source archived and indexed locally',
    notes:
      'Collected into the local Herbalisti corpus from Project Gutenberg. Topic families: Materia Medica. Rights lane: US. Retrieval uses local normalized text and chunk indexes rather than copied display text.',
    sourceStatus: 'public_domain_us',
    publisher: 'Project Gutenberg',
    externalUrl: 'https://www.gutenberg.org/ebooks/13265',
    verificationSource: 'Project Gutenberg catalogue',
    citationNote: 'Rights: Public domain in the United States. Local ingest: Chunked. Review: Downloaded And Normalized.',
    rightsLane: 'US',
    searchRegions: ['US'],
  },
  {
    id: 'wellcome-ajcphwk7',
    title: 'A botanic guide to health and the natural pathology of disease / [Albert Isaiah Coffin].',
    authors: ['Unknown'],
    mode: 'Reference',
    role: 'Rights-cleared historical source from Wellcome Collection indexed for domestic medicine retrieval and comparison.',
    tags: ['domestic medicine', 'uk rights lane', 'wellcome collection', 'historical corpus'],
    status: 'Public Domain Mark source archived and indexed locally',
    notes:
      'Collected into the local Herbalisti corpus from Wellcome Collection. Topic families: Domestic Medicine. Rights lane: UK. Retrieval uses local normalized text and chunk indexes rather than copied display text.',
    sourceStatus: 'pdm',
    publisher: 'Wellcome Collection',
    publicationDate: '1846',
    externalUrl: 'https://wellcomecollection.org/works/ajcphwk7',
    verificationSource: 'Wellcome Collection catalogue',
    citationNote: 'Rights: Public Domain Mark. Local ingest: Chunked. Review: Downloaded And Normalized.',
    rightsLane: 'UK',
    searchRegions: ['UK'],
  },
  {
    id: 'nlm-2165030R',
    title: 'A botanical dictionary',
    authors: ['Bulliard, Pierre, 1752-1793.'],
    mode: 'Reference',
    role: 'Rights-cleared historical source from National Library of Medicine indexed for botany retrieval and comparison.',
    tags: ['botany', 'us rights lane', 'national library of medicine', 'historical corpus'],
    status: 'Public Domain Mark 1.0 source archived and indexed locally',
    notes:
      'Collected into the local Herbalisti corpus from National Library of Medicine. Topic families: Botany. Rights lane: US. Retrieval uses local normalized text and chunk indexes rather than copied display text.',
    sourceStatus: 'public_domain_mark',
    publisher: 'National Library of Medicine',
    externalUrl: 'https://collections.nlm.nih.gov/catalog/nlm%3Anlmuid-2165030R-bk',
    verificationSource: 'National Library of Medicine catalogue',
    citationNote: 'Rights: Public Domain Mark 1.0. Local ingest: Chunked. Review: Downloaded And Normalized.',
    rightsLane: 'US',
    searchRegions: ['US'],
  },
  {
    id: 'wellcome-adrgcmv2',
    title: '7 valuable plants / illustrated and described by Charles Adams, medical specialist ; with advice on indigestion.',
    authors: ['Unknown'],
    mode: 'Materia medica',
    role: 'Rights-cleared historical source from Wellcome Collection indexed for herbal retrieval and comparison.',
    tags: ['herbal', 'uk rights lane', 'wellcome collection', 'historical corpus'],
    status: 'Public Domain Mark source archived and indexed locally',
    notes:
      'Collected into the local Herbalisti corpus from Wellcome Collection. Topic families: Herbal. Rights lane: UK. Retrieval uses local normalized text and chunk indexes rather than copied display text.',
    sourceStatus: 'pdm',
    publisher: 'Wellcome Collection',
    publicationDate: '1902',
    externalUrl: 'https://wellcomecollection.org/works/adrgcmv2',
    verificationSource: 'Wellcome Collection catalogue',
    citationNote: 'Rights: Public Domain Mark. Local ingest: Chunked. Review: Downloaded And Normalized.',
    rightsLane: 'UK',
    searchRegions: ['UK'],
  },
]
