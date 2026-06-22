# 移动端适配 & 自选股连接修复计划

---

## 一、问题诊断总览

| # | 问题 | 严重度 | 涉及文件 |
|---|------|--------|---------|
| 1 | 导向页面(AI Navigator)内容无法滚动 | 🔴 阻塞 | `App.tsx`, `index.css`, `ai-navigator/index.tsx` |
| 2 | 移动端加载动画/入场动效缺失 | 🟡 中 | `App.tsx`, `Loading.tsx`, `index.css` |
| 3 | 首屏(Profile)移动端布局未优化 | 🟡 中 | `profile/index.tsx`, `index.css` |
| 4 | 自选股 Yahoo Finance API 连接失效 | 🔴 阻塞 | `functions/api/stock/quote.js`, `chart.js`, `search.js` |
| 5 | 持仓详情(K线图)移动端自适应 | 🟢 低 | `stock-watch/StockDetail.tsx` |
| 6 | MobileTabBar 底部间距和安全区适配 | 🟢 低 | `MobileTabBar.tsx`, `App.tsx` |

---

## 二、详细任务分解

### Task 1: 导向页面(AI Navigator)移动端可滚动修复

**根因分析：**
- 桌面端通过 `.route-frame > section > :last-child` 实现溢出滚动
- 移动端渲染路径仅有一层 `surface-panel` + `p-4`，**没有任何滚动容器**
- 搜索区 + 分类标签 + 工具网格总高度远超视口，导致内容溢出无法滑动

**改动方案：**

1.1 `App.tsx` — 移动端 `<main>` 内的包装层增加滚动能力

```tsx
// 当前 (无滚动容器)
<div className="surface-panel rounded-[28px] p-4 shadow-[...]">
  <activePlugin.component config={activePlugin.config} />
</div>

// 改为
<div className="surface-panel rounded-[28px] shadow-[...] flex flex-col overflow-hidden h-full">
  {/* 固定头部让插件自己管理，或者让 surface-panel 可滚动 */}
  // 方案A: surface-panel 自身滚动
  <div className="overflow-y-auto flex-1 p-4">
    <activePlugin.component config={activePlugin.config} />
  </div>
</div>
```

1.2 `ai-navigator/index.tsx` — 移除可能导致高度塌陷的样式
- 检查 `#ai-tools` 的 `flex flex-col` 与 `.ai-results-scroll` 的 `overflow: visible` 组合

1.3 `index.css` — 为移动端补充 `.route-mobile` 类
```css
.route-mobile .surface-panel-scroll {
    height: calc(100dvh - 180px); /* 留出 tabbar + padding 空间 */
    overflow-y: auto;
}
```

1.4 分类标签栏移动端 horizontal scroll 优化
- 当前 `overflow-x-auto` + `min-w-max` 理论上正确
- 但外层需确保宽度限制不被破坏

---

### Task 2: 移动端加载动画 & 入场效果还原

**根因分析：**
- `showInitialIntro` 在移动端始终为 `false`（`!isMobile` 条件）
- 移动端没有任何 `.page-ready` / `.route-frame` 类，动效 CSS 全部不生效
- `content-rise` 动画仅通过 Tailwind `content-rise` + `animation-delay` 在桌面端使用
- `prefers-reduced-motion: reduce` 会全局禁用动画（但这是用户偏好，不应修改）

**改动方案：**

2.1 `App.tsx` — 移动端进入路由时添加入场动效类
```tsx
// 移动端渲染增加 page-ready 类，触发内容渐入
<main className={`mx-auto min-h-[100dvh] w-full max-w-[760px] 
                   px-4 pb-24 pt-16 page-ready`}>
```

2.2 `index.css` — 增加移动端的 `.page-shell.page-ready > *` 支持
- 当前 `.page-shell.page-ready > *` 动画仅应用于桌面 welcome 模式
- 移动端应有一套简化但不省略的版本

2.3 `Loading.tsx` — 移动端加载骨架屏形态
- 当前 Loading 是桌面端形态（sidebar skeleton），移动端未覆盖
- 增加移动端专用的 Loading 骨架屏

2.4 `IntroStage.tsx` — 为移动端提供轻量级 intro
- 当前完全绕过 `!isMobile`
- 选项：保留简版 intro（文字 + logo 淡入，跳过复杂动画和 Vanta）

---

### Task 3: 首屏(Profile)移动端重新布局

**根因分析：**
- 名字 `text-[72px] md:text-[128px]` 在 375px 手机上溢出
- 右侧头像圈层装饰占用大量空间但内容密度低
- 网格 `md:grid-cols-12` 在移动端退化为单列但未优化间距
- 底部统计板 `hidden md:grid` — 这是降级，需要改为移动端可见但简化格式

**改动方案：**

3.1 `profile/index.tsx` — 首屏移动端布局
- 名字改用 `clamp()` 响应式字体：`text-[clamp(2.8rem,10vw,4.5rem)] leading-[0.9]`
- 右侧头像区域在移动端应缩小或移到顶部
- 技能胶囊减少每行数量，使用更紧凑的间距
- 底部统计板改为移动端可见（`hidden md:grid` → 移动端横排简化版）
- 每日引言区域保持，但缩小间距

3.2 `index.css` — 新增 `.home-page-shell` 移动端优化
```css
@media (max-width: 768px) {
    .home-page-shell {
        padding-top: 3rem;
        padding-left: 1rem;
        padding-right: 1rem;
    }
}
```

3.3 首屏"开始探索"底部导航移动端优化
- 当前 `mt-12 md:mt-16` 在移动端需要更多上边距避免与底部重叠

---

### Task 4: 自选股 Yahoo Finance API 连接修复

**根因分析：**
- Yahoo Finance v7/v8 API 自 2024 年起逐步收紧访问控制
- `query1.finance.yahoo.com/v7/finance/quote` 需要 `crumb` token + cookie
- 当前仅传 `User-Agent: Mozilla/5.0` 是不够的
- 请求被 Yahoo 返回 401/403 或空数据

**改动方案：**

4.1 `functions/api/stock/quote.js` — 修复 v7 quote 端点
```javascript
// 添加 crumb 获取流程
// 1. 先请求 https://fc.yahoo.com/ 获取 cookie
// 2. 用 cookie 请求 https://query2.finance.yahoo.com/v1/test/getcrumb 获取 crumb
// 3. 在 quote URL 中加入 ?crumb=xxx 并携带 cookie

// 或者直接使用 v8/finance/chart 逐个拉取（更稳定，但需要多次请求）
```

**方案对比：**

| 方案 | 复杂度 | 稳定性 | 批量化 |
|------|--------|--------|--------|
| A. v7 + crumb+cookie | 中 | 中(需定期刷新crumb) | ✅ 批量 |
| B. v8/chart 逐个拉取 | 低 | 高 | ❌ 逐个 |
| C. 切换至 yfinance 非官方 API | 低 | 中 | ✅ |
| D. 使用 yahoo-finance-api 第三方包装 | 低 | 高 | ✅ |

**推荐方案 A/D 混合：**
- 在 Cloudflare Function 中实现 `getYahooCookie()` + `getYahooCrumb()` + `fetchQuote()` 三步
- 缓存 crumb 到 `env.CRUMB_CACHE` (KV) 或全局变量
- 退路：当 v7 返回空时，降级到 v8/chart 逐个请求

4.2 `functions/api/stock/chart.js` — v8 chart 通常更稳定
- 检查是否需要补充 cookie（v8 通常不需要 crumb）
- 增加 `includePrePost=true` 的参数传递

4.3 `functions/api/stock/search.js` — v1 search 端点修复
- 类似 crumb + cookie 策略
- 检查 `quoteType` 过滤逻辑（当前过滤 EQUITY/ETF）

4.4 前端错误展示优化
- 当前错误提示："无法连接数据服务。此功能需要 Cloudflare Pages Functions 支持" 不够准确
- 应区分：网络错误、API 拒绝、数据为空三种情况

---

### Task 5: 自选股详情/图表移动端适配

**根因分析：**
- `StockDetail.tsx` 的 K线图高度固定 `Math.max(280, Math.min(400, container.clientHeight))`
- 移动端竖屏空间有限，图表需要自适应
- 统计网格 `grid-cols-3` 在移动端过挤

**改动方案：**

5.1 `StockDetail.tsx` — 移动端布局
- 图表高度改为 `Math.max(200, container.clientHeight * 0.45)`
- 统计数据网格改为 `grid-cols-2`（移动端）
- 间隔按钮组改为可横向滚动的 wrap

5.2 `StockListItem.tsx` — 移动端密度
- 当前 desktop 删除按钮 `opacity-0 group-hover:opacity-100` 在触摸设备上不可用
- 改为长按或滑动删除，或常显删除按钮

---

### Task 6: MobileTabBar & 全局移动端体验增强

6.1 `MobileTabBar.tsx` — 安全区适配
- 检查 `safe-area-bottom` 类的 CSS 定义是否存在
- 为全面屏手机增加 `pb-[env(safe-area-inset-bottom)]`
- MobileTabBar 当前使用 `fixed bottom-3 left-3 right-3`，与真正的 safe-area 需要协调

6.2 `App.tsx` — 移动端 main 容器高度适配
- 当前 `min-h-[100dvh] pb-24` 再加 `pt-16`，在矮屏手机上可能使可见内容区域过小
- 调整为 `min-h-[calc(100dvh-80px)]`

6.3 全局字体和间距移动端优化
- 逐个检查每个插件中 `text-[clamp(...)]` 之外的固定字号
- 确保没有使用固定像素宽度导致溢出

---

## 三、执行顺序

```
Phase 1 (高优先级)     Phase 2 (中优先级)         Phase 3 (低优先级)
┌─────────────────┐   ┌──────────────────┐       ┌──────────────────┐
│ Task 1:          │   │ Task 3:           │       │ Task 5:          │
│ 导向页面滚动修复  │   │ 首屏移动端布局     │       │ 看盘详情移动端适配 │
│ Task 4:          │   │ Task 2:           │       │ Task 6:          │
│ API 连接修复      │   │ 加载动效还原       │       │ 全局体验增强       │
└─────────────────┘   └──────────────────┘       └──────────────────┘
```

---

## 四、测试验证

1. **视口断点测试**：375px (iPhone SE), 390px (iPhone 14), 430px (iPhone 15 Pro Max), 768px (iPad)
2. **功能测试**：自选股增删改查 + K线图切换 + 搜索
3. **性能测试**：移动端首帧渲染时间、滚动流畅度
4. **API 测试**：quote/chart/search 三个端点在部署环境下的响应
5. **动效测试**：`prefers-reduced-motion: reduce` 和默认模式的动画表现
