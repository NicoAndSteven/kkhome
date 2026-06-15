# Automation Center Spec

## 背景

站点后续应能自动维护自己：检查工具链接、抓取 feed、生成日报、清洗数据、重试失败任务，并把状态展示给管理者。

## 目标

- 建立统一 job 系统。
- 使用 Queues 承载异步任务。
- 使用 Workflows 承载长流程。
- 支持定时巡检和失败重试。
- 提供任务状态 API。

## 非目标

- 不让用户提交任意代码执行。
- 不做无边界爬虫。
- 不自动发布未经审核的内容。
- 不在前端暴露任务内部密钥。

## Cloudflare 依赖

- Queues: 任务队列。
- Workflows: 长流程和状态推进。
- Cron Triggers: 定时任务。
- D1: jobs、events。
- R2: 报告和 artifact。

## 用户可见能力

- 工具健康状态。
- 最近巡检时间。
- 站点日报。
- 任务失败提示。

## 数据模型

复用 Data Foundation 的 `jobs`、`events`、`artifacts`。

### job_attempts

- `id TEXT PRIMARY KEY`
- `job_id TEXT NOT NULL`
- `status TEXT NOT NULL`
- `error TEXT`
- `started_at TEXT NOT NULL`
- `finished_at TEXT`

## API 设计

- `GET /api/jobs`
- `GET /api/jobs/:id`
- `POST /api/jobs`
- `POST /api/admin/jobs/:id/retry`
- `POST /api/admin/cron/link-check`
- `POST /api/admin/cron/site-report`

## Feature flags

- `automationCenter`

## 实施阶段

1. 增加 jobs 表和 job helper。
2. 增加 Queue producer。
3. 增加 link-check job。
4. 增加 failed job retry。
5. 增加 Cron 触发。
6. 增加 Workflows 状态推进。
7. 增加管理状态页。

## 自动化验证

- 未绑定 Queue 时 job API 返回 unavailable。
- link-check 可以 dry-run。
- 失败任务记录 error。
- retry 不会无限递归。

## 验收标准

- 工具链接能被定期检查。
- 任务状态可查询。
- 失败任务可重试。
- 所有自动化任务都有审计记录。

## 风险与降级

- Queue 未绑定：只允许同步 dry-run。
- Cron 未配置：允许手动触发。
- Workflows 未绑定：使用 D1 job status 过渡。
