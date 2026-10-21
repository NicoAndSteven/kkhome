/**
 * 重算存量基线。
 *
 * 只在「清洗完一批数据」之后运行：把当前仍未达标（但暂时不打算立刻改）的条目
 * 记成豁免，并把基线总数打印出来，提醒同步下调 check-ai-tools.mjs 的 MAX_BASELINE。
 *
 * 这个脚本**不能**在 CI 里跑，也不要随手跑 —— 它会把新增的错位一并洗白。
 * 正常流程是：改数据 → 跑 check:data 看还剩多少 → 需要时手动挑出仍未处理的 id 写进基线。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { auditTools } from './lib/ai-tools-rules.mjs'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const configPath = path.join(rootDir, 'public', 'config', 'plugins.config.json')
const baselinePath = path.join(rootDir, 'scripts', 'ai-tools-baseline.json')

const config = JSON.parse(readFileSync(configPath, 'utf8'))
const aiConfig = config.plugins?.find((plugin) => plugin.id === 'ai-navigator')?.config ?? {}
const categories = new Set((aiConfig.categories ?? []).map((category) => category.id))
const tools = aiConfig.tools ?? []

const ids = [...new Set(auditTools(tools, categories).map((issue) => issue.id))].sort()

writeFileSync(
  baselinePath,
  `${JSON.stringify(
    {
      _note:
        '存量错位豁免清单：只降不升。每清洗一批就删掉对应 id，并下调 check-ai-tools.mjs 的 MAX_BASELINE。',
      ids,
    },
    null,
    2,
  )}\n`,
  'utf8',
)

console.log(`基线已重算：${ids.length} / ${tools.length} 条工具仍不达标。`)
console.log('记得把 check-ai-tools.mjs 的 MAX_BASELINE 下调到不超过这个数。')
