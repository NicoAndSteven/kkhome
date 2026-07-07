import { useState } from 'react'
import Icon from './Icon'

interface RouteItem {
  id: string
  label: string
  href: string
}

interface Props {
  routes: RouteItem[]
  activeRoute: string
}

const PRIMARY_ORDER = ['ai-tools', 'wish-wall', 'stock-watch', 'food', 'party-games'] as const

const routeIcons: Record<string, string> = {
  'ai-tools': 'travel_explore',
  'wish-wall': 'rate_review',
  'stock-watch': 'bar_chart',
  food: 'bolt',
  'party-games': 'sports_score',
  'local-music': 'music_note',
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
      <nav className="fixed bottom-3 left-3 right-3 z-50 flex h-16 items-center justify-around rounded-[26px] border border-border-subtle bg-[linear-gradient(135deg,rgba(250,252,249,0.96),rgba(236,242,236,0.92))] px-1 pb-1 safe-area-bottom shadow-[0_28px_60px_-36px_var(--color-panel-shadow)] backdrop-blur-2xl">
        {primaryRoutes.map((route) => {
          const isActive = route.id === activeRoute
          return (
            <a
              key={route.id}
              href={route.href}
              className={`relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 transition-colors ${
                isActive ? 'text-primary' : 'text-text-muted hover:text-on-surface'
              }`}
            >
              <Icon name={routeIcons[route.id] ?? 'link'} className="text-xl" />
              <span className="font-label-mono text-[9px] uppercase tracking-[0.2em]">{route.label}</span>
              {isActive && <span className="absolute -top-0.5 h-0.5 w-5 rounded-full bg-[var(--color-tertiary)] shadow-[0_0_12px_rgba(217,122,99,0.35)]" />}
            </a>
          )
        })}

        {overflowRoutes.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSheet(!showSheet)}
            className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-text-muted transition-colors hover:text-on-surface"
          >
            <Icon name="more_horiz" className="text-xl" />
            <span className="font-label-mono text-[9px] uppercase tracking-[0.2em]">更多</span>
          </button>
        )}
      </nav>

      {showSheet && (
        <>
          <div className="fixed inset-0 z-40 bg-[rgba(91,112,101,0.22)] backdrop-blur-sm" onClick={() => setShowSheet(false)} />
          <div className="fixed bottom-20 left-3 right-3 z-50 rounded-[28px] border border-border-subtle bg-[linear-gradient(180deg,rgba(251,252,250,0.98),rgba(240,246,241,0.98))] p-5 shadow-[0_28px_72px_-38px_var(--color-panel-shadow)] animate-slide-up">
            <div className="mb-4 flex items-center justify-between">
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
                      isActive ? 'bg-[linear-gradient(135deg,rgba(47,98,201,0.12),rgba(217,122,99,0.12))] text-primary' : 'text-text-muted hover:bg-white'
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
