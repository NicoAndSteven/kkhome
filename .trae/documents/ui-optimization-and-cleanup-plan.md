# Personal Hub UI 优化与项目清理计划

## 摘要

三大方向：1) UI 缺乏动态美感 + 导航栏难看 → 重构视觉系统与导航；2) 根目录 spec 文档堆积 → 清理归档；3) 多个功能不好用 → 修复交互问题。

---

## 当前状态分析

### UI 问题

1. **导航栏（Header）设计粗糙**：使用 `<  Route 标签  >` 的左右箭头切换模式，视觉上像分页器而非导航，缺乏现代感
2. **缺乏动态美感**：页面切换只有 `route-camera-in` 一个入场动画，各插件内部无微交互、无 hover 微动效、无 staggered reveal
3. **视觉系统矛盾**：CSS 变量体系庞大（~80 个 Material Design 色值），但实际使用混乱——部分插件用 `glass` 类（旧风格），部分用 `surface-panel`（新风格），Food 插件直接用 emoji
4. **字体问题**：Tailwind 配置中 body 用 `Inter`（被两个 skill 都禁止），display 用 `Geist`（合理）
5. **色彩问题**：暗色模式 primary `#8be9f4`（高饱和霓虹青）+ secondary `#ff6b4a`（高饱和橙红），双 accent 违反"最多 1 个强调色"原则
6. **ProgressRail**：右侧 8px 小圆点导航，视觉存在感弱，与导航栏功能重复

### 文档堆积问题

根目录下存在大量已完成/过时的 spec 文件：

| 文件 | 状态 | 建议 |
|------|------|------|
| `spec.md` | 核心规格，仍有效 | 保留，更新 |
| `tasks.md` | 大部分已完成 | 保留，更新待办 |
| `checklist.md` | 与当前插件列表不同步 | 重写或删除 |
| `cloudflare-plan.md` | Phase 0 已完成，后续未开始 | 归档到 `.trae/documents/` |
| `spec-cloudflare-*.md`（8个） | 规划文档，大部分未实现 | 归档到 `.trae/specs/cloudflare/` |
| `spec-news-proxy.md` | 已实现 | 归档 |
| `spec-disruptive-hub-capsules.md` | 已实现 | 归档 |
| `spec-personal-hub-after-featured-project.md` | 已实现 | 归档 |
| `.trae/specs/` 下 6 个子目录 | 旧迭代记录 | 保留 |
| `.trae/documents/` 下 2 个文件 | 旧规划 | 保留 |

### 功能不好用的问题

1. **路由系统只有 4 个入口**（首页/投喂/导向/收藏），但实际启用了 7 个插件（profile/ai-navigator/wish-wall/cloudflare-lab/news/stock-watch/food），后 3 个无法通过导航到达
2. **禁用插件仍注册在 `plugins/index.ts`**：navigation/tools/social/timeline/blog/stats/analytics/comments/downloads/projects/workflow-deck 共 11 个已禁用插件仍被 import，增加包体积
3. **Food 插件使用 emoji**（违反设计规范），且转盘交互在 route-frame 内体验受限
4. **Stock Watch 插件**依赖 `/api/stock/quote` 后端，纯静态部署时完全不可用，无优雅降级
5. **News 插件**依赖 `/api/news` 后端，同上
6. **Cloudflare Lab 插件**依赖 `/api/health`，纯静态部署时只显示"本地功能开关视图"，信息量低

---

## 提议变更

### 变更 1：重构导航栏

**文件**：`src/components/Header.tsx`

**当前**：`< 作者名 | < Route 标签 > | 邮件 主题切换`

**目标**：改为水平标签导航，左侧品牌名，中间路由标签（可滚动），右侧操作按钮

```
[垣钰]  [首页] [导向] [许愿] [Lab] [新闻] [看盘] [吃什么]  [邮件] [主题]
```

**具体实现**：
- 移除 `< >` 箭头切换器，改为水平标签列表
- 活跃标签用 `border-bottom: 2px solid var(--color-primary)` + `text-primary` 标识
- 标签过多时移动端可横向滚动
- 路由列表从 `App.tsx` 的 `routeItems` 动态生成，只显示已启用的插件

**文件**：`src/App.tsx`
- `routeItems` 改为从已启用插件动态生成，而非硬编码 4 个
- 每个启用的插件都应有对应的路由入口

### 变更 2：精简视觉系统

**文件**：`src/index.css`

**目标**：从 ~80 个 Material Design 色值精简到 ~20 个核心变量

保留：
- `background`, `surface`, `surface-card`, `surface-container` — 层级表面
- `on-surface`, `on-background`, `text-muted` — 文本层级
- `primary` — 唯一强调色（降低饱和度）
- `secondary` — 语义辅助色（保留但降级使用）
- `border-subtle`, `border-strong` — 边框
- `error` — 错误状态
- 组件级变量保留 `panel-*`, `field-bg`, `glass-*`, `drawer-*`

删除：所有未在组件中实际使用的 Material Design 扩展色（`tertiary-*`, `on-primary-fixed-*`, `secondary-fixed-*`, `surface-bright`, `surface-dim` 等）

**文件**：`tailwind.config.js`
- 删除未使用的颜色映射
- 字体：body 从 `Inter` 改为 `Geist`（与 display 统一，避免 Inter）
- 精简 `borderRadius`（`lg` 和 `xl` 不应相同值）

### 变更 3：增加动态美感

**文件**：`src/index.css`

1. **Staggered reveal**：当前 `.page-shell.page-ready > *` 只有 4 级延迟，改为 CSS 自定义属性驱动：
   ```css
   .page-shell.page-ready > * {
     animation: content-rise 760ms cubic-bezier(0.16, 1, 0.3, 1) calc(var(--stagger, 0) * 80ms) forwards;
   }
   ```

2. **Hover 微动效**：为 `surface-item` 添加 hover 时的微位移 + 边框渐变：
   ```css
   .surface-item:hover {
     transform: translateY(-2px);
     border-color: var(--color-primary);
     box-shadow: 0 8px 32px -16px var(--color-panel-shadow);
   }
   ```

3. **标签切换动效**：导航标签切换时添加 `border-bottom` 的滑块过渡

4. **按钮微交互**：`btn-interact:active` 从 `scale(0.95)` 改为 `scale(0.97)` + `translateY(1px)`，更微妙

**文件**：`src/components/Header.tsx`
- 导航标签切换时添加下划线滑块动画

### 变更 4：清理根目录文档

**操作**：
1. 创建 `docs/archive/` 目录
2. 移动以下文件到 `docs/archive/`：
   - `cloudflare-plan.md`
   - `spec-cloudflare-*.md`（8 个文件）
   - `spec-news-proxy.md`
   - `spec-disruptive-hub-capsules.md`
   - `spec-personal-hub-after-featured-project.md`
3. 更新 `checklist.md` 使其与当前插件列表同步
4. 更新 `spec.md` 移除对已归档文件的引用
5. 更新 `tasks.md` 标记已完成项并补充新待办

### 变更 5：修复功能可用性

**文件**：`src/App.tsx`
- `routeItems` 改为动态生成，每个启用的插件都有路由入口
- 新增路由 id 到插件 id 的映射逻辑

**文件**：`src/plugins/index.ts`
- 移除 11 个已禁用且不再使用的插件 import（navigation/tools/social/timeline/blog/stats/analytics/comments/downloads/projects/workflow-deck）
- 保留代码文件本身不删除（可能未来重新启用），只从注册表移除

**文件**：`src/plugins/food/index.tsx`
- 移除所有 emoji（☀️🌙🍽️🔍），改用 Icon 组件
- 标题从 `🍽️ FOOD WHEEL` 改为 `Food Wheel`

**文件**：`src/plugins/stock-watch/index.tsx`
- 添加 API 不可用时的优雅降级提示
- 静态部署时显示"此功能需要 Cloudflare Pages Functions 支持"

**文件**：`src/plugins/news/index.tsx`
- 同上，添加静态部署降级提示

**文件**：`src/core/routeBridge.ts`
- 扩展 `HubRouteId` 类型以支持动态路由

---

## 假设与决策

1. **不引入新依赖**：动效用纯 CSS 实现，不引入 Framer Motion
2. **不改变深色主题基调**：保留暗色为默认，但降低 primary 饱和度
3. **不删除插件源码**：只从注册表移除禁用插件的 import，文件保留
4. **导航改为水平标签**：而非下拉菜单或侧边栏，保持与当前单页结构一致
5. **归档而非删除文档**：移动到 `docs/archive/`，不彻底删除

---

## 验证步骤

1. `npm run lint` 通过
2. `npm run build` 通过
3. `npm run check:assets` 通过
4. 导航栏在桌面端和移动端均可正常使用所有路由
5. 所有已启用插件可通过导航访问
6. 禁用插件从注册表移除后页面不崩溃
7. Food 插件无 emoji
8. Stock Watch / News 在无后端时有降级提示
9. 根目录只保留 `spec.md`、`tasks.md`、`checklist.md`、`AGENTS.md`、`README.md`
10. 视觉：导航标签有下划线滑块动效，卡片有 hover 微位移，页面有 staggered reveal
