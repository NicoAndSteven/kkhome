# AI Tool Intelligence Spec

## 背景

当前 AI 工具导航已有 300+ 条工具数据，但仍以静态 JSON、关键词 includes 和前端过滤为主。后续应升级为 D1 + Vectorize + Workers AI 支撑的智能工具索引。

## 目标

- 工具数据进入 D1。
- 工具文本进入 Vectorize。
- Workers AI 解析用户意图。
- 搜索结果同时支持关键词、语义、分类、收藏和健康状态。
- 定期检查工具可访问性和标题质量。

## 非目标

- 不一次性替换前端全部搜索体验。
- 不在前端暴露 AI 调用密钥。
- 不让 AI 生成未经验证的工具链接。
- 不把语义搜索作为唯一搜索方式。

## Cloudflare 依赖

- D1: tools 表
- Vectorize: `HUB_VECTORIZE`
- Workers AI: `AI`
- Queues: `HUB_QUEUE`

## 用户可见能力

- 输入目标，例如“我要压缩图片”，返回工具组合。
- 搜索结果显示匹配原因。
- 工具卡显示健康状态、最近检查时间、域名。
- 支持收藏和最近使用。

## 数据模型

### tool_embeddings

- `tool_id TEXT PRIMARY KEY`
- `vector_id TEXT NOT NULL`
- `model TEXT NOT NULL`
- `indexed_at TEXT NOT NULL`

### tool_health

- `tool_id TEXT PRIMARY KEY`
- `status TEXT NOT NULL`
- `http_status INTEGER`
- `checked_at TEXT NOT NULL`
- `error TEXT`

### tool_usage

- `id TEXT PRIMARY KEY`
- `tool_id TEXT NOT NULL`
- `event_type TEXT NOT NULL`
- `created_at TEXT NOT NULL`

## API 设计

- `GET /api/tools`
- `GET /api/tools/search?q=...`
- `POST /api/tools/search/semantic`
- `POST /api/tools/:id/opened`
- `POST /api/tools/:id/favorite`
- `POST /api/admin/tools/reindex`
- `POST /api/admin/tools/check-links`

## Feature flags

- `aiSemanticSearch`
- `automationCenter`

## 实施阶段

1. 增加 tools D1 表和导入脚本。
2. 前端工具列表改为 API 优先、JSON fallback。
3. 增加关键词搜索 API。
4. 增加 Vectorize reindex job。
5. 增加 Workers AI intent parser。
6. 增加混合排序：关键词分、语义分、健康分、用户行为分。
7. 增加定期链接检查。

## 自动化验证

- 搜索 API 支持关键词命中。
- 未绑定 Vectorize 时语义搜索返回 unavailable。
- AI 未绑定时 intent parser 降级为关键词搜索。
- Playwright 验证工具搜索仍可用。

## 验收标准

- 搜索“图片压缩”能返回相关工具。
- 搜索结果包含 hostname 和 match reason。
- Vectorize 未绑定不会影响普通搜索。
- 工具数据质量 warning 可被后台任务记录。

## 风险与降级

- AI 成本失控：默认关闭语义搜索。
- Vectorize 索引不完整：混合搜索回退关键词。
- 工具链接失效：健康状态降权，不直接删除。
