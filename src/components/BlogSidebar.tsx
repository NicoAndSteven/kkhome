import { ReactNode } from 'react'
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
  footerSlot?: ReactNode
}

const routeIcons: Record<string, string> = {
  'local-music': 'library_music',
  'ai-tools': 'travel_explore',
  'wish-wall': 'rate_review',
  'stock-watch': 'bar_chart',
  food: 'bolt',
  'party-games': 'sports_score',
  inbox: 'mail',
  launch: 'play_arrow',
  workbench: 'terminal',
  collections: 'bookmark',
  scratchpad: 'data_object',
}

const primaryRoutes = ['ai-tools', 'wish-wall', 'stock-watch', 'food', 'party-games', 'local-music']
const secondaryRoutes = ['inbox', 'launch', 'workbench', 'collections', 'scratchpad']

const BlogSidebar = ({ routes, activeRoute, footerSlot }: Props) => {
  const topRoutes = routes.filter((r) => primaryRoutes.includes(r.id))
  const bottomRoutes = routes.filter((r) => secondaryRoutes.includes(r.id))

  return (
    <aside className="blog-sidebar">
      <div className="blog-sidebar-brand">
        <div className="min-w-0 flex-1">
          <div className="font-label-mono text-[9px] uppercase tracking-[0.36em] text-primary/60">
            Navigation
          </div>
          <div className="mt-1 font-headline-md text-[clamp(1.3rem,2vw,2rem)] font-bold leading-[0.92] tracking-[-0.05em] text-on-surface">
            KKHOME
          </div>
          <div className="mt-2 h-[2px] w-6 rounded-full bg-gradient-to-r from-primary to-secondary" />
        </div>
      </div>

      <nav className="blog-sidebar-nav" aria-label="主导航">
        <div className="space-y-1">
          {topRoutes.map((route, i) => {
            const isActive = route.id === activeRoute
            return (
              <a
                key={route.id}
                href={route.href}
                className={`blog-sidebar-link ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="w-6 shrink-0 font-label-mono text-[9px] tabular-nums text-text-muted">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl border transition-premium ${isActive ? 'border-primary/20 bg-primary/8' : 'border-border-subtle bg-surface-card'}`}>
                  <Icon name={routeIcons[route.id] ?? 'link'} className="text-[15px]" />
                </span>
                <span className="min-w-0 flex-1 font-label-mono text-[10px] uppercase tracking-[0.2em]">
                  {route.label}
                </span>
              </a>
            )
          })}
        </div>

        {bottomRoutes.length > 0 && (
          <>
            <div className="blog-sidebar-divider" />
            <div className="space-y-0.5">
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
                    <span className="font-label-mono text-[10px] uppercase tracking-[0.2em]">{route.label}</span>
                  </a>
                )
              })}
            </div>
          </>
        )}
      </nav>

      {footerSlot ? (
        <div className="mt-auto pt-4 px-2">
          {footerSlot}
        </div>
      ) : null}
    </aside>
  )
}

export default BlogSidebar
