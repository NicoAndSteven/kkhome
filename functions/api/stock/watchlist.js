import { fail, ok, options } from '../../_shared/api.js'

const requireDb = (env) => {
  if (!env.WISHES_DB) return null
  return env.WISHES_DB
}

export const onRequestOptions = (context) => options(context)

/** GET /api/stock/watchlist → 获取所有自选股列表 */
export const onRequestGet = async ({ request, env }) => {
  const db = requireDb(env)
  if (!db) {
    return fail('binding_unavailable', '数据库未配置', 503, { request, env })
  }

  const result = await db.prepare(`
    SELECT id, symbol, display_name, display_order, created_at, updated_at
    FROM watchlist_symbols
    ORDER BY display_order ASC, created_at ASC
  `).all()

  return ok({
    watchlist: result.results ?? [],
  }, { request, env })
}

/** POST /api/stock/watchlist → 添加自选股 */
export const onRequestPost = async ({ request, env }) => {
  const db = requireDb(env)
  if (!db) {
    return fail('binding_unavailable', '数据库未配置', 503, { request, env })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return fail('invalid_json', 'Invalid JSON body', 400, { request, env })
  }

  const symbol = String(body.symbol ?? '').toUpperCase().trim()
  if (!symbol) {
    return fail('missing_symbol', '股票代码不能为空', 400, { request, env })
  }

  const now = new Date().toISOString()
  const id = `${symbol}-${Date.now()}`

  // 查最大排序号
  const maxOrder = await db.prepare(`
    SELECT COALESCE(MAX(display_order), -1) + 1 AS next_order
    FROM watchlist_symbols
  `).first()

  try {
    await db.prepare(`
      INSERT INTO watchlist_symbols (id, symbol, display_name, display_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      symbol,
      body.name ? String(body.name) : null,
      maxOrder?.next_order ?? 0,
      now,
      now,
    ).run()

    return ok({ symbol }, { request, env }, { status: 201 })
  } catch (err) {
    if (String(err).includes('UNIQUE')) {
      return fail('duplicate_symbol', '该股票已添加', 409, { request, env })
    }
    return fail('db_error', '写入失败', 500, { request, env })
  }
}

/** DELETE /api/stock/watchlist → 删除自选股 */
export const onRequestDelete = async ({ request, env }) => {
  const db = requireDb(env)
  if (!db) {
    return fail('binding_unavailable', '数据库未配置', 503, { request, env })
  }

  const url = new URL(request.url)
  const symbol = url.searchParams.get('symbol')?.toUpperCase().trim()

  if (!symbol) {
    return fail('missing_symbol', 'symbol query param is required', 400, { request, env })
  }

  await db.prepare(`DELETE FROM watchlist_symbols WHERE symbol = ?`).bind(symbol).run()

  return ok({ deleted: symbol }, { request, env })
}

/** PUT /api/stock/watchlist → 更新排序或名称 */
export const onRequestPut = async ({ request, env }) => {
  const db = requireDb(env)
  if (!db) {
    return fail('binding_unavailable', '数据库未配置', 503, { request, env })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return fail('invalid_json', 'Invalid JSON body', 400, { request, env })
  }

  const symbol = String(body.symbol ?? '').toUpperCase().trim()
  if (!symbol) {
    return fail('missing_symbol', '股票代码不能为空', 400, { request, env })
  }

  const now = new Date().toISOString()

  if (body.display_order !== undefined) {
    await db.prepare(`
      UPDATE watchlist_symbols SET display_order = ?, updated_at = ? WHERE symbol = ?
    `).bind(Number(body.display_order), now, symbol).run()
  }

  if (body.name !== undefined) {
    await db.prepare(`
      UPDATE watchlist_symbols SET display_name = ?, updated_at = ? WHERE symbol = ?
    `).bind(String(body.name), now, symbol).run()
  }

  return ok({ updated: symbol }, { request, env })
}
