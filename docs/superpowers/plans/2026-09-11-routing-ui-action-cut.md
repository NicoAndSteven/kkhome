# Action-Cut 路由壳实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 沿已批准的 Action-Cut 设计路线完整实现路由界面 UI：超薄序号导航轨 + 镜头页页头（ShotHeader）+ CUT 方向感知切换动画 + 移动端底栏/sheet + 路由域"暗到底"。

**Architecture:** 路由 UI 组件骨架已在 `dffb155` 搭好（`BlogSidebar`/`MobileTabBar`/`App` 已引用 `ac-rail`/`ac-tabbar`/`route-view`/`ac-fwd`/`ac-back`），但全部 CSS 缺失。本计划补齐 CSS 前缀实现，新增共享 `ShotHeader` 组件接管每个路由的大字标题，把 `.route-mode` 令牌强制为暗色，并对各插件根级大标题做收敛。事实来源保持 `ROUTE_ITEMS`。

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind（CSS 变量系统）+ Playwright。

**已批准设计文档：** `docs/superpowers/specs/2026-09-11-routing-ui-action-cut-design.md`

> ⚠️ 与最终组装图的一处实现必要性偏差：MiniPlayer（氛围音乐播放器）因 52px 超薄导轨放不下，改放内容帧右下角悬浮 dock（`.ac-dock-player`），功能与交互不变。导轨内仅保留联系按钮。

---

## 文件结构

| 文件 | 责任 |
|---|---|
| `src/components/ShotHeader.tsx` | 新建：每个路由的系统注入镜头页页头（kicker / 斜切大字 / 序号水印 / 取景框角标 / REC HUD） |
| `src/components/BlogSidebar.tsx` | 重写为超薄序号轨，删 ThemeToggle 与 footerSlot |
| `src/components/MobileTabBar.tsx` | 仅样式（CSS 类已存在），如无必要不改 JSX |
| `src/App.tsx` | 桌面/移动包裹 ShotHeader，传 index/total，播放器改为 dock 渲染 |
| `src/index.css` | 全部新样式 + `.route-mode` 暗色强制 + 清理旧 `.blog-sidebar` 死代码 |
| `src/plugins/*/index.tsx`（11 个） | 根级大标题收敛 |
| `tests/homepage.spec.ts` | 断言更新 + 新增路由壳冒烟 |

---

### Task 1: `.route-mode` 暗到底（基础令牌）

**Files:**
- Modify: `src/index.css` 两个 `.route-mode` 令牌块（~line 88-145 的 `:root.dark .route-mode` 与 line 201 起的 `.route-mode`）

- [ ] **Step 1: 把 `.route-mode` 块的内容替换为暗色令牌集**

当前 `:root.dark .route-mode`（暗色）与 `.route-mode`（亮色）两套。改为：`.route-mode` 直接无条件带暗色令牌，删除 `:root.dark .route-mode`。

用 Edit 精确操作：

(a) 删除 `:root.dark .route-mode` 整块（line 88 到 line 145 前 `/* ── 克莱因蓝路由模式（亮色） ── */` 之间），即 old_string 从 `:root.dark .route-mode {` 到该块结尾 `    color-scheme: dark;\n}`（含尾部空行与注释）替换为仅注释：

```css
/* ── Action-Cut 路由模式（暗到底，不再随 html.dark 切换） ── */
```

(b) 把 `.route-mode { ... }`（原亮色）整个 `{ ... }` 内容替换为暗色值：

```css
.route-mode {
    --color-background: #0b0d14;
    --color-surface: #13151e;
    --color-surface-card: #191c28;
    --color-primary: #4d7cff;
    --color-secondary: #6b8cbd;
    --color-tertiary: #c8cce0;
    --color-text-muted: #7a7e92;
    --color-border-subtle: rgba(200, 204, 224, 0.08);
    --color-glow-primary: rgba(77, 124, 255, 0.08);
    --color-glow-secondary: rgba(107, 140, 189, 0.06);
    --color-on-primary: #ffffff;
    --color-on-surface: #e8eaf0;
    --color-on-background: #d0d4e0;
    --color-on-surface-variant: #8b8fa3;
    --color-surface-container: #181b27;
    --color-surface-container-low: #13151e;
    --color-error: #ff5c5c;
    --color-error-container: rgba(255, 92, 92, 0.08);
    --color-on-error: #0b0d14;
    --color-outline: rgba(200, 204, 224, 0.12);
    --color-outline-variant: rgba(200, 204, 224, 0.06);
    --color-body-bg: #0b0d14;
    --color-body-text: #d0d4e0;
    --color-glass-bg: rgba(19, 21, 30, 0.82);
    --color-glass-border: rgba(200, 204, 224, 0.06);
    --color-glass-hover-border: rgba(77, 124, 255, 0.20);
    --color-glass-shadow: rgba(0, 0, 0, 0.30);
    --color-panel-bg: rgba(19, 21, 30, 0.94);
    --color-panel-item-bg: rgba(25, 28, 40, 0.98);
    --color-panel-border: rgba(200, 204, 224, 0.06);
    --color-panel-border-strong: rgba(200, 204, 224, 0.10);
    --color-panel-highlight: rgba(25, 28, 40, 0.90);
    --color-panel-shadow: rgba(0, 0, 0, 0.20);
    --color-panel-accent: rgba(77, 124, 255, 0.90);
    --color-field-bg: #191c28;
    --color-grid-line: rgba(200, 204, 224, 0.03);
    --color-intro-bg: #0b0d14;
    --color-drawer-bg: rgba(19, 21, 30, 0.98);
    --color-drawer-border: rgba(200, 204, 224, 0.06);
    --color-drawer-shadow: rgba(0, 0, 0, 0.25);
    --color-surface-tint: #4d7cff;
    --color-primary-container: rgba(77, 124, 255, 0.08);
    --color-on-primary-container: #4d7cff;
    --color-secondary-container: rgba(107, 140, 189, 0.08);
    --color-on-secondary-container: #c8cce0;
    --color-on-secondary: #0b0d14;
    --color-secondary-fixed: #1a2338;
    --color-inverse-surface: #e8eaf0;
    --color-inverse-on-surface: #0b0d14;
    --color-surface-dim: #0b0d14;
    --color-surface-bright: #1e2230;
    color-scheme: dark;
}
```

- [ ] **Step 2: 确认没有语法重复**

Run: `npx tsc --noEmit`（CSS 不参与 tsc，但防止误伤 JSX；此时无 CSS 语法校验，先跑也可）
Expected: 现有代码类型检查通过（本步不引入 TS 改动）。

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat(shell): 路由域 route-mode 强制暗色令牌（暗到底）"
```

---

### Task 2: ShotHeader 组件（新建）+ 镜头页页头 CSS

**Files:**
- Create: `src/components/ShotHeader.tsx`
- Modify: `src/index.css`（文末追加 `.ac-shot*` 块）
- Modify: `src/components/index.ts`（导出 ShotHeader）

- [ ] **Step 1: 写组件**

`src/components/ShotHeader.tsx`：

```tsx
import { RouteItem } from '@core/routeBridge'

const EN_LABEL: Record<string, string> = {
  profile: 'HOME',
  'ai-navigator': 'TOOLS',
  'wish-wall': 'WISH',
  'stock-watch': 'STOCK',
  food: 'FOOD',
  'party-games': 'GAME',
  'local-music': 'MUSIC',
  'universal-inbox': 'INBOX',
  'quick-launch': 'LAUNCH',
  workbench: 'BENCH',
  collections: 'SAVE',
  scratchpad: 'DRAFT',
}

const pad = (n: number) => String(n).padStart(2, '0')

export interface ShotHeaderProps {
  route: RouteItem
  index: number  // 1-based 序号（第几个可用路由）
  total: number
}

/** Action-Cut 镜头页页头：kicker + 斜切大字标题 + 胶片序号水印 + 取景框角标 + REC HUD */
const ShotHeader = ({ route, index, total }: ShotHeaderProps) => {
  const kicker = EN_LABEL[route.pluginId] ?? `MODULE`
  return (
    <header className="ac-shot">
      <span className="ac-corner ac-tl" aria-hidden="true" />
      <span className="ac-corner ac-tr" aria-hidden="true" />
      <span className="ac-corner ac-bl" aria-hidden="true" />
      <span className="ac-corner ac-br" aria-hidden="true" />
      <span className="ac-hud" aria-hidden="true"><i />REC&nbsp;<b>CUT {pad(index)}</b>&nbsp;/ {pad(total)}</span>
      <span className="ac-shot-kicker">MODULE / {kicker}</span>
      <h1 className="ac-shottitle">{route.label}</h1>
      <span className="ac-shotno" aria-hidden="true">{pad(index)}</span>
    </header>
  )
}

export default ShotHeader
```

- [ ] **Step 2: 导出**

`src/components/index.ts`：加入 `export { default as ShotHeader } from './ShotHeader'`。

- [ ] **Step 3: 追加 CSS**

在 `src/index.css` 末尾追加：

```css
/* ── Action-Cut 镜头页页头（路由内容） ── */
.ac-shot { position: relative; padding: 92px 48px 24px; }
.ac-shot-kicker {
  display: inline-flex; align-items: center; gap: 10px;
  font-family: "JetBrains Mono", "Noto Sans SC", monospace;
  font-size: 11px; font-weight: 700; letter-spacing: 0.3em; color: #8fb0ff;
}
.ac-shot-kicker::before { content: ''; width: 34px; height: 2px; background: #3d6dff; box-shadow: 0 0 12px rgba(61, 109, 255, 0.8); }
.ac-shottitle {
  margin-top: 20px; font-family: Geist, "Noto Sans SC", system-ui, sans-serif;
  font-weight: 800; letter-spacing: -0.03em; line-height: 0.96;
  transform: skewX(-5deg) translateX(-3px);
  font-size: clamp(40px, 5.5vw, 72px);
  background: linear-gradient(100deg, #ffffff 38%, #8fb0ff 64%, #2e55c9 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.ac-hud {
  position: fixed; top: 26px; right: 60px; z-index: 41; pointer-events: none;
  display: flex; align-items: center; gap: 6px;
  font-family: "JetBrains Mono", "Noto Sans SC", monospace;
  font-size: 10px; letter-spacing: 0.2em; color: #5d6478;
}
.ac-hud i { width: 8px; height: 8px; border-radius: 50%; background: #ff4747; animation: ac-rec-blink 1.2s steps(2, start) infinite; }
.ac-hud b { color: #f2f4fb; font-weight: 700; }
.ac-shotno {
  position: absolute; right: 28px; bottom: -6px; pointer-events: none; user-select: none;
  font-family: "JetBrains Mono", "Noto Sans SC", monospace; font-weight: 800;
  font-size: clamp(110px, 15vw, 220px); line-height: 1;
  color: transparent; -webkit-text-stroke: 1px rgba(143, 176, 255, 0.13);
}
@keyframes ac-rec-blink { 50% { opacity: 0.15; } }
@media (max-width: 900px) {
  .ac-shot { padding: 76px 16px 12px; }
  .ac-hud { display: none; }
  .ac-shot .ac-corner { display: none; }
  .ac-shotno { right: 8px; }
}
```

- [ ] **Step 4: 构建校验**

Run: `npm run build`
Expected: 通过（tsc + vite）。`ShotHeader` 尚无调用者，属死代码但合法。

- [ ] **Step 5: Commit**

```bash
git add src/components/ShotHeader.tsx src/components/index.ts src/index.css
git commit -m "feat(shell): 新增 ShotHeader 镜头页页头组件与样式"
```

---

### Task 3: 路由外壳 CSS（route-shell / route-main / route-view 切镜 / 状态 / dock）

**Files:**
- Modify: `src/index.css`（文末追加上述壳层后追加本块）

- [ ] **Step 1: 追加路由外壳 CSS**

```css
/* ── Action-Cut 路由外壳与切镜 ── */
.route-shell { display: flex; height: 100dvh; overflow: hidden; }
.route-main {
  flex: 1; min-width: 0; position: relative;
  overflow-y: auto; overflow-x: hidden;
  scrollbar-color: rgba(143, 176, 255, 0.25) transparent;
}
.route-view { min-height: 100%; position: relative; }
.route-view.ac-fwd { animation: ac-cut-fwd 280ms cubic-bezier(0.22, 1, 0.36, 1); }
.route-view.ac-back { animation: ac-cut-back 280ms cubic-bezier(0.22, 1, 0.36, 1); }
@keyframes ac-cut-fwd {
  from { opacity: 0; transform: translateX(6%) scale(0.985); filter: blur(6px); }
  to   { opacity: 1; transform: none; filter: blur(0); }
}
@keyframes ac-cut-back {
  from { opacity: 0; transform: translateX(-6%) scale(0.985); filter: blur(6px); }
  to   { opacity: 1; transform: none; filter: blur(0); }
}
.ac-loading {
  min-height: 44vh; display: grid; place-items: center;
  font-family: "JetBrains Mono", "Noto Sans SC", monospace; font-size: 11px; font-weight: 700;
  letter-spacing: 0.3em; color: #5d6478;
}
.ac-unavailable { padding: 40px 48px; }
.ac-unavailable .ac-display.ac-h2 {
  margin-top: 18px; transform: skewX(-5deg); font-weight: 800;
  font-size: clamp(40px, 5vw, 64px); line-height: 0.98; color: #f2f4fb; text-transform: uppercase;
}
.ac-unavailable .ac-display.ac-h2 em { font-style: normal; color: transparent; -webkit-text-stroke: 1.5px rgba(143, 176, 255, 0.5); }
.ac-unavailable .ac-final-sub { margin-top: 24px; max-width: 46ch; color: #99a2ba; }
.ac-dock-player {
  position: fixed; right: 20px; bottom: 20px; z-index: 42;
  width: 268px; max-height: 230px; overflow: hidden;
  border-radius: 20px; border: 1px solid rgba(143, 176, 255, 0.14);
  background: rgba(7, 11, 22, 0.82); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 24px 50px -28px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
@media (prefers-reduced-motion: reduce) {
  .route-view.ac-fwd, .route-view.ac-back { animation: none; }
}
```

- [ ] **Step 2: 检查现有 `.ac-h2` / `.ac-display` / `.ac-kicker` 是否与已有定义冲突**

Run: `grep -nE "^\.ac-h2|^\.ac-display|^\.ac-kicker" src/index.css`
- 若 `.ac-kicker` 已存在且样式兼容（蓝冰色 mono kicker），保留现状；本块 `.ac-unavailable .ac-display.ac-h2` 自带颜色覆盖，不依赖全局。
- 若 `.ac-display` 已存在（首页 hero 用），不要重复定义通用规则，仅保留上面的 scoped 覆盖。

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat(shell): 路由外壳布局 + CUT 方向感知切镜动画 + 状态样式 + 播放器 dock"
```

---

### Task 4: 超薄序号轨（BlogSidebar 重写 + CSS）

**Files:**
- Modify: `src/components/BlogSidebar.tsx`（整体重写）
- Modify: `src/index.css`（文末追加 `.ac-rail` 块）

- [ ] **Step 1: 重写组件**

`src/components/BlogSidebar.tsx`：

```tsx
import { HubRouteId } from '@core/routeBridge'

interface RouteItem {
  id: HubRouteId
  label: string
  href: string
}

interface Props {
  routes: RouteItem[]
  activeRoute: string
  activeIndex: number  // activeRoute 在 routes 中的下标（0-based）
  onContactClick?: () => void
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Action-Cut 超薄序号轨：片场监视器刻度，hover/当前路由浮出标签刀片 */
const BlogSidebar = ({ routes, activeRoute, activeIndex, onContactClick }: Props) => {
  return (
    <aside className="ac-rail" aria-label="主导航">
      <div className="ac-rail-brand">KK<span className="ac-rail-brand-rec">REC</span></div>

      <nav className="ac-rail-nav">
        {routes.map((route, i) => {
          const active = i === activeIndex
          return (
            <a
              key={route.id}
              href={route.href}
              className={`ac-rail-num${active ? ' ac-active' : ''}`}
              aria-label={route.label}
              aria-current={active ? 'page' : undefined}
              title={`${pad(i + 1)} · ${route.label}`}
            >
              {pad(i + 1)}
              <span className="ac-rail-blade" aria-hidden="true">{pad(i + 1)} · {route.label}</span>
            </a>
          )
        })}
      </nav>

      <div className="ac-rail-foot">
        {onContactClick && (
          <button type="button" className="ac-rail-tool" onClick={onContactClick} aria-label="联系我" title="联系我">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H9l-4 3v-3H6a3 3 0 0 1-3-3V6z" /></svg>
          </button>
        )}
      </div>
    </aside>
  )
}

export default BlogSidebar
```

- [ ] **Step 2: 追加 CSS**

```css
/* ── Action-Cut 超薄序号轨 ── */
.ac-rail {
  width: 52px; flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center; gap: 14px;
  padding: 18px 0 16px;
  background: #070b14; border-right: 1px solid rgba(143, 176, 255, 0.12);
}
.ac-rail-brand {
  font-family: "JetBrains Mono", "Noto Sans SC", monospace;
  font-size: 9px; font-weight: 700; letter-spacing: 0.12em; color: #f2f4fb;
}
.ac-rail-brand-rec { color: #8fb0ff; }
.ac-rail-nav { display: flex; flex-direction: column; gap: 8px; }
.ac-rail-num {
  position: relative; width: 30px; height: 30px; display: grid; place-items: center;
  font-family: "JetBrains Mono", monospace; font-size: 11px; font-weight: 700;
  color: #5d6478; border: 1px solid transparent; border-radius: 4px; text-decoration: none;
  transition: color 180ms, border-color 180ms, background 180ms, box-shadow 180ms;
}
.ac-rail-num:hover { color: #8fb0ff; }
.ac-rail-num.ac-active {
  color: #8fb0ff; border-color: rgba(143, 176, 255, 0.4);
  background: rgba(61, 109, 255, 0.13); box-shadow: 0 0 12px rgba(61, 109, 255, 0.25);
}
.ac-rail-blade {
  position: fixed; left: 58px; top: 18px; z-index: 45; pointer-events: none;
  font-family: "JetBrains Mono", "Noto Sans SC", monospace; font-size: 9px; font-weight: 500;
  letter-spacing: 0.24em; color: #8fb0ff;
  border: 1px solid rgba(143, 176, 255, 0.35); background: rgba(7, 11, 22, 0.88);
  padding: 6px 12px; white-space: nowrap;
  opacity: 0; transform: translateX(-4px);
  transition: opacity 120ms, transform 120ms;
}
.ac-rail-num:hover .ac-rail-blade,
.ac-rail-num.ac-active .ac-rail-blade { opacity: 1; transform: none; }
.ac-rail-foot { margin-top: auto; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.ac-rail-tool {
  width: 30px; height: 30px; display: grid; place-items: center;
  color: #5d6478; background: transparent; border: 1px solid transparent; border-radius: 4px; cursor: pointer;
  padding: 0; transition: color 180ms, border-color 180ms;
}
.ac-rail-tool:hover { color: #8fb0ff; border-color: rgba(143, 176, 255, 0.3); }
@media (max-width: 900px) { .ac-rail-blade { display: none; } }
```

- [ ] **Step 3: 校验无残留引用**

Run: `grep -rn "BlogSidebar" src --include="*.tsx"`
Expected: 仅 App.tsx 引用；App 传参将在 Task 6 更新（此步先改组件，TypeScript 在 Task 6 前会报 props 缺参——**故意先跑 build 预期失败，属 TDD 节奏，直接进入 Task 6 完成接线后再 build**）。

- [ ] **Step 4: Commit**（组件+CSS 先提交，App 接线下一任务补）

```bash
git add src/components/BlogSidebar.tsx src/index.css
git commit -m "feat(shell): 超薄序号导轨（BlogSidebar 重写 + ac-rail 样式）"
```

---

### Task 5: 移动端底栏 + sheet 样式

**Files:**
- Modify: `src/index.css`（文末追加 `.ac-tabbar*` / `.ac-sheet*`）
- Modify（如已有同名类冲突时）：`src/components/MobileTabBar.tsx`（本计划不动 JSX）

- [ ] **Step 1: 追加 CSS**

```css
/* ── Action-Cut 移动端底栏与更多抽屉 ── */
.ac-tabbar {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 44;
  display: flex; justify-content: center; gap: 4px;
  padding: 9px 10px calc(9px + env(safe-area-inset-bottom));
  background: rgba(7, 11, 22, 0.78); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
  border-top: 1px solid rgba(143, 176, 255, 0.12);
}
.ac-tab {
  flex: 0 1 74px; display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 8px 6px; border-radius: 10px; color: #9aa2b8; text-decoration: none;
  border: 1px solid transparent; transition: color 200ms, background 200ms, box-shadow 200ms;
}
.ac-tab:hover { color: #f2f4fb; }
.ac-tab.ac-active {
  color: #8fb0ff; background: rgba(61, 109, 255, 0.16);
  box-shadow: inset 0 0 0 1px rgba(143, 176, 255, 0.25);
}
.ac-tab-label { font-size: 10px; letter-spacing: 0.04em; }
.ac-tab-cue { display: none; }
.ac-sheet-mask { position: fixed; inset: 0; z-index: 48; background: rgba(2, 4, 9, 0.62); }
.ac-sheet {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 49;
  background: #070b14; border-radius: 22px 22px 0 0; border-top: 1px solid rgba(143, 176, 255, 0.14);
  padding: 20px 18px calc(24px + env(safe-area-inset-bottom));
  animation: ac-sheet-in 300ms cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes ac-sheet-in { from { transform: translateY(100%); } to { transform: none; } }
.ac-sheet-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.ac-sheet-close {
  width: 30px; height: 30px; border-radius: 8px; display: grid; place-items: center;
  color: #9aa2b8; background: rgba(226, 232, 252, 0.06); border: 1px solid rgba(226, 232, 252, 0.1);
}
.ac-sheet-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; max-height: 62dvh; overflow-y: auto; }
.ac-sheet-item {
  display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 8px;
  border: 1px solid rgba(226, 232, 252, 0.08); border-radius: 14px; color: #9aa2b8; text-decoration: none;
  font-size: 11px; background: rgba(13, 17, 32, 0.5);
}
.ac-sheet-item.ac-active { color: #8fb0ff; border-color: rgba(143, 176, 255, 0.35); background: rgba(61, 109, 255, 0.12); }
@media (prefers-reduced-motion: reduce) { .ac-sheet { animation: none; } }
```

- [ ] **Step 2: 检查 `.ac-kicker` 是否已在全局定义（sheet 头复用）**

Run: `grep -c "\.ac-kicker" src/index.css`
- 若为 0：在文末补一个全局 `.ac-kicker`（同 footer 预览：mono 11px / 0.3em / #8fb0ff）。
- 若 ≥1：跳过。

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat(shell): 移动端底栏与更多抽屉 Action-Cut 样式"
```

---

### Task 6: App 集成（ShotHeader 包裹 + 序号传递 + 播放器 dock）

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 桌面路由模式接入 ShotHeader 与序号**

Find 这段（现 line 333-337）：

```tsx
  const routeIdx = ROUTE_ITEMS.findIndex((r) => r.id === activeRouteItem.id)
  const prevIdx = prevRouteId ? ROUTE_ITEMS.findIndex((r) => r.id === prevRouteId) : -1
  const cutDir = prevIdx === -1 || routeIdx === -1 || routeIdx >= prevIdx ? 'ac-fwd' : 'ac-back'
  prevRouteId = activeRouteItem.id
```

替换为（在行尾新增 activeIdx）：

```tsx
  const routeIdx = ROUTE_ITEMS.findIndex((r) => r.id === activeRouteItem.id)
  const prevIdx = prevRouteId ? ROUTE_ITEMS.findIndex((r) => r.id === prevRouteId) : -1
  const cutDir = prevIdx === -1 || routeIdx === -1 || routeIdx >= prevIdx ? 'ac-fwd' : 'ac-back'
  prevRouteId = activeRouteItem.id
  const activeIdx = Math.max(0, availableRouteItems.findIndex((r) => r.id === activeRouteItem.id))
```

- [ ] **Step 2: 移动端路由模式**

现 line 343：`<MobileTabBar routes={availableRouteItems} activeRoute={activeRoute} />`

在 `<main …>` 内 `ac-flash` 之前插入 ShotHeader，并把 ErrorBoundary 前的容器留好。把这段：

```tsx
          <div className="ac-flash ac-go" aria-hidden="true" />
          <ErrorBoundary key={activeRouteItem.id}>
```

改为：

```tsx
          <div className="ac-flash ac-go" aria-hidden="true" />
          <ShotHeader route={activeRouteItem} index={activeIdx + 1} total={availableRouteItems.length} />
          <ErrorBoundary key={activeRouteItem.id}>
```

- [ ] **Step 3: 桌面路由模式**

现 line 382-384：

```tsx
        <main className="route-main">
          <div key={activeRouteItem.id} className={`route-view ${cutDir}`} aria-label={activeRouteItem.label}>
            <div className="ac-flash ac-go" aria-hidden="true" />
```

改为在 flash 后插入 ShotHeader，并在 `</main>` 前插入 dock 播放器：

```tsx
        <main className="route-main">
          <div key={activeRouteItem.id} className={`route-view ${cutDir}`} aria-label={activeRouteItem.label}>
            <div className="ac-flash ac-go" aria-hidden="true" />
            <ShotHeader route={activeRouteItem} index={activeIdx + 1} total={availableRouteItems.length} />
            <ErrorBoundary key={activeRouteItem.id}>
```

然后该 `route-shell` 分支里 `<main className="route-main"> … </main>` 闭合前（即 `</main>` 前一行）插入：

```tsx
          <div className="ac-dock-player">{sidebarNowPlaying}</div>
        </main>
```

注意：原 `sidebarNowPlaying` 变量仍可用，但 **不再作为 footerSlot 传入 BlogSidebar**。

- [ ] **Step 4: BlogSidebar 调用点更新**

现 line 375-381：

```tsx
        <BlogSidebar
          routes={availableRouteItems}
          activeRoute={activeRoute}
          footerSlot={sidebarNowPlaying}
          config={siteConfig ?? undefined}
          onContactClick={() => setContactOpen(true)}
        />
```

改为：

```tsx
        <BlogSidebar
          routes={availableRouteItems}
          activeRoute={activeRoute}
          activeIndex={activeIdx}
          onContactClick={() => setContactOpen(true)}
        />
```

- [ ] **Step 5: 顶部导入**

在 `import { HubRouteId, normalizeHubRoute, ROUTE_ITEMS } from '@core/routeBridge'` 下方加入：

```tsx
import ShotHeader from '@components/ShotHeader'
```

（若 `@components` 已从 index 聚合导出，也可改用 `import { …, ShotHeader } from '@components'`，与现有 `Layout, IntroStage, …` 的导入合并。）

- [ ] **Step 6: build 通关**

Run: `npm run build`
Expected: tsc + vite 通过。此时导轨/页头/切镜已全部接线。

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx
git commit -m "feat(shell): 路由页集成 ShotHeader 与序号，播放器改内容帧 dock"
```

---

### Task 7: 插件标题收敛（6 个重点路由插件）

**Files:**
- Modify: `src/plugins/ai-navigator/index.tsx`
- Modify: `src/plugins/food/index.tsx`
- Modify: `src/plugins/stock-watch/index.tsx`
- Modify: `src/plugins/wish-wall/index.tsx`
- Modify: `src/plugins/local-music/index.tsx`
- Modify: `src/plugins/party-games/index.tsx`

原则：ShotHeader 已给出大字标题，插件自身大 `<h2>` 删掉；保留其描述段与功能性控件；去掉冗余的 "Section 0X" 小标。

- [ ] **Step 1: ai-navigator**

删掉（现 line 162-167）：

```tsx
            <div className="flex items-end justify-between gap-4">
          <div>
            <span className="font-label-mono text-[9px] uppercase tracking-[0.32em] text-primary">工具导向</span>
            <h2 className="mt-1 font-headline-md text-[clamp(1.6rem,3vw,2.6rem)] font-bold leading-[1] tracking-[-0.05em] text-on-surface">
              找工具
            </h2>
          </div>
          <span className="mb-0.5 font-label-mono text-[10px] text-text-muted">{tools.length} 已收录</span>
        </div>
```

替换为：

```tsx
            <div className="flex items-end justify-between gap-4">
          <span className="mb-0.5 font-label-mono text-[10px] text-text-muted">{tools.length} 已收录</span>
        </div>
```

（缩进以 Edit 精确匹配为准，复制文件内原字符，仅删去 `工具导向`/`找工具` 两行与其包裹的 `<div>`。）

- [ ] **Step 2: food**

删去（line 62-66）：

```tsx
            <div className="flex items-center gap-3">
              <span className="font-label-mono text-[10px] uppercase tracking-[0.34em] text-primary">Section 03</span>
              <span className="h-px w-24 bg-[linear-gradient(90deg,rgba(17,72,255,0.6),rgba(224,20,52,0.55),transparent)]" />
            </div>
            <h2 className="mt-3 font-headline-md text-[clamp(2.4rem,4.8vw,4.2rem)] font-semibold leading-[0.92] tracking-[-0.08em] text-on-surface">今天吃什么</h2>
```

保留其后的 `<p …>把随机推荐做成……</p>`。

- [ ] **Step 3: stock-watch**

删去（line 114-120 类似的 Section 04 + h2）：

```tsx
            <div className="flex items-center gap-3">
              <span className="font-label-mono text-[10px] uppercase tracking-[0.34em] text-primary">Section 04</span>
              <span className="h-px w-24 bg-[linear-gradient(90deg,rgba(17,72,255,0.6),rgba(224,20,52,0.55),transparent)]" />
            </div>
            <h2 className="mt-3 font-headline-md text-[clamp(2.4rem,4.8vw,4.2rem)] font-semibold leading-[0.92] tracking-[-0.08em] text-on-surface">
              QDII 看盘
            </h2>
```

保留其后的 `<p …>基金重仓股实时行情看板……</p>`。

- [ ] **Step 4: wish-wall**

删去（line 273-277）：

```tsx
            <div className="flex items-center gap-3">
              <span className="font-label-mono text-[10px] uppercase tracking-[0.34em] text-text-muted">Section 02</span>
              <span className="h-px flex-1 bg-border-subtle" />
            </div>
            <h2 className="mt-3 max-w-[8ch] font-headline-md text-[clamp(2.4rem,4.8vw,4.6rem)] font-semibold leading-[0.92] tracking-[-0.08em] text-on-surface">访客许愿墙</h2>
```

保留其后的 `<p …>留下你期待上线的功能……</p>`。

- [ ] **Step 5: local-music**

删去（line 187-192 附近）：

```tsx
            <span className="font-label-mono text-[10px] uppercase tracking-[0.24em] text-primary">Sound Archive</span>
            <h2 className="mt-2 font-headline-md text-3xl font-semibold tracking-tight text-on-surface">本地音乐</h2>
```

保留其后的 `<p …>这里是声音档案墙，不是传统播放器</p>` 与下方操作按钮组。

- [ ] **Step 6: party-games**

删去（line 544 附近，gradient card 内）：

```tsx
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">聚会游戏</h2>
```

保留其后的 `<p …>`（本地/在线说明）。

- [ ] **Step 7: Summary diff review**

Run: `git diff --stat src/plugins`
确认每个插件仅删标题/小标，未误伤逻辑代码、未改 props。

- [ ] **Step 8: Commit**

```bash
git add src/plugins/ai-navigator src/plugins/food src/plugins/stock-watch src/plugins/wish-wall src/plugins/local-music src/plugins/party-games
git commit -m "refactor(plugins): 根级大标题收敛到 ShotHeader（避免重复）"
```

---

### Task 8: 插件标题收敛（5 个轻量路由插件）

**Files:**
- Modify: `src/plugins/universal-inbox/index.tsx`
- Modify: `src/plugins/quick-launch/index.tsx`
- Modify: `src/plugins/workbench/index.tsx`
- Modify: `src/plugins/collections/index.tsx`
- Modify: `src/plugins/scratchpad/index.tsx`

- [ ] **Step 1: 逐个删除 h2**

每个文件里删除对应的 `<h2 …>…</h2>` 一行（保留其前后元素）：

- `universal-inbox`：`<h2 className="mt-xs font-headline-md text-headline-md text-on-surface">万能投入口</h2>`
- `quick-launch`：`<h2 className="mt-xs font-headline-md text-headline-md text-on-surface">万能跳转</h2>`
- `workbench`：`<h2 className="mt-xs font-headline-md text-headline-md text-on-surface">工具收纳台</h2>`
- `collections`：`<h2 className="mt-xs font-headline-md text-headline-md text-on-surface">分类收藏</h2>`
- `scratchpad`：`<h2 className="mt-xs font-headline-md text-headline-md text-on-surface">临时收纳</h2>`

- [ ] **Step 2: build 检查**

Run: `npm run build`
Expected: 通过。

- [ ] **Step 3: commit**

```bash
git add src/plugins/universal-inbox src/plugins/quick-launch src/plugins/workbench src/plugins/collections src/plugins/scratchpad
git commit -m "refactor(plugins): 轻量路由插件标题并入 ShotHeader"
```

---

### Task 9: 清理旧路由壳死样式

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: 删除 `.route-mode .blog-sidebar*` 系列**

删除从 `.route-mode .blog-sidebar {` 起、到 `.route-mode .blog-sidebar-divider { … }` 结尾的整段旧侧边栏样式（含 `.blog-sidebar-logo`/`.blog-sidebar-link`/`.blog-sidebar-divider`/`.blog-content::before` 及其 `:root.dark .route-mode` 变体）。这些类已随 BlogSidebar 重写不再存在。

Run: `grep -n "blog-sidebar\|blog-content" src/index.css`
Expected: 无输出（清理干净）。

- [ ] **Step 2: 保留其余 surface/panel 覆盖**

`.route-mode .surface-item`、`.route-mode .glass`、`.route-mode .stack-chip`、`.route-mode .surface-panel::before` 等面板类覆盖保留——它们现在对应暗色令牌仍生效（面板类在插件内广泛使用）。

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "chore(shell): 移除旧 blog-sidebar 死样式"
```

---

### Task 10: e2e 断言更新 + 新增路由壳冒烟

**Files:**
- Modify: `tests/homepage.spec.ts`

- [ ] **Step 1: 更新 "homepage renders..." 测试内被改动的选择器**

(a) line 150：`await expect(aiToolsSection.getByRole('heading', { name: '找工具' })).toBeVisible()` → 改为页面级（ShotHeader 在 section 外）：

```tsx
  await expect(page.getByRole('heading', { name: '导向' })).toBeVisible()
```

(b) line 156-163：播放器位置从 `aside` 移到 dock：

```tsx
  const nowPlaying = page.locator('.ac-dock-player').filter({ hasText: '选择歌曲开始播放' })
  await expect(nowPlaying).toHaveCount(1)
```

（`ac-dock-player` 内含 MiniPlayer section；`filter` 按文本匹配。若 MiniPlayer 未渲染文本"选择歌曲开始播放"，改为 `.ac-dock-player` 计数断言。）

(c) line 167：`wishSection.getByRole('heading', { name: '访客许愿墙' })` → `page.getByRole('heading', { name: '许愿' })`

(d) line 182：`partyGamesSection.getByRole('heading', { name: '聚会游戏' })` → `page.getByRole('heading', { name: '游戏' })`

- [ ] **Step 2: 新增一个独立测试：路由壳元素存在且可切换**

在文件末尾追加：

```tsx
test('action-cut routing shell renders rail, shot header and switches routes', async ({ page }) => {
  test.setTimeout(60_000)

  await page.route('**/api/health', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, data: { bindings: {}, features: {} } }),
    })
  })
  await page.route('**/api/music/songs', async (route) => {
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true, data: { songs: [] } }) })
  })

  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/#/ai-tools', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)

  // 超薄序号轨：数字导航
  await expect(page.locator('.ac-rail')).toBeVisible()
  await expect(page.locator('.ac-rail-nav')).toHaveCount(1)
  await expect(page.locator('.ac-rail-num[aria-label="导向"]')).toBeVisible()

  // 镜头页页头：kicker + 斜切大字 + 序号水印
  await expect(page.locator('.ac-shot-kicker')).toContainText('MODULE /')
  await expect(page.getByRole('heading', { name: '导向' })).toBeVisible()
  await expect(page.locator('.ac-shotno')).toBeVisible()

  // 切到看盘：shot header 更新
  await page.evaluate(() => { window.location.hash = '#/stock-watch' })
  await page.waitForTimeout(1500)
  await expect(page.getByRole('heading', { name: '看盘' })).toBeVisible()
  await expect(page.locator('.ac-rail-num[aria-label="看盘"]')).toHaveAttribute('aria-current', 'page')

  // 非法路由归一 home，回到欢迎页
  await page.evaluate(() => { window.location.hash = '#/nope' })
  await page.waitForTimeout(1500)
  await expect(page.getByRole('heading', { name: '垣钰' })).toBeVisible()
})
```

- [ ] **Step 3: 更新其余部分测试对 "聚会游戏" 标题的依赖**

`tests/homepage.spec.ts` 中 `party games` 相关测试（多次 `getByRole('heading', { name: '聚会游戏' })`）统一改为页面级 `page.getByRole('heading', { name: '游戏' })`（需确认ShotHeader渲染h1文本为路由 label "游戏"）。逐一检查每个 `#party-games` section 下的 heading 断言，将其整体移出 section 用 `page` 断言。

- [ ] **Step 4: 跑 e2e**

Run: `npx playwright test tests/homepage.spec.ts`
Expected: 全部通过（首次如仍有 UI 时序问题，按失败输出微调对应的 `waitForTimeout` 或选择器）。

- [ ] **Step 5: Commit**

```bash
git add tests/homepage.spec.ts
git commit -m "test: Action-Cut 路由壳 e2e 冒烟与断言更新"
```

---

### Task 11: 全量验证（构建 + 全部 e2e + 视觉检查）

- [ ] **Step 1: 全量 check**

Run: `npm run build`
Expected: 通过。

Run: `npx playwright test`
Expected: 全部通过（含既有 party-games/admin 用例，若 Title 收敛导致失败，回到 Task 10 修正断言）。

- [ ] **Step 2: 人工视觉检查**

Run: `npm run dev`
逐条检查：
- 桌面：序号轨（01-....，active 蓝色描边）、hover 刀片浮出、内容区 ShotHeader（kicker/斜切大字/水印/四角）+ REC HUD、切镜前进（右入）后退（左入）闪光、播放器 dock 右下角可播放
- 移动（~390px）：底栏 5 tab + 更多 sheet 网格、路由内容 Scroll、无横向溢出
- `prefers-reduced-motion: reduce` 下无位移动画仍可读

- [ ] **Step 3: 提交收尾**

```bash
git add -A
git commit -m "chore(shell): 收尾调整（视觉核对修正）" || echo "no changes"
```

---

## Self-Review 对照

- **Spec §4.1 超薄序号轨** → Task 4
- **Spec §4.2 ShotHeader** → Task 2
- **Spec §4.3 路由壳与切镜** → Task 3、Task 6
- **Spec §4.4 移动底栏/sheet** → Task 5
- **Spec §4.5 暗到底** → Task 1
- **Spec §4.6 插件标题收敛** → Task 7、Task 8
- **Spec §8 边界（unavailable/loading、越界序号）** → Task 3 + Task 2（`index` 由 App 用 `Math.max(0, idx)` 兜底）
- **Spec §9 测试** → Task 10、Task 11
- **Spec §11 文件清单** → 各 Task 对应
- **类型一致性**：`ShotHeaderProps { route, index: 1-based, total }`；`BlogSidebarProps { routes, activeRoute, activeIndex: 0-based }`；App 中 `activeIdx`（0-based）→ 传 `index={activeIdx + 1}` 给 ShotHeader、`activeIndex={activeIdx}` 给 BlogSidebar，序号一致均为 01..NN。