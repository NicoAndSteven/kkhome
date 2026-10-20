/**
 * 转盘的"甩一下"——指针拖拽跟手 + 释放后用弹簧落位。
 *
 * 为什么这件事必须由 JS 做：
 * 原来的实现是 `transition: transform 4s cubic-bezier(...)` —— 一个**固定 4 秒**
 * 的匀速减速。用户没法参与，只能看它自己转完。而"转盘"这个交互的全部价值就是手感：
 * 用手指拨动、松手后靠惯性滑出去、被弹簧拉回最近的扇区。这是**连续量映射**
 * （指针角度 → 旋转角度），CSS 没有这个能力。
 *
 * 三个实现要点，都是实测踩出来的：
 *
 * 1. **`rotate` 写进 `transform`，会覆盖元素自带的 transform。**
 *    所以转盘元素本身不能再带别的 transform（原来的 `transform: rotate(Ndeg)`
 *    由 React state 写入，必须删掉，改由这里独占）。
 *
 * 2. **`createAnimatable` 是持久对象**，拖拽期间用 `duration: 0` 直接改值
 *    （跟手），释放时再传 `duration` + 弹簧缓动。不要每帧重建动画。
 *
 * 3. **`createSpring` 是真的弹簧**，不是缓动曲线。实测：目标 120 时峰值到 155
 *    （过冲 35）；damping 从 5 改到 20，过冲从 48 降到 0。
 *    所以它能给出"冲过头再回来"的手感，而且落点仍然精确等于目标值。
 */
import { createAnimatable, createSpring, type AnimatableObject } from 'animejs'
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { useReducedMotion } from './base'

export interface FlickSpinOptions {
  /** 扇区角度（度）。传了则释放后吸附到最近的扇区中心。 */
  segment?: number
  /** 弹簧刚度。越大越"紧"。 */
  stiffness?: number
  /** 弹簧阻尼。越小过冲越明显。 */
  damping?: number
  /** 甩动速度 → 额外旋转角度的系数（毫秒 × 系数 = 度）。 */
  velocityFactor?: number
  /** 落位动画时长上限（ms）。 */
  settleDuration?: number
  /** 落位后回调，参数是最终角度。 */
  onSettle?: (angle: number) => void
}

export interface FlickSpin {
  /** 挂在转盘元素上。 */
  ref: RefObject<HTMLDivElement>
  /** 当前角度（度，单调递增，可能超过 360）。 */
  angle: () => number
  /** 相对当前角度再转 `delta` 度，用弹簧落位。 */
  spinBy: (
    delta: number,
    opts?: { duration?: number; snap?: boolean; onSettle?: (angle: number) => void },
  ) => void
  /** 是否正在被手指/鼠标拖动。 */
  dragging: boolean
  /** 拖拽事件绑定，展开到转盘元素上。 */
  bind: {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void
    onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void
  }
}

const norm180 = (deg: number) => {
  let d = deg % 360
  if (d > 180) d -= 360
  if (d < -180) d += 360
  return d
}

export function useFlickSpin({
  segment,
  stiffness = 90,
  damping = 14,
  velocityFactor = 140,
  settleDuration = 1600,
  onSettle,
}: FlickSpinOptions = {}): FlickSpin {
  const ref = useRef<HTMLDivElement>(null)
  const animRef = useRef<AnimatableObject | null>(null)
  const boundElRef = useRef<HTMLDivElement | null>(null)
  const angleRef = useRef(0)
  const draggingRef = useRef(false)
  const [dragging, setDragging] = useState(false)
  const samplesRef = useRef<Array<{ t: number; a: number }>>([])
  const lastPointerAngleRef = useRef(0)
  const onSettleRef = useRef(onSettle)
  onSettleRef.current = onSettle
  const reduced = useReducedMotion()

  /**
   * 惰性创建 animatable。
   *
   * **不能只在挂载时创建** —— 转盘元素往往比组件晚出现。
   * 例如 food 插件先把"还没有选项"的空状态渲染出来，等数据到位才渲染转盘，
   * 这时挂载那次 effect 里 `ref.current` 还是 null，animatable 永远建不起来。
   * 症状很隐蔽：结果徽章照常弹出（回调照常触发），但转盘纹丝不动。
   */
  const ensureAnimatable = useCallback((): AnimatableObject | null => {
    const el = ref.current
    if (!el) return null
    // 元素换了（React 重建了节点）也要重建
    if (!animRef.current || boundElRef.current !== el) {
      animRef.current?.revert()
      // duration: 0 —— 拖拽期间改值要立刻生效，不能有过渡
      animRef.current = createAnimatable(el, { rotate: { unit: 'deg', duration: 0, ease: 'linear' } })
      boundElRef.current = el
    }
    return animRef.current
  }, [])

  const angle = useCallback(() => angleRef.current, [])

  const apply = useCallback((deg: number, duration = 0, ease?: unknown) => {
    angleRef.current = deg
    const anim = ensureAnimatable()
    if (!anim) return
    if (duration === 0) anim.rotate(deg)
    else anim.rotate(deg, duration, ease as never)
  }, [ensureAnimatable])

  // 卸载时清理
  useEffect(() => {
    return () => {
      animRef.current?.revert()
      animRef.current = null
      boundElRef.current = null
    }
  }, [])

  const spinBy = useCallback(
    (delta: number, opts?: { duration?: number; snap?: boolean; onSettle?: (angle: number) => void }) => {
      let target = angleRef.current + delta
      if (opts?.snap !== false && segment && segment > 0) {
        target = Math.round(target / segment) * segment
      }
      // 每次调用可以带自己的回调（例如"这次转到第 3 个扇区"），
      // 没有则退回 hook 级的 onSettle。
      const done = opts?.onSettle ?? ((a: number) => onSettleRef.current?.(a))
      if (reduced) {
        // reduced-motion：直接落位，不做弹簧
        apply(target)
        done(target)
        return
      }
      const spring = createSpring({ stiffness, damping })
      const duration = opts?.duration ?? settleDuration
      apply(target, duration, spring)
      // 弹簧落点精确等于 target（实测：目标 120 时峰值 155、最终仍回到 120），
      // 所以直接用 target 回调，不必等动画结束再读角度。
      window.setTimeout(() => done(target), duration)
    },
    [segment, reduced, apply, stiffness, damping, settleDuration],
  )

  const pointerAngle = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return 0
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    return (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI
  }

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reduced) return
      draggingRef.current = true
      setDragging(true)
      lastPointerAngleRef.current = pointerAngle(e)
      samplesRef.current = [{ t: e.timeStamp, a: angleRef.current }]
      e.currentTarget.setPointerCapture?.(e.pointerId)
    },
    [reduced],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return
      const now = pointerAngle(e)
      const delta = norm180(now - lastPointerAngleRef.current)
      lastPointerAngleRef.current = now
      apply(angleRef.current + delta)

      const s = samplesRef.current
      s.push({ t: e.timeStamp, a: angleRef.current })
      if (s.length > 6) s.shift()
    },
    [apply],
  )

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return
      draggingRef.current = false
      setDragging(false)
      e.currentTarget.releasePointerCapture?.(e.pointerId)

      // 用最近几个采样点估角速度（度/毫秒）
      const s = samplesRef.current
      let velocity = 0
      if (s.length >= 2) {
        const first = s[0]
        const last = s[s.length - 1]
        const dt = last.t - first.t
        if (dt > 0) velocity = (last.a - first.a) / dt
      }
      samplesRef.current = []

      // 惯性投影 + 吸附。velocityFactor 把"甩得多快"换成"还能转多少度"。
      const projected = angleRef.current + velocity * velocityFactor
      let target = projected
      if (segment && segment > 0) target = Math.round(target / segment) * segment

      const spring = createSpring({ stiffness, damping })
      apply(target, settleDuration, spring)
      window.setTimeout(() => onSettleRef.current?.(target), settleDuration)
    },
    [apply, segment, stiffness, damping, settleDuration, velocityFactor],
  )

  // 卸载时清掉待触发的回调
  useEffect(() => {
    return () => {
      samplesRef.current = []
    }
  }, [])

  return {
    ref,
    angle,
    spinBy,
    dragging,
    bind: { onPointerDown, onPointerMove, onPointerUp: endDrag, onPointerCancel: endDrag },
  }
}
