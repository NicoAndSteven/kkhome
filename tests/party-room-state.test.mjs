import assert from 'node:assert/strict'
import test from 'node:test'
import {
  completePunishment,
  createInitialPartyRoomState,
  disconnectPartyPlayer,
  drawPunishmentCard,
  joinPartyRoomState,
  moveToPunishment,
  reconnectPartyPlayer,
  revealPartyVotingResult,
  startPartyGame,
  submitPartyVote,
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

  submitPartyVote(room, 'host', undercoverId)
  submitPartyVote(room, 'guest-1', undercoverId)
  revealPartyVotingResult(room)

  assert.equal(room.phase, 'result')
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
