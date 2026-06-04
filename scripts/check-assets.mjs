import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(rootDir, 'public')
const configDir = path.join(publicDir, 'config')

const configFiles = [
  path.join(configDir, 'site.config.json'),
  path.join(configDir, 'plugins.config.json'),
]

const localPaths = new Set()

for (const filePath of configFiles) {
  const data = JSON.parse(readFileSync(filePath, 'utf8'))
  collectLocalPaths(data)
}

const missing = []

for (const localPath of localPaths) {
  const normalizedPath = localPath.replace(/^\/+/, '')
  const resolvedPath = path.resolve(publicDir, normalizedPath)

  if (!resolvedPath.startsWith(publicDir) || !existsSync(resolvedPath)) {
    missing.push(localPath)
  }
}

if (missing.length > 0) {
  console.error('Missing public assets:')
  for (const item of missing) {
    console.error(`- ${item}`)
  }
  process.exit(1)
}

console.log(`Asset check passed (${localPaths.size} local paths).`)

function collectLocalPaths(value) {
  if (typeof value === 'string') {
    if (isLocalAssetPath(value)) {
      localPaths.add(value)
    }
    return
  }

  if (Array.isArray(value)) {
    value.forEach(collectLocalPaths)
    return
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach(collectLocalPaths)
  }
}

function isLocalAssetPath(value) {
  return value.startsWith('/') && !value.startsWith('//') && /\.[a-z0-9]+$/i.test(value)
}
