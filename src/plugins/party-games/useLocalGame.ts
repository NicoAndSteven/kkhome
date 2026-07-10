import { useCallback, useRef, useState } from 'react'
import { undercoverWordPairs, truthOrDareCards } from './content'
import {
  LocalPartyRoom,
  PartyRoomSettings,
  TruthOrDareCard,
} from './types'
import {
  createInitialPartyRoomState,
  joinPartyRoomState,
  resetRoomToWaiting,
  startPartyGame,
  advanceSpeaking,
  submitPartyDescription,
  submitPartyVote,
  revealPartyVotingResult,
  moveToPunishment,
  drawPunishmentCard,
  completePunishment as sharedCompletePunishment,
} from '../../../functions/_shared/partyRoomState.js'

// ── 纯本地游戏引擎（薄封装层）───────────────────────────
// 游戏规则逻辑全部委托给 functions/_shared/partyRoomState.js。
// 本地模式只负责：
//   1. 生成本地玩家 ID（替代在线模式的 host/guest-N）
//   2. switchToPlayer — 传手机时的隐私投影
//   3. resetGame — 状态清空
//   4. 卡片/词对选取（前端词库，替代后端 D1 查询）

let idCounter = 0
const uid = () => `local-${++idCounter}-${Math.random().toString(36).slice(2, 6)}`

const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

const pickRandomWordPair = () =>
  undercoverWordPairs[Math.floor(Math.random() * undercoverWordPairs.length)]

const pickRandomCard = (type?: 'truth' | 'dare' | 'random'): TruthOrDareCard => {
  const pool = type && type !== 'random'
    ? truthOrDareCards.filter((c) => c.type === type)
    : truthOrDareCards
  return pool[Math.floor(Math.random() * pool.length)]
}

export const useLocalGame = () => {
  const [room, setRoom] = useState<LocalPartyRoom | null>(null)
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null)
  const [isHost, setIsHost] = useState(false)
  const stateRef = useRef<{ room: LocalPartyRoom } | null>(null)

  // Privacy: the full room (with roles/words/votes) lives in stateRef for shared
  // state machine functions. The React state only receives a public copy with
  // private fields stripped — same principle as getPartyRoomSummary online.
  const toPublicRoom = (full: LocalPartyRoom): LocalPartyRoom => ({
    ...full,
    roles: {},
    words: {},
    votes: {},
    players: [...full.players],
  })

  // Helper: apply a shared state machine function that mutates room in-place,
  // then sync a privacy-safe copy to React state (new reference triggers re-render).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apply = (fn: (r: any) => any) => {
    const state = stateRef.current
    if (!state) return
    fn(state.room)
    const snap = { ...state.room, players: [...state.room.players] }
    state.room = snap
    setRoom(toPublicRoom(snap))
  }

  // ── 房间管理 ──

  const createLocalRoom = useCallback((
    nickname: string,
    settings: PartyRoomSettings,
  ) => {
    const code = generateRoomCode()
    const room = createInitialPartyRoomState({ code, nickname, settings }) as unknown as LocalPartyRoom
    // Override player IDs with local-pattern IDs
    const hostId = uid()
    room.players[0].id = hostId
    room.selectedWordPair = pickRandomWordPair()
    room.selectedCard = null
    room.privateWord = null
    room.privateRole = null

    stateRef.current = { room }
    setRoom(toPublicRoom(room))
    setCurrentPlayerId(hostId)
    setIsHost(true)
    return { room, playerId: hostId }
  }, [])

  const joinLocalRoom = useCallback((
    nickname: string,
    code: string,
  ) => {
    const state = stateRef.current
    if (!state || state.room.code !== code) {
      throw new Error('未找到该房间（本地模式下只能加入当前会话创建的房间）')
    }

    const playerId = uid()
    // Use shared join logic, then override the generated playerId
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { player } = joinPartyRoomState(state.room as any, nickname)
    player.id = playerId

    const snap = { ...state.room, players: [...state.room.players] }
    state.room = snap
    setRoom(toPublicRoom(snap))
    return { room: snap, playerId }
  }, [])

  // ── 传手机（本地专属） ──

  const switchToPlayer = useCallback((playerId: string) => {
    const state = stateRef.current
    if (!state) return
    const player = state.room.players.find((p) => p.id === playerId)
    if (!player) return

    setCurrentPlayerId(playerId)
    setIsHost(player.host)

    // Project private data for the switched-to player
    const snap: LocalPartyRoom = {
      ...state.room,
      privateWord: state.room.words[playerId] ?? null,
      privateRole: state.room.roles[playerId] ?? null,
    }
    state.room = snap
    // Public copy strips roles/words/votes + adds only current player's projection
    const pub = toPublicRoom(snap)
    pub.privateWord = snap.privateWord
    pub.privateRole = snap.privateRole
    setRoom(pub)
  }, [])

  // ── 开始游戏 ──

  const startLocalGame = useCallback(() => {
    const state = stateRef.current
    if (!state) return

    if (state.room.settings.mode === 'truth-or-dare') {
      apply((r) => startPartyGame(r))
      return
    }

    // Undercover: need to provide word pair before calling startPartyGame
    const wordPair = pickRandomWordPair()
    apply((r) => {
      startPartyGame(r, { wordPair })
      r.selectedWordPair = wordPair
    })
    // Project private data for current player
    switchToPlayer(currentPlayerId!)
  }, [currentPlayerId, switchToPlayer])

  // ── 发言（共享函数统一处理 word→speaking 和 speaker→next/voting） ──

  const advanceToSpeaking = useCallback(() => {
    apply((r) => advanceSpeaking(r))
  }, [])

  const nextSpeaker = useCallback(() => {
    apply((r) => advanceSpeaking(r))
  }, [])

  const submitDescription = useCallback((content: string) => {
    const state = stateRef.current
    if (!state || !currentPlayerId) return
    const player = state.room.players.find((p) => p.id === currentPlayerId)
    if (!player) return
    apply((r) => submitPartyDescription(r, currentPlayerId, player.nickname, content))
  }, [currentPlayerId])

  // ── 投票 ──

  const submitVote = useCallback((suspectId: string) => {
    if (!currentPlayerId) return
    apply((r) => submitPartyVote(r, currentPlayerId, suspectId))
  }, [currentPlayerId])

  const revealResult = useCallback(() => {
    apply((r) => revealPartyVotingResult(r))
  }, [])

  // ── 惩罚 ──

  const localMoveToPunishment = useCallback(() => {
    apply((r) => moveToPunishment(r))
  }, [])

  const drawPunishment = useCallback((choice: 'truth' | 'dare' | 'random') => {
    const card = pickRandomCard(choice)
    apply((r) => drawPunishmentCard(r, card))
  }, [])

  const localCompletePunishment = useCallback(() => {
    const state = stateRef.current
    if (!state) return

    if (state.room.settings.mode === 'truth-or-dare') {
      apply((r) => sharedCompletePunishment(r))
      // Truth-or-dare: auto-switch to next target after completion
      const nextPlayerId = state.room.punishmentTargetId
      if (nextPlayerId && nextPlayerId !== currentPlayerId) {
        switchToPlayer(nextPlayerId)
      }
      return
    }

    // Undercover: shared function handles gameEnded=true→waiting / gameEnded=false→speaking
    apply((r) => sharedCompletePunishment(r))
    // Only clear private view if the game truly ended (going back to waiting)
    const gameOver = state.room.phase === 'waiting'
    const snap: LocalPartyRoom = {
      ...state.room,
      privateWord: gameOver ? null : state.room.privateWord,
      privateRole: gameOver ? null : state.room.privateRole,
    }
    state.room = snap
    setRoom(toPublicRoom(snap))
  }, [currentPlayerId, switchToPlayer])

  // ── 再来一局 ──

  const playAgain = useCallback(() => {
    const state = stateRef.current
    if (!state) return
    apply((r) => resetRoomToWaiting(r))
    // Clear private view for the new round
    const snap: LocalPartyRoom = {
      ...state.room,
      privateWord: null,
      privateRole: null,
    }
    state.room = snap
    setRoom(toPublicRoom(snap))
  }, [])

  // ── 重置 ──

  const resetGame = useCallback(() => {
    stateRef.current = null
    setRoom(null)
    setCurrentPlayerId(null)
    setIsHost(false)
  }, [])

  return {
    room,
    currentPlayerId,
    isHost,
    createLocalRoom,
    joinLocalRoom,
    switchToPlayer,
    startLocalGame,
    advanceToSpeaking,
    nextSpeaker,
    submitDescription,
    submitVote,
    revealResult,
    moveToPunishment: localMoveToPunishment,
    drawPunishment,
    completePunishment: localCompletePunishment,
    playAgain,
    resetGame,
  }
}
