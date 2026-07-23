-- Shared evening (dinner) custom recipes — writable by all visitors
CREATE TABLE IF NOT EXISTS food_evening_custom_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_food_evening_created_at ON food_evening_custom_items (created_at DESC);

-- Shared disabled built-in recipe IDs for evening
CREATE TABLE IF NOT EXISTS food_evening_disabled_ids (
  recipe_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);
