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
    <header className="fixed top-0 z-50 w-full border-b border-border-subtle bg-surface/90 backdrop-blur-xl">
      <nav className="mx-auto flex min-h-14 w-full max-w-[1480px] items-center gap-4 px-4 py-2 md:px-8 xl:px-12">
        <a href="#/home" className="group flex shrink-0 items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-border-subtle bg-primary/8 font-label-mono text-[11px] font-bold text-primary transition-premium group-hover:bg-primary/12">
            K
          </span>
          <span className="font-label-mono text-[10px] uppercase tracking-[0.28em] text-on-surface-variant transition-premium group-hover:text-primary">
            {config?.author || '垣钰'}
          </span>
        </a>

        <span className="h-4 w-px shrink-0 bg-border-subtle" aria-hidden="true" />

        {simple ? (
          <div className="flex-1 min-w-0" />
        ) : (
          <div className="flex min-w-0 flex-1 items-center overflow-x-auto scrollbar-none">
            {routes.map((route) => {
              const isActive = route.id === activeSection
              return (
                <a
                  key={route.id}
                  href={route.href}
                  className={`relative shrink-0 px-3 py-1.5 font-label-mono text-[10px] uppercase tracking-[0.22em] transition-premium ${
                    isActive
                      ? 'text-primary after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:rounded-full after:bg-primary'
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

        <div className="flex shrink-0 items-center gap-1.5 ml-auto">
          <NowPlayingBadge tracks={ambientTracks} onClick={onAmbientClick ?? (() => {})} />
          <button
            type="button"
            onClick={onContactClick}
            aria-label="打开联系抽屉"
            title="联系我"
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-border-subtle bg-surface-card text-text-muted transition-premium hover:border-primary/25 hover:bg-primary/6 hover:text-primary btn-interact"
          >
            <Icon name="mail" className="text-sm" />
          </button>
          <ThemeToggle initialTheme={config?.theme ?? 'light'} />
        </div>
      </nav>
    </header>
  )
}

export default Header
