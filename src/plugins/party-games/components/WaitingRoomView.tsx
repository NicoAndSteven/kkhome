import { useState } from 'react'
import { Icon } from '@components'
import { LocalPartyRoom } from '../types'
import PlayerSeats from './PlayerSeats'

interface Props {
  room: LocalPartyRoom
  connectionLabel: string
  canStart: boolean
  onStart: () => void
  onCopyInvite: () => void
  onLeave: () => void
  showModeBadge?: boolean
}

const STATUS_COLOR: Record<string, string> = {
  '已连接': 'bg-emerald-100 text-emerald-700',
  '连接中...': 'bg-amber-100 text-amber-700',
  '连接中断': 'bg-red-100 text-red-700',
  '未连接': 'bg-gray-100 text-gray-500',
  '📱 本地模式': 'bg-blue-100 text-blue-700',
}

const STATUS_DOT: Record<string, string> = {
  '已连接': 'bg-emerald-400',
  '连接中...': 'bg-amber-400 animate-pulse',
  '连接中断': 'bg-red-400',
  '未连接': 'bg-gray-400',
  '📱 本地模式': 'bg-blue-400',
}

const WaitingRoomView = ({ room, connectionLabel, canStart, onStart, onCopyInvite, onLeave, showModeBadge = false }: Props) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    onCopyInvite()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* 外壳 */}
      <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-violet-200/60 via-purple-100/40 to-indigo-200/60 p-[1.5px] shadow-[0_8px_48px_-16px_rgba(120,80,200,0.15)]">
        <div className="rounded-[30px] bg-white px-4 py-5">
          {/* 头部：房间码 */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-purple-400">房间码</span>
                {showModeBadge && (
                  <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">📱 本地</span>
                )}
              </div>
              <h2 className="mt-1 font-mono text-4xl font-bold tracking-[0.12em] text-gray-900">{room.code}</h2>
            </div>
            <button
              type="button"
              onClick={onLeave}
              aria-label="离开房间"
              className="party-tap-highlight rounded-xl bg-red-50 p-2.5 text-red-400 transition-colors hover:bg-red-100 active:bg-red-200"
            >
              <Icon name="close" className="text-lg" />
            </button>
          </div>

          {/* 游戏信息卡片 */}
          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 p-4">
            <div className="flex-1">
              <span className="text-xs font-medium text-purple-400">👥 玩家</span>
              <strong className="mt-1 block text-2xl font-bold text-gray-900">
                {room.players.length}<span className="text-base font-normal text-gray-400"> / {room.settings.maxPlayers}</span>
              </strong>
            </div>
            <div className="h-10 w-px bg-purple-200" />
            <div className="flex-1">
              <span className="text-xs font-medium text-purple-400">🎮 模式</span>
              <strong className="mt-1 block text-base font-bold text-gray-900">
                {room.settings.mode === 'undercover' ? '🕵️ 谁是卧底' : '🎲 真心话大冒险'}
              </strong>
            </div>
          </div>

          {/* 连接状态 + 邀请 */}
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className={`inline-flex size-2 rounded-full ${STATUS_DOT[connectionLabel] ?? 'bg-gray-400'}`} />
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[connectionLabel] ?? 'bg-gray-100 text-gray-500'}`}>
                {connectionLabel}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="party-tap-highlight rounded-xl bg-white px-4 py-2 text-xs font-semibold text-purple-600 shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] active:scale-95"
            >
              {copied ? '✅ 已复制' : '📋 复制邀请'}
            </button>
          </div>

          {/* 玩家座位图 */}
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm">🪑</span>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">玩家座位</span>
            </div>
            <PlayerSeats players={room.players} compact />
          </div>

          {/* 开始按钮 */}
          <button
            type="button"
            onClick={onStart}
            disabled={!canStart}
            className="party-tap-highlight party-btn-press mt-6 w-full rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-3.5 text-base font-semibold text-white shadow-[0_4px_16px_-4px_rgba(139,92,246,0.35)] transition-all duration-200 hover:shadow-[0_6px_20px_-4px_rgba(139,92,246,0.5)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {canStart ? '🚀 开始游戏' : '⏳ 等待房主开始...'}
          </button>

          {!canStart && (
            <p className="mt-3 text-center text-xs text-gray-400">只有房主可以开始游戏</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default WaitingRoomView
