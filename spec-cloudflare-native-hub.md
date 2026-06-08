# Cloudflare-native Hub 规格

## 方向

本站不再按“个人主页、工具站、作品集”设功能边界。功能边界只受 Cloudflare 平台能力、成本、安全和可维护性约束。

目标是把站点演进为一个 Cloudflare-native playground：

- Pages 承载静态前端。
- Pages Functions / Workers 承载 Edge API。
- D1 承载结构化数据。
- KV 承载缓存、功能开关和轻量状态。
- R2 承载文件、截图、导出物和长期素材。
- Durable Objects 承载实时协作、房间、presence 和强一致状态。
- Queues 承载异步任务、重试和批处理。
- Workflows 承载长流程、审批和多步骤自动化。
- Workers AI / AI Gateway / Vectorize 承载 AI 搜索、总结、推荐和 RAG。
- Browser Rendering / Browser Run 承载网页截图、PDF、Markdown 抽取和结构化采集。
- Turnstile、Access、Analytics、WAF 类能力承载安全和可观测。

## 架构层

### 1. Frontend Shell

React + Vite 静态前台，只负责用户体验、路由、模块编排和状态展示。所有需要密钥、持久化、AI 或异步任务的能力必须走 `/api/*`。

### 2. Edge API

`functions/api/*` 是当前 API 入口。所有 API 使用统一响应结构：

```json
{
  "ok": true,
  "data": {},
  "meta": {
    "timestamp": "2026-06-07T00:00:00.000Z"
  }
}
```

错误响应：

```json
{
  "ok": false,
  "error": {
    "code": "bad_request",
    "message": "Invalid request"
  },
  "meta": {
    "timestamp": "2026-06-07T00:00:00.000Z"
  }
}
```

### 3. Data Layer

- D1：结构化表、状态流、任务表、审计日志。
- KV：功能开关、热缓存、轻量 rate-limit 状态。
- R2：文件上传、截图、PDF、网页抽取结果、长期 artifact。

### 4. Realtime Layer

Durable Objects 用于：

- 在线访客 presence。
- 实时许愿墙。
- 实时 reaction。
- 协作便签、投票、像素墙、轻量白板。

### 5. Async Layer

Queues 和 Workflows 用于：

- 链接检查。
- 网页截图。
- AI 总结。
- 数据清洗。
- 失败重试。
- 长流程审批。

### 6. AI Layer

- Workers AI：意图解析、总结、分类、推荐。
- Vectorize：语义搜索和 RAG 索引。
- AI Gateway：集中管理外部模型调用。
- Agents：后续承载可编排 AI 助手。

### 7. Automation Layer

Browser Run / Browser Rendering 用于：

- URL 截图。
- URL 转 PDF。
- URL 转 Markdown。
- 网页结构化抽取。
- 工具站点巡检。

## 平台约束

- 私钥、token、OAuth secret 不得进入前端配置。
- 所有用户提交入口必须有服务端校验。
- AI、Browser、R2 上传和长任务必须有 feature flag。
- 没有绑定的 Cloudflare 资源必须返回明确 unavailable 状态，而不是伪造成功。
- 公开 API 必须有最小频控和错误结构。
- 大功能先以 disabled flag 进入配置，再逐步启用。

## 第一阶段验收

- [x] `/api/health` 可以返回 Cloudflare 绑定探测结果。
- [x] API 响应结构统一。
- [x] `wrangler.toml` 包含后续绑定草案。
- [x] 功能开关配置存在，未启用功能不会出现在 UI 主路径。
- [x] `cloudflare-lab` 可见路由展示绑定状态、feature flags 和实验队列。
- [x] `npm run check` 通过。
