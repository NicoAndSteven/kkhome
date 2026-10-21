import { type ReactNode } from 'react'
import { useStaggerIn } from '@core/motion'

interface Props {
  /** 编排键：路由变化即重放 */
  routeId: string
  children: ReactNode
}

/**
 * 路由内容区容器。
 *
 * 除了统一左右留白，还承担一件**所有路由都需要**的动效：内容区块的错峰入场。
 * 放在这里而不是逐条路由各写一遍，是因为"内容区怎么进场"本来就是这个壳的职责 ——
 * 交给插件自己实现，结果必然是 7 条路由 5 种节奏，还有 2 条忘了写。
 *
 * 三个刻意的取舍：
 *
 * 1. **只动 `opacity`，不动位移。** `transform` / `translate` 会让元素成为
 *    `position: fixed` 后代的包含块，而 party-games 的房间全屏层、stock-watch 的
 *    导入弹窗、gallery 的灯箱都渲染在插件根节点**内部**。给根节点加位移，
 *    这些本该铺满视口的层会退化成"铺满根节点"并跟着内容滚走。
 *    `opacity` 只创建层叠上下文，不影响包含块，所以是这里唯一安全的选择。
 *    位移留给各插件在确认过结构的位置自己加。
 *
 * 2. **目标是插件根节点的子级**（`:scope > * > *`），不是根节点本身。
 *    大多数插件的根只是一个 `<section>` 包着全部内容，动它等于整块淡入，
 *    和没做一样；动它的子级才看得到"一块一块落位"。
 *
 * 3. **不在这里写 `.m-rise` 绑定。** 位移的 CSS 绑定（`translate`）会带来上面
 *    第 1 条的风险，必须逐处确认后再加，不能由容器统一授予。
 */
const RouteBody = ({ routeId, children }: Props) => {
  const ref = useStaggerIn<HTMLDivElement>({
    selector: ':scope > * > *',
    trigger: routeId,
    duration: 240,
    stagger: 24,
    maxTotal: 320,
    from: 0,
  })

  return (
    <div ref={ref} className="kk-body">
      {children}
    </div>
  )
}

export default RouteBody
