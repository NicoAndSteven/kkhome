import { PluginRuntimeConfig } from '@core/types'

interface Props {
  config?: PluginRuntimeConfig
}

const PartyGamesPlugin = (_props: Props) => (
  <section id="party-games" className="space-y-5 scroll-mt-24">
    <div className="rounded-[28px] border border-border-subtle bg-[#151817] p-5 text-white">
      <h2 className="font-headline-md text-3xl font-semibold tracking-tight">聚会游戏</h2>
      <p className="mt-2 font-body-md text-sm text-white/70">谁是卧底和真心话大冒险。</p>
      <div className="mt-5 grid gap-3">
        <button type="button" className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#151817]">
          创建房间
        </button>
        <button type="button" className="rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-white">
          加入房间
        </button>
      </div>
    </div>
  </section>
)

export default PartyGamesPlugin
