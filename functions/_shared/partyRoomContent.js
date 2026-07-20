const fallbackWordPairs = [
  { id: 'food-apple-pear', civilianWord: '苹果', undercoverWord: '梨', category: '食物', difficulty: 'easy' },
  { id: 'drink-coffee-milk-tea', civilianWord: '咖啡', undercoverWord: '奶茶', category: '饮品', difficulty: 'easy' },
  { id: 'place-cinema-theater', civilianWord: '电影院', undercoverWord: '剧场', category: '地点', difficulty: 'normal' },
  { id: 'animal-cat-dog', civilianWord: '猫', undercoverWord: '狗', category: '动物', difficulty: 'easy' },
  { id: 'sport-basketball-football', civilianWord: '篮球', undercoverWord: '足球', category: '运动', difficulty: 'normal' },
  { id: 'job-teacher-professor', civilianWord: '老师', undercoverWord: '教授', category: '职业', difficulty: 'normal' },
]

const fallbackCards = [
  { id: 'truth-easy-laugh', type: 'truth', content: '最近一次笑到停不下来是因为什么？', category: '轻松', intensity: 'soft' },
  { id: 'truth-easy-song', type: 'truth', content: '最近单曲循环的歌是哪首？', category: '轻松', intensity: 'soft' },
  { id: 'truth-social-teammate', type: 'truth', content: '这局里你最想和谁组队？为什么？', category: '社交', intensity: 'normal' },
  { id: 'truth-spicy-crush', type: 'truth', content: '最近有没有心动的人？', category: '刺激', intensity: 'spicy' },
  { id: 'dare-chat-compliment', type: 'dare', content: '认真夸一下你左边的人，至少说两个优点。', category: '互动', intensity: 'soft' },
  { id: 'dare-act-host', type: 'dare', content: '用主持人的语气宣布下一轮开始。', category: '表演', intensity: 'normal' },
  { id: 'dare-fun-impersonate', type: 'dare', content: '模仿一个在场的人，让大家猜是谁。', category: '搞怪', intensity: 'normal' },
  { id: 'dare-brain-invent', type: 'dare', content: '即兴发明一个不存在的产品，做 30 秒推销。', category: '脑洞', intensity: 'normal' },
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

export const pickTruthOrDareCard = async (db, requestedType = 'random', opts = {}) => {
  const type = ['truth', 'dare'].includes(requestedType) ? requestedType : null
  const category = opts.category ?? null
  const intensity = opts.intensity ?? null
  const excludeIds = Array.isArray(opts.excludeIds) && opts.excludeIds.length > 0 ? opts.excludeIds : []

  const fallbackFiltered = (items) => {
    let filtered = items
    if (type) filtered = filtered.filter((item) => item.type === type)
    if (category) filtered = filtered.filter((item) => item.category === category)
    if (intensity) filtered = filtered.filter((item) => item.intensity === intensity)
    if (excludeIds.length > 0) filtered = filtered.filter((item) => !excludeIds.includes(item.id))
    if (filtered.length === 0 && excludeIds.length > 0) {
      // All matching cards exhausted — recycle: remove exclusion filter
      filtered = items
      if (type) filtered = filtered.filter((item) => item.type === type)
      if (category) filtered = filtered.filter((item) => item.category === category)
      if (intensity) filtered = filtered.filter((item) => item.intensity === intensity)
    }
    return filtered.length > 0 ? filtered : items
  }

  if (!db?.prepare) {
    return randomItem(fallbackFiltered(fallbackCards)) ?? fallbackCards[0]
  }

  // Build dynamic query with optional filters + exclusion
  const conditions = ['enabled = 1']
  const params = []
  if (type) { conditions.push('type = ?'); params.push(type) }
  if (category) { conditions.push('category = ?'); params.push(category) }
  if (intensity) { conditions.push('intensity = ?'); params.push(intensity) }
  // Add NOT IN for up to 50 excluded IDs (D1 supports variable ? placeholders)
  const exclude = excludeIds.slice(0, 50)
  if (exclude.length > 0) {
    const placeholders = exclude.map(() => '?').join(', ')
    conditions.push(`id NOT IN (${placeholders})`)
    params.push(...exclude)
  }

  const where = conditions.join(' AND ')
  const sql = `SELECT id, type, content, category, intensity FROM party_truth_or_dare_cards WHERE ${where} ORDER BY RANDOM() LIMIT 3`

  const stmt = params.length > 0 ? db.prepare(sql).bind(...params) : db.prepare(sql)
  const result = await stmt.all()
  const rows = result?.results ?? []

  // If nothing found with exclusion, retry without exclusion (recycle)
  if (rows.length === 0 && exclude.length > 0) {
    const retryConditions = conditions.slice(0, -1) // remove the NOT IN
    const retryParams = params.slice(0, params.length - exclude.length)
    const retryWhere = retryConditions.join(' AND ')
    const retrySql = `SELECT id, type, content, category, intensity FROM party_truth_or_dare_cards WHERE ${retryWhere} ORDER BY RANDOM() LIMIT 1`
    const retryStmt = retryParams.length > 0 ? db.prepare(retrySql).bind(...retryParams) : db.prepare(retrySql)
    const retryRow = await retryStmt.first()
    if (retryRow) rows.push(retryRow)
  }

  const row = rows[0]
  if (!row) {
    return randomItem(fallbackFiltered(fallbackCards)) ?? fallbackCards[0]
  }

  return {
    id: String(row.id),
    type: row.type === 'dare' ? 'dare' : 'truth',
    content: String(row.content),
    category: String(row.category),
    intensity: ['soft', 'normal', 'spicy'].includes(String(row.intensity)) ? String(row.intensity) : 'soft',
  }
}

// ── Category listing ──────────────────────────────

// Hardcoded categories that match the migration content.
// These are returned when D1 is unavailable; when D1 is available we
// query distinct categories from the live tables.
const UNDERCOVER_CATEGORIES = ['食物', '饮品', '地点', '物品', '交通', '职业', '动物', '影视', '运动', '自然', '品牌', '网络热梗', '节日', '游戏', '音乐', '文学', '科技']
const TRUTH_OR_DARE_CATEGORIES = ['轻松', '社交', '刺激', '互动', '表演', '搞怪', '情侣', '默契挑战', '脑洞', '才艺展示', '回忆杀', '快问快答']
const INTENSITY_OPTIONS = ['soft', 'normal', 'spicy']

export const listUndercoverCategories = async (db) => {
  if (!db?.prepare) return UNDERCOVER_CATEGORIES
  const rows = await db.prepare(
    `SELECT DISTINCT category FROM party_undercover_word_pairs WHERE enabled = 1 ORDER BY category`
  ).all()
  if (!rows.results?.length) return UNDERCOVER_CATEGORIES
  return rows.results.map((r) => String(r.category))
}

export const listTruthOrDareCategories = async (db) => {
  if (!db?.prepare) return TRUTH_OR_DARE_CATEGORIES
  const rows = await db.prepare(
    `SELECT DISTINCT category FROM party_truth_or_dare_cards WHERE enabled = 1 ORDER BY category`
  ).all()
  if (!rows.results?.length) return TRUTH_OR_DARE_CATEGORIES
  return rows.results.map((r) => String(r.category))
}

export const listIntensityOptions = () => INTENSITY_OPTIONS
