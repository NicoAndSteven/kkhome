# 任务清单

## 当前主线

- [x] 收敛产品定位为个人 Hub：核心是工具导航与许愿墙，另有看盘 / 吃啥 / 游戏 / 音乐。
- [x] 默认路由固定为 `home / ai-tools / wish-wall / cloudflare-lab`。
- [x] 注册已有插件，默认只启用当前核心模块。
- [x] 为 `ai-navigator` 和 `wish-wall` 补配置 schema。
- [x] 为 AI 工具导航增加轻量搜索评分。
- [x] 为 AI 工具卡片展示工具域名。
- [x] 增加 AI 工具数据质量检查脚本。
- [x] 将 `npm run check:data` 纳入综合质量门禁。
- [x] 为 Wish Wall API 增加蜜罐、链接数量限制和服务端提交频控。
- [x] 为 D1 migration 增加提交频控表。
- [x] 更新 README 与当前 spec。
- [x] 新增 Cloudflare-native Hub 规格。
- [x] 新增 Cloudflare 功能实验计划。
- [x] 新增 Cloudflare roadmap 总 spec。
- [x] 新增 Data Foundation spec。
- [x] 新增 AI Tool Intelligence spec。
- [x] 新增 Wish Wall 2.0 spec。
- [x] 新增 Browser Lab spec。
- [x] 新增 Realtime Playground spec。
- [x] 新增 Automation Center spec。
- [x] 新增 Public API Toolbox spec。
- [x] 新增 feature flags 配置。
- [x] 新增统一 Pages Functions API 响应工具。
- [x] 新增 `/api/health` 绑定探测端点。
- [x] 将 Wish Wall API 接入统一响应结构。
- [x] 在 `wrangler.toml` 增加未来绑定草案。
- [x] 新增 Cloudflare Lab 插件。
- [x] 新增 `cloudflare-lab` 路由。
- [x] Cloudflare Lab 接入 `/api/health` 和 feature flags。
- [x] 新增 Data Foundation v2 migration。
- [x] 新增 `hub-agent` 子项目：基于 CodeBuddy Agent SDK 的「Hub 工具顾问」。
- [x] 新增 `npm run sync:catalog`，把 AI 工具目录同步给 hub-agent。

## 下一步

- [x] 目录清洗后重跑 `npm run sync:catalog`，顾问拿到干净数据（2026-10-21 已验证 267 条）。
- ~~为 hub-agent 配置 `CODEBUDDY_API_KEY` 并跑通一次真实问答。~~ 已归档，不再推进。
- ~~评估是否把 hub-agent 的推荐能力回流到 `ai-navigator` 搜索结果页。~~ 随 hub-agent 归档搁置。

- [ ] 创建真实 KV namespace 并绑定 `HUB_KV`（当前唯一未绑的存储；feature flags 降级读 `features.config.json`）。
- R2 已绑定：`wrangler.toml` 的 `MUSIC_BUCKET`（bucket `music`），音乐库 songs/stream 在用，MP3 已移出 git。
- D1 已绑定并应用 migration：`WISHES_DB` 配了真实 database_id，001–009 已 apply。
- [ ] Vectorize / Queue / Workers AI：规划中的实验能力，按 spec 先过 feature flag 再启用。
- [ ] 对齐命名缺口：`/api/health` 检查的是 `HUB_BUCKET`，wrangler.toml 绑的是 `MUSIC_BUCKET`，
      lab 页 fileArtifacts 因此永远显示 unavailable。
- [x] 清洗 AI 工具导航中的重复 id 与同站重复条目（313 → 267）。
- [x] 重写全部标题与描述，去掉域名派生标题和分类模板句。
- [ ] 为 Wish Wall 增加最小管理脚本或管理接口，用于推进状态。
- [x] 在 Cloudflare Pages 上绑定真实 D1 数据库并应用 migration（`WISHES_DB`）。
- [ ] 补充 Wish Wall Function 的独立 API 测试。
- [x] 为 `configSchema` 增加单元测试。
- [x] 为 AI 搜索排序增加单元测试。
- [ ] 补充线上部署验证记录。

## 暂缓模块

- [ ] `quick-launch`：等 AI 工具导航稳定后再决定是否恢复为命令面板。
- [ ] `workbench`：等有明确工具 MVP 后再启用。
- [ ] `collections`：等资源数据完成清洗后再启用。
- [ ] `scratchpad`：等本地收纳流程明确后再启用。
- [ ] `projects`：如后续需要作品集叙事，再以 featured case-study 形式启用。
- [ ] `universal-inbox`：当前由许愿墙承担公开输入入口，暂不启用。

## 2026-10-21 整改

- [x] 归档 13 个不可达插件目录到 `docs/archive/plugins-retired-2026-10-21/`。
- [x] `ambient-music` 退出插件注册表（它是音频引擎，不承担路由）。
- [x] 配置与路由对齐：启用插件 8 个 = 导航项 8 条。
- [x] `cloudflare-lab` 补路由（此前配置启用但无路由，是死配置）。
- [x] 修掉「访问冷藏路由静默跳到别的页」——现在显示「模块不可用」。
- [x] 数据门禁重写：7 条规则 + 基线棘轮，存量 311 条清零到 0。
- [x] 分类法重构：10 类单一维度，新增 `fun`，取消 `productivity`，`ai` 不再叫「其他」。
- [x] 工具数据 313 → 267，全部标题与描述重写。
- [x] 新增 `kind`（online / desktop / resource）与 `variantOf` 字段。
- [x] `spec.md` / `checklist.md` 与代码对齐，删掉描述不存在路由的勾选。
- [x] 晚场：`hub-agent` 与 `remotion` 移入 `experiments/` 后，hub-agent 经评估归档到
      `docs/archive/experiments-retired-2026-10-21/`（鸡肋炫技，未物理删除）。
- [x] 晚场：清残留（news 后端、11 个死类型、source* 溯源字段移出运行时配置）。
- [x] 晚场：修 dock 播放器遮挡（内容区整列让位）+ 护栏 `tests/dock-clearance.spec.ts`。
- [x] 晚场：`agent.md` 并入 `AGENTS.md`；README 修正路由清单与 9 个死引用。
- [x] 晚场：核对后端绑定——D1 / R2 实际已绑（此前 checklist 误记为未绑），已改正。
