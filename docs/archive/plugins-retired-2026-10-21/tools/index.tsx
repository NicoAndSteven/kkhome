import { useState } from 'react'
import { PluginRuntimeConfig, ToolItem } from '@core/types'

interface Props {
  config?: PluginRuntimeConfig
}

const ToolsPlugin = ({ config }: Props) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [activeCategory, setActiveCategory] = useState('全部')
  const tools = (Array.isArray(config?.items) ? config.items : []) as ToolItem[]
  const categories = ['全部', ...Array.from(new Set(tools.map((tool) => tool.category)))]
  const filteredTools = activeCategory === '全部'
    ? tools
    : tools.filter((tool) => tool.category === activeCategory)

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const getIconSymbol = (category?: string): string => {
    const iconMap: Record<string, string> = {
      '开发工具': 'terminal',
      '设计工具': 'design_services',
      '效率工具': 'bolt',
      'AI工具': 'psychology',
      '文档工具': 'article',
      '数据分析': 'analytics',
      '云服务': 'cloud',
      '安全工具': 'shield',
      '数据库': 'database',
    }
    return iconMap[category || ''] || 'widgets'
  }

  if (tools.length === 0) {
    return (
      <div className="glass rounded-lg p-lg">
        <p className="text-text-muted text-center font-body-md">未配置工具推荐</p>
      </div>
    )
  }

  return (
    <section id="tools" className="space-y-lg scroll-mt-24">
      <div className="grid gap-md md:grid-cols-12 md:items-end">
        <div>
          <span className="font-label-mono text-xs uppercase text-secondary">Tool matrix</span>
          <h2 className="mt-xs font-headline-md text-headline-md text-on-surface">常用工具栈</h2>
          <p className="mt-xs font-body-md text-body-md text-text-muted">按类别查看真实工作流偏好</p>
        </div>
        <div className="flex flex-wrap gap-xs rounded-lg border border-white/10 bg-surface-card/72 p-xs md:col-span-7 md:justify-end" aria-label="工具分类">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-md px-sm py-2 font-body-md text-sm transition-premium ${
                activeCategory === category
                  ? 'bg-primary/12 text-primary'
                  : 'text-text-muted hover:bg-white/5 hover:text-on-surface'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-4">
        {filteredTools.map((tool) => {
          const isFavorite = favorites.has(tool.id) || tool.favorite
          const iconSymbol = getIconSymbol(tool.category)
          
          return (
            <article
              key={tool.id}
              className="group rounded-lg border border-white/10 bg-surface-card/78 p-md transition-premium hover:border-primary/30 hover:bg-surface-container/80"
            >
              <div className="flex justify-between items-start mb-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-background/45">
                  {tool.icon && (tool.icon.startsWith('http') || tool.icon.startsWith('data:')) ? (
                    <img src={tool.icon} alt={tool.name} className="w-6 h-6 object-contain" />
                  ) : (
                    <span className="material-symbols-outlined text-primary">
                      {iconSymbol}
                    </span>
                  )}
                </div>
                <span className="rounded border border-secondary/20 bg-secondary/10 px-2 py-1 font-label-mono text-[10px] uppercase text-secondary">
                  {tool.favorite ? '重点' : tool.category}
                </span>
              </div>

              <h4 className="font-body-md font-bold mb-xs text-on-surface">{tool.name}</h4>
              
              <p className="min-h-[3rem] font-body-md text-sm leading-6 text-text-muted mb-md">
                {tool.description || tool.category}
              </p>

              <div className="flex justify-between items-center border-t border-border-subtle pt-sm">
                <span className="font-label-mono text-xs text-primary">{tool.category}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleFavorite(tool.id)
                  }}
                  className="material-symbols-outlined text-on-surface-variant hover:text-error transition-all duration-400"
                  style={{ fontVariationSettings: `'FILL' ${isFavorite ? 1 : 0}` }}
                  aria-label="收藏"
                >
                  favorite
                </button>
              </div>

              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-sm inline-flex items-center gap-xs text-primary hover:text-primary/80 transition-colors font-body-md"
              >
                <span className="material-symbols-outlined text-lg">open_in_new</span>
                打开
              </a>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default ToolsPlugin
