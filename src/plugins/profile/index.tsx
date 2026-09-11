import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactElement } from 'react'
import { PluginRuntimeConfig, ProfileConfig } from '@core/types'
import { ROUTE_ITEMS } from '@core/routeBridge'

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

/** 模块卡文案（真实功能描述，未启用路由不展示） */
const MODULE_NOTES: Record<string, string> = {
  'ai-tools': '意图词索引与分类检索，直达目标工具。',
  'wish-wall': '功能愿望征集，采纳与上线状态可见。',
  'stock-watch': '基金重仓股实时行情，盘前盘后自动更新。',
  food: '菜单海报化的随机推荐，保留一点仪式感。',
  'party-games': '谁是卧底 / 真心话大冒险，手机轮流操作。',
  'local-music': '本地音乐与氛围声场，随环境播放。',
  inbox: '访客投喂箱，收集留言与素材。',
  launch: '常用入口快捷启动。',
  workbench: '日常工作台。',
  collections: '收藏夹。',
  scratchpad: '灵感暂存本。',
}

const MODULE_ICONS: Record<string, ReactElement> = {
  'ai-tools': <><circle cx="10" cy="10" r="7" /><path d="M10 5.5V10l3 2" /></>,
  'wish-wall': <path d="M10 17s-6-3.7-6-8a3.5 3.5 0 0 1 6-2.4A3.5 3.5 0 0 1 16 9c0 4.3-6 8-6 8z" />,
  'stock-watch': <path d="M4 15V9m4 6V5m4 10v-4m4 4V7" />,
  food: <path d="M5 11a5 5 0 0 1 10 0M3 15h14M10 3v1.5" />,
  'party-games': <><rect x="4" y="3" width="12" height="14" rx="2" /><path d="M9 8l3.5 2L9 12V8z" /></>,
  'local-music': <><circle cx="7" cy="14" r="2.6" /><circle cx="14.5" cy="12.5" r="2.2" /><path d="M9.6 14V6l7-1.5v8" /></>,
  inbox: <path d="M3 11h4l1.5 2h3L13 11h4M4 6h12a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" />,
  launch: <path d="M11 3L4 11h5l-1 6 7-8h-5l1-6z" />,
  workbench: <><rect x="3" y="4" width="14" height="12" rx="1.5" /><path d="M7 9h6M7 12h4" /></>,
  collections: <path d="M6 3h8a1 1 0 0 1 1 1v12l-5-3-5 3V4a1 1 0 0 1 1-1z" />,
  scratchpad: <path d="M5 4h10v12l-5-3-5 3V4z" />,
}

const pad = (n: number) => String(n).padStart(2, '0')

interface Props {
  config?: PluginRuntimeConfig
  /** intro 结束（或无需 intro）后为 true，入场编排随之启动 */
  stageReady?: boolean
}

const ProfilePlugin = ({ config, stageReady = true }: Props) => {
  const profile = config as unknown as ProfileConfig | undefined
  const [quote, setQuote] = useState<Quote | null>(null)
  const revealsOn = stageReady
  const tcRef = useRef<HTMLElement>(null)
  const shotNoRef = useRef<HTMLElement>(null)
  const shotBarRef = useRef<HTMLElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/config/quotes.json')
      .then((res) => res.json())
      .then((data: Quote[]) => setQuote(getQuoteOfTheDay(data)))
      .catch(() => { /* 静默失败 */ })
  }, [])

  const openContact = () => {
    window.dispatchEvent(new globalThis.Event('homepage:open-contact'))
  }

  // 可用路由：以插件系统登记的可用集合为准，读取失败时回退全量
  const modules = useMemo(() => {
    const available = (window as unknown as { __hubAvailableRoutes?: string[] }).__hubAvailableRoutes
    return ROUTE_ITEMS.filter(
      (item) => item.id !== 'home' && (!available || available.includes(item.id)),
    )
  }, [])

  // 首页滚动吸附
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('ac-snap')
    return () => root.classList.remove('ac-snap')
  }, [])

  // 时间码：500ms 步进，避免高频重绘
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frames = 0
    const timer = setInterval(() => {
      frames = (frames + 12) % 216000
      const el = tcRef.current
      if (el) {
        el.textContent = `${pad(Math.floor(frames / 90000) % 24)}:${pad(Math.floor(frames / 3750) % 60)}:${pad(Math.floor(frames / 25) % 60)}:${pad(frames % 25)}`
      }
    }, 500)
    return () => clearInterval(timer)
  }, [])

  // 快切闪光 + SHOT 指示
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const shots = document.querySelectorAll<HTMLElement>('.ac-shot')
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const n = entry.target.getAttribute('data-shot') ?? '1'
        if (shotNoRef.current) shotNoRef.current.textContent = n
        if (shotBarRef.current) shotBarRef.current.style.transform = `scaleX(${Number(n) / 4})`
        if (!reduce && flashRef.current) {
          flashRef.current.classList.remove('ac-go')
          void flashRef.current.offsetWidth
          flashRef.current.classList.add('ac-go')
        }
      }
    }, { threshold: 0.55 })
    shots.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  // 入场编排：intro 结束后启动
  useEffect(() => {
    if (!revealsOn) return
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) { entry.target.classList.add('ac-in'); io.unobserve(entry.target) }
      }
    }, { threshold: 0.15 })
    document.querySelectorAll<HTMLElement>('.ac-cut').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [revealsOn])

  if (!profile) {
    return (
      <div className="surface-panel rounded-lg p-lg">
        <p className="text-text-muted font-body-md">未配置个人信息</p>
      </div>
    )
  }

  const featuredSkills = profile.skills.slice(0, 6)

  return (
    <section className="ac-stage" aria-label="首页舞台">
      {/* 取景器 chrome */}
      <div className="ac-corner ac-tl" aria-hidden="true" />
      <div className="ac-corner ac-tr" aria-hidden="true" />
      <div className="ac-corner ac-bl" aria-hidden="true" />
      <div className="ac-corner ac-br" aria-hidden="true" />
      <div className="ac-vf ac-cam" aria-hidden="true"><i />KKHOMECAM_01 · 35MM · F1.8</div>
      <div className="ac-vf ac-rec" aria-hidden="true"><i />REC <b ref={tcRef}>00:00:00:00</b></div>
      <div className="ac-vf ac-shotno" aria-hidden="true">
        SHOT <b ref={shotNoRef}>01</b> / 04
        <span className="ac-shotbar"><i ref={shotBarRef} style={{ transform: 'scaleX(0.25)' }} /></span>
      </div>
      <div className="ac-flash" ref={flashRef} aria-hidden="true" />

      {/* 浮动导航 */}
      <nav className="ac-nav" aria-label="快捷导航">
        <div className="ac-nav-brand"><i />{profile.name}</div>
        {modules.slice(0, 3).map((m) => (
          <a key={m.id} href={m.href}>{m.label}</a>
        ))}
        {profile.email && (
          <button type="button" className="ac-nav-cta" onClick={openContact}>
            联系我
            <span><svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 10L10 2M4 2h6v6" /></svg></span>
          </button>
        )}
      </nav>

      {/* SHOT 01 · 开场 */}
      <section className="ac-shot" data-shot="1" aria-label="开场">
        <div className="ac-speedlines" aria-hidden="true" />
        <div className="ac-shot-no" aria-hidden="true">01</div>

        <div className="ac-hero-copy">
          <span className="ac-kicker ac-cut">PERSONAL SPACE · {profile.location}</span>
          <h1 className="ac-display ac-hero-title ac-cut" style={{ '--d': '80ms' } as CSSProperties}>{profile.name}</h1>
          <div className="ac-display ac-hero-slogan ac-cut" style={{ '--d': '140ms' } as CSSProperties} aria-hidden="true">
            CODE THE <em>RUSH</em>
          </div>
          <p className="ac-hero-sub ac-cut" style={{ '--d': '200ms' } as CSSProperties}>{profile.bio}</p>
          <div className="ac-chips ac-cut" style={{ '--d': '260ms' } as CSSProperties}>
            {featuredSkills.map((skill) => <span key={skill} className="ac-chip">{skill}</span>)}
          </div>
          <div className="ac-cta ac-cut" style={{ '--d': '320ms' } as CSSProperties}>
            {profile.email && (
              <button type="button" className="ac-btn-fire" onClick={openContact}>
                联系我
                <span><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 10L10 2M4 2h6v6" /></svg></span>
              </button>
            )}
            <a className="ac-btn-ghost" href="#/ai-tools">开始使用 ↓</a>
          </div>
        </div>

        <div className="ac-figure ac-cut" style={{ '--d': '260ms' } as CSSProperties}>
          <img src={profile.avatar} alt={profile.name} loading="eager" />
          <div className="ac-figure-tag"><span>REC · LIVE</span><i /><span>4K / 60FPS</span></div>
        </div>

        <div className="ac-hero-meta ac-cut" style={{ '--d': '360ms' } as CSSProperties}>
          <div><b>{profile.location}</b><span>BASE</span></div>
          <div><b>{profile.skills.length}</b><span>CORE SKILLS</span></div>
          <div><b>PAGES</b><span>CLOUDFLARE 静态部署</span></div>
        </div>
      </section>

      <div className="ac-splice" aria-hidden="true">
        <div className="ac-tape">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i}>CUT 01 → 02 · MODULES <em>✕</em> FULL STACK <em>✕</em> 速度 × 代码 × 设计 <em>✕</em> </span>
          ))}
        </div>
      </div>

      {/* SHOT 02 · 模块 */}
      <section className="ac-shot" data-shot="2" aria-label="核心模块">
        <div className="ac-shot-no" aria-hidden="true">02</div>
        <div className="ac-grid-head">
          <div>
            <span className="ac-kicker ac-cut">SEQUENCE 02 · 导向</span>
            <h2 className="ac-display ac-h2 ac-cut" style={{ '--d': '80ms' } as CSSProperties}>核心<em>模块</em></h2>
          </div>
          <div className="ac-grid-note ac-cut" style={{ '--d': '160ms' } as CSSProperties}>
            <b>{modules.length}</b> ROUTES / READY
          </div>
        </div>
        <div className="ac-cards">
          {modules.map((m, idx) => (
            <a key={m.id} className={`ac-tcard ac-cut${idx === 0 ? ' ac-hot' : ''}`} href={m.href} style={{ '--d': `${120 + idx * 70}ms` } as CSSProperties}>
              <span className="ac-idx">M-{pad(idx + 1)}</span>
              <span className="ac-ico">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  {MODULE_ICONS[m.id] ?? MODULE_ICONS.launch}
                </svg>
              </span>
              <h3>{m.label}</h3>
              <span className="ac-domain">{m.id}</span>
              <p>{MODULE_NOTES[m.id] ?? '即将开放。'}</p>
            </a>
          ))}
        </div>
      </section>

      <div className="ac-splice ac-splice-alt" aria-hidden="true">
        <div className="ac-tape">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i}>CUT 02 → 03 · TELEMETRY <em>✕</em> LIVE DATA <em>✕</em> 每一次发布都是一次起跳 <em>✕</em> </span>
          ))}
        </div>
      </div>

      {/* SHOT 03 · 遥测 */}
      <section className="ac-shot" data-shot="3" aria-label="数据与引言">
        <div className="ac-shot-no" aria-hidden="true">03</div>
        <span className="ac-kicker ac-cut">SEQUENCE 03 · 遥测</span>
        <h2 className="ac-display ac-h2 ac-cut" style={{ '--d': '80ms', marginTop: 18 } as CSSProperties}>
          LIVE <em>DATA</em>
        </h2>
        <div className="ac-tele">
          <div className="ac-cell ac-cut"><b>{modules.length}</b><span>ROUTES LIVE</span></div>
          <div className="ac-cell ac-cut" style={{ '--d': '80ms' } as CSSProperties}><b>{profile.skills.length}</b><span>CORE SKILLS</span></div>
          <div className="ac-cell ac-cut" style={{ '--d': '160ms' } as CSSProperties}><b>{new Date().getFullYear()}</b><span>BUILD YEAR</span></div>
          {quote && (
            <div className="ac-cell ac-cell-wide ac-cut" style={{ '--d': '240ms' } as CSSProperties}>
              <div className="ac-live"><i />DAILY QUOTE</div>
              <p className="ac-quote">&ldquo;{quote.text}&rdquo;</p>
              <span className="ac-quote-by">— {quote.author}{quote.source ? ` · ${quote.source}` : ''}</span>
            </div>
          )}
        </div>
      </section>

      <div className="ac-splice" aria-hidden="true">
        <div className="ac-tape">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i}>FINAL CUT · 联系 <em>✕</em> SAY HELLO <em>✕</em> {profile.title} <em>✕</em> </span>
          ))}
        </div>
      </div>

      {/* SHOT 04 · 终幕 */}
      <section className="ac-shot" data-shot="4" aria-label="联系">
        <div className="ac-speedlines ac-speedlines-alt" aria-hidden="true" />
        <div className="ac-shot-no" aria-hidden="true">04</div>
        <span className="ac-kicker ac-cut">FINAL CUT · 联系</span>
        <h2 className="ac-display ac-final-title ac-cut" style={{ '--d': '80ms', marginTop: 20 } as CSSProperties}>
          来<em>聊</em>个项目
        </h2>
        <p className="ac-final-sub ac-cut" style={{ '--d': '160ms' } as CSSProperties}>
          有想法、有需求、或者只是想聊聊技术与速度——联系窗口随时开放。
        </p>
        <div className="ac-cta ac-cut" style={{ '--d': '240ms' } as CSSProperties}>
          {profile.email && (
            <button type="button" className="ac-btn-fire" onClick={openContact}>
              联系我
              <span><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 10L10 2M4 2h6v6" /></svg></span>
            </button>
          )}
          <a className="ac-btn-ghost" href="#/home" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>回到片头 ↑</a>
        </div>
        {profile.email && (
          <div className="ac-final-links ac-cut" style={{ '--d': '320ms' } as CSSProperties}>
            <a href={`mailto:${profile.email}`}>EMAIL ↗</a>
            <a href="#/ai-tools">工具导向 ↗</a>
            <a href="#/wish-wall">许愿墙 ↗</a>
          </div>
        )}
      </section>
    </section>
  )
}

export default ProfilePlugin
