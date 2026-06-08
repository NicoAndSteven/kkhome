# Repository Guidelines

## Project Structure & Module Organization

This is a Vite + React + TypeScript personal hub, deployed as a static site. Source code lives in `src/`. Core configuration and plugin infrastructure are in `src/core/`, shared UI components are in `src/components/`, and feature modules are registered from `src/plugins/index.ts`. Each plugin should live in `src/plugins/<plugin-id>/index.tsx`.

Static assets and runtime JSON config live in `public/`, especially `public/config/site.config.json` and `public/config/plugins.config.json`. End-to-end tests live in `tests/`. Utility scripts are in `scripts/`. Product specs and task notes are kept in root Markdown files such as `spec.md`, `tasks.md`, and `spec-cloudflare-roadmap.md`.

## Build, Test, and Development Commands

- `npm run dev`: start the Vite development server.
- `npm run build`: run TypeScript checks and produce the production build in `dist/`.
- `npm run lint`: run ESLint with zero warnings allowed.
- `npm run check:assets`: verify local `/...` asset paths referenced by config exist under `public/`.
- `npm run test:e2e`: run Playwright Chromium tests.
- `npm run check`: run lint, asset checks, build, and e2e tests in sequence.
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
