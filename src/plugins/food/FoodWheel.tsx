import { useState, useRef, useCallback } from 'react'
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

// Soft, warm segment palette — muted tones for readability
const SEGMENT_COLORS = [
  '#b45309', '#047857', '#1d4ed8', '#b91c1c', '#7c3aed',
  '#0e7490', '#a21caf', '#15803d', '#c2410c', '#2563eb',
  '#9333ea', '#be123c',
]

export default function FoodWheel({ items, periodLabel, periodIcon, emptyText, onSpin, onEdit }: Props) {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [selected, setSelected] = useState<FoodItem | null>(null)
  const targetRef = useRef(0)
  const rotationRef = useRef(0)
  // Use a non-state counter to force reset of selected after re-spin
  const [spinCount, setSpinCount] = useState(0)

  const activeItems = items.filter(i => !i.disabled)

  const spin = useCallback(() => {
    if (spinning || activeItems.length === 0) return
    setSpinning(true)
    setSelected(null)

    const targetIndex = Math.floor(Math.random() * activeItems.length)
    targetRef.current = targetIndex

    // Double requestAnimationFrame: first frame activates transition,
    // second frame changes rotation — guarantees transitionend fires
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const segAngle = 360 / activeItems.length
        const targetAngle = targetIndex * segAngle + segAngle / 2
        const fullSpins = 3 + Math.floor(Math.random() * 4)
        const currentRotation = rotationRef.current
        const total = currentRotation + fullSpins * 360 + (360 - (currentRotation % 360) + targetAngle)
        rotationRef.current = total
        setRotation(total)
      })
    })
  }, [spinning, activeItems])

  const handleTransitionEnd = useCallback(() => {
    if (!spinning) return
    setSpinning(false)
    setSpinCount(c => c + 1)
    const result = activeItems[targetRef.current]
    if (result) { setSelected(result); onSpin(result) }
  }, [spinning, activeItems, onSpin])

  // Empty state
  if (activeItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-md text-center">
        <Icon name={periodIcon} className="text-5xl opacity-30" />
        <p className="font-body-md text-body-md text-text-muted max-w-xs">{emptyText}</p>
        <button type="button" onClick={onEdit}
          className="inline-flex items-center gap-xs rounded-[2px] bg-primary px-sm py-2 font-body-md text-sm font-semibold text-on-primary transition-premium hover:opacity-90">
          <Icon name="add" className="text-base" />添加选项
        </button>
      </div>
    )
  }

  // Single item
  if (activeItems.length === 1) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-md text-center">
        <div className="w-48 h-48 rounded-full border-2 border-primary flex items-center justify-center bg-primary/5">
          <span className="font-headline-md text-headline-md text-primary px-md text-center">{activeItems[0].name}</span>
        </div>
        <p className="font-body-md text-body-md text-text-muted">只有一个选项，就是它了！</p>
      </div>
    )
  }

  const segAngle = 360 / activeItems.length
  const gradParts = activeItems.map((_, i) =>
    `${SEGMENT_COLORS[i % SEGMENT_COLORS.length]} ${i * segAngle}deg ${(i + 1) * segAngle}deg`
  )
  const showEvery = activeItems.length > 24 ? 2 : 1

  return (
    <div className="flex flex-col items-center justify-center h-full gap-lg select-none">
      {/* Period label */}
      <div className="flex items-center gap-xs">
        <Icon name={periodIcon} className="text-lg" />
        <span className="font-label-mono text-xs uppercase text-secondary">{periodLabel}</span>
      </div>

      {/* Wheel container */}
      <div className="relative w-60 h-60 md:w-64 md:h-64">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[2px] z-10">
          <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-primary drop-shadow-md" />
        </div>

        {/* Wheel disc */}
        <div
          className="w-full h-full rounded-full relative"
          style={{
            background: `conic-gradient(${gradParts.join(', ')})`,
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            boxShadow: '0 0 0 4px var(--color-panel-border-strong), 0 6px 24px var(--color-panel-shadow)',
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {/* Segment labels */}
          {activeItems.map((item, i) => {
            if (i % showEvery !== 0) return null
            const midAngle = i * segAngle + segAngle / 2
            return (
              <div
                key={item.id}
                className="absolute top-0 left-0 w-full h-full"
                style={{ transform: `rotate(${midAngle}deg)` }}
              >
                <span
                  className="absolute left-1/2 top-1 -translate-x-1/2 text-[10px] font-semibold whitespace-nowrap truncate max-w-[60px] text-center leading-tight rounded-[2px] px-1"
                  style={{
                    color: '#fff',
                    textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                    backgroundColor: 'rgba(0,0,0,0.25)',
                  }}
                  title={item.name}
                >
                  {item.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-sm">
        {!selected ? (
          <button type="button" onClick={spin} disabled={spinning}
            className={`inline-flex items-center gap-xs rounded-[2px] px-lg py-2 font-body-md font-semibold transition-premium ${
              spinning
                ? 'bg-text-muted/20 text-text-muted cursor-not-allowed'
                : 'bg-primary text-on-primary hover:opacity-90 active:scale-[0.97]'
            }`}>
            <Icon name="smart_display" className="text-lg" />
            {spinning ? '转盘中…' : '转一次'}
          </button>
        ) : (
          <>
            <button type="button" onClick={spin}
              className="inline-flex items-center gap-xs rounded-[2px] bg-primary px-lg py-2 font-body-md font-semibold text-on-primary transition-premium hover:opacity-90 active:scale-[0.97]">
              <Icon name="smart_display" className="text-lg" />
              换一个
            </button>
            <button type="button" onClick={() => setSelected(null)}
              className="inline-flex items-center gap-xs rounded-[2px] border border-border px-lg py-2 font-body-md text-sm text-on-surface transition-premium hover:bg-surface-hover active:scale-[0.97]">
              收起
            </button>
          </>
        )}
      </div>

      {/* Result card */}
      {selected && (
        <div key={spinCount} className="w-full max-w-xs surface-panel rounded-[2px] p-md text-center transition-premium">
          <p className="font-label-mono text-xs text-text-muted"><Icon name={periodIcon} className="text-xs align-middle" /> 今日推荐</p>
          <p className="mt-sm font-headline-lg text-headline-lg text-on-surface">{selected.name}</p>
          <p className="mt-xs font-body-md text-xs text-text-muted">
            点击「换一个」重新选择，不满意再转转
          </p>
        </div>
      )}
    </div>
  )
}
