/**
 * AI 工具导航搜索评分逻辑
 *
 * 从 ai-navigator/index.tsx 抽出，使得搜索评分可以被单元测试覆盖。
 * 评分权重设计：
 * - 标题精确/前缀/包含：100 / 80 / 55
 * - 别名匹配：45
 * - 标签匹配：35
 * - 描述匹配：18
 * - 分类匹配：8
 * - 域名匹配：5
 * - featured 加成（已有分数时）：+4
 */

export interface AiTool {
  id: string
  title: string
  category: string
  url: string
  description: string
  tags?: string[]
  aliases?: string[]
  icon?: string
  featured?: boolean
  sourceTitle?: string
  sourceUrl?: string
  sourceCategory?: string
}

export const getHostname = (url: string): string => {
  try {
    return new globalThis.URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export const fieldIncludes = (field: string | undefined, query: string): boolean =>
  field?.toLowerCase().includes(query) ?? false

export const listIncludes = (items: string[] | undefined, query: string): boolean =>
  items?.some((item) => item.toLowerCase().includes(query)) ?? false

export const scoreTool = (tool: AiTool, query: string): number => {
  if (!query) return 0
  const title = tool.title.toLowerCase()
  let score = 0
  if (title === query) score += 100
  else if (title.startsWith(query)) score += 80
  else if (title.includes(query)) score += 55
  if (listIncludes(tool.aliases, query)) score += 45
  if (listIncludes(tool.tags, query)) score += 35
  if (fieldIncludes(tool.description, query)) score += 18
  if (fieldIncludes(tool.category, query)) score += 8
  if (fieldIncludes(getHostname(tool.url), query)) score += 5
  if (tool.featured && score > 0) score += 4
  return score
}

/**
 * 对工具列表进行搜索评分、过滤和排序。
 * 无查询时返回原始顺序（按 index 排序）。
 */
export const rankTools = (tools: AiTool[], query: string): AiTool[] => {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return tools

  return tools
    .map((tool, index) => ({ tool, score: scoreTool(tool, normalizedQuery), index }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.tool)
}