import { PartyPlayer } from '../types'
import GameAvatar from './GameAvatar'

interface Props {
  players: PartyPlayer[]
  currentSpeakerId?: string | null
  currentPlayerId?: string | null
  votedPlayerIds?: Set<string>
  eliminatedId?: string | null
  highlightedId?: string | null
  onVote?: (playerId: string) => void
  compact?: boolean
}

const PlayerSeats = ({
  players,
  currentSpeakerId,
  currentPlayerId,
  votedPlayerIds,
  eliminatedId,
  highlightedId,
  onVote,
  compact = false,
}: Props) => {
  if (players.length === 0) return null

  const rowSize = compact ? 4 : 3
  const rows: PartyPlayer[][] = []
  for (let i = 0; i < players.length; i += rowSize) {
    rows.push(players.slice(i, i + rowSize))
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {rows.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className="flex justify-center gap-3"
        >
          {row.map((player) => {
            const isSpeaking = player.id === currentSpeakerId
            const isCurrent = player.id === currentPlayerId
            const isEliminated = player.id === eliminatedId
            const isHighlighted = player.id === highlightedId
            const hasVoted = votedPlayerIds?.has(player.id)

            return (
              <button
                key={player.id}
                type={onVote ? 'button' : undefined}
                onClick={onVote ? () => onVote(player.id) : undefined}
                disabled={isEliminated}
                className={`party-tap-highlight flex flex-col items-center gap-1.5 transition-all duration-300 ${
                  onVote ? 'cursor-pointer active:scale-95' : 'cursor-default'
                }`}
              >
                {/* 卡通头像 */}
                <GameAvatar
                  playerId={player.id}
                  size={compact ? 'sm' : 'md'}
                  isSpeaking={isSpeaking}
                  isCurrent={isCurrent}
                  isEliminated={isEliminated}
                />

                {/* 名字 */}
                <span
                  className={`text-xs font-semibold transition-colors duration-300 ${
                    isSpeaking
                      ? 'text-amber-600'
                      : isCurrent
                        ? 'text-blue-600'
                        : isEliminated
                          ? 'text-gray-300'
                          : 'text-gray-600'
                  }`}
                >
                  {player.nickname}
                  {player.host && <span className="ml-0.5 text-[10px]">👑</span>}
                </span>

                {/* 状态标签 */}
                <div className="flex items-center gap-1">
                  {isSpeaking && (
                    <span className="animate-[party-pop-in_0.3s_ease] rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                      🎤 发言中
                    </span>
                  )}
                  {hasVoted && !isSpeaking && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                      ✅ 已投票
                    </span>
                  )}
                  {isHighlighted && !isSpeaking && !hasVoted && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-500">
                      🎯 被怀疑
                    </span>
                  )}
                  {isEliminated && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-400">
                      😵 出局
                    </span>
                  )}
                  {player.status === 'offline' && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-400">
                      离线
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default PlayerSeats
