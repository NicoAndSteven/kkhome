import { defaultAppConfig, getDefaultPluginConfigs, parseAppConfig, parsePluginConfigs } from './configSchema'
import { AppConfig, PluginConfig, SiteConfig } from './types'

/**
 * 配置加载器
 * 负责加载和验证配置文件
 */
class ConfigLoader {
  private appConfig: AppConfig | null = null
  private siteConfig: SiteConfig | null = null
  private pluginConfigs: PluginConfig[] = []

  async loadAppConfig(): Promise<AppConfig> {
    try {
      const response = await fetch('/config/site.config.json')
      if (!response.ok) {
        throw new Error('Failed to load site config')
      }

      const data = await response.json() as unknown
      const appConfig = parseAppConfig(data)
      this.appConfig = appConfig
      this.siteConfig = appConfig.site
      return appConfig
    } catch (error) {
      console.error('Error loading app config:', error)
      const appConfig = defaultAppConfig
      this.appConfig = appConfig
      this.siteConfig = appConfig.site
      return appConfig
    }
  }

  /**
   * 加载站点配置
   */
  async loadSiteConfig(): Promise<SiteConfig> {
    const appConfig = await this.loadAppConfig()
    return appConfig.site
  }

  /**
   * 加载插件配置
   */
  async loadPluginConfigs(): Promise<PluginConfig[]> {
    try {
      const response = await fetch('/config/plugins.config.json')
      if (!response.ok) {
        throw new Error('Failed to load plugin configs')
      }
      const data = await response.json() as unknown
      this.pluginConfigs = parsePluginConfigs(data)
      return this.pluginConfigs
    } catch (error) {
      console.error('Error loading plugin configs:', error)
      // 返回默认配置
      return getDefaultPluginConfigs()
    }
  }

  /**
   * 获取站点配置
   */
  getSiteConfig(): SiteConfig | null {
    return this.siteConfig
  }

  getAppConfig(): AppConfig | null {
    return this.appConfig
  }

  /**
   * 获取插件配置
   */
  getPluginConfigs(): PluginConfig[] {
    return this.pluginConfigs
  }

  /**
   * 验证配置
   */
  validateConfig(config: unknown): boolean {
    return Boolean(config) && typeof config === 'object' && !Array.isArray(config)
  }
}

// 导出单例实例
export const configLoader = new ConfigLoader()
