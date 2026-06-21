import { TrackState } from './AudioEngine'
import { TRACKS } from './tracks'
import Icon from '../../components/Icon'
import PolaroidCard from '../../components/PolaroidCard'
import { useMusicPlayer } from '../../contexts/MusicPlayerContext'

interface Props {
  tracks: TrackState[]
  onToggleTrack: (id: string) => void
  onOpenFull: () => void
}

const MiniPlayer = ({ tracks, onToggleTrack }: Props) => {
  const { currentSong, playing } = useMusicPlayer()
  const activeTracks = tracks.filter((track) => track.playing)
  const primary = activeTracks[0] ?? tracks[0] ?? { id: TRACKS[0].id, playing: false }
  const isPlaying = activeTracks.length > 0 && primary.playing

  const cycleTrack = (direction: -1 | 1) => {
    const primaryIndex = TRACKS.findIndex((track) => track.id === primary.id)
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
        {/* 拍立得卡片 */}
        <div className="relative">
          {currentSong ? (
            <>
              <PolaroidCard
                src="/images/yuanyu.png"
                size={140}
                alt={currentSong.title}
                rotating={playing}
                hideLabel={false}
              />
              {playing && (
                <div
                  className="absolute -inset-3 rounded-full opacity-40"
                  style={{
                    background: 'radial-gradient(circle, rgba(0,47,167,0.08) 0%, transparent 70%)',
                    animation: 'pulse-ring 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center" style={{ width: 157, height: 146 }}>
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-2">
                <Icon name="music_note" className="text-xl text-text-muted" />
              </div>
              <p className="font-label-mono text-[10px] text-text-muted uppercase tracking-wider">未在播放</p>
            </div>
          )}
        </div>

        {/* 歌曲信息 */}
        <div className="w-full text-center min-h-[2.5rem] flex flex-col justify-center">
          {currentSong ? (
            <>
              <div className="font-headline-md text-[1.1rem] font-semibold leading-tight tracking-[-0.02em] text-on-surface line-clamp-1">
                {currentSong.title}
              </div>
              <div className="font-label-mono text-[10px] text-text-muted mt-0.5 tracking-wider">
                {currentSong.artist}
              </div>
            </>
          ) : (
            <p className="font-body-md text-sm text-text-muted">选择歌曲开始播放</p>
          )}
        </div>

        {/* 控制按钮 */}
        <div className="flex w-full items-center justify-center gap-3">
          {currentSong ? (
            <a
              href="#/local-music"
              className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-full bg-primary/10 text-primary font-label-mono text-[10px] uppercase tracking-wider hover:bg-primary/15 transition-premium"
            >
              <Icon name="music_note" className="text-sm" />
              查看播放器
            </a>
          ) : tracks.length > 0 ? (
            <>
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
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default MiniPlayer
