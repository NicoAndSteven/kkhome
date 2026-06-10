import { WatchlistStock } from './types'

interface Props {
  stock: WatchlistStock
  onClick: () => void
  onRemove: () => void
}

const fmtPrice = (v: number | undefined | null, d = '--') => (v != null ? v.toFixed(2) : d)

const StockListItem = ({ stock, onClick, onRemove }: Props) => {
  const changeColor = stock.change >= 0 ? 'text-green-500' : 'text-red-500'
  const arrow = stock.change >= 0 ? '▲' : '▼'
  const isPre = stock.marketState === 'PRE' && stock.preMarketPrice != null
  const isPost = stock.marketState === 'POST' && stock.postMarketPrice != null
  const extPrice = isPre ? stock.preMarketPrice : isPost ? stock.postMarketPrice : null
  const extChange = isPre ? stock.preMarketChange : isPost ? stock.postMarketChange : null

  return (
    <div className="group flex items-center gap-3 px-sm py-2 rounded-[2px] cursor-pointer transition-premium hover:bg-surface-card/60 active:bg-surface-card/80" onClick={onClick}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-label-mono text-sm text-primary">{stock.symbol}</span>
          {(isPre || isPost) && (
            <span className="font-label-mono text-[10px] uppercase text-secondary px-1 rounded-[2px] bg-secondary/10">{isPre ? 'PRE' : 'AH'}</span>
          )}
        </div>
        <div className="font-body-md text-xs text-text-muted truncate">{stock.name}</div>
      </div>
      <div className="text-right">
        <div className={`font-label-mono text-sm ${changeColor}`}>{fmtPrice(stock.price)}</div>
        <div className={`font-label-mono text-xs ${changeColor}`}>
          {arrow} {fmtPrice(stock.change)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
        </div>
      </div>
      {extPrice != null && extChange != null && (
        <div className="text-right hidden sm:block">
          <div className={`font-label-mono text-xs ${extChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>{fmtPrice(extPrice)}</div>
          <div className={`font-label-mono text-[10px] ${extChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>{extChange >= 0 ? '+' : ''}{fmtPrice(extChange)}</div>
        </div>
      )}
      <button type="button" onClick={(e) => { e.stopPropagation(); onRemove() }}
        className="opacity-0 group-hover:opacity-100 p-1 rounded-[2px] text-text-muted hover:text-error hover:bg-error/10 transition-premium" title="移除">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>
  )
}

export default StockListItem
