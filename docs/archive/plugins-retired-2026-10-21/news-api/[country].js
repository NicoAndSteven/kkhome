import { json, options } from '../../_shared/api.js'

const API_ORIGIN = 'https://www.thehear.org'

export const onRequestOptions = (context) => options(context)

export const onRequestGet = async ({ request, env, params }) => {
  const { country } = params

  if (!country) {
    return json(
      { ok: false, error: { code: 'missing_country', message: 'Country parameter is required' } },
      { status: 400 },
      { request, env },
    )
  }

  const upstream = `${API_ORIGIN}/api/country-view/${encodeURIComponent(country)}`

  try {
    const upstreamRes = await fetch(upstream, {
      headers: { 'Accept': 'application/json' },
    })

    if (!upstreamRes.ok) {
      return json(
        { ok: false, error: { code: 'upstream_error', message: `Upstream returned ${upstreamRes.status}` } },
        { status: upstreamRes.status },
        { request, env },
      )
    }

    const body = await upstreamRes.json()

    return json({ ok: true, data: body }, { status: 200 }, { request, env })
  } catch (err) {
    return json(
      { ok: false, error: { code: 'proxy_failure', message: err instanceof Error ? err.message : 'Unknown error' } },
      { status: 502 },
      { request, env },
    )
  }
}
