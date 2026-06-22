import { fail, ok, options } from '../../_shared/api.js'
import { fetchYahoo } from '../../_shared/yahooFinance.js'

export const onRequestOptions = (context) => options(context)

export const onRequestGet = async ({ request }) => {
  const url = new URL(request.url)
  const symbol = url.searchParams.get('symbol')?.toUpperCase() ?? ''
  const range = url.searchParams.get('range') ?? '1d'
  const interval = url.searchParams.get('interval') ?? '5m'

  if (!symbol) {
    return fail('missing_symbol', 'symbol query param is required', 400)
  }

  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${encodeURIComponent(interval)}&range=${encodeURIComponent(range)}&includePrePost=true`

  try {
    const response = await fetchYahoo(yahooUrl)
    if (!response.ok) {
      return fail('upstream_error', `Yahoo API returned ${response.status}`, 502)
    }
    const data = await response.json()
    return ok({ chart: data.chart })
  } catch (error) {
    return fail('fetch_failed', error instanceof Error ? error.message : '获取图表数据失败', 502)
  }
}
