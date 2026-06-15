# Mobile Adaptation & MiniPlayer Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add mobile-responsive layout and redesign MiniPlayer to Netease Cloud Music style

**Architecture:** JS-based device detection (`useIsMobile` hook) → conditional component trees. Desktop keeps current layout, mobile gets bottom TabBar + full-width cards. MiniPlayer gets progress bar + transport controls.

**Tech Stack:** React 18, Tailwind CSS 3, CSS Variables

---

### Task 1: MiniPlayer Redesign — AudioEngine (progress + duration)

**Files:**
- Modify: `src/plugins/ambient-music/AudioEngine.ts`
- Modify: `src/plugins/ambient-music/tracks.ts`

- [ ] **Step 1: Add duration to track definitions**

In `src/plugins/ambient-music/tracks.ts`, add `duration` (seconds) to each track:

```typescript
export interface TrackDef {
  id: string
  name: string
  icon: string
  duration: number
}

export const TRACKS: TrackDef[] = [
  { id: 'rain', name: '雨声', icon: 'rainy', duration: 180 },
  { id: 'wind', name: '风声', icon: 'air', duration: 240 },
  { id: 'fire', name: '壁炉', icon: 'fireplace', duration: 300 },
  { id: 'wave', name: '海浪', icon: 'water', duration: 200 },
  { id: 'birds', name: '鸟鸣', icon: 'nest', duration: 160 },
]
```

- [ ] **Step 2: Update TrackState interface**

In `AudioEngine.ts`, add `progress` and `duration` fields:

```typescript
export interface TrackState {
  id: string
  playing: boolean
  volume: number
  progress: number  // 0–1
  duration: number  // seconds
}
```

- [ ] **Step 3: Update AudioEngine to compute progress**

In the `play()` and internal animation loop, update `progress`:

```typescript
// Inside the audio processing interval:
private tickInterval?: ReturnType<typeof setInterval>

startTick() {
  this.tickInterval = setInterval(() => {
    this.tracks.forEach((track) => {
      if (track.playing) {
        track.progress += 0.05 / track.duration  // ~50ms ticks
        if (track.progress >= 1) track.progress = 0  // loop
      }
    })
    this.notify()
  }, 50)
}
```

Also add a `seek()` method:

```typescript
seek(id: string, progress: number): void {
  const track = this.tracks.find(t => t.id === id)
  if (track) track.progress = Math.max(0, Math.min(1, progress))
  this.notify()
}
```

- [ ] **Step 4: Export seek from AudioEngine**

Make sure `seek` is accessible from outside (same pattern as `setVolume`).

- [ ] **Step 5: Verify build**

Run: `npx vite build 2>&1 | tail -3`
Expected: build succeeds

- [ ] **Step 6: Commit**

```bash
git add src/plugins/ambient-music/
git commit -m "feat(audio): add progress tracking and duration to audio engine"
```

---

### Task 2: MiniPlayer Redesign — Netease Progress Bar UI

**Files:**
- Rewrite: `src/plugins/ambient-music/MiniPlayer.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Rewrite MiniPlayer with Netease-style progress bar**

Replace the entire `MiniPlayer.tsx`:

```tsx
import { TrackState } from './AudioEngine'
import { getAudioEngine } from './AudioEngine'
import { TRACKS } from './tracks'
import Icon from '../../components/Icon'

interface Props {
  tracks: TrackState[]
  onToggleTrack: (id: string) => void
  onVolumeChange: (id: string, volume: number) => void
  onOpenFull: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const MiniPlayer = ({ tracks, onToggleTrack, onVolumeChange, onOpenFull }: Props) => {
  const activeTracks = tracks.filter((t) => t.playing)
  if (activeTracks.length === 0) return null

  const primary = activeTracks[0]
  const def = TRACKS.find((t) => t.id === primary.id)
  const elapsed = primary.duration > 0 ? primary.progress * primary.duration : 0

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const progress = Math.max(0, Math.min(1, x / rect.width))
    getAudioEngine().seek(primary.id, progress)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border-subtle bg-surface">
      {/* Progress bar (clickable) */}
      <div
        className="relative w-full h-1 cursor-pointer group"
        onClick={handleSeek}
        role="slider"
        aria-label="播放进度"
        aria-valuenow={Math.round(primary.progress * 100)}
        tabIndex={0}
      >
        <div className="absolute inset-0 bg-border-subtle rounded-full" />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-100"
          style={{ width: `${primary.progress * 100}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border-2 border-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${primary.progress * 100}% - 5px)` }}
        />
      </div>

      <div className="mx-auto flex h-14 max-w-[1480px] items-center gap-3 px-4 md:px-8">
        {/* Track info */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Icon name={def?.icon ?? 'music_note'} className="text-lg text-primary shrink-0" />
          <div className="min-w-0">
            <div className="font-label-mono text-xs text-on-surface truncate">
              {def?.name ?? primary.id}
            </div>
            {primary.duration > 0 && (
              <div className="font-label-mono text-[10px] text-text-muted">
                {formatTime(elapsed)} / {formatTime(primary.duration)}
              </div>
            )}
          </div>
        </div>

        {/* Transport controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const idx = activeTracks.indexOf(primary)
              const prev = activeTracks[(idx - 1 + activeTracks.length) % activeTracks.length]
              onToggleTrack(prev.id)
            }}
            className="w-8 h-8 inline-flex items-center justify-center text-text-muted hover:text-on-surface transition-colors"
            aria-label="上一首"
          >
            <Icon name="skip_previous" className="text-lg" />
          </button>

          <button
            type="button"
            onClick={() => onToggleTrack(primary.id)}
            className="w-8 h-8 rounded-full bg-primary text-white inline-flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            aria-label={primary.playing ? '暂停' : '播放'}
          >
            <Icon name={primary.playing ? 'pause' : 'play_arrow'} className="text-lg" />
          </button>

          <button
            type="button"
            onClick={() => {
              const idx = activeTracks.indexOf(primary)
              const next = activeTracks[(idx + 1) % activeTracks.length]
              onToggleTrack(next.id)
            }}
            className="w-8 h-8 inline-flex items-center justify-center text-text-muted hover:text-on-surface transition-colors"
            aria-label="下一首"
          >
            <Icon name="skip_next" className="text-lg" />
          </button>
        </div>

        {/* Volume + expand */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(primary.volume * 100)}
            onChange={(e) => onVolumeChange(primary.id, Number(e.target.value) / 100)}
            className="w-16 h-1 accent-primary hidden md:block"
            aria-label="音量"
          />
          <button
            type="button"
            onClick={onOpenFull}
            className="w-8 h-8 inline-flex items-center justify-center text-text-muted hover:text-primary transition-colors"
            aria-label="打开完整播放器"
          >
            <Icon name="expand_less" className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  )
}

export { getAudioEngine }
export default MiniPlayer
```

**Note:** The `getAudioEngine` import at the bottom is needed for `seek()`. Make sure the import path is correct.

- [ ] **Step 2: Build check**

Run: `npx vite build 2>&1 | tail -3`
Expected: build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/plugins/ambient-music/MiniPlayer.tsx
git commit -m "feat: redesign MiniPlayer with Netease-style progress bar"
```

---

### Task 3: Mobile Detection Hook + Welcome Page

**Files:**
- Create: `src/hooks/useIsMobile.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create useIsMobile hook**

Create `src/hooks/useIsMobile.ts`:

```typescript
import { useState, useEffect } from 'react'

export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  )

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [breakpoint])

  return isMobile
}
```

- [ ] **Step 2: Update App.tsx — skip Vanta on mobile, skip Rings intro**

In `App.tsx`, import and use `useIsMobile`:

```typescript
import { useIsMobile } from './hooks/useIsMobile'

function App() {
  const isMobile = useIsMobile()
  // ... rest of the code
}
```

Change the welcome screen render to skip Vanta on mobile:

```tsx
// Welcome screen
{!isMobile && <VantaRings />}
{!isMobile && <VantaBirds />}
```

Also skip the intro animation on mobile by passing `enabled={motionConfig.intro && !isMobile}`:

```tsx
<IntroStage
  enabled={motionConfig.intro && !isMobile}
  ...
/>
```

- [ ] **Step 3: Mobile welcome — static gradient background**

In `App.tsx`, when `isOnWelcome && isMobile`, add a static gradient div:

```tsx
{isMobile && isOnWelcome && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'linear-gradient(135deg, #4DD0C8, #64B5F6)',
      opacity: 0.08,
      zIndex: 0,
      pointerEvents: 'none',
    }}
    aria-hidden="true"
  />
)}
```

- [ ] **Step 4: Build check**

Run: `npx vite build 2>&1 | tail -3`
Expected: build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useIsMobile.ts src/App.tsx
git commit -m "feat: add mobile detection hook, skip Vanta on mobile"
```

---

### Task 4: Mobile TabBar Component

**Files:**
- Create: `src/components/MobileTabBar.tsx`

- [ ] **Step 1: Create MobileTabBar component**

```tsx
import { useState } from 'react'
import { HubRouteId } from '@core/routeBridge'

interface RouteItem {
  id: string
  label: string
  href: string
}

interface Props {
  routes: RouteItem[]
  activeRoute: string
}

const PRIMARY_ROUTES = ['ai-tools', 'wish-wall', 'cloudflare-lab', 'news', 'stock-watch']

const routeLabels: Record<string, string> = {
  'ai-tools': '导向',
  'wish-wall': '许愿',
  'cloudflare-lab': '边缘',
  news: '新闻',
  'stock-watch': '看盘',
}

const routeIcons: Record<string, string> = {
  'ai-tools': 'travel_explore',
  'wish-wall': 'rate_review',
  'cloudflare-lab': 'cloud',
  news: 'article',
  'stock-watch': 'bar_chart',
}

const MobileTabBar = ({ routes, activeRoute }: Props) => {
  const [showSheet, setShowSheet] = useState(false)
  const primaryRoutes = routes.filter(r => PRIMARY_ROUTES.includes(r.id)).slice(0, 5)
  const overflowRoutes = routes.filter(r => !PRIMARY_ROUTES.includes(r.id))

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-12 bg-surface border-t border-border-subtle flex items-center justify-around px-2">
        {primaryRoutes.map((route) => {
          const isActive = route.id === activeRoute
          return (
            <a
              key={route.id}
              href={route.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-0 px-2 py-1 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-text-muted hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}>
                {routeIcons[route.id] ?? 'link'}
              </span>
              <span className="font-label-mono text-[9px] uppercase tracking-wider">
                {routeLabels[route.id] ?? route.label}
              </span>
              {isActive && <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
            </a>
          )
        })}

        {overflowRoutes.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSheet(!showSheet)}
            className="flex flex-col items-center justify-center gap-0.5 min-w-0 px-2 py-1 rounded-lg text-text-muted hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-xl">more_horiz</span>
            <span className="font-label-mono text-[9px] uppercase tracking-wider">更多</span>
          </button>
        )}
      </nav>

      {/* Overflow bottom sheet */}
      {showSheet && overflowRoutes.length > 0 && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowSheet(false)}
          />
          <div className="fixed bottom-12 left-0 right-0 z-50 bg-surface rounded-t-2xl border-t border-border-subtle p-4 shadow-xl animate-slide-up">
            <div className="grid grid-cols-4 gap-3">
              {overflowRoutes.map((route) => (
                <a
                  key={route.id}
                  href={route.href}
                  onClick={() => setShowSheet(false)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-colors ${
                    route.id === activeRoute
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-muted hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">link</span>
                  <span className="font-label-mono text-[9px] uppercase text-center">{route.label}</span>
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default MobileTabBar
```

**Note:** The component uses Material Symbols from the Google Fonts CDN already loaded in index.html. The `animate-slide-up` keyframe needs to be added to CSS.

- [ ] **Step 2: Add slide-up animation to CSS**

In `src/index.css`, add:

```css
@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.animate-slide-up {
  animation: slide-up 300ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
```

- [ ] **Step 3: Export MobileTabBar from components/index.ts**

Add to `src/components/index.ts`:
```typescript
export { default as MobileTabBar } from './MobileTabBar'
```

- [ ] **Step 4: Build check**

Run: `npx vite build 2>&1 | tail -3`
Expected: build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/components/MobileTabBar.tsx src/components/index.ts src/index.css
git commit -m "feat: add MobileTabBar with overflow bottom sheet"
```

---

### Task 5: Mobile Blog Layout Integration

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Add mobile blog layout to App.tsx**

In the blog render section, when `isMobile`:
- Show `MobileTabBar` (instead of `BlogSidebar`)
- No glass panel (just pure white card)
- No breadcrumb header
- Content is full-width

```tsx
// Inside blog render, replace current route-stage/route-frame:
{isMobile ? (
  // Mobile: full-width card, no sidebar, no glass
  <div className="px-4 pt-4 pb-16" style={{ backgroundColor: '#F5F9FC', minHeight: '100vh' }}>
    <MobileTabBar routes={availableRouteItems} activeRoute={activeRoute} />
    <ErrorBoundary key={activeRouteItem.id}>
      {activePlugin ? (
        <div className="bg-surface rounded-xl border border-border-subtle p-4">
          <activePlugin.component config={activePlugin.config} />
        </div>
      ) : (
        /* Unavailable fallback */
        <div className="bg-surface rounded-xl border border-border-subtle p-4">
          <p className="text-text-muted">模块不可用</p>
        </div>
      )}
    </ErrorBoundary>
  </div>
) : (
  // Desktop: current layout with sidebar + glass panel
  <Layout routeMode>
    <Header simple ... />
    <main className="page-shell route-page-shell page-ready">
      ...
    </main>
    ...
  </Layout>
)}
```

**Important:** This restructure means the blog render has two completely separate branches. Keep the desktop branch identical to the current code, and add the mobile branch as described.

- [ ] **Step 2: Update mobile welcome to skip intro completely**

```tsx
// Welcome screen
{isMobile ? (
  <Layout>
    {/* Static gradient background */}
    <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-background z-0 pointer-events-none" />
    {/* Minimal welcome - no intro animation */}
    {profilePlugin && (
      <main className="relative z-10 page-shell home-page-shell mx-auto max-w-[1480px] pt-14 px-6 md:px-12 xl:px-16 page-ready">
        <ErrorBoundary>
          <profilePlugin.component config={profilePlugin.config} />
        </ErrorBoundary>
      </main>
    )}
    <ContactDrawer ... />
  </Layout>
) : (
  // Desktop welcome with Vanta + intro
  ...
)}
```

- [ ] **Step 3: Add mobile-responsive CSS overrides**

In `src/index.css`, add to the existing `@media (max-width: 768px)` block:

```css
@media (max-width: 768px) {
  .route-page-shell {
    display: none; /* Desktop layout hidden on mobile */
  }
}
```

- [ ] **Step 4: Build check**

Run: `npx vite build 2>&1 | tail -3`
Expected: build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/index.css
git commit -m "feat: integrate mobile layout with TabBar and full-width cards"
```

---

### Task 6: Verify and Finalize

**Files:**
- Test: `tests/homepage.spec.ts`

- [ ] **Step 1: Run full test suite**

Run: `npx playwright test --reporter=list 2>&1`
Expected: 2 passed (desktop tests)

- [ ] **Step 2: Final commit**

```bash
git add -A
git commit -m "feat: complete mobile adaptation and MiniPlayer redesign"
```
