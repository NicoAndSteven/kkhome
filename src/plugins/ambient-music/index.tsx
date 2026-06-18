import { useState, useEffect, useCallback } from 'react'
import { PluginRuntimeConfig } from '@core/types'
import { getAudioEngine, TrackState } from './AudioEngine'
import { TRACKS, synthesizeTrack } from './tracks'
import Icon from '../../components/Icon'

interface Props { config?: PluginRuntimeConfig }

export default function AmbientMusicPlugin(_props: Props) {
  const engine = getAudioEngine()
  const [trackStates, setTrackStates] = useState<TrackState[]>(engine.getTrackStates())
  const [loading, setLoading] = useState<Set<string>>(new Set())
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const unsub = engine.subscribe(setTrackStates)
    if (!initialized) {
      setInitialized(true)
      const ctx = new globalThis.AudioContext()
      Promise.all(
        TRACKS.map(async (track) => {
          const buffer = await synthesizeTrack(ctx, track.id)
          engine.registerTrack(track.id, buffer, 0.4)
        })
      ).then(() => {
        setTrackStates(engine.getTrackStates())
        ctx.close()
      })
    }
    return unsub
  }, [engine, initialized])

  const toggleTrack = useCallback(async (id: string) => {
    const state = trackStates.find((t) => t.id === id)
    if (!state) return

    if (state.playing) {
      engine.stop(id)
    } else {
      setLoading((prev) => new Set(prev).add(id))
      await engine.play(id)
      setLoading((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }, [engine, trackStates])

  const handleVolumeChange = useCallback((id: string, volume: number) => {
    engine.setVolume(id, volume)
  }, [engine])

  const activeCount = trackStates.filter(t => t.playing).length

  return (
    <section id="ambient-music" className="space-y-6">
      {/* Hero album section — 网易云专辑页风格 */}
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
                alt="氛围音乐"
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
          </div>
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <span className="font-label-mono text-[10px] uppercase tracking-[0.24em] text-primary">Sound Layer</span>
            <h2 className="mt-2 font-headline-md text-3xl font-semibold tracking-tight text-on-surface">氛围音乐</h2>
            <p className="mt-2 max-w-md font-body-md text-sm leading-relaxed text-on-surface-variant">
              用环境声为浏览加一层情绪层
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="font-label-mono text-[10px] uppercase tracking-[0.12em] text-primary">{TRACKS.length} 音源</span>
              </div>
              {activeCount > 0 && (
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
          </div>
        </div>
      </div>

      {/* 音轨卡片网格 */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {TRACKS.map((track) => {
          const state = trackStates.find((t) => t.id === track.id)
          const isPlaying = state?.playing ?? false
          const volume = state?.volume ?? 0.4
          const isLoading = loading.has(track.id)

          return (
            <div
              key={track.id}
              className={`surface-item rounded-2xl p-5 transition-premium ${
                isPlaying ? 'border-primary/30 bg-primary/5' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                  style={{
                    background: isPlaying
                      ? 'linear-gradient(135deg, rgba(0,47,167,0.12), rgba(0,47,167,0.06))'
                      : 'linear-gradient(135deg, rgba(245,247,250,0.95), rgba(235,240,255,0.85))',
                  }}
                >
                  {isPlaying ? (
                    <div className="flex items-end gap-[2px] h-5">
                      {[1, 2, 3].map(b => (
                        <div key={b} className="w-[2.5px] rounded-full bg-primary" style={{ animation: `mini-bar 0.7s ease-in-out ${b * 0.18}s infinite alternate`, height: `${5 + b * 5}px` }} />
                      ))}
                    </div>
                  ) : (
                    <Icon name={track.icon} className="text-2xl text-primary/70" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-body-md text-sm font-semibold text-on-surface">{track.name}</h3>
                  <span className="font-label-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                    {isPlaying ? '播放中' : (track.category === 'synth' ? '合成音' : '音频')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleTrack(track.id)}
                  disabled={isLoading}
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-premium ${
                    isPlaying
                      ? 'bg-primary text-white shadow-[0_4px_12px_-4px_rgba(0,47,167,0.3)]'
                      : 'border border-border-subtle bg-white/80 text-text-muted hover:border-primary/30 hover:text-primary'
                  } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <Icon name={isPlaying ? 'pause' : (isLoading ? 'hourglass_empty' : 'play_arrow')} className="text-lg" />
                </button>
              </div>

              {isPlaying && (
                <div className="mt-4 pt-4 border-t border-border-subtle/60">
                  <div className="flex items-center gap-2">
                    <Icon name="volume_down" className="text-xs text-text-muted shrink-0" />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(volume * 100)}
                      onChange={(e) => handleVolumeChange(track.id, Number(e.target.value) / 100)}
                      className="h-1 flex-1 accent-primary"
                      aria-label={`${track.name} 音量`}
                    />
                    <Icon name="volume_up" className="text-xs text-text-muted shrink-0" />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
