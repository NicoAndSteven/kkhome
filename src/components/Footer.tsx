import { SiteConfig } from '@core/types'

interface Props {
  config?: SiteConfig
}

const Footer = ({ config }: Props) => {
  const currentYear = new Date().getFullYear()

  const links = [
    { label: '首页', href: '#/home' },
    { label: '导向', href: '#/ai-tools' },
    { label: '许愿', href: '#/wish-wall' },
    { label: '邮箱', href: 'mailto:1215240348@qq.com' },
  ]

  const getLinkProps = (href: string) => (
    href.startsWith('#') || href.startsWith('mailto:')
      ? {}
      : { target: '_blank', rel: 'noopener noreferrer' }
  )

  return (
    <footer className="w-full border-t border-border-subtle bg-surface/92 py-8 shadow-[0_-16px_48px_-44px_var(--color-panel-shadow)] backdrop-blur-xl">
      <div className="flex w-full flex-col items-center justify-between gap-4 px-6 md:flex-row md:px-12">
        <div className="flex flex-col items-center gap-1 md:items-start">
          <span className="font-headline-md text-lg font-bold text-on-surface">
            {config?.title || 'Personal Hub'}
          </span>
          <p className="font-body-md text-sm text-text-muted">
            © {currentYear} {config?.author || 'Personal Hub'}. 静态构建.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              {...getLinkProps(link.href)}
              className="whitespace-nowrap font-label-mono text-xs text-text-muted transition-premium hover:text-on-surface"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 font-label-mono text-xs text-text-muted">
          <span className="w-2 h-2 rounded-full bg-primary" />
          Cloudflare Pages ready
        </div>
      </div>
    </footer>
  )
}

export default Footer
