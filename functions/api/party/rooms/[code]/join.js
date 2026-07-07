import { fail, ok, options } from '../../../_shared/api.js'
import { joinPartyRoom } from '../../../_shared/partyRooms.js'

const requireRoomsNamespace = (env) => env.PARTY_ROOMS ?? null

export const onRequestOptions = (context) => options(context)

export const onRequestPost = async ({ request, env, params }) => {
  const rooms = requireRoomsNamespace(env)
  if (!rooms) return fail('binding_unavailable', 'PARTY_ROOMS is not configured', 503, { request, env })

  const body = await request.json().catch(() => null)
  if (!body) return fail('invalid_json', 'Invalid JSON body', 400, { request, env })

  try {
    return ok(await joinPartyRoom(rooms, params.code, body), { request, env })
  } catch (error) {
    const status = error?.status === 404 || error?.status === 409 ? error.status : 400
    return fail('join_failed', error.message || 'Join failed', status, { request, env })
  }
}
