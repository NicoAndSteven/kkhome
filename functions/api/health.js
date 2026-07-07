import { bindingStatus, ok, options } from '../_shared/api.js'

const plannedBindings = [
  'WISHES_DB',
  'PARTY_ROOMS',
  'HUB_KV',
  'HUB_BUCKET',
  'HUB_VECTORIZE',
  'HUB_QUEUE',
  'AI',
]

export const onRequestOptions = (context) => options(context)

export const onRequestGet = ({ request, env }) => {
  const bindings = bindingStatus(env, plannedBindings)

  return ok({
    service: 'kkhome-cloudflare-hub',
    platform: 'cloudflare-pages-functions',
    bindings,
    features: {
      wishes: bindings.WISHES_DB,
      partyContent: bindings.WISHES_DB,
      partyRooms: bindings.PARTY_ROOMS,
      featureFlags: bindings.HUB_KV,
      fileArtifacts: bindings.HUB_BUCKET,
      semanticSearch: bindings.HUB_VECTORIZE && bindings.AI,
      asyncJobs: bindings.HUB_QUEUE,
    },
  }, { request, env })
}
