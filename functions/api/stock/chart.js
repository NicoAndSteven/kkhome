/* global fetch */

import { fail, ok, options } from '../../_shared/api.js'

const YAHOO_CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart'

export const onRequestOptions = (context) => options(context)

export const onRequestGet = async ({ request, env }) => {
  const url = new URL(request.url)
  const symbol = url.searchParams.get('symbol')?.toUpperCase() ?? ''
  const range = url.searchParams.get('range') ?? ''
  const interval = url.searchParams.get('interval') ?? ''

  if (!symbol) {
    return fail('missing_symbol', 'symbol query param is required', 400, { request, env })
  }

  const yahooUrl = `${YAHOO_CHART_URL}/${encodeURIComponent(symbol)}?interval=${encodeURIComponent(interval)}&range=${encodeURIComponent(range)}&includePrePost=true`

  try {
    const response = await fetch(yahooUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })

    if (!response.ok) {
      return fail('upstream_error', `Yahoo API returned ${response.status}`, 502, { request, env })
    }

    const data = await response.json()
    return ok({ chart: data.chart }, { request, env })
  } catch (error) {
    return fail('fetch_failed', error instanceof Error ? error.message : 'Failed to fetch chart data', 502, { request, env })
  }
}
