import { useCallback, useMemo, useState } from 'react'
import { FoodItem } from './types'
import Icon from '../../components/Icon'

interface Props {
  items: FoodItem[]
  periodLabel: string
  periodIcon: string
  emptyText: string
  onSpin: (result: FoodItem) => void
  onEdit: () => void
}

const palette = [
  'bg-red-500/10 text-red-300 border-red-500/20',
  'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  'bg-blue-500/10 text-blue-300 border-blue-500/20',
  'bg-amber-500/10 text-amber-300 border-amber-500/20',
  'bg-violet-500/10 text-violet-300 border-violet-500/20',
]

export default function FoodWheel({ items, periodLabel, periodIcon, emptyText, onSpin, onEdit }: Props) {
  const [selected, setSelected] = useState<FoodItem | null>(null)

  const activeItems = useMemo(() => items.filter((item) => !item.disabled), [items])

  const pickRandom = useCallback(() => {
    if (activeItems.length === 0) return
    const next = activeItems[Math.floor(Math.random() * activeItems.length)]
    if (!next) return
    setSelected(next)
    onSpin(next)
  }, [activeItems, onSpin])

  if (activeItems.length === 0) {
    return (
      <div className="surface-panel rounded-2xl p-6 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-border-subtle bg-white/5">
          <Icon name={periodIcon} className="text-3xl text-primary" />
        </div>
        <p className="mx-auto max-w-sm font-body-md text-sm text-text-muted">{emptyText}</p>
        <button
          type="button"
          onClick={onEdit}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-premium hover:opacity-90"
        >
          <Icon name="add" className="text-base" />
          添加选项
        </button>
      </div>
    )
  }

  const featured = selected ?? activeItems[0]
  const chips = activeItems.slice(0, 5)

  return (
    <div className="grid w-full gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="surface-panel-strong rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2">
            <Icon name={periodIcon} className="text-lg text-primary" />
            <span className="font-label-mono text-[10px] uppercase tracking-[0.22em] text-primary">{periodLabel}</span>
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full border border-border-subtle px-4 py-2 text-xs font-semibold text-text-muted transition-premium hover:border-primary/40 hover:text-on-surface"
          >
            编辑菜单
          </button>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-label-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">今日推荐</p>
            <h3 className="mt-2 truncate font-headline-md text-3xl font-semibold tracking-tight text-on-surface">
              {featured.name}
            </h3>
            <p className="mt-2 max-w-xl font-body-md text-sm leading-relaxed text-on-surface-variant">
              点击下方按钮随机切换，或者从右侧菜单里挑选你今天想吃的。
            </p>
          </div>
          <div className="hidden md:grid h-24 w-24 place-items-center rounded-3xl border border-border-subtle bg-primary/10">
            <Icon name={periodIcon} className="text-4xl text-primary" />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {chips.map((item, index) => (
            <span
              key={item.id}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${palette[index % palette.length]}`}
            >
              {item.name}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={pickRandom}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-premium hover:opacity-90 active:scale-[0.98]"
          >
            <Icon name="shuffle" className="text-base" />
            随机推荐
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-full border border-border-subtle px-5 py-2.5 text-sm font-semibold text-on-surface transition-premium hover:border-primary/40 hover:bg-white/5 active:scale-[0.98]"
          >
            <Icon name="rate_review" className="text-base" />
            管理菜单
          </button>
        </div>
      </div>

      <div className="surface-panel rounded-3xl p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-body-lg text-base font-semibold text-on-surface">本期菜单</h4>
          <span className="font-label-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">{activeItems.length} 项</span>
        </div>
        <div className="mt-4 space-y-2">
          {activeItems.slice(0, 8).map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSelected(item)
                onSpin(item)
              }}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-premium ${
                selected?.id === item.id
                  ? 'border-primary/30 bg-primary/10'
                  : 'border-border-subtle bg-white/[0.04] hover:border-primary/25 hover:bg-white/[0.06]'
              }`}
            >
              <div className="min-w-0">
                <div className="truncate font-body-md text-sm font-semibold text-on-surface">{item.name}</div>
                <div className="font-label-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                  备选 {index + 1}
                </div>
              </div>
              <Icon name={selected?.id === item.id ? 'check' : 'chevron_right'} className="text-base text-text-muted" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
