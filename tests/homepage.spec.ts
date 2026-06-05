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
  await expect(page.locator('.intro-stage')).toBeHidden({ timeout: 4_000 })

  await expect(page).toHaveTitle('垣钰 | 个人主页')
  await expect(page.getByRole('heading', { name: '垣钰' })).toBeVisible()
  await expect(page.locator('#projects').getByRole('heading', { name: '项目作品' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '万能投入口' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '万能跳转' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '工具收纳台' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '场景工作流' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '分类收藏' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '临时收纳' })).toBeVisible()
  await expect(page.locator('#launch').getByText('ChatGPT')).toBeVisible()

  await expect(page.locator('body')).not.toContainText('example.com')
  await expect(page.locator('body')).not.toContainText('yourusername')
  await expect(page.locator('body')).not.toContainText('常用工具栈')
  await expect(page.locator('body')).not.toContainText('探索我的世界')

  const themeToggle = page.getByRole('button', { name: '切换主题' })
  await expect(themeToggle).toBeVisible()
  await themeToggle.click()
  await expect(page.locator('html')).not.toHaveClass(/dark/)

  await page.locator('#projects').getByRole('button', { name: '展开详情' }).click()
  await expect(page.getByText('产物为纯静态资源，适配 Cloudflare Pages。')).toBeVisible()

  const inboxSection = page.locator('#inbox')
  const workbenchSection = page.locator('#workbench')
  await inboxSection.getByLabel('万能投入口').fill('{"capsule":true}')
  await expect(inboxSection.getByText('json', { exact: true })).toBeVisible()
  await inboxSection.getByRole('button', { name: /发送到 JSON 工具/ }).click()
  await expect(page).toHaveURL(/#workbench/)
  await expect(workbenchSection.getByLabel('JSON 格式化 输入')).toHaveValue('{"capsule":true}')
  await expect(workbenchSection.getByText('"capsule": true')).toBeVisible()
  await inboxSection.getByLabel('万能投入口').fill('https://localhost.test/capsule')
  await expect(inboxSection.getByText('url', { exact: true })).toBeVisible()
  await inboxSection.getByRole('button', { name: /收纳链接/ }).click()
  await expect(page.locator('#scratchpad').getByRole('heading', { name: /localhost\.test\/capsule/ })).toBeVisible()

  const launchSection = page.locator('#launch')
  await launchSection.getByRole('searchbox', { name: '搜索快捷资源' }).fill('check')
  await expect(launchSection.getByText('项目检查命令')).toBeVisible()
  await launchSection.getByRole('searchbox', { name: '搜索快捷资源' }).fill('uuid')
  await launchSection.getByRole('button', { name: /UUID 生成/ }).click()
  await expect(page).toHaveURL(/#workbench/)

  await expect(workbenchSection.getByText(/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i)).toBeVisible()
  await workbenchSection.getByRole('button', { name: 'JSON 格式化' }).click()
  await workbenchSection.getByLabel('JSON 格式化 输入').fill('{"hub":true}')
  await workbenchSection.getByRole('button', { name: '运行' }).click()
  await expect(workbenchSection.getByText('"hub": true')).toBeVisible()
  await workbenchSection.getByRole('button', { name: 'UUID 生成' }).click()
  await expect(workbenchSection.getByText(/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i)).toBeVisible()
  await workbenchSection.getByRole('button', { name: 'URL 编解码' }).click()
  await expect(workbenchSection.getByLabel('URL 编解码 输入')).toHaveValue(/localhost\.test/)

  const workflowsSection = page.locator('#workflows')
  await workflowsSection.getByRole('button', { name: /开发模式/ }).click()
  await workflowsSection.getByRole('button', { name: '执行场景' }).click()
  await expect(workflowsSection.getByText('已执行 开发模式')).toBeVisible()
  await expect(page.locator('#scratchpad').getByRole('heading', { name: 'npm run check' })).toBeVisible()

  const collectionsSection = page.locator('#collections')
  await collectionsSection.getByRole('button', { name: '命令', exact: true }).click()
  await expect(collectionsSection.getByText('项目检查命令')).toBeVisible()
  await expect(collectionsSection.getByText('ChatGPT')).toHaveCount(0)

  const scratchpadSection = page.locator('#scratchpad')
  await scratchpadSection.getByLabel('粘贴临时内容').fill('https://localhost.test/dev-note')
  await scratchpadSection.getByRole('button', { name: '收纳' }).click()
  await expect(scratchpadSection.getByRole('heading', { name: /localhost\.test\/dev-note/ })).toBeVisible()
  await page.reload()
  await expect(page.locator('.intro-stage')).toBeHidden({ timeout: 4_000 })
  await expect(page.locator('#scratchpad').getByRole('heading', { name: /localhost\.test\/dev-note/ })).toBeVisible()

  await page.getByRole('button', { name: '联系我' }).click()
  await expect(page.getByRole('dialog', { name: '联系我' })).toBeVisible()
  await page.getByRole('button', { name: '关闭', exact: true }).click()
  await expect(page.getByRole('dialog', { name: '联系我' })).toBeHidden()

  expect(consoleErrors).toEqual([])
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

  await page.goto('/')
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
