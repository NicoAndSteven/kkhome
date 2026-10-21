# 个人 Hub 规格说明

## 产品定位

这是垣钰的个人 Hub：**核心是 AI 工具导航与许愿墙，另有看盘、吃啥、聚会游戏、本地音乐这些自己会用的模块。**

不设功能上限——想到什么都可以加。但对**已上线的模块**有硬要求：路由、配置、测试三者齐备，缺一个就下线，不留半成品。

## 当前路由（8 条）

| 路由 | 插件 | 说明 |
|---|---|---|
| `home` | profile | 个人介绍首页 |
| `ai-tools` | ai-navigator | 工具导航：搜索、分类、意图词、外部打开 |
| `wish-wall` | wish-wall | 访客许愿墙，D1 持久化 |
| `cloudflare-lab` | cloudflare-lab | 绑定状态、feature flags、实验队列 |
| `stock-watch` | stock-watch | 股市看盘，自选股 + 行情图 |
| `food` | food | 今天吃什么，午/晚两套菜单 |
| `party-games` | party-games | 聚会游戏，含房间同步 |
| `local-music` | local-music | 本地音乐库与播放 |

### 路由状态契约

一个模块只有三种合法状态：

1. **上线**：在 `src/plugins/index.ts` 注册 + `plugins.config.json` 里 `enabled: true` + `ROUTE_ITEMS` 有路由 + e2e 有断言。
2. **冷藏**：插件目录在 `src/plugins/`，注册表里 `enabled: false`，**路由可以保留**——访问时显示「模块不可用」面板，不静默跳转。
3. **归档**：目录移到 `docs/archive/plugins-retired-<date>/`，不进构建、不进 lint。

不允许的状态：注册了但没路由（配置说开着，界面永远看不到）；有路由但插件禁用却静默跳到别的页。

### 当前冷藏 / 归档

- 冷藏（`enabled: false`，路由保留，访问显示 OFFLINE）：`universal-inbox` / `quick-launch` / `workbench` / `collections` / `scratchpad`。
- 归档：见 `docs/archive/plugins-retired-2026-10-21/`（analytics、blog、comments、downloads、navigation、projects、social、stats、timeline、tools、workflow-deck、gallery、news）。
- `ambient-music` 不是插件：它是音频引擎（首页雨声 + dock 播放器），由 `App.tsx` 直接引用，不承担路由。

## 非目标

- 不展示假访客数、假下载量、假评论、假项目数据。
- 不把需要私钥、OAuth 或个人 token 的集成放进前端配置。
- 不让「配置里写着启用、界面里看不到」这种状态存在。

## 配置契约

`public/config/site.config.json` 管理站点、个人资料和动效配置。

`public/config/plugins.config.json` 管理插件启用状态、顺序和运行数据。

`PluginSystem.applyConfigs()` 只覆盖配置里列出的插件——**没写进配置的插件会沿用注册表的值**。所以新增插件必须同时改注册表和配置，否则行为不可预测。

配置由 `src/core/configSchema.ts` 用 Zod 校验。坏配置降级为空数组或默认值，不能让页面崩溃。

## AI 工具导航要求

### 分类法

按「用户来干什么」分，单一维度，不再混用文件类型 / 用途 / 技术三个维度：

| id | 名称 | 装什么 |
|---|---|---|
| `convert` | 转换压缩 | 格式转换、PDF 处理、压缩 |
| `image` | 图片处理 | 抠图、去水印、修图、放大、GIF |
| `video-audio` | 视频音频 | 剪辑、录屏、字幕、音效配乐 |
| `document` | 文档演示 | Markdown、笔记、PPT、卡片、白板 |
| `design` | 设计素材 | 字体、图标、样机、背景、插画、简历 |
| `download` | 下载采集 | 下载器、资源站、驱动、影视 |
| `software` | 电脑软件 | 装机必备、卸载、系统工具、浏览器扩展 |
| `ai` | AI 工具 | 对话模型、提示词、AI 搜索、排行榜 |
| `learn` | 学习阅读 | 博客、RSS、英语、指南、播客、社区 |
| `fun` | 休闲 | 在线小游戏、表情包 |

### 数据字段

- `kind`：`online`（点开就能用）/ `desktop`（要下载安装）/ `resource`（是去看内容）。
- `variantOf`：同站多条目时的归属声明（如 17 个 Edge 扩展都标 `edge-addons`）。

### 硬规矩

- **描述必须写「这个工具到底干什么」**，不能由分类模板批量生成。
  历史上 313 条工具只有 26 种描述，`download` / `knowledge` / `ai` 各只有 1 种——那是分类模板，不是描述。
- 标题必须是工具名，不能是域名派生（`Web`、`Lab`、`Tools`、`Ps`）。
- 一个站点的多个子页（锚点、帮助文档、下载页）合并成一条，不做成多个「工具」。
- 在线小游戏归 `fun`，不能混进 `design` / `image`。
- 描述不得含非法 UTF-16（孤立代理项）。

### 数据质量门禁

`npm run check:data` 执行 `scripts/check-ai-tools.mjs`，规则实现在 `scripts/lib/ai-tools-rules.mjs`：

| 规则 | 拦什么 |
|---|---|
| `required` / `category` / `duplicate-id` / `duplicate-url` | 结构性错误，**不可豁免** |
| `surrogate` | 孤立代理项 |
| `title-is-url` / `title-truncated` / `title-generic` | 域名派生标题 |
| `desc-template` / `desc-repeated` / `desc-too-short` | 模板描述、批量重复描述 |
| `game-misplaced` | 小游戏混进素材分类 |
| `same-host` | 同站超过 2 条却未声明 `variantOf` |

**基线机制**：`scripts/ai-tools-baseline.json` 记录存量豁免，`MAX_BASELINE` 控制上限。
2026-10-21 清洗后基线为 **0**，任何新增错位都会直接让门禁失败。

## 许愿墙要求

- 前端可在 `/api/wishes` 不可用时降级为本地草稿模式。
- Cloudflare Pages Functions + D1 作为线上持久化方案。
- 服务端校验标题、说明、作者、分类和链接数量。
- 最小反滥用：蜜罐字段 + 提交频控。
- 新愿望默认状态 `new`。

## Cloudflare Lab 要求

- 页面读取 `/api/health` 展示绑定状态。
- 页面读取 `features.config.json` 展示 feature flags 和实验队列。
- `/api/health` 不可用时降级为本地功能开关视图。
- 不得把未绑定的 D1、KV、R2、Vectorize、Queue、AI 伪装成可用。

## 部署要求

- 静态前端构建输出 `dist`。
- Pages Functions 在 `functions/`，D1 migration 在 `migrations/`。
- 未配置 `WISHES_DB` 时 API 返回 503，前端自动降级。

## 自动化检查

`npm run check` = `lint` + `check:assets` + `check:data` + `test:unit` + `build` + `test:e2e`。

本机运行时带 `CODEBUDDY_SAFE_DELETE_ENABLED=0`，否则安全删除 shim 会拦批量删除。

## 验收标准

- 8 条路由全部可达，导航栏项数 = 启用插件数。
- 访问冷藏路由显示「模块不可用」，不静默跳转。
- `check:data` 基线为 0 且通过。
- 注入一条模板描述 / 域名标题 / 小游戏错分类，`check:data` 必须失败。
- 许愿墙 GET / POST 在 Playwright 中可验证。
- 配置中不出现 `example.com`、`yourusername` 等上线占位。
