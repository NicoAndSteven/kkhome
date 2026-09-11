# Action-Cut 路由壳 · UI 设计文档

- 日期：2026-09-11
- 状态：已获用户批准（可视化多轮确认）
- 范围：路由界面（桌面导航轨 + 镜头页页头 + 路由切换动效 + 移动端底栏/sheet + 暗色策略）

## 1. 背景与动机

上一轮提交 `dffb155` 已经把路由 UI 的**组件骨架**搭好：

- `src/components/BlogSidebar.tsx` 声明了 `ac-rail` 系列类（品牌、编号链接、cue、播放器、工具）
- `src/components/MobileTabBar.tsx` 声明了 `ac-tabbar` / `ac-sheet`（主 tab + 更多抽屉）
- `src/App.tsx` 声明了 `route-shell` / `route-main` / `route-view` / `ac-fwd` / `ac-back`（方向感知切镜）和 `ac-flash` 闪光、`ac-loading` / `ac-unavailable` 状态

但**这些类的 CSS 全部缺失**（`ac-rail`/`ac-tabbar`/`route-view`/`ac-fwd` 等在 `src/index.css` 中均为 0 条定义；旧 `.blog-sidebar` 残留样式在 `:root.dark .route-mode` 下也是死代码）。结果：线上路由导航是**无样式的裸壳**。

此前 9 月 6 日的超级力量 brainstorm（`.superpowers/brainstorm/15607-1788706450/`）中，用户已在三个方向中选定 **方案 A —— "Action-Cut 全暗统一"**，"路由壳延续首页取景器语言"。本次工作 = 沿这条已定路线，**完整实现路由壳的 UI**。

## 2. 已确认的设计决定（可视化逐项拍板）

| 决策点 | 结果 |
|---|---|
| 整体方向 | **Action-Cut 全暗统一**：深空底 `#04060c` + 克莱因蓝 `#002fa7/#3d6dff/#8fb0ff` + REC 红点 `#ff4747` + 斜切大标题 + 胶片序号水印；导航 = 片场监视器，路由切换 = 镜头 CUT |
| 内容呈现 | **A · 完整镜头页**：每个路由由系统注入统一页头（`MODULE / XX` kicker + 斜切大字标题 + 胶片序号水印 + 内容区取景框四角） |
| 主题策略 | **A · 暗到底**：路由界面壳与内容全暗；移除路由界面中的主题开关（无切换语义）；路由域内强制暗色令牌 |
| 导航轨形态 | **C · 超薄序号轨**：~52px 纯序号（01–11），当前序号蓝色描边高亮；hover/active 在内容区左上浮出"NN · 标签"刀片 |
| 路由切换 | **CUT 闪切**：全屏蓝色闪光 ~260ms + 方向感知（按 `ROUTE_ITEMS` 序号前进/后退进入方向）+ 内容帧入场编排 |
| 移动端 | 深色玻璃底栏：5 主 tab + "更多" sheet（ALL MODULES 网格） |

视觉参考：本物料逐轮确认于 `.superpowers/brainstorm/1098-1789109049/content/*.html`（confirm-shell / content-treatment / theme-strategy / rail-form / final-assembly）。

## 3. 目标结构

```
Layout(routeMode)  ── 强制暗色令牌（.route-mode）
├─ 桌面:
│   route-shell
│   ├─ BlogSidebar  →  超薄序号轨（ac-rail-slim，重写）
│   └─ route-main
│       └─ route-view[ac-fwd|ac-back]   ← 每次切换重挂载，方向感知
│           ├─ ac-flash（全屏闪光）
│           ├─ ShotHeader              ← 新组件：kicker + 斜切大字 + 序号水印 + 取景框角标 + HUD
│           └─ ErrorBoundary → 插件组件
├─ 移动:
│   MobileTabBar（ac-tabbar + ac-sheet）
│   └─ route-mobile-main → route-view → ShotHeader + 插件组件
└─ 路由级（App.tsx）
```

路由事实来源保持 `ROUTE_ITEMS`（`src/core/routeBridge.ts`），序号 = 数组下标 + 1。

## 4. 组件设计细节

### 4.1 BlogSidebar —— 超薄序号轨（重写）

- 结构：沿用现有 `aside.ac-rail` 类名，加 slim 形态样式 → 品牌 `KK·REC`（9px mono）+ 序号列表 `01..NN` + 底部 foot（播放器紧凑条 + 联系按钮）。
- 序号单元：`button.ac-rail-num`，宽 ~22px 方形，mono 700。当前序号：蓝色描边 `border-color: rgba(143,176,255,.4)` + 内发光 `box-shadow: 0 0 12px rgba(61,109,255,.25)` + 底纹 `rgba(61,109,255,.13)`；其余 `#5d6478` 描边透明。
- 标签刀片：hover / 当前路由时，在内容区左上浮出 `NN · 标签`（mono，蓝色描边 + 深色底 `rgba(7,11,22,.85)`，白底透明）。实现：`ac-rail-num` hover 事件驱动一个浮层（`ac-rail-blade`），挂在与 rail 相对定位的容器里，`pointer-events:none`。
- foot：`MiniPlayer` 保留为**紧凑版**（当前 `ac-rail-player` 里是完整 MiniPlayer，需在路由暗色下可读）；联系按钮保留；**ThemeToggle 移除**（见 4.5）。
- 对 11 个路由：rail 垂直滚动，选中项自动滚入视图（`scrollIntoView({block:'nearest'})`）。

### 4.2 ShotHeader —— 镜头页页头（新建 `src/components/ShotHeader.tsx`）

输入 `{ route: RouteItem; index: number; total: number }`，纯展示层：

- 取景框四角 `.ac-corner.tl/.tr/.bl/.br`：贴合插件内容区边界（padding 偏移），hairline `rgba(226,232,252,.5)`。
- HUD `.ac-hud`：右上 `● REC`（红点闪烁）+ `CUT {NN} / {TOTAL}`。
- kicker `.ac-kicker`：`MODULE / {LABEL-EN}`——英文标号映射自插件 id 大写（如 stock-watch → STOCK），无映射则回退 `MODULE / {序号}`。
- 斜切大字 `.ac-shottitle`：`transform: skewX(-5deg)`，渐变 `linear-gradient(100deg,#fff 38%,#8fb0ff 64%,#2e55c9 100%)` 文字裁切，clamp 字号。
- 序号水印 `.ac-shotno`：右下巨型空心序号（描边 `rgba(143,176,255,.14)`），`pointer-events:none`，随视图底部定位。
- 标题收敛钩子：ShotHeader 负责路由大字标题；插件自身页头按 4.6 收敛。

### 4.3 路由外壳与切镜（App.tsx + index.css）

- `route-shell`：flex 行布局，rail 固定宽 52px，`route-main` 自适应，全 viewport 高（`100dvh`），路由内容区滚动。
- `route-view{ac-fwd|ac-back}`：每次 `key={activeRouteItem.id}` 重挂载，入场动画：
  - 前进（序号增大）→ `translateX(6%) scale(.985) blur(6px)` → 归位，280ms，`cubic-bezier(.22,1,.36,1)`；
  - 后退（序号减小）→ `translateX(-6%)` 反向同参数；
  - 首载或 -1 → 直入。
- `ac-flash`（已有 3 处定义，统一成一处）：`position:fixed; inset:0; background:rgba(143,176,255,.14);` 播 260ms `opacity 1→0`，PWA 根由 App 在路由切换时重触发（`key` 变化重挂载即自动播放）。
- 桌面 `route-main` 内容帧：ShotHeader 包裹在插件组件**上方**（与插件同一滚动容器，页头随内容可见）。

### 4.4 MobileTabBar —— 底栏 + sheet（样式实现）

- `ac-tabbar`：`position:fixed; bottom:0` 深色玻璃（`rgba(7,11,22,.72)` + blur），顶部发丝线；5 主 tab 由 `PRIMARY_ORDER` 决定，active tab：蓝色底纹 `rgba(61,109,255,.16)` + 内描边 + 图标 `#3d6dff`。
- `ac-sheet`：遮罩 + 底部抽屉，`ALL MODULES` kicker + 图标网格 `ac-sheet-item`，active 高亮；打开时 `route-mobile-main` 需为 sheet 预留高度（沿用现有高度计算）。
- 图标沿用 `Icon` 组件映射（现有 `routeIcons`）。

### 4.5 暗到底（`.route-mode` 强制暗色）

- `Layout` 路由态根类 `route-mode` 已有；`src/index.css` 中现有 `:root.dark .route-mode` 块是旧残余样式。
- **新增 `:root .route-mode`（不要求 `.dark`）**：把 `--color-*`（background/surface/on-surface/text-muted/border-subtle 等）覆盖为暗色值（参考 `:root.dark` 已有值），使插件内容在路由域内恒为暗色，与壳层统一。
- **移除路由界面主题开关**：`BlogSidebar` 不再渲染 `ThemeToggle`；`ThemeToggle` 保留给首页/入口（home 舞台）使用，不删组件。
- `:root.dark .route-mode .blog-sidebar*` 等旧死样式随实现清理。

### 4.6 插件内部标题收敛

ShotHeader 接管每个路由的大字标题后，插件自身一级页头会与之重复。收敛原则：

- 插件根级 `h1`/大标题（如 profile 之外各插件首屏标题）改为**隐藏或用二级上下文** — 具体逐个核对：
  - stock-watch / food / wish-wall / party-games / local-music / ai-navigator 等若根级另有标题，去掉或降级为 `text-text-muted` 小标。
- 收敛最小化：只动根级标题节点，不动功能逻辑；每处改动在实现阶段用 `git diff` 复核。
- 例外：home（`isOnWelcome`）不经路由壳，保持现状。

## 5. 数据流与 Props

- `ROUTE_ITEMS`（routeBridge）为唯一事实来源；`availableRouteItems = routes.filter(enabledPluginId)` 已由 App 计算。
- `BlogSidebar`: `{ routes, activeRoute, footerSlot, config, activeIndex }` —— `activeIndex/total` 供序号与水印使用（也可内部自算，倾向内部自算保持 props 精简）。
- `ShotHeader`: `{ route, index, total }`。
- `MobileTabBar`: 不变 `{ routes, activeRoute }`，样式全在 CSS。
- App 在 `activeRouteItem` 变化时维持现有 `cutDir` 计算逻辑，将 `index+1/total` 传入 ShotHeader。

## 6. 动效与减低运动偏好

- 所有位移/模糊/闪切在 `@media (prefers-reduced-motion: reduce)` 下归零（已有模式可复用：`.ac-cut` / `.route-view` 直接显示，闪光淡层保持透明）。
- 时长基准：入场 280ms、闪光 260ms、刀片 120ms fade、sheet 300ms 滑入，统一 `cubic-bezier(.22,1,.36,1)`（`--snap`）。

## 7. 易用性 / 无障碍

- rail 序号为真实 `<button>`/`<a>`，`aria-label` = 标签；当前项 `aria-current="page"`。
- 刀片浮层 `pointer-events:none`，纯装饰，不影响键盘操作。
- REC/水印等装饰 `aria-hidden="true"`。
- 色块仅作标识附加信息，主要信息（标签文字）不以颜色单独传达。

## 8. 边界与错误处理

- 路由不可用：沿用现有 `ac-unavailable`/`ac-loading` 文案（已存在于 App.tsx），补上它们的暗色样式（切角 + OFF AIR kicker + 描边大字）。
- `activeIndex=-1`（route 不在可用列表）：ShotHeader 序位回退 1，水印显示 `--`。
- 11 项超长 rail：rail 自身滚动 + 当前项 `scrollIntoView({block:'nearest'})`。
- 移动端 sheet 与 tab 高亮同步：`activeRoute` 变化时 sheet 自动关闭。

## 9. 测试策略

- `npm run build`（tsc + vite）通过（强制）。
- Playwright 冒烟 `tests/homepage.spec.ts`：补充至少 1 个路由切换用例（从首页进入某路由 → 断言 shot header 标题出现、rail 无崩溃）。现有 e2e 保持绿色。
- 视觉复核：`npm run dev` 下人工检查桌面/移动宽度、暗色还原、hover 刀片、前进/后退切换方向。

## 10. 范围外

- 首页（home 舞台 / profile 插件）本身的重设计——不在本次。
- 各插件内部业务样式打磨（只做标题收敛，不重排功能 UI）。
- 亮色主题在路由域内的再次支持（本设计明确暗到底）。
- 主题开关在首页的呈现方式（保留现状）。

## 11. 改动文件清单（预估）

| 文件 | 动作 |
|---|---|
| `src/components/ShotHeader.tsx` | 新建 |
| `src/components/BlogSidebar.tsx` | 重写为超薄序号轨，移除 ThemeToggle |
| `src/components/MobileTabBar.tsx` | 结构微调（sheet/高亮），主样式在 CSS |
| `src/App.tsx` | 引入 ShotHeader，传入 index/total，删除 routeMode 下 ThemeToggle 引用 |
| `src/index.css` | 新增 `.ac-rail/.ac-shot*/route-shell/.route-view/.ac-fwd/.ac-back/.ac-tabbar/.ac-sheet/.ac-loading/.ac-unavailable` 等全部缺失样式；新增 `:root .route-mode` 暗色强制；清理旧 `.blog-sidebar` 死样式 |
| 各插件根级页头 | 标题收敛（逐个核对） |
| `tests/homepage.spec.ts` | 补路由切换冒烟 |