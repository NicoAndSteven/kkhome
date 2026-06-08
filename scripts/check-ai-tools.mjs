import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const configPath = path.join(rootDir, 'public', 'config', 'plugins.config.json')
const config = JSON.parse(readFileSync(configPath, 'utf8'))
const aiPlugin = config.plugins?.find((plugin) => plugin.id === 'ai-navigator')
const aiConfig = aiPlugin?.config ?? {}
const categories = new Set((aiConfig.categories ?? []).map((category) => category.id))
const tools = aiConfig.tools ?? []
const requiredFields = ['id', 'title', 'category', 'url', 'description']
const genericTitles = new Set(['官网下载', '官方地址', 'GitHub 地址', 'Github', 'GitHub', 'Zh', 'V', 'Apps', '开源'])

const errors = []
const warnings = []
const ids = new Map()
const titles = new Map()

for (const tool of tools) {
  for (const field of requiredFields) {
    if (typeof tool[field] !== 'string' || tool[field].trim().length === 0) {
      errors.push(`${tool.id ?? '<missing-id>'}: missing ${field}`)
    }
  }

  if (typeof tool.category === 'string' && !categories.has(tool.category)) {
    errors.push(`${tool.id}: unknown category ${tool.category}`)
  }

  if (typeof tool.id === 'string') {
    ids.set(tool.id, (ids.get(tool.id) ?? 0) + 1)
  }

  if (typeof tool.title === 'string') {
    titles.set(tool.title, (titles.get(tool.title) ?? 0) + 1)

    if (genericTitles.has(tool.title.trim())) {
      warnings.push(`${tool.id}: generic title "${tool.title}"`)
    }
  }
}

for (const [id, count] of ids) {
  if (count > 1) {
    warnings.push(`duplicate id "${id}" appears ${count} times`)
  }
}

for (const [title, count] of titles) {
  if (count > 3) {
    warnings.push(`repeated title "${title}" appears ${count} times`)
  }
}

if (warnings.length > 0) {
  console.warn(`AI tool data warnings (${warnings.length}):`)
  for (const warning of warnings.slice(0, 30)) {
    console.warn(`- ${warning}`)
  }
  if (warnings.length > 30) {
    console.warn(`- ... ${warnings.length - 30} more`)
  }
}

if (errors.length > 0) {
  console.error(`AI tool data errors (${errors.length}):`)
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log(`AI tool data check passed (${tools.length} tools, ${categories.size} categories).`)
