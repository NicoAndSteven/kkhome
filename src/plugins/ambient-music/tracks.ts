/**
 * 音轨定义与合成器
 * 自然音使用 Web Audio API 合成，复杂音源使用 MP3 文件
 */

/* eslint-disable no-undef */

export interface TrackDef {
  id: string
  name: string
  icon: string
  category: 'synth' | 'file'
  color: string
}

/** 可用音轨列表 */
export const TRACKS: TrackDef[] = [
  { id: 'rain', name: '雨声', icon: 'water_drop', category: 'synth', color: '#3b82f6' },
  { id: 'waves', name: '海浪', icon: 'waves', category: 'synth', color: '#06b6d4' },
  { id: 'forest', name: '森林', icon: 'forest', category: 'synth', color: '#22c55e' },
  { id: 'whitenoise', name: '白噪音', icon: 'graphic_eq', category: 'synth', color: '#8b5cf6' },
  { id: 'fireplace', name: '壁炉', icon: 'local_fire_department', category: 'synth', color: '#f97316' },
]

/**
 * 使用 Web Audio API 合成环境音
 * 每种音色通过噪声生成器 + 滤波器组合实现
 */
export async function synthesizeTrack(
  ctx: AudioContext,
  trackId: string,
  durationSec = 4
): Promise<AudioBuffer> {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * durationSec
  const buffer = ctx.createBuffer(2, length, sampleRate)

  switch (trackId) {
    case 'rain':
      return synthesizeRain(buffer, sampleRate, length)
    case 'waves':
      return synthesizeWaves(buffer, sampleRate, length)
    case 'forest':
      return synthesizeForest(buffer, sampleRate, length)
    case 'whitenoise':
      return synthesizeWhiteNoise(buffer, sampleRate, length)
    case 'fireplace':
      return synthesizeFireplace(buffer, sampleRate, length)
    default:
      return synthesizeWhiteNoise(buffer, sampleRate, length)
  }
}

/** 生成 [0, 1) 范围的伪随机数 */
function xorshift32(seed: number): () => number {
  let state = seed || 1
  return () => {
    state ^= state << 13
    state ^= state >> 17
    state ^= state << 5
    return ((state >>> 0) / 4294967296)
  }
}

/** 雨声：带通滤波的棕色噪声 + 随机滴答 */
function synthesizeRain(buffer: AudioBuffer, sampleRate: number, length: number): AudioBuffer {
  const left = buffer.getChannelData(0)
  const right = buffer.getChannelData(1)
  const rng = xorshift32(42)

  // 棕色噪声基底
  let lastL = 0, lastR = 0
  for (let i = 0; i < length; i++) {
    const whiteL = rng() * 2 - 1
    const whiteR = rng() * 2 - 1
    lastL = (lastL + 0.02 * whiteL) / 1.02
    lastR = (lastR + 0.02 * whiteR) / 1.02
    // 带通滤波近似：衰减低频和高频
    const t = i / sampleRate
    const mod = 0.3 + 0.15 * Math.sin(2 * Math.PI * 0.3 * t) // 缓慢音量起伏
    left[i] = lastL * 6 * mod
    right[i] = lastR * 6 * mod
  }

  // 添加随机雨滴
  for (let d = 0; d < 80; d++) {
    const pos = Math.floor(rng() * length)
    const freq = 2000 + rng() * 4000
    const amp = 0.01 + rng() * 0.03
    const decay = 0.005 + rng() * 0.01
    for (let i = 0; i < 200 && pos + i < length; i++) {
      const val = amp * Math.sin(2 * Math.PI * freq * i / sampleRate) * Math.exp(-decay * i)
      left[pos + i] += val
      right[pos + i] += val * 0.7
    }
  }

  return buffer
}

/** 海浪：低频调制的棕色噪声 */
function synthesizeWaves(buffer: AudioBuffer, sampleRate: number, length: number): AudioBuffer {
  const left = buffer.getChannelData(0)
  const right = buffer.getChannelData(1)
  const rng = xorshift32(137)

  let lastL = 0, lastR = 0
  for (let i = 0; i < length; i++) {
    const whiteL = rng() * 2 - 1
    const whiteR = rng() * 2 - 1
    lastL = (lastL + 0.02 * whiteL) / 1.02
    lastR = (lastR + 0.02 * whiteR) / 1.02

    const t = i / sampleRate
    // 海浪周期 ~8 秒
    const wave = Math.pow((Math.sin(2 * Math.PI * 0.125 * t) + 1) / 2, 2)
    const volume = 0.1 + wave * 0.7

    left[i] = lastL * 8 * volume
    right[i] = lastR * 8 * volume
  }

  return buffer
}

/** 森林：鸟鸣 + 风声 */
function synthesizeForest(buffer: AudioBuffer, sampleRate: number, length: number): AudioBuffer {
  const left = buffer.getChannelData(0)
  const right = buffer.getChannelData(1)
  const rng = xorshift32(256)

  // 风声基底（棕色噪声，低音量）
  let lastL = 0, lastR = 0
  for (let i = 0; i < length; i++) {
    const whiteL = rng() * 2 - 1
    const whiteR = rng() * 2 - 1
    lastL = (lastL + 0.01 * whiteL) / 1.01
    lastR = (lastR + 0.01 * whiteR) / 1.01
    left[i] = lastL * 3
    right[i] = lastR * 3
  }

  // 鸟鸣：短促正弦波 + 频率滑动
  for (let b = 0; b < 15; b++) {
    const pos = Math.floor(rng() * (length - 2000))
    const baseFreq = 1800 + rng() * 3000
    const chirpLen = 40 + Math.floor(rng() * 120)
    const amp = 0.02 + rng() * 0.04
    const pan = rng()

    for (let i = 0; i < chirpLen; i++) {
      const freq = baseFreq + (rng() - 0.5) * 800 // 频率抖动
      const env = Math.sin(Math.PI * i / chirpLen) // 包络
      const val = amp * Math.sin(2 * Math.PI * freq * i / sampleRate) * env
      if (pos + i < length) {
        left[pos + i] += val * (1 - pan)
        right[pos + i] += val * pan
      }
    }
  }

  return buffer
}

/** 白噪音：均匀频谱噪声 */
function synthesizeWhiteNoise(buffer: AudioBuffer, _sampleRate: number, length: number): AudioBuffer {
  const left = buffer.getChannelData(0)
  const right = buffer.getChannelData(1)
  const rng = xorshift32(999)

  for (let i = 0; i < length; i++) {
    left[i] = (rng() * 2 - 1) * 0.15
    right[i] = (rng() * 2 - 1) * 0.15
  }

  return buffer
}

/** 壁炉：噼啪声 + 低频隆隆声 */
function synthesizeFireplace(buffer: AudioBuffer, sampleRate: number, length: number): AudioBuffer {
  const left = buffer.getChannelData(0)
  const right = buffer.getChannelData(1)
  const rng = xorshift32(777)

  // 低频隆隆声
  let lastL = 0, lastR = 0
  for (let i = 0; i < length; i++) {
    const whiteL = rng() * 2 - 1
    const whiteR = rng() * 2 - 1
    lastL = (lastL + 0.04 * whiteL) / 1.04
    lastR = (lastR + 0.04 * whiteR) / 1.04
    const t = i / sampleRate
    const flicker = 0.4 + 0.3 * Math.sin(2 * Math.PI * 0.5 * t + rng() * 0.1)
    left[i] = lastL * 5 * flicker
    right[i] = lastR * 5 * flicker
  }

  // 噼啪声
  for (let c = 0; c < 30; c++) {
    const pos = Math.floor(rng() * length)
    const amp = 0.02 + rng() * 0.06
    const decay = 0.02 + rng() * 0.05
    const crackleLen = Math.min(300, length - pos)
    for (let i = 0; i < crackleLen; i++) {
      const val = amp * (rng() * 2 - 1) * Math.exp(-decay * i)
      left[pos + i] += val
      right[pos + i] += val * 0.8
    }
  }

  return buffer
}
