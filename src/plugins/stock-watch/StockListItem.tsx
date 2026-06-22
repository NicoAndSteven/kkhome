import { WatchlistStock } from './types'
import { getChineseName } from './stockNameMap'

interface Props {
  stock: WatchlistStock
  onClick: () => void
  onRemove: () => void
}

const fmtPrice = (v: number | undefined | null, d = '--') => (v != null ? v.toFixed(2) : d)

const StockListItem = ({ stock, onClick, onRemove }: Props) => {
  const changeColor = stock.change >= 0 ? 'text-red-500' : 'text-green-600'
  const arrow = stock.change >= 0 ? '▲' : '▼'
  const isPre = stock.marketState === 'PRE' && stock.preMarketPrice != null
  const isPost = stock.marketState === 'POST' && stock.postMarketPrice != null
  const extPrice = isPre ? stock.preMarketPrice : isPost ? stock.postMarketPrice : null
  const extChange = isPre ? stock.preMarketChange : isPost ? stock.postMarketChange : null

  // 中文显示名：优先用映射，否则用 API 返回的英文名
  const cnName = getChineseName(stock.symbol)
  const displayName = cnName ?? stock.name
  const showSubName = cnName && cnName !== stock.name ? stock.name : undefined

  return (
    <div className="group flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 transition-premium hover:bg-white/5 active:bg-white/[0.08]" onClick={onClick}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-label-mono text-sm text-primary">{stock.symbol}</span>
          {(isPre || isPost) && (
            <span className="rounded-full border border-primary/20 bg-primary/10 px-1.5 py-0.5 font-label-mono text-[10px] uppercase text-primary">{isPre ? 'PRE' : 'AH'}</span>
          )}
        </div>
        <div className="font-body-md text-xs text-text-muted truncate" title={stock.name}>{displayName}</div>
        {showSubName && (
          <div className="font-label-mono text-[9px] uppercase tracking-wider text-text-muted/60 truncate">{showSubName}</div>
        )}
      </div>
      <div className="text-right">
        <div className={`font-label-mono text-sm ${changeColor}`}>{fmtPrice(stock.price)}</div>
        <div className={`font-label-mono text-xs ${changeColor}`}>
          {arrow} {fmtPrice(stock.change)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
        </div>
      </div>
      {extPrice != null && extChange != null && (
        <div className="text-right hidden sm:block">
          <div className={`font-label-mono text-xs ${extChange >= 0 ? 'text-red-500' : 'text-green-600'}`}>{fmtPrice(extPrice)}</div>
          <div className={`font-label-mono text-[10px] ${extChange >= 0 ? 'text-red-500' : 'text-green-600'}`}>{extChange >= 0 ? '+' : ''}{fmtPrice(extChange)}</div>
        </div>
      )}
      <button type="button" onClick={(e) => { e.stopPropagation(); onRemove() }}
        className="opacity-40 group-hover:opacity-100 p-1.5 rounded-full text-text-muted hover:text-error hover:bg-error/10 transition-premium sm:opacity-0" title="移除">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>
  )
}

export default StockListItem
