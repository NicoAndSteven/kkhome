# Realtime Playground Spec

## 背景

Durable Objects 适合承载强一致、低延迟、实时互动状态。本站可以加入在线访客空间、实时 reaction、协作便签、投票和像素墙，让站点变成有现场感的 playground。

## 目标

- 显示在线访客 presence。
- 支持实时 reaction。
- 支持临时协作便签。
- 支持投票和轻量实时状态。
- 所有实时能力可关闭。

## 非目标

- 不做完整账号系统。
- 不做不可控匿名聊天室。
- 不长期保存所有实时消息。
- 不默认公开精确地理或个人标识。

## Cloudflare 依赖

- Durable Objects: 房间状态和 WebSocket。
- D1: 可选持久化事件。
- KV: 可选短期配置。

## 用户可见能力

- 当前在线人数。
- 访客 reaction。
- 一次性投票。
- 协作便签墙。
- 可选像素墙。

## 数据模型

### realtime_events

- `id TEXT PRIMARY KEY`
- `room_id TEXT NOT NULL`
- `event_type TEXT NOT NULL`
- `payload_json TEXT`
- `created_at TEXT NOT NULL`

Durable Object 内部状态：

- clients
- reactions
- notes
- polls
- ttl

## API 设计

- `GET /api/realtime/room`
- `GET /api/realtime/events`
- WebSocket: `/api/realtime/connect`

## Feature flags

- `realtimePresence`

## 实施阶段

1. 定义 Durable Object `HubRoom`。
2. 增加 WebSocket endpoint。
3. 前端显示只读在线人数。
4. 增加 reaction。
5. 增加投票。
6. 增加协作便签。
7. 增加 moderation 和 TTL。

## 自动化验证

- 未绑定 Durable Object 时 UI 显示 unavailable。
- WebSocket 可连接和断开。
- 多客户端 reaction 可广播。
- reduced-motion 下实时动画不抢焦点。

## 验收标准

- 两个客户端能看到同一实时状态。
- 断线后 presence 清理。
- 刷新不导致页面崩溃。
- 默认不暴露敏感访客信息。

## 风险与降级

- 匿名滥用：默认只开启 reaction 和 presence。
- 成本风险：限制房间数量和连接数。
- 隐私风险：只展示聚合状态。
