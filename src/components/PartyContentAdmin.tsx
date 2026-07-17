import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import Icon from './Icon'

interface UndercoverAdminItem {
  id: string
  civilianWord: string
  undercoverWord: string
  category: string
  difficulty: 'easy' | 'normal'
  enabled: boolean
}

interface TruthOrDareAdminItem {
  id: string
  type: 'truth' | 'dare'
  content: string
  category: string
  intensity: 'soft' | 'normal' | 'spicy'
  enabled: boolean
}

interface Props {
  token: string
}

type ContentTab = 'undercover' | 'truth-or-dare'
type StatusFilter = 'all' | 'enabled' | 'disabled'
type DifficultyFilter = 'all' | 'easy' | 'normal'
type CardTypeFilter = 'all' | 'truth' | 'dare'
type IntensityFilter = 'all' | 'soft' | 'normal' | 'spicy'
type UndercoverForm = Omit<UndercoverAdminItem, 'id'>
type CardForm = Omit<TruthOrDareAdminItem, 'id'>

const emptyUndercover: UndercoverForm = {
  civilianWord: '',
  undercoverWord: '',
  category: '生活',
  difficulty: 'easy' as const,
  enabled: true,
}

const emptyCard: CardForm = {
  type: 'truth' as const,
  content: '',
  category: '轻松',
  intensity: 'soft' as const,
  enabled: true,
}

const statusLabel = (enabled: boolean) => (enabled ? '启用' : '停用')

const matchesStatus = (enabled: boolean, filter: StatusFilter) => {
  if (filter === 'all') return true
  return filter === 'enabled' ? enabled : !enabled
}

const PartyContentAdmin = ({ token }: Props) => {
  const [tab, setTab] = useState<ContentTab>('undercover')
  const [words, setWords] = useState<UndercoverAdminItem[]>([])
  const [cards, setCards] = useState<TruthOrDareAdminItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingWordId, setEditingWordId] = useState<string | null>(null)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [wordForm, setWordForm] = useState<UndercoverForm>(emptyUndercover)
  const [cardForm, setCardForm] = useState<CardForm>(emptyCard)
  const [saving, setSaving] = useState(false)
  const [operatingId, setOperatingId] = useState<string | null>(null)
  const [wordStatusFilter, setWordStatusFilter] = useState<StatusFilter>('all')
  const [wordDifficultyFilter, setWordDifficultyFilter] = useState<DifficultyFilter>('all')
  const [wordCategoryFilter, setWordCategoryFilter] = useState('all')
  const [cardStatusFilter, setCardStatusFilter] = useState<StatusFilter>('all')
  const [cardTypeFilter, setCardTypeFilter] = useState<CardTypeFilter>('all')
  const [cardCategoryFilter, setCardCategoryFilter] = useState('all')
  const [cardIntensityFilter, setCardIntensityFilter] = useState<IntensityFilter>('all')
  const [bulkJson, setBulkJson] = useState('')
  const [bulkImporting, setBulkImporting] = useState(false)
  const [bulkResult, setBulkResult] = useState('')
  const [bulkOpen, setBulkOpen] = useState(false)

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token])

  const fetchContent = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [wordRes, cardRes] = await Promise.all([
        fetch('/api/party/content/undercover', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/party/content/truth-or-dare', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const [wordJson, cardJson] = await Promise.all([wordRes.json(), cardRes.json()])
      if (!wordJson.ok) throw new Error(wordJson.error?.message || '卧底词库加载失败')
      if (!cardJson.ok) throw new Error(cardJson.error?.message || '真心话大冒险加载失败')
      setWords(wordJson.data.items ?? [])
      setCards(cardJson.data.items ?? [])
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : '题库加载失败')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void fetchContent()
  }, [fetchContent])

  const wordCategories = useMemo(
    () => ['all', ...new Set(words.map((item) => item.category))],
    [words],
  )

  const cardCategories = useMemo(
    () => ['all', ...new Set(cards.map((item) => item.category))],
    [cards],
  )

  const filteredWords = useMemo(
    () => words.filter((item) => (
      matchesStatus(item.enabled, wordStatusFilter)
      && (wordDifficultyFilter === 'all' || item.difficulty === wordDifficultyFilter)
      && (wordCategoryFilter === 'all' || item.category === wordCategoryFilter)
    )),
    [wordCategoryFilter, wordDifficultyFilter, wordStatusFilter, words],
  )

  const filteredCards = useMemo(
    () => cards.filter((item) => (
      matchesStatus(item.enabled, cardStatusFilter)
      && (cardTypeFilter === 'all' || item.type === cardTypeFilter)
      && (cardCategoryFilter === 'all' || item.category === cardCategoryFilter)
      && (cardIntensityFilter === 'all' || item.intensity === cardIntensityFilter)
    )),
    [cardCategoryFilter, cardIntensityFilter, cardStatusFilter, cardTypeFilter, cards],
  )

  const resetWordForm = () => {
    setWordForm(emptyUndercover)
    setEditingWordId(null)
  }

  const resetCardForm = () => {
    setCardForm(emptyCard)
    setEditingCardId(null)
  }

  const saveWord = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    try {
      const url = editingWordId ? `/api/party/content/undercover/${editingWordId}` : '/api/party/content/undercover'
      const response = await fetch(url, {
        method: editingWordId ? 'PUT' : 'POST',
        headers: authHeaders,
        body: JSON.stringify(wordForm),
      })
      const json = await response.json()
      if (!json.ok) throw new Error(json.error?.message || '保存失败')
      resetWordForm()
      await fetchContent()
    } catch (saveError) {
      alert(saveError instanceof Error ? saveError.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const saveCard = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    try {
      const url = editingCardId ? `/api/party/content/truth-or-dare/${editingCardId}` : '/api/party/content/truth-or-dare'
      const response = await fetch(url, {
        method: editingCardId ? 'PUT' : 'POST',
        headers: authHeaders,
        body: JSON.stringify(cardForm),
      })
      const json = await response.json()
      if (!json.ok) throw new Error(json.error?.message || '保存失败')
      resetCardForm()
      await fetchContent()
    } catch (saveError) {
      alert(saveError instanceof Error ? saveError.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const toggleWordEnabled = async (item: UndercoverAdminItem) => {
    setOperatingId(item.id)
    try {
      const response = await fetch(`/api/party/content/undercover/${item.id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          civilianWord: item.civilianWord,
          undercoverWord: item.undercoverWord,
          category: item.category,
          difficulty: item.difficulty,
          enabled: !item.enabled,
        }),
      })
      const json = await response.json()
      if (!json.ok) throw new Error(json.error?.message || '状态更新失败')
      await fetchContent()
    } catch (updateError) {
      alert(updateError instanceof Error ? updateError.message : '状态更新失败')
    } finally {
      setOperatingId(null)
    }
  }

  const toggleCardEnabled = async (item: TruthOrDareAdminItem) => {
    setOperatingId(item.id)
    try {
      const response = await fetch(`/api/party/content/truth-or-dare/${item.id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          type: item.type,
          content: item.content,
          category: item.category,
          intensity: item.intensity,
          enabled: !item.enabled,
        }),
      })
      const json = await response.json()
      if (!json.ok) throw new Error(json.error?.message || '状态更新失败')
      await fetchContent()
    } catch (updateError) {
      alert(updateError instanceof Error ? updateError.message : '状态更新失败')
    } finally {
      setOperatingId(null)
    }
  }

  const runBulkImport = async () => {
    setBulkImporting(true)
    setBulkResult('')
    let items
    try {
      items = JSON.parse(bulkJson)
      if (!Array.isArray(items)) throw new Error('请输入一个 JSON 数组')
    } catch (parseError) {
      setBulkResult(`JSON 解析失败: ${parseError instanceof Error ? parseError.message : '格式错误'}`)
      setBulkImporting(false)
      return
    }

    const endpoint = tab === 'undercover' ? '/api/party/content/undercover' : '/api/party/content/truth-or-dare'
    let ok = 0; const errors: string[] = []
    for (let i = 0; i < items.length; i++) {
      try {
        const res = await fetch(endpoint, { method: 'POST', headers: authHeaders, body: JSON.stringify(items[i]) })
        const json = await res.json()
        if (json.ok) ok++; else errors.push(`[${i}] ${json.error?.message || '失败'}`)
      } catch (fetchError) {
        errors.push(`[${i}] ${fetchError instanceof Error ? fetchError.message : '网络错误'}`)
      }
    }
    setBulkResult(`导入完成: ${ok}/${items.length} 成功${errors.length > 0 ? `, ${errors.length} 失败` : ''}`)
    if (errors.length > 0 && errors.length <= 5) setBulkResult((prev) => prev + '\n' + errors.join('\n'))
    setBulkImporting(false)
    if (ok > 0) { setBulkJson(''); await fetchContent() }
  }

  const editWord = (item: UndercoverAdminItem) => {
    setTab('undercover')
    setEditingWordId(item.id)
    setWordForm({
      civilianWord: item.civilianWord,
      undercoverWord: item.undercoverWord,
      category: item.category,
      difficulty: item.difficulty,
      enabled: item.enabled,
    })
  }

  const editCard = (item: TruthOrDareAdminItem) => {
    setTab('truth-or-dare')
    setEditingCardId(item.id)
    setCardForm({
      type: item.type,
      content: item.content,
      category: item.category,
      intensity: item.intensity,
      enabled: item.enabled,
    })
  }

  const renderWordFilters = () => (
    <div className="mt-5 grid gap-3 md:grid-cols-3">
      <label className="grid gap-1 text-xs text-text-muted">
        状态筛选
        <select
          aria-label="状态筛选"
          value={wordStatusFilter}
          onChange={(event) => setWordStatusFilter(event.target.value as StatusFilter)}
          className="rounded-xl border border-border-subtle bg-surface-container px-3 py-2 text-sm text-on-surface"
        >
          <option value="all">全部状态</option>
          <option value="enabled">仅启用</option>
          <option value="disabled">仅停用</option>
        </select>
      </label>
      <label className="grid gap-1 text-xs text-text-muted">
        难度筛选
        <select
          aria-label="难度筛选"
          value={wordDifficultyFilter}
          onChange={(event) => setWordDifficultyFilter(event.target.value as DifficultyFilter)}
          className="rounded-xl border border-border-subtle bg-surface-container px-3 py-2 text-sm text-on-surface"
        >
          <option value="all">全部难度</option>
          <option value="easy">简单</option>
          <option value="normal">普通</option>
        </select>
      </label>
      <label className="grid gap-1 text-xs text-text-muted">
        分类筛选
        <select
          aria-label="分类筛选"
          value={wordCategoryFilter}
          onChange={(event) => setWordCategoryFilter(event.target.value)}
          className="rounded-xl border border-border-subtle bg-surface-container px-3 py-2 text-sm text-on-surface"
        >
          <option value="all">全部分类</option>
          {wordCategories.filter((value) => value !== 'all').map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </label>
    </div>
  )

  const renderCardFilters = () => (
    <div className="mt-5 grid gap-3 md:grid-cols-4">
      <label className="grid gap-1 text-xs text-text-muted">
        状态筛选
        <select
          aria-label="状态筛选"
          value={cardStatusFilter}
          onChange={(event) => setCardStatusFilter(event.target.value as StatusFilter)}
          className="rounded-xl border border-border-subtle bg-surface-container px-3 py-2 text-sm text-on-surface"
        >
          <option value="all">全部状态</option>
          <option value="enabled">仅启用</option>
          <option value="disabled">仅停用</option>
        </select>
      </label>
      <label className="grid gap-1 text-xs text-text-muted">
        类型筛选
        <select
          aria-label="类型筛选"
          value={cardTypeFilter}
          onChange={(event) => setCardTypeFilter(event.target.value as CardTypeFilter)}
          className="rounded-xl border border-border-subtle bg-surface-container px-3 py-2 text-sm text-on-surface"
        >
          <option value="all">全部类型</option>
          <option value="truth">真心话</option>
          <option value="dare">大冒险</option>
        </select>
      </label>
      <label className="grid gap-1 text-xs text-text-muted">
        分类筛选
        <select
          aria-label="分类筛选"
          value={cardCategoryFilter}
          onChange={(event) => setCardCategoryFilter(event.target.value)}
          className="rounded-xl border border-border-subtle bg-surface-container px-3 py-2 text-sm text-on-surface"
        >
          <option value="all">全部分类</option>
          {cardCategories.filter((value) => value !== 'all').map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-xs text-text-muted">
        强度筛选
        <select
          aria-label="强度筛选"
          value={cardIntensityFilter}
          onChange={(event) => setCardIntensityFilter(event.target.value as IntensityFilter)}
          className="rounded-xl border border-border-subtle bg-surface-container px-3 py-2 text-sm text-on-surface"
        >
          <option value="all">全部强度</option>
          <option value="soft">轻松</option>
          <option value="normal">普通</option>
          <option value="spicy">稍刺激</option>
        </select>
      </label>
    </div>
  )

  const renderWordList = () => {
    if (filteredWords.length === 0) {
      return <p className="py-12 text-center text-sm text-text-muted">当前筛选下没有卧底词条。</p>
    }

    return (
      <div className="mt-5 space-y-3">
        {filteredWords.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border-subtle bg-surface-container/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-body-md text-base font-semibold text-on-surface">{item.civilianWord} / {item.undercoverWord}</p>
                <p className="mt-1 text-xs text-text-muted">
                  {item.category} · {item.difficulty === 'easy' ? '简单' : '普通'} · {statusLabel(item.enabled)}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => editWord(item)}
                  className="rounded-full border border-border-subtle px-3 py-1.5 text-xs text-text-muted hover:text-on-surface"
                >
                  编辑
                </button>
                <button
                  type="button"
                  aria-label={`${item.enabled ? '停用' : '启用'} ${item.civilianWord} / ${item.undercoverWord}`}
                  onClick={() => { void toggleWordEnabled(item) }}
                  disabled={operatingId === item.id}
                  className="rounded-full border border-border-subtle px-3 py-1.5 text-xs text-text-muted hover:text-on-surface disabled:opacity-50"
                >
                  {operatingId === item.id ? '处理中' : item.enabled ? '停用' : '启用'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderCardList = () => {
    if (filteredCards.length === 0) {
      return <p className="py-12 text-center text-sm text-text-muted">当前筛选下没有真心话大冒险题目。</p>
    }

    return (
      <div className="mt-5 space-y-3">
        {filteredCards.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border-subtle bg-surface-container/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-body-md text-base font-semibold text-on-surface">{item.content}</p>
                <p className="mt-1 text-xs text-text-muted">
                  {item.type === 'truth' ? '真心话' : '大冒险'} · {item.category} · {item.intensity} · {statusLabel(item.enabled)}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => editCard(item)}
                  className="rounded-full border border-border-subtle px-3 py-1.5 text-xs text-text-muted hover:text-on-surface"
                >
                  编辑
                </button>
                <button
                  type="button"
                  aria-label={`${item.enabled ? '停用' : '启用'} ${item.content}`}
                  onClick={() => { void toggleCardEnabled(item) }}
                  disabled={operatingId === item.id}
                  className="rounded-full border border-border-subtle px-3 py-1.5 text-xs text-text-muted hover:text-on-surface disabled:opacity-50"
                >
                  {operatingId === item.id ? '处理中' : item.enabled ? '停用' : '启用'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="surface-panel rounded-2xl border border-border-subtle p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-headline-md text-2xl text-on-surface">聚会题库</h2>
            <p className="mt-1 font-body-md text-sm text-text-muted">管理谁是卧底词库和真心话大冒险卡片。</p>
          </div>
          <button
            type="button"
            onClick={() => { void fetchContent() }}
            className="rounded-full border border-border-subtle px-4 py-2 text-xs font-semibold text-text-muted hover:text-on-surface"
          >
            刷新
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 rounded-2xl bg-surface-container p-1">
          <button
            type="button"
            onClick={() => setTab('undercover')}
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${tab === 'undercover' ? 'bg-surface text-on-surface shadow-sm' : 'text-text-muted'}`}
          >
            谁是卧底 ({words.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('truth-or-dare')}
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${tab === 'truth-or-dare' ? 'bg-surface text-on-surface shadow-sm' : 'text-text-muted'}`}
          >
            真心话大冒险 ({cards.length})
          </button>
        </div>

        {tab === 'undercover' ? renderWordFilters() : renderCardFilters()}

        {loading && <p className="py-12 text-center text-sm text-text-muted">加载中...</p>}
        {error && <p className="py-12 text-center text-sm text-error">{error}</p>}

        {!loading && !error && (tab === 'undercover' ? renderWordList() : renderCardList())}
      </section>

      <aside className="surface-panel rounded-2xl border border-border-subtle p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-headline-md text-lg text-on-surface">新增题目</h3>
          {(editingWordId || editingCardId) && (
            <button
              type="button"
              onClick={() => {
                resetWordForm()
                resetCardForm()
              }}
              className="rounded-full border border-border-subtle px-3 py-1 text-xs text-text-muted hover:text-on-surface"
            >
              取消编辑
            </button>
          )}
        </div>
        {tab === 'undercover' ? (
          <form onSubmit={saveWord} className="mt-4 space-y-3">
            <input
              value={wordForm.civilianWord}
              onChange={(event) => setWordForm({ ...wordForm, civilianWord: event.target.value })}
              placeholder="平民词"
              className="w-full rounded-xl border border-border-subtle bg-surface-container px-3 py-2 text-sm"
            />
            <input
              value={wordForm.undercoverWord}
              onChange={(event) => setWordForm({ ...wordForm, undercoverWord: event.target.value })}
              placeholder="卧底词"
              className="w-full rounded-xl border border-border-subtle bg-surface-container px-3 py-2 text-sm"
            />
            <input
              value={wordForm.category}
              onChange={(event) => setWordForm({ ...wordForm, category: event.target.value })}
              placeholder="分类"
              className="w-full rounded-xl border border-border-subtle bg-surface-container px-3 py-2 text-sm"
            />
            <select
              value={wordForm.difficulty}
              onChange={(event) => setWordForm({ ...wordForm, difficulty: event.target.value as 'easy' | 'normal' })}
              className="w-full rounded-xl border border-border-subtle bg-surface-container px-3 py-2 text-sm"
            >
              <option value="easy">简单</option>
              <option value="normal">普通</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-text-muted">
              <input
                type="checkbox"
                checked={wordForm.enabled}
                onChange={(event) => setWordForm({ ...wordForm, enabled: event.target.checked })}
              />
              启用
            </label>
            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Icon name="add" className="text-base" />
              {editingWordId ? '保存修改' : '新增题目'}
            </button>
          </form>
        ) : (
          <form onSubmit={saveCard} className="mt-4 space-y-3">
            <select
              value={cardForm.type}
              onChange={(event) => setCardForm({ ...cardForm, type: event.target.value as 'truth' | 'dare' })}
              className="w-full rounded-xl border border-border-subtle bg-surface-container px-3 py-2 text-sm"
            >
              <option value="truth">真心话</option>
              <option value="dare">大冒险</option>
            </select>
            <textarea
              value={cardForm.content}
              onChange={(event) => setCardForm({ ...cardForm, content: event.target.value })}
              placeholder="卡片内容"
              className="min-h-24 w-full rounded-xl border border-border-subtle bg-surface-container px-3 py-2 text-sm"
            />
            <input
              value={cardForm.category}
              onChange={(event) => setCardForm({ ...cardForm, category: event.target.value })}
              placeholder="分类"
              className="w-full rounded-xl border border-border-subtle bg-surface-container px-3 py-2 text-sm"
            />
            <select
              value={cardForm.intensity}
              onChange={(event) => setCardForm({ ...cardForm, intensity: event.target.value as 'soft' | 'normal' | 'spicy' })}
              className="w-full rounded-xl border border-border-subtle bg-surface-container px-3 py-2 text-sm"
            >
              <option value="soft">轻松</option>
              <option value="normal">普通</option>
              <option value="spicy">稍刺激</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-text-muted">
              <input
                type="checkbox"
                checked={cardForm.enabled}
                onChange={(event) => setCardForm({ ...cardForm, enabled: event.target.checked })}
              />
              启用
            </label>
            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Icon name="add" className="text-base" />
              {editingCardId ? '保存修改' : '新增题目'}
            </button>
          </form>
        )}

        {/* 批量导入 */}
        <div className="mt-5 border-t border-border-subtle pt-4">
          <button
            type="button"
            onClick={() => setBulkOpen(!bulkOpen)}
            className="flex w-full items-center justify-between text-sm font-semibold text-text-muted hover:text-on-surface"
          >
            <span>📋 批量导入</span>
            <span>{bulkOpen ? '▾' : '▸'}</span>
          </button>
          {bulkOpen && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-text-muted">
                粘贴 JSON 数组，每项格式与新增表单一致。
                {tab === 'undercover'
                  ? ' 例: [{"civilianWord":"苹果","undercoverWord":"梨","category":"食物","difficulty":"easy","enabled":true}]'
                  : ' 例: [{"type":"truth","content":"你最想实现的愿望？","category":"轻松","intensity":"soft","enabled":true}]'}
              </p>
              <textarea
                value={bulkJson}
                onChange={(event) => setBulkJson(event.target.value)}
                placeholder='[{"civilianWord":"...", ...}]'
                className="min-h-32 w-full rounded-xl border border-border-subtle bg-surface-container px-3 py-2 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => { void runBulkImport() }}
                disabled={bulkImporting || !bulkJson.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {bulkImporting ? '⏳ 导入中...' : '📥 批量导入'}
              </button>
              {bulkResult && (
                <p className={`whitespace-pre-wrap rounded-xl p-2 text-xs ${bulkResult.includes('失败') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {bulkResult}
                </p>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}

export default PartyContentAdmin
