/* global crypto */

const resourceConfig = {
  undercover: {
    table: 'party_undercover_word_pairs',
    normalize(row) {
      return {
        id: String(row.id),
        civilianWord: String(row.civilian_word),
        undercoverWord: String(row.undercover_word),
        category: String(row.category),
        difficulty: row.difficulty === 'normal' ? 'normal' : 'easy',
        enabled: Number(row.enabled) === 1,
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at),
      }
    },
  },
  'truth-or-dare': {
    table: 'party_truth_or_dare_cards',
    normalize(row) {
      return {
        id: String(row.id),
        type: row.type === 'dare' ? 'dare' : 'truth',
        content: String(row.content),
        category: String(row.category),
        intensity: ['soft', 'normal', 'spicy'].includes(String(row.intensity)) ? String(row.intensity) : 'soft',
        enabled: Number(row.enabled) === 1,
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at),
      }
    },
  },
}

const cleanText = (value) => String(value ?? '').trim()

const ensureLength = (name, value, min, max) => {
  if (value.length < min || value.length > max) {
    throw new Error(`${name} must be ${min}-${max} chars`)
  }
}

const slugPart = (value) => cleanText(value)
  .toLowerCase()
  .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 32)

const createId = (prefix, parts) => {
  const readable = parts.map(slugPart).filter(Boolean).join('-')
  const suffix = crypto.randomUUID().slice(0, 8)
  return readable ? `${prefix}-${readable}-${suffix}` : `${prefix}-${suffix}`
}

const validateUndercover = (payload) => {
  const civilianWord = cleanText(payload.civilianWord)
  const undercoverWord = cleanText(payload.undercoverWord)
  const category = cleanText(payload.category || '生活')
  const difficulty = cleanText(payload.difficulty || 'easy')

  ensureLength('civilianWord', civilianWord, 1, 24)
  ensureLength('undercoverWord', undercoverWord, 1, 24)
  ensureLength('category', category, 1, 16)
  if (civilianWord === undercoverWord) throw new Error('civilianWord and undercoverWord must differ')
  if (!['easy', 'normal'].includes(difficulty)) throw new Error('difficulty must be easy or normal')

  return {
    civilianWord,
    undercoverWord,
    category,
    difficulty,
    enabled: payload.enabled === false ? 0 : 1,
  }
}

const validateCard = (payload) => {
  const type = cleanText(payload.type || 'truth')
  const content = cleanText(payload.content)
  const category = cleanText(payload.category || '轻松')
  const intensity = cleanText(payload.intensity || 'soft')

  if (!['truth', 'dare'].includes(type)) throw new Error('type must be truth or dare')
  ensureLength('content', content, 4, 80)
  ensureLength('category', category, 1, 16)
  if (!['soft', 'normal', 'spicy'].includes(intensity)) throw new Error('intensity must be soft, normal, or spicy')

  return {
    type,
    content,
    category,
    intensity,
    enabled: payload.enabled === false ? 0 : 1,
  }
}

export const getPartyResourceConfig = (resource) => {
  const config = resourceConfig[resource]
  if (!config) throw new Error('unknown party content resource')
  return config
}

export const listPartyContent = async (db, resource) => {
  const config = getPartyResourceConfig(resource)
  const result = await db.prepare(`
    SELECT *
    FROM ${config.table}
    ORDER BY enabled DESC, updated_at DESC
    LIMIT 500
  `).all()

  return {
    items: (result.results ?? []).map(config.normalize),
  }
}

export const createPartyContent = async (db, resource, payload) => {
  const now = new Date().toISOString()

  if (resource === 'undercover') {
    const value = validateUndercover(payload)
    const id = cleanText(payload.id) || createId('word', [value.civilianWord, value.undercoverWord])
    await db.prepare(`
      INSERT INTO party_undercover_word_pairs
        (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, value.civilianWord, value.undercoverWord, value.category, value.difficulty, value.enabled, now, now).run()
    const row = await db.prepare('SELECT * FROM party_undercover_word_pairs WHERE id = ?').bind(id).first()
    return { item: getPartyResourceConfig(resource).normalize(row) }
  }

  const value = validateCard(payload)
  const id = cleanText(payload.id) || createId(value.type, [value.category])
  await db.prepare(`
    INSERT INTO party_truth_or_dare_cards
      (id, type, content, category, intensity, enabled, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, value.type, value.content, value.category, value.intensity, value.enabled, now, now).run()
  const row = await db.prepare('SELECT * FROM party_truth_or_dare_cards WHERE id = ?').bind(id).first()
  return { item: getPartyResourceConfig(resource).normalize(row) }
}

export const updatePartyContent = async (db, resource, id, payload) => {
  const now = new Date().toISOString()
  const normalizedId = cleanText(id)
  if (!normalizedId) throw new Error('id is required')

  if (resource === 'undercover') {
    const current = await db.prepare('SELECT * FROM party_undercover_word_pairs WHERE id = ?').bind(normalizedId).first()
    if (!current) {
      const error = new Error('content not found')
      error.status = 404
      throw error
    }
    const value = validateUndercover(payload)
    await db.prepare(`
      UPDATE party_undercover_word_pairs
      SET civilian_word = ?, undercover_word = ?, category = ?, difficulty = ?, enabled = ?, updated_at = ?
      WHERE id = ?
    `).bind(value.civilianWord, value.undercoverWord, value.category, value.difficulty, value.enabled, now, normalizedId).run()
    const row = await db.prepare('SELECT * FROM party_undercover_word_pairs WHERE id = ?').bind(normalizedId).first()
    return { item: getPartyResourceConfig(resource).normalize(row) }
  }

  const current = await db.prepare('SELECT * FROM party_truth_or_dare_cards WHERE id = ?').bind(normalizedId).first()
  if (!current) {
    const error = new Error('content not found')
    error.status = 404
    throw error
  }
  const value = validateCard(payload)
  await db.prepare(`
    UPDATE party_truth_or_dare_cards
    SET type = ?, content = ?, category = ?, intensity = ?, enabled = ?, updated_at = ?
    WHERE id = ?
  `).bind(value.type, value.content, value.category, value.intensity, value.enabled, now, normalizedId).run()
  const row = await db.prepare('SELECT * FROM party_truth_or_dare_cards WHERE id = ?').bind(normalizedId).first()
  return { item: getPartyResourceConfig(resource).normalize(row) }
}
