import { expect, test } from '@playwright/test'

test('homepage renders configured content without placeholders', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text())
    }
  })

  await page.addInitScript(() => {
    if (!globalThis.sessionStorage.getItem('__homepage_test_init__')) {
      globalThis.localStorage.clear()
      globalThis.sessionStorage.setItem('__homepage_test_init__', '1')
    }
  })
  await page.goto('/')
  await expect(page.locator('.intro-stage')).toBeVisible({ timeout: 1_000 })
  await expect.poll(() => page.evaluate(() => (
    window.getComputedStyle(document.documentElement).overflowY
  ))).toBe('hidden')
  await expect(page.locator('.intro-stage')).toBeHidden({ timeout: 4_000 })

  await expect(page).toHaveTitle('垣钰 | Personal Hub')
  await expect.poll(() => page.evaluate(() => (
    document.documentElement.scrollHeight <= window.innerHeight + 1
    && document.documentElement.scrollWidth <= window.innerWidth + 1
  ))).toBe(true)
  await expect(page.getByRole('heading', { name: '垣钰' })).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.__hubAvailableRoutes)).toEqual(['home', 'ai-tools', 'inbox'])
  await expect(page.locator('#inbox')).toHaveCount(0)
  await expect(page.locator('#launch')).toHaveCount(0)
  await expect(page.locator('#workbench')).toHaveCount(0)
  await expect(page.locator('#collections')).toHaveCount(0)
  await expect(page.locator('#scratchpad')).toHaveCount(0)
  await expect(page.locator('#projects')).toHaveCount(0)
  await expect(page.locator('#workflows')).toHaveCount(0)

  await expect(page.locator('body')).not.toContainText('example.com')
  await expect(page.locator('body')).not.toContainText('yourusername')
  await expect(page.locator('body')).not.toContainText('常用工具栈')
  await expect(page.locator('body')).not.toContainText('探索我的世界')
  await expect(page.locator('body')).not.toContainText('项目作品')
  await expect(page.locator('body')).not.toContainText('场景工作流')

  const themeToggle = page.getByRole('button', { name: '切换主题' })
  await expect(themeToggle).toBeVisible()
  await themeToggle.click()
  await expect(page.locator('html')).not.toHaveClass(/dark/)

  const goRoute = async (route: string) => {
    await page.evaluate((nextRoute) => {
      window.location.hash = `#/${nextRoute}`
    }, route)
    await expect(page).toHaveURL(new RegExp(`#/${route}`))
    await expect.poll(() => page.evaluate(() => (
      document.documentElement.scrollHeight <= window.innerHeight + 1
    ))).toBe(true)
  }

  await goRoute('inbox')
  await expect(page).toHaveURL(/#\/inbox/)
  const inboxSection = page.locator('#inbox')
  await expect(inboxSection.getByRole('heading', { name: '万能投入口' })).toBeVisible()
  await inboxSection.getByLabel('万能投入口').fill('{"capsule":true}')
  await expect(inboxSection.getByText('json', { exact: true })).toBeVisible()
  await expect(inboxSection.getByRole('button', { name: /复制 JSON/ })).toBeVisible()
  await expect.poll(() => page.evaluate(() => (
    document.documentElement.scrollHeight <= window.innerHeight + 1
  ))).toBe(true)

  await goRoute('inbox')
  await inboxSection.getByLabel('万能投入口').fill('https://localhost.test/capsule')
  await expect(inboxSection.getByText('url', { exact: true })).toBeVisible()
  await expect(inboxSection.getByRole('button', { name: /复制链接/ })).toBeVisible()

  await goRoute('ai-tools')
  const aiToolsSection = page.locator('#ai-tools')
  await expect(aiToolsSection.getByRole('heading', { name: 'AI 工具导航' })).toBeVisible()
  await expect(aiToolsSection.getByText('Convertio').first()).toBeVisible()
  await expect(aiToolsSection.getByText('File Converter')).toBeVisible()
  await expect(aiToolsSection.getByText(/30aitool/).first()).toBeVisible()
  await aiToolsSection.getByRole('button', { name: '转换工具', exact: true }).click()
  const resultMetrics = await aiToolsSection.locator('.ai-results-scroll').evaluate((element) => ({
    height: element.clientHeight,
    cards: element.querySelectorAll('.surface-item').length,
  }))
  expect(resultMetrics.height).toBeGreaterThan(260)
  expect(resultMetrics.cards).toBeGreaterThan(3)
  await expect(aiToolsSection.locator('.ai-results-scroll .surface-item').first()).not.toContainText('30aitool')
  await aiToolsSection.getByRole('button', { name: '文件转换器', exact: true }).click()
  await expect(aiToolsSection.getByText('Convertio').first()).toBeVisible()
  await expect(aiToolsSection.getByText('File Converter')).toBeVisible()
  await aiToolsSection.getByRole('searchbox', { name: '搜索目标工具' }).fill('图片压缩')
  await expect(aiToolsSection.getByText(/TinyPNG|Tinypng/)).toBeVisible()
  await expect(aiToolsSection.getByText('File Converter')).toHaveCount(0)

  await page.locator('header').getByRole('button', { name: '打开联系抽屉' }).click()
  await expect(page.getByRole('dialog', { name: '联系我' })).toBeVisible()
  await page.getByRole('button', { name: '关闭', exact: true }).click()
  await expect(page.getByRole('dialog', { name: '联系我' })).toBeHidden()

  expect(consoleErrors).toEqual([])
})

test('routes stay within desktop and mobile viewports', async ({ browser }) => {
  test.setTimeout(70_000)

  const routes = ['/', '/#/ai-tools', '/#/inbox']
  const viewports = [
    { width: 1440, height: 1000, isMobile: false },
    { width: 390, height: 844, isMobile: true },
  ]

  for (const viewport of viewports) {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.isMobile,
    })

    for (const route of routes) {
      await page.goto(route)
      await page.locator('.page-shell.page-ready').waitFor({ state: 'attached', timeout: 7_000 })

      await expect.poll(() => page.evaluate(() => ({
        heightFits: document.documentElement.scrollHeight <= window.innerHeight + 1,
        widthFits: document.documentElement.scrollWidth <= window.innerWidth + 1,
        overflowingControls: [...document.querySelectorAll('button, a, input, textarea, pre')]
          .filter((element) => element.scrollWidth > element.clientWidth + 1)
          .map((element) => element.textContent?.trim() || element.getAttribute('placeholder') || ''),
      }))).toEqual({
        heightFits: true,
        widthFits: true,
        overflowingControls: [],
      })
    }

    await page.close()
  }
})

test('universal inbox reports unavailable receiver modules', async ({ page }) => {
  await page.route('**/config/plugins.config.json', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        plugins: [
          { id: 'profile', enabled: true, order: 1, config: {} },
          {
            id: 'universal-inbox',
            enabled: true,
            order: 2,
            config: {
              capsules: [
                {
                  id: 'capsule-json',
                  title: '发送到 JSON 工具',
                  triggers: ['json'],
                  action: {
                    type: 'select-tool',
                    label: '已激活 JSON 工具',
                    tool: 'json-format',
                    target: '#workbench',
                  },
                },
                {
                  id: 'capsule-url',
                  title: '收纳链接',
                  triggers: ['url'],
                  action: {
                    type: 'add-scratchpad',
                    label: '已收纳链接',
                    target: '#scratchpad',
                  },
                },
              ],
            },
          },
          { id: 'workbench', enabled: false, order: 3, config: { utilities: [] } },
          { id: 'scratchpad', enabled: false, order: 4, config: {} },
        ],
      }),
    })
  })

  await page.goto('/#/inbox')
  await expect(page.locator('.intro-stage')).toBeHidden({ timeout: 4_000 })

  const inboxSection = page.locator('#inbox')
  await inboxSection.getByLabel('万能投入口').fill('{"capsule":true}')
  await inboxSection.getByRole('button', { name: /发送到 JSON 工具/ }).click()
  await expect(inboxSection.getByText('动作执行失败：目标模块不可用')).toBeVisible()
  await expect(page.locator('#workbench')).toHaveCount(0)

  await inboxSection.getByLabel('万能投入口').fill('https://localhost.test/missing-scratchpad')
  await inboxSection.getByRole('button', { name: /收纳链接/ }).click()
  await expect(inboxSection.getByText('动作执行失败：目标模块不可用')).toBeVisible()
  await expect(page.locator('#scratchpad')).toHaveCount(0)
})
