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

  // 订阅引擎状态
  useEffect(() => {
    const unsub = engine.subscribe(setTrackStates)
    // 首次加载时初始化所有音轨的 AudioBuffer
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
      // 短延迟模拟加载感
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
    <section id="ambient-music" className="h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 mb-md">
        <span className="font-label-mono text-xs uppercase text-secondary">AMBIENT</span>
        <h2 className="mt-xs font-headline-md text-headline-md text-on-surface">氛围音乐</h2>
        <p className="mt-xs font-body-md text-sm text-text-muted">
          选择环境音，营造沉浸式浏览体验。支持多音源混音。
        </p>
      </div>

      {/* Track grid */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="grid gap-sm sm:grid-cols-2 lg:grid-cols-3">
          {TRACKS.map((track) => {
            const state = trackStates.find((t) => t.id === track.id)
            const isPlaying = state?.playing ?? false
            const volume = state?.volume ?? 0.4
            const isLoading = loading.has(track.id)

            return (
              <div
                key={track.id}
                className={`surface-item rounded-[2px] p-md transition-all duration-300 ${
                  isPlaying ? 'border-primary/40 shadow-sm' : ''
                }`}
              >
                {/* Track icon + name */}
                <div className="flex items-center gap-sm mb-sm">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${track.color}15` }}
                  >
                    <Icon name={track.icon} className="text-xl text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-body-md text-sm font-semibold text-on-surface">{track.name}</h3>
                    <span className="font-label-mono text-[10px] uppercase text-text-muted">
                      {isPlaying ? '播放中' : track.category === 'synth' ? '合成音' : '音频'}
                    </span>
                  </div>
                </div>

                {/* Waveform visualization when playing */}
                {isPlaying && (
                  <div className="flex items-end gap-[2px] h-6 mb-sm" aria-hidden="true">
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

                {/* Volume slider */}
                {isPlaying && (
                  <div className="flex items-center gap-xs mb-sm">
                    <Icon name="volume_down" className="text-xs text-text-muted" />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(volume * 100)}
                      onChange={(e) => handleVolumeChange(track.id, Number(e.target.value) / 100)}
                      className="flex-1 h-1 accent-primary"
                      aria-label={`${track.name} 音量`}
                    />
                    <Icon name="volume_up" className="text-xs text-text-muted" />
                  </div>
                )}

                {/* Play/Stop button */}
                <button
                  type="button"
                  onClick={() => toggleTrack(track.id)}
                  disabled={isLoading}
                  className={`w-full inline-flex items-center justify-center gap-xs rounded-[2px] px-sm py-2 font-body-md text-sm font-semibold transition-premium ${
                    isPlaying
                      ? 'bg-error/10 text-error hover:bg-error/20'
                      : 'bg-primary text-on-primary hover:opacity-90'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Icon name={isPlaying ? 'stop' : 'play_arrow'} className="text-base" />
                  {isLoading ? '加载中…' : isPlaying ? '停止' : '播放'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer hint */}
      <div className="shrink-0 mt-md pt-sm border-t border-border-subtle">
        <p className="font-body-md text-xs text-text-muted text-center">
          页面任意交互即可自动播放 · 支持同时播放多种音源混音
        </p>
      </div>
    </section>
  )
}
