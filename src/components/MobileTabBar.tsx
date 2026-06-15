import { useState } from 'react'
import Icon from './Icon'
import { HubRouteId } from '@core/routeBridge'

interface RouteItem {
  id: string
  label: string
  href: string
}

interface Props {
  routes: RouteItem[]
  activeRoute: string
}

const PRIMARY_ORDER = ['ai-tools', 'wish-wall', 'cloudflare-lab', 'news', 'stock-watch'] as const

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

const MobileTabBar = ({ routes, activeRoute }: Props) => {
  const [showSheet, setShowSheet] = useState(false)
  const primaryRoutes = routes.filter(r => PRIMARY_ORDER.includes(r.id as any)).slice(0, 5)
  const overflowRoutes = routes.filter(r => !PRIMARY_ORDER.includes(r.id as any))

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-14 bg-surface border-t border-border-subtle flex items-center justify-around px-1 pb-1 safe-area-bottom">
        {primaryRoutes.map((route) => {
          const isActive = route.id === activeRoute
          return (
            <a
              key={route.id}
              href={route.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-0 px-2 py-1.5 rounded-lg transition-colors relative ${
                isActive ? 'text-primary' : 'text-text-muted hover:text-on-surface'
              }`}
            >
              <Icon name={routeIcons[route.id] ?? 'link'} className="text-xl" />
              <span className="font-label-mono text-[9px] uppercase tracking-wider">{route.label}</span>
              {isActive && <span className="absolute -top-0.5 w-5 h-0.5 rounded-full bg-primary" />}
            </a>
          )
        })}

        {overflowRoutes.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSheet(!showSheet)}
            className="flex flex-col items-center justify-center gap-0.5 min-w-0 px-2 py-1.5 rounded-lg text-text-muted hover:text-on-surface transition-colors"
          >
            <Icon name="more_horiz" className="text-xl" />
            <span className="font-label-mono text-[9px] uppercase tracking-wider">更多</span>
          </button>
        )}
      </nav>

      {/* Overflow bottom sheet */}
      {showSheet && (
        <>
          <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm" onClick={() => setShowSheet(false)} />
          <div className="fixed bottom-14 left-0 right-0 z-50 bg-surface rounded-t-2xl border-t border-border-subtle p-5 shadow-xl animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <span className="font-label-mono text-xs uppercase text-text-muted">全部功能</span>
              <button type="button" onClick={() => setShowSheet(false)} className="text-text-muted hover:text-on-surface">
                <Icon name="close" className="text-lg" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {overflowRoutes.map((route) => {
                const isActive = route.id === activeRoute
                return (
                  <a
                    key={route.id}
                    href={route.href}
                    onClick={() => setShowSheet(false)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface-container'
                    }`}
                  >
                    <Icon name={routeIcons[route.id] ?? 'link'} className="text-2xl" />
                    <span className="font-label-mono text-[9px] uppercase text-center">{route.label}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default MobileTabBar
