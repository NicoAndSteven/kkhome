import { TruthOrDareCard, TruthOrDareType } from '../types'

interface Props {
  targetName: string
  card: TruthOrDareCard | null
  onDraw: (type: TruthOrDareType | 'random') => void
  onDone: () => void
}

const getTagStyle = (intensity: string) => {
  switch (intensity) {
    case 'spicy': return 'bg-red-100 text-red-600'
    case 'normal': return 'bg-amber-100 text-amber-700'
    default: return 'bg-emerald-100 text-emerald-600'
  }
}

const getIntensityLabel = (intensity: string) => {
  switch (intensity) {
    case 'spicy': return '🔥 刺激'
    case 'normal': return '😄 有趣'
    default: return '🌸 轻松'
  }
}

const TruthOrDarePanel = ({ targetName, card, onDraw, onDone }: Props) => (
  <div className="party-anim-card overflow-hidden rounded-[32px] bg-gradient-to-br from-rose-400 via-pink-400 to-purple-500 p-[1.5px] shadow-[0_8px_40px_-12px_rgba(244,114,182,0.35)]">
    <div className="rounded-[30px] bg-white/95 px-5 py-6">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🎲</span>
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-pink-400">真心话大冒险</span>
      </div>

      {/* 目标玩家 */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-pink-100">
          <span className="text-xl">😈</span>
        </div>
        <div>
          <p className="text-xs text-gray-400">轮到你了</p>
          <h2 className="text-2xl font-bold text-gray-900">{targetName}</h2>
        </div>
      </div>

      {/* 卡片区域 */}
      <div className={`mt-5 min-h-[180px] rounded-[24px] p-6 transition-all duration-300 ${
        card
          ? card.type === 'truth'
            ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50'
            : 'bg-gradient-to-br from-orange-50 via-rose-50 to-red-50'
          : 'flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100'
      }`}>
        {card ? (
          <div className="party-anim-pop flex flex-col items-center text-center">
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                card.type === 'truth'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-orange-100 text-orange-600'
              }`}>
                {card.type === 'truth' ? '💬 真心话' : '⚡ 大冒险'}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getTagStyle(card.intensity)}`}>
                {getIntensityLabel(card.intensity)}
              </span>
            </div>
            <p className="mt-5 text-2xl font-bold leading-relaxed text-gray-900">{card.content}</p>
          </div>
        ) : (
          <div className="text-center">
            <span className="text-5xl">🎯</span>
            <p className="mt-3 text-lg font-semibold text-gray-500">选择一种惩罚</p>
            <p className="mt-1 text-sm text-gray-400">真心话 — 回答问题 · 大冒险 — 完成挑战</p>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      {card ? (
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onDone}
            className="party-tap-highlight party-btn-press rounded-2xl bg-gradient-to-r from-emerald-400 to-green-500 px-5 py-3.5 text-base font-semibold text-white shadow-[0_4px_16px_-4px_rgba(52,211,153,0.4)] transition-all duration-200"
          >
            ✅ 完成
          </button>
          <button
            type="button"
            onClick={() => onDraw('random')}
            className="party-tap-highlight party-btn-press rounded-2xl border-2 border-gray-200 bg-white px-5 py-3.5 text-base font-semibold text-gray-600 transition-all duration-200 hover:bg-gray-50"
          >
            🔄 换一题
          </button>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => onDraw('truth')}
            className="party-tap-highlight party-btn-press rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 px-3 py-3.5 text-sm font-semibold text-white shadow-[0_4px_12px_-4px_rgba(99,102,241,0.3)] transition-all duration-200"
          >
            💬 真心话
          </button>
          <button
            type="button"
            onClick={() => onDraw('dare')}
            className="party-tap-highlight party-btn-press rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 px-3 py-3.5 text-sm font-semibold text-white shadow-[0_4px_12px_-4px_rgba(251,146,60,0.3)] transition-all duration-200"
          >
            ⚡ 大冒险
          </button>
          <button
            type="button"
            onClick={() => onDraw('random')}
            className="party-tap-highlight party-btn-press rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 px-3 py-3.5 text-sm font-semibold text-white shadow-[0_4px_12px_-4px_rgba(168,85,247,0.3)] transition-all duration-200"
          >
            🎰 随机
          </button>
        </div>
      )}
    </div>
  </div>
)

export default TruthOrDarePanel
