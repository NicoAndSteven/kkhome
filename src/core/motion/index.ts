/**
 * 动效层 —— anime.js 在本项目的**唯一入口**。
 *
 * 组件永远 `import { ... } from '@core/motion'`，不要直接 `from 'animejs'`。
 * 这条约定由 eslint 的 `no-restricted-imports` 强制（见 eslint.config.mjs）——
 * 是护栏，不是文档。
 *
 * 目录划分：
 *   base.ts      原语转发、reduced-motion 判断、绘制前落初始态
 *   scope.ts     anime.js scope 的 React 包装（卸载自动 revert）
 *   stagger.ts   错峰入场（含滚动触发）
 *   layout.ts    列表重排 FLIP
 *   presence.ts  弹层进出场（补退场）
 *   levels.ts    连续量 → 一组元素的尺寸（频谱等）
 *   text.ts      逐字揭示、数字滚动
 *   spin.ts      转盘甩动（拖拽跟手 + 弹簧落位）
 *   indicator.ts 导航指示条（弹簧落位）
 */

export {
  animate,
  createTimeline,
  scrambleText,
  stagger,
  utils,
  prefersReducedMotion,
  useReducedMotion,
  usePrePaintEffect,
} from './base'

export { useMotionScope } from './scope'
export type { MotionContext } from './scope'

export { useStaggerIn, useScrollStagger } from './stagger'
export type { StaggerInOptions, ScrollStaggerOptions } from './stagger'

export { useFlipLayout } from './layout'
export type { FlipLayoutOptions } from './layout'

export { useOverlayTransition, exitThenRemove } from './presence'
export type { OverlayTransitionOptions, OverlayTransition } from './presence'

export { useLevelBars } from './levels'
export type { LevelBarsOptions, LevelBars } from './levels'

export { useTextReveal, useCountUp } from './text'
export type { TextRevealOptions, CountUpOptions } from './text'

export { useFlickSpin } from './spin'
export type { FlickSpinOptions, FlickSpin } from './spin'

export { useSpringIndicator } from './indicator'
export type { SpringIndicatorOptions, SpringIndicator } from './indicator'
