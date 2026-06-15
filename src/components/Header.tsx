import { SiteConfig } from '@core/types'
import { TrackState } from '@plugins/ambient-music/AudioEngine'
import NowPlayingBadge from '@plugins/ambient-music/NowPlayingBadge'
import Icon from './Icon'
import ThemeToggle from './ThemeToggle'

interface Props {
  config?: SiteConfig
  activeSection?: string
  routes?: Array<{ id: string; label: string; href: string }>
  ambientTracks?: TrackState[]
  onContactClick?: () => void
  onAmbientClick?: () => void
  simple?: boolean
}

const Header = ({ config, activeSection = 'home', routes = [], ambientTracks = [], onContactClick, onAmbientClick, simple = false }: Props) => {
  return (
    <header className="fixed top-0 w-full z-50 h-14 border-b border-border-subtle bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-full w-full max-w-[1480px] items-center gap-md px-4 md:px-8 xl:px-12">
        <a href="#/home" className="group flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-primary/30 bg-primary/8 text-primary font-label-mono text-xs transition-premium group-hover:border-primary/60 group-hover:bg-primary/15">
            K
          </span>
          <span className="font-headline-md text-lg font-bold text-on-surface">
            {config?.author || '垣钰'}
          </span>
        </a>

        {simple ? (
          <div className="flex-1 min-w-0" />
        ) : (
          <div className="flex-1 min-w-0 flex items-center gap-xs overflow-x-auto scrollbar-none">
            {routes.map((route) => {
              const isActive = route.id === activeSection
              return (
                <a
                  key={route.id}
                  href={route.href}
                  className={`nav-tab shrink-0 px-sm py-1 font-body-md text-sm transition-premium ${
                    isActive
                      ? 'nav-tab-active text-primary'
                      : 'text-text-muted hover:text-on-surface'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {route.label}
                </a>
              )
            })}
          </div>
        )}

        <div className="flex items-center gap-xs shrink-0">
          <NowPlayingBadge tracks={ambientTracks} onClick={onAmbientClick ?? (() => {})} />
          <button
            type="button"
            onClick={onContactClick}
            aria-label="打开联系抽屉"
            title="联系我"
            className="inline-flex items-center justify-center w-8 h-8 rounded-[2px] text-text-muted transition-premium hover:text-primary hover:bg-primary/8 btn-interact"
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
