/**
 * 列表重排（FLIP）—— 筛选 / 排序时让元素"移动过去"而不是"瞬移"。
 *
 * 为什么用 anime.js 的 `createLayout` 而不是自己写 FLIP：
 * 它把 FLIP 里最容易做错的几步（临时 `position: absolute` 固定住旧位置、
 * 记录内联样式、结束后还原、新元素的 enter 动画）都封好了，而且**动的是
 * 独立的 `translate` 属性**，不碰 `transform`（实测：元素自带的
 * `skewX(-5deg)` 在动画后仍是 `matrix(1, 0, -0.0874887, 1, 0, 0)`）。
 *
 * React 里的时序是这个 hook 唯一需要注意的地方：
 * `createLayout(root)` 在**构造时**记录"旧布局"，之后改 DOM，再 `animate()` 做 diff。
 * 而 React 是先 commit DOM 变更、再跑 effect —— 也就是说 effect 里拿到的
 * DOM 已经是新布局了。所以实例必须在**变更之前**就存在。
 *
 * 解法：挂载时创建实例（记录初始布局），之后每次 trigger 变化只调 `animate()`。
 * 实测一个实例连跑两轮都能正常动画（cycle1 中间态 `6px 41.17px`，
 * cycle2 中间态 `6px 54.05px`），不需要在中间手工 `record()`。
 */
import { createLayout, type AutoLayout } from 'animejs'
import { useEffect, useRef, type RefObject } from 'react'
import { usePrePaintEffect, useReducedMotion } from './base'

export interface FlipLayoutOptions {
  /** 参与重排的子元素选择器。不传则用容器的全部元素子节点。 */
  selector?: string
  /** 单次重排动画时长（ms）。 */
  duration?: number
  /** 缓动。`outExpo` 收尾快，适合"移动过去"这种不该拖沓的动作。 */
  ease?: string
  /** 触发重排的键（通常是筛选条件 + 结果集长度的组合）。 */
  trigger: string | number
}

/**
 * 让容器内的子元素在重排时平滑移动。
 *
 * ```tsx
 * const listRef = useFlipLayout<HTMLDivElement>({ trigger: filter + items.length })
 * return <div ref={listRef}>{items.map(...)}</div>
 * ```
 *
 * 注意：`createLayout` 在动画期间会把子元素临时设成 `position: absolute`，
 * 所以**容器需要有确定的尺寸**（有高度或由自身 padding 撑开），
 * 否则动画期间容器会塌成 0 高，视觉上是"整块跳一下"。
 */
export function useFlipLayout<T extends HTMLElement>({
  selector,
  duration = 420,
  ease = 'outExpo',
  trigger,
}: FlipLayoutOptions): RefObject<T> {
  const ref = useRef<T>(null)
  const layoutRef = useRef<AutoLayout | null>(null)
  const reduced = useReducedMotion()

  // 记录初始布局 / 每次变更后做 diff 动画。
  // 刻意**不在这里写 cleanup** —— cleanup 会在每次 trigger 变化前先跑，
  // 那会把实例清掉，于是下一轮只能重新构造（而那时 DOM 已经变了，
  // diff 恒为零，动画静默失效）。卸载时的清理放在下面那个空依赖 effect 里。
  usePrePaintEffect(() => {
    const root = ref.current
    if (!root || reduced) return

    if (!layoutRef.current) {
      layoutRef.current = createLayout(root, {
        duration,
        ease,
        ...(selector ? { children: selector } : {}),
      })
      return
    }

    layoutRef.current.animate()
  }, [trigger, reduced, duration, ease, selector])

  // 只在真正卸载时清理
  useEffect(() => {
    return () => {
      layoutRef.current?.revert()
      layoutRef.current = null
    }
  }, [])

  return ref
}
