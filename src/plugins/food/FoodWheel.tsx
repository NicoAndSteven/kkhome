import { useCallback, useMemo, useState } from 'react'
import { useFlickSpin, useStaggerIn } from '@core/motion'
import { FoodItem, Period } from './types'
import Icon from '../../components/Icon'

interface Props {
  items: FoodItem[]
  periodLabel: string
  periodIcon: string
  emptyText: string
  onSpin: (result: FoodItem) => void
  onEdit: () => void
  mode: Period
}

/** 14-colour palette for wheel segments — vibrant, high contrast */
const WHEEL_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFD93D', '#6C5CE7', '#FF8A5C', '#45B7D1', '#F8B500',
  '#26DE81', '#FC5C65', '#A55EEA', '#2ED573', '#FF6348', '#7BED9F', '#E056A0',
]

const cardPalette = [
  'bg-red-500/10 text-red-300 border-red-500/20',
  'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  'bg-blue-500/10 text-blue-300 border-blue-500/20',
  'bg-amber-500/10 text-amber-300 border-amber-500/20',
  'bg-violet-500/10 text-violet-300 border-violet-500/20',
]

export default function FoodWheel({ items, periodLabel, periodIcon, emptyText, onSpin, onEdit, mode }: Props) {
  const [spinning, setSpinning] = useState(false)
  const [selected, setSelected] = useState<FoodItem | null>(null)

  const activeItems = useMemo(() => items.filter((item) => !item.disabled), [items])

  const handleSelect = useCallback((item: FoodItem) => {
    setSelected(item)
    onSpin(item)
  }, [onSpin])

  // 转盘的手感：指针拖拽跟手 + 松手后弹簧落位。
  // 原来的实现是 `transition: transform 4s cubic-bezier(...)` —— 固定 4 秒匀速减速，
  // 用户没法参与，只能看它自己转完。转盘这个交互的全部价值就是手感，
  // 而"手指拨动 → 惯性滑出 → 弹簧拉回最近扇区"是连续量映射，CSS 做不到。
  const spin = useFlickSpin({
    // 落位时吸附到扇区中心
    segment: activeItems.length > 0 ? 360 / activeItems.length : 0,
    stiffness: 80,
    damping: 13,
    velocityFactor: 150,
    settleDuration: 1500,
  })

  // 结果徽章的入场。原来用 `.animate-result-pop`（CSS keyframe），
  // 换掉是为了让它和"转盘落位"共用同一套缓动语言，并拿到 reduced-motion 判断。
  const resultRef = useStaggerIn<HTMLDivElement>({
    selector: '[data-result-badge]',
    trigger: selected && !spinning ? selected.id : 'none',
    duration: 520,
    stagger: 0,
    maxTotal: 520,
    from: 16,
  })

  // ── Empty state ──
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

  // ── Single item ──
  if (activeItems.length === 1) {
    const item = activeItems[0]
    return (
      <div className="surface-panel rounded-2xl p-6 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-border-subtle bg-white/5">
          <Icon name={periodIcon} className="text-3xl text-primary" />
        </div>
        <p className="font-headline-md text-2xl text-on-surface">{item.name}</p>
        <p className="mt-2 font-body-md text-sm text-text-muted">只有一个选项，就是它了！</p>
        <button
          type="button"
          onClick={() => handleSelect(item)}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-premium hover:opacity-90"
        >
          <Icon name="check" className="text-base" />就选这个
        </button>
      </div>
    )
  }

  // ── Shared: menu list (right panel) ──
  const menuList = (
    <div className="surface-panel rounded-3xl p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-body-lg text-base font-semibold text-on-surface">本期菜单</h4>
        <span className="font-label-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
          {activeItems.length} 项
        </span>
      </div>
      <div className="mt-4 space-y-2">
        {activeItems.slice(0, 8).map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSelect(item)}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-premium ${
              selected?.id === item.id
                ? 'border-primary/30 bg-primary/10'
                : 'border-border-subtle bg-white/[0.04] hover:border-primary/25 hover:bg-white/[0.06]'
            }`}
          >
            <div className="min-w-0">
              <div className="truncate font-body-md text-sm font-semibold text-on-surface">
                {item.name}
              </div>
              <div className="font-label-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                备选 {index + 1}
              </div>
            </div>
            <Icon
              name={selected?.id === item.id ? 'check' : 'chevron_right'}
              className="text-base text-text-muted"
            />
          </button>
        ))}
      </div>
    </div>
  )

  // ══════════════════════ EVENING: Card View ══════════════════════
  if (mode === 'evening') {
    const featured = selected ?? activeItems[0]
    const chips = activeItems.slice(0, 5)

    return (
      <div className="grid w-full gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-panel-strong rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2">
              <Icon name={periodIcon} className="text-lg text-primary" />
              <span className="font-label-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                {periodLabel}
              </span>
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
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                  cardPalette[index % cardPalette.length]
                }`}
              >
                {item.name}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const next = activeItems[Math.floor(Math.random() * activeItems.length)]
                if (next) handleSelect(next)
              }}
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
        {menuList}
      </div>
    )
  }

  // ══════════════════════ NOON: Spinning Wheel ══════════════════════
  const segAngle = 360 / activeItems.length
  const gradParts = activeItems.map(
    (_, i) => `${WHEEL_COLORS[i % WHEEL_COLORS.length]} ${i * segAngle}deg ${(i + 1) * segAngle}deg`,
  )

  const handleSpin = () => {
    if (spinning || spin.dragging) return
    setSpinning(true)
    setSelected(null)

    const targetIndex = Math.floor(Math.random() * activeItems.length)
    const result = activeItems[targetIndex]

    // 指针在正上方（0°）。要让目标扇区的**中心**停到指针下面，
    // 就把转盘转到 (360 − 扇区中心角)。
    const targetCentre = targetIndex * segAngle + segAngle / 2
    const targetAngle = 360 - targetCentre
    const fullSpins = 4 + Math.floor(Math.random() * 3) // 4–6 圈

    const currentMod = spin.angle() % 360
    let delta = targetAngle - currentMod
    if (delta < 0) delta += 360
    const total = fullSpins * 360 + delta

    // snap: false —— 落点已经精确算好，再吸附一次会把"多转的几圈"抹掉，
    // 转盘就不转了。吸附只用于**手指甩动**的落位（那里落点是随机的）。
    spin.spinBy(total, {
      duration: 1500,
      snap: false,
      onSettle: () => {
        setSpinning(false)
        if (result) handleSelect(result)
      },
    })
  }

  // Adaptive label sizing — more items → smaller text, pushed closer to centre
  const n = activeItems.length
  const textTop = n > 12 ? 54 : n > 8 ? 48 : 42
  const fontSize = n > 14 ? 10 : n > 10 ? 11 : 12
  const maxWidth = n > 12 ? 42 : n > 8 ? 52 : 64

  return (
    <div className="grid w-full gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      {/* ── Left: wheel card ── */}
      <div className="surface-panel-strong rounded-3xl p-6 md:p-8 flex flex-col items-center">
        {/* Header row */}
        <div className="flex w-full items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2">
            <Icon name={periodIcon} className="text-lg text-primary" />
            <span className="font-label-mono text-[10px] uppercase tracking-[0.22em] text-primary">
              {periodLabel}
            </span>
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full border border-border-subtle px-4 py-2 text-xs font-semibold text-text-muted transition-premium hover:border-primary/40 hover:text-on-surface"
          >
            编辑菜单
          </button>
        </div>

        {/* Wheel assembly */}
        <div className="relative my-10" style={{ width: 280, height: 280 }}>
          {/* 4 gold bulb dots at the cardinal points */}
          <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full bg-[#FFD700] shadow-[0_0_8px_#FFD700] z-20" />
          <div className="absolute top-1/2 -right-[6px] -translate-y-1/2 w-[6px] h-[6px] rounded-full bg-[#FFD700] shadow-[0_0_8px_#FFD700] z-20" />
          <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full bg-[#FFD700] shadow-[0_0_8px_#FFD700] z-20" />
          <div className="absolute top-1/2 -left-[6px] -translate-y-1/2 w-[6px] h-[6px] rounded-full bg-[#FFD700] shadow-[0_0_8px_#FFD700] z-20" />

          {/* SVG pointer */}
          <div
            className="absolute -top-[22px] left-1/2 -translate-x-1/2 z-20"
            style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))' }}
          >
            <svg width="26" height="20" viewBox="0 0 26 20">
              <polygon points="13,20 0,0 26,0" fill="#002FA7" />
            </svg>
          </div>

          {/* Wheel disc */}
          <div
            ref={spin.ref}
            {...spin.bind}
            className="w-full h-full rounded-full relative touch-none cursor-grab active:cursor-grabbing"
            style={{
              background: `conic-gradient(from 0deg, ${gradParts.join(', ')})`,
              // 旋转由 anime.js 独占（`createAnimatable` 写 `rotate`）。
              // 这里**不能**再写 transform —— anime.js 的 rotate 会整个覆盖
              // `transform` 属性，两处都写就是"改一处漏一处"。
              // `touch-none` 是必须的：否则手机上纵向滑动会被浏览器当成滚动，
              // 转盘收不到 pointermove。
              boxShadow:
                '0 0 0 5px #1a1a2e, 0 0 0 8px rgba(255,215,0,0.5), 0 8px 40px rgba(0,0,0,0.18)',
            }}
          >
            {/* Segment labels — each rotated to its sector's mid-angle */}
            {activeItems.map((item, i) => {
              const midAngle = i * segAngle + segAngle / 2
              return (
                <div
                  key={item.id}
                  className="absolute top-0 left-0 w-full h-full"
                  style={{ transform: `rotate(${midAngle}deg)` }}
                >
                  <span
                    className="absolute left-1/2 -translate-x-1/2 font-bold whitespace-nowrap text-center pointer-events-none leading-tight"
                    style={{
                      top: textTop,
                      fontSize,
                      color: '#fff',
                      textShadow: '0 1px 3px rgba(0,0,0,0.55)',
                      maxWidth,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={item.name}
                  >
                    {item.name}
                  </span>
                </div>
              )
            })}

            {/* Gold inner rim */}
            <div className="absolute inset-[2px] rounded-full border-[3px] border-[rgba(255,215,0,0.35)] pointer-events-none" />

            {/* Dashed tick ring */}
            <div className="absolute -inset-[3px] rounded-full border-[1.5px] border-dashed border-white/15 pointer-events-none" />

            {/* Centre hub */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[52px] h-[52px] rounded-full bg-[#1a1a2e] flex items-center justify-center shadow-[0_2px_12px_rgba(0,0,0,0.35)] z-10">
              <span className="text-2xl">🍜</span>
            </div>
          </div>
        </div>

        {/* Spin button */}
        <button
          type="button"
          onClick={handleSpin}
          disabled={spinning || spin.dragging}
          className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all duration-200 active:scale-[0.96] ${
            spinning || spin.dragging
              ? 'bg-text-muted/20 text-text-muted cursor-not-allowed'
              : 'bg-primary text-white hover:opacity-90 shadow-[0_4px_16px_rgba(0,47,167,0.35)]'
          }`}
        >
          <Icon name="casino" className="text-lg" />
          {spin.dragging ? '松手试试' : spinning ? '转盘中...' : '转一次'}
        </button>

        {/* 拖动提示：不写的话没人知道可以直接拨 */}
        <p className="mt-3 font-label-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
          也可以直接拨动转盘
        </p>

        {/* Result badge */}
        {selected && !spinning && (
          <div ref={resultRef} className="mt-4">
            <div data-result-badge className="m-rise rounded-2xl bg-primary/10 px-6 py-3 text-center">
              <p className="font-label-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                今天中午吃
              </p>
              <p className="mt-1 font-headline-md text-xl font-semibold text-on-surface">
                {selected.name}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Right: menu list ── */}
      {menuList}
    </div>
  )
}
