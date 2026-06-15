import { useState } from 'react'
import Icon from './Icon'

const ADMIN_TOKEN_KEY = 'hub:music-admin-token'

interface Props {
  open: boolean
  onClose: () => void
}

const AdminLogin = ({ open, onClose }: Props) => {
  const [token, setToken] = useState('')
  const [error, setError] = useState(false)

  if (!open) return null

  const handleSubmit = () => {
    if (!token.trim()) return
    globalThis.localStorage.setItem(ADMIN_TOKEN_KEY, token.trim())
    window.dispatchEvent(new Event('admin-auth-changed'))
    setError(false)
    setToken('')
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[90] flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto bg-surface rounded-2xl border border-border-subtle p-8 shadow-2xl w-[360px] max-w-[90vw]" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon name="fingerprint" className="text-xl text-primary" />
              </div>
              <div>
                <h2 className="font-headline-md text-lg text-on-surface">管理员验证</h2>
                <p className="font-label-mono text-[10px] text-text-muted uppercase tracking-wider">MUSIC WALL ADMIN</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-on-surface rounded-lg hover:bg-surface-container transition-all">
              <Icon name="close" className="text-lg" />
            </button>
          </div>

          <p className="font-body-md text-sm text-text-muted mb-4">
            输入管理员密码进入音乐墙审核面板
          </p>

          <input
            type="password"
            value={token}
            onChange={e => { setToken(e.target.value); setError(false) }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="输入管理员密码"
            className="w-full surface-control rounded-xl px-4 py-3 font-body-md text-sm outline-none focus:border-primary/60 mb-3"
            autoFocus
          />

          {error && (
            <p className="font-body-md text-xs text-error mb-3">密码错误，请重试</p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl bg-primary text-white font-label-mono text-xs uppercase tracking-wider hover:opacity-90 transition-all"
          >
            验证身份
          </button>
        </div>
      </div>
    </>
  )
}

export default AdminLogin
