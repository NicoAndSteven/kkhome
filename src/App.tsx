import { useCallback, useState, useEffect } from 'react'
import { pluginSystem, configLoader } from '@core'
import { plugins } from '@plugins'
import { Layout, Header, Footer, IntroStage, ProgressRail, ContactDrawer, ErrorBoundary, Loading } from '@components'
import { MotionConfig, ProfileConfig, SiteConfig, Plugin } from '@core/types'

const pageSections = [
  { id: 'top', label: '首页' },
  { id: 'projects', label: '案例' },
  { id: 'inbox', label: '投喂' },
  { id: 'launch', label: '启动' },
  { id: 'workbench', label: '工具' },
  { id: 'workflows', label: '工作流' },
  { id: 'collections', label: '收藏' },
  { id: 'scratchpad', label: '收纳' },
]

function App() {
  const [loading, setLoading] = useState(true)
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null)
  const [profileConfig, setProfileConfig] = useState<ProfileConfig | null>(null)
  const [motionConfig, setMotionConfig] = useState<MotionConfig | null>(null)
  const [introComplete, setIntroComplete] = useState(false)
  const [activeSection, setActiveSection] = useState('top')
  const [contactOpen, setContactOpen] = useState(false)

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
    if (loading) return

    const observer = new IntersectionObserver((entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

      if (visibleEntry?.target.id) {
        setActiveSection(visibleEntry.target.id)
      }
    }, {
      rootMargin: '-28% 0px -55% 0px',
      threshold: [0.15, 0.35, 0.6],
    })

    pageSections.forEach((section) => {
      const element = document.getElementById(section.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [loading])

  useEffect(() => {
    const openContact = () => setContactOpen(true)
    window.addEventListener('homepage:open-contact', openContact)
    return () => window.removeEventListener('homepage:open-contact', openContact)
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
  }, [loading])

  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    )
  }

  const enabledPlugins = pluginSystem.getEnabledPlugins()

  return (
    <Layout>
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
        activeSection={activeSection}
        onContactClick={() => setContactOpen(true)}
      />
      <ProgressRail activeSection={activeSection} sections={pageSections} />

      <main className={`page-shell pt-20 pb-xl space-y-xl px-6 md:px-12 ${introComplete ? 'page-ready' : ''}`}>
        {enabledPlugins.map((plugin: Plugin) => (
          <ErrorBoundary key={plugin.id}>
            <plugin.component config={plugin.config} />
          </ErrorBoundary>
        ))}
      </main>

      <Footer config={siteConfig ?? undefined} />
      <ContactDrawer
        open={contactOpen}
        profile={profileConfig ?? undefined}
        onClose={() => setContactOpen(false)}
      />
    </Layout>
  )
}

export default App
