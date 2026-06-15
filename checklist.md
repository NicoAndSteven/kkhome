# 验证清单

## 已自动验证

- [x] `npm run lint` 通过。
- [x] `npm run check:assets` 通过。
- [x] `npm run build` 通过。
- [x] `npm run test:e2e` 通过。

## 当前路由

- [x] `home` 首页可见。
- [x] `ai-tools` AI 工具导航可见。
- [x] `wish-wall` 访客许愿墙可见。
- [x] `cloudflare-lab` Cloudflare 平台能力面板可见。
- [x] `news` 新闻聚合可见。
- [x] `stock-watch` 股市看盘可见。
- [x] `food` 今天吃什么可见。
- [x] 禁用模块 `inbox / launch / workbench / collections / scratchpad` 不出现在页面中。

## AI 工具导航

- [x] 配置中 AI 工具数据可加载。
- [x] 分类过滤可用。
- [x] 意图词搜索可用。
- [x] 工具卡片展示工具自身域名。
- [ ] 清洗重复 id 和泛化标题。

## 访客许愿墙

- [x] `/api/wishes` 可被 Playwright mock。
- [x] GET 愿望列表可渲染。
- [x] POST 新愿望可渲染。
- [x] API 不可用时前端可降级为本地草稿模式。
- [ ] 绑定真实 D1。
- [ ] 接入 Turnstile。

## Cloudflare Lab

- [x] 插件已注册。
- [x] API 不可用时显示本地功能开关视图。
- [ ] 绑定真实 KV namespace。
- [ ] 绑定真实 R2 bucket。

## 新闻聚合

- [x] 多国新闻源切换可用。
- [x] API 不可用时显示降级提示。
- [ ] 绑定真实后端代理。

## 股市看盘

- [x] 自选股列表可渲染。
- [x] API 不可用时显示降级提示。
- [ ] 绑定真实后端代理。

## 今天吃什么

- [x] 转盘交互可用。
- [x] 中午/晚上时段自动切换。
- [x] 菜单管理可用。

## 待人工验证

- [ ] Cloudflare Pages 部署成功。
- [ ] `/api/health` 在线上环境能准确显示绑定状态。
- [ ] 移动端各页面不溢出。
- [ ] Lighthouse 可访问性分数达到 90+。
