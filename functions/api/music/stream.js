/* global Response */

/** GET /api/music/stream/* — 代理 R2 音频文件 */
export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const filePath = url.pathname.replace('/api/music/stream/', '')

  if (!filePath) {
    return new Response('File not found', { status: 404 })
  }

  try {
    const obj = await env.MUSIC_BUCKET.get(filePath)
    if (!obj) {
      return new Response('File not found', { status: 404 })
    }

    // 如果是 songs.json 请求，拒绝直接访问
    if (filePath === 'songs.json') {
      return new Response('Forbidden', { status: 403 })
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
