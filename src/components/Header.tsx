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
    <header className="fixed top-0 z-50 w-full border-b border-[rgba(19,27,58,0.08)] bg-[linear-gradient(90deg,rgba(255,255,255,0.92),rgba(239,243,255,0.9),rgba(255,233,238,0.82))] backdrop-blur-2xl">
      <nav className="mx-auto flex min-h-16 w-full max-w-[1480px] items-center gap-3 px-4 py-3 md:px-8 xl:px-12">
        <a href="#/home" className="group flex shrink-0 items-end gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-[14px] border border-[rgba(19,27,58,0.1)] bg-[linear-gradient(135deg,rgba(17,72,255,0.95),rgba(224,20,52,0.88))] text-xs font-label-mono text-white shadow-[0_12px_34px_-24px_var(--color-panel-shadow)] transition-premium group-hover:scale-[1.02]">
            K
          </span>
          <span className="min-w-0">
            <span className="block font-label-mono text-[10px] uppercase tracking-[0.34em] text-primary">Kkhome</span>
            <span className="block font-headline-md text-[clamp(1.4rem,2vw,2rem)] font-semibold leading-none tracking-[-0.06em] text-on-surface">
              {config?.author || '垣钰'}
            </span>
          </span>
        </a>

        {simple ? (
          <div className="flex-1 min-w-0" />
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto scrollbar-none">
            {routes.map((route) => {
              const isActive = route.id === activeSection
              return (
                <a
                  key={route.id}
                  href={route.href}
                  className={`shrink-0 rounded-[999px] border px-3.5 py-1.5 font-label-mono text-[10px] uppercase tracking-[0.22em] transition-premium ${
                    isActive
                      ? 'border-primary/35 bg-[linear-gradient(135deg,rgba(17,72,255,0.14),rgba(224,20,52,0.12))] text-primary shadow-[0_12px_24px_-18px_var(--color-panel-shadow)]'
                      : 'border-border-subtle bg-white/55 text-text-muted hover:border-primary/25 hover:bg-white hover:text-on-surface'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {route.label}
                </a>
              )
            })}
          </div>
        )}

        <div className="flex shrink-0 items-center gap-2">
          <NowPlayingBadge tracks={ambientTracks} onClick={onAmbientClick ?? (() => {})} />
          <button
            type="button"
            onClick={onContactClick}
            aria-label="打开联系抽屉"
            title="联系我"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-white/78 text-text-muted transition-premium hover:border-primary/25 hover:bg-white hover:text-primary btn-interact"
          >
            <Icon name="mail" className="text-base" />
          </button>
          <ThemeToggle initialTheme={config?.theme ?? 'light'} />
        </div>
      </nav>
    </header>
  )
}

export default Header
