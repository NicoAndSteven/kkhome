# Public API Toolbox Spec

## 背景

当站点拥有稳定 Edge API、数据底座和自动化能力后，可以开放一组轻量公开 API，让网站本身成为可被调用的 Cloudflare edge toolbox。

## 目标

- 提供可公开调用的工具 API。
- 提供 API 文档页。
- 提供基础配额和频控。
- 所有 API 统一响应格式。
- 调用统计进入 D1 或 Analytics。

## 非目标

- 不开放需要私钥的能力。
- 不开放无限制 Browser 或 AI 调用。
- 不承诺生产级 SLA。
- 不允许绕过频控和审计。

## Cloudflare 依赖

- Workers / Pages Functions
- KV: rate limit
- D1: usage logs
- R2: generated artifacts
- Workers AI: optional summarize
- Browser Rendering: optional screenshot

## 用户可见能力

- API 文档页。
- API playground。
- 示例请求。
- 调用结果预览。

## API 设计

- `GET /api/docs`
- `GET /api/tools/search?q=...`
- `POST /api/summarize`
- `POST /api/screenshot`
- `POST /api/shorten`
- `POST /api/og`
- `GET /api/feed`

## 数据模型

### api_usage

- `id TEXT PRIMARY KEY`
- `endpoint TEXT NOT NULL`
- `status INTEGER NOT NULL`
- `client_hash TEXT`
- `duration_ms INTEGER`
- `created_at TEXT NOT NULL`

### short_links

- `slug TEXT PRIMARY KEY`
- `url TEXT NOT NULL`
- `created_at TEXT NOT NULL`
- `expires_at TEXT`

## Feature flags

- `publicApiToolbox`
- `browserLab`
- `aiSemanticSearch`

## 实施阶段

1. 建立 API docs 页面。
2. 开放只读 `tools/search`。
3. 增加 KV rate limit。
4. 增加 short link。
5. 增加 summarize。
6. 增加 screenshot。
7. 增加 API usage dashboard。

## 自动化验证

- API 响应结构一致。
- 未启用 flag 时返回 404 或 unavailable。
- 频控命中返回 429。
- Playwright 验证 docs 页面。

## 验收标准

- 至少一个公开 API 可用。
- 每个公开 API 都有请求示例。
- 调用记录可追踪。
- 高成本 API 默认关闭。

## 风险与降级

- 滥用风险：默认只开放低成本只读 API。
- 成本风险：AI 和 Browser API 需要配额。
- 隐私风险：usage 只存 hash，不存原始 IP。
