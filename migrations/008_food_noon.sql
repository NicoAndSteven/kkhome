-- Shared noon (lunch) food items — writable by all visitors
CREATE TABLE IF NOT EXISTS food_noon_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_food_noon_created_at ON food_noon_items (created_at DESC);
