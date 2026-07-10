# 聚会游戏模块 — 功能逻辑说明

> 更新日期：2026-07-10
> 作者：yuke
>
> **关联 commit**：B6 修复涉及以下文件变更 —
> `functions/_shared/partyRoomState.js` (+21),
> `workers/party-rooms/src/index.js` (+7),
> `src/plugins/party-games/index.tsx` (+3/-12)
>
> **本次审查发现**：
> - `assignUndercoverRound` 无 shuffle → 最后一人总是卧底
> - WS 鉴权基于查询参数中的明文 playerId，无 token 验证
> - `revealPartyVotingResult` 非幂等（重复调用抛 409）
> - `useLocalGame.ts` 与 `partyRoomState.js` 是独立实现，"共享"仅限后端 DO 引用

---

## 目录

1. [概述](#1-概述)
2. [系统架构](#2-系统架构)
3. [双模式设计](#3-双模式设计)
4. [谁是卧底 — 游戏逻辑](#4-谁是卧底--游戏逻辑)
5. [真心话大冒险 — 游戏逻辑](#5-真心话大冒险--游戏逻辑)
6. [状态机完整实现](#6-状态机完整实现)
7. [数据模型](#7-数据模型)
8. [通信协议](#8-通信协议)
9. [鉴权与会话模型](#9-鉴权与会话模型)
10. [内容系统](#10-内容系统)
11. [本地引擎](#11-本地引擎)
12. [并发模型](#12-并发模型)
13. [测试覆盖](#13-测试覆盖)
14. [当前状态与已知缺口](#14-当前状态与已知缺口)

---

## 1. 概述

聚会游戏模块是 kkhome 的插件化子应用（plugin id: `party-games`），提供两款派对游戏：

| 游戏 | 类型 | 最少人数 | 核心循环 |
|------|------|----------|----------|
| **谁是卧底** | 社交推理 | 3 人 | 分配词语 → 轮流描述 → 投票 → 判定胜负 → 惩罚 → 新回合 |
| **真心话大冒险** | 轮转抽卡 | 2 人 | 选类型 → 抽卡 → 执行 → 下一人 → 循环 |

两款游戏共享房间系统（创建 → 等待 → 游戏），但游戏阶段和胜负逻辑完全独立。

---

## 2. 系统架构

### 2.1 分层

```
┌──────────────────────────┐
│   视图层 (React 组件)      │  ← 只消费 LocalPartyRoom + 回调
├──────────────────────────┤
│   路由层 (index.tsx)       │  ← effectiveRoom 抽象，统一本地/在线
├──────────┬───────────────┤
│ 本地引擎  │  在线客户端     │
│ 薄封装层  │  fetch+WS     │
│ (imports │               │
│  shared) │               │
├──────────┴───────────────┤
│   partyRoomState.js       │  ← 纯函数状态机（本地 + DO 共享）
├──────────────────────────┤
│        HTTP + WebSocket   │
├──────────────────────────┤
│   Durable Object (PartyRoom) │
├──────────────────────────┤
│        Cloudflare D1      │  ← 词库 + 卡片持久化
└──────────────────────────┘
```

### 2.2 关键澄清：useLocalGame.ts 与 partyRoomState.js 的关系（2026-07-10 重构后）

**重构完成：两者现在是同一份代码。** `useLocalGame.ts` 已从 ~400 行独立实现重构为 ~230 行薄封装层，所有游戏规则逻辑委托给 `partyRoomState.js` 的共享函数。

```
useLocalGame.ts (前端薄封装)
  imports: partyRoomState.js (11 个共享函数), ./content, ./types
  local-only: switchToPlayer (传手机), resetGame, uid(), pickRandomWordPair/Card

partyRoomState.js (唯一的状态机实现)
  imported by: workers/party-rooms/src/index.js (后端 DO)
  imported by: src/plugins/party-games/useLocalGame.ts (前端本地引擎)
  15 个纯函数，零运行时依赖，浏览器 + Cloudflare Workers 双环境可用
```

这意味着 B1/B2/F8 这类 Bug 的**根因已消除**——不再有两套独立实现，规则变更只需改 `partyRoomState.js` 一处，两端自动同步。

### 2.3 文件职责

**前端** (`src/plugins/party-games/`)：

| 文件 | 职责 | 类型 |
|------|------|------|
| `index.tsx` | 模式切换、房间路由、WS 管理、`effectiveRoom` 抽象 | 编排 |
| `types.ts` | 全部 TS 类型 | 数据 |
| `content.ts` | 前端离线词库（31 组词对 + 35 张卡片） | 数据 |
| `useLocalGame.ts` | 本地引擎 hook，薄封装层（直接 import partyRoomState.js 的 10 个共享函数） | 编排 |
| `components/UndercoverRoundView.tsx` | 谁是卧底 5 阶段视图路由 | 视图 |
| `components/TruthOrDareGameView.tsx` | 真心话大冒险独立视图 | 视图 |
| `components/WaitingRoomView.tsx` | 等待室 | 视图 |
| `components/CreateRoomSheet.tsx` | 创建房间表单 | 视图 |
| `components/JoinRoomSheet.tsx` | 加入房间表单 | 视图 |
| `components/PlayerSeats.tsx` | 玩家网格 + 状态标记 | 视图 |
| `components/DescriptionBoard.tsx` | 发言记录（输入 + 气泡列表） | 视图 |
| `components/PhaseStepper.tsx` | 阶段进度指示 | 视图 |
| `components/GameAvatar.tsx` | 角色头像（hash 分配） | 视图 |

**后端**：

| 文件 | 职责 |
|------|------|
| `functions/_shared/partyRoomState.js` | 纯函数状态机（13 个导出函数），被 DO 引用 |
| `functions/_shared/partyRoomContent.js` | 从 D1 随机选取词对/卡片 |
| `functions/_shared/partyRooms.js` | DO 路由辅助（createCode, getStub, normalize） |
| `functions/api/party/rooms.js` | `POST /api/party/rooms` 创建房间 |
| `functions/api/party/rooms/[code]/join.js` | `POST /api/party/rooms/:code/join` 加入房间 |
| `functions/api/party/rooms/[code]/connect.js` | `GET /api/party/rooms/:code/connect` WS 升级 |
| `workers/party-rooms/src/index.js` | Durable Object（WS + 持久化 + 消息分发） |
| `migrations/004_party_games_content.sql` | D1 建表 + 种子数据 |

---

## 3. 双模式设计

### 3.1 统一抽象

两种模式通过 `effectiveRoom` 向上层视图提供一致接口：

```typescript
const effectiveRoom = gameMode === 'local' ? localGame.room : room
const effectiveIsHost = gameMode === 'local' ? localGame.isHost : Boolean(session?.host)
```

视图组件不感知数据来源——它们只接收 `LocalPartyRoom` 对象和回调函数。

### 3.2 操作路由

所有用户操作通过 `gameMode` 分叉：

```typescript
onDescription: (content) => {
  if (gameMode === 'local') { localGame.submitDescription(content); return }
  socketRef.current?.send(JSON.stringify({ type: 'submit_description', content }))
}

onAdvance: () => {
  if (gameMode === 'local') {
    if (phase === 'word') localGame.advanceToSpeaking()
    else if (phase === 'speaking') localGame.nextSpeaker()
    else if (phase === 'voting') localGame.revealResult()
    else if (phase === 'result') localGame.moveToPunishment()
    return
  }
  if (phase === 'result') { sendRoomEvent({ type: 'move_to_punishment' }); return }
  if (phase === 'voting') { sendRoomEvent({ type: 'finish_vote' }); return }
  sendRoomEvent({ type: 'next_speaker' })
}
```

### 3.3 模式对比

| 维度 | 在线 | 本地 |
|------|------|------|
| 状态存储 | Durable Object (持久化) | useRef (内存) |
| 同步 | WS 广播 + 私发 | JS 共享内存 |
| 创建房间 | `POST /api/party/rooms` | `generateRoomCode()` |
| 加入房间 | HTTP + WS upgrade | `state.room.players.push()` |
| 私密信息 | WS `private_state` (点对点) | `playerSecrets` Map |
| 玩家身份 | 每设备一个连接 | `switchToPlayer()` 切换 |
| 掉线恢复 | WS reconnect + DO 恢复 | 不适用 |
| 描述同步 | WS `submit_description` → 广播 | 共享 `descriptions[]` |

---

## 4. 谁是卧底 — 游戏逻辑

### 4.1 规则

1. N 名玩家中 1 人为卧底（`undercover`），其余为平民（`civilian`）
2. 平民收到词语 A，卧底收到相似但不同的词语 B
3. 每人用一句话描述自己的词语——不能直接说出词语本身
4. 全部发言后投票，得票最多者出局
5. **胜负判定**：
   - 淘汰卧底 → 平民胜（游戏结束）
   - 淘汰平民 → 卧底存活，进入下一轮
   - 剩余人数中卧底 ≥ 平民 → 卧底胜（游戏结束）

### 4.2 阶段流转

```
waiting ──→ word ──→ speaking ──→ voting ──→ result ──→ punishment ──→ waiting (循环或结束)
```

### 4.3 身份分配算法（完整源码 + 审查发现）

```javascript
// partyRoomState.js:87-112 — 完整实现
export const assignUndercoverRound = (room, wordPair) => {
  const activePlayers = room.players.filter((player) => player.status === 'online')
  if (activePlayers.length < 3) {
    const error = new Error('at least 3 online players required')
    error.status = 409
    throw error
  }

  room.phase = 'word'
  room.currentSpeakerIndex = 0
  room.votes = {}
  room.result = null
  room.selectedCard = null
  room.punishmentTargetId = null
  room.roles = {}
  room.words = {}
  room.descriptions = []

  activePlayers.forEach((player, index) => {
    const undercover = index === activePlayers.length - 1   // ← 审查发现 #1
    room.roles[player.id] = undercover ? 'undercover' : 'civilian'
    room.words[player.id] = undercover ? wordPair.undercoverWord : wordPair.civilianWord
  })

  return room
}
```

**审查发现 #1 — 无 shuffle**：卧底始终是 `activePlayers` 数组的最后一个人。`activePlayers` 来自 `room.players.filter(p => p.status === 'online')`，保持原始加入顺序。这意味着**最后加入的在线玩家永远是卧底**。这不是"简单随机"——这是确定性的。如果玩家知道这个规律，每局都能预判谁是卧底。

### 4.4 胜负判定算法（完整源码 + 审查发现）

```javascript
// partyRoomState.js:192-233 — 完整实现
export const revealPartyVotingResult = (room) => {
  if (room.phase !== 'voting') {
    const error = new Error('room is not in voting phase')
    error.status = 409
    throw error
  }

  const counts = {}
  for (const suspectId of Object.values(room.votes)) {
    counts[suspectId] = (counts[suspectId] || 0) + 1
  }
  const [eliminatedId] = Object.entries(counts)
    .sort((left, right) => right[1] - left[1])[0] || []
  if (!eliminatedId) {
    const error = new Error('no votes submitted')
    error.status = 409
    throw error
  }

  const eliminatedRole = room.roles[eliminatedId]
  const remainingRoles = Object.entries(room.roles)
    .filter(([playerId]) => playerId !== eliminatedId)
    .map(([, role]) => role)
  const undercoverRemaining = remainingRoles.filter((role) => role === 'undercover').length
  const civilianRemaining = remainingRoles.filter((role) => role === 'civilian').length

  let winner = 'civilians'
  if (eliminatedRole !== 'undercover' && undercoverRemaining >= civilianRemaining) {
    winner = 'undercover'
  }
  if (eliminatedRole === 'undercover' && undercoverRemaining === 0) {
    winner = 'civilians'
  }

  room.phase = 'result'
  room.result = {
    eliminatedId,
    eliminatedRole,
    winner,
  }
  room.punishmentTargetId = eliminatedId
  return room
}
```

**审查发现 #2 — 胜负逻辑逐分支分析**：

| 条件 | winner 值 | 是否正确 |
|------|-----------|----------|
| 淘汰卧底 + 0 卧底剩余 | `'civilians'` (line 217 默认值, line 221-223 显式设置) | ✅ 正确 |
| 淘汰平民 + 卧底 ≥ 平民 | `'undercover'` (line 218-220) | ✅ 正确 |
| 淘汰平民 + 卧底 < 平民 | `'civilians'` (line 217 默认值, 不被覆盖) | ✅ 正确（应继续玩） |
| 淘汰卧底 + 卧底 > 0（不应发生，但代码不阻止） | `'civilians'` (line 221 条件不满足，保持 line 217) | ⚠️ 逻辑上 winner='civilians' 但卧底还没死光——不过当前版本只设 1 个卧底，所以这个分支不可能触发 |

> **⚠️ 未来风险**：P3 路线图中如果有"多卧底模式"（谁是卧底的常见进阶玩法），这个分支会直接变成活 Bug——淘汰了 1 个卧底但还有卧底存活时，系统会宣告平民胜利。建议现在添加 `// TODO(multi-undercover): 当 undercoverRemaining > 0 时不应判定 winner，应继续下一轮` 注释，并写一个 `test.skip` 占位用例。

**审查发现 #3 — 函数非幂等**：`revealPartyVotingResult` 的第一个操作是 `if (room.phase !== 'voting') throw 409`（line 193-197）。调用后 `room.phase` 被设置为 `'result'`（line 225）。如果被调用第二次（例如自动揭晓 + 手动 `finish_vote` 竞速），第二次调用会**抛出 409 错误**，不会静默成功也不会覆盖结果。这个错误会被 DO 的 `handleSocketMessage` 的 catch 块（`workers/party-rooms/src/index.js:142-144`）捕获，向前端发送 `{ type: 'error', message: 'invalid_event' }`，不影响已写入的 `room.result`。

**审查发现 #8 — 平票无显式规则，由 JS 对象插入顺序静默决定**：

```javascript
// partyRoomState.js:199-203 — 投票统计
const counts = {}
for (const suspectId of Object.values(room.votes)) {
  counts[suspectId] = (counts[suspectId] || 0) + 1
}
const [eliminatedId] = Object.entries(counts)
  .sort((left, right) => right[1] - left[1])[0] || []
```

`.sort()` 对票数相同的两项不做二次排序，排序稳定性取决于 JS 引擎实现（ES2019+ 要求稳定排序，但 `counts` 对象的 key 插入顺序在 sort 之前已经由 `for...of Object.values(room.votes)` 的迭代顺序决定——即 `votes` 对象中 key 的插入顺序，也就是"谁先被投票"）。

**这不是有意设计的平票规则。** 当 4 人游戏中两人各得 2 票时，被淘汰的是 `votes` 对象中先出现的那一个——玩家会看到 "2:2 却有人被淘汰"，且完全没有解释。合理的设计应该是以下之一：
- 平票时本轮无人淘汰（`eliminatedId = null`, `winner = null`，UI 显示"平票，重新发言"）
- 平票时房主决定（增加 `tie_break` 消息类型）
- 至少在前端标出"票数相同，按投票顺序判定"

**当前行为**：静默淘汰先被投票的人，玩家无感知。这是**玩家能直接体验到的公平性问题**。

### 4.5 PartyResult 类型

```typescript
// types.ts
interface PartyResult {
  eliminatedId: string       // 被淘汰玩家 ID
  eliminatedRole: 'civilian' | 'undercover'  // 淘汰者的真实身份
  winner: 'civilians' | 'undercover'         // 本轮胜者
}
```

注意：`winner` 只有两个值。当"淘汰平民 + 卧底仍存活"时，`winner` 为 `'civilians'`——这**不表示游戏结束**，而是表示"本轮未决出最终胜者"。UI 层应根据 `winner` + `eliminatedRole` 组合判断是否结束游戏——当前 UI 没有做这个区分，总是显示"XX胜利"。

---

## 5. 真心话大冒险 — 游戏逻辑

### 5.1 规则

1. 玩家轮流成为"目标玩家"
2. 目标选择：真心话 / 大冒险 / 随机
3. 系统从卡片池抽取对应类型卡片
4. 目标执行任务 → 完成或换题
5. 自动切换到下一玩家，循环

### 5.2 流程

```
waiting ──→ punishment（选卡/展示/完成 循环）
              │
              ├── selectedCard === null → 选卡界面
              └── selectedCard !== null → 展示卡片 → 完成 → 下一玩家
```

真心话大冒险复用 `punishment` 阶段，通过 `selectedCard` 是否为 null 区分"选卡"和"展示"子状态。

### 5.3 玩家轮转

```javascript
// partyRoomState.js:249-255 — completePunishment (truth-or-dare 分支)
room.truthOrDareTurnIndex = (room.truthOrDareTurnIndex + 1) % Math.max(room.players.length, 1)
room.punishmentTargetId = room.players[room.truthOrDareTurnIndex]?.id ?? null
```

房主可以"代抽"——为当前目标玩家选择卡片类型。非当前目标且非房主的玩家看到等待状态。

---

## 6. 状态机完整实现

### 6.1 全部函数清单

以下 `partyRoomState.js` 的 13 个导出函数的完整签名和行为：

| 函数 | 前置条件 | 状态变更 | 错误 |
|------|----------|----------|------|
| `createInitialPartyRoomState({code, nickname, settings})` | 无 | 创建初始 room | — |
| `createPartyPlayer({id, nickname, host, status})` | 无 | 创建 player 对象 | — |
| `joinPartyRoomState(room, nickname)` | phase=waiting ∨ allowLateJoin | push player, id=`guest-{N}` | 409 |
| `reconnectPartyPlayer(room, playerId)` | playerId 存在于 players[] | status='online' | 404 |
| `disconnectPartyPlayer(room, playerId)` | 无 | status='offline' | — |
| `assignUndercoverRound(room, wordPair)` | ≥3 在线玩家 | phase=word, 分配 roles/words, **最后一人为卧底** | 409 |
| `startPartyGame(room, options)` | phase=waiting | 按 mode 分叉 | 409 |
| `advanceSpeaking(room)` | phase∈{word,speaking} | 推进 speakerIndex 或 phase=voting | 409 |
| `submitPartyDescription(room, playerId, playerName, content)` | phase=speaking | push 到 descriptions[], 截断 200 字 | 409 |
| `submitPartyVote(room, voterId, suspectId)` | phase=voting, voter≠suspect, suspect 存在 | 记录 votes[voterId]=suspectId | 409/400/404 |
| `revealPartyVotingResult(room)` | phase=voting, votes 非空 | phase=result, 判定胜负 | 409 |
| `moveToPunishment(room)` | 无 | phase=punishment | — |
| `drawPunishmentCard(room, card)` | 无 | 设置 selectedCard | — |
| `completePunishment(room)` | 无 | 按 mode: 轮转下一人或 phase=waiting | — |
| `getPartyRoomSummary(room)` | 无 | 返回公开摘要（过滤 roles/words/votes） | — |

### 6.2 阶段前置条件矩阵

| 当前阶段 | 允许的操作 |
|----------|-----------|
| `waiting` | start_game, join, leave |
| `word` | advance（→ speaking） |
| `speaking` | submit_description, advance（→ next speaker / voting） |
| `voting` | submit_vote, finish_vote / reveal_result |
| `result` | move_to_punishment |
| `punishment` | draw_punishment, complete_punishment |

### 6.3 submitPartyDescription 完整实现

```javascript
// partyRoomState.js:156-170 — 完整实现
export const submitPartyDescription = (room, playerId, playerName, content) => {
  if (room.phase !== 'speaking') {
    const error = new Error('room is not in speaking phase')
    error.status = 409
    throw error
  }
  if (!room.descriptions) room.descriptions = []
  room.descriptions.push({
    playerId,
    playerName,
    content: String(content || '').slice(0, 200),
    timestamp: Date.now(),
  })
  return room
}
```

**审查发现 #4 — 不校验 currentSpeakerId**：该函数只检查 `phase === 'speaking'`，不检查 `playerId === currentSpeakerId`。这意味着在发言阶段**任何人都能提交描述**，不仅仅是当前发言人。这是有意设计（允许所有玩家同时评论），但文档之前未说明。

---

## 7. 数据模型

### 7.1 核心类型

```typescript
type PartyGameMode = 'undercover' | 'truth-or-dare'
type UndercoverPhase = 'waiting' | 'word' | 'speaking' | 'voting' | 'result' | 'punishment'

interface PartyPlayer {
  id: string            // 在线: 'host' / 'guest-N'; 本地: 'local-{counter}-{random}'
  nickname: string      // 1-12 字符
  host: boolean
  status: 'online' | 'offline'
}

interface PartyRoomSettings {
  mode: PartyGameMode
  maxPlayers: number          // 3-12
  allowLateJoin: boolean
  wordCategory: string        // D1 词库筛选
  punishmentMode: 'off' | 'truth' | 'dare' | 'random'
}

interface UndercoverWordPair {
  id: string
  civilianWord: string
  undercoverWord: string
  category: string
  difficulty: 'easy' | 'normal'
}

interface TruthOrDareCard {
  id: string
  type: 'truth' | 'dare'
  content: string
  category: string
  intensity: 'soft' | 'normal' | 'spicy'
}

interface PartyResult {
  eliminatedId: string
  eliminatedRole: 'civilian' | 'undercover'
  winner: 'civilians' | 'undercover'
}

interface DescriptionEntry {
  playerId: string
  playerName: string
  content: string        // 最大 200 字符（服务端截断）
  timestamp: number
}

interface LocalPartyRoom {
  code: string
  settings: PartyRoomSettings
  players: PartyPlayer[]
  phase: UndercoverPhase
  currentSpeakerIndex: number
  currentSpeakerId?: string | null
  selectedWordPair: UndercoverWordPair
  selectedCard: TruthOrDareCard | null
  privateWord?: string | null       // 仅当前 player 可见
  privateRole?: 'civilian' | 'undercover' | null
  result?: PartyResult | null
  punishmentTargetId?: string | null
  descriptions?: DescriptionEntry[]
}
```

### 7.2 房间摘要（公开字段）

`getPartyRoomSummary` 输出的字段：
```javascript
{
  code, settings, players, phase, capacity,
  currentSpeakerId,      // 仅 speaking 阶段非 null
  result,                // 仅 result 阶段非 null
  punishmentTargetId,    // 仅 punishment 阶段非 null
  selectedCard,          // 仅 punishment 阶段非 null
  descriptions           // 发言记录（公开）
}
```

**不输出**：`roles`, `words`, `votes`, `currentSpeakerIndex`——这些通过 `private_state` 点对点发送。

### 7.3 数据库表

**party_undercover_word_pairs**：id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at

**party_truth_or_dare_cards**：id, type, content, category, intensity, enabled, created_at, updated_at

**party_game_settings**：key, value_json, updated_at——存储配置版本号等元数据

---

## 8. 通信协议

### 8.1 HTTP 端点

| 方法 | 路径 | 请求体 | 响应中的 session |
|------|------|--------|-----------------|
| POST | `/api/party/rooms` | `{ nickname, settings }` | `{ playerId: 'host', host: true }` |
| POST | `/api/party/rooms/:code/join` | `{ nickname }` | `{ playerId: 'guest-N', host: false }` |
| GET | `/api/party/rooms/:code` | — | 不返回 session（仅房间摘要） |
| GET | `/api/party/rooms/:code/connect` | — | 101 WebSocket upgrade |

### 8.2 WebSocket 消息（客户端 → 服务端）

| type | 发起者 | payload | 效果 |
|------|--------|---------|------|
| `start_game` | 房主（host check） | — | 分叉 mode 开始游戏 |
| `next_speaker` | 房主 | — | 推进发言或进入投票 |
| `submit_description` | 任意（speaking 阶段） | `{ content }` | 追加发言记录并广播 |
| `submit_vote` | 任意（voting 阶段） | `{ suspectId }` | 记录投票，全员投完自动揭晓 |
| `finish_vote` | 房主 | — | 手动触发揭晓（若 phase 已变为 result 则抛 409） |
| `draw_punishment` | 任意 | `{ choice }` | 抽取卡片（异步查 D1） |
| `complete_punishment` | 任意 | — | 完成惩罚 |
| `move_to_punishment` | 房主 | — | 进入惩罚阶段 |

### 8.3 WebSocket 消息（服务端 → 客户端）

| type | 目标 | payload | 触发时机 |
|------|------|---------|----------|
| `room_state` | 广播 | `{ type, room }` | 任何状态变更后 |
| `private_state` | 单播 | `{ type, privateWord, role, playerId }` | 连接建立 + 状态变更后 |
| `error` | 单播 | `{ type, message }` | 消息解析失败/操作被状态机拒绝时 |

### 8.4 描述同步完整链路

```
客户端 A → WS.send({ type: 'submit_description', content })
  → DO.handleSocketMessage:
    submitPartyDescription(room, playerId, player.nickname, content)
      → 验证 phase === 'speaking'
      → push { playerId, playerName, content: content.slice(0,200), timestamp }
    → persistRoom()
    → broadcastState()
      → 客户端 B 收到 room_state (含 room.descriptions)
        → toLocalRoom() 映射 descriptions
          → UndercoverRoundView 实时渲染
```

### 8.5 私密信息保护

- `private_state` 通过 `sendPrivateState(socket, playerId)` 逐连接发送——使用该连接建立时闭包捕获的 `playerId` 查询 `room.words[id]` 和 `room.roles[id]`
- `room_state` 广播中不含 `roles`、`words`、`votes`
- HTTP API 的摘要同样过滤私密字段

---

## 9. 鉴权与会话模型

### 9.1 当前实现（2026-07-10 F2b 修复后）

**connectToken 模型**：join/创建房间时，DO 为每个玩家生成一次性 `connectToken`（`crypto.randomUUID()`），与 playerId 绑定存储在 `room.connectTokens[playerId]`。WS 连接时必须同时携带 `playerId` 和 `connectToken`，DO 侧验证匹配后才接受连接。

**HTTP 创建房间**：
```
POST /api/party/rooms
Body: { nickname, settings }
→ DO 创建 room，host playerId='host'
→ 生成 connectToken = crypto.randomUUID()
→ issueConnectToken(room, 'host', connectToken)
→ 返回 { session: { playerId: 'host', host: true, connectToken } }
```

**HTTP 加入房间**：
```
POST /api/party/rooms/:code/join
Body: { nickname }
→ DO 分配 playerId='guest-{N}'
→ 生成 connectToken = crypto.randomUUID()
→ issueConnectToken(room, playerId, connectToken)
→ 返回 { session: { playerId, host: false, connectToken } }
```

**WebSocket 连接** (`workers/party-rooms/src/index.js`)：
```javascript
async connectRoom(request) {
  const url = new URL(request.url)
  const playerId = url.searchParams.get('playerId') || ''
  const connectToken = url.searchParams.get('connectToken') || ''

  // 1. Validate connectToken before accepting
  validateConnectToken(this.room, playerId, connectToken)   // ← throws 401 on mismatch

  // 2. Mark player online
  reconnectPartyPlayer(this.room, playerId)

  // 3. Close old socket for same playerId (F2a)
  for (const [existingSocket, meta] of this.sockets.entries()) {
    if (meta.playerId === playerId) {
      existingSocket.send(JSON.stringify({ type: 'kicked', reason: 'reconnected_elsewhere' }))
      existingSocket.close()
      this.sockets.delete(existingSocket)
    }
  }

  // 4. Accept new WebSocket
  this.sockets.set(server, { playerId })
}
```

### 9.2 安全分析（F2b 修复后）

**已解决的威胁**：
1. ~~猜 playerId + 无 token 连接~~ → 需要同时知道 roomCode + playerId + connectToken（UUID v4，2^122 空间）
2. ~~并行连接窃听~~ → 新连接会关闭旧连接并发送 kicked 帧（F2a）

**仍存在的威胁**：
- roomCode 仍为 4 位（1.2M 空间可枚举），但 connectToken 为 UUID v4，即使 roomCode 被猜到，无 token 也无法连接
- 合法用户的 connectToken 存储在浏览器内存中，若设备被物理访问或 XSS，token 泄露——但这是所有 token-based auth 的共性限制，不是本设计独有的弱点
- roomCode 可被暴力枚举以尝试加入（非连接）——HTTP join 的防御仍然是重名校验和满员限制

**结论**：connectToken 模型在"朋友间线下聚会"的信任假设下提供了充足的保护——攻击者需要同时知道 roomCode（共享）+ playerId（可猜）+ connectToken（不可猜），才能顶替身份。roomCode 枚举无法绕过 token 校验。

### 9.3 session 字段说明

"session" 不是传统意义上的 authenticated session。它只是一个从后端返回的 JSON 对象：
```json
{ "playerId": "host", "host": true }
```
前端把它存在 React state 中，后续 WS 连接时把 `playerId` 放入 query string。没有过期时间、没有签名、没有刷新机制。

---

## 10. 内容系统

### 10.1 双层内容策略

| 层 | 位置 | 用途 | 更新方式 |
|----|------|------|----------|
| 前端内置 | `content.ts` | 本地模式离线可用 | 重新部署 |
| D1 数据库 | Cloudflare D1 | 在线模式权威数据源 | API 实时（管理后台） |

### 10.2 内容量

| 类型 | 数量 | 分类 |
|------|------|------|
| 卧底词对 | 31 组 | 食物(7)、饮品(4)、地点(6)、物品(4)、交通(3)、职业(4)、动物(3) |
| 真心话卡片 | 18 张 | 轻松(8)、社交(6)、刺激(4) |
| 大冒险卡片 | 17 张 | 互动(6)、表演(6)、搞怪(5) |

### 10.3 内容管理后台

管理后台通过 `/api/party/content/undercover` 和 `/api/party/content/truth-or-dare` 端点对 D1 进行 CRUD。鉴权重用现有的管理员 bearer token 模式（与音乐管理后台相同）。所有卡片通过 `enabled` 字段软删除。`spicy` 级别内容无独立审核流程——任何管理员可直接添加。

### 10.4 房间码生成

```javascript
// partyRooms.js:44-49
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'  // 33 chars, 排除 0/O/1/I
const createRoomCode = () => {
  let code = ''
  for (let index = 0; index < 4; index += 1) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)]
  }
  return code
}
```

---

## 11. 本地引擎

### 11.1 架构说明（2026-07-10 重构后）

`useLocalGame.ts` 已重构为薄封装层，**直接 import 并调用** `partyRoomState.js` 的 11 个共享函数。游戏规则逻辑不再有本地独立实现。

```typescript
// useLocalGame.ts imports — 现在直接引用共享状态机
import {
  createInitialPartyRoomState, joinPartyRoomState, startPartyGame,
  advanceSpeaking, submitPartyDescription, submitPartyVote,
  revealPartyVotingResult, moveToPunishment, drawPunishmentCard,
  completePunishment as sharedCompletePunishment,
} from '../../../functions/_shared/partyRoomState.js'
```

内部状态简化：`stateRef` 只存储 `{ room: LocalPartyRoom }`，`playerSecrets`/`votes` Map 已移除——数据直接存在 `room.roles`/`room.words`/`room.votes` 上。

### 11.2 操作函数清单（重构后）

| 函数 | 实现方式 | 同步状态 |
|------|---------|----------|
| `createLocalRoom` | 调用 `createInitialPartyRoomState`，覆盖 playerId 为本地格式 | ✅ 复用共享函数 |
| `joinLocalRoom` | 调用 `joinPartyRoomState`，覆盖 playerId 为本地格式 | ✅ 复用共享函数 |
| `switchToPlayer` | 本地专属：从 `room.roles`/`room.words` 投影到 `room.privateRole`/`room.privateWord` | — |
| `startLocalGame` | 调用 `startPartyGame` | ✅ 复用共享函数 |
| `advanceToSpeaking` | 调用 `advanceSpeaking` | ✅ 复用共享函数 |
| `nextSpeaker` | 调用 `advanceSpeaking`（同一函数处理两种转换） | ✅ 复用共享函数 |
| `submitDescription` | 调用 `submitPartyDescription` | ✅ 复用共享函数 |
| `submitVote` | 调用 `submitPartyVote`（自投/目标存在校验现在生效） | ✅ 复用共享函数 |
| `revealResult` | 调用 `revealPartyVotingResult`（平票/幂等本次生效） | ✅ 复用共享函数 |
| `moveToPunishment` | 调用 `moveToPunishment`（平票跳过逻辑本次生效） | ✅ 复用共享函数 |
| `drawPunishment` | 调用 `drawPunishmentCard` | ✅ 复用共享函数 |
| `completePunishment` | 调用 `sharedCompletePunishment` + truth-or-dare 自动切人 | ✅ 复用共享函数 |
| `resetGame` | 本地专属：清空所有 state | — |

### 11.3 传手机机制

`switchToPlayer(playerId)` 是本地模式的核心操作：
1. 更新 `currentPlayerId`
2. 从 `playerSecrets.get(playerId)` 读取该玩家的私密信息
3. 注入 `room.privateWord` 和 `room.privateRole`
4. UI 随之更新，当前玩家看到自己的视角

`LocalModeBar` 在游戏全程显示所有玩家头像横排按钮，当前玩家高亮，一键切换。

---

## 12. 并发模型

### 12.1 DO 单线程模型

Cloudflare Durable Object 保证**每个实例同一时刻只处理一个请求**。但关键点是：`async` 函数中的 `await` 会释放执行权。

### 12.2 有 await 的消息处理函数

```javascript
// workers/party-rooms/src/index.js:139-146
server.addEventListener('message', async (event) => {
  try {
    const payload = JSON.parse(String(event.data || '{}'))
    await this.handleSocketMessage(playerId, payload)  // ← async
  } catch {
    server.send(JSON.stringify({ type: 'error', message: 'invalid_event' }))
  }
})
```

`handleSocketMessage` 中的 await 点：

| 消息类型 | await 位置 | 风险窗口 |
|----------|-----------|----------|
| `start_game` | `pickUndercoverWordPair` (查 D1) | D1 查询期间，其他消息可能被处理 |
| `draw_punishment` | `pickTruthOrDareCard` (查 D1) | 同上 |
| `submit_vote` | 无 await | **原子执行** |
| `submit_description` | 无 await | **原子执行** |
| `next_speaker` | 无 await | **原子执行** |
| `complete_punishment` | 无 await | **原子执行** |

### 12.3 竞态场景分析

**场景：全员投票最后一张 + finish_vote 同时到达**

```
时间线：
  T1: submit_vote (第 N 票) 到达 → 处理中（无 await，原子执行）
      → submitPartyVote 写入 votes[]
      → 检查 votes.length >= activeCount → 触发 revealPartyVotingResult
      → room.phase = 'result'
      → persistRoom() (await)
  T2: finish_vote 到达 → 处理中
      → revealPartyVotingResult(room)
      → if (room.phase !== 'voting') throw 409   ← 此时 phase 已经是 'result'
      → catch 块发送 { type: 'error', message: 'invalid_event' }
```

**结论**：`finish_vote` 会被拒绝并返回错误，但 `room.result` 和 `room.phase` 已由 T1 正确设置。不会发生数据覆盖或状态损坏。唯一的副作用是房主客户端收到一条 error 消息。

**场景：start_game 期间其他消息到达**

```
  T1: start_game 到达 → 开始处理
      → startPartyGame(room) → phase='word', 分配 roles/words
      → await pickUndercoverWordPair (若 wordPair 未预加载)  ← D1 await
  T2: (在 D1 await 期间) submit_description 到达
      → submitPartyDescription → 检查 phase === 'speaking'
      → phase 是 'word' → throw 409 → 客户端收到 error
```

**结论**：phase 检查提供了保护——在 start_game 的 D1 await 窗口期间到达的消息会被状态机拒绝。

---

## 13. 测试覆盖

### 13.1 状态机测试（4 个用例）

文件：`tests/party-room-state.test.mjs`

| # | 测试标题 | 覆盖路径 |
|---|---------|----------|
| 1 | `starts undercover game with private words and produces civilian win after voting out undercover` | create → join×2 → start → 手动设 phase=voting → 全员投卧底 → reveal → 断言 winner=civilians |
| 2 | `standalone truth or dare rotates punishment target after completion` | create(TOD) → join×2 → start → 断言 phase=punishment + target=host → draw → complete → 断言 target=guest-1 |
| 3 | `undercover punishment flow returns room to waiting state` | create → join×2 → start → 手动设 phase=result + target → moveToPunishment → draw → complete → 断言 phase=waiting, roles={} |
| 4 | `player reconnect toggles offline player back online` | create → join → disconnect → 断言 offline → reconnect → 断言 online |

### 13.2 API 测试（4 个用例）

文件：`tests/party-room-api.test.mjs`

| # | 测试标题 | 覆盖路径 |
|---|---------|----------|
| 1 | `creates a room and returns a public summary` | createRoom → 断言 roomCode 格式、phase、capacity、session |
| 2 | `joins an existing room and reads updated summary` | create → join → 断言 capacity=2, session={guest-1,host:false} → getSummary |
| 3 | `rejects invalid room payloads and full rooms` | 昵称空 → 断言 reject；create(3人) → join×2 → join(第4人) → 断言满员 reject |
| 4 | `rejects duplicate nicknames and late join disabled after start` | create(allowLateJoin=false) → join 同昵称 → 断言 reject；手动设 phase=word → join → 断言 late join disabled |

### 13.3 缺失的测试覆盖

| 缺失场景 | 风险级别 | 说明 |
|----------|----------|------|
| "淘汰平民 + 卧底存活" 分支 | 🔴 高 | 测试 1 只覆盖了卧底被投出的分支；淘汰平民后 winner 为 civilians 但游戏未结束的情况从未被断言 |
| **卧底分配随机性** | **🔴 高** | 无统计分布测试——当前实现是确定性的（最后一人总是卧底）。此测试应与 F1 修复绑在同一个 PR 中，作为**验收条件**：不加 shuffle 直接合入会被它抓住，加了 shuffle 但逻辑没改对（比如仍用 `index === length-1` 判断）也会被它抓住。常见翻车点：shuffle 了数组但判断逻辑留在原地，看起来像修了实际没修 |
| `revealPartyVotingResult` 重复调用 | 🟡 中 | 无测试验证 409 抛出的行为 |
| `submitPartyDescription` | 🟡 中 | 完全无测试 |
| 在线描述同步（端到端） | 🟡 中 | 无跨客户端测试 |
| 投票自动揭晓 + finish_vote 竞速 | 🟡 中 | 无并发场景测试 |
| 平票场景 | 🟡 中 | 无测试验证 2:2 平票时的淘汰结果（F8 相关） |
| WS 断线重连后的 private_state 重新发送 | 🟢 低 | `broadcastState` 逻辑中已处理（line 75-77），但未测试 |

---

## 14. 当前状态与已知缺口

### 14.1 Bug 修复状态

| 编号 | 问题 | 状态 |
|------|------|------|
| B1 | `startLocalGame` 未按模式分叉 | ✅ 已修复 |
| B2 | 真心话大冒险人数下限 3→2 | ✅ 已修复 |
| B3 | 缺少独立 TruthOrDareGameView | ✅ 已实现 |
| B6 | 在线描述不同步 | ✅ 已修复（2026-07-10） |
| B4 | PhaseStepper 硬编码卧底步骤 | ✅ 已适配双模式 |

### 14.2 本次审查新发现的问题

| # | 发现 | 严重度 | 位置 |
|---|------|--------|------|
| **F1** | `assignUndercoverRound` 无 shuffle——最后加入的在线玩家**总是**卧底 | 🔴 高 | `partyRoomState.js:105-106` |
| **F2** | WS 鉴权根因：基于明文、可预测的 playerId，无 token/session 验证 | ✅ 已修复（2026-07-10）——connectToken (UUID v4) 方案 | `workers/party-rooms/src/index.js:126` |
| **F2a** | 多连接静默窃听：同一 playerId 可开并行 WS 连接同时接收 private_state | ✅ 已修复（新连接关旧连接 + kicked 帧） | `workers/party-rooms/src/index.js:133-138` |
| **F2b** | 无 token 验证：攻击者可顶替合法用户（现需同时知道 roomCode + playerId + UUID token） | ✅ 已修复——`issueConnectToken` / `validateConnectToken` | `partyRoomState.js` + DO |
| **F3** | `revealPartyVotingResult` 非幂等——重复调用抛 409 | 🟡 中 | `partyRoomState.js:193` |
| **F4** | `useLocalGame.ts` 与 `partyRoomState.js` 是独立实现，规则变更需双端同步 | ✅ 已解决（根因消除，2026-07-10 重构） | 架构层面 |
| **F5** | `submitPartyDescription` 不校验是否为当前 speaker——发言阶段任何人都能提交 | 🟢 低（有意设计） | `partyRoomState.js:156-170` |
| **F6** | `PartyResult.winner` 在"淘汰平民+卧底存活"时为 `'civilians'`，UI 可能误显示"平民胜利" | 🟡 中 | 类型设计 + UI 层 |
| **F7** | 测试未覆盖"淘汰平民+卧底存活"、并发竞速、描述同步场景 | 🟡 中 | 测试文件 |
| **F8** | 平票无显式规则——由 JS 对象 key 插入顺序静默决定，玩家看到 "2:2 却有人被淘汰" 且无解释 | 🟡 中 | `partyRoomState.js:199-203` |
| **F9** | 多卧底场景的死代码是未来的活 Bug——若日后加 2 卧底模式，淘汰 1 个卧底后系统宣告平民胜利 | 🟢 低（远期风险） | `partyRoomState.js:217-223` |
| **F10** | 卧底分配随机性测试缺失（F1 修复的验收条件），若无此测试，F1 的 shuffle 可能"看起来修了但没真修" | 🔴 高（应与 F1 同 PR） | 测试文件 |

### 14.3 功能缺口

| 缺口 | 优先级 | 说明 |
|------|--------|------|
| 卧底随机分配 | P0 | F1——当前确定性地选最后一人，必须加 shuffle |
| 发言/投票倒计时 | P1 | 零实现，依赖房主手动推进 |
| 游戏结束与重玩 | P1 | 无"再来一局"按钮 |
| 多轮次显式化 | P1 | 无轮次计数器、历史记录 |
| 音效/振动 | P2 | 零实现 |
| 观战模式 | P2 | 被淘汰者无法旁观 |
| 游戏统计 | P3 | 无胜率、MVP |
| 自定义内容/UGC | P3 | 无入口 |
| 死代码清理 | P3 | `TruthOrDarePanel.tsx` 无引用 |

### 14.4 已完成的修复（本轮）

| 发现 | 修复内容 | 文件 |
|------|----------|------|
| **F1 + F10** | Fisher-Yates shuffle + 卡方检验（χ², α=0.01, df=3, 临界值 11.34） | `partyRoomState.js`, `party-room-state.test.mjs` |
| **F2a** | 同一 playerId 新连接时关闭旧 socket + kicked 帧 | `workers/party-rooms/src/index.js` |
| **F2b** | connectToken（UUID v4）鉴权，WS 连接时校验 token+playerId 绑定 | `partyRoomState.js` + DO + 前端 |
| **F3** | `revealPartyVotingResult` 幂等化 | `partyRoomState.js` |
| **F4** | 双引擎合并为共享状态机（根因消除） | `useLocalGame.ts` → import partyRoomState.js |
| **F6** | `PartyResult.gameEnded` 显式区分"本轮投票结算"与"游戏最终终结" | `partyRoomState.js`, `types.ts`, `UndercoverRoundView.tsx` |
| **F8** | 平票显式规则 + `completePunishment` 区分 gameEnded=false→speaking / true→waiting | `partyRoomState.js`, `types.ts` |
| **F9** | TODO 注释 + `test.skip` 占位 | `partyRoomState.js`, `party-room-state.test.mjs` |
| **死代码清理** | 删除 `TruthOrDarePanel.tsx`（无引用） | `src/plugins/party-games/components/` |

### 14.5 仍待修复

| 发现 | 说明 |
|------|------|
| **F2b** (原 F2 根因) | WS 鉴权无 token——攻击者可通过猜 roomCode+playerId 顶替合法用户 | ✅ 已修复（2026-07-10）——join/创建返回 `connectToken`（crypto.randomUUID），WS connect 时校验 token+playerId 绑定 |
| **F6** | `PartyResult.winner='civilians'` 在"淘汰平民+卧底存活"时 UI 误显示胜负 |
| **F10 容差** | 当前 ±60（4.4σ）偏宽，建议收紧到 ±41（3σ）或换卡方检验，以抓取 Fisher-Yates 轻微实现偏差 |
