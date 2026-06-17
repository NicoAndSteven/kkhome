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
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.token) setAdminToken(detail.token)
    }
    window.addEventListener('admin-auth', handler)
    return () => window.removeEventListener('admin-auth', handler)
  }, [])

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
    } catch {
      setError('无法连接服务器')
    } finally {
      setLoading(false)
    }
  }, [adminToken])

  useEffect(() => { fetchSongs() }, [fetchSongs])

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
    try {
      await audio.play()
      setPlaying(true)
    } catch {
      setPlaying(false)
    }
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {})
    }
  }, [playing, currentSong])

  const playNext = useCallback(() => {
    const approved = songs.filter(s => s.status === 'approved' && s.file)
    if (approved.length === 0) return
    const curIdx = currentSong ? approved.findIndex(s => s.id === currentSong.id) : -1
    const next = approved[(curIdx + 1) % approved.length]
    playSong(next)
  }, [songs, currentSong, playSong])

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
        alert('上传成功' + (json.data.song.status === 'pending' ? '，等待审核后上架' : '，已直接上架'))
        form.reset()
        setUploadMode('none')
        fetchSongs()
      } else {
        alert(json.error?.message || '上传失败')
      }
    } catch {
      alert('网络错误')
    }
  }, [adminToken, fetchSongs])

  const handleWish = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const data = {
      title: String(fd.get('title') || ''),
      artist: String(fd.get('artist') || ''),
      source: String(fd.get('source') || ''),
      uploader: String(fd.get('uploader') || '匿名'),
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`

      const res = await fetch('/api/music/songs', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.ok) {
        alert('许愿已提交')
        form.reset()
        setUploadMode('none')
        fetchSongs()
      } else {
        alert(json.error?.message || '提交失败')
      }
    } catch {
      alert('网络错误')
    }
  }, [adminToken, fetchSongs])

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
    } catch {
      alert('网络错误')
    }
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
    } catch {
      alert('网络错误')
    }
  }, [adminToken, fetchSongs])

  const approvedSongs = songs.filter(s => s.status === 'approved' && s.file)
  const pendingSongs = songs.filter(s => s.status === 'pending' || s.status === 'wish')
  const currentIndex = currentSong ? approvedSongs.findIndex((song) => song.id === currentSong.id) : -1
  const totalSongs = approvedSongs.length

  return (
    <section id="local-music" className="space-y-5">
      <div className="stack-board surface-panel-strong rounded-[30px] p-5 md:p-7">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_280px]">
          <div className="grid gap-4">
            <div className="stack-plate rounded-[28px] border border-border-subtle bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(235,241,255,0.92),rgba(255,232,238,0.84))] p-5 md:p-6">
              <div className="flex items-center gap-3">
                <span className="stack-chip font-label-mono text-[10px] uppercase tracking-[0.34em] text-primary">Sound archive</span>
              </div>
              <h2 className="mt-5 max-w-[10ch] font-headline-md text-[clamp(2.8rem,5vw,5.4rem)] font-semibold leading-[0.88] tracking-[-0.08em] text-on-surface">
                本地音乐
              </h2>
              <p className="mt-4 max-w-xl font-body-md text-sm leading-relaxed text-on-surface-variant">
                这里是声音档案墙，不是传统播放器。它更像一组被钉在墙上的节目单、编号和切换机关。
              </p>
            </div>

            <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="surface-item rounded-[26px] border border-border-subtle bg-[linear-gradient(145deg,rgba(17,72,255,0.94),rgba(37,92,255,0.88))] p-5 text-white shadow-[0_28px_50px_-36px_rgba(17,72,255,0.5)]">
                <div className="font-label-mono text-[10px] uppercase tracking-[0.28em] text-white/72">Now staging</div>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate font-headline-md text-[clamp(1.8rem,2.8vw,2.6rem)] font-semibold leading-[0.92] tracking-[-0.06em]">
                      {currentSong?.title ?? '等待点亮'}
                    </div>
                    <div className="mt-2 font-label-mono text-[11px] uppercase tracking-[0.22em] text-white/68">
                      {currentSong?.artist ?? 'select a track'}
                    </div>
                  </div>
                  <div className="rounded-[20px] border border-white/15 bg-white/10 px-4 py-3 text-right backdrop-blur-sm">
                    <div className="font-label-mono text-[10px] uppercase tracking-[0.2em] text-white/68">time</div>
                    <div className="mt-1 font-label-mono text-xs text-white/84">
                      {formatTime(duration * progress)} / {formatTime(duration)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="surface-item rounded-[26px] border border-border-subtle bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(255,232,238,0.92))] p-5 shadow-[0_24px_44px_-36px_rgba(224,20,52,0.34)]">
                <div className="font-label-mono text-[10px] uppercase tracking-[0.28em] text-secondary">Control block</div>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentSong) return
                      const i = approvedSongs.findIndex(s => s.id === currentSong.id)
                      if (i > 0) playSong(approvedSongs[i - 1])
                    }}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-white/84 text-on-surface transition-premium hover:border-primary/40 hover:text-primary"
                    aria-label="上一首"
                  >
                    <Icon name="skip_previous" className="text-base" />
                  </button>
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#1148ff,#e01434)] text-white transition-premium hover:scale-[1.03] active:scale-[0.96]"
                    aria-label={playing ? '暂停' : '播放'}
                  >
                    <Icon name={playing ? 'pause' : 'play_arrow'} className="text-xl" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentSong) return
                      const i = approvedSongs.findIndex(s => s.id === currentSong.id)
                      if (i >= 0 && i < approvedSongs.length - 1) playSong(approvedSongs[i + 1])
                    }}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-white/84 text-on-surface transition-premium hover:border-primary/40 hover:text-primary"
                    aria-label="下一首"
                  >
                    <Icon name="skip_next" className="text-base" />
                  </button>
                </div>
                <div className="mt-5 text-[11px] leading-relaxed text-on-surface-variant">
                  点击列表中的曲目，或直接用这里的切歌按钮在档案里游走。
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="surface-item rounded-[24px] p-4">
              <div className="font-label-mono text-[10px] uppercase tracking-wider text-text-muted">歌曲总数</div>
              <div className="mt-2 font-headline-md text-[2.4rem] leading-none text-on-surface">{totalSongs}</div>
            </div>
            <div className="surface-item rounded-[24px] p-4">
              <div className="font-label-mono text-[10px] uppercase tracking-wider text-text-muted">当前播放</div>
              <div className="mt-2 font-headline-md text-[2.4rem] leading-none text-on-surface">{currentSong ? '1' : '0'}</div>
            </div>
            <div className="surface-item rounded-[24px] p-4">
              <div className="font-label-mono text-[10px] uppercase tracking-wider text-text-muted">待上架</div>
              <div className="mt-2 font-headline-md text-[2.4rem] leading-none text-on-surface">{pendingSongs.length}</div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap justify-start gap-2 lg:justify-end">
          <button
            type="button"
            onClick={() => setUploadMode(uploadMode === 'upload' ? 'none' : 'upload')}
            className="inline-flex items-center gap-2 rounded-[999px] bg-primary px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-premium hover:opacity-90 active:scale-[0.98]"
          >
            <Icon name="add" className="text-sm" />
            上传歌曲
          </button>
          <button
            type="button"
            onClick={() => setUploadMode(uploadMode === 'wish' ? 'none' : 'wish')}
            className="inline-flex items-center gap-2 rounded-[999px] border border-border-subtle bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface transition-premium hover:border-primary/40 hover:bg-white active:scale-[0.98]"
          >
            <Icon name="rate_review" className="text-sm" />
            许愿上架
          </button>
        </div>
      </div>

      {adminToken && (
        <div className="flex items-center gap-2 rounded-[18px] border border-primary/20 bg-primary/8 px-4 py-3">
          <span className="h-2 w-2 rounded-full bg-[rgba(223,161,144,0.95)]" />
          <span className="font-label-mono text-[10px] uppercase tracking-[0.2em] text-primary">
            管理员模式已启用，待审核内容可见
          </span>
        </div>
      )}

      {currentSong && (
        <div className="surface-panel stack-plate rounded-[28px] p-5 md:p-6">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="font-label-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">正在播放</div>
              <div className="mt-1 truncate font-headline-md text-[clamp(1.5rem,2.2vw,2.2rem)] font-semibold tracking-[-0.05em] text-on-surface">{currentSong.title}</div>
              <div className="mt-1 font-label-mono text-xs uppercase tracking-[0.18em] text-text-muted">{currentSong.artist}</div>
            </div>
            <div className="rounded-[18px] border border-border-subtle bg-white/74 px-4 py-3 text-right">
              <div className="font-label-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">当前段落</div>
              <div className="mt-1 font-label-mono text-xs text-text-muted">
                {playing ? '播放中' : '已暂停'}
              </div>
            </div>
          </div>
          <div className="mt-4 text-[11px] leading-relaxed text-on-surface-variant">
            切歌与暂停现在集中在左侧导航下方的小方块里，这里只保留当前选中的作品说明。
          </div>
        </div>
      )}

      {uploadMode === 'upload' && (
        <form onSubmit={handleUpload} className="surface-panel rounded-2xl p-5 space-y-4">
          <h3 className="font-body-lg text-lg font-semibold text-on-surface">上传歌曲</h3>
          <input
            type="file"
            name="file"
            accept=".mp3,audio/mpeg"
            required
            className="block w-full rounded-xl border border-dashed border-border-subtle bg-white/80 px-4 py-3 text-sm text-text-muted file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input type="text" name="title" placeholder="歌曲名（选填）" className="surface-control w-full rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-text-muted" />
            <input type="text" name="artist" placeholder="歌手（选填）" className="surface-control w-full rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-text-muted" />
          </div>
          <input type="text" name="uploader" placeholder="你的名字（选填）" className="surface-control w-full rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-text-muted" />
          <button type="submit" className="rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white transition-premium hover:opacity-90">
            开始上传
          </button>
          <p className="font-label-mono text-[10px] text-text-muted">支持 MP3 格式，最大 20MB</p>
        </form>
      )}

      {uploadMode === 'wish' && (
        <form onSubmit={handleWish} className="surface-panel rounded-2xl p-5 space-y-4">
          <h3 className="font-body-lg text-lg font-semibold text-on-surface">许愿上架</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input name="title" placeholder="歌曲名 *" required className="surface-control w-full rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-text-muted" />
            <input name="artist" placeholder="歌手 *" required className="surface-control w-full rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-text-muted" />
          </div>
          <input name="source" placeholder="歌曲链接（网易云/YouTube 等，选填）" className="surface-control w-full rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-text-muted" />
          <input name="uploader" placeholder="你的名字（选填）" className="surface-control w-full rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-text-muted" />
          <button type="submit" className="rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-[#07130e] transition-premium hover:opacity-90">
            提交许愿
          </button>
        </form>
      )}

      {adminToken && pendingSongs.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-label-mono text-xs uppercase tracking-[0.2em] text-text-muted">待审核 ({pendingSongs.length})</h3>
          <div className="space-y-2">
            {pendingSongs.map(song => (
              <div key={song.id} className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-white/80 p-4 shadow-[0_18px_40px_-34px_var(--color-panel-shadow)]">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-body-md text-sm text-on-surface">{song.title}</div>
                  <div className="font-label-mono text-[10px] text-text-muted">{song.artist} · {song.uploadedBy} · {song.status === 'wish' ? '许愿' : '待审'}</div>
                </div>
                <div className="flex items-center gap-2">
                  {song.file && (
                    <button onClick={() => playSong(song)} className="rounded-full border border-border-subtle px-3 py-1.5 text-xs text-primary transition-premium hover:border-primary/40">
                      试听
                    </button>
                  )}
                  <button onClick={() => handleApprove(song.id)} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs text-primary transition-premium hover:bg-primary/15">
                    通过
                  </button>
                  <button onClick={() => handleDelete(song.id)} className="rounded-full border border-[rgba(223,161,144,0.35)] bg-[rgba(223,161,144,0.12)] px-3 py-1.5 text-xs text-[rgb(150,95,84)] transition-premium hover:bg-[rgba(223,161,144,0.18)]">
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 font-body-md text-sm text-text-muted">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" fill="none" />
            </svg>
            加载中…
          </div>
        </div>
      )}

      {error && (
        <div className="surface-panel rounded-2xl p-4 text-center">
          <p className="font-body-md text-sm text-error">{error}</p>
        </div>
      )}

      {!loading && !error && approvedSongs.length === 0 && (
        <div className="surface-panel rounded-2xl p-8 text-center">
          <p className="font-body-md text-text-muted">还没有歌曲，快来上传或许愿吧</p>
        </div>
      )}

      <div className="grid gap-3 xl:grid-cols-2">
        {approvedSongs.map(song => {
          const isActive = currentSong?.id === song.id
          return (
            <button
              key={song.id}
              type="button"
              onClick={() => playSong(song)}
              className={`w-full rounded-[24px] border p-4 text-left transition-premium ${
                isActive
                  ? 'border-primary/30 bg-[linear-gradient(145deg,rgba(17,72,255,0.08),rgba(224,20,52,0.06),rgba(255,255,255,0.92))] shadow-[0_0_0_1px_rgba(17,72,255,0.12)]'
                  : 'border-border-subtle bg-white/84 hover:border-primary/20 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${isActive ? 'bg-primary text-white' : 'bg-[rgba(237,243,249,0.88)] text-text-muted'}`}>
                  {isActive && playing ? (
                    <div className="flex items-end gap-[1.5px] h-3">
                      {[1, 2, 3].map(b => (
                        <div
                          key={b}
                          className="w-[2px] rounded-full bg-white"
                          style={{ animation: `mini-bar 0.8s ease-in-out ${b * 0.15}s infinite alternate`, height: `${4 + b * 3}px` }}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="font-label-mono text-xs">{String(currentIndex >= 0 ? currentIndex + 1 : approvedSongs.indexOf(song) + 1).padStart(2, '0')}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className={`truncate text-sm font-semibold ${isActive ? 'text-primary' : 'text-on-surface'}`}>{song.title}</div>
                  <div className="font-label-mono text-[10px] text-text-muted">{song.artist}</div>
                </div>

                <div className="hidden shrink-0 text-right sm:block">
                  <div className="font-label-mono text-[10px] text-text-muted">{song.uploadedBy}</div>
                  <div className="font-label-mono text-[10px] text-text-muted">{formatTime(duration)}</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default LocalMusicPlugin
