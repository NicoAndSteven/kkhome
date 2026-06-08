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

## 部署

Cloudflare Pages 配置：

- Build command: `npm run build`
- Build output directory: `dist`

`wrangler.toml` 已声明 `pages_build_output_dir = "dist"`。需要 CLI 部署时可执行：

```bash
npm run build
npx wrangler pages deploy dist
```

## 质量门禁

提交前运行：

```bash
npm run check
```

`npm run check` 会依次执行 lint、资源检查、AI 数据检查、生产构建和 Playwright Chromium 烟测。
