import { useCallback, useRef, useState } from 'react'
import { undercoverWordPairs, truthOrDareCards } from './content'
import {
  DescriptionEntry,
  LocalPartyRoom,
  PartyPlayer,
  PartyResult,
  PartyRoomSettings,
  TruthOrDareCard,
} from './types'

// ── 纯本地游戏引擎 ──────────────────────────────────
// 无需任何后端即可在单设备上体验完整游戏流程。
// 支持"传手机"模式：每个玩家轮流操作（查看词语 → 发言 → 投票）。

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

const pickRandomWordPair = () => {
  const idx = Math.floor(Math.random() * undercoverWordPairs.length)
  return undercoverWordPairs[idx]
}

const pickRandomCard = (type?: 'truth' | 'dare' | 'random'): TruthOrDareCard => {
  const pool = type && type !== 'random'
    ? truthOrDareCards.filter((c) => c.type === type)
    : truthOrDareCards
  return pool[Math.floor(Math.random() * pool.length)]
}

interface LocalGameState {
  room: LocalPartyRoom
  // 每个玩家的私密状态
  playerSecrets: Map<string, { word: string; role: 'civilian' | 'undercover' }>
  // 每个玩家的投票结果
  votes: Map<string, string>
  // 发言描述
  descriptions: DescriptionEntry[]
}

export const useLocalGame = () => {
  const [room, setRoom] = useState<LocalPartyRoom | null>(null)
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null)
  const [isHost, setIsHost] = useState(false)
  const stateRef = useRef<LocalGameState | null>(null)

  // ── 创建房间 ──
  const createLocalRoom = useCallback((
    nickname: string,
    settings: PartyRoomSettings,
  ) => {
    const code = generateRoomCode()
    const hostPlayer: PartyPlayer = {
      id: uid(),
      nickname,
      host: true,
      status: 'online',
    }

    const roomData: LocalPartyRoom = {
      code,
      settings,
      players: [hostPlayer],
      phase: 'waiting',
      currentSpeakerIndex: 0,
      currentSpeakerId: null,
      selectedWordPair: pickRandomWordPair(),
      selectedCard: null,
      privateWord: null,
      privateRole: null,
      result: null,
      punishmentTargetId: null,
    }

    stateRef.current = {
      room: roomData,
      playerSecrets: new Map(),
      votes: new Map(),
      descriptions: [],
    }

    setRoom(roomData)
    setCurrentPlayerId(hostPlayer.id)
    setIsHost(true)
    return { room: roomData, playerId: hostPlayer.id }
  }, [])

  // ── 加入房间（本地模式：直接通过房间码 join，模拟） ──
  const joinLocalRoom = useCallback((
    nickname: string,
    code: string,
  ) => {
    // 本地模式下只能"加入"已存在的房间（当前会话内）
    const state = stateRef.current
    if (!state || state.room.code !== code) {
      throw new Error('未找到该房间（本地模式下只能加入当前会话创建的房间）')
    }

    const player: PartyPlayer = {
      id: uid(),
      nickname,
      host: false,
      status: 'online',
    }

    state.room.players.push(player)
    const updated = { ...state.room, players: [...state.room.players] }
    state.room = updated
    setRoom(updated)
    // 不自动切换当前玩家 — 由调用方决定
    return { room: updated, playerId: player.id }
  }, [])

  // ── 切换当前操作玩家（传手机模式） ──
  const switchToPlayer = useCallback((playerId: string) => {
    const state = stateRef.current
    if (!state) return
    const player = state.room.players.find((p) => p.id === playerId)
    if (!player) return

    setCurrentPlayerId(playerId)
    setIsHost(player.host)

    // 更新当前玩家的私密视图
    const secret = state.playerSecrets.get(playerId)
    setRoom((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        privateWord: secret?.word ?? null,
        privateRole: secret?.role ?? null,
      }
    })
  }, [])

  // ── 开始游戏 ──
  const startLocalGame = useCallback(() => {
    const state = stateRef.current
    if (!state) return

    const { room: r } = state
    const isTruthOrDare = r.settings.mode === 'truth-or-dare'

    // 真心话大冒险：直接进入惩罚/抽卡阶段
    if (isTruthOrDare) {
      const playerCount = r.players.length
      if (playerCount < 2) return // 真心话大冒险最少 2 人

      const updated: LocalPartyRoom = {
        ...r,
        phase: 'punishment',
        selectedCard: null,
        punishmentTargetId: r.players[0]?.id ?? null,
        players: [...r.players],
      }
      state.room = updated
      setRoom(updated)
      return
    }

    // 谁是卧底：分配身份和词语
    const playerCount = r.players.length
    if (playerCount < 3) return // 最少 3 人

    // 随机选一个卧底
    const undercoverIndex = Math.floor(Math.random() * playerCount)
    const wordPair = pickRandomWordPair()

    r.players.forEach((player, i) => {
      const isUndercover = i === undercoverIndex
      state.playerSecrets.set(player.id, {
        word: isUndercover ? wordPair.undercoverWord : wordPair.civilianWord,
        role: isUndercover ? 'undercover' : 'civilian',
      })
    })

    const updated: LocalPartyRoom = {
      ...r,
      phase: 'word',
      selectedWordPair: wordPair,
      players: [...r.players],
    }

    // 更新当前玩家的私密视图
    const currentSecret = state.playerSecrets.get(currentPlayerId!)
    updated.privateWord = currentSecret?.word ?? null
    updated.privateRole = currentSecret?.role ?? null

    state.room = updated
    setRoom(updated)
  }, [currentPlayerId])

  // ── 进入发言 ──
  const advanceToSpeaking = useCallback(() => {
    const state = stateRef.current
    if (!state) return

    state.descriptions = []
    const updated: LocalPartyRoom = {
      ...state.room,
      phase: 'speaking',
      currentSpeakerId: state.room.players[0]?.id ?? null,
      currentSpeakerIndex: 0,
      descriptions: [],
      players: [...state.room.players],
    }
    state.room = updated
    setRoom(updated)
  }, [])

  // ── 提交描述 ──
  const submitDescription = useCallback((content: string) => {
    const state = stateRef.current
    if (!state || !currentPlayerId) return

    const player = state.room.players.find((p) => p.id === currentPlayerId)
    if (!player) return

    const entry: DescriptionEntry = {
      playerId: currentPlayerId,
      playerName: player.nickname,
      content,
      timestamp: Date.now(),
    }

    state.descriptions.push(entry)
    const updated = { ...state.room, descriptions: [...state.descriptions] }
    state.room = updated
    setRoom(updated)
  }, [currentPlayerId])

  // ── 下一位发言 ──
  const nextSpeaker = useCallback(() => {
    const state = stateRef.current
    if (!state) return

    const currentIdx = state.room.players.findIndex(
      (p) => p.id === state.room.currentSpeakerId,
    )
    const nextIdx = currentIdx + 1

    if (nextIdx >= state.room.players.length) {
      // 所有玩家发言完毕，进入投票
      const updated: LocalPartyRoom = {
        ...state.room,
        phase: 'voting',
        currentSpeakerId: null,
        players: [...state.room.players],
      }
      state.room = updated
      setRoom(updated)
      state.votes.clear()
    } else {
      const updated: LocalPartyRoom = {
        ...state.room,
        currentSpeakerId: state.room.players[nextIdx].id,
        currentSpeakerIndex: nextIdx,
        players: [...state.room.players],
      }
      state.room = updated
      setRoom(updated)
    }
  }, [])

  // ── 投票 ──
  const submitVote = useCallback((suspectId: string) => {
    const state = stateRef.current
    if (!state || !currentPlayerId) return

    state.votes.set(currentPlayerId, suspectId)
  }, [currentPlayerId])

  // ── 揭晓投票结果 ──
  const revealResult = useCallback(() => {
    const state = stateRef.current
    if (!state) return

    // 统计票数
    const tally = new Map<string, number>()
    for (const [, suspectId] of state.votes) {
      tally.set(suspectId, (tally.get(suspectId) ?? 0) + 1)
    }

    // 找出最高票
    let eliminatedId = state.room.players[0]?.id ?? ''
    let maxVotes = 0
    for (const [pid, count] of tally) {
      if (count > maxVotes) {
        maxVotes = count
        eliminatedId = pid
      }
    }

    const secret = state.playerSecrets.get(eliminatedId)
    const isUndercover = secret?.role === 'undercover'

    const result: PartyResult = {
      eliminatedId,
      eliminatedRole: isUndercover ? 'undercover' : 'civilian',
      winner: isUndercover ? 'civilians' : 'undercover',
    }

    const updated: LocalPartyRoom = {
      ...state.room,
      phase: 'result',
      result,
      punishmentTargetId: eliminatedId,
      players: [...state.room.players],
    }
    state.room = updated
    setRoom(updated)
  }, [])

  // ── 进入惩罚 ──
  const moveToPunishment = useCallback(() => {
    const state = stateRef.current
    if (!state) return

    const updated: LocalPartyRoom = {
      ...state.room,
      phase: 'punishment',
      selectedCard: null,
      players: [...state.room.players],
    }
    state.room = updated
    setRoom(updated)
  }, [])

  // ── 抽惩罚卡 ──
  const drawPunishment = useCallback((choice: 'truth' | 'dare' | 'random') => {
    const state = stateRef.current
    if (!state) return

    const card = pickRandomCard(choice)
    const updated: LocalPartyRoom = {
      ...state.room,
      selectedCard: card,
      players: [...state.room.players],
    }
    state.room = updated
    setRoom(updated)
  }, [])

  // ── 完成惩罚 ──
  const completePunishment = useCallback(() => {
    const state = stateRef.current
    if (!state) return

    if (state.room.settings.mode === 'truth-or-dare') {
      // 真心话大冒险模式：轮换目标
      const currentTargetIdx = state.room.players.findIndex(
        (p) => p.id === state.room.punishmentTargetId,
      )
      const nextIdx = (currentTargetIdx + 1) % state.room.players.length
      const updated: LocalPartyRoom = {
        ...state.room,
        selectedCard: null,
        punishmentTargetId: state.room.players[nextIdx].id,
        players: [...state.room.players],
      }
      state.room = updated
      setRoom(updated)
    } else {
      // 谁是卧底模式：回到等待
      const updated: LocalPartyRoom = {
        ...state.room,
        phase: 'waiting',
        selectedCard: null,
        result: null,
        punishmentTargetId: null,
        players: [...state.room.players],
      }
      state.room = updated
      setRoom(updated)
    }
  }, [])

  // ── 重置游戏 ──
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
    moveToPunishment,
    drawPunishment,
    completePunishment,
    resetGame,
  }
}
