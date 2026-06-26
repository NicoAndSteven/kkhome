import { useState, useRef, useEffect } from 'react'
import { Icon } from '@components'
import { FundInfo } from './types'

interface Props {
  onImport: (fund: FundInfo) => void
  existingCodes: string[]
  onClose: () => void
}

const FundImport = ({ onImport, existingCodes, onClose }: Props) => {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<FundInfo | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSearch = async () => {
    const trimmed = code.trim()
    if (!trimmed) { setError('请输入基金代码'); return }
    if (existingCodes.includes(trimmed)) { setError('该基金已添加'); return }

    setLoading(true)
    setError('')
    setPreview(null)

    try {
      const res = await fetch('/api/stock/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      })
      const json = await res.json()
      if (!json.ok) {
        setError(json.error?.message || '获取基金数据失败')
        return
      }
      const { fund } = json.data
      setPreview({
        code: fund.code,
        name: fund.name,
        size: fund.size,
        quarter: fund.quarter,
        type: fund.type,
        topHoldings: fund.holdings ?? [],
        updatedAt: new Date().toISOString(),
      })
    } catch {
      setError('网络请求失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = () => {
    if (preview) {
      onImport(preview)
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (preview) {
        handleConfirm()
      } else {
        handleSearch()
      }
    }
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md surface-panel-strong rounded-2xl shadow-2xl" onKeyDown={handleKeyDown}>
        {/* 头部 */}
        <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-3">
          <Icon name="add" className="text-text-muted text-lg" />
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value); setPreview(null); setError('') }}
            placeholder="输入基金代码，如 024239"
            className="flex-1 bg-transparent font-body-md text-body-md text-on-surface outline-none placeholder:text-text-muted"
          />
          {loading ? (
            <span className="font-body-md text-xs text-text-muted">查询中...</span>
          ) : (
            <button
              type="button"
              onClick={handleSearch}
              disabled={!code.trim()}
              className="rounded-full px-3 py-1.5 font-body-md text-xs bg-primary text-white disabled:opacity-40 transition-premium hover:opacity-90"
            >
              查询
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-text-muted hover:bg-white/6 hover:text-on-surface transition-premium"
          >
            <Icon name="close" className="text-lg" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4">
          {error && (
            <div className="rounded-xl border border-[rgba(223,161,144,0.35)] bg-[rgba(223,161,144,0.12)] px-3 py-2.5 mb-3">
              <span className="font-body-md text-xs text-[rgb(150,95,84)]">{error}</span>
            </div>
          )}

          {preview && (
            <div className="space-y-3">
              {/* 基金基本信息 */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-label-mono text-xs text-primary">{preview.code}</span>
                  <h4 className="font-headline-md text-sm text-on-surface">{preview.name}</h4>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {preview.quarter && (
                    <span className="font-label-mono text-[10px] text-primary/70 bg-primary/8 rounded-full px-2 py-0.5">
                      {preview.quarter}
                    </span>
                  )}
                  {preview.size && (
                    <span className="font-body-md text-[10px] text-text-muted">规模{preview.size}</span>
                  )}
                </div>
              </div>

              {/* 持仓预览 */}
              <div>
                <div className="font-body-md text-xs text-text-muted mb-2">
                  前{preview.topHoldings.length}大重仓股
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {preview.topHoldings.map((h, idx) => (
                    <div key={h.symbol} className="flex items-center gap-2 rounded-lg px-2 py-1.5 bg-white/[0.04]">
                      <span className="font-label-mono text-[10px] text-text-muted/50 w-4">{idx + 1}</span>
                      <span className="font-label-mono text-xs text-primary w-16 shrink-0">{h.symbol}</span>
                      <span className="font-body-md text-xs text-on-surface flex-1 truncate">{h.name}</span>
                      <span className="font-label-mono text-[10px] text-text-muted">{h.weight.toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 确认导入 */}
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full rounded-full py-2.5 font-body-md text-sm font-semibold bg-primary text-white hover:opacity-90 transition-premium active:scale-[0.98]"
              >
                导入此基金
              </button>
            </div>
          )}

          {!preview && !error && (
            <div className="py-6 text-center">
              <span className="font-body-md text-sm text-text-muted">
                输入基金代码，查询前十大重仓股
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FundImport
