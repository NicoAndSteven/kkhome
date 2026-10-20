/**
 * 弹簧驱动的「当前项」指示条。
 *
 * 为什么不用 CSS transition：
 * 指示条要在两个相隔很远的项之间移动时，transition 是**匀速补间**——
 * 连点两次导航，会看到它不紧不慢地滑过中间每一项，读起来像"卡住了"。
 * 弹簧会先冲过去、再回弹落定，读起来才是"选中的东西被拨过去了"。
 * 实测过冲量可调：stiffness 170 / damping 16 时约过冲 12%，落点仍精确等于目标。
 *
 * 为什么用 `createAnimatable` 而不是 `animate`：
 * 目标值会被连续覆盖（用户连点）。animatable 是**持久对象**，属性 setter
 * 天然支持中途改目标；用 `animate` 则要每次先 revert 再重建一条时间线，
 * 而且重建那一帧会丢掉当前速度，弹簧的"惯性"就断了。
 */
import { createAnimatable, createSpring, type AnimatableObject } from 'animejs'
import { useCallback, useEffect, useRef, type RefObject } from 'react'
import { useReducedMotion } from './base'

export interface SpringIndicatorOptions {
  /** 目标项选择器，在 `listRef` 内查询。 */
  itemSelector: string
  /** 弹簧刚度，越大越"紧"。 */
  stiffness?: number
  /** 弹簧阻尼，越小过冲越明显。 */
  damping?: number
  /** 落位时长上限（ms）。 */
  duration?: number
}

export interface SpringIndicator {
  /** 挂在指示条元素上。 */
  ref: RefObject<HTMLDivElement>
  /** 挂在目标项的**定位祖先**上（指示条与目标项的 offsetParent 必须一致）。 */
  listRef: RefObject<HTMLDivElement>
  /** 弹到第 `index` 项。首次调用直接就位，之后走弹簧。 */
  moveTo: (index: number) => void
}

export function useSpringIndicator({
  itemSelector,
  stiffness = 170,
  damping = 16,
  duration = 620,
}: SpringIndicatorOptions): SpringIndicator {
  const ref = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<AnimatableObject | null>(null)
  const boundElRef = useRef<HTMLDivElement | null>(null)
  const placedRef = useRef(false)
  const reduced = useReducedMotion()

  /**
   * 惰性创建 animatable。
   * 不能只在挂载时创建：指示条所在的容器可能比 hook 晚出现（列表是异步渲染的），
   * 那时 `ref.current` 还是 null，animatable 就永远建不起来了。
   */
  const ensure = useCallback((): AnimatableObject | null => {
    const el = ref.current
    if (!el) return null
    if (!animRef.current || boundElRef.current !== el) {
      animRef.current?.revert()
      animRef.current = createAnimatable(el, {
        y: { unit: 'px', duration: 0, ease: 'linear' },
      })
      boundElRef.current = el
    }
    return animRef.current
  }, [])

  const moveTo = useCallback(
    (index: number) => {
      const list = listRef.current
      const pip = ref.current
      if (!list || !pip) return

      const item = list.querySelectorAll<HTMLElement>(itemSelector)[index]
      if (!item) return

      // offsetTop 是相对**最近的定位祖先**的 —— 与 pip 的包含块必须是同一个，
      // 否则指示条会带着容器的 padding / border 偏移量，肉眼看着"总是差一点"。
      const y = item.offsetTop + (item.offsetHeight - pip.offsetHeight) / 2
      const anim = ensure()
      if (!anim) return

      // 首次落位不能有动画：否则进场时会看到指示条从列表顶端滑到当前项。
      if (!placedRef.current || reduced) {
        anim.y(y)
        placedRef.current = true
        return
      }
      anim.y(y, duration, createSpring({ stiffness, damping }))
    },
    [ensure, itemSelector, reduced, stiffness, damping, duration],
  )

  useEffect(
    () => () => {
      animRef.current?.revert()
      animRef.current = null
      boundElRef.current = null
    },
    [],
  )

  return { ref, listRef, moveTo }
}
