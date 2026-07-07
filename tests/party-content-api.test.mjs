import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createPartyContent,
  listPartyContent,
  updatePartyContent,
} from '../functions/_shared/partyContent.js'

const createFakeDb = () => {
  const tables = {
    party_undercover_word_pairs: [
      {
        id: 'fruit-apple-pear',
        civilian_word: '苹果',
        undercover_word: '梨',
        category: '生活',
        difficulty: 'easy',
        enabled: 1,
        created_at: '2026-07-07T00:00:00.000Z',
        updated_at: '2026-07-07T00:00:00.000Z',
      },
    ],
    party_truth_or_dare_cards: [
      {
        id: 'truth-recent-laugh',
        type: 'truth',
        content: '最近一次笑到停不下来是因为什么？',
        category: '轻松',
        intensity: 'soft',
        enabled: 1,
        created_at: '2026-07-07T00:00:00.000Z',
        updated_at: '2026-07-07T00:00:00.000Z',
      },
    ],
  }

  return {
    tables,
    prepare(sql) {
      const statement = {
        values: [],
        bind(...values) {
          this.values = values
          return this
        },
        async all() {
          if (sql.includes('party_undercover_word_pairs')) {
            return { results: [...tables.party_undercover_word_pairs] }
          }
          if (sql.includes('party_truth_or_dare_cards')) {
            return { results: [...tables.party_truth_or_dare_cards] }
          }
          return { results: [] }
        },
        async first() {
          const [id] = this.values
          if (sql.includes('party_undercover_word_pairs')) {
            return tables.party_undercover_word_pairs.find((row) => row.id === id) ?? null
          }
          if (sql.includes('party_truth_or_dare_cards')) {
            return tables.party_truth_or_dare_cards.find((row) => row.id === id) ?? null
          }
          return null
        },
        async run() {
          if (sql.includes('INSERT INTO party_undercover_word_pairs')) {
            const [id, civilianWord, undercoverWord, category, difficulty, enabled, createdAt, updatedAt] = this.values
            tables.party_undercover_word_pairs.push({
              id,
              civilian_word: civilianWord,
              undercover_word: undercoverWord,
              category,
              difficulty,
              enabled,
              created_at: createdAt,
              updated_at: updatedAt,
            })
          }
          if (sql.includes('INSERT INTO party_truth_or_dare_cards')) {
            const [id, type, content, category, intensity, enabled, createdAt, updatedAt] = this.values
            tables.party_truth_or_dare_cards.push({
              id,
              type,
              content,
              category,
              intensity,
              enabled,
              created_at: createdAt,
              updated_at: updatedAt,
            })
          }
          if (sql.includes('UPDATE party_undercover_word_pairs')) {
            const [civilianWord, undercoverWord, category, difficulty, enabled, updatedAt, id] = this.values
            const row = tables.party_undercover_word_pairs.find((item) => item.id === id)
            if (row) Object.assign(row, {
              civilian_word: civilianWord,
              undercover_word: undercoverWord,
              category,
              difficulty,
              enabled,
              updated_at: updatedAt,
            })
          }
          if (sql.includes('UPDATE party_truth_or_dare_cards')) {
            const [type, content, category, intensity, enabled, updatedAt, id] = this.values
            const row = tables.party_truth_or_dare_cards.find((item) => item.id === id)
            if (row) Object.assign(row, {
              type,
              content,
              category,
              intensity,
              enabled,
              updated_at: updatedAt,
            })
          }
          return { success: true }
        },
      }
      return statement
    },
  }
}

test('lists normalized undercover word pairs', async () => {
  const db = createFakeDb()
  const result = await listPartyContent(db, 'undercover')

  assert.equal(result.items.length, 1)
  assert.deepEqual(result.items[0], {
    id: 'fruit-apple-pear',
    civilianWord: '苹果',
    undercoverWord: '梨',
    category: '生活',
    difficulty: 'easy',
    enabled: true,
    createdAt: '2026-07-07T00:00:00.000Z',
    updatedAt: '2026-07-07T00:00:00.000Z',
  })
})

test('creates and updates a truth or dare card', async () => {
  const db = createFakeDb()
  const created = await createPartyContent(db, 'truth-or-dare', {
    type: 'dare',
    content: '摆一个胜利姿势，保持 5 秒。',
    category: '互动',
    intensity: 'soft',
    enabled: true,
  })

  assert.equal(created.item.type, 'dare')
  assert.equal(created.item.enabled, true)

  const updated = await updatePartyContent(db, 'truth-or-dare', created.item.id, {
    type: 'dare',
    content: '用主持人的语气宣布下一轮开始。',
    category: '表演',
    intensity: 'normal',
    enabled: false,
  })

  assert.equal(updated.item.content, '用主持人的语气宣布下一轮开始。')
  assert.equal(updated.item.enabled, false)
})

test('rejects unsafe or invalid payloads', async () => {
  const db = createFakeDb()

  await assert.rejects(
    () => createPartyContent(db, 'undercover', {
      civilianWord: '猫',
      undercoverWord: '狗',
      category: '生活',
      difficulty: 'hard',
      enabled: true,
    }),
    /difficulty must be easy or normal/,
  )

  await assert.rejects(
    () => createPartyContent(db, 'truth-or-dare', {
      type: 'truth',
      content: '短',
      category: '轻松',
      intensity: 'soft',
      enabled: true,
    }),
    /content must be 4-80 chars/,
  )
})
