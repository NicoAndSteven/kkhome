CREATE TABLE IF NOT EXISTS watchlist_symbols (
  id TEXT PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  display_name TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_watchlist_symbols_order ON watchlist_symbols (display_order, created_at);
