import { SiteConfig } from '@core/types'

interface Props {
  config?: SiteConfig
}

const Footer = ({ config }: Props) => {
  const currentYear = new Date().getFullYear()

  const links = [
    { label: '首页', href: '#top' },
    { label: '案例', href: '#projects' },
    { label: '启动', href: '#launch' },
    { label: '收藏', href: '#collections' },
    { label: '邮箱', href: 'mailto:1215240348@qq.com' },
  ]

  const getLinkProps = (href: string) => (
    href.startsWith('#') || href.startsWith('mailto:')
      ? {}
      : { target: '_blank', rel: 'noopener noreferrer' }
  )

  return (
    <footer className="w-full border-t border-border-subtle bg-surface/72 py-xl">
      <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 w-full gap-md">
        <div className="flex flex-col items-center md:items-start gap-xs">
          <span className="font-headline-md text-headline-md text-on-surface font-bold">
            {config?.title || '个人主页'}
          </span>
          <p className="font-body-md text-body-md text-text-muted">
            © {currentYear} {config?.author || 'Personal Hub'}. 静态构建.
          </p>
        </div>

        <div className="flex gap-lg">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              {...getLinkProps(link.href)}
              className="text-text-muted hover:text-on-surface transition-premium font-label-mono text-label-mono"
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
