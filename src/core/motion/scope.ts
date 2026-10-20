/**
 * anime.js scope 的 React 包装。
 *
 * scope 解决的是"组件卸载后动画还在跑"的问题：JS 驱动的动画不会随 React 卸载
 * 自动消失，留下野动画会让"点了没反应"这类问题极难查。
 */
import { createScope, createTimeline, type Timeline } from 'animejs'
import { useRef, type RefObject } from 'react'
import { afterFirstPaint, primeState, usePrePaintEffect, useReducedMotion } from './base'

export interface MotionContext<T extends HTMLElement> {
  root: T
  timeline: Timeline
  /**
   * 在 root 内查元素。省掉每处重复的 querySelectorAll，也统一返回数组好直接交给 anime.js。
   *
   * 注意：`querySelectorAll` **不包含 root 自己**。要动 root 本身，直接把 `root`
   * 传给时间线（RouteCut 就是这么做的）。
   */
  q: (selector: string) => HTMLElement[]
  /**
   * 在创建动画**之前**同步落下初始态（opacity + 位移）。
   *
   * 为什么必须手动做这一步：anime.js 的 from 值要等引擎首次 tick 才写入内联样式，
   * 在那之前元素以 CSS 默认态渲染 —— 会先完整显示一帧，再跳成 opacity 0 开始动。
   * 这一步在 `usePrePaintEffect` 里执行，所以第一帧就是初始态，不会闪。
   *
   * `translate` 传 CSS 长度字符串（如 `'0px -16px'`）。**优先用它而不是 `y`/`x`** ——
   * anime.js 的 `y`/`x` 写 `transform`，会覆盖元素自带的值（`.vh-figure` 的
   * `rotate(3deg)` 就这么被抹掉过）。
   */
  prime: (selector: string, options?: { opacity?: number; rise?: number; translate?: string }) => void
}

/**
 * 在 root 内建立 anime.js scope 并执行编排。
 *
 * - 卸载时自动 `scope.revert()`，不留野动画、不残留内联样式。
 * - reduced-motion 时**完全不注册动画**（而不是把时长设成 0）：
 *   这样调用方只要读返回的 `reduced` 就能同步跳过自己的 JS 计时器，
 *   不会出现"动画不动了但计时器还在跑"的错位。
 * - `key` 变化会重建 scope，用于按路由 / 配置重新编排。
 */
export function useMotionScope<T extends HTMLElement>(
  key: string,
  build: (ctx: MotionContext<T>) => void,
): { ref: RefObject<T>; reduced: boolean } {
  const ref = useRef<T>(null)
  const reduced = useReducedMotion()
  const buildRef = useRef(build)
  buildRef.current = build

  usePrePaintEffect(() => {
    const root = ref.current
    if (!root || reduced) return

    let cancelPaint: (() => void) | undefined

    const scope = createScope({ root }).add(() => {
      // 时间线**先建但不播**。初始态（prime）仍在这里同步落下 —— 那是绘制前
      // 必须完成的事；推迟的只是"开始走时间"。
      // 原因见 afterFirstPaint：挂载阻塞会被算进播放进度，吃掉动画的开头。
      const timeline = createTimeline({ autoplay: false })
      buildRef.current({
        root,
        timeline,
        q: (selector) => Array.from(root.querySelectorAll<HTMLElement>(selector)),
        prime: (selector, { opacity = 0, rise = 0, translate } = {}) =>
          primeState(Array.from(root.querySelectorAll<HTMLElement>(selector)), rise, opacity, translate),
      })
      cancelPaint = afterFirstPaint(() => timeline.play())
    })

    return () => {
      cancelPaint?.()
      scope.revert()
    }
  }, [key, reduced])

  return { ref, reduced }
}
