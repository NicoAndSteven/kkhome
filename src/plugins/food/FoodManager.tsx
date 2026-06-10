import { useState, useEffect } from 'react'
import { FoodItem, EveningData } from './types'
import { saveNoonItems, saveEveningData, genId } from './utils'
import { getRecipeGroups, getFlatRecipes } from './recipes'
import Icon from '../../components/Icon'

interface Props {
  open: boolean
  noonItems: FoodItem[]
  eveningData: EveningData
  onClose: () => void
  onSave: (noon: FoodItem[], evening: EveningData) => void
}

type Tab = 'noon' | 'evening'

export default function FoodManager({ open, noonItems, eveningData, onClose, onSave }: Props) {
  const [tab, setTab] = useState<Tab>('noon')
  const [localNoon, setLocalNoon] = useState<FoodItem[]>([])
  const [localEvening, setLocalEvening] = useState<EveningData>({ custom: [], disabledIds: [] })
  const [newItemName, setNewItemName] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')

  // Sync props to local state when drawer opens
  useEffect(() => {
    if (open) {
      setLocalNoon([...noonItems])
      setLocalEvening({ custom: [...eveningData.custom], disabledIds: [...eveningData.disabledIds] })
      setSearchQuery('')
      setEditId(null)
      setNewItemName('')
    }
  }, [open, noonItems, eveningData])

  const recipeGroups = getRecipeGroups()
  const flatRecipes = getFlatRecipes()

  const handleSave = () => {
    saveNoonItems(localNoon)
    saveEveningData(localEvening)
    onSave(localNoon, localEvening)
    onClose()
  }

  const addItem = () => {
    const name = newItemName.trim()
    if (!name) return
    if (tab === 'noon') {
      setLocalNoon(prev => [...prev, { id: genId(), name, source: 'user' }])
    } else {
      setLocalEvening(prev => ({
        ...prev,
        custom: [...prev.custom, { id: genId(), name, source: 'user' as const }],
      }))
    }
    setNewItemName('')
  }

  const toggleDisable = (builtinId: string) => {
    setLocalEvening(prev => ({
      ...prev,
      disabledIds: prev.disabledIds.includes(builtinId)
        ? prev.disabledIds.filter(id => id !== builtinId)
        : [...prev.disabledIds, builtinId],
    }))
  }

  const confirmEdit = () => {
    if (!editId || !editName.trim()) return
    setLocalNoon(prev => prev.map(i => i.id === editId ? { ...i, name: editName.trim() } : i))
    setEditId(null)
  }

  const toggleCategory = (cat: string) => {
    setCollapsedCats(prev => ({ ...prev, [cat]: !prev[cat] }))
  }

  if (!open) return null

  return (
    <div className="drawer-layer open" aria-hidden={!open}>
      <button className="drawer-backdrop" type="button" aria-label="关闭" onClick={onClose} />
      <section className="contact-drawer flex flex-col" role="dialog" aria-modal="true" aria-label="管理菜单">
        {/* Header */}
        <div className="flex items-start justify-between gap-md mb-lg shrink-0">
          <div>
            <span className="font-label-mono text-xs text-primary">FOOD MANAGER</span>
            <h2 className="font-headline-md text-headline-md text-on-surface mt-xs">管理菜单</h2>
          </div>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-on-surface transition-premium" aria-label="关闭">
            <Icon name="close" className="text-2xl" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-md shrink-0 border-b border-border-subtle">
          <button type="button" onClick={() => setTab('noon')}
            className={`pb-sm px-sm text-sm font-label-mono transition-premium border-b-2 ${
              tab === 'noon' ? 'border-primary text-on-surface' : 'border-transparent text-text-muted'
            }`}>
            ☀️ 中午清单
          </button>
          <button type="button" onClick={() => setTab('evening')}
            className={`pb-sm px-sm text-sm font-label-mono transition-premium border-b-2 ${
              tab === 'evening' ? 'border-primary text-on-surface' : 'border-transparent text-text-muted'
            }`}>
            🌙 晚上菜谱
          </button>
        </div>

        {/* Add item input */}
        <div className="flex gap-xs mb-md shrink-0">
          <input
            type="text" value={newItemName}
            onChange={e => setNewItemName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder={tab === 'noon' ? '添加餐厅或菜品...' : '添加自定义菜名...'}
            className="flex-1 surface-control rounded-[2px] px-sm py-2 font-body-md text-sm text-on-surface outline-none focus:border-primary transition-premium"
          />
          <button type="button" onClick={addItem}
            className="inline-flex items-center gap-xs rounded-[2px] bg-primary px-sm py-2 font-body-md text-sm font-semibold text-on-primary hover:opacity-90 transition-premium shrink-0">
            <Icon name="add" className="text-base" />添加
          </button>
        </div>

        {/* Search (evening only) */}
        {tab === 'evening' && (
          <div className="relative mb-md shrink-0">
            <Icon name="search" className="absolute left-sm top-1/2 -translate-y-1/2 text-sm text-text-muted pointer-events-none" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索菜谱..."
              className="w-full surface-control rounded-[2px] pl-[32px] pr-sm py-2 font-body-md text-sm text-on-surface outline-none focus:border-primary transition-premium" />
          </div>
        )}

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* === NOON TAB === */}
          {tab === 'noon' && (
            localNoon.length === 0 ? (
              <p className="font-body-md text-sm text-text-muted text-center py-lg">还没添加中午选项，点击上方添加</p>
            ) : (
              <div className="flex flex-col gap-sm">
                {localNoon.map(item => (
                  <div key={item.id} className="flex items-center gap-xs surface-item rounded-[2px] px-sm py-2">
                    {editId === item.id ? (
                      <>
                        <input type="text" value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') confirmEdit() }}
                          className="flex-1 surface-control rounded-[2px] px-sm py-1 font-body-md text-sm outline-none" autoFocus />
                        <button type="button" onClick={confirmEdit}
                          className="text-primary hover:text-on-surface transition-premium">
                          <Icon name="check" className="text-lg" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-body-md text-sm text-on-surface truncate">{item.name}</span>
                        <button type="button" onClick={() => { setEditId(item.id); setEditName(item.name) }}
                          className="text-text-muted hover:text-on-surface transition-premium shrink-0">
                          <Icon name="rate_review" className="text-lg" />
                        </button>
                        <button type="button" onClick={() => setLocalNoon(prev => prev.filter(i => i.id !== item.id))}
                          className="text-text-muted hover:text-error transition-premium shrink-0">
                          <Icon name="delete" className="text-lg" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {/* === EVENING TAB === */}
          {tab === 'evening' && (
            <>
              {/* Custom items section */}
              {localEvening.custom.length > 0 && (
                <div className="mb-md">
                  <p className="font-label-mono text-xs text-text-muted mb-xs">自定义菜谱</p>
                  <div className="flex flex-col gap-sm">
                    {localEvening.custom.map(item => (
                      <div key={item.id} className="flex items-center gap-xs surface-item rounded-[2px] px-sm py-2">
                        <span className="flex-1 font-body-md text-sm text-on-surface">{item.name}</span>
                        <button type="button" onClick={() => setLocalEvening(prev => ({ ...prev, custom: prev.custom.filter(i => i.id !== item.id) }))}
                          className="text-text-muted hover:text-error transition-premium shrink-0">
                          <Icon name="delete" className="text-lg" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Built-in recipe categories */}
              <p className="font-label-mono text-xs text-text-muted mb-xs">内置菜谱 ({flatRecipes.length}道)</p>
              {searchQuery && flatRecipes.filter(r => r.name.includes(searchQuery)).length === 0 && (
                <p className="font-body-md text-sm text-text-muted text-center py-lg">没有匹配的菜谱</p>
              )}
              {recipeGroups.map(group => {
                const groupRecipes = flatRecipes.filter(r => r.category === group.category)
                const filtered = searchQuery ? groupRecipes.filter(r => r.name.includes(searchQuery)) : groupRecipes
                if (filtered.length === 0 && !searchQuery) return null
                const isCollapsed = collapsedCats[group.category] || false
                return (
                  <div key={group.category} className="surface-item rounded-[2px] mb-sm">
                    {/* Category header */}
                    <button type="button" onClick={() => toggleCategory(group.category)}
                      className="flex items-center gap-xs w-full px-sm py-2 text-left">
                      <Icon name={isCollapsed ? 'chevron_right' : 'chevron_left'} className="text-sm text-text-muted shrink-0" />
                      <span className="flex-1 font-body-md text-sm text-on-surface">{group.label}</span>
                      <span className="font-label-mono text-xs text-text-muted">{groupRecipes.length}道</span>
                    </button>
                    {/* Recipe chips */}
                    {!isCollapsed && (
                      <div className="px-sm pb-sm flex flex-wrap gap-1">
                        {filtered.map(r => {
                          const disabled = localEvening.disabledIds.includes(r.id)
                          return (
                            <button key={r.id} type="button" onClick={() => toggleDisable(r.id)}
                              className={`text-xs px-2 py-1 rounded-[2px] transition-premium ${
                                disabled
                                  ? 'bg-error/10 text-text-muted line-through'
                                  : 'bg-primary/10 text-on-surface hover:bg-primary/20'
                              }`}>
                              {r.name}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Save button */}
        <div className="border-t border-border-subtle pt-md mt-md shrink-0">
          <button type="button" onClick={handleSave}
            className="w-full inline-flex items-center justify-center gap-xs rounded-[2px] bg-primary px-md py-sm font-body-md font-semibold text-on-primary hover:opacity-90 transition-premium">
            <Icon name="check" className="text-lg" />保存修改
          </button>
        </div>
      </section>
    </div>
  )
}
