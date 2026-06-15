# Data Foundation Spec

## 背景

当前项目已有静态配置、Wish Wall D1 草案和 AI 工具 JSON 数据。后续功能需要统一数据底座，避免继续把长期数据堆在 `plugins.config.json`。

## 目标

- 建立 D1 结构化数据模型。
- 建立 KV 缓存和 feature flag 快照策略。
- 建立 R2 artifact 存储约定。
- 为任务、事件、审计、工具、愿望提供统一表结构。

## 非目标

- 不在第一步迁移全部 AI 工具数据。
- 不做复杂后台管理 UI。
- 不把 KV 当主数据库。
- 不把 R2 当可查询数据库。

## Cloudflare 依赖

- D1: `WISHES_DB` 或后续统一 `HUB_DB`
- KV: `HUB_KV`
- R2: `HUB_BUCKET`

## 用户可见能力

- 网站能显示数据源状态。
- API 能区分 configured、unavailable、degraded。
- 管理者能通过后续脚本迁移工具数据。

## 数据模型

### tools

- `id TEXT PRIMARY KEY`
- `title TEXT NOT NULL`
- `category TEXT NOT NULL`
- `url TEXT NOT NULL`
- `description TEXT NOT NULL`
- `tags_json TEXT`
- `aliases_json TEXT`
- `hostname TEXT`
- `score INTEGER DEFAULT 0`
- `enabled INTEGER DEFAULT 1`
- `created_at TEXT NOT NULL`
- `updated_at TEXT NOT NULL`

### wishes

沿用现有 wishes 表，后续增加：

- `review_note TEXT`
- `updated_at TEXT`
- `shipped_url TEXT`

### events

- `id TEXT PRIMARY KEY`
- `type TEXT NOT NULL`
- `subject_type TEXT`
- `subject_id TEXT`
- `payload_json TEXT`
- `created_at TEXT NOT NULL`

### jobs

- `id TEXT PRIMARY KEY`
- `type TEXT NOT NULL`
- `status TEXT NOT NULL`
- `payload_json TEXT`
- `result_json TEXT`
- `error TEXT`
- `attempts INTEGER DEFAULT 0`
- `created_at TEXT NOT NULL`
- `updated_at TEXT NOT NULL`

### artifacts

- `id TEXT PRIMARY KEY`
- `kind TEXT NOT NULL`
- `r2_key TEXT NOT NULL`
- `content_type TEXT`
- `source_url TEXT`
- `created_at TEXT NOT NULL`

## API 设计

- `GET /api/health`
- `GET /api/platform/features`
- `GET /api/platform/bindings`
- `POST /api/admin/migrate/tools`
- `GET /api/admin/jobs`

Admin API 暂不公开，必须等 Access 或其它鉴权边界确定后启用。

## Feature flags

- `cloudflareHealth`
- `adminConsole`

## 实施阶段

1. 新增 D1 migration v2。当前已新增 `migrations/002_hub_foundation.sql`。
2. 新增 platform API。
3. 新增 tools 导入脚本。
4. 将 AI 工具读取从 JSON 迁移到 API，JSON 保留为 fallback。
5. 引入 KV 缓存。
6. 引入 R2 artifact 写入约定。

## 自动化验证

- migration SQL 可重复执行。
- API 未绑定时返回 unavailable。
- `npm run check` 通过。
- 导入脚本可以 dry-run。

## 验收标准

- `/api/health` 显示 D1/KV/R2 状态。
- D1 包含 tools、events、jobs、artifacts 表。
- AI 工具 JSON 可以导入 D1。
- 未绑定资源时前端不崩溃。

## 风险与降级

- D1 未绑定：继续用 JSON 和本地模式。
- KV 未绑定：跳过缓存。
- R2 未绑定：禁用 artifact 功能。
