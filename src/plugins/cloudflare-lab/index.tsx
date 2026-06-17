import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@components'
import { PluginRuntimeConfig } from '@core/types'

interface Props {
  config?: PluginRuntimeConfig
}

interface Experiment {
  id: string
  title: string
  requires: string[]
  enabled: boolean
}

interface FeatureConfig {
  features: Record<string, boolean>
  experiments: Experiment[]
}

interface HealthData {
  service?: string
  platform?: string
  bindings: Record<string, boolean>
  features: Record<string, boolean>
}

const fallbackFeatures: FeatureConfig = {
  features: {
    cloudflareHealth: true,
    aiSemanticSearch: false,
    browserLab: false,
    fileDrop: false,
    realtimePresence: false,
    automationCenter: false,
    publicApiToolbox: false,
    adminConsole: false,
  },
  experiments: [],
}

const plannedBindings = ['WISHES_DB', 'HUB_KV', 'HUB_BUCKET', 'HUB_VECTORIZE', 'HUB_QUEUE', 'AI']

const bindingLabels: Record<string, string> = {
  WISHES_DB: 'WISHES_DB',
  HUB_KV: 'HUB_KV',
  HUB_BUCKET: 'HUB_BUCKET',
  HUB_VECTORIZE: 'HUB_VECTORIZE',
  HUB_QUEUE: 'HUB_QUEUE',
  AI: 'Workers AI',
}

const featureLabels: Record<string, string> = {
  cloudflareHealth: '平台健康',
  aiSemanticSearch: '语义搜索',
  browserLab: '网页炼金室',
  fileDrop: '文件投递',
  realtimePresence: '实时空间',
  automationCenter: '自动化中心',
  publicApiToolbox: '公开 API',
  adminConsole: '管理台',
}

const readHealthPayload = (payload: unknown): HealthData | null => {
  const record = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
  const data = record.data && typeof record.data === 'object' ? record.data as Record<string, unknown> : record
  const bindings = data.bindings && typeof data.bindings === 'object' ? data.bindings as Record<string, boolean> : null
  const features = data.features && typeof data.features === 'object' ? data.features as Record<string, boolean> : {}

  if (!bindings) return null

  return {
    service: typeof data.service === 'string' ? data.service : undefined,
    platform: typeof data.platform === 'string' ? data.platform : undefined,
    bindings,
    features,
  }
}

const readFeaturePayload = (payload: unknown): FeatureConfig => {
  const record = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
  const features = record.features && typeof record.features === 'object'
    ? record.features as Record<string, boolean>
    : fallbackFeatures.features
  const experiments = Array.isArray(record.experiments)
    ? record.experiments.filter((item): item is Experiment => (
      Boolean(item)
      && typeof item === 'object'
      && typeof (item as Experiment).id === 'string'
      && typeof (item as Experiment).title === 'string'
      && Array.isArray((item as Experiment).requires)
    ))
    : []

  return { features, experiments }
}

const CloudflareLabPlugin = ({ config }: Props) => {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [features, setFeatures] = useState<FeatureConfig>(fallbackFeatures)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const title = typeof config?.title === 'string' ? config.title : 'Cloudflare Lab'
  const description = typeof config?.description === 'string'
    ? config.description
    : '把平台绑定、实验开关和后续 Cloudflare 能力集中到一个可观察入口。'

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const [healthResponse, featureResponse] = await Promise.all([
          fetch('/api/health'),
          fetch('/config/features.config.json'),
        ])

        const featurePayload = await featureResponse.json() as unknown
        const nextFeatures = readFeaturePayload(featurePayload)
        const healthPayload = healthResponse.ok ? await healthResponse.json() as unknown : null
        const nextHealth = healthPayload ? readHealthPayload(healthPayload) : null

        if (!cancelled) {
          setFeatures(nextFeatures)
          setHealth(nextHealth)
          setMessage(nextHealth ? '' : '当前使用本地功能开关视图')
        }
      } catch {
        if (!cancelled) {
          setFeatures(fallbackFeatures)
          setHealth(null)
          setMessage('当前使用本地功能开关视图')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const bindingEntries = plannedBindings.map((binding) => ({
    id: binding,
    enabled: Boolean(health?.bindings[binding]),
  }))
  const enabledBindingCount = bindingEntries.filter((binding) => binding.enabled).length
  const featureEntries = Object.entries(features.features)
  const enabledFeatureCount = featureEntries.filter(([, enabled]) => enabled).length
  const experimentCount = features.experiments.length

  const platformState = useMemo(() => {
    if (loading) return 'loading'
    if (!health) return 'local'
    if (enabledBindingCount === 0) return 'unbound'
    return 'connected'
  }, [enabledBindingCount, health, loading])

  return (
    <section id="cloudflare-lab" className="space-y-5 scroll-mt-24">
      <div className="surface-panel-strong rounded-2xl p-5 md:p-6">
        <div className="grid gap-5 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <span className="font-label-mono text-[10px] uppercase tracking-[0.22em] text-primary">Edge platform</span>
            <h2 className="mt-2 font-headline-md text-3xl font-semibold tracking-tight text-on-surface">{title}</h2>
            <p className="mt-2 font-body-md text-sm leading-relaxed text-on-surface-variant">{description}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 md:col-span-5">
            <div className="surface-item rounded-2xl p-4">
              <span className="font-label-mono text-[10px] uppercase text-text-muted">Bindings</span>
              <strong className="mt-1 block font-headline-md text-2xl text-on-surface">
                {enabledBindingCount}/{bindingEntries.length}
              </strong>
            </div>
            <div className="surface-item rounded-2xl p-4">
              <span className="font-label-mono text-[10px] uppercase text-text-muted">Features</span>
              <strong className="mt-1 block font-headline-md text-2xl text-on-surface">
                {enabledFeatureCount}/{featureEntries.length}
              </strong>
            </div>
            <div className="surface-item rounded-2xl p-4">
              <span className="font-label-mono text-[10px] uppercase text-text-muted">Specs</span>
              <strong className="mt-1 block font-headline-md text-2xl text-on-surface">{experimentCount}</strong>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border-subtle pt-4">
          <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 font-label-mono text-[10px] uppercase ${
            platformState === 'connected'
              ? 'border-primary/20 bg-primary/10 text-primary'
              : 'border-border-subtle bg-surface-container text-text-muted'
          }`}>
            <Icon name={platformState === 'connected' ? 'check' : 'cloud'} className="text-xs" />
            {platformState}
          </span>
          <span className="font-body-md text-sm text-text-muted">
            {message || health?.service || health?.platform || 'Cloudflare capability map'}
          </span>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="surface-panel rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-body-lg font-bold text-on-surface">Bindings</h3>
            <span className="font-label-mono text-[10px] uppercase text-text-muted">Runtime</span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {bindingEntries.map((binding) => (
              <div key={binding.id} className="surface-item flex items-center justify-between gap-3 rounded-2xl p-4">
                <span className="font-label-mono text-[10px] uppercase text-text-muted">{bindingLabels[binding.id] ?? binding.id}</span>
                <span className={`rounded-full border px-2 py-1 font-label-mono text-[10px] uppercase ${
                  binding.enabled
                    ? 'border-primary/20 bg-primary/10 text-primary'
                    : 'border-border-subtle text-text-muted'
                }`}>
                  {binding.enabled ? 'bound' : 'pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-panel rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-body-lg font-bold text-on-surface">Feature Flags</h3>
            <span className="font-label-mono text-[10px] uppercase text-text-muted">Config</span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {featureEntries.map(([feature, enabled]) => (
              <div key={feature} className="surface-item flex items-center justify-between gap-3 rounded-2xl p-4">
                <span className="font-body-md text-sm text-on-surface">{featureLabels[feature] ?? feature}</span>
                <span className={`rounded-full border px-2 py-1 font-label-mono text-[10px] uppercase ${
                  enabled
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-border-subtle text-text-muted'
                }`}>
                  {enabled ? 'on' : 'off'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-panel rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-body-lg font-bold text-on-surface">Experiments</h3>
            <span className="font-label-mono text-[10px] uppercase text-text-muted">Spec queue</span>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {features.experiments.map((experiment) => (
              <article key={experiment.id} className="surface-item rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-body-md text-sm font-semibold text-on-surface">{experiment.title}</h4>
                  <span className={`rounded-full border px-2 py-1 font-label-mono text-[10px] uppercase ${
                    experiment.enabled
                      ? 'border-primary/20 bg-primary/10 text-primary'
                      : 'border-border-subtle text-text-muted'
                  }`}>
                    {experiment.enabled ? 'enabled' : 'planned'}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {experiment.requires.map((item) => (
                    <span key={item} className="rounded-full border border-border-subtle px-2 py-1 font-label-mono text-[10px] uppercase text-text-muted">
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CloudflareLabPlugin
