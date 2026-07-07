import { TruthOrDareCard, TruthOrDareType } from '../types'

interface Props {
  targetName: string
  card: TruthOrDareCard | null
  onDraw: (type: TruthOrDareType | 'random') => void
  onDone: () => void
}

const TruthOrDarePanel = ({ targetName, card, onDraw, onDone }: Props) => (
  <div className="rounded-[28px] border border-white/10 bg-[#151817] p-5 text-white">
    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f4d35e]">真心话大冒险</span>
    <h2 className="mt-2 text-3xl font-semibold">{targetName}</h2>

    <div className="mt-5 min-h-48 rounded-[26px] bg-[#f7f0d5] p-6 text-[#151817]">
      {card ? (
        <>
          <span className="text-xs font-semibold uppercase text-[#151817]/48">{card.type === 'truth' ? '真心话' : '大冒险'}</span>
          <p className="mt-4 text-2xl font-semibold leading-snug">{card.content}</p>
        </>
      ) : (
        <p className="flex h-36 items-center justify-center text-center text-xl font-semibold">选择一种惩罚</p>
      )}
    </div>

    {card ? (
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button type="button" onClick={onDone} className="rounded-full bg-[#f4d35e] px-5 py-3 text-sm font-bold text-[#151817]">
          完成
        </button>
        <button type="button" onClick={() => onDraw('random')} className="rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white">
          换一题
        </button>
      </div>
    ) : (
      <div className="mt-5 grid grid-cols-3 gap-2">
        <button type="button" onClick={() => onDraw('truth')} className="rounded-full bg-white px-3 py-3 text-sm font-bold text-[#151817]">
          真心话
        </button>
        <button type="button" onClick={() => onDraw('dare')} className="rounded-full bg-white px-3 py-3 text-sm font-bold text-[#151817]">
          大冒险
        </button>
        <button type="button" onClick={() => onDraw('random')} className="rounded-full bg-[#f4d35e] px-3 py-3 text-sm font-bold text-[#151817]">
          随机
        </button>
      </div>
    )}
  </div>
)

export default TruthOrDarePanel
