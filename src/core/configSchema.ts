import { z } from 'zod'
import { AppConfig, MotionConfig, PluginConfig, ProfileConfig, SiteConfig } from './types'

export const defaultSiteConfig: SiteConfig = {
  title: '垣钰 | 个人主页',
  description: '全栈开发工程师',
  author: '垣钰',
  theme: 'dark',
}

export const defaultProfileConfig: ProfileConfig = {
  avatar: '/avatar.jpg',
  name: '垣钰',
  title: '全栈开发工程师',
  bio: '专注于现代 Web 技术开发，持续打磨可靠、清晰、可维护的数字产品。',
  skills: ['React', 'TypeScript', 'Node.js', 'Cloudflare'],
  location: '中国',
  email: '1215240348@qq.com',
}

export const defaultMotionConfig: MotionConfig = {
  intro: true,
  introDuration: 2400,
}

export const defaultAppConfig: AppConfig = {
  site: defaultSiteConfig,
  profile: defaultProfileConfig,
  motion: defaultMotionConfig,
}

const siteConfigSchema = z.object({
  title: z.string().min(1).catch(defaultSiteConfig.title),
  description: z.string().min(1).catch(defaultSiteConfig.description),
  author: z.string().min(1).catch(defaultSiteConfig.author),
  theme: z.enum(['light', 'dark', 'auto']).catch(defaultSiteConfig.theme),
})

const profileConfigSchema = z.object({
  avatar: z.string().min(1).catch(defaultProfileConfig.avatar),
  name: z.string().min(1).catch(defaultProfileConfig.name),
  title: z.string().min(1).catch(defaultProfileConfig.title),
  bio: z.string().min(1).catch(defaultProfileConfig.bio),
  skills: z.array(z.string().min(1)).catch(defaultProfileConfig.skills),
  location: z.string().optional().catch(defaultProfileConfig.location),
  email: z.string().email().optional().catch(defaultProfileConfig.email),
})

const appConfigSchema = z.object({
  site: siteConfigSchema.catch(defaultSiteConfig).default(defaultSiteConfig),
  profile: profileConfigSchema.catch(defaultProfileConfig).default(defaultProfileConfig),
  motion: z.object({
    intro: z.boolean().catch(defaultMotionConfig.intro),
    introDuration: z.number().int().min(800).max(3200).catch(defaultMotionConfig.introDuration),
  }).catch(defaultMotionConfig).default(defaultMotionConfig),
})

const pluginConfigSchema = z.object({
  id: z.string().min(1),
  enabled: z.boolean().default(true),
  order: z.number().int().nonnegative().default(0),
  config: z.record(z.string(), z.unknown()).optional(),
})

const pluginConfigListSchema = z.object({
  plugins: z.array(pluginConfigSchema).default([]),
})

export const parseAppConfig = (data: unknown): AppConfig => {
  const result = appConfigSchema.safeParse(data)
  return result.success ? result.data : defaultAppConfig
}

export const parsePluginConfigs = (data: unknown): PluginConfig[] => {
  const result = pluginConfigListSchema.safeParse(data)
  if (!result.success || result.data.plugins.length === 0) {
    return getDefaultPluginConfigs()
  }

  return result.data.plugins.map((plugin, index) => ({
    ...plugin,
    order: plugin.order || index + 1,
  }))
}

export const getDefaultPluginConfigs = (): PluginConfig[] => [
  { id: 'profile', enabled: true, order: 1 },
  { id: 'navigation', enabled: true, order: 2 },
  { id: 'tools', enabled: true, order: 3 },
  { id: 'social', enabled: true, order: 4 },
  { id: 'projects', enabled: true, order: 5 },
]
