/**
 * 动效层的地基：anime.js 原语转发、reduced-motion 判断、绘制前落初始态。
 *
 * 为什么整层要收口成目录（而不是各组件直接 import animejs）：
 *
 * 1. `prefers-reduced-motion` 只能有一处判断。散到各组件就是一份"手写清单"，
 *    漏一处不会报错，只会静默地对不该动的用户动。这里集中判断，可被验证。
 * 2. 组件卸载必须能停掉动画。JS 驱动的动画不会随 React 卸载自动消失，
 *    留下野动画会让"点了没反应"这类问题极难查。scope 统一 revert。
 * 3. 将来换/升级动效引擎只改这个目录。
 *
 * 这条约定由 eslint 的 `no-restricted-imports` 强制（见 eslint.config.mjs）——
 * 是护栏，不是文档。只有 `src/core/motion/**` 允许直接 import animejs。
 */
import { animate, createTimeline, scrambleText, stagger, utils } from 'animejs'
import { useEffect, useLayoutEffect, useState } from 'react'

/**
 * 所有动画的初始态都用 `useLayoutEffect` 落下去，而不是 `useEffect`。
 *
 * 差别是实打实可见的：`useEffect` 在浏览器**绘制之后**才跑，于是元素会先以
 * CSS 默认态（通常是完全可见）渲染一帧，再被 JS 设成 opacity 0 开始动画 ——
 * 表现为"闪一下再动"。`useLayoutEffect` 在 DOM 变更后、绘制前同步执行，
 * 第一帧就已经是初始态，没有闪。
 *
 * 这里不能用"把 opacity: 0 写进 CSS"来规避：那样 JS 一旦没跑，
 * 内容就永久不可见。宁可让 JS 在绘制前落初始态，也不要让 CSS 承担这个状态。
 */
export const usePrePaintEffect = useLayoutEffect

/**
 * 把 anime.js 的原语从这里转发出去。
 * 组件应该 `import { stagger } from '@core/motion'`，
 * 而不是 `from 'animejs'` —— 后者会被 eslint 拦下（见 eslint.config.mjs）。
 *
 * `scrambleText` 是个**属性值生成器**，不是独立动画函数：它只能当
 * `animate(el, { textContent: scrambleText({...}) })` 用。写成
 * `animate(el, { text: scrambleText(...) })` 会静默无效（实测，不报错）。
 */
export { animate, createTimeline, scrambleText, stagger, utils }

/** 同步读一次系统偏好。SSR / 老浏览器下保守返回 false（不动 = 不打扰）。 */
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** 订阅系统偏好变化：用户在系统设置里改了要立刻生效，不能等刷新。 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  return reduced
}

/**
 * 同步把初始态写进内联样式。
 *
 * 存在的唯一理由：anime.js 的 from 值要等引擎首次 tick 才落地，在那之前元素
 * 以 CSS 默认态渲染 —— 会先完整显示一帧再跳成 0。实测证据：路由切镜的首帧
 * k/t/n 全是 1.000，下一帧才变成 0.094 开始爬升，肉眼就是"闪一下"。
 *
 * `translate` 传的是 CSS 长度字符串（如 `'0px -16px'`）。用它而不是 `y`/`x`，
 * 是因为 anime.js 的 `x`/`y`/`translateX` 全都写进 **`transform`**（实测：
 * `animate(el,{translateX:60})` 的结果是 `transform: matrix(1,0,0,1,60,0)`，
 * 而 `translate` 仍是 `none`），会覆盖元素自带的 transform ——
 * 比如 `.vh-figure` 那 3° 的倾斜会被永久抹掉。
 */
export function primeState(
  targets: HTMLElement[],
  rise: number,
  opacity = 0,
  translate?: string,
): void {
  for (const el of targets) {
    el.style.opacity = String(opacity)
    el.style.setProperty('--m-rise', String(rise))
    if (translate !== undefined) el.style.translate = translate
  }
}

/**
 * 等**新树画完第一帧**之后再执行。
 *
 * 实测依据：切到 ai-tools（740 个节点）时，卸载旧路由 + 挂载新路由 + 布局 +
 * 首次绘制会占住主线程约 84ms。如果动画在这个窗口里就开始跑，anime.js 会把
 * 这段阻塞算进播放进度 —— 逐帧采样到切镜幕布的第一帧已经是 `scaleX 0.85`
 * （15% 已经擦掉了）。也就是说用户**根本没看到"幕布盖上来"那一下**，
 * 只看到它已经走了一半。同一路由上内容区首块的首帧是 `opacity 0.19`，
 * 同一个 84ms。
 *
 * 推迟到第二帧再 play，动画就全程跑在空闲的主线程上，起点也一定被画出来。
 * 用**两层** rAF 而不是一层：第一层在本次绘制之前触发，第二层才在第一次
 * 绘制完成之后 —— 只等一层的话，动画仍会和这次绘制抢同一帧。
 *
 * 返回取消函数，供 effect 清理（组件可能在两帧之内就被卸载）。
 */
export function afterFirstPaint(run: () => void): () => void {
  let second = 0
  const first = requestAnimationFrame(() => {
    second = requestAnimationFrame(run)
  })
  return () => {
    cancelAnimationFrame(first)
    if (second) cancelAnimationFrame(second)
  }
}

/** 清掉 primeState 留下的内联态（reduced-motion 生效时要还原）。 */
export function clearPrimedState(targets: HTMLElement[]): void {
  for (const el of targets) {
    el.style.opacity = ''
    el.style.removeProperty('--m-rise')
    el.style.removeProperty('translate')
  }
}
