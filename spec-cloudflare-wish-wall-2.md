# Wish Wall 2.0 Spec

## 背景

当前 Wish Wall 已有前端表单、D1 API 草案、本地 fallback 和基础反滥用。下一阶段应升级为公开需求反馈系统，承载用户输入、状态推进、管理处理和上线记录。

## 目标

- 将愿望从留言功能升级为产品反馈流。
- 增加服务端审核和状态推进。
- 增加 Turnstile 防滥用。
- 增加管理端或管理 API。
- 可选支持实时愿望流。

## 非目标

- 不开放任意用户修改状态。
- 不展示未经审核的危险链接。
- 不把管理密钥放在前端。
- 不承诺跨站身份系统。

## Cloudflare 依赖

- D1: wishes、events、audit
- Turnstile: 提交校验
- Workflows: 状态推进流程
- Durable Objects: 可选实时流
- KV: 频控缓存

## 用户可见能力

- 提交愿望。
- 查看状态：新愿望、已采纳、开发中、已上线。
- 查看上线链接或说明。
- 查看最近状态变化。

## 数据模型

### wish_events

- `id TEXT PRIMARY KEY`
- `wish_id TEXT NOT NULL`
- `event_type TEXT NOT NULL`
- `note TEXT`
- `created_at TEXT NOT NULL`

### wish_admin_audit

- `id TEXT PRIMARY KEY`
- `wish_id TEXT`
- `action TEXT NOT NULL`
- `actor TEXT`
- `created_at TEXT NOT NULL`

## API 设计

- `GET /api/wishes`
- `POST /api/wishes`
- `GET /api/wishes/:id/events`
- `POST /api/admin/wishes/:id/status`
- `POST /api/admin/wishes/:id/note`
- `POST /api/admin/wishes/:id/ship`

## Feature flags

- `cloudflareHealth`
- `adminConsole`
- `realtimePresence`

## 实施阶段

1. 增加 Turnstile token 字段和服务端校验。
2. 增加 wish_events 表。
3. 增加状态推进 API。
4. 增加管理脚本或最小管理页。
5. 增加上线记录。
6. 可选接 Durable Objects 实时广播。

## 自动化验证

- 无 token 时提交被拒绝。
- API 未绑定 Turnstile 时进入开发降级路径。
- 状态推进写入 event。
- Playwright 验证提交后可见。

## 验收标准

- 新愿望默认状态为 `new`。
- 管理端可推进状态。
- 每次状态变化可追溯。
- 垃圾提交不会进入公开列表。

## 风险与降级

- Turnstile 未配置：仅允许本地草稿或开发模式。
- D1 未配置：前端本地 fallback。
- 管理鉴权未完成：禁用 admin API。
