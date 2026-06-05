import { SiteConfig } from '@core/types'

interface Props {
  config?: SiteConfig
}

const Footer = ({ config }: Props) => {
  const currentYear = new Date().getFullYear()

  const links = [
    { label: '首页', href: '#/home' },
    { label: '导向', href: '#/ai-tools' },
    { label: '投喂', href: '#/inbox' },
    { label: '邮箱', href: 'mailto:1215240348@qq.com' },
  ]

  const getLinkProps = (href: string) => (
    href.startsWith('#') || href.startsWith('mailto:')
      ? {}
      : { target: '_blank', rel: 'noopener noreferrer' }
  )

  return (
    <footer className="w-full border-t border-border-subtle bg-surface/78 py-xl shadow-[0_-16px_48px_-44px_var(--color-panel-shadow)]">
      <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 w-full gap-md">
        <div className="flex flex-col items-center md:items-start gap-xs">
          <span className="font-headline-md text-headline-md text-on-surface font-bold">
            {config?.title || 'Personal Hub'}
          </span>
          <p className="font-body-md text-body-md text-text-muted">
            © {currentYear} {config?.author || 'Personal Hub'}. 静态构建.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-x-md gap-y-sm">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              {...getLinkProps(link.href)}
              className="whitespace-nowrap text-text-muted hover:text-on-surface transition-premium font-label-mono text-label-mono"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-xs text-text-muted font-label-mono text-xs">
          <span className="w-2 h-2 rounded-full bg-primary" />
          Cloudflare Pages ready
        </div>
      </div>
    </footer>
  )
}

export default Footer
