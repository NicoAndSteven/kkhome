# 任务清单

## 当前主线

- [x] 收敛产品定位为个人 AI 工具导航与需求反馈 Hub。
- [x] 默认路由固定为 `home / ai-tools / wish-wall / cloudflare-lab`。
- [x] 注册已有插件，默认只启用当前核心模块。
- [x] 为 `ai-navigator` 和 `wish-wall` 补配置 schema。
- [x] 为 AI 工具导航增加轻量搜索评分。
- [x] 为 AI 工具卡片展示工具域名。
- [x] 增加 AI 工具数据质量检查脚本。
- [x] 将 `npm run check:data` 纳入综合质量门禁。
- [x] 为 Wish Wall API 增加蜜罐、链接数量限制和服务端提交频控。
- [x] 为 D1 migration 增加提交频控表。
- [x] 更新 README 与当前 spec。
- [x] 新增 Cloudflare-native Hub 规格。
- [x] 新增 Cloudflare 功能实验计划。
- [x] 新增 Cloudflare roadmap 总 spec。
- [x] 新增 Data Foundation spec。
- [x] 新增 AI Tool Intelligence spec。
- [x] 新增 Wish Wall 2.0 spec。
- [x] 新增 Browser Lab spec。
- [x] 新增 Realtime Playground spec。
- [x] 新增 Automation Center spec。
- [x] 新增 Public API Toolbox spec。
- [x] 新增 feature flags 配置。
- [x] 新增统一 Pages Functions API 响应工具。
- [x] 新增 `/api/health` 绑定探测端点。
- [x] 将 Wish Wall API 接入统一响应结构。
- [x] 在 `wrangler.toml` 增加未来绑定草案。
- [x] 新增 Cloudflare Lab 插件。
- [x] 新增 `cloudflare-lab` 路由。
- [x] Cloudflare Lab 接入 `/api/health` 和 feature flags。
- [x] 新增 Data Foundation v2 migration。

## 下一步

- [ ] 创建真实 KV namespace 并绑定 `HUB_KV`。
- [ ] 创建真实 R2 bucket 并绑定 `HUB_BUCKET`。
- [ ] 创建真实 D1 database 并绑定 `WISHES_DB`。
- [ ] 创建 Vectorize index 并绑定 `HUB_VECTORIZE`。
- [ ] 创建 Queue 并绑定 `HUB_QUEUE`。
- [ ] 启用 Workers AI binding。
- [ ] 清洗 AI 工具导航中的重复 id。
- [ ] 批量替换“官网下载”“Github”“Zh”“Apps”等泛化标题。
- [ ] 为 Wish Wall 增加最小管理脚本或管理接口，用于推进状态。
- [ ] 在 Cloudflare Pages 上绑定真实 D1 数据库并应用 migration。
- [ ] 补充 Wish Wall Function 的独立 API 测试。
- [ ] 为 `configSchema` 增加单元测试。
- [ ] 为 AI 搜索排序增加单元测试。
- [ ] 补充线上部署验证记录。

## 暂缓模块

- [ ] `quick-launch`：等 AI 工具导航稳定后再决定是否恢复为命令面板。
- [ ] `workbench`：等有明确工具 MVP 后再启用。
- [ ] `collections`：等资源数据完成清洗后再启用。
- [ ] `scratchpad`：等本地收纳流程明确后再启用。
- [ ] `projects`：如后续需要作品集叙事，再以 featured case-study 形式启用。
- [ ] `universal-inbox`：当前由许愿墙承担公开输入入口，暂不启用。
