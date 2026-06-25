export type NewsItem = {
  id: string
  title: string
  sourceName: string
  url: string
  publishedAt: string
  summary: string
  topics: string[]
  sourceType: 'public-research-index' | 'preprint-server' | 'independent-longevity' | 'university-or-institute'
}

export const seedNews: NewsItem[] = [
  {
    id: 'seed-pubmed-longevity-healthspan',
    title: 'PubMed longevity and healthspan signal lane',
    sourceName: 'PubMed / NCBI',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=longevity+healthspan+senescence',
    publishedAt: '2026-06-15T00:00:00.000Z',
    summary:
      'Public biomedical metadata lane for longevity, healthspan, senescence, and rejuvenation research signals.',
    topics: ['Longevity'],
    sourceType: 'public-research-index',
  },
  {
    id: 'seed-pubmed-peptides',
    title: 'PubMed peptide research signal lane',
    sourceName: 'PubMed / NCBI',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=peptide+peptides+healthspan',
    publishedAt: '2026-06-15T00:00:00.000Z',
    summary:
      'Public biomedical metadata lane for peptide research and healthspan-adjacent therapeutic discovery.',
    topics: ['Peptides', 'Longevity'],
    sourceType: 'public-research-index',
  },
  {
    id: 'seed-arxiv-crispr-editing',
    title: 'arXiv CRISPR and gene editing signal lane',
    sourceName: 'arXiv',
    url: 'https://arxiv.org/search/advanced?terms-0-term=CRISPR&terms-0-operator=AND&terms-0-field=all',
    publishedAt: '2026-06-15T00:00:00.000Z',
    summary:
      'Open preprint metadata lane for CRISPR, genome editing, and computational biology signals.',
    topics: ['CRISPR', 'Gene editing'],
    sourceType: 'public-research-index',
  },
  {
    id: 'seed-biorxiv-dna-modification',
    title: 'bioRxiv DNA modification signal lane',
    sourceName: 'bioRxiv',
    url: 'https://www.biorxiv.org/search/epigenetic%2520methylation',
    publishedAt: '2026-06-15T00:00:00.000Z',
    summary:
      'Public preprint metadata lane for epigenetics, methylation, chromatin, and DNA modification signals.',
    topics: ['DNA modification'],
    sourceType: 'preprint-server',
  },
  {
    id: 'seed-crossref-gene-therapy',
    title: 'Crossref gene therapy metadata lane',
    sourceName: 'Crossref',
    url: 'https://api.crossref.org/works?query.bibliographic=gene%20therapy%20viral%20vector%20AAV',
    publishedAt: '2026-06-15T00:00:00.000Z',
    summary:
      'Public scholarly metadata lane for gene therapy, viral vectors, and frontier biomedical publishing.',
    topics: ['Gene therapy'],
    sourceType: 'public-research-index',
  },
  {
    id: 'seed-crossref-health-service',
    title: 'Crossref personalized health service metadata lane',
    sourceName: 'Crossref',
    url: 'https://api.crossref.org/works?query.bibliographic=personalized%20health%20digital%20health%20preventive%20health',
    publishedAt: '2026-06-15T00:00:00.000Z',
    summary:
      'Public scholarly metadata lane for personalized health, digital health, preventive health, and health as a service signals.',
    topics: ['Health as a service'],
    sourceType: 'public-research-index',
  },
  {
    id: 'seed-lifespan-independent-longevity',
    title: 'Lifespan.io independent longevity signal lane',
    sourceName: 'Lifespan.io',
    url: 'https://www.lifespan.io/news/',
    publishedAt: '2026-06-15T00:00:00.000Z',
    summary:
      'Independent longevity coverage lane for public research context and personally owned wellbeing decisions.',
    topics: ['Longevity', 'Self-sovereign wellbeing'],
    sourceType: 'independent-longevity',
  },
  {
    id: 'seed-fightaging-rejuvenation',
    title: 'Fight Aging independent rejuvenation commentary lane',
    sourceName: 'Fight Aging!',
    url: 'https://www.fightaging.org/',
    publishedAt: '2026-06-15T00:00:00.000Z',
    summary:
      'Independent longevity commentary lane for rejuvenation, healthspan, and source-traceable discovery context.',
    topics: ['Longevity', 'Self-sovereign wellbeing'],
    sourceType: 'independent-longevity',
  },
]
