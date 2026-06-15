import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '../../components/Icon'

interface LocalTrack {
  file: string
  title: string
  artist: string
}

const FILES: LocalTrack[] = [
  { file: 'I Need You-郭采洁#9R3Q.mp3', title: 'I Need You', artist: '郭采洁' },
  { file: '周杰伦 - 反方向的钟.mp3', title: '反方向的钟', artist: '周杰伦' },
  { file: '马里奥 - 主角.mp3', title: '主角', artist: '马里奥' },
  { file: '出现又离开 (Live) - 梁博.mp3', title: '出现又离开 (Live)', artist: '梁博' },
  { file: '咏春 - 七朵组合.mp3', title: '咏春', artist: '七朵组合' },
  { file: '多远都要在一起 - G.E.M. 邓紫棋.mp3', title: '多远都要在一起', artist: 'G.E.M. 邓紫棋' },
  { file: '爱错 - 王力宏.mp3', title: '爱错', artist: '王力宏' },
]

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const LocalMusicPlugin = () => {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loading, setLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 初始化 Audio 元素
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audioRef.current = audio

    const onTimeUpdate = () => setProgress(audio.currentTime / (audio.duration || 1))
    const onLoadedMeta = () => setDuration(audio.duration)
    const onEnded = () => { setPlaying(false); handleNext() }
    const onError = () => { setLoading(false); setPlaying(false) }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMeta)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    return () => {
      audio.pause()
      audio.src = ''
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMeta)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, [])

  const playTrack = useCallback(async (index: number) => {
    const audio = audioRef.current
    if (!audio) return
    setLoading(true)
    setCurrentIndex(index)
    setProgress(0)
    setDuration(0)

    audio.src = `/music/${FILES[index].file}`
    try {
      await audio.play()
      setPlaying(true)
    } catch { setPlaying(false) }
    setLoading(false)
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false) }
    else { audio.play().then(() => setPlaying(true)).catch(() => {}) }
  }, [playing])

  const handlePrev = useCallback(() => {
    if (currentIndex === null) return
    playTrack((currentIndex - 1 + FILES.length) % FILES.length)
  }, [currentIndex, playTrack])

  const handleNext = useCallback(() => {
    if (currentIndex === null) return
    playTrack((currentIndex + 1) % FILES.length)
  }, [currentIndex, playTrack])

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    audio.currentTime = x * audio.duration
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="font-label-mono text-xs uppercase text-secondary">LOCAL MUSIC</span>
          <h2 className="mt-1 font-headline-md text-headline-md text-on-surface">本地音乐</h2>
        </div>
        <span className="font-label-mono text-[10px] text-text-muted">{FILES.length} 首</span>
      </div>

      {/* 当前播放 & MiniPlayer */}
      {currentIndex !== null && (
        <div className="surface-item rounded-xl p-4 border border-border-subtle">
          {/* 进度条 */}
          <div className="relative w-full h-1 cursor-pointer group mb-3" onClick={handleSeek}>
            <div className="absolute inset-0 bg-border-subtle rounded-full" />
            <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${duration > 0 ? (progress * 100) : 0}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-primary rounded-full opacity-0 group-hover:opacity-100" style={{ left: `calc(${duration > 0 ? (progress * 100) : 0}% - 6px)` }} />
          </div>

          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="font-body-md font-semibold text-on-surface truncate">{FILES[currentIndex].title}</div>
              <div className="font-label-mono text-xs text-text-muted">{FILES[currentIndex].artist}</div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <span className="font-label-mono text-[10px] text-text-muted">{formatTime(duration * progress)} / {formatTime(duration)}</span>
              <button onClick={handlePrev} className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-on-surface" aria-label="上一首"><Icon name="skip_previous" className="text-base" /></button>
              <button onClick={togglePlay} className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform" aria-label={playing ? '暂停' : '播放'}>
                {loading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" /></svg>
                ) : (
                  <Icon name={playing ? 'pause' : 'play_arrow'} className="text-lg" />
                )}
              </button>
              <button onClick={handleNext} className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-on-surface" aria-label="下一首"><Icon name="skip_next" className="text-base" /></button>
            </div>
          </div>
        </div>
      )}

      {/* 歌曲列表 */}
      <div className="space-y-1">
        {FILES.map((track, i) => {
          const isActive = currentIndex === i
          return (
            <button
              key={track.file}
              type="button"
              onClick={() => playTrack(i)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 ${
                isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-surface-container border border-transparent'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isActive ? 'bg-primary text-white' : 'bg-surface-container text-text-muted'
              }`}>
                {isActive && playing ? (
                  <div className="flex items-end gap-[1.5px] h-3">
                    {[1, 2, 3].map((b) => (
                      <div key={b} className="w-[2px] bg-white rounded-full" style={{ animation: `mini-bar 0.8s ease-in-out ${b * 0.15}s infinite alternate`, height: `${4 + b * 3}px` }} />
                    ))}
                  </div>
                ) : (
                  <span className="font-label-mono text-xs">{String(i + 1).padStart(2, '0')}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className={`font-body-md text-sm truncate ${isActive ? 'text-primary font-semibold' : 'text-on-surface'}`}>{track.title}</div>
                <div className="font-label-mono text-[10px] text-text-muted">{track.artist}</div>
              </div>
              <span className="font-label-mono text-[10px] text-text-muted shrink-0">{Math.round(track.file === 'I Need You-郭采洁#9R3Q.mp3' ? 10.2 / (10235947 / 1024 / 1024) : 0)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default LocalMusicPlugin
