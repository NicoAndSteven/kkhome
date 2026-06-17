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

  return (
    <section id="ambient-music" className="space-y-5">
      <div className="surface-panel-strong rounded-[28px] p-5 md:p-7">
        <span className="inline-flex items-center gap-2 font-label-mono text-[10px] uppercase tracking-[0.24em] text-primary">
          <span className="h-2 w-2 rounded-full bg-[rgba(223,161,144,0.95)]" />
          sound layer
        </span>
        <h2 className="mt-2 font-headline-md text-3xl font-semibold tracking-tight text-on-surface">氛围音乐</h2>
        <p className="mt-2 max-w-2xl font-body-md text-sm leading-relaxed text-on-surface-variant">
          用更轻的环境声给浏览过程加一层情绪，不把整站变成播放器。
        </p>
      </div>

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
                isPlaying ? 'border-primary/30 bg-primary/5 shadow-[0_0_0_1px_rgba(111,143,184,0.12)]' : ''
              }`}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-white/80" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.72)' }}>
                  <Icon name={track.icon} className="text-xl text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-body-md text-sm font-semibold text-on-surface">{track.name}</h3>
                  <span className="font-label-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                    {isPlaying ? '播放中' : track.category === 'synth' ? '合成音' : '音频'}
                  </span>
                </div>
              </div>

              {isPlaying && (
                <div className="mb-4 flex h-7 items-end gap-[2px]" aria-hidden="true">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div
                      key={i}
                      className="w-[3px] rounded-full"
                      style={{
                        backgroundColor: track.color,
                        animation: `mini-bar 0.8s ease-in-out ${i * 0.08}s infinite alternate`,
                        height: `${4 + Math.random() * 16}px`,
                      }}
                    />
                  ))}
                </div>
              )}

              {isPlaying && (
                <div className="mb-4 flex items-center gap-2">
                  <Icon name="volume_down" className="text-xs text-text-muted" />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(volume * 100)}
                    onChange={(e) => handleVolumeChange(track.id, Number(e.target.value) / 100)}
                    className="h-1 flex-1 accent-primary"
                    aria-label={`${track.name} 音量`}
                  />
                  <Icon name="volume_up" className="text-xs text-text-muted" />
                </div>
              )}

              <button
                type="button"
                onClick={() => toggleTrack(track.id)}
                disabled={isLoading}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-premium ${
                  isPlaying
                    ? 'border border-[rgba(223,161,144,0.35)] bg-[rgba(223,161,144,0.12)] text-[rgb(150,95,84)] hover:bg-[rgba(223,161,144,0.18)]'
                    : 'bg-primary text-on-primary hover:opacity-90'
                } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <Icon name={isPlaying ? 'stop' : 'play_arrow'} className="text-base" />
                {isLoading ? '加载中…' : isPlaying ? '停止' : '播放'}
              </button>
            </div>
          )
        })}
      </div>

      <div className="border-t border-border-subtle pt-4">
        <p className="text-center font-body-md text-xs text-text-muted">
          页面任意交互即可自动播放 · 支持同时播放多种音源混音
        </p>
      </div>
    </section>
  )
}
