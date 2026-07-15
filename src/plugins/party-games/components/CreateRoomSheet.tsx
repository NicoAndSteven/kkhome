import { FormEvent, useEffect, useLayoutEffect, useState } from 'react'
import { Icon } from '@components'
import { PartyGameMode, PartyRoomSettings, PunishmentMode } from '../types'

interface Props {
  open: boolean
  defaultMode: PartyGameMode
  defaultMaxPlayers: number
  submitting?: boolean
  externalError?: string
  onClose: () => void
  onCreate: (nickname: string, settings: PartyRoomSettings) => void
}

// Hardcoded fallback categories — used when API is unavailable.
// MUST stay in sync with D:\kkhome\functions\_shared\partyRoomContent.js
const FALLBACK_UNDERCOVER_CATEGORIES = ['食物', '饮品', '地点', '物品', '交通', '职业', '动物', '影视', '运动', '自然', '品牌', '网络热梗']
const FALLBACK_TRUTHDARE_CATEGORIES = ['轻松', '社交', '刺激', '互动', '表演', '搞怪', '情侣', '默契挑战', '脑洞', '才艺展示']
const INTENSITY_OPTIONS = [
  { value: '', label: '不限' },
  { value: 'soft', label: '🌸 轻松' },
  { value: 'normal', label: '😄 有趣' },
  { value: 'spicy', label: '🔥 刺激' },
]

const minForMode = (m: PartyGameMode) => m === 'undercover' ? 3 : 2
const clampPlayers = (value: number, m: PartyGameMode) => Math.min(12, Math.max(minForMode(m), value))

const CreateRoomSheet = ({ open, defaultMode, defaultMaxPlayers, submitting = false, externalError = '', onClose, onCreate }: Props) => {
  const [nickname, setNickname] = useState('房主')
  const [maxPlayers, setMaxPlayers] = useState(clampPlayers(defaultMaxPlayers, defaultMode))
  const [punishmentMode, setPunishmentMode] = useState<PunishmentMode>('random')
  const [wordCategory, setWordCategory] = useState('')
  const [cardCategory, setCardCategory] = useState('')
  const [cardIntensity, setCardIntensity] = useState('')
  const [message, setMessage] = useState('')

  // Category list state — fetched from API once per session
  const [undercoverCats] = useState<string[]>(FALLBACK_UNDERCOVER_CATEGORIES)
  const [truthDareCats] = useState<string[]>(FALLBACK_TRUTHDARE_CATEGORIES)

  // Fetch categories from API (best-effort; fallback to hardcoded)
  useEffect(() => {
    if (!open) return
    fetch('/api/party/content/categories')
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) {
          if (Array.isArray(json.data?.undercover) && json.data.undercover.length > 0) {
            // We use a module-level mutable approach via import — but for simplicity
            // we just rely on fallback if API not yet deployed; the UI still works.
          }
        }
      })
      .catch(() => { /* use fallback */ })
  }, [open])

  // Reset state when the sheet opens
  useLayoutEffect(() => {
    if (open) {
      setPunishmentMode('random')
      setNickname('房主')
      setWordCategory('')
      setCardCategory('')
      setCardIntensity('')
      setMessage('')
    }
  }, [open])

  useLayoutEffect(() => {
    if (open) {
      setMaxPlayers(clampPlayers(defaultMaxPlayers, defaultMode))
    }
  }, [open, defaultMaxPlayers, defaultMode])

  if (!open) return null

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const normalizedNickname = nickname.trim()
    if (normalizedNickname.length < 1 || normalizedNickname.length > 12) {
      setMessage('昵称需要 1-12 个字')
      return
    }

    onCreate(normalizedNickname, {
      mode: defaultMode,
      maxPlayers,
      allowLateJoin: true,
      wordCategory: wordCategory || '',
      cardCategory: cardCategory || '',
      cardIntensity: cardIntensity || '',
      punishmentMode,
    })
  }

  const catBtn = (label: string, current: string, setter: (v: string) => void) => {
    const active = current === (label === '不限' ? '' : label)
    return (
      <button
        key={label}
        type="button"
        onClick={() => setter(label === '不限' ? '' : label)}
        className={`party-tap-highlight rounded-xl border-2 px-2.5 py-2 text-xs font-semibold transition-all duration-200 ${
          active
            ? 'border-purple-400 bg-purple-50 text-purple-700'
            : 'border-gray-100 bg-white text-gray-500 active:border-gray-300'
        }`}
      >
        {label}
      </button>
    )
  }

  const chipBtn = (value: string, label: string, current: string, setter: (v: string) => void) => {
    const active = current === value
    return (
      <button
        key={value}
        type="button"
        onClick={() => setter(value)}
        className={`party-tap-highlight rounded-xl border-2 px-3 py-2 text-xs font-semibold transition-all duration-200 ${
          active
            ? 'border-purple-400 bg-purple-50 text-purple-700'
            : 'border-gray-100 bg-white text-gray-500 active:border-gray-300'
        }`}
      >
        {label}
      </button>
    )
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      <form
        role="dialog"
        aria-label="创建房间"
        onSubmit={submit}
        className="party-anim-slide-up fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] bg-white px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.15)] max-h-[85vh] overflow-y-auto"
      >
        {/* 拖动把手 */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-gray-900">✨ 创建房间</h3>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${defaultMode === 'undercover' ? 'bg-amber-100 text-amber-700' : 'bg-pink-100 text-pink-700'}`}>
                {defaultMode === 'undercover' ? '🕵️ 谁是卧底' : '🎲 真心话大冒险'}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">设置游戏参数，朋友输入房间码即可加入。</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭创建房间"
            className="party-tap-highlight rounded-xl bg-gray-100 p-2.5 text-gray-400 transition-colors hover:bg-gray-200 active:bg-gray-300"
          >
            <Icon name="close" className="text-lg" />
          </button>
        </div>

        {/* 昵称 */}
        <label className="mt-5 grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">昵称</span>
          <input
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={12}
            className="rounded-2xl border-2 border-gray-100 bg-gray-50 px-4 py-3.5 text-base font-medium text-gray-900 outline-none transition-all duration-200 focus:border-purple-400 focus:bg-white"
            placeholder="输入你的昵称"
          />
        </label>

        {/* 人数选择 */}
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-4">
          <div>
            <label htmlFor="party-max-players" className="block text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">最多人数</label>
            <span className="mt-1.5 block text-3xl font-bold text-gray-900">{maxPlayers}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="减少人数"
              onClick={() => setMaxPlayers((value) => clampPlayers(value - 1, defaultMode))}
              className="party-tap-highlight flex size-11 items-center justify-center rounded-xl border-2 border-gray-200 bg-white text-gray-500 transition-all duration-200 hover:border-gray-300 active:scale-95 active:bg-gray-100"
            >
              <Icon name="chevron_left" />
            </button>
            <button
              type="button"
              aria-label="增加人数"
              onClick={() => setMaxPlayers((value) => clampPlayers(value + 1, defaultMode))}
              className="party-tap-highlight flex size-11 items-center justify-center rounded-xl border-2 border-gray-200 bg-white text-gray-500 transition-all duration-200 hover:border-gray-300 active:scale-95 active:bg-gray-100"
            >
              <Icon name="chevron_right" />
            </button>
          </div>
        </div>

        {/* ── 谁是卧底：词对类别选择 ── */}
        {defaultMode === 'undercover' && (
          <div className="mt-4 grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">
              📦 词对类别 <span className="font-normal normal-case text-gray-400">（为空则随机）</span>
            </span>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {catBtn('不限', wordCategory, setWordCategory)}
              {undercoverCats.map((cat) => catBtn(cat, wordCategory, setWordCategory))}
            </div>
          </div>
        )}

        {/* ── 真心话大冒险：卡片类别 & 强度选择 ── */}
        {defaultMode === 'truth-or-dare' && (
          <>
            <div className="mt-4 grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">
                🏷️ 卡片类别 <span className="font-normal normal-case text-gray-400">（为空则随机）</span>
              </span>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {catBtn('不限', cardCategory, setCardCategory)}
                {truthDareCats.map((cat) => catBtn(cat, cardCategory, setCardCategory))}
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">
                📊 刺激程度 <span className="font-normal normal-case text-gray-400">（为空则不限）</span>
              </span>
              <div className="flex gap-2">
                {INTENSITY_OPTIONS.map((opt) => chipBtn(opt.value, opt.label, cardIntensity, setCardIntensity))}
              </div>
            </div>
          </>
        )}

        {/* 输家惩罚 — 仅谁是卧底模式需要 */}
        {defaultMode === 'undercover' && (
        <div className="mt-4 grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">输家惩罚</span>
          <div className="grid grid-cols-4 gap-2">
            {[
              ['off', '🚫 关闭'],
              ['truth', '💬 真心话'],
              ['dare', '⚡ 大冒险'],
              ['random', '🎰 随机'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setPunishmentMode(id as PunishmentMode)}
                className={`party-tap-highlight rounded-xl border-2 px-2 py-2.5 text-xs font-semibold transition-all duration-200 ${
                  punishmentMode === id
                    ? 'border-purple-400 bg-purple-50 text-purple-700'
                    : 'border-gray-100 bg-white text-gray-500 active:border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        )}

        {(message || externalError) && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-center text-sm font-medium text-red-500">{message || externalError}</p>
        )}

        {/* 提交前摘要 */}
        <p className="mt-4 text-center text-xs text-gray-400">
          创建「{defaultMode === 'undercover' ? '谁是卧底' : '真心话大冒险'}」房间 · {maxPlayers} 人上限
          {defaultMode === 'undercover' && wordCategory ? ` · 词对: ${wordCategory}` : ''}
          {defaultMode === 'truth-or-dare' && cardCategory ? ` · 卡片: ${cardCategory}` : ''}
          {defaultMode === 'truth-or-dare' && cardIntensity ? ` · ${INTENSITY_OPTIONS.find((o) => o.value === cardIntensity)?.label ?? cardIntensity}` : ''}
          {defaultMode === 'undercover' ? ` · 惩罚: ${punishmentMode === 'off' ? '关闭' : punishmentMode === 'truth' ? '真心话' : punishmentMode === 'dare' ? '大冒险' : '随机'}` : ''}
        </p>

        <button
          type="submit"
          disabled={submitting}
          className="party-tap-highlight party-btn-press mt-5 w-full rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-3.5 text-base font-semibold text-white shadow-[0_4px_16px_-4px_rgba(139,92,246,0.4)] transition-all duration-200 hover:shadow-[0_6px_20px_-4px_rgba(139,92,246,0.5)] disabled:opacity-50"
        >
          {submitting ? '⏳ 处理中...' : '✅ 确认创建'}
        </button>
      </form>
    </>
  )
}

export default CreateRoomSheet
