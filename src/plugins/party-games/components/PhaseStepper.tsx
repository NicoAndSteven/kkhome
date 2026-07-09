import { UndercoverPhase } from '../types'

interface Props {
  phase: UndercoverPhase
}

const STEPS: { key: UndercoverPhase; label: string; icon: string }[] = [
  { key: 'word', label: '查看词语', icon: '🔍' },
  { key: 'speaking', label: '轮流发言', icon: '🎤' },
  { key: 'voting', label: '投票指认', icon: '🗳️' },
  { key: 'result', label: '结果揭晓', icon: '🎯' },
  { key: 'punishment', label: '真心话大冒险', icon: '🎲' },
]

const PHASE_ORDER: UndercoverPhase[] = ['waiting', 'word', 'speaking', 'voting', 'result', 'punishment']

const PhaseStepper = ({ phase }: Props) => {
  const currentIdx = PHASE_ORDER.indexOf(phase)
  const visibleSteps = STEPS.filter((s) => PHASE_ORDER.indexOf(s.key) >= 0)

  return (
    <div className="flex items-center justify-center gap-1 px-2">
      {visibleSteps.map((step, i) => {
        const stepIdx = PHASE_ORDER.indexOf(step.key)
        const isActive = stepIdx === currentIdx
        const isPast = stepIdx < currentIdx
        const isFuture = stepIdx > currentIdx

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
                    : 'bg-gray-50 text-gray-350'
              } ${isFuture ? 'opacity-50' : ''}`}
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
