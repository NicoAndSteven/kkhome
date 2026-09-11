import { ReactNode } from 'react'
import { SiteConfig } from '@core/types'
import { HubRouteId } from '@core/routeBridge'
import ThemeToggle from './ThemeToggle'

interface RouteItem {
  id: HubRouteId
  label: string
  href: string
}

interface Props {
  routes: RouteItem[]
  activeRoute: string
  footerSlot?: ReactNode
  config?: SiteConfig
  onContactClick?: () => void
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Action-Cut 导航轨：替代旧玻璃侧边栏 + 顶栏 */
const BlogSidebar = ({ routes, activeRoute, footerSlot, config, onContactClick }: Props) => {
  return (
    <aside className="ac-rail">
      <div className="ac-rail-brand">
        <span className="ac-rail-brand-mark">KK</span>
        <span className="ac-rail-brand-text">HOMECAM<span className="ac-rail-brand-sub">.REC</span></span>
      </div>

      <nav className="ac-rail-nav" aria-label="主导航">
        {routes.map((route, i) => {
          const isActive = route.id === activeRoute
          return (
            <a
              key={route.id}
              href={route.href}
              className={`ac-rail-link${isActive ? ' ac-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="ac-rail-idx">{pad(i + 1)}</span>
              <span className="ac-rail-label">{route.label}</span>
              <span className="ac-rail-cue" aria-hidden="true" />
            </a>
          )
        })}
      </nav>

      <div className="ac-rail-foot">
        {footerSlot ? <div className="ac-rail-player">{footerSlot}</div> : null}
        <div className="ac-rail-tools">
          {onContactClick && (
            <button type="button" className="ac-rail-tool" onClick={onContactClick} aria-label="打开联系抽屉" title="联系我">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H9l-4 3v-3H6a3 3 0 0 1-3-3V6z" /></svg>
              <span>联系</span>
            </button>
          )}
          <ThemeToggle initialTheme={config?.theme ?? 'dark'} />
        </div>
      </div>
    </aside>
  )
}

export default BlogSidebar
