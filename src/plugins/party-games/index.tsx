/* global WebSocket */

import { useEffect, useRef, useState } from 'react'
import { PluginRuntimeConfig } from '@core/types'
import CreateRoomSheet from './components/CreateRoomSheet'
import JoinRoomSheet from './components/JoinRoomSheet'
import WaitingRoomView from './components/WaitingRoomView'
import UndercoverRoundView from './components/UndercoverRoundView'
import TruthOrDarePanel from './components/TruthOrDarePanel'
import { getDefaultWordPair, truthOrDareCards } from './content'
import { LocalPartyRoom, PartyGameMode, PartyRoomSettings } from './types'

interface Props {
  config?: PluginRuntimeConfig
}

interface PartyRoomSummary {
  code: string
  settings: PartyRoomSettings
  players: LocalPartyRoom['players']
  phase: LocalPartyRoom['phase']
  currentSpeakerId?: string | null
  result?: LocalPartyRoom['result']
  punishmentTargetId?: string | null
  selectedCard?: LocalPartyRoom['selectedCard']
}

interface PartyRoomSession {
  playerId: string
  host: boolean
}

const readDefaultMode = (config?: PluginRuntimeConfig): PartyGameMode => (
  config?.defaultMode === 'truth-or-dare' ? 'truth-or-dare' : 'undercover'
)

const readDefaultMaxPlayers = (config?: PluginRuntimeConfig) => (
  typeof config?.maxPlayers === 'number' ? config.maxPlayers : 6
)

const toLocalRoom = (summary: PartyRoomSummary): LocalPartyRoom => ({
  code: summary.code,
  settings: summary.settings,
  players: summary.players,
  phase: summary.phase,
  currentSpeakerIndex: 0,
  currentSpeakerId: summary.currentSpeakerId ?? null,
  selectedWordPair: getDefaultWordPair(),
  selectedCard: summary.selectedCard ?? null,
  result: summary.result ?? null,
  punishmentTargetId: summary.punishmentTargetId ?? null,
  privateWord: null,
  privateRole: null,
})

const PartyGamesPlugin = ({ config }: Props) => {
  const defaultMode = readDefaultMode(config)
  const defaultMaxPlayers = readDefaultMaxPlayers(config)
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [room, setRoom] = useState<LocalPartyRoom | null>(null)
  const [session, setSession] = useState<PartyRoomSession | null>(null)
  const [selectedMode, setSelectedMode] = useState<PartyGameMode>(defaultMode)
  const [submitting, setSubmitting] = useState(false)
  const [roomError, setRoomError] = useState('')
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle')
  const socketRef = useRef<WebSocket | null>(null)
  const roomCode = room?.code ?? null
  const sessionPlayerId = session?.playerId ?? null

  const createOnlineRoom = async (nickname: string, settings: PartyRoomSettings) => {
    setSubmitting(true)
    setRoomError('')
    try {
      const response = await fetch('/api/party/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, settings }),
      })
      const json = await response.json()
      if (!json.ok) throw new Error(json.error?.message || '创建房间失败')
      setRoom(toLocalRoom(json.data.room))
      setSession(json.data.session)
      setCreateOpen(false)
    } catch (error) {
      setRoomError(error instanceof Error ? error.message : '在线房间服务暂不可用')
    } finally {
      setSubmitting(false)
    }
  }

  const joinOnlineRoom = async (nickname: string, code: string) => {
    setSubmitting(true)
    setRoomError('')
    try {
      const response = await fetch(`/api/party/rooms/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      })
      const json = await response.json()
      if (!json.ok) throw new Error(json.error?.message || '加入房间失败')
      setRoom(toLocalRoom(json.data.room))
      setSession(json.data.session)
      setJoinOpen(false)
    } catch (error) {
      setRoomError(error instanceof Error ? error.message : '在线房间服务暂不可用')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (!roomCode || !sessionPlayerId) return undefined

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const socket = new WebSocket(`${protocol}//${window.location.host}/api/party/rooms/${roomCode}/connect?playerId=${encodeURIComponent(sessionPlayerId)}`)
    socketRef.current = socket
    setConnectionState('connecting')

    socket.addEventListener('open', () => {
      setConnectionState('connected')
      setRoomError('')
    })

    socket.addEventListener('message', (event) => {
      try {
        const payload = JSON.parse(String(event.data || '{}'))
        if (payload.type === 'room_state' && payload.room) {
          setRoom((current) => {
            const next = toLocalRoom(payload.room)
            if (current?.privateWord) next.privateWord = current.privateWord
            if (current?.privateRole) next.privateRole = current.privateRole
            return next
          })
        }
        if (payload.type === 'private_state') {
          setRoom((current) => (current ? {
            ...current,
            privateWord: payload.privateWord ?? null,
            privateRole: payload.role ?? null,
          } : current))
        }
      } catch {
        setRoomError('房间状态同步失败')
      }
    })

    socket.addEventListener('close', () => {
      setConnectionState('disconnected')
      if (socketRef.current === socket) socketRef.current = null
    })

    socket.addEventListener('error', () => {
      setConnectionState('disconnected')
      setRoomError('房间连接已断开')
    })

    return () => {
      if (socketRef.current === socket) socketRef.current = null
      socket.close()
    }
  }, [roomCode, sessionPlayerId])

  const leaveRoom = () => {
    socketRef.current?.close()
    socketRef.current = null
    setRoom(null)
    setSession(null)
    setConnectionState('idle')
    setRoomError('')
  }

  const startRoom = () => {
    const socket = socketRef.current
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'start_game' }))
      return
    }
    setRoom((current) => (current ? { ...current, phase: 'word' } : current))
  }

  const sendRoomEvent = (payload: Record<string, unknown>) => {
    const socket = socketRef.current
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload))
      return
    }

    setRoom((current) => {
      if (!current) return current
      if (payload.type === 'next_speaker') {
        if (current.phase === 'word') return { ...current, phase: 'speaking', currentSpeakerId: current.players[0]?.id ?? null }
        if (current.phase === 'speaking') {
          const currentIndex = current.players.findIndex((player) => player.id === current.currentSpeakerId)
          const nextPlayer = current.players[currentIndex + 1]
          if (nextPlayer) return { ...current, currentSpeakerId: nextPlayer.id }
          return { ...current, phase: 'voting' }
        }
        return current
      }
      if (payload.type === 'submit_vote') {
        return { ...current, phase: 'result', result: { eliminatedId: String(payload.suspectId || ''), eliminatedRole: 'undercover', winner: 'civilians' }, punishmentTargetId: String(payload.suspectId || '') }
      }
      if (payload.type === 'finish_vote') {
        return { ...current, phase: 'result', result: { eliminatedId: current.players[0]?.id ?? 'host', eliminatedRole: 'undercover', winner: 'civilians' }, punishmentTargetId: current.players[0]?.id ?? 'host' }
      }
      if (payload.type === 'move_to_punishment') {
        return { ...current, phase: 'punishment' }
      }
      if (payload.type === 'draw_punishment') {
        return { ...current, phase: 'punishment', selectedCard: truthOrDareCards.find((card) => payload.choice === 'random' || card.type === payload.choice) ?? truthOrDareCards[0] }
      }
      if (payload.type === 'complete_punishment') {
        return current.settings.mode === 'truth-or-dare'
          ? { ...current, selectedCard: null, punishmentTargetId: current.players[1]?.id ?? current.players[0]?.id ?? null }
          : { ...current, phase: 'waiting', selectedCard: null, result: null, punishmentTargetId: null }
      }
      return current
    })
  }

  const copyInvite = async () => {
    if (!room) return
    const inviteUrl = `${window.location.origin}/#/party-games?room=${room.code}`
    try {
      await navigator.clipboard.writeText(inviteUrl)
    } catch {
      setRoomError('复制邀请失败')
    }
  }

  if (room?.phase === 'waiting') {
    return (
      <section id="party-games" className="space-y-5 scroll-mt-24">
        <WaitingRoomView
          room={room}
          connectionLabel={
            connectionState === 'connected'
              ? '已连接'
              : connectionState === 'connecting'
                ? '连接中...'
                : connectionState === 'disconnected'
                  ? '连接中断'
                  : '未连接'
          }
          canStart={Boolean(session?.host)}
          onStart={startRoom}
          onCopyInvite={() => { void copyInvite() }}
          onLeave={leaveRoom}
        />
        {roomError && <p className="text-sm text-[#fca5a5]">{roomError}</p>}
      </section>
    )
  }

  if (room && room.phase !== 'punishment') {
    return (
      <section id="party-games" className="space-y-5 scroll-mt-24">
        <UndercoverRoundView
          room={room}
          isHost={Boolean(session?.host)}
          onAdvance={() => {
            if (room.phase === 'result') {
              sendRoomEvent({ type: 'move_to_punishment' })
              return
            }
            if (room.phase === 'voting' && sessionPlayerId) {
              sendRoomEvent({ type: 'finish_vote' })
              return
            }
            sendRoomEvent({ type: 'next_speaker' })
          }}
          onVote={(suspectId) => sendRoomEvent({ type: 'submit_vote', suspectId })}
        />
      </section>
    )
  }

  if (room?.phase === 'punishment') {
    const target = room.players.find((player) => player.id === room.punishmentTargetId)?.nickname ?? room.players[0]?.nickname ?? '玩家'
    return (
      <section id="party-games" className="space-y-5 scroll-mt-24">
        <TruthOrDarePanel
          targetName={target}
          card={room.selectedCard ?? null}
          onDraw={(choice) => sendRoomEvent({ type: 'draw_punishment', choice })}
          onDone={() => sendRoomEvent({ type: 'complete_punishment' })}
        />
      </section>
    )
  }

  return (
    <section id="party-games" className="space-y-5 scroll-mt-24">
      <div className="rounded-[28px] border border-border-subtle bg-[#151817] p-5 text-white">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold text-white/64">
            {selectedMode === 'undercover' ? '谁是卧底' : '真心话大冒险'}
          </span>
          <span className="text-xs font-semibold text-white/48">最多 {defaultMaxPlayers} 人</span>
        </div>
        <h2 className="mt-4 font-headline-md text-3xl font-semibold tracking-tight">聚会游戏</h2>
        <p className="mt-2 font-body-md text-sm text-white/70">谁是卧底和真心话大冒险。</p>
        <div className="mt-4 grid grid-cols-2 rounded-2xl bg-white/8 p-1">
          <button
            type="button"
            onClick={() => setSelectedMode('undercover')}
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${selectedMode === 'undercover' ? 'bg-white text-[#151817]' : 'text-white/70'}`}
          >
            谁是卧底
          </button>
          <button
            type="button"
            onClick={() => setSelectedMode('truth-or-dare')}
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${selectedMode === 'truth-or-dare' ? 'bg-white text-[#151817]' : 'text-white/70'}`}
          >
            真心话大冒险
          </button>
        </div>
        <div className="mt-5 grid gap-3">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            disabled={submitting}
            className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#151817] disabled:opacity-60"
          >
            {submitting ? '处理中...' : '创建房间'}
          </button>
          <button
            type="button"
            onClick={() => setJoinOpen(true)}
            disabled={submitting}
            className="rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            加入房间
          </button>
        </div>
        {roomError && <p className="mt-3 text-sm text-[#fca5a5]">{roomError}</p>}
        {selectedMode === 'truth-or-dare' && (
          <p className="mt-3 text-xs text-white/55">真心话大冒险会先创建在线房间，独立抽卡流程放在后续阶段接入。</p>
        )}
      </div>

      <CreateRoomSheet
        open={createOpen}
        defaultMode={selectedMode}
        defaultMaxPlayers={defaultMaxPlayers}
        submitting={submitting}
        externalError={createOpen ? roomError : ''}
        onClose={() => setCreateOpen(false)}
        onCreate={(nickname, settings) => { void createOnlineRoom(nickname, settings) }}
      />
      <JoinRoomSheet
        open={joinOpen}
        submitting={submitting}
        externalError={joinOpen ? roomError : ''}
        onClose={() => setJoinOpen(false)}
        onJoin={(nickname, code) => { void joinOnlineRoom(nickname, code) }}
      />
    </section>
  )
}

export default PartyGamesPlugin
