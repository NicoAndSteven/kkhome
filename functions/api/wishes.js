/* global crypto */

import { fail, ok, options } from '../_shared/api.js'

const normalizeWish = (value) => ({
  id: String(value.id),
  title: String(value.title),
  detail: value.detail ? String(value.detail) : undefined,
  category: ['feature', 'tool', 'content', 'design', 'other'].includes(String(value.category))
    ? String(value.category)
    : 'other',
  author: value.author ? String(value.author) : undefined,
  status: ['new', 'accepted', 'building', 'shipped'].includes(String(value.status))
    ? String(value.status)
    : 'new',
  createdAt: String(value.created_at ?? value.createdAt),
})

const requireDb = (env) => {
  if (!env.WISHES_DB) {
    return null
  }
  return env.WISHES_DB
}

const hashValue = async (value) => {
  const data = new globalThis.TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

const requesterKey = (request) => {
  const ip = request.headers.get('CF-Connecting-IP')
    ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? 'unknown-ip'
  const userAgent = request.headers.get('user-agent')?.slice(0, 120) ?? 'unknown-agent'
  return `${ip}:${userAgent}`
}

const countLinks = (value) => (value.match(/https?:\/\//gi) ?? []).length

export const onRequestOptions = (context) => options(context)

export const onRequestGet = async ({ request, env }) => {
  const db = requireDb(env)
  if (!db) {
    return fail('binding_unavailable', 'WISHES_DB is not configured', 503, { request, env })
  }

  const result = await db.prepare(`
    SELECT id, title, detail, category, author, status, created_at
    FROM wishes
    ORDER BY created_at DESC
    LIMIT 200
  `).all()

  return ok({
    wishes: (result.results ?? []).map(normalizeWish),
  }, { request, env })
}

export const onRequestPost = async ({ request, env }) => {
  const db = requireDb(env)
  if (!db) {
    return fail('binding_unavailable', 'WISHES_DB is not configured', 503, { request, env })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return fail('invalid_json', 'Invalid JSON body', 400, { request, env })
  }

  if (String(body.website ?? '').trim()) {
    return fail('invalid_submission', 'Invalid submission', 400, { request, env })
  }

  const title = String(body.title ?? '').trim()
  const detail = String(body.detail ?? '').trim()
  const author = String(body.author ?? '').trim()
  const category = ['feature', 'tool', 'content', 'design', 'other'].includes(String(body.category))
    ? String(body.category)
    : 'other'

  if (title.length < 4 || title.length > 60) {
    return fail('invalid_title', 'Title must be 4-60 chars', 400, { request, env })
  }

  if (detail.length > 300 || author.length > 24) {
    return fail('payload_too_long', 'Payload is too long', 400, { request, env })
  }

  if (countLinks(`${title}\n${detail}`) > 2) {
    return fail('too_many_links', 'Too many links', 400, { request, env })
  }

  const submitterHash = await hashValue(requesterKey(request))
  const recentSubmission = await db.prepare(`
    SELECT last_submitted_at
    FROM wish_submission_limits
    WHERE submitter_hash = ?
  `).bind(submitterHash).first()

  if (
    recentSubmission?.last_submitted_at
    && Date.now() - Date.parse(recentSubmission.last_submitted_at) < 60_000
  ) {
    return fail('too_many_submissions', 'Too many submissions', 429, { request, env })
  }

  const wish = {
    id: crypto.randomUUID(),
    title,
    detail: detail || null,
    category,
    author: author || null,
    status: 'new',
    createdAt: new Date().toISOString(),
  }

  await db.prepare(`
    INSERT INTO wishes (id, title, detail, category, author, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    wish.id,
    wish.title,
    wish.detail,
    wish.category,
    wish.author,
    wish.status,
    wish.createdAt,
  ).run()

  await db.prepare(`
    INSERT INTO wish_submission_limits (submitter_hash, last_submitted_at)
    VALUES (?, ?)
    ON CONFLICT(submitter_hash) DO UPDATE SET last_submitted_at = excluded.last_submitted_at
  `).bind(submitterHash, wish.createdAt).run()

  return ok({ wish }, { request, env }, { status: 201 })
}
