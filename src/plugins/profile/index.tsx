import { PluginRuntimeConfig, ProfileConfig } from '@core/types'

interface Props {
  config?: PluginRuntimeConfig
}

const ProfilePlugin = ({ config }: Props) => {
  const profile = config as unknown as ProfileConfig | undefined

  const openContact = () => {
    window.dispatchEvent(new globalThis.Event('homepage:open-contact'))
  }

  if (!profile) {
    return (
      <div className="glass rounded-lg p-lg">
        <p className="text-text-muted font-body-md">未配置个人信息</p>
      </div>
    )
  }

  const featuredSkills = profile.skills.slice(0, 4)
  const signals = [
    profile.location,
    `${profile.skills.length} 项核心技能`,
    'Cloudflare Pages 静态部署',
  ].filter(Boolean)

  return (
    <section
      id="top"
      className="grid min-h-[calc(100vh-8rem)] items-center gap-lg scroll-mt-24 pt-6 md:grid-cols-12 md:gap-xl md:pt-10"
    >
      <div className="md:col-span-7">
        <div className="mb-md flex flex-wrap items-center gap-sm">
          <span className="rounded-lg border border-primary/35 bg-primary/10 px-sm py-1 font-label-mono text-xs uppercase text-primary">
            Personal system
          </span>
          {profile.location && (
            <span className="font-label-mono text-xs text-text-muted">
              {profile.location}
            </span>
          )}
        </div>

        <h1 className="mb-md max-w-4xl font-display-lg text-[48px] leading-[1.05] text-on-surface md:text-[88px]">
          {profile.name}
        </h1>

        <div className="mt-lg flex flex-col gap-sm sm:flex-row">
          {profile.email && (
            <button
              type="button"
              onClick={openContact}
              className="shimmer-btn inline-flex items-center justify-center gap-xs rounded-lg bg-gradient-primary px-lg py-3 font-body-md text-body-md font-semibold text-on-primary transition-premium hover:shadow-[0_16px_48px_-28px_rgba(138,221,236,0.8)] btn-interact"
            >
              <span className="material-symbols-outlined text-lg" aria-hidden="true">mail</span>
              联系我
            </button>
          )}
          <a
            href="#projects"
            className="inline-flex items-center justify-center gap-xs rounded-lg border border-white/14 bg-white/5 px-lg py-3 font-body-md text-body-md font-semibold text-on-surface transition-premium hover:border-primary/45 hover:bg-white/8 btn-interact"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_downward</span>
            查看项目
          </a>
        </div>

        <div className="mt-lg grid gap-sm sm:grid-cols-3">
          {signals.map((signal) => (
            <div key={signal} className="border-l border-white/12 pl-sm">
              <span className="font-label-mono text-xs text-text-muted">{signal}</span>
            </div>
          ))}
        </div>
      </div>

      <aside className="md:col-span-5" aria-label="个人能力摘要">
        <div className="grid gap-md rounded-lg border border-white/10 bg-surface-card/78 p-sm shadow-[0_24px_80px_-60px_rgba(0,0,0,0.85)] md:p-md">
          {profile.avatar && (
            <div className="relative overflow-hidden rounded-lg border border-white/10 bg-surface-container">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="aspect-[4/3] w-full object-cover object-center"
              />
              <div className="absolute bottom-sm left-sm rounded-lg border border-white/12 bg-background/76 px-sm py-xs backdrop-blur-md">
                <span className="font-label-mono text-xs text-on-surface">Available for focused builds</span>
              </div>
            </div>
          )}

          <div className="grid gap-sm md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-background/42 p-md">
              <span className="font-label-mono text-xs uppercase text-text-muted">Focus</span>
              <p className="mt-xs font-body-md text-body-md text-on-surface">
                现代 Web 体验、类型安全和静态部署工程化。
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-background/42 p-md">
              <span className="font-label-mono text-xs uppercase text-text-muted">Stack</span>
              <div className="mt-sm flex flex-wrap gap-xs">
                {featuredSkills.map((skill) => (
                  <span key={skill} className="rounded border border-primary/20 bg-primary/8 px-2 py-1 font-label-mono text-xs text-primary">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <a
        href="#projects"
        className="hidden items-center gap-sm border-t border-white/10 pt-sm font-label-mono text-xs uppercase text-text-muted transition-premium hover:text-primary md:col-span-12 md:flex"
      >
        <span>Next</span>
        <span className="h-px flex-1 bg-white/10" />
        <span>Featured project</span>
        <span className="material-symbols-outlined text-base" aria-hidden="true">south</span>
      </a>
    </section>
  )
}

export default ProfilePlugin
