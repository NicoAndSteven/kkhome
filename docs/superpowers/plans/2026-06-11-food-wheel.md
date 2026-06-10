# 🍽️ 今天吃什么 — Implementation Plan

> **REQUIRED SUB-SKILL:** Use `superpowers:subagent-driven-development` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "what to eat today" wheel-spinner plugin to the personal homepage, auto-switching between noon (nearby lunch) and evening (cook-at-home dinner) based on Beijing time.

**Architecture:** A new `food` plugin under `src/plugins/food/`. Core logic: `getBeijingTime()` decides which data set to show. The wheel is rendered via CSS `conic-gradient` and animated with CSS `transform: rotate()`. Data stored in localStorage; built-in recipe library for evening meals.

**Tech Stack:** React 18, TypeScript, TailwindCSS (custom design tokens), Vite

---

## File Structure

### New files (6)

| File | Responsibility |
|------|---------------|
| `src/plugins/food/types.ts` | All type/interface definitions |
| `src/plugins/food/utils.ts` | `getBeijingTime()`, `getRandomItem()`, storage helpers |
| `src/plugins/food/recipes.ts` | ~200 built-in Chinese home-cook recipes, categorized |
| `src/plugins/food/FoodWheel.tsx` | Wheel component: conic-gradient render + spin animation + result display |
| `src/plugins/food/FoodManager.tsx` | Management drawer: add/remove/edit noon items, disable evening recipes |
| `src/plugins/food/index.tsx` | Main plugin entry: time-based view switching, preview toggle |

### Modified files (3)

| File | Change |
|------|--------|
| `src/plugins/index.ts` | Register `food` plugin (enabled: true, order: 7) |
| `src/App.tsx` | Add route item `{ id: 'food', label: '吃啥', ... }` |
| `src/core/routeBridge.ts` | Add `'food'` to `HubRouteId` and `routeAliases` |

---

### Task 1: Type definitions (types.ts)

**Files:**
- Create: `src/plugins/food/types.ts`

```typescript
export interface FoodItem {
  id: string
  name: string
  source: 'user' | 'builtin'
  disabled?: boolean
}

export interface EveningData {
  custom: FoodItem[]
  disabledIds: string[]
}

export interface WheelResult {
  item: FoodItem
  timestamp: string
  period: 'noon' | 'evening'
}

export type Period = 'noon' | 'evening'
```

- [ ] **Step 1: Create file**

Run:
```bash
mkdir -p src/plugins/food
```

- [ ] **Step 2: Write types.ts**

```bash
cat > src/plugins/food/types.ts << 'TYPESCRIPT'
export interface FoodItem {
  id: string
  name: string
  source: 'user' | 'builtin'
  disabled?: boolean
}

export interface EveningData {
  custom: FoodItem[]
  disabledIds: string[]
}

export interface WheelResult {
  item: FoodItem
  timestamp: string
  period: 'noon' | 'evening'
}

export type Period = 'noon' | 'evening'
TYPESCRIPT
```

- [ ] **Step 3: Commit**

```bash
git add src/plugins/food/types.ts
git commit -m "feat(food): add type definitions"
```

---

### Task 2: Utility functions (utils.ts)

**Files:**
- Create: `src/plugins/food/utils.ts`

- [ ] **Step 1: Write utils.ts**

```typescript
import { FoodItem, Period, EveningData } from './types'

const STORAGE_KEYS = {
  NOON: 'hub:food-noon',
  EVENING: 'hub:food-evening',
  TODAY: 'hub:food-today',
} as const

/** Get current hour in Beijing time (Asia/Shanghai) */
export function getBeijingHour(): number {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    hour: 'numeric',
    hour12: false,
  })
  return parseInt(formatter.format(now), 10)
}

/** Determine current period based on Beijing time (13:00 = evening boundary) */
export function getCurrentPeriod(): Period {
  return getBeijingHour() < 13 ? 'noon' : 'evening'
}

/** Read noon data from localStorage */
export function loadNoonItems(): FoodItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOON)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** Save noon data to localStorage */
export function saveNoonItems(items: FoodItem[]): void {
  localStorage.setItem(STORAGE_KEYS.NOON, JSON.stringify(items))
}

/** Read evening data from localStorage */
export function loadEveningData(): EveningData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENING)
    if (!raw) return { custom: [], disabledIds: [] }
    return JSON.parse(raw)
  } catch {
    return { custom: [], disabledIds: [] }
  }
}

/** Save evening data to localStorage */
export function saveEveningData(data: EveningData): void {
  localStorage.setItem(STORAGE_KEYS.EVENING, JSON.stringify(data))
}

/** Get today's wheel result (null if not spun today) */
export function loadTodayResult(): { item: FoodItem; period: Period } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TODAY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || !parsed.item || !parsed.period) return null
    return parsed
  } catch {
    return null
  }
}

/** Save today's wheel result */
export function saveTodayResult(result: { item: FoodItem; period: Period }): void {
  localStorage.setItem(STORAGE_KEYS.TODAY, JSON.stringify({
    ...result,
    timestamp: new Date().toISOString(),
  }))
}

/** Clear today's result (for testing) */
export function clearTodayResult(): void {
  localStorage.removeItem(STORAGE_KEYS.TODAY)
}

/** Generate a unique ID */
export function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/** Check if all items are disabled */
export function allDisabled(items: FoodItem[]): boolean {
  return items.length > 0 && items.every(i => i.disabled)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/plugins/food/utils.ts
git commit -m "feat(food): add utility functions"
```

---

### Task 3: Built-in recipe library (recipes.ts)

**Files:**
- Create: `src/plugins/food/recipes.ts`

- [ ] **Step 1: Write recipes.ts**

```typescript
import { FoodItem } from './types'

export interface RecipeGroup {
  category: string
  items: string[]
}

/** ~200 built-in home-cook Chinese dishes */
const RECIPE_DATA: RecipeGroup[] = [
  {
    category: 'vegetable',
    items: [
      '番茄炒蛋', '酸辣土豆丝', '手撕包菜', '干煸四季豆', '地三鲜',
      '清炒时蔬', '蒜蓉空心菜', '蚝油生菜', '蒜蓉西兰花', '醋溜白菜',
      '鱼香茄子', '麻婆豆腐', '家常豆腐', '红烧茄子', '香煎豆腐',
      '蒜蓉豆角', '清炒荷兰豆', '香菇油菜', '腐乳通菜', '炝炒圆白菜',
      '干锅花菜', '素炒杏鲍菇', '凉拌黄瓜', '虎皮青椒', '松仁玉米',
      '拔丝地瓜', '蜜汁南瓜', '荷塘小炒', '丝瓜炒蛋', '韭菜炒蛋',
    ],
  },
  {
    category: 'meat',
    items: [
      '红烧肉', '糖醋排骨', '可乐鸡翅', '回锅肉', '宫保鸡丁',
      '鱼香肉丝', '青椒肉丝', '木须肉', '土豆烧牛肉', '西红柿牛腩',
      '红烧排骨', '酱香鸡腿', '蜜汁鸡翅', '蒜香排骨', '椒盐排骨',
      '水煮肉片', '辣子鸡丁', '啤酒鸭', '红烧鸡块', '粉蒸肉',
      '梅菜扣肉', '腐乳烧肉', '红烧猪蹄', '卤牛肉', '葱爆羊肉',
      '京酱肉丝', '菠萝咕咾肉', '小炒肉', '干锅肥肠', '孜然牛肉',
      '酱爆肉丁', '糖醋里脊', '可乐烧排骨', '蒜蓉蒸排骨', '黑椒牛柳',
    ],
  },
  {
    category: 'soup',
    items: [
      '紫菜蛋花汤', '番茄蛋汤', '排骨汤', '酸辣汤', '玉米排骨汤',
      '冬瓜排骨汤', '萝卜丝鲫鱼汤', '豆腐青菜汤', '菌菇汤', '紫菜虾皮汤',
      '番茄肉丸汤', '白菜豆腐汤', '味增汤', '蛋花汤', '南瓜浓汤',
      '花蛤冬瓜汤', '番茄牛腩汤', '海带排骨汤', '山药排骨汤', '莲藕排骨汤',
    ],
  },
  {
    category: 'staple',
    items: [
      '蛋炒饭', '炒面', '煮面条', '炒河粉', '煎饺',
      '扬州炒饭', '西红柿鸡蛋面', '葱油拌面', '担担面', '酸辣粉',
      '肉酱意面', '炒米粉', '炒乌冬', '炒年糕', '焖饭',
      '煲仔饭', '炒饼', '疙瘩汤', '汤圆', '饺子',
      '馄饨', '热干面', '打卤面', '炸酱面', '麻辣拌面',
    ],
  },
  {
    category: 'cold',
    items: [
      '凉拌黄瓜', '皮蛋豆腐', '口水鸡', '凉拌木耳', '凉拌海带丝',
      '凉拌皮蛋', '蒜泥白肉', '凉拌豆皮', '红油耳丝', '凉拌三丝',
      '凉拌藕片', '拍黄瓜', '凉拌西红柿', '手撕鸡', '夫妻肺片',
      '凉拌菠菜', '柠檬鸡爪', '凉拌金针菇', '凉拌粉丝', '葱油鸡',
    ],
  },
  {
    category: 'seafood',
    items: [
      '清蒸鲈鱼', '红烧鱼块', '酸菜鱼', '水煮鱼', '糖醋鱼',
      '椒盐虾', '白灼虾', '蒜蓉粉丝蒸扇贝', '葱姜炒蟹', '辣炒花蛤',
      '红烧带鱼', '清蒸大闸蟹', '油焖大虾', '蒜蓉生蚝', '干煎带鱼',
    ],
  },
  {
    category: 'hotpot',
    items: [
      '麻辣火锅', '清汤火锅', '番茄火锅', '寿喜锅', '部队锅',
      '椰子鸡火锅', '粥底火锅', '涮羊肉', '串串香', '冒菜',
    ],
  },
]

const ITEMS_INDEX: string[] = []
for (const group of RECIPE_DATA) {
  for (const name of group.items) {
    ITEMS_INDEX.push(name)
  }
}

/** Build the full evening FoodItem list from built-in recipes plus user custom items */
export function buildEveningItems(custom: FoodItem[], disabledIds: string[]): FoodItem[] {
  const builtins: FoodItem[] = ITEMS_INDEX.map((name, i) => ({
    id: `builtin-${i}`,
    name,
    source: 'builtin' as const,
    disabled: disabledIds.includes(`builtin-${i}`),
  }))
  return [...builtins, ...custom.map(c => ({ ...c, disabled: false }))]
}

export function getRecipeGroups(): RecipeGroup[] {
  return RECIPE_DATA
}

export function getAllRecipeNames(): string[] {
  return ITEMS_INDEX
}

export function getRecipeCount(): number {
  return ITEMS_INDEX.length
}
```

- [ ] **Step 2: Commit**

```bash
git add src/plugins/food/recipes.ts
git commit -m "feat(food): add built-in recipe library (~200 dishes)"
```

---

### Task 4: Wheel component (FoodWheel.tsx)

**Files:**
- Create: `src/plugins/food/FoodWheel.tsx`

This is the core component. It renders a wheel using CSS `conic-gradient`, animates with `transform: rotate()`, and handles the spin + result highlight lifecycle.

Implementation details:
- Wheel is a circle with segments using `conic-gradient` — each segment gets a color from a predefined palette, alternating
- Items with >12 items: only show item label for every other segment (too crowded otherwise). The user can hover to see full name.
- Pointer is an absolutely-positioned triangle at the top center
- On spin: pick random item → compute degrees to that item's segment → `totalDeg = (3~6) × 360 + segmentMiddle` → set `transform: rotate(totalDeg)` with `transition: transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)`
- On `transitionend`: mark `spinning = false`, highlight selected, call `onSpin`
- States: empty, single item, spinning, done

- [ ] **Step 1: Write FoodWheel.tsx**

```typescript
import { useState, useRef, useCallback, useEffect } from 'react'
import { FoodItem } from './types'
import { Icon } from '@components'

interface Props {
  items: FoodItem[]
  periodLabel: string
  periodIcon: string
  emptyText: string
  onSpin: (result: FoodItem) => void
  onEdit: () => void
}

const WHEEL_COLORS = [
  'var(--color-primary)',
  'var(--color-secondary)',
  'var(--color-tertiary)',
  'var(--color-on-primary-container)',
  'var(--color-secondary-fixed-dim)',
  'var(--color-tertiary-fixed-dim)',
]

function getSegmentColor(index: number): string {
  return WHEEL_COLORS[index % WHEEL_COLORS.length]
}

export default function FoodWheel({ items, periodLabel, periodIcon, emptyText, onSpin, onEdit }: Props) {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [selected, setSelected] = useState<FoodItem | null>(null)
  const wheelRef = useRef<HTMLDivElement>(null)

  const activeItems = items.filter(i => !i.disabled)

  const spin = useCallback(() => {
    if (spinning || activeItems.length === 0) return

    setSpinning(true)
    setSelected(null)

    const targetIndex = Math.floor(Math.random() * activeItems.length)
    const segmentAngle = 360 / activeItems.length
    const targetAngle = targetIndex * segmentAngle + segmentAngle / 2
    const fullSpins = 3 + Math.floor(Math.random() * 4) // 3-6 full spins
    const totalRotation = rotation + fullSpins * 360 + (360 - (rotation % 360) + targetAngle)

    setRotation(totalRotation)
  }, [spinning, activeItems, rotation])

  const handleTransitionEnd = useCallback(() => {
    if (!spinning) return
    setSpinning(false)

    const targetIndex = Math.floor(Math.random() * activeItems.length) // recreate instead of storing
    // Actually, we need to find which item was selected.
    // Since we computed targetAngle from targetIndex, reconstruct it:
    const segmentAngle = 360 / activeItems.length
    const effectiveRotation = rotation % 360
    // The pointer is at top (0deg). The wheel rotated `effectiveRotation` degrees clockwise.
    // The segment at the pointer is the one whose range covers (360 - effectiveRotation) % 360
    const pointerAngle = (360 - effectiveRotation + 360) % 360
    const idx = Math.floor(pointerAngle / segmentAngle) % activeItems.length
    const result = activeItems[idx]
    setSelected(result)
    onSpin(result)
  }, [spinning, rotation, activeItems, onSpin])

  // Empty state
  if (activeItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-md text-center">
        <span className="text-5xl opacity-30">{periodIcon}</span>
        <p className="font-body-md text-body-md text-text-muted">{emptyText}</p>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-xs rounded-[2px] bg-primary px-sm py-2 font-body-md text-sm font-semibold text-on-primary transition-premium hover:opacity-90"
        >
          <Icon name="add" className="text-base" />
          添加选项
        </button>
      </div>
    )
  }

  // Single item
  if (activeItems.length === 1) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-md text-center">
        <div className="w-48 h-48 rounded-full border-2 border-primary flex items-center justify-center">
          <span className="font-headline-md text-headline-md text-primary">{activeItems[0].name}</span>
        </div>
        <p className="font-body-md text-body-md text-text-muted">只有一个选项，就是它了！</p>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-label-mono text-text-muted hover:text-on-surface transition-premium"
        >
          管理菜单
        </button>
      </div>
    )
  }

  const segmentAngle = 360 / activeItems.length

  // Build conic-gradient string
  const gradientParts = activeItems.map((_, i) => {
    const from = i * segmentAngle
    const to = (i + 1) * segmentAngle
    const color = getSegmentColor(i)
    return `${color} ${from}deg ${to}deg`
  })
  const conicGradient = `conic-gradient(${gradientParts.join(', ')})`

  // For text labels, we rotate each one to the center of its segment
  const labels = activeItems.map((item, i) => {
    const midAngle = i * segmentAngle + segmentAngle / 2
    return { item, midAngle }
  })

  // Show at most item count or max 24 labels — if too many, show every other
  const showEvery = activeItems.length > 24 ? 2 : 1

  return (
    <div className="flex flex-col items-center justify-center h-full gap-md">
      {/* Period header */}
      <div className="flex items-center gap-xs">
        <span className="text-lg">{periodIcon}</span>
        <span className="font-label-mono text-xs uppercase text-secondary">{periodLabel}</span>
      </div>

      {/* Wheel container */}
      <div className="relative w-64 h-64 md:w-72 md:h-72">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[18px] border-l-transparent border-r-transparent border-t-primary drop-shadow-md" />
        </div>

        {/* Wheel */}
        <div
          ref={wheelRef}
          className="w-full h-full rounded-full relative"
          style={{
            background: conicGradient,
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            boxShadow: '0 0 0 4px var(--color-panel-border-strong), 0 8px 32px var(--color-panel-shadow)',
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {/* Labels on wheel */}
          {labels.map(({ item, midAngle }, i) => {
            if (i % showEvery !== 0) return null
            const offsetAngle = midAngle
            return (
              <div
                key={item.id}
                className="absolute top-0 left-0 w-full h-full"
                style={{ transform: `rotate(${offsetAngle}deg)` }}
              >
                <span
                  className="absolute left-1/2 top-2 -translate-x-1/2 text-xs font-semibold whitespace-nowrap truncate max-w-[72px] text-center"
                  style={{
                    color: 'var(--color-on-primary)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}
                  title={item.name}
                >
                  {item.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Spin button */}
      <button
        type="button"
        onClick={spin}
        disabled={spinning}
        className={`inline-flex items-center gap-xs rounded-[2px] px-md py-sm font-body-md font-semibold transition-premium ${
          spinning
            ? 'bg-text-muted/20 text-text-muted cursor-not-allowed'
            : 'bg-primary text-on-primary hover:opacity-90'
        }`}
      >
        <Icon name="smart_display" className="text-lg" />
        {spinning ? '转盘中...' : '转一次'}
      </button>

      {/* Result display */}
      {selected && (
        <div className="text-center animate-fade-in">
          <p className="font-label-mono text-xs text-text-muted">今日推荐</p>
          <p className="font-headline-md text-headline-md text-on-surface mt-xs">{selected.name}</p>
        </div>
      )}

      {/* Edit link */}
      <button
        type="button"
        onClick={onEdit}
        className="text-xs font-label-mono text-text-muted hover:text-on-surface transition-premium"
      >
        <Icon name="rate_review" className="text-sm mr-1" />
        管理菜单
      </button>
    </div>
  )
}
```

Note: There's a bug in the above — `handleTransitionEnd` recomputes randomly. The correct approach is to **store the target index** in a ref during spin. Let me fix this:

```typescript
// In the component:
const targetRef = useRef<number>(0)

const spin = useCallback(() => {
  if (spinning || activeItems.length === 0) return
  setSpinning(true)
  setSelected(null)

  const targetIndex = Math.floor(Math.random() * activeItems.length)
  targetRef.current = targetIndex
  const segmentAngle = 360 / activeItems.length
  const targetAngle = targetIndex * segmentAngle + segmentAngle / 2
  const fullSpins = 3 + Math.floor(Math.random() * 4)
  const totalRotation = rotation + fullSpins * 360 + (360 - (rotation % 360) + targetAngle)
  setRotation(totalRotation)
}, [spinning, activeItems, rotation])

const handleTransitionEnd = useCallback(() => {
  if (!spinning) return
  setSpinning(false)
  const result = activeItems[targetRef.current]
  if (result) {
    setSelected(result)
    onSpin(result)
  }
}, [spinning, activeItems, onSpin])
```

- [ ] **Step 1: Write FoodWheel.tsx**

```tsx
import { useState, useRef, useCallback } from 'react'
import { FoodItem } from './types'
import Icon from '../../components/Icon'

interface Props {
  items: FoodItem[]
  periodLabel: string
  periodIcon: string
  emptyText: string
  onSpin: (result: FoodItem) => void
  onEdit: () => void
}

const WHEEL_COLORS = [
  '#006c7a', '#c2410c', '#d97706', '#0891b2', '#a5b4fc', '#f59e0b',
  '#0e7490', '#dc2626', '#4f46e5', '#059669', '#db2777', '#7c3aed',
]

function getSegmentColor(index: number): string {
  return WHEEL_COLORS[index % WHEEL_COLORS.length]
}

export default function FoodWheel({ items, periodLabel, periodIcon, emptyText, onSpin, onEdit }: Props) {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [selected, setSelected] = useState<FoodItem | null>(null)
  const targetRef = useRef(0)

  const activeItems = items.filter(i => !i.disabled)

  const spin = useCallback(() => {
    if (spinning || activeItems.length === 0) return

    setSpinning(true)
    setSelected(null)

    const targetIndex = Math.floor(Math.random() * activeItems.length)
    targetRef.current = targetIndex
    const segmentAngle = 360 / activeItems.length
    const targetAngle = targetIndex * segmentAngle + segmentAngle / 2
    const fullSpins = 3 + Math.floor(Math.random() * 4)
    const totalRotation = rotation + fullSpins * 360 + (360 - (rotation % 360) + targetAngle)

    setRotation(totalRotation)
  }, [spinning, activeItems, rotation])

  const handleTransitionEnd = useCallback(() => {
    if (!spinning) return
    setSpinning(false)
    const result = activeItems[targetRef.current]
    if (result) {
      setSelected(result)
      onSpin(result)
    }
  }, [spinning, activeItems, onSpin])

  // Empty state
  if (activeItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-md text-center">
        <span className="text-5xl opacity-30">{periodIcon}</span>
        <p className="font-body-md text-body-md text-text-muted">{emptyText}</p>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-xs rounded-[2px] bg-primary px-sm py-2 font-body-md text-sm font-semibold text-on-primary transition-premium hover:opacity-90"
        >
          <Icon name="add" className="text-base" />
          添加选项
        </button>
      </div>
    )
  }

  // Single item — just show it
  if (activeItems.length === 1) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-md text-center">
        <div className="w-48 h-48 rounded-full border-2 border-primary flex items-center justify-center">
          <span className="font-headline-md text-headline-md text-primary">{activeItems[0].name}</span>
        </div>
        <p className="font-body-md text-body-md text-text-muted">只有一个选项，就是它了！</p>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-label-mono text-text-muted hover:text-on-surface transition-premium"
        >
          管理菜单
        </button>
      </div>
    )
  }

  const segmentAngle = 360 / activeItems.length

  // Build conic-gradient
  const gradientParts = activeItems.map((_, i) => {
    const from = i * segmentAngle
    const to = (i + 1) * segmentAngle
    const color = getSegmentColor(i)
    return `${color} ${from}deg ${to}deg`
  })
  const conicGradient = `conic-gradient(${gradientParts.join(', ')})`

  // Label positions — rotate each label to the center of its segment
  const labels = activeItems.map((_item, i) => ({
    midAngle: i * segmentAngle + segmentAngle / 2,
  }))

  const showEvery = activeItems.length > 24 ? 2 : 1

  return (
    <div className="flex flex-col items-center justify-center h-full gap-md">
      {/* Period header */}
      <div className="flex items-center gap-xs">
        <span className="text-lg">{periodIcon}</span>
        <span className="font-label-mono text-xs uppercase text-secondary">{periodLabel}</span>
      </div>

      {/* Wheel + pointer */}
      <div className="relative w-64 h-64 md:w-72 md:h-72">
        {/* Pointer triangle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[18px] border-l-transparent border-r-transparent border-t-primary drop-shadow-md" />
        </div>

        {/* Wheel */}
        <div
          className="w-full h-full rounded-full relative"
          style={{
            background: conicGradient,
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            boxShadow: `0 0 0 4px var(--color-panel-border-strong), 0 8px 32px var(--color-panel-shadow)`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {labels.map(({ midAngle }, i) => {
            if (i % showEvery !== 0) return null
            return (
              <div
                key={activeItems[i].id}
                className="absolute top-0 left-0 w-full h-full"
                style={{ transform: `rotate(${midAngle}deg)` }}
              >
                <span
                  className="absolute left-1/2 top-2 -translate-x-1/2 text-xs font-semibold whitespace-nowrap truncate max-w-[72px] text-center"
                  style={{
                    color: '#ffffff',
                    textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  }}
                  title={activeItems[i].name}
                >
                  {activeItems[i].name}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Spin button */}
      <button
        type="button"
        onClick={spin}
        disabled={spinning}
        className={`inline-flex items-center gap-xs rounded-[2px] px-md py-sm font-body-md font-semibold transition-premium ${
          spinning
            ? 'bg-text-muted/20 text-text-muted cursor-not-allowed'
            : 'bg-primary text-on-primary hover:opacity-90'
        }`}
      >
        <Icon name="smart_display" className="text-lg" />
        {spinning ? '转盘中...' : '🎯 转一次'}
      </button>

      {/* Result */}
      {selected && (
        <div className="text-center">
          <p className="font-label-mono text-xs text-text-muted">今日推荐</p>
          <p className="font-headline-md text-headline-md text-on-surface mt-xs">{selected.name}</p>
        </div>
      )}

      {/* Hidden edit trigger — we pass it up, the parent manages edit mode */}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/plugins/food/FoodWheel.tsx
git commit -m "feat(food): add wheel component with conic-gradient and spin animation"
```

---

### Task 5: Management drawer (FoodManager.tsx)

**Files:**
- Create: `src/plugins/food/FoodManager.tsx`

A drawer (matching ContactDrawer pattern) with two tabs: noon (add/remove/edit) and evening (browse built-in recipes with disable toggle + add custom).

- [ ] **Step 1: Write FoodManager.tsx**

```tsx
import { useState } from 'react'
import { FoodItem } from './types'
import { EveningData } from './types'
import { saveNoonItems, saveEveningData, genId } from './utils'
import { getRecipeGroups } from './recipes'
import Icon from '../../components/Icon'

interface Props {
  open: boolean
  noonItems: FoodItem[]
  eveningData: EveningData
  onClose: () => void
  onSave: (noonItems: FoodItem[], eveningData: EveningData) => void
}

type Tab = 'noon' | 'evening'

export default function FoodManager({ open, noonItems, eveningData, onClose, onSave }: Props) {
  const [tab, setTab] = useState<Tab>('noon')
  const [localNoon, setLocalNoon] = useState<FoodItem[]>(noonItems)
  const [localEvening, setLocalEvening] = useState<EveningData>(eveningData)
  const [newItemName, setNewItemName] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())

  const recipeGroups = getRecipeGroups()

  const handleSave = () => {
    saveNoonItems(localNoon)
    saveEveningData(localEvening)
    onSave(localNoon, localEvening)
    onClose()
  }

  const addNoonItem = () => {
    const name = newItemName.trim()
    if (!name) return
    setLocalNoon(prev => [...prev, { id: genId(), name, source: 'user' }])
    setNewItemName('')
  }

  const removeNoonItem = (id: string) => {
    setLocalNoon(prev => prev.filter(i => i.id !== id))
  }

  const startEdit = (item: FoodItem) => {
    setEditId(item.id)
    setEditName(item.name)
  }

  const confirmEdit = () => {
    if (!editId || !editName.trim()) return
    setLocalNoon(prev => prev.map(i => i.id === editId ? { ...i, name: editName.trim() } : i))
    setEditId(null)
    setEditName('')
  }

  const toggleDisableBuiltin = (builtinId: string) => {
    setLocalEvening(prev => {
      const ids = prev.disabledIds.includes(builtinId)
        ? prev.disabledIds.filter(id => id !== builtinId)
        : [...prev.disabledIds, builtinId]
      return { ...prev, disabledIds: ids }
    })
  }

  const addCustomEvening = () => {
    const name = newItemName.trim()
    if (!name) return
    setLocalEvening(prev => ({
      ...prev,
      custom: [...prev.custom, { id: genId(), name, source: 'user' as const }],
    }))
    setNewItemName('')
  }

  const removeCustomEvening = (id: string) => {
    setLocalEvening(prev => ({
      ...prev,
      custom: prev.custom.filter(i => i.id !== id),
    }))
  }

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  if (!open) return null

  return (
    <div className="drawer-layer open" aria-hidden={!open}>
      <button className="drawer-backdrop" type="button" aria-label="关闭" onClick={onClose} />
      <section className="contact-drawer" role="dialog" aria-modal="true" aria-label="管理菜单">
        {/* Header */}
        <div className="flex items-start justify-between gap-md mb-lg">
          <div>
            <span className="font-label-mono text-xs text-primary">FOOD MANAGER</span>
            <h2 className="font-headline-md text-headline-md text-on-surface mt-xs">管理菜单</h2>
          </div>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-on-surface transition-premium" aria-label="关闭">
            <Icon name="close" className="text-2xl" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-md border-b border-border-subtle">
          <button
            type="button"
            onClick={() => setTab('noon')}
            className={`pb-sm px-sm text-sm font-label-mono transition-premium border-b-2 ${
              tab === 'noon' ? 'border-primary text-on-surface' : 'border-transparent text-text-muted hover:text-on-surface'
            }`}
          >
            ☀️ 中午清单
          </button>
          <button
            type="button"
            onClick={() => setTab('evening')}
            className={`pb-sm px-sm text-sm font-label-mono transition-premium border-b-2 ${
              tab === 'evening' ? 'border-primary text-on-surface' : 'border-transparent text-text-muted hover:text-on-surface'
            }`}
          >
            🌙 晚上菜谱
          </button>
        </div>

        {/* Tab content — scrollable */}
        <div className="flex-1 overflow-y-auto" style={{ height: 'calc(100% - 140px)' }}>
          {tab === 'noon' && (
            <div className="flex flex-col gap-sm">
              {/* Add new */}
              <div className="flex gap-xs">
                <input
                  type="text"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addNoonItem()}
                  placeholder="添加餐厅/菜品..."
                  className="flex-1 surface-control rounded-[2px] px-sm py-2 font-body-md text-sm text-on-surface outline-none focus:border-primary transition-premium"
                />
                <button
                  type="button"
                  onClick={addNoonItem}
                  className="inline-flex items-center gap-xs rounded-[2px] bg-primary px-sm py-2 font-body-md text-sm font-semibold text-on-primary hover:opacity-90 transition-premium shrink-0"
                >
                  <Icon name="add" className="text-base" />
                  添加
                </button>
              </div>

              {/* List */}
              {localNoon.length === 0 && (
                <p className="font-body-md text-sm text-text-muted text-center py-lg">还没有添加选项</p>
              )}
              {localNoon.map(item => (
                <div key={item.id} className="flex items-center gap-xs surface-item rounded-[2px] px-sm py-2">
                  {editId === item.id ? (
                    <>
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && confirmEdit()}
                        className="flex-1 surface-control rounded-[2px] px-sm py-1 font-body-md text-sm outline-none"
                        autoFocus
                      />
                      <button type="button" onClick={confirmEdit} className="text-primary hover:text-on-surface transition-premium">
                        <Icon name="check" className="text-lg" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 font-body-md text-sm text-on-surface">{item.name}</span>
                      <button type="button" onClick={() => startEdit(item)} className="text-text-muted hover:text-on-surface transition-premium">
                        <Icon name="rate_review" className="text-lg" />
                      </button>
                      <button type="button" onClick={() => removeNoonItem(item.id)} className="text-text-muted hover:text-error transition-premium">
                        <Icon name="delete" className="text-lg" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'evening' && (
            <div className="flex flex-col gap-sm">
              {/* Add custom */}
              <div className="flex gap-xs">
                <input
                  type="text"
                  value={newItemName}
                  onChange={e => { setNewItemName(e.target.value); setTab('evening') }}
                  placeholder="添加自定义菜名..."
                  className="flex-1 surface-control rounded-[2px] px-sm py-2 font-body-md text-sm text-on-surface outline-none focus:border-primary transition-premium"
                  onKeyDown={e => e.key === 'Enter' && addCustomEvening()}
                />
                <button
                  type="button"
                  onClick={addCustomEvening}
                  className="inline-flex items-center gap-xs rounded-[2px] bg-primary px-sm py-2 font-body-md text-sm font-semibold text-on-primary hover:opacity-90 transition-premium shrink-0"
                >
                  <Icon name="add" className="text-base" />
                  添加
                </button>
              </div>

              {/* Custom items section */}
              {localEvening.custom.length > 0 && (
                <div className="mb-sm">
                  <p className="font-label-mono text-xs text-text-muted mb-xs">自定义菜谱</p>
                  {localEvening.custom.map(item => (
                    <div key={item.id} className="flex items-center gap-xs surface-item rounded-[2px] px-sm py-2">
                      <span className="flex-1 font-body-md text-sm text-on-surface">{item.name}</span>
                      <button type="button" onClick={() => removeCustomEvening(item.id)} className="text-text-muted hover:text-error transition-premium">
                        <Icon name="delete" className="text-lg" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Built-in recipe categories */}
              <p className="font-label-mono text-xs text-text-muted mb-xs">内置菜谱</p>
              {recipeGroups.map(group => (
                <div key={group.category} className="surface-item rounded-[2px]">
                  <button
                    type="button"
                    onClick={() => toggleCategory(group.category)}
                    className="flex items-center gap-xs w-full px-sm py-2 text-left"
                  >
                    <Icon name={collapsedCategories.has(group.category) ? 'chevron_right' : 'chevron_left'} className="text-sm text-text-muted" />
                    <span className="flex-1 font-body-md text-sm text-on-surface capitalize">{group.category}</span>
                    <span className="font-label-mono text-xs text-text-muted">{group.items.length}道</span>
                  </button>
                  {!collapsedCategories.has(group.category) && (
                    <div className="px-sm pb-sm flex flex-wrap gap-1">
                      {group.items.map((name, i) => {
                        const builtinId = `builtin-${group.items.indexOf(name)}`
                        // Need to find actual index in the full list — use a lookup
                        // Recompute properly via the recipe data ordering
                        const catPrefix = ['vegetable', 'meat', 'soup', 'staple', 'cold', 'seafood', 'hotpot']
                        let globalIdx = 0
                        for (const g of recipeGroups) {
                          if (g.category === group.category) {
                            globalIdx += group.items.indexOf(name)
                            break
                          }
                          globalIdx += g.items.length
                        }
                        const fullId = `builtin-${globalIdx}`
                        const disabled = localEvening.disabledIds.includes(fullId)
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => toggleDisableBuiltin(fullId)}
                            className={`text-xs px-2 py-1 rounded-[2px] transition-premium ${
                              disabled
                                ? 'bg-error/10 text-text-muted line-through'
                                : 'bg-primary/10 text-on-surface hover:bg-primary/20'
                            }`}
                          >
                            {name}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer save button */}
        <div className="border-t border-border-subtle pt-md mt-md">
          <button
            type="button"
            onClick={handleSave}
            className="w-full inline-flex items-center justify-center gap-xs rounded-[2px] bg-primary px-md py-sm font-body-md font-semibold text-on-primary hover:opacity-90 transition-premium"
          >
            <Icon name="check" className="text-lg" />
            保存
          </button>
        </div>
      </section>
    </div>
  )
}
```

Wait, the builtin ID lookup is fragile. Let me fix it by using the `buildEveningItems` function to find the actual index.

Actually, the simplest approach: in `recipes.ts`, export a `getAllRecipeNames()` that returns the flat array. The index in that flat array is the builtin ID suffix.

Let me simplify — instead of trying to compute the index in the component, pass the `disabledIds` and `toggleDisableBuiltin` as props. The management drawer should use the flat list from recipes.

Let me revise the evening tab part to be simpler:

For the recipe categories, rather than trying to map back to global indices, let me just embed the index computation:

```typescript
// In recipes.ts also export the flat array with indices
export function getFlatRecipes(): Array<{ id: string; name: string; category: string }> {
  const result: Array<{ id: string; name: string; category: string }> = []
  for (const group of RECIPE_DATA) {
    for (const name of group.items) {
      result.push({ id: `builtin-${result.length}`, name, category: group.category })
    }
  }
  return result
}
```

Then in FoodManager, use this flat list grouped by category. This is cleaner.

Let me rewrite the plan accordingly.

Actually, I think the plan is getting too long with full code. Let me stick to the key patterns and let the developer (subagent) implement. The plan should be detailed enough to execute without ambiguity, but I don't need every single line. Let me restructure.

Actually, looking at the writing-plans guidelines more carefully: "Complete code in every step — if a step changes code, show the code." So I need to show complete code. Let me write the plan as cleanly as possible.

Let me also think about the categories more carefully. The recipe groups in recipes.ts:

```typescript
const RECIPE_DATA: RecipeGroup[] = [
  { category: 'vegetable', items: ['番茄炒蛋', '酸辣土豆丝', ...] }, // 30 items
  { category: 'meat', items: ['红烧肉', ...] }, // 35 items
  { category: 'soup', items: ['紫菜蛋花汤', ...] }, // 20 items
  { category: 'staple', items: ['蛋炒饭', ...] }, // 25 items
  { category: 'cold', items: ['凉拌黄瓜', ...] }, // 20 items
  { category: 'seafood', items: ['清蒸鲈鱼', ...] }, // 15 items
  { category: 'hotpot', items: ['麻辣火锅', ...] }, // 10 items
]
```

Total: ~155 items. Good enough.

For the FoodManager, I'll add `getFlatRecipes()` to recipes.ts, which returns items with global index IDs. Then the FoodManager just uses those IDs for toggling.

Let me write a cleaner version of the plan. I'll revise the recipes.ts to include `getFlatRecipes()`.

OK let me just write the whole plan document now. I need to be thorough but I also need to keep it to a reasonable size. Let me focus on the key details that matter for implementation.<｜end▁of▁thinking｜>Now let me write the full implementation plan:

<｜｜DSML｜｜tool_calls>
<｜｜DSML｜｜invoke name="Write">
<｜｜DSML｜｜parameter name="content" string="true"># 🍽️ 今天吃什么 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "what to eat today" wheel-spinner plugin to the personal homepage, auto-switching between noon (nearby lunch) and evening (cook-at-home dinner) based on Beijing time.

**Architecture:** A new `food` plugin under `src/plugins/food/`. The main component reads Beijing time to decide which data set to show. The wheel uses CSS `conic-gradient` for rendering and CSS `transform: rotate()` with a `cubic-bezier` transition for the spin animation. Data lives in localStorage; evening dinner options come from a built-in recipe library (~155 dishes) plus user custom items.

**Tech Stack:** React 18, TypeScript, TailwindCSS (custom design tokens: `font-label-mono`, `text-on-surface`, `surface-panel`, etc.)

---

## File Structure

### New files (6)

| File | Responsibility |
|------|---------------|
| `src/plugins/food/types.ts` | All type/interface definitions |
| `src/plugins/food/utils.ts` | `getBeijingHour()`, `getCurrentPeriod()`, localStorage CRUD |
| `src/plugins/food/recipes.ts` | ~155 built-in Chinese home-cook recipes, flat + grouped accessors |
| `src/plugins/food/FoodWheel.tsx` | Wheel: conic-gradient render + spin animation + result display |
| `src/plugins/food/FoodManager.tsx` | Management drawer: CRUD noon items, toggle/allergic built-in recipes |
| `src/plugins/food/index.tsx` | Main plugin: time-slot logic, preview toggle, edit mode state |

### Modified files (3)

| File | Change |
|------|--------|
| `src/plugins/index.ts` | Register `food` plugin (enabled: true, order: 7) |
| `src/App.tsx` | Add route item `{ id: 'food', label: '吃啥', href: routeHash('food'), pluginId: 'food' }` |
| `src/core/routeBridge.ts` | Add `'food'` to `HubRouteId` union and `routeAliases` |

---

### Task 1: Types (types.ts)

**Files:**
- Create: `src/plugins/food/types.ts`

```typescript
export interface FoodItem {
  id: string
  name: string
  source: 'user' | 'builtin'
  disabled?: boolean
}

export interface EveningData {
  custom: FoodItem[]
  disabledIds: string[]
}

export interface WheelResult {
  item: FoodItem
  timestamp: string
  period: 'noon' | 'evening'
}

export type Period = 'noon' | 'evening'
```

- [ ] **Step 1:** `mkdir -p src/plugins/food` then write `types.ts` with the above content
- [ ] **Step 2:** `git add src/plugins/food/types.ts && git commit -m "feat(food): add type definitions"`

---

### Task 2: Utilities (utils.ts)

**Files:**
- Create: `src/plugins/food/utils.ts`

```typescript
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
```

- [ ] **Step 1:** Write `utils.ts` with the above
- [ ] **Step 2:** `git commit -m "feat(food): add utility functions"`

---

### Task 3: Recipe library (recipes.ts)

**Files:**
- Create: `src/plugins/food/recipes.ts`

Contains ~155 Chinese home-cook dishes in 7 categories. Exports both grouped (for UI display in manager) and flat (for building the evening wheel data).

```typescript
import { FoodItem } from './types'

export interface RecipeGroup {
  category: string   // 'vegetable' | 'meat' | 'soup' | 'staple' | 'cold' | 'seafood' | 'hotpot'
  label: string      // Chinese label for UI
  items: string[]
}

const RECIPE_GROUPS: RecipeGroup[] = [
  {
    category: 'vegetable', label: '素菜',
    items: [
      '番茄炒蛋', '酸辣土豆丝', '手撕包菜', '干煸四季豆', '地三鲜',
      '清炒时蔬', '蒜蓉空心菜', '蚝油生菜', '蒜蓉西兰花', '醋溜白菜',
      '鱼香茄子', '麻婆豆腐', '家常豆腐', '红烧茄子', '香煎豆腐',
      '蒜蓉豆角', '清炒荷兰豆', '香菇油菜', '腐乳通菜', '炝炒圆白菜',
      '干锅花菜', '素炒杏鲍菇', '虎皮青椒', '松仁玉米', '拔丝地瓜',
      '蜜汁南瓜', '荷塘小炒', '丝瓜炒蛋', '韭菜炒蛋', '葱烧豆腐',
    ],
  },
  {
    category: 'meat', label: '肉菜',
    items: [
      '红烧肉', '糖醋排骨', '可乐鸡翅', '回锅肉', '宫保鸡丁',
      '鱼香肉丝', '青椒肉丝', '木须肉', '土豆烧牛肉', '西红柿牛腩',
      '红烧排骨', '酱香鸡腿', '蜜汁鸡翅', '蒜香排骨', '椒盐排骨',
      '水煮肉片', '辣子鸡丁', '啤酒鸭', '红烧鸡块', '粉蒸肉',
      '梅菜扣肉', '红烧猪蹄', '卤牛肉', '葱爆羊肉', '京酱肉丝',
      '菠萝咕咾肉', '小炒肉', '干锅肥肠', '孜然牛肉', '糖醋里脊',
      '蒜蓉蒸排骨', '黑椒牛柳', '酱爆肉丁', '蒜香鸡翅', '豉汁蒸排骨',
    ],
  },
  {
    category: 'soup', label: '汤类',
    items: [
      '紫菜蛋花汤', '番茄蛋汤', '玉米排骨汤', '酸辣汤', '冬瓜排骨汤',
      '萝卜丝鲫鱼汤', '豆腐青菜汤', '菌菇汤', '紫菜虾皮汤', '番茄肉丸汤',
      '白菜豆腐汤', '味增汤', '南瓜浓汤', '花蛤冬瓜汤', '番茄牛腩汤',
      '海带排骨汤', '山药排骨汤', '莲藕排骨汤', '疙瘩汤', '豆腐鱼头汤',
    ],
  },
  {
    category: 'staple', label: '主食',
    items: [
      '蛋炒饭', '炒面', '煮面条', '炒河粉', '煎饺',
      '扬州炒饭', '西红柿鸡蛋面', '葱油拌面', '担担面', '酸辣粉',
      '肉酱意面', '炒米粉', '炒年糕', '焖饭', '煲仔饭',
      '炒饼', '汤圆', '饺子', '馄饨', '热干面',
      '炸酱面', '麻辣拌面', '葱油面', '阳春面', '麻辣烫',
    ],
  },
  {
    category: 'cold', label: '凉菜',
    items: [
      '凉拌黄瓜', '皮蛋豆腐', '口水鸡', '凉拌木耳', '凉拌海带丝',
      '凉拌皮蛋', '蒜泥白肉', '凉拌豆皮', '红油耳丝', '凉拌三丝',
      '凉拌藕片', '拍黄瓜', '凉拌西红柿', '手撕鸡', '夫妻肺片',
      '凉拌菠菜', '柠檬鸡爪', '凉拌金针菇', '凉拌粉丝', '葱油鸡',
    ],
  },
  {
    category: 'seafood', label: '海鲜',
    items: [
      '清蒸鲈鱼', '红烧鱼块', '酸菜鱼', '水煮鱼', '糖醋鱼',
      '椒盐虾', '白灼虾', '蒜蓉粉丝蒸扇贝', '葱姜炒蟹', '辣炒花蛤',
      '红烧带鱼', '油焖大虾', '蒜蓉生蚝', '干煎带鱼', '葱油鲈鱼',
    ],
  },
  {
    category: 'hotpot', label: '火锅/特色',
    items: [
      '麻辣火锅', '清汤火锅', '番茄火锅', '寿喜锅', '部队锅',
      '椰子鸡火锅', '粥底火锅', '涮羊肉', '串串香', '冒菜',
    ],
  },
]

/** Build a flat array of all recipe names indexed by their global position */
const FLAT_RECIPES: Array<{ id: string; name: string; category: string }> = []
for (const group of RECIPE_GROUPS) {
  for (const name of group.items) {
    FLAT_RECIPES.push({ id: `builtin-${FLAT_RECIPES.length}`, name, category: group.category })
  }
}

/** Build the full evening FoodItem list: builtins (with disabled status) + user custom items */
export function buildEveningItems(custom: FoodItem[], disabledIds: string[]): FoodItem[] {
  const builtins: FoodItem[] = FLAT_RECIPES.map(r => ({
    id: r.id,
    name: r.name,
    source: 'builtin' as const,
    disabled: disabledIds.includes(r.id),
  }))
  return [...builtins, ...custom.map(c => ({ ...c, disabled: false }))]
}

export function getRecipeGroups(): RecipeGroup[] {
  return RECIPE_GROUPS
}

/** Flat array of all built-in recipes with id (used in FoodManager for toggling) */
export function getFlatRecipes(): Array<{ id: string; name: string; category: string }> {
  return FLAT_RECIPES
}
```

- [ ] **Step 1:** Write `recipes.ts` with the above content
- [ ] **Step 2:** `git commit -m "feat(food): add built-in recipe library (~155 dishes)"`

---

### Task 4: Wheel component (FoodWheel.tsx)

**Files:**
- Create: `src/plugins/food/FoodWheel.tsx`

Renders a circle with CSS `conic-gradient` (one color per segment from a rotating palette), a pointer triangle at top center, and text labels rotated to segment midpoints. On click → pick random target → compute total rotation (3-6 full spins + offset to target) → CSS transition → on `transitionEnd` → highlight result.

States covered:
- **Empty:** No active items → show icon + emptyText + "add" button
- **Single item:** Display it directly in a circle
- **Normal:** Full wheel with spin animation
- **Spinning:** Button disabled, "转盘中..."

```tsx
import { useState, useRef, useCallback } from 'react'
import { FoodItem } from './types'
import Icon from '../../components/Icon'

interface Props {
  items: FoodItem[]
  periodLabel: string
  periodIcon: string
  emptyText: string
  onSpin: (result: FoodItem) => void
  onEdit: () => void
}

const SEGMENT_COLORS = [
  '#006c7a', '#c2410c', '#d97706', '#0891b2', '#7c3aed',
  '#059669', '#db2777', '#4f46e5', '#dc2626', '#0e7490',
  '#b91c1c', '#1d4ed8',
]

export default function FoodWheel({ items, periodLabel, periodIcon, emptyText, onSpin, onEdit }: Props) {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [selected, setSelected] = useState<FoodItem | null>(null)
  const targetRef = useRef(0)

  const activeItems = items.filter(i => !i.disabled)

  const spin = useCallback(() => {
    if (spinning || activeItems.length === 0) return
    setSpinning(true)
    setSelected(null)

    const targetIndex = Math.floor(Math.random() * activeItems.length)
    targetRef.current = targetIndex
    const segAngle = 360 / activeItems.length
    const targetAngle = targetIndex * segAngle + segAngle / 2
    const fullSpins = 3 + Math.floor(Math.random() * 4)
    const total = rotation + fullSpins * 360 + (360 - (rotation % 360) + targetAngle)
    setRotation(total)
  }, [spinning, activeItems, rotation])

  const handleTransitionEnd = useCallback(() => {
    if (!spinning) return
    setSpinning(false)
    const result = activeItems[targetRef.current]
    if (result) { setSelected(result); onSpin(result) }
  }, [spinning, activeItems, onSpin])

  // Empty
  if (activeItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-md text-center">
        <span className="text-5xl opacity-30">{periodIcon}</span>
        <p className="font-body-md text-body-md text-text-muted">{emptyText}</p>
        <button type="button" onClick={onEdit}
          className="inline-flex items-center gap-xs rounded-[2px] bg-primary px-sm py-2 font-body-md text-sm font-semibold text-on-primary transition-premium hover:opacity-90">
          <Icon name="add" className="text-base" />添加选项
        </button>
      </div>
    )
  }

  // Single item
  if (activeItems.length === 1) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-md text-center">
        <div className="w-48 h-48 rounded-full border-2 border-primary flex items-center justify-center">
          <span className="font-headline-md text-headline-md text-primary">{activeItems[0].name}</span>
        </div>
        <p className="font-body-md text-body-md text-text-muted">只有一个选项，就是它了！</p>
      </div>
    )
  }

  const segAngle = 360 / activeItems.length
  const gradParts = activeItems.map((_, i) =>
    `${SEGMENT_COLORS[i % SEGMENT_COLORS.length]} ${i * segAngle}deg ${(i + 1) * segAngle}deg`
  )
  const showEvery = activeItems.length > 24 ? 2 : 1

  return (
    <div className="flex flex-col items-center justify-center h-full gap-md select-none">
      {/* Period header */}
      <div className="flex items-center gap-xs">
        <span className="text-lg">{periodIcon}</span>
        <span className="font-label-mono text-xs uppercase text-secondary">{periodLabel}</span>
      </div>

      {/* Wheel */}
      <div className="relative w-64 h-64 md:w-72 md:h-72">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[18px] border-l-transparent border-r-transparent border-t-primary drop-shadow-md" />
        </div>
        {/* Wheel disc */}
        <div
          className="w-full h-full rounded-full relative"
          style={{
            background: `conic-gradient(${gradParts.join(', ')})`,
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            boxShadow: '0 0 0 4px var(--color-panel-border-strong), 0 8px 32px var(--color-panel-shadow)',
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {activeItems.map((item, i) => {
            if (i % showEvery !== 0) return null
            const midAngle = i * segAngle + segAngle / 2
            return (
              <div key={item.id} className="absolute top-0 left-0 w-full h-full" style={{ transform: `rotate(${midAngle}deg)` }}>
                <span
                  className="absolute left-1/2 top-2 -translate-x-1/2 text-[11px] font-semibold whitespace-nowrap truncate max-w-[68px] text-center leading-tight"
                  style={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.45)' }}
                  title={item.name}
                >
                  {item.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Spin button */}
      <button type="button" onClick={spin} disabled={spinning}
        className={`inline-flex items-center gap-xs rounded-[2px] px-md py-sm font-body-md font-semibold transition-premium ${
          spinning
            ? 'bg-text-muted/20 text-text-muted cursor-not-allowed'
            : 'bg-primary text-on-primary hover:opacity-90'
        }`}>
        <Icon name="smart_display" className="text-lg" />
        {spinning ? '转盘中...' : '🎯 转一次'}
      </button>

      {/* Result */}
      {selected && (
        <div className="text-center">
          <p className="font-label-mono text-xs text-text-muted">今日推荐</p>
          <p className="font-headline-md text-headline-md text-on-surface mt-xs">{selected.name}</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 1:** Write `FoodWheel.tsx` with the above code
- [ ] **Step 2:** `git commit -m "feat(food): add wheel component with conic-gradient and spin animation"`

---

### Task 5: Management drawer (FoodManager.tsx)

**Files:**
- Create: `src/plugins/food/FoodManager.tsx`

Drawer matching `ContactDrawer` pattern (same CSS classes). Two tabs:
- **☀️ 中午清单** — add/rename/delete items
- **🌙 晚上菜谱** — browse built-in categories (collapsible), toggle individual recipes on/off, add custom dishes

Uses `getFlatRecipes()` from recipes.ts for the evening category browser with global-index IDs for toggling.

```tsx
import { useState } from 'react'
import { FoodItem, EveningData } from './types'
import { saveNoonItems, saveEveningData, genId } from './utils'
import { getRecipeGroups, getFlatRecipes } from './recipes'
import Icon from '../../components/Icon'

interface Props {
  open: boolean
  noonItems: FoodItem[]
  eveningData: EveningData
  onClose: () => void
  onSave: (noon: FoodItem[], evening: EveningData) => void
}

type Tab = 'noon' | 'evening'

export default function FoodManager({ open, noonItems, eveningData, onClose, onSave }: Props) {
  const [tab, setTab] = useState<Tab>('noon')
  const [localNoon, setLocalNoon] = useState<FoodItem[]>(() => [...noonItems])
  const [localEvening, setLocalEvening] = useState<EveningData>(() => ({
    custom: [...eveningData.custom],
    disabledIds: [...eveningData.disabledIds],
  }))
  const [newItemName, setNewItemName] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  const flatRecipes = getFlatRecipes()
  const recipeGroups = getRecipeGroups()

  const handleSave = () => {
    saveNoonItems(localNoon)
    saveEveningData(localEvening)
    onSave(localNoon, localEvening)
    onClose()
  }

  const addItem = () => {
    const name = newItemName.trim()
    if (!name) return
    if (tab === 'noon') {
      setLocalNoon(prev => [...prev, { id: genId(), name, source: 'user' }])
    } else {
      setLocalEvening(prev => ({
        ...prev,
        custom: [...prev.custom, { id: genId(), name, source: 'user' as const }],
      }))
    }
    setNewItemName('')
  }

  const toggleDisable = (builtinId: string) => {
    setLocalEvening(prev => ({
      ...prev,
      disabledIds: prev.disabledIds.includes(builtinId)
        ? prev.disabledIds.filter(id => id !== builtinId)
        : [...prev.disabledIds, builtinId],
    }))
  }

  if (!open) return null

  return (
    <div className="drawer-layer open" aria-hidden={!open}>
      <button className="drawer-backdrop" type="button" aria-label="关闭" onClick={onClose} />
      <section className="contact-drawer flex flex-col" role="dialog" aria-modal="true" aria-label="管理菜单">
        {/* Header */}
        <div className="flex items-start justify-between gap-md mb-lg shrink-0">
          <div>
            <span className="font-label-mono text-xs text-primary">FOOD MANAGER</span>
            <h2 className="font-headline-md text-headline-md text-on-surface mt-xs">管理菜单</h2>
          </div>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-on-surface transition-premium" aria-label="关闭">
            <Icon name="close" className="text-2xl" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-md shrink-0 border-b border-border-subtle">
          <button type="button" onClick={() => setTab('noon')}
            className={`pb-sm px-sm text-sm font-label-mono transition-premium border-b-2 ${
              tab === 'noon' ? 'border-primary text-on-surface' : 'border-transparent text-text-muted'
            }`}>
            ☀️ 中午清单
          </button>
          <button type="button" onClick={() => setTab('evening')}
            className={`pb-sm px-sm text-sm font-label-mono transition-premium border-b-2 ${
              tab === 'evening' ? 'border-primary text-on-surface' : 'border-transparent text-text-muted'
            }`}>
            🌙 晚上菜谱
          </button>
        </div>

        {/* Add input */}
        <div className="flex gap-xs mb-md shrink-0">
          <input
            type="text" value={newItemName}
            onChange={e => setNewItemName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder={tab === 'noon' ? '添加餐厅/菜品...' : '添加自定义菜名...'}
            className="flex-1 surface-control rounded-[2px] px-sm py-2 font-body-md text-sm text-on-surface outline-none focus:border-primary transition-premium"
          />
          <button type="button" onClick={addItem}
            className="inline-flex items-center gap-xs rounded-[2px] bg-primary px-sm py-2 font-body-md text-sm font-semibold text-on-primary hover:opacity-90 transition-premium shrink-0">
            <Icon name="add" className="text-base" />添加
          </button>
        </div>

        {/* Search (evening only) */}
        {tab === 'evening' && (
          <input
            type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索菜谱..."
            className="w-full surface-control rounded-[2px] px-sm py-2 font-body-md text-sm text-on-surface outline-none focus:border-primary transition-premium mb-md shrink-0"
          />
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {tab === 'noon' ? (
            localNoon.length === 0 ? (
              <p className="font-body-md text-sm text-text-muted text-center py-lg">还没有添加中午选项</p>
            ) : (
              <div className="flex flex-col gap-sm">
                {localNoon.map(item => (
                  <div key={item.id} className="flex items-center gap-xs surface-item rounded-[2px] px-sm py-2">
                    {editId === item.id ? (
                      <>
                        <input type="text" value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (() => { if (!editName.trim()) return; setLocalNoon(prev => prev.map(i => i.id === editId ? { ...i, name: editName.trim() } : i)); setEditId(null) })()}
                          className="flex-1 surface-control rounded-[2px] px-sm py-1 font-body-md text-sm outline-none" autoFocus
                        />
                        <button type="button" onClick={() => { if (!editName.trim()) return; setLocalNoon(prev => prev.map(i => i.id === editId ? { ...i, name: editName.trim() } : i)); setEditId(null) }}
                          className="text-primary hover:text-on-surface transition-premium">
                          <Icon name="check" className="text-lg" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-body-md text-sm text-on-surface">{item.name}</span>
                        <button type="button" onClick={() => { setEditId(item.id); setEditName(item.name) }}
                          className="text-text-muted hover:text-on-surface transition-premium">
                          <Icon name="rate_review" className="text-lg" />
                        </button>
                        <button type="button" onClick={() => setLocalNoon(prev => prev.filter(i => i.id !== item.id))}
                          className="text-text-muted hover:text-error transition-premium">
                          <Icon name="delete" className="text-lg" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            <>
              {/* Custom items */}
              {localEvening.custom.length > 0 && (
                <div className="mb-md">
                  <p className="font-label-mono text-xs text-text-muted mb-xs">自定义菜谱</p>
                  <div className="flex flex-col gap-sm">
                    {localEvening.custom.map(item => (
                      <div key={item.id} className="flex items-center gap-xs surface-item rounded-[2px] px-sm py-2">
                        <span className="flex-1 font-body-md text-sm text-on-surface">{item.name}</span>
                        <button type="button" onClick={() => setLocalEvening(prev => ({ ...prev, custom: prev.custom.filter(i => i.id !== item.id) }))}
                          className="text-text-muted hover:text-error transition-premium">
                          <Icon name="delete" className="text-lg" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Built-in categories */}
              <p className="font-label-mono text-xs text-text-muted mb-xs">内置菜谱 ({flatRecipes.length}道)</p>
              {recipeGroups.map(group => {
                const groupRecipes = flatRecipes.filter(r => r.category === group.category)
                const filtered = searchQuery
                  ? groupRecipes.filter(r => r.name.includes(searchQuery))
                  : groupRecipes
                if (filtered.length === 0 && !searchQuery) return null
                const isCollapsed = collapsedCats.has(group.category)
                return (
                  <div key={group.category} className="surface-item rounded-[2px] mb-sm">
                    <button type="button" onClick={() => {
                      const next = new Set(collapsedCats)
                      if (next.has(group.category)) next.delete(group.category); else next.add(group.category)
                      setCollapsedCats(next)
                    }} className="flex items-center gap-xs w-full px-sm py-2 text-left">
                      <Icon name={isCollapsed ? 'chevron_right' : 'chevron_left'} className="text-sm text-text-muted shrink-0" />
                      <span className="flex-1 font-body-md text-sm text-on-surface">{group.label}</span>
                      <span className="font-label-mono text-xs text-text-muted">{groupRecipes.length}道</span>
                    </button>
                    {!isCollapsed && (
                      <div className="px-sm pb-sm flex flex-wrap gap-1">
                        {filtered.map(r => {
                          const disabled = localEvening.disabledIds.includes(r.id)
                          return (
                            <button key={r.id} type="button" onClick={() => toggleDisable(r.id)}
                              className={`text-xs px-2 py-1 rounded-[2px] transition-premium ${
                                disabled
                                  ? 'bg-error/10 text-text-muted line-through'
                                  : 'bg-primary/10 text-on-surface hover:bg-primary/20'
                              }`}>
                              {r.name}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Save button */}
        <div className="border-t border-border-subtle pt-md mt-md shrink-0">
          <button type="button" onClick={handleSave}
            className="w-full inline-flex items-center justify-center gap-xs rounded-[2px] bg-primary px-md py-sm font-body-md font-semibold text-on-primary hover:opacity-90 transition-premium">
            <Icon name="check" className="text-lg" />保存修改
          </button>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 1:** Write `FoodManager.tsx` with the above code
- [ ] **Step 2:** `git commit -m "feat(food): add management drawer with noon/evening tabs"`

---

### Task 6: Main plugin component (index.tsx)

**Files:**
- Create: `src/plugins/food/index.tsx`

Orchestrates the plugin:
1. Loads data from localStorage on mount (noon items, evening data, today result)
2. Runs a 60s interval to check Beijing time for auto-switching
3. Tracks `period` (noon/evening) + optional `previewPeriod` override
4. Renders `FoodWheel` with the active item set
5. Manages `FoodManager` drawer open/close state
6. Wraps in a scrollable section matching the route-frame pattern

```tsx
import { useState, useEffect, useCallback } from 'react'
import { PluginRuntimeConfig } from '@core/types'
import { FoodItem, EveningData, Period } from './types'
import { loadNoonItems, loadEveningData, loadTodayResult, saveTodayResult, getCurrentPeriod, getBeijingHour } from './utils'
import { buildEveningItems } from './recipes'
import FoodWheel from './FoodWheel'
import FoodManager from './FoodManager'
import Icon from '../../components/Icon'

interface Props { config?: PluginRuntimeConfig }

export default function FoodPlugin(_props: Props) {
  const [period, setPeriod] = useState<Period>(getCurrentPeriod())
  const [previewPeriod, setPreviewPeriod] = useState<Period | null>(null)
  const [noonItems, setNoonItems] = useState<FoodItem[]>(() => loadNoonItems())
  const [eveningData, setEveningData] = useState<EveningData>(() => loadEveningData())
  const [todayResult, setTodayResult] = useState<{ item: FoodItem; period: Period } | null>(() => loadTodayResult())
  const [managerOpen, setManagerOpen] = useState(false)
  const [lastResult, setLastResult] = useState<{ item: FoodItem; period: Period } | null>(null)

  const activePeriod = previewPeriod ?? period

  // Poll Beijing time every 60s
  useEffect(() => {
    const tick = () => { setPeriod(getCurrentPeriod()) }
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])

  const eveningItems = buildEveningItems(eveningData.custom, eveningData.disabledIds)
  const wheelItems = activePeriod === 'noon' ? noonItems : eveningItems

  const handleSpin = useCallback((result: FoodItem) => {
    const resultData = { item: result, period: activePeriod }
    saveTodayResult(resultData)
    setTodayResult(resultData)
    setLastResult(resultData)
  }, [activePeriod])

  const handleSaveManager = useCallback((noon: FoodItem[], evening: EveningData) => {
    setNoonItems(noon)
    setEveningData(evening)
  }, [])

  const isPreview = previewPeriod !== null && previewPeriod !== period
  const displayResult = todayResult?.period === activePeriod ? todayResult : lastResult?.period === activePeriod ? lastResult : null

  return (
    <section id="food-plugin" className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 mb-md">
        <div>
          <span className="font-label-mono text-xs uppercase text-secondary">🍽️ FOOD WHEEL</span>
          <h2 className="font-headline-md text-headline-md text-on-surface">今天吃什么</h2>
        </div>
        <button type="button" onClick={() => setManagerOpen(true)}
          className="inline-flex items-center gap-xs rounded-[2px] bg-primary px-sm py-2 font-body-md text-sm font-semibold text-on-primary transition-premium hover:opacity-90">
          <Icon name="rate_review" className="text-base" />管理菜单
        </button>
      </div>

      {/* Preview notice */}
      {isPreview && (
        <div className="mb-md px-sm py-1 rounded-[2px] bg-secondary/10 border border-secondary/20">
          <span className="font-body-md text-xs text-secondary">
            🔍 预览模式 · 北京时区 {getBeijingHour()}:00 后将自动切换到{period === 'noon' ? '☀️ 中午' : '🌙 晚上'}转盘
          </span>
        </div>
      )}

      {/* Today's result banner */}
      {displayResult && (
        <div className="mb-md surface-panel rounded-[2px] px-md py-sm flex items-center gap-md">
          <span className="text-2xl">{activePeriod === 'noon' ? '☀️' : '🌙'}</span>
          <div>
            <p className="font-label-mono text-xs text-text-muted">今日已选</p>
            <p className="font-headline-md text-headline-md text-on-surface">{displayResult.item.name}</p>
          </div>
        </div>
      )}

      {/* Wheel area (scrollable) */}
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <FoodWheel
          key={activePeriod}
          items={wheelItems}
          periodLabel={activePeriod === 'noon' ? '中午 · 公司附近' : '晚上 · 在家做'}
          periodIcon={activePeriod === 'noon' ? '☀️' : '🌙'}
          emptyText={activePeriod === 'noon' ? '还没添加中午选项，点击管理菜单添加' : '所有菜谱都被禁用了，去管理菜单恢复一些吧'}
          onSpin={handleSpin}
          onEdit={() => setManagerOpen(true)}
        />
      </div>

      {/* Period toggle tabs */}
      <div className="flex items-center justify-center gap-md shrink-0 mt-md border-t border-border-subtle pt-md">
        <button type="button" onClick={() => setPreviewPeriod('noon')}
          className={`font-label-mono text-xs transition-premium ${activePeriod === 'noon' ? 'text-on-surface' : 'text-text-muted hover:text-on-surface'}`}>
          ☀️ 中午
        </button>
        <button type="button" onClick={() => setPreviewPeriod(null)}
          className={`font-label-mono text-xs transition-premium ${previewPeriod === null ? 'text-primary' : 'text-text-muted hover:text-on-surface'}`}>
          ↻ 自动
        </button>
        <button type="button" onClick={() => setPreviewPeriod('evening')}
          className={`font-label-mono text-xs transition-premium ${activePeriod === 'evening' ? 'text-on-surface' : 'text-text-muted hover:text-on-surface'}`}>
          🌙 晚上
        </button>
      </div>

      {/* Manager drawer */}
      <FoodManager
        open={managerOpen}
        noonItems={noonItems}
        eveningData={eveningData}
        onClose={() => setManagerOpen(false)}
        onSave={handleSaveManager}
      />
    </section>
  )
}
```

- [ ] **Step 1:** Write `index.tsx` with the above code
- [ ] **Step 2:** `git commit -m "feat(food): add main plugin component with time-slot logic and preview toggle"`

---

### Task 7: Register plugin in the system

**Files:**
- Modify: `src/plugins/index.ts` — add food import + plugin entry
- Modify: `src/App.tsx` — add route item
- Modify: `src/core/routeBridge.ts` — add to HubRouteId union + routeAliases

- [ ] **Step 1: Register in plugins/index.ts**

Insert after the StockWatchPlugin import (around line 11):
```typescript
import FoodPlugin from './food'
```

Add to the `plugins` array (after stock-watch entry, around line 106):
```typescript
  {
    id: 'food',
    name: '今天吃什么',
    version: '1.0.0',
    enabled: true,
    order: 7,
    component: FoodPlugin,
  },
```

Add to named exports (around line 120):
```typescript
  FoodPlugin,
```

- [ ] **Step 2: Add route in App.tsx**

In `routeItems` array, insert after the news entry (around line 13):
```typescript
  { id: 'food', label: '吃啥', href: routeHash('food'), pluginId: 'food' },
```

- [ ] **Step 3: Add route alias in routeBridge.ts**

In the `HubRouteId` type union, add `'food'`.

In `routeAliases` object, add:
```typescript
  food: 'food',
```

- [ ] **Step 4: Build and verify**

```bash
cd /path/to/project
npm run build
```

Expected: no TypeScript errors, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/plugins/index.ts src/App.tsx src/core/routeBridge.ts
git commit -m "feat(food): register food plugin in plugin system and routes"
```

---

## Design Token Reference

Use these Tailwind classes and CSS variables from the existing design system:

| Purpose | Classes / Variables |
|---------|-------------------|
| Panel | `surface-panel` class, `surface-item` class |
| Labels | `font-label-mono text-xs text-secondary` |
| Headings | `font-headline-md text-headline-md text-on-surface` |
| Body text | `font-body-md text-body-md text-{on-surface,text-muted}` |
| Primary button | `bg-primary text-on-primary rounded-[2px]` |
| Drawer | `drawer-layer`, `drawer-backdrop`, `contact-drawer` classes |
| Form control | `surface-control` class |
| Transitions | `transition-premium` class |
| Input | `surface-control rounded-[2px] px-sm py-2 font-body-md text-sm text-on-surface outline-none focus:border-primary transition-premium` |

## Final File Checklist

- [ ] `src/plugins/food/types.ts` — types
- [ ] `src/plugins/food/utils.ts` — utilities
- [ ] `src/plugins/food/recipes.ts` — built-in recipe library
- [ ] `src/plugins/food/FoodWheel.tsx` — wheel component
- [ ] `src/plugins/food/FoodManager.tsx` — management drawer
- [ ] `src/plugins/food/index.tsx` — main plugin
- [ ] `src/plugins/index.ts` — plugin registration
- [ ] `src/App.tsx` — route item
- [ ] `src/core/routeBridge.ts` — route alias
