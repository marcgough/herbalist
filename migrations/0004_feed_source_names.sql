ALTER TABLE feed_sources ADD COLUMN feed_name TEXT NOT NULL DEFAULT '';

UPDATE feed_sources
SET feed_name = 'PubMed / NCBI'
WHERE id = 'pubmed';

UPDATE feed_sources
SET feed_name = 'arXiv'
WHERE id = 'arxiv';

UPDATE feed_sources
SET feed_name = 'bioRxiv'
WHERE id = 'biorxiv';

UPDATE feed_sources
SET feed_name = 'Crossref'
WHERE id = 'crossref';

UPDATE feed_sources
SET feed_name = 'Lifespan.io'
WHERE id = 'lifespan';

UPDATE feed_sources
SET feed_name = 'Fight Aging!'
WHERE id = 'fightaging';
