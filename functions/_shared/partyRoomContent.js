const fallbackWordPairs = [
  { id: 'fruit-apple-pear', civilianWord: '苹果', undercoverWord: '梨', category: '生活', difficulty: 'easy' },
  { id: 'drink-coffee-milk-tea', civilianWord: '咖啡', undercoverWord: '奶茶', category: '生活', difficulty: 'easy' },
  { id: 'place-cinema-theater', civilianWord: '电影院', undercoverWord: '剧场', category: '地点', difficulty: 'normal' },
]

const fallbackCards = [
  { id: 'truth-recent-laugh', type: 'truth', content: '最近一次笑到停不下来是因为什么？', category: '轻松', intensity: 'soft' },
  { id: 'dare-host-voice', type: 'dare', content: '用主持人的语气宣布下一轮开始。', category: '表演', intensity: 'normal' },
  { id: 'dare-pose-photo', type: 'dare', content: '摆一个胜利姿势，保持 5 秒。', category: '互动', intensity: 'soft' },
]

const randomItem = (items) => items[Math.floor(Math.random() * items.length)] ?? null

export const pickUndercoverWordPair = async (db, category = '') => {
  if (!db?.prepare) {
    return randomItem(fallbackWordPairs.filter((item) => !category || item.category === category)) ?? fallbackWordPairs[0]
  }

  const normalizedCategory = String(category || '').trim()
  const scoped = normalizedCategory
    ? await db.prepare(`
      SELECT id, civilian_word, undercover_word, category, difficulty
      FROM party_undercover_word_pairs
      WHERE enabled = 1 AND category = ?
      ORDER BY RANDOM()
      LIMIT 1
    `).bind(normalizedCategory).first()
    : null

  const row = scoped ?? await db.prepare(`
    SELECT id, civilian_word, undercover_word, category, difficulty
    FROM party_undercover_word_pairs
    WHERE enabled = 1
    ORDER BY RANDOM()
    LIMIT 1
  `).first()

  if (!row) {
    return randomItem(fallbackWordPairs.filter((item) => !normalizedCategory || item.category === normalizedCategory)) ?? fallbackWordPairs[0]
  }

  return {
    id: String(row.id),
    civilianWord: String(row.civilian_word),
    undercoverWord: String(row.undercover_word),
    category: String(row.category),
    difficulty: row.difficulty === 'normal' ? 'normal' : 'easy',
  }
}

export const pickTruthOrDareCard = async (db, requestedType = 'random') => {
  const type = ['truth', 'dare'].includes(requestedType) ? requestedType : null

  if (!db?.prepare) {
    const fallback = type ? fallbackCards.filter((item) => item.type === type) : fallbackCards
    return randomItem(fallback) ?? fallbackCards[0]
  }

  const row = type
    ? await db.prepare(`
      SELECT id, type, content, category, intensity
      FROM party_truth_or_dare_cards
      WHERE enabled = 1 AND type = ?
      ORDER BY RANDOM()
      LIMIT 1
    `).bind(type).first()
    : await db.prepare(`
      SELECT id, type, content, category, intensity
      FROM party_truth_or_dare_cards
      WHERE enabled = 1
      ORDER BY RANDOM()
      LIMIT 1
    `).first()

  if (!row) {
    const fallback = type ? fallbackCards.filter((item) => item.type === type) : fallbackCards
    return randomItem(fallback) ?? fallbackCards[0]
  }

  return {
    id: String(row.id),
    type: row.type === 'dare' ? 'dare' : 'truth',
    content: String(row.content),
    category: String(row.category),
    intensity: ['soft', 'normal', 'spicy'].includes(String(row.intensity)) ? String(row.intensity) : 'soft',
  }
}
