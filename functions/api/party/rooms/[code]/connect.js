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

  // HACK: new Request(url, originalRequest) drops the Upgrade: websocket header
  // because it's a "forbidden header" in the Fetch API spec. Pass headers manually
  // via a plain object so the DO sees the WebSocket upgrade intent.
  return stub.fetch(`https://party.internal/rooms/connect?playerId=${encodeURIComponent(url.searchParams.get('playerId') || '')}&connectToken=${encodeURIComponent(url.searchParams.get('connectToken') || '')}`, {
    method: request.method,
    headers: {
      'Upgrade': 'websocket',
      'Connection': 'Upgrade',
      'Sec-WebSocket-Key': request.headers.get('Sec-WebSocket-Key') || '',
      'Sec-WebSocket-Version': request.headers.get('Sec-WebSocket-Version') || '13',
    },
  })
}
