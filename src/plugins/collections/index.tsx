import { useMemo, useState } from 'react'
import { PluginRuntimeConfig, ResourceItem, SnippetItem } from '@core/types'
import { Icon } from '@components'

interface Props {
  config?: PluginRuntimeConfig
}

const itemMatches = (query: string, item: ResourceItem | SnippetItem) => {
  const text = [
    item.title,
    item.description,
    item.category,
    ...(item.tags ?? []),
    ...(item.aliases ?? []),
    item.type !== 'link' ? item.content : '',
  ].join(' ').toLowerCase()

  return text.includes(query.toLowerCase())
}

const CollectionsPlugin = ({ config }: Props) => {
  const [activeCategory, setActiveCategory] = useState('全部')
  const [query, setQuery] = useState('')
  const resources = useMemo(
    () => (Array.isArray(config?.resources) ? config.resources : []) as ResourceItem[],
    [config?.resources],
  )
  const snippets = useMemo(
    () => (Array.isArray(config?.snippets) ? config.snippets : []) as SnippetItem[],
    [config?.snippets],
  )
  const items = useMemo(
    () => [...resources, ...snippets].filter((item) => item.enabled !== false),
    [resources, snippets],
  )
  const categories = ['全部', ...Array.from(new Set(items.map((item) => item.category)))]
  const filteredItems = items
    .filter((item) => activeCategory === '全部' || item.category === activeCategory)
    .filter((item) => !query.trim() || itemMatches(query.trim(), item))
    .sort((a, b) => Number(b.favorite) - Number(a.favorite))

  const openOrCopy = (item: ResourceItem | SnippetItem) => {
    if (item.type === 'link') {
      const target = item.openIn === 'same-tab' || item.url.startsWith('#') || item.url.startsWith('mailto:')
        ? '_self'
        : '_blank'
      window.open(item.url, target, target === '_blank' ? 'noopener,noreferrer' : undefined)
      return
    }

    void navigator.clipboard?.writeText(item.content)
  }

  if (items.length === 0) {
    return (
      <section id="collections" className="surface-panel rounded-[2px] p-lg scroll-mt-24">
        <p className="font-body-md text-body-md text-text-muted">未配置收藏资源</p>
      </section>
    )
  }

  return (
    <section id="collections" className="space-y-lg scroll-mt-24">
      <div className="surface-panel rounded-[2px] p-md md:p-lg">
        <div className="grid gap-md md:grid-cols-12 md:items-end">
          <div className="md:col-span-5">
            <span className="font-label-mono text-xs uppercase text-secondary">Collections</span>
            <h2 className="mt-xs font-headline-md text-headline-md text-on-surface">分类收藏</h2>
            <p className="mt-xs font-body-md text-body-md text-text-muted">
              收纳长期入口、Prompt 和命令片段。
            </p>
          </div>
          <div className="relative md:col-span-7">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-text-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索收藏、标签或别名..."
              aria-label="搜索收藏资源"
              className="surface-control w-full rounded-[2px] py-3 pl-10 pr-4 font-body-md text-body-md text-on-surface outline-none transition-premium focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
            />
          </div>
        </div>
        <div className="mt-md flex flex-wrap gap-xs">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-[2px] px-sm py-2 font-body-md text-sm transition-premium ${
                activeCategory === category
                  ? 'bg-primary/12 text-primary'
                  : 'text-text-muted hover:bg-surface-card/70 hover:text-on-surface'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-sm md:grid-cols-2">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openOrCopy(item)}
            className="surface-item group grid gap-sm rounded-[2px] p-md text-left transition-premium hover:border-primary/35 hover:bg-surface-container/80"
          >
            <div className="flex items-start justify-between gap-md">
              <div className="flex items-start gap-sm">
                <span className="rounded-[2px] border border-border-subtle bg-background/55 p-2 text-primary" aria-hidden="true">
                  <Icon name={item.icon ?? (item.type === 'link' ? 'bookmark' : 'content_copy')} className="text-2xl" />
                </span>
                <span>
                  <span className="block font-body-lg font-bold text-on-surface">{item.title}</span>
                  {item.description && (
                    <span className="mt-xs block font-body-md text-body-md text-text-muted">
                      {item.description}
                    </span>
                  )}
                </span>
              </div>
              <span className="rounded border border-border-subtle px-2 py-1 font-label-mono text-[10px] uppercase text-text-muted">
                {item.category}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

export default CollectionsPlugin
