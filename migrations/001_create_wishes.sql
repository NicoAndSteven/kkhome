CREATE TABLE IF NOT EXISTS wishes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  detail TEXT,
  category TEXT NOT NULL,
  author TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_wishes_created_at ON wishes (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wishes_status ON wishes (status);

CREATE TABLE IF NOT EXISTS wish_submission_limits (
  submitter_hash TEXT PRIMARY KEY,
  last_submitted_at TEXT NOT NULL
);
