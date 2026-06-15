/* global Response */

/** 简单的请求频率限制（内存计数，每个 Worker 实例独立） */
const rateMap = new Map()

function checkRate(ip) {
  const now = Date.now()
  const windowMs = 60_000 // 1 分钟窗口
  const maxReqs = 30 // 每分钟最多 30 次

  const entry = rateMap.get(ip) || { count: 0, resetAt: now + windowMs }
  if (now > entry.resetAt) {
    entry.count = 0
    entry.resetAt = now + windowMs
  }
  entry.count++
  rateMap.set(ip, entry)

  // 定期清理（防止内存泄露）
  if (rateMap.size > 1000) {
    for (const [key, val] of rateMap) {
      if (now > val.resetAt) rateMap.delete(key)
    }
  }

  return entry.count <= maxReqs
}

/** GET /api/music/stream/* — 代理 R2 音频文件 */
export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const filePath = url.pathname.replace('/api/music/stream/', '')

  if (!filePath) {
    return new Response('File not found', { status: 404 })
  }

  // 拒绝 songs.json 直接访问
  if (filePath === 'songs.json') {
    return new Response('Forbidden', { status: 403 })
  }

  // 速率限制
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown'
  if (!checkRate(ip)) {
    return new Response('Too Many Requests', { status: 429 })
  }

  try {
    const obj = await env.MUSIC_BUCKET.get(filePath)
    if (!obj) {
      return new Response('File not found', { status: 404 })
    }

    const headers = {
      'Content-Type': 'audio/mpeg',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    }

    return new Response(obj.body, { headers })
  } catch (err) {
    return new Response(err.message, { status: 500 })
  }
}
