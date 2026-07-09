import { PartyGameMode, UndercoverPhase } from '../types'

interface Props {
  phase: UndercoverPhase
  mode?: PartyGameMode
}

const UNDERCOVER_STEPS = [
  { key: 'word' as const, label: '查看词语', icon: '🔍' },
  { key: 'speaking' as const, label: '轮流发言', icon: '🎤' },
  { key: 'voting' as const, label: '投票指认', icon: '🗳️' },
  { key: 'result' as const, label: '结果揭晓', icon: '🎯' },
  { key: 'punishment' as const, label: '惩罚环节', icon: '🎲' },
]

const TRUTH_OR_DARE_STEPS = [
  { key: 'punishment' as const, label: '抽卡挑战', icon: '🎲' },
]

const PHASE_ORDER: UndercoverPhase[] = ['waiting', 'word', 'speaking', 'voting', 'result', 'punishment']

const PhaseStepper = ({ phase, mode = 'undercover' }: Props) => {
  const steps = mode === 'truth-or-dare' ? TRUTH_OR_DARE_STEPS : UNDERCOVER_STEPS
  const visibleSteps = steps.filter((s) => PHASE_ORDER.indexOf(s.key) >= 0)
  const currentIdx = PHASE_ORDER.indexOf(phase)

  // 真相大冒险模式只有一个阶段，不需要进度条
  if (mode === 'truth-or-dare') {
    return (
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1.5 rounded-full bg-pink-50 px-3 py-1.5 shadow-[0_1px_4px_rgba(236,72,153,0.1)]">
          <span className="text-sm">🎲</span>
          <span className="text-xs font-bold text-pink-500">真心话大冒险</span>
          <span className="h-1 w-1 rounded-full bg-pink-300" />
          <span className="text-[11px] font-semibold text-pink-400">进行中</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-1 px-2">
      {visibleSteps.map((step, i) => {
        const stepIdx = PHASE_ORDER.indexOf(step.key)
        const isActive = stepIdx === currentIdx
        const isPast = stepIdx < currentIdx

        return (
          <div key={step.key} className="flex items-center gap-1">
            {i > 0 && (
              <div className={`h-0.5 w-3 rounded-full transition-colors duration-500 ${
                isPast || isActive ? 'bg-amber-400' : 'bg-gray-200'
              }`} />
            )}
            <div
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold transition-all duration-500 ${
                isActive
                  ? 'bg-amber-100 text-amber-700 shadow-[0_1px_4px_rgba(251,146,60,0.15)]'
                  : isPast
                    ? 'bg-amber-50 text-amber-500'
                    : 'bg-gray-50 text-gray-350 opacity-50'
              }`}
              title={step.label}
            >
              <span className="text-xs leading-none">{step.icon}</span>
              {isActive && <span className="hidden sm:inline">{step.label}</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default PhaseStepper
