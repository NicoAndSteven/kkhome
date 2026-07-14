/* global WebSocket */

import { useEffect, useMemo, useRef, useState } from 'react'
import { PluginRuntimeConfig } from '@core/types'
import CreateRoomSheet from './components/CreateRoomSheet'
import JoinRoomSheet from './components/JoinRoomSheet'
import WaitingRoomView from './components/WaitingRoomView'
import UndercoverRoundView from './components/UndercoverRoundView'
import TruthOrDareGameView from './components/TruthOrDareGameView'
import { getDefaultWordPair, truthOrDareCards } from './content'
import { useLocalGame } from './useLocalGame'
import { DescriptionEntry, LocalPartyRoom, PartyGameMode, PartyRoomSettings } from './types'

// ── 浮动背景粒子 ──────────────────────────────────

const FLOATING_EMOJIS = ['🎈', '✨', '🌟', '🎉', '🎊', '🎯', '🎲', '🃏', '🎭', '💫', '⭐', '🌈', '🪅', '🎪', '🎠']

const FloatingParticles = () => {
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      emoji: FLOATING_EMOJIS[i % FLOATING_EMOJIS.length],
      left: `${(i * 8 + 3) % 92}%`,
      delay: `${(i * 0.7) % 5}s`,
      duration: `${4 + (i % 3) * 2}s`,
      size: i % 3 === 0 ? 'text-lg' : i % 3 === 1 ? 'text-xl' : 'text-sm',
    })),
  [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className={`absolute ${p.size} opacity-20`}
          style={{
            left: p.left,
            animation: `party-float ${p.duration} ease-in-out ${p.delay} infinite`,
            bottom: '-20px',
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  )
}

// ── 类型 ────────────────────────────────────────────

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
  descriptions?: DescriptionEntry[]
}

interface PartyRoomSession {
  playerId: string
  host: boolean
  connectToken: string
}

type GameMode = 'online' | 'local'

// ── 工具函数 ────────────────────────────────────────

const readDefaultMode = (config?: PluginRuntimeConfig): PartyGameMode => (
  config?.defaultMode === 'truth-or-dare' ? 'truth-or-dare' : 'undercover'
)

const readDefaultMaxPlayers = (mode?: PartyGameMode) =>
  mode === 'truth-or-dare' ? 2 : 6

// ── 主组件 ──────────────────────────────────────────

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
  descriptions: summary.descriptions ?? [],
  roles: {},
  words: {},
  votes: {},
  truthOrDareTurnIndex: 0,
})

// ── 随机名字 ────────────────────────────────────────

const RANDOM_NAMES = [
  '小明', '小红', '小刚', '小丽', '阿杰', '阿花', '大壮', '小美',
  '老王', '小李', '大白', '小黑', '豆豆', '球球', '乐乐', '欢欢',
  '闪电', '暴风', '奶茶', '可乐', '西瓜', '芒果', '布丁', '果冻',
]

const pickRandomName = (used: Set<string>): string => {
  const available = RANDOM_NAMES.filter((n) => !used.has(n))
  if (available.length === 0) return `玩家${used.size + 1}`
  return available[Math.floor(Math.random() * available.length)]
}

// ── 主组件 ──────────────────────────────────────────

const PartyGamesPlugin = ({ config }: Props) => {
  const defaultMode = readDefaultMode(config)

  // 在线模式状态
  const [gameMode, setGameMode] = useState<GameMode>('local')
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [room, setRoom] = useState<LocalPartyRoom | null>(null)
  const [session, setSession] = useState<PartyRoomSession | null>(null)
  const [selectedMode, setSelectedMode] = useState<PartyGameMode>(defaultMode)
  const defaultMaxPlayers = readDefaultMaxPlayers(selectedMode)
  const [submitting, setSubmitting] = useState(false)
  const [roomError, setRoomError] = useState('')
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle')
  const [inviteRoomCode, setInviteRoomCode] = useState('')
  const [createSheetKey, setCreateSheetKey] = useState(0)
  const socketRef = useRef<WebSocket | null>(null)
  const roomCode = room?.code ?? null
  const sessionPlayerId = session?.playerId ?? null
  const sessionConnectToken = session?.connectToken ?? ''

  // ── 邀请链接检测：?room=CODE ──────────────────────
  useEffect(() => {
    const match = window.location.hash.match(/[?&]room=([A-Z0-9]{4,6})/i)
    if (match) {
      const code = match[1].toUpperCase()
      setInviteRoomCode(code)
      setGameMode('online')
      setJoinOpen(true)
      // Clear param from hash to prevent re-trigger on refresh
      const cleaned = window.location.hash.replace(/[?&]room=[A-Z0-9]{4,6}/i, '').replace(/\?$/, '')
      if (cleaned !== window.location.hash) {
        window.location.hash = cleaned || '#/party-games'
      }
    }
  }, [])

  // 本地模式引擎
  const localGame = useLocalGame()

  // ── 在线模式：API ──────────────────────────────

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

  // ── 在线模式：WebSocket ─────────────────────────

  useEffect(() => {
    if (!roomCode || !sessionPlayerId || gameMode !== 'online') return undefined

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const socket = new WebSocket(`${protocol}//${window.location.host}/api/party/rooms/${roomCode}/connect?playerId=${encodeURIComponent(sessionPlayerId)}&connectToken=${encodeURIComponent(sessionConnectToken)}`)
    socketRef.current = socket
    setConnectionState('connecting')

    socket.addEventListener('open', () => { setConnectionState('connected'); setRoomError('') })
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
          setRoom((current) => (current ? { ...current, privateWord: payload.privateWord ?? null, privateRole: payload.role ?? null } : current))
        }
        if (payload.type === 'kicked') {
          setRoomError('你在其他设备打开了这个房间，当前连接已断开')
          leaveOnlineRoom()
        }
      } catch { setRoomError('房间状态同步失败') }
    })
    socket.addEventListener('close', () => { setConnectionState('disconnected'); if (socketRef.current === socket) socketRef.current = null })
    socket.addEventListener('error', () => { setConnectionState('disconnected'); setRoomError('房间连接已断开') })
    return () => { if (socketRef.current === socket) socketRef.current = null; socket.close() }
  }, [roomCode, sessionPlayerId, gameMode])

  // ── 在线模式：操作 ──────────────────────────────

  const leaveOnlineRoom = () => { socketRef.current?.close(); socketRef.current = null; setRoom(null); setSession(null); setConnectionState('idle'); setRoomError('') }
  const startOnlineRoom = () => { const s = socketRef.current; if (s?.readyState === WebSocket.OPEN) { s.send(JSON.stringify({ type: 'start_game' })); return }; setRoom((c) => (c ? { ...c, phase: 'word' } : c)) }
  const sendRoomEvent = (payload: Record<string, unknown>) => {
    const s = socketRef.current
    if (s?.readyState === WebSocket.OPEN) { s.send(JSON.stringify(payload)); return }
    setRoom((current) => {
      if (!current) return current
      if (payload.type === 'next_speaker') { if (current.phase === 'word') return { ...current, phase: 'speaking', currentSpeakerId: current.players[0]?.id ?? null }; if (current.phase === 'speaking') { const ci = current.players.findIndex((p) => p.id === current.currentSpeakerId); const np = current.players[ci + 1]; if (np) return { ...current, currentSpeakerId: np.id }; return { ...current, phase: 'voting' } }; return current }
      if (payload.type === 'submit_vote') return { ...current, phase: 'result', result: { eliminatedId: String(payload.suspectId || ''), eliminatedRole: 'undercover', gameEnded: true, winner: 'civilians' }, punishmentTargetId: String(payload.suspectId || '') }
      if (payload.type === 'finish_vote') return { ...current, phase: 'result', result: { eliminatedId: current.players[0]?.id ?? 'host', eliminatedRole: 'undercover', gameEnded: true, winner: 'civilians' }, punishmentTargetId: current.players[0]?.id ?? 'host' }
      if (payload.type === 'move_to_punishment') return { ...current, phase: 'punishment' }
      if (payload.type === 'draw_punishment') return { ...current, phase: 'punishment', selectedCard: truthOrDareCards.find((card) => payload.choice === 'random' || card.type === payload.choice) ?? truthOrDareCards[0] }
      if (payload.type === 'complete_punishment') return current.settings.mode === 'truth-or-dare' ? { ...current, selectedCard: null, punishmentTargetId: current.players[1]?.id ?? current.players[0]?.id ?? null } : { ...current, phase: 'waiting', selectedCard: null, result: null, punishmentTargetId: null }
      return current
    })
  }

  const copyInvite = async () => {
    const r = room ?? localGame.room; if (!r) return
    try { await navigator.clipboard.writeText(`${window.location.origin}/#/party-games?room=${r.code}`) } catch { setRoomError('复制邀请失败') }
  }

  // ── 本地模式：合成 ──────────────────────────────

  const effectiveRoom = gameMode === 'local' ? localGame.room : room
  const effectiveIsHost = gameMode === 'local' ? localGame.isHost : Boolean(session?.host)
  const hasRoom = effectiveRoom !== null

  const minPlayersForMode = effectiveRoom?.settings.mode === 'undercover' ? 3 : 2
  const playerCount = effectiveRoom?.players.length ?? 0
  const canStart = effectiveIsHost && playerCount >= minPlayersForMode
  const startHint = effectiveIsHost
    ? `至少需要 ${minPlayersForMode} 名玩家才能开始（当前 ${playerCount} 人）`
    : '只有房主可以开始游戏'

  const handleCreateLocal = (nickname: string, settings: PartyRoomSettings) => { setRoomError(''); try { const r = localGame.createLocalRoom(nickname, settings); setRoom(r.room); setCreateOpen(false) } catch (e) { setRoomError(e instanceof Error ? e.message : '创建失败') } }
  const handleJoinLocal = (nickname: string, code: string) => { setRoomError(''); try { const r = localGame.joinLocalRoom(nickname, code); setRoom(r.room); localGame.switchToPlayer(r.playerId); setJoinOpen(false) } catch (e) { setRoomError(e instanceof Error ? e.message : '加入失败') } }
  const handleCreate = (nickname: string, settings: PartyRoomSettings) => { gameMode === 'local' ? handleCreateLocal(nickname, settings) : void createOnlineRoom(nickname, settings) }
  const handleJoin = (nickname: string, code: string) => { gameMode === 'local' ? handleJoinLocal(nickname, code) : void joinOnlineRoom(nickname, code) }
  const handleLeave = () => { gameMode === 'local' ? localGame.resetGame() : leaveOnlineRoom() }

  // ── 内容渲染 ────────────────────────────────────

  const descs = effectiveRoom?.descriptions ?? []
  const pid = gameMode === 'local' ? localGame.currentPlayerId : sessionPlayerId

  const renderGameContent = () => {
    if (!effectiveRoom) return null

    if (effectiveRoom.phase === 'waiting') {
      return (
        <WaitingRoomView
          room={effectiveRoom}
          connectionLabel={gameMode === 'local' ? '📱 本地模式' : connectionState === 'connected' ? '已连接' : connectionState === 'connecting' ? '连接中...' : connectionState === 'disconnected' ? '连接中断' : '未连接'}
          canStart={canStart}
          startHint={startHint}
          onStart={gameMode === 'local' ? () => localGame.startLocalGame() : startOnlineRoom}
          onCopyInvite={() => { void copyInvite() }}
          onLeave={handleLeave}
          showModeBadge={gameMode === 'local'}
        />
      )
    }

    // ── 真心话大冒险：专用游戏视图 ──
    if (effectiveRoom.settings.mode === 'truth-or-dare') {
      return (
        <TruthOrDareGameView
          room={effectiveRoom}
          isHost={effectiveIsHost}
          currentPlayerId={pid}
          onDraw={(choice) => {
            if (gameMode === 'local') { localGame.drawPunishment(choice); return }
            sendRoomEvent({ type: 'draw_punishment', choice })
          }}
          onDone={() => {
            if (gameMode === 'local') { localGame.completePunishment(); return }
            sendRoomEvent({ type: 'complete_punishment' })
          }}
          onRedraw={() => {
            if (gameMode === 'local') { localGame.drawPunishment('random'); return }
            sendRoomEvent({ type: 'draw_punishment', choice: 'random' })
          }}
          playerNames={new Map(effectiveRoom.players.map((p) => [p.id, p.nickname]))}
        />
      )
    }

    // ── 谁是卧底：推理游戏视图 ──
    return (
      <UndercoverRoundView
        room={effectiveRoom}
        isHost={effectiveIsHost}
        currentPlayerId={pid}
        descriptions={descs}
        onDescription={(content) => {
          if (gameMode === 'local') { localGame.submitDescription(content); return }
          const s = socketRef.current
          if (s?.readyState === WebSocket.OPEN) { s.send(JSON.stringify({ type: 'submit_description', content })) }
        }}
        onAdvance={() => {
          if (gameMode === 'local') {
            if (effectiveRoom.phase === 'word') localGame.advanceToSpeaking()
            else if (effectiveRoom.phase === 'speaking') localGame.nextSpeaker()
            else if (effectiveRoom.phase === 'voting') localGame.revealResult()
            else if (effectiveRoom.phase === 'result') localGame.moveToPunishment()
            return
          }
          if (effectiveRoom.phase === 'result') { sendRoomEvent({ type: 'move_to_punishment' }); return }
          if (effectiveRoom.phase === 'voting' && sessionPlayerId) { sendRoomEvent({ type: 'finish_vote' }); return }
          sendRoomEvent({ type: 'next_speaker' })
        }}
        onVote={(suspectId) => { gameMode === 'local' ? localGame.submitVote(suspectId) : sendRoomEvent({ type: 'submit_vote', suspectId }) }}
        onPlayAgain={() => {
          if (gameMode === 'local') { localGame.playAgain(); return }
          const s = socketRef.current
          if (s?.readyState === WebSocket.OPEN) { s.send(JSON.stringify({ type: 'reset_to_waiting' })) }
        }}
      />
    )
  }

  // ── 游戏内全屏覆盖层 ────────────────────────────

  if (hasRoom) {
    return (
      <>
        {/* 全屏覆盖层 */}
        <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-gradient-to-b from-amber-50 via-orange-50/60 to-rose-50">
          {/* 浮动背景 */}
          <FloatingParticles />

          {/* 顶部栏 */}
          <div className="relative z-10 shrink-0 px-4 pt-[max(12px,env(safe-area-inset-top))]">
            {/* 本地模式：玩家切换栏 */}
            {gameMode === 'local' && (
              <LocalModeBar
                room={effectiveRoom!}
                currentPlayerId={localGame.currentPlayerId}
                onSwitchPlayer={localGame.switchToPlayer}
                onAddPlayer={(nickname) => { try { localGame.joinLocalRoom(nickname, effectiveRoom!.code) } catch { /* noop */ } }}
                isHost={localGame.isHost}
                compact={effectiveRoom!.phase !== 'waiting'}
              />
            )}
          </div>

          {/* 滚动内容区 */}
          <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-[max(24px,env(safe-area-inset-bottom))]">
            <div className="mx-auto w-full max-w-lg py-4">
              {renderGameContent()}
              {roomError && <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-500">{roomError}</p>}
            </div>
          </div>
        </div>

        {/* 弹窗仍需要渲染 */}
        <CreateRoomSheet key={createSheetKey} open={createOpen} defaultMode={selectedMode} defaultMaxPlayers={defaultMaxPlayers} submitting={submitting} externalError={createOpen ? roomError : ''} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
        <JoinRoomSheet open={joinOpen} defaultCode={inviteRoomCode} submitting={submitting} externalError={joinOpen ? roomError : ''} onClose={() => setJoinOpen(false)} onJoin={handleJoin} />
      </>
    )
  }

  // ── 首页（非全屏） ──────────────────────────────

  return (
    <section id="party-games" className="space-y-5 scroll-mt-24 px-1">
      {/* 模式切换 */}
      <div className="mx-auto flex max-w-xs rounded-2xl bg-gray-100 p-1">
        {([
          ['local', '📱 本地测试'],
          ['online', '🌐 在线联机'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setGameMode(id as GameMode)}
            className={`party-tap-highlight flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${gameMode === id ? 'bg-white text-gray-900 shadow-[0_1px_4px_rgba(0,0,0,0.08)]' : 'text-gray-500'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 主卡片 */}
      <div className="party-anim-card overflow-hidden rounded-[32px] bg-gradient-to-br from-amber-400 via-orange-400 to-rose-500 p-[1.5px] shadow-[0_8px_40px_-12px_rgba(251,146,60,0.35)]">
        <div className="rounded-[30px] bg-white/95 px-5 py-6 backdrop-blur-sm">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">聚会游戏</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
            {gameMode === 'local' ? '单设备离线模式：添加玩家后传手机轮流操作。' : '和朋友一起玩谁是卧底和真心话大冒险。'}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1.5">
            <button type="button" onClick={() => setSelectedMode('undercover')} className={`party-tap-highlight rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${selectedMode === 'undercover' ? 'bg-white text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)]' : 'text-gray-500 active:bg-white/50'}`}>🕵️ 谁是卧底</button>
            <button type="button" onClick={() => setSelectedMode('truth-or-dare')} className={`party-tap-highlight rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${selectedMode === 'truth-or-dare' ? 'bg-white text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)]' : 'text-gray-500 active:bg-white/50'}`}>🎲 真心话大冒险</button>
          </div>

          <div className="mt-5 grid gap-2.5">
            <button type="button" onClick={() => { setCreateSheetKey(k => k + 1); setCreateOpen(true) }} disabled={submitting} className="party-tap-highlight party-btn-press w-full rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3.5 text-base font-semibold text-white shadow-[0_4px_16px_-4px_rgba(251,146,60,0.4)] transition-all duration-200 hover:shadow-[0_6px_20px_-4px_rgba(251,146,60,0.5)] disabled:opacity-50">
              {submitting ? '处理中...' : '🏠  创建房间'}
            </button>
            <button type="button" onClick={() => setJoinOpen(true)} disabled={submitting} className="party-tap-highlight party-btn-press w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3.5 text-base font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50">
              🔗 加入房间
            </button>
          </div>

          {roomError && <div className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-center text-sm font-medium text-red-500">{roomError}</div>}

          {gameMode === 'local' && (
            <div className="mt-4 rounded-2xl bg-blue-50 px-4 py-3">
              <p className="text-xs font-semibold text-blue-600">💡 本地测试模式</p>
              <ul className="mt-1.5 space-y-1 text-xs text-blue-500">
                <li>· 创建房间后，用「随机添加」按钮添加模拟玩家</li>
                <li>· 通过顶部切换器切换当前操作玩家（传手机）</li>
                <li>· 谁是卧底需要至少 3 名玩家，真心话大冒险 2 人即可</li>
                <li>· 进入游戏后全屏沉浸式体验</li>
              </ul>
            </div>
          )}

          {gameMode === 'online' && selectedMode === 'truth-or-dare' && (
            <p className="mt-4 text-center text-xs text-gray-400">真心话大冒险会先创建在线房间，方便多人轮流参与。</p>
          )}
        </div>
      </div>

      <CreateRoomSheet key={createSheetKey} open={createOpen} defaultMode={selectedMode} defaultMaxPlayers={defaultMaxPlayers} submitting={submitting} externalError={createOpen ? roomError : ''} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
      <JoinRoomSheet open={joinOpen} defaultCode={inviteRoomCode} submitting={submitting} externalError={joinOpen ? roomError : ''} onClose={() => setJoinOpen(false)} onJoin={handleJoin} />
    </section>
  )
}

// ── 本地模式：顶部操作栏 ──────────────────────────

interface LocalModeBarProps {
  room: LocalPartyRoom
  currentPlayerId: string | null
  onSwitchPlayer: (playerId: string) => void
  onAddPlayer: (nickname: string) => void
  isHost: boolean
  compact?: boolean
}

const LocalModeBar = ({ room, currentPlayerId, onSwitchPlayer, onAddPlayer, isHost, compact = false }: LocalModeBarProps) => {
  const usedNames = new Set(room.players.map((p) => p.nickname))
  const canAdd = room.players.length < room.settings.maxPlayers
  const handleAddRandom = () => onAddPlayer(pickRandomName(usedNames))

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 shadow-[0_1px_6px_rgba(0,0,0,0.06)] backdrop-blur-sm">
        <span className="shrink-0 rounded-lg bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-600">📱 本地</span>

        {!compact && (
          <>
            <span className="text-xs text-gray-400">当前：</span>
            <select value={currentPlayerId ?? ''} onChange={(e) => onSwitchPlayer(e.target.value)} className="flex-1 rounded-lg bg-gray-50 px-2 py-1 text-sm font-semibold text-gray-900 outline-none">
              {room.players.map((p) => (<option key={p.id} value={p.id}>{p.nickname}{p.host ? ' 👑' : ''}</option>))}
            </select>
          </>
        )}

        {compact && (
          <div className="flex flex-1 items-center gap-1.5 overflow-x-auto">
            {room.players.map((p) => (
              <button key={p.id} type="button" onClick={() => onSwitchPlayer(p.id)} className={`party-tap-highlight shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${p.id === currentPlayerId ? 'bg-blue-500 text-white shadow-[0_2px_6px_rgba(59,130,246,0.3)]' : 'bg-gray-100 text-gray-500'}`}>
                {p.nickname}{p.host ? '👑' : ''}
              </button>
            ))}
          </div>
        )}

        {!compact && isHost && canAdd && (
          <button type="button" onClick={handleAddRandom} className="party-tap-highlight shrink-0 rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100 active:bg-blue-200">+ 随机添加</button>
        )}
        {!compact && isHost && !canAdd && room.players.length > 0 && (
          <span className="shrink-0 text-xs text-gray-400">已满员</span>
        )}

        <button type="button" onClick={() => window.location.reload()} className="party-tap-highlight shrink-0 rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-400">退出</button>
      </div>

      {compact && (
        <p className="text-center text-[11px] text-gray-400">
          👆 当前：<span className="font-semibold text-gray-600">{room.players.find((p) => p.id === currentPlayerId)?.nickname ?? '—'}</span> — 点击切换
        </p>
      )}
    </div>
  )
}

export default PartyGamesPlugin
