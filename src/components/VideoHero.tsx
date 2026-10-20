import { useEffect, useMemo, useRef, useState } from 'react'
import { HeroConfig } from '@core/types'
import { ROUTE_ITEMS } from '@core/routeBridge'
import { useMotionScope, useTextReveal } from '@core/motion'

interface Props {
  hero: HeroConfig
  /** 头像（可选）。按原有画幅（竖版取景框）放在首屏左侧 */
  avatar?: string
  /** intro 结束后才启动入场编排；否则文案会在开场遮罩后面偷偷播完 */
  stageReady?: boolean
}

/**
 * 交叉溶解时长（秒）。
 *
 * 这个值只该短到「察觉不到」，不该长到「看得出在叠化」。
 * 第一版用了 1.2s，结果是两层画面各自动着、运动互相打架，看着像闪回 ——
 * 因为这段素材首尾本来就不接，溶解期间观众会同时看到两个不同时刻的水柱。
 * 0.4s 属于剪辑里「用来消掉跳切的快速叠化」区间：足以把跳变摊成渐变，
 * 又短到人眼来不及分辨出两层。
 */
const FADE_SECONDS = 0.4

/**
 * 首页首屏：全屏视频 + 左侧取景框头像 + 错峰文案。
 *
 * 为什么这里的入场用 anime.js 而不是 CSS keyframes：
 * 标题行数来自配置（`hero.headline` 是数组），是**运行时数据**。
 * CSS 的 `animation-delay` 是静态的，写不出「按实际行数逐行错峰」。
 * anime.js 的 `stagger()` 可以，而且行数改了不用回头改样式表。
 *
 * 强调色切换器**不在**这里 —— 它属于路由域（见 AccentSwitcher）。
 */
const VideoHero = ({ hero, avatar, stageReady = true }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)

  // 只取真实启用的路由，不编造入口
  const navRoutes = useMemo(() => {
    const available = window.__hubAvailableRoutes
    return ROUTE_ITEMS
      .filter((item) => item.id !== 'home' && (!available || available.includes(item.id)))
      .slice(0, 4)
  }, [])

  // 菜单打开时锁滚动
  useEffect(() => {
    if (!menuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [menuOpen])

  const openContact = () => {
    setMenuOpen(false)
    window.dispatchEvent(new globalThis.Event('homepage:open-contact'))
  }

  const { ref, reduced } = useMotionScope<HTMLElement>(
    `video-hero:${stageReady}`,
    ({ q, timeline, prime }) => {
      if (!stageReady) return

      /**
       * 入场一律走**独立的 `translate` 属性**，不用 `y` / `x`。
       *
       * 原因是实测出来的：anime.js 的 `y` / `x` / `translateX` 全都写进
       * **`transform`**，而 `transform` 是**整个属性覆盖** —— `.vh-figure`
       * 自带 `transform: rotate(3deg)`（那张拍立得的倾斜），用 `x` 动过之后
       * 倾斜会**永久消失**。写 `translate` 则与 `transform` 按规范叠加，互不干扰。
       *
       * 同时要先 `prime()` 落初始态：anime.js 的 from 值要等引擎首次 tick 才写，
       * 不落的话元素会先以终态画一帧再跳回去，肉眼就是"闪一下"。
       */
      const rise = (selector: string, from: string, at: number, duration = 800) => {
        prime(selector, { translate: from })
        timeline.add(q(selector), {
          opacity: [0, 1],
          translate: [from, '0px 0px'],
          duration,
          ease: 'outExpo',
        }, at)
      }

      rise('.vh-nav', '0px -16px', 0, 700)
      rise('.vh-figure', '-28px 0px', 120, 900)
      rise('.vh-badge', '0px 24px', 260)

      // 标题交给 useTextReveal 做逐字揭示（splitText）。
      // 这里只把整行从 CSS 的 opacity:0 抬到 1 —— 真正的动效在字符上。
      // 用 1ms 而不是省略：`.vh-line` 在 CSS 里是 `opacity: 0`
      // （`@media (prefers-reduced-motion: no-preference)` 那段），
      // 不让它变 1 的话，就算字符揭示完了整行还是不可见。
      timeline.add(q('.vh-line'), { opacity: 1, duration: 1 }, 400)

      rise('.vh-sub', '0px 24px', 720)
      rise('.vh-cta', '0px 24px', 900)
      rise('.vh-note', '0px 0px', 1000, 600)
    },
  )

  /**
   * 标题逐字揭示。
   *
   * 为什么是 anime.js 的 `splitText` 而不是手写拆分：它会额外生成一份视觉隐藏的
   * 完整文本给读屏软件（`accessible: true`），手写拆字会把可访问性搞坏
   * —— 读屏会一个字一个字念。
   *
   * `enabled` 绑定 `stageReady`：开场遮罩还没退场时**不拆也不动**。
   * 否则字符会在遮罩后面偷偷播完，用户揭开遮罩看到的是一段已经结束的动画。
   */
  const titleRef = useTextReveal<HTMLHeadingElement>({
    selector: '.vh-line',
    by: 'chars',
    enabled: stageReady,
    delay: 400,
    duration: 620,
    stagger: 22,
    lineDelay: 80,
    from: 12,
  })

  const videoA = useRef<HTMLVideoElement>(null)
  const videoB = useRef<HTMLVideoElement>(null)
  const showVideo = Boolean(hero.videoUrl) && !reduced && !videoFailed

  const handleVideoError = () => {
    setVideoFailed(true)
    // 不静默失败：说清降级原因，但不抛错（不污染 console error）
    console.warn(`[hero] 背景视频加载失败，已降级为渐变背景：${hero.videoUrl}`)
  }

  /*
   * 交叉溶解循环 —— 替代 `loop` 属性。
   *
   * 为什么不用 `loop`：
   * ① 它的实现是「播到末尾 → seek 回 0 → 继续」。实测每次循环都触发
   *    seeking/waiting，画面冻结 64~83ms（正常帧间隔 41.7ms）。
   * ② 这段素材末帧和首帧根本不是同一画面（水柱宽度、鱼的位置、底部光斑都变了），
   *    硬接就是一次跳变 —— 这是素材本身的问题，任何「让 loop 更快」的优化都救不了。
   *
   * 所以两个 video 交替：前一个播到 dur-FADE 时，后一个从 0 开始播并淡入盖住前者。
   * 停顿被盖住，跳变被溶解。
   */
  useEffect(() => {
    if (!showVideo) return
    const a = videoA.current
    const b = videoB.current
    if (!a || !b) return

    // 溶解时长以 JS 常量为唯一来源，注入 CSS 变量
    ref.current?.style.setProperty('--vh-fade', `${FADE_SECONDS}s`)

    // React 的 muted prop 不保证落到 DOM property，而浏览器只认 property 才放行自动播放
    a.muted = true
    b.muted = true

    let front = a
    let back = b
    let handoff = false
    let swapTimer: number | undefined
    let revealTimer: number | undefined
    let started = false

    /*
     * 等浏览器判断「能流畅播到底」再起播。
     *
     * 实测这段素材在播放中也会反复触发 waiting（t=5.88 / 6.14 / 6.42 / 6.76），
     * currentTime 会原地停住 —— 因为 moov 在文件末尾、且整段只有 2 个关键帧
     * （第 1 和第 120 帧），第二个 GOP 有近 3 秒长，边播边取数据就会卡。
     * 背景视频晚出现一两秒可以接受（有渐变兜底），播放中卡顿才难接受。
     */
    const start = () => {
      if (started) return
      started = true
      // 只在真的播过之后才归零 —— 对已经在 0 的元素写 currentTime 会触发一次
      // 无谓的 seeking，白白多出一次 waiting
      if (a.currentTime > 0.05) a.currentTime = 0
      a.play().catch(() => { /* 自动播放被拒不是错误 */ })
    }
    a.addEventListener('canplaythrough', start, { once: true })
    const startFallback = window.setTimeout(start, 5000)

    const tick = () => {
      if (handoff) return
      const duration = front.duration
      // 时长未知，或短到溶解会吃掉整段视频 —— 退回单视频循环，不做交接
      if (!Number.isFinite(duration) || duration <= FADE_SECONDS * 2) return
      if (front.currentTime < duration - FADE_SECONDS) return

      handoff = true
      const outgoing = front
      const incoming = back

      incoming.currentTime = 0
      incoming.play().catch(() => { /* 自动播放被拒不是错误 */ })

      // 两个类分开管：is-front 抬层级，is-visible 淡入。
      // 旧层全程保持 is-visible（opacity 1）不动，新层从 0 淡入 —— 叠加结果才是干净的
      // 交叉溶解；若让旧层同时淡出，中间点会透出 25% 的兜底背景，画面发暗。
      incoming.classList.add('is-front')
      outgoing.classList.remove('is-front')

      let revealed = false
      const reveal = () => {
        if (revealed) return
        revealed = true
        if (revealTimer) window.clearTimeout(revealTimer)
        incoming.classList.add('is-visible')
        // 从真正开始淡入的那一刻起算，保证两层不会同时半透明
        swapTimer = window.setTimeout(() => {
          outgoing.pause()
          outgoing.currentTime = 0
          outgoing.classList.remove('is-visible') // 已被完全盖住，这次淡出看不见
          front = incoming
          back = outgoing
          handoff = false
        }, FADE_SECONDS * 1000)
      }

      // 等 incoming 真的渲染出第一帧再淡入：seek 期间它没有画面，
      // 直接淡入会变成「一块空白逐渐盖住旧画面」。600ms 兜底防它永远不淡入。
      if (typeof incoming.requestVideoFrameCallback === 'function') {
        incoming.requestVideoFrameCallback(reveal)
      }
      revealTimer = window.setTimeout(reveal, 600)
    }

    const timer = window.setInterval(tick, 100)
    return () => {
      window.clearInterval(timer)
      window.clearTimeout(startFallback)
      if (swapTimer) window.clearTimeout(swapTimer)
      if (revealTimer) window.clearTimeout(revealTimer)
      a.removeEventListener('canplaythrough', start)
    }
  }, [showVideo, hero.videoUrl, ref])

  return (
    <section ref={ref} className="vh" aria-label="首页首屏">
      {/* 兜底层始终在：视频没出来时看到的是它，不是一片黑 */}
      <div className="vh-fallback" aria-hidden="true" />

      {/* 两个 video 交替播放做交叉溶解（见上面的 effect）。
          第一个带 is-front is-visible 保证 JS 未跑时也能看到画面。 */}
      {showVideo && (
        <>
          {/* 不设 autoPlay：起播时机由上面的 effect 在 canplaythrough 后决定，
              避免边下边播时反复卡住。preload="auto" 保证它照常开始下载。 */}
          <video
            ref={videoA}
            className="vh-video is-front is-visible"
            src={hero.videoUrl}
            style={{ objectPosition: hero.videoPosition }}
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            onError={handleVideoError}
          />
          <video
            ref={videoB}
            className="vh-video"
            src={hero.videoUrl}
            style={{ objectPosition: hero.videoPosition }}
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            onError={handleVideoError}
          />
        </>
      )}

      <div className="vh-scrim" aria-hidden="true" />

      <nav className="vh-nav" aria-label="首屏导航">
        <a className="vh-brand" href="#/home">
          <span className="vh-brand-dot" aria-hidden="true" />
          {hero.badge.split('·')[0].trim() || 'HUB'}
        </a>

        <div className="vh-nav-links">
          {navRoutes.map((route) => (
            <a key={route.id} href={route.href}>{route.label}</a>
          ))}
        </div>

        <div className="vh-nav-right">
          <button type="button" className="vh-cta-sm" onClick={openContact}>联系我</button>
          <button
            type="button"
            className={`vh-burger${menuOpen ? ' is-open' : ''}`}
            aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg className="vh-i-menu" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 7h18M3 12h18M3 17h18" /></svg>
            <svg className="vh-i-x" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
      </nav>

      {/* 移动端全屏菜单 */}
      <div className={`vh-sheet${menuOpen ? '' : ' is-closed'}`} aria-hidden={!menuOpen}>
        <div className="vh-sheet-inner">
          {navRoutes.map((route) => (
            <a key={route.id} className="vh-sheet-link" href={route.href} onClick={() => setMenuOpen(false)}>
              {route.label}
            </a>
          ))}
          <button type="button" className="vh-sheet-cta" onClick={openContact}>联系我</button>
        </div>
      </div>

      <div className="vh-body">
        {/* 左：原有画幅的取景框头像（竖版 0.82，带 REC 条）。
            纯装饰 —— 名字已经在 h1 里，读屏不必再念一遍。 */}
        {avatar && (
          <figure className="vh-figure" aria-hidden="true">
            <img src={avatar} alt="" loading="eager" />
            <figcaption className="vh-figure-tag">
              <span>REC · LIVE</span>
              <i />
              <span>4K / 60FPS</span>
            </figcaption>
          </figure>
        )}

        {/* 右：文案 */}
        <div className="vh-copy">
          <div className="vh-top">
            <span className="vh-badge">{hero.badge}</span>
            <h1 ref={titleRef} className="vh-title">
              {hero.headline.map((line, index) => (
                <span key={`${line}-${index}`} className="vh-line">{line}</span>
              ))}
            </h1>
          </div>

          <div className="vh-bottom">
            <p className="vh-sub">{hero.subline}</p>
            <a className="vh-cta" href={hero.ctaHref}>
              {hero.ctaLabel}
              <span aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </span>
            </a>
          </div>
        </div>
      </div>

      {videoFailed && (
        <span className="vh-note">背景视频不可用 · 已降级为渐变背景</span>
      )}
    </section>
  )
}

export default VideoHero
