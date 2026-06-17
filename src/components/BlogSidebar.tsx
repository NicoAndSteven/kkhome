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
  inbox: 'mail',
  launch: 'play_arrow',
  workbench: 'terminal',
  collections: 'bookmark',
  scratchpad: 'data_object',
}

const primaryRoutes = ['ai-tools', 'wish-wall', 'stock-watch', 'food', 'local-music']
const secondaryRoutes = ['inbox', 'launch', 'workbench', 'collections', 'scratchpad']

const BlogSidebar = ({ routes, activeRoute, footerSlot }: Props) => {
  const topRoutes = routes.filter((r) => primaryRoutes.includes(r.id))
  const bottomRoutes = routes.filter((r) => secondaryRoutes.includes(r.id))

  return (
    <aside className="blog-sidebar scrollbar-quiet">
      <div className="blog-sidebar-brand">
        <div className="blog-sidebar-logo">
          <Icon name="fingerprint" className="text-xl text-primary" />
        </div>
        <div className="min-w-0">
          <div className="font-label-mono text-[10px] uppercase tracking-[0.32em] text-primary">
            Spatial index
          </div>
          <div className="mt-1 font-headline-md text-[clamp(1.6rem,2.6vw,2.7rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-on-surface">
            KKHOME
          </div>
          <div className="mt-2 max-w-[180px] font-body-md text-[11px] leading-relaxed text-on-surface-variant">
            拼装界面 / 导视索引 / 互动档案
          </div>
        </div>
      </div>

      <nav className="blog-sidebar-nav" aria-label="博客导航">
        <div className="px-3 pb-3">
          <div className="stack-board rounded-[20px] border border-border-subtle bg-[linear-gradient(135deg,rgba(255,255,255,0.84),rgba(238,242,255,0.8),rgba(255,233,238,0.74))] px-4 py-4 shadow-[0_18px_44px_-34px_var(--color-panel-shadow)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-label-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">Index</div>
                <div className="mt-1 text-sm font-semibold text-on-surface">路线拼板</div>
              </div>
              <span className="font-label-mono text-[10px] uppercase tracking-[0.24em] text-primary">
                {topRoutes.length.toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {topRoutes.map((route) => {
            const isActive = route.id === activeRoute
            return (
              <a
                key={route.id}
                href={route.href}
                className={`blog-sidebar-link ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="font-label-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
                  {(topRoutes.findIndex((item) => item.id === route.id) + 1).toString().padStart(2, '0')}
                </span>
                <span className="grid h-10 w-10 place-items-center rounded-[14px] border border-current/15 bg-white/74 shadow-[0_12px_28px_-24px_var(--color-panel-shadow)]">
                  <Icon name={routeIcons[route.id] ?? 'link'} className="text-lg" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-headline-md text-base font-semibold tracking-[-0.04em]">
                    {route.label}
                  </span>
                  <span className="block font-label-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
                    object
                  </span>
                </span>
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
                    <span className="font-label-mono text-xs uppercase tracking-[0.2em]">{route.label}</span>
                  </a>
                )
              })}
            </div>
          </>
        )}
      </nav>

      {footerSlot ? (
        <div className="mt-5 px-3">
          {footerSlot}
        </div>
      ) : null}
    </aside>
  )
}

export default BlogSidebar
