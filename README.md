# 个人主页

基于 React、TypeScript、Vite 和 Tailwind CSS 构建的配置驱动个人主页。项目以插件方式组织页面模块，适合部署到 Cloudflare Pages。

## 快速开始

```bash
npm install
npm run dev
```

常用命令：

```bash
npm run lint
npm run check:assets
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

当前默认启用：Profile、Navigation、Tools、Social、Projects。Stats、Analytics、Comments、Downloads 等需要真实数据源的模块默认禁用，避免展示占位数据。

配置由 `zod` 在运行时校验和规范化。配置加载失败、字段缺失或字段类型错误时，会回退到默认值。

## 入场动画

首页默认启用 `Signal Bloom Intro`：页面启动时会先展示扫描线、信号环和身份标记，再让主体内容分层浮现。

可在 `public/config/site.config.json` 中调整：

```json
{
  "motion": {
    "intro": true,
    "introDuration": 1800
  }
}
```

用户系统开启“减少动态效果”时，入场动画会自动降级为无阻塞展示。

## 页面交互

主页采用成长型单页结构，避免引入需要路由回退配置的复杂 SPA 路由。当前交互包括：

- Header 根据滚动位置高亮当前 section。
- 右侧 Progress Rail 支持快速跳转。
- Tools 模块支持分类过滤。
- Projects 模块支持卡片内展开详情。
- Contact Drawer 支持邮箱查看、mailto 和复制。

## 插件开发

1. 在 `src/plugins/<plugin-id>/index.tsx` 新建插件组件。
2. 组件接收 `{ config?: PluginRuntimeConfig }`。
3. 在 `src/plugins/index.ts` 注册插件元数据。
4. 在 `public/config/plugins.config.json` 添加配置项。
5. 运行 `npm run lint && npm run build` 验证。

插件应保证配置缺失时不崩溃，并在空数据时展示明确的空状态或直接返回 `null`。

## 部署

本地构建：

```bash
npm run build
```

Cloudflare Pages 配置：

- Build command: `npm run build`
- Build output directory: `dist`

`wrangler.toml` 已声明 `pages_build_output_dir = "dist"`。需要 CLI 部署时可执行：

```bash
npx wrangler pages deploy dist
```

当前实现是纯静态前端，不依赖 Cloudflare Workers、服务端路由或运行时 Node API。

## 质量门禁

提交前运行：

```bash
npm run check
```

`npm run check` 会依次执行 lint、配置资源检查、生产构建和 Playwright Chromium 烟测。
