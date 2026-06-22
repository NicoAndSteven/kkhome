import { useState, useEffect, useCallback, useRef } from 'react'
import { PluginRuntimeConfig } from '@core/types'
import { Icon } from '@components'
import { WatchlistStock, YahooQuoteResult } from './types'
import StockListItem from './StockListItem'
import StockDetail from './StockDetail'
import StockSearch from './StockSearch'

interface Props { config?: PluginRuntimeConfig }

const STORAGE_KEY = 'hub:stock-watchlist'
const REFRESH_INTERVAL_MS = 30_000
const DEFAULT_SYMBOLS: string[] = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL', 'AMD']

const StockWatchPlugin = (_props: Props) => {
  const [symbols, setSymbols] = useState<string[]>(() => {
    try { const s = globalThis.localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : DEFAULT_SYMBOLS }
    catch { return DEFAULT_SYMBOLS }
  })
  const [stocks, setStocks] = useState<WatchlistStock[]>([])
  const [selectedStock, setSelectedStock] = useState<WatchlistStock | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [error, setError] = useState('')
  const tickRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => { globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols)) }, [symbols])

  const fetchQuotes = useCallback(async () => {
    if (symbols.length === 0) { setStocks([]); return }
    try {
      const res = await fetch('/api/stock/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols }),
      })
      const json = await res.json()
      if (!json.ok) { setError(json.error?.message || 'Failed'); return }
      setError('')
      const results = (json.data?.quoteResponse?.result ?? []) as YahooQuoteResult['quoteResponse']['result']
      const mapped: WatchlistStock[] = results.map((q) => ({
        symbol: q.symbol,
        name: q.shortName || q.longName || q.symbol,
        price: q.regularMarketPrice ?? 0,
        change: q.regularMarketChange ?? 0,
        changePercent: q.regularMarketChangePercent ?? 0,
        preMarketPrice: q.preMarketPrice,
        preMarketChange: q.preMarketChange,
        preMarketChangePercent: q.preMarketChangePercent,
        postMarketPrice: q.postMarketPrice,
        postMarketChange: q.postMarketChange,
        postMarketChangePercent: q.postMarketChangePercent,
        marketState: q.marketState,
        previousClose: q.regularMarketPreviousClose ?? 0,
        open: q.regularMarketOpen ?? 0,
        dayHigh: q.regularMarketDayHigh ?? 0,
        dayLow: q.regularMarketDayLow ?? 0,
        volume: q.regularMarketVolume ?? 0,
        marketCap: q.marketCap,
        high52w: q.fiftyTwoWeekHigh,
        low52w: q.fiftyTwoWeekLow,
      }))
      setStocks(mapped)
    } catch {
      setError('网络请求失败。请确认部署到 Cloudflare Pages 后重试。')
    }
  }, [symbols])

  useEffect(() => {
    fetchQuotes()
    tickRef.current = setInterval(fetchQuotes, REFRESH_INTERVAL_MS)
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [fetchQuotes])

  const handleAdd = (symbol: string) => { setSymbols((p) => p.includes(symbol) ? p : [...p, symbol]) }
  const handleRemove = (symbol: string) => { setSymbols((p) => p.filter((s) => s !== symbol)); if (selectedStock?.symbol === symbol) setSelectedStock(null) }

  if (selectedStock) {
    return (
      <section id="stock-watch" className="h-full flex flex-col">
        <div className="surface-panel rounded-2xl p-4 md:p-5">
          <StockDetail stock={selectedStock} onBack={() => setSelectedStock(null)} />
        </div>
      </section>
    )
  }

  return (
    <section id="stock-watch" className="space-y-5">
      <div className="stack-board surface-panel-strong rounded-[28px] p-5 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-label-mono text-[10px] uppercase tracking-[0.34em] text-primary">Section 04</span>
              <span className="h-px w-24 bg-[linear-gradient(90deg,rgba(17,72,255,0.6),rgba(224,20,52,0.55),transparent)]" />
            </div>
            <h2 className="mt-3 font-headline-md text-[clamp(2.4rem,4.8vw,4.2rem)] font-semibold leading-[0.92] tracking-[-0.08em] text-on-surface">自选股</h2>
            <p className="mt-3 max-w-2xl font-body-md text-sm leading-relaxed text-on-surface-variant">
              保留实时数据和图表，但把页面拉回更像金融海报的信息编排，不再像监控面板。
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition-premium hover:opacity-90 active:scale-[0.98]"
          >
            <Icon name="add" className="text-base" />
            添加自选
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="surface-item rounded-2xl p-4">
            <div className="font-label-mono text-[10px] uppercase tracking-wider text-text-muted">自选数量</div>
            <div className="mt-2 font-headline-md text-3xl text-on-surface">{symbols.length}</div>
          </div>
          <div className="surface-item rounded-2xl p-4">
            <div className="font-label-mono text-[10px] uppercase tracking-wider text-text-muted">当前数据</div>
            <div className="mt-2 font-headline-md text-3xl text-on-surface">{stocks.length}</div>
          </div>
          <div className="surface-item rounded-2xl p-4">
            <div className="font-label-mono text-[10px] uppercase tracking-wider text-text-muted">刷新间隔</div>
            <div className="mt-2 font-headline-md text-3xl text-on-surface">30s</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-[rgba(223,161,144,0.35)] bg-[rgba(223,161,144,0.12)] px-4 py-3">
          <span className="font-body-md text-xs text-[rgb(150,95,84)]">{error}</span>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {stocks.length === 0 && symbols.length > 0 && (
          <div className="flex items-center justify-center py-12">
            <span className="font-body-md text-sm text-text-muted">加载中...</span>
          </div>
        )}
        {symbols.length === 0 && (
          <div className="surface-panel rounded-2xl p-8 text-center">
            <span className="font-body-md text-sm text-text-muted">暂无自选股</span>
            <div className="mt-3">
              <button type="button" onClick={() => setSearchOpen(true)} className="text-sm font-semibold text-primary hover:underline">
                点击添加
              </button>
            </div>
          </div>
        )}
        <div className="space-y-2">
          {stocks.map((s) => (
            <div key={s.symbol} className="surface-panel rounded-2xl p-0">
              <StockListItem stock={s} onClick={() => setSelectedStock(s)} onRemove={() => handleRemove(s.symbol)} />
            </div>
          ))}
        </div>
      </div>

      {searchOpen && <StockSearch onAdd={handleAdd} existingSymbols={symbols} onClose={() => setSearchOpen(false)} />}
    </section>
  )
}

export default StockWatchPlugin
