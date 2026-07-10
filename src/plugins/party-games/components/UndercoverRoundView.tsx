import { useState } from 'react'
import { LocalPartyRoom } from '../types'
import PhaseStepper from './PhaseStepper'
import PlayerSeats from './PlayerSeats'
import DescriptionBoard, { DescriptionEntry } from './DescriptionBoard'

interface Props {
  room: LocalPartyRoom
  isHost: boolean
  onAdvance: () => void
  onVote: (suspectId: string) => void
  onDescription?: (content: string) => void
  onPlayAgain?: () => void
  descriptions?: DescriptionEntry[]
  currentPlayerId?: string | null
}

const UndercoverRoundView = ({
  room,
  isHost,
  onAdvance,
  onVote,
  onDescription,
  onPlayAgain,
  descriptions = [],
  currentPlayerId,
}: Props) => {
  const [wordRevealed, setWordRevealed] = useState(false)
  const [votedId, setVotedId] = useState<string | null>(null)

  const votedPlayerIds = new Set(votedId ? [votedId] : [])

  // 公共外框 — Double-Bezel 风格
  const Shell = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`overflow-hidden rounded-[32px] bg-gradient-to-br from-amber-100/80 via-orange-50/40 to-rose-100/60 p-[1.5px] shadow-[0_8px_48px_-16px_rgba(180,100,40,0.18)] ${className}`}>
      <div className="rounded-[30px] bg-white px-4 py-5">
        {children}
      </div>
    </div>
  )

  // ── 词语阶段 ──
  if (room.phase === 'word') {
    return (
      <div className="space-y-4">
        <PhaseStepper phase={room.phase} />

        <Shell>
          {/* 玩家座位区 */}
          <div className="mb-5">
            <PlayerSeats
              players={room.players}
              currentPlayerId={currentPlayerId}
              compact
            />
          </div>

          {/* 词语卡片 */}
          <button
            type="button"
            onClick={() => setWordRevealed((v) => !v)}
            className="party-tap-highlight w-full rounded-[24px] bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 p-6 text-center transition-all duration-300 active:scale-[0.97]"
          >
            {wordRevealed ? (
              <div className="animate-[party-pop-in_0.4s_cubic-bezier(0.16,1,0.3,1)_both]">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-purple-400">你的词语</span>
                <h2 className="mt-3 text-5xl font-bold tracking-tight text-purple-900">
                  {room.privateWord ?? '等待分发...'}
                </h2>
                <p className="mt-2 text-xs text-purple-400">👆 点击隐藏</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-3">
                <span className="text-5xl">👆</span>
                <span className="text-base font-semibold text-purple-400">点击查看你的词语</span>
                <span className="text-xs text-purple-300">查看后点击可隐藏，防止旁人偷看</span>
              </div>
            )}
          </button>

          {/* 身份 + 行动 */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
              <span className="text-sm font-medium text-gray-500">你的身份</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                room.privateRole === 'undercover'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-emerald-100 text-emerald-600'
              }`}>
                {room.privateRole === 'undercover' ? '🕵️ 卧底' : '👤 平民'}
              </span>
            </div>

            {isHost && (
              <button
                type="button"
                onClick={onAdvance}
                className="party-tap-highlight party-btn-press w-full rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-3.5 text-base font-semibold text-white shadow-[0_4px_16px_-4px_rgba(139,92,246,0.35)] transition-all duration-200 hover:shadow-[0_6px_20px_-4px_rgba(139,92,246,0.5)]"
              >
                🎤 开始发言
              </button>
            )}
            {!isHost && (
              <p className="text-center text-xs text-gray-400">等待房主开始发言环节</p>
            )}
          </div>
        </Shell>
      </div>
    )
  }

  // ── 发言阶段 ──
  if (room.phase === 'speaking') {
    const speaker = room.players.find((player) => player.id === room.currentSpeakerId) ?? room.players[0]
    const speakerIndex = room.players.findIndex((player) => player.id === room.currentSpeakerId)
    const isCurrentSpeaker = currentPlayerId === speaker.id

    return (
      <div className="space-y-4">
        <PhaseStepper phase={room.phase} />

        <Shell>
          {/* 当前发言人高亮 */}
          <div className="mb-5 text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 shadow-[0_4px_20px_rgba(251,146,60,0.2)]">
              <span className="text-4xl">🎤</span>
            </div>
            <h2 className="mt-2 text-xl font-bold text-gray-900">{speaker.nickname}</h2>
            <p className="text-sm text-amber-500 font-semibold">正在发言 · 第 {speakerIndex + 1}/{room.players.length} 位</p>
          </div>

          {/* 玩家座位 + 发言进度 */}
          <div className="mb-5">
            <PlayerSeats
              players={room.players}
              currentSpeakerId={room.currentSpeakerId}
              currentPlayerId={currentPlayerId}
              compact
            />
            {/* 进度条 */}
            <div className="mt-3 flex justify-center gap-1">
              {room.players.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-8 rounded-full transition-all duration-300 ${
                    i <= speakerIndex ? 'bg-amber-400' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 提示 */}
          <div className="mb-4 rounded-2xl bg-amber-50 px-4 py-3">
            <p className="text-sm leading-relaxed text-amber-700">
              💡 描述你的词语，但<strong>不能直接说出词语本身</strong>。其他人根据描述判断谁是卧底。
            </p>
          </div>

          {/* 描述记录板 */}
          <DescriptionBoard
            entries={descriptions}
            canInput={isCurrentSpeaker && Boolean(onDescription)}
            currentSpeakerName={speaker.nickname}
            onSubmit={onDescription}
            placeholder={`用一句话描述你的词语...`}
          />

          {/* 操作按钮 */}
          {isHost && (
            <button
              type="button"
              onClick={onAdvance}
              className="party-tap-highlight party-btn-press mt-5 w-full rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3.5 text-base font-semibold text-white shadow-[0_4px_16px_-4px_rgba(251,146,60,0.35)] transition-all duration-200"
            >
              {speakerIndex < room.players.length - 1 ? '➡️ 下一位发言' : '🗳️ 进入投票'}
            </button>
          )}
          {!isHost && (
            <p className="mt-3 text-center text-xs text-gray-400">等待房主推进流程</p>
          )}
        </Shell>
      </div>
    )
  }

  // ── 投票阶段 ──
  if (room.phase === 'voting') {
    return (
      <div className="space-y-4">
        <PhaseStepper phase={room.phase} />

        <Shell>
          <div className="mb-4 text-center">
            <span className="text-3xl">🗳️</span>
            <h2 className="mt-2 text-xl font-bold text-gray-900">选择你怀疑的人</h2>
            <p className="text-sm text-gray-400">你认为谁是卧底？</p>
          </div>

          {/* 玩家座位 + 投票 */}
          <PlayerSeats
            players={room.players}
            currentPlayerId={currentPlayerId}
            votedPlayerIds={votedPlayerIds}
            highlightedId={votedId ?? undefined}
            onVote={(id) => {
              setVotedId(id)
              onVote(id)
            }}
          />

          {/* 描述回顾 */}
          {descriptions.length > 0 && (
            <div className="mt-4">
              <DescriptionBoard entries={descriptions} />
            </div>
          )}

          {isHost && (
            <button
              type="button"
              onClick={onAdvance}
              className="party-tap-highlight party-btn-press mt-5 w-full rounded-2xl bg-gradient-to-r from-red-400 to-rose-500 px-5 py-3.5 text-base font-semibold text-white shadow-[0_4px_16px_-4px_rgba(251,113,133,0.35)] transition-all duration-200"
            >
              🎯 揭晓结果
            </button>
          )}
          {!isHost && (
            <p className="mt-3 text-center text-xs text-gray-400">等待房主揭晓结果</p>
          )}
        </Shell>
      </div>
    )
  }

  // ── 结果阶段 ──
  const gameEnded = room.result?.gameEnded === true
  const isTie = room.result?.eliminatedId === null
  const isUndercoverWin = room.result?.winner === 'undercover'
  const eliminatedPlayer = isTie ? null : room.players.find((p) => p.id === room.result?.eliminatedId)

  // Shell → gameEnded: red/green for final; not gameEnded: amber for "game continues"; tie: gray
  const shellBorder = isTie
    ? 'from-gray-200/80 via-slate-100/40 to-gray-200/60'
    : gameEnded
      ? (isUndercoverWin
          ? 'from-red-200/80 via-rose-100/40 to-pink-200/60'
          : 'from-emerald-200/80 via-green-100/40 to-teal-200/60')
      : 'from-amber-200/80 via-orange-100/40 to-yellow-200/60'

  const iconBg = isTie
    ? 'bg-gradient-to-br from-gray-100 to-slate-100'
    : gameEnded
      ? (isUndercoverWin
          ? 'bg-gradient-to-br from-red-100 to-rose-100'
          : 'bg-gradient-to-br from-emerald-100 to-green-100')
      : 'bg-gradient-to-br from-amber-100 to-orange-100'

  const titleCls = isTie
    ? 'text-gray-500'
    : gameEnded
      ? (isUndercoverWin ? 'text-red-500' : 'text-emerald-500')
      : 'text-amber-600'

  const titleText = isTie
    ? '平票！'
    : gameEnded
      ? (isUndercoverWin ? '卧底胜利！' : '平民胜利！')
      : '淘汰结算'

  const subtitleText = isTie
    ? '票数相同，本局作废——重新开始后将分配新的身份和词语'
    : gameEnded
      ? (isUndercoverWin ? '卧底成功隐藏到了最后！' : '卧底被成功找出，游戏结束！')
      : '卧底仍然存活——游戏继续，进入下一轮发言'

  const advanceLabel = isTie
    ? '🔄 票数相同，重新开始'
    : gameEnded
      ? '🎲 进入惩罚环节'
      : '⚡ 进入惩罚环节，然后继续游戏'

  return (
    <div className="space-y-4">
      <PhaseStepper phase={room.phase} />

      <Shell className={shellBorder}>
        {/* 结果展示 */}
        <div className="text-center">
          <div className={`animate-[party-pop-in_0.5s_cubic-bezier(0.16,1,0.3,1)_both] mx-auto flex size-20 items-center justify-center rounded-full ${iconBg}`}>
            <span className="text-4xl">{isTie ? '🤝' : gameEnded ? (isUndercoverWin ? '🕵️' : '🎉') : '🔄'}</span>
          </div>
          <h2 className={`mt-3 text-3xl font-bold ${titleCls}`}>{titleText}</h2>
          <p className="mt-2 text-sm text-gray-400">{subtitleText}</p>
        </div>

        {/* 被淘汰玩家（平票时不存在） */}
        {eliminatedPlayer && (
          <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-4">
            <p className="text-center text-sm text-gray-500">
              被投票出局：
              <span className="font-bold text-gray-800"> {eliminatedPlayer.nickname}</span>
            </p>
            <p className="mt-1 text-center text-xs text-gray-400">
              {room.result?.eliminatedRole === 'undercover'
                ? '身份：卧底 — 卧底被成功找出！'
                : '身份：平民 — 卧底成功隐藏！'}
            </p>
          </div>
        )}

        {/* 描述回顾 */}
        {descriptions.length > 0 && (
          <div className="mt-4">
            <DescriptionBoard entries={descriptions} />
          </div>
        )}

        {/* 玩家座位 */}
        <div className="mt-4">
          <PlayerSeats
            players={room.players}
            eliminatedId={room.result?.eliminatedId ?? undefined}
            compact
          />
        </div>

        {isHost && (
          <button
            type="button"
            onClick={onAdvance}
            className="party-tap-highlight party-btn-press mt-5 w-full rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3.5 text-base font-semibold text-white shadow-[0_4px_16px_-4px_rgba(251,146,60,0.35)] transition-all duration-200"
          >
            {advanceLabel}
          </button>
        )}

        {!isHost && gameEnded && (
          <p className="mt-4 text-center text-xs text-gray-400">等待房主操作</p>
        )}

        {gameEnded && onPlayAgain && (
          <button
            type="button"
            onClick={onPlayAgain}
            className="party-tap-highlight party-btn-press mt-3 w-full rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-3.5 text-base font-semibold text-white shadow-[0_4px_16px_-4px_rgba(139,92,246,0.35)] transition-all duration-200"
          >
            🔄 再来一局
          </button>
        )}
      </Shell>
    </div>
  )
}

export default UndercoverRoundView
