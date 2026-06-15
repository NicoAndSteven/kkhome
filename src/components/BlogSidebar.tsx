import Icon from './Icon'
import { HubRouteId } from '@core/routeBridge'

interface RouteItem {
  id: HubRouteId
  label: string
  href: string
}

interface Props {
  routes: RouteItem[]
  activeRoute: string
}

const routeIcons: Record<string, string> = {
  'ai-tools': 'travel_explore',
  'wish-wall': 'rate_review',
  'cloudflare-lab': 'cloud',
  news: 'article',
  'stock-watch': 'bar_chart',
  food: 'bolt',
  'ambient-music': 'mic',
  gallery: 'auto_awesome',
  inbox: 'mail',
  launch: 'play_arrow',
  workbench: 'terminal',
  collections: 'bookmark',
  scratchpad: 'data_object',
}

const primaryRoutes = ['ai-tools', 'wish-wall', 'cloudflare-lab', 'news', 'stock-watch', 'food', 'ambient-music', 'gallery']
const secondaryRoutes = ['inbox', 'launch', 'workbench', 'collections', 'scratchpad']

const BlogSidebar = ({ routes, activeRoute }: Props) => {
  const topRoutes = routes.filter((r) => primaryRoutes.includes(r.id))
  const bottomRoutes = routes.filter((r) => secondaryRoutes.includes(r.id))

  return (
    <aside className="blog-sidebar">
      {/* Brand */}
      <div className="blog-sidebar-brand">
        <div className="blog-sidebar-logo">
          <Icon name="fingerprint" className="text-xl text-primary" />
        </div>
        <div>
          <div className="font-bold text-on-surface" style={{ fontSize: 20, lineHeight: 1.1 }}>
            KKHOME
          </div>
          <div className="font-label-mono text-[10px] uppercase text-text-muted tracking-wider mt-0.5">
            Personal Hub
          </div>
        </div>
      </div>

      {/* Primary Nav */}
      <nav className="blog-sidebar-nav" aria-label="博客导航">
        <div className="space-y-1">
          {topRoutes.map((route) => {
            const isActive = route.id === activeRoute
            return (
              <a
                key={route.id}
                href={route.href}
                className={`blog-sidebar-link ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon name={routeIcons[route.id] ?? 'link'} className="text-lg" />
                <span className="font-label-mono text-xs uppercase tracking-wider">{route.label}</span>
              </a>
            )
          })}
        </div>

        {bottomRoutes.length > 0 && (
          <>
            <div className="blog-sidebar-divider" />
            <div className="space-y-1">
              {bottomRoutes.map((route) => {
                const isActive = route.id === activeRoute
                return (
                  <a
                    key={route.id}
                    href={route.href}
                    className={`blog-sidebar-link ${isActive ? 'active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon name={routeIcons[route.id] ?? 'link'} className="text-lg" />
                    <span className="font-label-mono text-xs uppercase tracking-wider">{route.label}</span>
                  </a>
                )
              })}
            </div>
          </>
        )}
      </nav>
    </aside>
  )
}

export default BlogSidebar
