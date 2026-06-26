/* global fetch */
/**
 * Yahoo Finance API 认证代理
 *
 * Yahoo Finance v7/v8 API 需要 crumb token + session cookie 才能正常返回数据。
 * 该模块封装了获取 cookie/crumb 和发起认证请求的逻辑。
 */

/** 模块级 crumb 缓存（Cloudflare 单 isolate 内跨请求复用） */
let crumbCache = { crumb: '', cookie: '', expiresAt: 0 }
const CRUMB_TTL_MS = 3600_000 // 1 小时刷新一次

/**
 * 从 fc.yahoo.com 获取 session cookie
 */
async function fetchYahooCookie() {
  const resp = await fetch('https://fc.yahoo.com/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CloudflareWorker/1.0)' },
  })
  const setCookie = resp.headers.get('set-cookie') || ''
  // 提取完整 cookie 字符串（取 A1=... 和 A3=... 部分）
  const parts = setCookie.split(',').map(s => s.split(';')[0].trim()).filter(Boolean)
  return parts.join('; ')
}

/**
 * 使用 cookie 从 query2 获取 crumb
 */
async function fetchYahooCrumb(cookie) {
  const resp = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; CloudflareWorker/1.0)',
      'Cookie': cookie,
    },
  })
  if (!resp.ok) throw new Error(`Crumb API returned ${resp.status}`)
  return resp.text()
}

/**
 * 确保 crumb 和 cookie 有效，必要时刷新
 */
async function ensureAuth() {
  if (crumbCache.crumb && crumbCache.cookie && Date.now() < crumbCache.expiresAt) {
    return { crumb: crumbCache.crumb, cookie: crumbCache.cookie }
  }

  const cookie = await fetchYahooCookie()
  const crumb = await fetchYahooCrumb(cookie)
  crumbCache = { crumb, cookie, expiresAt: Date.now() + CRUMB_TTL_MS }
  return { crumb, cookie }
}

/**
 * 对 Yahoo Finance URL 发起认证请求
 * @param {string} url - Yahoo Finance API URL
 * @param {object} [fetchOpts] - 额外的 fetch 参数
 * @returns {Promise<Response>}
 */
export async function fetchYahoo(url, fetchOpts = {}) {
  const { crumb, cookie } = await ensureAuth()
  const separator = url.includes('?') ? '&' : '?'
  const authedUrl = `${url}${separator}crumb=${encodeURIComponent(crumb)}`

  return fetch(authedUrl, {
    ...fetchOpts,
    headers: {
      ...fetchOpts.headers,
      'User-Agent': 'Mozilla/5.0 (compatible; CloudflareWorker/1.0)',
      'Cookie': cookie,
    },
  })
}

/**
 * 强制刷新 crumb（当请求返回 401/403 时调用）
 */
export async function refreshAuth() {
  crumbCache = { crumb: '', cookie: '', expiresAt: 0 }
  return ensureAuth()
}

/**
 * 用 Yahoo Finance API 查询多个 symbols 的实时报价
 * 优先使用 v7 quote 批量端点，失败时降级到 v8/chart 逐个查询
 * @param {string[]} symbols
 * @returns {Promise<object>} quoteResponse 对象
 */
export async function fetchQuotes(symbols) {
  if (symbols.length === 0) return { quoteResponse: { result: [] } }

  try {
    // 尝试 v7 批量端点
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}`
    const resp = await fetchYahoo(url)
    if (!resp.ok) throw new Error(`v7 quote API returned ${resp.status}`)
    const data = await resp.json()
    if (data?.quoteResponse?.result?.length) return data
    // 如果是空结果（可能 v7 受限），降级到 v8
    console.warn('v7 quote returned empty results, falling back to v8')
  } catch (err) {
    console.warn('v7 quote failed:', err.message, '- falling back to v8')
    // 尝试刷新 crumb 后重试一次
    try {
      const { crumb, cookie } = await refreshAuth()
      const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}&crumb=${encodeURIComponent(crumb)}`
      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CloudflareWorker/1.0)',
          'Cookie': cookie,
        },
      })
      if (resp.ok) {
        const data = await resp.json()
        if (data?.quoteResponse?.result?.length) return data
      }
    } catch { /* 静默处理，降级到 v8 */ }
  }

  // 降级：用 v8/chart 逐个拉取
  const results = []
  for (const symbol of symbols) {
    try {
      const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=5m&includePrePost=true`
      const resp = await fetchYahoo(chartUrl)
      if (!resp.ok) continue
      const data = await resp.json()
      const meta = data?.chart?.result?.[0]?.meta
      if (meta) {
        const quote = data.chart.result[0].indicators?.quote?.[0]
        const lastIdx = (meta.tradingPeriods?.[0]?.length ?? 1) - 1
        results.push({
          symbol: meta.symbol,
          shortName: meta.longName || meta.symbol,
          regularMarketPrice: meta.regularMarketPrice ?? meta.previousClose ?? 0,
          regularMarketChange: meta.chartPreviousClose ? (meta.regularMarketPrice - meta.chartPreviousClose) : 0,
          regularMarketChangePercent: meta.chartPreviousClose ? ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100 : 0,
          regularMarketPreviousClose: meta.previousClose ?? meta.chartPreviousClose ?? 0,
          regularMarketOpen: meta.regularMarketOpen ?? 0,
          regularMarketDayHigh: meta.regularMarketDayHigh ?? 0,
          regularMarketDayLow: meta.regularMarketDayLow ?? 0,
          regularMarketVolume: quote?.volume?.[lastIdx] ?? 0,
          marketCap: meta.marketCap ?? 0,
          fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? 0,
          fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? 0,
          marketState: meta.marketState ?? 'REGULAR',
          preMarketPrice: meta.preMarketPrice ?? null,
          preMarketChange: meta.preMarketChange ?? null,
          preMarketChangePercent: meta.preMarketChangePercent ?? null,
          postMarketPrice: meta.postMarketPrice ?? null,
          postMarketChange: meta.postMarketChange ?? null,
          postMarketChangePercent: meta.postMarketChangePercent ?? null,
        })
      }
    } catch {
      // 单个 symbol 失败不影响其他
    }
  }

  return { quoteResponse: { result: results } }
}
