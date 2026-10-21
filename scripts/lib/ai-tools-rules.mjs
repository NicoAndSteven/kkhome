/**
 * AI 工具数据的检测规则（单一实现）。
 *
 * 由两处消费：
 *   - scripts/check-ai-tools.mjs   门禁，命中即拦（存量走基线豁免）
 *   - scripts/refresh-baseline.mjs 清洗后重算基线
 *
 * 规则只有这一份。改规则就改这里，别在调用方各写一遍。
 */

/** 一眼就不像工具名的通用词。语义判断的兜底，不是穷举清单。 */
export const GENERIC_WORDS = new Set([
  'web', 'www', 'lab', 'labs', 'tools', 'tool', 'font', 'fonts', 'ask', 'app', 'apps',
  'download', 'downloads', 'docs', 'doc', 'blog', 'news', 'store', 'shop', 'mail',
  'cloud', 'music', 'video', 'image', 'images', 'pdf', 'ai', 'chat', 'home', 'site',
  'page', 'pages', 'search', 'map', 'ps', 'pr', 'notecard', 'index', 'main',
])

export const hostOf = (url) => {
  try {
    return new globalThis.URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

/** 孤立代理项：UTF-16 里 D800–DFFF 单独出现，浏览器会渲染成替换块。 */
const hasLoneSurrogate = (value) => {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i)
    if (code >= 0xd800 && code <= 0xdfff) return code
  }
  return 0
}

/**
 * @param {Array} tools
 * @param {Set<string>} categories
 * @returns {{ id: string, rule: string, message: string }[]}
 */
export const auditTools = (tools, categories) => {
  const issues = []
  const add = (id, rule, message) => issues.push({ id, rule, message })

  const seenIds = new Set()
  const seenUrls = new Set()
  const descCount = new Map()
  const hostCount = new Map()
  const requiredFields = ['id', 'title', 'category', 'url', 'description']

  for (const tool of tools) {
    const id = tool.id ?? '<missing-id>'

    for (const field of requiredFields) {
      if (typeof tool[field] !== 'string' || tool[field].trim().length === 0) {
        add(id, 'required', `missing ${field}`)
      }
    }
    if (typeof tool.category === 'string' && !categories.has(tool.category)) {
      add(id, 'category', `unknown category ${tool.category}`)
    }
    if (seenIds.has(tool.id)) add(id, 'duplicate-id', '重复出现')
    seenIds.add(tool.id)
    if (seenUrls.has(tool.url)) add(id, 'duplicate-url', `重复 URL ${tool.url}`)
    seenUrls.add(tool.url)

    for (const field of ['title', 'description']) {
      const code = hasLoneSurrogate(tool[field] ?? '')
      if (code) add(id, 'surrogate', `${field} 含孤立代理项 U+${code.toString(16).toUpperCase()}`)
    }

    const host = hostOf(tool.url)
    if (host) hostCount.set(host, (hostCount.get(host) ?? 0) + 1)

    // 标题不得是域名派生
    if (host && typeof tool.title === 'string') {
      const title = tool.title.trim()
      const lower = title.toLowerCase()
      const head = host.split('.')[0].toLowerCase()
      const brandSuffix = /^([a-z0-9-]+)\.(ai|io|co|app|dev)$/i.exec(title)
      if (brandSuffix && brandSuffix[1].toLowerCase() === head) {
        // Pixian.AI ← pixian.ai：品牌名自带后缀，合法
      } else if (/\.(com|cn|io|org|net|app|co|me|top|dev|ai|tv|cc)\b/i.test(title)) {
        add(id, 'title-is-url', `标题就是域名 "${title}"`)
      } else if (lower.length <= 4 && lower !== head && head.startsWith(lower)) {
        // 只抓极短截断。PixPin ← pixpinapp.com、SuperCLUE ← superclueai.com
        // 这类是品牌名后面挂了个域名后缀，不是截断，不能误伤。
        add(id, 'title-truncated', `标题是域名截断 "${title}"（host: ${host}）`)
      } else if (GENERIC_WORDS.has(lower)) {
        add(id, 'title-generic', `标题是通用词 "${title}"（host: ${host}）`)
      }
    }

    // 描述不得是分类模板句
    const desc = typeof tool.description === 'string' ? tool.description.trim() : ''
    if (/^用于.+或.+。$/.test(desc)) add(id, 'desc-template', `描述是模板句 "${desc}"`)
    if (desc.length < 10) add(id, 'desc-too-short', `描述过短（${desc.length} 字）`)
    descCount.set(desc, (descCount.get(desc) ?? 0) + 1)

    // 在线小游戏不得混进素材/图片分类
    if ((tool.tags ?? []).some((tag) => tag.includes('小游戏')) && tool.category !== 'fun') {
      add(id, 'game-misplaced', `在线小游戏出现在 ${tool.category}`)
    }
  }

  // 同一描述被多条共用 = 模板化
  for (const [desc, count] of descCount) {
    if (count <= 2) continue
    for (const tool of tools) {
      if (tool.description?.trim() === desc) add(tool.id, 'desc-repeated', `同一描述被 ${count} 条共用："${desc}"`)
    }
  }

  // 同站多条目必须声明 variantOf
  for (const [host, count] of hostCount) {
    if (count <= 2) continue
    for (const tool of tools) {
      if (hostOf(tool.url) === host && !tool.variantOf) {
        add(tool.id, 'same-host', `${host} 有 ${count} 条，缺少 variantOf 归属声明`)
      }
    }
  }

  return issues
}
