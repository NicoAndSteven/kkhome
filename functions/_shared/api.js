/* global Response */

export const createCorsHeaders = (request, env = {}) => {
  const allowedOrigin = env.ALLOWED_ORIGIN
  const requestOrigin = request?.headers.get('Origin') ?? ''

  return {
    'Access-Control-Allow-Origin': allowedOrigin && requestOrigin === allowedOrigin ? allowedOrigin : '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export const createMeta = (extra = {}) => ({
  timestamp: new Date().toISOString(),
  ...extra,
})

export const json = (body, init = {}, context = {}) => new Response(JSON.stringify(body), {
  ...init,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    ...createCorsHeaders(context.request, context.env ?? {}),
    ...(init.headers || {}),
  },
})

export const ok = (data = {}, context = {}, init = {}) => json({
  ok: true,
  data,
  meta: createMeta(context.meta),
}, init, context)

export const fail = (code, message, status = 400, context = {}, details) => json({
  ok: false,
  error: {
    code,
    message,
    ...(details ? { details } : {}),
  },
  meta: createMeta(context.meta),
}, { status }, context)

export const options = (context = {}) => new Response(null, {
  headers: createCorsHeaders(context.request, context.env ?? {}),
})

export const bindingStatus = (env = {}, bindings = []) => Object.fromEntries(
  bindings.map((binding) => [binding, Boolean(env[binding])]),
)
