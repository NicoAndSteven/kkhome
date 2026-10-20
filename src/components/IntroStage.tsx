import { useLayoutEffect, useState } from 'react'
import { useMotionScope } from '@core/motion'
import { MotionConfig, SiteConfig } from '@core/types'

interface Props {
  author: SiteConfig['author']
  enabled: MotionConfig['intro']
  duration: MotionConfig['introDuration']
  onComplete: () => void
}

/**
 * 序列节拍，全部相对 duration 归一（0~1）—— 改配置就能整体伸缩。
 *
 * 这些时序原先硬编码在 index.css 的 `animation-delay` 里，配置改不动它们；
 * 而且 `.intro-kicker` / `.intro-name` 的 reveal 延迟是 0，名字在 0~620ms 就揭开了，
 * 比核心（760ms 才出现、1740ms 才完成）还早 —— 所谓"核心绽放后揭示名字"的编排
 * 其实并不存在。现在顺序修正为：
 *   网格 → 扫描线 → 核心 → 光环 → 文案 → 退场
 * 退场占用尾部 16%，保证 `introDuration` 真的是"整段开场有多长"。
 */
const BEATS = {
  grid: { at: 0.00, len: 0.34 },
  scan: { at: 0.09, len: 0.30 },
  core: { at: 0.24, len: 0.30 },
  ring: { at: 0.28, len: 0.56 },
  copy: { at: 0.54, len: 0.30 },
  exit: { at: 0.84, len: 0.16 },
} as const

const IntroStage = ({ author, enabled, duration, onComplete }: Props) => {
  const [visible, setVisible] = useState(enabled)

  // 动效编排交给 anime.js 时间线；reduced-motion 时这个 scope 根本不会注册。
  const { ref, reduced } = useMotionScope<HTMLDivElement>(
    `intro:${duration}`,
    ({ root, q, timeline }) => {
      const beat = (b: { at: number; len: number }) => ({
        delay: b.at * duration,
        duration: b.len * duration,
      })

      timeline
        .add(q('.intro-grid'), {
          opacity: [0, 1], scale: [1.04, 1], ease: 'outExpo', ...beat(BEATS.grid),
        }, 0)
        .add(q('.intro-scanline'), {
          opacity: [0, 1], scaleX: [0, 1], ease: 'outExpo', ...beat(BEATS.scan),
        }, 0)
        .add(q('.intro-core'), {
          opacity: [0, 1], y: [10, 0], scale: [0.96, 1],
          filter: ['blur(8px)', 'blur(0px)'], ease: 'outExpo', ...beat(BEATS.core),
        }, 0)
        .add(q('.intro-ring-outer'), {
          scale: [0.88, 1.08], opacity: [0.3, 0], ease: 'outExpo', ...beat(BEATS.ring),
        }, 0)
        .add(q('.intro-kicker, .intro-name'), {
          '--intro-reveal': [100, 0],
          y: [8, 0], ease: 'outQuad', ...beat(BEATS.copy),
        }, 0)
        .add(root, {
          opacity: [1, 0], ease: 'outQuad', ...beat(BEATS.exit),
        }, 0)
    },
  )

  // 时长 / 滚动锁 / onComplete 的契约保持不变（e2e 依赖 .intro-stage 在 8s 内隐藏）。
  useLayoutEffect(() => {
    const scrollLockClass = 'intro-scroll-lock'
    const root = document.documentElement

    if (!enabled || reduced) {
      root.classList.remove(scrollLockClass)
      setVisible(false)
      onComplete()
      return
    }

    root.classList.add(scrollLockClass)
    let unlockTimer: number | undefined
    const completeTimer = window.setTimeout(() => {
      setVisible(false)
      onComplete()
      unlockTimer = window.setTimeout(() => {
        root.classList.remove(scrollLockClass)
      }, 980)
    }, duration)

    return () => {
      window.clearTimeout(completeTimer)
      if (unlockTimer) {
        window.clearTimeout(unlockTimer)
      }
      root.classList.remove(scrollLockClass)
    }
  }, [duration, enabled, onComplete, reduced])

  if (!visible) {
    return null
  }

  return (
    <div ref={ref} className="intro-stage" aria-hidden="true">
      <div className="intro-grid" />
      <div className="intro-scanline" />
      <div className="intro-core">
        <div className="intro-ring intro-ring-outer" />
        <div className="intro-ring intro-ring-inner" />
        <div className="intro-mark">
          <span>可</span>
        </div>
      </div>
      <div className="intro-copy">
        <span className="intro-kicker">PERSONAL SYSTEM ONLINE</span>
        <span className="intro-name">{author}</span>
      </div>
    </div>
  )
}

export default IntroStage
