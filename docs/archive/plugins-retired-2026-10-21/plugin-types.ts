/**
 * 已归档插件的类型定义（2026-10-21 从 src/core/types.ts 移出）。
 *
 * 这 11 个类型对应 11 个零引用、已归档的插件目录：
 *   analytics / blog / comments / downloads / navigation / projects /
 *   social / stats / timeline / tools / workflow-deck
 *
 * 它们不在 tsconfig 的 include 里，也不被任何代码 import —— 原样保存，
 * 是为了将来恢复某个插件时能直接拿回类型，不用翻 git 历史。
 *
 * 恢复方式：把对应类型拷回 src/core/types.ts，并把插件目录从
 * docs/archive/plugins-retired-2026-10-21/ 移回 src/plugins/。
 */

export interface AnalyticsConfig {
  totalVisitors: number
  todayVisitors: number
  weeklyVisitors: number
}

export interface BlogPost {
  id: string
  url: string
  date: string
  title: string
  summary: string
  tags?: string[]
}

export interface CommentItem {
  id: string
  author: string
  content: string
  date: string
  avatar?: string
}

export interface DownloadItem {
  id: string
  name: string
  type: string
  description: string
  downloads: number
  url: string
  icon?: string
}

export interface NavigationItem {
  id: string
  title: string
  url: string
  description?: string
  icon?: string
  category?: string
}

export interface ProjectItem {
  id: string
  name: string
  description: string
  githubUrl?: string
  demoUrl?: string
}

export interface SocialLink {
  id: string
  platform: string
  url: string
  icon: string
}

export interface StatsConfig {
  githubRepos: number
  githubContributions: number
  languages?: { name: string; percentage: number; color: string }[]
}

export interface TimelineItem {
  id: string
  type: string
  date: string
  title: string
  description: string
  icon?: string
}

export interface ToolItem {
  id: string
  name: string
  category: string
  url: string
  description?: string
  icon?: string
  favorite?: boolean
}

export interface WorkflowAction {
  id: string
  type: string
  label: string
  tool?: string
  value?: string
  target?: string
}

export interface WorkflowItem {
  id: string
  title: string
  description?: string
  icon?: string
  category?: string
  enabled?: boolean
  actions: WorkflowAction[]
}
