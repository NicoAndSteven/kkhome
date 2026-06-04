import type React from 'react'

export type PluginRuntimeConfig = Record<string, unknown>

/**
 * 插件接口定义
 */
export interface Plugin {
  id: string
  name: string
  version: string
  enabled: boolean
  order: number
  component: React.ComponentType<{ config?: PluginRuntimeConfig }>
  config?: PluginRuntimeConfig
}

/**
 * 插件配置
 */
export interface PluginConfig {
  id: string
  enabled: boolean
  order: number
  config?: PluginRuntimeConfig
}

/**
 * 站点配置
 */
export interface SiteConfig {
  title: string
  description: string
  author: string
  theme: 'light' | 'dark' | 'auto'
}

export interface MotionConfig {
  intro: boolean
  introDuration: number
}

export interface AppConfig {
  site: SiteConfig
  profile: ProfileConfig
  motion: MotionConfig
}

/**
 * 个人信息配置
 */
export interface ProfileConfig {
  avatar: string
  name: string
  title: string
  bio: string
  skills: string[]
  location?: string
  email?: string
}

/**
 * 导航项配置
 */
export interface NavigationItem {
  id: string
  title: string
  url: string
  icon?: string
  category?: string
  description?: string
}

/**
 * 工具项配置
 */
export interface ToolItem {
  id: string
  name: string
  url: string
  icon?: string
  category: string
  description: string
  tags?: string[]
  favorite?: boolean
}

export type HubItemType = 'link' | 'tool' | 'prompt' | 'snippet' | 'feed' | 'integration'

export interface HubItem {
  id: string
  title: string
  type: HubItemType
  category: string
  enabled?: boolean
  description?: string
  tags?: string[]
  aliases?: string[]
  icon?: string
  favorite?: boolean
}

export interface ResourceItem extends HubItem {
  type: 'link'
  url: string
  openIn?: 'same-tab' | 'new-tab'
  local?: boolean
}

export interface UtilityItem extends HubItem {
  type: 'tool'
  mode: 'inline' | 'external'
  utilityType?: 'json-format' | 'base64' | 'url-codec' | 'timestamp' | 'uuid'
  url?: string
}

export interface SnippetItem extends HubItem {
  type: 'prompt' | 'snippet'
  content: string
  language?: string
  copyLabel?: string
}

export interface SearchTarget {
  id: string
  title: string
  urlTemplate: string
  icon?: string
}

export interface ScratchpadItem {
  id: string
  type: 'text' | 'link' | 'prompt' | 'code' | 'json' | 'markdown'
  content: string
  title?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

/**
 * 社交链接配置
 */
export interface SocialLink {
  id: string
  platform: string
  url: string
  icon: string
}

/**
 * 主题类型
 */
export type Theme = 'light' | 'dark'

/**
 * 插件系统状态
 */
export interface PluginSystemState {
  plugins: Plugin[]
  loaded: boolean
  error: string | null
}

// Projects Plugin
export interface ProjectItem {
  id: string
  name: string
  description: string
  techStack: string[]
  githubUrl?: string
  demoUrl?: string
  imageUrl?: string
}

// Timeline Plugin
export interface TimelineItem {
  id: string
  date: string
  title: string
  description: string
  icon?: string
  type: 'education' | 'work' | 'achievement'
}

// Blog Plugin
export interface BlogPost {
  id: string
  title: string
  summary: string
  date: string
  url: string
  tags?: string[]
}

// Stats Plugin
export interface StatsConfig {
  githubRepos: number
  githubContributions: number
  languages: { name: string; percentage: number; color: string }[]
}

// Analytics Plugin
export interface AnalyticsConfig {
  totalVisitors: number
  todayVisitors: number
  weeklyVisitors: number
}

// Comments Plugin
export interface CommentItem {
  id: string
  author: string
  content: string
  date: string
  avatar?: string
}

// Downloads Plugin
export interface DownloadItem {
  id: string
  name: string
  description: string
  type: string
  url: string
  downloads: number
  icon?: string
}
