import { useState } from 'react'
import { Icon } from '@components'
import { FundWithQuotes, FundHoldingQuote } from './types'
import { getChineseName } from './stockNameMap'

interface Props {
  fund: FundWithQuotes
  onSelectStock: (holding: FundHoldingQuote) => void
  onDeleteFund: (code: string) => void
}

const INITIAL_DISPLAY_COUNT = 5

const fmtPrice = (v: number | undefined | null, d = '--') => (v != null ? v.toFixed(2) : d)

/** 持仓股行组件 */
const HoldingRow = ({ holding, onClick }: { holding: FundHoldingQuote; onClick: () => void }) => {
  const changeColor = holding.change > 0 ? 'text-red-500' : holding.change < 0 ? 'text-green-600' : 'text-text-muted'
  const arrow = holding.change > 0 ? '▲' : holding.change < 0 ? '▼' : '―'
  const isPre = holding.marketState === 'PRE' && holding.preMarketPrice != null
  const isPost = holding.marketState === 'POST' && holding.postMarketPrice != null
  const extPrice = isPre ? holding.preMarketPrice : isPost ? holding.postMarketPrice : null
  const extChange = isPre ? holding.preMarketChange : isPost ? holding.postMarketChange : null

  const cnName = getChineseName(holding.symbol) || holding.name

  return (
    <div
      className="group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 transition-premium hover:bg-white/5 active:bg-white/[0.08]"
      onClick={onClick}
    >
      {/* 股票代码 + 名称 */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="font-label-mono text-xs md:text-sm text-primary shrink-0">{holding.symbol}</span>
        {(isPre || isPost) && (
          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 font-label-mono text-[9px] uppercase text-amber-400 shrink-0">
            {isPre ? '盘前' : '盘后'}
          </span>
        )}
        <span className="font-body-md text-xs text-text-muted truncate hidden sm:inline">{cnName}</span>
      </div>

      {/* 占净值比例（移动端隐藏） */}
      <span className="font-label-mono text-[10px] text-text-muted/60 hidden md:block w-14 text-right shrink-0">
        {holding.weight.toFixed(2)}%
      </span>

      {/* 价格 + 涨跌幅 */}
      <div className="text-right shrink-0 min-w-[70px] md:min-w-[90px]">
        <div className={`font-label-mono text-xs md:text-sm ${changeColor}`}>{fmtPrice(holding.price)}</div>
        <div className={`font-label-mono text-[10px] md:text-xs ${changeColor}`}>
          {arrow} {holding.changePercent >= 0 ? '+' : ''}{holding.changePercent.toFixed(2)}%
        </div>
      </div>

      {/* 盘前/盘后价格（桌面端显示） */}
      {extPrice != null && extChange != null && (
        <div className="text-right hidden md:block shrink-0 min-w-[70px]">
          <div className={`font-label-mono text-xs ${extChange >= 0 ? 'text-red-500' : 'text-green-600'}`}>{fmtPrice(extPrice)}</div>
          <div className={`font-label-mono text-[10px] ${extChange >= 0 ? 'text-red-500' : 'text-green-600'}`}>
            {extChange >= 0 ? '+' : ''}{extChange.toFixed(2)}
          </div>
        </div>
      )}

      {/* 占净值比例（移动端替代显示） */}
      <span className="font-label-mono text-[10px] text-text-muted/60 md:hidden w-10 text-right shrink-0">
        {holding.weight.toFixed(1)}%
      </span>
    </div>
  )
}

const FundCard = ({ fund, onSelectStock, onDeleteFund }: Props) => {
  const [expanded, setExpanded] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const holdings = fund.holdingQuotes || []
  const displayHoldings = expanded ? holdings : holdings.slice(0, INITIAL_DISPLAY_COUNT)
  const hasMore = holdings.length > INITIAL_DISPLAY_COUNT
  const changeColor = (fund.weightedChangePercent ?? 0) >= 0 ? 'text-red-500' : 'text-green-600'
  const changeArrow = (fund.weightedChangePercent ?? 0) >= 0 ? '▲' : '▼'

  return (
    <div className="surface-panel rounded-2xl overflow-hidden">
      {/* ── 组标题区域 ── */}
      <div
        className="select-none px-4 md:px-5 pt-4 pb-3 cursor-pointer transition-premium hover:bg-white/[0.03] active:bg-white/[0.06]"
        onClick={() => setExpanded(!expanded)}
        onContextMenu={(e) => { e.preventDefault(); setShowDeleteConfirm(true) }}
      >
        {/* 第一行：基金名称 + 折叠图标 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="font-label-mono text-xs text-primary shrink-0">{fund.code}</span>
            <h3 className="font-headline-md text-sm md:text-base text-on-surface truncate">{fund.name}</h3>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
            className="rounded-full p-1 text-text-muted hover:bg-white/6 hover:text-on-surface transition-premium shrink-0"
          >
            <Icon name={expanded ? 'chevron_left' : 'chevron_right'} className="text-lg" />
          </button>
        </div>

        {/* 第二行：基金信息标签 */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
          {fund.quarter && (
            <span className="font-label-mono text-[10px] text-primary/70 bg-primary/8 rounded-full px-2 py-0.5">
              {fund.quarter}
            </span>
          )}
          {fund.size && (
            <span className="font-body-md text-[10px] text-text-muted">
              规模{fund.size}
            </span>
          )}
          {(fund.weightedChangePercent != null && fund.weightedChangePercent !== 0) && (
            <span className={`font-label-mono text-xs ${changeColor} ml-auto`}>
              本组 {changeArrow} {fund.weightedChangePercent >= 0 ? '+' : ''}{fund.weightedChangePercent.toFixed(2)}%
            </span>
          )}
        </div>

        {/* 第三行：涨跌汇总 */}
        <div className="flex items-center gap-2 mt-1">
          <span className="font-body-md text-[10px] text-text-muted">
            ▲{fund.totalUpCount ?? 0} ▼{fund.totalDownCount ?? 0}
          </span>
        </div>

        {/* 删除按钮（桌面 hover / 移动端常显） */}
        <div className="flex justify-end -mt-6">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true) }}
            className="opacity-0 group-hover:opacity-100 md:opacity-0 p-1.5 rounded-full text-text-muted hover:text-error hover:bg-error/10 transition-premium"
            title="删除此基金"
          >
            <Icon name="close" className="text-base" />
          </button>
        </div>
      </div>

      {/* ── 持仓列表 ── */}
      {expanded && (
        <div className="border-t border-border-subtle">
          {/* 表头 */}
          <div className="hidden md:flex items-center px-3 py-1.5 text-[9px] text-text-muted/50 font-label-mono uppercase tracking-wider">
            <div className="flex-1 pl-3">代码</div>
            <div className="w-14 text-right">占比</div>
            <div className="w-[90px] text-right">价格</div>
            <div className="w-[70px] text-right">盘前/后</div>
          </div>

          {/* 行 */}
          <div className="divide-y divide-border-subtle/50">
            {displayHoldings.map((h) => (
              <HoldingRow key={h.symbol} holding={h} onClick={() => onSelectStock(h)} />
            ))}
          </div>

          {/* 展开/折叠 */}
          {hasMore && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setExpanded(false) }}
              className="w-full py-2.5 text-center font-body-md text-xs text-text-muted hover:text-on-surface transition-premium border-t border-border-subtle/50"
            >
              {expanded ? '收起' : `展开全部 (${holdings.length}只)`}
            </button>
          )}
        </div>
      )}

      {/* 未展开时显示前几条预览 */}
      {!expanded && holdings.length > 0 && (
        <div className="border-t border-border-subtle divide-y divide-border-subtle/30">
          {displayHoldings.map((h) => (
            <HoldingRow key={h.symbol} holding={h} onClick={() => onSelectStock(h)} />
          ))}
          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="w-full py-2 text-center font-body-md text-[11px] text-text-muted hover:text-on-surface transition-premium"
            >
              点击展开全部 ({holdings.length}只)
            </button>
          )}
        </div>
      )}

      {/* ── 删除确认对话框 ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
          <div className="surface-panel-strong rounded-2xl p-5 max-w-xs mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h4 className="font-headline-md text-base text-on-surface mb-2">删除基金</h4>
            <p className="font-body-md text-sm text-text-muted mb-4">确定要删除「{fund.name}」及其持仓数据吗？</p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-full px-4 py-2 font-body-md text-xs text-text-muted hover:bg-white/6 transition-premium"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => { onDeleteFund(fund.code); setShowDeleteConfirm(false) }}
                className="rounded-full px-4 py-2 font-body-md text-xs text-white bg-error hover:opacity-90 transition-premium"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FundCard
