import { useState, useEffect, useCallback } from 'react'
import { PluginRuntimeConfig } from '@core/types'
import { FoodItem, EveningData, Period } from './types'
import { loadNoonItems, loadEveningData, loadTodayResult, saveTodayResult, getCurrentPeriod, getBeijingHour } from './utils'
import { buildEveningItems } from './recipes'
import FoodWheel from './FoodWheel'
import FoodManager from './FoodManager'
import Icon from '../../components/Icon'

interface Props { config?: PluginRuntimeConfig }

export default function FoodPlugin(_props: Props) {
  const [period, setPeriod] = useState<Period>(getCurrentPeriod())
  const [previewPeriod, setPreviewPeriod] = useState<Period | null>(null)
  const [noonItems, setNoonItems] = useState<FoodItem[]>(() => loadNoonItems())
  const [eveningData, setEveningData] = useState<EveningData>(() => loadEveningData())
  const [todayResult, setTodayResult] = useState<{ item: FoodItem; period: Period } | null>(() => loadTodayResult())
  const [managerOpen, setManagerOpen] = useState(false)

  const activePeriod = previewPeriod ?? period

  // Poll Beijing time every 60s for auto-switching at 13:00
  useEffect(() => {
    const tick = () => { setPeriod(getCurrentPeriod()) }
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])

  const eveningItems = buildEveningItems(eveningData.custom, eveningData.disabledIds)
  const wheelItems = activePeriod === 'noon' ? noonItems : eveningItems

  const handleSpin = useCallback((result: FoodItem) => {
    const resultData = { item: result, period: activePeriod }
    saveTodayResult(resultData)
    setTodayResult(resultData)
  }, [activePeriod])

  const handleSaveManager = useCallback((noon: FoodItem[], evening: EveningData) => {
    setNoonItems(noon)
    setEveningData(evening)
  }, [])

  const isPreview = previewPeriod !== null && previewPeriod !== period
  const displayResult = todayResult?.period === activePeriod ? todayResult : null

  return (
    <section id="food-plugin" className="space-y-5">
      <div className="stack-board surface-panel-strong rounded-[28px] p-5 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-label-mono text-[10px] uppercase tracking-[0.34em] text-primary">Section 03</span>
              <span className="h-px w-24 bg-[linear-gradient(90deg,rgba(17,72,255,0.6),rgba(224,20,52,0.55),transparent)]" />
            </div>
            <h2 className="mt-3 font-headline-md text-[clamp(2.4rem,4.8vw,4.2rem)] font-semibold leading-[0.92] tracking-[-0.08em] text-on-surface">今天吃什么</h2>
            <p className="mt-3 max-w-2xl font-body-md text-sm leading-relaxed text-on-surface-variant">
              把随机推荐做成一块轻松的菜单海报，保留随机性，但不再像独立的小工具。
            </p>
          </div>
          <button
            type="button"
            onClick={() => setManagerOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition-premium hover:opacity-90"
          >
            <Icon name="rate_review" className="text-base" />
            管理菜单
          </button>
        </div>

        {isPreview && (
          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/8 px-4 py-3">
            <span className="font-body-md text-xs text-primary">
              预览模式 · 北京时区 {getBeijingHour()}:00 后将自动切换到{period === 'noon' ? '中午' : '晚上'}推荐
            </span>
          </div>
        )}

        {displayResult && (
          <div className="mt-4 flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/8 px-4 py-4">
            <Icon name={activePeriod === 'noon' ? 'light_mode' : 'dark_mode'} className="text-2xl text-primary" />
            <div>
              <p className="font-label-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">今日已选</p>
              <p className="mt-1 font-headline-md text-2xl text-on-surface">{displayResult.item.name}</p>
            </div>
          </div>
        )}
      </div>

      <FoodWheel
        key={activePeriod}
        mode={activePeriod}
        items={wheelItems}
        periodLabel={activePeriod === 'noon' ? '中午 · 公司附近' : '晚上 · 在家做'}
        periodIcon={activePeriod === 'noon' ? 'light_mode' : 'dark_mode'}
        emptyText={activePeriod === 'noon' ? '还没添加中午选项，点击管理菜单添加' : '所有菜谱都被禁用了，去管理菜单恢复一些吧'}
        onSpin={handleSpin}
        onEdit={() => setManagerOpen(true)}
      />

      <div className="flex items-center justify-center gap-3 border-t border-border-subtle pt-4">
        <button type="button" onClick={() => setPreviewPeriod('noon')}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-premium ${activePeriod === 'noon' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-white hover:text-on-surface'}`}>
          <Icon name="light_mode" className="text-sm" />中午
        </button>
        <button type="button" onClick={() => setPreviewPeriod(null)}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-premium ${previewPeriod === null ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-white hover:text-on-surface'}`}>
          <Icon name="autorenew" className="text-sm" />自动
        </button>
        <button type="button" onClick={() => setPreviewPeriod('evening')}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-premium ${activePeriod === 'evening' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-white hover:text-on-surface'}`}>
          <Icon name="dark_mode" className="text-sm" />晚上
        </button>
      </div>

      {/* Manager drawer */}
      <FoodManager
        open={managerOpen}
        noonItems={noonItems}
        eveningData={eveningData}
        onClose={() => setManagerOpen(false)}
        onSave={handleSaveManager}
      />
    </section>
  )
}
