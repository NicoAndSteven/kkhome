import { useState } from 'react'
import { PluginRuntimeConfig } from '@core/types'
import CreateRoomSheet from './components/CreateRoomSheet'
import JoinRoomSheet from './components/JoinRoomSheet'
import { PartyGameMode, PartyRoomSettings } from './types'

interface Props {
  config?: PluginRuntimeConfig
}

const readDefaultMode = (config?: PluginRuntimeConfig): PartyGameMode => (
  config?.defaultMode === 'truth-or-dare' ? 'truth-or-dare' : 'undercover'
)

const readDefaultMaxPlayers = (config?: PluginRuntimeConfig) => (
  typeof config?.maxPlayers === 'number' ? config.maxPlayers : 6
)

const PartyGamesPlugin = ({ config }: Props) => {
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [message, setMessage] = useState('')
  const defaultMode = readDefaultMode(config)
  const defaultMaxPlayers = readDefaultMaxPlayers(config)

  const createLocalRoom = (nickname: string, settings: PartyRoomSettings) => {
    setCreateOpen(false)
    setMessage(`已为 ${nickname} 准备 ${settings.maxPlayers} 人房间`)
  }

  const joinLocalRoom = (nickname: string, code: string) => {
    setJoinOpen(false)
    setMessage(`${nickname} 准备加入 ${code}`)
  }

  return (
    <section id="party-games" className="space-y-5 scroll-mt-24">
      <div className="rounded-[28px] border border-border-subtle bg-[#151817] p-5 text-white">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold text-white/64">
            {defaultMode === 'undercover' ? '谁是卧底' : '真心话大冒险'}
          </span>
          <span className="text-xs font-semibold text-white/48">最多 {defaultMaxPlayers} 人</span>
        </div>
        <h2 className="mt-4 font-headline-md text-3xl font-semibold tracking-tight">聚会游戏</h2>
        <p className="mt-2 font-body-md text-sm text-white/70">谁是卧底和真心话大冒险。</p>
        <div className="mt-5 grid gap-3">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#151817]"
          >
            创建房间
          </button>
          <button
            type="button"
            onClick={() => setJoinOpen(true)}
            className="rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-white"
          >
            加入房间
          </button>
        </div>
        {message && <p className="mt-4 text-sm text-white/62">{message}</p>}
      </div>

      <CreateRoomSheet
        open={createOpen}
        defaultMode={defaultMode}
        defaultMaxPlayers={defaultMaxPlayers}
        onClose={() => setCreateOpen(false)}
        onCreate={createLocalRoom}
      />
      <JoinRoomSheet
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        onJoin={joinLocalRoom}
      />
    </section>
  )
}

export default PartyGamesPlugin
