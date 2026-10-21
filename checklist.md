# 验证清单

> 2026-10-21 重写。上一版勾了 `cloudflare-lab` 和 `news` 路由「可见」，
> 但当时 `ROUTE_ITEMS` 里根本没有这两条 —— 清单在描述一个不存在的站点。
> 现在只保留能对着代码核对的项。

## 自动验证（`npm run check`）

- [x] `npm run lint`（0 warning）
- [x] `npm run check:assets`
- [x] `npm run check:data`（基线 0/0）
- [x] `npm run test:unit`
- [x] `npm run build`
- [x] `npm run test:e2e`

## 路由（8 条，与 `ROUTE_ITEMS` 一一对应）

- [x] `home` 首页
- [x] `ai-tools` 导向
- [x] `wish-wall` 许愿
- [x] `cloudflare-lab` Cloudflare
- [x] `stock-watch` 看盘
- [x] `food` 吃啥
- [x] `party-games` 游戏
- [x] `local-music` 音乐
- [x] 冷藏路由（`#/workbench` 等 5 条）显示「模块不可用」，不静默跳转

## AI 工具导航（267 条 / 10 分类）

- [x] 配置可加载，Zod 校验通过
- [x] 分类过滤可用
- [x] 意图词搜索可用
- [x] 卡片展示工具自身域名与 `kind` 标记
- [x] 描述不含分类模板句
- [x] 标题不含域名派生
- [x] 在线小游戏只在 `fun` 分类
- [x] 同站多条目已合并或声明 `variantOf`

## 许愿墙

- [x] `/api/wishes` 可被 Playwright mock
- [x] GET 列表可渲染
- [x] POST 新愿望可渲染
- [x] API 不可用时降级为本地草稿
- [x] 绑定真实 D1：`wrangler.toml` 的 `WISHES_DB` 已配真实 database_id，
      迁移 001–009 已 apply（账本见 README「D1 迁移的账户」）
- [ ] 接入 Turnstile

## Cloudflare Lab

- [x] 插件已注册、配置已启用、路由已声明
- [x] API 不可用时显示本地功能开关视图
- [x] R2 已绑定：`wrangler.toml` 的 `MUSIC_BUCKET`，音乐库 songs/stream 接口在用
- [ ] KV `HUB_KV` 未绑定（`wrangler.toml` 里仍是注释占位）。
      feature flags 按设计降级读 `features.config.json`，不影响功能
- [ ] Vectorize / Queues / AI 未绑定——规划中的实验能力，
      按 spec「先过 feature flag 再启用」，不是缺陷
- 已知命名缺口：`/api/health` 检查的绑定名是 `HUB_BUCKET`，而 wrangler.toml 绑的是
  `MUSIC_BUCKET`，所以 lab 页的 fileArtifacts 永远显示 unavailable（规划项，非故障）

## 股市看盘

- [x] 自选股列表可渲染
- [x] API 不可用时显示降级提示
- [x] `/api/stock/*` 是真实上游代理（Yahoo Finance + 天天基金），
      无存储绑定需求；线上能否出网见下方人工验证

## 今天吃什么

- [x] 转盘交互可用
- [x] 中午 / 晚上时段自动切换
- [x] 菜单管理可用

## 待人工验证（需要线上环境或真实设备）

- [ ] Cloudflare Pages 部署成功
- [ ] `/api/health` 在线上能准确显示绑定状态
- [ ] 线上能出网：`/api/stock/*` 的 Yahoo Finance / 天天基金代理连通
- [ ] 移动端各页面不溢出
- [ ] Lighthouse 可访问性 90+
