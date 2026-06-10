/* global fetch */

import { fail, ok, options } from '../../_shared/api.js'

const YAHOO_SEARCH_URL = 'https://query1.finance.yahoo.com/v1/finance/search'

export const onRequestOptions = (context) => options(context)

export const onRequestGet = async ({ request, env }) => {
  const url = new URL(request.url)
  const query = url.searchParams.get('q') ?? ''

  if (!query.trim()) {
    return fail('missing_query', 'q query param is required', 400, { request, env })
  }

  const yahooUrl = `${YAHOO_SEARCH_URL}?q=${encodeURIComponent(query)}`

  try {
    const response = await fetch(yahooUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })

    if (!response.ok) {
      return fail('upstream_error', `Yahoo API returned ${response.status}`, 502, { request, env })
    }

    const data = await response.json()
    return ok({ searchResult: data }, { request, env })
  } catch (error) {
    return fail('fetch_failed', error instanceof Error ? error.message : 'Failed to search stocks', 502, { request, env })
  }
}
