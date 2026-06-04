import { useEffect, useMemo, useRef, useState } from 'react'
import { HubItem, PluginRuntimeConfig, ResourceItem, SearchTarget, SnippetItem, UtilityItem } from '@core/types'

interface Props {
  config?: PluginRuntimeConfig
}

const isEnabled = (item: { enabled?: boolean }) => item.enabled !== false

const toSearchText = (item: HubItem) => (
  [
    item.title,
    item.description,
    item.category,
    ...(item.tags ?? []),
    ...(item.aliases ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
)

const QuickLaunchPlugin = ({ config }: Props) => {
  const [query, setQuery] = useState('')
  const inputRef = useRef<globalThis.HTMLInputElement>(null)
  const resources = useMemo(
    () => (Array.isArray(config?.resources) ? config.resources : []) as ResourceItem[],
    [config?.resources],
  )
  const utilities = useMemo(
    () => (Array.isArray(config?.utilities) ? config.utilities : []) as UtilityItem[],
    [config?.utilities],
  )
  const snippets = useMemo(
    () => (Array.isArray(config?.snippets) ? config.snippets : []) as SnippetItem[],
    [config?.snippets],
  )
  const searchTargets = useMemo(
    () => (Array.isArray(config?.searchTargets) ? config.searchTargets : []) as SearchTarget[],
    [config?.searchTargets],
  )

  const allItems = useMemo(
    () => [...resources, ...utilities, ...snippets].filter(isEnabled),
    [resources, utilities, snippets],
  )

  const matches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const rankedItems = allItems
      .filter((item) => !normalizedQuery || toSearchText(item).includes(normalizedQuery))
      .sort((a, b) => Number(b.favorite) - Number(a.favorite))

    return rankedItems.slice(0, 8)
  }, [allItems, query])

  useEffect(() => {
    const handleShortcut = (event: globalThis.KeyboardEvent) => {
      const target = event.target as globalThis.HTMLElement | null
      const editing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA'

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
      }

      if (!editing && event.key === '/') {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  const openItem = async (item: HubItem) => {
    if (item.type === 'link') {
      const resource = item as ResourceItem
      const target = resource.openIn === 'same-tab' || resource.url.startsWith('#') || resource.url.startsWith('mailto:')
        ? '_self'
        : '_blank'
      window.open(resource.url, target, target === '_blank' ? 'noopener,noreferrer' : undefined)
      return
    }

    if (item.type === 'tool') {
      const utility = item as UtilityItem
      if (utility.utilityType) {
        window.dispatchEvent(new globalThis.CustomEvent('hub:select-tool', { detail: utility.utilityType }))
      }
      window.location.hash = '#workbench'
      return
    }

    if (item.type === 'prompt' || item.type === 'snippet') {
      await navigator.clipboard?.writeText((item as SnippetItem).content)
    }
  }

  const runSearch = (target: SearchTarget) => {
    const encodedQuery = encodeURIComponent(query.trim())
    if (!encodedQuery) return
    window.open(target.urlTemplate.replace('{query}', encodedQuery), '_blank', 'noopener,noreferrer')
  }

  if (allItems.length === 0 && searchTargets.length === 0) {
    return (
      <section id="launch" className="rounded-lg border border-white/10 bg-surface-card/74 p-lg scroll-mt-24">
        <p className="font-body-md text-body-md text-text-muted">未配置快捷启动资源</p>
      </section>
    )
  }

  return (
    <section id="launch" className="space-y-md scroll-mt-24" aria-label="万能跳转">
      <div className="rounded-lg border border-white/10 bg-surface-card/78 p-md md:p-lg">
        <div className="grid gap-md md:grid-cols-12 md:items-end">
          <div className="md:col-span-5">
            <span className="font-label-mono text-xs uppercase text-secondary">Quick launch</span>
            <h2 className="mt-xs font-headline-md text-headline-md text-on-surface">万能跳转</h2>
            <p className="mt-xs font-body-md text-body-md text-text-muted">
              搜索链接、工具、Prompt 和片段，快速打开或复制。
            </p>
          </div>
          <div className="relative md:col-span-7">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">search</span>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索资源，或按 Ctrl/K 聚焦..."
              aria-label="搜索快捷资源"
              className="w-full rounded-lg border border-white/10 bg-background/50 py-4 pl-10 pr-4 font-body-md text-body-md text-on-surface outline-none transition-premium focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
            />
          </div>
        </div>

        {query.trim() && searchTargets.length > 0 && (
          <div className="mt-md flex flex-wrap gap-xs" aria-label="搜索目标">
            {searchTargets.map((target) => (
              <button
                key={target.id}
                type="button"
                onClick={() => runSearch(target)}
                className="inline-flex items-center gap-xs rounded-lg border border-white/10 px-sm py-2 font-body-md text-sm text-text-muted transition-premium hover:border-primary/40 hover:text-primary"
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true">{target.icon ?? 'travel_explore'}</span>
                {target.title}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-sm md:grid-cols-2">
        {matches.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => void openItem(item)}
            className="group grid gap-sm rounded-lg border border-white/10 bg-surface-card/70 p-md text-left transition-premium hover:border-primary/30 hover:bg-surface-container/72"
          >
            <div className="flex items-start justify-between gap-md">
              <div className="flex items-start gap-sm">
                <span className="material-symbols-outlined rounded-lg border border-white/10 bg-background/45 p-2 text-primary" aria-hidden="true">
                  {item.icon ?? (item.type === 'tool' ? 'construction' : item.type === 'link' ? 'link' : 'content_copy')}
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
              <span className="rounded border border-secondary/20 bg-secondary/10 px-2 py-1 font-label-mono text-[10px] uppercase text-secondary">
                {item.type}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

export default QuickLaunchPlugin
