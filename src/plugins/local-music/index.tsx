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
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const stored = globalThis.sessionStorage.getItem('hub:admin-token')
    if (stored) setAdminToken(stored)

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
    const onEnd = () => { setPlaying(false); dispatchStopEvent(); playNext() }
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnd)
    return () => { audio.pause(); audio.src = '' }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dispatchPlayEvent = useCallback((song: Song, isPlaying: boolean) => {
    window.dispatchEvent(new CustomEvent('local-music:play', {
      detail: { title: song.title, artist: song.artist, id: song.id, playing: isPlaying },
    }))
  }, [])

  const dispatchStopEvent = useCallback(() => {
    window.dispatchEvent(new Event('local-music:stop'))
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
      dispatchPlayEvent(song, true)
    } catch {
      setPlaying(false)
      dispatchStopEvent()
    }
  }, [dispatchPlayEvent, dispatchStopEvent])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return
    if (playing) {
      audio.pause()
      setPlaying(false)
      dispatchStopEvent()
    } else {
      audio.play().then(() => {
        setPlaying(true)
        dispatchPlayEvent(currentSong, true)
      }).catch(() => {})
    }
  }, [playing, currentSong, dispatchPlayEvent, dispatchStopEvent])

  const playNext = useCallback(() => {
    const approved = songs.filter(s => s.status === 'approved' && s.file)
    if (approved.length === 0) {
      dispatchStopEvent()
      return
    }
    const curIdx = currentSong ? approved.findIndex(s => s.id === currentSong.id) : -1
    const next = approved[(curIdx + 1) % approved.length]
    playSong(next)
  }, [songs, currentSong, playSong, dispatchStopEvent])

  const handleUpload = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const file = formData.get('file') as File
    if (!file || !file.name) return alert('请选择 MP3 文件')

    setUploading(true)
    setUploadProgress(0)
    setUploadStatus('uploading')

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (evt) => {
      if (evt.lengthComputable) {
        setUploadProgress(Math.round((evt.loaded / evt.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      setUploading(false)
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText)
          if (json.ok) {
            setUploadStatus('done')
            fetchSongs()
          } else {
            setUploadStatus('error')
            setTimeout(() => setUploadStatus('idle'), 2000)
          }
        } catch {
          setUploadStatus('error')
          setTimeout(() => setUploadStatus('idle'), 2000)
        }
      } else {
        setUploadStatus('error')
        setTimeout(() => setUploadStatus('idle'), 2000)
      }
    })

    xhr.addEventListener('error', () => {
      setUploading(false)
      setUploadStatus('error')
      setTimeout(() => setUploadStatus('idle'), 2000)
    })

    xhr.open('POST', '/api/music/songs')
    if (adminToken) xhr.setRequestHeader('Authorization', `Bearer ${adminToken}`)
    xhr.send(formData)
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

  const approvedSongs = songs.filter(s => s.status === 'approved' && s.file)
  const totalSongs = approvedSongs.length

  return (
    <section id="local-music" className="space-y-6">
      {/* 专辑封面 Hero — 网易云风 */}
      <div className="relative overflow-hidden rounded-[28px] surface-panel-strong p-6 md:p-8">
        <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
          <div className="shrink-0">
            <div
              className="overflow-hidden"
              style={{
                width: 180,
                height: 180,
                borderRadius: 20,
                boxShadow: '0 20px 60px -20px rgba(0,47,167,0.35)',
              }}
            >
              <img
                src="/images/yuanyu.png"
                alt="本地音乐"
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
          </div>
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <span className="font-label-mono text-[10px] uppercase tracking-[0.24em] text-primary">Sound Archive</span>
            <h2 className="mt-2 font-headline-md text-3xl font-semibold tracking-tight text-on-surface">本地音乐</h2>
            <p className="mt-2 max-w-md font-body-md text-sm leading-relaxed text-on-surface-variant">
              这里是声音档案墙，不是传统播放器
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="font-label-mono text-[10px] uppercase tracking-[0.12em] text-primary">{totalSongs} 首</span>
              </div>
              {playing && (
                <div className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-2">
                  <div className="flex items-end gap-[1px] h-3">
                    {[1, 2, 3].map(b => (
                      <div key={b} className="w-[2px] rounded-full bg-green-500" style={{ animation: `mini-bar 0.8s ease-in-out ${b * 0.15}s infinite alternate`, height: `${4 + b * 3}px` }} />
                    ))}
                  </div>
                  <span className="font-label-mono text-[10px] tracking-[0.06em] text-green-600">播放中</span>
                </div>
              )}
            </div>
            {/* 操作按钮 */}
            <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
              <button
                type="button"
                onClick={() => setUploadMode(uploadMode === 'upload' ? 'none' : 'upload')}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-premium hover:opacity-90 active:scale-[0.98]"
              >
                <Icon name="add" className="text-sm" />
                上传歌曲
              </button>
              <button
                type="button"
                onClick={() => setUploadMode(uploadMode === 'wish' ? 'none' : 'wish')}
                className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white/80 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface transition-premium hover:border-primary/40 hover:bg-white active:scale-[0.98]"
              >
                <Icon name="rate_review" className="text-sm" />
                许愿上架
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 当前播放横栏 — 网易云底部播放器视觉 */}
      {currentSong && (
        <div className="surface-item rounded-2xl border border-border-subtle p-4">
          <div className="flex items-center gap-4">
            <div
              className="shrink-0 overflow-hidden"
              style={{ width: 56, height: 56, borderRadius: 12, boxShadow: '0 4px 12px -6px rgba(0,0,0,0.12)' }}
            >
              <img src="/images/yuanyu.png" alt={currentSong.title} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-body-md text-sm font-semibold text-on-surface">{currentSong.title}</div>
              <div className="font-label-mono text-[10px] text-text-muted">{currentSong.artist} · {formatTime(duration * progress)} / {formatTime(duration)}</div>
              {playing && (
                <div className="mt-1 h-1 rounded-full bg-primary/10 overflow-hidden" style={{ width: 120 }}>
                  <div className="h-full rounded-full bg-primary/40" style={{ width: `${progress * 100}%`, transition: 'width 0.3s linear' }} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (!currentSong) return
                  const i = approvedSongs.findIndex(s => s.id === currentSong.id)
                  if (i > 0) playSong(approvedSongs[i - 1])
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-premium hover:text-primary"
                aria-label="上一首"
              >
                <Icon name="skip_previous" className="text-base" />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-[0_4px_16px_-6px_rgba(0,47,167,0.35)] transition-premium hover:scale-[1.04] active:scale-[0.96]"
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
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-premium hover:text-primary"
                aria-label="下一首"
              >
                <Icon name="skip_next" className="text-base" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 上传/许愿表单 */}
      {uploadMode === 'upload' && (
        <form onSubmit={handleUpload} className="surface-panel rounded-2xl p-5 space-y-4">
          <h3 className="font-body-lg text-lg font-semibold text-on-surface">上传歌曲</h3>

          {/* 文件选择 */}
          <input
            type="file"
            name="file"
            accept=".mp3,audio/mpeg"
            required
            disabled={uploading}
            className="block w-full rounded-xl border border-dashed border-border-subtle bg-white/80 px-4 py-3 text-sm text-text-muted file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white disabled:opacity-50"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input type="text" name="title" placeholder="歌曲名（选填）" disabled={uploading} className="surface-control w-full rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-text-muted disabled:opacity-50" />
            <input type="text" name="artist" placeholder="歌手（选填）" disabled={uploading} className="surface-control w-full rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-text-muted disabled:opacity-50" />
          </div>
          <input type="text" name="uploader" placeholder="你的名字（选填）" disabled={uploading} className="surface-control w-full rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-text-muted disabled:opacity-50" />

          {/* 上传进度条 */}
          {uploadStatus === 'uploading' && (
            <div className="space-y-1.5">
              <div className="h-1.5 rounded-full bg-surface-container overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-label-mono text-[10px] text-primary">上传中</span>
                <span className="font-label-mono text-[10px] text-text-muted tabular-nums">{uploadProgress}%</span>
              </div>
            </div>
          )}

          {/* 上传成功 — 持久显示直到用户关闭 */}
          {uploadStatus === 'done' && (
            <div className="flex items-center gap-3 rounded-xl bg-primary-container/60 px-4 py-3 border border-primary/10">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body-md text-sm font-medium text-on-surface">上传成功</p>
                <p className="font-label-mono text-[10px] text-text-muted">管理员审批后即可播放</p>
              </div>
              <button
                type="button"
                onClick={() => { setUploadMode('none'); setUploadStatus('idle'); setUploadProgress(0) }}
                className="shrink-0 w-7 h-7 rounded-full border border-border-subtle flex items-center justify-center text-text-muted hover:text-on-surface transition-premium"
              >
                <Icon name="close" className="text-sm" />
              </button>
            </div>
          )}

          {/* 上传失败 */}
          {uploadStatus === 'error' && (
            <div className="flex items-center gap-3 rounded-xl bg-error-container px-4 py-3 border border-error/10">
              <div className="w-7 h-7 rounded-full bg-error flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body-md text-sm font-medium text-on-surface">上传失败</p>
                <p className="font-label-mono text-[10px] text-text-muted">请检查文件后重试</p>
              </div>
              <button
                type="button"
                onClick={() => setUploadStatus('idle')}
                className="shrink-0 w-7 h-7 rounded-full border border-border-subtle flex items-center justify-center text-text-muted hover:text-on-surface transition-premium"
              >
                <Icon name="close" className="text-sm" />
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || uploadStatus === 'done'}
            className="rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white transition-premium hover:opacity-90 disabled:opacity-40"
          >
            {uploading ? '上传中...' : '开始上传'}
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
          <button type="submit" className="rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-on-primary transition-premium hover:opacity-90">
            提交许愿
          </button>
        </form>
      )}

      {/* 歌曲列表 — 网易云歌单风格 */}
      <div className="space-y-2">
        {approvedSongs.map((song, idx) => {
          const isActive = currentSong?.id === song.id
          return (
            <button
              key={song.id}
              type="button"
              onClick={() => playSong(song)}
              className={`w-full rounded-2xl border p-4 text-left transition-premium relative overflow-hidden ${
                isActive
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border-subtle bg-white/80 hover:border-primary/20 hover:bg-white'
              }`}
            >
              {/* 播放中：顶部流光光晕 */}
              {isActive && playing && (
                <span className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-[shimmer-sweep_2.4s_ease-in-out_infinite]" />
              )}
              <div className="flex items-center gap-4 relative z-10">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold relative ${
                  isActive && playing
                    ? 'bg-primary text-white'
                    : isActive
                      ? 'bg-primary/10 text-primary'
                      : 'bg-surface text-text-muted'
                }`}>
                  {isActive && playing ? (
                    <div className="flex items-end gap-[2px] h-4">
                      {[0, 1, 2, 3, 4].map(b => (
                        <div
                          key={b}
                          className="w-[2.5px] rounded-full bg-white"
                          style={{
                            animation: `mini-bar 0.6s ease-in-out ${b * 0.12}s infinite alternate`,
                            height: `${5 + b * 3}px`,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    idx + 1
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-sm font-semibold flex items-center gap-2 ${
                    isActive ? 'text-primary' : 'text-on-surface'
                  }`}>
                    {isActive && playing && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                    )}
                    {song.title}
                  </div>
                  <div className="font-label-mono text-[10px] text-text-muted">{song.artist} · {song.uploadedBy}</div>
                </div>
                <div className="font-label-mono text-[10px] text-text-muted shrink-0 tabular-nums">
                  {isActive ? formatTime(duration * progress) + ' / ' + formatTime(duration) : '...'}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* 加载/错误/空状态 */}
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
    </section>
  )
}

export default LocalMusicPlugin
