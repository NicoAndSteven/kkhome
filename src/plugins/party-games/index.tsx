import { useState } from 'react'
import { PluginRuntimeConfig } from '@core/types'
import CreateRoomSheet from './components/CreateRoomSheet'
import JoinRoomSheet from './components/JoinRoomSheet'
import WaitingRoomView from './components/WaitingRoomView'
import { getDefaultWordPair } from './content'
import { LocalPartyRoom, PartyGameMode, PartyRoomSettings } from './types'

interface Props {
  config?: PluginRuntimeConfig
}

const readDefaultMode = (config?: PluginRuntimeConfig): PartyGameMode => (
  config?.defaultMode === 'truth-or-dare' ? 'truth-or-dare' : 'undercover'
)

const readDefaultMaxPlayers = (config?: PluginRuntimeConfig) => (
  typeof config?.maxPlayers === 'number' ? config.maxPlayers : 6
)

const createRoomCode = () => Math.random().toString(36).slice(2, 6).toUpperCase()

const PartyGamesPlugin = ({ config }: Props) => {
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [room, setRoom] = useState<LocalPartyRoom | null>(null)
  const defaultMode = readDefaultMode(config)
  const defaultMaxPlayers = readDefaultMaxPlayers(config)

  const createLocalRoom = (nickname: string, settings: PartyRoomSettings) => {
    setRoom({
      code: createRoomCode(),
      settings,
      players: [{ id: 'host', nickname, host: true, status: 'online' }],
      phase: 'waiting',
      currentSpeakerIndex: 0,
      selectedWordPair: getDefaultWordPair(),
      selectedCard: null,
    })
    setCreateOpen(false)
  }

  const joinLocalRoom = (nickname: string, code: string) => {
    setRoom({
      code,
      settings: {
        mode: 'undercover',
        maxPlayers: 6,
        allowLateJoin: true,
        wordCategory: '生活',
        punishmentMode: 'random',
      },
      players: [
        { id: 'host', nickname: '房主', host: true, status: 'online' },
        { id: 'guest', nickname, host: false, status: 'online' },
      ],
      phase: 'waiting',
      currentSpeakerIndex: 0,
      selectedWordPair: getDefaultWordPair(),
      selectedCard: null,
    })
    setJoinOpen(false)
  }

  if (room?.phase === 'waiting') {
    return (
      <section id="party-games" className="space-y-5 scroll-mt-24">
        <WaitingRoomView
          room={room}
          onStart={() => setRoom({ ...room, phase: 'word' })}
          onLeave={() => setRoom(null)}
        />
      </section>
    )
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
