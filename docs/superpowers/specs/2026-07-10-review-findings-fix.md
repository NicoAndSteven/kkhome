# Review Findings Fix — F1, F2, F3, F8, F9, F10

> Date: 2026-07-10
> Status: implementing
> Scope: 4 files changed

## Fixes included

| ID | Severity | Issue | Fix Summary |
|----|----------|-------|-------------|
| F1 | 🔴 | `assignUndercoverRound` no shuffle — last player always undercover | Fisher-Yates shuffle |
| F10 | 🔴 | No distribution test for F1 fix | Add statistical test, same PR |
| F8 | 🟡 | Tie-breaking implicit, JS key insertion order | "无人淘汰，本轮平票" |
| F2 | 🔴 | Same playerId can have parallel WS connections, silent eavesdropping | Close old socket on reconnect |
| F3 | 🟡 | `revealPartyVotingResult` throws 409 on double-call | Guard: if phase≠voting return room unchanged |
| F9 | 🟢 | Multi-undercover dead code is future live bug | TODO comment + test.skip |

## Files changed

### 1. `functions/_shared/partyRoomState.js`

**F1 — Fisher-Yates shuffle in `assignUndercoverRound`**

```diff
- activePlayers.forEach((player, index) => {
-   const undercover = index === activePlayers.length - 1

+ // Fisher-Yates shuffle
+ for (let i = activePlayers.length - 1; i > 0; i--) {
+   const j = Math.floor(Math.random() * (i + 1));
+   [activePlayers[i], activePlayers[j]] = [activePlayers[j], activePlayers[i]]
+ }
+ const undercoverIndex = activePlayers.length - 1
+ activePlayers.forEach((player, index) => {
+   const undercover = index === undercoverIndex
```

**F8 — Explicit tie-breaking in `revealPartyVotingResult`**

**Design decision (2026-07-10)**: On a tie vote, no player is eliminated and the round restarts
directly (phase → waiting, all roles/words/votes cleared). This is implemented via two points:
- `revealPartyVotingResult`: returns `{ eliminatedId: null, eliminatedRole: null, winner: null }` +
  sets `punishmentTargetId = null`
- `moveToPunishment`: detects `result.eliminatedId === null` → skips punishment, resets to waiting
- UI (UndercoverRoundView): shows "🤝 平票！票数相同，无人被淘汰，下一轮重新发言" with grey
  shell, advance button reads "🔄 票数相同，重新开始"

**Rationale**: Simplest fair outcome — no one is punished for a split vote, the group gets
another chance to debate and re-vote. This is the most common house rule for social deduction
games. An alternative considered was "host decides tie-breaker", but that adds a new message
type and slows the flow. If needed, a `tie_break` message type can be added later without
changing the data model.

After collecting `counts` and before sorting:
```diff
+ // Detect tie: if top two have equal votes, no elimination
+ const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
+ if (sorted.length >= 2 && sorted[0][1] === sorted[1][1]) {
+   room.phase = 'result'
+   room.result = { eliminatedId: null, eliminatedRole: null, winner: null }
+   return room
+ }
  const [eliminatedId] = sorted[0] || []
```

`PartyResult` type needs to allow `null` for `eliminatedRole` and `winner`. Update type definition in `types.ts`.

**F3 — Make `revealPartyVotingResult` idempotent**

```diff
  if (room.phase !== 'voting') {
-   const error = new Error('room is not in voting phase')
-   error.status = 409
-   throw error
+   // Already revealed — idempotent, return current state
+   return room
  }
```

**F9 — Multi-undercover TODO**

Add comment at the winner default line:
```javascript
let winner = 'civilians'
// TODO(multi-undercover): when undercoverRemaining > 0 after eliminating one undercover,
// winner should remain null (game continues next round). Currently unreachable with 1 undercover.
```

### 2. `workers/party-rooms/src/index.js`

**F2 — Close old socket on same-playerId reconnect**

In `connectRoom`, before `this.sockets.set(server, { playerId })`:
```diff
+ // Close any existing connection for the same playerId to prevent parallel eavesdropping
+ for (const [existingSocket, meta] of this.sockets.entries()) {
+   if (meta.playerId === playerId) {
+     try { existingSocket.close() } catch { /* already closed */ }
+     this.sockets.delete(existingSocket)
+   }
+ }
  this.sockets.set(server, { playerId })
```

### 3. `src/plugins/party-games/types.ts`

**F8 — Allow null in PartyResult**

```diff
  interface PartyResult {
-   eliminatedId: string
-   eliminatedRole: 'civilian' | 'undercover'
-   winner: 'civilians' | 'undercover'
+   eliminatedId: string | null
+   eliminatedRole: 'civilian' | 'undercover' | null
+   winner: 'civilians' | 'undercover' | null
  }
```

### 4. `tests/party-room-state.test.mjs`

**F10 — Distribution test (F1 acceptance criteria)**
```javascript
test('assignUndercoverRound distributes undercover role uniformly', () => {
  // Run 1000 rounds with 4 players, verify each position is undercover ~250±50 times
  const counts = { 'host': 0, 'guest-1': 0, 'guest-2': 0, 'guest-3': 0 }
  for (let i = 0; i < 1000; i++) {
    const room = createInitialPartyRoomState({...})
    joinPartyRoomState(room, 'A'); joinPartyRoomState(room, 'B'); joinPartyRoomState(room, 'C')
    assignUndercoverRound(room, wordPair)
    const ucId = Object.entries(room.roles).find(([, r]) => r === 'undercover')?.[0]
    counts[ucId]++
  }
  for (const [id, count] of Object.entries(counts)) {
    assert.ok(count >= 200 && count <= 300, `${id}: ${count}/1000 not in [200,300]`)
  }
})
```

**F8 — Tie-breaking test**
```javascript
test('revealPartyVotingResult returns null result on tie', () => {
  // 2:2 tie → eliminatedId=null, winner=null
  const room = createInitialPartyRoomState({...})
  // ... setup 4 players, undercover round, enter voting ...
  submitPartyVote(room, 'host', 'guest-1')
  submitPartyVote(room, 'guest-1', 'guest-2')
  submitPartyVote(room, 'guest-2', 'guest-1')
  submitPartyVote(room, 'guest-3', 'guest-2')
  revealPartyVotingResult(room)
  assert.equal(room.result.eliminatedId, null)
  assert.equal(room.result.winner, null)
})
```

**F3 — Double-reveal idempotence test**
```javascript
test('revealPartyVotingResult is idempotent on double call', () => {
  // ... setup + reveal once ...
  const first = { ...room.result }
  revealPartyVotingResult(room)  // second call — should not throw
  assert.deepEqual(room.result, first)
})
```

**F9 — Multi-undercover placeholder**
```javascript
test.skip('multi-undercover: eliminating one undercover does not end game', () => {
  // TODO: enable when multi-undercover mode is implemented
})
```

## Edge cases verified

| Case | Handling |
|------|----------|
| F1: shuffle with 3 players | All 3 positions reachable |
| F1: shuffle with 12 players | All 12 positions reachable |
| F8: 3:1 vote (no tie) | Normal elimination proceeds |
| F8: 2:2 tie | eliminatedId=null, winner=null |
| F8: 1:1:1:1 four-way tie | eliminatedId=null, winner=null |
| F8: all votes for same person | Normal elimination |
| F2: first connection for playerId | No old socket to close, no-op |
| F2: second connection for same playerId | Old socket closed, new one connects |
| F3: finish_vote after auto-reveal | Returns current room, no error |
| UI null result: PartyResult fields null | UI shows "平票，无人被淘汰" instead of winner |
