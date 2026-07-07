import { LocalPartyRoom } from '../types'

interface Props {
  room: LocalPartyRoom
  isHost: boolean
  onAdvance: () => void
  onVote: (suspectId: string) => void
}

const UndercoverRoundView = ({ room, isHost, onAdvance, onVote }: Props) => {
  if (room.phase === 'word') {
    return (
      <div className="rounded-[28px] border border-white/10 bg-[#151817] p-5 text-white">
        <p className="text-sm text-white/62">长按查看你的词</p>
        <div className="mt-5 rounded-[26px] bg-[#f7f0d5] p-6 text-[#151817]">
          <span className="text-xs font-semibold text-[#151817]/50">你的词</span>
          <h2 className="mt-3 text-center text-4xl font-bold">{room.privateWord ?? '等待分发...'}</h2>
        </div>
        <p className="mt-3 text-xs text-white/48">{room.privateRole === 'undercover' ? '你的身份：卧底' : '你的身份：平民'}</p>
        {isHost && (
          <button type="button" onClick={onAdvance} className="mt-5 w-full rounded-full bg-[#f4d35e] px-5 py-3 text-sm font-bold text-[#151817]">
            进入发言
          </button>
        )}
      </div>
    )
  }

  if (room.phase === 'speaking') {
    const speaker = room.players.find((player) => player.id === room.currentSpeakerId) ?? room.players[0]
    return (
      <div className="rounded-[28px] border border-white/10 bg-[#151817] p-5 text-white">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/48">当前发言</span>
        <h2 className="mt-3 text-3xl font-semibold">{speaker?.nickname ?? '玩家'}</h2>
        <p className="mt-2 text-sm text-white/62">每个人描述一次自己的词，不能直接说出词语。</p>
        {isHost && (
          <button type="button" onClick={onAdvance} className="mt-5 w-full rounded-full bg-[#f4d35e] px-5 py-3 text-sm font-bold text-[#151817]">
            下一位 / 进入投票
          </button>
        )}
      </div>
    )
  }

  if (room.phase === 'voting') {
    return (
      <div className="rounded-[28px] border border-white/10 bg-[#151817] p-5 text-white">
        <h2 className="text-2xl font-semibold">选择你怀疑的人</h2>
        <div className="mt-5 space-y-2">
          {room.players.map((player) => (
            <button
              key={player.id}
              type="button"
              onClick={() => onVote(player.id)}
              className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-left text-sm font-semibold"
            >
              {player.nickname}
            </button>
          ))}
        </div>
        {isHost && (
          <button type="button" onClick={onAdvance} className="mt-5 w-full rounded-full bg-white px-5 py-3 text-sm font-bold text-[#151817]">
            揭晓结果
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-[#151817] p-5 text-white">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f4d35e]">结果</span>
      <h2 className="mt-3 text-4xl font-semibold">{room.result?.winner === 'undercover' ? '卧底胜利' : '平民胜利'}</h2>
      <p className="mt-2 text-sm text-white/62">
        {room.result?.eliminatedRole === 'undercover' ? '卧底被投出，可以进入惩罚环节。' : '平民被投出，卧底仍有机会翻盘。'}
      </p>
      {isHost && (
        <button type="button" onClick={onAdvance} className="mt-5 w-full rounded-full bg-[#f4d35e] px-5 py-3 text-sm font-bold text-[#151817]">
          抽惩罚
        </button>
      )}
    </div>
  )
}

export default UndercoverRoundView
