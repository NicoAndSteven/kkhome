import { PluginRuntimeConfig, SocialLink } from '@core/types'

interface Props {
  config?: PluginRuntimeConfig
}

const SocialPlugin = ({ config }: Props) => {
  const links = (Array.isArray(config?.items) ? config.items : []) as SocialLink[]

  // 平台对应的 Material Symbols 图标
  const getPlatformIcon = (icon: string): string => {
    const iconMap: Record<string, string> = {
      github: 'public',
      twitter: 'alternate_email',
      linkedin: 'person',
      email: 'mail',
      blog: 'article',
      wechat: 'chat',
      weibo: 'campaign',
      zhihu: 'school',
    }
    return iconMap[icon.toLowerCase()] || 'link'
  }

  if (links.length === 0) {
    return null
  }

  return (
    <section id="social" className="text-center scroll-mt-24">
      <div className="flex flex-wrap justify-center gap-lg">
        {links.map((link) => {
          const iconSymbol = getPlatformIcon(link.icon)

          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-xs"
              title={link.platform}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-white/10 bg-surface-card transition-premium group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:text-primary">
                <span className="material-symbols-outlined text-2xl">
                  {iconSymbol}
                </span>
              </div>
              <span className="font-label-mono text-xs text-text-muted group-hover:text-primary transition-all duration-400">
                {link.platform}
              </span>
            </a>
          )
        })}
      </div>
    </section>
  )
}

export default SocialPlugin
