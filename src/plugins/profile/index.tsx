import { useState, useEffect } from 'react'
import { PluginRuntimeConfig, ProfileConfig } from '@core/types'
import { Icon } from '@components'

interface Quote {
  text: string
  author: string
  source: string
}

/** 根据年积日选取当日引言 */
function getQuoteOfTheDay(quotes: Quote[]): Quote | null {
  if (quotes.length === 0) return null
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000)
  return quotes[dayOfYear % quotes.length]
}

interface Props {
  config?: PluginRuntimeConfig
}

const ProfilePlugin = ({ config }: Props) => {
  const profile = config as unknown as ProfileConfig | undefined
  const [quote, setQuote] = useState<Quote | null>(null)

  useEffect(() => {
    fetch('/config/quotes.json')
      .then((res) => res.json())
      .then((data: Quote[]) => setQuote(getQuoteOfTheDay(data)))
      .catch(() => { /* 静默失败 */ })
  }, [])

  const openContact = () => {
    window.dispatchEvent(new globalThis.Event('homepage:open-contact'))
  }

  if (!profile) {
    return (
      <div className="surface-panel rounded-lg p-lg">
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
      className="grid min-h-[calc(100dvh-5rem)] items-start gap-lg overflow-hidden scroll-mt-24 pt-6 md:grid-cols-12 md:items-center md:gap-xl md:pt-6"
    >
      <div className="md:col-span-7">
        <div className="mb-md flex flex-wrap items-center gap-sm reveal">
          <span className="rounded-[2px] border border-primary/45 bg-primary/10 px-sm py-1 font-label-mono text-xs uppercase text-primary">
            Personal Space
          </span>
          {profile.location && (
            <span className="font-label-mono text-xs text-text-muted">
              {profile.location}
            </span>
          )}
        </div>

        <h1 className="reveal max-w-4xl font-display-lg text-[56px] leading-[0.94] text-on-surface md:text-[112px]" style={{transitionDelay: '80ms'}}>
          {profile.name}
        </h1>
        <div className="reveal mt-md grid max-w-3xl gap-md border-y border-border-subtle py-md md:grid-cols-[180px_1fr]" style={{transitionDelay: '160ms'}}>
          <span className="font-label-mono text-xs uppercase text-secondary">{profile.title}</span>
          <p className="font-body-lg text-body-lg text-on-surface">
            {profile.bio}
          </p>
        </div>

        <div className="reveal mt-lg flex flex-col gap-sm sm:flex-row" style={{transitionDelay: '240ms'}}>
          {profile.email && (
            <button
              type="button"
              onClick={openContact}
              className="shimmer-btn inline-flex items-center justify-center gap-xs rounded-[2px] bg-gradient-primary px-lg py-3 font-body-md text-body-md font-semibold text-on-primary transition-premium hover:shadow-[0_16px_48px_-28px_rgba(138,221,236,0.8)] btn-interact"
            >
              <Icon name="mail" className="text-lg" />
              联系我
            </button>
          )}
          <a
            href="#/ai-tools"
            className="inline-flex items-center justify-center gap-xs rounded-lg border border-primary/30 bg-primary/10 px-lg py-3 font-body-md text-body-md font-semibold text-primary transition-premium hover:bg-primary/20 hover:shadow-[0_8px_24px_-12px_rgba(77,208,200,0.5)] btn-interact"
          >
            <Icon name="arrow_downward" className="text-lg" />
            开始使用 →
          </a>
        </div>

        <div className="reveal mt-lg hidden gap-xs md:grid md:grid-cols-3" style={{transitionDelay: '320ms'}}>
          {signals.map((signal, index) => (
            <div key={signal} className="border-l border-border-subtle pl-sm">
              <span className="block font-label-mono text-[10px] uppercase text-secondary">0{index + 1}</span>
              <span className="mt-xs block font-label-mono text-xs text-text-muted">{signal}</span>
            </div>
          ))}
        </div>

        {/* 每日一言 */}
        {quote && (
          <div className="reveal mt-lg border-l-2 border-primary/30 pl-md" style={{transitionDelay: '400ms'}}>
            <span className="font-label-mono text-[10px] uppercase text-primary">Quote of the Day</span>
            <p className="mt-xs font-body-lg text-lg text-on-surface leading-relaxed">
              {quote.text}
            </p>
            <p className="mt-xs font-label-mono text-xs text-text-muted">
              — {quote.author}{quote.source ? ` · ${quote.source}` : ''}
            </p>
          </div>
        )}
      </div>

      <aside className="reveal hidden md:col-span-5 md:block" style={{transitionDelay: '200ms'}} aria-label="个人能力摘要">
        <div className="surface-panel-strong grid gap-md rounded-[2px] p-sm md:p-md">
          <div className="flex items-center justify-between border-b border-border-subtle pb-sm">
            <span className="font-label-mono text-xs uppercase text-secondary">Identity plate</span>
            <span className="font-label-mono text-xs text-text-muted">KK / HUB</span>
          </div>
          {profile.avatar && (
            <div className="relative overflow-hidden rounded-[2px] border border-border-subtle bg-surface-container">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="aspect-[4/3] w-full object-cover object-center"
              />
              <div className="absolute bottom-sm left-sm rounded-[2px] border border-border-subtle bg-background/86 px-sm py-xs backdrop-blur-md flex items-center gap-2">
                <span className="pulse-dot inline-block" />
                <span className="font-label-mono text-xs text-on-surface">Available for focused builds</span>
              </div>
            </div>
          )}

          <div className="grid gap-sm md:grid-cols-2">
            <div className="surface-item rounded-[2px] p-md">
              <span className="font-label-mono text-xs uppercase text-text-muted">Focus</span>
              <p className="mt-xs font-body-md text-body-md text-on-surface">
                现代 Web 体验、类型安全和静态部署工程化。
              </p>
            </div>
            <div className="surface-item rounded-[2px] p-md">
              <span className="font-label-mono text-xs uppercase text-text-muted">Stack</span>
              <div className="mt-sm flex flex-wrap gap-xs">
                {featuredSkills.map((skill) => (
                  <span key={skill} className="rounded-[2px] border border-primary/30 bg-primary/8 px-2 py-1 font-label-mono text-xs text-primary">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <a
        href="#/ai-tools"
        className="home-next-link reveal hidden items-center gap-sm border-t border-border-subtle pt-sm font-label-mono text-xs uppercase text-text-muted transition-premium hover:text-primary md:col-span-12 md:flex"
        style={{transitionDelay: '400ms'}}
      >
        <span className="float-gentle inline-block">开始探索</span>
        <span className="h-px flex-1 bg-border-subtle" />
        <span>进入站点</span>
        <Icon name="south" className="text-base float-gentle" />
      </a>
    </section>
  )
}

export default ProfilePlugin
