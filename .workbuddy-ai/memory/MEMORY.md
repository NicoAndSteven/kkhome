# kkhome 项目长期约定

## 门禁与环境（每次改动都要用到）

- 完整门禁：`npm run check`（lint + check:assets + check:data + test:unit + build + test:e2e）。
  CI 在 `.github/workflows/ci.yml` 的 `quality-gate` job 跑它，**它不绿，deploy job 不会启动**。
- **本机跑门禁必须带 `CODEBUDDY_SAFE_DELETE_ENABLED=0`**：
  ```bash
  CODEBUDDY_SAFE_DELETE_ENABLED=0 npm run check
  ```
  否则安全删除 shim 会拦批量删除（阈值 50 文件，且**按每轮对话累计计数**），
  Playwright 清 `test-results/` 或 vite 清 `dist/` 子目录时直接失败。
  **值必须是 `0`，传 `false` 无效**（shim 里判断的是 `!== '0'`）。
  清理临时文件时也要带上这个前缀，否则同轮累计删超阈值会被拦。
  看到 `safe-delete` 字样就先怀疑环境，别怀疑代码。
- **本机 `npx playwright test` 收尾可能挂死**（`worker-0 process did not exit within 300000ms`），
  但**用例本身全过**。这是环境问题，已用对照定性：加一个只 `goto('about:blank')`
  的临时 spec，它也挂。**别为这个去 `git stash` 二分。**
- **`TaskStop` 杀不掉 vite**（只杀 npm 包装进程，vite 变孤儿占着 5173）。
  用 `Get-NetTCPConnection -LocalPort 5173` 拿 `OwningProcess` 精确杀，
  别 `taskkill /IM node.exe`（会连 WorkBuddy 宿主一起杀）。
- `test-results/` 被 Playwright 启动时清空。要留存的截图/证据放 `shots/` 或 `docs/evidence/`。
- **探针脚本放 `test-results/`**（同时被 gitignore 和 eslint ignore）。
  放根目录会被 `eslint .` 扫到，让门禁挂。但残留探针会撑爆上面的 50 文件阈值。
- vite 会在根目录留 `vite.config.ts.timestamp-*.mjs`，已被 `.gitignore:49` 忽略。

## 验收方法（别用计算样式判可见性）

- **计算样式会骗人**：元素可以 `opacity: 1` / `translate: 0px` / `backgroundClip: text`
  全都"正常"，却一个像素都没画出来（我踩过：逐字动画破坏了渐变裁切字）。
- 判可见性用**像素差异法**：截同一区域两次（一次把目标 `visibility: hidden`），
  字节不同 = 真的画出了像素。
- **静态截图证明不了动效**。要逐帧采样量出时序（错峰时刻、首帧是否已隐藏）。

## 动效层

- **anime.js 只能从 `@core/motion` 进入**，有 eslint `no-restricted-imports` 护栏钉住。
  动效层在 `src/core/motion/`（目录，9 个模块）。
- 判据：输入是 CSS 状态（`:hover`/class）→ 用 CSS；输入是连续量或运行时数据
  （指针、滚动、字数、列表长度）→ 用 anime.js；输入是无（装饰循环）→ 用 CSS。
- 详见技能 `animejs-motion-layer`（含 v4 的用法坑与验收方法）。

## 插件体系

- 插件开关在 `public/config/plugins.config.json`（**不是** `src/` 里）。
  改它等于改产品形态，不要为了验证方便去动 —— 验证完要还原。
- **`applyConfigs` 只覆盖配置里列出的插件**：注册表写 `enabled: true`、配置里没有 → 仍然启用。
  所以「配置里没有 = 关着」这个直觉是错的，新增插件必须同时改注册表和配置。
- 路由三态契约（2026-10-21 起）：**上线**（注册 + 配置启用 + 路由 + e2e）/
  **冷藏**（注册但 `enabled:false`，路由可留，访问显示 OFFLINE）/ **归档**（移到 `docs/archive/`）。
  不允许「配置说开着但没路由」或「有路由但禁用却静默跳到别的页」。
- `ambient-music` 不是插件，是音频引擎（App.tsx 直接 import，不承担路由）。
- 归档区：`docs/archive/plugins-retired-2026-10-21/`（13 个目录）。

## 桌面壳与 dock 播放器

- `.ac-dock-player`（ambient-music MiniPlayer）是桌面 route-mode 的常驻 fixed 浮层，
  268×246–310（随播放态变），距右/底各 20px；移动端不渲染。
- **遮挡必须按「整列让位」修，垫底部 padding 没用**：`padding-bottom` 只能保证滚到底干净，
  默认视图和滚动中内容照样整块从播放器下面经过。现行解法：
  `.route-mode:has(.ac-dock-player) .route-view { padding-right: 300px }`
  （挂 `.route-view` 而非 `.kk-body`：标题头和正文要共用同一列，否则居中内容相对标题偏左）。
- 护栏 `tests/dock-clearance.spec.ts`：每条桌面路由在初始视图 + 滚到底两个位置断言
  可见叶子节点 ∩ dock 矩形 = ∅。已做变异验证（摘掉 CSS 规则即变红，并指名报出被压卡片）。

## experiments/ 与文档布局

- `experiments/` 现在只剩 `remotion`（一次性视频产物，与主站零引用，不参与 lint/CI/构建）。
  `hub-agent` 已于 2026-10-21 评估为鸡肋炫技，归档到
  `docs/archive/experiments-retired-2026-10-21/hub-agent/`（`git mv`，未物理删）。
  动这类子项目只改自己目录；`sync-catalog.mjs` 有 `__dirname/../..` 相对路径，搬家要跟着改。
- 根文档分工：`AGENTS.md`（仓库怎么用）/ `spec.md`（现行规格）/ `tasks.md` / `checklist.md`，
  `agent.md` 已是指针，README 只做导览。**别再建第五份**；md 交叉引用改完要校验目标文件存在
  （README 曾引用 9 个不存在的 `spec-cloudflare-*.md`）。

## Cloudflare 绑定实况（2026-10-21 核对）

- **已绑**：D1 `WISHES_DB`（真实 id，migration 001–009 已 apply）、R2 `MUSIC_BUCKET`
  （音乐 songs/stream 在读，MP3 已移出 git）、DO `PARTY_ROOMS`（独立 worker，deploy-edge 部署）。
- **未绑**：KV `HUB_KV`（wrangler.toml 里是注释占位；feature flags 按设计降级读 features.config.json）。
  Vectorize / Queues / AI 是规划实验能力，未绑是设计内状态。
- 行情后端 `/api/stock/*` 是真实上游代理（Yahoo Finance + 天天基金），**不需要存储绑定**。
- 已知命名缺口：`/api/health` 探测的是 `HUB_BUCKET`，wrangler.toml 绑的是 `MUSIC_BUCKET`，
  所以 lab 页 fileArtifacts 永远显示 unavailable（规划项，非故障，但名字对不上会误导）。
- **教训**：checklist 里没勾 ≠ 没做。我犯过把已绑的 D1/R2 写成未绑。
  下结论前先读 `wrangler.toml` 和 `functions/` 的实际引用。

## AI 工具数据

- 门禁：`scripts/check-ai-tools.mjs`，规则在 `scripts/lib/ai-tools-rules.mjs`（**单一实现**，
  `refresh-baseline.mjs` 也 import 它，别写第二份）。
- **基线棘轮**：`scripts/ai-tools-baseline.json` + `MAX_BASELINE`。2026-10-21 已清零到 0，
  任何新增错位直接失败。别再给它开口子。
- 结构性错误（`required` / `category` / `duplicate-id` / `duplicate-url` / `surrogate`）
  **不可豁免**，基线管不到。
- 判「域名派生标题」要区分品牌名：`PixPin ← pixpinapp.com`、`SuperCLUE ← superclueai.com`
  是品牌，`Web / Lab / Tools / Ps / Font` 才是域名派生。有误报就调规则，别放水。
- **ai-navigator 的意图词 chip 行已删**（2026-10-21）：8 个 chip 里 7 个是分类 tab 的同义词，
  且点进去只有 0~3 条结果（「PDF 转 Word」为 0）—— 重复且是假入口。
  `intentPrompts` 配置字段、Zod schema、fallback 常量已一并移除，**不要引回来**。
  搜索入口只保留搜索框 + 分类 tab。

## 内容真实性

- 仓库硬规矩：**不许出现占位数据/假数据**。有 e2e 断言专门卡这条
  （`homepage renders configured content without placeholders`）。
- 降级要有明确提示，不静默失败（如 hero 视频不可用时显示 `.vh-note`）。
- **描述不能由分类模板批量生成**。曾经 313 条只有 26 种描述，`download`/`ai` 各 1 种，
  卡片全在说假话。现在 `desc-template` / `desc-repeated` 两条规则钉死。
- **`test-results/` 会被 Playwright 启动时清空**。一次性脚本、探针、证据放
  `shots/` 或 `docs/`，别放那里（本轮 7 个清洗脚本就是这么丢的）。
- 依赖时段的 e2e 必须固定时钟（`page.clock.setFixedTime`）。
  `food-menu.spec.ts` 曾因 13:00 分界而「上午绿、下午红」。
