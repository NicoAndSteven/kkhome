/* global Request */

export const onRequestGet = async ({ request, env, params }) => {
  const rooms = env.PARTY_ROOMS ?? null
  if (!rooms) {
    return new Response(JSON.stringify({
      ok: false,
      error: {
        code: 'binding_unavailable',
        message: 'PARTY_ROOMS is not configured',
      },
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    })
  }

  const code = String(params.code || '').toUpperCase()
  const id = rooms.idFromName(code)
  const stub = rooms.get(id)
  const url = new URL(request.url)
  const targetUrl = `https://party.internal/rooms/connect?playerId=${encodeURIComponent(url.searchParams.get('playerId') || '')}&connectToken=${encodeURIComponent(url.searchParams.get('connectToken') || '')}`

  return stub.fetch(new Request(targetUrl, request))
}
