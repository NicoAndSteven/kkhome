import ProfilePlugin from './profile'
import AiNavigatorPlugin from './ai-navigator'
import WishWallPlugin from './wish-wall'
import CloudflareLabPlugin from './cloudflare-lab'
import StockWatchPlugin from './stock-watch'
import FoodPlugin from './food'
import PartyGamesPlugin from './party-games'
import LocalMusicPlugin from './local-music'
import UniversalInboxPlugin from './universal-inbox'
import QuickLaunchPlugin from './quick-launch'
import WorkbenchPlugin from './workbench'
import CollectionsPlugin from './collections'
import ScratchpadPlugin from './scratchpad'
import { Plugin } from '@core/types'

/**
 * 插件注册表
 *
 * 约定（2026-10-21 收敛后）：
 * - 这里每一条都必须满足「已注册 + 已配置 + 有可达路由 + 有 e2e 断言」三者齐备，
 *   否则访问该路由会落到 OFFLINE 面板。半成品不要放进来。
 * - `ambient-music` 不在本表：它是音频引擎（首页雨声 + dock 播放器），
 *   由 App.tsx 直接 import，不承担路由。把它当插件注册只会让「插件数 ≠ 可见页数」。
 * - 已退役的 13 个插件目录在 `docs/archive/plugins-retired-2026-10-21/`，
 *   恢复方式是移回 src/plugins 并重新走一遍上面的四条验收。
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
    id: 'stock-watch',
    name: '股市看盘',
    version: '1.0.0',
    enabled: true,
    order: 5,
    component: StockWatchPlugin,
  },
  {
    id: 'food',
    name: '今天吃什么',
    version: '1.0.0',
    enabled: true,
    order: 6,
    component: FoodPlugin,
  },
  {
    id: 'party-games',
    name: '聚会游戏',
    version: '1.0.0',
    enabled: true,
    order: 7,
    component: PartyGamesPlugin,
  },
  {
    id: 'local-music',
    name: '本地音乐',
    version: '1.0.0',
    enabled: true,
    order: 8,
    component: LocalMusicPlugin,
  },
  {
    id: 'universal-inbox',
    name: '万能投入口',
    version: '1.0.0',
    enabled: false,
    order: 9,
    component: UniversalInboxPlugin,
  },
  {
    id: 'quick-launch',
    name: '快速启动',
    version: '1.0.0',
    enabled: false,
    order: 10,
    component: QuickLaunchPlugin,
  },
  {
    id: 'workbench',
    name: '工作台',
    version: '1.0.0',
    enabled: false,
    order: 11,
    component: WorkbenchPlugin,
  },
  {
    id: 'collections',
    name: '资源收藏',
    version: '1.0.0',
    enabled: false,
    order: 12,
    component: CollectionsPlugin,
  },
  {
    id: 'scratchpad',
    name: '临时收纳',
    version: '1.0.0',
    enabled: false,
    order: 13,
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
  StockWatchPlugin,
  FoodPlugin,
  PartyGamesPlugin,
  LocalMusicPlugin,
}
