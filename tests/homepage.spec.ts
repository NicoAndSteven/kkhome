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
  await expect(page.getByRole('heading', { name: '万能跳转' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '工具收纳台' })).toBeVisible()
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

  const launchSection = page.locator('#launch')
  await launchSection.getByRole('searchbox', { name: '搜索快捷资源' }).fill('check')
  await expect(launchSection.getByText('项目检查命令')).toBeVisible()
  await launchSection.getByRole('searchbox', { name: '搜索快捷资源' }).fill('uuid')
  await launchSection.getByRole('button', { name: /UUID 生成/ }).click()
  await expect(page).toHaveURL(/#workbench/)

  const workbenchSection = page.locator('#workbench')
  await expect(workbenchSection.getByText(/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i)).toBeVisible()
  await workbenchSection.getByRole('button', { name: 'JSON 格式化' }).click()
  await workbenchSection.getByLabel('JSON 格式化 输入').fill('{"hub":true}')
  await workbenchSection.getByRole('button', { name: '运行' }).click()
  await expect(workbenchSection.getByText('"hub": true')).toBeVisible()
  await workbenchSection.getByRole('button', { name: 'UUID 生成' }).click()
  await expect(workbenchSection.getByText(/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i)).toBeVisible()
  await workbenchSection.getByRole('button', { name: 'URL 编解码' }).click()
  await expect(workbenchSection.getByLabel('URL 编解码 输入')).toHaveValue(/localhost\.test/)

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
