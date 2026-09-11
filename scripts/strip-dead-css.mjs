import { readFileSync, writeFileSync } from 'node:fs'

// 清理 action-cut 路由壳重构后失效的 CSS 规则
const cssPath = 'src/index.css'
const css = readFileSync(cssPath, 'utf8')

const DEAD = new Set([
  '.blog-layout',
  '.blog-sidebar',
  '.blog-sidebar::-webkit-scrollbar',
  '.blog-sidebar-brand',
  '.blog-sidebar-logo',
  '@keyframes sidebar-logo-breathe',
  '.blog-sidebar-link',
  '.blog-sidebar-link:hover',
  '.blog-sidebar-link.active',
  '.blog-sidebar-link.active::before',
  '.blog-sidebar-divider',
  '.blog-sidebar-nav',
  '.blog-content',
  '.blog-content::before',
  '.blog-content > *',
  '.route-mode',
  '.route-mode .blog-sidebar',
  ':root.dark .route-mode .blog-sidebar',
  '.route-mode .blog-sidebar-logo',
  ':root.dark .route-mode .blog-sidebar-logo',
  '.route-mode .blog-sidebar-link',
  ':root.dark .route-mode .blog-sidebar-link',
  '.route-mode .blog-sidebar-link:hover',
  ':root.dark .route-mode .blog-sidebar-link:hover',
  '.route-mode .blog-sidebar-link.active',
  ':root.dark .route-mode .blog-sidebar-link.active',
  '.route-mode .blog-sidebar-link.active::before',
  ':root.dark .route-mode .blog-sidebar-link.active::before',
  '.route-mode .blog-sidebar-divider',
  ':root.dark .route-mode .blog-sidebar-divider',
  '.route-mode .blog-content::before',
  '.route-page-shell',
  '.route-stage',
  '.route-frame',
  ':root.dark .route-frame',
  '.route-frame::before',
  '.route-frame::after',
  '.route-frame > *',
  '.route-frame > section',
  '.route-frame > section > :last-child',
  '.route-frame > section > :last-child::-webkit-scrollbar',
  '.route-frame #ai-tools > .ai-results-scroll',
  '.route-frame #ai-tools',
  '.route-frame #ai-tools::-webkit-scrollbar',
  '.route-frame #workbench > .surface-panel-strong',
  '.route-frame #scratchpad > .grid:last-child',
  '@keyframes route-frame-in',
  '.route-content-in',
  '@keyframes route-content-in',
  '.route-mobile-enter',
  '@keyframes route-mobile-in',
  '.home-page-shell',
])

// 按前缀匹配的规则族（如 .route-mobile-ready > *:nth-child(2)）
const DEAD_PREFIXES = ['.route-mobile-ready']

const norm = (sel) => sel.replace(/\s+/g, ' ').trim()

// 切分顶层 chunk：注释 / @keyframes / @media / 规则
function parseChunks(css, start = 0, end = css.length) {
  const chunks = []
  let i = start
  let buf = ''
  let depth = 0
  while (i < end) {
    const ch = css[i]
    buf += ch
    if (ch === '{') depth++
    if (ch === '}') {
      depth--
      if (depth === 0) {
        chunks.push(buf)
        buf = ''
      }
    }
    i++
  }
  if (buf.trim()) chunks.push(buf)
  return chunks
}

function selectorOf(chunk) {
  const head = chunk.slice(0, chunk.indexOf('{')).trim()
  return norm(head)
}

function stripChunk(chunk) {
  const braceStart = chunk.indexOf('{')
  return { head: chunk.slice(0, braceStart), body: chunk }
}

function clean(cssText) {
  const chunks = parseChunks(cssText)
  const out = []
  let pendingComment = ''
  let removed = 0
  for (const chunk of chunks) {
    const trimmed = chunk.trim()
    if (!trimmed) continue
    if (trimmed.startsWith('/*')) {
      pendingComment = chunk
      continue
    }
    if (trimmed.startsWith('@keyframes')) {
      const name = selectorOf(chunk).replace('@keyframes', '').trim()
      if (DEAD.has('@keyframes ' + name) || DEAD_PREFIXES.some((p) => name.startsWith(p.slice(11)))) {
        removed++
        pendingComment = ''
        continue
      }
      out.push(pendingComment, chunk)
      pendingComment = ''
      continue
    }
    if (trimmed.startsWith('@media')) {
      const inner = chunk.slice(chunk.indexOf('{') + 1, chunk.lastIndexOf('}'))
      const cleanedInner = clean(inner).text
      if (cleanedInner.trim()) {
        out.push(pendingComment, chunk.slice(0, chunk.indexOf('{') + 1) + cleanedInner + '}')
      } else {
        removed++
      }
      pendingComment = ''
      continue
    }
    const sel = selectorOf(chunk)
    const dead =
      DEAD.has(sel) ||
      DEAD_PREFIXES.some((p) => sel === p || sel.startsWith(p + ' ') || sel.startsWith(p + ':'))
    if (dead) {
      removed++
      pendingComment = ''
      continue
    }
    out.push(pendingComment, chunk)
    pendingComment = ''
  }
  if (pendingComment) out.push(pendingComment)
  return { text: out.join('\n'), removed }
}

const { text, removed } = clean(css)
writeFileSync(cssPath, text)
console.log('removed rules:', removed)
