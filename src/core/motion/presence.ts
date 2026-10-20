/**
 * 弹层的"进出场"（presence）—— 补上退场动画。
 *
 * 背景：项目里两个 Sheet（CreateRoomSheet / JoinRoomSheet）原本是
 * `if (!open) return null`，于是**关掉是硬消失，根本没有退场动画**。
 * 进场有 `.party-anim-slide-up`（CSS），退场什么都没有 —— 不对称。
 *
 * 为什么这件事必须由 JS 做：
 * React 卸载元素是同步的，元素一消失就没法再对它做动画。要播退场，
 * 必须把"卸载"推迟到动画结束 —— 这个时序只有 JS 能管。
 *
 * 为什么不用 CSS 的 `animation-direction: reverse` 凑：
 * 那样得同时维护"打开状态"和"关闭状态"两套类名，中间还要有个
 * "正在关闭"的第三态，而且 `display: none` 的时机仍然要 JS 定。
 * 时间线一次写完更不容易漏。
 */
import { animate, createTimeline, type Timeline } from 'animejs'
import { useRef, useState, type RefObject } from 'react'
import { usePrePaintEffect, useReducedMotion } from './base'

export interface OverlayTransitionOptions {
  /** 遮罩层选择器（相对 root）。传 null 表示没有遮罩。 */
  backdrop?: string | null
  /** 面板选择器（相对 root）。 */
  panel: string
  /** 进场时长（ms）。 */
  enterDuration?: number
  /** 退场时长（ms）。退场要**明显快于**进场，这是弹层的通用手感。 */
  exitDuration?: number
  /** 面板进场时的起始位移（CSS 长度），默认从下方整屏外滑入。 */
  panelFrom?: string
}

export interface OverlayTransition {
  /** 挂在弹层的最外层容器上。容器本身不需要样式，子元素是 fixed 定位。 */
  rootRef: RefObject<HTMLDivElement>
  /** 是否应该渲染。退场动画播完之前保持 true。 */
  mounted: boolean
}

/**
 * 让弹层有进有出。用法：
 *
 * ```tsx
 * const { rootRef, mounted } = useOverlayTransition(open, { panel: '[data-panel]', backdrop: '[data-backdrop]' })
 * if (!mounted) return null
 * return (
 *   <div ref={rootRef}>
 *     <div data-backdrop className="fixed inset-0 ..." onClick={onClose} />
 *     <form data-panel className="fixed inset-x-0 bottom-0 ...">{children}</form>
 *   </div>
 * )
 * ```
 *
 * 注意：**不要给 root 加 transform / translate**，否则里面 `position: fixed`
 * 的子元素会改以 root 为包含块。这里只动子元素，不动 root。
 */
export function useOverlayTransition(
  open: boolean,
  { backdrop = null, panel, enterDuration = 340, exitDuration = 220, panelFrom = '0px 100%' }: OverlayTransitionOptions,
): OverlayTransition {
  const rootRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(open)
  const reduced = useReducedMotion()

  // 退场动画的句柄。open 中途翻回 true 时要能取消它，否则会先播完退场再进场。
  const activeRef = useRef<Timeline | null>(null)

  // open 变 true 时立刻挂载（在绘制前，避免"打开时先空白一帧"）
  usePrePaintEffect(() => {
    if (open && !mounted) setMounted(true)
  }, [open, mounted])

  usePrePaintEffect(() => {
    const root = rootRef.current
    if (!root || !mounted) return

    const panelEl = root.querySelector<HTMLElement>(panel)
    if (!panelEl) return
    const backdropEl = backdrop ? root.querySelector<HTMLElement>(backdrop) : null

    // 上一段动画（可能是被打断的退场）先停掉，避免两段抢同一个属性
    activeRef.current?.revert()
    activeRef.current = null

    if (reduced) {
      // reduced-motion：直接切到终态，不做位移和淡入
      panelEl.style.translate = ''
      if (backdropEl) backdropEl.style.opacity = ''
      if (!open) setMounted(false)
      return
    }

    if (open) {
      // 进场：面板从下往上滑，遮罩淡入。
      // 先落初始态再建动画 —— anime.js 的 from 值要等首次 tick 才写内联样式，
      // 不落的话面板会先在终态闪一帧再跳下去。
      panelEl.style.translate = panelFrom
      if (backdropEl) backdropEl.style.opacity = '0'

      const tl = createTimeline()
      if (backdropEl) tl.add(backdropEl, { opacity: [0, 1], duration: enterDuration * 0.7, ease: 'outQuad' }, 0)
      tl.add(panelEl, { translate: [panelFrom, '0px 0px'], duration: enterDuration, ease: 'outExpo' }, 0)
      activeRef.current = tl
    } else {
      // 退场：面板往下滑出 + 遮罩淡出，**播完才卸载**。
      //
      // 同样要先落初始态。不落的话实测会看到：点击关闭后某一帧面板突然
      // 出现在终态（已滑出屏幕外），下一帧又回到起点慢慢滑下去 —— 是可见的闪跳。
      // 原因是上一段动画 revert 后内联 translate 被清掉，而新动画的 from 值
      // 要等引擎首次 tick 才写回。
      panelEl.style.translate = '0px 0px'
      if (backdropEl) backdropEl.style.opacity = '1'

      const tl = createTimeline()
      tl.add(panelEl, { translate: ['0px 0px', panelFrom], duration: exitDuration, ease: 'inQuad' }, 0)
      if (backdropEl) tl.add(backdropEl, { opacity: [1, 0], duration: exitDuration, ease: 'inQuad' }, 0)
      tl.then(() => {
        // 清掉内联态再卸载，否则下次打开会带着上一次的残值
        panelEl.style.translate = ''
        if (backdropEl) backdropEl.style.opacity = ''
        setMounted(false)
      })
      activeRef.current = tl
    }
  }, [open, mounted, reduced, panel, backdrop, enterDuration, exitDuration, panelFrom])

  return { rootRef, mounted }
}

/**
 * 单个元素的退场：用于"列表项被删掉"这类场景。
 *
 * 与 `useOverlayTransition` 的区别是它**不管理挂载**，只负责把元素动出画面
 * 然后回调。调用方在回调里做真正的移除（改 state）。
 *
 * 为什么要单独有这个：实测 `createLayout` **不能**做退场 ——
 * 元素从 DOM 移除后它不保留任何克隆节点（探针实测：移除 1 个元素后
 * 容器子节点数从 3 变 2，没有幽灵节点），所以 leave 动画无从谈起。
 * 想让被删的元素动出去，只能自己先把动画播完再删。
 */
export function exitThenRemove(
  el: HTMLElement,
  onDone: () => void,
  { duration = 200, to = '0px -12px' }: { duration?: number; to?: string } = {},
): () => void {
  const tween = animate(el, {
    opacity: [1, 0],
    translate: ['0px 0px', to],
    duration,
    ease: 'inQuad',
    onComplete: onDone,
  })
  return () => tween.revert()
}
