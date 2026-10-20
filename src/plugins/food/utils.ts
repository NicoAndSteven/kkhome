import type { FoodItem, Period, EveningData } from './types'

const STORAGE_KEYS = {
  EVENING: 'hub:food-evening',
  TODAY: 'hub:food-today',
  NOON_FALLBACK: 'hub:food-noon',
} as const

// ── Shared API helpers ──
//
// The site is deployed as static assets + Cloudflare Pages Functions. `npm run dev`
// (plain Vite) does not serve `/functions`, so every API write answers 404 — and a SPA
// fallback answers 200 with HTML. Treat "no JSON body" and 5xx as "API unavailable" and
// fall back to localStorage, so the menu stays usable in dev/offline. A real refusal
// (400/404 not_found/429) must NOT be masked: the UI has to show the failure.

type ApiOutcome<T> =
  | { status: 'ok'; data: T }
  | { status: 'unavailable' }
  | { status: 'rejected' }

async function callFoodApi<T>(input: string, init?: RequestInit): Promise<ApiOutcome<T>> {
  try {
    const res = await fetch(input, init)
    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) return { status: 'unavailable' }

    let payload: { ok?: boolean; data?: T } | null = null
    try { payload = await res.json() as { ok?: boolean; data?: T } } catch { return { status: 'unavailable' } }

    if (res.ok && payload?.ok) return { status: 'ok', data: payload.data as T }
    return { status: res.status >= 500 ? 'unavailable' : 'rejected' }
  } catch {
    return { status: 'unavailable' }
  }
}

// ── Noon items — shared API (D1-backed), localStorage fallback ──

function readNoonCache(): FoodItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOON_FALLBACK)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed as FoodItem[] : []
  } catch { return [] }
}

function writeNoonCache(items: FoodItem[]): void {
  try { localStorage.setItem(STORAGE_KEYS.NOON_FALLBACK, JSON.stringify(items)) } catch { /* ignore quota errors */ }
}

export async function loadNoonItems(): Promise<FoodItem[]> {
  const outcome = await callFoodApi<{ items?: Array<{ id: string; name: string; createdAt: string }> }>('/api/food/noon')
  if (outcome.status === 'ok' && Array.isArray(outcome.data?.items)) {
    // Map API shape → FoodItem (source is always 'user' for shared noon items).
    // An empty server list is authoritative — do not resurrect a stale offline cache.
    const mapped: FoodItem[] = outcome.data.items.map((i) => ({ id: i.id, name: i.name, source: 'user' as const }))
    writeNoonCache(mapped)
    return mapped
  }
  return readNoonCache()
}

export async function addNoonItem(name: string): Promise<FoodItem | null> {
  const trimmed = name.trim()
  if (!trimmed) return null

  const outcome = await callFoodApi<{ item?: { id: string; name: string; createdAt: string } }>('/api/food/noon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: trimmed }),
  })

  if (outcome.status === 'ok') {
    const item = outcome.data?.item
    return item ? { id: item.id, name: item.name, source: 'user' as const } : null
  }
  if (outcome.status === 'rejected') return null

  const item: FoodItem = { id: genId(), name: trimmed, source: 'user' }
  writeNoonCache([...readNoonCache(), item])
  return item
}

export async function renameNoonItem(id: string, name: string): Promise<boolean> {
  const trimmed = name.trim()
  if (!trimmed) return false

  const outcome = await callFoodApi('/api/food/noon', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name: trimmed }),
  })

  if (outcome.status === 'ok') return true
  if (outcome.status === 'rejected') return false

  writeNoonCache(readNoonCache().map((i) => i.id === id ? { ...i, name: trimmed } : i))
  return true
}

export async function deleteNoonItem(id: string): Promise<boolean> {
  const outcome = await callFoodApi('/api/food/noon', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  })

  if (outcome.status === 'ok') return true
  if (outcome.status === 'rejected') return false

  writeNoonCache(readNoonCache().filter((i) => i.id !== id))
  return true
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

function readEveningCache(): EveningData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENING)
    if (!raw) return { custom: [], disabledIds: [] }
    const parsed = JSON.parse(raw) as Partial<EveningData> | null
    return {
      custom: Array.isArray(parsed?.custom) ? parsed.custom : [],
      disabledIds: Array.isArray(parsed?.disabledIds) ? parsed.disabledIds : [],
    }
  } catch { return { custom: [], disabledIds: [] } }
}

function writeEveningCache(data: EveningData): void {
  try { localStorage.setItem(STORAGE_KEYS.EVENING, JSON.stringify(data)) } catch { /* ignore quota errors */ }
}

export async function loadEveningData(): Promise<EveningData> {
  const outcome = await callFoodApi<EveningApiResponse>('/api/food/evening')
  if (outcome.status === 'ok' && outcome.data) {
    const result: EveningData = {
      custom: Array.isArray(outcome.data.custom)
        ? outcome.data.custom.map((i) => ({ id: i.id, name: i.name, source: 'user' as const }))
        : [],
      disabledIds: Array.isArray(outcome.data.disabledIds) ? outcome.data.disabledIds : [],
    }
    writeEveningCache(result)
    return result
  }
  return readEveningCache()
}

export async function addEveningItem(name: string): Promise<FoodItem | null> {
  const trimmed = name.trim()
  if (!trimmed) return null

  const outcome = await callFoodApi<{ item?: { id: string; name: string; createdAt: string } }>('/api/food/evening', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: trimmed }),
  })

  if (outcome.status === 'ok') {
    const item = outcome.data?.item
    return item ? { id: item.id, name: item.name, source: 'user' as const } : null
  }
  if (outcome.status === 'rejected') return null

  const item: FoodItem = { id: genId(), name: trimmed, source: 'user' }
  const current = readEveningCache()
  writeEveningCache({ ...current, custom: [...current.custom, item] })
  return item
}

export async function renameEveningItem(id: string, name: string): Promise<boolean> {
  const trimmed = name.trim()
  if (!trimmed) return false

  const outcome = await callFoodApi('/api/food/evening', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name: trimmed }),
  })

  if (outcome.status === 'ok') return true
  if (outcome.status === 'rejected') return false

  const current = readEveningCache()
  writeEveningCache({ ...current, custom: current.custom.map((i) => i.id === id ? { ...i, name: trimmed } : i) })
  return true
}

export async function deleteEveningItem(id: string): Promise<boolean> {
  const outcome = await callFoodApi('/api/food/evening', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  })

  if (outcome.status === 'ok') return true
  if (outcome.status === 'rejected') return false

  const current = readEveningCache()
  writeEveningCache({ ...current, custom: current.custom.filter((i) => i.id !== id) })
  return true
}

export async function toggleEveningRecipe(recipeId: string): Promise<boolean> {
  const outcome = await callFoodApi('/api/food/evening', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipeId }),
  })

  if (outcome.status === 'ok') return true
  if (outcome.status === 'rejected') return false

  const current = readEveningCache()
  const wasDisabled = current.disabledIds.includes(recipeId)
  writeEveningCache({
    ...current,
    disabledIds: wasDisabled
      ? current.disabledIds.filter((id) => id !== recipeId)
      : [...current.disabledIds, recipeId],
  })
  return true
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
