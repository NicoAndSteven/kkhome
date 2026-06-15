import { TrackState } from './AudioEngine'
import { TRACKS } from './tracks'

interface Props {
  tracks: TrackState[]
  onClick: () => void
}

const NowPlayingBadge = ({ tracks, onClick }: Props) => {
  const activeTracks = tracks.filter((t) => t.playing)
  if (activeTracks.length === 0) return null

  const firstTrack = TRACKS.find((t) => t.id === activeTracks[0].id)
  const label = activeTracks.length === 1
    ? firstTrack?.name ?? '音乐'
    : `${activeTracks.length} 种音源`

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-xs rounded-full border border-primary/30 bg-primary/8 px-sm py-0.5 font-label-mono text-[10px] uppercase text-primary transition-premium hover:bg-primary/15"
      aria-label="正在播放氛围音乐"
    >
      {/* 小波形 */}
      <span className="flex items-center gap-[1px]" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-[2px] rounded-full bg-primary"
            style={{
              animation: `mini-bar 0.6s ease-in-out ${i * 0.12}s infinite alternate`,
              height: '4px',
            }}
          />
        ))}
      </span>
      {label}
    </button>
  )
}

export default NowPlayingBadge
