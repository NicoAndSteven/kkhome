import { z } from 'zod'
import { AppConfig, MotionConfig, PluginConfig, ProfileConfig, SiteConfig } from './types'

export const defaultSiteConfig: SiteConfig = {
  title: '垣钰 | Personal Hub',
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

const hubItemBaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  enabled: z.boolean().optional(),
  description: z.string().optional(),
  tags: z.array(z.string().min(1)).optional(),
  aliases: z.array(z.string().min(1)).optional(),
  icon: z.string().optional(),
  favorite: z.boolean().optional(),
})

const resourceItemSchema = hubItemBaseSchema.extend({
  type: z.literal('link'),
  url: z.string().min(1),
  openIn: z.enum(['same-tab', 'new-tab']).optional(),
  local: z.boolean().optional(),
})

const utilityItemSchema = hubItemBaseSchema.extend({
  type: z.literal('tool'),
  mode: z.enum(['inline', 'external']),
  utilityType: z.enum(['json-format', 'base64', 'url-codec', 'timestamp', 'uuid']).optional(),
  url: z.string().min(1).optional(),
})

const snippetItemSchema = hubItemBaseSchema.extend({
  type: z.enum(['prompt', 'snippet']),
  content: z.string().min(1),
  language: z.string().optional(),
  copyLabel: z.string().optional(),
})

const searchTargetSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  urlTemplate: z.string().min(1),
  icon: z.string().optional(),
})

const capsuleTriggerSchema = z.enum(['url', 'json', 'timestamp', 'base64', 'command', 'prompt', 'text'])

const hashTargetSchema = z.string().regex(/^#[A-Za-z][\w-]*$/)

const selectToolActionSchema = z.object({
  type: z.literal('select-tool'),
  label: z.string().min(1),
  tool: z.enum(['json-format', 'base64', 'url-codec', 'timestamp', 'uuid']),
  target: hashTargetSchema.optional(),
  value: z.string().optional(),
})

const addScratchpadActionSchema = z.object({
  type: z.literal('add-scratchpad'),
  label: z.string().min(1),
  value: z.string().optional(),
  target: hashTargetSchema.optional(),
})

const copyActionSchema = z.object({
  type: z.literal('copy'),
  label: z.string().min(1),
  value: z.string().optional(),
})

const jumpActionSchema = z.object({
  type: z.literal('jump'),
  label: z.string().min(1),
  target: hashTargetSchema,
})

const capsuleActionSchema = z.discriminatedUnion('type', [
  selectToolActionSchema,
  addScratchpadActionSchema,
  copyActionSchema,
  jumpActionSchema,
])

const capsuleItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  triggers: z.array(capsuleTriggerSchema).min(1),
  action: capsuleActionSchema,
  enabled: z.boolean().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
})

const universalInboxConfigSchema = z.object({
  capsules: z.array(capsuleItemSchema).catch([]).default([]),
})

const quickLaunchConfigSchema = z.object({
  resources: z.array(resourceItemSchema).catch([]).default([]),
  utilities: z.array(utilityItemSchema).catch([]).default([]),
  snippets: z.array(snippetItemSchema).catch([]).default([]),
  searchTargets: z.array(searchTargetSchema).catch([]).default([]),
})

const workbenchConfigSchema = z.object({
  utilities: z.array(utilityItemSchema).catch([]).default([]),
  maxVisible: z.number().int().positive().optional(),
})

const collectionsConfigSchema = z.object({
  resources: z.array(resourceItemSchema).catch([]).default([]),
  snippets: z.array(snippetItemSchema).catch([]).default([]),
})

const scratchpadConfigSchema = z.object({
  storageKey: z.string().min(1).catch('kkhome:scratchpad').default('kkhome:scratchpad'),
})

const aiCategorySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
})

const aiToolSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  url: z.string().min(1),
  description: z.string().min(1),
  tags: z.array(z.string().min(1)).optional(),
  aliases: z.array(z.string().min(1)).optional(),
  icon: z.string().optional(),
  featured: z.boolean().optional(),
  sourceTitle: z.string().optional(),
  sourceUrl: z.string().optional(),
  sourceCategory: z.string().optional(),
})

const aiNavigatorConfigSchema = z.object({
  categories: z.array(aiCategorySchema).catch([]).default([]),
  intentPrompts: z.array(z.string().min(1)).catch([]).default([]),
  tools: z.array(aiToolSchema).catch([]).default([]),
})

const wishCategorySchema = z.enum(['feature', 'tool', 'content', 'design', 'other'])
const wishStatusSchema = z.enum(['new', 'accepted', 'building', 'shipped'])

const wishItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  detail: z.string().optional(),
  category: wishCategorySchema.catch('other'),
  author: z.string().optional(),
  status: wishStatusSchema.catch('new'),
  createdAt: z.string().min(1),
})

const wishWallConfigSchema = z.object({
  seedWishes: z.array(wishItemSchema).optional().catch(undefined),
})

const cloudflareLabConfigSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
})

const newsConfigSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  defaultCountry: z.string().min(1).optional(),
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
    config: parsePluginRuntimeConfig(plugin.id, plugin.config),
  }))
}

const parsePluginRuntimeConfig = (id: string, config: unknown): Record<string, unknown> | undefined => {
  const parsers: Record<string, z.ZodType<Record<string, unknown>>> = {
    'universal-inbox': universalInboxConfigSchema,
    'quick-launch': quickLaunchConfigSchema,
    workbench: workbenchConfigSchema,
    collections: collectionsConfigSchema,
    scratchpad: scratchpadConfigSchema,
    'ai-navigator': aiNavigatorConfigSchema,
    'wish-wall': wishWallConfigSchema,
    'cloudflare-lab': cloudflareLabConfigSchema,
    news: newsConfigSchema,
  }
  const parser = parsers[id]

  if (!parser) {
    return config && typeof config === 'object' && !Array.isArray(config)
      ? config as Record<string, unknown>
      : undefined
  }

  const result = parser.safeParse(config ?? {})
  return result.success ? result.data : undefined
}

export const getDefaultPluginConfigs = (): PluginConfig[] => [
  { id: 'profile', enabled: true, order: 1 },
  { id: 'wish-wall', enabled: true, order: 2 },
  { id: 'ai-navigator', enabled: true, order: 3 },
  { id: 'cloudflare-lab', enabled: true, order: 4 },
  { id: 'news', enabled: true, order: 5 },
  { id: 'universal-inbox', enabled: false, order: 6 },
  { id: 'collections', enabled: false, order: 6 },
  { id: 'quick-launch', enabled: false, order: 7 },
  { id: 'workbench', enabled: false, order: 8 },
  { id: 'scratchpad', enabled: false, order: 9 },
]
