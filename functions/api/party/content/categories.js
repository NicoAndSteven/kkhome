import { ok, options } from '../../../_shared/api.js'
import { listUndercoverCategories, listTruthOrDareCategories, listIntensityOptions } from '../../../_shared/partyRoomContent.js'

const requireDb = (env) => env.WISHES_DB ?? null

export const onRequestOptions = (context) => options(context)

export const onRequestGet = async ({ request, env }) => {
  const db = requireDb(env)
  if (!db) return new Response(JSON.stringify({
    ok: false,
    error: { code: 'binding_unavailable', message: 'WISHES_DB is not configured' },
  }), { status: 503, headers: { 'Content-Type': 'application/json; charset=utf-8' } })

  const [undercover, truthOrDare, intensities] = await Promise.all([
    listUndercoverCategories(db),
    listTruthOrDareCategories(db),
    Promise.resolve(listIntensityOptions()),
  ])

  return ok({
    undercover,
    truthOrDare,
    intensities,
  }, { request, env })
}
