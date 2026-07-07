import { Icon } from '@components'
import { LocalPartyRoom } from '../types'

interface Props {
  room: LocalPartyRoom
  connectionLabel: string
  canStart: boolean
  onStart: () => void
  onCopyInvite: () => void
  onLeave: () => void
}

const WaitingRoomView = ({ room, connectionLabel, canStart, onStart, onCopyInvite, onLeave }: Props) => (
  <div className="rounded-[28px] border border-white/10 bg-[#151817] p-5 text-white">
    <div className="flex items-start justify-between gap-4">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/48">房间码</span>
        <h2 className="mt-1 font-label-mono text-4xl font-bold tracking-[0.16em]">{room.code}</h2>
      </div>
      <button type="button" onClick={onLeave} aria-label="离开房间" className="rounded-full border border-white/15 p-2 text-white/70">
        <Icon name="close" className="text-lg" />
      </button>
    </div>

    <div className="mt-5 grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-white/8 p-4">
        <span className="text-xs text-white/50">当前人数</span>
        <strong className="mt-1 block text-2xl">{room.players.length} / {room.settings.maxPlayers}</strong>
      </div>
      <div className="rounded-2xl bg-white/8 p-4">
        <span className="text-xs text-white/50">惩罚</span>
        <strong className="mt-1 block text-base">{room.settings.punishmentMode === 'random' ? '随机' : room.settings.punishmentMode}</strong>
      </div>
    </div>

    <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
      <div>
        <span className="text-xs text-white/50">连接状态</span>
        <p className="mt-1 text-sm font-semibold">{connectionLabel}</p>
      </div>
      <button
        type="button"
        onClick={onCopyInvite}
        className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/85"
      >
        复制邀请
      </button>
    </div>

    <div className="mt-5 space-y-2">
      {room.players.map((player, index) => (
        <div key={player.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-[#f4d35e] text-sm font-bold text-[#151817]">{index + 1}</span>
            <div>
              <p className="text-sm font-semibold">{player.nickname}</p>
              <p className="text-xs text-white/48">{player.host ? '房主' : '玩家'} · {player.status === 'online' ? '在线' : '离线'}</p>
            </div>
          </div>
        </div>
      ))}
    </div>

    <button
      type="button"
      onClick={onStart}
      disabled={!canStart}
      className="mt-5 w-full rounded-full bg-[#f4d35e] px-5 py-3 text-sm font-bold text-[#151817] disabled:cursor-not-allowed disabled:opacity-50"
    >
      开始游戏
    </button>
  </div>
)

export default WaitingRoomView
