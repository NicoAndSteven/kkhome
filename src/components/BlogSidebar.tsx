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
  home: 'fingerprint',
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

const BlogSidebar = ({ routes, activeRoute }: Props) => {
  const topRoutes = routes.filter((r) =>
    ['home', 'ai-tools', 'wish-wall', 'cloudflare-lab', 'news', 'stock-watch', 'food', 'ambient-music', 'gallery'].includes(r.id)
  )
  const bottomRoutes = routes.filter((r) => !topRoutes.includes(r))

  return (
    <aside className="blog-sidebar">
      <nav aria-label="博客导航">
        <div className="space-y-px">
          {topRoutes.map((route) => {
            const isActive = route.id === activeRoute
            return (
              <a
                key={route.id}
                href={route.href}
                className={`blog-sidebar-link ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon name={routeIcons[route.id] ?? 'link'} className="text-sm" />
                <span>{route.label}</span>
              </a>
            )
          })}
        </div>

        {bottomRoutes.length > 0 && (
          <>
            <div className="blog-sidebar-divider" />
            <div className="space-y-px">
              {bottomRoutes.map((route) => {
                const isActive = route.id === activeRoute
                return (
                  <a
                    key={route.id}
                    href={route.href}
                    className={`blog-sidebar-link ${isActive ? 'active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon name={routeIcons[route.id] ?? 'link'} className="text-sm" />
                    <span>{route.label}</span>
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
