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
    } catch { setError('无法连接数据服务。此功能需要 Cloudflare Pages Functions 支持，本地预览模式下不可用。') }
  }, [symbols])

  useEffect(() => {
    fetchQuotes()
    tickRef.current = setInterval(fetchQuotes, REFRESH_INTERVAL_MS)
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [fetchQuotes])

  const handleAdd = (symbol: string) => { setSymbols((p) => p.includes(symbol) ? p : [...p, symbol]) }
  const handleRemove = (symbol: string) => { setSymbols((p) => p.filter((s) => s !== symbol)); if (selectedStock?.symbol === symbol) setSelectedStock(null) }

  if (selectedStock) {
    return <section id="stock-watch" className="h-full flex flex-col"><StockDetail stock={selectedStock} onBack={() => setSelectedStock(null)} /></section>
  }

  return (
    <section id="stock-watch" className="h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <span className="font-label-mono text-xs uppercase text-secondary">Stock Watch</span>
          <h2 className="mt-xs font-headline-md text-headline-md text-on-surface">自选股</h2>
        </div>
        <button type="button" onClick={() => setSearchOpen(true)}
          className="inline-flex items-center gap-xs rounded-[2px] bg-primary px-sm py-2 font-body-md text-sm font-semibold text-on-primary transition-premium hover:opacity-90"
        ><Icon name="add" className="text-base" />添加</button>
      </div>
      {error && <div className="mt-sm px-sm py-1 rounded-[2px] bg-error/10 border border-error/20"><span className="font-body-md text-xs text-error">{error}</span></div>}
      <div className="flex-1 min-h-0 mt-md overflow-y-auto">
        {stocks.length === 0 && symbols.length > 0 && <div className="flex items-center justify-center h-full"><span className="font-body-md text-sm text-text-muted">加载中...</span></div>}
        {symbols.length === 0 && <div className="flex flex-col items-center justify-center h-full gap-sm">
          <span className="font-body-md text-sm text-text-muted">暂无自选股</span>
          <button type="button" onClick={() => setSearchOpen(true)} className="font-body-md text-sm text-primary hover:underline">点击添加</button>
        </div>}
        <div>{stocks.map((s) => <StockListItem key={s.symbol} stock={s} onClick={() => setSelectedStock(s)} onRemove={() => handleRemove(s.symbol)} />)}</div>
      </div>
      {searchOpen && <StockSearch onAdd={handleAdd} existingSymbols={symbols} onClose={() => setSearchOpen(false)} />}
    </section>
  )
}

export default StockWatchPlugin
