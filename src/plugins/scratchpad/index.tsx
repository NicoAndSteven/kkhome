import { useEffect, useMemo, useState } from 'react'
import { PluginRuntimeConfig, ScratchpadItem } from '@core/types'
import { consumeQueuedScratchpadItem } from '@core/routeBridge'
import { Icon } from '@components'

interface Props {
  config?: PluginRuntimeConfig
}

const inferType = (content: string): ScratchpadItem['type'] => {
  const trimmed = content.trim()

  if (/^https?:\/\//i.test(trimmed)) return 'link'
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json'
  if (trimmed.startsWith('#') || trimmed.includes('```')) return 'markdown'
  if (/^(npm|pnpm|yarn|git|docker)\s/.test(trimmed)) return 'code'
  if (trimmed.toLowerCase().includes('prompt')) return 'prompt'

  return 'text'
}

const createScratchItem = (content: string): ScratchpadItem => {
  const now = new Date().toISOString()
  const firstLine = content.trim().split('\n')[0]?.slice(0, 48)

  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: inferType(content),
    content,
    title: firstLine || '临时内容',
    createdAt: now,
    updatedAt: now,
  }
}

const loadScratchItems = (storageKey: string): ScratchpadItem[] => {
  try {
    const raw = globalThis.localStorage?.getItem(storageKey)
    if (!raw) return []

    const parsed = JSON.parse(raw) as ScratchpadItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const ScratchpadPlugin = ({ config }: Props) => {
  const storageKey = typeof config?.storageKey === 'string' ? config.storageKey : 'kkhome:scratchpad'
  const [draft, setDraft] = useState('')
  const [items, setItems] = useState<ScratchpadItem[]>(() => loadScratchItems(storageKey))
  const [query, setQuery] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items))
    } catch {
      // localStorage may be unavailable in private contexts.
    }
  }, [items, storageKey])

  useEffect(() => {
    const handleAddScratchpad = (event: globalThis.Event) => {
      const content = (event as globalThis.CustomEvent<string>).detail?.trim()
      if (!content) return

      setItems((current) => [createScratchItem(content), ...current])
    }

    window.addEventListener('hub:add-scratchpad', handleAddScratchpad)
    return () => window.removeEventListener('hub:add-scratchpad', handleAddScratchpad)
  }, [])

  useEffect(() => {
    const content = consumeQueuedScratchpadItem()?.trim()
    if (!content) return

    setItems((current) => [createScratchItem(content), ...current])
  }, [])

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return items

    return items.filter((item) => (
      [item.title, item.content, item.type, ...(item.tags ?? [])]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    ))
  }, [items, query])

  const addItem = () => {
    const content = draft.trim()
    if (!content) return
    setItems((current) => [createScratchItem(content), ...current])
    setDraft('')
  }

  const copyItem = (item: ScratchpadItem) => {
    void navigator.clipboard?.writeText(item.content)
  }

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }

  const clearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }

    setItems([])
    setConfirmClear(false)
  }

  return (
    <section id="scratchpad" className="space-y-lg scroll-mt-24">
      <div className="grid gap-md md:grid-cols-12">
        <div className="md:col-span-5">
          <span className="font-label-mono text-xs uppercase text-secondary">Scratchpad</span>
          <h2 className="mt-xs font-headline-md text-headline-md text-on-surface">临时收纳</h2>
          <p className="mt-xs font-body-md text-body-md text-text-muted">
            只保存在当前浏览器，用于暂存链接、文本、Prompt 和命令。
          </p>
        </div>
        <div className="surface-panel rounded-[2px] p-md md:col-span-7">
          <label htmlFor="scratchpad-input" className="font-label-mono text-xs uppercase text-text-muted">
            粘贴临时内容
          </label>
          <textarea
            id="scratchpad-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="URL、JSON、Markdown、Prompt、命令或任意文本..."
            className="surface-control mt-sm min-h-36 w-full resize-y rounded-[2px] p-sm font-body-md text-body-md text-on-surface outline-none transition-premium focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
          />
          <div className="mt-sm flex flex-wrap gap-xs">
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-xs rounded-[2px] bg-primary px-sm py-2 font-body-md text-sm font-semibold text-on-primary transition-premium hover:opacity-90"
            >
              <Icon name="add" className="text-base" />
              收纳
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={items.length === 0}
              className="rounded-[2px] border border-border-subtle px-sm py-2 font-body-md text-sm text-text-muted transition-premium hover:border-error/50 hover:text-error disabled:cursor-not-allowed disabled:opacity-40"
            >
              {confirmClear ? '确认清空' : '清空全部'}
            </button>
          </div>
        </div>
      </div>

      <div className="surface-panel rounded-[2px] p-md">
        <div className="relative">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-text-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索临时内容..."
            aria-label="搜索临时内容"
            className="surface-control w-full rounded-[2px] py-3 pl-10 pr-4 font-body-md text-body-md text-on-surface outline-none transition-premium focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
          />
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid gap-sm md:grid-cols-2">
          {filteredItems.map((item) => (
            <article key={item.id} className="surface-item rounded-[2px] p-md">
              <div className="flex items-start justify-between gap-sm">
                <div>
                  <span className="font-label-mono text-xs uppercase text-secondary">{item.type}</span>
                  <h3 className="mt-xs font-body-lg font-bold text-on-surface">{item.title}</h3>
                </div>
                <div className="flex gap-xs">
                  <button
                    type="button"
                    onClick={() => copyItem(item)}
                    aria-label="复制临时内容"
                    className="rounded-[2px] border border-border-subtle p-2 text-text-muted transition-premium hover:border-primary/40 hover:text-primary"
                  >
                    <Icon name="content_copy" className="text-base" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label="删除临时内容"
                    className="rounded-[2px] border border-border-subtle p-2 text-text-muted transition-premium hover:border-error/50 hover:text-error"
                  >
                    <Icon name="delete" className="text-base" />
                  </button>
                </div>
              </div>
              <p className="mt-sm line-clamp-3 whitespace-pre-wrap break-words font-body-md text-sm text-text-muted">
                {item.content}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="surface-item rounded-[2px] p-md">
          <p className="font-body-md text-body-md text-text-muted">暂无临时内容</p>
        </div>
      )}
    </section>
  )
}

export default ScratchpadPlugin
