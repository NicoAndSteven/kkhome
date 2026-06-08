# 个人 AI Hub 规格说明

## 产品定位

本站当前主线是“垣钰的个人 AI 工具导航与需求反馈 Hub”。它不是传统作品集长页，也不是普通书签页；默认只暴露少量可信、可维护、可交互的核心路由。

## 当前默认路由

- `home`：个人介绍首页，展示身份、简介、技能与联系入口。
- `ai-tools`：AI / 效率工具导航，支持意图词、分类、搜索和外部打开。
- `wish-wall`：访客许愿墙，收集用户希望本站上线的功能、工具或体验。
- `cloudflare-lab`：Cloudflare 平台能力面板，展示绑定状态、feature flags 和实验队列。

`quick-launch`、`workbench`、`collections`、`scratchpad`、`universal-inbox`、`projects` 等插件保留为后续扩展能力，默认禁用。启用这些插件前，必须确保它们已注册、已配置、已有可达路由，并有对应测试。

## 非目标

- 不展示假访客数、假下载量、假评论、假项目数据。
- 不把需要私钥、OAuth 或个人 token 的集成放进前端配置。
- 不一次性铺开大量低频模块。
- 不让旧 Navigation / Tools / Projects 作品集规格覆盖当前四路由 Cloudflare-native Hub 主线。

## 配置契约

`public/config/site.config.json` 管理站点、个人资料和动效配置。

`public/config/plugins.config.json` 管理插件启用状态、顺序和运行数据。当前必须重点校验：

- `ai-navigator.config.categories`
- `ai-navigator.config.intentPrompts`
- `ai-navigator.config.tools`
- `wish-wall.config.seedWishes`
- `cloudflare-lab.config.title`
- `cloudflare-lab.config.description`

配置由 `src/core/configSchema.ts` 使用 Zod 校验。坏配置必须降级为空数组或默认值，不能让页面崩溃。

## AI 工具导航要求

- 搜索使用轻量评分：标题、别名、标签优先，描述和来源标题低权重。
- 工具卡片必须展示可区分来源的域名。
- 配置检查必须覆盖缺字段、未知分类、重复 id 和泛化标题。
- 数据清洗优先处理“官网下载”“Github”“Zh”“Apps”等不可识别标题。
- 不展示采集源站域名作为用户可见主信息，除非它就是工具自身域名。

## 许愿墙要求

- 前端可在 `/api/wishes` 不可用时降级为本地草稿模式。
- Cloudflare Pages Functions + D1 可作为线上持久化方案。
- 服务端必须校验标题、说明、作者、分类和链接数量。
- 服务端必须有最小反滥用机制：蜜罐字段和提交频控。
- 用户提交的新愿望默认状态为 `new`，状态推进由后续管理流程处理。

## Cloudflare Lab 要求

- 默认启用 `cloudflare-lab` 路由。
- 页面必须读取 `/api/health` 展示绑定状态。
- 页面必须读取 `features.config.json` 展示 feature flags 和实验队列。
- `/api/health` 不可用时，页面降级为本地功能开关视图。
- 不得把未绑定的 D1、KV、R2、Vectorize、Queue、AI 伪装成可用。

## 部署要求

- 静态前端构建输出仍为 `dist`。
- Pages Functions 放在 `functions/`。
- D1 migration 放在 `migrations/`。
- 未配置 `WISHES_DB` 时，API 返回 503，前端自动降级。
- 配置 D1 前不得假装愿望已跨设备同步。

## 自动化检查

- `npm run lint`
- `npm run check:assets`
- `npm run check:data`
- `npm run build`
- `npm run test:e2e`
- `npm run check`

## 验收标准

- 默认可用路由为 `home / ai-tools / wish-wall / cloudflare-lab`。
- 禁用任一非核心插件后页面不崩溃。
- AI 导航搜索、分类和意图词可用。
- 许愿墙 GET / POST 流程在 Playwright 中可验证。
- Cloudflare Lab 可以展示绑定状态和实验队列。
- 配置中不出现 `example.com`、`yourusername` 等上线占位。
- `npm run check` 通过。
