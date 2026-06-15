import { useCallback, useState, useEffect, useRef } from 'react'
import { pluginSystem, configLoader } from '@core'
import { plugins } from '@plugins'
import { Layout, IntroStage, ContactDrawer, ErrorBoundary, Loading, BlogSidebar, VantaRings, VantaBirds } from '@components'
import { MotionConfig, ProfileConfig, SiteConfig } from '@core/types'
import { HubRouteId, normalizeHubRoute } from '@core/routeBridge'
import { getAudioEngine, TrackState } from '@plugins/ambient-music/AudioEngine'
import { TRACKS, synthesizeTrack } from '@plugins/ambient-music/tracks'
import MiniPlayer from '@plugins/ambient-music/MiniPlayer'

/** 所有路由定义（含 welcome） */
const allRouteItems: Array<{ id: HubRouteId; label: string; href: string; pluginId: string }> = [
  { id: 'home', label: '首页', href: '#/home', pluginId: 'profile' },
  { id: 'ai-tools', label: '导向', href: '#/ai-tools', pluginId: 'ai-navigator' },
  { id: 'wish-wall', label: '许愿', href: '#/wish-wall', pluginId: 'wish-wall' },
  { id: 'cloudflare-lab', label: '边缘', href: '#/cloudflare-lab', pluginId: 'cloudflare-lab' },
  { id: 'news', label: '新闻', href: '#/news', pluginId: 'news' },
  { id: 'stock-watch', label: '看盘', href: '#/stock-watch', pluginId: 'stock-watch' },
  { id: 'food', label: '吃啥', href: '#/food', pluginId: 'food' },
  { id: 'ambient-music', label: '氛围', href: '#/ambient-music', pluginId: 'ambient-music' },
  { id: 'gallery', label: '画廊', href: '#/gallery', pluginId: 'gallery' },
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
  const [activeRoute, setActiveRoute] = useState<HubRouteId>(() => normalizeHubRoute(window.location.hash))
  const [contactOpen, setContactOpen] = useState(false)
  const [ambientTracks, setAmbientTracks] = useState<TrackState[]>([])
  const ambientInitialized = useRef(false)

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

  // 全局交互触发氛围音乐
  useEffect(() => {
    if (globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (ambientInitialized.current) return

    const engine = getAudioEngine()

    const startAmbient = async () => {
      if (ambientInitialized.current) return
      ambientInitialized.current = true

      const ctx = new globalThis.AudioContext()
      await Promise.all(
        TRACKS.map(async (track) => {
          const buffer = await synthesizeTrack(ctx, track.id)
          engine.registerTrack(track.id, buffer, 0.35)
        })
      )
      ctx.close()

      const hasPlayed = globalThis.sessionStorage.getItem('hub:ambient-played')
      if (!hasPlayed) {
        await engine.play('rain')
        globalThis.sessionStorage.setItem('hub:ambient-played', '1')
      }
    }

    document.addEventListener('click', startAmbient, { once: true })
    document.addEventListener('keydown', startAmbient, { once: true })
    document.addEventListener('touchstart', startAmbient, { once: true })

    return () => {
      document.removeEventListener('click', startAmbient)
      document.removeEventListener('keydown', startAmbient)
      document.removeEventListener('touchstart', startAmbient)
    }
  }, [])

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
        <Loading />
      </Layout>
    )
  }

  const enabledPlugins = pluginSystem.getEnabledPlugins()
  const enabledPluginIds = new Set(enabledPlugins.map((plugin) => plugin.id))
  const isOnWelcome = activeRoute === 'home'
  const profilePlugin = enabledPlugins.find((plugin) => plugin.id === 'profile')

  // === 欢迎页模式：Vanta Rings 背景 + Intro 动画 + 原首屏内容 ===
  if (isOnWelcome) {
    return (
      <Layout>
        <VantaRings />
        <VantaBirds />
        {siteConfig && motionConfig && (
          <IntroStage
            author={siteConfig.author}
            enabled={motionConfig.intro}
            duration={motionConfig.introDuration}
            onComplete={handleIntroComplete}
          />
        )}
        <main className={`page-shell home-page-shell mx-auto max-w-[1480px] pt-14 px-6 md:px-12 xl:px-16 ${introComplete ? 'page-ready' : ''}`}>
          <ErrorBoundary>
            {profilePlugin ? (
              <profilePlugin.component config={profilePlugin.config} />
            ) : (
              <div className="surface-panel rounded-lg p-lg">
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
      </Layout>
    )
  }

  // === 博客内部模式：Stitch 布局（侧边栏导航 + 主内容区） ===
  const availableRouteItems = blogRouteItems.filter((route) => enabledPluginIds.has(route.pluginId))
  const activeRouteItem = allRouteItems.find((route) => route.id === activeRoute)
    ?? blogRouteItems.find((route) => enabledPluginIds.has(route.pluginId))
    ?? blogRouteItems[0]
  const activePlugin = enabledPlugins.find((plugin) => plugin.id === activeRouteItem.pluginId)
  const activeLabel = activeRouteItem?.label ?? ''

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ backgroundColor: '#F5F9FC' }}>
      {/* Sidebar */}
      <BlogSidebar routes={availableRouteItems} activeRoute={activeRoute} />

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 relative overflow-y-auto">
        {/* Content Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <span className="font-label-mono text-text-muted uppercase tracking-widest text-xs">
              ROOT / {activeLabel.toUpperCase()} /
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface">{activeLabel}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="w-10 h-10 rounded-full bg-surface border border-border-subtle flex items-center justify-center hover:border-primary transition-colors"
              aria-label="打开联系抽屉"
            >
              <span className="text-text-muted hover:text-primary transition-colors text-lg">✉</span>
            </button>
          </div>
        </header>

        {/* Route Frame */}
        <section className="relative w-full rounded-3xl p-8 shadow-sm overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid #E0ECF5',
            minHeight: 'calc(100vh - 200px)',
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #4DD0C8, #64B5F6, #F06292)',
            zIndex: 10,
            pointerEvents: 'none',
          }} />
          <div className="pt-2">
            <ErrorBoundary key={activeRouteItem.id}>
              {activePlugin ? (
                <activePlugin.component config={activePlugin.config} />
              ) : (
                <div className="surface-panel rounded-lg p-lg">
                  <span className="font-label-mono text-xs uppercase text-secondary">Unavailable</span>
                  <h1 className="mt-xs font-headline-md text-headline-md text-on-surface">模块不可用</h1>
                  <p className="mt-xs font-body-md text-body-md text-text-muted">
                    当前配置没有启用「{activeLabel}」模块。
                  </p>
                </div>
              )}
            </ErrorBoundary>
          </div>
        </section>
      </main>

      <ContactDrawer
        open={contactOpen}
        profile={profileConfig ?? undefined}
        onClose={() => setContactOpen(false)}
      />

      <MiniPlayer
        tracks={ambientTracks}
        onToggleTrack={(id) => {
          const engine = getAudioEngine()
          const state = ambientTracks.find((t) => t.id === id)
          if (state?.playing) engine.stop(id)
          else engine.play(id)
        }}
        onVolumeChange={(id, vol) => getAudioEngine().setVolume(id, vol)}
        onOpenFull={() => { window.location.hash = '#/ambient-music' }}
      />
    </div>
  )
}

export default App
