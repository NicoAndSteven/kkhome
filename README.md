# 个人 AI Hub

基于 React、TypeScript、Vite 和 Tailwind CSS 构建的配置驱动个人 Hub，适合部署到 Cloudflare Pages。当前默认主线是：

- `home`：个人介绍与联系入口。
- `ai-tools`：AI / 效率工具导航。
- `wish-wall`：访客许愿墙。
- `cloudflare-lab`：Cloudflare 平台能力面板。

## 快速开始

```bash
npm install
npm run dev
```

常用命令：

```bash
npm run lint
npm run check:assets
npm run check:data
npm run build
npm run test:e2e
npm run check
npm run preview
```

## 配置

站点配置位于 `public/config/site.config.json`：

- `site`：页面标题、描述、作者和主题。
- `profile`：头像、姓名、职位、简介、技能、邮箱等个人信息。
- `motion`：入场动画开关和时长。

插件配置位于 `public/config/plugins.config.json`：

- `id`：插件标识，必须与 `src/plugins/index.ts` 注册表一致。
- `enabled`：是否启用插件。
- `order`：插件展示顺序。
- `config`：插件自己的运行配置。

当前默认启用：`profile`、`ai-navigator`、`wish-wall`、`cloudflare-lab`。其他插件保留为后续扩展，默认禁用，避免展示占位数据或不可达入口。

## Cloudflare-native 扩展

当前规划见：

- `spec-cloudflare-native-hub.md`
- `cloudflare-plan.md`
- `spec-cloudflare-roadmap.md`
- `spec-cloudflare-data-foundation.md`
- `spec-cloudflare-ai-tool-intelligence.md`
- `spec-cloudflare-wish-wall-2.md`
- `spec-cloudflare-browser-lab.md`
- `spec-cloudflare-realtime-playground.md`
- `spec-cloudflare-automation-center.md`
- `spec-cloudflare-public-api-toolbox.md`

功能开关位于 `public/config/features.config.json`。所有需要 D1、KV、R2、Durable Objects、Queues、Workers AI、Vectorize 或 Browser Rendering 的实验功能，应先进入 feature flags，再逐步启用。

`/api/health` 会返回当前 Pages Functions 环境中已绑定的 Cloudflare 资源状态。未绑定资源必须显示为 unavailable，不允许伪造成功。

`#/cloudflare-lab` 会读取 `/api/health` 与 `features.config.json`，展示绑定状态、功能开关和实验队列。开发服务器不提供 Pages Functions 时，该页面会自动降级为本地功能开关视图。

## 数据质量

`npm run check:data` 会检查 AI 工具导航数据：

- 缺少 `id/title/category/url/description` 会失败。
- 未知分类会失败。
- 重复 id、泛化标题和高频重复标题会输出 warning。

## 许愿墙

许愿墙前端会优先访问 `/api/wishes`。如果 API 或 D1 未配置，会自动降级为本地草稿模式。

Cloudflare D1 持久化步骤：

```bash
npx wrangler d1 create kkhome_wishes
npx wrangler d1 migrations apply kkhome_wishes
```

然后在 `wrangler.toml` 中启用 `[[d1_databases]]`，填入真实 `database_id`。

## 插件开发

1. 在 `src/plugins/<plugin-id>/index.tsx` 新建插件组件。
2. 组件接收 `{ config?: PluginRuntimeConfig }`。
3. 在 `src/plugins/index.ts` 注册插件元数据。
4. 在 `public/config/plugins.config.json` 添加配置项。
5. 如果插件需要新配置结构，在 `src/core/configSchema.ts` 补 Zod schema。
6. 运行 `npm run check` 验证。

插件应保证配置缺失时不崩溃，并在空数据时展示明确的空状态或直接返回 `null`。

## 子项目：hub-agent

`hub-agent/` 是基于 CodeBuddy Agent SDK 的独立全栈子项目（Express + SSE 后端，React + TDesign 前端），
定位为「Hub 工具顾问」：用户带着任务问该用哪个工具，Agent 只从本仓真实的 AI 工具目录里检索并推荐，
目录没有匹配项时如实说明并帮用户写一条许愿墙需求。

- 数据来源：`public/config/plugins.config.json` 的 `ai-navigator`，由 `npm run sync:catalog` 同步到 `hub-agent/data/`。
- 它有独立的 `package.json` 与依赖，不参与主站构建和 lint（已在 `eslint.config.mjs` 中 ignore）。
- 使用和二次开发说明见 `hub-agent/README.md`。

## 部署

生产链路是「推送即部署」，分两条并行的路，两条路管的东西不重叠：

1. **站点（Cloudflare Pages）** — 由 Cloudflare 自己的 Git 集成负责。
   push 到 `main` 后自动 clone → `npm run build` → 发布 `dist`。
   任意分支的 push 都会生成一份预览部署，PR 上会自动评论预览链接。
2. **边缘资源（GitHub Actions）** — 见 `.github/workflows/ci.yml` 的 `deploy-edge` job，
   只在 `main` 且质量门禁通过后运行，负责 Pages 构建管不到的两件事：
   - `wrangler d1 migrations apply kkhome_wishes --remote`
   - `wrangler deploy --config workers/party-rooms/wrangler.toml`（Durable Object worker）

`deploy-edge` 需要仓库 Secrets：`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`。

**不要把 Pages 本体也塞进 Actions** —— `kkhome` 与 `personal-homepage` 两个 Pages 项目共用同一套
D1 / R2 / DO 绑定，重复部署就是双写。

Pages 配置：

- Build command: `npm run build`
- Build output directory: `dist`
- `wrangler.toml` 已声明 `pages_build_output_dir = "dist"`

只有在需要绕过 CI 时才手动 CLI 部署：

```bash
npm run build
npx wrangler pages deploy dist
```

### D1 迁移的账本

`d1_migrations` 是「哪些迁移跑过」的唯一账本，正常只能由 `wrangler d1 migrations apply` 写入。
**不要用 `wrangler d1 execute --file` 直接灌迁移文件** —— schema 会变，账本不会记，
下一次 `apply` 就会把整个迁移重放一遍（005 是 `DELETE` + 重灌，重放会丢掉手工改过的牌）。

004–009 当初就是这么灌进去的，账本里只留下了 001–003。已按各文件最后一次提交时间补记，
现在 `wrangler d1 migrations list kkhome_wishes --remote` 返回 `✅ No migrations to apply!`。

## 质量门禁

提交前运行：

```bash
npm run check
```

`npm run check` 会依次执行 lint、资源检查、AI 数据检查、单元测试、生产构建和 Playwright Chromium 烟测。

同一套命令在 CI 里跑（`.github/workflows/ci.yml` 的 `quality-gate` job），覆盖每一次 push 和 PR。
**门禁不过，`deploy-edge` 不会启动**，所以坏代码到不了生产。
