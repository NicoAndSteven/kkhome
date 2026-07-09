import { useState } from 'react'

export interface DescriptionEntry {
  playerId: string
  playerName: string
  content: string
  timestamp: number
}

interface Props {
  entries: DescriptionEntry[]
  canInput?: boolean
  currentSpeakerName?: string
  onSubmit?: (content: string) => void
  maxLength?: number
  placeholder?: string
}

const DescriptionBoard = ({
  entries,
  canInput = false,
  currentSpeakerName = '',
  onSubmit,
  maxLength = 50,
  placeholder = '输入你的描述...',
}: Props) => {
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed || !onSubmit) return
    onSubmit(trimmed)
    setInput('')
    setSubmitted(true)
  }

  const AVATAR_COLORS = [
    'from-amber-400 to-orange-500',
    'from-blue-400 to-cyan-500',
    'from-violet-400 to-purple-500',
    'from-emerald-400 to-teal-500',
    'from-rose-400 to-pink-500',
    'from-sky-400 to-indigo-500',
    'from-lime-400 to-green-500',
    'from-fuchsia-400 to-purple-500',
  ]

  const getPlayerColorIdx = (playerId: string) => {
    let hash = 0
    for (let i = 0; i < playerId.length; i++) {
      hash = playerId.charCodeAt(i) + ((hash << 5) - hash)
    }
    return Math.abs(hash) % AVATAR_COLORS.length
  }

  if (entries.length === 0 && !canInput) return null

  return (
    <div className="space-y-3">
      {/* 标题 */}
      <div className="flex items-center gap-2">
        <span className="text-sm">📝</span>
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">发言记录</span>
        {entries.length > 0 && (
          <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
            {entries.length}
          </span>
        )}
      </div>

      {/* 消息列表 */}
      {entries.length > 0 && (
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {entries.map((entry, i) => (
            <div
              key={`${entry.playerId}-${entry.timestamp}`}
              className="animate-[party-card-in_0.4s_cubic-bezier(0.16,1,0.3,1)_both]"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-2.5">
                {/* 迷你头像 */}
                <div
                  className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${
                    AVATAR_COLORS[getPlayerColorIdx(entry.playerId)]
                  } text-[10px] font-bold text-white`}
                >
                  {entry.playerName.charAt(0)}
                </div>

                {/* 气泡 */}
                <div className="flex-1 rounded-2xl rounded-tl-md bg-gray-50 px-3 py-2">
                  <p className="text-[11px] font-semibold text-gray-500">{entry.playerName}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-gray-800">{entry.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 空状态 */}
      {entries.length === 0 && !canInput && (
        <div className="rounded-2xl bg-gray-50 py-6 text-center">
          <span className="text-2xl">💬</span>
          <p className="mt-2 text-xs text-gray-400">还没有人发言</p>
        </div>
      )}

      {/* 输入区 */}
      {canInput && (
        <div className="animate-[party-card-in_0.4s_cubic-bezier(0.16,1,0.3,1)_both]">
          {submitted ? (
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-center">
              <span className="text-sm font-semibold text-emerald-600">✅ 描述已提交</span>
              <p className="mt-0.5 text-xs text-emerald-500">等待下一位玩家发言</p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-2xl border-2 border-amber-200 bg-amber-50/50 px-3 py-2.5 transition-all duration-200 focus-within:border-amber-400 focus-within:bg-white">
                <span className="text-sm">✏️</span>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, maxLength))}
                  maxLength={maxLength}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
                />
                <span className="text-[10px] text-gray-400">{input.length}/{maxLength}</span>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="party-tap-highlight shrink-0 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(251,146,60,0.25)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(251,146,60,0.35)] disabled:opacity-40"
              >
                发送
              </button>
            </div>
          )}
        </div>
      )}

      {/* 当前发言人提示 */}
      {canInput && !submitted && currentSpeakerName && (
        <p className="text-center text-[11px] text-gray-400">
          🎤 当前发言：<span className="font-semibold text-amber-600">{currentSpeakerName}</span>
        </p>
      )}
    </div>
  )
}

export default DescriptionBoard
