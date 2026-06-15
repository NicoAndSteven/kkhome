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
    <section id="food-plugin" className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 mb-md">
        <div>
          <span className="font-label-mono text-xs uppercase text-secondary">FOOD WHEEL</span>
          <h2 className="font-headline-md text-headline-md text-on-surface">今天吃什么</h2>
        </div>
        <button type="button" onClick={() => setManagerOpen(true)}
          className="inline-flex items-center gap-xs rounded-[2px] bg-primary px-sm py-2 font-body-md text-sm font-semibold text-on-primary transition-premium hover:opacity-90">
          <Icon name="rate_review" className="text-base" />管理菜单
        </button>
      </div>

      {/* Preview mode notice */}
      {isPreview && (
        <div className="mb-md px-sm py-1 rounded-[2px] bg-secondary/10 border border-secondary/20">
          <span className="font-body-md text-xs text-secondary">
            预览模式 · 北京时区 {getBeijingHour()}:00 后将自动切换到{period === 'noon' ? '中午' : '晚上'}转盘
          </span>
        </div>
      )}

      {/* Today's result banner */}
      {displayResult && (
        <div className="mb-md surface-panel rounded-[2px] px-md py-sm flex items-center gap-md">
          <Icon name={activePeriod === 'noon' ? 'light_mode' : 'dark_mode'} className="text-2xl text-primary" />
          <div>
            <p className="font-label-mono text-xs text-text-muted">今日已选</p>
            <p className="font-headline-md text-headline-md text-on-surface">{displayResult.item.name}</p>
          </div>
        </div>
      )}

      {/* Wheel area — centered */}
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <FoodWheel
          key={activePeriod}
          items={wheelItems}
          periodLabel={activePeriod === 'noon' ? '中午 · 公司附近' : '晚上 · 在家做'}
          periodIcon={activePeriod === 'noon' ? 'light_mode' : 'dark_mode'}
          emptyText={activePeriod === 'noon' ? '还没添加中午选项，点击管理菜单添加' : '所有菜谱都被禁用了，去管理菜单恢复一些吧'}
          onSpin={handleSpin}
          onEdit={() => setManagerOpen(true)}
        />
      </div>

      {/* Period toggle tabs */}
      <div className="flex items-center justify-center gap-md shrink-0 mt-md border-t border-border-subtle pt-md">
        <button type="button" onClick={() => setPreviewPeriod('noon')}
          className={`inline-flex items-center gap-xs font-label-mono text-xs transition-premium ${activePeriod === 'noon' ? 'text-on-surface' : 'text-text-muted hover:text-on-surface'}`}>
          <Icon name="light_mode" className="text-sm" />中午
        </button>
        <button type="button" onClick={() => setPreviewPeriod(null)}
          className={`inline-flex items-center gap-xs font-label-mono text-xs transition-premium ${previewPeriod === null ? 'text-primary' : 'text-text-muted hover:text-on-surface'}`}>
          <Icon name="autorenew" className="text-sm" />自动
        </button>
        <button type="button" onClick={() => setPreviewPeriod('evening')}
          className={`inline-flex items-center gap-xs font-label-mono text-xs transition-premium ${activePeriod === 'evening' ? 'text-on-surface' : 'text-text-muted hover:text-on-surface'}`}>
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
