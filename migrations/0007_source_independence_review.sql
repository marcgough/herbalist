ALTER TABLE feed_sources ADD COLUMN independence_status TEXT NOT NULL DEFAULT '';
ALTER TABLE feed_sources ADD COLUMN ownership_review TEXT NOT NULL DEFAULT '';
ALTER TABLE feed_sources ADD COLUMN review_evidence_url TEXT NOT NULL DEFAULT '';
ALTER TABLE feed_sources ADD COLUMN review_cadence TEXT NOT NULL DEFAULT 'quarterly_or_before_source_expansion';
ALTER TABLE feed_sources ADD COLUMN last_reviewed TEXT NOT NULL DEFAULT '';
ALTER TABLE feed_sources ADD COLUMN review_note TEXT NOT NULL DEFAULT '';

UPDATE feed_sources
SET
  independence_status = 'public-government-research-index',
  ownership_review = 'US public biomedical information infrastructure; no Big Pharma ownership signal in launch review.',
  review_evidence_url = 'https://www.ncbi.nlm.nih.gov/',
  review_cadence = 'quarterly_or_before_source_expansion',
  last_reviewed = '2026-06-16',
  review_note = 'Allowed as a public research index, not as editorial medical authority.'
WHERE id = 'pubmed';

UPDATE feed_sources
SET
  independence_status = 'open-access-preprint-infrastructure',
  ownership_review = 'Cornell-hosted open-access service with independent nonprofit transition announced; no Big Pharma ownership signal in launch review.',
  review_evidence_url = 'https://info.arxiv.org/about/index.html',
  review_cadence = 'quarterly_or_before_source_expansion',
  last_reviewed = '2026-06-16',
  review_note = 'Allowed as open preprint metadata; topic matching stays strict to reduce irrelevant frontier-biology results.'
WHERE id = 'arxiv';

UPDATE feed_sources
SET
  independence_status = 'nonprofit-preprint-infrastructure',
  ownership_review = 'Cold Spring Harbor Laboratory preprint infrastructure; medRxiv partnership includes Yale and BMJ; no Big Pharma ownership signal in launch review.',
  review_evidence_url = 'https://www.cshl.edu/partner-with-us/preprints/',
  review_cadence = 'quarterly_or_before_source_expansion',
  last_reviewed = '2026-06-16',
  review_note = 'Allowed as public preprint metadata; clinical claims still require human interpretation.'
WHERE id = 'biorxiv';

UPDATE feed_sources
SET
  notes = 'Scholarly metadata enrichment source for current library and signal expansion.',
  independence_status = 'not-for-profit-scholarly-infrastructure',
  ownership_review = 'Not-for-profit scholarly metadata membership infrastructure; no Big Pharma ownership signal in launch review.',
  review_evidence_url = 'https://www.crossref.org/membership/terms/',
  review_cadence = 'quarterly_or_before_source_expansion',
  last_reviewed = '2026-06-16',
  review_note = 'Allowed as metadata infrastructure; publisher-level records remain subject to title/source filtering.'
WHERE id = 'crossref';

UPDATE feed_sources
SET
  independence_status = 'independent-longevity-nonprofit',
  ownership_review = 'Longevity advocacy and research institute source; no Big Pharma ownership signal in launch review.',
  review_evidence_url = 'https://lifespan.io/',
  review_cadence = 'quarterly_or_before_source_expansion',
  last_reviewed = '2026-06-16',
  review_note = 'Allowed as independent longevity coverage with source traceability.'
WHERE id = 'lifespan';

UPDATE feed_sources
SET
  independence_status = 'independent-longevity-commentary-disclosed-conflict',
  ownership_review = 'Independent longevity commentary source; writer discloses biotech company role, so content is labeled as commentary rather than primary evidence.',
  review_evidence_url = 'https://www.fightaging.org/about/',
  review_cadence = 'quarterly_or_before_source_expansion',
  last_reviewed = '2026-06-16',
  review_note = 'Allowed as commentary with disclosed conflict context, not as a primary research index.'
WHERE id = 'fightaging';
