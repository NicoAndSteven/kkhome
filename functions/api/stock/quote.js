/* global fetch */

import { fail, ok, options } from '../../_shared/api.js'

const YAHOO_QUOTE_URL = 'https://query1.finance.yahoo.com/v7/finance/quote'

export const onRequestOptions = (context) => options(context)

export const onRequestPost = async ({ request, env }) => {
  let body
  try {
    body = await request.json()
  } catch {
    return fail('invalid_json', 'Invalid JSON body', 400, { request, env })
  }

  const symbols = Array.isArray(body.symbols) ? body.symbols.map(String) : []
  if (symbols.length === 0) {
    return fail('missing_symbols', 'symbols array is required', 400, { request, env })
  }

  const url = `${YAHOO_QUOTE_URL}?symbols=${symbols.join(',')}`

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })

    if (!response.ok) {
      return fail('upstream_error', `Yahoo API returned ${response.status}`, 502, { request, env })
    }

    const data = await response.json()
    return ok({ quoteResponse: data.quoteResponse }, { request, env })
  } catch (error) {
    return fail('fetch_failed', error instanceof Error ? error.message : 'Failed to fetch quotes', 502, { request, env })
  }
}
