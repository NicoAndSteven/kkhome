import { FormEvent, useState } from 'react'
import { Icon } from '@components'

interface Props {
  open: boolean
  submitting?: boolean
  externalError?: string
  onClose: () => void
  onJoin: (nickname: string, code: string) => void
}

const JoinRoomSheet = ({ open, submitting = false, externalError = '', onClose, onJoin }: Props) => {
  const [nickname, setNickname] = useState('玩家')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')

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
      <div className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm" onClick={onClose} />
      <form
        role="dialog"
        aria-label="加入房间"
        onSubmit={submit}
        className="fixed inset-x-3 bottom-3 z-50 rounded-[30px] border border-white/10 bg-[#141715] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-white shadow-[0_30px_90px_-40px_rgba(0,0,0,0.65)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-headline-md text-2xl font-semibold">加入房间</h3>
            <p className="mt-1 text-sm text-white/62">输入朋友分享的房间码。</p>
          </div>
          <button type="button" onClick={onClose} aria-label="关闭加入房间" className="rounded-full border border-white/15 p-2 text-white/70">
            <Icon name="close" className="text-lg" />
          </button>
        </div>

        <label className="mt-5 grid gap-2">
          <span className="text-xs font-semibold text-white/64">房间码</span>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            maxLength={6}
            className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-center font-label-mono text-3xl uppercase tracking-[0.18em] text-white outline-none focus:border-white/35"
          />
        </label>

        <label className="mt-4 grid gap-2">
          <span className="text-xs font-semibold text-white/64">昵称</span>
          <input
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={12}
            className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-base text-white outline-none focus:border-white/35"
          />
        </label>

        {(message || externalError) && <p className="mt-3 text-sm text-[#fca5a5]">{message || externalError}</p>}

        <button type="submit" disabled={submitting} className="mt-5 w-full rounded-full bg-white px-5 py-3 text-sm font-bold text-[#141715] disabled:opacity-60">
          {submitting ? '处理中...' : '加入'}
        </button>
      </form>
    </>
  )
}

export default JoinRoomSheet
