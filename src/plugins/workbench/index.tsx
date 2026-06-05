import { useCallback, useEffect, useMemo, useState } from 'react'
import { PluginRuntimeConfig, UtilityItem } from '@core/types'

interface Props {
  config?: PluginRuntimeConfig
}

type ToolKind = NonNullable<UtilityItem['utilityType']>

interface SelectToolDetail {
  tool: ToolKind
  input?: string
  autorun?: boolean
}

const toolLabels: Record<ToolKind, string> = {
  'json-format': 'JSON 格式化',
  base64: 'Base64 编解码',
  'url-codec': 'URL 编解码',
  timestamp: '时间戳转换',
  uuid: 'UUID 生成',
}

const defaultInputs: Record<ToolKind, string> = {
  'json-format': '{"name":"kk","enabled":true}',
  base64: 'Personal Hub',
  'url-codec': 'https://localhost.test/search?q=personal hub',
  timestamp: String(Date.now()),
  uuid: '',
}

const unicodeToBase64 = (value: string) => globalThis.btoa(unescape(encodeURIComponent(value)))

const base64ToUnicode = (value: string) => decodeURIComponent(escape(globalThis.atob(value)))

const createUuid = () => (
  globalThis.crypto?.randomUUID?.()
  ?? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.random() * 16 | 0
    const next = char === 'x' ? random : (random & 0x3) | 0x8
    return next.toString(16)
  })
)

const runTool = (kind: ToolKind, input: string) => {
  try {
    if (kind === 'json-format') {
      return { output: JSON.stringify(JSON.parse(input), null, 2), error: '' }
    }

    if (kind === 'base64') {
      const trimmed = input.trim()
      try {
        return { output: base64ToUnicode(trimmed), error: '' }
      } catch {
        return { output: unicodeToBase64(input), error: '' }
      }
    }

    if (kind === 'url-codec') {
      const decoded = input.includes('%') ? decodeURIComponent(input) : encodeURIComponent(input)
      return { output: decoded, error: '' }
    }

    if (kind === 'timestamp') {
      const value = Number(input.trim())
      if (Number.isNaN(value)) {
        return { output: '', error: '请输入数字时间戳' }
      }
      const normalized = value < 10_000_000_000 ? value * 1000 : value
      return { output: new Date(normalized).toISOString(), error: '' }
    }

    if (kind === 'uuid') {
      return { output: createUuid(), error: '' }
    }
  } catch (error) {
    return { output: '', error: error instanceof Error ? error.message : '处理失败' }
  }

  return { output: '', error: '未支持的工具' }
}

const WorkbenchPlugin = ({ config }: Props) => {
  const utilities = useMemo(
    () => (Array.isArray(config?.utilities) ? config.utilities : []) as UtilityItem[],
    [config?.utilities],
  )
  const maxVisible = typeof config?.maxVisible === 'number' ? config.maxVisible : utilities.length
  const inlineTools = useMemo(
    () => utilities
      .filter((tool) => tool.enabled !== false && tool.mode === 'inline' && tool.utilityType)
      .slice(0, maxVisible),
    [maxVisible, utilities],
  )
  const [activeTool, setActiveTool] = useState<ToolKind>((inlineTools[0]?.utilityType ?? 'json-format') as ToolKind)
  const [input, setInput] = useState(defaultInputs[activeTool])
  const [result, setResult] = useState(runTool(activeTool, defaultInputs[activeTool]))
  const activeLabel = toolLabels[activeTool]

  const selectTool = useCallback((kind: ToolKind, overrideInput?: string, autorun = true) => {
    const nextInput = overrideInput ?? defaultInputs[kind]
    setActiveTool(kind)
    setInput(nextInput)
    if (autorun) {
      setResult(runTool(kind, nextInput))
    } else {
      setResult({ output: '', error: '' })
    }
  }, [])

  useEffect(() => {
    const handleSelectTool = (event: globalThis.Event) => {
      const detail = (event as globalThis.CustomEvent<ToolKind | SelectToolDetail>).detail
      const kind = typeof detail === 'string' ? detail : detail.tool
      const inputValue = typeof detail === 'string' ? undefined : detail.input
      const autorun = typeof detail === 'string' ? true : detail.autorun !== false

      if (inlineTools.some((tool) => tool.utilityType === kind)) {
        selectTool(kind, inputValue, autorun)
      }
    }

    window.addEventListener('hub:select-tool', handleSelectTool)
    return () => window.removeEventListener('hub:select-tool', handleSelectTool)
  }, [inlineTools, selectTool])

  const execute = () => {
    setResult(runTool(activeTool, input))
  }

  const copyOutput = () => {
    if (result.output) {
      void navigator.clipboard?.writeText(result.output)
    }
  }

  if (inlineTools.length === 0) {
    return (
      <section id="workbench" className="rounded-lg border border-white/10 bg-surface-card/74 p-lg scroll-mt-24">
        <p className="font-body-md text-body-md text-text-muted">未配置可用工具</p>
      </section>
    )
  }

  return (
    <section id="workbench" className="space-y-lg scroll-mt-24">
      <div className="grid gap-md md:grid-cols-12 md:items-end">
        <div className="md:col-span-5">
          <span className="font-label-mono text-xs uppercase text-secondary">Workbench</span>
          <h2 className="mt-xs font-headline-md text-headline-md text-on-surface">工具收纳台</h2>
          <p className="mt-xs font-body-md text-body-md text-text-muted">
            只放可以直接处理输入输出的实用工具。
          </p>
        </div>
        <div className="flex flex-wrap gap-xs rounded-lg border border-white/10 bg-surface-card/72 p-xs md:col-span-7 md:justify-end">
          {inlineTools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => selectTool(tool.utilityType as ToolKind)}
              className={`rounded-md px-sm py-2 font-body-md text-sm transition-premium ${
                activeTool === tool.utilityType
                  ? 'bg-primary/12 text-primary'
                  : 'text-text-muted hover:bg-white/5 hover:text-on-surface'
              }`}
            >
              {tool.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-md rounded-lg border border-white/10 bg-surface-card/78 p-md md:grid-cols-2 md:p-lg">
        <div className="space-y-sm">
          <label htmlFor="workbench-input" className="font-label-mono text-xs uppercase text-text-muted">
            {activeLabel} 输入
          </label>
          <textarea
            id="workbench-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="min-h-48 w-full resize-y rounded-lg border border-white/10 bg-background/50 p-sm font-label-mono text-sm text-on-surface outline-none transition-premium focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
          />
          <div className="flex flex-wrap gap-xs">
            <button
              type="button"
              onClick={execute}
              className="inline-flex items-center gap-xs rounded-lg bg-primary px-sm py-2 font-body-md text-sm font-semibold text-on-primary transition-premium hover:opacity-90"
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">play_arrow</span>
              运行
            </button>
            {activeTool === 'uuid' && (
              <button
                type="button"
                onClick={() => setResult(runTool('uuid', ''))}
                className="rounded-lg border border-white/10 px-sm py-2 font-body-md text-sm text-text-muted transition-premium hover:border-primary/40 hover:text-primary"
              >
                重新生成
              </button>
            )}
          </div>
        </div>

        <div className="space-y-sm">
          <div className="flex items-center justify-between gap-sm">
            <span className="font-label-mono text-xs uppercase text-text-muted">输出</span>
            <button
              type="button"
              onClick={copyOutput}
              disabled={!result.output}
              className="inline-flex items-center gap-xs rounded-lg border border-white/10 px-sm py-2 font-body-md text-sm text-text-muted transition-premium hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">content_copy</span>
              复制
            </button>
          </div>
          <pre className="min-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-background/50 p-sm font-label-mono text-sm text-on-surface">
            {result.error || result.output}
          </pre>
          {result.error && (
            <p className="font-body-md text-sm text-error">{result.error}</p>
          )}
        </div>
      </div>
    </section>
  )
}

export default WorkbenchPlugin
