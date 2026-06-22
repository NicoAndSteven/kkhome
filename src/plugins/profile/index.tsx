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

  const featuredSkills = profile.skills.slice(0, 6)

  return (
    <section
      id="top"
      className="relative min-h-[calc(100dvh-5rem)] overflow-hidden scroll-mt-24 pt-6 md:pt-6 md:pb-12"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-6 md:grid-cols-12 md:gap-xl">

        {/* ── 左侧：杂志封面文字内容 ── */}
        <div className="relative z-10 md:col-span-7 md:pr-8">

          {/* 顶部标签行 — 杂志封面副标题线 */}
          <div className="mb-md flex flex-wrap items-center gap-sm reveal">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 font-label-mono text-[10px] uppercase tracking-[0.15em] text-primary">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Personal Space
            </span>
            {profile.location && (
              <span className="font-label-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
                {profile.location}
              </span>
            )}
          </div>

          {/* 名字 — 杂志封面大字，超粗超大的 editorial 排版 */}
          <h1
            className="reveal font-display-lg text-[clamp(2.8rem,11vw,4.5rem)] leading-[0.88] tracking-tight text-on-surface md:text-[128px]"
            style={{ transitionDelay: '80ms' }}
          >
            {profile.name}
          </h1>

          {/* 标题 & 简介 — 杂志封面副标题 */}
          <div
            className="reveal mt-md max-w-2xl"
            style={{ transitionDelay: '160ms' }}
          >
            <div className="inline-block border-b-2 border-primary/30 pb-2 mb-3">
              <span className="font-label-mono text-[11px] uppercase tracking-[0.18em] text-secondary">{profile.title}</span>
            </div>
            <p className="font-body-lg text-body-lg leading-relaxed text-on-surface/85">
              {profile.bio}
            </p>
          </div>

          {/* 技能胶囊徽章 — Kleine Blue 暖感胶囊 */}
          <div
            className="reveal mt-lg flex flex-wrap gap-2.5"
            style={{ transitionDelay: '200ms' }}
          >
            {featuredSkills.map((skill, i) => {
              const kleineBadges = [
                'bg-primary/12 text-primary border-primary/25',
                'bg-secondary/12 text-secondary border-secondary/25',
                'bg-primary/15 text-primary border-primary/30',
                'bg-secondary/15 text-secondary border-secondary/30',
                'bg-primary/10 text-primary border-primary/20',
                'bg-secondary/10 text-secondary border-secondary/20',
              ]
              return (
                <span
                  key={skill}
                  className={`rounded-full border px-4 py-1 font-label-mono text-[11px] tracking-wide ${kleineBadges[i % kleineBadges.length]}`}
                >
                  {skill}
                </span>
              )
            })}
          </div>

          {/* CTA 按钮区 */}
          <div
            className="reveal mt-lg flex flex-col gap-sm sm:flex-row"
            style={{ transitionDelay: '240ms' }}
          >
            {profile.email && (
              <button
                type="button"
                onClick={openContact}
                className="shimmer-btn inline-flex items-center justify-center gap-xs rounded-full bg-primary px-lg py-3 font-body-md text-body-md font-semibold text-on-primary transition-premium hover:shadow-[0_16px_48px_-28px_rgba(0,47,167,0.5)] btn-interact"
              >
                <Icon name="mail" className="text-lg" />
                联系我
              </button>
            )}
            <a
              href="#/ai-tools"
              className="inline-flex items-center justify-center gap-xs rounded-full border border-primary/30 bg-primary/8 px-lg py-3 font-body-md text-body-md font-semibold text-primary transition-premium hover:bg-primary/15 hover:shadow-[0_8px_24px_-12px_rgba(0,47,167,0.35)] btn-interact"
            >
              <Icon name="arrow_downward" className="text-lg" />
              开始使用 →
            </a>
          </div>

          {/* 信号指标 — 杂志封底式指标行 */}
          <div
            className="reveal mt-lg grid grid-cols-3 gap-2 md:gap-xs"
            style={{ transitionDelay: '320ms' }}
          >
            <div className="border-l-2 border-primary/20 pl-2 md:pl-sm">
              <span className="block font-label-mono text-[10px] uppercase tracking-[0.12em] text-secondary">01</span>
              <span className="mt-1 block font-label-mono text-[10px] md:text-[11px] text-text-muted">{profile.location}</span>
            </div>
            <div className="border-l-2 border-secondary/20 pl-2 md:pl-sm">
              <span className="block font-label-mono text-[10px] uppercase tracking-[0.12em] text-secondary">02</span>
              <span className="mt-1 block font-label-mono text-[10px] md:text-[11px] text-text-muted">{profile.skills.length} 项核心技能</span>
            </div>
            <div className="border-l-2 border-primary/20 pl-2 md:pl-sm">
              <span className="block font-label-mono text-[10px] uppercase tracking-[0.12em] text-secondary">03</span>
              <span className="mt-1 block font-label-mono text-[10px] md:text-[11px] text-text-muted">Cloudflare Pages 静态部署</span>
            </div>
          </div>

          {/* 每日一言 — 杂志内页引文块 */}
          {quote && (
            <div
              className="reveal mt-lg border-l-[3px] border-primary/30 pl-md"
              style={{ transitionDelay: '400ms' }}
            >
              <span className="font-label-mono text-[10px] uppercase tracking-[0.15em] text-primary">Quote of the Day</span>
              <p className="mt-1.5 font-body-lg text-lg leading-relaxed text-on-surface">
                &ldquo;{quote.text}&rdquo;
              </p>
              <p className="mt-1 font-label-mono text-[11px] text-text-muted">
                — {quote.author}{quote.source ? ` · ${quote.source}` : ''}
              </p>
            </div>
          )}
        </div>

        {/* ── 右侧：杂志封面主视觉 ── */}
        <aside
          className="reveal relative md:col-span-5 md:block"
          style={{ transitionDelay: '120ms' }}
          aria-label="杂志封面主视觉"
        >
          <div className="relative mx-auto flex aspect-square w-full max-w-[240px] items-center justify-center md:max-w-md">
            {/* 装饰性背景圈层 — Kleine Blue 同心圆 */}
            <div className="absolute inset-0 rounded-full border border-primary/10" />
            <div className="absolute inset-[4%] rounded-full border-2 border-primary/8" />
            <div className="absolute inset-[10%] rounded-full border border-secondary/15" />
            <div className="absolute inset-[16%] rounded-full border border-primary/6" />

            {/* 主图片 — 大圆形裁切杂志封面风格 */}
            <div className="relative z-10 h-[82%] w-[82%] overflow-hidden rounded-full border-[3px] border-surface shadow-[0_20px_60px_-20px_rgba(0,47,167,0.25)]">
              <img
                src="/images/yuanyu.png"
                alt={profile.name}
                className="h-full w-full object-cover object-center"
              />
              {/* 底部叠层标签 — 磨砂玻璃效果 */}
              <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 rounded-full border border-surface/30 bg-background/80 px-4 py-1.5 backdrop-blur-sm flex items-center gap-2 whitespace-nowrap shadow-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-label-mono text-[11px] text-on-surface">Available for focused builds</span>
              </div>
            </div>

            {/* 装饰性角标 — 杂志风格的卷号/标注 */}
            <div className="absolute -bottom-2 -right-2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary shadow-[0_4px_12px_-4px_rgba(0,47,167,0.4)]">
              <span className="font-label-mono tracking-wider">VOL.1</span>
            </div>

            {/* 装饰性 Kleine Blue 小圆点 */}
            <div className="absolute -left-3 top-[15%] z-20 h-5 w-5 rounded-full bg-primary/20" />
            <div className="absolute right-[8%] top-[6%] z-20 h-3 w-3 rounded-full bg-secondary/25" />
          </div>
        </aside>
      </div>

      {/* 底部导航 */}
      <a
        href="#/ai-tools"
        className="reveal mx-auto mt-12 flex max-w-7xl items-center gap-sm border-t border-border-subtle pt-sm font-label-mono text-[11px] uppercase tracking-[0.12em] text-text-muted transition-premium hover:text-primary md:mt-16"
        style={{ transitionDelay: '400ms' }}
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
