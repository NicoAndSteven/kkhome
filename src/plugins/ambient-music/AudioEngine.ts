/**
 * AudioEngine — 基于 Web Audio API 的氛围音引擎
 * 支持多音源混音、淡入淡出、循环播放
 */

import { TRACKS } from './tracks'

/* eslint-disable no-undef */

export interface TrackState {
  id: string
  playing: boolean
  volume: number // 0-1
  progress: number // 0-1
  duration: number // seconds
}

type EngineListener = (tracks: TrackState[]) => void

export class AudioEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private sources: Map<string, { node: AudioBufferSourceNode; gain: GainNode; buffer: AudioBuffer }> = new Map()
  private trackConfigs: Map<string, { buffer: AudioBuffer; volume: number; _progress: number; duration: number }> = new Map()
  private listeners: Set<EngineListener> = new Set()
  private _started = false
  private tickTimer: ReturnType<typeof setInterval> | null = null

  get started() { return this._started }

  private ensureContext() {
    if (!this.ctx) {
      this.ctx = new AudioContext()
      this.masterGain = this.ctx.createGain()
      this.masterGain.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return { ctx: this.ctx, master: this.masterGain! }
  }

  /** 注册一个音轨的 AudioBuffer */
  registerTrack(id: string, buffer: AudioBuffer, defaultVolume = 0.5) {
    const def = TRACKS.find(t => t.id === id)
    const duration = def?.duration ?? 120
    this.trackConfigs.set(id, { buffer, volume: defaultVolume, _progress: 0, duration })
    this.notify()
  }

  /** 开始播放指定音轨，带淡入 */
  async play(id: string, fadeMs = 800) {
    const config = this.trackConfigs.get(id)
    if (!config) return

    // 如果已经在播放，先停止
    this.stop(id, 0)

    const { ctx, master } = this.ensureContext()
    const gain = ctx.createGain()
    gain.gain.value = 0
    gain.connect(master)

    const source = ctx.createBufferSource()
    source.buffer = config.buffer
    source.loop = true
    source.connect(gain)
    source.start()

    // 淡入
    gain.gain.linearRampToValueAtTime(config.volume, ctx.currentTime + fadeMs / 1000)

    this.sources.set(id, { node: source, gain, buffer: config.buffer })
    this._started = true
    this.startTick()
    this.notify()
  }

  /** 停止播放指定音轨，带淡出 */
  stop(id: string, fadeMs = 600) {
    const entry = this.sources.get(id)
    if (!entry) return

    const { ctx } = this.ensureContext()
    const { node, gain } = entry

    if (fadeMs > 0) {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeMs / 1000)
      setTimeout(() => {
        try { node.stop() } catch { /* already stopped */ }
        try { node.disconnect() } catch { /* */ }
        try { gain.disconnect() } catch { /* */ }
      }, fadeMs + 50)
    } else {
      try { node.stop() } catch { /* */ }
      try { node.disconnect() } catch { /* */ }
      try { gain.disconnect() } catch { /* */ }
    }

    this.sources.delete(id)
    if (this.sources.size === 0) this.stopTick()
    this.notify()
  }

  /** 设置音轨音量 */
  setVolume(id: string, volume: number) {
    const config = this.trackConfigs.get(id)
    if (config) config.volume = volume

    const entry = this.sources.get(id)
    if (entry) {
      const { ctx } = this.ensureContext()
      entry.gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05)
    }
    this.notify()
  }

  /** 设置主音量 */
  setMasterVolume(volume: number) {
    const { master } = this.ensureContext()
    master.gain.linearRampToValueAtTime(volume, this.ctx!.currentTime + 0.05)
  }

  /** 停止所有音轨 */
  stopAll(fadeMs = 600) {
    for (const id of this.sources.keys()) {
      this.stop(id, fadeMs)
    }
    this._started = false
  }

  private startTick() {
    if (this.tickTimer) return
    this.tickTimer = setInterval(() => {
      let hasPlaying = false
      for (const id of this.sources.keys()) {
        const config = this.trackConfigs.get(id)
        if (!config) continue
        hasPlaying = true
        // Increment progress approximately (50ms tick / duration)
        const inc = 0.05 / config.duration
        config._progress = (config._progress || 0) + inc
        if (config._progress >= 1) config._progress = 0
      }
      if (hasPlaying) this.notify()
      else this.stopTick()
    }, 50)
  }

  private stopTick() {
    if (this.tickTimer) {
      clearInterval(this.tickTimer)
      this.tickTimer = null
    }
  }

  /** Seek to a specific progress point on a track */
  seek(id: string, progress: number): void {
    const config = this.trackConfigs.get(id)
    if (config) {
      config._progress = Math.max(0, Math.min(1, progress))
    }
    this.notify()
  }

  /** 获取当前所有音轨状态 */
  getTrackStates(): TrackState[] {
    return Array.from(this.trackConfigs.entries()).map(([id, config]) => ({
      id,
      playing: this.sources.has(id),
      volume: config.volume,
      progress: config._progress || 0,
      duration: config.duration || 120,
    }))
  }

  /** 订阅状态变更 */
  subscribe(listener: EngineListener) {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  private notify() {
    const states = this.getTrackStates()
    this.listeners.forEach((fn) => fn(states))
  }

  /** 销毁引擎 */
  destroy() {
    this.stopTick()
    this.stopAll(0)
    if (this.ctx) {
      this.ctx.close()
      this.ctx = null
      this.masterGain = null
    }
    this.listeners.clear()
  }
}

// 全局单例
let _instance: AudioEngine | null = null

export function getAudioEngine(): AudioEngine {
  if (!_instance) {
    _instance = new AudioEngine()
  }
  return _instance
}
