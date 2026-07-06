# Party Games Mobile Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `party-games` plugin shell and mobile-first static game flow for Who Is Undercover and Truth or Dare.

**Architecture:** This phase is frontend-only and config-driven. It adds a plugin route, typed local room state, static seed content, mobile sheets, waiting room, Who Is Undercover phase views, and a Truth or Dare punishment panel without connecting D1 or WebSocket yet.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, existing plugin system, Playwright.

---

## Scope

This plan implements Phase 1 from the approved design spec:

- Add `party-games` plugin shell.
- Add mobile entry, create room, join room, waiting room, and static gameplay states.
- Add plugin config schema and feature flag.
- Add Playwright coverage for route availability and mobile interactions.

This plan does not implement D1 migrations, admin APIs, Durable Objects, WebSocket, or Remotion compositions. Those are separate plans because they touch independent storage, realtime, and media subsystems.

## File Structure

- Create `src/plugins/party-games/types.ts`: shared type definitions for modes, room state, players, phases, and cards.
- Create `src/plugins/party-games/content.ts`: local seed content for the static UI phase.
- Create `src/plugins/party-games/components/CreateRoomSheet.tsx`: mobile-first create room sheet.
- Create `src/plugins/party-games/components/JoinRoomSheet.tsx`: mobile-first join room sheet.
- Create `src/plugins/party-games/components/WaitingRoomView.tsx`: static waiting room state and host controls.
- Create `src/plugins/party-games/components/UndercoverRoundView.tsx`: static Who Is Undercover phase UI.
- Create `src/plugins/party-games/components/TruthOrDarePanel.tsx`: standalone and punishment card draw UI.
- Create `src/plugins/party-games/index.tsx`: plugin state orchestration and screen composition.
- Modify `src/plugins/index.ts`: register the plugin.
- Modify `src/core/routeBridge.ts`: add route id and aliases.
- Modify `src/App.tsx`: add route item.
- Modify `src/components/MobileTabBar.tsx`: add route icon and priority behavior.
- Modify `src/core/configSchema.ts`: add plugin config parser and defaults.
- Modify `public/config/plugins.config.json`: enable the plugin in runtime config.
- Modify `public/config/features.config.json`: add `partyGames`.
- Modify `tests/homepage.spec.ts`: include route availability and mobile interaction tests.

## Task 1: Route And Config Test

**Files:**
- Modify: `tests/homepage.spec.ts`

- [ ] **Step 1: Write failing route availability expectations**

In the existing homepage smoke test, update the route assertion to include `party-games`:

```ts
await expect.poll(() => page.evaluate(() => window.__hubAvailableRoutes)).toEqual([
  'home',
  'ai-tools',
  'wish-wall',
  'stock-watch',
  'food',
  'party-games',
  'local-music',
])
```

- [ ] **Step 2: Add desktop route smoke assertion**

After the `food` route is covered by existing route navigation, add:

```ts
await goRoute('party-games')
const partyGamesSection = page.locator('#party-games')
await expect(partyGamesSection.getByRole('heading', { name: '聚会游戏' })).toBeVisible()
await expect(partyGamesSection.getByRole('button', { name: '创建房间' })).toBeVisible()
await expect(partyGamesSection.getByRole('button', { name: '加入房间' })).toBeVisible()
```

- [ ] **Step 3: Add the new route to viewport coverage**

In `routes stay within desktop and mobile viewports`, update the route list:

```ts
const routes = ['/', '/#/ai-tools', '/#/wish-wall', '/#/stock-watch', '/#/food', '/#/party-games', '/#/local-music']
```

- [ ] **Step 4: Add mobile interaction test**

Append this test to `tests/homepage.spec.ts`:

```ts
test('party games mobile flow exposes room setup and punishment states', async ({ page }) => {
  test.setTimeout(60_000)

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#/party-games')
  await page.waitForTimeout(2500)

  const section = page.locator('#party-games')
  await expect(section.getByRole('heading', { name: '聚会游戏' })).toBeVisible()

  await section.getByRole('button', { name: '创建房间' }).click()
  await expect(page.getByRole('dialog', { name: '创建房间' })).toBeVisible()
  await expect(page.getByLabel('最多人数')).toHaveValue('6')
  await page.getByRole('button', { name: '增加人数' }).click()
  await expect(page.getByLabel('最多人数')).toHaveValue('7')
  await page.getByRole('button', { name: '确认创建' }).click()

  await expect(section.getByText('房间码')).toBeVisible()
  await expect(section.getByText('1 / 7')).toBeVisible()
  await section.getByRole('button', { name: '开始游戏' }).click()

  await expect(section.getByText('长按查看你的词')).toBeVisible()
  await section.getByRole('button', { name: '进入发言' }).click()
  await expect(section.getByText('当前发言')).toBeVisible()
  await section.getByRole('button', { name: '进入投票' }).click()
  await expect(section.getByText('选择你怀疑的人')).toBeVisible()
  await section.getByRole('button', { name: '揭晓结果' }).click()
  await expect(section.getByText('平民胜利')).toBeVisible()
  await section.getByRole('button', { name: '抽惩罚' }).click()
  await expect(section.getByText('真心话大冒险')).toBeVisible()
})
```

- [ ] **Step 5: Run the failing test**

Run:

```bash
npx playwright test tests/homepage.spec.ts --project=chromium --grep "party games mobile flow|homepage renders"
```

Expected: fail because `party-games` is not registered and the new UI does not exist.

- [ ] **Step 6: Commit failing test**

```bash
git add tests/homepage.spec.ts
git commit -m "test: cover party games mobile route"
```

## Task 2: Register Route, Plugin, Config, And Icons

**Files:**
- Create: `src/plugins/party-games/index.tsx`
- Modify: `src/plugins/index.ts`
- Modify: `src/core/routeBridge.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/MobileTabBar.tsx`
- Modify: `src/core/configSchema.ts`
- Modify: `public/config/plugins.config.json`
- Modify: `public/config/features.config.json`

- [ ] **Step 1: Create a minimal plugin component**

Create `src/plugins/party-games/index.tsx`:

```tsx
import { PluginRuntimeConfig } from '@core/types'

interface Props {
  config?: PluginRuntimeConfig
}

const PartyGamesPlugin = (_props: Props) => (
  <section id="party-games" className="space-y-5 scroll-mt-24">
    <div className="rounded-[28px] border border-border-subtle bg-[#151817] p-5 text-white">
      <h2 className="font-headline-md text-3xl font-semibold tracking-tight">聚会游戏</h2>
      <p className="mt-2 font-body-md text-sm text-white/70">谁是卧底和真心话大冒险。</p>
      <div className="mt-5 grid gap-3">
        <button type="button" className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#151817]">
          创建房间
        </button>
        <button type="button" className="rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-white">
          加入房间
        </button>
      </div>
    </div>
  </section>
)

export default PartyGamesPlugin
```

- [ ] **Step 2: Register plugin export and metadata**

Modify `src/plugins/index.ts`:

```ts
import PartyGamesPlugin from './party-games'
```

Add this item after `FoodPlugin`:

```ts
{
  id: 'party-games',
  name: '聚会游戏',
  version: '1.0.0',
  enabled: true,
  order: 8,
  component: PartyGamesPlugin,
},
```

Add `PartyGamesPlugin` to the export list.

- [ ] **Step 3: Add route type and aliases**

Modify `src/core/routeBridge.ts`:

```ts
export type HubRouteId = 'home' | 'inbox' | 'launch' | 'ai-tools' | 'wish-wall' | 'workbench' | 'collections' | 'scratchpad' | 'stocks' | 'stock-watch' | 'food' | 'party-games' | 'local-music'
```

Add aliases:

```ts
'party-games': 'party-games',
party: 'party-games',
games: 'party-games',
```

- [ ] **Step 4: Add route item**

Modify `src/App.tsx` and add the route after `food`:

```ts
{ id: 'party-games', label: '游戏', href: '#/party-games', pluginId: 'party-games' },
```

- [ ] **Step 5: Add mobile tab icon and order**

Modify `src/components/MobileTabBar.tsx`:

```ts
const PRIMARY_ORDER = ['ai-tools', 'wish-wall', 'stock-watch', 'food', 'party-games'] as const
```

Add icon mapping:

```ts
'party-games': 'sports_score',
```

- [ ] **Step 6: Add config schema parser and defaults**

Modify `src/core/configSchema.ts`:

```ts
const partyGamesConfigSchema = z.object({
  defaultMode: z.enum(['undercover', 'truth-or-dare']).catch('undercover').default('undercover'),
  minPlayers: z.number().int().min(3).max(12).catch(3).default(3),
  maxPlayers: z.number().int().min(3).max(12).catch(6).default(6),
})
```

Add to `parsers`:

```ts
'party-games': partyGamesConfigSchema,
```

Add to default configs after `food`:

```ts
{ id: 'party-games', enabled: true, order: 8 },
```

- [ ] **Step 7: Enable runtime config**

In `public/config/plugins.config.json`, add:

```json
{
  "id": "party-games",
  "enabled": true,
  "order": 8,
  "config": {
    "defaultMode": "undercover",
    "minPlayers": 3,
    "maxPlayers": 6
  }
}
```

In `public/config/features.config.json`, add:

```json
"partyGames": true
```

Add an experiment:

```json
{
  "id": "party-games",
  "title": "聚会游戏房间",
  "requires": ["D1", "Durable Objects"],
  "enabled": false
}
```

- [ ] **Step 8: Run route test**

Run:

```bash
npx playwright test tests/homepage.spec.ts --project=chromium --grep "homepage renders configured content"
```

Expected: pass the route availability and desktop smoke assertion.

- [ ] **Step 9: Commit**

```bash
git add src/plugins/party-games/index.tsx src/plugins/index.ts src/core/routeBridge.ts src/App.tsx src/components/MobileTabBar.tsx src/core/configSchema.ts public/config/plugins.config.json public/config/features.config.json
git commit -m "feat: register party games plugin"
```

## Task 3: Add Party Games Types And Seed Content

**Files:**
- Create: `src/plugins/party-games/types.ts`
- Create: `src/plugins/party-games/content.ts`

- [ ] **Step 1: Create types**

Create `src/plugins/party-games/types.ts`:

```ts
export type PartyGameMode = 'undercover' | 'truth-or-dare'
export type PunishmentMode = 'off' | 'truth' | 'dare' | 'random'
export type PlayerStatus = 'online' | 'offline'
export type UndercoverPhase = 'waiting' | 'word' | 'speaking' | 'voting' | 'result' | 'punishment'
export type TruthOrDareType = 'truth' | 'dare'
export type CardIntensity = 'soft' | 'normal' | 'spicy'

export interface PartyPlayer {
  id: string
  nickname: string
  host: boolean
  status: PlayerStatus
}

export interface UndercoverWordPair {
  id: string
  civilianWord: string
  undercoverWord: string
  category: string
  difficulty: 'easy' | 'normal'
}

export interface TruthOrDareCard {
  id: string
  type: TruthOrDareType
  content: string
  category: string
  intensity: CardIntensity
}

export interface PartyRoomSettings {
  mode: PartyGameMode
  maxPlayers: number
  allowLateJoin: boolean
  wordCategory: string
  punishmentMode: PunishmentMode
}

export interface LocalPartyRoom {
  code: string
  settings: PartyRoomSettings
  players: PartyPlayer[]
  phase: UndercoverPhase
  currentSpeakerIndex: number
  selectedWordPair: UndercoverWordPair
  selectedCard: TruthOrDareCard | null
}
```

- [ ] **Step 2: Create seed content**

Create `src/plugins/party-games/content.ts`:

```ts
import { TruthOrDareCard, UndercoverWordPair } from './types'

export const undercoverWordPairs: UndercoverWordPair[] = [
  { id: 'fruit-apple-pear', civilianWord: '苹果', undercoverWord: '梨', category: '生活', difficulty: 'easy' },
  { id: 'drink-coffee-milk-tea', civilianWord: '咖啡', undercoverWord: '奶茶', category: '生活', difficulty: 'easy' },
  { id: 'place-cinema-theater', civilianWord: '电影院', undercoverWord: '剧场', category: '地点', difficulty: 'normal' },
  { id: 'tool-keyboard-mouse', civilianWord: '键盘', undercoverWord: '鼠标', category: '物品', difficulty: 'easy' },
  { id: 'food-hotpot-bbq', civilianWord: '火锅', undercoverWord: '烧烤', category: '食物', difficulty: 'easy' },
]

export const truthOrDareCards: TruthOrDareCard[] = [
  { id: 'truth-recent-laugh', type: 'truth', content: '最近一次笑到停不下来是因为什么？', category: '轻松', intensity: 'soft' },
  { id: 'truth-favorite-player', type: 'truth', content: '这局里你最想和谁组队？', category: '社交', intensity: 'normal' },
  { id: 'truth-hidden-habit', type: 'truth', content: '说一个你的小习惯。', category: '轻松', intensity: 'soft' },
  { id: 'dare-compliment-left', type: 'dare', content: '认真夸一下你左边的人，至少说两句。', category: '互动', intensity: 'soft' },
  { id: 'dare-pose-photo', type: 'dare', content: '摆一个胜利姿势，保持 5 秒。', category: '互动', intensity: 'soft' },
  { id: 'dare-host-voice', type: 'dare', content: '用主持人的语气宣布下一轮开始。', category: '表演', intensity: 'normal' },
]

export const getDefaultWordPair = () => undercoverWordPairs[0]

export const getCardsByType = (type: TruthOrDareCard['type']) => (
  truthOrDareCards.filter((card) => card.type === type)
)
```

- [ ] **Step 3: Run type check**

Run:

```bash
npm run build
```

Expected: pass TypeScript checks.

- [ ] **Step 4: Commit**

```bash
git add src/plugins/party-games/types.ts src/plugins/party-games/content.ts
git commit -m "feat: add party games seed content"
```

## Task 4: Add Create And Join Sheets

**Files:**
- Create: `src/plugins/party-games/components/CreateRoomSheet.tsx`
- Create: `src/plugins/party-games/components/JoinRoomSheet.tsx`
- Modify: `src/plugins/party-games/index.tsx`

- [ ] **Step 1: Create room sheet**

Create `src/plugins/party-games/components/CreateRoomSheet.tsx`:

```tsx
import { FormEvent, useState } from 'react'
import { Icon } from '@components'
import { PartyGameMode, PartyRoomSettings, PunishmentMode } from '../types'

interface Props {
  open: boolean
  defaultMode: PartyGameMode
  defaultMaxPlayers: number
  onClose: () => void
  onCreate: (nickname: string, settings: PartyRoomSettings) => void
}

const clampPlayers = (value: number) => Math.min(12, Math.max(3, value))

const CreateRoomSheet = ({ open, defaultMode, defaultMaxPlayers, onClose, onCreate }: Props) => {
  const [nickname, setNickname] = useState('房主')
  const [mode, setMode] = useState<PartyGameMode>(defaultMode)
  const [maxPlayers, setMaxPlayers] = useState(clampPlayers(defaultMaxPlayers))
  const [punishmentMode, setPunishmentMode] = useState<PunishmentMode>('random')
  const [message, setMessage] = useState('')

  if (!open) return null

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const normalizedNickname = nickname.trim()
    if (normalizedNickname.length < 1 || normalizedNickname.length > 12) {
      setMessage('昵称需要 1-12 个字')
      return
    }

    onCreate(normalizedNickname, {
      mode,
      maxPlayers,
      allowLateJoin: true,
      wordCategory: '生活',
      punishmentMode,
    })
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm" onClick={onClose} />
      <form
        role="dialog"
        aria-label="创建房间"
        onSubmit={submit}
        className="fixed inset-x-3 bottom-3 z-50 rounded-[30px] border border-white/10 bg-[#141715] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-white shadow-[0_30px_90px_-40px_rgba(0,0,0,0.65)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-headline-md text-2xl font-semibold">创建房间</h3>
            <p className="mt-1 text-sm text-white/62">设置人数上限，朋友可以用房间码加入。</p>
          </div>
          <button type="button" onClick={onClose} aria-label="关闭创建房间" className="rounded-full border border-white/15 p-2 text-white/70">
            <Icon name="close" className="text-lg" />
          </button>
        </div>

        <label className="mt-5 grid gap-2">
          <span className="text-xs font-semibold text-white/64">昵称</span>
          <input
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={12}
            className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-base text-white outline-none focus:border-white/35"
          />
        </label>

        <div className="mt-4 grid gap-2">
          <span className="text-xs font-semibold text-white/64">游戏模式</span>
          <div className="grid grid-cols-2 rounded-2xl bg-white/8 p-1">
            {[
              ['undercover', '谁是卧底'],
              ['truth-or-dare', '真心话大冒险'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id as PartyGameMode)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold ${mode === id ? 'bg-white text-[#141715]' : 'text-white/70'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/12 bg-white/6 px-4 py-3">
          <div>
            <label htmlFor="party-max-players" className="block text-xs font-semibold text-white/64">最多人数</label>
            <input id="party-max-players" aria-label="最多人数" readOnly value={maxPlayers} className="mt-1 w-12 bg-transparent text-2xl font-semibold text-white outline-none" />
          </div>
          <div className="flex gap-2">
            <button type="button" aria-label="减少人数" onClick={() => setMaxPlayers((value) => clampPlayers(value - 1))} className="grid size-10 place-items-center rounded-full border border-white/15">
              <Icon name="chevron_left" />
            </button>
            <button type="button" aria-label="增加人数" onClick={() => setMaxPlayers((value) => clampPlayers(value + 1))} className="grid size-10 place-items-center rounded-full border border-white/15">
              <Icon name="chevron_right" />
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <span className="text-xs font-semibold text-white/64">输家惩罚</span>
          <div className="grid grid-cols-4 gap-2">
            {[
              ['off', '关闭'],
              ['truth', '真心话'],
              ['dare', '大冒险'],
              ['random', '随机'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setPunishmentMode(id as PunishmentMode)}
                className={`rounded-xl border px-2 py-2 text-xs font-semibold ${punishmentMode === id ? 'border-white bg-white text-[#141715]' : 'border-white/12 text-white/68'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {message && <p className="mt-3 text-sm text-[#fca5a5]">{message}</p>}

        <button type="submit" className="mt-5 w-full rounded-full bg-[#f4d35e] px-5 py-3 text-sm font-bold text-[#141715]">
          确认创建
        </button>
      </form>
    </>
  )
}

export default CreateRoomSheet
```

- [ ] **Step 2: Create join room sheet**

Create `src/plugins/party-games/components/JoinRoomSheet.tsx`:

```tsx
import { FormEvent, useState } from 'react'
import { Icon } from '@components'

interface Props {
  open: boolean
  onClose: () => void
  onJoin: (nickname: string, code: string) => void
}

const JoinRoomSheet = ({ open, onClose, onJoin }: Props) => {
  const [nickname, setNickname] = useState('玩家')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')

  if (!open) return null

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const normalizedCode = code.trim().toUpperCase()
    const normalizedNickname = nickname.trim()

    if (!/^[A-Z0-9]{4,6}$/.test(normalizedCode)) {
      setMessage('房间码需要 4-6 位字母或数字')
      return
    }

    if (normalizedNickname.length < 1 || normalizedNickname.length > 12) {
      setMessage('昵称需要 1-12 个字')
      return
    }

    onJoin(normalizedNickname, normalizedCode)
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm" onClick={onClose} />
      <form
        role="dialog"
        aria-label="加入房间"
        onSubmit={submit}
        className="fixed inset-x-3 bottom-3 z-50 rounded-[30px] border border-white/10 bg-[#141715] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-white shadow-[0_30px_90px_-40px_rgba(0,0,0,0.65)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-headline-md text-2xl font-semibold">加入房间</h3>
            <p className="mt-1 text-sm text-white/62">输入朋友分享的房间码。</p>
          </div>
          <button type="button" onClick={onClose} aria-label="关闭加入房间" className="rounded-full border border-white/15 p-2 text-white/70">
            <Icon name="close" className="text-lg" />
          </button>
        </div>

        <label className="mt-5 grid gap-2">
          <span className="text-xs font-semibold text-white/64">房间码</span>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            maxLength={6}
            className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-center font-label-mono text-3xl uppercase tracking-[0.18em] text-white outline-none focus:border-white/35"
          />
        </label>

        <label className="mt-4 grid gap-2">
          <span className="text-xs font-semibold text-white/64">昵称</span>
          <input
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={12}
            className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-base text-white outline-none focus:border-white/35"
          />
        </label>

        {message && <p className="mt-3 text-sm text-[#fca5a5]">{message}</p>}

        <button type="submit" className="mt-5 w-full rounded-full bg-white px-5 py-3 text-sm font-bold text-[#141715]">
          加入
        </button>
      </form>
    </>
  )
}

export default JoinRoomSheet
```

- [ ] **Step 3: Wire sheets into plugin**

Replace the minimal plugin in `src/plugins/party-games/index.tsx` with state that opens and closes the sheets. Keep room creation as a temporary local callback:

```tsx
const [createOpen, setCreateOpen] = useState(false)
const [joinOpen, setJoinOpen] = useState(false)
```

Render:

```tsx
<CreateRoomSheet
  open={createOpen}
  defaultMode={defaultMode}
  defaultMaxPlayers={defaultMaxPlayers}
  onClose={() => setCreateOpen(false)}
  onCreate={createLocalRoom}
/>
<JoinRoomSheet
  open={joinOpen}
  onClose={() => setJoinOpen(false)}
  onJoin={joinLocalRoom}
/>
```

- [ ] **Step 4: Run mobile test**

Run:

```bash
npx playwright test tests/homepage.spec.ts --project=chromium --grep "party games mobile flow"
```

Expected: fail after clicking `确认创建` because the waiting room does not exist yet.

- [ ] **Step 5: Commit**

```bash
git add src/plugins/party-games/components/CreateRoomSheet.tsx src/plugins/party-games/components/JoinRoomSheet.tsx src/plugins/party-games/index.tsx
git commit -m "feat: add party game room sheets"
```

## Task 5: Add Waiting Room And Local Room State

**Files:**
- Create: `src/plugins/party-games/components/WaitingRoomView.tsx`
- Modify: `src/plugins/party-games/index.tsx`

- [ ] **Step 1: Create waiting room component**

Create `src/plugins/party-games/components/WaitingRoomView.tsx`:

```tsx
import { Icon } from '@components'
import { LocalPartyRoom } from '../types'

interface Props {
  room: LocalPartyRoom
  onStart: () => void
  onLeave: () => void
}

const WaitingRoomView = ({ room, onStart, onLeave }: Props) => (
  <div className="rounded-[28px] border border-white/10 bg-[#151817] p-5 text-white">
    <div className="flex items-start justify-between gap-4">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/48">房间码</span>
        <h2 className="mt-1 font-label-mono text-4xl font-bold tracking-[0.16em]">{room.code}</h2>
      </div>
      <button type="button" onClick={onLeave} aria-label="离开房间" className="rounded-full border border-white/15 p-2 text-white/70">
        <Icon name="close" className="text-lg" />
      </button>
    </div>

    <div className="mt-5 grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-white/8 p-4">
        <span className="text-xs text-white/50">当前人数</span>
        <strong className="mt-1 block text-2xl">{room.players.length} / {room.settings.maxPlayers}</strong>
      </div>
      <div className="rounded-2xl bg-white/8 p-4">
        <span className="text-xs text-white/50">惩罚</span>
        <strong className="mt-1 block text-base">{room.settings.punishmentMode === 'random' ? '随机' : room.settings.punishmentMode}</strong>
      </div>
    </div>

    <div className="mt-5 space-y-2">
      {room.players.map((player, index) => (
        <div key={player.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-[#f4d35e] text-sm font-bold text-[#151817]">{index + 1}</span>
            <div>
              <p className="text-sm font-semibold">{player.nickname}</p>
              <p className="text-xs text-white/48">{player.host ? '房主' : '玩家'} · {player.status === 'online' ? '在线' : '离线'}</p>
            </div>
          </div>
        </div>
      ))}
    </div>

    <button type="button" onClick={onStart} className="mt-5 w-full rounded-full bg-[#f4d35e] px-5 py-3 text-sm font-bold text-[#151817]">
      开始游戏
    </button>
  </div>
)

export default WaitingRoomView
```

- [ ] **Step 2: Add local room helpers**

In `src/plugins/party-games/index.tsx`, add:

```tsx
const createRoomCode = () => Math.random().toString(36).slice(2, 6).toUpperCase()
```

Add `room` state:

```tsx
const [room, setRoom] = useState<LocalPartyRoom | null>(null)
```

Implement `createLocalRoom`:

```tsx
const createLocalRoom = (nickname: string, settings: PartyRoomSettings) => {
  setRoom({
    code: createRoomCode(),
    settings,
    players: [{ id: 'host', nickname, host: true, status: 'online' }],
    phase: 'waiting',
    currentSpeakerIndex: 0,
    selectedWordPair: getDefaultWordPair(),
    selectedCard: null,
  })
  setCreateOpen(false)
}
```

Implement `joinLocalRoom`:

```tsx
const joinLocalRoom = (nickname: string, code: string) => {
  setRoom({
    code,
    settings: {
      mode: 'undercover',
      maxPlayers: 6,
      allowLateJoin: true,
      wordCategory: '生活',
      punishmentMode: 'random',
    },
    players: [
      { id: 'host', nickname: '房主', host: true, status: 'online' },
      { id: 'guest', nickname, host: false, status: 'online' },
    ],
    phase: 'waiting',
    currentSpeakerIndex: 0,
    selectedWordPair: getDefaultWordPair(),
    selectedCard: null,
  })
  setJoinOpen(false)
}
```

- [ ] **Step 3: Render waiting room**

In `index.tsx`, before the entry content:

```tsx
if (room?.phase === 'waiting') {
  return (
    <section id="party-games" className="space-y-5 scroll-mt-24">
      <WaitingRoomView
        room={room}
        onStart={() => setRoom({ ...room, phase: 'word' })}
        onLeave={() => setRoom(null)}
      />
    </section>
  )
}
```

- [ ] **Step 4: Run mobile test**

Run:

```bash
npx playwright test tests/homepage.spec.ts --project=chromium --grep "party games mobile flow"
```

Expected: fail after clicking `开始游戏` because the Who Is Undercover phase UI does not exist yet.

- [ ] **Step 5: Commit**

```bash
git add src/plugins/party-games/components/WaitingRoomView.tsx src/plugins/party-games/index.tsx
git commit -m "feat: add party games waiting room"
```

## Task 6: Add Who Is Undercover Static Phase Views

**Files:**
- Create: `src/plugins/party-games/components/UndercoverRoundView.tsx`
- Modify: `src/plugins/party-games/index.tsx`

- [ ] **Step 1: Create phase component**

Create `src/plugins/party-games/components/UndercoverRoundView.tsx`:

```tsx
import { LocalPartyRoom, UndercoverPhase } from '../types'

interface Props {
  room: LocalPartyRoom
  onPhaseChange: (phase: UndercoverPhase) => void
}

const UndercoverRoundView = ({ room, onPhaseChange }: Props) => {
  if (room.phase === 'word') {
    return (
      <div className="rounded-[28px] border border-white/10 bg-[#151817] p-5 text-white">
        <p className="text-sm text-white/62">长按查看你的词</p>
        <div className="mt-5 rounded-[26px] bg-[#f7f0d5] p-6 text-[#151817]">
          <span className="text-xs font-semibold text-[#151817]/50">你的词</span>
          <h2 className="mt-3 text-center text-4xl font-bold">{room.selectedWordPair.civilianWord}</h2>
        </div>
        <button type="button" onClick={() => onPhaseChange('speaking')} className="mt-5 w-full rounded-full bg-[#f4d35e] px-5 py-3 text-sm font-bold text-[#151817]">
          进入发言
        </button>
      </div>
    )
  }

  if (room.phase === 'speaking') {
    const speaker = room.players[room.currentSpeakerIndex] ?? room.players[0]
    return (
      <div className="rounded-[28px] border border-white/10 bg-[#151817] p-5 text-white">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/48">当前发言</span>
        <h2 className="mt-3 text-3xl font-semibold">{speaker.nickname}</h2>
        <p className="mt-2 text-sm text-white/62">每个人描述一次自己的词，不能直接说出词语。</p>
        <button type="button" onClick={() => onPhaseChange('voting')} className="mt-5 w-full rounded-full bg-[#f4d35e] px-5 py-3 text-sm font-bold text-[#151817]">
          进入投票
        </button>
      </div>
    )
  }

  if (room.phase === 'voting') {
    return (
      <div className="rounded-[28px] border border-white/10 bg-[#151817] p-5 text-white">
        <h2 className="text-2xl font-semibold">选择你怀疑的人</h2>
        <div className="mt-5 space-y-2">
          {room.players.map((player) => (
            <button key={player.id} type="button" className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-left text-sm font-semibold">
              {player.nickname}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => onPhaseChange('result')} className="mt-5 w-full rounded-full bg-white px-5 py-3 text-sm font-bold text-[#151817]">
          揭晓结果
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-[#151817] p-5 text-white">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f4d35e]">结果</span>
      <h2 className="mt-3 text-4xl font-semibold">平民胜利</h2>
      <p className="mt-2 text-sm text-white/62">卧底被投出，可以进入惩罚环节。</p>
      <button type="button" onClick={() => onPhaseChange('punishment')} className="mt-5 w-full rounded-full bg-[#f4d35e] px-5 py-3 text-sm font-bold text-[#151817]">
        抽惩罚
      </button>
    </div>
  )
}

export default UndercoverRoundView
```

- [ ] **Step 2: Render phase component**

In `src/plugins/party-games/index.tsx`, render `UndercoverRoundView` for non-waiting phases except punishment:

```tsx
if (room && room.phase !== 'waiting' && room.phase !== 'punishment') {
  return (
    <section id="party-games" className="space-y-5 scroll-mt-24">
      <UndercoverRoundView
        room={room}
        onPhaseChange={(phase) => setRoom({ ...room, phase })}
      />
    </section>
  )
}
```

- [ ] **Step 3: Run mobile test**

Run:

```bash
npx playwright test tests/homepage.spec.ts --project=chromium --grep "party games mobile flow"
```

Expected: fail after clicking `抽惩罚` because the Truth or Dare punishment panel does not exist yet.

- [ ] **Step 4: Commit**

```bash
git add src/plugins/party-games/components/UndercoverRoundView.tsx src/plugins/party-games/index.tsx
git commit -m "feat: add undercover phase views"
```

## Task 7: Add Truth Or Dare Panel And Entry Mode

**Files:**
- Create: `src/plugins/party-games/components/TruthOrDarePanel.tsx`
- Modify: `src/plugins/party-games/index.tsx`

- [ ] **Step 1: Create Truth or Dare panel**

Create `src/plugins/party-games/components/TruthOrDarePanel.tsx`:

```tsx
import { useState } from 'react'
import { getCardsByType, truthOrDareCards } from '../content'
import { TruthOrDareCard, TruthOrDareType } from '../types'

interface Props {
  targetName: string
  onDone: () => void
}

const pickCard = (type: TruthOrDareType | 'random'): TruthOrDareCard => {
  if (type === 'random') return truthOrDareCards[0]
  return getCardsByType(type)[0] ?? truthOrDareCards[0]
}

const TruthOrDarePanel = ({ targetName, onDone }: Props) => {
  const [card, setCard] = useState<TruthOrDareCard | null>(null)

  return (
    <div className="rounded-[28px] border border-white/10 bg-[#151817] p-5 text-white">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f4d35e]">真心话大冒险</span>
      <h2 className="mt-2 text-3xl font-semibold">{targetName}</h2>

      <div className="mt-5 min-h-48 rounded-[26px] bg-[#f7f0d5] p-6 text-[#151817]">
        {card ? (
          <>
            <span className="text-xs font-semibold uppercase text-[#151817]/48">{card.type === 'truth' ? '真心话' : '大冒险'}</span>
            <p className="mt-4 text-2xl font-semibold leading-snug">{card.content}</p>
          </>
        ) : (
          <p className="flex h-36 items-center justify-center text-center text-xl font-semibold">选择一种惩罚</p>
        )}
      </div>

      {card ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={onDone} className="rounded-full bg-[#f4d35e] px-5 py-3 text-sm font-bold text-[#151817]">
            完成
          </button>
          <button type="button" onClick={() => setCard(null)} className="rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white">
            换一题
          </button>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-3 gap-2">
          <button type="button" onClick={() => setCard(pickCard('truth'))} className="rounded-full bg-white px-3 py-3 text-sm font-bold text-[#151817]">
            真心话
          </button>
          <button type="button" onClick={() => setCard(pickCard('dare'))} className="rounded-full bg-white px-3 py-3 text-sm font-bold text-[#151817]">
            大冒险
          </button>
          <button type="button" onClick={() => setCard(pickCard('random'))} className="rounded-full bg-[#f4d35e] px-3 py-3 text-sm font-bold text-[#151817]">
            随机
          </button>
        </div>
      )}
    </div>
  )
}

export default TruthOrDarePanel
```

- [ ] **Step 2: Render punishment panel**

In `src/plugins/party-games/index.tsx`, render:

```tsx
if (room?.phase === 'punishment') {
  const target = room.players[0]?.nickname ?? '玩家'
  return (
    <section id="party-games" className="space-y-5 scroll-mt-24">
      <TruthOrDarePanel targetName={target} onDone={() => setRoom(null)} />
    </section>
  )
}
```

- [ ] **Step 3: Add standalone entry mode behavior**

In `index.tsx`, add mode state:

```tsx
const [selectedMode, setSelectedMode] = useState<PartyGameMode>(defaultMode)
const [standaloneTruthOpen, setStandaloneTruthOpen] = useState(false)
```

When the selected mode is `truth-or-dare`, make the primary entry action set `standaloneTruthOpen` to true and render:

```tsx
{standaloneTruthOpen && (
  <TruthOrDarePanel targetName="当前玩家" onDone={() => setStandaloneTruthOpen(false)} />
)}
```

- [ ] **Step 4: Run mobile test**

Run:

```bash
npx playwright test tests/homepage.spec.ts --project=chromium --grep "party games mobile flow"
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/plugins/party-games/components/TruthOrDarePanel.tsx src/plugins/party-games/index.tsx
git commit -m "feat: add truth or dare panel"
```

## Task 8: Polish Mobile Layout And Full Verification

**Files:**
- Modify: `src/plugins/party-games/index.tsx`
- Modify: `src/plugins/party-games/components/CreateRoomSheet.tsx`
- Modify: `src/plugins/party-games/components/JoinRoomSheet.tsx`
- Modify: `src/plugins/party-games/components/WaitingRoomView.tsx`
- Modify: `src/plugins/party-games/components/UndercoverRoundView.tsx`
- Modify: `src/plugins/party-games/components/TruthOrDarePanel.tsx`

- [ ] **Step 1: Audit copy and labels**

Ensure visible text matches these labels so tests and accessibility stay stable:

```text
聚会游戏
创建房间
加入房间
谁是卧底
真心话大冒险
最多人数
确认创建
开始游戏
长按查看你的词
进入发言
当前发言
进入投票
选择你怀疑的人
揭晓结果
平民胜利
抽惩罚
```

- [ ] **Step 2: Run lint**

Run:

```bash
npm run lint
```

Expected: pass with zero warnings.

- [ ] **Step 3: Run asset and data checks**

Run:

```bash
npm run check:assets
npm run check:data
```

Expected: both pass.

- [ ] **Step 4: Run build**

Run:

```bash
npm run build
```

Expected: pass TypeScript and Vite production build.

- [ ] **Step 5: Run e2e**

Run:

```bash
npm run test:e2e
```

Expected: all Playwright tests pass.

- [ ] **Step 6: Run full check**

Run:

```bash
npm run check
```

Expected: lint, asset check, data check, build, and e2e pass.

- [ ] **Step 7: Commit polish**

If any files changed during polish:

```bash
git add src/plugins/party-games tests/homepage.spec.ts
git commit -m "test: verify party games mobile ui"
```

If no files changed:

```bash
git status --short
```

Expected: clean working tree.

## Self-Review

Spec coverage:

- Mobile-first entry, create room, join room, waiting room, Who Is Undercover phases, and Truth or Dare punishment are covered.
- D1, admin, Durable Objects, WebSocket, and Remotion are intentionally deferred into later plans because this plan is the static UI foundation.
- The player maximum is represented in room settings and waiting room display.
- The classic Who Is Undercover rule is represented by the single local word pair and phase flow.

Red-flag scan:

- No unfinished task markers or unspecified implementation steps are included.
- Each task has exact files, commands, and expected outcomes.

Type consistency:

- `PartyGameMode`, `PunishmentMode`, `UndercoverPhase`, `LocalPartyRoom`, and card types are defined before being consumed.
- Component prop names match the planned usage in `index.tsx`.
