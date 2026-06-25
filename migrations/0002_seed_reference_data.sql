INSERT OR IGNORE INTO reference_books (
  id,
  title,
  authors_json,
  mode,
  role,
  tags_json,
  status,
  notes,
  source_status
) VALUES
(
  'medical-herbalism-hoffmann',
  'Medical Herbalism',
  '["David Hoffmann"]',
  'Materia medica',
  'Core materia medica and clinical herbalism reference for herb profiles, actions, energetics, preparations, and safety notes.',
  '["herbal actions","materia medica","safety","preparations","tradition"]',
  'Bibliography indexed; structured extraction pending',
  'Use as a source-index record only until chapter-level notes are manually extracted and checked.',
  'needs_structured_extraction'
),
(
  'herbal-medicine-makers-handbook-green',
  'The Herbal Medicine-Maker''s Handbook',
  '["James Green"]',
  'Making',
  'Practical preparation reference for tinctures, infusions, salves, oils, vinegars, syrups, and hands-on medicine making.',
  '["preparations","formulation","home apothecary","practical method"]',
  'Bibliography indexed; preparation taxonomy ready',
  'Good candidate for extracting method-level records without copying substantial copyrighted text.',
  'needs_structured_extraction'
),
(
  'complete-illustrated-holistic-herbal',
  'The Complete Illustrated Holistic Herbal',
  '["Jeoffrey Ainsworth","Anne McIntyre"]',
  'Reference',
  'Illustrated holistic herbal reference in the foundational bibliography; bibliographic details should be verified before publication.',
  '["holistic herbalism","illustrated reference","traditional use","source verification"]',
  'Bibliography indexed; bibliographic verification needed',
  'Early bibliography data named these authors. Verify edition, authorship, and citation format before publication.',
  'needs_bibliographic_verification'
),
(
  'american-botanical-council',
  'American Botanical Council source notes',
  '["American Botanical Council"]',
  'Safety',
  'Non-book companion source for terminology, herb safety, quality-control references, and industry context.',
  '["botanical safety","quality","source checking","external reference"]',
  'Companion source in the foundational bibliography',
  'Use for cross-checking and citations. Keep full source attribution in the public database.',
  'companion_source'
);

INSERT OR IGNORE INTO feed_sources (
  id,
  name,
  url,
  feed_url,
  source_type,
  notes
) VALUES
('pubmed', 'NCBI / PubMed E-utilities', 'https://www.ncbi.nlm.nih.gov/home/develop/api/', NULL, 'public-research-index', 'Public biomedical metadata. Query with topic filters and source-name blocklist.'),
('arxiv', 'arXiv API', 'https://info.arxiv.org/help/api/user-manual.html', NULL, 'public-research-index', 'Open preprint metadata. Keep title-level matching strict to reduce unrelated computational results.'),
('biorxiv', 'bioRxiv / medRxiv API', 'https://api.biorxiv.org/', NULL, 'preprint-server', 'Public biology and medicine preprint metadata.'),
('crossref', 'Crossref REST API', 'https://www.crossref.org/documentation/retrieve-metadata/rest-api/', NULL, 'public-research-index', 'Future scholarly metadata enrichment source.'),
('lifespan', 'Lifespan.io', 'https://www.lifespan.io/news/', 'https://www.lifespan.io/feed/', 'independent-longevity', 'Independent longevity coverage.'),
('fightaging', 'Fight Aging!', 'https://www.fightaging.org/', 'https://www.fightaging.org/feed/', 'independent-longevity', 'Independent longevity commentary.');
