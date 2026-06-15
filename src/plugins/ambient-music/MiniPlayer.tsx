import { TrackState } from './AudioEngine'
import { TRACKS } from './tracks'
import Icon from '../../components/Icon'

interface Props {
  tracks: TrackState[]
  onToggleTrack: (id: string) => void
  onVolumeChange: (id: string, volume: number) => void
  onOpenFull: () => void
}

const MiniPlayer = ({ tracks, onToggleTrack, onVolumeChange, onOpenFull }: Props) => {
  const activeTracks = tracks.filter((t) => t.playing)
  if (activeTracks.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border-subtle bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-12 max-w-[1480px] items-center gap-sm px-4 md:px-8 xl:px-12">
        {/* 波形动画 */}
        <div className="flex items-center gap-[2px] shrink-0" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-[3px] rounded-full bg-primary"
              style={{
                animation: `mini-bar 1.2s ease-in-out ${i * 0.15}s infinite alternate`,
                height: `${8 + Math.random() * 10}px`,
              }}
            />
          ))}
        </div>

        {/* 活跃音轨标签 */}
        <div className="flex-1 min-w-0 flex items-center gap-xs overflow-x-auto scrollbar-none">
          {activeTracks.map((track) => {
            const def = TRACKS.find((t) => t.id === track.id)
            return (
              <span
                key={track.id}
                className="inline-flex items-center gap-1 shrink-0 rounded-full border border-border-subtle px-2 py-0.5 font-label-mono text-[10px] uppercase text-on-surface"
              >
                <Icon name={def?.icon ?? 'music_note'} className="text-xs text-primary" />
                {def?.name ?? track.id}
              </span>
            )
          })}
        </div>

        {/* 快捷控制 */}
        <div className="flex items-center gap-xs shrink-0">
          {activeTracks.map((track) => (
            <div key={track.id} className="flex items-center gap-1">
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(track.volume * 100)}
                onChange={(e) => onVolumeChange(track.id, Number(e.target.value) / 100)}
                className="w-12 h-1 accent-primary"
                aria-label={`${track.id} 音量`}
              />
              <button
                type="button"
                onClick={() => onToggleTrack(track.id)}
                className="w-6 h-6 inline-flex items-center justify-center rounded-[2px] text-text-muted hover:text-on-surface transition-premium"
                aria-label={`停止 ${track.id}`}
              >
                <Icon name="pause" className="text-sm" />
              </button>
            </div>
          ))}
        </div>

        {/* 打开完整页面 */}
        <button
          type="button"
          onClick={onOpenFull}
          className="w-6 h-6 inline-flex items-center justify-center rounded-[2px] text-text-muted hover:text-primary transition-premium"
          aria-label="打开氛围音乐"
        >
          <Icon name="expand_less" className="text-sm" />
        </button>
      </div>
    </div>
  )
}

export default MiniPlayer
