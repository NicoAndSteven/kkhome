import { useState } from 'react'
import { NavigationItem, PluginRuntimeConfig } from '@core/types'

interface Props {
  config?: PluginRuntimeConfig
}

const NavigationPlugin = ({ config }: Props) => {
  const [searchTerm, setSearchTerm] = useState('')
  const items = (Array.isArray(config?.items) ? config.items : []) as NavigationItem[]

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categories = [...new Set(items.map(item => item.category).filter((cat): cat is string => Boolean(cat)))]

  const groupedItems = categories.reduce((acc, category) => {
    acc[category] = filteredItems.filter(item => item.category === category)
    return acc
  }, {} as Record<string, NavigationItem[]>)

  const getLinkProps = (url: string) => (
    url.startsWith('#') || url.startsWith('mailto:')
      ? {}
      : { target: '_blank', rel: 'noopener noreferrer' }
  )

  if (items.length === 0) {
    return (
      <div className="glass rounded-lg p-lg">
        <p className="font-body-md text-body-md text-text-muted">未配置导航链接</p>
      </div>
    )
  }

  return (
    <section id="navigation" className="space-y-lg scroll-mt-24">
      <div className="rounded-lg border border-white/10 bg-surface-card/74 p-md md:p-lg">
        <div className="grid gap-md md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <span className="font-label-mono text-xs uppercase text-secondary">Curated links</span>
            <h2 className="mt-xs font-headline-md text-headline-md text-on-surface">探索我的世界</h2>
            <p className="mt-xs font-body-md text-body-md text-text-muted">直达我的想法、项目和工具集</p>
          </div>
          <div className="relative md:col-span-5">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">search</span>
            <input
              type="text"
              placeholder="搜索资源..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-background/50 py-3 pl-10 pr-4 font-body-md text-body-md outline-none transition-premium focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
            />
          </div>
        </div>
      </div>

      {categories.length > 0 ? (
        <div className="space-y-lg">
          {categories.map(category => (
            <div key={category}>
              <h4 className="mb-md font-label-mono text-label-mono uppercase text-text-muted">
                {category}
              </h4>
              <div className="grid grid-cols-1 gap-sm md:grid-cols-2">
                {groupedItems[category]?.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    {...getLinkProps(item.url)}
                    className="group grid gap-sm rounded-lg border border-white/10 bg-surface-card/70 p-md transition-premium hover:border-primary/30 hover:bg-surface-container/72"
                  >
                    <div className="flex items-start justify-between gap-md">
                      <div className="flex items-start gap-sm">
                        <span className="material-symbols-outlined rounded-lg border border-white/10 bg-background/45 p-2 text-primary">
                          {item.icon || 'link'}
                        </span>
                        <div>
                          <h3 className="font-body-lg font-bold text-on-surface">{item.title}</h3>
                          {item.description && (
                            <p className="mt-xs font-body-md text-body-md text-text-muted">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-primary opacity-50 transition-premium group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100">
                        arrow_outward
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-sm md:grid-cols-2">
          {filteredItems.map((item) => (
            <a
              key={item.id}
              href={item.url}
              {...getLinkProps(item.url)}
              className="group rounded-lg border border-white/10 bg-surface-card/70 p-md transition-premium hover:border-primary/30"
            >
              <div className="mb-sm flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">{item.icon || 'link'}</span>
                <h3 className="font-body-lg font-bold text-on-surface">{item.title}</h3>
              </div>
              {item.description && (
                <p className="font-body-md text-body-md text-text-muted">
                  {item.description}
                </p>
              )}
            </a>
          ))}
        </div>
      )}
    </section>
  )
}

export default NavigationPlugin
