import { useEffect, useRef, useState, useCallback } from 'react'
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts'
import { Icon } from '@components'
import { WatchlistStock, ChartDataPoint, IntervalRange, INTERVAL_MAP } from './types'

interface Props {
  stock: WatchlistStock
  onBack: () => void
}

const intervals: IntervalRange[] = ['1D', '5D', '1M', '3M', '1Y', '5Y']
const fmt = (v: number | undefined | null, d = '--') => (v != null ? v.toFixed(2) : d)

const StockDetail = ({ stock, onBack }: Props) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [activeInterval, setActiveInterval] = useState<IntervalRange>('1D')
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(false)

  const fetchChart = useCallback(async (range: IntervalRange) => {
    const { interval: yahooInterval, range: yahooRange } = INTERVAL_MAP[range]
    setLoading(true)
    try {
      const res = await fetch(`/api/stock/chart?symbol=${stock.symbol}&range=${yahooRange}&interval=${yahooInterval}`)
      const json = await res.json()
      if (!json.ok) throw new Error(json.error?.message || 'Failed')
      const chart = json.data.chart?.result?.[0]
      if (!chart) { setChartData([]); return }
      const timestamps: number[] = chart.timestamp ?? []
      const quote = chart.indicators?.quote?.[0]
      const opens = quote?.open ?? []; const highs = quote?.high ?? []; const lows = quote?.low ?? []; const closes = quote?.close ?? []
      const points: ChartDataPoint[] = []
      for (let i = 0; i < timestamps.length; i++) {
        if (opens[i] != null && highs[i] != null && lows[i] != null && closes[i] != null) {
          points.push({ time: timestamps[i].toString(), open: opens[i]!, high: highs[i]!, low: lows[i]!, close: closes[i]! })
        }
      }
      setChartData(points)
    } catch { setChartData([]) }
    finally { setLoading(false) }
  }, [stock.symbol])

  useEffect(() => { fetchChart(activeInterval) }, [activeInterval, fetchChart])

  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return
    const container = chartContainerRef.current
    const isDark = document.documentElement.classList.contains('dark')
    const textColor = isDark ? '#f1ece6' : '#1a1a1a'
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

    const chart = createChart(container, {
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' },
      grid: { vertLines: { color: gridColor }, horzLines: { color: gridColor } },
      rightPriceScale: { borderColor: gridColor, scaleMargins: { top: 0.08, bottom: 0.12 } },
      timeScale: { borderColor: gridColor, timeVisible: true, secondsVisible: false },
      width: container.clientWidth,
      height: Math.max(280, Math.min(400, container.clientHeight)),
      handleScroll: false,
      handleScale: false,
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e', downColor: '#ef4444',
      borderUpColor: '#22c55e', borderDownColor: '#ef4444',
      wickUpColor: '#22c55e', wickDownColor: '#ef4444',
      priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
    })
    candleSeries.setData(chartData as any)
    chart.timeScale().fitContent()

    const observer = new ResizeObserver(() => {
      chart.applyOptions({ width: container.clientWidth, height: Math.max(280, Math.min(400, container.clientHeight)) })
    })
    observer.observe(container)
    return () => { observer.disconnect(); chart.remove() }
  }, [chartData])

  const changeColor = stock.change >= 0 ? 'text-green-500' : 'text-red-500'
  const isPre = stock.marketState === 'PRE'
  const isPost = stock.marketState === 'POST'
  const extLabel = isPre ? '盘前' : isPost ? '盘后' : null
  const extPrice = isPre ? stock.preMarketPrice : isPost ? stock.postMarketPrice : null
  const extChange = isPre ? stock.preMarketChange : isPost ? stock.postMarketChange : null
  const extChangePct = isPre ? stock.preMarketChangePercent : isPost ? stock.postMarketChangePercent : null

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-sm pb-md border-b border-border-subtle shrink-0">
        <button type="button" onClick={onBack} className="rounded-[2px] p-1 text-text-muted hover:text-on-surface transition-premium">
          <Icon name="chevron_left" className="text-xl" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-headline-md text-headline-md text-on-surface truncate">{stock.symbol}</h2>
            {extLabel && <span className="font-label-mono text-[10px] uppercase text-secondary px-1 rounded-[2px] bg-secondary/10">{extLabel}</span>}
          </div>
          <p className="font-body-md text-sm text-text-muted truncate">{stock.name}</p>
        </div>
        <div className="text-right">
          <div className={`font-label-mono text-lg ${changeColor}`}>{fmt(stock.price)}</div>
          <div className={`font-label-mono text-sm ${changeColor}`}>
            {stock.change >= 0 ? '+' : ''}{fmt(stock.change)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>
      {extLabel && extPrice != null && extChange != null && (
        <div className="flex items-center gap-md px-sm py-1 border-b border-border-subtle shrink-0">
          <span className="font-label-mono text-xs text-text-muted">{extLabel}</span>
          <span className={`font-label-mono text-sm ${extChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>{fmt(extPrice)}</span>
          <span className={`font-label-mono text-xs ${extChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {extChange >= 0 ? '+' : ''}{fmt(extChange)} ({extChangePct != null ? (extChangePct >= 0 ? '+' : '') + extChangePct.toFixed(2) : '--'}%)
          </span>
        </div>
      )}
      <div className="flex gap-1 py-sm shrink-0">
        {intervals.map((iv) => (
          <button key={iv} type="button" onClick={() => setActiveInterval(iv)}
            className={`px-2 py-0.5 rounded-[2px] font-label-mono text-xs transition-premium ${activeInterval === iv ? 'bg-primary/12 text-primary' : 'text-text-muted hover:text-on-surface hover:bg-surface-card/50'}`}
          >{iv}</button>
        ))}
      </div>
      <div className="flex-1 min-h-0 relative">
        {loading && <div className="absolute inset-0 flex items-center justify-center bg-surface/50 z-10"><span className="font-body-md text-sm text-text-muted">加载中...</span></div>}
        <div ref={chartContainerRef} className="w-full h-full" />
        {!loading && chartData.length === 0 && <div className="absolute inset-0 flex items-center justify-center"><span className="font-body-md text-sm text-text-muted">暂无数据</span></div>}
      </div>
      <div className="grid grid-cols-3 gap-x-md gap-y-1 pt-md border-t border-border-subtle shrink-0 text-xs">
        <div className="flex items-baseline justify-between gap-1"><span className="font-body-md text-text-muted">昨收</span><span className="font-label-mono text-on-surface">{fmt(stock.previousClose)}</span></div>
        <div className="flex items-baseline justify-between gap-1"><span className="font-body-md text-text-muted">开盘</span><span className="font-label-mono text-on-surface">{fmt(stock.open)}</span></div>
        <div className="flex items-baseline justify-between gap-1"><span className="font-body-md text-text-muted">最高</span><span className="font-label-mono text-on-surface">{fmt(stock.dayHigh)}</span></div>
        <div className="flex items-baseline justify-between gap-1"><span className="font-body-md text-text-muted">最低</span><span className="font-label-mono text-on-surface">{fmt(stock.dayLow)}</span></div>
        <div className="flex items-baseline justify-between gap-1"><span className="font-body-md text-text-muted">成交量</span><span className="font-label-mono text-on-surface">{stock.volume != null ? (stock.volume / 1_000_000).toFixed(2) + 'M' : '--'}</span></div>
        <div className="flex items-baseline justify-between gap-1"><span className="font-body-md text-text-muted">市值</span><span className="font-label-mono text-on-surface">{stock.marketCap != null ? '$' + (stock.marketCap / 1_000_000_000).toFixed(2) + 'B' : '--'}</span></div>
        <div className="flex items-baseline justify-between gap-1"><span className="font-body-md text-text-muted">52周高</span><span className="font-label-mono text-on-surface">{fmt(stock.high52w)}</span></div>
        <div className="flex items-baseline justify-between gap-1"><span className="font-body-md text-text-muted">52周低</span><span className="font-label-mono text-on-surface">{fmt(stock.low52w)}</span></div>
      </div>
    </div>
  )
}

export default StockDetail
