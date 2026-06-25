ALTER TABLE reference_books ADD COLUMN subtitle TEXT NOT NULL DEFAULT '';
ALTER TABLE reference_books ADD COLUMN publisher TEXT NOT NULL DEFAULT '';
ALTER TABLE reference_books ADD COLUMN published_date TEXT NOT NULL DEFAULT '';
ALTER TABLE reference_books ADD COLUMN isbn_13 TEXT NOT NULL DEFAULT '';
ALTER TABLE reference_books ADD COLUMN pages INTEGER NOT NULL DEFAULT 0;
ALTER TABLE reference_books ADD COLUMN external_url TEXT NOT NULL DEFAULT '';
ALTER TABLE reference_books ADD COLUMN verification_source TEXT NOT NULL DEFAULT '';
ALTER TABLE reference_books ADD COLUMN citation_note TEXT NOT NULL DEFAULT '';

UPDATE reference_books
SET
  subtitle = 'The Science and Practice of Herbal Medicine',
  status = 'Publisher citation verified; structured extraction pending',
  source_status = 'citation_verified',
  publisher = 'Healing Arts Press / Inner Traditions',
  published_date = '2003',
  isbn_13 = '9780892817498',
  pages = 672,
  external_url = 'https://www.simonandschuster.com/books/Medical-Herbalism/David-Hoffmann/9780892817498',
  verification_source = 'Simon & Schuster publisher catalogue',
  citation_note = 'Verified against publisher catalogue for title, author, publisher imprint, ISBN, and page count.'
WHERE id = 'medical-herbalism-hoffmann';

UPDATE reference_books
SET
  subtitle = 'A Home Manual',
  status = 'Publisher citation verified; preparation taxonomy ready',
  source_status = 'citation_verified',
  publisher = 'Crossing Press',
  published_date = '2000-09-01',
  isbn_13 = '9780895949905',
  pages = 384,
  external_url = 'https://www.penguinrandomhouse.com/books/198323/the-herbal-medicine-makers-handbook-by-james-green/',
  verification_source = 'Penguin Random House publisher catalogue',
  citation_note = 'Verified against publisher catalogue for title, author, imprint, publication date, ISBN, and page count.'
WHERE id = 'herbal-medicine-makers-handbook-green';

UPDATE reference_books
SET
  subtitle = 'A Safe and Practical Guide to Making and Using Herbal Remedies',
  authors_json = '["David Hoffmann"]',
  role = 'Illustrated holistic herbal reference in the foundational bibliography; corrected metadata remains visible for audit.',
  status = 'Author corrected during bibliographic verification',
  notes = 'Early bibliography data listed Jeoffrey Ainsworth and Anne McIntyre. Catalogue records identify David Hoffmann as author for this title and edition.',
  source_status = 'bibliography_author_mismatch_corrected',
  publisher = 'Element Books',
  published_date = '1996',
  isbn_13 = '9781852308476',
  pages = 256,
  external_url = 'https://books.google.com/books/about/The_Complete_Illustrated_Holistic_Herbal.html?id=QBJMAQAAIAAJ',
  verification_source = 'Google Books catalogue record',
  citation_note = 'Catalogue verification corrected the author inherited from the source plan.'
WHERE id = 'complete-illustrated-holistic-herbal';

UPDATE reference_books
SET
  status = 'Companion source in the foundational bibliography',
  source_status = 'companion_source',
  publisher = 'American Botanical Council',
  external_url = 'https://www.herbalgram.org/',
  verification_source = 'American Botanical Council website',
  citation_note = 'Companion public reference source rather than a book record.'
WHERE id = 'american-botanical-council';
