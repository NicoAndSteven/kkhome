import { HubRouteId } from '@core/routeBridge'

interface RouteItem {
  id: HubRouteId
  label: string
  href: string
}

interface Props {
  routes: RouteItem[]
  activeIndex: number  // activeRoute 在 routes 中的下标（0-based）
  onContactClick?: () => void
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Action-Cut 超薄序号轨：片场监视器刻度，hover/当前路由浮出标签刀片 */
const BlogSidebar = ({ routes, activeIndex, onContactClick }: Props) => {
  return (
    <aside className="ac-rail" aria-label="主导航">
      <div className="ac-rail-brand">KK<span className="ac-rail-brand-rec">REC</span></div>

      <nav className="ac-rail-nav">
        {routes.map((route, i) => {
          const active = i === activeIndex
          return (
            <a
              key={route.id}
              href={route.href}
              className={`ac-rail-num${active ? ' ac-active' : ''}`}
              aria-label={route.label}
              aria-current={active ? 'page' : undefined}
              title={`${pad(i + 1)} · ${route.label}`}
            >
              {pad(i + 1)}
              <span className="ac-rail-blade" aria-hidden="true">{pad(i + 1)} · {route.label}</span>
            </a>
          )
        })}
      </nav>

      <div className="ac-rail-foot">
        {onContactClick && (
          <button type="button" className="ac-rail-tool" onClick={onContactClick} aria-label="联系我" title="联系我">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H9l-4 3v-3H6a3 3 0 0 1-3-3V6z" /></svg>
          </button>
        )}
      </div>
    </aside>
  )
}

export default BlogSidebar