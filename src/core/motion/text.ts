/**
 * 文本类动效：逐字揭示、数字滚动。
 *
 * 这两件事 CSS 都做不到：
 * - **逐字揭示**需要先把文本拆成字符节点。CSS 没有"拆分文本"这回事，
 *   手写拆分会把可访问性搞坏（读屏软件会把每个字念一遍）。anime.js 的
 *   `splitText` 默认 `accessible: true`，会额外生成一份视觉隐藏的完整文本给读屏用。
 * - **数字滚动**需要一个中间值序列。CSS 的 `@property` 只能插值数值，
 *   但把插值结果写回文本内容仍然需要 JS。
 *
 * 关于 `splitText` 与 React 共存的风险 —— 它会把元素的子节点换成生成的 span。
 * 所以**只能用在 React 挂载后不再更新文本的元素上**（例如由配置驱动、只读一次的标题）。
 * 如果 React 之后要改这段文字，它会找不到原来的文本节点。本 hook 的用法约定是：
 * 目标元素的文本在组件生命周期内不变。
 */
import { animate, splitText, stagger } from 'animejs'
import { useRef, type RefObject } from 'react'
import { usePrePaintEffect, useReducedMotion } from './base'

export interface TextRevealOptions {
  /** 要拆分的元素选择器（相对 root）。每个匹配元素各自拆成字符。 */
  selector: string
  /** 拆分粒度。字符更戏剧化，词更克制。 */
  by?: 'chars' | 'words'
  /** 触发重放的键。 */
  trigger?: string | number
  /**
   * 是否启用。false 时**不拆分也不动画** —— 文本保持原样。
   *
   * 用于"等开场遮罩退场后再揭示"这类场景：如果提前拆了并落成 opacity 0，
   * 用户会在遮罩后面看不到任何东西，遮罩一退场文案却已经播完了。
   */
  enabled?: boolean
  /** 整条序列的起始延迟（ms）。 */
  delay?: number
  /** 单个字符的动画时长（ms）。 */
  duration?: number
  /** 相邻字符的起始间隔（ms）。 */
  stagger?: number
  /** 元素之间的额外延迟（ms）—— 多行时让行与行有先后。 */
  lineDelay?: number
  /** 起始位移（px）。 */
  from?: number
}

/**
 * 逐字（或逐词）揭示。
 *
 * ```tsx
 * const titleRef = useTextReveal<HTMLHeadingElement>({ selector: '.vh-line' })
 * return <h1 ref={titleRef}><span className="vh-line">第一行</span>...</h1>
 * ```
 *
 * 位移用**独立的 `translate` 属性**（不是 `transform`）—— 实测 anime.js 的
 * `y` / `translateX` 会写进 `transform` 并覆盖元素自带的值，而写 `translate`
 * 不会（skew 等原值保留）。
 */
export function useTextReveal<T extends HTMLElement>({
  selector,
  by = 'chars',
  trigger,
  enabled = true,
  delay = 0,
  duration = 620,
  stagger: gap = 26,
  lineDelay = 90,
  from = 14,
}: TextRevealOptions): RefObject<T> {
  const ref = useRef<T>(null)
  const reduced = useReducedMotion()

  usePrePaintEffect(() => {
    const root = ref.current
    if (!root || !enabled) return

    const targets = Array.from(root.querySelectorAll<HTMLElement>(selector))
    if (targets.length === 0) return

    const splitters = targets.map((el) =>
      splitText(el, by === 'chars' ? { chars: true } : { words: true }),
    )

    if (reduced) {
      // reduced-motion：不拆也不动，直接还原（splitText 已经改过 DOM 了）
      return () => {
        for (const s of splitters) s.revert()
      }
    }

    splitters.forEach((splitter, index) => {
      const segments = (by === 'chars' ? splitter.chars : splitter.words) as HTMLElement[]
      if (segments.length === 0) return

      // 用 addEffect 挂动画：splitText 在窗口尺寸变化时会重新拆分，
      // 挂在 effect 上的动画会跟着重建，不需要我手动监听 resize。
      splitter.addEffect(() => {
        // 先落初始态。不落的话字符会先完整显示一帧再跳下去。
        for (const seg of segments) {
          seg.style.opacity = '0'
          seg.style.translate = `0px ${from}px`
        }
        return animate(segments, {
          opacity: [0, 1],
          translate: [`0px ${from}px`, '0px 0px'],
          duration,
          delay: stagger(gap, { start: delay + index * lineDelay }),
          ease: 'outExpo',
        })
      })
    })

    return () => {
      for (const s of splitters) s.revert()
    }
  }, [selector, by, trigger, enabled, delay, duration, gap, lineDelay, from, reduced])

  return ref
}

export interface CountUpOptions {
  /** 触发重放的键。 */
  trigger?: string | number
  /** 动画时长（ms）。 */
  duration?: number
  /** 起始延迟（ms）—— 用于与同屏其它编排对齐。 */
  delay?: number
  /** 小数位。 */
  decimals?: number
  /** 千分位分隔。 */
  separator?: boolean
  /** 最小整数位，不足补前导零。胶片序号要 `01` 而不是 `1`。 */
  pad?: number
  /** 前缀 / 后缀（如 "%"）。 */
  prefix?: string
  suffix?: string
}

/**
 * 数字滚动。直接把结果写进 `textContent`，**不走 React state** ——
 * 每帧 setState 会引发每秒 60 次重渲染，在低端设备上肉眼可见地掉帧。
 *
 * ```tsx
 * const numRef = useCountUp(313, { suffix: ' 个' })
 * return <span ref={numRef}>313 个</span>
 * ```
 */
export function useCountUp<T extends HTMLElement>(
  value: number,
  { trigger, duration = 900, delay = 0, decimals = 0, separator = false, pad: padTo = 0, prefix = '', suffix = '' }: CountUpOptions = {},
): RefObject<T> {
  const ref = useRef<T>(null)
  const reduced = useReducedMotion()

  usePrePaintEffect(() => {
    const el = ref.current
    if (!el) return

    const fmt = (v: number) => {
      const fixed = v.toFixed(decimals)
      const body = separator ? Number(fixed).toLocaleString('zh-CN', { minimumFractionDigits: decimals }) : fixed
      const padded = padTo > 0 ? body.padStart(padTo + (decimals > 0 ? decimals + 1 : 0), '0') : body
      return `${prefix}${padded}${suffix}`
    }

    // reduced-motion：直接给终值，不滚动
    if (reduced) {
      el.textContent = fmt(value)
      return
    }

    // 从 0 起滚。用代理对象驱动，不依赖元素上已有的数值。
    const proxy = { v: 0 }
    el.textContent = fmt(0)
    const tween = animate(proxy, {
      v: value,
      duration,
      delay,
      ease: 'outExpo',
      onUpdate: () => {
        el.textContent = fmt(proxy.v)
      },
    })

    return () => {
      tween.revert()
    }
  }, [value, trigger, duration, delay, decimals, separator, padTo, prefix, suffix, reduced])

  return ref
}
