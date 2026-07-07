import { UtilityItem } from './types'

export type HubRouteId = 'home' | 'inbox' | 'launch' | 'ai-tools' | 'wish-wall' | 'workbench' | 'collections' | 'scratchpad' | 'stocks' | 'stock-watch' | 'food' | 'party-games' | 'local-music'

export type ToolKind = NonNullable<UtilityItem['utilityType']>

export interface PendingToolSelection {
  tool: ToolKind
  input?: string
  autorun?: boolean
}

const pendingToolKey = 'hub:pending-tool'
const pendingScratchpadKey = 'hub:pending-scratchpad'

const routeAliases: Record<string, HubRouteId> = {
  '': 'home',
  top: 'home',
  home: 'home',
  inbox: 'inbox',
  launch: 'launch',
  'ai-tools': 'ai-tools',
  ai: 'ai-tools',
  wish: 'wish-wall',
  wishes: 'wish-wall',
  'wish-wall': 'wish-wall',
  workbench: 'workbench',
  collections: 'collections',
  scratchpad: 'scratchpad',
  stocks: 'stocks',
  stock: 'stocks',
  'stock-watch': 'stock-watch',
  food: 'food',
  'party-games': 'party-games',
  party: 'party-games',
  games: 'party-games',
  'local-music': 'local-music',
  music: 'local-music',
}

declare global {
  interface Window {
    __hubAvailableRoutes?: HubRouteId[]
  }
}

export const routeHash = (route: HubRouteId) => `#/${route}`

export const normalizeHubRoute = (hash: string): HubRouteId => {
  const normalized = hash
    .replace(/^#\/?/, '')
    .replace(/^\//, '')
    .split(/[/?&]/)[0]

  return routeAliases[normalized] ?? 'home'
}

export const setHubRoute = (route: HubRouteId) => {
  window.location.hash = routeHash(route)
}

export const isHubRouteAvailable = (route: HubRouteId) => (
  window.__hubAvailableRoutes?.includes(route) ?? true
)

const readJson = <T>(key: string): T | null => {
  try {
    const raw = globalThis.sessionStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export const queueToolSelection = (detail: PendingToolSelection) => {
  globalThis.sessionStorage.setItem(pendingToolKey, JSON.stringify(detail))
}

export const consumeQueuedToolSelection = () => {
  const detail = readJson<PendingToolSelection>(pendingToolKey)
  globalThis.sessionStorage.removeItem(pendingToolKey)
  return detail
}

export const queueScratchpadItem = (content: string) => {
  globalThis.sessionStorage.setItem(pendingScratchpadKey, JSON.stringify(content))
}

export const consumeQueuedScratchpadItem = () => {
  const content = readJson<string>(pendingScratchpadKey)
  globalThis.sessionStorage.removeItem(pendingScratchpadKey)
  return typeof content === 'string' ? content : null
}
