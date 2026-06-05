# Personal Hub 新功能规划

## 当前状态分析

### 已实现的插件（18 个）

| 插件 | 状态 | 功能 |
|------|------|------|
| profile | 启用 | 个人介绍 Hero 区 |
| universal-inbox | 启用 | 万能投入口，自动识别输入类型匹配 Capsule |
| ai-navigator | 启用 | AI 工具导航，分类搜索 |
| collections | 启用 | 分类收藏，链接+片段 |
| quick-launch | 禁用 | 万能跳转，统一搜索+命令面板 |
| workbench | 禁用 | 工具收纳台，JSON/Base64/URL/时间戳/UUID |
| scratchpad | 禁用 | 临时收纳，localStorage |
| workflow-deck | 禁用 | 场景工作流，多动作组合 |
| navigation | 禁用 | 快捷导航（已被 Quick Launch + Collections 替代） |
| tools | 禁用 | 常用工具（已被 Workbench 替代） |
| social | 禁用 | 社交链接 |
| timeline | 禁用 | 职业历程 |
| blog | 禁用 | 最新文章 |
| stats | 禁用 | 数据统计 |
| analytics | 禁用 | 访客统计 |
| comments | 禁用 | 留言板 |
| downloads | 禁用 | 资源下载 |
| projects | 禁用 | 项目作品 |

### 架构特点

- **纯静态部署**：Cloudflare Pages，无服务端运行时
- **配置驱动**：JSON 配置 + Zod 校验
- **插件系统**：热插拔、可排序、可启用/禁用
- **路由系统**：Hash 路由，4 个主路由（首页/投喂/导向/收藏）
- **设计系统**：Tailwind + 自定义 CSS 变量，深色主题为主

### Spec 中规划但未实现的模块

- **Integrations**：外部服务集成入口（Level 0-3）
- **Feeds**：信息流聚合（RSS、GitHub Releases 等）
- **Archive**：低频内容归档

---

## 新功能建议

按优先级和实现难度分为三个层次：

### 第一层：高价值、低门槛（纯前端，无需后端）

#### 1. Pomodoro / Focus Timer（番茄钟）

- **为什么**：与 Personal Hub 的"个人操作台"定位高度契合，开发者高频需求
- **实现**：纯前端倒计时，支持 25/5/15 分钟模式，localStorage 记录当日完成数
- **配置**：`{ defaultMinutes: 25, breakMinutes: 5, longBreakMinutes: 15 }`
- **交互**：环形进度条 + 开始/暂停/重置 + 完成时浏览器通知

#### 2. QR Code Generator（二维码生成）

- **为什么**：Spec 中 Workbench 已列出但未实现，与现有工具模式一致
- **实现**：纯前端 Canvas 渲染，输入文本/URL 即生成，支持下载 PNG
- **集成**：作为 Workbench 新增 utilityType `qr-code`，或作为独立小插件

#### 3. Color Converter（颜色转换）

- **为什么**：Spec 中 Workbench 已列出但未实现，前端开发者高频工具
- **实现**：HEX ↔ RGB ↔ HSL 互转，支持取色器（`<input type="color">`），对比度检查
- **集成**：作为 Workbench 新增 utilityType `color-convert`

#### 4. Markdown Preview（Markdown 预览）

- **为什么**：Spec 中 Workbench 已列出但未实现，写文档/README 时常用
- **实现**：左侧输入 Markdown，右侧实时渲染预览，支持复制 HTML
- **集成**：作为 Workbench 新增 utilityType `markdown-preview`，需要引入轻量 Markdown 解析库

#### 5. Keyboard Shortcuts Panel（快捷键面板）

- **为什么**：当前已有 Ctrl+K 和 / 快捷键，但用户不可发现，且缺乏统一管理
- **实现**：按 `?` 弹出快捷键速查面板，列出所有可用快捷键
- **配置**：`{ shortcuts: [{ key: 'ctrl+k', description: '聚焦搜索' }, ...] }`

### 第二层：中等价值、中等门槛（需要公开 API 或构建时处理）

#### 6. GitHub Profile Card（GitHub 动态卡片）

- **为什么**：Spec 中 Integrations Level 1 已规划，公开 API 无需密钥
- **实现**：构建时通过 GitHub REST API 抓取公开数据（仓库数、贡献图、Top 语言），写入静态 JSON
- **配置**：`{ username: 'xxx', showRepos: true, showLanguages: true, showContributionGraph: true }`
- **约束**：构建时获取，不暴露 token，数据可能滞后

#### 7. RSS Feed Reader（RSS 订阅阅读器）

- **为什么**：Spec 中 Feeds 模块已规划，信息流聚合是个人 Hub 的重要能力
- **实现**：构建时通过 RSS-to-JSON 服务抓取最新条目，生成静态数据；或使用 Cloudflare Pages Functions 做缓存代理
- **配置**：`{ feeds: [{ title: 'Hacker News', url: 'https://...', maxItems: 5 }] }`
- **约束**：第一阶段只展示标题+链接+日期，不展示全文

#### 8. Now Page（当前状态页）

- **为什么**：个人 Hub 的经典功能，展示"我正在做什么"
- **实现**：配置驱动的状态列表，支持 emoji + 文本 + 时间戳
- **配置**：`{ items: [{ emoji: '🔨', text: '重构 Personal Hub 插件系统', since: '2025-06' }] }`
- **特点**：轻量、高频更新、个人化

#### 9. Bookmarks Bar（书签栏/阅读列表）

- **为什么**：与 Collections 互补——Collections 是长期收藏，Bookmarks 是短期"稍后读"
- **实现**：localStorage 存储，支持添加/完成/删除，与 Scratchpad 协同
- **配置**：`{ storageKey: 'kkhome:bookmarks', maxItems: 50 }`

#### 10. Habit Tracker（习惯追踪）

- **为什么**：个人操作台的自然延伸，开发者常用
- **实现**：localStorage 存储，每日打卡，7 天/30 天热力图
- **配置**：`{ habits: [{ id: 'coding', label: '编码', icon: 'code' }], storageKey: 'kkhome:habits' }`

### 第三层：高价值、高门槛（需要后端代理或外部服务）

#### 11. Weather Widget（天气组件）

- **为什么**：个人 Hub 的常见实用信息
- **实现**：通过 Cloudflare Pages Functions 代理公开天气 API（如 wttr.in），避免暴露 API Key
- **配置**：`{ location: 'Beijing', units: 'metric' }`

#### 12. Search Command Palette（全局命令面板）

- **为什么**：当前 Quick Launch 是页面内搜索，全局命令面板可跨页面、跨插件调用
- **实现**：`Ctrl+K` 弹出浮动面板，搜索所有插件注册的命令，支持模糊匹配
- **与现有区别**：Quick Launch 搜索资源，Command Palette 搜索动作/命令

#### 13. Daily Note / Journal（每日笔记）

- **为什么**：个人操作台的深度功能，与 Scratchpad 互补
- **实现**：localStorage 按日期存储，Markdown 输入，日历视图浏览历史
- **配置**：`{ storageKey: 'kkhome:journal', retentionDays: 90 }`

#### 14. Integration Hub（集成中心）

- **为什么**：Spec 中 Integrations 模块已规划，是长期扩展的核心
- **实现**：统一展示所有外部服务入口，标注集成级别（Level 0-3），未配置的显示"待接入"
- **配置**：`{ integrations: [{ provider: 'github', level: 1, status: 'active' }, ...] }`

#### 15. Site Search（全站搜索）

- **为什么**：当前各插件搜索独立，缺乏跨插件统一搜索
- **实现**：汇总所有插件的可搜索数据，统一索引，支持全局搜索
- **约束**：需要各插件暴露可搜索数据接口

---

## 推荐实施顺序

基于价值/成本比和与现有架构的契合度：

1. **QR Code Generator** — 最简单，直接扩展 Workbench
2. **Color Converter** — 同上，扩展 Workbench
3. **Now Page** — 轻量、高个人化、配置驱动
4. **Keyboard Shortcuts Panel** — 提升现有功能可发现性
5. **Pomodoro Timer** — 独立插件，开发者刚需
6. **Markdown Preview** — 扩展 Workbench，需要引入依赖
7. **GitHub Profile Card** — 构建时数据，需要脚本
8. **RSS Feed Reader** — 构建时或 Functions 代理
9. **Bookmarks Bar** — localStorage，与 Scratchpad 协同
10. **Habit Tracker** — localStorage，独立插件

---

## 假设与约束

- 所有新功能必须遵循现有插件架构：`src/plugins/<id>/index.tsx` + 注册 + 配置
- 纯前端功能优先，需要后端的标注清楚集成级别
- 不在前端暴露密钥
- 不展示假数据
- 新增路由需在 `App.tsx` 的 `routeItems` 中注册
- 新增配置 Schema 需在 `configSchema.ts` 中添加 Zod 校验
