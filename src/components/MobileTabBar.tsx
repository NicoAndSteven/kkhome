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

const PRIMARY_ORDER = ['home', 'ai-tools', 'wish-wall', 'food', 'party-games'] as const

const routeIcons: Record<string, string> = {
  home: 'home',
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

/** Action-Cut 底部导航：深色玻璃 + 切镜高亮 */
const MobileTabBar = ({ routes, activeRoute }: Props) => {
  const [showSheet, setShowSheet] = useState(false)
  const primaryRoutes = routes.filter(r => PRIMARY_ORDER.includes(r.id as any)).slice(0, 5)
  const overflowRoutes = routes.filter(r => !PRIMARY_ORDER.includes(r.id as any))

  return (
    <>
      <nav className="ac-tabbar safe-area-bottom" aria-label="主导航">
        {primaryRoutes.map((route) => {
          const isActive = route.id === activeRoute
          return (
            <a
              key={route.id}
              href={route.href}
              className={`ac-tab${isActive ? ' ac-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon name={routeIcons[route.id] ?? 'link'} className="text-lg" />
              <span className="ac-tab-label">{route.label}</span>
              <span className="ac-tab-cue" aria-hidden="true" />
            </a>
          )
        })}

        {overflowRoutes.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSheet(!showSheet)}
            className={`ac-tab${showSheet ? ' ac-active' : ''}`}
          >
            <Icon name="more_horiz" className="text-lg" />
            <span className="ac-tab-label">更多</span>
          </button>
        )}
      </nav>

      {showSheet && (
        <>
          <div className="ac-sheet-mask" onClick={() => setShowSheet(false)} />
          <div className="ac-sheet" role="dialog" aria-label="全部功能">
            <div className="ac-sheet-head">
              <span className="ac-kicker">ALL MODULES</span>
              <button type="button" onClick={() => setShowSheet(false)} className="ac-sheet-close" aria-label="关闭">
                <Icon name="close" className="text-lg" />
              </button>
            </div>
            <div className="ac-sheet-grid">
              {overflowRoutes.map((route) => {
                const isActive = route.id === activeRoute
                return (
                  <a
                    key={route.id}
                    href={route.href}
                    onClick={() => setShowSheet(false)}
                    className={`ac-sheet-item${isActive ? ' ac-active' : ''}`}
                  >
                    <Icon name={routeIcons[route.id] ?? 'link'} className="text-xl" />
                    <span>{route.label}</span>
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
