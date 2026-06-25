import { Database, Globe2, ShieldCheck, Zap } from 'lucide-react'

export type SourceRegistryItem = {
  id: string
  name: string
  feedName?: string
  url: string
  feedUrl?: string
  sourceType: string
  role: string
  notes?: string
  isAllowlisted: boolean
  isBigPharmaRelated: boolean
  independenceStatus: string
  ownershipReview: string
  reviewEvidenceUrl: string
  reviewCadence: string
  lastReviewed: string
  reviewNote: string
}

export const topicFilters = [
  'Longevity',
  'Peptides',
  'Gene therapy',
  'Gene editing',
  'DNA modification',
  'CRISPR',
  'Health as a service',
  'Self-sovereign wellbeing',
]

export const sourcePrinciples = [
  {
    title: 'Allowlist first',
    icon: ShieldCheck,
    body: 'Only approved public, academic, institute, or independent longevity sources enter the feed. Pharma-owned channels are excluded by default.',
  },
  {
    title: 'Metadata before opinion',
    icon: Database,
    body: 'The feed stores title, date, source, link, and topic tags first. Commentary can be added later with human review.',
  },
  {
    title: 'Refresh without lock-in',
    icon: Zap,
    body: 'The first production path uses public APIs, Cloudflare caching, and scheduled refreshes before paid search tools.',
  },
  {
    title: 'Trace every signal',
    icon: Globe2,
    body: 'Every card keeps a visible source link so users can move from signal to original publication or publisher.',
  },
]

export const sourceAllowlist: SourceRegistryItem[] = [
  {
    id: 'pubmed',
    name: 'NCBI / PubMed E-utilities',
    feedName: 'PubMed / NCBI',
    url: 'https://www.ncbi.nlm.nih.gov/home/develop/api/',
    feedUrl: '',
    sourceType: 'public-research-index',
    role: 'Public biomedical research index',
    notes: 'Public biomedical metadata with topic filters and source-name blocklist.',
    isAllowlisted: true,
    isBigPharmaRelated: false,
    independenceStatus: 'public-government-research-index',
    ownershipReview: 'US public biomedical information infrastructure; no Big Pharma ownership signal in launch review.',
    reviewEvidenceUrl: 'https://www.ncbi.nlm.nih.gov/',
    reviewCadence: 'quarterly_or_before_source_expansion',
    lastReviewed: '2026-06-16',
    reviewNote: 'Allowed as a public research index, not as editorial medical authority.',
  },
  {
    id: 'arxiv',
    name: 'arXiv API',
    feedName: 'arXiv',
    url: 'https://info.arxiv.org/help/api/user-manual.html',
    feedUrl: '',
    sourceType: 'public-research-index',
    role: 'Open preprint metadata for computational and quantitative biology',
    notes: 'Open preprint metadata for frontier-biology topics.',
    isAllowlisted: true,
    isBigPharmaRelated: false,
    independenceStatus: 'open-access-preprint-infrastructure',
    ownershipReview:
      'Cornell-hosted open-access service with independent nonprofit transition announced; no Big Pharma ownership signal in launch review.',
    reviewEvidenceUrl: 'https://info.arxiv.org/about/index.html',
    reviewCadence: 'quarterly_or_before_source_expansion',
    lastReviewed: '2026-06-16',
    reviewNote: 'Allowed as open preprint metadata; topic matching stays strict to reduce irrelevant frontier-biology results.',
  },
  {
    id: 'biorxiv',
    name: 'bioRxiv / medRxiv API',
    feedName: 'bioRxiv',
    url: 'https://api.biorxiv.org/',
    feedUrl: '',
    sourceType: 'preprint-server',
    role: 'Public preprint metadata for biology and medicine',
    notes: 'Public biology and medicine preprint metadata.',
    isAllowlisted: true,
    isBigPharmaRelated: false,
    independenceStatus: 'nonprofit-preprint-infrastructure',
    ownershipReview:
      'Cold Spring Harbor Laboratory preprint infrastructure; medRxiv partnership includes Yale and BMJ; no Big Pharma ownership signal in launch review.',
    reviewEvidenceUrl: 'https://www.cshl.edu/partner-with-us/preprints/',
    reviewCadence: 'quarterly_or_before_source_expansion',
    lastReviewed: '2026-06-16',
    reviewNote: 'Allowed as public preprint metadata; clinical claims still require human interpretation.',
  },
  {
    id: 'crossref',
    name: 'Crossref REST API',
    feedName: 'Crossref',
    url: 'https://www.crossref.org/documentation/retrieve-metadata/rest-api/',
    feedUrl: '',
    sourceType: 'public-research-index',
    role: 'Public scholarly metadata search',
    notes: 'Scholarly metadata enrichment source for current library and signal expansion.',
    isAllowlisted: true,
    isBigPharmaRelated: false,
    independenceStatus: 'not-for-profit-scholarly-infrastructure',
    ownershipReview: 'Not-for-profit scholarly metadata membership infrastructure; no Big Pharma ownership signal in launch review.',
    reviewEvidenceUrl: 'https://www.crossref.org/membership/terms/',
    reviewCadence: 'quarterly_or_before_source_expansion',
    lastReviewed: '2026-06-16',
    reviewNote: 'Allowed as metadata infrastructure; publisher-level records remain subject to title/source filtering.',
  },
  {
    id: 'lifespan',
    name: 'Lifespan.io',
    feedName: 'Lifespan.io',
    url: 'https://www.lifespan.io/news/',
    feedUrl: 'https://www.lifespan.io/feed/',
    sourceType: 'independent-longevity',
    role: 'Independent longevity coverage',
    notes: 'Independent longevity coverage.',
    isAllowlisted: true,
    isBigPharmaRelated: false,
    independenceStatus: 'independent-longevity-nonprofit',
    ownershipReview: 'Longevity advocacy and research institute source; no Big Pharma ownership signal in launch review.',
    reviewEvidenceUrl: 'https://lifespan.io/',
    reviewCadence: 'quarterly_or_before_source_expansion',
    lastReviewed: '2026-06-16',
    reviewNote: 'Allowed as independent longevity coverage with source traceability.',
  },
  {
    id: 'fightaging',
    name: 'Fight Aging!',
    feedName: 'Fight Aging!',
    url: 'https://www.fightaging.org/',
    feedUrl: 'https://www.fightaging.org/feed/',
    sourceType: 'independent-longevity',
    role: 'Independent longevity commentary',
    notes: 'Independent longevity commentary.',
    isAllowlisted: true,
    isBigPharmaRelated: false,
    independenceStatus: 'independent-longevity-commentary-disclosed-conflict',
    ownershipReview:
      'Independent longevity commentary source; writer discloses biotech company role, so content is labeled as commentary rather than primary evidence.',
    reviewEvidenceUrl: 'https://www.fightaging.org/about/',
    reviewCadence: 'quarterly_or_before_source_expansion',
    lastReviewed: '2026-06-16',
    reviewNote: 'Allowed as commentary with disclosed conflict context, not as a primary research index.',
  },
]
