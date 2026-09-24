import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  // 只收 .spec.ts。tests/*.test.mjs 是 node:test 单测（跑在 npm run test:unit 里），
  // 被 Playwright 当 spec 加载时会在 worker 里起一个 node:test runner 并占住事件循环，
  // 结果就是「测试全跑完了，worker 却退不出去」，白白卡满 5 分钟后被强杀。
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
