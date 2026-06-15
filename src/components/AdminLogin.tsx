import { useState, useEffect } from 'react'
import Icon from './Icon'
import { verifyTOTP, generateSecret, generateOTPAuthURI } from '../lib/totp'

interface Props {
  open: boolean
  onClose: () => void
  onAuth?: (token: string) => void
}

const TOTP_KEY = 'hub:totp-secret'

const AdminLogin = ({ open, onClose, onAuth }: Props) => {
  const [phase, setPhase] = useState<'setup' | 'verify'>('verify')
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [totpSecret, setTotpSecret] = useState('')
  const [otpauthURI, setOtpauthURI] = useState('')

  useEffect(() => {
    const saved = globalThis.localStorage.getItem(TOTP_KEY)
    if (saved) {
      setTotpSecret(saved)
      setPhase('verify')
    } else {
      const secret = generateSecret()
      setTotpSecret(secret)
      globalThis.localStorage.setItem(TOTP_KEY, secret)
      setOtpauthURI(generateOTPAuthURI(secret))
      setPhase('setup')
    }
  }, [open])

  if (!open) return null

  const handleSubmit = async () => {
    if (code.length !== 6 || !/^\d{6}$/.test(code)) { setError(true); return }
    const valid = await verifyTOTP(totpSecret, code)
    if (!valid) { setError(true); return }
    setError(false)
    // 将 TOTP 密钥存到 R2（用于 API 鉴权）
    try { await fetch('/api/music/songs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'save-totp', totpSecret }) }) } catch { /* */ }
    onAuth?.('totp-authenticated')
    setCode('')
    onClose()
  }

  const handleClose = () => { setCode(''); setError(false); onClose() }

  // 重置（调试用）
  const handleReset = () => {
    globalThis.localStorage.removeItem(TOTP_KEY)
    setPhase('verify')
    setTotpSecret('')
    setCode('')
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
                <h2 className="font-headline-md text-lg text-on-surface">管理员验证</h2>
                <p className="font-label-mono text-[10px] text-text-muted uppercase tracking-wider">
                  {phase === 'setup' ? '初始设置' : '身份验证'}
                </p>
              </div>
            </div>
            <button type="button" onClick={handleClose} className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-on-surface rounded-lg hover:bg-surface-container transition-all">
              <Icon name="close" className="text-lg" />
            </button>
          </div>

          {/* 首次使用：绑定验证器 */}
          {phase === 'setup' && (
            <>
              <div className="mb-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="font-body-md text-sm font-semibold text-on-surface mb-2">📱 绑定身份验证器</p>
                <ol className="font-body-md text-xs text-text-muted space-y-1.5 list-decimal list-inside">
                  <li>打开 Google Authenticator / Authy</li>
                  <li>选择「添加」→「输入密钥」</li>
                  <li>复制下方密钥并粘贴</li>
                  <li>完成添加后输入 App 生成的 6 位码</li>
                </ol>
              </div>

              <p className="font-label-mono text-[10px] text-text-muted mb-1">你的密钥</p>
              <div className="flex items-center gap-2 mb-4">
                <code className="flex-1 font-label-mono text-sm bg-surface-container rounded-xl px-4 py-3 select-all break-all">
                  {totpSecret}
                </code>
                <button type="button" onClick={() => navigator.clipboard.writeText(totpSecret.replace(/\s/g, ''))}
                  className="shrink-0 w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-text-muted hover:text-primary transition-colors" title="复制密钥">
                  <Icon name="content_copy" className="text-sm" />
                </button>
              </div>

              <div className="bg-surface-container rounded-xl p-3 mb-4 text-center">
                <p className="font-label-mono text-[10px] text-text-muted mb-1">或使用此 URI 生成二维码</p>
                <code className="font-label-mono text-[9px] text-text-muted break-all select-all">{otpauthURI}</code>
              </div>

              {/* 6 位码输入 */}
              <p className="font-body-md text-sm text-text-muted mb-3">绑定完成后输入验证码</p>
              <div className="flex items-center gap-2 mb-4">
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`flex-1 aspect-square rounded-xl border-2 flex items-center justify-center font-headline-md text-2xl text-on-surface transition-all ${code.length > i ? 'border-primary bg-primary/5' : 'border-border-subtle'}`}>
                    {code[i] || ''}
                  </div>
                ))}
              </div>
              <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={code}
                onChange={e => { const val = e.target.value.replace(/\D/g, '').slice(0, 6); setCode(val); setError(false); if (val.length === 6) setTimeout(() => handleSubmit(), 200) }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="absolute opacity-0 w-0 h-0" autoFocus />
              {error && <p className="font-body-md text-xs text-error mb-3 text-center">验证码无效</p>}
              <button type="button" onClick={handleSubmit} disabled={code.length !== 6}
                className="w-full py-3 rounded-xl bg-primary text-white font-label-mono text-xs uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-40">
                完成绑定
              </button>
            </>
          )}

          {/* 验证 */}
          {phase === 'verify' && (
            <>
              <p className="font-body-md text-sm text-text-muted mb-1">输入身份验证器中的 6 位动态码</p>
              <p className="font-label-mono text-[10px] text-primary mb-4">
                <button type="button" onClick={() => setPhase('setup')} className="underline hover:no-underline">首次使用？点此设置验证器 →</button>
              </p>
              <div className="flex items-center gap-2 mb-4">
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`flex-1 aspect-square rounded-xl border-2 flex items-center justify-center font-headline-md text-2xl text-on-surface transition-all ${code.length > i ? 'border-primary bg-primary/5' : 'border-border-subtle'}`}>
                    {code[i] || ''}
                  </div>
                ))}
              </div>
              <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={code}
                onChange={e => { const val = e.target.value.replace(/\D/g, '').slice(0, 6); setCode(val); setError(false); if (val.length === 6) setTimeout(() => handleSubmit(), 200) }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="absolute opacity-0 w-0 h-0" autoFocus />
              {error && <p className="font-body-md text-xs text-error mb-3 text-center">验证码无效</p>}
              <button type="button" onClick={handleSubmit} disabled={code.length !== 6}
                className="w-full py-3 rounded-xl bg-primary text-white font-label-mono text-xs uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-40">
                验证身份
              </button>
              <div className="mt-4 flex justify-between">
                <button type="button" onClick={() => setPhase('setup')}
                  className="font-label-mono text-[10px] text-text-muted hover:text-primary transition-colors">
                  查看密钥
                </button>
                <button type="button" onClick={handleReset}
                  className="font-label-mono text-[10px] text-text-muted hover:text-error transition-colors">
                  重置
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  )
}

export default AdminLogin
