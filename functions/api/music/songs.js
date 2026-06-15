/* global Response, crypto */
import { json, ok, fail, options } from '../../_shared/api.js'

const SONGS_KEY = 'songs.json'

async function loadSongs(env) {
  try {
    const obj = await env.MUSIC_BUCKET.get(SONGS_KEY)
    if (!obj) return []
    const text = await obj.text()
    return JSON.parse(text)
  } catch { return [] }
}

async function saveSongs(env, songs) {
  await env.MUSIC_BUCKET.put(SONGS_KEY, JSON.stringify(songs, null, 2), {
    httpMetadata: { contentType: 'application/json' },
  })
}

function isAdmin(request, env) {
  const auth = request.headers.get('Authorization') || ''
  return auth === `Bearer ${env.MUSIC_ADMIN_TOKEN || ''}`
}

export const onRequestOptions = (context) => new Response(null, {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  },
})

/** GET — 返回全部歌曲（pending 状态由前端过滤） */
export const onRequestGet = async ({ request, env }) => {
  const songs = await loadSongs(env)
  return ok({ songs }, { request, env })
}

/** POST — 上传或许愿，自动上架 */
export const onRequestPost = async ({ request, env }) => {
  const ct = request.headers.get('Content-Type') || ''

  if (ct.includes('multipart/form-data')) {
    const formData = await request.formData()
    const file = formData.get('file')
    const title = formData.get('title') || file?.name?.replace(/\.mp3$/i, '') || '未知歌曲'
    const artist = formData.get('artist') || '未知歌手'

    if (!file || !(file instanceof File)) {
      return fail('NO_FILE', '请选择要上传的 MP3 文件', 400, { request, env })
    }
    if (!file.name.toLowerCase().endsWith('.mp3')) {
      return fail('INVALID_TYPE', '仅支持 MP3 格式', 400, { request, env })
    }
    const MAX_SIZE = 20 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return fail('TOO_LARGE', '文件超过 20MB 限制', 400, { request, env })
    }

    const id = crypto.randomUUID()
    const buffer = await file.arrayBuffer()
    const songs = await loadSongs(env)

    await env.MUSIC_BUCKET.put(`audio/${id}.mp3`, buffer, {
      httpMetadata: { contentType: 'audio/mpeg' },
    })

    const newSong = {
      id, title, artist,
      file: `audio/${id}.mp3`,
      uploadedBy: formData.get('uploader') || '匿名',
      status: 'pending', // 待审核
      createdAt: new Date().toISOString(),
    }
    songs.push(newSong)
    await saveSongs(env, songs)

    return ok({ song: newSong }, { request, env }, { status: 201 })
  }

  // 许愿上架（无需审核，直接公开）
  const body = await request.json().catch(() => ({}))
  const { title, artist, source } = body
  if (!title || !artist) {
    return fail('MISSING_FIELDS', '请填写歌曲名和歌手', 400, { request, env })
  }

  const songs = await loadSongs(env)
  const wish = {
    id: crypto.randomUUID(), title, artist,
    source: source || '',
    uploadedBy: body.uploader || '匿名',
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  songs.push(wish)
  await saveSongs(env, songs)

  return ok({ song: wish }, { request, env }, { status: 201 })
}

/** PUT — 仅 admin 可操作：approve / reject / delete */
export const onRequestPut = async ({ request, env }) => {
  if (!isAdmin(request, env)) {
    return fail('UNAUTHORIZED', '需要管理员权限', 403, { request, env })
  }

  const body = await request.json().catch(() => ({}))
  const { id, action } = body
  if (!id) return fail('MISSING_ID', '缺少歌曲 ID', 400, { request, env })

  const songs = await loadSongs(env)
  const index = songs.findIndex((s) => s.id === id)
  if (index === -1) return fail('NOT_FOUND', '歌曲不存在', 404, { request, env })

  const song = songs[index]

  if (action === 'approve') {
    song.status = 'approved'
  } else if (action === 'reject' || action === 'delete') {
    try { await env.MUSIC_BUCKET.delete(song.file) } catch { /* */ }
    songs.splice(index, 1)
  } else {
    return fail('INVALID_ACTION', '无效操作', 400, { request, env })
  }

  await saveSongs(env, songs)
  return ok({ song }, { request, env })
}
