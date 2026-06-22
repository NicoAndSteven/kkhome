import { useState, useEffect, useCallback, useRef } from 'react'
import { PluginRuntimeConfig } from '@core/types'
import { Icon } from '@components'
import { FundInfo, FundWithQuotes, FundHoldingQuote, WatchlistStock } from './types'
import { readLocalFunds, writeLocalFunds, fetchAllFundQuotes } from './fundDataService'
import FundCard from './FundCard'
import FundImport from './FundImport'
import StockDetail from './StockDetail'

interface Props { config?: PluginRuntimeConfig }

const REFRESH_INTERVAL_MS = 30_000

const StockWatchPlugin = (_props: Props) => {
  const [funds, setFunds] = useState<FundInfo[]>(readLocalFunds)
  const [fundsWithQuotes, setFundsWithQuotes] = useState<FundWithQuotes[]>([])
  const [selectedStock, setSelectedStock] = useState<WatchlistStock | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [error, setError] = useState('')
  const [dataReady, setDataReady] = useState(false)
  const tickRef = useRef<ReturnType<typeof setInterval>>()

  // 计算汇总统计
  const totalFunds = funds.length
  const totalHoldings = funds.reduce((acc, f) => acc + f.topHoldings.length, 0)

  // funds 变化时写入 localStorage
  useEffect(() => { writeLocalFunds(funds) }, [funds])

  // 获取所有持仓股的行情数据
  const refreshAllQuotes = useCallback(async () => {
    if (funds.length === 0) {
      setFundsWithQuotes([])
      setDataReady(true)
      return
    }
    try {
      const data = await fetchAllFundQuotes(funds)
      setFundsWithQuotes(data)
      setError('')
    } catch {
      setError('获取行情数据失败')
    } finally {
      setDataReady(true)
    }
  }, [funds])

  // 初始加载 + 定时刷新
  useEffect(() => {
    refreshAllQuotes()
    tickRef.current = setInterval(refreshAllQuotes, REFRESH_INTERVAL_MS)
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [refreshAllQuotes])

  // 导入基金
  const handleImportFund = (fund: FundInfo) => {
    setFunds((prev) => {
      if (prev.some((f) => f.code === fund.code)) return prev
      return [...prev, fund]
    })
  }

  // 删除基金
  const handleDeleteFund = (code: string) => {
    setFunds((prev) => prev.filter((f) => f.code !== code))
    setFundsWithQuotes((prev) => prev.filter((f) => f.code !== code))
  }

  // 点击持仓股 → 进入详情
  const handleSelectStock = (holding: FundHoldingQuote) => {
    setSelectedStock({
      symbol: holding.symbol,
      name: holding.name,
      price: holding.price,
      change: holding.change,
      changePercent: holding.changePercent,
      preMarketPrice: holding.preMarketPrice,
      preMarketChange: holding.preMarketChange,
      preMarketChangePercent: holding.preMarketChangePercent,
      postMarketPrice: holding.postMarketPrice,
      postMarketChange: holding.postMarketChange,
      postMarketChangePercent: holding.postMarketChangePercent,
      marketState: holding.marketState ?? 'CLOSED',
      previousClose: holding.previousClose ?? 0,
      open: 0,
      dayHigh: 0,
      dayLow: 0,
      volume: 0,
    })
  }

  // StockDetail 返回
  const handleBackFromDetail = () => {
    setSelectedStock(null)
  }

  // ── 详情页面 ──
  if (selectedStock) {
    return (
      <section id="stock-watch" className="h-full flex flex-col">
        <div className="surface-panel rounded-2xl p-4 md:p-5">
          <StockDetail stock={selectedStock} onBack={handleBackFromDetail} />
        </div>
      </section>
    )
  }

  // ── 主页面：基金持仓看板 ──
  return (
    <section id="stock-watch" className="space-y-5">
      {/* 头部 */}
      <div className="stack-board surface-panel-strong rounded-[28px] p-5 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-label-mono text-[10px] uppercase tracking-[0.34em] text-primary">Section 04</span>
              <span className="h-px w-24 bg-[linear-gradient(90deg,rgba(17,72,255,0.6),rgba(224,20,52,0.55),transparent)]" />
            </div>
            <h2 className="mt-3 font-headline-md text-[clamp(2.4rem,4.8vw,4.2rem)] font-semibold leading-[0.92] tracking-[-0.08em] text-on-surface">
              QDII 看盘
            </h2>
            <p className="mt-3 max-w-2xl font-body-md text-sm leading-relaxed text-on-surface-variant">
              基金重仓股实时行情看板。美股盘前盘后数据自动更新。
            </p>
          </div>
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition-premium hover:opacity-90 active:scale-[0.98]"
          >
            <Icon name="add" className="text-base" />
            导入基金
          </button>
        </div>

        {/* 统计卡片 */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="surface-item rounded-2xl p-4">
            <div className="font-label-mono text-[10px] uppercase tracking-wider text-text-muted">基金数量</div>
            <div className="mt-2 font-headline-md text-3xl text-on-surface">{totalFunds}</div>
          </div>
          <div className="surface-item rounded-2xl p-4">
            <div className="font-label-mono text-[10px] uppercase tracking-wider text-text-muted">持仓总数</div>
            <div className="mt-2 font-headline-md text-3xl text-on-surface">{totalHoldings}</div>
          </div>
          <div className="surface-item rounded-2xl p-4">
            <div className="font-label-mono text-[10px] uppercase tracking-wider text-text-muted">刷新间隔</div>
            <div className="mt-2 font-headline-md text-3xl text-on-surface">30s</div>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="rounded-2xl border border-[rgba(223,161,144,0.35)] bg-[rgba(223,161,144,0.12)] px-4 py-3">
          <span className="font-body-md text-xs text-[rgb(150,95,84)]">{error}</span>
        </div>
      )}

      {/* 加载状态 */}
      {!dataReady && funds.length > 0 && (
        <div className="flex items-center justify-center py-12">
          <span className="font-body-md text-sm text-text-muted">加载行情数据...</span>
        </div>
      )}

      {/* 空状态 */}
      {dataReady && funds.length === 0 && (
        <div className="surface-panel rounded-2xl p-8 text-center">
          <Icon name="account_tree" className="text-3xl text-text-muted/40 mx-auto mb-3" />
          <p className="font-body-md text-sm text-text-muted mb-1">暂无基金数据</p>
          <p className="font-body-md text-xs text-text-muted/60 mb-4">导入 QDII 基金，查看其重仓股实时行情</p>
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition-premium hover:opacity-90 active:scale-[0.98]"
          >
            <Icon name="add" className="text-sm" />
            导入基金
          </button>
        </div>
      )}

      {/* 基金卡片列表 */}
      {funds.length > 0 && (
        <div className="space-y-3">
          {fundsWithQuotes.map((fwq) => (
            <FundCard
              key={fwq.code}
              fund={fwq}
              onSelectStock={handleSelectStock}
              onDeleteFund={handleDeleteFund}
            />
          ))}
        </div>
      )}

      {/* 导入基金弹窗 */}
      {importOpen && (
        <FundImport
          onImport={handleImportFund}
          existingCodes={funds.map((f) => f.code)}
          onClose={() => setImportOpen(false)}
        />
      )}
    </section>
  )
}

export default StockWatchPlugin
