import { json, options } from '../../_shared/api.js'

export const onRequestOptions = (context) => options(context)

export const onRequestGet = async ({ request, env }) => {
  const url = new URL(request.url)
  const target = url.searchParams.get('url')

  if (!target) {
    return json(
      { ok: false, error: { code: 'missing_url', message: 'url parameter is required' } },
      { status: 400 },
      { request, env },
    )
  }

  try {
    const upstreamRes = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; KKHome/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })

    if (!upstreamRes.ok) {
      return json(
        { ok: false, error: { code: 'upstream_error', message: `Upstream returned ${upstreamRes.status}` } },
        { status: upstreamRes.status },
        { request, env },
      )
    }

    const html = await upstreamRes.text()

    // ── 提取标题 ──
    const titleMatch = html.match(/<title[^>]*>([^<]+?)<\/title>/i)
    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
    const title = ogTitleMatch?.[1] ?? titleMatch?.[1] ?? ''

    // ── 提取正文内容（按优先级: article > main > body） ──
    let content = ''
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)

    if (articleMatch) {
      content = articleMatch[1]
    } else if (mainMatch) {
      content = mainMatch[1]
    } else if (bodyMatch) {
      content = bodyMatch[1]
    } else {
      content = html
    }

    // ── 净化：移除脚本、样式、iframe 等 ──
    content = content
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<aside[\s\S]*?<\/aside>/gi, '')
      .replace(/<form[\s\S]*?<\/form>/gi, '')
      .replace(/\son\w+="[^"]*"/gi, '')
      .replace(/\son\w+='[^']*'/gi, '')

    // ── 提取第一张图片作为封面 ──
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i)
    const coverImage = imgMatch?.[1] ?? null

    // ── 从原文提取 description ──
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    const description = descMatch?.[1] ?? ''

    return json({
      ok: true,
      data: {
        title,
        description,
        coverImage,
        content,
        sourceUrl: target,
      },
    }, { status: 200 }, { request, env })
  } catch (err) {
    return json(
      { ok: false, error: { code: 'proxy_failure', message: err instanceof Error ? err.message : 'Unknown error' } },
      { status: 502 },
      { request, env },
    )
  }
}
