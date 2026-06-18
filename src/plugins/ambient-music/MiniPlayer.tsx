import { TrackState } from './AudioEngine'
import { TRACKS } from './tracks'
import Icon from '../../components/Icon'
import PolaroidCard from '../../components/PolaroidCard'

interface Props {
  tracks: TrackState[]
  onToggleTrack: (id: string) => void
  onOpenFull: () => void
}

const MiniPlayer = ({ tracks, onToggleTrack }: Props) => {
  const activeTracks = tracks.filter((track) => track.playing)
  const primary = activeTracks[0] ?? tracks[0] ?? { id: TRACKS[0].id, playing: false }
  const primaryIndex = TRACKS.findIndex((track) => track.id === primary.id)
  const meta = TRACKS.find((track) => track.id === primary.id) ?? TRACKS[0]
  const isPlaying = activeTracks.length > 0 && primary.playing

  const cycleTrack = (direction: -1 | 1) => {
    const nextIndex = primaryIndex >= 0
      ? (primaryIndex + direction + TRACKS.length) % TRACKS.length
      : 0
    const nextTrack = TRACKS[nextIndex]
    if (!nextTrack) return
    if (primary.id !== nextTrack.id && isPlaying) onToggleTrack(primary.id)
    onToggleTrack(nextTrack.id)
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border-subtle bg-gradient-to-b from-surface via-surface-card to-[rgba(0,47,167,0.03)] p-4 shadow-[0_8px_32px_-16px_var(--color-panel-shadow)]">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <PolaroidCard src="/images/yuanyu.png" size={140} alt={meta.name} rotating={isPlaying} hideLabel />

          {isPlaying && (
            <div
              className="absolute -inset-3 rounded-full opacity-40"
              style={{
                background: 'radial-gradient(circle, rgba(0,47,167,0.08) 0%, transparent 70%)',
                animation: 'pulse-ring 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>

        <div className="w-full text-center">
          <div className="font-headline-md text-[1.1rem] font-semibold leading-tight tracking-[-0.02em] text-on-surface line-clamp-1">
            {meta.name}
          </div>
        </div>

        <div className="flex w-full items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => cycleTrack(-1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-premium hover:text-primary active:scale-[0.92]"
            aria-label="上一首"
          >
            <Icon name="skip_previous" className="text-lg" />
          </button>

          <button
            type="button"
            onClick={() => onToggleTrack(primary.id)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-[0_4px_16px_-6px_rgba(0,47,167,0.35)] transition-premium hover:scale-[1.06] hover:shadow-[0_6px_24px_-8px_rgba(0,47,167,0.45)] active:scale-[0.94]"
            aria-label={isPlaying ? '暂停' : '播放'}
          >
            <Icon name={isPlaying ? 'pause' : 'play_arrow'} className="text-xl" />
          </button>

          <button
            type="button"
            onClick={() => cycleTrack(1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-premium hover:text-primary active:scale-[0.92]"
            aria-label="下一首"
          >
            <Icon name="skip_next" className="text-lg" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default MiniPlayer
