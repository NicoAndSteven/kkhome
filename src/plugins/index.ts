import ProfilePlugin from './profile'
import AiNavigatorPlugin from './ai-navigator'
import WishWallPlugin from './wish-wall'
import CloudflareLabPlugin from './cloudflare-lab'
import NewsPlugin from './news'
import StockWatchPlugin from './stock-watch'
import FoodPlugin from './food'
import AmbientMusicPlugin from './ambient-music'
import GalleryPlugin from './gallery'
import LocalMusicPlugin from './local-music'
import UniversalInboxPlugin from './universal-inbox'
import QuickLaunchPlugin from './quick-launch'
import WorkbenchPlugin from './workbench'
import CollectionsPlugin from './collections'
import ScratchpadPlugin from './scratchpad'
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
    id: 'ai-navigator',
    name: '工具导航',
    version: '1.0.0',
    enabled: true,
    order: 2,
    component: AiNavigatorPlugin,
  },
  {
    id: 'wish-wall',
    name: '访客许愿墙',
    version: '1.0.0',
    enabled: true,
    order: 3,
    component: WishWallPlugin,
  },
  {
    id: 'cloudflare-lab',
    name: 'Cloudflare Lab',
    version: '1.0.0',
    enabled: true,
    order: 4,
    component: CloudflareLabPlugin,
  },
  {
    id: 'news',
    name: '新闻聚合',
    version: '1.0.0',
    enabled: true,
    order: 5,
    component: NewsPlugin,
  },
  {
    id: 'stock-watch',
    name: '股市看盘',
    version: '1.0.0',
    enabled: true,
    order: 6,
    component: StockWatchPlugin,
  },
  {
    id: 'food',
    name: '今天吃什么',
    version: '1.0.0',
    enabled: true,
    order: 7,
    component: FoodPlugin,
  },
  {
    id: 'ambient-music',
    name: '氛围音乐',
    version: '1.0.0',
    enabled: true,
    order: 8,
    component: AmbientMusicPlugin,
  },
  {
    id: 'gallery',
    name: '视觉画廊',
    version: '1.0.0',
    enabled: true,
    order: 9,
    component: GalleryPlugin,
  },
  {
    id: 'local-music',
    name: '本地音乐',
    version: '1.0.0',
    enabled: true,
    order: 10,
    component: LocalMusicPlugin,
  },
  {
    id: 'universal-inbox',
    name: '万能投入口',
    version: '1.0.0',
    enabled: false,
    order: 8,
    component: UniversalInboxPlugin,
  },
  {
    id: 'quick-launch',
    name: '快速启动',
    version: '1.0.0',
    enabled: false,
    order: 9,
    component: QuickLaunchPlugin,
  },
  {
    id: 'workbench',
    name: '工作台',
    version: '1.0.0',
    enabled: false,
    order: 10,
    component: WorkbenchPlugin,
  },
  {
    id: 'collections',
    name: '资源收藏',
    version: '1.0.0',
    enabled: false,
    order: 11,
    component: CollectionsPlugin,
  },
  {
    id: 'scratchpad',
    name: '临时收纳',
    version: '1.0.0',
    enabled: false,
    order: 12,
    component: ScratchpadPlugin,
  },
]

export {
  ProfilePlugin,
  UniversalInboxPlugin,
  QuickLaunchPlugin,
  WorkbenchPlugin,
  CollectionsPlugin,
  ScratchpadPlugin,
  AiNavigatorPlugin,
  WishWallPlugin,
  CloudflareLabPlugin,
  NewsPlugin,
  StockWatchPlugin,
  FoodPlugin,
  AmbientMusicPlugin,
  GalleryPlugin,
  LocalMusicPlugin,
}
