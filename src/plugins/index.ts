import ProfilePlugin from './profile'
import NavigationPlugin from './navigation'
import ToolsPlugin from './tools'
import SocialPlugin from './social'
import ProjectsPlugin from './projects'
import QuickLaunchPlugin from './quick-launch'
import WorkbenchPlugin from './workbench'
import CollectionsPlugin from './collections'
import ScratchpadPlugin from './scratchpad'
import TimelinePlugin from './timeline'
import BlogPlugin from './blog'
import StatsPlugin from './stats'
import AnalyticsPlugin from './analytics'
import CommentsPlugin from './comments'
import DownloadsPlugin from './downloads'
import { Plugin } from '@core/types'

/**
 * 插件注册表
 * 导出所有可用插件
 */
export const plugins: Plugin[] = [
  {
    id: 'profile',
    name: '个人介绍',
    version: '1.0.0',
    enabled: true,
    order: 1,
    component: ProfilePlugin,
  },
  {
    id: 'navigation',
    name: '快捷导航',
    version: '1.0.0',
    enabled: false,
    order: 2,
    component: NavigationPlugin,
  },
  {
    id: 'tools',
    name: '常用工具',
    version: '1.0.0',
    enabled: false,
    order: 3,
    component: ToolsPlugin,
  },
  {
    id: 'social',
    name: '社交链接',
    version: '1.0.0',
    enabled: false,
    order: 4,
    component: SocialPlugin,
  },
  {
    id: 'projects',
    name: '项目作品',
    version: '1.0.0',
    enabled: true,
    order: 5,
    component: ProjectsPlugin,
  },
  {
    id: 'quick-launch',
    name: '万能跳转',
    version: '1.0.0',
    enabled: true,
    order: 6,
    component: QuickLaunchPlugin,
  },
  {
    id: 'workbench',
    name: '工具收纳台',
    version: '1.0.0',
    enabled: true,
    order: 7,
    component: WorkbenchPlugin,
  },
  {
    id: 'collections',
    name: '分类收藏',
    version: '1.0.0',
    enabled: true,
    order: 8,
    component: CollectionsPlugin,
  },
  {
    id: 'scratchpad',
    name: '临时收纳',
    version: '1.0.0',
    enabled: true,
    order: 9,
    component: ScratchpadPlugin,
  },
  {
    id: 'timeline',
    name: '职业历程',
    version: '1.0.0',
    enabled: false,
    order: 6,
    component: TimelinePlugin,
  },
  {
    id: 'blog',
    name: '最新文章',
    version: '1.0.0',
    enabled: false,
    order: 7,
    component: BlogPlugin,
  },
  {
    id: 'stats',
    name: '数据统计',
    version: '1.0.0',
    enabled: false,
    order: 8,
    component: StatsPlugin,
  },
  {
    id: 'analytics',
    name: '访客统计',
    version: '1.0.0',
    enabled: false,
    order: 9,
    component: AnalyticsPlugin,
  },
  {
    id: 'comments',
    name: '留言板',
    version: '1.0.0',
    enabled: false,
    order: 10,
    component: CommentsPlugin,
  },
  {
    id: 'downloads',
    name: '资源下载',
    version: '1.0.0',
    enabled: false,
    order: 11,
    component: DownloadsPlugin,
  },
]

export {
  ProfilePlugin,
  NavigationPlugin,
  ToolsPlugin,
  SocialPlugin,
  ProjectsPlugin,
  QuickLaunchPlugin,
  WorkbenchPlugin,
  CollectionsPlugin,
  ScratchpadPlugin,
  TimelinePlugin,
  BlogPlugin,
  StatsPlugin,
  AnalyticsPlugin,
  CommentsPlugin,
  DownloadsPlugin,
}
