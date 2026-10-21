import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '@components'
import { PluginRuntimeConfig } from '@core/types'

interface Props {
  config?: PluginRuntimeConfig
}

/* ─── types ──────────────────────────────────────────── */

interface Headline {
  sourceLabel: string
  headline: string
  subtitle: string
  link: string
  capturedAt: string
}

interface Overview {
  type: string
  headline: string
  summary: string
  capturedAt: string
  period: string
  dateLabel?: string
}

interface CountryResponse {
  country: string
  countryName: string
  headlines: Headline[]
  overviews: {
    current: Overview | null
    previous: Overview | null
    yesterday: Overview | null
  }
  asOfUtc: string
}

/* ─── country catalogue ──────────────────────────────── */

interface CountryMeta {
  id: string
  name: string
  lang: string
}

const COUNTRIES: CountryMeta[] = [
  { id: 'china', name: '中国', lang: 'zh' },
  { id: 'us', name: '美国', lang: 'en' },
  { id: 'japan', name: '日本', lang: 'ja' },
  { id: 'germany', name: '德国', lang: 'de' },
  { id: 'france', name: '法国', lang: 'fr' },
  { id: 'india', name: '印度', lang: 'hi' },
  { id: 'russia', name: '俄罗斯', lang: 'ru' },
  { id: 'turkey', name: '土耳其', lang: 'tr' },
  { id: 'israel', name: '以色列', lang: 'he' },
]

const API_BASE = '/api/news'

/* ─── helpers ─────────────────────────────────────────── */

const relativeTime = (iso: string): string => {
  const ms = Date.now() - new Date(iso).getTime()
  const min = Math.floor(ms / 60000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min}分钟前`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `${hrs}小时前`
  const days = Math.floor(hrs / 24)
  return `${days}天前`
}

/* ─── component ──────────────────────────────────────── */

const NewsPlugin = (_props: Props) => {
  const [country, setCountry] = useState('china')
  const [data, setData] = useState<CountryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchNews = useCallback(async (c: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/${c}`)
      if (!res.ok) throw new Error(`API ${res.status}`)
      const body = (await res.json()) as { ok: boolean; data: CountryResponse }
      if (!body.ok || !body.data) throw new Error('代理返回异常')
      setData(body.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchNews(country)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [country, fetchNews])

  const activeMeta = COUNTRIES.find((c) => c.id === country)

  return (
    <section id="news-feed" className="space-y-5 scroll-mt-24">
      <div className="surface-panel-strong rounded-[28px] p-5 md:p-7">
        <div className="grid gap-5 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <span className="font-label-mono text-[10px] uppercase tracking-[0.22em] text-primary">
              <Icon name="travel_explore" className="mr-1" />
              world brief
            </span>
            <h2 className="mt-2 font-headline-md text-3xl font-semibold tracking-tight text-on-surface">
              {activeMeta?.name ?? '新闻'}
            </h2>
            <p className="mt-2 font-body-md text-sm leading-relaxed text-on-surface-variant">
              {data?.asOfUtc
                ? `更新于 ${relativeTime(data.asOfUtc)}`
                : '实时多源头条快照'}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 md:col-span-5">
            <div className="surface-item rounded-2xl p-4">
              <span className="font-label-mono text-[10px] uppercase text-text-muted">Sources</span>
              <strong className="mt-1 block font-headline-md text-2xl text-on-surface">
                {data?.headlines.length ?? 0}
              </strong>
            </div>
            <div className="surface-item rounded-2xl p-4">
              <span className="font-label-mono text-[10px] uppercase text-text-muted">Overview</span>
              <strong className="mt-1 block font-headline-md text-2xl text-on-surface">
                {data?.overviews.current ? '摘要' : '—'}
              </strong>
            </div>
            <div className="surface-item rounded-2xl p-4">
              <span className="font-label-mono text-[10px] uppercase text-text-muted">Region</span>
              <strong className="mt-1 block font-headline-md text-2xl text-on-surface">
                {activeMeta?.lang.toUpperCase() ?? '—'}
              </strong>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-border-subtle pt-4">
          {COUNTRIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCountry(c.id)}
              className={`rounded-full border px-3 py-1.5 font-label-mono text-[10px] uppercase transition-all duration-200 ${
                country === c.id
                  ? 'border-primary/40 bg-primary/10 text-primary shadow-sm'
                  : 'border-border-subtle bg-white/70 text-text-muted hover:border-primary/30 hover:bg-white hover:text-on-surface'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {data?.overviews.current && (
        <div className="surface-panel rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Icon name="auto_awesome" className="mt-0.5 shrink-0 text-primary" />
            <div className="min-w-0">
              <h3 className="font-body-lg font-semibold text-on-surface">
                {data.overviews.current.headline}
              </h3>
              <p className="mt-1 font-body-md text-sm leading-relaxed text-on-surface-variant">
                {data.overviews.current.summary}
              </p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="surface-panel rounded-[28px] p-6 text-center">
          <div className="inline-flex items-center gap-2 font-body-md text-sm text-text-muted">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
            </svg>
            加载中…
          </div>
        </div>
      )}

      {error && (
        <div className="surface-panel rounded-[28px] border border-[rgba(223,161,144,0.3)] bg-[rgba(223,161,144,0.12)] p-6 text-center">
          <div className="inline-flex items-center gap-2 font-body-md text-sm text-[rgb(150,95,84)]">
            <Icon name="close" />
            {error}
          </div>
        </div>
      )}

      {data && !loading && (
        <>
          <div
            ref={scrollRef}
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
          >
            {data.headlines.map((h, i) => (
              <a
                key={`${h.sourceLabel}-${i}`}
                href={h.link}
                target="_blank"
                rel="noopener noreferrer"
                className="surface-item group flex flex-col rounded-[24px] p-4 transition-all duration-200 hover:border-primary/25 hover:bg-white"
              >
                <span className="inline-flex items-center gap-1 self-start rounded-full border border-border-subtle px-2 py-0.5 font-label-mono text-[10px] uppercase text-text-muted group-hover:border-primary/20 group-hover:text-primary transition-colors">
                  <Icon name="article" className="text-[9px]" />
                  {h.sourceLabel}
                </span>

                <h4 className="mt-2 font-body-md text-sm font-semibold text-on-surface leading-snug line-clamp-3 group-hover:text-primary transition-colors">
                  {h.headline}
                </h4>

                {h.subtitle && (
                  <p className="mt-1 font-body-md text-xs leading-relaxed text-on-surface-variant line-clamp-2">
                    {h.subtitle}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                  <span className="font-label-mono text-[9px] text-text-muted">
                    {relativeTime(h.capturedAt)}
                  </span>
                  <span className="font-label-mono text-[9px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    打开 ↗
                  </span>
                </div>
              </a>
            ))}
          </div>

          {(data.overviews.yesterday || data.overviews.previous) && (
            <div className="grid gap-3 md:grid-cols-2">
              {data.overviews.previous && (
                <div className="surface-panel rounded-2xl p-4">
                  <span className="font-label-mono text-[10px] uppercase text-primary">← 上一轮</span>
                  <h4 className="mt-1 font-body-md text-sm font-semibold text-on-surface">
                    {data.overviews.previous.headline}
                  </h4>
                  <p className="mt-1 font-body-md text-xs leading-relaxed text-on-surface-variant">
                    {data.overviews.previous.summary}
                  </p>
                </div>
              )}
              {data.overviews.yesterday && (
                <div className="surface-panel rounded-2xl p-4">
                  <span className="font-label-mono text-[10px] uppercase text-text-muted">← 昨日回顾</span>
                  <h4 className="mt-1 font-body-md text-sm font-semibold text-on-surface">
                    {data.overviews.yesterday?.headline}
                  </h4>
                  <p className="mt-1 font-body-md text-xs leading-relaxed text-on-surface-variant">
                    {data.overviews.yesterday?.summary}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-4">
            <span className="font-label-mono text-[10px] text-text-muted">
              数据源：The Hear · {data.headlines.length} 家媒体
            </span>
            <span className="font-label-mono text-[10px] text-text-muted">
              {data.countryName}
            </span>
          </div>
        </>
      )}
    </section>
  )
}

export default NewsPlugin
