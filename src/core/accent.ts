/**
 * 强调色方案。
 *
 * 设计取舍：颜色值**不在这里**，而是在 index.css 里以
 * `:root[data-accent='x']` / `:root.dark[data-accent='x']` 两套规则声明。
 * 理由：如果在 JS 里往 html 写内联变量，那么用户切换明暗主题时必须
 * 重新应用一遍，漏掉任何一条路径就会出现「主题切了但强调色没跟着变」。
 * 交给 CSS 属性选择器，主题与强调色的组合由浏览器自己算，不会漏。
 *
 * 这里只负责三件事：切换 `data-accent` 属性、读写 localStorage、给出可选项。
 */

export interface AccentPreset {
  id: string
  label: string
  /** 切换器上那个小圆点用的颜色（深色底，取 dark 主题的 primary） */
  swatch: string
}

export const ACCENTS: AccentPreset[] = [
  { id: 'klein', label: '克莱因蓝', swatch: '#4d7cff' },
  { id: 'plasma', label: '等离子紫', swatch: '#a855f7' },
  { id: 'emerald', label: '翡翠绿', swatch: '#10c98f' },
  { id: 'ember', label: '熔岩橙', swatch: '#ff8a4c' },
]

export const DEFAULT_ACCENT = 'klein'
const STORAGE_KEY = 'hub:accent'

export const isAccentId = (value: unknown): value is string =>
  typeof value === 'string' && ACCENTS.some((accent) => accent.id === value)

/** localStorage 可能被隐私模式禁用 —— 读失败就用默认值，不抛、不静默崩。 */
export function readAccent(): string {
  try {
    const saved = globalThis.localStorage.getItem(STORAGE_KEY)
    if (isAccentId(saved)) return saved
  } catch {
    /* 读不到就用默认 */
  }
  return DEFAULT_ACCENT
}

export function applyAccent(id: string): void {
  const next = isAccentId(id) ? id : DEFAULT_ACCENT
  document.documentElement.dataset.accent = next
  try {
    globalThis.localStorage.setItem(STORAGE_KEY, next)
  } catch {
    /* 存不下也不影响本次会话 */
  }
}

export function cycleAccent(current: string): string {
  const index = ACCENTS.findIndex((accent) => accent.id === current)
  return ACCENTS[(index + 1) % ACCENTS.length].id
}

export function accentLabel(id: string): string {
  return ACCENTS.find((accent) => accent.id === id)?.label ?? id
}
