/* global crypto */

import { fail, ok, options } from '../../_shared/api.js'

const requireDb = (env) => {
  if (!env.WISHES_DB) return null
  return env.WISHES_DB
}

const normalizeItem = (row) => ({
  id: String(row.id),
  name: String(row.name),
  createdAt: String(row.created_at),
})

// Rate-limit helper — one submission per 3 seconds per IP
const requesterKey = (request) => {
  const ip = request.headers.get('CF-Connecting-IP')
    ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? 'unknown-ip'
  return ip
}

const RATE_LIMITS = new Map()

const checkRateLimit = (key) => {
  const last = RATE_LIMITS.get(key)
  const now = Date.now()
  if (last && now - last < 3_000) return false
  RATE_LIMITS.set(key, now)
  // Lightweight cleanup — keep map from growing unbounded
  if (RATE_LIMITS.size > 5_000) {
    const cutoff = now - 60_000
    for (const [k, t] of RATE_LIMITS) {
      if (t < cutoff) RATE_LIMITS.delete(k)
    }
  }
  return true
}

export const onRequestOptions = (context) => options(context)

// GET /api/food/noon — list all shared noon items
export const onRequestGet = async ({ request, env }) => {
  const db = requireDb(env)
  if (!db) {
    return fail('binding_unavailable', 'WISHES_DB is not configured', 503, { request, env })
  }

  const result = await db.prepare(`
    SELECT id, name, created_at
    FROM food_noon_items
    ORDER BY created_at ASC
    LIMIT 200
  `).all()

  return ok({
    items: (result.results ?? []).map(normalizeItem),
  }, { request, env })
}

// POST /api/food/noon — add a new shared noon item
export const onRequestPost = async ({ request, env }) => {
  const db = requireDb(env)
  if (!db) {
    return fail('binding_unavailable', 'WISHES_DB is not configured', 503, { request, env })
  }

  if (!checkRateLimit(requesterKey(request))) {
    return fail('too_many_requests', 'Too many requests', 429, { request, env })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return fail('invalid_json', 'Invalid JSON body', 400, { request, env })
  }

  const name = String(body.name ?? '').trim()
  if (name.length < 1 || name.length > 40) {
    return fail('invalid_name', 'Name must be 1-40 chars', 400, { request, env })
  }

  const item = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
  }

  await db.prepare(`
    INSERT INTO food_noon_items (id, name, created_at)
    VALUES (?, ?, ?)
  `).bind(item.id, item.name, item.createdAt).run()

  return ok({ item }, { request, env }, { status: 201 })
}

// DELETE /api/food/noon — remove a shared noon item (body: { id })
export const onRequestDelete = async ({ request, env }) => {
  const db = requireDb(env)
  if (!db) {
    return fail('binding_unavailable', 'WISHES_DB is not configured', 503, { request, env })
  }

  if (!checkRateLimit(requesterKey(request))) {
    return fail('too_many_requests', 'Too many requests', 429, { request, env })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return fail('invalid_json', 'Invalid JSON body', 400, { request, env })
  }

  const id = String(body.id ?? '').trim()
  if (!id) {
    return fail('invalid_id', 'id is required', 400, { request, env })
  }

  const existing = await db.prepare('SELECT id FROM food_noon_items WHERE id = ?').bind(id).first()
  if (!existing) {
    return fail('not_found', 'Item not found', 404, { request, env })
  }

  await db.prepare('DELETE FROM food_noon_items WHERE id = ?').bind(id).run()

  return ok({ id }, { request, env })
}

// PUT /api/food/noon — rename a shared noon item (body: { id, name })
export const onRequestPut = async ({ request, env }) => {
  const db = requireDb(env)
  if (!db) {
    return fail('binding_unavailable', 'WISHES_DB is not configured', 503, { request, env })
  }

  if (!checkRateLimit(requesterKey(request))) {
    return fail('too_many_requests', 'Too many requests', 429, { request, env })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return fail('invalid_json', 'Invalid JSON body', 400, { request, env })
  }

  const id = String(body.id ?? '').trim()
  const name = String(body.name ?? '').trim()

  if (!id) {
    return fail('invalid_id', 'id is required', 400, { request, env })
  }
  if (name.length < 1 || name.length > 40) {
    return fail('invalid_name', 'Name must be 1-40 chars', 400, { request, env })
  }

  const existing = await db.prepare('SELECT id FROM food_noon_items WHERE id = ?').bind(id).first()
  if (!existing) {
    return fail('not_found', 'Item not found', 404, { request, env })
  }

  await db.prepare('UPDATE food_noon_items SET name = ? WHERE id = ?').bind(name, id).run()

  return ok({ id, name }, { request, env })
}
