# kkhome Stitch UI 重构路线

> 本文档为 Google Stitch 重构 kkhome 个人主页 UI 提供完整的项目信息、技术约束和改进方向。

---

## 1. 项目概况

| 项目 | 值 |
|------|-----|
| 名称 | kkhome — Personal Hub |
| 类型 | Vite + React 18 + TypeScript 静态个人主页 |
| 部署 | Cloudflare Pages（纯静态，无 SSR） |
| 作者 | 垣钰 |
| 当前设计系统 | Editorial Engineering / 海盐苏打配色 |

---

## 2. 技术栈与平台限制

### 核心技术栈
- **框架**: React 18.3 + TypeScript 5.6
- **构建**: Vite 5.4
- **样式**: Tailwind CSS 3.4 + CSS 变量设计系统（`src/index.css`）
- **校验**: Zod 4.4（配置验证）
- **测试**: Playwright（E2E）
- **图表**: lightweight-charts 5.2（股市看盘）

### 严格限制
1. **零运行时动画库** — 项目没有 framer-motion、gsap、react-spring 等依赖，所有动画均为纯 CSS + `cubic-bezier(0.16, 1, 0.3, 1)` 实现
2. **静态部署** — Cloudflare Pages 纯静态产物，无服务端渲染，首屏依赖 JSON 配置加载
3. **Bundle 敏感** — 当前依赖极简（react + zod + lightweight-charts），新增依赖需谨慎评估体积
4. **Vanta.js 通过 CDN** — Three.js + Vanta（Rings/Birds）通过 `<script>` 标签加载，非 npm 依赖
5. **Hash 路由** — 使用 `window.location.hash` 路由，无 React Router
6. **插件架构** — 所有功能模块为插件，通过 `PluginSystem` 注册和配置驱动
7. **CSS 变量驱动主题** — 亮/暗模式通过 `:root` / `.dark` CSS 变量切换，Tailwind 引用变量

### 可用资源
- Google Fonts: Geist, JetBrains Mono, Material Symbols Outlined
- CDN: Three.js r134 + Vanta RINGS + Vanta BIRDS
- Web Audio API: 氛围音乐引擎（纯合成，无音频文件）
- Canvas API: FoodWheel 转盘、lightweight-charts K线图
- IntersectionObserver: 滚动 Reveal 动画
- CSS `backdrop-filter`: 玻璃拟态效果

---

## 3. 当前架构与页面结构

### 双模式布局
```
┌─────────────────────────────────────────────┐
│ 模式一：欢迎页（#/home）                      │
│ ┌─────────────────────────────────────────┐ │
│ │ VantaRings → VantaBirds（背景动画序列）  │ │
│ │ IntroStage（入场动画 2.4s）              │ │
│ │ ProfilePlugin（个人介绍全屏展示）         │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ 模式二：博客内部（#/ai-tools 等）             │
│ ┌──────┬──────────────────────────────────┐ │
│ │Header│ （固定顶栏，玻璃拟态）             │ │
│ ├──────┼──────────────────────────────────┤ │
│ │Side  │  route-frame（玻璃容器）          │ │
│ │bar   │  ┌────────────────────────────┐  │ │
│ │200px │  │ BlogSidebar │ Plugin内容    │  │ │
│ │      │  │  导航链接    │ 滚动区域      │  │ │
│ │      │  └────────────────────────────┘  │ │
│ └──────┴──────────────────────────────────┘ │
│ MiniPlayer（氛围音乐悬浮控件）                │
└─────────────────────────────────────────────┘
```

### 关键组件清单

| 组件 | 路径 | 职责 |
|------|------|------|
| App | `src/App.tsx` | 路由分发、配置加载、全局状态 |
| Layout | `src/components/Layout.tsx` | 背景网格 + 浮动光球 + 鼠标视差 |
| Header | `src/components/Header.tsx` | 固定顶栏，导航 + 主题切换 + 联系入口 |
| IntroStage | `src/components/IntroStage.tsx` | 首屏入场动画（网格上升 + 扫描线 + 脉冲环） |
| VantaRings | `src/components/VantaRings.tsx` | Vanta Rings WebGL 背景 |
| VantaBirds | `src/components/VantaBirds.tsx` | Vanta Birds WebGL 背景 |
| BlogSidebar | `src/components/BlogSidebar.tsx` | 侧边导航（图标 + 文字链接） |
| Card | `src/components/Card.tsx` | 通用玻璃卡片 |
| ContactDrawer | `src/components/ContactDrawer.tsx` | 右侧滑出联系面板 |
| ThemeToggle | `src/components/ThemeToggle.tsx` | 亮/暗模式切换 |
| ProgressRail | `src/components/ProgressRail.tsx` | 右侧垂直进度指示器（当前未使用） |
| Footer | `src/components/Footer.tsx` | 页脚（当前未使用） |

### 已注册插件（14个）

| 插件ID | 名称 | 启用 | 交互特色 |
|--------|------|------|----------|
| profile | 个人介绍 | ✅ | 全屏 Hero + 每日引言 |
| ai-navigator | 工具导航 | ✅ | 搜索 + 分类过滤 + 意图标签 |
| wish-wall | 访客许愿墙 | ✅ | 表单提交 + 状态流水线 |
| cloudflare-lab | Cloudflare Lab | ✅ | 展示页 |
| news | 新闻聚合 | ✅ | 新闻列表 + 翻译 |
| stock-watch | 股市看盘 | ✅ | K线图 + 搜索 + 报价 |
| food | 今天吃什么 | ✅ | Canvas 转盘 + 随机选择 |
| ambient-music | 氛围音乐 | ✅ | Web Audio 合成 + MiniPlayer |
| gallery | 视觉画廊 | ✅ | 瀑布流 + Lightbox |
| universal-inbox | 万能投入口 | ❌ | 智能胶囊路由 |
| quick-launch | 快速启动 | ❌ | 搜索 + 资源/工具/代码片段 |
| workbench | 工作台 | ❌ | 内联工具 |
| collections | 资源收藏 | ❌ | 收藏管理 |
| scratchpad | 临时收纳 | ❌ | 临时文本存储 |

---

## 4. 当前设计系统摘要

### 配色（日间模式 / 海盐苏打）
- 背景: `#F5F9FC` → 表面: `#FFFFFF`
- 主色: `#4DD0C8`（青绿） / 副色: `#64B5F6`（天蓝） / 三色: `#F06292`（粉红）
- 文字: `#37474F` / 弱文字: `#90A4AE`
- 玻璃: `rgba(255,255,255,0.85)` + `backdrop-blur(10px)`

### 暗色模式
- 已有 `darkMode: 'class'` Tailwind 配置，但 `index.css` 中**未定义** `.dark` 变量覆盖
- ThemeToggle 组件切换 `document.documentElement.classList`，但暗色变量缺失

### 字体
- Display/Body: Geist (600/700)
- Mono: JetBrains Mono (500)
- Icons: Material Symbols Outlined

### 动画体系
- 全部 CSS 驱动，无 JS 动画库
- 核心缓动: `cubic-bezier(0.16, 1, 0.3, 1)` — "premium ease"
- 入场: `content-rise` (760ms) + staggered delay
- 侧边栏链接: 200ms 过渡
- 卡片悬停: `-3px translateY` + 边框色变 + 阴影
- 转盘: CSS `conic-gradient` + `transform: rotate()` transition
- Reveal: IntersectionObserver + `.active` class toggle

---

## 5. 当前问题诊断

### 5.1 交互层面

| 问题 | 严重度 | 描述 |
|------|--------|------|
| 路由切换无过渡 | 高 | Hash 路由切换时内容瞬间替换，无淡入/滑入/缩放过渡 |
| 侧边栏交互单调 | 中 | 仅文字链接 + 图标，无活跃指示器动画、无悬停微交互 |
| 卡片悬停千篇一律 | 中 | 所有 `surface-item` 统一 `-3px translateY`，缺乏差异化反馈 |
| 欢迎页与内部页割裂 | 中 | 两个模式视觉风格不统一，切换感突兀 |
| 滚动体验平淡 | 中 | 仅基础 Reveal，无视差、无磁吸、无滚动驱动动画 |
| 表单交互无反馈 | 低 | 提交/复制等操作缺乏微动画确认（仅文字变化） |
| 转盘结果展示平淡 | 低 | 结果卡片无弹入动画，缺乏"开奖"仪式感 |

### 5.2 视觉层面

| 问题 | 严重度 | 描述 |
|------|--------|------|
| 暗色模式不完整 | 高 | CSS 变量缺少 `.dark` 覆盖，切换后颜色错乱 |
| 视觉层次扁平 | 高 | 面板/卡片/控件层级区分不够，缺乏深度感 |
| 色彩对比保守 | 中 | 主色 `#4DD0C8` 在亮色背景上存在感弱，CTA 不够醒目 |
| 侧边栏视觉权重低 | 中 | 200px 窄侧栏 + 纯文字，缺乏品牌感和导航仪式感 |
| route-frame 过于规整 | 中 | 玻璃容器圆角+虚线装饰偏模板化，缺乏个性 |
| 空状态设计缺失 | 中 | 多处 "暂无数据" 仅有文字，缺乏引导性插画或动画 |
| 图标系统单一 | 低 | 全站 Material Symbols，缺乏自定义图标或品牌标识 |

### 5.3 架构层面

| 问题 | 严重度 | 描述 |
|------|--------|------|
| ProgressRail 未使用 | 低 | 已实现但未集成到路由页面 |
| Footer 未使用 | 低 | 已实现但未渲染 |
| Vanta CDN 依赖 | 低 | Three.js ~600KB CDN，影响首屏加载 |

---

## 6. Stitch 重构改进方向

### 6.1 首页（欢迎页）重构 — 最高优先级

**目标**: 从"静态简历页"升级为"沉浸式个人空间入口"

- **Hero 区域**: 将 ProfilePlugin 从传统左右分栏改为全屏沉浸式展示
  - 名字使用超大 Display 字体（112px+），配合文字揭示动画（clip-path 或 mask 渐入）
  - 头像从静态图片升级为带呼吸光环的动态元素
  - 技能标签从静态 badge 改为滚动 marquee 或粒子飘散效果
- **背景层**: 保留 Vanta 序列但增强过渡
  - Rings → Birds 过渡增加粒子融合效果
  - 鼠标视差从简单位移升级为磁力吸附（元素被鼠标轻微牵引）
- **每日引言**: 从简单文字升级为打字机效果或手写揭示动画
- **进入按钮**: 从静态链接改为带脉冲光环的 CTA，hover 时触发涟漪扩散

### 6.2 路由页面重构 — 高优先级

**目标**: 从"博客后台"升级为"创意工作台"

- **侧边栏 → 命令面板**: 将 BlogSidebar 从静态列表升级为可搜索的命令面板风格
  - 活跃项带滑动指示器（sliding indicator）
  - 图标 hover 时微旋转或弹跳
  - 分组间增加折叠/展开交互
- **route-frame → 3D 视口**: 将玻璃容器升级为有深度感的视口
  - 路由切换时增加 3D 翻转或景深过渡（perspective + rotateY）
  - 容器边框增加呼吸光效（border-color 缓动循环）
  - 顶部装饰条从静态渐变改为流动渐变动画
- **内容区**: 增加滚动驱动的视差效果
  - 标题区域视差速度 0.8x，内容区 1x
  - 卡片交错入场（staggered reveal with spring easing）

### 6.3 微交互增强 — 中优先级

**目标**: 让每次操作都有可感知的反馈

- **按钮**: 所有 `btn-interact` 增加 ripple 效果（CSS `::after` + animation）
- **卡片悬停**: 差异化反馈
  - 工具卡片: 边框光扫描效果（shimmer sweep on border）
  - 愿望卡片: 微弹性缩放（scale 1.02 + spring overshoot）
  - 画廊卡片: 图片微缩放 + 信息层滑入
- **表单交互**:
  - 输入框 focus 时标签上浮 + 下划线展开动画
  - 提交成功后按钮变为 checkmark + 粒子爆发
  - 复制操作后图标 morph（copy → check）+ 微弹跳
- **转盘结果**: 开奖式揭示
  - 转盘停止后结果卡片从中心弹入（scale 0 → 1.05 → 1）
  - 配合 confetti 粒子或光环扩散

### 6.4 暗色模式完善 — 高优先级

**目标**: 完整的暗色体验，不是亮色的简单反色

- 在 `index.css` 中补全 `.dark` CSS 变量覆盖
- 参考现有 `docs/DESIGN.md` 中定义的暗色调色板：
  - 背景: `#070809` → `#111416` → `#15191b`
  - 主色: `#8be9f4`（Cyan Pulse）
  - 强调: `#ff6b4a`（Ember Orange）
  - 文字: `#f1ece6` / `#9aa3a8`
- 暗色模式下增强发光效果（glow shadow），减弱边框依赖

### 6.5 交互动画升级 — 中优先级

**目标**: 在不引入重依赖的前提下提升动画品质

**方案 A（推荐）: 纯 CSS 增强**
- 利用 CSS `@property` 注册自定义属性实现渐变动画
- 使用 `animation-timeline: scroll()` 实现滚动驱动动画（Chrome 115+）
- `view-transition-api` 实现路由切换过渡（Chrome 111+）
- 优点: 零依赖、硬件加速、渐进增强

**方案 B: 轻量 JS 补充**
- 引入 `motion`（framer-motion 瘦身版，~18KB gzip）处理复杂编排
- 或使用 `@formkit/auto-animate`（~2KB）实现列表动画
- 优点: 更精细的控制，跨浏览器一致

### 6.6 特色交互创意 — 低优先级（亮点功能）

- **磁力导航**: 侧边栏图标被鼠标轻微吸引，产生弹性位移
- **粒子跟随**: 鼠标移动时留下淡色粒子轨迹（Canvas 覆盖层，低性能开销）
- **声波可视化**: 氛围音乐播放时，MiniPlayer 显示实时波形
- **时钟/天气 widget**: Header 区域增加实时时钟或天气微组件
- **键盘快捷键**: `Cmd+K` 打开全局命令面板，快速跳转路由
- **手势支持**: 移动端左右滑动切换路由

---

## 7. Stitch 实施建议

### 分阶段路线图

| 阶段 | 范围 | 预期产出 |
|------|------|----------|
| Phase 1 | 暗色模式完善 + CSS 变量重构 | 完整的 `.dark` 变量体系，DESIGN.md 色板落地 |
| Phase 2 | 首页 Hero 重构 | 沉浸式个人空间入口，文字揭示 + 头像光环 + CTA 脉冲 |
| Phase 3 | 路由页面重构 | 命令面板侧栏 + 3D 视口容器 + 路由过渡动画 |
| Phase 4 | 微交互系统 | 按钮 ripple + 卡片差异化 hover + 表单反馈 + 转盘开奖 |
| Phase 5 | 特色功能 | 磁力导航 + 粒子轨迹 + 声波可视化 + 键盘快捷键 |

### Stitch 生成代码的约束提醒

1. **必须使用 CSS 变量** — 所有颜色通过 `var(--color-xxx)` 引用，不硬编码色值
2. **必须兼容 Tailwind** — 优先使用 Tailwind 类，自定义样式写在 `index.css`
3. **必须尊重插件架构** — 插件组件接口 `{ config?: PluginRuntimeConfig }` 不可更改
4. **动画必须渐进增强** — 使用 `@media (prefers-reduced-motion: no-preference)` 包裹
5. **必须保持 Hash 路由** — 不引入 React Router 或浏览器 History API
6. **移动端优先折叠** — 768px 断点以下所有多列变单列
7. **禁止新增重型依赖** — 任何 > 10KB gzip 的新依赖需单独评估

---

## 8. 关键文件索引

| 用途 | 路径 |
|------|------|
| 应用入口 | `src/App.tsx` |
| 全局样式 | `src/index.css` |
| Tailwind 配置 | `tailwind.config.js` |
| 设计系统文档 | `docs/DESIGN.md` |
| 站点配置 | `public/config/site.config.json` |
| 插件配置 | `public/config/plugins.config.json` |
| 功能开关 | `public/config/features.config.json` |
| 类型定义 | `src/core/types.ts` |
| 配置校验 | `src/core/configSchema.ts` |
| 插件注册 | `src/plugins/index.ts` |
| 路由桥接 | `src/core/routeBridge.ts` |
| HTML 入口 | `index.html` |
| Vite 配置 | `vite.config.ts` |
| 项目规则 | `AGENTS.md` |

---

## 9. 现有设计系统参考（docs/DESIGN.md）

项目已有一份完整的 Kinetic Personal Hub 设计系统文档，定义了：

- **视觉主题**: 建筑感 + 灵动性，深炭底 + 青色脉冲 + 琥珀强调
- **密度**: 5/10（Hero 疏朗，数据视图紧凑）
- **方差**: 7/10（不对称构图，禁止等分三列）
- **动效**: 8/10（弹簧物理、视差深度、永续微交互、编排级入场）
- **情绪**: 高端、鲜活、技术自信

**重要**: 当前代码实现与 DESIGN.md 存在差距 — 代码使用的是"海盐苏打"亮色系，而 DESIGN.md 定义的是深色系。Stitch 重构应以 DESIGN.md 为目标状态，同时确保亮色模式的完整支持。
