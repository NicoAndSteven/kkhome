import { FormEvent, useState } from 'react'
import { Icon } from '@components'
import { PartyGameMode, PartyRoomSettings, PunishmentMode } from '../types'

interface Props {
  open: boolean
  defaultMode: PartyGameMode
  defaultMaxPlayers: number
  onClose: () => void
  onCreate: (nickname: string, settings: PartyRoomSettings) => void
}

const clampPlayers = (value: number) => Math.min(12, Math.max(3, value))

const CreateRoomSheet = ({ open, defaultMode, defaultMaxPlayers, onClose, onCreate }: Props) => {
  const [nickname, setNickname] = useState('房主')
  const [mode, setMode] = useState<PartyGameMode>(defaultMode)
  const [maxPlayers, setMaxPlayers] = useState(clampPlayers(defaultMaxPlayers))
  const [punishmentMode, setPunishmentMode] = useState<PunishmentMode>('random')
  const [message, setMessage] = useState('')

  if (!open) return null

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const normalizedNickname = nickname.trim()
    if (normalizedNickname.length < 1 || normalizedNickname.length > 12) {
      setMessage('昵称需要 1-12 个字')
      return
    }

    onCreate(normalizedNickname, {
      mode,
      maxPlayers,
      allowLateJoin: true,
      wordCategory: '生活',
      punishmentMode,
    })
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm" onClick={onClose} />
      <form
        role="dialog"
        aria-label="创建房间"
        onSubmit={submit}
        className="fixed inset-x-3 bottom-3 z-50 rounded-[30px] border border-white/10 bg-[#141715] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-white shadow-[0_30px_90px_-40px_rgba(0,0,0,0.65)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-headline-md text-2xl font-semibold">创建房间</h3>
            <p className="mt-1 text-sm text-white/62">设置人数上限，朋友可以用房间码加入。</p>
          </div>
          <button type="button" onClick={onClose} aria-label="关闭创建房间" className="rounded-full border border-white/15 p-2 text-white/70">
            <Icon name="close" className="text-lg" />
          </button>
        </div>

        <label className="mt-5 grid gap-2">
          <span className="text-xs font-semibold text-white/64">昵称</span>
          <input
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={12}
            className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-base text-white outline-none focus:border-white/35"
          />
        </label>

        <div className="mt-4 grid gap-2">
          <span className="text-xs font-semibold text-white/64">游戏模式</span>
          <div className="grid grid-cols-2 rounded-2xl bg-white/8 p-1">
            {[
              ['undercover', '谁是卧底'],
              ['truth-or-dare', '真心话大冒险'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id as PartyGameMode)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold ${mode === id ? 'bg-white text-[#141715]' : 'text-white/70'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/12 bg-white/6 px-4 py-3">
          <div>
            <label htmlFor="party-max-players" className="block text-xs font-semibold text-white/64">最多人数</label>
            <input id="party-max-players" aria-label="最多人数" readOnly value={maxPlayers} className="mt-1 w-12 bg-transparent text-2xl font-semibold text-white outline-none" />
          </div>
          <div className="flex gap-2">
            <button type="button" aria-label="减少人数" onClick={() => setMaxPlayers((value) => clampPlayers(value - 1))} className="grid size-10 place-items-center rounded-full border border-white/15">
              <Icon name="chevron_left" />
            </button>
            <button type="button" aria-label="增加人数" onClick={() => setMaxPlayers((value) => clampPlayers(value + 1))} className="grid size-10 place-items-center rounded-full border border-white/15">
              <Icon name="chevron_right" />
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <span className="text-xs font-semibold text-white/64">输家惩罚</span>
          <div className="grid grid-cols-4 gap-2">
            {[
              ['off', '关闭'],
              ['truth', '真心话'],
              ['dare', '大冒险'],
              ['random', '随机'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setPunishmentMode(id as PunishmentMode)}
                className={`rounded-xl border px-2 py-2 text-xs font-semibold ${punishmentMode === id ? 'border-white bg-white text-[#141715]' : 'border-white/12 text-white/68'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {message && <p className="mt-3 text-sm text-[#fca5a5]">{message}</p>}

        <button type="submit" className="mt-5 w-full rounded-full bg-[#f4d35e] px-5 py-3 text-sm font-bold text-[#141715]">
          确认创建
        </button>
      </form>
    </>
  )
}

export default CreateRoomSheet
