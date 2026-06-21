import { useCallback, useState, useEffect } from 'react'
import { pluginSystem, configLoader } from '@core'
import { plugins } from '@plugins'
import { Layout, Header, IntroStage, ContactDrawer, ErrorBoundary, Loading, BlogSidebar, MobileTabBar, AdminLogin, AdminPanel } from '@components'
import { MotionConfig, ProfileConfig, SiteConfig } from '@core/types'
import { useIsMobile } from './hooks/useIsMobile'
import { HubRouteId, normalizeHubRoute } from '@core/routeBridge'
import { getAudioEngine, TrackState } from '@plugins/ambient-music/AudioEngine'
import MiniPlayer from '@plugins/ambient-music/MiniPlayer'
import VantaBirds from '@components/VantaBirds'
import VantaRings from '@components/VantaRings'
import { MusicPlayerProvider } from './contexts/MusicPlayerContext'

/** 所有路由定义（含 welcome） */
const allRouteItems: Array<{ id: HubRouteId; label: string; href: string; pluginId: string }> = [
  { id: 'home', label: '首页', href: '#/home', pluginId: 'profile' },
  { id: 'ai-tools', label: '导向', href: '#/ai-tools', pluginId: 'ai-navigator' },
  { id: 'wish-wall', label: '许愿', href: '#/wish-wall', pluginId: 'wish-wall' },
  { id: 'stock-watch', label: '看盘', href: '#/stock-watch', pluginId: 'stock-watch' },
  { id: 'food', label: '吃啥', href: '#/food', pluginId: 'food' },
  { id: 'local-music', label: '音乐', href: '#/local-music', pluginId: 'local-music' },
  { id: 'inbox', label: '投喂', href: '#/inbox', pluginId: 'universal-inbox' },
  { id: 'launch', label: '启动', href: '#/launch', pluginId: 'quick-launch' },
  { id: 'workbench', label: '工作台', href: '#/workbench', pluginId: 'workbench' },
  { id: 'collections', label: '收藏', href: '#/collections', pluginId: 'collections' },
  { id: 'scratchpad', label: '暂存', href: '#/scratchpad', pluginId: 'scratchpad' },
]

/** 博客内部路由（不含 welcome） */
const blogRouteItems = allRouteItems.filter(r => r.id !== 'home')

/** 首个有效路由 */
function firstRoute(routes: typeof blogRouteItems, enabled: Set<string>): string {
  return routes.find(r => enabled.has(r.pluginId))?.href ?? '#/ai-tools'
}

function App() {
  const [loading, setLoading] = useState(true)
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null)
  const [profileConfig, setProfileConfig] = useState<ProfileConfig | null>(null)
  const [motionConfig, setMotionConfig] = useState<MotionConfig | null>(null)
  const [introComplete, setIntroComplete] = useState(false)
  const isMobile = useIsMobile()
  const [activeRoute, setActiveRoute] = useState<HubRouteId>(() => normalizeHubRoute(window.location.hash))
  const [contactOpen, setContactOpen] = useState(false)
  const [adminLoginOpen, setAdminLoginOpen] = useState(false)
  const [adminToken, setAdminToken] = useState('')
  const [showAdmin, setShowAdmin] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const showInitialIntro = !isMobile && activeRoute === 'home' && !introComplete

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

  // 路由变化监听：如果在博客内部访问 #/home，跳转到第一个有效路由
  useEffect(() => {
    const handleHashChange = () => {
      const route = normalizeHubRoute(window.location.hash)
      const enabledPluginIds = new Set(pluginSystem.getEnabledPlugins().map((p) => p.id))

      // 在博客内部（非 welcome），如果访问 home 则重定向到第一个有效路由
      if (route === 'home' && activeRoute !== 'home') {
        const target = firstRoute(blogRouteItems, enabledPluginIds)
        window.location.hash = target
        return
      }

      setActiveRoute(route)
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [activeRoute])

  useEffect(() => {
    const handleKeydown = (_event: globalThis.KeyboardEvent) => {
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [])

  useEffect(() => {
    if (loading) return
    const enabledPluginIds = new Set(pluginSystem.getEnabledPlugins().map((plugin) => plugin.id))
    window.__hubAvailableRoutes = allRouteItems
      .filter((route) => enabledPluginIds.has(route.pluginId))
      .map((route) => route.id)
  }, [loading])

  useEffect(() => {
    const openContact = () => setContactOpen(true)
    window.addEventListener('homepage:open-contact', openContact)
    return () => window.removeEventListener('homepage:open-contact', openContact)
  }, [])

  // 氛围音乐由用户手动在 Ambient Music 页面触发，不自动播放

  // 订阅音频引擎状态
  useEffect(() => {
    const engine = getAudioEngine()
    const unsub = engine.subscribe(setAmbientTracks)
    return unsub
  }, [])

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true)
    window.dispatchEvent(new Event('intro-complete'))
  }, [])

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
        {showInitialIntro && <VantaRings />}
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

  // === 欢迎页模式：Vanta Rings 背景 + Intro 动画 + 原首屏内容 ===
  if (isOnWelcome) {
    return (
      <Layout>
        {!isMobile && (
          <>
            <VantaRings />
            <VantaBirds />
          </>
        )}
        {siteConfig && motionConfig && (
          <IntroStage
            author={siteConfig.author}
            enabled={motionConfig.intro && !isMobile && !introComplete}
            duration={motionConfig.introDuration}
            onComplete={handleIntroComplete}
          />
        )}
        <main className={`page-shell home-page-shell mx-auto max-w-[1480px] px-6 pt-16 md:px-12 xl:px-16 ${introComplete ? 'page-ready' : ''}`} style={{ position: 'relative', zIndex: 1 }}>
          <ErrorBoundary>
            {profilePlugin ? (
              <profilePlugin.component config={profilePlugin.config} />
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
        <AdminLogin open={adminLoginOpen} onClose={() => setAdminLoginOpen(false)} onAuth={(token) => { setAdminToken(token); sessionStorage.setItem('hub:admin-token', token); window.dispatchEvent(new CustomEvent('admin-auth', { detail: { token } })); setShowAdmin(true) }} />

        {/* 管理员入口 — 右下角 */}
        <button
          type="button"
          onClick={() => setAdminLoginOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-surface/60 backdrop-blur-md border border-border-subtle flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 transition-all opacity-60 hover:opacity-100"
          aria-label="管理员"
          title="管理员"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-error text-white text-[9px] font-bold flex items-center justify-center shadow-lg">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </button>
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

  if (isMobile) {
    // === 移动端：浅色全宽内容 + 底部 TabBar ===
    return (
      <Layout routeMode>
        <MobileTabBar routes={availableRouteItems} activeRoute={activeRoute} />
        <main className="mx-auto min-h-[100dvh] w-full max-w-[760px] px-4 pb-24 pt-16">
          <ErrorBoundary key={activeRouteItem.id}>
            {activePlugin ? (
              <div className="surface-panel rounded-[28px] p-4 shadow-[0_24px_64px_-42px_var(--color-panel-shadow)]">
                <activePlugin.component config={activePlugin.config} />
              </div>
            ) : (
              <div className="surface-panel rounded-[28px] p-4 shadow-[0_24px_64px_-42px_var(--color-panel-shadow)]">
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
      </Layout>
    )
  }

  // === 桌面端：侧边栏 + 深色面板 ===
  return (
    <Layout routeMode>
      <Header
        config={siteConfig ?? undefined}
        activeSection={activeRoute}
        routes={availableRouteItems}
        ambientTracks={ambientTracks}
        simple
        onContactClick={() => setContactOpen(true)}
        onAmbientClick={() => { window.location.hash = '#/local-music' }}
      />
      <main className={`page-shell route-page-shell page-ready`}>
        <ErrorBoundary key={activeRouteItem.id}>
          {activePlugin ? (
            <div className="route-stage" aria-label={activeRouteItem.label}>
              <div className="route-frame">
                <div className="blog-layout">
                  <BlogSidebar routes={availableRouteItems} activeRoute={activeRoute} footerSlot={sidebarNowPlaying} />
                  <div className="blog-content scrollbar-none">
                    <activePlugin.component config={activePlugin.config} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <section className="route-stage" aria-label={activeRouteItem.label}>
              <div className="route-frame">
                <div className="blog-layout">
                  <BlogSidebar routes={availableRouteItems} activeRoute={activeRoute} footerSlot={sidebarNowPlaying} />
                  <div className="blog-content scrollbar-none">
                    <div className="surface-panel rounded-2xl p-lg">
                      <span className="font-label-mono text-xs uppercase text-secondary">当前不可用</span>
                      <h1 className="mt-1 font-headline-md text-headline-md text-on-surface">模块不可用</h1>
                      <p className="mt-1 font-body-md text-body-md text-text-muted">
                        当前配置没有启用「{activeRouteItem.label}」模块。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </ErrorBoundary>
      </main>
      {commonDrawer}
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
