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

const SEGMENT_COLORS = [
  '#006c7a', '#c2410c', '#d97706', '#0891b2', '#7c3aed',
  '#059669', '#db2777', '#4f46e5', '#dc2626', '#0e7490',
  '#b91c1c', '#1d4ed8',
]

export default function FoodWheel({ items, periodLabel, periodIcon, emptyText, onSpin, onEdit }: Props) {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [selected, setSelected] = useState<FoodItem | null>(null)
  const targetRef = useRef(0)

  const activeItems = items.filter(i => !i.disabled)

  const spin = useCallback(() => {
    if (spinning || activeItems.length === 0) return
    setSpinning(true)
    setSelected(null)

    const targetIndex = Math.floor(Math.random() * activeItems.length)
    targetRef.current = targetIndex
    const segAngle = 360 / activeItems.length
    const targetAngle = targetIndex * segAngle + segAngle / 2
    const fullSpins = 3 + Math.floor(Math.random() * 4)
    const total = rotation + fullSpins * 360 + (360 - (rotation % 360) + targetAngle)
    setRotation(total)
  }, [spinning, activeItems, rotation])

  const handleTransitionEnd = useCallback(() => {
    if (!spinning) return
    setSpinning(false)
    const result = activeItems[targetRef.current]
    if (result) { setSelected(result); onSpin(result) }
  }, [spinning, activeItems, onSpin])

  // Empty state
  if (activeItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-md text-center">
        <span className="text-5xl opacity-30">{periodIcon}</span>
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
    <div className="flex flex-col items-center justify-center h-full gap-md select-none">
      {/* Period header */}
      <div className="flex items-center gap-xs">
        <span className="text-lg">{periodIcon}</span>
        <span className="font-label-mono text-xs uppercase text-secondary">{periodLabel}</span>
      </div>

      {/* Wheel + pointer */}
      <div className="relative w-64 h-64 md:w-72 md:h-72">
        {/* Pointer triangle at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[18px] border-l-transparent border-r-transparent border-t-primary drop-shadow-md" />
        </div>
        {/* Wheel disc */}
        <div
          className="w-full h-full rounded-full relative"
          style={{
            background: `conic-gradient(${gradParts.join(', ')})`,
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            boxShadow: '0 0 0 4px var(--color-panel-border-strong), 0 8px 32px var(--color-panel-shadow)',
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {/* Segment labels */}
          {activeItems.map((item, i) => {
            if (i % showEvery !== 0) return null
            const midAngle = i * segAngle + segAngle / 2
            return (
              <div key={item.id} className="absolute top-0 left-0 w-full h-full" style={{ transform: `rotate(${midAngle}deg)` }}>
                <span
                  className="absolute left-1/2 top-2 -translate-x-1/2 text-[11px] font-semibold whitespace-nowrap truncate max-w-[68px] text-center leading-tight"
                  style={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.45)' }}
                  title={item.name}
                >
                  {item.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Spin button */}
      <button type="button" onClick={spin} disabled={spinning}
        className={`inline-flex items-center gap-xs rounded-[2px] px-md py-sm font-body-md font-semibold transition-premium ${
          spinning
            ? 'bg-text-muted/20 text-text-muted cursor-not-allowed'
            : 'bg-primary text-on-primary hover:opacity-90'
        }`}>
        <Icon name="smart_display" className="text-lg" />
        {spinning ? '转盘中...' : '🎯 转一次'}
      </button>

      {/* Result display */}
      {selected && (
        <div className="text-center">
          <p className="font-label-mono text-xs text-text-muted">今日推荐</p>
          <p className="font-headline-md text-headline-md text-on-surface mt-xs">{selected.name}</p>
        </div>
      )}
    </div>
  )
}
