import { type ReactNode } from 'react'
import { useMotionScope } from '@core/motion'

// 同一时刻只允许存在一条幽灵条。快速连点 / StrictMode 双跑时，
// 新一次 build 直接收掉上一条，避免 remove 时机互相踩。
let activeMorphGhost: HTMLDivElement | null = null

export type RouteTransitionMode = 'morph' | 'cut'

export interface RouteCutProps {
  /** 路由 id：作为编排键，变化即重放整条时间线 */
  routeId: string
  /** 1-based 路由序号，印在切镜幕布上（仅 cut 模式） */
  index: number
  /** 前进 / 后退，决定页头元素与幕布的行进方向 */
  direction: 'ac-fwd' | 'ac-back'
  /**
   * morph：导航高亮条飞向页头 kicker，桌面端默认。
   * cut：保留原来的双层幕布，移动端使用。
   */
  mode?: RouteTransitionMode
  className?: string
  /** 供无障碍读屏的路由名 */
  label?: string
  children: ReactNode
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * 路由切镜。
 *
 * morph（默认）：把「导航高亮条 → 页头 kicker 前的强调线」做成一次共享元素转场。
 * 高亮条是 body 下的 fixed 幽灵元素，不放进 .route-view —— 路由内容里可能有
 * 游戏房间、灯箱这类 fixed 浮层，祖先一带 transform，它们就会改以祖先为包含块。
 *
 * cut（移动端）：保留原来的双层幕布。幕布同样是 fixed，且不能有 transform 祖先。
 *
 * 两种模式都只动 opacity / transform，且由 anime.js scope 统一清理；reduced-motion
 * 时 useMotionScope 完全不注册动画，因此不会留下幽灵元素或半截动画。
 */
const RouteCut = ({
  routeId,
  index,
  direction,
  mode = 'morph',
  className = '',
  label,
  children,
}: RouteCutProps) => {
  const dir = direction === 'ac-fwd' ? 1 : -1

  const { ref } = useMotionScope<HTMLDivElement>(`route-cut:${mode}:${routeId}`, ({ root, q, timeline }) => {
    if (mode === 'cut') {
      const accents = q('.kk-curtain')
      const canvases = q('.kk-curtain-b')
      const indices = q('.kk-curtain-idx')

      // 原点放在行进方向的起点边缘：前进时从左往右露出，后退反之。
      const origin = dir > 0 ? 'left center' : 'right center'
      for (const el of [...accents, ...canvases]) {
        el.style.transformOrigin = origin
        // 初始态在这里落下（useMotionScope 的 build 跑在 useLayoutEffect 内，绘制前），
        // 否则会先看到一帧完整内容，再被幕布盖住。
        el.style.transform = 'scaleX(1)'
      }
      for (const el of indices) el.style.opacity = '0.9'

      timeline
        // 强调色层先退，露出画布层；画布层再退，露出内容。
        .add(accents, { scaleX: [1, 0], duration: 560, ease: 'outExpo' }, 0)
        .add(canvases, { scaleX: [1, 0], duration: 560, ease: 'outExpo' }, 90)
        .add(indices, { opacity: [0.9, 0], scale: [1, 1.2], duration: 320, ease: 'outQuad' }, 0)
      return
    }

    // ── morph ──

    // 新路由整体先压暗再亮起，掩盖旧路由瞬间卸载的硬切。
    // opacity 不会创建 fixed 包含块，是这里唯一安全的整块动画属性。
    root.style.opacity = '0'
    timeline.add(root, { opacity: [0, 1], duration: 180, ease: 'outQuad' }, 0)

    const kicker = root.querySelector<HTMLElement>('.kk-head-kicker')
    const source = document.querySelector<HTMLElement>(`.kk-nav-item[data-route-id="${routeId}"]`)
      ?? document.querySelector<HTMLElement>(`.ac-tab[data-route-id="${routeId}"]`)
    if (!kicker || !source) return

    const fromBox = source.getBoundingClientRect()
    const toBox = kicker.getBoundingClientRect()
    if (
      fromBox.width === 0 ||
      fromBox.bottom <= 0 ||
      fromBox.top >= window.innerHeight ||
      toBox.width === 0
    ) return

    // 起点取导航项的左侧高亮条，终点取 kicker 前那根 22×2 的强调线。
    const from = {
      left: fromBox.left,
      top: fromBox.top + 9,
      width: 2,
      height: Math.max(12, fromBox.height - 18),
    }
    const to = {
      left: toBox.left,
      // RouteHeader 的 build 先于 RouteCut 执行，kicker 此刻已带 10*dir px 的入场位移；
      // 量到的是「移动中的位置」，减掉位移才是落点。
      top: toBox.top - 10 * dir + (toBox.height - 2) / 2,
      width: 22,
      height: 2,
    }

    activeMorphGhost?.remove()
    const ghost = document.createElement('div')
    ghost.className = 'morph-bar'
    ghost.style.left = `${from.left}px`
    ghost.style.top = `${from.top}px`
    ghost.style.width = `${from.width}px`
    ghost.style.height = `${from.height}px`
    document.body.appendChild(ghost)
    activeMorphGhost = ghost

    const dx = to.left - from.left
    const dy = to.top - from.top
    const sx = to.width / from.width
    const sy = to.height / from.height

    timeline
      .add(ghost, {
        x: [0, dx],
        y: [0, dy],
        scaleX: [1, sx],
        scaleY: [1, sy],
        duration: 320,
        ease: 'outQuad',
      }, 0)
      // 落位后淡出，同一时刻 RouteHeader 的 kicker 淡入，完成交接。
      .add(ghost, { opacity: [1, 0], duration: 100, ease: 'linear' }, 320)

    window.setTimeout(() => {
      if (activeMorphGhost === ghost) activeMorphGhost = null
      ghost.remove()
    }, 460)
  })

  return (
    <div ref={ref} className={className} aria-label={label}>
      {mode === 'cut' && (
        <>
          <div className="kk-curtain-b" aria-hidden="true" />
          <div className="kk-curtain" aria-hidden="true" />
          <div className="kk-curtain-idx" aria-hidden="true">{pad(index)}</div>
        </>
      )}
      {children}
    </div>
  )
}

export default RouteCut
