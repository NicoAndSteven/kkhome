import { fail, ok, options } from '../../_shared/api.js'
import { fetchQuotes, refreshAuth } from '../../_shared/yahooFinance.js'

export const onRequestOptions = (context) => options(context)

export const onRequestPost = async ({ request }) => {
  let body
  try {
    body = await request.json()
  } catch {
    return fail('invalid_json', 'Invalid JSON body', 400)
  }

  const symbols = Array.isArray(body.symbols) ? body.symbols.map(String) : []
  if (symbols.length === 0) {
    return fail('missing_symbols', 'symbols array is required', 400)
  }

  try {
    const data = await fetchQuotes(symbols)
    if (!data?.quoteResponse?.result?.length) {
      // 尝试刷新后重试
      const retry = await fetchQuotes(symbols)
      return ok({ quoteResponse: retry.quoteResponse })
    }
    return ok({ quoteResponse: data.quoteResponse })
  } catch (error) {
    // 最后尝试一次刷新认证
    try {
      await refreshAuth()
      const retry = await fetchQuotes(symbols)
      return ok({ quoteResponse: retry.quoteResponse })
    } catch {
      return fail('fetch_failed', '无法获取股票数据，请稍后重试', 502)
    }
  }
}
