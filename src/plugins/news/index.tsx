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

interface ArticleContent {
  title: string
  description: string
  coverImage: string | null
  content: string
  sourceUrl: string
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

/** 粗略判断文本是否非中文（需要翻译） */
const needsTranslation = (text: string): boolean => {
  if (!text) return false
  // 计算中文字符比例
  const zhChars = text.match(/[\u4e00-\u9fff]/g) ?? []
  return zhChars.length / text.length < 0.3
}

/* ─── component ──────────────────────────────────────── */

const NewsPlugin = (_props: Props) => {
  const [country, setCountry] = useState('china')
  const [data, setData] = useState<CountryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  /* ── 站内阅读 modal ── */
  const [article, setArticle] = useState<ArticleContent | null>(null)
  const [articleLoading, setArticleLoading] = useState(false)
  const [articleError, setArticleError] = useState('')

  /* ── 翻译 ── */
  const [translating, setTranslating] = useState<Set<string>>(new Set())
  const [translations, setTranslations] = useState<Record<string, string>>({})

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

  /* ── 打开站内阅读 ── */
  const openArticle = useCallback(async (url: string) => {
    setArticleLoading(true)
    setArticleError('')
    try {
      const res = await fetch(`/api/news/article?url=${encodeURIComponent(url)}`)
      if (!res.ok) throw new Error(`获取失败 ${res.status}`)
      const body = await res.json() as { ok: boolean; data: ArticleContent }
      if (!body.ok || !body.data) throw new Error('获取文章失败')
      setArticle(body.data)
    } catch (e) {
      setArticleError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setArticleLoading(false)
    }
  }, [])

  const closeArticle = useCallback(() => {
    setArticle(null)
    setArticleError('')
  }, [])

  /* ── 翻译文本 ── */
  const translateText = useCallback(async (key: string, text: string) => {
    if (translations[key]) return // 已翻译
    setTranslating((prev) => new Set(prev).add(key))
    try {
      const res = await fetch('/api/news/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang: 'zh' }),
      })
      if (!res.ok) throw new Error('翻译失败')
      const body = await res.json() as { ok: boolean; data: { translated: string } }
      if (body.ok && body.data?.translated) {
        setTranslations((prev) => ({ ...prev, [key]: body.data.translated }))
      }
    } catch {
      // 静默失败，不阻塞用户
    } finally {
      setTranslating((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
  }, [translations])

  const activeMeta = COUNTRIES.find((c) => c.id === country)

  return (
    <section id="news-feed" className="space-y-md scroll-mt-24">
      {/* ── header panel ── */}
      <div className="surface-panel rounded-[2px] p-md md:p-lg">
        <div className="grid gap-md md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <span className="font-label-mono text-xs uppercase text-secondary">
              <Icon name="travel_explore" className="mr-1" />
              The Hear · 全球新闻
            </span>
            <h2 className="mt-xs font-headline-md text-headline-md text-on-surface">
              {activeMeta?.name ?? '新闻'}
            </h2>
            <p className="mt-xs font-body-md text-body-md text-text-muted">
              {data?.asOfUtc
                ? `更新于 ${relativeTime(data.asOfUtc)}`
                : '实时多源头条快照'}
            </p>
          </div>

          {/* ── stat badges ── */}
          <div className="grid gap-xs sm:grid-cols-3 md:col-span-5">
            <div className="surface-item rounded-[2px] p-sm">
              <span className="font-label-mono text-[10px] uppercase text-text-muted">Sources</span>
              <strong className="mt-1 block font-headline-md text-2xl text-on-surface">
                {data?.headlines.length ?? 0}
              </strong>
            </div>
            <div className="surface-item rounded-[2px] p-sm">
              <span className="font-label-mono text-[10px] uppercase text-text-muted">Overview</span>
              <strong className="mt-1 block font-headline-md text-2xl text-on-surface">
                {data?.overviews.current ? '摘要' : '—'}
              </strong>
            </div>
            <div className="surface-item rounded-[2px] p-sm">
              <span className="font-label-mono text-[10px] uppercase text-text-muted">Region</span>
              <strong className="mt-1 block font-headline-md text-2xl text-on-surface">
                {activeMeta?.lang.toUpperCase() ?? '—'}
              </strong>
            </div>
          </div>
        </div>

        {/* ── country selector ── */}
        <div className="mt-md flex flex-wrap gap-1.5 border-t border-border-subtle pt-sm">
          {COUNTRIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCountry(c.id)}
              className={`rounded border px-2.5 py-1 font-label-mono text-[10px] uppercase transition-all duration-200 ${
                country === c.id
                  ? 'border-primary/40 bg-primary/10 text-primary shadow-sm'
                  : 'border-border-subtle text-text-muted hover:border-primary/30 hover:text-on-surface'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── 摘要概览（可翻译） ── */}
      {data?.overviews.current && (
        <OverViewCard
          overview={data.overviews.current}
          prefixKey="overview-current"
          translates={translations}
          translating={translating}
          onTranslate={translateText}
        />
      )}

      {/* ── loading / error ── */}
      {loading && (
        <div className="surface-panel rounded-[2px] p-lg text-center">
          <div className="inline-flex items-center gap-2 font-body-md text-sm text-text-muted">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
            </svg>
            加载中…
          </div>
        </div>
      )}

      {error && (
        <div className="surface-panel rounded-[2px] p-lg text-center">
          <div className="inline-flex items-center gap-2 font-body-md text-sm text-error">
            <Icon name="close" />
            {error}
          </div>
        </div>
      )}

      {/* ── headlines grid ── */}
      {data && !loading && (
        <>
          <div
            ref={scrollRef}
            className="grid gap-sm sm:grid-cols-2 xl:grid-cols-3"
          >
            {data.headlines.map((h, i) => {
              const headlineKey = `hl-${i}`
              const subtitleKey = `hl-sub-${i}`
              const translatedHeadline = translations[headlineKey]
              const translatedSubtitle = translations[subtitleKey]

              return (
                <div
                  key={headlineKey}
                  className="surface-item group flex flex-col rounded-[2px] p-sm transition-all duration-200 hover:border-primary/25 hover:shadow-sm"
                >
                  {/* source badge + translate btn */}
                  <div className="flex items-center justify-between gap-1">
                    <span className="inline-flex items-center gap-1 self-start rounded border border-border-subtle px-2 py-0.5 font-label-mono text-[10px] uppercase text-text-muted">
                      <Icon name="article" className="text-[9px]" />
                      {h.sourceLabel}
                    </span>
                    {needsTranslation(h.headline) && !translatedHeadline && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); void translateText(headlineKey, h.headline) }}
                        disabled={translating.has(headlineKey)}
                        className="shrink-0 rounded border border-border-subtle px-1.5 py-0.5 font-label-mono text-[9px] text-text-muted hover:border-primary/30 hover:text-primary transition-colors"
                      >
                        {translating.has(headlineKey) ? '…' : '译'}
                      </button>
                    )}
                  </div>

                  {/* headline — 点击打开站内阅读 */}
                  <button
                    type="button"
                    onClick={() => void openArticle(h.link)}
                    className="mt-2 text-left font-body-md text-sm font-semibold text-on-surface leading-snug line-clamp-3 group-hover:text-primary transition-colors"
                  >
                    {translatedHeadline ?? h.headline}
                  </button>

                  {/* subtitle */}
                  {h.subtitle && (
                    <div className="mt-1">
                      <p className="font-body-md text-xs text-text-muted line-clamp-2 leading-relaxed">
                        {translatedSubtitle ?? h.subtitle}
                      </p>
                      {needsTranslation(h.subtitle) && !translatedSubtitle && (
                        <button
                          type="button"
                          onClick={() => void translateText(subtitleKey, h.subtitle)}
                          disabled={translating.has(subtitleKey)}
                          className="mt-0.5 font-label-mono text-[9px] text-text-muted hover:text-primary transition-colors"
                        >
                          {translating.has(subtitleKey) ? '翻译中…' : '翻译摘要'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* footer */}
                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <span className="font-label-mono text-[9px] text-text-muted">
                      {relativeTime(h.capturedAt)}
                    </span>
                    <span className="font-label-mono text-[9px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      站内阅读 ↗
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── historical overviews（可翻译） ── */}
          {(data.overviews.yesterday || data.overviews.previous) && (
            <div className="grid gap-sm md:grid-cols-2">
              {data.overviews.previous && (
                <OverViewCard
                  overview={data.overviews.previous}
                  prefixKey="overview-previous"
                  label="上一轮"
                  translates={translations}
                  translating={translating}
                  onTranslate={translateText}
                />
              )}
              {data.overviews.yesterday && (
                <OverViewCard
                  overview={data.overviews.yesterday}
                  prefixKey="overview-yesterday"
                  label="昨日回顾"
                  translates={translations}
                  translating={translating}
                  onTranslate={translateText}
                />
              )}
            </div>
          )}

          {/* ── footer ── */}
          <div className="flex items-center justify-between gap-sm border-t border-border-subtle pt-sm">
            <span className="font-label-mono text-[10px] text-text-muted">
              数据源：The Hear · {data.headlines.length} 家媒体
            </span>
            <span className="font-label-mono text-[10px] text-text-muted">
              {data.countryName}
            </span>
          </div>
        </>
      )}

      {/* ── 站内阅读模态框 ── */}
      {(article || articleLoading || articleError) && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
          onClick={closeArticle}
        >
          <div
            className="relative my-8 w-full max-w-3xl rounded-lg border border-border-subtle bg-surface-card p-md md:p-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="文章阅读"
          >
            {/* close button */}
            <button
              type="button"
              onClick={closeArticle}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle text-text-muted hover:text-on-surface hover:border-primary/30 transition-all"
              aria-label="关闭"
            >
              <Icon name="close" />
            </button>

            {/* loading */}
            {articleLoading && (
              <div className="flex items-center justify-center py-16">
                <div className="inline-flex items-center gap-2 font-body-md text-sm text-text-muted">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                  </svg>
                  加载文章…
                </div>
              </div>
            )}

            {/* error */}
            {articleError && (
              <div className="flex flex-col items-center gap-4 py-16">
                <Icon name="error_outline" className="text-3xl text-error" />
                <p className="font-body-md text-sm text-text-muted">{articleError}</p>
                <button
                  type="button"
                  onClick={closeArticle}
                  className="rounded-lg border border-border-subtle px-4 py-2 font-body-md text-sm text-text-muted hover:border-primary/30 hover:text-primary transition-colors"
                >
                  关闭
                </button>
              </div>
            )}

            {/* article content */}
            {article && !articleLoading && (
              <div className="space-y-md">
                {/* cover image */}
                {article.coverImage && (
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full max-h-64 rounded object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                )}

                {/* title */}
                <h2 className="font-headline-md text-headline-md text-on-surface leading-snug">
                  {article.title}
                </h2>

                {/* description */}
                {article.description && (
                  <p className="font-body-md text-sm text-text-muted">
                    {article.description}
                  </p>
                )}

                {/* divider */}
                <hr className="border-border-subtle" />

                {/* article body - sanitized HTML */}
                <div
                  className="prose-custom font-body-md text-sm text-on-surface leading-relaxed space-y-3 [&_a]:text-primary [&_a:hover]:underline [&_img]:max-w-full [&_img]:rounded [&_p]:leading-relaxed [&_h1]:font-headline-md [&_h2]:font-headline-md [&_h3]:font-body-lg [&_h3]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* source link */}
                <div className="border-t border-border-subtle pt-md">
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-body-md text-sm text-primary hover:underline"
                  >
                    <Icon name="open_in_new" className="text-sm" />
                    查看原文
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

/* ─── 摘要卡片子组件（支持翻译） ──────────────────────── */

interface OverViewCardProps {
  overview: Overview
  prefixKey: string
  label?: string
  translates: Record<string, string>
  translating: Set<string>
  onTranslate: (key: string, text: string) => void
}

const OverViewCard = ({ overview, prefixKey, label, translates, translating, onTranslate }: OverViewCardProps) => {
  const headlineKey = `${prefixKey}-headline`
  const summaryKey = `${prefixKey}-summary`
  const translatedHeadline = translates[headlineKey]
  const translatedSummary = translates[summaryKey]

  return (
    <div className="surface-panel-strong rounded-[2px] p-md">
      <div className="flex items-start gap-sm">
        <Icon name="auto_awesome" className="mt-0.5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          {/* headline */}
          <div className="flex items-start gap-2">
            <h3 className="font-body-lg font-semibold text-on-surface">
              {translatedHeadline ?? overview.headline}
            </h3>
            {label && (
              <span className="shrink-0 rounded border border-secondary/20 bg-secondary/10 px-2 py-0.5 font-label-mono text-[10px] text-secondary">
                {label}
              </span>
            )}
            {needsTranslation(overview.headline) && !translatedHeadline && (
              <button
                type="button"
                onClick={() => onTranslate(headlineKey, overview.headline)}
                disabled={translating.has(headlineKey)}
                className="shrink-0 rounded border border-border-subtle px-1.5 py-0.5 font-label-mono text-[9px] text-text-muted hover:border-primary/30 hover:text-primary transition-colors"
              >
                {translating.has(headlineKey) ? '…' : '译'}
              </button>
            )}
          </div>

          {/* summary */}
          <p className="mt-1 font-body-md text-sm text-text-muted leading-relaxed">
            {translatedSummary ?? overview.summary}
          </p>
          {needsTranslation(overview.summary) && !translatedSummary && (
            <button
              type="button"
              onClick={() => onTranslate(summaryKey, overview.summary)}
              disabled={translating.has(summaryKey)}
              className="mt-1 font-label-mono text-[10px] text-text-muted hover:text-primary transition-colors"
            >
              {translating.has(summaryKey) ? '翻译中…' : '翻译摘要'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default NewsPlugin
