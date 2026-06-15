# 音乐与多媒体模块规划

## 摘要

为 Personal Hub 新增音乐自动播放模块和多媒体内容展示能力，遵循现有插件架构，纯前端实现，适配 Cloudflare Pages 静态部署。

---

## 当前状态分析

### 架构约束
- **纯静态部署**：Cloudflare Pages，无服务端运行时
- **浏览器自动播放策略**：Chrome/Safari/Firefox 均禁止无用户交互的音频自动播放，必须至少有一次用户点击/按键后才能播放
- **现有依赖极轻**：react + zod + lightweight-charts，应避免引入大型媒体库
- **插件系统**：`src/plugins/<id>/index.tsx` 注册 + `routeBridge.ts` 路由 + `App.tsx` routeItems

### 现有媒体相关代码
- `Layout.tsx` 中有 `prefers-reduced-motion` 检测（可复用）
- `IntroStage.tsx` 中有入场动画逻辑（可参考交互时机）
- 无任何音频/视频/播放器代码

---

## 提议变更

### 变更 1：Ambient Music Player（环境音乐播放器）

**核心思路**：不是传统音乐播放器，而是一个"氛围音"模块——在用户首次交互后自动播放轻量环境音乐/白噪音，提供沉浸式浏览体验。

**文件**：`src/plugins/ambient-music/index.tsx`（新建）

**功能**：
1. **音源选择**：提供 3-5 种氛围音（雨声、咖啡馆、森林、海浪、Lo-Fi 节拍），音源使用免费 CC0 音频文件
2. **自动播放策略 — 全局交互触发**：
   - 在 `App.tsx` 或 `Layout.tsx` 中监听全局用户手势（`click` / `keydown` / `touchstart`）
   - 用户在页面**任何位置**的首次交互即触发音乐自动播放，无需专门的"开启氛围"按钮
   - 监听器为 `once: true`，触发一次后自动移除，不持续占用资源
   - `sessionStorage` 记住用户已交互过，同会话内刷新页面后再次交互即自动恢复播放
   - 切换路由时音乐不中断（播放器挂载在 Layout 层级而非插件层级）
   - 尊重 `prefers-reduced-motion`：系统偏好减少动效时，默认不自动播放
3. **音量控制**：滑块 + 静音按钮
4. **混音**：支持同时播放两种音源（如雨声 + 咖啡馆），各自独立音量
5. **视觉反馈**：底部固定迷你播放条，显示当前音源图标 + 波形动画

**文件**：`src/plugins/ambient-music/AudioEngine.ts`（新建）
- 封装 Web Audio API，管理 AudioContext、GainNode、音源切换
- 支持淡入淡出（crossfade）
- 支持循环播放

**文件**：`src/plugins/ambient-music/tracks.ts`（新建）
- 定义音源列表，每个音源包含：id、名称、图标、音频文件路径
- 音频文件存放在 `public/audio/` 目录

**文件**：`public/audio/`（新建目录）
- 存放 3-5 个 CC0 环境音 MP3 文件（每个 30-60 秒循环）
- 来源：Freesound.org、Pixabay Audio 等 CC0 资源
- 文件大小控制：每个 < 500KB（低比特率 MP3 足够环境音质量）

**文件**：`src/plugins/ambient-music/MiniPlayer.tsx`（新建）
- 底部固定迷你播放条组件
- 显示当前音源图标 + 音量滑块 + 静音/切换按钮
- 波形动画用 CSS `@keyframes` 实现（不依赖 Canvas）

**路由注册**：
- `src/core/routeBridge.ts`：HubRouteId 添加 `'ambient-music'`，routeAliases 添加 `'ambient-music' | 'music' | 'bgm'`
- `src/App.tsx`：routeItems 添加 `{ id: 'ambient-music', label: '氛围', href: routeHash('ambient-music'), pluginId: 'ambient-music' }`
- `src/plugins/index.ts`：注册新插件 `{ id: 'ambient-music', name: '氛围音乐', enabled: true, order: 8 }`

**插件页面**：全屏音源选择界面，每个音源显示为卡片，点击即播放，支持多选混音

**关键决策**：
- 播放器状态提升到 App 层级，通过 Context 共享，确保路由切换时音乐不中断
- 使用 Web Audio API 而非 `<audio>` 元素，获得更精细的控制（淡入淡出、混音、音量归一化）
- 全局交互触发：在 `Layout.tsx` 中注册 `document.addEventListener('click', startAmbient, { once: true })`，任何交互即启动播放，无需专用按钮

---

### 变更 2：Gallery / Moodboard（视觉画廊）

**核心思路**：展示个人摄影、设计作品、灵感图板的轻量画廊。

**文件**：`src/plugins/gallery/index.tsx`（新建）

**功能**：
1. **瀑布流布局**：CSS Grid + `masonry` 风格，无需引入 Masonry 库
2. **图片源**：配置驱动，支持本地图片（`public/images/gallery/`）和外部 URL
3. **Lightbox**：点击图片放大查看，左右切换，键盘导航（Esc 关闭、左右箭头切换）
4. **分类标签**：按主题分类（摄影、设计、截图等），标签过滤
5. **懒加载**：使用 `loading="lazy"` + IntersectionObserver

**文件**：`src/plugins/gallery/types.ts`（新建）
```typescript
interface GalleryItem {
  id: string
  src: string
  alt: string
  category: string
  width: number
  height: number
  caption?: string
}
```

**文件**：`public/config/gallery.config.json`（新建）
- 画廊图片列表配置

**文件**：`src/plugins/gallery/Lightbox.tsx`（新建）
- 全屏灯箱组件，支持键盘导航和触摸滑动

**路由注册**：
- `routeBridge.ts`：HubRouteId 添加 `'gallery'`，routeAliases 添加 `'gallery' | 'photos' | 'moodboard'`
- `App.tsx`：routeItems 添加 `{ id: 'gallery', label: '画廊', href: routeHash('gallery'), pluginId: 'gallery' }`
- `plugins/index.ts`：注册 `{ id: 'gallery', name: '视觉画廊', enabled: true, order: 9 }`

---

### 变更 3：Quote of the Day（每日一言 / 灵感卡片）

**核心思路**：不是严格意义上的"多媒体"，但为首页增加视觉节奏感——每日展示一条引言/诗句/歌词，配合排版动效。

**实现方式**：作为 Profile 插件的增强，而非独立插件

**文件**：`src/plugins/profile/index.tsx`（修改）
- 在首页 Hero 区下方添加"每日一言"区块
- 数据源：`public/config/quotes.json`，包含 50-100 条引言
- 按日期（年积日）选取当天引言，无需随机
- 排版：大号衬线字体 + 淡入动效

**文件**：`public/config/quotes.json`（新建）
```json
[
  { "text": "...", "author": "...", "source": "..." },
  ...
]
```

---

### 变更 4：Now Playing Status（正在听）

**核心思路**：在首页或导航栏显示"正在听"状态，与 Ambient Music Player 联动。

**文件**：`src/plugins/ambient-music/NowPlayingBadge.tsx`（新建）
- 当音乐播放时，在 Header 右侧显示小型"正在听"标签
- 点击跳转到 ambient-music 路由
- 无音乐播放时隐藏

**文件**：`src/components/Header.tsx`（修改）
- 引入 NowPlayingBadge 组件

---

## 音频文件获取方案

环境音需要实际的 MP3 文件。有以下方案：

| 方案 | 优点 | 缺点 |
|------|------|------|
| A. 本地 MP3 文件 | 无外部依赖，离线可用 | 增加仓库体积（~2MB） |
| B. 外部 CDN 链接 | 不增加仓库体积 | 依赖外部服务，可能失效 |
| C. Web Audio API 合成 | 零文件，纯代码生成白噪音/雨声 | 音质有限，无法生成复杂音景 |

**推荐**：方案 C（Web Audio API 合成）+ 方案 A 的少量精选音源

- 白噪音、雨声、海浪等自然音可以用 Web Audio API 通过噪声生成器 + 滤波器合成，零文件
- Lo-Fi 节拍等复杂音源使用本地 MP3（1-2 个即可）
- 这样仓库只增加 ~1MB，且核心功能不依赖外部服务

---

## 实施顺序

1. **Ambient Music Player** — 核心模块，包括 AudioEngine、音源合成、MiniPlayer
2. **Now Playing Badge** — 与 Ambient Music Player 联动，轻量
3. **Gallery** — 独立模块，可并行开发
4. **Quote of the Day** — Profile 增强，最简单

---

## 假设与决策

1. **自动播放限制**：通过全局交互监听解决——用户在页面任何位置的首次 click/keydown/touchstart 即触发播放，无需专门按钮
2. **不引入大型媒体库**：不使用 Howler.js、Tone.js 等，Web Audio API 原生足够
3. **播放器跨路由持久化**：AudioEngine 实例挂载在 App 层级，通过 Context 传递给插件和 Header
4. **图片不使用外部图床**：Gallery 图片存放在 `public/images/gallery/`，保持自包含
5. **环境音合成优先**：白噪音/雨声用 Web Audio API 合成，减少仓库体积
6. **Gallery 不引入 Masonry 库**：用 CSS Grid `grid-auto-rows: 10px` + `grid-row: span N` 模拟瀑布流

---

## 验证步骤

1. `npm run lint` 通过
2. `npm run build` 通过
3. Ambient Music Player：
   - 页面任何位置的首次交互（click/keydown/touchstart）即触发音乐播放
   - 切换路由时音乐不中断
   - 音量滑块和静音按钮正常工作
   - 混音两种音源正常
   - MiniPlayer 在底部正确显示
   - `prefers-reduced-motion` 开启时不自动播放
4. Gallery：
   - 瀑布流布局正确
   - 点击图片打开 Lightbox
   - 键盘导航（Esc/左右箭头）正常
   - 分类过滤正常
   - 懒加载正常
5. Quote of the Day：
   - 首页显示当日引言
   - 每日自动切换
6. Now Playing Badge：
   - 音乐播放时 Header 显示标签
   - 点击跳转到氛围音乐页面
   - 无音乐时隐藏
