import { FoodItem, Period, EveningData } from './types'

const STORAGE_KEYS = {
  NOON: 'hub:food-noon',
  EVENING: 'hub:food-evening',
  TODAY: 'hub:food-today',
} as const

/** Get current hour in Beijing time (Asia/Shanghai) — 0-23 */
export function getBeijingHour(): number {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    hour: 'numeric',
    hour12: false,
  })
  return parseInt(formatter.format(now), 10)
}

/** 13:00 = evening boundary */
export function getCurrentPeriod(): Period {
  return getBeijingHour() < 13 ? 'noon' : 'evening'
}

export function loadNoonItems(): FoodItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOON)
    return raw ? (JSON.parse(raw) as FoodItem[]) : []
  } catch { return [] }
}

export function saveNoonItems(items: FoodItem[]): void {
  localStorage.setItem(STORAGE_KEYS.NOON, JSON.stringify(items))
}

export function loadEveningData(): EveningData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENING)
    return raw ? (JSON.parse(raw) as EveningData) : { custom: [], disabledIds: [] }
  } catch { return { custom: [], disabledIds: [] } }
}

export function saveEveningData(data: EveningData): void {
  localStorage.setItem(STORAGE_KEYS.EVENING, JSON.stringify(data))
}

export function loadTodayResult(): { item: FoodItem; period: Period } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TODAY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return (parsed?.item && parsed?.period) ? parsed : null
  } catch { return null }
}

export function saveTodayResult(result: { item: FoodItem; period: Period }): void {
  localStorage.setItem(STORAGE_KEYS.TODAY, JSON.stringify({
    ...result, timestamp: new Date().toISOString(),
  }))
}

export function clearTodayResult(): void {
  localStorage.removeItem(STORAGE_KEYS.TODAY)
}

export function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
