import React, { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '../../components/Icon'

interface Song {
  id: string
  title: string
  artist: string
  file?: string
  source?: string
  uploadedBy: string
  status: 'pending' | 'approved' | 'wish'
  createdAt: string
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const LocalMusicPlugin = () => {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [uploadMode, setUploadMode] = useState<'none' | 'upload' | 'wish'>('none')
  const [adminToken, setAdminToken] = useState('')
  // 从欢迎页管理员入口接收 token（仅内存，刷新后失效）
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.token) setAdminToken(detail.token)
    }
    window.addEventListener('admin-auth', handler)
    return () => window.removeEventListener('admin-auth', handler)
  }, [])

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // === 加载歌曲列表 ===
  const fetchSongs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const headers: Record<string, string> = {}
      if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`

      const res = await fetch('/api/music/songs', { headers })
      const json = await res.json()
      if (json.ok) setSongs(json.data.songs)
      else setError(json.error?.message || '加载失败')
    } catch { setError('无法连接服务器') }
    finally { setLoading(false) }
  }, [adminToken])

  useEffect(() => { fetchSongs() }, [fetchSongs])

  // === Audio 元素 ===
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audioRef.current = audio
    const onTime = () => setProgress(audio.duration ? audio.currentTime / audio.duration : 0)
    const onMeta = () => setDuration(audio.duration)
    const onEnd = () => { setPlaying(false); playNext() }
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnd)
    return () => { audio.pause(); audio.src = '' }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const playSong = useCallback(async (song: Song) => {
    const audio = audioRef.current
    if (!audio || !song.file) return
    setCurrentSong(song)
    setProgress(0)
    setDuration(0)
    audio.src = `/api/music/stream/${song.file}`
    try { await audio.play(); setPlaying(true) }
    catch { setPlaying(false) }
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return
    if (playing) { audio.pause(); setPlaying(false) }
    else audio.play().then(() => setPlaying(true)).catch(() => {})
  }, [playing, currentSong])

  const playNext = useCallback(() => {
    const approved = songs.filter(s => s.status === 'approved' && s.file)
    if (approved.length === 0) return
    const curIdx = currentSong ? approved.findIndex(s => s.id === currentSong.id) : -1
    const next = approved[(curIdx + 1) % approved.length]
    playSong(next)
  }, [songs, currentSong, playSong])

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration
  }, [])

  // === 上传 ===
  const handleUpload = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const file = formData.get('file') as File
    if (!file || !file.name) return alert('请选择 MP3 文件')

    try {
      const headers: Record<string, string> = {}
      if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`

      const res = await fetch('/api/music/songs', {
        method: 'POST',
        headers,
        body: formData,
      })
      const json = await res.json()
      if (json.ok) {
        alert('上传成功！' + (json.data.song.status === 'pending' ? '等待审核后上架' : '已直接上架'))
        form.reset()
        setUploadMode('none')
        fetchSongs()
      } else {
        alert(json.error?.message || '上传失败')
      }
    } catch { alert('网络错误') }
  }, [adminToken, fetchSongs])

  // === 许愿 ===
  const handleWish = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = { title: form.title.value, artist: form.artist.value, source: form.source.value || '', uploader: form.uploader.value || '匿名' }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`

      const res = await fetch('/api/music/songs', {
        method: 'POST', headers, body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.ok) {
        alert('许愿已提交！')
        form.reset()
        setUploadMode('none')
        fetchSongs()
      } else alert(json.error?.message || '提交失败')
    } catch { alert('网络错误') }
  }, [adminToken, fetchSongs])

  // === 审核 ===
  const handleApprove = useCallback(async (id: string) => {
    if (!adminToken) return alert('请先输入管理员密码')
    try {
      const res = await fetch('/api/music/songs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ id, action: 'approve' }),
      })
      const json = await res.json()
      if (json.ok) fetchSongs()
      else alert(json.error?.message || '操作失败')
    } catch { alert('网络错误') }
  }, [adminToken, fetchSongs])

  const handleDelete = useCallback(async (id: string) => {
    if (!adminToken) return alert('请先输入管理员密码')
    if (!confirm('确定删除？')) return
    try {
      await fetch('/api/music/songs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ id, action: 'delete' }),
      })
      fetchSongs()
    } catch { alert('网络错误') }
  }, [adminToken, fetchSongs])

  const approvedSongs = songs.filter(s => s.status === 'approved' && s.file)
  const pendingSongs = songs.filter(s => s.status === 'pending' || s.status === 'wish')

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <span className="font-label-mono text-xs uppercase text-secondary">MUSIC WALL</span>
          <h2 className="mt-1 font-headline-md text-headline-md text-on-surface">音乐墙</h2>
          <p className="font-body-md text-sm text-text-muted mt-1">
            上传你喜欢的歌，或许愿上架某首歌
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setUploadMode(uploadMode === 'upload' ? 'none' : 'upload')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white font-label-mono text-xs uppercase transition-all hover:opacity-90">
            <Icon name="add" className="text-sm" />上传
          </button>
          <button onClick={() => setUploadMode(uploadMode === 'wish' ? 'none' : 'wish')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border-subtle text-on-surface font-label-mono text-xs uppercase transition-all hover:border-primary">
            <Icon name="rate_review" className="text-sm" />许愿
          </button>
        </div>
      </div>

      {/* 管理员状态 — 从欢迎页入口认证 */}
      {adminToken && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="font-label-mono text-[10px] text-primary uppercase tracking-wider">管理员模式 · 显示待审核</span>
        </div>
      )}

      {/* Upload Form */}
      {uploadMode === 'upload' && (
        <form onSubmit={handleUpload} className="surface-panel rounded-xl p-4 space-y-3">
          <h3 className="font-body-lg font-semibold text-on-surface">上传歌曲</h3>
          <input type="file" name="file" accept=".mp3,audio/mpeg" required
            className="block w-full text-sm text-text-muted file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-label-mono file:text-xs" />
          <div className="grid grid-cols-2 gap-3">
            <input type="text" name="title" placeholder="歌曲名（选填）" className="surface-control rounded-lg px-3 py-2 font-body-md text-sm" />
            <input type="text" name="artist" placeholder="歌手（选填）" className="surface-control rounded-lg px-3 py-2 font-body-md text-sm" />
          </div>
          <input type="text" name="uploader" placeholder="你的名字（选填）" className="surface-control rounded-lg px-3 py-2 font-body-md text-sm w-full" />
          <button type="submit" className="px-6 py-2 rounded-lg bg-primary text-white font-label-mono text-xs uppercase hover:opacity-90 transition-all">上传</button>
          <p className="font-label-mono text-[10px] text-text-muted">支持 MP3 格式，最大 20MB</p>
        </form>
      )}

      {/* Wish Form */}
      {uploadMode === 'wish' && (
        <form onSubmit={handleWish} className="surface-panel rounded-xl p-4 space-y-3">
          <h3 className="font-body-lg font-semibold text-on-surface">许愿上架</h3>
          <div className="grid grid-cols-2 gap-3">
            <input name="title" placeholder="歌曲名 *" required className="surface-control rounded-lg px-3 py-2 font-body-md text-sm" />
            <input name="artist" placeholder="歌手 *" required className="surface-control rounded-lg px-3 py-2 font-body-md text-sm" />
          </div>
          <input name="source" placeholder="歌曲链接（网易云/YouTube 等，选填）" className="surface-control rounded-lg px-3 py-2 font-body-md text-sm w-full" />
          <input name="uploader" placeholder="你的名字（选填）" className="surface-control rounded-lg px-3 py-2 font-body-md text-sm w-full" />
          <button type="submit" className="px-6 py-2 rounded-lg bg-secondary text-white font-label-mono text-xs uppercase hover:opacity-90 transition-all">提交许愿</button>
        </form>
      )}

      {/* Now Playing */}
      {currentSong && (
        <div className="surface-item rounded-xl p-4 border border-border-subtle">
          <div className="relative w-full h-1 cursor-pointer group mb-3" onClick={handleSeek}>
            <div className="absolute inset-0 bg-border-subtle rounded-full" />
            <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${duration > 0 ? (progress * 100) : 0}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-primary rounded-full opacity-0 group-hover:opacity-100" style={{ left: `calc(${duration > 0 ? (progress * 100) : 0}% - 6px)` }} />
          </div>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="font-body-md font-semibold text-on-surface truncate">{currentSong.title}</div>
              <div className="font-label-mono text-xs text-text-muted">{currentSong.artist}</div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <span className="font-label-mono text-[10px] text-text-muted">{formatTime(duration * progress)} / {formatTime(duration)}</span>
              <button onClick={() => { const i = approvedSongs.findIndex(s => s.id === currentSong.id); if (i > 0) playSong(approvedSongs[i - 1]) }}
                className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-on-surface" aria-label="上一首">
                <Icon name="skip_previous" className="text-base" />
              </button>
              <button onClick={togglePlay} className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform" aria-label={playing ? '暂停' : '播放'}>
                <Icon name={playing ? 'pause' : 'play_arrow'} className="text-lg" />
              </button>
              <button onClick={() => { const i = approvedSongs.findIndex(s => s.id === currentSong.id); if (i < approvedSongs.length - 1) playSong(approvedSongs[i + 1]) }}
                className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-on-surface" aria-label="下一首">
                <Icon name="skip_next" className="text-base" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending (Admin only) */}
      {adminToken && pendingSongs.length > 0 && (
        <div>
          <h3 className="font-label-mono text-xs uppercase text-amber-600 mb-2">待审核 ({pendingSongs.length})</h3>
          <div className="space-y-1">
            {pendingSongs.map(song => (
              <div key={song.id} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <div className="min-w-0 flex-1">
                  <div className="font-body-md text-sm text-on-surface">{song.title}</div>
                  <div className="font-label-mono text-[10px] text-text-muted">{song.artist} · {song.uploadedBy} · {song.status === 'wish' ? '许愿' : '待审'}</div>
                </div>
                <div className="flex items-center gap-1">
                  {song.file && <button onClick={() => playSong(song)} className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-label-mono text-xs hover:bg-primary/20">试听</button>}
                  <button onClick={() => handleApprove(song.id)} className="px-3 py-1 rounded-lg bg-green-50 text-green-600 font-label-mono text-xs hover:bg-green-100 border border-green-200">通过</button>
                  <button onClick={() => handleDelete(song.id)} className="px-3 py-1 rounded-lg bg-red-50 text-red-500 font-label-mono text-xs hover:bg-red-100 border border-red-200">删除</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 font-body-md text-sm text-text-muted">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" fill="none" /></svg>
            加载中…
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="surface-panel rounded-xl p-4 text-center">
          <p className="font-body-md text-sm text-error">{error}</p>
        </div>
      )}

      {/* Song List */}
      {!loading && !error && approvedSongs.length === 0 && (
        <div className="surface-panel rounded-xl p-8 text-center">
          <p className="font-body-md text-text-muted">还没有歌曲，快来上传或许愿吧 🎵</p>
        </div>
      )}

      <div className="space-y-1">
        {approvedSongs.map(song => (
          <button key={song.id} type="button" onClick={() => playSong(song)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 ${
              currentSong?.id === song.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-surface-container border border-transparent'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              currentSong?.id === song.id ? 'bg-primary text-white' : 'bg-surface-container text-text-muted'
            }`}>
              {currentSong?.id === song.id && playing ? (
                <div className="flex items-end gap-[1.5px] h-3">
                  {[1, 2, 3].map(b => <div key={b} className="w-[2px] bg-white rounded-full" style={{ animation: `mini-bar 0.8s ease-in-out ${b * 0.15}s infinite alternate`, height: `${4 + b * 3}px` }} />)}
                </div>
              ) : <span className="font-label-mono text-xs">{String(approvedSongs.indexOf(song) + 1).padStart(2, '0')}</span>}
            </div>
            <div className="min-w-0 flex-1">
              <div className={`font-body-md text-sm truncate ${currentSong?.id === song.id ? 'text-primary font-semibold' : 'text-on-surface'}`}>{song.title}</div>
              <div className="font-label-mono text-[10px] text-text-muted">{song.artist}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default LocalMusicPlugin
