import { useMemo, useState } from 'react'
import { CapsuleItem, CapsuleTrigger, PluginRuntimeConfig } from '@core/types'
import { isHubRouteAvailable, queueScratchpadItem, queueToolSelection, setHubRoute } from '@core/routeBridge'
import { Icon } from '@components'

interface Props {
  config?: PluginRuntimeConfig
}

const inferTrigger = (value: string): CapsuleTrigger => {
  const input = value.trim()

  if (/^https?:\/\//i.test(input)) return 'url'
  if (/^\d{10,13}$/.test(input)) return 'timestamp'
  if (/^(npm|pnpm|yarn|git|docker|npx|node)\s/i.test(input)) return 'command'
  if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(input)) return 'text'
  if (/^[A-Za-z0-9+/=]+$/.test(input) && input.length >= 8 && input.length % 4 === 0) return 'base64'

  try {
    JSON.parse(input)
    return 'json'
  } catch {
    // Keep checking softer text patterns.
  }

  if (input.includes('请') || input.toLowerCase().includes('prompt') || input.length > 160) {
    return 'prompt'
  }

  return 'text'
}

const runCapsule = async (capsule: CapsuleItem, input: string) => {
  const action = capsule.action

  if (action.type === 'select-tool' && action.tool) {
    if (!isHubRouteAvailable('workbench')) {
      throw new Error('Workbench is unavailable')
    }

    queueToolSelection({ tool: action.tool, input, autorun: true })
    setHubRoute('workbench')
    return action.label
  }

  if (action.type === 'add-scratchpad') {
    if (!isHubRouteAvailable('scratchpad')) {
      throw new Error('Scratchpad is unavailable')
    }

    queueScratchpadItem(action.value ?? input)
    setHubRoute('scratchpad')
    return action.label
  }

  if (action.type === 'copy') {
    await navigator.clipboard?.writeText(action.value ?? input)
    return action.label
  }

  if (action.type === 'jump' && action.target) {
    window.location.hash = action.target
    return action.label
  }

  return '未执行动作'
}

const UniversalInboxPlugin = ({ config }: Props) => {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('')
  const capsules = useMemo(
    () => (Array.isArray(config?.capsules) ? config.capsules : []) as CapsuleItem[],
    [config?.capsules],
  )
  const trigger = input.trim() ? inferTrigger(input) : 'text'
  const matches = capsules
    .filter((capsule) => capsule.enabled !== false)
    .filter((capsule) => capsule.triggers.includes(trigger))

  const executeCapsule = async (capsule: CapsuleItem) => {
    try {
      const message = await runCapsule(capsule, input.trim())
      setStatus(message)
    } catch {
      setStatus('动作执行失败：目标模块不可用')
    }
  }

  return (
    <section id="inbox" className="space-y-lg scroll-mt-24">
      <div className="surface-panel rounded-[2px] p-md md:p-lg">
        <div className="grid gap-md md:grid-cols-12 md:items-end">
          <div className="md:col-span-5">
            <span className="font-label-mono text-xs uppercase text-secondary">Universal inbox</span>
            <h2 className="mt-xs font-headline-md text-headline-md text-on-surface">万能投入口</h2>
            <p className="mt-xs font-body-md text-body-md text-text-muted">
              粘贴任何东西，系统识别类型并匹配可热插拔 Capsule。
            </p>
          </div>
          <div className="md:col-span-7">
            <label htmlFor="universal-inbox-input" className="sr-only">万能投入口</label>
            <textarea
              id="universal-inbox-input"
              value={input}
              onChange={(event) => {
                setInput(event.target.value)
                setStatus('')
              }}
              placeholder="URL、JSON、时间戳、Base64、命令、Prompt 或任意文本..."
              className="surface-control min-h-36 w-full resize-y rounded-[2px] p-sm font-body-md text-body-md text-on-surface outline-none transition-premium focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="mt-md flex flex-wrap items-center gap-xs">
          <span className="rounded border border-primary/25 bg-primary/10 px-2 py-1 font-label-mono text-xs uppercase text-primary">
            {input.trim() ? trigger : 'waiting'}
          </span>
          {status && (
            <span className="font-body-md text-sm text-text-muted">{status}</span>
          )}
        </div>
      </div>

      <div className="grid gap-sm md:grid-cols-2">
        {matches.length > 0 ? matches.map((capsule) => (
          <button
            key={capsule.id}
            type="button"
            onClick={() => void executeCapsule(capsule)}
            className="surface-item group grid gap-sm rounded-[2px] p-md text-left transition-premium hover:border-primary/35 hover:bg-surface-container/80"
          >
            <div className="flex items-start justify-between gap-md">
              <div className="flex items-start gap-sm">
                <span className="rounded-[2px] border border-border-subtle bg-background/55 p-2 text-primary" aria-hidden="true">
                  <Icon name={capsule.icon ?? 'extension'} className="text-2xl" />
                </span>
                <span>
                  <span className="block font-body-lg font-bold text-on-surface">{capsule.title}</span>
                  {capsule.description && (
                    <span className="mt-xs block font-body-md text-body-md text-text-muted">
                      {capsule.description}
                    </span>
                  )}
                </span>
              </div>
              <span className="rounded border border-secondary/20 bg-secondary/10 px-2 py-1 font-label-mono text-[10px] uppercase text-secondary">
                {capsule.action.type}
              </span>
            </div>
          </button>
        )) : (
          <div className="surface-item rounded-[2px] p-md md:col-span-2">
            <p className="font-body-md text-body-md text-text-muted">
              {input.trim() ? '没有匹配的 Capsule' : '等待输入以匹配 Capsule'}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default UniversalInboxPlugin
