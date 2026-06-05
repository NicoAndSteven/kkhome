import { SiteConfig } from '@core/types'
import Icon from './Icon'
import ThemeToggle from './ThemeToggle'

interface Props {
  config?: SiteConfig
  activeSection?: string
  routes?: Array<{ id: string; label: string; href: string }>
  onContactClick?: () => void
}

const fallbackRoutes = [
    { id: 'home', label: '首页', href: '#/home' },
    { id: 'ai-tools', label: '导向', href: '#/ai-tools' },
    { id: 'inbox', label: '投喂', href: '#/inbox' },
]

const Header = ({ config, activeSection = 'home', routes = fallbackRoutes, onContactClick }: Props) => {
  const activeIndex = Math.max(routes.findIndex((route) => route.id === activeSection), 0)
  const activeRoute = routes[activeIndex] ?? routes[0]
  const previousRoute = routes[(activeIndex - 1 + routes.length) % routes.length]
  const nextRoute = routes[(activeIndex + 1) % routes.length]

  return (
    <header className="fixed top-0 w-full z-50 h-16 border-b border-border-subtle bg-background/72 shadow-[0_16px_48px_-44px_var(--color-panel-shadow)] backdrop-blur-xl">
      <nav className="mx-auto flex h-full w-full max-w-[1480px] items-center justify-between px-6 md:px-12 xl:px-16">
        <a href="#/home" className="font-headline-md text-2xl font-bold text-on-surface">
          {config?.author || '垣钰'}
        </a>

        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-xs">
          <a
            href={previousRoute.href}
            aria-label={`切换到${previousRoute.label}`}
            title={previousRoute.label}
            className="route-nav-button"
          >
            <Icon name="chevron_left" className="text-base" />
          </a>
          <a href={activeRoute.href} className="route-nav-current" aria-current="page">
            <span className="font-label-mono text-[10px] uppercase text-secondary">Route</span>
            <span className="font-body-md text-sm font-semibold text-on-surface">{activeRoute.label}</span>
          </a>
          <a
            href={nextRoute.href}
            aria-label={`切换到${nextRoute.label}`}
            title={nextRoute.label}
            className="route-nav-button"
          >
            <Icon name="chevron_right" className="text-base" />
          </a>
        </div>

        <div className="flex items-center gap-sm">
          <button
            type="button"
            onClick={onContactClick}
            aria-label="打开联系抽屉"
            title="联系我"
            className="route-nav-button"
          >
            <Icon name="mail" className="text-base" />
          </button>
          <ThemeToggle initialTheme={config?.theme ?? 'dark'} />
        </div>
      </nav>
    </header>
  )
}

export default Header
