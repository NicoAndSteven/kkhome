# B6 Fix: Online Description Sync

> Date: 2026-07-10
> Status: implementing

## Problem

In online Undercover mode, when a player submits a description during the `speaking` phase, it is stored only in the local component state (`onlineDescriptions`). Other connected players never see it. The `DescriptionBoard` is effectively single-player in online mode.

### Root cause trace

| Layer | File | What's missing |
|-------|------|----------------|
| Frontend | `index.tsx:301-304` | `onDescription` only calls `setOnlineDescriptions`, never sends WebSocket message |
| WebSocket | `index.tsx:216-229` | `sendRoomEvent` has no `submit_description` branch |
| DO Handler | `workers/party-rooms/src/index.js:160-217` | `handleSocketMessage` has no `submit_description` case |
| State Machine | `functions/_shared/partyRoomState.js` | No `submitPartyDescription` function; `descriptions` field not initialized or exported in summary |
| Summary | `index.tsx:55-64` | `PartyRoomSummary` and `toLocalRoom` don't include `descriptions` |

## Design

### Data flow (fixed)

```
Player submits description
  → index.tsx onDescription
    → if online && WS open: sendRoomEvent({ type: 'submit_description', content })
    → if local: localGame.submitDescription(content)  [already works]
  → DO handleSocketMessage receives 'submit_description'
    → submitPartyDescription(room, playerId, playerName, content)  [state machine]
    → persistRoom()
    → broadcastState()  → includes descriptions in room_state
  → All clients receive room_state with room.descriptions
    → toLocalRoom maps descriptions onto LocalPartyRoom
    → UndercoverRoundView reads room.descriptions
```

### Changes (4 files)

#### 1. `functions/_shared/partyRoomState.js`

- `createInitialPartyRoomState`: add `descriptions: []`
- New function: `submitPartyDescription(room, playerId, playerName, content)`
  - Validates phase is `speaking`
  - Appends `{ playerId, playerName, content, timestamp: Date.now() }` to `room.descriptions`
- `assignUndercoverRound`: clear `room.descriptions = []` (new round)
- `advanceSpeaking`: when transitioning word→speaking, clear `room.descriptions = []`
- `getPartyRoomSummary`: include `descriptions: room.descriptions ?? []`

#### 2. `workers/party-rooms/src/index.js`

- Import `submitPartyDescription`
- `handleSocketMessage`: add case for `submit_description`
  ```js
  if (payload.type === 'submit_description') {
    submitPartyDescription(this.room, playerId, player.nickname, String(payload.content || ''))
    await this.persistRoom()
    this.broadcastState()
    return
  }
  ```

#### 3. `src/plugins/party-games/index.tsx`

- `PartyRoomSummary` interface: add `descriptions?: DescriptionEntry[]`
- `toLocalRoom`: map `descriptions: summary.descriptions ?? []`
- `onDescription` callback: send `submit_description` via WebSocket when online
  ```tsx
  onDescription={(content) => {
    if (gameMode === 'local') { localGame.submitDescription(content); return }
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'submit_description', content }))
    }
  }}
  ```
- Remove `onlineDescriptions` state and `setOnlineDescriptions` calls
- Simplify `descs` to: `const descs = effectiveRoom?.descriptions ?? []`
- `leaveOnlineRoom`: remove `setOnlineDescriptions([])`

#### 4. No changes needed

- `types.ts`: `DescriptionEntry` and `LocalPartyRoom.descriptions` already exist
- `UndercoverRoundView.tsx`: already consumes `descriptions` prop
- `DescriptionBoard.tsx`: no changes

## Edge cases

| Case | Handling |
|------|----------|
| WS disconnected when submitting | Description lost (acceptable — player retries after reconnect) |
| Non-speaking phase | State machine validates and throws 409 |
| Empty content | State machine stores as-is; UI already handles empty string |
| Same player submits twice | Allowed — both entries stored (player may refine description) |
| Host skips speaker before description | Description remains in `descriptions[]`, visible in voting phase |
| New round starts | `assignUndercoverRound` clears descriptions |

## Verification

- [ ] Two browser contexts join same online room
- [ ] Player A submits description → Player B sees it appear in DescriptionBoard
- [ ] Multiple descriptions from different players all visible
- [ ] Descriptions persist into voting phase as review
- [ ] New round clears old descriptions
- [ ] Local mode still works (unchanged path)
