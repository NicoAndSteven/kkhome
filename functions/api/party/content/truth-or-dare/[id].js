import { fail, ok, options } from '../../../../_shared/api.js'
import { isAdmin } from '../../../../_shared/admin.js'
import { updatePartyContent } from '../../../../_shared/partyContent.js'

const requireDb = (env) => env.WISHES_DB ?? null

export const onRequestOptions = (context) => options(context)

export const onRequestPut = async ({ request, env, params }) => {
  const db = requireDb(env)
  if (!db) return fail('binding_unavailable', 'WISHES_DB is not configured', 503, { request, env })
  if (!isAdmin(request, env)) return fail('unauthorized', '需要管理员权限', 403, { request, env })

  const body = await request.json().catch(() => null)
  if (!body) return fail('invalid_json', 'Invalid JSON body', 400, { request, env })

  try {
    return ok(await updatePartyContent(db, 'truth-or-dare', params.id, body), { request, env })
  } catch (error) {
    return fail(
      error.status === 404 ? 'not_found' : 'invalid_content',
      error.message || 'Invalid content',
      error.status || 400,
      { request, env },
    )
  }
}
