/**
 * 基金数据管理服务
 *
 * 职责：
 * 1. 管理基金列表的 localStorage 持久化
 * 2. 调用后端 API 获取基金持仓数据
 * 3. 调用现有行情接口获取持仓股实时报价
 * 4. 合并数据供组件使用
 */

import { FundInfo, FundHolding, FundHoldingQuote, FundWithQuotes, YahooQuoteResult } from './types'

const STORAGE_KEY = 'hub:fund-watchlist'

// ── localStorage 读写 ──

export function readLocalFunds(): FundInfo[] {
  try {
    const raw = globalThis.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function writeLocalFunds(funds: FundInfo[]) {
  try {
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(funds))
  } catch { /* 静默 */ }
}

// ── API 调用 ──

/** 从后端代理接口获取基金持仓数据 */
export async function fetchFundFromApi(code: string): Promise<FundInfo | null> {
  try {
    const res = await fetch('/api/stock/fund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    const json = await res.json()
    if (!json.ok) {
      throw new Error(json.error?.message || '获取基金数据失败')
    }
    const { fund } = json.data
    return {
      code: fund.code,
      name: fund.name,
      size: fund.size,
      quarter: fund.quarter,
      type: fund.type,
      topHoldings: fund.holdings,
      updatedAt: new Date().toISOString(),
    }
  } catch (err) {
    console.error('[fundDataService] fetchFundFromApi error:', err)
    return null
  }
}

/** 获取所有持仓股的实时行情 */
export async function fetchHoldingsQuotes(holdings: FundHolding[]): Promise<FundHoldingQuote[]> {
  if (holdings.length === 0) return []

  const symbols = holdings.map((h) => h.symbol)
  try {
    const res = await fetch('/api/stock/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbols }),
    })
    const json = await res.json()
    if (!json.ok) {
      console.error('[fundDataService] quote API error:', json.error)
      return []
    }

    const results = (json.data?.quoteResponse?.result ?? []) as YahooQuoteResult['quoteResponse']['result']
    const quoteMap = new Map(results.map((q) => [q.symbol, q]))

    return holdings.map((h) => {
      const q = quoteMap.get(h.symbol)
      if (!q) {
        return {
          ...h,
          price: 0,
          change: 0,
          changePercent: 0,
          marketState: 'CLOSED' as const,
        }
      }
      return {
        ...h,
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
      }
    })
  } catch {
    console.error('[fundDataService] fetchHoldingsQuotes network error')
    return []
  }
}

/** 合并基金基础信息与实时行情 */
export function mergeFundWithQuotes(fund: FundInfo, quotes: FundHoldingQuote[]): FundWithQuotes {
  const holdingQuotes = fund.topHoldings.map((h) => {
    return quotes.find((q) => q.symbol === h.symbol) || {
      ...h,
      price: 0,
      change: 0,
      changePercent: 0,
      marketState: 'CLOSED' as const,
    }
  })

  // 计算汇总：加权平均涨跌幅、上涨/下跌数量
  let weightedSum = 0
  let totalWeight = 0
  let upCount = 0
  let downCount = 0
  let _unchangedCount = 0

  for (const hq of holdingQuotes) {
    if (hq.changePercent !== 0 && hq.weight > 0) {
      weightedSum += hq.changePercent * hq.weight
      totalWeight += hq.weight
    }
    if (hq.changePercent > 0) upCount++
    else if (hq.changePercent < 0) downCount++
    else _unchangedCount++
  }

  return {
    ...fund,
    holdingQuotes,
    weightedChangePercent: totalWeight > 0 ? weightedSum / totalWeight : 0,
    totalUpCount: upCount,
    totalDownCount: downCount,
  }
}

/** 获取所有基金的持仓股行情数据 */
export async function fetchAllFundQuotes(funds: FundInfo[]): Promise<FundWithQuotes[]> {
  // 收集所有唯一的股票代码
  const allSymbols = new Set<string>()
  for (const fund of funds) {
    for (const h of fund.topHoldings) {
      allSymbols.add(h.symbol)
    }
  }

  if (allSymbols.size === 0) {
    return funds.map((f) => mergeFundWithQuotes(f, []))
  }

  const allHoldings: FundHolding[] = Array.from(allSymbols).map((s) => ({ symbol: s, name: '', weight: 0 }))
  const quotes = await fetchHoldingsQuotes(allHoldings)

  return funds.map((f) => {
    const fundQuotes = quotes.filter((q) => f.topHoldings.some((h) => h.symbol === q.symbol))
    return mergeFundWithQuotes(f, fundQuotes)
  })
}
