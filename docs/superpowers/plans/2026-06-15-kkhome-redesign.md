# kkhome 海盐苏打 Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将暗色极客主题改为海盐苏打清新治愈风

**Architecture:** CSS 变量换色 + 路由容器重写 + 组件颜色更新。不改组件逻辑，只替换视觉层

**Tech Stack:** React 18, Tailwind CSS 3, CSS Variables

---

### Task 1: CSS 变量体系—配色替换

**Files:**
- Modify: `src/index.css:7-173`

- [ ] **Step 1: 替换 :root（日间模式）CSS 变量**

```css
/* CSS 变量 - 海盐苏打 (默认) */
:root {
    --mouse-x: 50%;
    --mouse-y: 50%;

    /* 核心颜色 */
    --color-background: #F5F9FC;
    --color-surface: #FFFFFF;
    --color-surface-card: #FFFFFF;
    --color-primary: #4DD0C8;
    --color-secondary: #64B5F6;
    --color-text-muted: #90A4AE;
    --color-border-subtle: rgba(144, 164, 174, 0.2);
    --color-glow-primary: rgba(77, 208, 200, 0.10);
    --color-glow-secondary: rgba(100, 181, 246, 0.08);

    /* 语义颜色 */
    --color-tertiary: #F06292;
    --color-on-primary: #FFFFFF;
    --color-on-surface: #37474F;
    --color-on-background: #37474F;
    --color-on-surface-variant: #607D8B;
    --color-surface-container: #F0F6FE;
    --color-error: #E57373;

    /* 组件级变量 */
    --color-body-bg: #F5F9FC;
    --color-body-text: #37474F;
    --color-interactive-bg-base: #F5F9FC;
    --color-glass-bg: rgba(255, 255, 255, 0.85);
    --color-glass-border: rgba(144, 164, 174, 0.15);
    --color-glass-hover-border: rgba(77, 208, 200, 0.3);
    --color-glass-shadow: rgba(55, 71, 79, 0.06);
    --color-intro-bg: #F0F6FE;
    --color-drawer-bg: rgba(255, 255, 255, 0.95);
    --color-drawer-border: rgba(144, 164, 174, 0.15);
    --color-drawer-shadow: rgba(55, 71, 79, 0.08);
    --color-panel-bg: rgba(255, 255, 255, 0.9);
    --color-panel-item-bg: rgba(255, 255, 255, 0.85);
    --color-panel-border: rgba(144, 164, 174, 0.2);
    --color-panel-border-strong: rgba(144, 164, 174, 0.3);
    --color-panel-highlight: rgba(255, 255, 255, 0.9);
    --color-panel-shadow: rgba(55, 71, 79, 0.06);
    --color-panel-accent: rgba(77, 208, 200, 0.7);
    --color-field-bg: #F0F6FE;
    --color-grid-line: rgba(144, 164, 174, 0.06);
}
```

- [ ] **Step 2: 移除 :root.dark 夜间模式（不需要了）**

删除整个 `:root.dark { ... }` 块（lines 91-172）。后续如需夜间模式再重新设计，当前聚焦日间清新风格。

- [ ] **Step 3: 更新 orb 颜色**

将 `.orb-cyan` 改为 `.orb-primary`，使用 `var(--color-glow-primary)`。
将 `.orb-ember` 改为 `.orb-secondary`，使用 `var(--color-glow-secondary)`。
将 `.orb-ambient` 改为使用主色光晕。

- [ ] **Step 4: 更新交互背景 grid-line 颜色**

确保 `interactive-bg` 使用新的 `var(--color-grid-line)`。

- [ ] **Step 5: 更新 body 样式**

```css
body {
    background-color: var(--color-body-bg);
    color: var(--color-body-text);
    -webkit-font-smoothing: antialiased;
    position: relative;
    overflow-x: hidden;
}
```

- [ ] **Step 6: 更新 gradient-primary**

```css
.bg-gradient-primary {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
}
```

- [ ] **Step 7: 更新 text-gradient**

```css
.text-gradient {
    background: linear-gradient(135deg, var(--color-on-surface) 0%, var(--color-primary) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
```

- [ ] **Step 8: 更新 nav-tab-active 和相关样式**

`.nav-tab-active` 已使用 `var(--color-primary)`，自动适配。

- [ ] **Step 9: 更新 pulse-dot 颜色**

已使用 `var(--color-primary)`，自动适配。

- [ ] **Step 10: 更新 skeleton-shimmer 颜色**

```css
.skeleton-shimmer {
    background: linear-gradient(
        90deg,
        var(--color-surface) 25%,
        var(--color-surface-container) 50%,
        var(--color-surface) 75%
    );
}
```

- [ ] **Step 11: 更新 shimmer-btn::after**

已使用 `rgba(255,255,255,0.15)`，适配浅色背景（透明度降低）：

```css
.shimmer-btn::after {
    background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(77, 208, 200, 0.10) 30%,
        rgba(77, 208, 200, 0.15) 50%,
        rgba(77, 208, 200, 0.10) 70%,
        transparent 100%
    );
}
```

- [ ] **Step 12: 构建验证**

Run: `npx vite build 2>&1 | tail -5`
Expected: build succeeds

- [ ] **Step 13: 提交**

```bash
git add src/index.css
git commit -m "style: replace color system with 海盐苏打 palette"
```

---

### Task 2: 重写路由容器—水族窗格

**Files:**
- Modify: `src/index.css` (route-stage, route-frame, route-depth 相关样式)

- [ ] **Step 1: 重写路由 stage 和 frame 样式**

将现有的 `route-stage`、`route-depth-*`、`route-lens`、`route-frame` 替换为"水族窗格"玻璃质感容器：

```css
/* 水族窗格 - 路由容器 */
.route-stage {
    position: relative;
    height: 100%;
    min-height: 0;
    display: grid;
    align-items: center;
    isolation: isolate;
    padding: clamp(16px, 3vw, 36px) 0;
}

/* 玻璃质感主容器 */
.route-frame {
    position: relative;
    width: 100%;
    height: min(780px, calc(100vh - 132px));
    min-height: 0;
    overflow: hidden;
    padding: clamp(16px, 3vw, 32px);
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(77, 208, 200, 0.2);
    border-radius: 16px;
    box-shadow:
        0 8px 32px -16px var(--color-panel-shadow),
        0 0 0 1px rgba(255, 255, 255, 0.5);
    animation: route-frame-in 500ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* 顶部 header 装饰条 */
.route-frame::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-tertiary));
    border-radius: 16px 16px 0 0;
    pointer-events: none;
}

/* 虚线边框装饰 */
.route-frame::after {
    content: '';
    position: absolute;
    inset: 12px;
    border: 1px dashed var(--color-border-subtle);
    border-radius: 8px;
    pointer-events: none;
    opacity: 0.5;
}

.route-frame > * {
    position: relative;
}

/* 内容区滚动 */
.route-frame > section {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.route-frame > section > :last-child {
    min-height: 0;
    overflow: auto;
    padding-right: 2px;
    scrollbar-width: thin;
    scrollbar-color: var(--color-panel-border-strong) transparent;
}

@keyframes route-frame-in {
    0% {
        opacity: 0;
        transform: translateY(12px) scale(0.98);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
```

- [ ] **Step 2: 移除旧的 3D depth 样式**

删除以下 CSS 规则（保留其引用 class 以防编译报错，class 已在 App.tsx 中移除后面会处理）：
- `.route-stage::before` (3D 网格背景)
- `.route-stage::after` (3D 深度层)
- `.route-depth`, `.route-depth-far`, `.route-depth-mid`
- `.route-lens`
- 对应的 keyframes (route-depth-far-in, route-depth-mid-in)

- [ ] **Step 3: 移除 progress-rail 相关样式**

删除 `.progress-rail`, `.progress-dot`, `@keyframes dot-pulse`。
保留空 class 占位或直接删除（后续从组件移除）。

- [ ] **Step 4: 移除 route-nav-button/route-nav-current 样式**

删除 lines 222-263 的 `.route-nav-button` 和 `.route-nav-current` 样式（已不再使用）。

- [ ] **Step 5: 删除 :root.dark 块的 media query 引用**

- [ ] **Step 6: 构建验证**

Run: `npx vite build 2>&1 | tail -5`
Expected: build succeeds

- [ ] **Step 7: 提交**

```bash
git add src/index.css
git commit -m "style: rewrite route container as 水族窗格 glass panel"
```

---

### Task 3: 更新 App.tsx—移除 3D 路由和 progress rail

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 移除 route parallax useEffect**

删除 lines 191-226 的 route parallax useEffect 代码。

- [ ] **Step 2: 移除 ProgressRail 组件引用和 JSX**

```tsx
import { Layout, Header, IntroStage, ContactDrawer, ErrorBoundary, Loading } from '@components'
```

删除 `<ProgressRail activeSection={activeRoute} sections={availableRouteItems} />`。

- [ ] **Step 3: 简化路由内容容器**

将 route-stage/stage-depth/lens/frame 替换为简单的水族窗格容器：

```tsx
// 路由容器（水族窗格）
<div className="route-stage" aria-label={activeRouteItem.label}>
    <div className="route-frame">
        <activePlugin.component config={activePlugin.config} />
    </div>
</div>
```

- [ ] **Step 4: 构建验证**

Run: `npx vite build 2>&1 | tail -5`
Expected: build succeeds

- [ ] **Step 5: 测试验证**

Run: `npx playwright test --reporter=list 2>&1 | tail -10`
Expected: 2 passed

- [ ] **Step 6: 提交**

```bash
git add src/App.tsx
git commit -m "refactor: remove 3D route layers and progress rail"
```

---

### Task 4: 更新 Header 组件

**Files:**
- Modify: `src/components/Header.tsx`

- [ ] **Step 1: 更新品牌徽标和颜色**

```tsx
<a href="#/home" className="group flex items-center gap-2 shrink-0">
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-primary/30 bg-primary/8 text-primary font-label-mono text-xs transition-premium group-hover:border-primary/60 group-hover:bg-primary/15">
        K
    </span>
    <span className="font-headline-md text-lg font-bold text-on-surface">
        {config?.author || '垣钰'}
    </span>
</a>
```

变更：`rounded-[2px]` → `rounded-lg`（更圆润），保持其余代码。

- [ ] **Step 2: 构建验证**

Run: `npx vite build 2>&1 | tail -3`
Expected: build succeeds

- [ ] **Step 3: 提交**

```bash
git add src/components/Header.tsx
git commit -m "style: update header logo to rounded style"
```

---

### Task 5: 更新 Layout 组件—orb 颜色

**Files:**
- Modify: `src/components/Layout.tsx`

- [ ] **Step 1: 更新 orb class 名（CSS 已改）**

```tsx
<div className="orb-glow orb-primary" data-speed="0.025" aria-hidden="true" />
<div className="orb-glow orb-secondary" data-speed="0.018" aria-hidden="true" />
<div className="orb-glow orb-primary" data-speed="0.015" aria-hidden="true" style={{ width: 'min(360px, 40vw)', height: 'min(360px, 40vw)', opacity: 0.3 }} />
```

- [ ] **Step 2: 构建验证**

Run: `npx vite build 2>&1 | tail -3`
Expected: build succeeds

- [ ] **Step 3: 提交**

```bash
git add src/components/Layout.tsx
git commit -m "style: update orb colors to match new palette"
```

---

### Task 6: 更新 Loading 组件颜色

**Files:**
- Modify: `src/components/Loading.tsx`

骨架屏已使用 `skeleton-shimmer` class，自动适配新颜色。无需代码变更，验证即可。

- [ ] **Step 1: 构建验证**

Run: `npx vite build 2>&1 | tail -3`
Expected: build succeeds

---

### Task 7: 更新首页 Hero 颜色

**Files:**
- Modify: `src/plugins/profile/index.tsx`

- [ ] **Step 1: 检查 Hero 颜色**

首页 Hero 使用 CSS 变量 (var(--color-*)) 和 Tailwind utility classes，大部分颜色会通过 CSS 变量自动更新。需要手动调整的：
- `bg-gradient-primary` 已自动适配新渐变
- `text-primary` 已自动适配海蓝绿
- `border-primary/45` 等已自动适配

确认 badge 的 `border-primary/45 bg-primary/10` 在新配色下视觉效果合适。

- [ ] **Step 2: 构建验证**

Run: `npx vite build 2>&1 | tail -3`
Expected: build succeeds

---

### Task 8: 更新各插件页面颜色

**Files:**
- Modify: `src/plugins/ai-navigator/index.tsx`
- Modify: `src/plugins/news/index.tsx`
- Modify: `src/plugins/stock-watch/index.tsx`
- Modify: `src/plugins/food/index.tsx`
- Modify: `src/plugins/cloudflare-lab/index.tsx`
- Modify: `src/plugins/wish-wall/index.tsx`

- [ ] **Step 1: 全局验证**

所有插件使用 CSS 变量和 Tailwind classes，颜色会自动更新。
只需运行构建确保无编译错误。

Run: `npx vite build 2>&1 | tail -5`
Expected: build succeeds

---

### Task 9: 测试验证

**Files:**
- Modify: `tests/homepage.spec.ts`（如需）

- [ ] **Step 1: 运行完整测试套件**

Run: `npx playwright test --reporter=list 2>&1`
Expected: 2 passed

- [ ] **Step 2: 如有失败，检查是否是颜色变更导致的断言失效并修复**

注意检查是否需要更新颜色相关的 text content 断言。

---

### Task 10: 最终构建验证

- [ ] **Step 1: 构建 + lint**

Run: `npx eslint src/ 2>&1 && npx vite build 2>&1 | tail -5`
Expected: lint 无错误，build 成功

- [ ] **Step 2: Playwright 测试**

Run: `npx playwright test --reporter=list 2>&1`
Expected: 2 passed

- [ ] **Step 3: 最终提交**

```bash
git add -A
git commit -m "feat: redesign kkhome with 海盐苏打 fresh style

- Replace dark/cyan theme with cool seafoam soda palette
- Add aquarium window glass container for route pages
- Remove 3D depth layers and progress rail
- Update all components to match new color system"
```
