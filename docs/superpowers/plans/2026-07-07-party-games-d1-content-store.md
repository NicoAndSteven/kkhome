# Party Games D1 Content Store Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add persistent D1-backed party game content management for Who Is Undercover word pairs and Truth or Dare cards.

**Architecture:** This phase keeps gameplay local/static and adds the durable content layer first. Cloudflare Pages Functions expose admin-only CRUD endpoints backed by the existing `WISHES_DB` D1 binding, and the existing admin panel gains a `聚会题库` tab that can list, create, edit, enable, and disable content. Durable Objects, WebSocket rooms, online gameplay state, and Remotion remain deferred.

**Tech Stack:** Cloudflare Pages Functions, D1 SQL migrations, React 18, TypeScript, Tailwind CSS, Node built-in test runner, Playwright.

---

## Scope

Implement Phase 2 from `docs/superpowers/specs/2026-07-06-party-games-mobile-design.md`:

- D1 migration for party game content tables and safe seed data.
- Shared validation and CRUD helpers for party content APIs.
- Admin-only Pages Functions for word pairs and Truth or Dare cards.
- Admin panel `聚会题库` tab for managing content.
- Unit and e2e coverage for API behavior and admin UI entry state.

Do not implement:

- Durable Objects.
- WebSocket online room state.
- Server-side role assignment or voting.
- Remotion compositions.
- R2 imports/exports.

## File Structure

- Create `migrations/004_party_games_content.sql`: D1 tables, indexes, and seed rows.
- Create `functions/_shared/admin.js`: reusable `MUSIC_ADMIN_TOKEN` bearer-token check.
- Create `functions/_shared/partyContent.js`: validation, normalization, SQL queries, and request handlers for content resources.
- Create `functions/api/party/content/undercover.js`: list/create word pairs.
- Create `functions/api/party/content/undercover/[id].js`: update word pair by id.
- Create `functions/api/party/content/truth-or-dare.js`: list/create Truth or Dare cards.
- Create `functions/api/party/content/truth-or-dare/[id].js`: update card by id.
- Create `tests/party-content-api.test.mjs`: Node unit tests with a fake D1 statement runner.
- Modify `package.json`: add `test:unit` and include it in `check`.
- Create `src/components/PartyContentAdmin.tsx`: focused admin UI for party content.
- Modify `src/components/AdminPanel.tsx`: add the `聚会题库` tab and mount `PartyContentAdmin`.
- Modify `tests/homepage.spec.ts`: add a mocked admin question-bank UI smoke test.
- Modify `functions/api/health.js`: expose party content readiness when D1 is bound.

## Task 1: Migration And API Unit Tests

**Files:**
- Create: `tests/party-content-api.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write failing unit tests for party content helpers**

Create `tests/party-content-api.test.mjs`:

```js
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
```

- [ ] **Step 2: Add unit test script and include it in check**

Modify `package.json` scripts:

```json
{
  "test:unit": "node --test tests/*.test.mjs",
  "check": "npm run lint && npm run check:assets && npm run check:data && npm run test:unit && npm run build && npm run test:e2e"
}
```

- [ ] **Step 3: Run tests to verify RED**

Run:

```bash
npm run test:unit
```

Expected: fail because `functions/_shared/partyContent.js` does not exist.

- [ ] **Step 4: Commit failing tests**

```bash
git add tests/party-content-api.test.mjs package.json
git commit -m "test: cover party game content api"
```

## Task 2: D1 Migration And Shared API Helpers

**Files:**
- Create: `migrations/004_party_games_content.sql`
- Create: `functions/_shared/admin.js`
- Create: `functions/_shared/partyContent.js`

- [ ] **Step 1: Add D1 migration with seed data**

Create `migrations/004_party_games_content.sql`:

```sql
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
```

- [ ] **Step 2: Add shared admin token helper**

Create `functions/_shared/admin.js`:

```js
export const isAdmin = (request, env = {}) => {
  const auth = request.headers.get('Authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  return Boolean(token && env.MUSIC_ADMIN_TOKEN && token === env.MUSIC_ADMIN_TOKEN)
}
```

- [ ] **Step 3: Add shared party content helpers**

Create `functions/_shared/partyContent.js`:

```js
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
    return { item: getPartyResourceConfig(resource).normalize(await db.prepare('SELECT * FROM party_undercover_word_pairs WHERE id = ?').bind(id).first()) }
  }

  const value = validateCard(payload)
  const id = cleanText(payload.id) || createId(value.type, [value.category])
  await db.prepare(`
    INSERT INTO party_truth_or_dare_cards
      (id, type, content, category, intensity, enabled, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, value.type, value.content, value.category, value.intensity, value.enabled, now, now).run()
  return { item: getPartyResourceConfig(resource).normalize(await db.prepare('SELECT * FROM party_truth_or_dare_cards WHERE id = ?').bind(id).first()) }
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
    return { item: getPartyResourceConfig(resource).normalize(await db.prepare('SELECT * FROM party_undercover_word_pairs WHERE id = ?').bind(normalizedId).first()) }
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
  return { item: getPartyResourceConfig(resource).normalize(await db.prepare('SELECT * FROM party_truth_or_dare_cards WHERE id = ?').bind(normalizedId).first()) }
}
```

- [ ] **Step 4: Run unit tests to verify GREEN**

Run:

```bash
npm run test:unit
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add migrations/004_party_games_content.sql functions/_shared/admin.js functions/_shared/partyContent.js
git commit -m "feat: add party games d1 content helpers"
```

## Task 3: Cloudflare Pages Functions

**Files:**
- Create: `functions/api/party/content/undercover.js`
- Create: `functions/api/party/content/undercover/[id].js`
- Create: `functions/api/party/content/truth-or-dare.js`
- Create: `functions/api/party/content/truth-or-dare/[id].js`
- Modify: `functions/api/health.js`

- [ ] **Step 1: Add list/create endpoint for undercover word pairs**

Create `functions/api/party/content/undercover.js`:

```js
import { fail, ok, options } from '../../../_shared/api.js'
import { isAdmin } from '../../../_shared/admin.js'
import { createPartyContent, listPartyContent } from '../../../_shared/partyContent.js'

const requireDb = (env) => env.WISHES_DB ?? null

export const onRequestOptions = (context) => options(context)

export const onRequestGet = async ({ request, env }) => {
  const db = requireDb(env)
  if (!db) return fail('binding_unavailable', 'WISHES_DB is not configured', 503, { request, env })
  if (!isAdmin(request, env)) return fail('unauthorized', '需要管理员权限', 403, { request, env })
  return ok(await listPartyContent(db, 'undercover'), { request, env })
}

export const onRequestPost = async ({ request, env }) => {
  const db = requireDb(env)
  if (!db) return fail('binding_unavailable', 'WISHES_DB is not configured', 503, { request, env })
  if (!isAdmin(request, env)) return fail('unauthorized', '需要管理员权限', 403, { request, env })

  const body = await request.json().catch(() => null)
  if (!body) return fail('invalid_json', 'Invalid JSON body', 400, { request, env })

  try {
    return ok(await createPartyContent(db, 'undercover', body), { request, env }, { status: 201 })
  } catch (error) {
    return fail('invalid_content', error.message || 'Invalid content', 400, { request, env })
  }
}
```

- [ ] **Step 2: Add update endpoint for undercover word pairs**

Create `functions/api/party/content/undercover/[id].js`:

```js
import { fail, ok, options } from '../../../../_shared/api.js'
import { isAdmin } from '../../../../_shared/admin.js'
import { updatePartyContent } from '../../../../_shared/partyContent.js'

const requireDb = (env) => env.WISHES_DB ?? null

export const onRequestOptions = (context) => options(context)

export const onRequestPut = async ({ request, env, params }) => {
  const db = requireDb(env)
  if (!db) return fail('binding_unavailable', 'WISHES_DB is not configured', 503, { request, env })
  if (!isAdmin(request, env)) return fail('unauthorized', '需要管理员权限', 403, { request, env })

  const body = await request.json().catch(() => null)
  if (!body) return fail('invalid_json', 'Invalid JSON body', 400, { request, env })

  try {
    return ok(await updatePartyContent(db, 'undercover', params.id, body), { request, env })
  } catch (error) {
    return fail(error.status === 404 ? 'not_found' : 'invalid_content', error.message || 'Invalid content', error.status || 400, { request, env })
  }
}
```

- [ ] **Step 3: Add list/create endpoint for Truth or Dare cards**

Create `functions/api/party/content/truth-or-dare.js`:

```js
import { fail, ok, options } from '../../../_shared/api.js'
import { isAdmin } from '../../../_shared/admin.js'
import { createPartyContent, listPartyContent } from '../../../_shared/partyContent.js'

const requireDb = (env) => env.WISHES_DB ?? null

export const onRequestOptions = (context) => options(context)

export const onRequestGet = async ({ request, env }) => {
  const db = requireDb(env)
  if (!db) return fail('binding_unavailable', 'WISHES_DB is not configured', 503, { request, env })
  if (!isAdmin(request, env)) return fail('unauthorized', '需要管理员权限', 403, { request, env })
  return ok(await listPartyContent(db, 'truth-or-dare'), { request, env })
}

export const onRequestPost = async ({ request, env }) => {
  const db = requireDb(env)
  if (!db) return fail('binding_unavailable', 'WISHES_DB is not configured', 503, { request, env })
  if (!isAdmin(request, env)) return fail('unauthorized', '需要管理员权限', 403, { request, env })

  const body = await request.json().catch(() => null)
  if (!body) return fail('invalid_json', 'Invalid JSON body', 400, { request, env })

  try {
    return ok(await createPartyContent(db, 'truth-or-dare', body), { request, env }, { status: 201 })
  } catch (error) {
    return fail('invalid_content', error.message || 'Invalid content', 400, { request, env })
  }
}
```

- [ ] **Step 4: Add update endpoint for Truth or Dare cards**

Create `functions/api/party/content/truth-or-dare/[id].js`:

```js
import { fail, ok, options } from '../../../../_shared/api.js'
import { isAdmin } from '../../../../_shared/admin.js'
import { updatePartyContent } from '../../../../_shared/partyContent.js'

const requireDb = (env) => env.WISHES_DB ?? null

export const onRequestOptions = (context) => options(context)

export const onRequestPut = async ({ request, env, params }) => {
  const db = requireDb(env)
  if (!db) return fail('binding_unavailable', 'WISHES_DB is not configured', 503, { request, env })
  if (!isAdmin(request, env)) return fail('unauthorized', '需要管理员权限', 403, { request, env })

  const body = await request.json().catch(() => null)
  if (!body) return fail('invalid_json', 'Invalid JSON body', 400, { request, env })

  try {
    return ok(await updatePartyContent(db, 'truth-or-dare', params.id, body), { request, env })
  } catch (error) {
    return fail(error.status === 404 ? 'not_found' : 'invalid_content', error.message || 'Invalid content', error.status || 400, { request, env })
  }
}
```

- [ ] **Step 5: Update health feature flags**

Modify `functions/api/health.js`:

```js
features: {
  wishes: bindings.WISHES_DB,
  partyContent: bindings.WISHES_DB,
  featureFlags: bindings.HUB_KV,
  fileArtifacts: bindings.HUB_BUCKET,
  semanticSearch: bindings.HUB_VECTORIZE && bindings.AI,
  asyncJobs: bindings.HUB_QUEUE,
},
```

- [ ] **Step 6: Run unit tests**

Run:

```bash
npm run test:unit
```

Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add functions/api/party functions/api/health.js
git commit -m "feat: add party games content functions"
```

## Task 4: Admin UI Test

**Files:**
- Modify: `tests/homepage.spec.ts`

- [ ] **Step 1: Add failing Playwright test for admin party content tab**

Append this test to `tests/homepage.spec.ts`:

```ts
test('admin panel exposes party question bank management', async ({ page }) => {
  test.setTimeout(60_000)

  await page.route('**/api/music/songs', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, data: { token: 'test-admin-token' } }),
      })
      return
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, data: { songs: [] } }),
    })
  })

  await page.route('**/api/party/content/undercover', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          items: [
            {
              id: 'fruit-apple-pear',
              civilianWord: '苹果',
              undercoverWord: '梨',
              category: '生活',
              difficulty: 'easy',
              enabled: true,
              createdAt: '2026-07-07T00:00:00.000Z',
              updatedAt: '2026-07-07T00:00:00.000Z',
            },
          ],
        },
      }),
    })
  })

  await page.route('**/api/party/content/truth-or-dare', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          items: [
            {
              id: 'truth-recent-laugh',
              type: 'truth',
              content: '最近一次笑到停不下来是因为什么？',
              category: '轻松',
              intensity: 'soft',
              enabled: true,
              createdAt: '2026-07-07T00:00:00.000Z',
              updatedAt: '2026-07-07T00:00:00.000Z',
            },
          ],
        },
      }),
    })
  })

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.intro-stage')).toBeHidden({ timeout: 8_000 })
  await page.locator('button[aria-label="管理员"]').click()
  await page.getByPlaceholder('管理员密码').fill('test-admin-token')
  await page.getByRole('button', { name: '进入管理' }).click()

  await expect(page.getByRole('heading', { name: '管理后台' })).toBeVisible()
  await page.getByRole('button', { name: /聚会题库/ }).click()
  await expect(page.getByRole('heading', { name: '聚会题库' })).toBeVisible()
  await expect(page.getByText('苹果 / 梨')).toBeVisible()
  await expect(page.getByText('最近一次笑到停不下来是因为什么？')).toBeVisible()
  await expect(page.getByRole('button', { name: '新增题目' })).toBeVisible()
})
```

- [ ] **Step 2: Run test to verify RED**

Run:

```bash
npx playwright test tests/homepage.spec.ts --project=chromium --grep "admin panel exposes party question bank"
```

Expected: fail because the admin panel has no `聚会题库` tab.

- [ ] **Step 3: Commit failing e2e test**

```bash
git add tests/homepage.spec.ts
git commit -m "test: cover party games admin content"
```

## Task 5: Admin Content UI

**Files:**
- Create: `src/components/PartyContentAdmin.tsx`
- Modify: `src/components/AdminPanel.tsx`

- [ ] **Step 1: Create party content admin component**

Create `src/components/PartyContentAdmin.tsx`:

```tsx
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import Icon from './Icon'

interface UndercoverAdminItem {
  id: string
  civilianWord: string
  undercoverWord: string
  category: string
  difficulty: 'easy' | 'normal'
  enabled: boolean
}

interface TruthOrDareAdminItem {
  id: string
  type: 'truth' | 'dare'
  content: string
  category: string
  intensity: 'soft' | 'normal' | 'spicy'
  enabled: boolean
}

interface Props {
  token: string
}

type ContentTab = 'undercover' | 'truth-or-dare'

const emptyUndercover = {
  civilianWord: '',
  undercoverWord: '',
  category: '生活',
  difficulty: 'easy' as const,
  enabled: true,
}

const emptyCard = {
  type: 'truth' as const,
  content: '',
  category: '轻松',
  intensity: 'soft' as const,
  enabled: true,
}

const PartyContentAdmin = ({ token }: Props) => {
  const [tab, setTab] = useState<ContentTab>('undercover')
  const [words, setWords] = useState<UndercoverAdminItem[]>([])
  const [cards, setCards] = useState<TruthOrDareAdminItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingWordId, setEditingWordId] = useState<string | null>(null)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [wordForm, setWordForm] = useState(emptyUndercover)
  const [cardForm, setCardForm] = useState(emptyCard)
  const [saving, setSaving] = useState(false)

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token])

  const fetchContent = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [wordRes, cardRes] = await Promise.all([
        fetch('/api/party/content/undercover', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/party/content/truth-or-dare', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const [wordJson, cardJson] = await Promise.all([wordRes.json(), cardRes.json()])
      if (!wordJson.ok) throw new Error(wordJson.error?.message || '卧底词库加载失败')
      if (!cardJson.ok) throw new Error(cardJson.error?.message || '真心话大冒险加载失败')
      setWords(wordJson.data.items)
      setCards(cardJson.data.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : '题库加载失败')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchContent() }, [fetchContent])

  const saveWord = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    try {
      const url = editingWordId ? `/api/party/content/undercover/${editingWordId}` : '/api/party/content/undercover'
      const res = await fetch(url, {
        method: editingWordId ? 'PUT' : 'POST',
        headers: authHeaders,
        body: JSON.stringify(wordForm),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error?.message || '保存失败')
      setWordForm(emptyUndercover)
      setEditingWordId(null)
      await fetchContent()
    } catch (err) {
      alert(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const saveCard = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    try {
      const url = editingCardId ? `/api/party/content/truth-or-dare/${editingCardId}` : '/api/party/content/truth-or-dare'
      const res = await fetch(url, {
        method: editingCardId ? 'PUT' : 'POST',
        headers: authHeaders,
        body: JSON.stringify(cardForm),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error?.message || '保存失败')
      setCardForm(emptyCard)
      setEditingCardId(null)
      await fetchContent()
    } catch (err) {
      alert(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const editWord = (item: UndercoverAdminItem) => {
    setTab('undercover')
    setEditingWordId(item.id)
    setWordForm({
      civilianWord: item.civilianWord,
      undercoverWord: item.undercoverWord,
      category: item.category,
      difficulty: item.difficulty,
      enabled: item.enabled,
    })
  }

  const editCard = (item: TruthOrDareAdminItem) => {
    setTab('truth-or-dare')
    setEditingCardId(item.id)
    setCardForm({
      type: item.type,
      content: item.content,
      category: item.category,
      intensity: item.intensity,
      enabled: item.enabled,
    })
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1fr_360px]">
      <section className="surface-panel rounded-2xl border border-border-subtle p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-headline-md text-2xl text-on-surface">聚会题库</h2>
            <p className="mt-1 font-body-md text-sm text-text-muted">管理谁是卧底词库和真心话大冒险卡片。</p>
          </div>
          <button type="button" onClick={fetchContent} className="rounded-full border border-border-subtle px-4 py-2 text-xs font-semibold text-text-muted">
            刷新
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 rounded-2xl bg-surface-container p-1">
          <button
            type="button"
            onClick={() => setTab('undercover')}
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${tab === 'undercover' ? 'bg-surface text-on-surface shadow-sm' : 'text-text-muted'}`}
          >
            谁是卧底 ({words.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('truth-or-dare')}
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${tab === 'truth-or-dare' ? 'bg-surface text-on-surface shadow-sm' : 'text-text-muted'}`}
          >
            真心话大冒险 ({cards.length})
          </button>
        </div>

        {loading && <p className="py-12 text-center text-sm text-text-muted">加载中...</p>}
        {error && <p className="py-12 text-center text-sm text-error">{error}</p>}

        {!loading && !error && tab === 'undercover' && (
          <div className="mt-5 space-y-3">
            {words.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border-subtle bg-surface-container/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-body-md text-base font-semibold text-on-surface">{item.civilianWord} / {item.undercoverWord}</p>
                    <p className="mt-1 text-xs text-text-muted">{item.category} · {item.difficulty === 'easy' ? '简单' : '普通'} · {item.enabled ? '启用' : '停用'}</p>
                  </div>
                  <button type="button" onClick={() => editWord(item)} className="shrink-0 rounded-full border border-border-subtle px-3 py-1.5 text-xs text-text-muted">
                    编辑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && tab === 'truth-or-dare' && (
          <div className="mt-5 space-y-3">
            {cards.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border-subtle bg-surface-container/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-body-md text-base font-semibold text-on-surface">{item.content}</p>
                    <p className="mt-1 text-xs text-text-muted">{item.type === 'truth' ? '真心话' : '大冒险'} · {item.category} · {item.intensity} · {item.enabled ? '启用' : '停用'}</p>
                  </div>
                  <button type="button" onClick={() => editCard(item)} className="shrink-0 rounded-full border border-border-subtle px-3 py-1.5 text-xs text-text-muted">
                    编辑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <aside className="surface-panel rounded-2xl border border-border-subtle p-5">
        <h3 className="font-headline-md text-lg text-on-surface">新增题目</h3>
        {tab === 'undercover' ? (
          <form onSubmit={saveWord} className="mt-4 space-y-3">
            <input value={wordForm.civilianWord} onChange={(event) => setWordForm({ ...wordForm, civilianWord: event.target.value })} placeholder="平民词" className="w-full rounded-xl border border-border-subtle bg-surface-container px-3 py-2 text-sm" />
            <input value={wordForm.undercoverWord} onChange={(event) => setWordForm({ ...wordForm, undercoverWord: event.target.value })} placeholder="卧底词" className="w-full rounded-xl border border-border-subtle bg-surface-container px-3 py-2 text-sm" />
            <input value={wordForm.category} onChange={(event) => setWordForm({ ...wordForm, category: event.target.value })} placeholder="分类" className="w-full rounded-xl border border-border-subtle bg-surface-container px-3 py-2 text-sm" />
            <select value={wordForm.difficulty} onChange={(event) => setWordForm({ ...wordForm, difficulty: event.target.value as 'easy' | 'normal' })} className="w-full rounded-xl border border-border-subtle bg-surface-container px-3 py-2 text-sm">
              <option value="easy">简单</option>
              <option value="normal">普通</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-text-muted">
              <input type="checkbox" checked={wordForm.enabled} onChange={(event) => setWordForm({ ...wordForm, enabled: event.target.checked })} />
              启用
            </label>
            <button type="submit" disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              <Icon name="add" className="text-base" />
              {editingWordId ? '保存修改' : '新增题目'}
            </button>
          </form>
        ) : (
          <form onSubmit={saveCard} className="mt-4 space-y-3">
            <select value={cardForm.type} onChange={(event) => setCardForm({ ...cardForm, type: event.target.value as 'truth' | 'dare' })} className="w-full rounded-xl border border-border-subtle bg-surface-container px-3 py-2 text-sm">
              <option value="truth">真心话</option>
              <option value="dare">大冒险</option>
            </select>
            <textarea value={cardForm.content} onChange={(event) => setCardForm({ ...cardForm, content: event.target.value })} placeholder="卡片内容" className="min-h-24 w-full rounded-xl border border-border-subtle bg-surface-container px-3 py-2 text-sm" />
            <input value={cardForm.category} onChange={(event) => setCardForm({ ...cardForm, category: event.target.value })} placeholder="分类" className="w-full rounded-xl border border-border-subtle bg-surface-container px-3 py-2 text-sm" />
            <select value={cardForm.intensity} onChange={(event) => setCardForm({ ...cardForm, intensity: event.target.value as 'soft' | 'normal' | 'spicy' })} className="w-full rounded-xl border border-border-subtle bg-surface-container px-3 py-2 text-sm">
              <option value="soft">轻松</option>
              <option value="normal">普通</option>
              <option value="spicy">稍刺激</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-text-muted">
              <input type="checkbox" checked={cardForm.enabled} onChange={(event) => setCardForm({ ...cardForm, enabled: event.target.checked })} />
              启用
            </label>
            <button type="submit" disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              <Icon name="add" className="text-base" />
              {editingCardId ? '保存修改' : '新增题目'}
            </button>
          </form>
        )}
      </aside>
    </div>
  )
}

export default PartyContentAdmin
```

- [ ] **Step 2: Mount the party content tab**

Modify `src/components/AdminPanel.tsx`:

```tsx
import PartyContentAdmin from './PartyContentAdmin'
```

Change tab type:

```tsx
type TabId = 'pending' | 'approved' | 'wish' | 'party'
```

Add tab button:

```tsx
{ id: 'party' as TabId, label: '聚会题库', count: 0 }
```

Add early content branch inside the content area:

```tsx
{tab === 'party' ? (
  <PartyContentAdmin token={token} />
) : (
  <>
    {loading && (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-2 font-body-md text-sm text-text-muted">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" fill="none" />
          </svg>
          加载中...
        </div>
      </div>
    )}

    {error && (
      <div className="max-w-3xl mx-auto surface-panel rounded-2xl p-lg text-center">
        <p className="font-body-md text-sm text-error">{error}</p>
      </div>
    )}

    {!loading && !error && filteredSongs.length === 0 && (
      <div className="flex flex-col items-center justify-center py-24 text-text-muted">
        <Icon name="check" className="text-5xl mb-4 opacity-20" />
        <p className="font-body-md text-sm">
          {tab === 'pending' ? '没有待审核的歌曲' : tab === 'wish' ? '没有许愿请求' : '还没有已上架的歌曲'}
        </p>
      </div>
    )}

    {!loading && !error && filteredSongs.length > 0 && (
      <div className="max-w-3xl mx-auto space-y-3">
        {filteredSongs.map(song => (
          <div key={song.id} className="surface-item rounded-2xl border border-border-subtle p-4 flex items-center gap-4 hover:border-primary/20 transition-premium">
            {/* Keep the current song row markup unchanged inside this branch. */}
          </div>
        ))}
      </div>
    )}
  </>
)}
```

When rendering the tab labels, hide the numeric badge for `party` so the tab reads `聚会题库` instead of `聚会题库 (0)`:

```tsx
{t.id !== 'party' && <span className="ml-2">({t.count})</span>}
```

- [ ] **Step 3: Run admin e2e test to verify GREEN**

Run:

```bash
npx playwright test tests/homepage.spec.ts --project=chromium --grep "admin panel exposes party question bank"
```

Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/PartyContentAdmin.tsx src/components/AdminPanel.tsx
git commit -m "feat: add party games admin content ui"
```

## Task 6: Full Verification

**Files:**
- Modify only if verification reveals scoped defects.

- [ ] **Step 1: Run lint**

Run:

```bash
npm run lint
```

Expected: pass with zero warnings.

- [ ] **Step 2: Run unit tests**

Run:

```bash
npm run test:unit
```

Expected: pass.

- [ ] **Step 3: Run asset and data checks**

Run:

```bash
npm run check:assets
npm run check:data
```

Expected: both exit 0. Existing AI tool data warnings may remain.

- [ ] **Step 4: Run build**

Run:

```bash
npm run build
```

Expected: pass TypeScript and Vite production build.

- [ ] **Step 5: Run e2e**

Run:

```bash
npm run test:e2e
```

Expected: all Playwright tests pass.

- [ ] **Step 6: Run full check**

Run:

```bash
npm run check
```

Expected: lint, asset check, data check, unit tests, build, and e2e pass.

- [ ] **Step 7: Commit verification fixes if needed**

If files changed during verification:

```bash
git add .
git commit -m "test: verify party games d1 content"
```

If no files changed:

```bash
git status --short
```

Expected: clean working tree.

## Self-Review

Spec coverage:

- Phase 2 D1 migration, seed content, admin APIs, and admin UI are covered.
- Real-time rooms and game rules remain deferred to Phase 3 and Phase 4.
- The existing `MUSIC_ADMIN_TOKEN` pattern is reused.

Placeholder scan:

- No `TBD`, `TODO`, or unspecified test commands remain.
- Every endpoint and UI file has explicit paths and expected behavior.

Type consistency:

- API resources use `undercover` and `truth-or-dare` consistently.
- Frontend fields use camelCase while D1 columns use snake_case, with conversion centralized in `partyContent.js`.
