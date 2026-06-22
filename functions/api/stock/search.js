import { fail, ok, options } from '../../_shared/api.js'
import { fetchYahoo } from '../../_shared/yahooFinance.js'

export const onRequestOptions = (context) => options(context)

export const onRequestGet = async ({ request }) => {
  const url = new URL(request.url)
  const query = url.searchParams.get('q') ?? ''

  if (!query.trim()) {
    return fail('missing_query', '搜索关键词不能为空', 400)
  }

  const yahooUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}`

  try {
    const response = await fetchYahoo(yahooUrl)
    if (!response.ok) {
      return fail('upstream_error', `Yahoo API returned ${response.status}`, 502)
    }
    const data = await response.json()
    return ok({ searchResult: data })
  } catch (error) {
    return fail('fetch_failed', error instanceof Error ? error.message : '搜索失败', 502)
  }
}
