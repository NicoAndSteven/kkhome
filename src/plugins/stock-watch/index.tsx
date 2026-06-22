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

/** 从 localStorage 读取本地兜底 */
const readLocalSymbols = (): string[] => {
  try {
    const s = globalThis.localStorage.getItem(STORAGE_KEY)
    return s ? JSON.parse(s) : DEFAULT_SYMBOLS
  } catch {
    return DEFAULT_SYMBOLS
  }
}

const writeLocalSymbols = (symbols: string[]) => {
  globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols))
}

/** 从 API 同步远程自选股列表 */
const fetchRemoteSymbols = async (): Promise<string[] | null> => {
  try {
    const res = await fetch('/api/stock/watchlist')
    if (!res.ok) return null
    const json = await res.json()
    if (!json.ok) return null
    const items: Array<{ symbol: string }> = json.data?.watchlist ?? []
    return items.map((item) => item.symbol)
  } catch {
    return null
  }
}

const StockWatchPlugin = (_props: Props) => {
  const [symbols, setSymbols] = useState<string[]>(readLocalSymbols)
  const [stocks, setStocks] = useState<WatchlistStock[]>([])
  const [selectedStock, setSelectedStock] = useState<WatchlistStock | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [error, setError] = useState('')
  const [syncMessage, setSyncMessage] = useState('')
  const tickRef = useRef<ReturnType<typeof setInterval>>()

  // 启动时尝试从服务端拉取自选股列表
  useEffect(() => {
    let cancelled = false
    fetchRemoteSymbols().then((remote) => {
      if (cancelled) return
      if (remote && remote.length > 0) {
        setSymbols(remote)
        writeLocalSymbols(remote)
        setSyncMessage('')
      } else if (remote && remote.length === 0) {
        // 服务端无数据，用本地作为初始同步
        setSyncMessage('')
      } else {
        // API 不可用，使用本地兜底
        setSyncMessage('本地模式')
      }
    })
    return () => { cancelled = true }
  }, [])

  // symbols 变化时写入 localStorage 兜底
  useEffect(() => { writeLocalSymbols(symbols) }, [symbols])

  // 同步 symbols 到远程
  const syncToRemote = useCallback(async (newSymbols: string[]) => {
    try {
      // 把本地全量同步到远程（全量替换模式）
      // 先获取远程 list
      const remoteRes = await fetch('/api/stock/watchlist')
      if (!remoteRes.ok) return
      const remoteJson = await remoteRes.json()
      if (!remoteJson.ok) return
      const remoteItems: Array<{ symbol: string }> = remoteJson.data?.watchlist ?? []
      const remoteSymbols = new Set(remoteItems.map((r) => r.symbol))
      const localSet = new Set(newSymbols)

      // 删除远程多余
      for (const item of remoteItems) {
        if (!localSet.has(item.symbol)) {
          await fetch(`/api/stock/watchlist?symbol=${item.symbol}`, { method: 'DELETE' })
        }
      }
      // 新增本地有但远程没有的
      for (const sym of newSymbols) {
        if (!remoteSymbols.has(sym)) {
          await fetch('/api/stock/watchlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symbol: sym }),
          })
        }
      }
    } catch {
      // 静默失败，localStorage 兜底
    }
  }, [])

  const fetchQuotes = useCallback(async () => {
    if (symbols.length === 0) { setStocks([]); return }
    try {
      const res = await fetch('/api/stock/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols }),
      })
      const json = await res.json()
      if (!json.ok) { setError(json.error?.message || '获取失败'); return }
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
      setError('网络请求失败。已部署到 Cloudflare Pages 后重试。')
    }
  }, [symbols])

  useEffect(() => {
    fetchQuotes()
    tickRef.current = setInterval(fetchQuotes, REFRESH_INTERVAL_MS)
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [fetchQuotes])

  const handleAdd = async (symbol: string, _name?: string) => {
    const next = symbols.includes(symbol) ? symbols : [...symbols, symbol]
    setSymbols(next)
    syncToRemote(next)
  }

  const handleRemove = async (symbol: string) => {
    const next = symbols.filter((s) => s !== symbol)
    setSymbols(next)
    if (selectedStock?.symbol === symbol) setSelectedStock(null)
    // 同步到远程
    try {
      await fetch(`/api/stock/watchlist?symbol=${symbol}`, { method: 'DELETE' })
    } catch { /* 静默 */ }
  }

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

      {syncMessage && (
        <div className="rounded-2xl border border-[rgba(8,145,178,0.25)] bg-[rgba(8,145,178,0.08)] px-4 py-2">
          <span className="font-body-md text-xs text-primary">{syncMessage}</span>
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
