import { useMemo, useState } from 'react'
import { PluginRuntimeConfig, WorkflowAction, WorkflowItem } from '@core/types'

interface Props {
  config?: PluginRuntimeConfig
}

const runAction = async (action: WorkflowAction) => {
  if (action.type === 'select-tool' && action.tool) {
    if (!document.getElementById('workbench')) {
      throw new Error('Workbench is unavailable')
    }

    window.dispatchEvent(new globalThis.CustomEvent('hub:select-tool', {
      detail: { tool: action.tool, input: action.value, autorun: true },
    }))
    window.location.hash = action.target ?? '#workbench'
    return
  }

  if (action.type === 'add-scratchpad') {
    if (!document.getElementById('scratchpad')) {
      throw new Error('Scratchpad is unavailable')
    }

    window.dispatchEvent(new globalThis.CustomEvent('hub:add-scratchpad', { detail: action.value ?? action.label }))
    if (action.target) window.location.hash = action.target
    return
  }

  if (action.type === 'copy') {
    await navigator.clipboard?.writeText(action.value ?? action.label)
    return
  }

  if (action.type === 'jump' && action.target) {
    window.location.hash = action.target
  }
}

const WorkflowDeckPlugin = ({ config }: Props) => {
  const workflows = useMemo(
    () => (Array.isArray(config?.workflows) ? config.workflows : []) as WorkflowItem[],
    [config?.workflows],
  )
  const enabledWorkflows = workflows.filter((workflow) => workflow.enabled !== false)
  const [activeId, setActiveId] = useState(enabledWorkflows[0]?.id ?? '')
  const [status, setStatus] = useState('')
  const activeWorkflow = enabledWorkflows.find((workflow) => workflow.id === activeId) ?? enabledWorkflows[0]

  const executeWorkflow = async () => {
    if (!activeWorkflow) return

    try {
      for (const action of activeWorkflow.actions) {
        await runAction(action)
      }
      setStatus(`已执行 ${activeWorkflow.title}`)
    } catch {
      setStatus('工作流执行失败')
    }
  }

  if (enabledWorkflows.length === 0) {
    return (
      <section id="workflows" className="rounded-lg border border-white/10 bg-surface-card/74 p-lg scroll-mt-24">
        <p className="font-body-md text-body-md text-text-muted">未配置工作流</p>
      </section>
    )
  }

  return (
    <section id="workflows" className="space-y-lg scroll-mt-24">
      <div className="grid gap-md md:grid-cols-12 md:items-end">
        <div className="md:col-span-5">
          <span className="font-label-mono text-xs uppercase text-secondary">Workflow deck</span>
          <h2 className="mt-xs font-headline-md text-headline-md text-on-surface">场景工作流</h2>
          <p className="mt-xs font-body-md text-body-md text-text-muted">
            把多个动作组合成可执行场景，而不是继续堆链接。
          </p>
        </div>
        <div className="md:col-span-7 md:text-right">
          <button
            type="button"
            onClick={executeWorkflow}
            className="inline-flex items-center gap-xs rounded-lg bg-primary px-md py-3 font-body-md text-sm font-semibold text-on-primary transition-premium hover:opacity-90"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">bolt</span>
            执行场景
          </button>
        </div>
      </div>

      <div className="grid gap-sm md:grid-cols-3">
        {enabledWorkflows.map((workflow) => (
          <button
            key={workflow.id}
            type="button"
            onClick={() => {
              setActiveId(workflow.id)
              setStatus('')
            }}
            className={`rounded-lg border p-md text-left transition-premium ${
              activeWorkflow?.id === workflow.id
                ? 'border-primary/40 bg-primary/10'
                : 'border-white/10 bg-surface-card/70 hover:border-primary/30 hover:bg-surface-container/72'
            }`}
          >
            <span className="material-symbols-outlined text-primary" aria-hidden="true">{workflow.icon ?? 'hub'}</span>
            <span className="mt-sm block font-body-lg font-bold text-on-surface">{workflow.title}</span>
            {workflow.description && (
              <span className="mt-xs block font-body-md text-sm text-text-muted">
                {workflow.description}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeWorkflow && (
        <div className="rounded-lg border border-white/10 bg-surface-card/74 p-md">
          <div className="flex flex-wrap items-center justify-between gap-sm">
            <div>
              <span className="font-label-mono text-xs uppercase text-secondary">{activeWorkflow.category}</span>
              <h3 className="mt-xs font-body-lg font-bold text-on-surface">{activeWorkflow.title} 动作</h3>
            </div>
            {status && <span className="font-body-md text-sm text-text-muted">{status}</span>}
          </div>
          <div className="mt-md grid gap-xs">
            {activeWorkflow.actions.map((action, index) => (
              <div key={action.id} className="flex items-center gap-sm rounded-lg border border-white/10 bg-background/35 p-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded border border-white/10 font-label-mono text-xs text-primary">
                  {index + 1}
                </span>
                <span className="font-body-md text-body-md text-on-surface">{action.label}</span>
                <span className="ml-auto rounded border border-white/10 px-2 py-1 font-label-mono text-[10px] uppercase text-text-muted">
                  {action.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default WorkflowDeckPlugin
