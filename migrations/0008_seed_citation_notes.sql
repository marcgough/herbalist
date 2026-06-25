CREATE TABLE IF NOT EXISTS citation_notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  source_type TEXT NOT NULL,
  linked_record_id TEXT NOT NULL,
  linked_record_label TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  note TEXT NOT NULL,
  tags_json TEXT NOT NULL,
  review_status TEXT NOT NULL,
  last_reviewed TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_citation_notes_source_type ON citation_notes (source_type);
CREATE INDEX IF NOT EXISTS idx_citation_notes_linked_record_id ON citation_notes (linked_record_id);

INSERT OR REPLACE INTO citation_notes
(id, title, source_type, linked_record_id, linked_record_label, source_name, source_url, note, tags_json, review_status, last_reviewed)
VALUES
('medical-herbalism-catalogue', 'Medical Herbalism catalogue verification', 'reference', 'medical-herbalism-hoffmann', 'Medical Herbalism', 'Simon & Schuster publisher catalogue', 'https://www.simonandschuster.com/books/Medical-Herbalism/David-Hoffmann/9780892817498', 'Publisher metadata verifies the launch bibliography for title, author, imprint, ISBN, and page count. Herbalisti keeps this as a citation record until human-extracted topic notes are added.', '["book metadata","bibliography","source verification"]', 'citation_verified', '2026-06-16'),
('medicine-makers-catalogue', 'Medicine-maker handbook catalogue verification', 'reference', 'herbal-medicine-makers-handbook-green', 'The Herbal Medicine-Maker''s Handbook', 'Penguin Random House catalogue', 'https://www.penguinrandomhouse.com/books/198323/the-herbal-medicine-makers-handbook-by-james-green/', 'Publisher metadata supports the preparation-method reference record. The public site uses it as a structured source pointer rather than copying method text from the book.', '["preparations","book metadata","copyright-safe"]', 'citation_verified', '2026-06-16'),
('holistic-herbal-author-audit', 'Holistic herbal author correction audit', 'reference', 'complete-illustrated-holistic-herbal', 'The Complete Illustrated Holistic Herbal', 'Google Books catalogue record', 'https://books.google.com/books/about/The_Complete_Illustrated_Holistic_Herbal.html?id=QBJMAQAAIAAJ', 'Catalogue review corrected the inherited author mismatch and keeps the discrepancy visible as audit context.', '["bibliography","audit trail","source correction"]', 'bibliography_mismatch_corrected', '2026-06-16'),
('abc-companion-source', 'American Botanical Council companion source', 'reference', 'american-botanical-council', 'American Botanical Council source notes', 'American Botanical Council', 'https://www.herbalgram.org/', 'Companion public botanical source for terminology, botanical safety context, quality-control references, and public attribution during editorial review.', '["botanical safety","terminology","companion source"]', 'companion_source_indexed', '2026-06-16'),
('ginger-nccih-source', 'Ginger public-source remedy note', 'remedy', 'ginger', 'Ginger', 'NCCIH herb fact sheet', 'https://www.nccih.nih.gov/health/ginger', 'Public NCCIH source link anchors the ginger record with safety-led language, preparation context, and interaction review prompts rather than protocol advice.', '["ginger","safety watch","public source"]', 'public_source_indexed', '2026-06-16'),
('st-johns-wort-safety-watch', 'St. John''s wort interaction note', 'remedy', 'st-johns-wort', 'St. John''s wort', 'NCCIH herb fact sheet', 'https://www.nccih.nih.gov/health/st-johns-wort', 'This record stays safety-led because the herb has prominent medication-interaction review needs. The note is a public source pointer, not a recommendation.', '["interaction review","safety watch","editorial boundary"]', 'public_source_indexed', '2026-06-16'),
('green-tea-extract-watch', 'Green tea extract safety distinction', 'remedy', 'green-tea', 'Green tea', 'NCCIH herb fact sheet', 'https://www.nccih.nih.gov/health/green-tea', 'The source note distinguishes everyday tea context from concentrated extract safety review, keeping the public record precise and non-prescriptive.', '["green tea","extract safety","longevity adjacent"]', 'public_source_indexed', '2026-06-16'),
('pubmed-public-index', 'PubMed public research index note', 'signal', 'pubmed', 'PubMed / NCBI', 'NCBI', 'https://www.ncbi.nlm.nih.gov/', 'PubMed is treated as public research infrastructure for discovery. Article-level claims still require human review before being turned into Herbalisti commentary.', '["public research","signal feed","human review"]', 'public_infrastructure_allowed', '2026-06-16'),
('crossref-metadata-filter', 'Crossref metadata filtering note', 'signal', 'crossref', 'Crossref', 'Crossref', 'https://www.crossref.org/membership/terms/', 'Crossref is used as scholarly metadata infrastructure. Herbalisti applies relevance filters and blocked-source checks before items enter the public signal feed.', '["metadata","signal feed","source filtering"]', 'public_infrastructure_allowed', '2026-06-16'),
('fightaging-commentary-context', 'Fight Aging commentary context', 'governance', 'fightaging', 'Fight Aging!', 'Fight Aging!', 'https://www.fightaging.org/about/', 'Allowed as independent longevity commentary with disclosed-conflict context. It should not be treated as a primary research index or medical authority.', '["longevity commentary","conflict context","source governance"]', 'allowed_with_context', '2026-06-16');
