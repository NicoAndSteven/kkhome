# Cloudflare 功能实验计划

## Phase 0: Platform Foundation

- [x] `/api/health`：探测 D1、KV、R2、AI、Vectorize、Queues 等绑定状态。
- [x] API response helper：统一 success/error/CORS/meta。
- [x] Feature flags：所有实验功能先由配置控制。
- [x] Wrangler binding draft：保留绑定草案，真实资源创建后再填入。
- [x] Cloudflare Lab：站内可见平台能力面板。

## Phase 1: Data Foundation

- D1 v2 schema：tools、wishes、events、jobs、artifacts、links。
- KV：热配置、rate limit、短期缓存。
- R2：文件、截图、PDF、网页抽取结果。
- Admin audit：记录管理动作和自动化任务状态。

## Phase 2: AI Tool Intelligence

- 工具数据迁移到 D1。
- AI 工具数据清洗任务。
- Workers AI 做 query intent 分类。
- Vectorize 做语义搜索。
- 工具推荐：输入目标后输出工具组合。
- 工具健康分：可访问性、最近检查时间、用户点击、收藏。

## Phase 3: Wish Wall 2.0

- Turnstile 防滥用。
- D1 状态流。
- 管理 API。
- Workflows：提交、审核、采纳、开发中、上线。
- Durable Objects：实时愿望流和在线状态。

## Phase 4: Browser Lab

- URL 转截图。
- URL 转 PDF。
- URL 转 Markdown。
- URL 转结构化摘要。
- 结果写入 R2。
- Queues 处理异步任务。

## Phase 5: Realtime Playground

- 在线访客 presence。
- 实时 reaction。
- 协作便签。
- 投票。
- 像素墙。
- 轻量白板。

## Phase 6: Automation Center

- 定时链接检查。
- 工具失效标记。
- 站点日报。
- Feed 抓取。
- Changelog 生成。
- 错误和任务失败面板。

## Phase 7: Public Edge Toolbox

- `/api/tools/search`
- `/api/screenshot`
- `/api/summarize`
- `/api/shorten`
- `/api/feed`
- `/api/og`
- API 文档页。
- API 调用统计和配额。

## 当前执行顺序

1. 先完成 Phase 0。
2. 再把 Wish Wall 和 AI Navigator 接入更完整的数据底座。
3. 然后优先做 Browser Lab，因为它最能体现 Cloudflare 平台特色。
4. 最后扩展 Durable Objects 实时互动和 Workflows 自动化。

## 对应 Specs

- `spec-cloudflare-roadmap.md`
- `spec-cloudflare-data-foundation.md`
- `spec-cloudflare-ai-tool-intelligence.md`
- `spec-cloudflare-wish-wall-2.md`
- `spec-cloudflare-browser-lab.md`
- `spec-cloudflare-realtime-playground.md`
- `spec-cloudflare-automation-center.md`
- `spec-cloudflare-public-api-toolbox.md`
