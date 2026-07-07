import { fail, ok, options } from '../../../_shared/api.js'
import { getPartyRoomSummary } from '../../../_shared/partyRooms.js'

const requireRoomsNamespace = (env) => env.PARTY_ROOMS ?? null

export const onRequestOptions = (context) => options(context)

export const onRequestGet = async ({ request, env, params }) => {
  const rooms = requireRoomsNamespace(env)
  if (!rooms) return fail('binding_unavailable', 'PARTY_ROOMS is not configured', 503, { request, env })

  try {
    return ok(await getPartyRoomSummary(rooms, params.code), { request, env })
  } catch (error) {
    const status = error?.status === 404 ? 404 : 400
    return fail('room_unavailable', error.message || 'Room unavailable', status, { request, env })
  }
}
