import { SiteConfig } from '@core/types'
import ThemeToggle from './ThemeToggle'

interface Props {
  config?: SiteConfig
  activeSection?: string
  onContactClick?: () => void
}

const Header = ({ config, activeSection = 'top', onContactClick }: Props) => {
  const navLinks = [
    { id: 'top', label: '首页', href: '#top' },
    { id: 'projects', label: '项目', href: '#projects' },
    { id: 'tools', label: '工具', href: '#tools' },
    { id: 'navigation', label: '导航', href: '#navigation' },
    { id: 'social', label: '联系', href: '#social' },
  ]

  return (
    <header className="fixed top-0 w-full z-50 h-16 border-b border-white/10 bg-background/82 backdrop-blur-xl">
      <nav className="flex justify-between items-center h-full px-6 md:px-12 w-full">
        <a href="#top" className="font-headline-md text-2xl font-bold text-on-surface">
          {config?.author || '垣钰'}
        </a>

        <div className="hidden md:flex items-center gap-md">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`rounded-lg px-3 py-2 font-body-md text-sm transition-premium ${
                activeSection === link.id
                  ? 'bg-white/8 text-on-surface'
                  : 'text-text-muted hover:bg-white/5 hover:text-on-surface'
              }`}
            >
              {link.label}
            </a>
          ))}
          <button
            type="button"
            onClick={onContactClick}
            aria-label="打开联系抽屉"
            className="rounded-lg border border-white/10 px-3 py-2 font-body-md text-sm text-text-muted transition-premium hover:border-primary/50 hover:text-on-surface"
          >
            联系我
          </button>
        </div>

        <div className="flex items-center gap-md">
          <ThemeToggle initialTheme={config?.theme ?? 'dark'} />
        </div>
      </nav>
    </header>
  )
}

export default Header
