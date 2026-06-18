# KKHome Editorial Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild KKHome into a cold-white editorial magazine system with calmer color, stronger typography, and a cleaner asymmetric layout.

**Architecture:** Start with global design tokens in `src/index.css`, then restyle shared shell components (`Header`, `BlogSidebar`, `Layout`, route containers) so all plugin surfaces inherit the same editorial language. Keep routes, plugins, and content intact; only the visual shell and shared component chrome change.

**Tech Stack:** React, TypeScript, Tailwind utilities, plain CSS in `src/index.css`, Playwright

---

### Task 1: Freeze the desired editorial behavior in tests

**Files:**
- Modify: `tests/homepage.spec.ts`

- [ ] **Step 1: Add a desktop shell assertion for the cleaner editorial frame**

```ts
await expect(page.locator('header')).toBeVisible()
await expect(page.locator('.blog-sidebar')).toBeVisible()
await expect(page.locator('.route-frame')).toBeVisible()
```

- [ ] **Step 2: Add a content-preservation assertion for route pages**

```ts
await goRoute('wish-wall')
await expect(page.locator('#wish-wall')).toBeVisible()
await expect(page.getByRole('heading', { name: '访客许愿墙' })).toBeVisible()
```

- [ ] **Step 3: Run the test and confirm current behavior still passes**

Run: `npm run test:e2e -- tests/homepage.spec.ts`
Expected: PASS before styling changes, confirming the redesign does not change content structure.

- [ ] **Step 4: Commit**

```bash
git add tests/homepage.spec.ts
git commit -m "test: pin editorial shell behavior"
```

### Task 2: Rebuild the global color and surface tokens

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace the current mixed blue-red shell palette with a cold-white editorial palette**

```css
:root {
  --color-background: #f4f6fb;
  --color-surface: #fbfcfe;
  --color-surface-card: #ffffff;
  --color-primary: #102f8f;
  --color-secondary: #50607d;
  --color-text-muted: #64708a;
}
```

- [ ] **Step 2: Simplify the surface layers and reduce gradient noise**

```css
.interactive-bg {
  background:
    linear-gradient(180deg, #fbfcfe 0%, #f3f6fb 100%);
}
.surface-panel,
.surface-panel-strong,
.surface-item {
  background: rgba(255, 255, 255, 0.92);
  border-color: rgba(16, 24, 40, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
```

- [ ] **Step 3: Run the test and confirm there are no layout regressions**

Run: `npm run test:e2e -- tests/homepage.spec.ts`
Expected: PASS with unchanged content visibility.

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "feat: simplify editorial tokens"
```

### Task 3: Restyle the global shell and route chrome

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/components/BlogSidebar.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Make the header quieter and more magazine-like**

```tsx
<header className="fixed top-0 z-50 w-full border-b border-black/5 bg-[rgba(251,252,254,0.82)] backdrop-blur-xl">
```

- [ ] **Step 2: Turn the sidebar into a refined editorial index column**

```tsx
<aside className="blog-sidebar scrollbar-quiet bg-transparent">
```

- [ ] **Step 3: Remove repetitive card-like chrome from route wrappers**

```css
.route-frame::before,
.route-frame::after {
  opacity: 0.35;
}
.blog-sidebar-link.active {
  background: rgba(16, 47, 143, 0.06);
}
```

- [ ] **Step 4: Run the test and verify the route shell still renders**

Run: `npm run test:e2e -- tests/homepage.spec.ts`
Expected: PASS, with the same routes and plugin content visible.

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.tsx src/components/BlogSidebar.tsx src/index.css
git commit -m "feat: restyle editorial shell"
```

### Task 4: Finish with plugin-surface cleanup and responsive verification

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/index.css`
- Test: `tests/homepage.spec.ts`

- [ ] **Step 1: Remove any remaining heavy shell contrast from route containers**

```css
.blog-content::before {
  background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,250,252,0.9));
}
```

- [ ] **Step 2: Make mobile follow the same calm visual language**

```css
@media (max-width: 768px) {
  .route-frame {
    border-radius: 24px;
  }
}
```

- [ ] **Step 3: Run the full e2e suite**

Run: `npm run test:e2e -- tests/homepage.spec.ts`
Expected: PASS on desktop and mobile viewports.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/index.css tests/homepage.spec.ts
git commit -m "feat: complete editorial redesign"
```
