/**
 * 错峰入场：把"元素数量是运行时数据"的揭示交给 JS。
 *
 * CSS 做不到这件事，原因有三：
 * 1. **元素数量是运行时数据**。工具列表 313 条、愿望卡片随筛选变化，
 *    `animation-delay` 只能写成静态公式 `i * 25ms` —— 元素一多就排到 1 秒开外，
 *    而且这个公式是"手写清单"，元素数量变了不会有人去改它。
 * 2. **重放时机**。只有 JS 能知道"结果集变了"这个事实。
 * 3. **不覆盖元素自带的 transform**。这里动的是自定义属性 `--m-rise`
 *    （配合 index.css 的 `.m-rise` 把 `--m-rise` 编进**独立的 `translate` 属性**），
 *    而不是 `transform`。
 *
 * 第 3 点为什么关键 —— 实测证据：anime.js 的 `x` / `y` / `translateX` / `rotate` /
 * `scale` 全都写进 **`transform`**（`animate(el,{translateX:60})` 的结果是
 * `transform: matrix(1,0,0,1,60,0)`，而 `translate` 仍是 `none`）。
 * 而 `transform` 是**整个属性覆盖** —— `.ac-shottitle` 的 `skewX(-5deg)`、
 * Tailwind 的 `hover:-translate-y-1` 都会永久消失。
 * 写自定义属性则安全：实测 `animate(el,{'--rise':[24,0]})` 之后
 * `transform` 仍是 `matrix(1, 0, -0.0874887, 1, 0, 0)`，skew 完好。
 *
 * 渐进增强：初始态由 JS 写入（不是 CSS）。JS 没跑或 reduced-motion 时，
 * 元素保持原样可见 —— 不会出现"动画没跑所以内容永远不显示"。
 */
import { animate, createScope, onScroll, stagger } from 'animejs'
import { useRef, type RefObject } from 'react'
import { afterFirstPaint, clearPrimedState, primeState, usePrePaintEffect, useReducedMotion } from './base'

export interface StaggerInOptions {
  /** 要错峰揭示的元素选择器（相对 root）。 */
  selector: string
  /**
   * 触发重放的键。传"结果集长度"即可：筛选/搜索改变了元素数量才重放，
   * 数量不变就不重放（避免边打字边重放）。
   */
  trigger?: string | number
  /** 单个元素的动画时长（ms）。 */
  duration?: number
  /** 相邻元素的起始间隔（ms）。元素多时会自动压缩，见 maxTotal。 */
  stagger?: number
  /** 整条错峰序列的时长上限（ms）。防止 48 个卡片排到 1 秒开外。 */
  maxTotal?: number
  /** 起始位移（px），0 表示只淡入不位移。 */
  from?: number
}

export function useStaggerIn<T extends HTMLElement>({
  selector,
  trigger,
  duration = 420,
  stagger: gap = 26,
  maxTotal = 560,
  from = 18,
}: StaggerInOptions): RefObject<T> {
  const ref = useRef<T>(null)
  const reduced = useReducedMotion()

  usePrePaintEffect(() => {
    const root = ref.current
    if (!root) return

    const targets = Array.from(root.querySelectorAll<HTMLElement>(selector))
    if (targets.length === 0) return

    // reduced-motion：不注册动画，并清掉可能残留的内联态（比如用户中途改了系统设置）
    if (reduced) {
      clearPrimedState(targets)
      return
    }

    // 把总时长压进 maxTotal：元素多时缩小间隔，而不是拉长整条序列
    const span = Math.max(0, maxTotal - duration)
    const step = targets.length > 1 ? Math.min(gap, span / (targets.length - 1)) : 0

    primeState(targets, from)

    let cancelPaint: (() => void) | undefined

    const scope = createScope({ root }).add(() => {
      // 先建后播：初始态（prime）已在上面同步落下，这里只把"开始走时间"推迟到
      // 新树画完第一帧。否则挂载阻塞会被算进进度，第一条元素的首帧就已经走了
      // 19%（实测于 ai-tools，740 个节点）。原因见 base.ts 的 afterFirstPaint。
      const animation = animate(targets, {
        opacity: [0, 1],
        '--m-rise': [from, 0],
        duration,
        delay: stagger(step),
        ease: 'outExpo',
        autoplay: false,
      })
      cancelPaint = afterFirstPaint(() => animation.play())
    })

    return () => {
      cancelPaint?.()
      scope.revert()
    }
  }, [trigger, reduced, selector, duration, gap, maxTotal, from])

  return ref
}

export interface ScrollStaggerOptions {
  /** 要错峰揭示的元素（在每个触发组内查找）。 */
  selector: string
  /** 触发组：每个匹配元素各自作为一次触发的单元（例如每个 `.ac-shot` 镜头）。 */
  group: string
  duration?: number
  stagger?: number
  maxTotal?: number
  from?: number
  /**
   * 触发位置，anime.js 的 `'<容器边> <目标边>'` 语法。
   * 默认 `'bottom-=80 top'` = 目标顶边进入视口底部再往上 80px 时触发，
   * 也就是元素**已经露出 80px** 才开始动，而不是刚露一个像素就动完。
   */
  enter?: string
}

/**
 * 滚动触发的错峰入场：每个 `group` 元素滚进视口时，把它内部的
 * `selector` 元素错峰揭示。
 *
 * 用 anime.js 自带的 `onScroll`，而不是自己写 IntersectionObserver +
 * 加 class 让 CSS 过渡 —— 后者是"触发器 + CSS 动画"两套东西拼起来，
 * 而且元素数量变化时得手动重算延迟。这里触发和动画是一体的。
 */
export function useScrollStagger<T extends HTMLElement>({
  selector,
  group,
  duration = 520,
  stagger: gap = 70,
  maxTotal = 700,
  from = 30,
  enter = 'bottom-=80 top',
}: ScrollStaggerOptions): RefObject<T> {
  const ref = useRef<T>(null)
  const reduced = useReducedMotion()

  usePrePaintEffect(() => {
    const root = ref.current
    if (!root) return

    // reduced-motion：不注册任何滚动监听，并清掉可能残留的内联态
    if (reduced) {
      clearPrimedState(Array.from(root.querySelectorAll<HTMLElement>(selector)))
      return
    }

    const groups = Array.from(root.querySelectorAll<HTMLElement>(group))
    if (groups.length === 0) return

    const scope = createScope({ root }).add(() => {
      for (const g of groups) {
        const targets = Array.from(g.querySelectorAll<HTMLElement>(selector))
        if (targets.length === 0) continue

        const span = Math.max(0, maxTotal - duration)
        const step = targets.length > 1 ? Math.min(gap, span / (targets.length - 1)) : 0

        // 先把初始态落到内联样式上，再挂滚动动画。
        // 不依赖 anime.js 是否在创建时就渲染 from 值 —— 如果不渲染，
        // 元素会先原样显示，等滚到了才"突然消失再淡入"，是可见的闪烁。
        primeState(targets, from)

        animate(targets, {
          opacity: [0, 1],
          '--m-rise': [from, 0],
          duration,
          delay: stagger(step),
          ease: 'outExpo',
          autoplay: onScroll({ target: g, enter, repeat: false }),
        })
      }
    })

    return () => scope.revert()
  }, [reduced, selector, group, duration, gap, maxTotal, from, enter])

  return ref
}
