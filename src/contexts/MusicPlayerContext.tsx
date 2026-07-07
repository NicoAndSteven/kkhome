import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react'

// 全局音频单例
let _globalAudio: HTMLAudioElement | null = null
function getAudio(): HTMLAudioElement {
  if (!_globalAudio) {
    _globalAudio = new Audio()
    _globalAudio.preload = 'metadata'
  }
  return _globalAudio
}

export interface Song {
  id: string
  title: string
  artist: string
  file?: string
  source?: string
  uploadedBy: string
  status: 'pending' | 'approved' | 'wish'
  createdAt: string
}

interface MusicPlayerState {
  currentSong: Song | null
  playing: boolean
  progress: number
  duration: number
  playSong: (song: Song) => void
  togglePlay: (song?: Song) => void
  playNext: (songs: Song[]) => void
  setSongQueue: (songs: Song[]) => void
}

const MusicPlayerContext = createContext<MusicPlayerState | null>(null)

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [songQueue, setSongQueue] = useState<Song[]>([])
  const currentSongRef = useRef<Song | null>(null)
  const songQueueRef = useRef<Song[]>([])
  const playSongRef = useRef<(song: Song) => void>(() => {})

  // 同步 ref
  useEffect(() => { currentSongRef.current = currentSong }, [currentSong])
  useEffect(() => { songQueueRef.current = songQueue }, [songQueue])

  // 音频事件监听 — 一次性绑定
  useEffect(() => {
    const audio = getAudio()

    const onTime = () => setProgress(audio.duration ? audio.currentTime / audio.duration : 0)
    const onMeta = () => setDuration(audio.duration)
    const onEnd = () => {
      setPlaying(false)

      // 自动播放下⼀首
      const cur = currentSongRef.current
      const queue = songQueueRef.current
      if (cur && queue.length > 0) {
        const idx = queue.findIndex(s => s.id === cur.id)
        if (idx >= 0 && idx < queue.length - 1) {
          playSongRef.current(queue[idx + 1])
          return
        }
      }
    }

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnd)

    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('ended', onEnd)
    }
  }, [])

  const dispatchPlayEvent = useCallback((song: Song) => {
    window.dispatchEvent(new CustomEvent('local-music:play', {
      detail: { title: song.title, artist: song.artist, id: song.id, playing: true },
    }))
  }, [])

  const playSong = useCallback((song: Song) => {
    const audio = getAudio()
    if (!audio || !song.file) return
    setCurrentSong(song)
    setProgress(0)
    setDuration(0)
    audio.src = `/api/music/stream/${song.file}`
    audio.play().then(() => {
      setPlaying(true)
      dispatchPlayEvent(song)
    }).catch(() => {
      setPlaying(false)
    })
  }, [dispatchPlayEvent])

  // 将 playSong 同步到 ref（供 onEnd 回调调用）
  playSongRef.current = playSong

  const togglePlay = useCallback((song?: Song) => {
    const audio = getAudio()
    if (!audio) return

    if (song && song.id !== currentSongRef.current?.id) {
      if (!song.file) return
      setCurrentSong(song)
      setProgress(0)
      setDuration(0)
      audio.src = `/api/music/stream/${song.file}`
      audio.play().then(() => {
        setPlaying(true)
        dispatchPlayEvent(song)
      }).catch(() => setPlaying(false))
      return
    }

    if (playing) {
      audio.pause()
      setPlaying(false)
    } else if (currentSongRef.current) {
      audio.play().then(() => {
        setPlaying(true)
        dispatchPlayEvent(currentSongRef.current!)
      }).catch(() => {})
    }
  }, [playing, dispatchPlayEvent])

  const playNext = useCallback((songs: Song[]) => {
    const approved = songs.filter(s => s.status === 'approved' && s.file)
    if (approved.length === 0) return
    // 同步队列
    setSongQueue(approved)
    const cur = currentSongRef.current
    const curIdx = cur ? approved.findIndex(s => s.id === cur.id) : -1
    const next = approved[(curIdx + 1) % approved.length]
    playSong(next)
  }, [playSong])

  return (
    <MusicPlayerContext.Provider value={{ currentSong, playing, progress, duration, playSong, togglePlay, playNext, setSongQueue }}>
      {children}
    </MusicPlayerContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMusicPlayer(): MusicPlayerState {
  const ctx = useContext(MusicPlayerContext)
  if (!ctx) throw new Error('useMusicPlayer must be used within MusicPlayerProvider')
  return ctx
}
