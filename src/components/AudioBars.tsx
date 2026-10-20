import { useEffect, useRef } from 'react'
import { useLevelBars } from '@core/motion'

interface Props {
  /** 柱子数量。 */
  count?: number
  /** 最高柱子的高度（px）。 */
  max?: number
  /** 最矮柱子的高度（px）—— 留一点底，不然静音时像没渲染出来。 */
  min?: number
  /** 外层容器类名（控制排列、间距、对齐）。 */
  className?: string
  /** 单根柱子的类名（控制宽度、颜色、圆角）。 */
  barClassName?: string
  /** 读取频谱的函数。返回一组 0–1 的值，长度不足时补 0。 */
  read: (count: number) => number[]
  /** 是否在播放。为 false 时不跑 rAF 循环。 */
  active: boolean
}

/**
 * 真实频谱条。
 *
 * 与它替换掉的东西的区别：原来那几根柱子是 `animation: mini-bar … infinite alternate`
 * —— 固定节奏上下摆，跟实际在响什么**毫无关系**。这个组件每帧读一次
 * `AnalyserNode` 的频谱数据，所以柱子的高度是声音本身。
 *
 * 柱子的高度由 `useLevelBars`（内部是 anime.js 的 `createAnimatable`）驱动：
 * 每次 `push` 带一个短过渡，柱子会"追"目标值而不是硬跳，所以没有频闪感。
 * 这也正是 CSS 做不到的部分 —— CSS 只能表达离散状态，没有"按比例"这回事。
 */
const AudioBars = ({
  count = 3,
  max = 18,
  min = 4,
  className = '',
  barClassName = '',
  read,
  active,
}: Props) => {
  const bars = useLevelBars({ count, min, max, smoothing: 110 })
  // 把最新的 read 放进 ref：rAF 循环不该因为父组件重渲染而重启
  const readRef = useRef(read)
  readRef.current = read

  useEffect(() => {
    if (!active || bars.reduced) {
      // 不播放 / 用户要求减少动态效果：把柱子收到底部静止状态
      bars.push(new Array(count).fill(0))
      return
    }
    let raf = 0
    const tick = () => {
      bars.push(readRef.current(count))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, bars, count])

  return (
    <div ref={bars.ref} className={className} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <i
          key={i}
          data-level-bar
          className={barClassName}
          style={{ height: min, display: 'block' }}
        />
      ))}
    </div>
  )
}

export default AudioBars
