import { useCallback, useState, useEffect, useRef } from 'react'
import { pluginSystem, configLoader } from '@core'
import { plugins } from '@plugins'
import { Layout, Header, IntroStage, ContactDrawer, ErrorBoundary, Loading } from '@components'
import { MotionConfig, ProfileConfig, SiteConfig } from '@core/types'
import { HubRouteId, normalizeHubRoute, routeHash } from '@core/routeBridge'
import { getAudioEngine, TrackState } from '@plugins/ambient-music/AudioEngine'
import { TRACKS, synthesizeTrack } from '@plugins/ambient-music/tracks'
import MiniPlayer from '@plugins/ambient-music/MiniPlayer'

const routeItems: Array<{ id: HubRouteId; label: string; href: string; pluginId: string }> = [
  { id: 'home', label: '首页', href: routeHash('home'), pluginId: 'profile' },
  { id: 'ai-tools', label: '导向', href: routeHash('ai-tools'), pluginId: 'ai-navigator' },
  { id: 'wish-wall', label: '许愿', href: routeHash('wish-wall'), pluginId: 'wish-wall' },
  { id: 'cloudflare-lab', label: '边缘', href: routeHash('cloudflare-lab'), pluginId: 'cloudflare-lab' },
  { id: 'news', label: '新闻', href: routeHash('news'), pluginId: 'news' },
  { id: 'stock-watch', label: '看盘', href: routeHash('stock-watch'), pluginId: 'stock-watch' },
  { id: 'food', label: '吃啥', href: routeHash('food'), pluginId: 'food' },
  { id: 'ambient-music', label: '氛围', href: routeHash('ambient-music'), pluginId: 'ambient-music' },
  { id: 'gallery', label: '画廊', href: routeHash('gallery'), pluginId: 'gallery' },
  { id: 'inbox', label: '投喂', href: routeHash('inbox'), pluginId: 'universal-inbox' },
  { id: 'launch', label: '启动', href: routeHash('launch'), pluginId: 'quick-launch' },
  { id: 'workbench', label: '工作台', href: routeHash('workbench'), pluginId: 'workbench' },
  { id: 'collections', label: '收藏', href: routeHash('collections'), pluginId: 'collections' },
  { id: 'scratchpad', label: '暂存', href: routeHash('scratchpad'), pluginId: 'scratchpad' },
]

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

        // 注册所有插件
        pluginSystem.registerAll(plugins)

        // 加载配置
        const [appCfg, pluginCfgs] = await Promise.all([
          configLoader.loadAppConfig(),
          configLoader.loadPluginConfigs(),
        ])

        setSiteConfig(appCfg.site)
        setProfileConfig(appCfg.profile)
        setMotionConfig(appCfg.motion)

        // 应用插件配置
        pluginSystem.applyConfigs(
          pluginCfgs.map((pluginCfg) => (
            pluginCfg.id === 'profile'
              ? {
                  ...pluginCfg,
                  config: {
                    ...appCfg.profile,
                    ...pluginCfg.config,
                  },
                }
              : pluginCfg
          )),
        )

        // 初始化插件系统
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

  useEffect(() => {
    const handleHashChange = () => {
      setActiveRoute(normalizeHubRoute(window.location.hash))
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    if (loading) return

    const enabledPluginIds = new Set(pluginSystem.getEnabledPlugins().map((plugin) => plugin.id))
    window.__hubAvailableRoutes = routeItems
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

      // 初始化音轨 AudioBuffer
      const ctx = new globalThis.AudioContext()
      await Promise.all(
        TRACKS.map(async (track) => {
          const buffer = await synthesizeTrack(ctx, track.id)
          engine.registerTrack(track.id, buffer, 0.35)
        })
      )
      ctx.close()

      // 默认播放第一个音轨（雨声）
      const hasPlayed = globalThis.sessionStorage.getItem('hub:ambient-played')
      if (!hasPlayed) {
        await engine.play('rain')
        globalThis.sessionStorage.setItem('hub:ambient-played', '1')
      }
    }

    // 监听首次用户交互
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
  }, [])

  // Reveal 动画 - 使用 IntersectionObserver 观察元素进入视口
  useEffect(() => {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
    }

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active')
        }
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
  const availableRouteItems = routeItems.filter((route) => enabledPluginIds.has(route.pluginId))
  const activeRouteItem = routeItems.find((route) => route.id === activeRoute) ?? routeItems[0]
  const activePlugin = enabledPlugins.find((plugin) => plugin.id === activeRouteItem.pluginId)
  const isHomeRoute = activeRouteItem.id === 'home'
  const mainClassName = isHomeRoute
    ? `page-shell home-page-shell mx-auto max-w-[1480px] pt-14 px-6 md:px-12 xl:px-16 ${introComplete ? 'page-ready' : ''}`
    : `page-shell route-page-shell ${introComplete ? 'page-ready' : ''}`

  return (
    <Layout routeMode={!isHomeRoute}>
      {siteConfig && motionConfig && (
        <IntroStage
          author={siteConfig.author}
          enabled={motionConfig.intro}
          duration={motionConfig.introDuration}
          onComplete={handleIntroComplete}
        />
      )}
      <Header
        config={siteConfig ?? undefined}
        activeSection={activeRoute}
        routes={availableRouteItems}
        ambientTracks={ambientTracks}
        onContactClick={() => setContactOpen(true)}
        onAmbientClick={() => { window.location.hash = '#/ambient-music' }}
      />
      <main className={mainClassName}>
        <ErrorBoundary key={activeRouteItem.id}>
          {activePlugin ? (
            isHomeRoute ? (
              <activePlugin.component config={activePlugin.config} />
            ) : (
              <div className="route-stage" aria-label={activeRouteItem.label}>
                <div className="route-frame">
                  <activePlugin.component config={activePlugin.config} />
                </div>
              </div>
            )
          ) : (
            <section className="route-stage" aria-label={activeRouteItem.label}>
              <div className="route-frame">
                <div className="surface-panel rounded-[2px] p-lg">
                  <span className="font-label-mono text-xs uppercase text-secondary">Unavailable</span>
                  <h1 className="mt-xs font-headline-md text-headline-md text-on-surface">模块不可用</h1>
                  <p className="mt-xs font-body-md text-body-md text-text-muted">
                    当前配置没有启用「{activeRouteItem.label}」模块。
                  </p>
                </div>
              </div>
            </section>
          )}
        </ErrorBoundary>
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
    </Layout>
  )
}

export default App
