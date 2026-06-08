# 验证清单

## 已自动验证

- [x] `npm run lint` 通过。
- [x] `npm run check:assets` 通过。
- [x] `npm run check:data` 通过。
- [x] `npm run build` 通过。
- [x] `npm run test:e2e` 通过。
- [x] `npm run check` 通过。

## 当前默认路由

- [x] `home` 首页可见。
- [x] `ai-tools` AI 工具导航可见。
- [x] `wish-wall` 访客许愿墙可见。
- [x] `cloudflare-lab` Cloudflare 平台能力面板可见。
- [x] `__hubAvailableRoutes` 包含 `home / ai-tools / wish-wall / cloudflare-lab`。
- [x] 禁用模块 `inbox / launch / workbench / collections / scratchpad / projects / workflows` 不出现在页面中。

## AI 工具导航

- [x] 配置中 AI 工具数据可加载。
- [x] 分类过滤可用。
- [x] 意图词搜索可用。
- [x] 工具卡片展示工具自身域名。
- [x] 数据检查能报告重复 id 和泛化标题 warning。
- [ ] 清洗重复 id。
- [ ] 清洗“官网下载”“Github”“Zh”“Apps”等泛化标题。
- [ ] 将工具数据迁移到 D1。
- [ ] 增加 Vectorize 语义搜索。

## 访客许愿墙

- [x] `/api/wishes` 可被 Playwright mock。
- [x] GET 愿望列表可渲染。
- [x] POST 新愿望可渲染。
- [x] API 不可用时前端可降级为本地草稿模式。
- [x] 服务端包含标题、长度、链接数量和蜜罐校验。
- [x] 服务端包含提交频控表。
- [ ] 绑定真实 D1。
- [ ] 接入 Turnstile。
- [ ] 增加管理 API。
- [ ] 增加状态推进事件流。

## Cloudflare Lab

- [x] `cloudflare-lab` 插件已注册。
- [x] `cloudflare-lab` 路由已接入 Header 和 Progress Rail。
- [x] 页面读取 `/api/health`。
- [x] 页面读取 `features.config.json`。
- [x] API 不可用时显示本地功能开关视图。
- [x] 页面展示 D1、KV、R2、Vectorize、Queue、AI 绑定状态。
- [x] 页面展示实验队列。
- [ ] 绑定真实 KV namespace。
- [ ] 绑定真实 R2 bucket。
- [ ] 绑定真实 Vectorize index。
- [ ] 绑定真实 Queue。
- [ ] 启用 Workers AI binding。

## Cloudflare-native Specs

- [x] `spec-cloudflare-native-hub.md`
- [x] `spec-cloudflare-roadmap.md`
- [x] `spec-cloudflare-data-foundation.md`
- [x] `spec-cloudflare-ai-tool-intelligence.md`
- [x] `spec-cloudflare-wish-wall-2.md`
- [x] `spec-cloudflare-browser-lab.md`
- [x] `spec-cloudflare-realtime-playground.md`
- [x] `spec-cloudflare-automation-center.md`
- [x] `spec-cloudflare-public-api-toolbox.md`

## 待人工验证

- [ ] Cloudflare Pages 部署成功。
- [ ] `/api/health` 在线上环境能准确显示绑定状态。
- [ ] D1 migration 在线上环境应用成功。
- [ ] 移动端 `cloudflare-lab` 不溢出。
- [ ] Lighthouse 可访问性分数达到 90+。
