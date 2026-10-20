/**
 * 把**连续量**（音频频谱、进度、指针位置……）映射到一组元素的尺寸上。
 *
 * 这是 CSS 完全做不到的一类：CSS 只能表达离散状态（有类 / 没类），
 * 没有"按比例"这回事。而频谱每帧都在变，只能由 JS 驱动。
 *
 * 为什么用 `createAnimatable` 而不是每帧 `el.style.height = ...`：
 * 1. **平滑**。`createAnimatable` 是持久对象，每次 `set` 都带着一个短时长过渡，
 *    所以柱子会"追"目标值而不是硬跳 —— 频闪感消失。
 * 2. **不覆盖 transform**。它只动 `height`，跟元素自带的其他属性互不干扰。
 * 3. **卸载干净**。`revert()` 一次性还原，不会留下被 JS 写死的内联尺寸。
 *
 * 实测确认的两件事（都在探针里量过）：
 * - **每个元素一个实例**是可行的用法：`createAnimatable(el, { height: { unit: 'px' } })`
 *   然后 `anim.height(14)`，四个元素分别得到 14 / 26 / 38 / 50。
 * - **单实例 + 数组不是逐元素**：`createAnimatable(els, {...}).height([20,30,40,50])`
 *   之后四个元素的高度都还是 4，getter 也只返回一个数字。所以别图省事。
 */
import { createAnimatable, type AnimatableObject } from 'animejs'
import { useCallback, useRef, type RefObject } from 'react'
import { usePrePaintEffect, useReducedMotion } from './base'

export interface LevelBarsOptions {
  /** 每根柱子的选择器（相对 root）。 */
  selector?: string
  /** 柱子数量。必须与 DOM 里实际渲染的数量一致。 */
  count: number
  /** 值为 0 时的最小高度（px）—— 留一点底，不然像没渲染出来。 */
  min?: number
  /** 值为 1 时的最大高度（px）。 */
  max?: number
  /** 平滑时长（ms）。越大越"黏"，越小越跟手。 */
  smoothing?: number
}

export interface LevelBars {
  /** 挂在这组柱子的容器上。 */
  ref: RefObject<HTMLDivElement>
  /** 推入一批 0–1 的归一化值（多余的忽略，缺的补 0）。 */
  push: (levels: number[]) => void
  /** reduced-motion 时为 true —— 调用方应停止 rAF 循环，避免空转。 */
  reduced: boolean
}

/**
 * 用连续量驱动一组柱子的高度。
 *
 * ```tsx
 * const bars = useLevelBars({ count: 5, max: 20 })
 * // rAF 里：
 * bars.push(engine.getLevels(5))
 * return <div ref={bars.ref}>{Array.from({length: 5}, (_, i) => <i data-level-bar key={i} />)}</div>
 * ```
 */
export function useLevelBars({
  selector = '[data-level-bar]',
  count,
  min = 3,
  max = 22,
  smoothing = 90,
}: LevelBarsOptions): LevelBars {
  const ref = useRef<HTMLDivElement>(null)
  const animsRef = useRef<AnimatableObject[]>([])
  const reduced = useReducedMotion()

  usePrePaintEffect(() => {
    const root = ref.current
    if (!root) return

    const bars = Array.from(root.querySelectorAll<HTMLElement>(selector)).slice(0, count)
    animsRef.current = bars.map((el) =>
      createAnimatable(el, { height: { unit: 'px', duration: smoothing, ease: 'outQuad' } }),
    )

    return () => {
      for (const a of animsRef.current) a.revert()
      animsRef.current = []
    }
  }, [count, selector, smoothing])

  const push = useCallback(
    (levels: number[]) => {
      const anims = animsRef.current
      for (let i = 0; i < anims.length; i++) {
        const raw = levels[i]
        const v = typeof raw === 'number' && Number.isFinite(raw) ? Math.max(0, Math.min(1, raw)) : 0
        anims[i].height(min + v * (max - min))
      }
    },
    [min, max],
  )

  return { ref, push, reduced }
}
