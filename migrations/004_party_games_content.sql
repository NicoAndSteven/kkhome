CREATE TABLE IF NOT EXISTS party_undercover_word_pairs (
  id TEXT PRIMARY KEY,
  civilian_word TEXT NOT NULL,
  undercover_word TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'normal')),
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_party_undercover_enabled ON party_undercover_word_pairs (enabled);
CREATE INDEX IF NOT EXISTS idx_party_undercover_category ON party_undercover_word_pairs (category);

CREATE TABLE IF NOT EXISTS party_truth_or_dare_cards (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('truth', 'dare')),
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  intensity TEXT NOT NULL CHECK (intensity IN ('soft', 'normal', 'spicy')),
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_party_cards_enabled ON party_truth_or_dare_cards (enabled);
CREATE INDEX IF NOT EXISTS idx_party_cards_type ON party_truth_or_dare_cards (type);
CREATE INDEX IF NOT EXISTS idx_party_cards_category ON party_truth_or_dare_cards (category);

CREATE TABLE IF NOT EXISTS party_game_settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT OR IGNORE INTO party_undercover_word_pairs
  (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at)
VALUES
  ('fruit-apple-pear', '苹果', '梨', '生活', 'easy', 1, '2026-07-07T00:00:00.000Z', '2026-07-07T00:00:00.000Z'),
  ('drink-coffee-milk-tea', '咖啡', '奶茶', '生活', 'easy', 1, '2026-07-07T00:00:00.000Z', '2026-07-07T00:00:00.000Z'),
  ('place-cinema-theater', '电影院', '剧场', '地点', 'normal', 1, '2026-07-07T00:00:00.000Z', '2026-07-07T00:00:00.000Z'),
  ('tool-keyboard-mouse', '键盘', '鼠标', '物品', 'easy', 1, '2026-07-07T00:00:00.000Z', '2026-07-07T00:00:00.000Z'),
  ('food-hotpot-bbq', '火锅', '烧烤', '食物', 'easy', 1, '2026-07-07T00:00:00.000Z', '2026-07-07T00:00:00.000Z'),
  ('weather-sunny-cloudy', '晴天', '阴天', '生活', 'easy', 1, '2026-07-07T00:00:00.000Z', '2026-07-07T00:00:00.000Z'),
  ('sport-basketball-football', '篮球', '足球', '运动', 'normal', 1, '2026-07-07T00:00:00.000Z', '2026-07-07T00:00:00.000Z'),
  ('device-phone-tablet', '手机', '平板', '物品', 'easy', 1, '2026-07-07T00:00:00.000Z', '2026-07-07T00:00:00.000Z');

INSERT OR IGNORE INTO party_truth_or_dare_cards
  (id, type, content, category, intensity, enabled, created_at, updated_at)
VALUES
  ('truth-recent-laugh', 'truth', '最近一次笑到停不下来是因为什么？', '轻松', 'soft', 1, '2026-07-07T00:00:00.000Z', '2026-07-07T00:00:00.000Z'),
  ('truth-favorite-player', 'truth', '这局里你最想和谁组队？', '社交', 'normal', 1, '2026-07-07T00:00:00.000Z', '2026-07-07T00:00:00.000Z'),
  ('truth-hidden-habit', 'truth', '说一个你的小习惯。', '轻松', 'soft', 1, '2026-07-07T00:00:00.000Z', '2026-07-07T00:00:00.000Z'),
  ('truth-first-impression', 'truth', '说说你对右边玩家的第一印象。', '社交', 'normal', 1, '2026-07-07T00:00:00.000Z', '2026-07-07T00:00:00.000Z'),
  ('dare-compliment-left', 'dare', '认真夸一下你左边的人，至少说两句。', '互动', 'soft', 1, '2026-07-07T00:00:00.000Z', '2026-07-07T00:00:00.000Z'),
  ('dare-pose-photo', 'dare', '摆一个胜利姿势，保持 5 秒。', '互动', 'soft', 1, '2026-07-07T00:00:00.000Z', '2026-07-07T00:00:00.000Z'),
  ('dare-host-voice', 'dare', '用主持人的语气宣布下一轮开始。', '表演', 'normal', 1, '2026-07-07T00:00:00.000Z', '2026-07-07T00:00:00.000Z'),
  ('dare-one-line-song', 'dare', '哼一句最近常听的歌，让大家猜歌名。', '表演', 'normal', 1, '2026-07-07T00:00:00.000Z', '2026-07-07T00:00:00.000Z');

INSERT OR IGNORE INTO party_game_settings
  (key, value_json, updated_at)
VALUES
  ('content_version', '{"version":1,"source":"004_party_games_content"}', '2026-07-07T00:00:00.000Z');
