import { Plugin, PluginConfig, PluginRuntimeConfig } from './types'

/**
 * 插件系统核心类
 * 管理插件的注册、加载和执行
 */
class PluginSystem {
  private plugins: Map<string, Plugin> = new Map()

  /**
   * 注册插件
   */
  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin ${plugin.id} is already registered. Skipping.`)
      return
    }
    this.plugins.set(plugin.id, plugin)
  }

  /**
   * 批量注册插件
   */
  registerAll(plugins: Plugin[]): void {
    plugins.forEach(plugin => this.register(plugin))
  }

  /**
   * 获取插件
   */
  getPlugin(id: string): Plugin | undefined {
    return this.plugins.get(id)
  }

  /**
   * 获取所有插件
   */
  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * 获取启用的插件（按顺序排序）
   */
  getEnabledPlugins(): Plugin[] {
    return this.getAllPlugins()
      .filter(plugin => plugin.enabled)
      .sort((a, b) => a.order - b.order)
  }

  /**
   * 启用插件
   */
  enablePlugin(id: string): void {
    const plugin = this.plugins.get(id)
    if (plugin) {
      plugin.enabled = true
    }
  }

  /**
   * 禁用插件
   */
  disablePlugin(id: string): void {
    const plugin = this.plugins.get(id)
    if (plugin) {
      plugin.enabled = false
    }
  }

  /**
   * 更新插件配置
   */
  updatePluginConfig(id: string, config: PluginRuntimeConfig): void {
    const plugin = this.plugins.get(id)
    if (plugin) {
      plugin.config = { ...plugin.config, ...config }
    }
  }

  /**
   * 应用插件配置
   */
  applyConfigs(configs: PluginConfig[]): void {
    configs.forEach(config => {
      const plugin = this.plugins.get(config.id)
      if (plugin) {
        plugin.enabled = config.enabled
        plugin.order = config.order
        if (config.config) {
          plugin.config = { ...plugin.config, ...config.config }
        }
      }
    })
  }

  /**
   * 初始化插件系统
   */
  async initialize(): Promise<void> {
    // PluginSystem is a registration hub — no initialization needed
  }

  reset(): void {
    this.plugins.clear()
  }
}

// 导出单例实例
export const pluginSystem = new PluginSystem()
