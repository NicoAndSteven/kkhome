import { FoodItem, Period, EveningData } from './types'

const STORAGE_KEYS = {
  EVENING: 'hub:food-evening',
  TODAY: 'hub:food-today',
  NOON_FALLBACK: 'hub:food-noon',
} as const

// ── Noon items — shared API (D1-backed), localStorage fallback ──

export async function loadNoonItems(): Promise<FoodItem[]> {
  try {
    const res = await fetch('/api/food/noon')
    if (!res.ok) throw new Error('API unavailable')
    const payload = await res.json() as { ok: boolean; data?: { items?: Array<{ id: string; name: string; createdAt: string }> } }
    const items = payload?.data?.items
    if (Array.isArray(items) && items.length > 0) {
      // Map API shape → FoodItem (source is always 'user' for shared noon items)
      const mapped: FoodItem[] = items.map((i) => ({ id: i.id, name: i.name, source: 'user' as const }))
      // Update fallback cache so offline reads still have data
      localStorage.setItem(STORAGE_KEYS.NOON_FALLBACK, JSON.stringify(mapped))
      return mapped
    }
  } catch { /* fall through to fallback */ }

  // Fallback: read from localStorage (offline / API not deployed yet)
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOON_FALLBACK)
    return raw ? (JSON.parse(raw) as FoodItem[]) : []
  } catch { return [] }
}

export async function addNoonItem(name: string): Promise<FoodItem | null> {
  try {
    const res = await fetch('/api/food/noon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (!res.ok) return null
    const payload = await res.json() as { ok: boolean; data?: { item?: { id: string; name: string; createdAt: string } } }
    const item = payload?.data?.item
    if (item) return { id: item.id, name: item.name, source: 'user' as const }
    return null
  } catch { return null }
}

export async function renameNoonItem(id: string, name: string): Promise<boolean> {
  try {
    const res = await fetch('/api/food/noon', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name }),
    })
    return res.ok
  } catch { return false }
}

export async function deleteNoonItem(id: string): Promise<boolean> {
  try {
    const res = await fetch('/api/food/noon', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    return res.ok
  } catch { return false }
}

// ── Time helpers (Beijing time) ──

/** Get current hour in Beijing time (Asia/Shanghai) — 0-23 */
export function getBeijingHour(): number {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    hour: 'numeric',
    hour12: false,
  })
  const parts = formatter.formatToParts(now)
  const hour = parts.find(p => p.type === 'hour')?.value
  return hour ? parseInt(hour, 10) : 0
}

/** Get today's date string in Beijing time (YYYY-MM-DD) */
export function getBeijingDate(): string {
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
  return formatter.format(new Date()).replace(/\//g, '-')
}

/** 13:00 = evening boundary */
export function getCurrentPeriod(): Period {
  return getBeijingHour() < 13 ? 'noon' : 'evening'
}

// ── Evening items — shared API (D1-backed), localStorage fallback ──

interface EveningApiResponse {
  custom: Array<{ id: string; name: string; createdAt: string }>
  disabledIds: string[]
}

export async function loadEveningData(): Promise<EveningData> {
  try {
    const res = await fetch('/api/food/evening')
    if (!res.ok) throw new Error('API unavailable')
    const payload = await res.json() as { ok: boolean; data?: EveningApiResponse }
    const data = payload?.data
    if (data) {
      const result: EveningData = {
        custom: data.custom.map((i) => ({ id: i.id, name: i.name, source: 'user' as const })),
        disabledIds: data.disabledIds,
      }
      // Update fallback cache
      localStorage.setItem(STORAGE_KEYS.EVENING, JSON.stringify(result))
      return result
    }
  } catch { /* fall through to fallback */ }

  // Fallback: read from localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENING)
    return raw ? (JSON.parse(raw) as EveningData) : { custom: [], disabledIds: [] }
  } catch { return { custom: [], disabledIds: [] } }
}

export async function addEveningItem(name: string): Promise<FoodItem | null> {
  try {
    const res = await fetch('/api/food/evening', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (!res.ok) return null
    const payload = await res.json() as { ok: boolean; data?: { item?: { id: string; name: string; createdAt: string } } }
    const item = payload?.data?.item
    if (item) return { id: item.id, name: item.name, source: 'user' as const }
    return null
  } catch { return null }
}

export async function renameEveningItem(id: string, name: string): Promise<boolean> {
  try {
    const res = await fetch('/api/food/evening', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name }),
    })
    return res.ok
  } catch { return false }
}

export async function deleteEveningItem(id: string): Promise<boolean> {
  try {
    const res = await fetch('/api/food/evening', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    return res.ok
  } catch { return false }
}

export async function toggleEveningRecipe(recipeId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/food/evening', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipeId }),
    })
    return res.ok
  } catch { return false }
}

export function loadTodayResult(): { item: FoodItem; period: Period } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TODAY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Ignore results from previous days
    if (!parsed?.item || !parsed?.period || parsed?.date !== getBeijingDate()) {
      if (parsed?.date && parsed.date !== getBeijingDate()) clearTodayResult()
      return null
    }
    return parsed
  } catch { return null }
}

export function saveTodayResult(result: { item: FoodItem; period: Period }): void {
  localStorage.setItem(STORAGE_KEYS.TODAY, JSON.stringify({
    ...result, date: getBeijingDate(), timestamp: new Date().toISOString(),
  }))
}

export function clearTodayResult(): void {
  localStorage.removeItem(STORAGE_KEYS.TODAY)
}

export function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
