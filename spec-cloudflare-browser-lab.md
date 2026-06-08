# Browser Lab Spec

## 背景

Cloudflare Browser Rendering / Browser Run 能在边缘运行浏览器能力。本站可以把它包装为“网页炼金室”：输入 URL，生成截图、PDF、Markdown、摘要和结构化卡片。

## 目标

- 输入 URL，生成网页截图。
- 输入 URL，导出 PDF。
- 输入 URL，抽取 Markdown。
- 结果写入 R2。
- 长任务走 Queues 或 Workflows。

## 非目标

- 不做无限制爬虫。
- 不绕过登录、付费墙或 robots 限制。
- 不抓取敏感个人信息。
- 不让浏览器任务阻塞前台请求。

## Cloudflare 依赖

- Browser Rendering / Browser Run
- R2: artifact 存储
- Queues: 异步任务
- D1: jobs、artifacts
- KV: URL 结果缓存

## 用户可见能力

- URL 预览。
- 截图下载。
- PDF 下载。
- Markdown 下载。
- 摘要卡片。
- 历史任务列表。

## 数据模型

### browser_jobs

- `id TEXT PRIMARY KEY`
- `url TEXT NOT NULL`
- `job_type TEXT NOT NULL`
- `status TEXT NOT NULL`
- `artifact_id TEXT`
- `error TEXT`
- `created_at TEXT NOT NULL`
- `updated_at TEXT NOT NULL`

## API 设计

- `POST /api/browser/jobs`
- `GET /api/browser/jobs/:id`
- `GET /api/browser/artifacts/:id`
- `POST /api/browser/jobs/:id/retry`

## Feature flags

- `browserLab`

## 实施阶段

1. 增加 Browser Lab UI disabled 状态。
2. 增加 job API，未绑定时返回 unavailable。
3. 增加 D1 job 表。
4. 增加 Queue producer。
5. 增加 worker consumer 执行截图。
6. 写入 R2 artifact。
7. 增加 PDF 和 Markdown。

## 自动化验证

- URL 校验拒绝非法协议。
- 未绑定 Browser/R2/Queue 时返回 unavailable。
- 成功任务写入 D1。
- artifact 有 content type。

## 验收标准

- 提交 URL 后能看到任务状态。
- 截图结果可从 R2 读取。
- 失败任务有错误原因。
- 前端不会因长任务卡住。

## 风险与降级

- 成本风险：默认关闭，限制并发和每日次数。
- 滥用风险：需要 Turnstile 或 admin-only。
- 目标站限制：失败时保留错误，不重试无限次。
