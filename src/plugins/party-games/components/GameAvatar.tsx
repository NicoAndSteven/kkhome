import { useMemo } from 'react'

// ── 卡通角色系统 ──────────────────────────────────
// 每个玩家随机分配一个角色，包含头像emoji和主题色

const CHARACTERS = [
  { emoji: '🐱', name: '猫咪', bg: 'from-amber-100 to-yellow-100', ring: 'ring-amber-300', badge: 'bg-amber-200' },
  { emoji: '🐶', name: '小狗', bg: 'from-orange-100 to-amber-100', ring: 'ring-orange-300', badge: 'bg-orange-200' },
  { emoji: '🐼', name: '熊猫', bg: 'from-gray-100 to-slate-100', ring: 'ring-slate-300', badge: 'bg-slate-200' },
  { emoji: '🦊', name: '狐狸', bg: 'from-orange-100 to-red-100', ring: 'ring-orange-300', badge: 'bg-orange-200' },
  { emoji: '🐰', name: '兔子', bg: 'from-pink-100 to-rose-100', ring: 'ring-pink-300', badge: 'bg-pink-200' },
  { emoji: '🐻', name: '小熊', bg: 'from-amber-100 to-brown-100', ring: 'ring-amber-300', badge: 'bg-amber-200' },
  { emoji: '🐸', name: '青蛙', bg: 'from-green-100 to-emerald-100', ring: 'ring-green-300', badge: 'bg-green-200' },
  { emoji: '🐧', name: '企鹅', bg: 'from-sky-100 to-blue-100', ring: 'ring-sky-300', badge: 'bg-sky-200' },
  { emoji: '🐨', name: '考拉', bg: 'from-gray-100 to-stone-100', ring: 'ring-gray-300', badge: 'bg-gray-200' },
  { emoji: '🦁', name: '狮子', bg: 'from-yellow-100 to-amber-100', ring: 'ring-yellow-300', badge: 'bg-yellow-200' },
  { emoji: '🐯', name: '老虎', bg: 'from-orange-100 to-yellow-100', ring: 'ring-orange-300', badge: 'bg-orange-200' },
  { emoji: '🐮', name: '奶牛', bg: 'from-slate-100 to-gray-100', ring: 'ring-slate-300', badge: 'bg-slate-200' },
  { emoji: '🐷', name: '小猪', bg: 'from-pink-100 to-rose-100', ring: 'ring-pink-300', badge: 'bg-pink-200' },
  { emoji: '🐵', name: '猴子', bg: 'from-amber-100 to-yellow-100', ring: 'ring-amber-300', badge: 'bg-amber-200' },
  { emoji: '🦄', name: '独角兽', bg: 'from-purple-100 to-pink-100', ring: 'ring-purple-300', badge: 'bg-purple-200' },
  { emoji: '🐲', name: '小龙', bg: 'from-red-100 to-orange-100', ring: 'ring-red-300', badge: 'bg-red-200' },
]

// 用 playerId 的 hash 来稳定分配角色
const hashString = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const getCharacter = (playerId: string) => {
  return CHARACTERS[hashString(playerId) % CHARACTERS.length]
}

interface Props {
  playerId: string
  size?: 'sm' | 'md' | 'lg'
  isSpeaking?: boolean
  isCurrent?: boolean
  isEliminated?: boolean
}

const SIZE_CLASSES = {
  sm: 'size-12 text-xl',
  md: 'size-16 text-2xl',
  lg: 'size-20 text-3xl',
}

const GameAvatar = ({ playerId, size = 'md', isSpeaking, isCurrent, isEliminated }: Props) => {
  const char = useMemo(() => getCharacter(playerId), [playerId])

  return (
    <div
      className={`relative flex items-center justify-center rounded-full bg-gradient-to-br ${char.bg} shadow-lg transition-all duration-500 ${
        SIZE_CLASSES[size]
      } ${
        isSpeaking
          ? `scale-110 ring-[3px] ${char.ring} ring-offset-2 animate-[party-pulse-glow_2s_ease-in-out_infinite]`
          : ''
      } ${
        isCurrent && !isSpeaking ? `ring-[2px] ${char.ring} ring-offset-1` : ''
      } ${
        isEliminated ? 'opacity-30 grayscale' : ''
      }`}
    >
      <span
        className={`select-none transition-transform duration-300 ${
          isSpeaking ? 'animate-bounce' : 'hover:scale-110'
        }`}
      >
        {char.emoji}
      </span>

      {/* 发言中标记 */}
      {isSpeaking && (
        <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-white text-[10px] shadow-md">
          🎤
        </span>
      )}

      {/* 已淘汰 */}
      {isEliminated && (
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20 text-lg">
          😵
        </span>
      )}
    </div>
  )
}

export default GameAvatar
