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
  const [step, setStep] = useState<1 | 2 | 'setup'>(1)
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const [totpSecret, setTotpSecret] = useState('')
  const [otpauthURI, setOtpauthURI] = useState('')

  // 检查是否已设置 TOTP
  useEffect(() => {
    const saved = globalThis.localStorage.getItem(TOTP_KEY)
    if (saved) {
      setTotpSecret(saved)
    } else {
      // 首次使用：生成密钥并显示设置向导
      const secret = generateSecret()
      setTotpSecret(secret)
      globalThis.localStorage.setItem(TOTP_KEY, secret)
      const uri = generateOTPAuthURI(secret)
      setOtpauthURI(uri)
    }
  }, [open])

  if (!open) return null

  const handlePasswordSubmit = () => {
    if (!password.trim()) return
    setError(false)
    setStep(2)
  }

  const handleCodeSubmit = async () => {
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError(true)
      return
    }
    const valid = await verifyTOTP(totpSecret, code)
    if (!valid) {
      setError(true)
      return
    }
    setError(false)
    onAuth?.(password.trim())
    setPassword('')
    setCode('')
    setStep(1)
    onClose()
  }

  const handleClose = () => {
    setPassword('')
    setCode('')
    setError(false)
    setStep(1)
    onClose()
  }

  // 重置 TOTP（调试用）
  const resetTOTP = () => {
    globalThis.localStorage.removeItem(TOTP_KEY)
    setStep(1)
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
                  {step === 1 ? '步骤 1 / 2' : step === 2 ? '步骤 2 / 2' : '初始设置'}
                </p>
              </div>
            </div>
            <button type="button" onClick={handleClose} className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-on-surface rounded-lg hover:bg-surface-container transition-all">
              <Icon name="close" className="text-lg" />
            </button>
          </div>

          {/* TOTP Setup (首次使用) */}
          {step === 'setup' && (
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
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(totpSecret.replace(/\s/g, ''))}
                  className="shrink-0 w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-text-muted hover:text-primary transition-colors"
                  title="复制密钥"
                >
                  <Icon name="content_copy" className="text-sm" />
                </button>
              </div>

              <p className="font-label-mono text-[10px] text-text-muted mb-3">或者扫描二维码（需显示此页面）</p>
              <div className="bg-surface-container rounded-xl p-4 mb-4 text-center">
                <code className="font-label-mono text-[10px] text-text-muted break-all select-all">
                  {otpauthURI}
                </code>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-label-mono text-xs uppercase tracking-wider hover:opacity-90 transition-all"
                >
                  已添加，去登录
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 rounded-xl border border-border-subtle text-text-muted font-label-mono text-xs uppercase tracking-wider hover:bg-surface-container transition-all"
                >
                  稍后设置
                </button>
              </div>
            </>
          )}

          {/* Step 1: Password */}
          {step === 1 && (
            <>
              <p className="font-body-md text-sm text-text-muted mb-4">
                第一步：输入管理员密码
              </p>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false) }}
                onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="密码"
                className="w-full surface-control rounded-xl px-4 py-3 font-body-md text-sm outline-none focus:border-primary/60 mb-3"
                autoFocus
              />
              <button
                type="button"
                onClick={handlePasswordSubmit}
                className="w-full py-3 rounded-xl bg-primary text-white font-label-mono text-xs uppercase tracking-wider hover:opacity-90 transition-all"
              >
                下一步
              </button>

              <div className="mt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep('setup')}
                  className="font-label-mono text-[10px] text-text-muted hover:text-primary transition-colors"
                >
                  未绑定验证器？
                </button>
                <button
                  type="button"
                  onClick={resetTOTP}
                  className="font-label-mono text-[10px] text-text-muted hover:text-error transition-colors"
                >
                  重置
                </button>
              </div>
            </>
          )}

          {/* Step 2: TOTP Code */}
          {step === 2 && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-label-mono text-xs font-bold">✓</span>
                <span className="font-label-mono text-[10px] text-text-muted">密码验证通过</span>
              </div>
              <p className="font-body-md text-sm text-text-muted mb-1">第二步</p>
              <p className="font-headline-md text-base text-on-surface font-semibold mb-4">
                输入验证器中的 6 位码
              </p>
              <div className="flex items-center gap-2 mb-4">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 aspect-square rounded-xl border-2 flex items-center justify-center font-headline-md text-2xl text-on-surface transition-all ${
                      code.length > i ? 'border-primary bg-primary/5' : 'border-border-subtle'
                    }`}
                  >
                    {code[i] || ''}
                  </div>
                ))}
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setCode(val)
                  setError(false)
                  if (val.length === 6) {
                    // 自动提交
                    setTimeout(() => {
                      setCode(val)
                      handleCodeSubmit()
                    }, 200)
                  }
                }}
                onKeyDown={e => e.key === 'Enter' && handleCodeSubmit()}
                placeholder="------"
                className="absolute opacity-0 w-0 h-0 pointer-events-none"
                autoFocus
              />
              {error && (
                <p className="font-body-md text-xs text-error mb-3 text-center">验证码无效，请重试</p>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(false) }}
                  className="flex-1 py-3 rounded-xl border border-border-subtle text-on-surface font-label-mono text-xs uppercase tracking-wider hover:bg-surface-container transition-all"
                >
                  返回
                </button>
                <button
                  type="button"
                  onClick={handleCodeSubmit}
                  className="flex-[2] py-3 rounded-xl bg-primary text-white font-label-mono text-xs uppercase tracking-wider hover:opacity-90 transition-all"
                  disabled={code.length !== 6}
                >
                  验证身份
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
