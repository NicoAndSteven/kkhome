import { json, options } from '../../_shared/api.js'

/**
 * Cloudflare AI 翻译端点
 * POST /api/news/translate
 * Body: { text: string, sourceLang?: string, targetLang: string }
 */
export const onRequestOptions = (context) => options(context)

export const onRequestPost = async ({ request, env }) => {
  let body
  try {
    body = await request.json()
  } catch {
    return json(
      { ok: false, error: { code: 'invalid_json', message: 'Invalid JSON body' } },
      { status: 400 },
      { request, env },
    )
  }

  const text = String(body.text ?? '').trim()
  if (!text) {
    return json(
      { ok: false, error: { code: 'missing_text', message: 'text is required' } },
      { status: 400 },
      { request, env },
    )
  }

  if (!env.AI) {
    return json(
      { ok: false, error: { code: 'ai_unavailable', message: 'AI binding is not configured' } },
      { status: 503 },
      { request, env },
    )
  }

  const targetLang = body.targetLang ?? 'zh'
  const sourceLang = body.sourceLang ?? undefined // auto-detect if omitted

  try {
    const result = await env.AI.run('@cf/meta/m2m100-1.2b', {
      text,
      source_lang: sourceLang,
      target_lang: targetLang,
    })

    const translated = result?.translated_text ?? result?.translation ?? result?.text ?? ''

    return json({
      ok: true,
      data: {
        original: text,
        translated,
        sourceLang: sourceLang ?? 'auto',
        targetLang,
      },
    }, { status: 200 }, { request, env })
  } catch (err) {
    return json(
      { ok: false, error: { code: 'translation_failure', message: err instanceof Error ? err.message : 'Unknown error' } },
      { status: 502 },
      { request, env },
    )
  }
}
