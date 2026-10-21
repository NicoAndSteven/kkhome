/**
 * AI 工具数据质量门禁
 *
 * 历史教训（2026-10-21 评估）：旧版只查「必填字段 / 分类存在 / id 重复 / 标题重复 / 同站同标题」，
 * 于是 313 条数据里 26 种描述模板、42% 标题是域名派生、17 条是同一篇 Markdown 文档的锚点，
 * 门禁却一直是绿的。**查不到错的护栏等于装饰。**
 *
 * 两层机制：
 *   1. 硬规则 —— 命中即失败，新数据一条都不能犯（规则实现在 scripts/lib/ai-tools-rules.mjs）
 *   2. 基线棘轮 —— 存量错位记在 ai-tools-baseline.json，只降不升；
 *      每清洗一批就删对应 id 并下调 MAX_BASELINE。
 */
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { auditTools } from './lib/ai-tools-rules.mjs'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const configPath = path.join(rootDir, 'public', 'config', 'plugins.config.json')
const baselinePath = path.join(rootDir, 'scripts', 'ai-tools-baseline.json')

/**
 * 基线允许的上限。2026-10-21 清洗完成后归零：
 * 从 311 条降到 0，意味着任何新增的错位都会直接失败，没有豁免通道。
 * 如果将来确实需要临时豁免，改这个数字的同时必须在 PR 里说明原因。
 */
const MAX_BASELINE = 0

const config = JSON.parse(readFileSync(configPath, 'utf8'))
const aiConfig = config.plugins?.find((plugin) => plugin.id === 'ai-navigator')?.config ?? {}
const categories = new Set((aiConfig.categories ?? []).map((category) => category.id))
const tools = aiConfig.tools ?? []

const baseline = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, 'utf8')) : { ids: [] }
const known = new Set(baseline.ids)

/**
 * 这些规则**不允许**走基线豁免 —— 它们是结构性错误，不是「内容还没写好」。
 * 基线一旦能豁免它们，配置就会带着一个指向不存在分类的工具继续上线。
 */
const UNEXCUSABLE = new Set(['required', 'category', 'duplicate-id', 'duplicate-url', 'surrogate'])

const errors = []
const warnings = []
for (const issue of auditTools(tools, categories)) {
  const line = `[${issue.rule}] ${issue.id}: ${issue.message}`
  if (known.has(issue.id) && !UNEXCUSABLE.has(issue.rule)) warnings.push(line)
  else errors.push(line)
}

// 基线棘轮：只降不升
if (baseline.ids.length > MAX_BASELINE) {
  errors.push(`[baseline] 基线条目 ${baseline.ids.length} 超过上限 ${MAX_BASELINE}，不允许新增豁免`)
}
const toolIds = new Set(tools.map((tool) => tool.id))
const missing = baseline.ids.filter((id) => !toolIds.has(id))
if (missing.length > 0) {
  errors.push(`[baseline] 基线里的 id 已不存在：${missing.join(', ')}（清洗后请同步删基线）`)
}

if (warnings.length > 0) {
  console.warn(`AI tool data — 存量问题 ${warnings.length} 条（基线豁免，需逐步清零）：`)
  for (const warning of warnings.slice(0, 10)) console.warn(`- ${warning}`)
  if (warnings.length > 10) console.warn(`- ... 另有 ${warnings.length - 10} 条`)
}

if (errors.length > 0) {
  console.error(`AI tool data — 硬性错误 ${errors.length} 条：`)
  for (const error of errors.slice(0, 40)) console.error(`- ${error}`)
  if (errors.length > 40) console.error(`- ... 另有 ${errors.length - 40} 条`)
  process.exit(1)
}

console.log(
  `AI tool data check passed (${tools.length} tools, ${categories.size} categories, 基线 ${baseline.ids.length}/${MAX_BASELINE}).`,
)
