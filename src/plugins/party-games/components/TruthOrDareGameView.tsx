import { LocalPartyRoom, TruthOrDareType } from '../types'
import GameAvatar from './GameAvatar'
import PlayerSeats from './PlayerSeats'

interface Props {
  room: LocalPartyRoom
  isHost: boolean
  currentPlayerId?: string | null
  onDraw: (type: TruthOrDareType | 'random') => void
  onDone: () => void
  onRedraw: () => void
  playerNames: Map<string, string>
}

const getIntensityTag = (intensity: string) => {
  switch (intensity) {
    case 'spicy': return { label: '🔥 刺激', cls: 'bg-red-100 text-red-600' }
    case 'normal': return { label: '😄 有趣', cls: 'bg-amber-100 text-amber-700' }
    default: return { label: '🌸 轻松', cls: 'bg-emerald-100 text-emerald-600' }
  }
}

const TruthOrDareGameView = ({ room, isHost, currentPlayerId, onDraw, onDone, onRedraw }: Props) => {
  const card = room.selectedCard
  const targetPlayer = room.players.find((p) => p.id === room.punishmentTargetId)
  const isMyTurn = currentPlayerId === targetPlayer?.id

  // 已完成历史（简化版：所有非当前玩家的已展示过的卡片计数）
  const turnIndex = room.players.findIndex((p) => p.id === room.punishmentTargetId)
  const completedCount = turnIndex >= 0 ? turnIndex : 0

  return (
    <div className="space-y-4">
      {/* 游戏标题区 */}
      <div className="overflow-hidden rounded-[28px] border border-orange-200/60 bg-white shadow-[0_2px_24px_-8px_rgba(251,146,60,0.12)] px-4 py-5">
          {/* 标题 */}
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-500">
              真心话大冒险
            </span>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">
              轮到 <span className="text-orange-500">{targetPlayer?.nickname ?? '玩家'}</span>
            </h2>
          </div>

          {/* 当前玩家大头像 */}
          {targetPlayer && (
            <div className="mt-4 flex justify-center">
              <div className="flex flex-col items-center">
                <GameAvatar
                  playerId={targetPlayer.id}
                  size="lg"
                  isSpeaking={true}
                />
                <p className="mt-2 text-sm font-semibold text-gray-700">
                  {targetPlayer.nickname}
                  {targetPlayer.host && ' 👑'}
                </p>
              </div>
            </div>
          )}

          {/* 卡片区域 */}
          <div className="mt-5">
            {card ? (
              <div className="animate-[party-pop-in_0.4s_cubic-bezier(0.16,1,0.3,1)_both]">
                {/* 卡片类型 + 强度 */}
                <div className="flex items-center justify-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                    card.type === 'truth'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {card.type === 'truth' ? '真心话' : '大冒险'}
                  </span>
                  {(() => { const t = getIntensityTag(card.intensity); return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${t.cls}`}>{t.label}</span> })()}
                </div>

                {/* 卡片内容 */}
                <div className={`mt-4 rounded-[24px] p-6 text-center ${
                  card.type === 'truth'
                    ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50'
                    : 'bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50'
                }`}>
                  <p className="text-2xl font-bold leading-relaxed text-gray-900">{card.content}</p>
                </div>

                {/* 操作按钮 */}
                {isMyTurn && (
                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={onDone}
                      className="rounded-2xl bg-gradient-to-r from-emerald-400 to-green-500 px-5 py-3.5 text-base font-semibold text-white shadow-[0_4px_16px_-4px_rgba(52,211,153,0.35)] transition-all duration-200 active:scale-[0.97]"
                    >
                      完成
                    </button>
                    <button
                      type="button"
                      onClick={onRedraw}
                      className="rounded-2xl border-2 border-gray-200 bg-white px-5 py-3.5 text-base font-semibold text-gray-600 transition-all duration-200 hover:bg-gray-50 active:scale-[0.97]"
                    >
                      换一题
                    </button>
                  </div>
                )}
                {!isMyTurn && isHost && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={onDone}
                      className="w-full rounded-2xl bg-gradient-to-r from-gray-400 to-gray-500 px-5 py-3.5 text-base font-semibold text-white transition-all duration-200 active:scale-[0.97]"
                    >
                      下一位
                    </button>
                  </div>
                )}
                {!isMyTurn && !isHost && (
                  <p className="mt-4 text-center text-xs text-gray-400">
                    等待 {targetPlayer?.nickname} 完成任务...
                  </p>
                )}
              </div>
            ) : (
              /* 选卡界面 */
              <div className="animate-[party-card-in_0.5s_cubic-bezier(0.16,1,0.3,1)_both]">
                <p className="text-center text-sm text-gray-500 mb-4">
                  {isMyTurn ? '选择一种类型' : `等待 ${targetPlayer?.nickname} 选择...`}
                </p>

                {isMyTurn && (
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => onDraw('truth')}
                      className="rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 px-4 py-5 text-sm font-semibold text-white shadow-[0_4px_16px_-4px_rgba(99,102,241,0.3)] transition-all duration-200 hover:shadow-[0_6px_20px_-4px_rgba(99,102,241,0.45)] active:scale-[0.97]"
                    >
                      <span className="block text-lg mb-1 font-bold">?</span>
                      真心话
                    </button>
                    <button
                      type="button"
                      onClick={() => onDraw('dare')}
                      className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 px-4 py-5 text-sm font-semibold text-white shadow-[0_4px_16px_-4px_rgba(251,146,60,0.3)] transition-all duration-200 hover:shadow-[0_6px_20px_-4px_rgba(251,146,60,0.45)] active:scale-[0.97]"
                    >
                      <span className="block text-lg mb-1 font-bold">!</span>
                      大冒险
                    </button>
                    <button
                      type="button"
                      onClick={() => onDraw('random')}
                      className="rounded-2xl bg-gradient-to-br from-gray-400 to-gray-600 px-4 py-5 text-sm font-semibold text-white shadow-[0_4px_16px_-4px_rgba(100,100,100,0.25)] transition-all duration-200 hover:shadow-[0_6px_20px_-4px_rgba(100,100,100,0.4)] active:scale-[0.97]"
                    >
                      <span className="block text-lg mb-1 font-bold">~</span>
                      随机
                    </button>
                  </div>
                )}

                {!isMyTurn && isHost && (
                  <div className="flex justify-center gap-2">
                    <button type="button" onClick={() => onDraw('truth')} className="rounded-xl bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100 active:scale-95">代抽：真心话</button>
                    <button type="button" onClick={() => onDraw('dare')} className="rounded-xl bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100 active:scale-95">代抽：大冒险</button>
                    <button type="button" onClick={() => onDraw('random')} className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-200 active:scale-95">代抽：随机</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      {/* 玩家座位 + 进度 */}
      <div className="overflow-hidden rounded-[28px] bg-white/80 px-4 py-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">玩家顺序</span>
          <span className="text-xs text-gray-400">
            已完成 {completedCount} / {room.players.length} 人
          </span>
        </div>

        <PlayerSeats
          players={room.players}
          currentSpeakerId={room.punishmentTargetId}
          currentPlayerId={currentPlayerId}
          compact
        />

        {/* 进度条 */}
        <div className="mt-3 flex justify-center gap-1">
          {room.players.map((_, i) => (
            <div
              key={i}
              className={`h-1 w-8 rounded-full transition-all duration-300 ${
                i < completedCount
                  ? 'bg-amber-300'
                  : i === completedCount
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default TruthOrDareGameView
