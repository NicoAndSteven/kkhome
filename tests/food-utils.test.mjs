import assert from 'node:assert/strict'
import test from 'node:test'
import {
  addNoonItem,
  deleteNoonItem,
  renameNoonItem,
  loadNoonItems,
  addEveningItem,
  deleteEveningItem,
  toggleEveningRecipe,
  loadEveningData,
} from '../src/plugins/food/utils.ts'

const NOON_KEY = 'hub:food-noon'
const EVENING_KEY = 'hub:food-evening'

class MemoryStorage {
  #map = new Map()
  getItem(key) { return this.#map.has(key) ? this.#map.get(key) : null }
  setItem(key, value) { this.#map.set(key, String(value)) }
  removeItem(key) { this.#map.delete(key) }
}

const installStorage = () => {
  const storage = new MemoryStorage()
  globalThis.localStorage = storage
  return storage
}

const installFetch = (handler) => {
  const original = globalThis.fetch
  globalThis.fetch = handler
  return () => { globalThis.fetch = original }
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

// Vite dev answers 404 with an empty body for /api/food/* — treat as offline.
test('addNoonItem falls back to localStorage when the API is not deployed', async () => {
  const storage = installStorage()
  const restoreFetch = installFetch(async () => new Response('', { status: 404 }))
  try {
    const item = await addNoonItem('牛肉面')
    assert.ok(item)
    assert.equal(item.name, '牛肉面')
    assert.deepEqual(JSON.parse(storage.getItem(NOON_KEY)), [item])
  } finally {
    restoreFetch()
  }
})

test('deleteNoonItem falls back when the network request fails', async () => {
  const storage = installStorage()
  storage.setItem(NOON_KEY, JSON.stringify([{ id: 'a', name: 'A', source: 'user' }]))
  const restoreFetch = installFetch(async () => { throw new TypeError('offline') })
  try {
    assert.equal(await deleteNoonItem('a'), true)
    assert.deepEqual(JSON.parse(storage.getItem(NOON_KEY)), [])
  } finally {
    restoreFetch()
  }
})

test('renameNoonItem falls back to localStorage when offline', async () => {
  const storage = installStorage()
  storage.setItem(NOON_KEY, JSON.stringify([{ id: 'a', name: '旧名', source: 'user' }]))
  const restoreFetch = installFetch(async () => new Response('<html></html>', { status: 200 }))
  try {
    assert.equal(await renameNoonItem('a', '新名'), true)
    assert.deepEqual(JSON.parse(storage.getItem(NOON_KEY)), [{ id: 'a', name: '新名', source: 'user' }])
  } finally {
    restoreFetch()
  }
})

test('loadNoonItems trusts an empty server list instead of stale cache', async () => {
  const storage = installStorage()
  storage.setItem(NOON_KEY, JSON.stringify([{ id: 'stale', name: '过期项', source: 'user' }]))
  const restoreFetch = installFetch(async () => json({ ok: true, data: { items: [] } }))
  try {
    assert.deepEqual(await loadNoonItems(), [])
    assert.deepEqual(JSON.parse(storage.getItem(NOON_KEY)), [])
  } finally {
    restoreFetch()
  }
})

test('loadNoonItems falls back to cache when the response is an HTML SPA fallback', async () => {
  const storage = installStorage()
  const cached = [{ id: 'a', name: '兰州拉面', source: 'user' }]
  storage.setItem(NOON_KEY, JSON.stringify(cached))
  const restoreFetch = installFetch(async () => new Response('<!doctype html>', { status: 200, headers: { 'Content-Type': 'text/html' } }))
  try {
    assert.deepEqual(await loadNoonItems(), cached)
  } finally {
    restoreFetch()
  }
})

test('a real 429 rejection is surfaced and does not mutate the cache', async () => {
  const storage = installStorage()
  storage.setItem(NOON_KEY, JSON.stringify([{ id: 'a', name: '保留', source: 'user' }]))
  const restoreFetch = installFetch(async () => json({ ok: false, error: { code: 'too_many_requests' } }, 429))
  try {
    assert.equal(await addNoonItem('新项'), null)
    assert.equal(await deleteNoonItem('a'), false)
    assert.deepEqual(JSON.parse(storage.getItem(NOON_KEY)), [{ id: 'a', name: '保留', source: 'user' }])
  } finally {
    restoreFetch()
  }
})

test('loadEveningData falls back to cache when the binding is unavailable', async () => {
  const storage = installStorage()
  const cached = {
    custom: [{ id: 'c1', name: '咖喱饭', source: 'user' }],
    disabledIds: ['builtin-1'],
  }
  storage.setItem(EVENING_KEY, JSON.stringify(cached))
  const restoreFetch = installFetch(async () => json({ ok: false, error: { code: 'binding_unavailable' } }, 503))
  try {
    assert.deepEqual(await loadEveningData(), cached)
  } finally {
    restoreFetch()
  }
})

test('evening custom add/delete fall back to localStorage when offline', async () => {
  const storage = installStorage()
  const restoreFetch = installFetch(async () => new Response('', { status: 404 }))
  try {
    const item = await addEveningItem('番茄牛腩')
    assert.ok(item)
    let cached = JSON.parse(storage.getItem(EVENING_KEY))
    assert.deepEqual(cached.custom, [item])

    assert.equal(await deleteEveningItem(item.id), true)
    cached = JSON.parse(storage.getItem(EVENING_KEY))
    assert.deepEqual(cached.custom, [])
  } finally {
    restoreFetch()
  }
})

test('toggleEveningRecipe flips the cached disabledIds when offline', async () => {
  const storage = installStorage()
  const restoreFetch = installFetch(async () => new Response('', { status: 404 }))
  try {
    assert.equal(await toggleEveningRecipe('builtin-7'), true)
    assert.deepEqual(JSON.parse(storage.getItem(EVENING_KEY)).disabledIds, ['builtin-7'])

    assert.equal(await toggleEveningRecipe('builtin-7'), true)
    assert.deepEqual(JSON.parse(storage.getItem(EVENING_KEY)).disabledIds, [])
  } finally {
    restoreFetch()
  }
})
