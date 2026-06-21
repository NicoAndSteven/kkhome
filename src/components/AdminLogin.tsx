import { useState, useRef, useEffect } from 'react'
import Icon from './Icon'

interface Props {
  open: boolean
  onClose: () => void
  onAuth?: (token: string) => void
}

const AdminLogin = ({ open, onClose, onAuth }: Props) => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setPassword('')
      setError('')
      setLoading(false)
      setSuccess(false)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  if (!open) return null

  const handleSubmit = async () => {
    if (!password.trim()) {
      setError('请输入管理员密码')
      return
    }

    setLoading(true)
    setError('')

    // 本地开发模式：VITE_DEV_ADMIN_PASSWORD 存在时直接比对，跳过 API
    const devPassword = import.meta.env.VITE_DEV_ADMIN_PASSWORD as string | undefined
    if (devPassword) {
      if (password.trim() === devPassword) {
        setSuccess(true)
        setTimeout(() => {
          onAuth?.(password.trim())
          onClose()
        }, 600)
      } else {
        setError('密码错误，请重试')
      }
      setLoading(false)
      return
    }

    // 生产模式：调 API 验证密码
    try {
      const res = await fetch('/api/music/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _action: 'login', password: password.trim() }),
      })
      const json = await res.json()

      if (json.ok && json.data?.token) {
        setSuccess(true)
        setTimeout(() => {
          onAuth?.(json.data.token)
          onClose()
        }, 600)
      } else {
        setError('密码错误，请重试')
      }
    } catch {
      setError('无法连接服务器，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setPassword('')
    setError('')
    setLoading(false)
    setSuccess(false)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-black/20 backdrop-blur-sm" onClick={handleClose} />
      <div className="fixed inset-0 z-[90] flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto bg-surface rounded-2xl border border-border-subtle p-8 shadow-2xl w-[380px] max-w-[90vw]" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon name="fingerprint" className="text-xl text-primary" />
              </div>
              <div>
                <h2 className="font-headline-md text-lg text-on-surface">管理员</h2>
                <p className="font-label-mono text-[10px] text-text-muted uppercase tracking-wider">身份验证</p>
              </div>
            </div>
            <button type="button" onClick={handleClose} className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-on-surface rounded-lg hover:bg-surface-container transition-all">
              <Icon name="close" className="text-lg" />
            </button>
          </div>

          {success ? (
            <>
              <div className="flex flex-col items-center py-4">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-body-md text-sm font-semibold text-on-surface">验证成功</p>
                <p className="font-label-mono text-[10px] text-text-muted mt-0.5">正在进入管理...</p>
              </div>
            </>
          ) : (
            <>
          <p className="font-body-md text-sm text-text-muted mb-5">请输入管理员密码以继续</p>

          {/* 密码输入 */}
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            onKeyDown={e => { if (e.key === 'Enter' && !loading) handleSubmit() }}
            placeholder="管理员密码"
            autoComplete="current-password"
            className="w-full rounded-xl border border-border-subtle bg-surface-container px-4 py-3 text-sm text-on-surface placeholder:text-text-muted outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all mb-4"
          />

          {/* 错误提示 */}
          {error && (
            <p className="font-body-md text-xs text-error mb-4">
              {error}
            </p>
          )}

          {/* 提交按钮 */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !password.trim()}
            className="w-full py-3 rounded-xl bg-primary text-white font-label-mono text-xs uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" fill="none" />
                </svg>
                验证中...
              </>
            ) : (
              '进入管理'
            )}
          </button>
          </>)}
        </div>
      </div>
    </>
  )
}

export default AdminLogin
