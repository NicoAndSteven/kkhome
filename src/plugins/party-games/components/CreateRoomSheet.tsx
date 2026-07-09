import { FormEvent, useState } from 'react'
import { Icon } from '@components'
import { PartyGameMode, PartyRoomSettings, PunishmentMode } from '../types'

interface Props {
  open: boolean
  defaultMode: PartyGameMode
  defaultMaxPlayers: number
  submitting?: boolean
  externalError?: string
  onClose: () => void
  onCreate: (nickname: string, settings: PartyRoomSettings) => void
}

const clampPlayers = (value: number) => Math.min(12, Math.max(3, value))

const CreateRoomSheet = ({ open, defaultMode, defaultMaxPlayers, submitting = false, externalError = '', onClose, onCreate }: Props) => {
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
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      <form
        role="dialog"
        aria-label="创建房间"
        onSubmit={submit}
        className="party-anim-slide-up fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] bg-white px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.15)]"
      >
        {/* 拖动把手 */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">✨ 创建房间</h3>
            <p className="mt-1 text-sm text-gray-500">设置游戏参数，朋友输入房间码即可加入。</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭创建房间"
            className="party-tap-highlight rounded-xl bg-gray-100 p-2.5 text-gray-400 transition-colors hover:bg-gray-200 active:bg-gray-300"
          >
            <Icon name="close" className="text-lg" />
          </button>
        </div>

        {/* 昵称 */}
        <label className="mt-5 grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">昵称</span>
          <input
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={12}
            className="rounded-2xl border-2 border-gray-100 bg-gray-50 px-4 py-3.5 text-base font-medium text-gray-900 outline-none transition-all duration-200 focus:border-purple-400 focus:bg-white"
            placeholder="输入你的昵称"
          />
        </label>

        {/* 游戏模式 */}
        <div className="mt-4 grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">游戏模式</span>
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1.5">
            {[
              ['undercover', '🕵️ 谁是卧底'],
              ['truth-or-dare', '🎲 真心话大冒险'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id as PartyGameMode)}
                className={`party-tap-highlight rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  mode === id
                    ? 'bg-white text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                    : 'text-gray-500 active:bg-white/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 人数选择 */}
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-4">
          <div>
            <label htmlFor="party-max-players" className="block text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">最多人数</label>
            <span className="mt-1.5 block text-3xl font-bold text-gray-900">{maxPlayers}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="减少人数"
              onClick={() => setMaxPlayers((value) => clampPlayers(value - 1))}
              className="party-tap-highlight flex size-11 items-center justify-center rounded-xl border-2 border-gray-200 bg-white text-gray-500 transition-all duration-200 hover:border-gray-300 active:scale-95 active:bg-gray-100"
            >
              <Icon name="chevron_left" />
            </button>
            <button
              type="button"
              aria-label="增加人数"
              onClick={() => setMaxPlayers((value) => clampPlayers(value + 1))}
              className="party-tap-highlight flex size-11 items-center justify-center rounded-xl border-2 border-gray-200 bg-white text-gray-500 transition-all duration-200 hover:border-gray-300 active:scale-95 active:bg-gray-100"
            >
              <Icon name="chevron_right" />
            </button>
          </div>
        </div>

        {/* 惩罚模式 */}
        <div className="mt-4 grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">输家惩罚</span>
          <div className="grid grid-cols-4 gap-2">
            {[
              ['off', '🚫 关闭'],
              ['truth', '💬 真心话'],
              ['dare', '⚡ 大冒险'],
              ['random', '🎰 随机'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setPunishmentMode(id as PunishmentMode)}
                className={`party-tap-highlight rounded-xl border-2 px-2 py-2.5 text-xs font-semibold transition-all duration-200 ${
                  punishmentMode === id
                    ? 'border-purple-400 bg-purple-50 text-purple-700'
                    : 'border-gray-100 bg-white text-gray-500 active:border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {(message || externalError) && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-center text-sm font-medium text-red-500">{message || externalError}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="party-tap-highlight party-btn-press mt-5 w-full rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-3.5 text-base font-semibold text-white shadow-[0_4px_16px_-4px_rgba(139,92,246,0.4)] transition-all duration-200 hover:shadow-[0_6px_20px_-4px_rgba(139,92,246,0.5)] disabled:opacity-50"
        >
          {submitting ? '⏳ 处理中...' : '✅ 确认创建'}
        </button>
      </form>
    </>
  )
}

export default CreateRoomSheet
