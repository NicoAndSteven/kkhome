// ── Yahoo Finance API response types ──

export interface YahooQuoteResult {
  quoteResponse: {
    result: YahooQuote[]
    error: unknown | null
  }
}

export interface YahooQuote {
  symbol: string
  shortName?: string
  longName?: string
  regularMarketPrice?: number
  regularMarketChange?: number
  regularMarketChangePercent?: number
  preMarketPrice?: number
  preMarketChange?: number
  preMarketChangePercent?: number
  postMarketPrice?: number
  postMarketChange?: number
  postMarketChangePercent?: number
  regularMarketPreviousClose?: number
  regularMarketOpen?: number
  regularMarketDayHigh?: number
  regularMarketDayLow?: number
  regularMarketVolume?: number
  marketState?: 'PRE' | 'REGULAR' | 'POST' | 'CLOSED'
  marketCap?: number
  fiftyTwoWeekHigh?: number
  fiftyTwoWeekLow?: number
}

export interface YahooSearchQuote {
  symbol: string
  shortname?: string
  longname?: string
  exchange: string
  quoteType: string
  score?: number
  typeDisp?: string
}

export interface WatchlistStock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  preMarketPrice?: number
  preMarketChange?: number
  preMarketChangePercent?: number
  postMarketPrice?: number
  postMarketChange?: number
  postMarketChangePercent?: number
  marketState: YahooQuote['marketState']
  previousClose: number
  open: number
  dayHigh: number
  dayLow: number
  volume: number
  marketCap?: number
  high52w?: number
  low52w?: number
}

export interface ChartDataPoint {
  time: string | number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export type IntervalRange = '1D' | '5D' | '1M' | '3M' | '1Y' | '5Y'

export const INTERVAL_MAP: Record<IntervalRange, { interval: string; range: string }> = {
  '1D': { interval: '1m', range: '1d' },
  '5D': { interval: '5m', range: '5d' },
  '1M': { interval: '15m', range: '1mo' },
  '3M': { interval: '1d', range: '3mo' },
  '1Y': { interval: '1d', range: '1y' },
  '5Y': { interval: '1wk', range: '5y' },
}

// ── Fund (QDII基金持仓) types ──

/** 单只基金持仓的股票信息（从天天基金解析） */
export interface FundHolding {
  symbol: string        // 股票代码（美股为实际 ticker）
  name: string          // 股票中文名称
  weight: number        // 占净值百分比（如 9.87）
}

/** 基金基本信息 */
export interface FundInfo {
  code: string          // 基金代码
  name: string          // 基金名称
  size?: string         // 基金规模（如 "13.94亿"）
  quarter?: string      // 数据所属季度（如 "2026Q1"）
  type?: string         // 基金类型
  topHoldings: FundHolding[]
  updatedAt: string     // 更新时间 ISO 字符串
}

/** 带入实时行情数据的持仓股 */
export interface FundHoldingQuote extends FundHolding {
  price: number
  change: number
  changePercent: number
  preMarketPrice?: number
  preMarketChange?: number
  preMarketChangePercent?: number
  postMarketPrice?: number
  postMarketChange?: number
  postMarketChangePercent?: number
  marketState?: YahooQuote['marketState']
  previousClose?: number
}

/** 基金 + 持仓实时数据 */
export interface FundWithQuotes extends FundInfo {
  holdingQuotes: FundHoldingQuote[]
  // 汇总信息（由组件计算）
  totalUpCount?: number
  totalDownCount?: number
  weightedChangePercent?: number
}

/** 响应格式：后端 /api/stock/fund-info 返回 */
export interface FundApiResponse {
  fund: {
    code: string
    name: string
    size?: string
    quarter?: string
    type?: string
    holdings: FundHolding[]
  }
}
