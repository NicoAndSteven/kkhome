/**
 * AudioEngine — 基于 Web Audio API 的氛围音引擎
 * 支持多音源混音、淡入淡出、循环播放
 */

import { TRACKS } from './tracks'


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
  /**
   * 频谱分析器。串在 master 和 destination 之间 —— 直通，不改变听感，
   * 但能读到**真实**的频谱数据。
   *
   * 为什么值得加：这个插件原来的"频谱条"是假的 —— 固定节奏上下摆动
   * （`animation: mini-bar 0.8s … infinite alternate`），跟实际在响什么毫无关系。
   * 而这个插件的音源全部是 Web Audio 合成的（见 tracks.ts 的 `category: 'synth'`），
   * 所以拿到真实频谱的成本就是在图里插一个节点。
   */
  private analyser: AnalyserNode | null = null
  /** 显式标成 `Uint8Array<ArrayBuffer>` —— `getByteFrequencyData` 不接受
   *  `Uint8Array<ArrayBufferLike>`（TS 5.7 起 TypedArray 带了缓冲区类型参数）。 */
  private freqData: Uint8Array<ArrayBuffer> | null = null
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

      this.analyser = this.ctx.createAnalyser()
      this.analyser.fftSize = 256
      // 0.75 让柱子有轻微余韵，不会随每一帧抖动
      this.analyser.smoothingTimeConstant = 0.75
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount)

      this.masterGain.connect(this.analyser)
      this.analyser.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return { ctx: this.ctx, master: this.masterGain! }
  }

  /**
   * 读取当前频谱，按**对数**分桶归一化到 0–1（低频在前）。
   *
   * 为什么必须对数分桶：音频能量大致按频率倒数衰减，线性分桶会让高频那几根
   * 柱子永远是 0，看起来像坏了。人耳本身也是对数的，按对数切才符合直觉。
   *
   * 没有任何音轨在播时返回全 0 —— 调用方据此停止 rAF 循环。
   */
  getLevels(bars = 5, minHz = 60, maxHz = 6000): number[] {
    const analyser = this.analyser
    const data = this.freqData
    if (!analyser || !data || this.sources.size === 0 || !this.ctx) {
      return new Array(bars).fill(0)
    }
    analyser.getByteFrequencyData(data)

    const nyquist = this.ctx.sampleRate / 2
    const out: number[] = []
    for (let i = 0; i < bars; i++) {
      const f0 = minHz * Math.pow(maxHz / minHz, i / bars)
      const f1 = minHz * Math.pow(maxHz / minHz, (i + 1) / bars)
      const i0 = Math.max(0, Math.floor((f0 / nyquist) * data.length))
      const i1 = Math.min(data.length - 1, Math.max(i0, Math.ceil((f1 / nyquist) * data.length)))
      let sum = 0
      let n = 0
      for (let k = i0; k <= i1; k++) {
        sum += data[k]
        n++
      }
      out.push(n > 0 ? sum / n / 255 : 0)
    }
    return out
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
      this.analyser = null
      this.freqData = null
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
