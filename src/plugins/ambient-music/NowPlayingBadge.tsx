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
      className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface/80 px-3 py-1.5 font-label-mono text-[10px] uppercase tracking-[0.24em] text-primary backdrop-blur-sm transition-premium hover:border-primary/25 hover:bg-primary/6"
      aria-label="正在播放氛围音乐"
    >
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
      <span className="max-w-[9rem] truncate">{label}</span>
    </button>
  )
}

export default NowPlayingBadge
