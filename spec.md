# 个人主页规格说明

## 目标

构建一个可部署到 Cloudflare Pages 的个人主页。页面通过 JSON 配置驱动内容，通过插件注册表组织模块，默认展示真实或可验证内容，避免上线占位链接、假统计和不存在资源。

主页视觉升级另见：`spec-homepage-visual-upgrade.md`。该规格用于将当前首页从功能型深色技术模板升级为更有叙事感和策展感的个人作品首页。

## 非目标

- 不在浏览器运行时加载远端 JavaScript 插件。
- 不把静态访客数、下载量、留言伪装成真实实时数据。
- 不依赖 `dist` 作为源码交付物。
- 不引入需要 Cloudflare 路由回退配置的多路由 SPA。
- 不依赖 Cloudflare Workers 或服务端 Node runtime。

## 技术栈

- React 18
- TypeScript strict mode
- Vite
- Tailwind CSS
- Zod
- Playwright
- Cloudflare Pages

## 配置契约

`public/config/site.config.json`：

```json
{
  "site": {
    "title": "垣钰 | 个人主页",
    "description": "全栈开发工程师",
    "author": "垣钰",
    "theme": "dark"
  },
  "profile": {
    "avatar": "/avatar.jpg",
    "name": "垣钰",
    "title": "全栈开发工程师",
    "bio": "个人简介",
    "skills": ["React", "TypeScript"],
    "location": "中国",
    "email": "1215240348@qq.com"
  },
  "motion": {
    "intro": true,
    "introDuration": 1800
  }
}
```

`ConfigLoader` 必须：

- 规范化 `{ site, profile }` 结构。
- 合并默认值。
- 过滤非法插件配置。
- 在配置加载失败时回退默认配置。
- 使用 Zod schema 校验配置字段。

## 插件契约

插件定义：

```ts
interface Plugin {
  id: string
  name: string
  version: string
  enabled: boolean
  order: number
  component: React.ComponentType<{ config?: PluginRuntimeConfig }>
  config?: PluginRuntimeConfig
}
```

插件配置：

```ts
interface PluginConfig {
  id: string
  enabled: boolean
  order: number
  config?: PluginRuntimeConfig
}
```

新增插件流程：

1. 在 `src/plugins/<plugin-id>/index.tsx` 创建组件。
2. 在 `src/plugins/index.ts` 注册插件。
3. 在 `public/config/plugins.config.json` 配置启用状态、顺序和数据。
4. 运行 `npm run lint && npm run build`。

## 默认模块

默认启用：

- Profile：个人信息。
- Navigation：站内和外部导航。
- Tools：常用技术工具。
- Social：真实联系方式。
- Projects：当前项目展示。

默认禁用：

- Timeline：需要真实经历数据。
- Blog：需要真实文章链接。
- Stats：需要真实统计来源。
- Analytics：需要真实访问统计来源。
- Comments：当前只有前端临时状态，不持久化。
- Downloads：需要真实下载文件。

## 交互要求

- Header 只保留一个 ThemeToggle。
- Header 根据当前 section 高亮导航项。
- 页面使用成长型单页结构，主导航通过锚点跳转。
- 右侧 Progress Rail 展示当前浏览位置，移动端隐藏。
- 主题优先读取 `localStorage`，否则使用配置主题。
- 首页启用 `Signal Bloom Intro` 入场动画。
- 入场动画总时长控制在 `800ms - 2400ms`，默认 `1800ms`。
- 入场动画结束后自动释放 overlay，不阻挡页面交互。
- 鼠标背景效果尊重 `prefers-reduced-motion`。
- 入场动画尊重 `prefers-reduced-motion`。
- 站内锚点不以新标签打开。
- Tools 模块支持分类过滤。
- Projects 模块支持 inline 展开详情。
- Profile 和 Header 的联系入口打开 Contact Drawer。
- Contact Drawer 支持邮箱复制和 mailto。
- 插件异常由 ErrorBoundary 隔离。

## 部署要求

- 构建命令：`npm run build`
- 输出目录：`dist`
- Cloudflare Pages 输出目录与 `wrangler.toml` 保持一致。
- 构建产物必须是纯静态资源。
- 前端代码不得依赖服务端文件系统、Node runtime 或自定义边缘函数。
- 不使用 history 路由，因此不需要额外 `_redirects` 回退规则。

## 自动化检查

- `npm run lint`：静态代码检查。
- `npm run check:assets`：扫描配置中引用的 `/...` 本地资源，确保资源存在于 `public`。
- `npm run build`：TypeScript 和生产构建。
- `npm run test:e2e`：Playwright Chromium 首页烟测。
- `npm run check`：顺序执行完整质量门禁。

## 验收标准

- `npm run lint` 通过。
- `npm run check:assets` 通过。
- `npm run build` 通过。
- `npm run test:e2e` 通过。
- Playwright 验证入场动画结束后页面核心内容可见。
- Playwright 验证工具过滤、项目展开和联系抽屉。
- 修改 `site.config.json.site.title` 后页面标题生效。
- 修改 `profile` 后 Profile 插件展示生效。
- 禁用任意插件后页面仍可正常渲染。
- 配置中不存在 `example.com`、`yourusername` 等上线占位链接。
