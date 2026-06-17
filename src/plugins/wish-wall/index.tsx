import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Icon } from '@components'
import { PluginRuntimeConfig } from '@core/types'

interface Props {
  config?: PluginRuntimeConfig
}

type WishCategory = 'feature' | 'tool' | 'content' | 'design' | 'other'
type WishStatus = 'new' | 'accepted' | 'building' | 'shipped'

interface Wish {
  id: string
  title: string
  detail?: string
  category: WishCategory
  author?: string
  status: WishStatus
  createdAt: string
}

const storageKey = 'kkhome:wish-wall'
const submitCooldownKey = 'kkhome:wish-wall:last-submit'

const categoryLabels: Record<WishCategory, string> = {
  feature: '功能',
  tool: '工具',
  content: '内容',
  design: '体验',
  other: '其他',
}

const statusLabels: Record<WishStatus, string> = {
  new: '新愿望',
  accepted: '已采纳',
  building: '开发中',
  shipped: '已上线',
}

const statusOrder: WishStatus[] = ['new', 'accepted', 'building', 'shipped']

const statusMeta: Record<WishStatus, {
  action: string
  icon: string
  badgeClass: string
  activeClass: string
}> = {
  new: {
    action: '待整理',
    icon: 'rate_review',
    badgeClass: 'border-border-subtle bg-surface-container text-text-muted',
    activeClass: 'border-text-muted/40 bg-surface-container text-on-surface',
  },
  accepted: {
    action: '进入计划',
    icon: 'task_alt',
    badgeClass: 'border-primary/20 bg-primary/10 text-primary',
    activeClass: 'border-primary/30 bg-primary/12 text-primary',
  },
  building: {
    action: '正在实现',
    icon: 'terminal',
    badgeClass: 'border-primary/30 bg-primary/10 text-primary',
    activeClass: 'border-primary/45 bg-primary/15 text-primary',
  },
  shipped: {
    action: '可以使用',
    icon: 'check',
    badgeClass: 'border-tertiary/30 bg-tertiary/10 text-tertiary',
    activeClass: 'border-tertiary/45 bg-tertiary/15 text-tertiary',
  },
}

const seedWishes: Wish[] = [
  {
    id: 'seed-tool-finder',
    title: '希望导向页能按目标自动推荐工具',
    detail: '输入文件转换、图片压缩这类目标后，直接出现可用网站。',
    category: 'tool',
    status: 'building',
    createdAt: '2026-06-05T00:00:00.000Z',
  },
  {
    id: 'seed-public-roadmap',
    title: '希望能看到功能上线状态',
    detail: '愿望被采纳后，可以看到开发中或已上线。',
    category: 'feature',
    status: 'accepted',
    createdAt: '2026-06-05T00:00:00.000Z',
  },
]

const toWish = (value: unknown): Wish | null => {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  if (typeof record.id !== 'string' || typeof record.title !== 'string') return null

  return {
    id: record.id,
    title: record.title,
    detail: typeof record.detail === 'string' ? record.detail : undefined,
    category: ['feature', 'tool', 'content', 'design', 'other'].includes(String(record.category))
      ? record.category as WishCategory
      : 'other',
    author: typeof record.author === 'string' ? record.author : undefined,
    status: ['new', 'accepted', 'building', 'shipped'].includes(String(record.status))
      ? record.status as WishStatus
      : 'new',
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : new Date().toISOString(),
  }
}

const readLocalWishes = () => {
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return seedWishes
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return seedWishes
    const wishes = parsed.map(toWish).filter(Boolean) as Wish[]
    return wishes.length > 0 ? wishes : seedWishes
  } catch {
    return seedWishes
  }
}

const writeLocalWishes = (wishes: Wish[]) => {
  window.localStorage.setItem(storageKey, JSON.stringify(wishes))
}

const readWishListPayload = (payload: unknown) => {
  const record = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
  const data = record.data && typeof record.data === 'object' ? record.data as Record<string, unknown> : {}
  const value = Array.isArray(record.wishes) ? record.wishes : data.wishes
  return Array.isArray(value) ? value : []
}

const readWishPayload = (payload: unknown) => {
  const record = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
  const data = record.data && typeof record.data === 'object' ? record.data as Record<string, unknown> : {}
  return record.wish ?? data.wish
}

const formatTime = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '刚刚'
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const WishWallPlugin = ({ config }: Props) => {
  const configuredSeed = useMemo(
    () => (Array.isArray(config?.seedWishes) ? config.seedWishes.map(toWish).filter(Boolean) as Wish[] : seedWishes),
    [config?.seedWishes],
  )
  const [wishes, setWishes] = useState<Wish[]>(configuredSeed)
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [author, setAuthor] = useState('')
  const [website, setWebsite] = useState('')
  const [category, setCategory] = useState<WishCategory>('feature')
  const [statusFilter, setStatusFilter] = useState<WishStatus | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadWishes = async () => {
      try {
        const response = await fetch('/api/wishes')
        if (!response.ok) throw new Error('API unavailable')
        const payload = await response.json() as unknown
        const remoteWishes = readWishListPayload(payload).map(toWish).filter(Boolean) as Wish[]
        if (!cancelled) {
          setWishes(remoteWishes.length > 0 ? remoteWishes : configuredSeed)
          setMessage('')
        }
      } catch {
        if (!cancelled) {
          setWishes(readLocalWishes())
          setMessage('当前使用本地草稿模式')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadWishes()
    return () => {
      cancelled = true
    }
  }, [configuredSeed])

  const filteredWishes = wishes
    .filter((wish) => statusFilter === 'all' || wish.status === statusFilter)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))

  const statusCounts = useMemo(() => {
    const counts: Record<WishStatus, number> = {
      new: 0,
      accepted: 0,
      building: 0,
      shipped: 0,
    }
    wishes.forEach((wish) => {
      counts[wish.status] += 1
    })
    return counts
  }, [wishes])

  const submitWish = async (event: FormEvent) => {
    event.preventDefault()
    const normalizedTitle = title.trim()
    const normalizedDetail = detail.trim()
    const normalizedAuthor = author.trim()

    if (normalizedTitle.length < 4 || normalizedTitle.length > 60) {
      setMessage('愿望标题需要 4-60 个字')
      return
    }

    if (normalizedDetail.length > 300) {
      setMessage('说明最多 300 个字')
      return
    }

    const lastSubmit = Number(window.localStorage.getItem(submitCooldownKey) ?? 0)
    if (Date.now() - lastSubmit < 30_000) {
      setMessage('刚刚已经提交过，稍后再试')
      return
    }

    const nextWish: Wish = {
      id: globalThis.crypto?.randomUUID?.() ?? `wish-${Date.now()}`,
      title: normalizedTitle,
      detail: normalizedDetail || undefined,
      author: normalizedAuthor || undefined,
      category,
      status: 'new',
      createdAt: new Date().toISOString(),
    }

    try {
      const response = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...nextWish, website }),
      })
      if (response.status === 429) {
        setMessage('提交太频繁，稍后再试')
        return
      }
      if (!response.ok) throw new Error('API unavailable')
      const payload = await response.json() as unknown
      const remoteWish = toWish(readWishPayload(payload)) ?? nextWish
      setWishes((current) => [remoteWish, ...current.filter((wish) => wish.id !== remoteWish.id)])
      setMessage('愿望已写入墙面')
    } catch {
      const localWishes = [nextWish, ...wishes]
      setWishes(localWishes)
      writeLocalWishes(localWishes)
      setMessage('已保存到本地草稿')
    }

    window.localStorage.setItem(submitCooldownKey, String(Date.now()))
    setTitle('')
    setDetail('')
    setAuthor('')
    setWebsite('')
    setCategory('feature')
  }

  return (
    <section id="wish-wall" className="space-y-5 scroll-mt-24">
      <div className="stack-board surface-panel-strong rounded-[28px] p-5 md:p-6">
        <div className="grid gap-6 md:grid-cols-12 md:items-start">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <span className="font-label-mono text-[10px] uppercase tracking-[0.34em] text-primary">Section 02</span>
              <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(17,72,255,0.6),rgba(224,20,52,0.55),transparent)]" />
            </div>
            <h2 className="mt-3 font-headline-md text-[clamp(2.4rem,4.8vw,4.6rem)] font-semibold leading-[0.92] tracking-[-0.08em] text-on-surface">访客许愿墙</h2>
            <p className="mt-3 font-body-md text-sm leading-relaxed text-on-surface-variant">
              留下你期待上线的功能、工具或体验。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(['all', 'new', 'accepted', 'building', 'shipped'] as Array<WishStatus | 'all'>).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full border px-3 py-1.5 font-label-mono text-[10px] uppercase tracking-[0.16em] transition-premium ${
                    statusFilter === status
                      ? 'border-primary/45 bg-primary/10 text-primary'
                      : 'border-border-subtle text-text-muted hover:border-primary/35 hover:text-on-surface'
                  }`}
                >
                  <span>{status === 'all' ? '全部' : statusLabels[status]}</span>
                  <span className="ml-1 opacity-70">
                    {status === 'all' ? wishes.length : statusCounts[status]}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-2 border-t border-border-subtle pt-4 sm:grid-cols-4">
              {statusOrder.map((status) => (
                <div
                  key={status}
                  className={`group flex items-center gap-2 rounded-2xl border px-3 py-3 transition-premium ${statusMeta[status].activeClass}`}
                >
                  <span className="grid size-8 place-items-center rounded-full border border-current/25 bg-current/10">
                    <Icon name={statusMeta[status].icon} className="text-sm" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-body-md text-xs font-semibold">{statusLabels[status]}</span>
                    <span className="block font-label-mono text-[10px] uppercase opacity-65">{statusMeta[status].action}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={submitWish} className="grid gap-3 md:col-span-7">
            <label className="grid gap-xs">
              <span className="font-label-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">愿望</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={60}
                placeholder="例如：希望导向页支持收藏常用工具"
                className="surface-control rounded-2xl px-4 py-3 font-body-md text-body-md text-on-surface outline-none transition-premium focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
              />
            </label>

            <label className="grid gap-xs">
              <span className="font-label-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">说明</span>
              <textarea
                value={detail}
                onChange={(event) => setDetail(event.target.value)}
                maxLength={300}
                placeholder="补充使用场景或你希望它解决的问题"
                className="surface-control min-h-20 resize-none rounded-2xl px-4 py-3 font-body-md text-body-md text-on-surface outline-none transition-premium focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
              />
            </label>

            <div className="grid gap-sm md:grid-cols-[1fr_auto] md:items-end">
              <label className="hidden" aria-hidden="true">
                <span>Website</span>
                <input
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>

              <label className="grid gap-xs">
                <span className="font-label-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">称呼</span>
                <input
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                  maxLength={24}
                  placeholder="可匿名"
                  className="surface-control rounded-2xl px-4 py-3 font-body-md text-body-md text-on-surface outline-none transition-premium focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="shimmer-btn inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-primary px-6 font-body-md text-body-md font-semibold text-[#07130e] transition-premium hover:shadow-[0_16px_48px_-28px_rgba(110,231,183,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon name="add" className="text-lg" />
                许愿
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(Object.keys(categoryLabels) as WishCategory[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`rounded-full border px-3 py-1.5 font-body-md text-xs transition-premium ${
                    category === item
                      ? 'border-primary/30 bg-primary/10 text-primary'
                      : 'border-border-subtle text-text-muted hover:border-primary/35 hover:text-on-surface'
                  }`}
                >
                  {categoryLabels[item]}
                </button>
              ))}
            </div>

            {message && (
              <span className="font-body-md text-sm text-text-muted">{message}</span>
            )}
          </form>
        </div>
      </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredWishes.map((wish) => (
          <article key={wish.id} className="surface-item group grid gap-3 rounded-[18px] p-5 transition-premium hover:border-primary/35 hover:bg-white/5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="font-label-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                  {categoryLabels[wish.category]}
                </span>
                <h3 className="mt-xs font-body-lg font-bold text-on-surface">{wish.title}</h3>
              </div>
              <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 font-label-mono text-[10px] uppercase ${statusMeta[wish.status].badgeClass}`}>
                <Icon name={statusMeta[wish.status].icon} className="text-xs" />
                {statusLabels[wish.status]}
              </span>
            </div>
            {wish.detail && (
              <p className="font-body-md text-body-md text-text-muted">{wish.detail}</p>
            )}
            <div className="grid grid-cols-4 gap-1" aria-label={`当前状态：${statusLabels[wish.status]}`}>
              {statusOrder.map((status) => {
                const active = statusOrder.indexOf(status) <= statusOrder.indexOf(wish.status)
                return (
                  <span
                    key={status}
                    className={`h-1 rounded-full transition-premium ${
                      active ? 'bg-primary/70 shadow-[0_0_16px_rgba(138,221,236,0.35)]' : 'bg-border-subtle'
                    }`}
                    title={statusLabels[status]}
                  />
                )
              })}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-3 font-label-mono text-[10px] uppercase text-text-muted">
              <span>{wish.author || '匿名访客'}</span>
              <span>{formatTime(wish.createdAt)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default WishWallPlugin
