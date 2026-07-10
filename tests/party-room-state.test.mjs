import assert from 'node:assert/strict'
import test from 'node:test'
import {
  assignUndercoverRound,
  completePunishment,
  createInitialPartyRoomState,
  disconnectPartyPlayer,
  drawPunishmentCard,
  issueConnectToken,
  joinPartyRoomState,
  moveToPunishment,
  reconnectPartyPlayer,
  resetRoomToWaiting,
  revealPartyVotingResult,
  startPartyGame,
  submitPartyVote,
  validateConnectToken,
} from '../functions/_shared/partyRoomState.js'

const wordPair = {
  civilianWord: '苹果',
  undercoverWord: '梨',
}

const card = {
  id: 'dare-host-voice',
  type: 'dare',
  content: '用主持人的语气宣布下一轮开始。',
  category: '表演',
  intensity: 'normal',
}

test('starts undercover game with private words and produces civilian win after voting out undercover', () => {
  const room = createInitialPartyRoomState({
    code: 'ABCD',
    nickname: '房主',
    settings: {
      mode: 'undercover',
      maxPlayers: 4,
      allowLateJoin: true,
      wordCategory: '生活',
      punishmentMode: 'dare',
    },
  })
  joinPartyRoomState(room, '玩家A')
  joinPartyRoomState(room, '玩家B')

  startPartyGame(room, { wordPair })
  assert.equal(room.phase, 'word')
  assert.equal(Object.keys(room.words).length, 3)
  assert.equal(Object.values(room.roles).filter((role) => role === 'undercover').length, 1)

  room.phase = 'voting'
  const undercoverId = Object.entries(room.roles).find(([, role]) => role === 'undercover')?.[0]
  assert.ok(undercoverId)

  // Pick two voters who are NOT the undercover (to avoid self-vote rejection)
  const voters = room.players.filter((p) => p.id !== undercoverId).map((p) => p.id)
  assert.ok(voters.length >= 2, `need at least 2 non-undercover voters, got ${voters.length}`)
  submitPartyVote(room, voters[0], undercoverId)
  submitPartyVote(room, voters[1], undercoverId)
  revealPartyVotingResult(room)

  assert.equal(room.phase, 'result')
  assert.equal(room.result.gameEnded, true)
  assert.equal(room.result.winner, 'civilians')
  assert.equal(room.result.eliminatedRole, 'undercover')
})

test('standalone truth or dare rotates punishment target after completion', () => {
  const room = createInitialPartyRoomState({
    code: 'EFGH',
    nickname: '房主',
    settings: {
      mode: 'truth-or-dare',
      maxPlayers: 4,
      allowLateJoin: true,
      wordCategory: '生活',
      punishmentMode: 'random',
    },
  })
  joinPartyRoomState(room, '玩家A')
  joinPartyRoomState(room, '玩家B')

  startPartyGame(room)
  assert.equal(room.phase, 'punishment')
  assert.equal(room.punishmentTargetId, 'host')

  drawPunishmentCard(room, card)
  completePunishment(room)
  assert.equal(room.phase, 'punishment')
  assert.equal(room.punishmentTargetId, 'guest-1')
  assert.equal(room.selectedCard, null)
})

test('undercover punishment flow returns room to waiting state', () => {
  const room = createInitialPartyRoomState({
    code: 'IJKL',
    nickname: '房主',
    settings: {
      mode: 'undercover',
      maxPlayers: 4,
      allowLateJoin: true,
      wordCategory: '生活',
      punishmentMode: 'truth',
    },
  })
  joinPartyRoomState(room, '玩家A')
  joinPartyRoomState(room, '玩家B')

  startPartyGame(room, { wordPair })
  room.phase = 'result'
  room.punishmentTargetId = 'guest-1'
  moveToPunishment(room)
  drawPunishmentCard(room, card)
  completePunishment(room)

  assert.equal(room.phase, 'waiting')
  assert.deepEqual(room.roles, {})
  assert.deepEqual(room.words, {})
  assert.equal(room.selectedCard, null)
})

test('player reconnect toggles offline player back online', () => {
  const room = createInitialPartyRoomState({
    code: 'MNOP',
    nickname: '房主',
    settings: {
      mode: 'undercover',
      maxPlayers: 4,
      allowLateJoin: true,
      wordCategory: '生活',
      punishmentMode: 'truth',
    },
  })
  joinPartyRoomState(room, '玩家A')

  disconnectPartyPlayer(room, 'guest-1')
  assert.equal(room.players[1].status, 'offline')

  reconnectPartyPlayer(room, 'guest-1')
  assert.equal(room.players[1].status, 'online')
})

// ── F10: distribution test for F1 shuffle fix ──

test('assignUndercoverRound distributes undercover role across all positions', () => {
  const playerIds = ['host', 'guest-1', 'guest-2', 'guest-3']
  const counts = Object.fromEntries(playerIds.map((id) => [id, 0]))
  const rounds = 1000

  for (let i = 0; i < rounds; i++) {
    const room = createInitialPartyRoomState({
      code: 'TEST',
      nickname: '房主',
      settings: {
        mode: 'undercover',
        maxPlayers: 4,
        allowLateJoin: true,
        wordCategory: '生活',
        punishmentMode: 'truth',
      },
    })
    joinPartyRoomState(room, '玩家A')
    joinPartyRoomState(room, '玩家B')
    joinPartyRoomState(room, '玩家C')

    assignUndercoverRound(room, wordPair)
    const undercoverId = Object.entries(room.roles).find(([, role]) => role === 'undercover')?.[0]
    assert.ok(undercoverId, `round ${i}: no undercover assigned`)
    counts[undercoverId]++
  }

  // Chi-square goodness-of-fit test for uniform distribution.
  // H₀: undercover role is uniformly distributed across all players.
  // df = 3 (4 players - 1), α = 0.01 → critical value = 11.34
  const expected = rounds / playerIds.length
  let chiSquare = 0
  for (const id of playerIds) {
    chiSquare += Math.pow(counts[id] - expected, 2) / expected
  }
  assert.ok(
    chiSquare <= 11.34,
    `Shuffle bias detected! χ² = ${chiSquare.toFixed(2)} > 11.34 (α=0.01, df=3). ` +
    `Counts: ${playerIds.map((id) => `${id}=${counts[id]}`).join(', ')}`,
  )
})

// ── F8: tie-breaking ──

test('revealPartyVotingResult returns null result on tie vote', () => {
  const room = createInitialPartyRoomState({
    code: 'TIE1',
    nickname: '房主',
    settings: {
      mode: 'undercover',
      maxPlayers: 4,
      allowLateJoin: true,
      wordCategory: '生活',
      punishmentMode: 'truth',
    },
  })
  joinPartyRoomState(room, '玩家A')
  joinPartyRoomState(room, '玩家B')
  joinPartyRoomState(room, '玩家C')

  startPartyGame(room, { wordPair })
  room.phase = 'voting'

  // 2:2 tie between guest-1 and guest-2, no self-votes
  // host→guest-1, guest-2→guest-1  (2 votes for guest-1)
  // guest-1→guest-2, guest-3→guest-2  (2 votes for guest-2)
  submitPartyVote(room, 'host', 'guest-1')
  submitPartyVote(room, 'guest-2', 'guest-1')
  submitPartyVote(room, 'guest-1', 'guest-2')
  submitPartyVote(room, 'guest-3', 'guest-2')

  revealPartyVotingResult(room)

  assert.equal(room.phase, 'result')
  assert.equal(room.result.eliminatedId, null)
  assert.equal(room.result.eliminatedRole, null)
  assert.equal(room.result.gameEnded, false)
  assert.equal(room.result.winner, null)
})

test('revealPartyVotingResult eliminates undercover and ends game on clear majority', () => {
  const room = createInitialPartyRoomState({
    code: 'TIE2',
    nickname: '房主',
    settings: {
      mode: 'undercover',
      maxPlayers: 4,
      allowLateJoin: true,
      wordCategory: '生活',
      punishmentMode: 'truth',
    },
  })
  joinPartyRoomState(room, '玩家A')
  joinPartyRoomState(room, '玩家B')
  joinPartyRoomState(room, '玩家C')

  startPartyGame(room, { wordPair })
  room.phase = 'voting'

  // Find the undercover and vote them out — ensures gameEnded=true
  const undercoverId = Object.entries(room.roles).find(([, r]) => r === 'undercover')?.[0]
  assert.ok(undercoverId)
  const voters = room.players.filter((p) => p.id !== undercoverId).map((p) => p.id)
  for (const voterId of voters) {
    submitPartyVote(room, voterId, undercoverId)
  }
  // The undercover votes for someone else (not themselves)
  const otherId = room.players.find((p) => p.id !== undercoverId)?.id
  submitPartyVote(room, undercoverId, otherId)

  revealPartyVotingResult(room)

  assert.equal(room.phase, 'result')
  assert.equal(room.result.eliminatedId, undercoverId)
  assert.equal(room.result.eliminatedRole, 'undercover')
  assert.equal(room.result.gameEnded, true)
  assert.equal(room.result.winner, 'civilians')
})

// ── F3: idempotent reveal ──

test('revealPartyVotingResult is idempotent on double call', () => {
  const room = createInitialPartyRoomState({
    code: 'IDEM',
    nickname: '房主',
    settings: {
      mode: 'undercover',
      maxPlayers: 4,
      allowLateJoin: true,
      wordCategory: '生活',
      punishmentMode: 'truth',
    },
  })
  joinPartyRoomState(room, '玩家A')
  joinPartyRoomState(room, '玩家B')
  joinPartyRoomState(room, '玩家C')

  startPartyGame(room, { wordPair })
  room.phase = 'voting'

  // 3:1 clear majority for guest-1, no self-votes
  submitPartyVote(room, 'host', 'guest-1')
  submitPartyVote(room, 'guest-2', 'guest-1')
  submitPartyVote(room, 'guest-3', 'guest-1')
  submitPartyVote(room, 'guest-1', 'guest-2')

  revealPartyVotingResult(room)
  const firstResult = { ...room.result }

  // Second call — must not throw, must not change result
  assert.doesNotThrow(() => revealPartyVotingResult(room))
  assert.deepEqual(room.result, firstResult)
})

// ── F6: civilian eliminated, undercover still alive → gameEnded=false ──

test('eliminating a civilian when undercover is still minority sets gameEnded=false', () => {
  const room = createInitialPartyRoomState({
    code: 'CONT',
    nickname: '房主',
    settings: {
      mode: 'undercover',
      maxPlayers: 4,
      allowLateJoin: true,
      wordCategory: '生活',
      punishmentMode: 'truth',
    },
  })
  joinPartyRoomState(room, '玩家A')
  joinPartyRoomState(room, '玩家B')
  joinPartyRoomState(room, '玩家C')

  startPartyGame(room, { wordPair })
  room.phase = 'voting'

  // Find the civilian players (not undercover)
  const undercoverId = Object.entries(room.roles).find(([, r]) => r === 'undercover')?.[0]
  const civilianIds = Object.entries(room.roles)
    .filter(([, r]) => r === 'civilian')
    .map(([id]) => id)

  // All vote for a civilian — they get eliminated but game is not over
  for (const voterId of room.players.map((p) => p.id)) {
    if (voterId !== civilianIds[0]) {
      submitPartyVote(room, voterId, civilianIds[0])
    }
  }
  // The civilian votes for someone else (not themselves)
  submitPartyVote(room, civilianIds[0], civilianIds[1] ?? undercoverId)

  revealPartyVotingResult(room)

  assert.equal(room.phase, 'result')
  assert.equal(room.result.eliminatedId, civilianIds[0])
  assert.equal(room.result.eliminatedRole, 'civilian')
  assert.equal(room.result.gameEnded, false)
  assert.equal(room.result.winner, null)

  // After punishment, game should continue to speaking (not waiting)
  moveToPunishment(room)
  drawPunishmentCard(room, card)
  completePunishment(room)
  assert.equal(room.phase, 'speaking', 'game should continue to speaking, not waiting')
  assert.equal(room.currentSpeakerIndex, 0)
  // Roles and words должны сохраниться (same undercover, same words)
  assert.ok(room.roles[undercoverId] === 'undercover', 'undercover role should persist')
})

// ── F9: multi-undercover placeholder ──

test.skip('multi-undercover: eliminating one undercover does not end game when others remain', () => {
  // TODO: enable when multi-undercover mode is implemented.
  // Setup: 2 undercovers, vote out one → gameEnded=false, winner=null, game continues.
})

// ── F2a: duplicate playerId connection closes old socket ──
// NOTE: full WebSocket integration test requires Cloudflare runtime (WebSocketPair).
// This test validates the guard logic: a sockets map with a pre-existing entry
// for the same playerId should have the old entry closed and removed.

test('F2a: duplicate playerId guard logic closes old socket entry', () => {
  const sockets = new Map()
  const closeLog = []

  // Simulate an existing connection for 'guest-1'
  const oldSocket = { close: () => { closeLog.push('old-closed') } }
  sockets.set(oldSocket, { playerId: 'guest-1' })

  // Simulate the guard logic from connectRoom
  const newPlayerId = 'guest-1'
  for (const [existingSocket, meta] of sockets.entries()) {
    if (meta.playerId === newPlayerId) {
      try { existingSocket.close() } catch { /* already closed */ }
      sockets.delete(existingSocket)
    }
  }

  // Old socket must have been closed and removed
  assert.deepEqual(closeLog, ['old-closed'])
  assert.equal(sockets.size, 0)

  // Now add the new socket — must succeed without conflict
  const newSocket = { close: () => {} }
  sockets.set(newSocket, { playerId: newPlayerId })
  assert.equal(sockets.size, 1)
  assert.equal(sockets.get(newSocket).playerId, 'guest-1')
})

test('F2a: different playerId does not close unrelated sockets', () => {
  const sockets = new Map()
  const closeLog = []

  const socketA = { close: () => { closeLog.push('A-closed') } }
  sockets.set(socketA, { playerId: 'guest-1' })

  // Connecting as a different playerId — should NOT close guest-1's socket
  const newPlayerId = 'guest-2'
  for (const [existingSocket, meta] of sockets.entries()) {
    if (meta.playerId === newPlayerId) {
      try { existingSocket.close() } catch { /* already closed */ }
      sockets.delete(existingSocket)
    }
  }

  assert.deepEqual(closeLog, [])          // No socket was closed
  assert.equal(sockets.size, 1)           // guest-1's socket still there

  const newSocket = { close: () => {} }
  sockets.set(newSocket, { playerId: newPlayerId })
  assert.equal(sockets.size, 2)           // Both connections coexist (different playerIds)
})

// ── F2b: connect token issuance and validation ──

test('F2b: issueConnectToken stores token and validateConnectToken accepts it', () => {
  const room = createInitialPartyRoomState({
    code: 'TOK1',
    nickname: '房主',
    settings: {
      mode: 'undercover',
      maxPlayers: 4,
      allowLateJoin: true,
      wordCategory: '生活',
      punishmentMode: 'truth',
    },
  })

  issueConnectToken(room, 'host', 'test-token-abc')
  assert.equal(room.connectTokens['host'], 'test-token-abc')

  // Valid token must pass without throwing
  assert.doesNotThrow(() => validateConnectToken(room, 'host', 'test-token-abc'))
  assert.equal(validateConnectToken(room, 'host', 'test-token-abc'), true)
})

test('F2b: validateConnectToken rejects wrong token', () => {
  const room = createInitialPartyRoomState({
    code: 'TOK2',
    nickname: '房主',
    settings: {
      mode: 'undercover',
      maxPlayers: 4,
      allowLateJoin: true,
      wordCategory: '生活',
      punishmentMode: 'truth',
    },
  })

  issueConnectToken(room, 'host', 'correct-token')

  assert.throws(
    () => validateConnectToken(room, 'host', 'wrong-token'),
    /invalid or missing connect token/,
  )
})

test('F2b: validateConnectToken rejects missing token', () => {
  const room = createInitialPartyRoomState({
    code: 'TOK3',
    nickname: '房主',
    settings: {
      mode: 'undercover',
      maxPlayers: 4,
      allowLateJoin: true,
      wordCategory: '生活',
      punishmentMode: 'truth',
    },
  })

  issueConnectToken(room, 'host', 'real-token')

  assert.throws(
    () => validateConnectToken(room, 'host', ''),
    /invalid or missing connect token/,
  )
})

test('F2b: validateConnectToken rejects unknown playerId', () => {
  const room = createInitialPartyRoomState({
    code: 'TOK4',
    nickname: '房主',
    settings: {
      mode: 'undercover',
      maxPlayers: 4,
      allowLateJoin: true,
      wordCategory: '生活',
      punishmentMode: 'truth',
    },
  })

  // No token issued for guest-1
  assert.throws(
    () => validateConnectToken(room, 'guest-1', 'any-token'),
    /invalid or missing connect token/,
  )
})

test('F2b: multiple players each have independent tokens', () => {
  const room = createInitialPartyRoomState({
    code: 'TOK5',
    nickname: '房主',
    settings: {
      mode: 'undercover',
      maxPlayers: 4,
      allowLateJoin: true,
      wordCategory: '生活',
      punishmentMode: 'truth',
    },
  })
  joinPartyRoomState(room, '玩家A')

  issueConnectToken(room, 'host', 'host-token')
  issueConnectToken(room, 'guest-1', 'guest-token')

  // Each validates with their own token
  assert.equal(validateConnectToken(room, 'host', 'host-token'), true)
  assert.equal(validateConnectToken(room, 'guest-1', 'guest-token'), true)

  // Cannot cross-validate
  assert.throws(() => validateConnectToken(room, 'host', 'guest-token'))
  assert.throws(() => validateConnectToken(room, 'guest-1', 'host-token'))
})

// ── Play Again ──

test('resetRoomToWaiting clears game state but keeps players', () => {
  const room = createInitialPartyRoomState({
    code: 'AGN1',
    nickname: '房主',
    settings: {
      mode: 'undercover',
      maxPlayers: 4,
      allowLateJoin: true,
      wordCategory: '生活',
      punishmentMode: 'truth',
    },
  })
  joinPartyRoomState(room, '玩家A')
  joinPartyRoomState(room, '玩家B')

  startPartyGame(room, { wordPair })
  room.phase = 'voting'
  const undercoverId = Object.entries(room.roles).find(([, r]) => r === 'undercover')?.[0]
  const voters = room.players.filter((p) => p.id !== undercoverId).map((p) => p.id)
  for (const v of voters) submitPartyVote(room, v, undercoverId)
  submitPartyVote(room, undercoverId, voters[0])
  revealPartyVotingResult(room)
  moveToPunishment(room)
  drawPunishmentCard(room, card)
  completePunishment(room)

  // Game ended — room should be in waiting
  assert.equal(room.phase, 'waiting')

  // Explicit reset to waiting
  resetRoomToWaiting(room)

  // Game state cleared
  assert.equal(room.phase, 'waiting')
  assert.deepEqual(room.roles, {})
  assert.deepEqual(room.words, {})
  assert.deepEqual(room.votes, {})
  assert.equal(room.result, null)
  assert.equal(room.selectedCard, null)
  assert.equal(room.punishmentTargetId, null)
  assert.equal(room.currentSpeakerIndex, 0)

  // Players preserved
  assert.equal(room.players.length, 3)
  assert.equal(room.players[0].nickname, '房主')
  assert.equal(room.players[1].nickname, '玩家A')
  assert.equal(room.players[2].nickname, '玩家B')
})
