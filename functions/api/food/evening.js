/* global crypto */

import { fail, ok, options } from '../../_shared/api.js'

const requireDb = (env) => {
  if (!env.WISHES_DB) return null
  return env.WISHES_DB
}

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
  if (RATE_LIMITS.size > 5_000) {
    const cutoff = now - 60_000
    for (const [k, t] of RATE_LIMITS) {
      if (t < cutoff) RATE_LIMITS.delete(k)
    }
  }
  return true
}

export const onRequestOptions = (context) => options(context)

// GET /api/food/evening — list custom items & disabled recipe IDs
export const onRequestGet = async ({ request, env }) => {
  const db = requireDb(env)
  if (!db) {
    return fail('binding_unavailable', 'WISHES_DB is not configured', 503, { request, env })
  }

  const [customResult, disabledResult] = await Promise.all([
    db.prepare('SELECT id, name, created_at FROM food_evening_custom_items ORDER BY created_at ASC LIMIT 200').all(),
    db.prepare('SELECT recipe_id FROM food_evening_disabled_ids').all(),
  ])

  return ok({
    custom: (customResult.results ?? []).map((r) => ({
      id: String(r.id),
      name: String(r.name),
      createdAt: String(r.created_at),
    })),
    disabledIds: (disabledResult.results ?? []).map((r) => String(r.recipe_id)),
  }, { request, env })
}

// POST /api/food/evening — add a custom evening item
export const onRequestPost = async ({ request, env }) => {
  const db = requireDb(env)
  if (!db) return fail('binding_unavailable', 'WISHES_DB is not configured', 503, { request, env })
  if (!checkRateLimit(requesterKey(request))) return fail('too_many_requests', 'Too many requests', 429, { request, env })

  let body
  try { body = await request.json() } catch { return fail('invalid_json', 'Invalid JSON body', 400, { request, env }) }

  const name = String(body.name ?? '').trim()
  if (name.length < 1 || name.length > 40) return fail('invalid_name', 'Name must be 1-40 chars', 400, { request, env })

  const item = { id: crypto.randomUUID(), name, createdAt: new Date().toISOString() }

  await db.prepare('INSERT INTO food_evening_custom_items (id, name, created_at) VALUES (?, ?, ?)')
    .bind(item.id, item.name, item.createdAt).run()

  return ok({ item }, { request, env }, { status: 201 })
}

// DELETE /api/food/evening — remove a custom evening item (body: { id })
export const onRequestDelete = async ({ request, env }) => {
  const db = requireDb(env)
  if (!db) return fail('binding_unavailable', 'WISHES_DB is not configured', 503, { request, env })
  if (!checkRateLimit(requesterKey(request))) return fail('too_many_requests', 'Too many requests', 429, { request, env })

  let body
  try { body = await request.json() } catch { return fail('invalid_json', 'Invalid JSON body', 400, { request, env }) }

  const id = String(body.id ?? '').trim()
  if (!id) return fail('invalid_id', 'id is required', 400, { request, env })

  const existing = await db.prepare('SELECT id FROM food_evening_custom_items WHERE id = ?').bind(id).first()
  if (!existing) return fail('not_found', 'Item not found', 404, { request, env })

  await db.prepare('DELETE FROM food_evening_custom_items WHERE id = ?').bind(id).run()
  return ok({ id }, { request, env })
}

// PUT /api/food/evening — rename a custom evening item (body: { id, name })
export const onRequestPut = async ({ request, env }) => {
  const db = requireDb(env)
  if (!db) return fail('binding_unavailable', 'WISHES_DB is not configured', 503, { request, env })
  if (!checkRateLimit(requesterKey(request))) return fail('too_many_requests', 'Too many requests', 429, { request, env })

  let body
  try { body = await request.json() } catch { return fail('invalid_json', 'Invalid JSON body', 400, { request, env }) }

  const id = String(body.id ?? '').trim()
  const name = String(body.name ?? '').trim()
  if (!id) return fail('invalid_id', 'id is required', 400, { request, env })
  if (name.length < 1 || name.length > 40) return fail('invalid_name', 'Name must be 1-40 chars', 400, { request, env })

  const existing = await db.prepare('SELECT id FROM food_evening_custom_items WHERE id = ?').bind(id).first()
  if (!existing) return fail('not_found', 'Item not found', 404, { request, env })

  await db.prepare('UPDATE food_evening_custom_items SET name = ? WHERE id = ?').bind(name, id).run()
  return ok({ id, name }, { request, env })
}

// PATCH /api/food/evening — toggle disabled state of a built-in recipe (body: { recipeId })
export const onRequestPatch = async ({ request, env }) => {
  const db = requireDb(env)
  if (!db) return fail('binding_unavailable', 'WISHES_DB is not configured', 503, { request, env })
  if (!checkRateLimit(requesterKey(request))) return fail('too_many_requests', 'Too many requests', 429, { request, env })

  let body
  try { body = await request.json() } catch { return fail('invalid_json', 'Invalid JSON body', 400, { request, env }) }

  const recipeId = String(body.recipeId ?? '').trim()
  if (!recipeId) return fail('invalid_id', 'recipeId is required', 400, { request, env })

  const existing = await db.prepare('SELECT recipe_id FROM food_evening_disabled_ids WHERE recipe_id = ?').bind(recipeId).first()

  if (existing) {
    await db.prepare('DELETE FROM food_evening_disabled_ids WHERE recipe_id = ?').bind(recipeId).run()
    return ok({ recipeId, disabled: false }, { request, env })
  } else {
    await db.prepare('INSERT INTO food_evening_disabled_ids (recipe_id, created_at) VALUES (?, ?)')
      .bind(recipeId, new Date().toISOString()).run()
    return ok({ recipeId, disabled: true }, { request, env })
  }
}
