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
  time: string
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
