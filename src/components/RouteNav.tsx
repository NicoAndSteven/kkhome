import { HubRouteId } from '@core/routeBridge'
import { usePrePaintEffect, useSpringIndicator, useStaggerIn } from '@core/motion'
import AccentSwitcher from './AccentSwitcher'

interface RouteItem {
  id: HubRouteId
  label: string
  href: string
}

interface Props {
  routes: RouteItem[]
  /** activeRoute 在 routes 中的下标（0-based） */
  activeIndex: number
  onContactClick?: () => void
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * 路由导航轨。
 *
 * 取代原来的「超薄序号轨」：那里序号是唯一可见信息，标签只在 hover 时以
 * 浮出的刀片形式出现 —— 也就是**不 hover 就不知道 03 是什么**。
 * 这一版序号与标签常驻，序号轨从"刻度"变成"目录"。
 *
 * 两处动效由 anime.js 负责，各有各的理由：
 *
 * 1. **当前项指示条**（`useSpringIndicator`）。CSS transition 是匀速补间，
 *    跨项连点时会看到它慢悠悠滑过中间每一项；弹簧是冲过去再回弹。
 * 2. **首次挂载的错峰入场**（`useStaggerIn`）。条数是运行时数据，
 *    `animation-delay` 的静态公式一改就失效，而且入场只在首帧发生一次，
 *    交给 JS 才能保证"元素还没出现时就已经是初始态"。
 */
const RouteNav = ({ routes, activeIndex, onContactClick }: Props) => {
  const staggerRef = useStaggerIn<HTMLElement>({
    selector: '.kk-nav-item',
    duration: 460,
    stagger: 40,
    maxTotal: 620,
    from: 16,
  })

  const { ref: pipRef, listRef, moveTo } = useSpringIndicator({ itemSelector: '.kk-nav-item' })

  // 在绘制前落位：晚一帧就会看到指示条从列表顶端滑下来。
  usePrePaintEffect(() => {
    moveTo(activeIndex)
  }, [activeIndex, moveTo])

  return (
    <aside ref={staggerRef} className="kk-nav" aria-label="主导航">
      <div className="kk-nav-brand">
        KK<i aria-hidden="true" />
      </div>

      <nav className="kk-nav-list" ref={listRef}>
        <span className="kk-nav-pip" ref={pipRef} aria-hidden="true" />
        {routes.map((route, i) => {
          const active = i === activeIndex
          return (
            <a
              key={route.id}
              href={route.href}
              className="kk-nav-item m-rise"
              aria-label={route.label}
              aria-current={active ? 'page' : undefined}
              title={route.label}
            >
              <b>{pad(i + 1)}</b>
              <span>{route.label}</span>
            </a>
          )
        })}
      </nav>

      <div className="kk-nav-foot">
        {/* 强调色属于路由域：导航轨就是这套外壳的控制面板 */}
        <AccentSwitcher />
        {onContactClick && (
          <button type="button" className="kk-nav-tool" onClick={onContactClick} aria-label="联系我" title="联系我">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H9l-4 3v-3H6a3 3 0 0 1-3-3V6z" /></svg>
          </button>
        )}
      </div>
    </aside>
  )
}

export default RouteNav
