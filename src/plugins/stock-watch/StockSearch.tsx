import { useState, useEffect, useCallback, useRef } from 'react'
import { Icon } from '@components'
import { YahooSearchQuote } from './types'

interface Props {
  onAdd: (symbol: string, name: string) => void
  existingSymbols: string[]
  onClose: () => void
}

const StockSearch = ({ onAdd, existingSymbols, onClose }: Props) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<YahooSearchQuote[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => { inputRef.current?.focus() }, [])

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setError(''); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/stock/search?q=${encodeURIComponent(q)}`)
      const json = await res.json()
      if (!json.ok) { setError(json.error?.message || 'Search failed'); setResults([]); return }
      setResults((json.data.searchResult?.quotes ?? []).filter(
        (r: YahooSearchQuote) => r.quoteType === 'EQUITY' || r.quoteType === 'ETF',
      ))
    } catch { setError('Network error'); setResults([]) }
    finally { setLoading(false) }
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(value), 300)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg surface-panel-strong rounded-2xl shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-3">
          <Icon name="search" className="text-text-muted text-lg" />
          <input ref={inputRef} type="text" value={query} onChange={(e) => handleChange(e.target.value)}
            placeholder="搜索股票代码或名称 (US/HK/A-shares)"
            className="flex-1 bg-transparent font-body-md text-body-md text-on-surface outline-none placeholder:text-text-muted" />
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-text-muted hover:bg-white/6 hover:text-on-surface transition-premium">
            <Icon name="close" className="text-lg" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {loading && <div className="flex items-center justify-center py-8"><span className="font-body-md text-sm text-text-muted">搜索中...</span></div>}
          {error && <div className="p-3 font-body-md text-sm text-error">{error}</div>}
          {!loading && !error && query.trim() && results.length === 0 && <div className="py-8 text-center font-body-md text-sm text-text-muted">未找到匹配结果</div>}
          {results.map((item) => {
            const symbol = item.symbol
            const name = item.shortname || item.longname || symbol
            const alreadyAdded = existingSymbols.includes(symbol)
            return (
              <button key={symbol} type="button" disabled={alreadyAdded}
                onClick={() => { if (!alreadyAdded) { onAdd(symbol, name); onClose() } }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left transition-premium ${alreadyAdded ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/6 hover:text-on-surface'}`}
              >
                <div className="flex items-center gap-md min-w-0">
                  <span className="font-label-mono text-sm text-primary shrink-0">{symbol}</span>
                  <span className="font-body-md text-sm text-on-surface truncate">{name}</span>
                </div>
                <div className="flex items-center gap-xs shrink-0">
                  <span className="font-label-mono text-xs text-text-muted">{item.exchange}</span>
                  {alreadyAdded && <span className="font-label-mono text-xs text-text-muted">已添加</span>}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default StockSearch
