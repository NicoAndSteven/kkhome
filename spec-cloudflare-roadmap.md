# Cloudflare-native Roadmap Spec

## 背景

本站后续不再按传统网站类型限制功能，而按 Cloudflare 平台能力扩展。为了避免功能堆叠失控，所有后续能力必须先进入 spec，再进入实现。

## Spec 范式

每个阶段 spec 必须包含：

- 背景
- 目标
- 非目标
- Cloudflare 依赖
- 用户可见能力
- 数据模型
- API 设计
- Feature flags
- 实施阶段
- 自动化验证
- 验收标准
- 风险与降级

## 总阶段

1. `spec-cloudflare-data-foundation.md`
2. `spec-cloudflare-ai-tool-intelligence.md`
3. `spec-cloudflare-wish-wall-2.md`
4. `spec-cloudflare-browser-lab.md`
5. `spec-cloudflare-realtime-playground.md`
6. `spec-cloudflare-automation-center.md`
7. `spec-cloudflare-public-api-toolbox.md`

## 执行原则

- 每个功能先 disabled，再通过 feature flag 启用。
- 没有真实 Cloudflare binding 时只能展示 unavailable，不展示假成功。
- 用户提交、上传、AI、Browser、公开 API 都必须有服务端校验和频控。
- D1 是事实数据源，KV 只做缓存和短期状态，R2 只做对象存储。
- 异步任务优先走 Queues，长流程优先走 Workflows。
- 实时状态优先走 Durable Objects。
- 自动化任务必须可重试、可观测、可降级。

## 当前优先级

P0:

- Cloudflare Lab
- Data Foundation
- Wish Wall 2.0
- AI Tool Intelligence

P1:

- Browser Lab
- Automation Center

P2:

- Realtime Playground
- Public API Toolbox

## 全局验收

- `npm run check` 通过。
- `/api/health` 能准确反映绑定状态。
- `cloudflare-lab` 能展示绑定状态、feature flags 和实验队列。
- README、tasks、cloudflare-plan 与当前 spec 保持一致。
- 每个启用的功能都有对应测试或手工验收记录。
