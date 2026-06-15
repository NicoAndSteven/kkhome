import { useState, useRef, useCallback } from 'react'
import { TrackState, getAudioEngine } from './AudioEngine'
import { TRACKS } from './tracks'
import Icon from '../../components/Icon'

interface Props {
  tracks: TrackState[]
  onToggleTrack: (id: string) => void
  onVolumeChange: (id: string, volume: number) => void
  onOpenFull: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const MiniPlayer = ({ tracks, onToggleTrack, onVolumeChange, onOpenFull }: Props) => {
  const activeTracks = tracks.filter((t) => t.playing)
  const [dragging, setDragging] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)

  if (activeTracks.length === 0) return null

  const primary = activeTracks[0]
  const def = TRACKS.find((t) => t.id === primary.id)
  const elapsed = primary.duration > 0 ? primary.progress * primary.duration : 0
  const progressPct = primary.duration > 0 ? Math.min(primary.progress, 1) * 100 : 0

  const handleSeek = useCallback((clientX: number) => {
    const bar = barRef.current
    if (!bar) return
    const rect = bar.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    const pct = x / rect.width
    getAudioEngine().seek(primary.id, pct)
  }, [primary.id])

  const onBarMouseDown = (e: React.MouseEvent) => {
    setDragging(true)
    handleSeek(e.clientX)
    const onMove = (ev: MouseEvent) => handleSeek(ev.clientX)
    const onUp = () => { setDragging(false); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border-subtle">
      {/* Progress bar */}
      <div
        ref={barRef}
        className="relative w-full h-1 cursor-pointer group"
        onMouseDown={onBarMouseDown}
        role="slider"
        aria-label="播放进度"
        aria-valuenow={Math.round(progressPct)}
        tabIndex={0}
      >
        <div className="absolute inset-0 bg-border-subtle rounded-full" />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-secondary"
          style={{ width: `${progressPct}%` }}
        />
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-primary rounded-full transition-opacity ${dragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          style={{ left: `calc(${progressPct}% - 6px)` }}
        />
      </div>

      {/* Controls row */}
      <div className="mx-auto flex h-14 max-w-[1480px] items-center gap-3 px-4 md:px-6">
        {/* Track info */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Icon name={def?.icon ?? 'music_note'} className="text-lg text-primary shrink-0" />
          <div className="min-w-0">
            <div className="font-label-mono text-xs text-on-surface truncate">
              {def?.name ?? primary.id}
            </div>
            {primary.duration > 0 && (
              <div className="font-label-mono text-[10px] text-text-muted">
                {formatTime(elapsed)} / {formatTime(primary.duration)}
              </div>
            )}
          </div>
        </div>

        {/* Transport controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              const idx = activeTracks.indexOf(primary)
              const prev = activeTracks[(idx - 1 + activeTracks.length) % activeTracks.length]
              onToggleTrack(prev.id)
            }}
            className="w-8 h-8 inline-flex items-center justify-center text-text-muted hover:text-on-surface transition-colors rounded-full hover:bg-surface-container"
            aria-label="上一首"
          >
            <Icon name="skip_previous" className="text-base" />
          </button>

          <button
            type="button"
            onClick={() => onToggleTrack(primary.id)}
            className="w-9 h-9 rounded-full bg-primary text-white inline-flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-sm"
            aria-label={primary.playing ? '暂停' : '播放'}
          >
            <Icon name={primary.playing ? 'pause' : 'play_arrow'} className="text-lg" />
          </button>

          <button
            type="button"
            onClick={() => {
              const idx = activeTracks.indexOf(primary)
              const next = activeTracks[(idx + 1) % activeTracks.length]
              onToggleTrack(next.id)
            }}
            className="w-8 h-8 inline-flex items-center justify-center text-text-muted hover:text-on-surface transition-colors rounded-full hover:bg-surface-container"
            aria-label="下一首"
          >
            <Icon name="skip_next" className="text-base" />
          </button>
        </div>

        {/* Volume + expand */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(primary.volume * 100)}
            onChange={(e) => onVolumeChange(primary.id, Number(e.target.value) / 100)}
            className="w-16 h-1 accent-primary hidden md:block"
            aria-label="音量"
          />
          <button
            type="button"
            onClick={onOpenFull}
            className="w-8 h-8 inline-flex items-center justify-center text-text-muted hover:text-primary transition-colors rounded-full hover:bg-surface-container"
            aria-label="打开完整播放器"
          >
            <Icon name="expand_less" className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default MiniPlayer
