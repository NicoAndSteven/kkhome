import { useCallback, useState, useEffect, useRef, Suspense } from 'react'
import { pluginSystem, configLoader } from '@core'
import { plugins } from '@plugins'
import { Layout, IntroStage, ContactDrawer, ErrorBoundary, Loading, BlogSidebar, MobileTabBar, ShotHeader, AdminLogin, AdminPanel } from '@components'
import { MotionConfig, ProfileConfig, SiteConfig } from '@core/types'
import { useIsMobile } from './hooks/useIsMobile'
import { HubRouteId, normalizeHubRoute, ROUTE_ITEMS } from '@core/routeBridge'
import { getAudioEngine, TrackState } from '@plugins/ambient-music/AudioEngine'
import { synthesizeTrack } from '@plugins/ambient-music/tracks'
import MiniPlayer from '@plugins/ambient-music/MiniPlayer'
import { MusicPlayerProvider } from './contexts/MusicPlayerContext'

/** 所有路由定义（含 welcome） */
/** 博客内部路由（不含 welcome）；全量定义见 core/routeBridge 的 ROUTE_ITEMS */
const blogRouteItems = ROUTE_ITEMS.filter(r => r.id !== 'home')

/** 上一路由 id：跨渲染记忆，用于方向感知切镜 */
let prevRouteId: string | null = null

function App() {
  const [loading, setLoading] = useState(true)
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null)
  const [profileConfig, setProfileConfig] = useState<ProfileConfig | null>(null)
  const [motionConfig, setMotionConfig] = useState<MotionConfig | null>(null)
  const [introComplete, setIntroComplete] = useState(false)
  const isMobile = useIsMobile()
  const [activeRoute, setActiveRoute] = useState<HubRouteId>(() => normalizeHubRoute(window.location.hash))
  // intro 安全兜底：6 秒后无论 IntroStage 是否完成都显示内容
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!introComplete) setIntroComplete(true)
    }, 6000)
    return () => clearTimeout(timer)
  }, [introComplete])

  const [contactOpen, setContactOpen] = useState(false)
  const [adminLoginOpen, setAdminLoginOpen] = useState(false)
  const [adminToken, setAdminToken] = useState('')
  const [showAdmin, setShowAdmin] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const systemPrefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
  const showInitialIntro = !systemPrefersReducedMotion && activeRoute === 'home' && !introComplete

  // 定期检查待审核数量
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/music/songs')
        const json = await res.json()
        if (json.ok) {
          const pending = json.data.songs.filter((s: any) => s.status === 'pending').length
          setPendingCount(pending)
        }
      } catch { /* ignore */ }
    }
    check()
    const timer = setInterval(check, 30000)
    return () => clearInterval(timer)
  }, [])
  const [ambientTracks, setAmbientTracks] = useState<TrackState[]>([])
  const handleAdminAuth = useCallback((token: string) => {
    setAdminToken(token)
    globalThis.sessionStorage.setItem('hub:admin-token', token)
    window.dispatchEvent(new CustomEvent('admin-auth', { detail: { token } }))
    setShowAdmin(true)
  }, [])

  useEffect(() => {
    const initializeApp = async () => {
      try {
        pluginSystem.reset()
        pluginSystem.registerAll(plugins)

        const [appCfg, pluginCfgs] = await Promise.all([
          configLoader.loadAppConfig(),
          configLoader.loadPluginConfigs(),
        ])

        setSiteConfig(appCfg.site)
        setProfileConfig(appCfg.profile)
        setMotionConfig(appCfg.motion)

        pluginSystem.applyConfigs(
          pluginCfgs.map((pluginCfg) => (
            pluginCfg.id === 'profile'
              ? { ...pluginCfg, config: { ...appCfg.profile, ...pluginCfg.config } }
              : pluginCfg
          )),
        )

        await pluginSystem.initialize()
      } catch (error) {
        console.error('Failed to initialize app:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeApp()
  }, [])

  useEffect(() => {
    if (!siteConfig) return
    document.title = siteConfig.title
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    description?.setAttribute('content', siteConfig.description)
  }, [siteConfig])

  // 路由变化监听
  useEffect(() => {
    const handleHashChange = () => {
      const route = normalizeHubRoute(window.location.hash)
      setActiveRoute(route)
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }

    // 初始化时如果不在 home 且 hash 为空，跳转到第一个有效路由
    if (!window.location.hash || window.location.hash === '#/' || window.location.hash === '#/home' || window.location.hash === '') {
      // 首次加载，保持在 home
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    if (loading) return
    const enabledPluginIds = new Set(pluginSystem.getEnabledPlugins().map((plugin) => plugin.id))
    window.__hubAvailableRoutes = ROUTE_ITEMS
      .filter((route) => enabledPluginIds.has(route.pluginId))
      .map((route) => route.id)
  }, [loading])

  useEffect(() => {
    const openContact = () => setContactOpen(true)
    window.addEventListener('homepage:open-contact', openContact)
    return () => window.removeEventListener('homepage:open-contact', openContact)
  }, [])

  // 订阅音频引擎状态
  useEffect(() => {
    const engine = getAudioEngine()
    const unsub = engine.subscribe(setAmbientTracks)
    return unsub
  }, [])

  // 首页自动播放氛围音乐（intro 完成后或首次用户交互时触发）
  const autoPlayRef = useRef(false)
  useEffect(() => {
    if (loading) return
    const engine = getAudioEngine()

    const tryAutoPlay = async () => {
      if (autoPlayRef.current) return
      autoPlayRef.current = true

      await new Promise(r => setTimeout(r, 800))

      try {
        const ctx = new AudioContext()
        const buffer = await synthesizeTrack(ctx, 'rain', 4)
        engine.registerTrack('rain', buffer, 0.25) // 低音量 25%
        await engine.play('rain', 2000) // 2 秒淡入
        ctx.close()
      } catch {
        // 浏览器阻止自动播放，等用户首次交互
      }
    }

    // intro 完成后尝试；否则监听 intro-complete
    if (introComplete) {
      tryAutoPlay()
    } else {
      const onIntroDone = () => tryAutoPlay()
      window.addEventListener('intro-complete', onIntroDone, { once: true })
      return () => window.removeEventListener('intro-complete', onIntroDone)
    }

    // 兜底：首次用户交互（touch/click）触发
    const onFirstInteraction = () => {
      tryAutoPlay()
      document.removeEventListener('click', onFirstInteraction)
      document.removeEventListener('touchstart', onFirstInteraction)
    }
    document.addEventListener('click', onFirstInteraction, { once: true })
    document.addEventListener('touchstart', onFirstInteraction, { once: true })
    return () => {
      document.removeEventListener('click', onFirstInteraction)
      document.removeEventListener('touchstart', onFirstInteraction)
    }
  }, [loading, introComplete])

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true)
    window.dispatchEvent(new Event('intro-complete'))
  }, [])

  const commonAdminEntry = (
    <>
      <AdminLogin open={adminLoginOpen} onClose={() => setAdminLoginOpen(false)} onAuth={handleAdminAuth} />
      <button
        type="button"
        onClick={() => setAdminLoginOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-10 w-10 rounded-full border border-border-subtle bg-surface/60 text-text-muted opacity-60 backdrop-blur-md transition-all hover:border-primary/30 hover:text-primary hover:opacity-100 flex items-center justify-center"
        aria-label="管理员"
        title="管理员"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-error text-[9px] font-bold text-white shadow-lg">
            {pendingCount > 9 ? '9+' : pendingCount}
          </span>
        )}
      </button>
    </>
  )

  // Reveal 动画
  useEffect(() => {
    const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('active')
      })
    }, observerOptions)

    const revealElements = document.querySelectorAll('.reveal')
    revealElements.forEach((el) => revealObserver.observe(el))
    return () => revealObserver.disconnect()
  }, [activeRoute, loading])

  if (loading) {
    return (
      <Layout>
        {showInitialIntro && (
          <IntroStage
            author={siteConfig?.author ?? '垣钰'}
            enabled
            duration={motionConfig?.introDuration ?? 2400}
            onComplete={handleIntroComplete}
          />
        )}
        <Loading />
      </Layout>
    )
  }

  // 管理后台覆盖层
  if (showAdmin && adminToken) {
    return <AdminPanel token={adminToken} onClose={() => { setShowAdmin(false); window.location.hash = '#/local-music' }} />
  }

  const enabledPlugins = pluginSystem.getEnabledPlugins()
  const enabledPluginIds = new Set(enabledPlugins.map((plugin) => plugin.id))
  const isOnWelcome = activeRoute === 'home'
  const profilePlugin = enabledPlugins.find((plugin) => plugin.id === 'profile')

  // === 欢迎页模式：Intro 动画 + Action Cut 首页舞台 ===
  if (isOnWelcome) {
    // 舞台入场编排在 intro 结束后启动；移动端与关闭 intro 时立即就绪
    const stageReady = introComplete || isMobile || !motionConfig?.intro
    return (
      <Layout>
        {siteConfig && motionConfig && (
          <IntroStage
            author={siteConfig.author}
            enabled={motionConfig.intro && !isMobile && !introComplete}
            duration={motionConfig.introDuration}
            onComplete={handleIntroComplete}
          />
        )}
        <main className={`page-shell home-stage-shell ${stageReady ? 'page-ready' : ''}`} style={{ position: 'relative', zIndex: 1 }}>
          <ErrorBoundary>
            {profilePlugin ? (
              <Suspense fallback={<div className="surface-panel rounded-2xl p-lg"><p className="text-text-muted font-body-md">加载中...</p></div>}>
                <profilePlugin.component
                  config={profilePlugin.config}
                  {...({ stageReady } as Record<string, unknown>)}
                />
              </Suspense>
            ) : (
              <div className="surface-panel rounded-2xl p-lg">
                <p className="text-text-muted font-body-md">加载中...</p>
              </div>
            )}
          </ErrorBoundary>
        </main>

        <ContactDrawer
          open={contactOpen}
          profile={profileConfig ?? undefined}
          onClose={() => setContactOpen(false)}
        />
        {commonAdminEntry}
      </Layout>
    )
  }

  // === 公共路由模式 ===
  const availableRouteItems = blogRouteItems.filter((route) => enabledPluginIds.has(route.pluginId))
  const activeRouteItem = availableRouteItems.find((route) => route.id === activeRoute)
    ?? blogRouteItems.find((route) => enabledPluginIds.has(route.pluginId))
    ?? blogRouteItems[0]
  const activePlugin = enabledPlugins.find((plugin) => plugin.id === activeRouteItem.pluginId)
  const sidebarNowPlaying = (
    <MiniPlayer
      tracks={ambientTracks}
      onToggleTrack={(id) => {
        const engine = getAudioEngine()
        const state = ambientTracks.find((t) => t.id === id)
        if (state?.playing) engine.stop(id)
        else engine.play(id)
      }}
      onOpenFull={() => { window.location.hash = '#/local-music' }}
    />
  )

  const commonDrawer = (
    <ContactDrawer
      open={contactOpen}
      profile={profileConfig ?? undefined}
      onClose={() => setContactOpen(false)}
    />
  )

  // 方向感知切镜：按路由顺序判断前进/后退
  const routeIdx = ROUTE_ITEMS.findIndex((r) => r.id === activeRouteItem.id)
  const prevIdx = prevRouteId ? ROUTE_ITEMS.findIndex((r) => r.id === prevRouteId) : -1
  const cutDir = prevIdx === -1 || routeIdx === -1 || routeIdx >= prevIdx ? 'ac-fwd' : 'ac-back'
  prevRouteId = activeRouteItem.id
  const activeIdx = Math.max(0, availableRouteItems.findIndex((r) => r.id === activeRouteItem.id))

  if (isMobile) {
    // === 移动端：全宽可滚动内容 + 底部 TabBar（切镜入场） ===
    const tabBarHeight = 88 // tabbar(~64px) + bottom-3(12px) + bottom-gap(~12px)
    return (
      <Layout routeMode>
        <MobileTabBar routes={availableRouteItems} activeRoute={activeRoute} />
        <main
          className={`route-mobile-main route-view ${cutDir} mx-auto w-full max-w-[760px] px-4 pt-12`}
          style={{ height: `calc(100dvh - ${tabBarHeight}px)` }}
        >
          <div className="ac-flash ac-go" aria-hidden="true" />
          <ShotHeader route={activeRouteItem} index={activeIdx + 1} total={availableRouteItems.length} />
          <ErrorBoundary key={activeRouteItem.id}>
            {activePlugin ? (
              <Suspense fallback={<div className="py-8 text-center text-text-muted font-body-md">加载中...</div>}>
                <activePlugin.component config={activePlugin.config} />
              </Suspense>
            ) : (
              <div className="surface-panel rounded-[28px] p-5">
                <span className="font-label-mono text-xs uppercase text-secondary">当前不可用</span>
                <h1 className="mt-1 font-headline-md text-headline-md text-on-surface">模块不可用</h1>
                <p className="mt-1 font-body-md text-body-md text-text-muted">
                  当前配置没有启用「{activeRouteItem?.label ?? ''}」模块。
                </p>
              </div>
            )}
          </ErrorBoundary>
        </main>
        {commonDrawer}
        {commonAdminEntry}
      </Layout>
    )
  }

  // === 桌面端：Action-Cut 导航轨 + 全幅内容 ===
  return (
    <Layout routeMode>
      <div className="route-shell">
        <BlogSidebar
          routes={availableRouteItems}
          activeIndex={activeIdx}
          onContactClick={() => setContactOpen(true)}
        />
        <main className="route-main">
          <div key={activeRouteItem.id} className={`route-view ${cutDir}`} aria-label={activeRouteItem.label}>
            <div className="ac-flash ac-go" aria-hidden="true" />
            <ShotHeader route={activeRouteItem} index={activeIdx + 1} total={availableRouteItems.length} />
            <ErrorBoundary key={activeRouteItem.id}>
              {activePlugin ? (
                <Suspense fallback={<div className="ac-loading">LOADING SEQUENCE…</div>}>
                  <activePlugin.component config={activePlugin.config} />
                </Suspense>
              ) : (
                <div className="ac-unavailable">
                  <span className="ac-kicker">OFF AIR</span>
                  <h1 className="ac-display ac-h2">模块<em>不可用</em></h1>
                  <p className="ac-final-sub">当前配置没有启用「{activeRouteItem.label}」模块。</p>
                </div>
              )}
            </ErrorBoundary>
          </div>
          <div className="ac-dock-player">{sidebarNowPlaying}</div>
        </main>
      </div>
      {commonDrawer}
      {commonAdminEntry}
    </Layout>
  )
}

function AppInner() {
  return (
    <MusicPlayerProvider>
      <App />
    </MusicPlayerProvider>
  )
}

export default AppInner
