import { fail, ok, options } from '../../_shared/api.js'
import { createPartyRoom } from '../../_shared/partyRooms.js'

const requireRoomsNamespace = (env) => env.PARTY_ROOMS ?? null

export const onRequestOptions = (context) => options(context)

export const onRequestPost = async ({ request, env }) => {
  const rooms = requireRoomsNamespace(env)
  if (!rooms) return fail('binding_unavailable', 'PARTY_ROOMS is not configured', 503, { request, env })

  const body = await request.json().catch(() => null)
  if (!body) return fail('invalid_json', 'Invalid JSON body', 400, { request, env })

  try {
    return ok(await createPartyRoom(rooms, body), { request, env }, { status: 201 })
  } catch (error) {
    const status = error?.status === 409 ? 409 : 400
    return fail('invalid_room', error.message || 'Invalid room request', status, { request, env })
  }
}
