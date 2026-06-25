CREATE TABLE IF NOT EXISTS reference_books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  authors_json TEXT NOT NULL,
  mode TEXT NOT NULL,
  role TEXT NOT NULL,
  tags_json TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT NOT NULL,
  source_status TEXT NOT NULL DEFAULT 'needs_verification',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feed_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  feed_url TEXT,
  source_type TEXT NOT NULL,
  is_allowlisted INTEGER NOT NULL DEFAULT 1,
  is_big_pharma_related INTEGER NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  url TEXT NOT NULL,
  published_at TEXT NOT NULL,
  summary TEXT NOT NULL,
  topics_json TEXT NOT NULL,
  source_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_news_items_published_at ON news_items (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_items_source_name ON news_items (source_name);

CREATE TABLE IF NOT EXISTS media_jobs (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  status TEXT NOT NULL,
  prompt TEXT NOT NULL,
  input_json TEXT NOT NULL,
  provider_task_id TEXT,
  result_url TEXT,
  local_asset_path TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_media_jobs_status ON media_jobs (status);
