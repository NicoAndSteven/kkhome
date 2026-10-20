import { type ReactNode } from 'react'
import { useMotionScope } from '@core/motion'

export interface RouteCutProps {
  /** 路由 id：作为编排键，变化即重放整条时间线 */
  routeId: string
  /** 1-based 路由序号，印在幕布上 */
  index: number
  /** 前进 / 后退，决定幕布从哪一侧收缩 */
  direction: 'ac-fwd' | 'ac-back'
  className?: string
  /** 供无障碍读屏的路由名 */
  label?: string
  children: ReactNode
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * 路由切镜：两层幕布从行进方向的边缘擦除。
 *
 * 换掉原来那版「容器 opacity 0.3 → 1，260ms」——那是**看不见的转场**：
 * 起点定在 0.3 而不是 0，本来就说明它没打算被察觉。切路由是这套界面里
 * 唯一每次都发生、且每次都被看到的动作，把它做成 260ms 的透明度渐变，
 * 等于把最大的动效预算丢掉了。
 *
 * 为什么这件事交给 JS 而不是 CSS `@keyframes`：
 * 1. **可中断**。切到一半又点了别的路由，`scope.revert()` 干净收尾；
 *    CSS 动画只能靠"重建元素"打断。
 * 2. **方向可参数化**。原来前进/后退各写一套 keyframes，加第三种方向要再抄一遍。
 * 3. **两层错峰**。强调色层与画布层相差 90ms 起步，CSS 得写两条
 *    `animation-delay` 且无法共享缓动参数。
 *
 * 幕布是 `position: fixed`，因此**绝不能有 transform 祖先** ——
 * 祖先一带 transform，fixed 就会改以该祖先为包含块，幕布只会盖住内容首屏。
 * 这也是本组件不动自己那层容器（`.route-view`）的原因。
 */
const RouteCut = ({ routeId, index, direction, className = '', label, children }: RouteCutProps) => {
  const dir = direction === 'ac-fwd' ? 1 : -1

  const { ref } = useMotionScope<HTMLDivElement>(`route-cut:${routeId}`, ({ root, timeline }) => {
    const accents = Array.from(root.querySelectorAll<HTMLElement>('.kk-curtain'))
    const canvases = Array.from(root.querySelectorAll<HTMLElement>('.kk-curtain-b'))
    const indices = Array.from(root.querySelectorAll<HTMLElement>('.kk-curtain-idx'))

    // 原点放在**行进方向的起点边缘**：前进时原点在左 → 幕布向左退 → 内容从右边长出来，
    // 读作"新一帧从右侧进来"；后退反之。
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
      // 单层闪一下只是"闪"，两层错开才有"一帧被抽走"的厚度。
      .add(accents, { scaleX: [1, 0], duration: 560, ease: 'outExpo' }, 0)
      .add(canvases, { scaleX: [1, 0], duration: 560, ease: 'outExpo' }, 90)
      .add(indices, { opacity: [0.9, 0], scale: [1, 1.2], duration: 320, ease: 'outQuad' }, 0)
  })

  return (
    <div ref={ref} className={className} aria-label={label}>
      <div className="kk-curtain-b" aria-hidden="true" />
      <div className="kk-curtain" aria-hidden="true" />
      <div className="kk-curtain-idx" aria-hidden="true">{pad(index)}</div>
      {children}
    </div>
  )
}

export default RouteCut
