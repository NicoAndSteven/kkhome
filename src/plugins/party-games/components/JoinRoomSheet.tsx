import { FormEvent, useEffect, useState } from 'react'
import { Icon } from '@components'

interface Props {
  open: boolean
  defaultCode?: string
  submitting?: boolean
  externalError?: string
  onClose: () => void
  onJoin: (nickname: string, code: string) => void
}

const JoinRoomSheet = ({ open, defaultCode = '', submitting = false, externalError = '', onClose, onJoin }: Props) => {
  const [nickname, setNickname] = useState('玩家')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')

  // Sync code when sheet opens — supports invite link pre-fill
  useEffect(() => {
    if (open) {
      setCode(defaultCode || '')
      setNickname('玩家')
      setMessage('')
    }
  }, [open, defaultCode])

  if (!open) return null

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const normalizedCode = code.trim().toUpperCase()
    const normalizedNickname = nickname.trim()

    if (!/^[A-Z0-9]{4,6}$/.test(normalizedCode)) {
      setMessage('房间码需要 4-6 位字母或数字')
      return
    }

    if (normalizedNickname.length < 1 || normalizedNickname.length > 12) {
      setMessage('昵称需要 1-12 个字')
      return
    }

    onJoin(normalizedNickname, normalizedCode)
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      <form
        role="dialog"
        aria-label="加入房间"
        onSubmit={submit}
        className="party-anim-slide-up fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] bg-white px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.15)]"
      >
        {/* 拖动把手 */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">🔗 加入房间</h3>
            <p className="mt-1 text-sm text-gray-500">输入朋友分享的房间码。</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭加入房间"
            className="party-tap-highlight rounded-xl bg-gray-100 p-2.5 text-gray-400 transition-colors hover:bg-gray-200 active:bg-gray-300"
          >
            <Icon name="close" className="text-lg" />
          </button>
        </div>

        {/* 房间码 */}
        <label className="mt-5 grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">房间码</span>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            maxLength={6}
            placeholder="输入 4-6 位房间码"
            className="rounded-2xl border-2 border-gray-100 bg-gray-50 px-4 py-4 text-center font-mono text-4xl font-bold uppercase tracking-[0.15em] text-gray-900 outline-none transition-all duration-200 placeholder:text-xl placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-300 focus:border-purple-400 focus:bg-white"
          />
        </label>

        {/* 昵称 */}
        <label className="mt-4 grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">昵称</span>
          <input
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={12}
            placeholder="输入你的昵称"
            className="rounded-2xl border-2 border-gray-100 bg-gray-50 px-4 py-3.5 text-base font-medium text-gray-900 outline-none transition-all duration-200 focus:border-purple-400 focus:bg-white"
          />
        </label>

        {(message || externalError) && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-center text-sm font-medium text-red-500">{message || externalError}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="party-tap-highlight party-btn-press mt-5 w-full rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-3.5 text-base font-semibold text-white shadow-[0_4px_16px_-4px_rgba(139,92,246,0.4)] transition-all duration-200 hover:shadow-[0_6px_20px_-4px_rgba(139,92,246,0.5)] disabled:opacity-50"
        >
          {submitting ? '⏳ 加入中...' : '🚀 加入房间'}
        </button>
      </form>
    </>
  )
}

export default JoinRoomSheet
