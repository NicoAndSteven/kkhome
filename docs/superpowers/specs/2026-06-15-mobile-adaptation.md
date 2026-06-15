# Mobile Adaptation & MiniPlayer Redesign Spec

## 1. Device Detection Strategy

**Approach:** JS-based responsive breakpoints — render different component trees for desktop vs mobile, not just CSS hiding.

```typescript
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return isMobile
}
```

- **Desktop:** >= 768px — current layout (sidebar + glass panel + Vanta)
- **Mobile:** < 768px — bottom tab bar + full-width cards + static background
- **Tablet (768-1024px):** Use desktop layout with narrower sidebar

---

## 2. Mobile Welcome Page

| Element | Desktop | Mobile |
|---------|---------|--------|
| Background | Vanta Birds (animated) | Static gradient (#4DD0C8 → #64B5F6) |
| Logo | 80px brand icon | 56px brand icon |
| Title | clamp(36px, 6vw, 56px) | 28px |
| Quote | 15px italic | 13px italic |
| "开始使用" | Gradient button, 12px rounded | Same, full-width tap target |
| Vanta Rings intro | Full animation | Skipped (prefers-reduced-motion) |

**Key changes:**
- Mobile skips Vanta entirely (both Rings intro and Birds background)
- Welcome page loads instantly with static gradient background
- All animations respect `prefers-reduced-motion` (already in place)

---

## 3. Mobile Blog Layout

### 3.1 Navigation: Bottom TabBar (replaces sidebar)

```
┌──────────────────────────────────┐
│                                  │
│         Content Area             │
│    (plugin component, full       │
│     width, no glass panel)       │
│                                  │
├──────────────────────────────────┤
│  🏠  🔧  ⭐  📰  📊  ⋯         │
│ 首页 导向 许愿 新闻 看盘  更多  │
└──────────────────────────────────┘
```

- **TabBar:** Fixed bottom, 48px height, white bg with top border
- **Primary tabs (5):** 首页, 导向, 许愿, 新闻, 看盘 — always visible
- **Overflow (⋯):** 更多 — opens a bottom sheet with remaining routes
- **Active tab:** Seafoam text + small top indicator dot
- **Icon + label** (10px uppercase mono)

### 3.2 Content Area

| Aspect | Desktop | Mobile |
|--------|---------|--------|
| Container | Glass panel (rounded-3xl, blur) | Pure white card, no glass |
| Border | 1px frost border | 1px frost border |
| Border radius | 24px | 12px |
| Padding | 32px | 16px |
| Sidebar | 264px left | None (replaced by TabBar) |
| Header | Breadcrumb + title + contact | None (title in tab) |

- Mobile route pages are simple white cards with subtle border
- No glass effect (saves GPU, better scroll perf)
- Content scrolls naturally (no fixed height constraint)

### 3.3 Header / Brand

- **Desktop:** Sidebar has KKHOME logo + breadcrumb in content header
- **Mobile:** Top of content area shows route name in 20px bold, no breadcrumb
- Brand logo is only visible on welcome page

---

## 4. MiniPlayer Redesign (Netease Cloud Music Style)

### 4.1 Current Design Problems

- Waveform bars are random height on each render (`Math.random()`)
- Bottom bar is minimal (12px height)
- Volume slider looks generic
- No progress indication (tracks don't have duration metadata)

### 4.2 Netease-inspired MiniPlayer

```
┌──────────────────────────────────────────────────┐
│  ⏮  ▶  ⏭   ─────────────●──────────  03:24    │
│                  Rain                    +  🔝  │
└──────────────────────────────────────────────────┘
```

**Layout (mobile-first, responsive):**
- Fixed bottom bar, 56px height, white bg, top border
- Left: Transport controls (previous, play/pause, next) in a row
- Center: Progress bar (full-width, interactive click/drag)
  - Track background: #E0ECF5 (frost)
  - Progress fill: linear-gradient(90deg, #4DD0C8, #64B5F6)  
  - Thumb: 8px circle, white, seafoam border
  - Height: 4px (track), 4px (fill, rounded)
- Below progress: Active track name in 12px mono, left-aligned
- Right: Elapsed time (00:00 format) + Open full player button

**Desktop variant (minimal bar):**
- Same layout but narrower (max-width container)
- Track name on left, controls in center, time on right

### 4.3 Progress Bar Interaction

- Click on bar → seek to position (sets normalized progress)
- Drag thumb → real-time position update
- Progress is stored in TrackState: add `progress: number` (0–1)
- AudioEngine generates fake progress (AudioContext.currentTime based)

### 4.4 AudioEngine Changes

```typescript
interface TrackState {
  id: string
  playing: boolean
  volume: number
  progress: number  // NEW: 0–1, updated in animation loop
  duration: number  // NEW: estimated duration in seconds
}
```

- Each track gets a `duration` in seconds (hardcoded per track: 120–300s)
- When playing, `progress += deltaTime / duration` each frame
- When progress >= 1, loop back to 0 (auto-repeat)

---

## 5. Implementation Priority

### Phase 1: MiniPlayer Redesign
1. Add `progress` and `duration` to TrackState
2. Update AudioEngine to compute progress in animation loop
3. Rewrite MiniPlayer with Netease-style progress bar
4. Remove old waveform bars

### Phase 2: Mobile Detection + Welcome
1. Create `useIsMobile` hook
2. Mobile welcome: static gradient, no Vanta
3. Skip Vanta Rings intro on mobile

### Phase 3: Mobile TabBar
1. Create `MobileTabBar` component
2. Create `MobileOverflowSheet` component (for overflow routes)
3. Replace sidebar with TabBar on mobile
4. Adjust content area (full-width, no glass)

### Phase 4: Polish
1. Mobile touch targets (min 44px)
2. Overscroll behavior
3. Test on 390px viewport
4. Update Playwright tests for mobile

---

## 6. Files to Change

| File | Change |
|------|--------|
| `src/plugins/ambient-music/AudioEngine.ts` | Add progress/duration to TrackState, compute in loop |
| `src/plugins/ambient-music/tracks.ts` | Add duration per track |
| `src/plugins/ambient-music/MiniPlayer.tsx` | Full rewrite — Netease progress bar style |
| `src/index.css` | Add mobile TabBar styles, MiniPlayer progress bar styles |
| `src/App.tsx` | Add `useIsMobile`, conditional welcome/blog layout |
| `src/components/MobileTabBar.tsx` | Create new |
| `src/components/MobileOverflowSheet.tsx` | Create new |
| `src/components/BlogSidebar.tsx` | No change (not rendered on mobile) |
| `src/components/VantaRings.tsx` | Skip if mobile |
| `src/components/VantaBirds.tsx` | Skip if mobile |
| `tests/homepage.spec.ts` | Add mobile viewport tests |
