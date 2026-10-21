# Repository Guidelines

## Project Structure & Module Organization

This is a Vite + React + TypeScript personal hub, deployed as a static site. Source code lives in `src/`. Core configuration and plugin infrastructure are in `src/core/`, shared UI components are in `src/components/`, and feature modules are registered from `src/plugins/index.ts`. Each plugin should live in `src/plugins/<plugin-id>/index.tsx`.

Static assets and runtime JSON config live in `public/`, especially `public/config/site.config.json` and `public/config/plugins.config.json`. End-to-end tests live in `tests/`. Utility scripts are in `scripts/`. Product specs and task notes are kept in root Markdown files such as `spec.md`, `tasks.md`, and `checklist.md`.

`experiments/` 存放与主站零耦合的独立子项目（各有自己的依赖，不参与主站构建、lint 与 CI）；退役插件归档在 `docs/archive/`，只留档不进构建。

## Build, Test, and Development Commands

- `npm run dev`: start the Vite development server.
- `npm run build`: run TypeScript checks and produce the production build in `dist/`.
- `npm run lint`: run ESLint with zero warnings allowed.
- `npm run check:assets`: verify local `/...` asset paths referenced by config exist under `public/`.
- `npm run check:data`: validate the AI tool navigation data (`scripts/check-ai-tools.mjs`, rules in `scripts/lib/ai-tools-rules.mjs`).
- `npm run test:unit`: run the `node:test` unit tests.
- `npm run test:e2e`: run Playwright Chromium tests.
- `npm run check`: run lint, asset checks, data checks, unit tests, build, and e2e tests in sequence.
- `npm run preview`: preview the built site locally.

## Coding Style & Naming Conventions

Use TypeScript and React function components. Prefer existing plugin and component patterns over introducing new abstractions. Keep plugin ids kebab-case, for example `quick-launch`, and component names PascalCase. Config-driven data should be validated with Zod in `src/core/configSchema.ts`.

Use Tailwind utility classes consistently with the existing design system in `src/index.css` and `tailwind.config.js`. Keep comments short and only where they clarify non-obvious logic.

## Testing Guidelines

Playwright is the primary test framework. Add or update tests in `tests/*.spec.ts` when changing user-visible flows, plugin ordering, configuration behavior, or interactive tools. Prefer role-based selectors and section-scoped locators, for example `page.locator('#workbench').getByRole(...)`.

Before handing off changes, run `npm run check`.

## Commit & Pull Request Guidelines

The current history uses short imperative commit messages, such as `UI rebuild` and `Fix Cloudflare Pages wrangler config`. Keep commits concise and focused. Use a clear verb phrase that describes the change.

Pull requests should include a short summary, affected modules, verification commands run, and screenshots or recordings for visible UI changes. Call out config changes, new public assets, and any deployment implications.

## Security & Configuration Tips

Do not place API tokens, private keys, or personal secrets in frontend config. Keep private or authenticated integrations disabled until they have a safe proxy or server-side boundary. Avoid fake statistics, placeholder links, or unverifiable integration states.

## Product Direction & Working Rules

- 现行规格以 `spec.md` 为准（路由表、路由三态契约、AI 工具数据规矩都在那里）；本文件只讲仓库怎么用，不复制规格内容。
- 产品是「个人 Hub，不设功能上限」，但已上线模块必须路由、配置、测试三者齐备；访问被禁用的路由要显示「模块不可用」，不静默跳转。
- 界面、报错、文档、测试断言都不许说假话；降级要有明确提示，不静默失败。
- 新增或修改行为时同步改护栏，并做变异验证：把实现改回旧写法，护栏必须变红。
- 保持桌面与移动两端可用；不要重新引入已删除的公开入口或路由。
- 保留本次任务范围之外的已有用户改动。
- `docs/superpowers/` 是历史设计稿，只作档案；`docs/audit-product-2026-10-21.md` 记录了 2026-10-21 的产品盘点与整改。
