import { TrackState } from './AudioEngine'
import { TRACKS } from './tracks'
import Icon from '../../components/Icon'

interface Props {
  tracks: TrackState[]
  onToggleTrack: (id: string) => void
  onOpenFull: () => void
}

const MiniPlayer = ({ tracks, onToggleTrack, onOpenFull }: Props) => {
  const activeTracks = tracks.filter((track) => track.playing)

  const primary = activeTracks[0] ?? tracks[0] ?? { id: TRACKS[0].id, playing: false }
  const orderedTracks = tracks
    .map((track) => TRACKS.findIndex((meta) => meta.id === track.id))
    .filter((index) => index >= 0)
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
    <section className="sidebar-now-playing stack-board relative aspect-square overflow-hidden rounded-[28px] border border-[rgba(19,27,58,0.14)] bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(236,241,255,0.94),rgba(255,230,236,0.88))] p-4 shadow-[0_28px_64px_-42px_rgba(19,27,58,0.24)]">
      <div className="absolute left-4 top-4 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${isPlaying ? 'bg-secondary shadow-[0_0_14px_rgba(224,20,52,0.45)]' : 'bg-primary shadow-[0_0_14px_rgba(17,72,255,0.35)]'}`} />
        <span className="font-label-mono text-[9px] uppercase tracking-[0.26em] text-text-muted">
          {isPlaying ? 'On air' : 'Standby'}
        </span>
      </div>

      <div className="relative flex h-full flex-col justify-between">
        <div className="pt-8">
          <div className="stack-chip font-label-mono text-[9px] uppercase tracking-[0.24em] text-primary">
            sound object
          </div>

          <div className="mt-5 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="line-clamp-2 font-headline-md text-[clamp(1.6rem,2vw,2rem)] font-semibold leading-[0.9] tracking-[-0.06em] text-on-surface">
                {meta.name}
              </div>
              <p className="mt-3 max-w-[15ch] text-[11px] leading-relaxed text-on-surface-variant">
                {isPlaying
                  ? activeTracks.length > 1
                    ? `${activeTracks.length} 条音源正在叠加发声。`
                    : '当前音源已点亮，正在作为页面的背景装置工作。'
                  : '选择一条音源，让整个界面开始流动。'}
              </p>
              </div>

            <div
              className="grid h-16 w-16 shrink-0 place-items-center rounded-[18px] border border-[rgba(19,27,58,0.12)] bg-[linear-gradient(145deg,rgba(17,72,255,0.96),rgba(224,20,52,0.88))] text-white shadow-[0_18px_36px_-20px_rgba(19,27,58,0.28)]"
              aria-hidden="true"
            >
              <Icon name={meta?.icon ?? 'music_note'} className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 rounded-[20px] border border-[rgba(19,27,58,0.1)] bg-white/72 px-3 py-2">
            <button
              type="button"
              onClick={() => cycleTrack(-1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(19,27,58,0.12)] bg-white/84 text-on-surface transition-premium hover:border-primary/45 hover:text-primary active:scale-[0.98]"
              aria-label="上一首"
            >
              <Icon name="skip_previous" className="text-base" />
            </button>

            <button
              type="button"
              onClick={() => onToggleTrack(primary.id)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#1148ff,#e01434)] text-white transition-premium hover:scale-[1.03] active:scale-[0.96]"
              aria-label={isPlaying ? '暂停当前音源' : '播放当前音源'}
            >
              <Icon name={isPlaying ? 'pause' : 'play_arrow'} className="text-lg" />
            </button>

            <button
              type="button"
              onClick={() => cycleTrack(1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(19,27,58,0.12)] bg-white/84 text-on-surface transition-premium hover:border-primary/45 hover:text-primary active:scale-[0.98]"
              aria-label="下一首"
            >
              <Icon name="skip_next" className="text-base" />
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenFull}
            className="inline-flex w-full items-center justify-between gap-3 rounded-[18px] border border-[rgba(19,27,58,0.12)] bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(237,242,255,0.8))] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-on-surface transition-premium hover:border-primary/35 hover:bg-white"
          >
            <span>进入音乐档案</span>
            <span className="font-label-mono text-[10px] uppercase tracking-[0.24em] text-primary">
              {String(orderedTracks.length || TRACKS.length).padStart(2, '0')}
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}

export default MiniPlayer
